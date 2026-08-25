import type { Localized } from '@/types/i18n';
import type { PaletteKey, ProductForm } from '@/types/visual';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DEMO DATA — the single source of truth for the catalogue.
 *
 * Authored in SOURCE shape (bilingual, colorway × size not yet expanded), not
 * in `Product` shape. lib/commerce/demo/build-product.ts resolves the locale
 * and expands the variants, producing exactly the `Product` objects a Shopify
 * adapter would produce from `@inContext(language: ES)`.
 *
 * NOTHING under components/ or app/ may import this file. That is enforced by
 * `no-restricted-imports` in eslint.config.mjs, and it is the rule that keeps
 * the Shopify swap a data change rather than a refactor.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface DemoColorway {
  key: string;
  label: Localized<string>;
  hex: string;
  /** Second stop for the procedural tint — the rim light, not the body. */
  accentHex: string;
  palette: PaletteKey;
  available: boolean;
}

export interface DemoSize {
  value: string;
  available: boolean;
  stock: number;
}

export interface DemoProduct {
  id: string;
  handle: string;
  title: string;
  subtitle: Localized<string>;
  description: Localized<string>;
  story: Localized<string>;
  priceCents: number;
  compareAtCents?: number;
  form: ProductForm;
  vendor: string;
  tags: string[];
  collectionHandles: string[];
  colorways: DemoColorway[];
  sizes: DemoSize[];
  material: Localized<string>;
  composition: Localized<string>;
  weightGrams: number;
  origin: Localized<string>;
  care: Localized<string[]>;
  features: Localized<{ key: string; label: string; detail: string }[]>;
  specs: Localized<{ label: string; value: string }[]>;
  pairsWith: string[];
  shipping: Localized<string>;
  returns: Localized<string>;
  rating: { value: number; count: number; distribution: [number, number, number, number, number] };
  /** Rank for the "featured" sort and the trending recommendation strategy. */
  featuredRank: number;
  seo: Localized<{ title: string; description: string }>;
}

const SHIPPING: Localized<string> = {
  es: 'Envío express gratuito en pedidos superiores a 120 €. Entrega en 2–4 días laborables en península, 3–6 días en Canarias y Baleares.',
  en: 'Free express shipping on orders over €120. Delivered in 2–4 working days within mainland Spain, 3–6 days to the islands.',
};

const RETURNS: Localized<string> = {
  es: '30 días para cambios y devoluciones. Recogida gratuita a domicilio. La prenda debe conservar sus etiquetas.',
  en: '30 days for exchanges and returns. Free home collection. Items must retain their original tags.',
};

const CARE_TECHNICAL: Localized<string[]> = {
  es: [
    'Lavar a máquina a 30 °C con prendas de color similar',
    'No usar suavizante: obstruye la membrana',
    'Secar al aire, en horizontal',
    'Reactivar el DWR con plancha tibia sin vapor',
  ],
  en: [
    'Machine wash at 30 °C with like colours',
    'No fabric softener — it clogs the membrane',
    'Air dry flat',
    'Reactivate the DWR with a warm iron, no steam',
  ],
};

const CARE_KNIT: Localized<string[]> = {
  es: [
    'Lavar a máquina en programa lana, 30 °C',
    'No usar lejía',
    'Secar en horizontal a la sombra',
    'Planchar a temperatura media',
  ],
  en: ['Machine wash on wool cycle, 30 °C', 'Do not bleach', 'Dry flat in shade', 'Iron on medium'],
};

const CARE_COTTON: Localized<string[]> = {
  es: [
    'Lavar a máquina a 30 °C del revés',
    'No usar lejía',
    'Secadora a baja temperatura',
    'Planchar del revés',
  ],
  en: [
    'Machine wash at 30 °C inside out',
    'Do not bleach',
    'Tumble dry low',
    'Iron inside out',
  ],
};

/**
 * TIDE 01's own fabric — cotton–nylon twill, no membrane and no DWR finish.
 * `CARE_TECHNICAL` above was written for the ePTFE shell and talks about
 * reactivating a DWR finish the overshirt does not have; this is what an
 * unlined twill actually needs.
 */
const CARE_COTTON_TWILL: Localized<string[]> = {
  es: [
    'Lavar a máquina a 30 °C con colores similares',
    'No usar lejía',
    'Secar en tendedero, no en secadora',
    'Planchar a temperatura media si es necesario',
  ],
  en: [
    'Machine wash at 30 °C with similar colours',
    'Do not bleach',
    'Line dry, do not tumble dry',
    'Iron on medium heat if needed',
  ],
};

/**
 * TRADE PANT's four-way stretch nylon–elastane twill. High heat and fabric
 * softener both degrade elastane over time, which is the failure mode this
 * fabric actually has — not a membrane to protect.
 */
const CARE_STRETCH: Localized<string[]> = {
  es: [
    'Lavar a máquina a 30 °C del revés',
    'No usar lejía ni suavizante: el suavizante degrada el elastano',
    'Secar al aire, nunca en secadora a alta temperatura',
    'No planchar directamente sobre la cinturilla elástica',
  ],
  en: [
    'Machine wash at 30 °C inside out',
    'No bleach or fabric softener — softener degrades the elastane',
    'Air dry, never high-heat tumble dry',
    'Do not iron directly over the elastic waistband',
  ],
};

/**
 * NORTH CAP: recycled ripstop with a DWR finish, six structured panels — a
 * machine wash or a dishwasher (`CARE_HARDWARE`'s old line) would deform the
 * brim. This is what a structured technical cap actually needs.
 */
const CARE_CAP: Localized<string[]> = {
  es: [
    'Lavar a mano con agua fría',
    'No lavar a máquina: deforma la visera',
    'Secar al aire sobre su forma, nunca en secadora',
    'Reactivar el DWR con plancha tibia sin vapor si el agua deja de perlar',
  ],
  en: [
    'Hand wash in cold water',
    'Do not machine wash — it distorts the brim',
    'Air dry on its shape, never tumble dry',
    'Reactivate the DWR with a warm iron, no steam, if water stops beading',
  ],
};

/** CURRENT BAG: recycled Cordura® with a TPU laminate and an anodised buckle. */
const CARE_BAG: Localized<string[]> = {
  es: [
    'Limpiar con un paño húmedo',
    'No lavar a máquina',
    'Secar completamente antes de guardar',
    'La hebilla de aluminio anodizado no necesita mantenimiento',
  ],
  en: [
    'Wipe clean with a damp cloth',
    'Do not machine wash',
    'Dry fully before storing',
    'The anodised aluminium buckle needs no maintenance',
  ],
};

/** ATLANTIC BOTTLE: double-walled steel with a replaceable lid gasket. */
const CARE_BOTTLE: Localized<string[]> = {
  es: [
    'Enjuagar el interior después de cada uso',
    'Lavar a mano; no apto para lavavajillas',
    'Secar con el tapón abierto para evitar olores',
    'Revisar la junta de la tapa periódicamente: hay repuesto disponible',
  ],
  en: [
    'Rinse the interior after every use',
    'Hand wash; not dishwasher safe',
    'Dry with the lid off to avoid odours',
    'Check the lid gasket periodically — a spare is available',
  ],
};

const APPAREL_SIZES: DemoSize[] = [
  { value: 'XS', available: true, stock: 6 },
  { value: 'S', available: true, stock: 14 },
  { value: 'M', available: true, stock: 22 },
  { value: 'L', available: true, stock: 17 },
  { value: 'XL', available: true, stock: 9 },
  { value: 'XXL', available: false, stock: 0 },
];

const ONE_SIZE: DemoSize[] = [{ value: 'ÚNICA', available: true, stock: 40 }];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'atl-001',
    handle: 'atlantic-01',
    title: 'ATLANTIC 01',
    subtitle: {
      es: 'Chaqueta técnica ligera',
      en: 'Lightweight technical shell',
    },
    description: {
      es: 'La pieza fundacional. Una carcasa de tres capas que pesa 340 gramos y resiste ocho horas de lluvia atlántica sin ceder. Construida sin costuras superfluas: cada unión existe porque hace un trabajo.',
      en: 'The founding piece. A three-layer shell weighing 340 grams that holds off eight hours of Atlantic rain without giving. Built without a superfluous seam: every join exists because it does a job.',
    },
    story: {
      es: 'Probada durante dos inviernos en la vertiente norte de Anaga, donde el viento cambia de dirección cuatro veces en una hora.',
      en: 'Tested across two winters on the northern face of Anaga, where the wind changes direction four times an hour.',
    },
    priceCents: 12900,
    form: 'shell',
    vendor: 'Atlantic Supply',
    tags: ['outerwear', 'technical', 'waterproof', 'signature'],
    collectionHandles: ['all', 'outerwear', 'technical'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#1C1E22', accentHex: '#4A5058', palette: 'basalt', available: true },
      { key: 'sail', label: { es: 'Vela', en: 'Sail' }, hex: '#D8D2C6', accentHex: '#F2EDE4', palette: 'sail', available: true },
      { key: 'ember', label: { es: 'Brasa', en: 'Ember' }, hex: '#B4552A', accentHex: '#E5843F', palette: 'ember', available: true },
    ],
    sizes: APPAREL_SIZES,
    material: { es: 'Membrana de 3 capas', en: 'Three-layer membrane' },
    composition: {
      es: '100 % nylon reciclado con membrana ePTFE y acabado DWR sin PFC',
      en: '100% recycled nylon with ePTFE membrane and PFC-free DWR finish',
    },
    weightGrams: 340,
    origin: { es: 'Tejido en Portugal · Confeccionado en Portugal', en: 'Woven in Portugal · Made in Portugal' },
    care: CARE_TECHNICAL,
    features: {
      es: [
        { key: 'lightweight', label: 'LIGERA', detail: '340 g en talla M. Se pliega en su propio bolsillo interior.' },
        { key: 'weather', label: 'RESISTENTE', detail: 'Columna de agua de 20.000 mm. Costuras selladas por ultrasonido.' },
        { key: 'movement', label: 'EN MOVIMIENTO', detail: 'Sisa articulada y espalda extendida. Nada tira al levantar el brazo.' },
      ],
      en: [
        { key: 'lightweight', label: 'LIGHTWEIGHT', detail: '340 g in size M. Packs into its own inner pocket.' },
        { key: 'weather', label: 'WEATHER READY', detail: '20,000 mm water column. Ultrasonically sealed seams.' },
        { key: 'movement', label: 'BUILT FOR MOVEMENT', detail: 'Articulated armhole and dropped back hem. Nothing pulls when you reach.' },
      ],
    },
    specs: {
      es: [
        { label: 'Peso', value: '340 g (M)' },
        { label: 'Columna de agua', value: '20.000 mm' },
        { label: 'Transpirabilidad', value: '15.000 g/m²/24 h' },
        { label: 'Capas', value: '3' },
        { label: 'Cremalleras', value: 'YKK AquaGuard®' },
      ],
      en: [
        { label: 'Weight', value: '340 g (M)' },
        { label: 'Water column', value: '20,000 mm' },
        { label: 'Breathability', value: '15,000 g/m²/24 h' },
        { label: 'Layers', value: '3' },
        { label: 'Zips', value: 'YKK AquaGuard®' },
      ],
    },
    pairsWith: ['tide-01', 'north-cap', 'atlantic-bottle'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.9, count: 28, distribution: [0, 0, 1, 3, 24] },
    featuredRank: 1,
    seo: {
      es: {
        title: 'ATLANTIC 01 — Chaqueta técnica ligera',
        description: 'Carcasa de tres capas de 340 g. Columna de agua de 20.000 mm. Diseñada en Tenerife, fabricada en Portugal.',
      },
      en: {
        title: 'ATLANTIC 01 — Lightweight technical shell',
        description: 'A 340 g three-layer shell with a 20,000 mm water column. Designed in Tenerife, made in Portugal.',
      },
    },
  },

  {
    id: 'atl-002',
    handle: 'tide-01',
    title: 'TIDE 01',
    subtitle: { es: 'Sobrecamisa técnica', en: 'Technical overshirt' },
    description: {
      es: 'La capa que resuelve los diez grados de diferencia entre la mañana y la tarde. Estructura de sobrecamisa, tejido con memoria y un peso que aguanta viento sin pedir una chaqueta encima.',
      en: 'The layer that answers the ten degrees between morning and afternoon. Overshirt structure, fabric with memory, and enough weight to hold wind without asking for a jacket on top.',
    },
    story: {
      es: 'Nació de una queja repetida: nadie quería llevar dos prendas para un día que empieza a 14 °C y termina a 24 °C.',
      en: 'It came from a repeated complaint: nobody wanted to carry two garments for a day that starts at 14 °C and ends at 24 °C.',
    },
    priceCents: 8900,
    form: 'overshirt',
    vendor: 'Atlantic Supply',
    tags: ['layering', 'technical', 'midweight'],
    collectionHandles: ['all', 'outerwear', 'technical'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#22252A', accentHex: '#525862', palette: 'basalt', available: true },
      { key: 'moss', label: { es: 'Musgo', en: 'Moss' }, hex: '#3B4238', accentHex: '#6B7462', palette: 'moss', available: true },
      { key: 'sand', label: { es: 'Arena', en: 'Sand' }, hex: '#C7B9A4', accentHex: '#E3D8C6', palette: 'sand', available: true },
    ],
    sizes: APPAREL_SIZES,
    material: { es: 'Sarga de algodón con nylon', en: 'Cotton–nylon twill' },
    composition: { es: '62 % algodón orgánico, 38 % nylon reciclado', en: '62% organic cotton, 38% recycled nylon' },
    weightGrams: 480,
    origin: { es: 'Tejido en España · Confeccionado en Portugal', en: 'Woven in Spain · Made in Portugal' },
    care: CARE_COTTON_TWILL,
    features: {
      es: [
        { key: 'layer', label: 'CAPA INTERMEDIA', detail: 'Cabe bajo la ATLANTIC 01 sin abultar en el hombro.' },
        { key: 'wind', label: 'CORTAVIENTO', detail: 'Trama densa que frena el viento sin sellar la prenda.' },
        { key: 'pockets', label: 'CUATRO BOLSILLOS', detail: 'Dos de pecho con fuelle, dos internos ocultos.' },
      ],
      en: [
        { key: 'layer', label: 'MID LAYER', detail: 'Fits under the ATLANTIC 01 without bulking at the shoulder.' },
        { key: 'wind', label: 'WIND RESISTANT', detail: 'A dense weave that slows wind without sealing the garment.' },
        { key: 'pockets', label: 'FOUR POCKETS', detail: 'Two bellowed chest, two hidden internal.' },
      ],
    },
    specs: {
      es: [
        { label: 'Peso', value: '480 g (M)' },
        { label: 'Gramaje', value: '285 g/m²' },
        { label: 'Botones', value: 'Corozo natural' },
        { label: 'Corte', value: 'Recto' },
      ],
      en: [
        { label: 'Weight', value: '480 g (M)' },
        { label: 'Fabric weight', value: '285 g/m²' },
        { label: 'Buttons', value: 'Natural corozo' },
        { label: 'Fit', value: 'Straight' },
      ],
    },
    pairsWith: ['atlantic-01', 'volcanic-tee', 'trade-pant'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.8, count: 21, distribution: [0, 0, 1, 3, 17] },
    featuredRank: 2,
    seo: {
      es: { title: 'TIDE 01 — Sobrecamisa técnica', description: 'Sobrecamisa de sarga algodón-nylon. La capa intermedia para días de diez grados de diferencia.' },
      en: { title: 'TIDE 01 — Technical overshirt', description: 'A cotton–nylon twill overshirt. The mid layer for a ten-degree day.' },
    },
  },

  {
    id: 'atl-003',
    handle: 'volcanic-tee',
    title: 'VOLCANIC TEE',
    subtitle: { es: 'Camiseta de gramaje alto', en: 'Heavyweight t-shirt' },
    description: {
      es: 'Doscientos cuarenta gramos por metro cuadrado. Un cuello que sigue siendo un cuello después de cincuenta lavados. La camiseta que deja de ser un consumible.',
      en: 'Two hundred and forty grams per square metre. A collar that is still a collar after fifty washes. The t-shirt that stops being a consumable.',
    },
    story: {
      es: 'Teñida con pigmento mineral procedente de arena volcánica lavada. Cada lote varía ligeramente de tono, y eso no es un defecto.',
      en: 'Dyed with mineral pigment from washed volcanic sand. Each batch shifts slightly in tone, and that is not a defect.',
    },
    priceCents: 4900,
    form: 'tee',
    vendor: 'Atlantic Supply',
    tags: ['essentials', 'cotton', 'heavyweight'],
    collectionHandles: ['all', 'essentials'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#26282B', accentHex: '#565B61', palette: 'basalt', available: true },
      { key: 'bone', label: { es: 'Hueso', en: 'Bone' }, hex: '#E4DED2', accentHex: '#F6F2EA', palette: 'sail', available: true },
      { key: 'ember', label: { es: 'Brasa', en: 'Ember' }, hex: '#9C4A28', accentHex: '#CE7038', palette: 'ember', available: true },
      { key: 'moss', label: { es: 'Musgo', en: 'Moss' }, hex: '#414A3D', accentHex: '#6E7A66', palette: 'moss', available: false },
    ],
    sizes: APPAREL_SIZES,
    material: { es: 'Punto de algodón peinado', en: 'Combed cotton jersey' },
    composition: { es: '100 % algodón orgánico peinado, 240 g/m²', en: '100% combed organic cotton, 240 gsm' },
    weightGrams: 240,
    origin: { es: 'Hilado y confeccionado en Portugal', en: 'Spun and made in Portugal' },
    care: CARE_COTTON,
    features: {
      es: [
        { key: 'weight', label: '240 G/M²', detail: 'Cae recto, no se transparenta, no se deforma en el pecho.' },
        { key: 'collar', label: 'CUELLO RIBETEADO', detail: 'Doble costura con cinta de refuerzo en el hombro.' },
        { key: 'dye', label: 'TINTE MINERAL', detail: 'Pigmento de arena volcánica. Variación de lote intencionada.' },
      ],
      en: [
        { key: 'weight', label: '240 GSM', detail: 'Hangs straight, stays opaque, will not stretch at the chest.' },
        { key: 'collar', label: 'RIBBED COLLAR', detail: 'Double-stitched with shoulder-to-shoulder taping.' },
        { key: 'dye', label: 'MINERAL DYE', detail: 'Volcanic sand pigment. Batch variation is intentional.' },
      ],
    },
    specs: {
      es: [
        { label: 'Gramaje', value: '240 g/m²' },
        { label: 'Corte', value: 'Regular' },
        { label: 'Cuello', value: 'Rib 1×1, 22 mm' },
        { label: 'Preencogido', value: 'Sí' },
      ],
      en: [
        { label: 'Fabric weight', value: '240 gsm' },
        { label: 'Fit', value: 'Regular' },
        { label: 'Collar', value: '1×1 rib, 22 mm' },
        { label: 'Pre-shrunk', value: 'Yes' },
      ],
    },
    pairsWith: ['tide-01', 'trade-pant', 'north-cap'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.7, count: 46, distribution: [0, 1, 2, 8, 35] },
    featuredRank: 3,
    seo: {
      es: { title: 'VOLCANIC TEE — Camiseta de gramaje alto', description: 'Algodón orgánico de 240 g/m² teñido con pigmento mineral volcánico.' },
      en: { title: 'VOLCANIC TEE — Heavyweight t-shirt', description: '240 gsm organic cotton dyed with volcanic mineral pigment.' },
    },
  },

  {
    id: 'atl-004',
    handle: 'basalt-knit',
    title: 'BASALT KNIT',
    subtitle: { es: 'Jersey de merino', en: 'Merino crew' },
    description: {
      es: 'Merino de 19,5 micras, lo bastante fino para llevar sobre la piel y lo bastante denso para salir a la calle sin nada encima. Un jersey, no una declaración.',
      en: 'Merino at 19.5 microns — fine enough against skin, dense enough to leave the house in with nothing over it. A jumper, not a statement.',
    },
    story: {
      es: 'El punto se cerró tres veces antes de dar con la densidad correcta: la primera pesaba demasiado, la segunda se deformaba en el codo.',
      en: 'The knit was closed three times before the density was right: the first was too heavy, the second bagged at the elbow.',
    },
    priceCents: 10900,
    compareAtCents: 13500,
    form: 'knit',
    vendor: 'Atlantic Supply',
    tags: ['knitwear', 'merino', 'essentials'],
    collectionHandles: ['all', 'essentials', 'knitwear'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#2A2D31', accentHex: '#5A6068', palette: 'basalt', available: true },
      { key: 'sand', label: { es: 'Arena', en: 'Sand' }, hex: '#CBBEA9', accentHex: '#E8DDCB', palette: 'sand', available: true },
      { key: 'atlantic', label: { es: 'Atlántico', en: 'Atlantic' }, hex: '#2E4854', accentHex: '#557684', palette: 'atlantic', available: true },
    ],
    sizes: APPAREL_SIZES,
    material: { es: 'Merino extrafino', en: 'Extra-fine merino' },
    composition: { es: '100 % lana merino 19,5 µm, mulesing-free', en: '100% merino wool, 19.5 µm, mulesing-free' },
    weightGrams: 390,
    origin: { es: 'Hilo italiano · Tejido en Portugal', en: 'Italian yarn · Knitted in Portugal' },
    care: CARE_KNIT,
    features: {
      es: [
        { key: 'micron', label: '19,5 MICRAS', detail: 'No pica. Se puede llevar directamente sobre la piel.' },
        { key: 'thermal', label: 'REGULA', detail: 'La lana gestiona la humedad: abriga en frío, respira en calor.' },
        { key: 'structure', label: 'PUNTO CERRADO', detail: 'Densidad de 14 galgas. Mantiene la forma en codo y puño.' },
      ],
      en: [
        { key: 'micron', label: '19.5 MICRON', detail: 'No itch. Wearable directly against skin.' },
        { key: 'thermal', label: 'REGULATES', detail: 'Wool manages moisture: warm when cold, breathing when warm.' },
        { key: 'structure', label: 'TIGHT KNIT', detail: '14-gauge density. Holds shape at elbow and cuff.' },
      ],
    },
    specs: {
      es: [
        { label: 'Micraje', value: '19,5 µm' },
        { label: 'Galga', value: '14 gg' },
        { label: 'Peso', value: '390 g (M)' },
        { label: 'Cuello', value: 'Redondo' },
      ],
      en: [
        { label: 'Micron', value: '19.5 µm' },
        { label: 'Gauge', value: '14 gg' },
        { label: 'Weight', value: '390 g (M)' },
        { label: 'Neck', value: 'Crew' },
      ],
    },
    pairsWith: ['atlantic-01', 'trade-pant', 'current-bag'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.9, count: 17, distribution: [0, 0, 0, 2, 15] },
    featuredRank: 4,
    seo: {
      es: { title: 'BASALT KNIT — Jersey de merino', description: 'Merino extrafino de 19,5 micras, punto de 14 galgas. Hilo italiano, tejido en Portugal.' },
      en: { title: 'BASALT KNIT — Merino crew', description: 'Extra-fine 19.5 micron merino, 14-gauge knit. Italian yarn, knitted in Portugal.' },
    },
  },

  {
    id: 'atl-005',
    handle: 'trade-pant',
    title: 'TRADE PANT',
    subtitle: { es: 'Pantalón técnico', en: 'Technical trouser' },
    description: {
      es: 'Un pantalón que funciona en una reunión y en una caminata sin ser obviamente ninguno de los dos. Tejido con elastano recuperado, cintura con ajuste interno y una caída que no se arruga al sentarse.',
      en: 'A trouser that works in a meeting and on a trail without obviously being either. Recovered-elastane fabric, internal waist adjustment, and a drape that does not crease when you sit.',
    },
    story: {
      es: 'El nombre viene de los vientos alisios —trade winds— que cruzan el archipiélago todo el año.',
      en: 'The name comes from the trade winds that cross the archipelago all year.',
    },
    priceCents: 9900,
    form: 'pant',
    vendor: 'Atlantic Supply',
    tags: ['bottoms', 'technical', 'stretch'],
    collectionHandles: ['all', 'technical'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#232629', accentHex: '#535960', palette: 'basalt', available: true },
      { key: 'sand', label: { es: 'Arena', en: 'Sand' }, hex: '#B7AA96', accentHex: '#D9CFBD', palette: 'sand', available: true },
    ],
    sizes: [
      { value: '28', available: true, stock: 5 },
      { value: '30', available: true, stock: 11 },
      { value: '32', available: true, stock: 18 },
      { value: '34', available: true, stock: 14 },
      { value: '36', available: true, stock: 6 },
      { value: '38', available: false, stock: 0 },
    ],
    material: { es: 'Sarga elástica de cuatro direcciones', en: 'Four-way stretch twill' },
    composition: { es: '94 % nylon reciclado, 6 % elastano', en: '94% recycled nylon, 6% elastane' },
    weightGrams: 410,
    origin: { es: 'Tejido en Italia · Confeccionado en Portugal', en: 'Woven in Italy · Made in Portugal' },
    care: CARE_STRETCH,
    features: {
      es: [
        { key: 'stretch', label: 'ELÁSTICO 4D', detail: 'Recuperación total: no hace rodilla después de un día sentado.' },
        { key: 'waist', label: 'CINTURA AJUSTABLE', detail: 'Tensor interno oculto. Dos centímetros en cada dirección.' },
        { key: 'dry', label: 'SECADO RÁPIDO', detail: 'Seco al tacto en 40 minutos a temperatura ambiente.' },
      ],
      en: [
        { key: 'stretch', label: '4-WAY STRETCH', detail: 'Full recovery: no knee bagging after a day at a desk.' },
        { key: 'waist', label: 'ADJUSTABLE WAIST', detail: 'Hidden internal tab. Two centimetres either way.' },
        { key: 'dry', label: 'QUICK DRY', detail: 'Dry to the touch in 40 minutes at room temperature.' },
      ],
    },
    specs: {
      es: [
        { label: 'Peso', value: '410 g (32)' },
        { label: 'Entrepierna', value: '78 cm' },
        { label: 'Bajo', value: '17 cm' },
        { label: 'Bolsillos', value: '5' },
      ],
      en: [
        { label: 'Weight', value: '410 g (32)' },
        { label: 'Inseam', value: '78 cm' },
        { label: 'Leg opening', value: '17 cm' },
        { label: 'Pockets', value: '5' },
      ],
    },
    pairsWith: ['volcanic-tee', 'basalt-knit', 'atlantic-01'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.6, count: 14, distribution: [0, 0, 1, 4, 9] },
    featuredRank: 6,
    seo: {
      es: { title: 'TRADE PANT — Pantalón técnico', description: 'Sarga elástica de cuatro direcciones, cintura ajustable, secado rápido.' },
      en: { title: 'TRADE PANT — Technical trouser', description: 'Four-way stretch twill, adjustable waist, quick drying.' },
    },
  },

  {
    id: 'atl-006',
    handle: 'current-bag',
    title: 'CURRENT BAG',
    subtitle: { es: 'Bandolera mínima', en: 'Minimal crossbody' },
    description: {
      es: 'Cuatro litros. Lo que cabe: teléfono, cartera, llaves, un libro pequeño, una botella de medio litro. Lo que no cabe: todo lo demás, deliberadamente.',
      en: 'Four litres. What fits: phone, wallet, keys, a small book, a half-litre bottle. What does not fit: everything else, deliberately.',
    },
    story: {
      es: 'La correa se puede cambiar sin herramientas. La hebilla es la misma pieza de aluminio anodizado desde el primer prototipo.',
      en: 'The strap changes without tools. The buckle is the same piece of anodised aluminium as the first prototype.',
    },
    priceCents: 6900,
    form: 'bag',
    vendor: 'Atlantic Supply',
    tags: ['accessories', 'bags', 'everyday'],
    collectionHandles: ['all', 'accessories'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#1E2124', accentHex: '#4E545C', palette: 'basalt', available: true },
      { key: 'moss', label: { es: 'Musgo', en: 'Moss' }, hex: '#3A4139', accentHex: '#697362', palette: 'moss', available: true },
      { key: 'ember', label: { es: 'Brasa', en: 'Ember' }, hex: '#A54D26', accentHex: '#D77938', palette: 'ember', available: true },
    ],
    sizes: ONE_SIZE,
    material: { es: 'Cordura® reciclado 500D', en: 'Recycled 500D Cordura®' },
    composition: { es: '100 % nylon Cordura® reciclado con laminado TPU', en: '100% recycled Cordura® nylon with TPU laminate' },
    weightGrams: 210,
    origin: { es: 'Confeccionado en Portugal', en: 'Made in Portugal' },
    care: CARE_BAG,
    features: {
      es: [
        { key: 'volume', label: '4 LITROS', detail: 'Dimensionada para lo esencial, no para lo posible.' },
        { key: 'strap', label: 'CORREA INTERCAMBIABLE', detail: 'Se cambia sin herramientas. Ajuste de 70 a 140 cm.' },
        { key: 'water', label: 'IMPERMEABLE', detail: 'Laminado TPU y cremallera resistente al agua.' },
      ],
      en: [
        { key: 'volume', label: '4 LITRES', detail: 'Sized for the essential, not for the possible.' },
        { key: 'strap', label: 'SWAPPABLE STRAP', detail: 'Changes without tools. Adjusts 70 to 140 cm.' },
        { key: 'water', label: 'WATER RESISTANT', detail: 'TPU laminate and a water-resistant zip.' },
      ],
    },
    specs: {
      es: [
        { label: 'Volumen', value: '4 L' },
        { label: 'Peso', value: '210 g' },
        { label: 'Dimensiones', value: '26 × 17 × 8 cm' },
        { label: 'Hebilla', value: 'Aluminio anodizado' },
      ],
      en: [
        { label: 'Volume', value: '4 L' },
        { label: 'Weight', value: '210 g' },
        { label: 'Dimensions', value: '26 × 17 × 8 cm' },
        { label: 'Buckle', value: 'Anodised aluminium' },
      ],
    },
    pairsWith: ['atlantic-bottle', 'north-cap', 'basalt-knit'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.8, count: 34, distribution: [0, 0, 1, 5, 28] },
    featuredRank: 5,
    seo: {
      es: { title: 'CURRENT BAG — Bandolera mínima', description: 'Bandolera de 4 litros en Cordura® reciclado con correa intercambiable.' },
      en: { title: 'CURRENT BAG — Minimal crossbody', description: 'A 4-litre crossbody in recycled Cordura® with a swappable strap.' },
    },
  },

  {
    id: 'atl-007',
    handle: 'north-cap',
    title: 'NORTH CAP',
    subtitle: { es: 'Gorra técnica', en: 'Technical cap' },
    description: {
      es: 'Visera de seis paneles con estructura suave, banda interior que absorbe y un cierre metálico que no se afloja. Se puede doblar y meter en un bolsillo.',
      en: 'Six panels, soft structure, an absorbing inner band and a metal closure that does not slip. Folds into a pocket.',
    },
    story: {
      es: 'El bordado en la parte trasera marca la latitud del punto más al norte de la isla.',
      en: 'The embroidery at the back marks the latitude of the island’s northernmost point.',
    },
    priceCents: 3900,
    form: 'cap',
    vendor: 'Atlantic Supply',
    tags: ['accessories', 'headwear'],
    collectionHandles: ['all', 'accessories'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#212427', accentHex: '#51575F', palette: 'basalt', available: true },
      { key: 'sand', label: { es: 'Arena', en: 'Sand' }, hex: '#C3B6A1', accentHex: '#E0D6C4', palette: 'sand', available: true },
      { key: 'atlantic', label: { es: 'Atlántico', en: 'Atlantic' }, hex: '#2B4450', accentHex: '#527180', palette: 'atlantic', available: true },
    ],
    sizes: ONE_SIZE,
    material: { es: 'Ripstop reciclado', en: 'Recycled ripstop' },
    composition: { es: '100 % poliéster reciclado con acabado DWR', en: '100% recycled polyester with DWR finish' },
    weightGrams: 68,
    origin: { es: 'Confeccionado en Portugal', en: 'Made in Portugal' },
    care: CARE_CAP,
    features: {
      es: [
        { key: 'packable', label: 'PLEGABLE', detail: 'Recupera la forma después de doblarse en un bolsillo.' },
        { key: 'sweat', label: 'BANDA ABSORBENTE', detail: 'Interior de tejido técnico, no de algodón.' },
        { key: 'fit', label: 'CIERRE METÁLICO', detail: 'Ajuste continuo. No se afloja con el viento.' },
      ],
      en: [
        { key: 'packable', label: 'PACKABLE', detail: 'Returns to shape after folding into a pocket.' },
        { key: 'sweat', label: 'WICKING BAND', detail: 'Technical inner band, not cotton.' },
        { key: 'fit', label: 'METAL CLOSURE', detail: 'Continuous adjustment. Will not slip in wind.' },
      ],
    },
    specs: {
      es: [
        { label: 'Peso', value: '68 g' },
        { label: 'Paneles', value: '6' },
        { label: 'Visera', value: '7 cm, preformada' },
        { label: 'Cierre', value: 'Metálico' },
        { label: 'Ajuste', value: 'Continuo, banda trasera' },
        { label: 'Contorno de cabeza', value: '54–60 cm (talla única ajustable)' },
      ],
      en: [
        { label: 'Weight', value: '68 g' },
        { label: 'Panels', value: '6' },
        { label: 'Brim', value: '7 cm, pre-curved' },
        { label: 'Closure', value: 'Metal' },
        { label: 'Fit', value: 'Continuous, rear band' },
        { label: 'Head circumference', value: '54–60 cm (adjustable one size)' },
      ],
    },
    pairsWith: ['atlantic-01', 'current-bag', 'volcanic-tee'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.7, count: 19, distribution: [0, 0, 1, 4, 14] },
    featuredRank: 7,
    seo: {
      es: { title: 'NORTH CAP — Gorra técnica', description: 'Gorra plegable de seis paneles en ripstop reciclado con acabado DWR.' },
      en: { title: 'NORTH CAP — Technical cap', description: 'A packable six-panel cap in recycled ripstop with a DWR finish.' },
    },
  },

  {
    id: 'atl-008',
    handle: 'atlantic-bottle',
    title: 'ATLANTIC BOTTLE',
    subtitle: { es: 'Botella isotérmica', en: 'Insulated bottle' },
    description: {
      es: 'Medio litro. Acero inoxidable de doble pared. Veinticuatro horas frío, doce caliente. Una junta que se puede sustituir en lugar de tirar la botella.',
      en: 'Half a litre. Double-walled stainless steel. Twenty-four hours cold, twelve hot. A gasket you can replace instead of replacing the bottle.',
    },
    story: {
      es: 'El acabado exterior se texturiza por chorro de arena, no por pintura: no se descascarilla porque no hay nada que se pueda descascarillar.',
      en: 'The outer finish is sandblasted, not painted: it cannot chip because there is nothing to chip.',
    },
    priceCents: 3500,
    form: 'bottle',
    vendor: 'Atlantic Supply',
    tags: ['accessories', 'hardware', 'everyday'],
    collectionHandles: ['all', 'accessories'],
    colorways: [
      { key: 'basalt', label: { es: 'Basalto', en: 'Basalt' }, hex: '#25282B', accentHex: '#5B6169', palette: 'basalt', available: true },
      { key: 'sail', label: { es: 'Vela', en: 'Sail' }, hex: '#DDD7CB', accentHex: '#F5F1E9', palette: 'sail', available: true },
      { key: 'atlantic', label: { es: 'Atlántico', en: 'Atlantic' }, hex: '#2F4A57', accentHex: '#587987', palette: 'atlantic', available: true },
    ],
    sizes: ONE_SIZE,
    material: { es: 'Acero inoxidable 18/8', en: '18/8 stainless steel' },
    composition: { es: 'Acero inoxidable 18/8 de doble pared, sin BPA', en: 'Double-walled 18/8 stainless steel, BPA-free' },
    weightGrams: 295,
    origin: { es: 'Fabricada en Portugal', en: 'Made in Portugal' },
    care: CARE_BOTTLE,
    features: {
      es: [
        { key: 'thermal', label: '24 H FRÍO', detail: 'Doce horas caliente. Vacío entre paredes, no espuma.' },
        { key: 'gasket', label: 'JUNTA SUSTITUIBLE', detail: 'Repuesto disponible. La botella dura más que su sellado.' },
        { key: 'finish', label: 'ACABADO ARENADO', detail: 'Textura mecánica, no pintura. No se descascarilla.' },
      ],
      en: [
        { key: 'thermal', label: '24 H COLD', detail: 'Twelve hours hot. Vacuum between walls, not foam.' },
        { key: 'gasket', label: 'REPLACEABLE GASKET', detail: 'Spares available. The bottle outlives its seal.' },
        { key: 'finish', label: 'SANDBLASTED', detail: 'A mechanical texture, not paint. Nothing to chip.' },
      ],
    },
    specs: {
      es: [
        { label: 'Capacidad', value: '500 ml' },
        { label: 'Peso', value: '295 g' },
        { label: 'Altura', value: '24 cm' },
        { label: 'Boca', value: '52 mm' },
        { label: 'Aislamiento', value: '24 h frío / 12 h caliente' },
      ],
      en: [
        { label: 'Capacity', value: '500 ml' },
        { label: 'Weight', value: '295 g' },
        { label: 'Height', value: '24 cm' },
        { label: 'Mouth', value: '52 mm' },
        { label: 'Insulation', value: '24h cold / 12h hot' },
      ],
    },
    pairsWith: ['current-bag', 'north-cap', 'atlantic-01'],
    shipping: SHIPPING,
    returns: RETURNS,
    rating: { value: 4.9, count: 41, distribution: [0, 0, 1, 4, 36] },
    featuredRank: 8,
    seo: {
      es: { title: 'ATLANTIC BOTTLE — Botella isotérmica', description: 'Botella de 500 ml en acero 18/8 de doble pared. 24 h frío, 12 h caliente.' },
      en: { title: 'ATLANTIC BOTTLE — Insulated bottle', description: 'A 500 ml double-walled 18/8 steel bottle. 24 h cold, 12 h hot.' },
    },
  },
];
