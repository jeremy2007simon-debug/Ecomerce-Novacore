import type { Localized } from '@/types/i18n';

/**
 * DEMO DATA — Atlantic Stories.
 *
 * There is no Stories content system yet (/stories, /story/[slug] — those are
 * a later phase). These three exist only so Search V2 has something honest to
 * show under a STORIES section; every entry currently resolves to the one
 * real story route (/story) rather than a page of its own — see
 * lib/commerce/search-providers.ts.
 */

export interface DemoStory {
  id: string;
  title: Localized<string>;
  excerpt: Localized<string>;
}

export const DEMO_STORIES: DemoStory[] = [
  {
    id: 'material-001',
    title: { es: 'MATERIAL / 001', en: 'MATERIAL / 001' },
    excerpt: {
      es: 'La membrana, el DWR, las cifras detrás de columna de agua 20.000mm.',
      en: 'The membrane, the DWR, the numbers behind Water column 20,000mm.',
    },
  },
  {
    id: 'volcanic-island',
    title: { es: 'THE VOLCANIC ISLAND', en: 'THE VOLCANIC ISLAND' },
    excerpt: {
      es: 'Cuatro climas a una hora en coche — por qué Tenerife es el encargo.',
      en: "Four climates within an hour's drive — why Tenerife is the brief.",
    },
  },
  {
    id: 'designing-atlantic-01',
    title: { es: 'DESIGNING ATLANTIC 01', en: 'DESIGNING ATLANTIC 01' },
    excerpt: {
      es: 'Tres prototipos. Uno se queda.',
      en: 'Three prototypes. One kept.',
    },
  },
];
