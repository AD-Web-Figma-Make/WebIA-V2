/**
 * FUENTE DE DATOS DE DEMOSTRACIÓN
 * ------------------------------------------------------------------
 * La conexión real con el motor de reservas está PENDIENTE.
 * Todo lo de este archivo (alojamientos, precios, cupos, retardos, errores y
 * cambios de precio) es simulado. Para conectar el motor real, sustituye
 * `queryAvailability` y `verifyPrice` por llamadas a la API y define
 * `BOOKING_ENGINE_URL`. Las interfaces `Search` y `Offer` son el contrato.
 * Consultar disponibilidad NO es una reserva confirmada.
 */

export const BOOKING_ENGINE_URL: string | null = null;

export type Search = { checkIn: string; checkOut: string; adults: number; pets: number };
export type Status = "available" | "limited" | "unavailable" | "priceChanged";

export type Unit = {
  id: string;
  name: string;
  photo: string;
  description: string;
  longDescription: string;
  capacity: number;
  features: { icon: "size" | "shade" | "plug" | "bed" | "wide"; label: string }[];
  amenities: string[];
  basePerNight: number;
};

export type Alternative = { checkIn: string; checkOut: string; total: number };

export type Offer = {
  unit: Unit;
  status: Status;
  nights: number;
  perNight: number;
  total: number;
  previousTotal?: number;
  remaining?: number;
  reason?: string;
  alternatives?: Alternative[];
  queriedAt: string;
  recommended?: boolean;
  recommendReason?: string;
};

export const photo = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export const HERO_PHOTO = "1766745204696-2475886df13d";

export const UNITS: Unit[] = [
  {
    id: "casita-pinar",
    name: "Casita del Pinar",
    photo: "1749063799107-42fc32ed4a10",
    description: "Madera, sombra de pinos y un jardín vallado, ideal para que tu perro esté a gusto.",
    longDescription:
      "Casita de madera rodeada de pinos, con porche, cocina equipada y un pequeño jardín vallado donde tu perro puede moverse sin correa.",
    capacity: 4,
    features: [
      { icon: "size", label: "32–38 m²" },
      { icon: "shade", label: "Jardín vallado" },
    ],
    amenities: ["Cocina equipada", "Porche con mesa", "Jardín vallado", "Ropa de cama incluida"],
    basePerNight: 128,
  },
  {
    id: "parcela-sombra",
    name: "Parcela Sombra",
    photo: "1791553796644-e3952caead8e",
    description: "Parcela amplia bajo los pinos, con sombra todo el día, en un entorno tranquilo.",
    longDescription:
      "Parcela de unos 90 m² bajo pinos centenarios. Sombra casi todo el día y una zona tranquila, alejada del paso de vehículos.",
    capacity: 6,
    features: [
      { icon: "wide", label: "Parcela amplia" },
      { icon: "shade", label: "Sombra todo el día" },
    ],
    amenities: ["Sombra de pinos", "Zona tranquila", "Mesa de picnic", "Fregadero cercano"],
    basePerNight: 98,
  },
  {
    id: "parcela-confort",
    name: "Parcela Confort",
    photo: "1773762159842-9ccfb417e30c",
    description: "Cerca de los servicios, con espacio para caravana o autocaravana. Con electricidad incluida.",
    longDescription:
      "Parcela junto a los servicios, preparada para caravana y autocaravana, con toma eléctrica y agua incluidas y acceso cómodo a las zonas comunes.",
    capacity: 4,
    features: [
      { icon: "plug", label: "Con electricidad" },
      { icon: "wide", label: "Apta autocaravana" },
    ],
    amenities: ["Toma eléctrica 10 A", "Punto de agua", "Cerca de los servicios", "Acceso directo"],
    basePerNight: 116,
  },
  {
    id: "bungalow-mediterraneo",
    name: "Bungalow Mediterráneo",
    photo: "1725304578757-7fed2a612431",
    description: "Bungalow luminoso entre pinos, con terraza y dos dormitorios.",
    longDescription:
      "Bungalow con dos dormitorios, terraza cubierta y cocina completa. Pensado para estancias cómodas en familia.",
    capacity: 4,
    features: [
      { icon: "size", label: "28–32 m²" },
      { icon: "bed", label: "2 dormitorios" },
    ],
    amenities: ["Terraza cubierta", "Cocina completa", "Aire acondicionado", "Ropa de cama incluida"],
    basePerNight: 145,
  },
];

export const DEFAULT_SEARCH: Search = { checkIn: "2027-06-12", checkOut: "2027-06-16", adults: 2, pets: 1 };

// ---------- Fechas ----------
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const d = (iso: string) => new Date(iso + "T00:00:00Z");
export const nightsBetween = (a: string, b: string) => Math.round((d(b).getTime() - d(a).getTime()) / 86400000);
export const addDays = (iso: string, n: number) => new Date(d(iso).getTime() + n * 86400000).toISOString().slice(0, 10);
export const toIso = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export function fmtRange(a: string, b: string, style: "long" | "short" = "long") {
  const x = d(a), y = d(b);
  const sameMonth = x.getUTCMonth() === y.getUTCMonth();
  const m = (dt: Date) => (style === "short" ? MONTHS[dt.getUTCMonth()].slice(0, 3) : MONTHS[dt.getUTCMonth()]);
  if (style === "short") {
    return sameMonth
      ? `${x.getUTCDate()}–${y.getUTCDate()} ${m(y)}`
      : `${x.getUTCDate()} ${m(x)} – ${y.getUTCDate()} ${m(y)}`;
  }
  return sameMonth
    ? `${x.getUTCDate()} – ${y.getUTCDate()} ${m(y)} ${y.getUTCFullYear()}`
    : `${x.getUTCDate()} ${m(x)} – ${y.getUTCDate()} ${m(y)} ${y.getUTCFullYear()}`;
}
export const fmtSentenceRange = (a: string, b: string) => {
  const x = d(a), y = d(b);
  return x.getUTCMonth() === y.getUTCMonth()
    ? `del ${x.getUTCDate()} al ${y.getUTCDate()} de ${MONTHS[y.getUTCMonth()]}`
    : `del ${x.getUTCDate()} de ${MONTHS[x.getUTCMonth()]} al ${y.getUTCDate()} de ${MONTHS[y.getUTCMonth()]}`;
};
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const fmtEuro = (n: number) => `${n.toLocaleString("es-ES")} €`;
export const parseMonth = (name: string) => MONTHS.findIndex((m) => m === name.toLowerCase() || m.slice(0, 3) === name.toLowerCase().slice(0, 3));

// ---------- Motor simulado ----------
const BLOCK = { from: "2027-06-18", to: "2027-06-24" }; // Casita sin plazas (demo)
const overlaps = (a: string, b: string, c: string, e: string) => a < e && c < b;
const highSeason = (iso: string) => [6, 7].includes(d(iso).getUTCMonth());

export function buildOffer(unit: Unit, s: Search, forceStatus?: Status): Offer {
  const nights = Math.max(1, nightsBetween(s.checkIn, s.checkOut));
  const perNight = Math.round(unit.basePerNight * (highSeason(s.checkIn) ? 1.35 : 1));
  const total = perNight * nights;
  const base: Offer = { unit, status: "available", nights, perNight, total, queriedAt: new Date().toISOString() };

  if (s.adults > unit.capacity) {
    return { ...base, status: "unavailable", reason: `Capacidad máxima: ${unit.capacity} personas.` };
  }
  if (unit.id === "casita-pinar" && overlaps(s.checkIn, s.checkOut, BLOCK.from, BLOCK.to)) {
    const before = addDays(BLOCK.from, -nights);
    const after = BLOCK.to;
    return {
      ...base,
      status: "unavailable",
      reason: "Sin plazas en esas fechas.",
      alternatives: [
        { checkIn: before, checkOut: BLOCK.from, total: perNight * nights },
        { checkIn: after, checkOut: addDays(after, nights), total: perNight * nights },
      ],
    };
  }
  let remaining: number | undefined;
  if (unit.id === "bungalow-mediterraneo") remaining = 2;
  else if (highSeason(s.checkIn) && unit.id !== "parcela-sombra") remaining = unit.id === "casita-pinar" ? 1 : 2;
  const status: Status = forceStatus ?? (remaining ? "limited" : "available");
  const recommended = unit.id === "casita-pinar" && s.pets > 0;
  return {
    ...base,
    status,
    remaining,
    recommended,
    recommendReason: recommended ? "Admite mascotas y tiene jardín vallado." : undefined,
  };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function queryAvailability(s: Search, opts: { forceError?: boolean } = {}): Promise<Offer[]> {
  await wait(1100);
  if (opts.forceError) throw new Error("demo-error");
  return UNITS.map((u) => buildOffer(u, s));
}

/** Al iniciar la reserva se vuelve a consultar el precio. Demo: Parcela Confort sube 16 €. */
export async function verifyPrice(o: Offer): Promise<Offer> {
  await wait(1300);
  if (o.unit.id === "parcela-confort" && !o.previousTotal) {
    const total = o.total + 16;
    return { ...o, status: "priceChanged", previousTotal: o.total, total, perNight: Math.round(total / o.nights), queriedAt: new Date().toISOString() };
  }
  return { ...o, queriedAt: new Date().toISOString() };
}

export function bookingParams(o: Offer, s: Search) {
  return {
    alojamiento: o.unit.id,
    llegada: s.checkIn,
    salida: s.checkOut,
    adultos: String(s.adults),
    mascotas: String(s.pets),
    total_consultado: String(o.total),
  };
}

// ---------- Alrededores (contenido de demostración, no real) ----------
export type Place = { id: string; name: string; tag: string; distance: string; description: string; cta: string; photo: string; reply: string };

export const PLACES: Place[] = [
  { id: "cala", name: "Cala del Pinar", tag: "Playa", distance: "10 min a pie", description: "Cala tranquila de aguas claras a la que se llega por un sendero entre pinos.", cta: "Cómo llegar", photo: "1717217426511-6c6cae5f8766", reply: "La Cala del Pinar se alcanza andando por el sendero que sale junto a la entrada del camping. Lleva calzado cómodo y agua. (Información de demostración.)" },
  { id: "camino", name: "Camino de ronda", tag: "Ruta", distance: "2,5 km · 45 min", description: "Paseo costero con vistas al mar, apto para ir con perro y precioso al atardecer.", cta: "Ver ruta", photo: "1786494175332-03b9c02372c6", reply: "El Camino de ronda es un paseo sencillo de unos 45 minutos, ideal con perro y con correa. Aquí se enlazaría el mapa real de la ruta. (Demostración.)" },
  { id: "perros", name: "Zona para perros", tag: "Con perro", distance: "5 min en coche", description: "Parque vallado donde tu perro puede correr sin correa, con sombra y agua.", cta: "Ver ubicación", photo: "1714247084434-49bbc3ebf577", reply: "La zona para perros está a unos 5 minutos en coche. La ubicación exacta se cargará desde los datos reales del camping. (Demostración.)" },
];

// ---------- Itinerario (contenido de DEMOSTRACIÓN: sustituir por fuentes reales) ----------
export type Chip = { icon: "clock" | "euro" | "paw" | "car" | "walk" | "level" | "tag" | "museum"; text: string };
export type PlanItem = { id: string; label: string; date?: string; title: string; description: string; tag: string; tagIcon: "beach" | "walk" | "event" | "dinner" | "culture"; photo: string; badge?: Chip; facts: Chip[]; cta: string; reply: string };

export const ITINERARY: { days: PlanItem[] } = {
  days: [
    { id: "d1", label: "Día 1", date: "12 jun", title: "Llegada y playa canina", description: "Instalaos y acabad el día con un baño en una playa canina cercana. Una forma tranquila de empezar la escapada.", tag: "Playa canina", tagIcon: "beach", photo: "1717217426511-6c6cae5f8766", badge: { icon: "car", text: "Trayecto por confirmar" }, facts: [{ icon: "clock", text: "Tarde" }, { icon: "euro", text: "Coste por confirmar" }, { icon: "paw", text: "Zona para perros (por confirmar)" }], cta: "Cómo llegar", reply: "Aquí se abriría el mapa con la playa canina elegida. Distancia, acceso y normas se cargarán desde datos reales. (Demostración.)" },
    { id: "d2", label: "Día 2", date: "13 jun", title: "Sendero costero con vistas", description: "Un paseo de dificultad baja por la costa, pensado para disfrutar con perro y hacer fotos.", tag: "Paseo con vistas", tagIcon: "walk", photo: "1786494175332-03b9c02372c6", badge: { icon: "walk", text: "Salida desde el camping" }, facts: [{ icon: "clock", text: "Unas horas" }, { icon: "level", text: "Dificultad baja" }, { icon: "paw", text: "Apto para perros" }], cta: "Ver ruta", reply: "Aquí aparecería el mapa y el perfil de la ruta. Duración y dificultad son orientativas en esta demostración." },
    { id: "d3", label: "Día 3", date: "14 jun", title: "Feria de quesos y vinos", description: "Mercado de productos locales en el pueblo vecino: quesos, vinos y artesanía para llevaros un sabor de la zona.", tag: "¡No te lo puedes perder!", tagIcon: "event", photo: "1752401984784-74bb3b095745", badge: { icon: "car", text: "Pueblo vecino" }, facts: [{ icon: "clock", text: "Mañana y tarde" }, { icon: "euro", text: "Entrada por confirmar" }, { icon: "paw", text: "Consultar normativa con perros" }], cta: "Más información", reply: "El evento es un ejemplo: fecha, horario y acceso con perros deben confirmarse en una fuente real antes de mostrarse." },
  ],
};

export type Day4Plan = { label: string; subtitle: string; photo: string; title: string; description: string; cta: string; reply: string; badge: string; highlights: { icon: "museum" | "bag" | "paw"; title: string; text: string }[]; slots?: { name: string; time: string; icon: "sun" | "moon"; items: { icon: "gym" | "mic" | "dice" | "dinner"; title: string; text: string }[] }[] };

export const DAY4: { date: string; sunny: Day4Plan; rainy: Day4Plan } = {
  date: "15 jun",
  sunny: { label: "Si hace buen tiempo", subtitle: "Paseo, cultura y pueblo con encanto", photo: "1787269701541-662aedb34d67", title: "Pueblo con encanto y cultura", badge: "Trayecto por confirmar", description: "Descubre el pueblo vecino, con sus calles históricas, tiendas locales, artesanía y un pequeño museo. Un plan para disfrutar sin prisas junto a tu perro.", highlights: [{ icon: "museum", title: "Casco histórico", text: "Calles, tiendas y artesanía" }, { icon: "bag", title: "Mercado local", text: "Productos de la zona" }, { icon: "paw", title: "Dog-friendly", text: "Normas por confirmar" }], cta: "Ver más información", reply: "Aquí se abriría la ficha del pueblo. Trayecto, horarios y normas con perros se cargarán desde datos reales. (Demostración.)" },
  rainy: { label: "Si llueve", subtitle: "Disfruta del camping sin preocuparte del tiempo", photo: "1764422097760-c7356c896438", title: "Plan en el camping", badge: "En el camping", description: "Aunque llueva, hay opciones para disfrutar de la estancia. Un plan con actividades para aprovechar el día sin salir del camping.", highlights: [], slots: [
    { name: "Mañana", time: "Horario por confirmar", icon: "sun", items: [{ icon: "gym", title: "Gimnasio", text: "Zona fitness cubierta" }, { icon: "mic", title: "Karaoke", text: "Diversión para todos" }] },
    { name: "Tarde y noche", time: "Horario por confirmar", icon: "moon", items: [{ icon: "dice", title: "Juegos de mesa", text: "En la sala común" }, { icon: "dinner", title: "Cena especial", text: "Menú en el restaurante del camping" }] },
  ], cta: "Ver todas las actividades", reply: "Aquí aparecería el programa de actividades del camping. Actividades y horarios son de ejemplo, sin confirmar." },
};

// ---------- Alternativas para cambiar un día (DEMOSTRACIÓN) ----------
export type AltIcon = "beach" | "dinner" | "sun" | "walk" | "bag" | "paw" | "camera" | "landmark" | "store" | "tree";
export type AltPlan = { id: string; photo: string; badge: string; tag: string; tagIcon: "beach" | "walk" | "culture"; title: string; description: string; facts: { icon: AltIcon; text: string }[]; cta: string; reply: string };

export const ALT_DAY = { label: "13 de junio", prompt: "¿Podemos cambiar el plan del 13 de junio? Nos gustaría descubrir algo diferente.", intro: "¡Claro! Voy a buscar actividades cerca del camping para el 13 de junio. Te propongo tres opciones diferentes, teniendo en cuenta que viajáis con vuestro perro: una cala con restaurante, un pueblo marinero y una visita cultural." };

export const ALT_PLANS: AltPlan[] = [
  { id: "a1", photo: "1717217426511-6c6cae5f8766", badge: "A 30 min del camping", tag: "Cala y gastronomía", tagIcon: "beach", title: "Cala y sabores del mar", description: "Una pequeña cala de aguas cristalinas donde disfrutar de un baño con tu perro (según la normativa) y un restaurante con terraza y vistas al mar.", facts: [{ icon: "beach", text: "Cala pet-friendly (según normativa)" }, { icon: "dinner", text: "Restaurante con terraza" }, { icon: "sun", text: "Perfecta para pasar la mañana y comer frente al mar" }], cta: "Ver detalles", reply: "Aquí se abriría la ficha de la cala y el restaurante. Normativa, horarios y trayecto se cargarán desde datos reales. (Demostración.)" },
  { id: "a2", photo: "1601498052034-3c265991f662", badge: "A 45 min del camping", tag: "Paseo y ambiente local", tagIcon: "walk", title: "Pueblo marinero con encanto", description: "Pasea por el puerto, descubre sus calles llenas de vida, pequeñas tiendas y terrazas. Un plan perfecto para disfrutar de la costa a vuestro ritmo.", facts: [{ icon: "walk", text: "Paseo marítimo y casco antiguo" }, { icon: "bag", text: "Tiendas locales y ambiente relajado" }, { icon: "paw", text: "Ideal para ir con perro" }, { icon: "camera", text: "Oportunidades para hacer fotos" }], cta: "Explorar el pueblo", reply: "Aquí se abriría la guía del pueblo marinero. El nombre y el trayecto son de ejemplo, sin confirmar." },
  { id: "a3", photo: "1759054716857-881c10aa4941", badge: "A 1 h 30 min del camping", tag: "Cultura e historia", tagIcon: "culture", title: "Ciudad con historia y cultura", description: "Una escapada para descubrir un centro histórico lleno de encanto, monumentos, mercados y rincones con personalidad. Un plan para pasar el día.", facts: [{ icon: "landmark", text: "Casco histórico y monumentos" }, { icon: "store", text: "Mercados y tiendas locales" }, { icon: "paw", text: "Zonas donde se admiten perros (consultar)" }, { icon: "tree", text: "Piérdete por sus calles y miradores" }], cta: "Ver la escapada", reply: "Aquí aparecería la escapada cultural completa. Ciudad, duración y normas con perros son de ejemplo, por confirmar." },
];

export const ALT_IDEAS = ["Playas cercanas", "Restaurantes con terraza", "Rutas de senderismo", "Miradores", "Mercados locales", "Ver más opciones"];
