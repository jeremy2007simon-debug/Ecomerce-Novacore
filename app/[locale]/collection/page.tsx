import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CollectionHero } from '@/components/collection/collection-hero';
import { FilterDrawer, type FilterOption } from '@/components/collection/filter-drawer';
import { ActiveFilterChips } from '@/components/collection/active-filter-chips';
import { SortControl } from '@/components/collection/sort-control';
import { GridDensityControl } from '@/components/collection/grid-density-control';
import { ProductGrid } from '@/components/collection/product-grid';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { commerce } from '@/lib/commerce';
import {
  COLLECTION_CONFIG,
  collectionConfigFor,
  collectionHref,
  productQueryForCollection,
  resolveCollectionKey,
  type CollectionKey,
} from '@/lib/commerce/collection-config';
import { getClientDictionary, getServerDictionary } from '@/lib/i18n/get-dictionary';
import { buildProductCardCopy } from '@/lib/i18n/product-card-copy';
import {
  activeFilterCount,
  parseCollectionQueryState,
  toURLSearchParams,
} from '@/lib/utils/collection-url-state';
import { sortSizeValues } from '@/lib/utils/size-order';
import { cn } from '@/lib/utils/cn';
import { isLocale, type Locale } from '@/types/i18n';
import type { Product } from '@/types/commerce';

/**
 * THE COLLECTION.
 *
 * Filter/sort/collection state comes from `searchParams` and is parsed once
 * via the shared `parseCollectionQueryState` (the same function the client
 * filter UI uses) — the server render and the client hook can never disagree
 * about what a URL means. `collection-config.ts` resolves the `?collection=`
 * value to either a real provider collection query or (for `apparel`, which
 * has no matching handle) the `category` grouping — see that file.
 */

function editorialLabel(t: Awaited<ReturnType<typeof getServerDictionary>>, key: CollectionKey) {
  if (key === 'all') return t.collection.title;
  if (key in t.collections) return t.collections[key as keyof typeof t.collections];
  return { eyebrow: t.collection.title, title: t.collection.title, tagline: '' };
}

async function resolveCollection(key: CollectionKey, locale: Locale, t: Awaited<ReturnType<typeof getServerDictionary>>) {
  const config = collectionConfigFor(key);

  if (key === 'all') {
    return { eyebrow: undefined, title: t.collection.title, tagline: undefined, description: undefined, media: null };
  }

  const editorial = editorialLabel(t, key);
  const isEditorialShape = typeof editorial === 'object' && 'eyebrow' in editorial;
  const eyebrow = isEditorialShape ? editorial.eyebrow : t.collection.title;
  const tagline = isEditorialShape ? editorial.tagline : undefined;
  const fallbackTitle = isEditorialShape ? editorial.title : t.collection.title;

  if (!config.providerHandle) {
    // Synthetic grouping (apparel) — no real Collection object exists.
    return { eyebrow, title: fallbackTitle, tagline, description: undefined, media: null };
  }

  const real = await commerce.getCollection(config.providerHandle, { locale });
  return {
    eyebrow,
    title: real?.title ?? fallbackTitle,
    tagline,
    description: real?.description,
    media: real?.heroMedia ?? null,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) return {};

  const t = await getServerDictionary(locale);
  const key = resolveCollectionKey(typeof query.collection === 'string' ? query.collection : undefined);
  const resolved = await resolveCollection(key, locale, t);
  const canonicalQuery = key === 'all' ? '' : `?collection=${key}`;

  return {
    title: resolved.title,
    description: resolved.description ?? resolved.tagline ?? t.meta.description,
    alternates: {
      canonical: `/${locale}/collection${canonicalQuery}`,
      languages: { 'es-ES': `/es/collection${canonicalQuery}`, en: `/en/collection${canonicalQuery}` },
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const state = parseCollectionQueryState(toURLSearchParams(query));
  const collectionQuery = productQueryForCollection(state.collection);

  const [t, clientT, collections, result, scopedResult] = await Promise.all([
    getServerDictionary(locale),
    getClientDictionary(locale),
    commerce.getCollections({ locale }),
    commerce.getProducts(
      {
        ...collectionQuery,
        sort: state.sort,
        colorway: state.color ?? undefined,
        size: state.size ?? undefined,
        priceMin: state.priceMin ?? undefined,
        priceMax: state.priceMax ?? undefined,
        availability: state.inStock ? 'in-stock' : undefined,
        first: 50,
      },
      { locale },
    ),
    // Scoped to the same collection/category, but never faceted — this is
    // what the filter drawer builds its option lists and live preview count
    // from, so switching one facet never hides the others' remaining values.
    commerce.getProducts({ ...collectionQuery, first: 50 }, { locale }),
  ]);

  const resolved = await resolveCollection(state.collection, locale, t);
  const products = result.nodes;
  const scopedProducts = scopedResult.nodes;
  const productCardCopy = buildProductCardCopy(t, clientT);
  const filterCount = activeFilterCount(state);

  const { sizeOptions, colorOptions } = buildFilterOptions(scopedProducts);

  return (
    <main id="main" className="pt-28 lg:pt-36">
      <CollectionHero
        eyebrow={resolved.eyebrow}
        title={resolved.title}
        tagline={resolved.tagline}
        description={resolved.description}
        productCountLabel={t.collection.count.replace('{count}', String(products.length))}
        media={resolved.media}
      />

      <div className="editorial">
        <nav aria-label={t.collection.filterAll} className="min-w-0 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center gap-6 whitespace-nowrap">
            {COLLECTION_CONFIG.map((entry) => {
              const active = state.collection === entry.key;
              const label =
                entry.key === 'all'
                  ? t.collection.filterAll
                  : entry.key in t.collections
                    ? t.collections[entry.key as keyof typeof t.collections].eyebrow
                    : (collections.find((c) => c.handle === entry.providerHandle)?.title ?? entry.key);
              return (
                <li key={entry.key}>
                  <Link
                    href={collectionHref(locale, entry.key)}
                    aria-current={active ? 'page' : undefined}
                    className={cn('label transition-colors', active ? 'text-ink' : 'text-ink-subtle hover:text-ink-muted')}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-4 border-y border-hairline py-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="micro-label text-ink-subtle" data-numeric>
            {t.collection.count.replace('{count}', String(products.length))}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <FilterDrawer
              scopedProducts={scopedProducts}
              sizeOptions={sizeOptions}
              colorOptions={colorOptions}
              copy={{
                filter: t.collection.filter,
                close: t.collection.close,
                size: t.collection.filterSize,
                color: t.collection.filterColor,
                price: t.collection.filterPrice,
                priceMinPlaceholder: t.collection.priceMinPlaceholder,
                priceMaxPlaceholder: t.collection.priceMaxPlaceholder,
                inStock: t.product.inStock,
                clearAll: t.collection.clearFilters,
                showProducts: t.collection.showProducts,
              }}
            />

            <SortControl label={t.collection.sortLabel} options={t.collection.sort} />

            <GridDensityControl ariaLabelTemplate={t.collection.viewLabel} />
          </div>
        </div>

        <ActiveFilterChips
          sizeOptions={sizeOptions}
          colorOptions={colorOptions}
          copy={{
            size: t.collection.filterSize,
            color: t.collection.filterColor,
            price: t.collection.filterPrice,
            inStock: t.product.inStock,
            clearAll: t.collection.clearFilters,
          }}
        />
      </div>

      {products.length === 0 ? (
        <div className="editorial">
          {filterCount > 0 ? (
            <EmptyState
              seed="collection-empty"
              eyebrow={resolved.title}
              title={t.collection.emptyTitle}
              body={t.collection.emptyBody}
              action={
                <Button as={Link} href={collectionHref(locale, state.collection)} variant="outline">
                  {t.collection.emptyCta}
                </Button>
              }
            />
          ) : (
            <EmptyState
              seed="collection-empty-real"
              eyebrow={resolved.title}
              title={t.collection.emptyCollectionTitle}
              body={t.collection.emptyCollectionBody}
              action={
                <Button as={Link} href={collectionHref(locale, 'all')} variant="outline">
                  {t.collection.emptyCta}
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="editorial mt-10">
          <ProductGrid products={products} locale={locale} productCardCopy={productCardCopy} />
        </div>
      )}
    </main>
  );
}

function buildFilterOptions(products: Product[]): { sizeOptions: FilterOption[]; colorOptions: FilterOption[] } {
  const colorMap = new Map<string, FilterOption>();
  const sizeLabelByValue = new Map<string, string>();

  for (const product of products) {
    const colorOption = product.options.find((option) => option.name === 'color');
    for (const value of colorOption?.values ?? []) {
      if (!colorMap.has(value.value)) {
        colorMap.set(value.value, { value: value.value, label: value.label, swatchHex: value.swatchHex });
      }
    }

    const sizeOption = product.options.find((option) => option.name === 'size');
    for (const value of sizeOption?.values ?? []) {
      sizeLabelByValue.set(value.value, value.label);
    }
  }

  const sizeOptions = sortSizeValues([...sizeLabelByValue.keys()]).map((value) => ({
    value,
    label: sizeLabelByValue.get(value)!,
  }));

  return { sizeOptions, colorOptions: [...colorMap.values()] };
}
