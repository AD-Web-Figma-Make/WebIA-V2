import { ArrowRight, Camera, Store, Trees, CalendarDays, CloudSun, BarChart3, CloudRain, Clock, Coins, Car, Footprints, Dices, Dumbbell, GraduationCap, Landmark, Mic, Moon, ShoppingBag, Tent, Lightbulb, Mountain, PawPrint, Sun, Tag, UtensilsCrossed, Waves, Wine, type LucideIcon } from "lucide-react";
import { ALT_DAY, ALT_IDEAS, ALT_PLANS, DAY4, ITINERARY, photo, type AltIcon, type AltPlan, type Chip, type Day4Plan, type PlanItem } from "./data";

const CHIP_ICON: Record<Chip["icon"], LucideIcon> = { clock: Clock, euro: Coins, paw: PawPrint, car: Car, walk: Footprints, level: BarChart3, tag: Tag, museum: Landmark };
const TAG_ICON: Record<PlanItem["tagIcon"], LucideIcon> = { beach: Waves, walk: Footprints, event: Wine, dinner: UtensilsCrossed, culture: Landmark };
const DAY_ICON = [Waves, Mountain, Wine];

const IDEAS: { label: string; Icon: LucideIcon }[] = [
  { label: "Más actividades con perro", Icon: PawPrint },
  { label: "Restaurantes que admiten perros", Icon: UtensilsCrossed },
  { label: "Planes económicos", Icon: Coins },
  { label: "Planes culturales", Icon: GraduationCap },
];

function Facts({ items, tone }: { items: Chip[]; tone: string }) {
  return (
    <ul className="space-y-1.5 text-[13px] text-bark-700">
      {items.map((f) => {
        const I = CHIP_ICON[f.icon];
        return <li key={f.text} className="flex items-start gap-2"><I className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden />{f.text}</li>;
      })}
    </ul>
  );
}

type Act = (label: string, reply: string) => void;

function DayCard({ p, i, onAct }: { p: PlanItem; i: number; onAct: Act }) {
  const D = DAY_ICON[i];
  const T = TAG_ICON[p.tagIcon];
  return (
    <article className="rise group flex flex-col overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-[0_2px_12px_rgba(58,44,30,0.07)]">
      <header className="flex items-center justify-between bg-sage-100 px-4 py-3">
        <div>
          <h4 className="font-display text-xl font-bold leading-none text-pine-900">{p.label}</h4>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-bark-500">{p.date}</p>
        </div>
        <D className="size-7 text-pine-700" strokeWidth={1.5} aria-hidden />
      </header>
      <div className="relative h-[300px] overflow-hidden bg-cream-200">
        <img src={photo(p.photo, 720, 900)} alt={p.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
        {p.badge && (() => { const B = CHIP_ICON[p.badge.icon]; return <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-bark-900 shadow"><B className="size-3.5" aria-hidden />{p.badge.text}</span>; })()}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-terracotta-100 px-2.5 py-1 text-xs font-semibold text-terracotta-600"><T className="size-3.5" aria-hidden />{p.tag}</span>
        <h5 className="font-display text-xl font-semibold leading-tight text-bark-900">{p.title}</h5>
        <p className="text-[13px] leading-snug text-bark-700">{p.description}</p>
        <div className="mt-auto space-y-3 border-t border-cream-200 pt-3">
          <Facts items={p.facts} tone="text-terracotta-500" />
          <button onClick={() => onAct(p.cta, p.reply)} className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-pine-800/30 bg-cream-50 px-2.5 text-[13px] font-semibold text-pine-800 transition hover:border-pine-800 hover:bg-white active:scale-[0.98]">
            {p.cta}<ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

const H_ICON = { museum: Landmark, bag: ShoppingBag, paw: PawPrint };
const S_ICON = { gym: Dumbbell, mic: Mic, dice: Dices, dinner: UtensilsCrossed };

function Variant({ p, kind, onAct }: { p: Day4Plan; kind: "sun" | "rain"; onAct: Act }) {
  const sun = kind === "sun";
  const Head = sun ? Sun : CloudRain;
  const wrap = sun ? "bg-terracotta-100/50" : "bg-sage-100/70";
  const iconBg = sun ? "bg-terracotta-100 text-terracotta-600" : "bg-white text-pine-800";
  return (
    <section aria-label={p.label} className={`flex flex-col gap-4 rounded-3xl p-4 sm:p-5 ${wrap}`}>
      <div className="flex items-center gap-3.5">
        <Head className={`size-11 shrink-0 ${sun ? "text-terracotta-500" : "text-pine-700"}`} strokeWidth={1.4} aria-hidden />
        <div>
          <h5 className="font-display text-2xl font-semibold leading-tight text-bark-900">{p.label}</h5>
          <p className="text-sm text-bark-700">{p.subtitle}</p>
        </div>
      </div>
      <img src={photo(p.photo, 900, 520)} alt={p.title} loading="lazy" className="aspect-[16/9] w-full rounded-2xl object-cover" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h6 className="font-display text-xl font-semibold text-bark-900">{p.title}</h6>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-bark-700">{sun ? <Car className="size-3.5" aria-hidden /> : <Tent className="size-3.5" aria-hidden />}{p.badge}</span>
      </div>
      <p className="text-[13px] leading-snug text-bark-700">{p.description}</p>
      {p.highlights.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {p.highlights.map((h) => { const I = H_ICON[h.icon]; return (
            <li key={h.title} className="flex items-start gap-2.5"><span className={`grid size-10 shrink-0 place-items-center rounded-full ${iconBg}`}><I className="size-[18px]" aria-hidden /></span><span className="text-[13px] leading-tight"><b className="block text-bark-900">{h.title}</b><span className="text-bark-500">{h.text}</span></span></li>
          ); })}
        </ul>
      )}
      {p.slots && (
        <div className="grid gap-4 sm:grid-cols-2 sm:divide-x sm:divide-cream-300">
          {p.slots.map((sl, i) => { const SI = sl.icon === "sun" ? Sun : Moon; return (
            <div key={sl.name} className={`space-y-3 ${i ? "sm:pl-4" : ""}`}>
              <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-pine-800"><SI className="size-4" aria-hidden />{sl.name}</span><span className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-bark-500">{sl.time}</span></div>
              {sl.items.map((it) => { const I = S_ICON[it.icon]; return (
                <div key={it.title} className="flex items-start gap-2.5"><span className={`grid size-10 shrink-0 place-items-center rounded-full ${iconBg}`}><I className="size-[18px]" aria-hidden /></span><span className="text-[13px] leading-tight"><b className="block text-bark-900">{it.title}</b><span className="text-bark-500">{it.text}</span></span></div>
              ); })}
            </div>
          ); })}
        </div>
      )}
      <button onClick={() => onAct(p.cta, p.reply)} className={`mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-[15px] font-semibold text-white transition active:scale-[0.98] ${sun ? "bg-pine-800 hover:bg-pine-700" : "bg-[#35566b] hover:bg-[#2c4859]"}`}>{p.cta}<ArrowRight className="size-4" aria-hidden /></button>
    </section>
  );
}

export default function Itinerary({ onAct, onAsk }: { onAct: Act; onAsk: (q: string) => void }) {
  const { days } = ITINERARY;
  const { sunny, rainy } = DAY4;
  return (
    <div className="space-y-4 sm:pl-9">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((p, i) => <DayCard key={p.id} p={p} i={i} onAct={onAct} />)}
        <article className="rise col-span-full overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-[0_2px_12px_rgba(58,44,30,0.07)]">
          <header className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-sage-100 px-4 py-3 sm:px-5">
            <CalendarDays className="size-7 text-terracotta-500" strokeWidth={1.5} aria-hidden />
            <h4 className="font-display text-2xl font-bold text-pine-900">Día 4</h4>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bark-500">{DAY4.date}</span>
            <span className="font-display text-lg italic text-pine-800 sm:ml-auto">Dos planes, según el tiempo</span>
            <span className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs text-bark-700"><CloudSun className="size-5 shrink-0 text-terracotta-500" aria-hidden />Se ha detectado un 70% de probabilidad de lluvia para este día</span>
          </header>
          <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-2">
            <Variant p={sunny} kind="sun" onAct={onAct} />
            <Variant p={rainy} kind="rain" onAct={onAct} />
          </div>
        </article>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-bark-500"><Lightbulb className="size-3.5" aria-hidden />Itinerario de demostración: lugares, tiempos, costes, promociones y tiempo previsto no proceden de fuentes reales.</p>
      <div className="rounded-2xl bg-sage-100/80 p-4">
        <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-pine-800"><Lightbulb className="size-4" aria-hidden />Otras ideas para optimizar tu estancia</p>
        <div className="flex flex-wrap gap-2">
          {IDEAS.map(({ label, Icon }) => (
            <button key={label} onClick={() => onAsk(label)} className="flex min-h-11 items-center gap-2 rounded-full border border-cream-300 bg-white px-4 text-sm font-medium text-bark-900 transition hover:border-pine-800"><Icon className="size-4 text-pine-700" aria-hidden />{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ALT_ICON: Record<AltIcon, LucideIcon> = { beach: Waves, dinner: UtensilsCrossed, sun: Sun, walk: Footprints, bag: ShoppingBag, paw: PawPrint, camera: Camera, landmark: Landmark, store: Store, tree: Trees };
const ALT_TAG: Record<AltPlan["tagIcon"], LucideIcon> = { beach: Waves, walk: Footprints, culture: Landmark };

export function AlternativePlans({ onAct, onAsk }: { onAct: Act; onAsk: (q: string) => void }) {
  return (
    <div className="space-y-4 sm:pl-9">
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {ALT_PLANS.map((p) => {
          const T = ALT_TAG[p.tagIcon];
          return (
            <article key={p.id} className="rise group flex flex-col overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-[0_2px_12px_rgba(58,44,30,0.07)]">
              <div className="relative h-[220px] overflow-hidden bg-cream-200">
                <img src={photo(p.photo, 800, 520)} alt={p.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-bark-900 shadow"><Car className="size-3.5" aria-hidden />{p.badge}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-semibold text-pine-800"><T className="size-3.5" aria-hidden />{p.tag}</span>
                <h5 className="font-display text-xl font-semibold leading-tight text-pine-900">{p.title}</h5>
                <p className="text-[13px] leading-snug text-bark-700">{p.description}</p>
                <ul className="space-y-1.5 text-[13px] text-bark-700">
                  {p.facts.map((f) => { const I = ALT_ICON[f.icon]; return <li key={f.text} className="flex items-start gap-2"><I className="mt-0.5 size-4 shrink-0 text-terracotta-500" aria-hidden />{f.text}</li>; })}
                </ul>
                <button onClick={() => onAct(p.cta, p.reply)} className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-terracotta-500/50 bg-cream-50 px-2.5 text-[13px] font-semibold text-terracotta-600 transition hover:border-terracotta-600 hover:bg-white active:scale-[0.98]">{p.cta}<ArrowRight className="size-3.5" aria-hidden /></button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-bark-500"><Lightbulb className="size-3.5" aria-hidden />Propuestas de demostración: lugares, trayectos y normas con perros no proceden de fuentes reales.</p>
      <div className="rounded-2xl bg-sage-100/80 p-4">
        <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-pine-800"><Lightbulb className="size-4" aria-hidden />Más ideas para el {ALT_DAY.label}</p>
        <div className="flex flex-wrap gap-2">
          {ALT_IDEAS.map((label) => (
            <button key={label} onClick={() => onAsk(label)} className="flex min-h-11 items-center rounded-full border border-cream-300 bg-white px-4 text-sm font-medium text-bark-900 transition hover:border-pine-800">{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
