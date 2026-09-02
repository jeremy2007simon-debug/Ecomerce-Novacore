import type { Route } from 'next';
import { routes } from '@/lib/utils/routes';
import type { ProductQuery } from '@/lib/commerce/repository';
import type { Locale } from '@/types/i18n';

/**
 * The single source of truth for every `?collection=` value the app can
 * link to or resolve.
 *
 * Six entries are real provider collections (`providerHandle` is the exact
 * Shopify/demo collection handle to query). `apparel` is NOT a real
 * collection — no single handle covers all five apparel forms
 * (shell/overshirt/tee/knit/pant) — so it resolves to `ProductQuery.category`
 * instead (a real, structural grouping of `Product.form`, see
 * product-form-groups.ts), and `commerce.getCollection('apparel', ...)` must
 * never be called for it.
 *
 * Every caller that used to hand-write a `collection=<handle>` query string
 * (footer, home, search overlay, mega-menu, the collection toolbar's own tab
 * list) imports hrefs from here instead — see Phase 4 plan, decision 3.
 * Editorial copy (eyebrow/tagline) is NOT here — it lives in the i18n
 * dictionaries under `server.collections.<key>`, keyed by the same
 * `CollectionKey`, so nothing here duplicates translated strings.
 */

export type CollectionKey =
  | 'all'
  | 'apparel'
  | 'outerwear'
  | 'essentials'
  | 'knitwear'
  | 'technical'
  | 'accessories';

interface RealCollectionEntry {
  key: Exclude<CollectionKey, 'apparel'>;
  providerHandle: string;
  category?: undefined;
}

interface CategoryCollectionEntry {
  key: 'apparel';
  providerHandle: null;
  category: 'apparel';
}

export type CollectionConfigEntry = RealCollectionEntry | CategoryCollectionEntry;

/** Declaration order is display order — used by the collection toolbar's tabs. */
export const COLLECTION_CONFIG: CollectionConfigEntry[] = [
  { key: 'all', providerHandle: 'all' },
  { key: 'apparel', providerHandle: null, category: 'apparel' },
  { key: 'outerwear', providerHandle: 'outerwear' },
  { key: 'essentials', providerHandle: 'essentials' },
  { key: 'knitwear', providerHandle: 'knitwear' },
  { key: 'technical', providerHandle: 'technical' },
  { key: 'accessories', providerHandle: 'accessories' },
];

const KEY_SET = new Set<string>(COLLECTION_CONFIG.map((c) => c.key));

export function isCollectionKey(value: string | undefined): value is CollectionKey {
  return value !== undefined && KEY_SET.has(value);
}

export function resolveCollectionKey(value: string | undefined): CollectionKey {
  return isCollectionKey(value) ? value : 'all';
}

export function collectionConfigFor(key: CollectionKey): CollectionConfigEntry {
  return COLLECTION_CONFIG.find((c) => c.key === key) ?? COLLECTION_CONFIG[0]!;
}

/** The `collection`/`category` portion of a ProductQuery for this key — merge with sort/size/etc. */
export function productQueryForCollection(key: CollectionKey): Pick<ProductQuery, 'collection' | 'category'> {
  const entry = collectionConfigFor(key);
  return entry.category ? { category: entry.category } : { collection: entry.providerHandle };
}

export function collectionHref(locale: Locale, key: CollectionKey): Route {
  if (key === 'all') return routes.collection(locale);
  return routes.collectionFiltered(locale, `collection=${key}`);
}
