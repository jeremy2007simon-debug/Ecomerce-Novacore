import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Reveal, RevealText } from '@/components/motion';
import { AskAtlantic } from '@/components/product/ask-atlantic/ask-atlantic';
import { DetailsAccordion, SpecTable } from '@/components/product/details-accordion';
import { EditorialGallery } from '@/components/product/editorial-gallery';
import { FeatureProgression } from '@/components/product/feature-progression';
import { PurchasePanel } from '@/components/product/purchase-panel';
import { RelatedProducts } from '@/components/product/related-products';
import { ReviewList } from '@/components/product/reviews/review-list';
import { ReviewSummaryPanel } from '@/components/product/reviews/review-summary';
import { Stars } from '@/components/product/reviews/stars';
import { StickyBuyBar } from '@/components/commerce/sticky-buy-bar';
import { Price } from '@/components/commerce/price';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Rule } from '@/components/ui/rule';
import { MaterialMacro } from '@/components/visual/material-macro';
import { ProductVisual } from '@/components/visual/product-visual';
import { commerce } from '@/lib/commerce';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/json-ld';
import { routes } from '@/lib/utils/routes';
import { isLocale, LOCALES } from '@/types/i18n';

/**
 * PRODUCT PAGE.
 *
 * Not "image left, information right, buy button". The sequence is:
 *
 *   fullscreen product  →  progressive features (sticky)  →  editorial gallery
 *   →  material  →  details  →  reviews  →  recommendations  →  ask atlantic
 *
 * Only the purchase panel, the assistant and the review list are client
 * components. Everything else — including the entire feature scene's content —
 * is server-rendered and passes through the scroll primitives as children.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const handles = await commerce.getAllHandles();
  return LOCALES.flatMap((locale) => handles.map((handle) => ({ locale, handle })));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlantic-supply.demo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { locale, handle } = await params;
  if (!isLocale(locale)) return {};

  const product = await commerce.getProduct(handle, { locale });
  if (!product) return {};

  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: {
      canonical: `/${locale}/product/${handle}`,
      languages: {
        'es-ES': `/es/product/${handle}`,
        en: `/en/product/${handle}`,
      },
    },
    openGraph: {
      type: 'website',
      title: product.seo.title,
      description: product.seo.description,
      url: `/${locale}/product/${handle}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();

  const product = await commerce.getProduct(handle, { locale });
  if (!product) notFound();

  const [t, reviews, recommendations, catalogue] = await Promise.all([
    getServerDictionary(locale),
    commerce.getReviews(handle, { first: 12, sort: 'recent' }, { locale }),
    commerce.getRecommendations(handle, { intent: 'related', limit: 4 }, { locale }),
    commerce.getProducts({ collection: 'all', first: 50 }, { locale }),
  ]);

  const hero = product.media[0]!;
  const galleryMedia = product.media.slice(1);

  const detailSections = [
    { title: t.product.composition, body: product.metafields.composition },
    { title: t.product.care, items: product.metafields.care },
    { title: t.product.shipping, body: product.metafields.shipping },
    { title: t.product.returnsPolicy, body: product.metafields.returns },
  ];

  return (
    <main id="main">
      <script
        type="application/ld+json"
        // Structured data must be a script tag; this is the standard Next pattern.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, reviews.summary, locale, SITE_URL)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Atlantic Supply', url: `${SITE_URL}/${locale}` },
              { name: t.collection.title, url: `${SITE_URL}/${locale}/collection` },
              { name: product.title, url: `${SITE_URL}/${locale}/product/${handle}` },
            ]),
          ),
        }}
      />

      {/* ── OPENING: the product, large, with the essentials ─────────────── */}
      <section className="editorial grid gap-12 pt-28 lg:grid-cols-2 lg:gap-20 lg:pt-36">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductVisual media={hero} slot="hero" priority />
        </div>

        <div className="flex flex-col">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link href={routes.collection(locale)} className="micro-label text-ink-subtle hover:text-ink">
              {t.collection.title}
            </Link>
          </nav>

          <Eyebrow>{product.metafields.material}</Eyebrow>

          <RevealText as="h1" driver="css" split="none" className="text-display mt-6 font-medium text-ink">
            {product.title}
          </RevealText>

          <p className="mt-4 text-subtitle text-ink-muted">{product.subtitle}</p>

          <div className="mt-7 flex items-center gap-5">
            <Price value={product.priceRange.min} locale={locale} size="title" />
            <Link href="#reviews" className="flex items-center gap-2.5">
              <Stars value={product.rating.value} size={13} />
              <span className="micro-label text-ink-subtle" data-numeric>
                {product.rating.count}
              </span>
            </Link>
          </div>

          <p className="reading mt-8 text-body text-ink-muted">{product.description}</p>

          {/* The primary CTA. StickyBuyBar watches this id. */}
          <div id="buy" className="mt-12">
            <PurchasePanel product={product} locale={locale} />
          </div>
        </div>
      </section>

      {/* ── FEATURES: progressive reveal against a held product ──────────── */}
      <FeatureProgression
        media={hero}
        features={product.metafields.features}
        label={t.product.details}
      />

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <EditorialGallery media={galleryMedia} label={t.product.gallery} />

      {/* ── MATERIAL ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-clip border-y border-hairline py-[--spacing-section]">
        <MaterialMacro
          seed={`${product.handle}-macro`}
          className="absolute inset-0 -z-10 opacity-35"
        />
        <div className="editorial grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{t.product.material}</Eyebrow>
            <RevealText as="h2" className="text-headline mt-8 font-medium text-ink" split="none">
              {product.metafields.material}
            </RevealText>
            <p className="reading mt-8 text-body text-ink-muted">{product.metafields.story}</p>
          </div>
          <Reveal delay={0.1}>
            <SpecTable specs={product.metafields.specs} label={t.product.specifications} />
          </Reveal>
        </div>
      </section>

      {/* ── DETAILS ──────────────────────────────────────────────────────── */}
      <section className="editorial py-[--spacing-section]">
        <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <Eyebrow>{t.product.details}</Eyebrow>
            <h2 className="text-title mt-6 font-medium text-ink">{t.product.details}</h2>
          </div>
          <DetailsAccordion sections={detailSections} />
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section
        id="reviews"
        className="editorial border-t border-hairline py-[--spacing-section] [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
      >
        <Rule label={t.product.reviews} className="mb-14" />
        <ReviewSummaryPanel summary={reviews.summary} locale={locale} copy={t.reviews} />
        <div className="mt-20">
          <ReviewList reviews={reviews.nodes} copy={t.reviews} />
        </div>
      </section>

      {/* ── RECOMMENDATIONS ──────────────────────────────────────────────── */}
      <RelatedProducts recommendations={recommendations} locale={locale} copy={t.product} />

      {/* ── ASK ATLANTIC ─────────────────────────────────────────────────── */}
      <AskAtlantic
        product={product}
        catalogue={catalogue.nodes.map((item) => ({ handle: item.handle, title: item.title }))}
      />

      <StickyBuyBar product={product} locale={locale} watchId="buy" />
    </main>
  );
}
