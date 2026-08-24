import { daysBeforeDemoNow } from '@/lib/utils/demo-time';
import type { Locale } from '@/types/i18n';
import type { ReviewRating } from '@/types/commerce';

/**
 * DEMO DATA — customer reviews.
 *
 * Every `createdAt` is derived from DEMO_NOW, never from the wall clock, so the
 * dates are stable across renders and across demos.
 *
 * The bodies are written the way real reviews read: specific, occasionally
 * lukewarm, sometimes mentioning a flaw. A wall of five-star superlatives is
 * the single least credible thing you can put on a product page, and a business
 * owner evaluating this demo will notice.
 */

export interface DemoReview {
  id: string;
  productHandle: string;
  author: string;
  location: string;
  rating: ReviewRating;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  daysAgo: number;
  verified: boolean;
  helpfulCount: number;
  fit?: 'small' | 'true' | 'large';
  size?: string;
}

export const DEMO_REVIEWS: DemoReview[] = [
  // ── ATLANTIC 01 ────────────────────────────────────────────────────────────
  {
    id: 'rev-001',
    productHandle: 'atlantic-01',
    author: 'Marcos R.',
    location: 'Santa Cruz de Tenerife',
    rating: 5,
    title: { es: 'Aguantó Anaga en noviembre', en: 'Held up in Anaga in November' },
    body: {
      es: 'Cuatro horas de lluvia horizontal y llegué seco. Lo que más me sorprendió no es la impermeabilidad, es que no acabé empapado por dentro de sudor. La capucha se ajusta de verdad, no es decorativa.',
      en: 'Four hours of horizontal rain and I arrived dry. What surprised me was not the waterproofing — it was not ending up soaked in my own sweat. The hood actually adjusts; it is not decorative.',
    },
    daysAgo: 12,
    verified: true,
    helpfulCount: 34,
    fit: 'true',
    size: 'L',
  },
  {
    id: 'rev-002',
    productHandle: 'atlantic-01',
    author: 'Elena V.',
    location: 'Madrid',
    rating: 5,
    title: { es: 'Ligera de verdad', en: 'Genuinely light' },
    body: {
      es: 'La llevo doblada en la mochila todos los días y no noto que está. El acabado de las cremalleras es muy superior a otras chaquetas del doble de precio que he tenido.',
      en: 'I carry it folded in my bag every day and never notice it is there. The zip hardware is far better than jackets I have owned at twice the price.',
    },
    daysAgo: 26,
    verified: true,
    helpfulCount: 21,
    fit: 'true',
    size: 'S',
  },
  {
    id: 'rev-003',
    productHandle: 'atlantic-01',
    author: 'Tomás L.',
    location: 'Bilbao',
    rating: 4,
    title: { es: 'Muy buena, pero justa de talla', en: 'Very good, but sized close' },
    body: {
      es: 'La calidad es indiscutible. Mi única pega: si vas a llevar un jersey grueso debajo, pide una talla más. Con la M me quedaba justa de hombros con el BASALT KNIT.',
      en: 'The quality is not in question. My only note: if you plan to wear a thick jumper underneath, size up. The M was tight across the shoulders over the BASALT KNIT.',
    },
    daysAgo: 41,
    verified: true,
    helpfulCount: 47,
    fit: 'small',
    size: 'M',
  },
  {
    id: 'rev-004',
    productHandle: 'atlantic-01',
    author: 'Sofía M.',
    location: 'Barcelona',
    rating: 5,
    title: { es: 'Se pliega en su bolsillo', en: 'Packs into its own pocket' },
    body: {
      es: 'Llevo dos años buscando una chaqueta que se pliegue de verdad pequeña sin ser un chubasquero de plástico. Esta lo consigue. El color Basalto es más cálido en persona que en las fotos.',
      en: 'I spent two years looking for a jacket that packs genuinely small without being a plastic rain cape. This does it. Basalt is warmer in person than in the photographs.',
    },
    daysAgo: 63,
    verified: true,
    helpfulCount: 18,
    fit: 'true',
    size: 'XS',
  },

  // ── TIDE 01 ────────────────────────────────────────────────────────────────
  {
    id: 'rev-010',
    productHandle: 'tide-01',
    author: 'Javier P.',
    location: 'Las Palmas',
    rating: 5,
    title: { es: 'La prenda que más me pongo', en: 'The thing I wear most' },
    body: {
      es: 'Sale de casa a las siete y vuelve a las diez de la noche sin que tenga que cambiarme. Los bolsillos de pecho tienen fuelle real, cabe un cuaderno.',
      en: 'Out of the house at seven, back at ten at night, no change of clothes needed. The chest pockets have real bellows — a notebook fits.',
    },
    daysAgo: 8,
    verified: true,
    helpfulCount: 29,
    fit: 'true',
    size: 'M',
  },
  {
    id: 'rev-011',
    productHandle: 'tide-01',
    author: 'Nuria C.',
    location: 'Valencia',
    rating: 4,
    title: { es: 'Buen peso, botones excelentes', en: 'Good weight, excellent buttons' },
    body: {
      es: 'El tejido tiene cuerpo sin pesar. Los botones de corozo son un detalle que se nota. Le quito una estrella porque el musgo destiñe un poco el primer lavado.',
      en: 'The fabric has body without weight. The corozo buttons are a detail you feel. One star off because the moss bled slightly on the first wash.',
    },
    daysAgo: 34,
    verified: true,
    helpfulCount: 52,
    fit: 'true',
    size: 'L',
  },
  {
    id: 'rev-012',
    productHandle: 'tide-01',
    author: 'Andrés F.',
    location: 'Sevilla',
    rating: 5,
    title: { es: 'Perfecta para entretiempo', en: 'Perfect between seasons' },
    body: {
      es: 'Aquí tenemos seis meses de entretiempo y esto lo resuelve entero. Frena el viento sin dar calor.',
      en: 'We get six months of in-between weather here and this covers all of it. Stops wind without cooking you.',
    },
    daysAgo: 55,
    verified: true,
    helpfulCount: 14,
    fit: 'true',
    size: 'XL',
  },

  // ── VOLCANIC TEE ───────────────────────────────────────────────────────────
  {
    id: 'rev-020',
    productHandle: 'volcanic-tee',
    author: 'Carla D.',
    location: 'La Laguna',
    rating: 5,
    title: { es: 'El cuello sigue intacto', en: 'The collar is still intact' },
    body: {
      es: 'Un año y pico, lavados semanales, y el cuello no ha cedido. Es la única camiseta que he tenido de la que puedo decir eso.',
      en: 'A year and a bit, washed weekly, and the collar has not gone. It is the only t-shirt I can say that about.',
    },
    daysAgo: 5,
    verified: true,
    helpfulCount: 61,
    fit: 'true',
    size: 'M',
  },
  {
    id: 'rev-021',
    productHandle: 'volcanic-tee',
    author: 'Ignacio B.',
    location: 'Zaragoza',
    rating: 4,
    title: { es: 'Pesada, en el buen sentido', en: 'Heavy, in the good way' },
    body: {
      es: 'Si esperas una camiseta fina, no es esto. Cae recta y no se transparenta. En verano a 35 °C quizá sea demasiado.',
      en: 'If you want a thin t-shirt, this is not it. It hangs straight and stays opaque. At 35 °C in summer it may be too much.',
    },
    daysAgo: 19,
    verified: true,
    helpfulCount: 38,
    fit: 'true',
    size: 'L',
  },
  {
    id: 'rev-022',
    productHandle: 'volcanic-tee',
    author: 'Paula G.',
    location: 'Oviedo',
    rating: 5,
    title: { es: 'Compré tres', en: 'Bought three' },
    body: {
      es: 'Después de la primera pedí dos más. La variación de tono entre lotes es real pero queda bien, no parece un error.',
      en: 'After the first I ordered two more. The batch-to-batch tone variation is real but it looks intentional, not like a fault.',
    },
    daysAgo: 47,
    verified: true,
    helpfulCount: 25,
    fit: 'true',
    size: 'S',
  },
  {
    id: 'rev-023',
    productHandle: 'volcanic-tee',
    author: 'Diego S.',
    location: 'Málaga',
    rating: 3,
    title: { es: 'Buena calidad, corte no es para mí', en: 'Good quality, cut is not for me' },
    body: {
      es: 'El algodón es excelente y se nota el gramaje. Pero el corte regular me queda más ancho de lo que esperaba en el cuerpo. Cuestión de gusto, no de calidad.',
      en: 'The cotton is excellent and the weight shows. But the regular cut sits wider on the body than I expected. A matter of taste, not quality.',
    },
    daysAgo: 72,
    verified: true,
    helpfulCount: 43,
    fit: 'large',
    size: 'M',
  },

  // ── BASALT KNIT ────────────────────────────────────────────────────────────
  {
    id: 'rev-030',
    productHandle: 'basalt-knit',
    author: 'Lucía A.',
    location: 'San Sebastián',
    rating: 5,
    title: { es: 'No pica en absoluto', en: 'No itch at all' },
    body: {
      es: 'Tengo la piel sensible y la lana suele ser un problema. Esta la llevo directamente sobre la piel sin nada debajo.',
      en: 'I have sensitive skin and wool is usually a problem. I wear this directly against skin with nothing underneath.',
    },
    daysAgo: 9,
    verified: true,
    helpfulCount: 44,
    fit: 'true',
    size: 'S',
  },
  {
    id: 'rev-031',
    productHandle: 'basalt-knit',
    author: 'Roberto M.',
    location: 'A Coruña',
    rating: 5,
    title: { es: 'Mantiene la forma', en: 'Holds its shape' },
    body: {
      es: 'Los puños y el codo siguen como el primer día después de un invierno entero. El punto es notablemente más cerrado que otros merinos que he probado.',
      en: 'Cuffs and elbows are as they were after a whole winter. The knit is noticeably tighter than other merinos I have tried.',
    },
    daysAgo: 38,
    verified: true,
    helpfulCount: 19,
    fit: 'true',
    size: 'L',
  },
  {
    id: 'rev-032',
    productHandle: 'basalt-knit',
    author: 'Miriam T.',
    location: 'Granada',
    rating: 4,
    title: { es: 'Precioso, pero cuidado con el lavado', en: 'Beautiful, but mind the wash' },
    body: {
      es: 'El color Atlántico es exactamente como en las fotos. Hay que respetar el programa de lana, un lavado normal lo estropea. Eso no es culpa del producto pero conviene decirlo.',
      en: 'The Atlantic colour is exactly as photographed. You must respect the wool cycle; a normal wash ruins it. Not the product’s fault, but worth saying.',
    },
    daysAgo: 66,
    verified: true,
    helpfulCount: 56,
    fit: 'true',
    size: 'M',
  },

  // ── TRADE PANT ─────────────────────────────────────────────────────────────
  {
    id: 'rev-040',
    productHandle: 'trade-pant',
    author: 'Alberto N.',
    location: 'Madrid',
    rating: 5,
    title: { es: 'De la oficina al monte', en: 'Office to trail' },
    body: {
      es: 'Es exactamente lo que promete. No parece un pantalón de montaña y no parece un pantalón de vestir. La cintura ajustable salva la vida después de comer.',
      en: 'Exactly what it promises. Does not look like hiking trousers, does not look like dress trousers. The adjustable waist saves you after lunch.',
    },
    daysAgo: 15,
    verified: true,
    helpfulCount: 31,
    fit: 'true',
    size: '32',
  },
  {
    id: 'rev-041',
    productHandle: 'trade-pant',
    author: 'Cristina H.',
    location: 'Palma',
    rating: 4,
    title: { es: 'Seca rapidísimo', en: 'Dries extremely fast' },
    body: {
      es: 'Los lavo por la noche y por la mañana están secos. El bajo de 17 cm me parece algo estrecho, pero es cuestión de preferencia.',
      en: 'Washed at night, dry by morning. The 17 cm leg opening feels a touch narrow to me, but that is preference.',
    },
    daysAgo: 29,
    verified: true,
    helpfulCount: 22,
    fit: 'true',
    size: '30',
  },

  // ── CURRENT BAG ────────────────────────────────────────────────────────────
  {
    id: 'rev-050',
    productHandle: 'current-bag',
    author: 'Pablo E.',
    location: 'Tenerife',
    rating: 5,
    title: { es: 'El tamaño exacto', en: 'Exactly the right size' },
    body: {
      es: 'Cuatro litros suena a poco hasta que la usas. Teléfono, cartera, llaves, botella de medio litro y un libro. No necesito más y por eso no llevo más.',
      en: 'Four litres sounds small until you use it. Phone, wallet, keys, half-litre bottle and a book. I do not need more, so I do not carry more.',
    },
    daysAgo: 7,
    verified: true,
    helpfulCount: 48,
  },
  {
    id: 'rev-051',
    productHandle: 'current-bag',
    author: 'Marta J.',
    location: 'Vigo',
    rating: 5,
    title: { es: 'La hebilla es una joya', en: 'The buckle is a gem' },
    body: {
      es: 'Parece un detalle menor hasta que la comparas con el plástico de cualquier otra bandolera. La correa se cambia en diez segundos, sin herramientas, como dicen.',
      en: 'Sounds like a minor detail until you compare it with the plastic on any other crossbody. The strap swaps in ten seconds, no tools, exactly as claimed.',
    },
    daysAgo: 23,
    verified: true,
    helpfulCount: 27,
  },
  {
    id: 'rev-052',
    productHandle: 'current-bag',
    author: 'Hugo V.',
    location: 'Alicante',
    rating: 4,
    title: { es: 'Impermeable de verdad', en: 'Genuinely water resistant' },
    body: {
      es: 'Aguantó un chaparrón completo con el portátil pequeño dentro. Echo de menos un bolsillo interior con cremallera para las llaves.',
      en: 'Survived a full downpour with a small laptop inside. I do miss an internal zipped pocket for keys.',
    },
    daysAgo: 51,
    verified: true,
    helpfulCount: 35,
  },

  // ── NORTH CAP ──────────────────────────────────────────────────────────────
  {
    id: 'rev-060',
    productHandle: 'north-cap',
    author: 'Irene B.',
    location: 'Santander',
    rating: 5,
    title: { es: 'Vuelve a su forma', en: 'Returns to shape' },
    body: {
      es: 'La he llevado aplastada en el bolsillo de la chaqueta durante semanas y sigue teniendo la visera recta.',
      en: 'It has been crushed in a jacket pocket for weeks and the brim is still straight.',
    },
    daysAgo: 17,
    verified: true,
    helpfulCount: 16,
  },
  {
    id: 'rev-061',
    productHandle: 'north-cap',
    author: 'Sergio A.',
    location: 'Bilbao',
    rating: 4,
    title: { es: 'Buen cierre', en: 'Good closure' },
    body: {
      es: 'El cierre metálico no se afloja con viento, que es exactamente el problema que tenía con las de velcro. La talla única me queda ligeramente grande.',
      en: 'The metal closure does not slip in wind, which was exactly my problem with velcro ones. One size runs slightly large on me.',
    },
    daysAgo: 44,
    verified: true,
    helpfulCount: 23,
  },

  // ── ATLANTIC BOTTLE ────────────────────────────────────────────────────────
  {
    id: 'rev-070',
    productHandle: 'atlantic-bottle',
    author: 'Ana Q.',
    location: 'Barcelona',
    rating: 5,
    title: { es: 'Hielo al día siguiente', en: 'Ice the next day' },
    body: {
      es: 'La llené con hielo un domingo por la noche y el lunes por la tarde seguía habiendo. No exageran con las 24 horas.',
      en: 'Filled it with ice on Sunday night and there was still ice on Monday afternoon. The 24 hours is not an exaggeration.',
    },
    daysAgo: 4,
    verified: true,
    helpfulCount: 39,
  },
  {
    id: 'rev-071',
    productHandle: 'atlantic-bottle',
    author: 'Guillermo R.',
    location: 'Murcia',
    rating: 5,
    title: { es: 'Junta de repuesto disponible', en: 'Replacement gasket available' },
    body: {
      es: 'Compré la junta de repuesto por si acaso. Que exista ya dice mucho: la mayoría de marcas prefieren que compres otra botella.',
      en: 'I bought the spare gasket just in case. The fact that it exists says a lot — most brands would rather you bought another bottle.',
    },
    daysAgo: 31,
    verified: true,
    helpfulCount: 57,
  },
  {
    id: 'rev-072',
    productHandle: 'atlantic-bottle',
    author: 'Beatriz C.',
    location: 'Toledo',
    rating: 4,
    title: { es: 'Acabado excelente', en: 'Excellent finish' },
    body: {
      es: 'El arenado se agarra bien con la mano mojada. Pesa 295 g, que para medio litro está bien, pero si buscas ultraligero no es tu botella.',
      en: 'The sandblasted finish grips well with a wet hand. It weighs 295 g, which is fine for half a litre, but it is not the bottle if you want ultralight.',
    },
    daysAgo: 58,
    verified: true,
    helpfulCount: 20,
  },
];

/** Materialise the fixed ISO timestamp for a review. */
export function reviewCreatedAt(review: DemoReview): string {
  return daysBeforeDemoNow(review.daysAgo);
}
