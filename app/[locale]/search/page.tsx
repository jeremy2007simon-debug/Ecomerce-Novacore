import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/commerce/product-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Eyebrow } from '@/components/ui/eyebrow';
import { commerce } from '@/lib/commerce';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { routes } from '@/lib/utils/routes';
import { isLocale } from '@/types/i18n';

/**
 * Server-rendered search results.
 *
 * The overlay is the primary path, but this exists and matters:
 *   • a shared or bookmarked ?q= URL renders real results
 *   • crawlers and assistive tech get a plain, navigable page
 *   • it works with JavaScript disabled
 *
 * `noindex` because thin, parameterised result pages are exactly what search
 * engines penalise — the page is for people and for robots following links,
 * not for the index.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getServerDictionary(locale);

  return { title: t.search.title, robots: { index: false, follow: true } };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const term = typeof query.q === 'string' ? query.q : '';
  const [t, results] = await Promise.all([
    getServerDictionary(locale),
    term.trim() ? commerce.searchProducts(term, { locale }) : Promise.resolve([]),
  ]);

  return (
    <main id="main" className="editorial pb-(--spacing-section) pt-28 lg:pt-36">
      <Eyebrow>{t.search.title}</Eyebrow>

      <h1 className="text-headline mt-6 font-medium text-ink">
        {term ? t.search.resultsFor.replace('{query}', term) : t.search.title}
      </h1>

      {/* A real GET form, so this page works with no JavaScript at all. */}
      <form action={`/${locale}/search`} method="get" className="mt-10 flex items-center gap-4 border-b border-hairline-strong pb-4">
        <label htmlFor="q" className="sr-only">
          {t.search.placeholder}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={term}
          placeholder={t.search.placeholder}
          className="w-full bg-transparent text-subtitle text-ink outline-none placeholder:text-ink-subtle"
        />
        <button type="submit" className="label shrink-0 text-ember">
          {t.search.title}
        </button>
      </form>

      {term && results.length === 0 ? (
        <EmptyState
          seed="search-empty"
          eyebrow={t.search.title}
          title={t.search.noResultsTitle}
          body={t.search.noResultsBody}
          action={
            <Button as={Link} href={routes.collection(locale)} variant="outline">
              {t.collection.emptyCta}
            </Button>
          }
        />
      ) : null}

      {results.length > 0 ? (
        <>
          <p className="micro-label mt-10 text-ink-subtle" data-numeric>
            {t.search.resultCount.replace('{count}', String(results.length))}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {results.map((product, i) => (
              <ProductCard key={product.handle} product={product} locale={locale} index={i} />
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
