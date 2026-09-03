import type { Locale } from '@/types/i18n';

/**
 * PRODUCT STORY / DETAIL HOTSPOTS — editorial data, additive to commerce.
 *
 * Never duplicates `product.metafields.story`/`.specs`/`.pairsWith` (those
 * stay the single source for narrative body, technical specs and
 * cross-sell) — this file only adds what genuinely does not exist yet: a
 * short editorial headline, and, for products with real detail/macro
 * photography, numbered hotspots over a real photograph.
 *
 * Only `atlantic-01` — the flagship — has an entry. The other seven fall
 * back to `product.title` for their Product Story headline, a real degrade
 * rather than a broken section (see `components/product/product-story.tsx`).
 *
 * `hotspots` stays unset everywhere: none of the 8 products has a
 * macro/detail photograph, only one studio shot of its default colourway —
 * numbered callouts over generated art would misrepresent it as documented
 * product detail. `ProductHotspots` is fully built (see
 * components/product/product-hotspots.tsx) and ready the day real detail
 * photography exists; it is simply never given data to render today.
 */

export interface ProductHotspot {
  id: string;
  /** Percent position within the image, 0-100. */
  x: number;
  y: number;
  label: Record<Locale, string>;
}

export interface ProductEditorial {
  headline: Record<Locale, string>;
  hotspots?: ProductHotspot[];
}

export const PRODUCT_EDITORIAL: Partial<Record<string, ProductEditorial>> = {
  'atlantic-01': {
    headline: {
      es: 'La chaqueta que empezó todo',
      en: 'The jacket that started it',
    },
  },
};
