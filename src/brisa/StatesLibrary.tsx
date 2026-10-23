import AvailabilityCard, { StatusPill, type CardState } from "./AvailabilityCard";
import { UNITS, buildOffer, type Offer, type Search } from "./data";
import { Logo } from "./ui";

const S: Search = { checkIn: "2027-06-12", checkOut: "2027-06-16", adults: 2, pets: 1 };
const casita = UNITS[0], sombra = UNITS[1], confort = UNITS[2], bungalow = UNITS[3];
const blocked: Search = { ...S, checkIn: "2027-06-20", checkOut: "2027-06-24" };

const withOffer = (o: Offer, patch: Partial<Offer> = {}): Offer => ({ ...o, ...patch });
const unavailable = buildOffer(casita, blocked);

const ITEMS: { state: CardState; title: string; when: string; offer?: Offer; search?: Search }[] = [
  { state: "loading", title: "Buscando disponibilidad", when: "Mientras el motor responde. Botón desactivado.", offer: buildOffer(casita, S) },
  { state: "available", title: "Disponible", when: "El motor confirma plaza y precio para las fechas consultadas.", offer: buildOffer(sombra, S) },
  { state: "limited", title: "Últimas unidades", when: "Solo si el motor devuelve la cantidad real de unidades restantes.", offer: buildOffer(bungalow, S) },
  { state: "unavailable", title: "Sin disponibilidad", when: "No hay plaza o se supera la capacidad. Se ofrecen alternativas.", offer: unavailable, search: blocked },
  { state: "alternatives", title: "Fechas alternativas", when: "Mismas noches en otras fechas con plaza, con su precio total.", offer: unavailable, search: blocked },
  { state: "error", title: "Error de consulta", when: "Fallo o tiempo agotado. Se conserva la búsqueda y se permite reintentar.", offer: buildOffer(confort, S) },
  { state: "priceChanged", title: "Cambio de precio", when: "Al iniciar la reserva el motor devuelve un importe distinto.", offer: withOffer(buildOffer(confort, S), { status: "priceChanged", previousTotal: 464, total: 480, perNight: 120 }) },
];

export default function StatesLibrary() {
  return (
    <div className="h-full overflow-y-auto bg-cream-100">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <a href="#/" className="min-h-11 rounded-xl border border-pine-800/30 px-4 py-2.5 text-sm font-semibold text-pine-800 hover:bg-white">← Volver al Concepto B</a>
        </div>
        <p className="mt-8 inline-block rounded-full bg-terracotta-100 px-3 py-1 text-xs font-semibold text-terracotta-600">Documentación interna · no forma parte del asistente público</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-pine-900 sm:text-5xl">Estados de disponibilidad</h1>
        <p className="mt-3 max-w-2xl text-bark-700">Siete variantes del mismo componente. Cada estado combina icono, texto y color, de modo que nunca depende solo del color. Datos de demostración: la conexión con el motor de reservas está pendiente.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ITEMS.map((it) => (
            <section key={it.state} aria-labelledby={`s-${it.state}`} className="flex flex-col gap-3">
              <div>
                <h2 id={`s-${it.state}`} className="text-sm font-bold uppercase tracking-wide text-bark-700">{it.title}</h2>
                <p className="min-h-10 text-[13px] text-bark-500">{it.when}</p>
              </div>
              <AvailabilityCard vertical state={it.state} offer={it.offer} search={it.search ?? S} />
            </section>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl font-semibold text-pine-900">Resumen de indicadores</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {ITEMS.map((it) => <StatusPill key={it.state} state={it.state} offer={it.offer} />)}
        </div>
      </div>
    </div>
  );
}
