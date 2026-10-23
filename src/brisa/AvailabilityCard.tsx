import { useState } from "react";
import { AlertCircle, ArrowRight, Ban, CalendarRange, CheckCircle2, ChevronRight, Heart, Loader2, Maximize2, Plug, RefreshCw, Star, Trees, Users, WifiOff, BedDouble, Fence } from "lucide-react";
import { fmtEuro, fmtRange, fmtTime, photo, plural, type Alternative, type Offer, type Search } from "./data";
import { OutlineButton, PrimaryButton } from "./ui";

export type CardState = "loading" | "available" | "limited" | "unavailable" | "priceChanged" | "alternatives" | "error";

export const STATE_META: Record<CardState, { label: (o?: Offer) => string; Icon: typeof Ban; cls: string }> = {
  loading: { label: () => "Buscando disponibilidad", Icon: Loader2, cls: "bg-cream-200 text-bark-700" },
  available: { label: () => "Disponible", Icon: CheckCircle2, cls: "bg-sage-100 text-pine-800" },
  limited: { label: (o) => (o?.remaining ? `Últimas ${plural(o.remaining, "unidad", "unidades")}` : "Últimas unidades"), Icon: AlertCircle, cls: "bg-terracotta-100 text-terracotta-600" },
  unavailable: { label: () => "No disponible", Icon: Ban, cls: "bg-cream-200 text-bark-700" },
  priceChanged: { label: () => "Precio actualizado", Icon: RefreshCw, cls: "bg-amber-wash text-amber-ink" },
  alternatives: { label: () => "Fechas alternativas", Icon: CalendarRange, cls: "bg-sage-100 text-pine-800" },
  error: { label: () => "Error de consulta", Icon: WifiOff, cls: "bg-alert-wash text-alert-ink" },
};

export function StatusPill({ state, offer }: { state: CardState; offer?: Offer }) {
  const { label, Icon, cls } = STATE_META[state];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon className={`size-3.5 ${state === "loading" ? "animate-spin" : ""}`} aria-hidden />
      {label(offer)}
    </span>
  );
}

const FEATURE_ICON = { size: Maximize2, shade: Trees, plug: Plug, bed: BedDouble, wide: Fence };

type Props = {
  offer?: Offer;
  state?: CardState;
  search: Search;
  alternatives?: Alternative[];
  vertical?: boolean;
  onReserve?: (o: Offer) => void;
  onDetail?: (o: Offer) => void;
  onPickAlt?: (a: Alternative) => void;
  onRetry?: () => void;
};

export default function AvailabilityCard({ offer, state, search, alternatives, vertical, onReserve, onDetail, onPickAlt, onRetry }: Props) {
  const [fav, setFav] = useState(false);
  const [showAlts, setShowAlts] = useState(false);
  let st: CardState = state ?? offer?.status ?? "loading";
  if (st === "unavailable" && showAlts) st = "alternatives";
  const alts = alternatives ?? offer?.alternatives ?? [];
  const u = offer?.unit;
  const dim = st === "unavailable" || st === "alternatives" || st === "error";
  const priced = st === "available" || st === "limited" || st === "priceChanged";
  const dir = vertical ? "flex-col" : "flex-row sm:flex-col";

  return (
    <article aria-busy={st === "loading"} className={`rise group flex overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-[0_2px_10px_rgba(58,44,30,0.06)] transition hover:shadow-[0_8px_24px_rgba(58,44,30,0.12)] ${dir}`}>
      <div className={`relative shrink-0 overflow-hidden bg-cream-200 ${vertical ? "aspect-[4/3]" : "w-[38%] min-h-44 sm:aspect-[4/3] sm:w-full sm:min-h-0"}`}>
        {st === "loading" || !u ? (
          <div className="shimmer absolute inset-0" />
        ) : (
          <button onClick={() => offer && onDetail?.(offer)} className="absolute inset-0 block" aria-label={`Ver detalle de ${u.name}`}>
            <img src={photo(u.photo, 640, 480)} alt={`${u.name} entre pinos`} loading="lazy" className={`size-full object-cover transition duration-500 group-hover:scale-105 ${dim ? "grayscale-[0.85] opacity-80" : ""}`} />
          </button>
        )}
        {offer?.recommended && priced && (
          <span title={offer.recommendReason} className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-pine-800/95 px-2 py-1 text-[11px] font-semibold text-white shadow max-sm:left-1.5 max-sm:top-1.5">
            <Star className="size-3 fill-current" aria-hidden /> Mejor para vosotros
          </span>
        )}
        {u && st !== "loading" && (
          <button onClick={() => setFav(!fav)} aria-pressed={fav} aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"} className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/90 text-bark-900 shadow transition hover:bg-white max-sm:hidden">
            <Heart className={`size-[18px] ${fav ? "fill-terracotta-500 text-terracotta-500" : ""}`} />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
          {st === "loading" ? <div className="shimmer h-5 w-32 rounded" /> : <h3 className="font-display text-lg font-semibold leading-tight text-bark-900">{u?.name}</h3>}
          <StatusPill state={st} offer={offer} />
        </div>

        {u && st !== "loading" && st !== "alternatives" && (
          <>
            <p className={`text-[13px] leading-snug text-bark-700 line-clamp-3 ${vertical ? "" : "max-sm:hidden"}`}>{u.description}</p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-bark-700">
              <li className="flex items-center gap-1.5"><Users className="size-3.5" aria-hidden />{search.adults} {search.adults === 1 ? "adulto" : "adultos"}{search.pets > 0 && ` · ${plural(search.pets, "perro", "perros")}`}</li>
              {u.features.slice(0, 2).map((f) => {
                const I = FEATURE_ICON[f.icon];
                return <li key={f.label} className="flex items-center gap-1.5"><I className="size-3.5" aria-hidden />{f.label}</li>;
              })}
            </ul>
          </>
        )}

        {st === "loading" && (
          <div className="space-y-2">
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-2/3 rounded" />
            <div className="shimmer mt-3 h-9 w-24 rounded" />
          </div>
        )}

        {offer && priced && (
          <div className="mt-auto pt-1">
            <p className="text-xs font-medium text-bark-500">{fmtRange(search.checkIn, search.checkOut, "short")} · {plural(offer.nights, "noche", "noches")}</p>
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-display text-[34px] font-bold leading-none text-pine-900">{fmtEuro(offer.total)}</span>
              {offer.previousTotal && <span className="text-sm text-bark-500 line-through">{fmtEuro(offer.previousTotal)}</span>}
              <span className="text-[13px] text-bark-500">{fmtEuro(offer.perNight)} / noche</span>
            </div>
            {st === "priceChanged" && <p className="mt-1 text-xs font-medium text-amber-ink">El precio ha cambiado al iniciar la reserva.</p>}
            <p className="mt-1 text-[11px] text-bark-500">Consultado a las {fmtTime(offer.queriedAt)} · no es una reserva confirmada</p>
          </div>
        )}

        {st === "unavailable" && offer && (
          <div className="mt-auto pt-1">
            <p className="text-sm font-medium text-bark-700">{offer.reason ?? "No disponible en esas fechas."}</p>
            <p className="text-xs text-bark-500">{fmtRange(search.checkIn, search.checkOut, "short")} · {plural(offer.nights, "noche", "noches")}</p>
          </div>
        )}

        {st === "error" && (
          <p className="mt-auto pt-1 text-sm text-bark-700">No hemos podido consultar la disponibilidad. Tu búsqueda se ha conservado.</p>
        )}

        {st === "alternatives" && (
          <div className="mt-auto space-y-1.5">
            <p className="text-[13px] text-bark-700">Mismas noches, otras fechas con plaza:</p>
            {alts.map((a) => (
              <button key={a.checkIn} onClick={() => onPickAlt?.(a)} className="flex min-h-11 w-full items-center justify-between rounded-xl border border-cream-300 bg-cream-50 px-3 text-sm transition hover:border-pine-800 hover:bg-white">
                <span className="font-medium">{fmtRange(a.checkIn, a.checkOut, "short")}</span>
                <span className="flex items-center gap-1 font-display text-base font-bold text-pine-900">{fmtEuro(a.total)}<ChevronRight className="size-4 text-bark-500" aria-hidden /></span>
              </button>
            ))}
          </div>
        )}

        <div className="pt-1">
          {priced && offer && (
            <PrimaryButton className="w-full" onClick={() => onReserve?.(offer)}>
              Reservar <ArrowRight className="size-4" aria-hidden />
            </PrimaryButton>
          )}
          {st === "unavailable" && (
            <OutlineButton className="w-full" onClick={() => setShowAlts(true)} disabled={!alts.length}>
              {alts.length ? "Ver fechas alternativas" : "Sin alternativas"}
            </OutlineButton>
          )}
          {st === "alternatives" && (
            <OutlineButton className="w-full" onClick={() => setShowAlts(false)}>Volver</OutlineButton>
          )}
          {st === "error" && (
            <OutlineButton className="w-full" onClick={onRetry}><RefreshCw className="size-4" aria-hidden /> Reintentar</OutlineButton>
          )}
          {st === "loading" && <PrimaryButton className="w-full" disabled>Reservar</PrimaryButton>}
        </div>
      </div>
    </article>
  );
}
