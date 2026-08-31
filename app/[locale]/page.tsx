import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Hero } from '@/components/home/hero';
import { SceneOrigin } from '@/components/home/scene-origin';
import { SceneDrop } from '@/components/home/scene-drop';
import { CategoryDiscovery } from '@/components/home/category-discovery';
import { SceneMaterial } from '@/components/home/scene-material';
import { NewArrivalsRail } from '@/components/home/new-arrivals-rail';
import { MostWanted } from '@/components/home/most-wanted';
import { AtlanticEdit } from '@/components/home/atlantic-edit';
import { StoriesPreview } from '@/components/home/stories-preview';
import { FieldNotes } from '@/components/home/field-notes';
import { commerce } from '@/lib/commerce';
import { getClientDictionary, getServerDictionary } from '@/lib/i18n/get-dictionary';
import { DEMO_STORIES } from '@/lib/commerce/search-providers';
import { routes } from '@/lib/utils/routes';
import { isLocale } from '@/types/i18n';

/**
 * HOME.
 *
 * A Server Component with no 'use client' anywhere in the file — enforced by
 * ESLint. The scenes below are client shells wrapping server-rendered content,
 * so all of this copy, all of the product data and every SVG in the storytelling
 * sequence arrives as an RSC payload and costs zero client JavaScript.
 *
 * Three independent sort signals drive the three "curated" sections so they
 * never repeat the same products in the same order: `newest` (New Arrivals),
 * `featured` (Most Wanted — genuine editorial `featuredRank`, never a
 * fabricated bestseller claim), and Drop's own single hardcoded handle
 * (Atlantic 01, the flagship launch moment). Both rails filter Drop's own
 * product out so it never repeats seconds after appearing large above.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getServerDictionary(locale);

  return {
    title: t.meta.tagline,
    description: t.meta.description,
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, clientT, newArrivalsRaw, curatedRaw, dropProduct, cityProduct, movementProduct, accessoryProduct] =
    await Promise.all([
      getServerDictionary(locale),
      getClientDictionary(locale),
      commerce.getProducts({ collection: 'all', sort: 'newest', first: 7 }, { locale }),
      commerce.getProducts({ collection: 'all', sort: 'featured', first: 5 }, { locale }),
      commerce.getProduct('atlantic-01', { locale }),
      commerce.getProduct('volcanic-tee', { locale }),
      commerce.getProduct('trade-pant', { locale }),
      commerce.getProduct('current-bag', { locale }),
    ]);

  // Filtered so the Drop section's own product never repeats seconds later
  // in New Arrivals or Most Wanted.
  const newArrivals = newArrivalsRaw.nodes.filter((p) => p.handle !== dropProduct?.handle).slice(0, 6);
  const curatedProducts = curatedRaw.nodes.filter((p) => p.handle !== dropProduct?.handle).slice(0, 4);

  return (
    <main id="main">
      <Hero locale={locale} copy={t.home.hero} />
      <SceneOrigin copy={t.home.origin} />

      {dropProduct ? (
        <SceneDrop product={dropProduct} locale={locale} copy={t.home.drop} sizeGuideCopy={t.pages.sizeGuide} />
      ) : null}

      {dropProduct && accessoryProduct ? (
        <CategoryDiscovery
          apparelHref={routes.collection(locale)}
          apparelProduct={dropProduct}
          accessoriesHref={routes.collectionFiltered(locale, 'collection=accessories')}
          accessoriesProduct={accessoryProduct}
          copy={t.home.categoryDiscovery}
        />
      ) : null}

      <SceneMaterial copy={t.home.material} />

      <NewArrivalsRail products={newArrivals} locale={locale} copy={t.home.newArrivals} />

      <MostWanted curatedProducts={curatedProducts} locale={locale} copy={t.home.mostWanted} />

      {dropProduct && cityProduct && movementProduct ? (
        <AtlanticEdit
          editions={[
            {
              href: routes.collectionFiltered(locale, 'collection=outerwear'),
              product: dropProduct,
              title: t.home.atlanticEdit.coast.title,
              cta: t.home.atlanticEdit.coast.cta,
            },
            {
              href: routes.collectionFiltered(locale, 'collection=essentials'),
              product: cityProduct,
              title: t.home.atlanticEdit.city.title,
              cta: t.home.atlanticEdit.city.cta,
            },
            {
              href: routes.collectionFiltered(locale, 'collection=technical'),
              product: movementProduct,
              title: t.home.atlanticEdit.movement.title,
              cta: t.home.atlanticEdit.movement.cta,
            },
          ]}
          copy={{ index: t.home.atlanticEdit.index, label: t.home.atlanticEdit.label, title: t.home.atlanticEdit.title }}
        />
      ) : null}

      <StoriesPreview
        stories={DEMO_STORIES}
        locale={locale}
        copy={{ ...t.home.storiesPreview, soon: clientT.megaMenu.soon }}
      />

      <FieldNotes
        copy={t.home.fieldNotes}
        newsletterCopy={{
          placeholder: t.footer.newsletterPlaceholder,
          cta: t.footer.newsletterCta,
          demo: t.footer.newsletterDemo,
          infoLabel: t.footer.newsletterInfoLabel,
          loading: t.footer.newsletterLoading,
        }}
      />
    </main>
  );
}
