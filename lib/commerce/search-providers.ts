import { DEMO_STORIES, type DemoStory } from '@/data/stories';
import { trendingStrategy } from '@/lib/commerce/recommendations';
import type { Collection, Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Search sources beyond products — collections and stories.
 *
 * Neither goes through CommerceRepository. Collections are already fully
 * fetched and passed to the client for other reasons (the mega-menu, the
 * footer); a live round trip through the repository layer for 6 static items
 * would be pure overhead. Stories are hand-authored demo content with no
 * repository or domain type at all (see data/stories.ts) — this file is
 * exempt from the `no-restricted-imports` @/data ban because it lives under
 * lib/commerce/**, same as lib/commerce/demo/*.
 *
 * Product search stays exactly where it is — lib/commerce/search.ts's
 * `searchIndex`/`scoreProduct` are not duplicated here, just re-exported for
 * a single import site in the search overlay.
 */

export { scoreProduct, searchIndex, type SearchHit } from '@/lib/commerce/search';

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export interface CollectionSearchHit {
  collection: Collection;
}

/**
 * A small, deterministic substring match — not lib/commerce/search.ts's
 * weighted token scoring, which exists for a much larger, richer product
 * index. Six collections with a title and description each do not need it;
 * duplicating that scoring machinery here for a dataset this size would cost
 * more in surface area than it would ever return in relevance.
 */
export function searchCollections(
  collections: Collection[],
  query: string,
  limit = 3,
): CollectionSearchHit[] {
  const q = normalise(query);
  if (q.length === 0) return [];

  return collections
    .filter((c) => normalise(c.title).includes(q) || normalise(c.handle).includes(q))
    .slice(0, limit)
    .map((collection) => ({ collection }));
}

export interface StorySearchHit {
  story: DemoStory;
}

export function searchStories(query: string, locale: Locale, limit = 3): StorySearchHit[] {
  const q = normalise(query);
  if (q.length === 0) return [];

  return DEMO_STORIES.filter(
    (story) => normalise(story.title[locale]).includes(q) || normalise(story.excerpt[locale]).includes(q),
  )
    .slice(0, limit)
    .map((story) => ({ story }));
}

/** Centralised demo query suggestions — chosen because each is a real query that returns real results. */
export const POPULAR_SEARCHES: Record<Locale, string[]> = {
  es: ['chaqueta', 'merino', 'impermeable', 'accesorios', 'atlantic 01'],
  en: ['shell', 'merino', 'waterproof', 'accessories', 'atlantic 01'],
};

/**
 * Reuses recommendations.ts's own trending formula rather than a second
 * implementation. `trendingStrategy.score` ignores its `seed` argument
 * entirely, so passing the candidate as its own (unused) seed is safe.
 */
export function topTrending(products: Product[], limit = 4): Product[] {
  return [...products]
    .map((product) => ({ product, score: trendingStrategy.score(product, product).score }))
    .sort((a, b) => b.score - a.score || a.product.handle.localeCompare(b.product.handle))
    .slice(0, limit)
    .map((entry) => entry.product);
}
