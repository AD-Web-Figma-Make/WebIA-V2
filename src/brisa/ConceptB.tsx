import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Building2, CalendarDays, ChevronLeft, ChevronRight, Compass, Info, MapPin, MapPinned, Pencil, PawPrint, RefreshCw, Mic, Search as SearchIcon, Send, Sparkles, Tent, Trees, User, Waves, WifiOff, type LucideIcon } from "lucide-react";
import Itinerary, { AlternativePlans } from "./Itinerary";
import AvailabilityCard from "./AvailabilityCard";
import { DetailModal, EditSearchModal, ReviewModal } from "./Dialogs";
import { DEFAULT_SEARCH, HERO_PHOTO, ALT_DAY, PLACES, fmtRange, fmtSentenceRange, nightsBetween, parseMonth, photo, plural, queryAvailability, toIso, type Alternative, type Offer, type Search } from "./data";
import { Logo, OutlineButton } from "./ui";

type Msg = { id: number; role: "user" | "ai"; text: string; sub?: string; time: string; kind?: "results" | "places" | "plan" | "alt" };

const CATEGORIES: { title: string; hint: string; Icon: LucideIcon; prompt: string }[] = [
  { title: "Buscar alojamiento", hint: "Parcelas, bungalows…", Icon: Tent, prompt: "Quiero buscar alojamiento" },
  { title: "Conocer el camping", hint: "Servicios, instalaciones…", Icon: Building2, prompt: "Cuéntame cómo es el camping" },
  { title: "Actividades", hint: "Rutas, playas, ocio…", Icon: Compass, prompt: "¿Qué actividades hay?" },
  { title: "Información práctica", hint: "Horarios, cómo llegar…", Icon: MapPinned, prompt: "Necesito información práctica" },
];

const now = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
let uid = 1;

export default function ConceptB({ backLabel = "Volver a la web", onBackToWeb }: { backLabel?: string; onBackToWeb?: () => void }) {
  const [search, setSearch] = useState<Search>(DEFAULT_SEARCH);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slide = (d: number) => sliderRef.current?.scrollBy({ left: d * sliderRef.current.clientWidth * 0.8, behavior: "smooth" });
  const [sortPrice, setSortPrice] = useState(false);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [dlg, setDlg] = useState<null | { t: "edit" } | { t: "detail"; o: Offer } | { t: "review"; o: Offer }>(null);
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { id: uid++, role: "user", text: "Buscamos un sitio para ir con perro del 12 al 16 de junio, 2 adultos.", time: now() },
    { id: uid++, role: "ai", text: "", time: now(), kind: "results" },
    { id: uid++, role: "user", text: "¿Qué hay en los alrededores?", time: now() },
    { id: uid++, role: "ai", text: "¡Hay planes muy buenos cerca! Estos son algunos lugares que te pueden gustar para ir con tu perro:", time: now(), kind: "places" },
    { id: uid++, role: "user", text: "¿Qué podemos hacer durante nuestra estancia? Queremos aprovecharla, pero vamos con perro y no queremos gastar demasiado.", time: now() },
    { id: uid++, role: "ai", text: "¡Perfecto! Te he preparado un plan de cuatro días teniendo en cuenta vuestras fechas, que viajáis con vuestro perro y que preferís planes económicos y equilibrados.", time: now(), kind: "plan" },
    { id: uid++, role: "user", text: ALT_DAY.prompt, time: now() },
    { id: uid++, role: "ai", text: ALT_DAY.intro, time: now(), kind: "alt" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const run = useCallback(async (s: Search, forceError = false) => {
    setSearch(s);
    setLoading(true);
    setFailed(false);
    try {
      setOffers(await queryAvailability(s, { forceError }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { run(DEFAULT_SEARCH); }, [run]);
  useEffect(() => { document.title = "Brisa · Concepto B — Experiencia inmersiva"; }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs.length, typing, loading]);

  const visible = useMemo(() => {
    let l = offers.filter((o) => showAll || o.unit.id !== "bungalow-mediterraneo");
    if (sortPrice) l = [...l].sort((a, b) => a.total - b.total);
    return l;
  }, [offers, showAll, sortPrice]);

  const lastResultsId = [...msgs].reverse().find((m) => m.kind === "results")?.id;
  const push = (m: Omit<Msg, "id" | "time">) => setMsgs((x) => [...x, { ...m, id: uid++, time: now() }]);
  const guests = `${plural(search.adults, "adulto", "adultos")}${search.pets ? ` y ${plural(search.pets, "perro", "perros")}` : " (sin mascotas)"}`;
  const period = `${fmtSentenceRange(search.checkIn, search.checkOut)} (${plural(nightsBetween(search.checkIn, search.checkOut), "noche", "noches")})`;

  const updateSearch = (s: Search, announce: string) => {
    push({ role: "ai", text: announce, kind: "results" });
    run(s);
  };

  const respond = (q: string) => {
    const l = q.toLowerCase();
    let s = { ...search };
    let changed = false;
    const a = l.match(/(\d+)\s*adultos?/);
    if (a) { s.adults = Math.min(8, +a[1]); changed = true; }
    if (/sin (perro|mascota)/.test(l)) { s.pets = 0; changed = true; }
    else if (/(\d+)\s*perros?/.test(l)) { s.pets = Math.min(3, +l.match(/(\d+)\s*perros?/)![1]); changed = true; }
    else if (/(con|y) (un |mi )?perro/.test(l) && s.pets === 0) { s.pets = 1; changed = true; }
    const dm = l.match(/(\d{1,2})\s*(?:al|-|–)\s*(\d{1,2})\s*de\s*([a-záéú]+)/);
    if (dm && parseMonth(dm[3]) >= 0) {
      const y = 2027, m = parseMonth(dm[3]);
      s.checkIn = toIso(y, m, +dm[1]);
      s.checkOut = toIso(y, m, +dm[2]);
      changed = true;
    }
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (/error|fall[ao]|simula/.test(l)) {
        push({ role: "ai", text: "Vale, repito la consulta de disponibilidad. Para la demo, simulo un fallo del motor.", kind: "results" });
        run(search, true);
      } else if (changed && nightsBetween(s.checkIn, s.checkOut) >= 1) {
        updateSearch(s, "He actualizado la búsqueda y consulto de nuevo la disponibilidad.");
      } else if (/ver m[aá]s|m[aá]s alojamientos|otras opciones/.test(l)) {
        setShowAll(true);
        push({ role: "ai", text: "El Bungalow Mediterráneo está al final del carrusel de resultados: desliza hacia la derecha. Es el que queda con menos unidades." });
      } else if (/barat|precio|ordena/.test(l)) {
        setSortPrice(true);
        push({ role: "ai", text: "Los he ordenado de menor a mayor precio total. La Parcela Sombra es la más económica para tus fechas." });
      } else if (/sombra/.test(l)) {
        push({ role: "ai", text: `Sí. La Parcela Sombra tiene sombra de pinos casi todo el día y es la opción más económica ${fmtSentenceRange(search.checkIn, search.checkOut)}. La Casita del Pinar también queda bajo los pinos.` });
      } else if (/cambiar|otro plan|algo diferente|alternativ/.test(l)) {
        push({ role: "ai", text: ALT_DAY.intro, kind: "alt" });
      } else if (/mirador|mercado|senderismo|m[aá]s opciones/.test(l)) {
        push({ role: "ai", text: "Tomo nota. Cuando esté conectada la fuente real de planes, aquí te propondré más opciones cerca del camping. (Demostración.)" });
      } else if (/itinerario|plan de|estancia|qu[eé] (podemos|nos recomiendas)/.test(l)) {
        push({ role: "ai", text: "¡Perfecto! Te he preparado un plan de cuatro días teniendo en cuenta vuestras fechas, que viajáis con vuestro perro y que preferís planes económicos y equilibrados.", kind: "plan" });
      } else if (/restaurante|econ[oó]mic|cultural/.test(l)) {
        push({ role: "ai", text: "Puedo filtrar el plan por restaurantes que admiten perros, opciones económicas o planes culturales. Esa información se cargará desde datos reales; ahora mismo es una demostración." });
      } else if (/alrededor|qu[eé] hay|lugares|visitar/.test(l)) {
        push({ role: "ai", text: "¡Hay planes muy buenos cerca! Estos son algunos lugares que te pueden gustar para ir con tu perro:", kind: "places" });
      } else if (/playa|mar|cala/.test(l)) {
        push({ role: "ai", text: "Hay una cala a unos 10 minutos andando por un sendero entre pinos. Muchas calas de la zona permiten perros fuera de temporada alta; confírmalo en recepción. (Información de demostración.)" });
      } else if (/electric|enchuf|luz|caravana/.test(l)) {
        push({ role: "ai", text: "La Parcela Confort incluye electricidad y está pensada para caravana o autocaravana. Es la que está más cerca de los servicios." });
      } else if (/actividad|ruta|ocio|hacer/.test(l)) {
        push({ role: "ai", text: "Con perro te propongo rutas de senderismo por el pinar y paseos por la costa al atardecer. También puedo contarte las actividades del camping. (Contenido de demostración.)" });
      } else if (/camping|servicio|instalacion|piscina/.test(l)) {
        push({ role: "ai", text: "Brisa es un camping mediterráneo entre pinos, con parcelas, casitas y bungalows. Los servicios concretos se cargarán desde la ficha real del camping. (Demostración.)" });
      } else if (/informaci|horario|llegar|check|recepci/.test(l)) {
        push({ role: "ai", text: "Aquí mostraré horarios de recepción, check-in y cómo llegar. Esos datos aún no están conectados en esta demostración." });
      } else if (/buscar|alojamiento/.test(l)) {
        push({ role: "ai", text: `Seguimos con tu búsqueda: ${guests}, ${period}. Puedes editarla arriba o decirme qué cambiar, por ejemplo «3 adultos».`, kind: "results" });
      } else if (/reserv/.test(l)) {
        push({ role: "ai", text: "Pulsa «Reservar» en el alojamiento que prefieras: revisaremos precio y fechas antes de continuar. Consultar disponibilidad no es una reserva confirmada." });
      } else {
        push({ role: "ai", text: `Lo tengo en cuenta con tu búsqueda (${guests}, ${period}). Puedo cambiar fechas o personas, comparar alojamientos o contarte actividades.` });
      }
    }, 900);
  };

  const send = (q: string) => {
    const t = q.trim();
    if (!t || typing) return;
    push({ role: "user", text: t });
    setText("");
    respond(t);
  };

  const pickAlt = (a: Alternative) => updateSearch({ ...search, checkIn: a.checkIn, checkOut: a.checkOut }, `Hecho: consulto ${fmtSentenceRange(a.checkIn, a.checkOut)}.`);

  const suggestions = [
    { label: "¿Tiene sombra?", Icon: Trees },
    { label: "¿Hay playa cerca?", Icon: Waves },
    { label: "Lugares cercanos", Icon: MapPin },
    { label: "Ordenar por precio", Icon: SearchIcon },
    { label: "Actividades con perro", Icon: PawPrint },
  ];
  const Suggestions = ({ cls = "" }: { cls?: string }) => (
    <div className={cls}>
      <p className="mb-2 text-[13px] font-medium text-bark-700">¿Te gustaría saber algo más?</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:flex-wrap">
        {suggestions.map(({ label, Icon }) => (
          <button key={label} onClick={() => send(label)} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-cream-300 bg-white px-4 text-sm font-medium text-bark-900 transition hover:border-pine-800 hover:bg-cream-50">
            <Icon className="size-4 text-pine-700" aria-hidden />{label}
          </button>
        ))}
      </div>
    </div>
  );

  const availableCount = visible.filter((o) => o.status !== "unavailable").length;
  const headline = failed ? "No he podido consultar la disponibilidad" : loading ? "Consultando disponibilidad real…" : availableCount ? "¡Genial! He encontrado estas opciones disponibles" : "Lo siento, no hay disponibilidad en esas fechas";
  const sub = failed ? "El motor no ha respondido. Tu búsqueda sigue guardada." : loading ? "Esto solo tarda unos segundos." : availableCount ? `para ${guests} ${period}.` : "Mira las fechas alternativas de cada alojamiento o edita la búsqueda.";

  const Chip = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <button onClick={() => setDlg({ t: "edit" })} aria-label={`Editar: ${children}`} className="flex min-h-11 items-center gap-2 rounded-full border border-cream-300 bg-white px-3.5 text-sm font-medium transition hover:border-pine-800">
      <span className="text-bark-500" aria-hidden>{icon}</span>{children}<Pencil className="size-3.5 text-bark-500" aria-hidden />
    </button>
  );

  const resultsBlock = (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-terracotta-500"><Sparkles className="size-6" aria-hidden /></div>
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
          <p className="text-[15px] font-semibold">{headline}</p>
          <p className="text-sm text-bark-700">{sub}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:pl-9">
        <Chip icon={<CalendarDays className="size-4" />}>{fmtRange(search.checkIn, search.checkOut, "short")} {search.checkIn.slice(0, 4)}</Chip>
        <Chip icon={<User className="size-4" />}>{plural(search.adults, "adulto", "adultos")}</Chip>
        <Chip icon={<PawPrint className="size-4" />}>{search.pets ? plural(search.pets, "perro", "perros") : "Sin mascotas"}</Chip>
        <OutlineButton className="ml-auto max-sm:hidden" onClick={() => setDlg({ t: "edit" })}>Editar búsqueda</OutlineButton>
      </div>
      {failed ? (
        <div role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl border border-alert-ink/25 bg-alert-wash p-4 text-alert-ink">
          <WifiOff className="size-6 shrink-0" aria-hidden />
          <div className="min-w-48 flex-1 text-sm"><b>Error de consulta.</b> No se ha podido contactar con el motor de reservas.</div>
          <OutlineButton onClick={() => run(search)}><RefreshCw className="size-4" aria-hidden />Reintentar</OutlineButton>
        </div>
      ) : (
        <div className="relative">
          <div ref={sliderRef} tabIndex={0} aria-label="Alojamientos disponibles, desliza para ver más" className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth px-1 pb-2">
            {(loading ? Array.from({ length: 4 }) : visible).map((o, i) => (
              <div key={loading ? i : (o as Offer).unit.id + (o as Offer).queriedAt} className="flex shrink-0 basis-[calc((100%-14px)/1.15)] snap-start sm:basis-[calc((100%-28px)/2.15)] lg:basis-[calc((100%-42px)/3.15)]">
                {loading
                  ? <AvailabilityCard state="loading" search={search} />
                  : <AvailabilityCard offer={o as Offer} search={search} onReserve={(x) => setDlg({ t: "review", o: x })} onDetail={(x) => setDlg({ t: "detail", o: x })} onPickAlt={pickAlt} />}
              </div>
            ))}
          </div>
          <div className="mt-1 flex items-center justify-end gap-2">
            <span className="mr-auto text-xs text-bark-500">Desliza para ver más alojamientos</span>
            <button onClick={() => slide(-1)} aria-label="Alojamientos anteriores" className="grid size-10 place-items-center rounded-full border border-cream-300 bg-white text-pine-800 transition hover:border-pine-800"><ChevronLeft className="size-5" /></button>
            <button onClick={() => slide(1)} aria-label="Más alojamientos" className="grid size-10 place-items-center rounded-full border border-cream-300 bg-white text-pine-800 transition hover:border-pine-800"><ChevronRight className="size-5" /></button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-cream-100 lg:block">
      {/* Fondo fotográfico (desktop) */}
      <img src={photo(HERO_PHOTO, 1800, 1100)} alt="Cala mediterránea rodeada de pinos junto al camping" className="absolute inset-0 hidden size-full object-cover object-[35%_50%] lg:block" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(18,36,25,0.82)_0%,rgba(18,36,25,0.5)_32%,rgba(18,36,25,0.1)_60%)] lg:block" />

      {/* Cabecera móvil compacta */}
      <header className="relative shrink-0 overflow-hidden lg:hidden">
        <img src={photo(HERO_PHOTO, 900, 300)} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-pine-900/65" />
        <div className="relative flex items-center justify-between px-4 pb-2 pt-3">
          <Logo light small />
          <button onClick={onBackToWeb} className="flex min-h-11 items-center gap-1.5 rounded-xl bg-cream-50 px-3.5 text-sm font-semibold text-pine-900">{backLabel}<ArrowUpRight className="size-4" aria-hidden /></button>
        </div>
        <nav aria-label="Categorías" className="relative flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          {CATEGORIES.map(({ title, Icon, prompt }) => (
            <button key={title} onClick={() => send(prompt)} className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-cream-50/95 px-3.5 text-[13px] font-semibold text-pine-900"><Icon className="size-4" aria-hidden />{title}</button>
          ))}
        </nav>
      </header>

      {/* Panel lateral (desktop) */}
      <aside className="absolute inset-y-0 left-0 hidden w-[340px] flex-col justify-between overflow-y-auto p-6 pr-4 xl:w-[420px] xl:p-8 xl:pr-8 text-white no-scrollbar lg:flex">
        <Logo light />
        <div className="my-6">
          <h1 className="font-display text-[44px] font-bold xl:text-[56px] leading-[0.98] tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.35)]">Tu asistente de viaje</h1>
          <p className="mt-5 max-w-[320px] text-[17px] leading-snug text-white/95">Te ayudo a encontrar el alojamiento perfecto, planificar tu estancia y descubrir todo lo que puedes hacer en Brisa.</p>
        </div>
        <nav aria-label="Categorías" className="space-y-2.5">
          {CATEGORIES.map(({ title, hint, Icon, prompt }) => (
            <button key={title} onClick={() => send(prompt)} className="group flex w-full items-center gap-4 rounded-2xl bg-cream-50/95 px-4 py-3 text-left text-bark-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white">
              <Icon className="size-7 shrink-0 text-terracotta-500" strokeWidth={1.6} aria-hidden />
              <span><span className="block font-semibold">{title}</span><span className="block text-[13px] text-bark-500">{hint}</span></span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Volver a la web (desktop) */}
      <button onClick={onBackToWeb} className="absolute right-6 top-4 xl:right-10 hidden min-h-11 items-center gap-2.5 rounded-xl bg-cream-50 px-4 text-sm font-semibold text-pine-900 shadow-lg transition hover:bg-white lg:flex">
        <ChevronLeft className="size-4" aria-hidden />{backLabel}<ArrowUpRight className="size-4" aria-hidden />
      </button>

      {/* Hoja del asistente */}
      <main className="relative flex min-h-0 flex-1 flex-col bg-cream-100 lg:absolute lg:bottom-6 lg:left-[364px] xl:left-[464px] lg:right-6 xl:right-10 lg:top-[68px] lg:rounded-[28px] lg:bg-cream-100/[0.97] lg:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="soft-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-6 lg:px-7 lg:pt-6">
          <div className="space-y-5">
            {msgs.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="rise flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-sage-200 px-4 py-2.5 text-[15px] shadow-sm lg:max-w-[70%]">
                    {m.text}
                    <div className="mt-0.5 text-right text-[11px] text-bark-500">{m.time} ✓✓</div>
                  </div>
                </div>
              ) : m.kind === "plan" ? (
                <div key={m.id} className="rise space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 size-6 shrink-0 text-terracotta-500" aria-hidden />
                    <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-[15px] leading-snug shadow-sm lg:max-w-[75%]">{m.text}</div>
                  </div>
                  <Itinerary onAsk={send} onAct={(label, reply) => { push({ role: "user", text: label }); setTyping(true); setTimeout(() => { setTyping(false); push({ role: "ai", text: reply }); }, 700); }} />
                </div>
              ) : m.kind === "alt" ? (
                <div key={m.id} className="rise space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 size-6 shrink-0 text-terracotta-500" aria-hidden />
                    <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-[15px] leading-snug shadow-sm lg:max-w-[75%]">{m.text}</div>
                  </div>
                  <AlternativePlans onAsk={send} onAct={(label, reply) => { push({ role: "user", text: label }); setTyping(true); setTimeout(() => { setTyping(false); push({ role: "ai", text: reply }); }, 700); }} />
                </div>
              ) : m.kind === "places" ? (
                <div key={m.id} className="rise space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 size-6 shrink-0 text-terracotta-500" aria-hidden />
                    <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-[15px] leading-snug shadow-sm lg:max-w-[75%]">{m.text}</div>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2 sm:pl-9 lg:grid-cols-3">
                    {PLACES.map((p) => (
                      <article key={p.id} className="group flex overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-[0_2px_10px_rgba(58,44,30,0.06)] max-sm:flex-col">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-200">
                          <img src={photo(p.photo, 640, 480)} alt={p.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-pine-800 shadow">{p.tag}</span>
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
                          <h3 className="font-display text-lg font-semibold leading-tight text-bark-900">{p.name}</h3>
                          <p className="flex items-center gap-1.5 text-[13px] font-medium text-terracotta-600"><MapPin className="size-3.5" aria-hidden />{p.distance}</p>
                          <p className="line-clamp-3 text-[13px] leading-snug text-bark-700">{p.description}</p>
                          <OutlineButton className="mt-auto w-full gap-1.5 whitespace-nowrap px-2.5 text-[13px]" onClick={() => { push({ role: "user", text: `${p.cta}: ${p.name}` }); setTyping(true); setTimeout(() => { setTyping(false); push({ role: "ai", text: p.reply }); }, 700); }}>
                            <MapPin className="size-3.5 shrink-0" aria-hidden />{p.cta}<ArrowRight className="size-3.5 shrink-0" aria-hidden />
                          </OutlineButton>
                        </div>
                      </article>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-bark-500 sm:pl-9"><Info className="size-3.5" aria-hidden />Lugares y distancias de demostración.</p>
                </div>
              ) : m.kind === "results" ? (
                <div key={m.id} className="rise">
                  {m.id === lastResultsId ? resultsBlock : (
                    <div className="flex items-start gap-3"><Sparkles className="mt-1 size-6 text-terracotta-500" aria-hidden /><p className="rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-[15px] shadow-sm">{m.text || "Estos son los primeros resultados."} <span className="text-bark-500">(Resultados anteriores sustituidos por la consulta más reciente)</span></p></div>
                  )}
                  {m.id === lastResultsId && m.text && <p className="mt-2 flex items-center gap-1.5 text-xs text-bark-500 sm:pl-9"><Info className="size-3.5" aria-hidden />{m.text}</p>}
                </div>
              ) : (
                <div key={m.id} className="rise flex items-start gap-3">
                  <Sparkles className="mt-1 size-6 shrink-0 text-terracotta-500" aria-hidden />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-[15px] leading-snug shadow-sm lg:max-w-[75%]">{m.text}</div>
                </div>
              ),
            )}
            {typing && (
              <div className="flex items-center gap-3" role="status" aria-label="Brisa está escribiendo">
                <Sparkles className="size-6 text-terracotta-500" aria-hidden />
                <div className="flex gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-bark-500" style={{ animation: `dots 1s ${i * 0.15}s infinite` }} />)}</div>
              </div>
            )}
            <Suggestions cls="lg:hidden" />
            <p className="text-center text-[11px] text-bark-500">Datos y precios de demostración · conexión con el motor de reservas pendiente · una consulta no es una reserva confirmada</p>
            <div ref={endRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-cream-200 bg-cream-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:rounded-b-[28px] lg:border-0 lg:bg-transparent lg:px-7 lg:pb-5">
          <Suggestions cls="mb-3 hidden lg:block" />
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2 rounded-full border border-cream-300 bg-white py-1.5 pl-5 pr-1.5 shadow-sm focus-within:border-pine-800">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Te escucho… (demostración)" : "Cuéntame qué necesitas…"} aria-label="Escribe tu pregunta" className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-bark-500" />
            <button type="button" onClick={() => setListening((v) => !v)} aria-pressed={listening} aria-label={listening ? "Dejar de escuchar" : "Hablar con Brisa"} className={`relative grid size-11 shrink-0 place-items-center rounded-full transition ${listening ? "bg-terracotta-500 text-white" : "text-pine-800 hover:bg-cream-200"}`}>
              {listening && <span className="absolute inset-0 animate-ping rounded-full bg-terracotta-500/40 motion-reduce:hidden" aria-hidden />}
              <Mic className="relative size-5" />
            </button>
            <button type="submit" aria-label="Enviar" disabled={!text.trim() || typing} className="grid size-11 shrink-0 place-items-center rounded-full bg-olive-600 text-white transition hover:bg-pine-700 disabled:opacity-40"><Send className="size-5" /></button>
          </form>
        </div>
      </main>

      {dlg?.t === "edit" && <EditSearchModal search={search} onClose={() => setDlg(null)} onApply={(s) => updateSearch(s, `He actualizado la búsqueda: ${plural(s.adults, "adulto", "adultos")}${s.pets ? ` y ${plural(s.pets, "perro", "perros")}` : ""}, ${fmtSentenceRange(s.checkIn, s.checkOut)}.`)} />}
      {dlg?.t === "detail" && <DetailModal offer={dlg.o} search={search} onClose={() => setDlg(null)} onReserve={(o) => setDlg({ t: "review", o })} />}
      {dlg?.t === "review" && <ReviewModal offer={dlg.o} search={search} onClose={() => setDlg(null)} />}
    </div>
  );
}
