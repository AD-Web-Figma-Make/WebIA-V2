import { Fragment, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, Check, Info, Loader2, Minus, PawPrint, Plus, Users } from "lucide-react";
import { BOOKING_ENGINE_URL, bookingParams, fmtEuro, fmtRange, fmtTime, nightsBetween, photo, plural, verifyPrice, type Offer, type Search } from "./data";
import { Modal, OutlineButton, PrimaryButton } from "./ui";

function Stepper({ label, icon, value, min, max, onChange }: { label: string; icon: React.ReactNode; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-cream-300 bg-white px-3 py-2.5">
      <span className="flex items-center gap-2 text-[15px] font-medium">{icon}{label}</span>
      <div className="flex items-center gap-3">
        <button aria-label={`Menos ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-10 place-items-center rounded-full border border-cream-300 hover:bg-cream-100 disabled:opacity-40"><Minus className="size-4" /></button>
        <span className="w-5 text-center text-lg font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button aria-label={`Más ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-10 place-items-center rounded-full border border-cream-300 hover:bg-cream-100 disabled:opacity-40"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}

export function EditSearchModal({ search, onApply, onClose }: { search: Search; onApply: (s: Search) => void; onClose: () => void }) {
  const [s, setS] = useState(search);
  const nights = nightsBetween(s.checkIn, s.checkOut);
  const valid = nights >= 1 && nights <= 30;
  const field = "mt-1 h-12 w-full rounded-xl border border-cream-300 bg-white px-3 text-[15px]";
  return (
    <Modal title="Editar búsqueda" onClose={onClose}>
      <form className="space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); if (valid) { onApply(s); onClose(); } }}>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-bark-700">Llegada
            <input type="date" required value={s.checkIn} onChange={(e) => setS({ ...s, checkIn: e.target.value, checkOut: e.target.value >= s.checkOut ? new Date(new Date(e.target.value).getTime() + 4 * 864e5).toISOString().slice(0, 10) : s.checkOut })} className={field} />
          </label>
          <label className="text-sm font-medium text-bark-700">Salida
            <input type="date" required min={s.checkIn} value={s.checkOut} onChange={(e) => setS({ ...s, checkOut: e.target.value })} className={field} />
          </label>
        </div>
        <p className={`flex items-center gap-1.5 text-sm ${valid ? "text-bark-500" : "font-medium text-alert-ink"}`} role="status">
          {valid ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
          {valid ? `${fmtRange(s.checkIn, s.checkOut)} · ${plural(nights, "noche", "noches")}` : "La salida debe ser posterior a la llegada (máx. 30 noches)."}
        </p>
        <Stepper label="Adultos" icon={<Users className="size-4" />} value={s.adults} min={1} max={8} onChange={(n) => setS({ ...s, adults: n })} />
        <Stepper label="Perros" icon={<PawPrint className="size-4" />} value={s.pets} min={0} max={3} onChange={(n) => setS({ ...s, pets: n })} />
        <PrimaryButton type="submit" disabled={!valid} className="w-full">Actualizar resultados</PrimaryButton>
      </form>
    </Modal>
  );
}

export function DetailModal({ offer, search, onReserve, onClose }: { offer: Offer; search: Search; onReserve: (o: Offer) => void; onClose: () => void }) {
  const u = offer.unit;
  const bookable = offer.status === "available" || offer.status === "limited";
  return (
    <Modal title={u.name} onClose={onClose} wide>
      <div className="grid sm:grid-cols-2">
        <img src={photo(u.photo, 900, 700)} alt={`${u.name}`} className="aspect-[4/3] size-full object-cover sm:aspect-auto" />
        <div className="space-y-4 p-5">
          <p className="text-[15px] leading-relaxed text-bark-700">{u.longDescription}</p>
          <ul className="grid grid-cols-1 gap-1.5 text-sm">
            <li className="font-semibold">Capacidad: hasta {u.capacity} personas</li>
            {u.amenities.map((a) => <li key={a} className="flex items-center gap-2"><Check className="size-4 text-pine-700" aria-hidden />{a}</li>)}
          </ul>
          <div className="rounded-2xl bg-cream-100 p-4">
            <p className="text-xs text-bark-500">{fmtRange(search.checkIn, search.checkOut)} · {plural(offer.nights, "noche", "noches")}</p>
            {bookable ? (
              <p className="font-display text-4xl font-bold text-pine-900">{fmtEuro(offer.total)} <span className="font-sans text-sm font-normal text-bark-500">{fmtEuro(offer.perNight)} / noche</span></p>
            ) : (
              <p className="font-medium text-bark-700">{offer.reason ?? "No disponible en esas fechas."}</p>
            )}
          </div>
          <PrimaryButton className="w-full" disabled={!bookable} onClick={() => onReserve(offer)}>Reservar <ArrowRight className="size-4" /></PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

export function ReviewModal({ offer, search, onClose }: { offer: Offer; search: Search; onClose: () => void }) {
  const [step, setStep] = useState<"checking" | "review" | "handoff">("checking");
  const [o, setO] = useState(offer);
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    let live = true;
    verifyPrice(offer).then((r) => { if (live) { setO(r); setStep("review"); } });
    return () => { live = false; };
  }, [offer]);
  const changed = o.status === "priceChanged";
  const params = bookingParams(o, search);

  return (
    <Modal title="Revisar reserva" onClose={onClose}>
      {step === "checking" && (
        <div className="grid place-items-center gap-3 px-6 py-14 text-center" role="status">
          <Loader2 className="size-8 animate-spin text-pine-700" />
          <p className="font-display text-lg font-semibold">Comprobando disponibilidad y precio</p>
          <p className="text-sm text-bark-500">Volvemos a consultar al motor antes de continuar.</p>
        </div>
      )}
      {step !== "checking" && (
        <div className="space-y-4 p-5">
          <div className="flex gap-3">
            <img src={photo(o.unit.photo, 240, 240)} alt="" className="size-20 rounded-xl object-cover" />
            <div>
              <h3 className="font-display text-xl font-semibold">{o.unit.name}</h3>
              <p className="flex items-center gap-1.5 text-sm text-bark-700"><CalendarDays className="size-4" />{fmtRange(search.checkIn, search.checkOut)}</p>
              <p className="text-sm text-bark-700">{plural(search.adults, "adulto", "adultos")}{search.pets > 0 && ` · ${plural(search.pets, "perro", "perros")}`}</p>
            </div>
          </div>
          {changed && (
            <div className="flex gap-2.5 rounded-xl bg-amber-wash p-3 text-sm text-amber-ink" role="alert">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p><b>El precio ha cambiado.</b> Antes {fmtEuro(o.previousTotal!)}, ahora {fmtEuro(o.total)}. Revísalo antes de continuar.</p>
            </div>
          )}
          <dl className="space-y-1.5 rounded-2xl bg-cream-100 p-4 text-sm">
            <div className="flex justify-between"><dt>{plural(o.nights, "noche", "noches")} × {fmtEuro(o.perNight)}</dt><dd>{fmtEuro(o.perNight * o.nights)}</dd></div>
            <div className="flex items-baseline justify-between border-t border-cream-300 pt-2"><dt className="font-semibold">Total consultado</dt><dd className="font-display text-3xl font-bold text-pine-900">{fmtEuro(o.total)}</dd></div>
            <p className="text-xs text-bark-500">Consulta de las {fmtTime(o.queriedAt)}. Importes de demostración.</p>
          </dl>

          {step === "review" && (
            <>
              {changed && (
                <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="size-5 accent-pine-800" />
                  Acepto el nuevo precio de {fmtEuro(o.total)}
                </label>
              )}
              <PrimaryButton className="w-full" disabled={changed && !accepted} onClick={() => setStep("handoff")}>Continuar con la reserva <ArrowRight className="size-4" /></PrimaryButton>
              <OutlineButton className="w-full" onClick={onClose}>Volver al asistente</OutlineButton>
            </>
          )}

          {step === "handoff" && (
            <div className="space-y-3">
              <div className="flex gap-2.5 rounded-xl border border-terracotta-500/40 bg-terracotta-100 p-3 text-sm text-terracotta-600">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p><b>Esto todavía no es una reserva.</b> {BOOKING_ENGINE_URL ? "Te llevaremos al motor de reservas con estos datos." : "La conexión con el motor de reservas está pendiente; en la versión real se abriría su URL con estos parámetros."}</p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-white p-3 font-mono text-xs">
                {Object.entries(params).map(([k, v]) => (<Fragment key={k}><dt className="text-bark-500">{k}</dt><dd>{v}</dd></Fragment>))}
              </dl>
              <PrimaryButton className="w-full" onClick={onClose}>Entendido</PrimaryButton>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
