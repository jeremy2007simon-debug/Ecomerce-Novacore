import type { Localized } from '@/types/i18n';
import type { ProductForm } from '@/types/visual';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASK ATLANTIC — DEMO KNOWLEDGE BASE
 *
 * NO AI MODEL IS CALLED. Every answer below is written by hand and matched by
 * keyword. There is no API key, no network request, and no model provider
 * configured anywhere in this project.
 *
 * PRODUCTION INTEGRATION REQUIRED: replace lib/assistant/engine.ts with a call
 * to a route handler that proxies a real model, with the catalogue in context.
 * The component boundary does not change — `answer()` returns the same shape.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AssistantIntent {
  id: string;
  /** Lowercase, accent-free keywords. Any match counts toward the score. */
  keywords: Localized<string[]>;
  answer: Localized<string>;
  /** Product handles cited alongside the answer. */
  cites?: string[];
}

export const ASSISTANT_INTENTS: AssistantIntent[] = [
  {
    id: 'weather-15-20',
    keywords: {
      es: ['15', '20', 'grados', 'temperatura', 'entretiempo', 'clima', 'que me pongo', 'llevar'],
      en: ['15', '20', 'degrees', 'temperature', 'wear', 'weather', 'mild'],
    },
    answer: {
      es: 'Para 15–20 °C la combinación que mejor funciona es la TIDE 01 sobre la VOLCANIC TEE. La sobrecamisa frena el viento sin sellar la prenda, así que no vas a acabar sudando si el día sube a 22 °C. Si hay previsión de lluvia, añade la ATLANTIC 01: pesa 340 g y se pliega en su propio bolsillo, así que llevarla no cuesta nada.',
      en: 'For 15–20 °C the combination that works best is the TIDE 01 over the VOLCANIC TEE. The overshirt slows wind without sealing the garment, so you will not overheat if the day climbs to 22 °C. If rain is forecast, add the ATLANTIC 01 — it weighs 340 g and packs into its own pocket, so carrying it costs nothing.',
    },
    cites: ['tide-01', 'volcanic-tee', 'atlantic-01'],
  },
  {
    id: 'size-general',
    keywords: {
      es: ['talla', 'tallaje', 'medida', 'que talla', 'grande', 'pequeno'],
      en: ['size', 'sizing', 'fit', 'which size', 'runs'],
    },
    answer: {
      es: 'Todo el catálogo es fiel a la talla salvo la ATLANTIC 01, que va algo justa de hombros si piensas llevar un jersey grueso debajo: en ese caso pide una talla más. La TRADE PANT lleva tensor interno con dos centímetros de margen en cada dirección, así que entre dos tallas puedes elegir la menor.',
      en: 'Everything runs true to size except the ATLANTIC 01, which sits close across the shoulders if you plan to wear a thick jumper underneath — size up in that case. The TRADE PANT has an internal waist tab with two centimetres either way, so between two sizes you can take the smaller.',
    },
    cites: ['atlantic-01', 'trade-pant'],
  },
  {
    id: 'size-height',
    keywords: {
      es: ['182', '180', '175', '190', 'mido', 'altura', 'cm', 'estatura'],
      en: ['182', '180', '175', '190', 'tall', 'height', 'cm'],
    },
    answer: {
      es: 'Para 178–185 cm con complexión media, la M en la parte de arriba y la 32 en TRADE PANT es el punto de partida habitual. El largo de la ATLANTIC 01 está pensado para cubrir la cadera, así que a esa altura cae justo por debajo del cinturón.',
      en: 'At 178–185 cm with a medium build, M on top and a 32 in the TRADE PANT is the usual starting point. The ATLANTIC 01 is cut to cover the hip, so at that height it falls just below the belt.',
    },
    cites: ['atlantic-01', 'trade-pant'],
  },
  {
    id: 'atlantic-vs-tide',
    keywords: {
      es: ['diferencia', 'atlantic 01', 'tide 01', 'comparar', 'cual', 'mejor'],
      en: ['difference', 'atlantic 01', 'tide 01', 'compare', 'versus', 'which'],
    },
    answer: {
      es: 'Resuelven problemas distintos. La ATLANTIC 01 es una carcasa impermeable de tres capas: columna de agua de 20.000 mm, costuras selladas, para cuando va a llover de verdad. La TIDE 01 no es impermeable — es una sobrecamisa de sarga algodón-nylon que abriga y frena el viento. Si solo vas a tener una, la ATLANTIC 01 cubre más situaciones; si el problema es la diferencia de temperatura entre la mañana y la tarde, es la TIDE 01.',
      en: 'They solve different problems. The ATLANTIC 01 is a waterproof three-layer shell — 20,000 mm water column, sealed seams — for when it is genuinely going to rain. The TIDE 01 is not waterproof; it is a cotton–nylon twill overshirt that adds warmth and slows wind. If you will only own one, the ATLANTIC 01 covers more situations; if the problem is the gap between morning and afternoon, it is the TIDE 01.',
    },
    cites: ['atlantic-01', 'tide-01'],
  },
  {
    id: 'waterproof',
    keywords: {
      es: ['impermeable', 'lluvia', 'agua', 'mojar', 'llueve'],
      en: ['waterproof', 'rain', 'water', 'wet'],
    },
    answer: {
      es: 'La ATLANTIC 01 es la única prenda totalmente impermeable: membrana ePTFE de tres capas, 20.000 mm de columna de agua y costuras selladas por ultrasonido. La CURRENT BAG es resistente al agua — laminado TPU y cremallera resistente — que es suficiente para un chaparrón pero no para sumergirla. El resto del catálogo no es impermeable.',
      en: 'The ATLANTIC 01 is the only fully waterproof piece: a three-layer ePTFE membrane, a 20,000 mm water column and ultrasonically sealed seams. The CURRENT BAG is water resistant — TPU laminate and a resistant zip — which handles a downpour but is not submersible. Nothing else in the catalogue is waterproof.',
    },
    cites: ['atlantic-01', 'current-bag'],
  },
  {
    id: 'materials',
    keywords: {
      es: ['material', 'tejido', 'composicion', 'algodon', 'lana', 'merino', 'nylon', 'reciclado'],
      en: ['material', 'fabric', 'composition', 'cotton', 'wool', 'merino', 'nylon', 'recycled'],
    },
    answer: {
      es: 'Los tejidos técnicos son nylon reciclado; la ATLANTIC 01 lleva membrana ePTFE con acabado DWR sin PFC. El punto es merino de 19,5 micras con hilo italiano. La VOLCANIC TEE es algodón orgánico peinado de 240 g/m². Todo se corta y se cose en el norte de Portugal.',
      en: 'The technical fabrics are recycled nylon; the ATLANTIC 01 carries an ePTFE membrane with a PFC-free DWR finish. The knitwear is 19.5 micron merino on Italian yarn. The VOLCANIC TEE is 240 gsm combed organic cotton. Everything is cut and sewn in northern Portugal.',
    },
    cites: ['atlantic-01', 'basalt-knit', 'volcanic-tee'],
  },
  {
    id: 'care',
    keywords: {
      es: ['lavar', 'cuidado', 'lavado', 'secar', 'planchar', 'suavizante'],
      en: ['wash', 'care', 'laundry', 'dry', 'iron', 'softener'],
    },
    answer: {
      es: 'Las prendas técnicas se lavan a 30 °C sin suavizante — el suavizante obstruye la membrana y es el error más común. Secar al aire y reactivar el DWR con plancha tibia sin vapor. El merino va en programa lana a 30 °C y se seca en horizontal; un lavado normal lo estropea.',
      en: 'Technical pieces wash at 30 °C with no fabric softener — softener clogs the membrane and is the most common mistake. Air dry, then reactivate the DWR with a warm iron and no steam. Merino goes on a wool cycle at 30 °C and dries flat; a normal wash ruins it.',
    },
    cites: ['atlantic-01', 'basalt-knit'],
  },
  {
    id: 'shipping',
    keywords: {
      es: ['envio', 'enviar', 'entrega', 'cuando llega', 'gratis', 'canarias'],
      en: ['shipping', 'delivery', 'arrive', 'free', 'when'],
    },
    answer: {
      es: 'Envío express gratuito a partir de 120 €. Entrega en 2–4 días laborables en península y 3–6 días en Canarias y Baleares. Las devoluciones son gratuitas durante 30 días con recogida a domicilio.',
      en: 'Free express shipping over €120. Delivery in 2–4 working days within mainland Spain and 3–6 days to the islands. Returns are free for 30 days with home collection.',
    },
  },
  {
    id: 'returns',
    keywords: {
      es: ['devolucion', 'devolver', 'cambio', 'cambiar', 'reembolso'],
      en: ['return', 'refund', 'exchange', 'send back'],
    },
    answer: {
      es: '30 días para cambios y devoluciones, con recogida gratuita a domicilio. La prenda tiene que conservar sus etiquetas. Si es un problema de talla, el cambio es directo y no vuelves a pagar envío.',
      en: '30 days for exchanges and returns, with free home collection. The item must keep its original tags. If it is a sizing issue the exchange is direct and you do not pay shipping again.',
    },
  },
  {
    id: 'sustainability',
    keywords: {
      es: ['sostenible', 'sostenibilidad', 'reciclado', 'medio ambiente', 'etico', 'pfc'],
      en: ['sustainable', 'sustainability', 'recycled', 'environment', 'ethical', 'pfc'],
    },
    answer: {
      es: 'Los acabados DWR son libres de PFC, el nylon y el poliéster son reciclados, y la lana es mulesing-free. Todo se fabrica en cuatro fábricas del norte de Portugal que visitamos dos veces al año; el hilo viene de Italia y España. Nada viaja más de lo necesario, y eso es una decisión de cadena de suministro antes que ambiental.',
      en: 'The DWR finishes are PFC-free, the nylon and polyester are recycled, and the wool is mulesing-free. Everything is made in four factories in northern Portugal that we visit twice a year; yarn comes from Italy and Spain. Nothing travels further than it needs to, which is a supply-chain decision before it is an environmental one.',
    },
  },
  {
    id: 'gift',
    keywords: {
      es: ['regalo', 'regalar', 'primera compra', 'empezar', 'recomienda'],
      en: ['gift', 'present', 'first', 'start', 'recommend'],
    },
    answer: {
      es: 'Para empezar, la VOLCANIC TEE (49 €) o la ATLANTIC BOTTLE (35 €) son las piezas con menos riesgo de talla. Si buscas algo con más peso, la CURRENT BAG es talla única y funciona para cualquiera.',
      en: 'To start, the VOLCANIC TEE (€49) or the ATLANTIC BOTTLE (€35) carry the least sizing risk. If you want something with more presence, the CURRENT BAG is one size and works for anyone.',
    },
    cites: ['volcanic-tee', 'atlantic-bottle', 'current-bag'],
  },
  {
    id: 'weight',
    keywords: {
      es: ['peso', 'pesa', 'ligera', 'ligero', 'gramos'],
      en: ['weight', 'weigh', 'light', 'grams', 'heavy'],
    },
    answer: {
      es: 'La ATLANTIC 01 pesa 340 g en talla M, que es lo que permite plegarla en su propio bolsillo. La NORTH CAP son 68 g, la CURRENT BAG 210 g y la ATLANTIC BOTTLE 295 g vacía. La TIDE 01 es la más pesada de las capas exteriores con 480 g, precisamente porque el peso es lo que frena el viento.',
      en: 'The ATLANTIC 01 is 340 g in size M, which is what lets it pack into its own pocket. The NORTH CAP is 68 g, the CURRENT BAG 210 g and the ATLANTIC BOTTLE 295 g empty. The TIDE 01 is the heaviest outer layer at 480 g, precisely because the weight is what slows the wind.',
    },
    cites: ['atlantic-01', 'tide-01'],
  },
  {
    id: 'knit-comfort',
    keywords: {
      es: ['pica', 'picor', 'aspera', 'suave', 'suavidad', 'irrita', 'regula', 'abriga', 'transpira'],
      en: ['itchy', 'itch', 'scratchy', 'irritate', 'soft', 'softness', 'regulate', 'warm', 'breathe', 'breathable'],
    },
    answer: {
      es: 'BASALT KNIT es merino de 19,5 micras — lo bastante fino para no picar sobre la piel, a diferencia de una lana estándar. La misma fibra regula la temperatura: abriga con frío y transpira con calor. El punto de 14 galgas es lo que le da forma, no lo que roza.',
      en: 'BASALT KNIT is 19.5 micron merino — fine enough not to itch against skin, unlike a standard wool. The same fibre regulates temperature: warm in the cold, breathable in the heat. The 14-gauge knit is what holds its shape, not what causes friction.',
    },
    cites: ['basalt-knit'],
  },
  {
    id: 'bag-details',
    keywords: {
      es: ['capacidad', 'cabe', 'litros', 'movil', 'cartera', 'portatil', 'llaves', 'correa', 'ajustable', 'ajustar'],
      en: ['capacity', 'fits', 'litre', 'liter', 'phone', 'wallet', 'keys', 'laptop', 'strap', 'adjustable', 'adjust'],
    },
    answer: {
      es: 'CURRENT BAG son 4 litros: caben el móvil, la cartera, las llaves, un libro pequeño y una botella de medio litro — no un portátil, es para lo esencial. La correa se ajusta de 70 a 140 cm y se cambia sin herramientas.',
      en: 'CURRENT BAG holds 4 litres: phone, wallet, keys, a small book and a half-litre bottle fit — not a laptop, it is built for the essential. The strap adjusts from 70 to 140 cm and swaps without tools.',
    },
    cites: ['current-bag'],
  },
  {
    id: 'cap-breathability',
    keywords: {
      es: ['transpirable', 'transpira', 'ventilacion', 'sofoco', 'sudor', 'calor'],
      en: ['breathable', 'breathability', 'ventilation', 'sweat', 'hot', 'heat'],
    },
    answer: {
      es: 'La banda interior de NORTH CAP es tejido técnico absorbente, no algodón — gestiona el sudor en vez de empaparse, y el ripstop reciclado del exterior no retiene calor como un algodón grueso.',
      en: "NORTH CAP's inner band is a technical wicking fabric, not cotton — it manages sweat instead of soaking it up, and the recycled ripstop shell does not trap heat the way heavy cotton would.",
    },
    cites: ['north-cap'],
  },
  {
    id: 'bottle-thermal',
    keywords: {
      es: ['frio', 'caliente', 'horas', 'retiene', 'aislamiento', 'termo', 'vacio'],
      en: ['cold', 'hot', 'hours', 'retains', 'insulated', 'vacuum'],
    },
    answer: {
      es: 'ATLANTIC BOTTLE mantiene el frío 24 horas y el calor 12 — acero inoxidable de doble pared con vacío entre las paredes, no espuma. El calor se escapa más rápido que el frío en cualquier aislamiento al vacío, de ahí la diferencia.',
      en: 'ATLANTIC BOTTLE holds cold for 24 hours and hot for 12 — double-walled stainless steel with a vacuum between the walls, not foam. Heat escapes faster than cold through any vacuum insulation, which is the reason for the gap.',
    },
    cites: ['atlantic-bottle'],
  },
  {
    id: 'bottle-capacity',
    keywords: {
      es: ['capacidad', 'litros', 'ml', 'cuanto le cabe', 'medio litro'],
      en: ['capacity', 'ml', 'holds', 'volume', 'half litre', 'half liter'],
    },
    answer: {
      es: 'Medio litro exacto — 500 ml. Pesa 295 g vacía y la boca de 52 mm admite cubitos de hielo normales.',
      en: 'Exactly half a litre — 500 ml. It weighs 295 g empty, and the 52 mm mouth takes standard ice cubes.',
    },
    cites: ['atlantic-bottle'],
  },
];

/**
 * Overrides for the two sizing intents (`size-general`, `size-height`) on the
 * three products that have no clothing size at all — `SIZELESS_FORMS` in
 * `lib/commerce/demo/build-product.ts`.
 *
 * The keyword engine matches on the QUESTION, not the page it's asked from —
 * "what size should I choose?" scores against `size-general` regardless of
 * which product the shopper is looking at. Without this, asking it on
 * ATLANTIC BOTTLE returned the answer about the ATLANTIC 01's shoulders and
 * the TRADE PANT's waist tab, citing two products that were not the one being
 * asked about. `lib/assistant/engine.ts` swaps in the matching entry here,
 * keyed by `form` — a branch on the product's structural category, not on its
 * name or handle.
 */
export const SIZELESS_SIZE_OVERRIDE: Partial<Record<ProductForm, Localized<string>>> = {
  bag: {
    es: 'CURRENT BAG es de talla única — no usa tallas de ropa. Lo que importa aquí es la capacidad: 4 litros, 210 g, con la correa ajustable de 70 a 140 cm.',
    en: 'CURRENT BAG is one size — it does not use clothing sizing. What matters here is capacity: 4 litres, 210 g, with the strap adjustable from 70 to 140 cm.',
  },
  cap: {
    es: 'NORTH CAP es de talla única con cierre metálico ajustable en la parte trasera — no hay talla de ropa que elegir.',
    en: 'NORTH CAP is one size with an adjustable metal closure at the back — there is no clothing size to choose.',
  },
  bottle: {
    es: 'ATLANTIC BOTTLE es de talla única — el concepto de talla no aplica. Tiene 500 ml de capacidad y pesa 295 g vacía.',
    en: 'ATLANTIC BOTTLE is one size — sizing does not apply. It holds 500 ml and weighs 295 g empty.',
  },
};

/**
 * Overrides the generic `care` answer above (written for the ATLANTIC 01's
 * membrane) on every form that has no membrane to wash — same "branch on
 * structural category" pattern as `SIZELESS_SIZE_OVERRIDE`. `shell` is the
 * only form absent here: its `care` answer already is the correct one.
 */
export const CARE_FORM_OVERRIDE: Partial<Record<ProductForm, Localized<string>>> = {
  overshirt: {
    es: 'La TIDE 01 no lleva membrana — es sarga algodón-nylon. Lava a máquina a 30 °C con colores similares, sin lejía, y sécala en tendedero en vez de secadora; la secadora es lo que más la deforma.',
    en: 'The TIDE 01 has no membrane — it is a cotton-nylon twill. Machine wash at 30 °C with similar colours, no bleach, and line dry rather than tumble dry — the dryer is what warps it fastest.',
  },
  tee: {
    es: 'La VOLCANIC TEE es algodón orgánico peinado de 240 g/m². Lávala del revés a 30 °C, sin lejía; la secadora a baja temperatura no le afecta, y plancharla del revés conserva mejor el tinte.',
    en: 'The VOLCANIC TEE is 240 gsm combed organic cotton. Wash it inside out at 30 °C, no bleach; a low-heat tumble dry is fine, and ironing inside out keeps the dye looking newer for longer.',
  },
  knit: {
    es: 'El merino de BASALT KNIT va en programa lana a 30 °C, sin lejía, y se seca en horizontal a la sombra — colgarlo deforma los hombros. Plancha a temperatura media si hace falta.',
    en: "BASALT KNIT's merino goes on a wool cycle at 30 °C, no bleach, and dries flat in the shade — hanging it stretches the shoulders out of shape. Iron on medium if needed.",
  },
  pant: {
    es: 'TRADE PANT se lava del revés a 30 °C, sin lejía ni suavizante — el suavizante degrada el elastano, no una membrana. Sécalo al aire; una secadora a alta temperatura sí puede dañar la cinturilla elástica.',
    en: 'TRADE PANT washes inside out at 30 °C, no bleach or fabric softener — softener degrades the elastane, not a membrane. Air dry it; high-heat tumble drying can damage the elastic waistband.',
  },
  bag: {
    es: 'CURRENT BAG se limpia con un paño húmedo — no va a la lavadora. Seca el Cordura® por completo antes de guardarla; la hebilla de aluminio anodizado no necesita mantenimiento.',
    en: 'CURRENT BAG cleans with a damp cloth — it does not go in the washing machine. Dry the Cordura® fully before storing it; the anodised aluminium buckle needs no maintenance.',
  },
  cap: {
    es: 'NORTH CAP se lava a mano con agua fría — la lavadora deforma la visera. Sécala al aire sobre su forma, nunca en secadora, y reactiva el DWR con plancha tibia sin vapor si el agua deja de perlar.',
    en: 'NORTH CAP hand washes in cold water — a washing machine warps the brim. Air dry it on its shape, never in a dryer, and reactivate the DWR with a warm iron and no steam if water stops beading.',
  },
  bottle: {
    es: 'ATLANTIC BOTTLE se enjuaga por dentro después de cada uso y se lava a mano — no es apta para lavavajillas. Guárdala con el tapón abierto para que no coja olores, y revisa la junta de la tapa de vez en cuando: hay repuesto disponible.',
    en: 'ATLANTIC BOTTLE rinses inside after every use and hand washes — it is not dishwasher safe. Store it with the lid off so it does not pick up odours, and check the lid gasket occasionally: a spare is available.',
  },
};

/**
 * Prompt chips offered before the visitor types anything, keyed by the
 * product's structural `form` rather than its handle. A bag should never
 * suggest a clothing-size question and a bottle should never surface
 * membrane/DWR language — this table is what keeps that true without a
 * branch on product name anywhere in the component.
 */
export const ASSISTANT_SUGGESTIONS_BY_FORM: Record<ProductForm, Localized<string[]>> = {
  shell: {
    es: [
      '¿Es impermeable de verdad?',
      '¿Qué talla elijo si mido 182 cm?',
      '¿Debo pedir una talla más grande para llevar capas debajo?',
      '¿Cómo es el lavado de la membrana?',
    ],
    en: [
      'Is it actually waterproof?',
      'What size should I choose at 182 cm tall?',
      'Should I size up to fit layers underneath?',
      'How do I wash and care for the membrane?',
    ],
  },
  overshirt: {
    es: [
      '¿Qué talla elijo si mido 182 cm?',
      '¿Aguanta bien un día de 15 a 20 grados?',
      '¿La puedo llevar en un día de entretiempo bajo la ATLANTIC 01?',
      '¿Cómo es el lavado de la TIDE 01?',
    ],
    en: [
      'What size should I choose at 182 cm tall?',
      'Does it work for a 15 to 20 degree day?',
      'Can I wear it on a mild day layered under the ATLANTIC 01?',
      'How do I wash and care for the TIDE 01?',
    ],
  },
  tee: {
    es: [
      '¿Qué talla elijo si mido 182 cm?',
      '¿Debo pedir una talla más grande para un ajuste holgado?',
      '¿Qué gramaje tiene el tejido de algodón?',
      '¿Cómo es el lavado de la VOLCANIC TEE?',
    ],
    en: [
      'What size should I choose at 182 cm tall?',
      'Should I size up for a looser fit?',
      'How heavy is the cotton fabric?',
      'How do I wash and care for the VOLCANIC TEE?',
    ],
  },
  knit: {
    es: [
      '¿Qué talla elijo si mido 182 cm?',
      '¿Pica o irrita sobre la piel?',
      '¿Abriga en frío y transpira en calor?',
      '¿Cómo es el lavado del merino sin que encoja?',
    ],
    en: [
      'What size should I choose at 182 cm tall?',
      'Does it itch or feel scratchy on skin?',
      'Does it stay warm in the cold and breathe in the heat?',
      'How do I wash and care for the merino without shrinking it?',
    ],
  },
  pant: {
    es: [
      '¿Qué talla elijo si mido 182 cm?',
      '¿Hay margen de medida en la cintura entre tallas?',
      '¿De qué tejido es?',
      '¿Cómo es el lavado del TRADE PANT sin dañar el elastano?',
    ],
    en: [
      'What size should I choose at 182 cm tall?',
      'Is there waist room to fit between two sizes?',
      'What fabric is it made from?',
      'How do I wash and care for the TRADE PANT without damaging the elastane?',
    ],
  },
  bag: {
    es: [
      '¿Cuánta capacidad tiene la CURRENT BAG?',
      '¿Me caben el móvil y la cartera?',
      '¿Cuánto se puede ajustar la correa?',
      '¿Es resistente al agua si llueve?',
    ],
    en: [
      'How much capacity does the CURRENT BAG have?',
      'Will my phone and wallet fit inside?',
      'How much does the strap adjust?',
      'Is it water resistant if it rains?',
    ],
  },
  cap: {
    es: [
      '¿Qué talla o medida tiene la NORTH CAP?',
      '¿Se ajusta bien si tengo la cabeza grande?',
      '¿Transpira bien con calor?',
      '¿Cómo es el lavado o cuidado de la NORTH CAP?',
    ],
    en: [
      'What size or fit is the NORTH CAP?',
      'Will the size adjustment fit a larger head?',
      'Is it breathable in the heat?',
      'How do I wash and care for the NORTH CAP?',
    ],
  },
  bottle: {
    es: [
      '¿Cuántas horas mantiene el frío?',
      '¿Y cuántas horas se mantiene caliente?',
      '¿Cuál es su capacidad, medio litro?',
      '¿Cómo es el lavado por dentro?',
    ],
    en: [
      'How many hours does it stay cold?',
      'And how many hours does it stay hot?',
      'What is its capacity — half a litre?',
      'How do I wash and care for the inside?',
    ],
  },
};
