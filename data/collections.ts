import type { Localized } from '@/types/i18n';

export interface DemoCollection {
  handle: string;
  title: Localized<string>;
  description: Localized<string>;
  /** Ordering in navigation and on the collection toolbar. */
  order: number;
}

export const DEMO_COLLECTIONS: DemoCollection[] = [
  {
    handle: 'all',
    title: { es: 'La colección', en: 'The collection' },
    description: {
      es: 'Ocho piezas. Cada una existe porque resolvía algo que las anteriores no resolvían.',
      en: 'Eight pieces. Each one exists because it solved something the others did not.',
    },
    order: 0,
  },
  {
    handle: 'outerwear',
    title: { es: 'Capas exteriores', en: 'Outerwear' },
    description: {
      es: 'Lo que se pone encima cuando el Atlántico decide cambiar de opinión.',
      en: 'What goes on top when the Atlantic changes its mind.',
    },
    order: 1,
  },
  {
    handle: 'essentials',
    title: { es: 'Esenciales', en: 'Essentials' },
    description: {
      es: 'Las piezas que se llevan más veces y se piensan menos.',
      en: 'The pieces worn most often and thought about least.',
    },
    order: 2,
  },
  {
    handle: 'knitwear',
    title: { es: 'Punto', en: 'Knitwear' },
    description: {
      es: 'Merino extrafino, punto cerrado, sin concesiones de gramaje.',
      en: 'Extra-fine merino, tight knit, no compromise on weight.',
    },
    order: 3,
  },
  {
    handle: 'technical',
    title: { es: 'Técnico', en: 'Technical' },
    description: {
      es: 'Membranas, elastanos y acabados que hacen un trabajo medible.',
      en: 'Membranes, stretch and finishes that do a measurable job.',
    },
    order: 4,
  },
  {
    handle: 'accessories',
    title: { es: 'Accesorios', en: 'Accessories' },
    description: {
      es: 'Objetos dimensionados para lo esencial, no para lo posible.',
      en: 'Objects sized for the essential, not for the possible.',
    },
    order: 5,
  },
];
