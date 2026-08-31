import { resolveCollectionKey, type CollectionKey } from '@/lib/commerce/collection-config';
import type { ProductSort } from '@/types/commerce';

/**
 * The one parse/serialize/normalize implementation for collection filter
 * URL state — used by both the server page (`app/[locale]/collection/page.tsx`,
 * reading `searchParams`) and the client filter UI (via
 * `lib/hooks/use-collection-filters.ts`), so the two can never drift.
 *
 * No 'use client' here on purpose: these are pure functions over
 * `URLSearchParams`, safe to import from a Server Component.
 */

const VALID_SORTS: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'rating', 'newest'];

export interface CollectionQueryState {
  collection: CollectionKey;
  sort: ProductSort;
  size: string | null;
  color: string | null;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
}

export const EMPTY_COLLECTION_STATE: CollectionQueryState = {
  collection: 'all',
  sort: 'featured',
  size: null,
  color: null,
  priceMin: null,
  priceMax: null,
  inStock: false,
};

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function parseCollectionQueryState(params: URLSearchParams): CollectionQueryState {
  const sortParam = params.get('sort');
  const sort = VALID_SORTS.includes(sortParam as ProductSort) ? (sortParam as ProductSort) : 'featured';

  return {
    collection: resolveCollectionKey(params.get('collection') ?? undefined),
    sort,
    size: params.get('size') || null,
    color: params.get('color') || null,
    priceMin: parsePositiveInt(params.get('priceMin')),
    priceMax: parsePositiveInt(params.get('priceMax')),
    inStock: params.get('availability') === 'in-stock',
  };
}

/** Builds the canonical, minimal query string for a state — defaults are always omitted. */
export function serializeCollectionQueryState(state: CollectionQueryState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.collection !== 'all') params.set('collection', state.collection);
  if (state.sort !== 'featured') params.set('sort', state.sort);
  if (state.size) params.set('size', state.size);
  if (state.color) params.set('color', state.color);
  if (state.priceMin != null) params.set('priceMin', String(state.priceMin));
  if (state.priceMax != null) params.set('priceMax', String(state.priceMax));
  if (state.inStock) params.set('availability', 'in-stock');
  return params;
}

/** How many filters (excluding collection/sort, which have their own dedicated controls) are active. */
export function activeFilterCount(state: CollectionQueryState): number {
  let count = 0;
  if (state.size) count += 1;
  if (state.color) count += 1;
  if (state.priceMin != null || state.priceMax != null) count += 1;
  if (state.inStock) count += 1;
  return count;
}

/** Server-side helper: Next's searchParams prop isn't a URLSearchParams — normalize it into one. */
export function toURLSearchParams(query: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value);
  }
  return params;
}
