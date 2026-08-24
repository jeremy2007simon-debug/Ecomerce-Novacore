import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CollectionToolbar } from '@/components/commerce/collection-toolbar';
import { ProductCard } from '@/components/commerce/product-card';
import { Reveal, RevealGroup, RevealItem, RevealText } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Eyebrow } from '@/components/ui/eyebrow';
import { commerce } from '@/lib/commerce';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { routes } from '@/lib/utils/routes';
import { isLocale } from '@/types/i18n';
import type { ProductSort } from '@/types/commerce';

/**
 * THE COLLECTION.
 *
 * Filter and sort come from searchParams, so this page is dynamic on those —
 * but the underlying data is static and the render is cheap. Reading the params
 * on the server means a shared filtered URL renders correctly on first paint,
 * with no client-side flash of the unfiltered grid.
 */

const VALID_SORTS: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'rating', 'newest'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getServerDictionary(locale);

  return {
    title: t.collection.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}/collection`,
      languages: { 'es-ES': '/es/collection', en: '/en/collection' },
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

  const collectionParam = typeof query.collection === 'string' ? query.collection : 'all';
  const sortParam = typeof query.sort === 'string' ? query.sort : 'featured';
  const sort = VALID_SORTS.includes(sortParam as ProductSort)
    ? (sortParam as ProductSort)
    : 'featured';

  const [t, collections, result, activeCollection] = await Promise.all([
    getServerDictionary(locale),
    commerce.getCollections({ locale }),
    commerce.getProducts({ collection: collectionParam, sort, first: 50 }, { locale }),
    commerce.getCollection(collectionParam, { locale }),
  ]);

  const products = result.nodes;

  return (
    <main id="main" className="pt-28 lg:pt-36">
      <header className="editorial mb-12">
        <Reveal>
          <Eyebrow>{activeCollection?.handle ?? 'all'}</Eyebrow>
        </Reveal>

        <RevealText as="h1" driver="css" split="none" className="text-display mt-6 font-medium text-ink">
          {activeCollection?.title ?? t.collection.title}
        </RevealText>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p className="reading text-body text-ink-muted">
            {activeCollection?.description}
          </p>
        </div>
      </header>

      <div className="editorial">
        <CollectionToolbar
          collections={collections}
          copy={{
            sortLabel: t.collection.sortLabel,
            sort: t.collection.sort,
            filterAll: t.collection.filterAll,
            clearFilters: t.collection.clearFilters,
          }}
        />
      </div>

      {products.length === 0 ? (
        <div className="editorial">
          <EmptyState
            seed="collection-empty"
            eyebrow={t.collection.title}
            title={t.collection.emptyTitle}
            body={t.collection.emptyBody}
            action={
              <Button as={Link} href={routes.collection(locale)} variant="outline">
                {t.collection.emptyCta}
              </Button>
            }
          />
        </div>
      ) : (
        <RevealGroup className="editorial mt-14 grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-20">
          {products.map((product, i) => (
            <RevealItem key={product.handle}>
              <ProductCard
                product={product}
                locale={locale}
                index={i}
                // Only the first row is a plausible LCP candidate.
                priority={i < 2}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      <p className="editorial micro-label mt-16 text-ink-subtle" data-numeric>
        {t.collection.count.replace('{count}', String(products.length))}
      </p>
    </main>
  );
}
