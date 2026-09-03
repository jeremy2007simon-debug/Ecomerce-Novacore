import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { RevealText } from '@/components/motion';
import { AskAtlantic } from '@/components/product/ask-atlantic/ask-atlantic';
import { CompleteTheSystem } from '@/components/product/complete-the-system';
import { DetailsAccordion } from '@/components/product/details-accordion';
import { FeatureProgression } from '@/components/product/feature-progression';
import { ProductGallery, type ProductGalleryCopy } from '@/components/product/product-gallery';
import { ProductStory } from '@/components/product/product-story';
import { PurchasePanel } from '@/components/product/purchase-panel';
import { RelatedProducts } from '@/components/product/related-products';
import { ReviewList } from '@/components/product/reviews/review-list';
import { ReviewSummaryPanel } from '@/components/product/reviews/review-summary';
import { Stars } from '@/components/product/reviews/stars';
import { TechnicalSpecSection } from '@/components/product/technical-spec-section';
import { StickyBuyBar } from '@/components/commerce/sticky-buy-bar';
import { Price } from '@/components/commerce/price';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Rule } from '@/components/ui/rule';
import { MaterialMacro } from '@/components/visual/material-macro';
import { commerce } from '@/lib/commerce';
import { getDefaultColor } from '@/lib/commerce/product-gallery';
import { getClientDictionary, getServerDictionary } from '@/lib/i18n/get-dictionary';
import { buildProductCardCopy } from '@/lib/i18n/product-card-copy';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/json-ld';
import { routes } from '@/lib/utils/routes';
import { isLocale, LOCALES } from '@/types/i18n';
import type { Product } from '@/types/commerce';

/**
 * PRODUCT PAGE.
 *
 * fullscreen gallery + commerce panel  →  progressive features (sticky)
 * →  material  →  technical specification  →  product story  →  details
 * →  reviews  →  complete the system  →  recommendations  →  ask atlantic
 *
 * Only the gallery, the purchase panel, the assistant and the review list are
 * client components. Everything else — including the entire feature scene's
 * content — is server-rendered and passes through the scroll primitives as
 * children.
 */

/*
  `true`, so an unknown handle reaches the `notFound()` call below.

  With `false`, Next rejected the unmatched param before this file ever ran —
  which meant the branded 404 never rendered for a bad product URL either; the
  visitor got the framework's built-in error page. The sixteen real product
  pages are still prerendered exactly as before (`generateStaticParams`); only
  a handle that does not exist now renders on demand, purely so it can 404
  properly.
*/
export const dynamicParams = true;

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
      // No `?color=` in the canonical — a colour pick is a display
      // preference within one product, not a distinct piece of content;
      // including it would read as duplicate-content variants to a crawler.
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

  const [t, clientT, reviews, recommendations, catalogue] = await Promise.all([
    getServerDictionary(locale),
    getClientDictionary(locale),
    commerce.getReviews(handle, { first: 12, sort: 'recent' }, { locale }),
    commerce.getRecommendations(handle, { intent: 'related', limit: 4 }, { locale }),
    commerce.getProducts({ collection: 'all', first: 50 }, { locale }),
  ]);
  const productCardCopy = buildProductCardCopy(t, clientT);

  const hero = product.media[0]!;

  // The default colour's variant, for the header price — fixes a real bug:
  // `basalt-knit` has a genuine `compareAtPrice` that never showed on its own
  // page because this line always read `priceRange.min`, which carries no
  // compareAt. This is deliberately NOT `?color=`-aware (see PurchasePanel's
  // doc comment on why that restore is client-side only) — price does not
  // vary by size in this catalogue, so the default colour's variant is
  // already correct for every load, before any client-side colour restore.
  const initialVariant =
    product.variants.find((variant) =>
      variant.selectedOptions.some(
        (option) => option.name === 'color' && option.value === getDefaultColor(product),
      ),
    ) ?? product.variants[0];

  const detailSections = [
    { title: t.product.composition, body: product.metafields.composition },
    { title: t.product.care, items: product.metafields.care },
    {
      title: t.product.features,
      items: product.metafields.features.map((feature) => `${feature.label} — ${feature.detail}`),
    },
    { title: t.product.shipping, body: product.metafields.shipping },
    { title: t.product.returnsPolicy, body: product.metafields.returns },
  ];

  const galleryCopy: ProductGalleryCopy = {
    label: clientT.gallery.label,
    counter: clientT.gallery.counter,
    previous: clientT.gallery.previous,
    next: clientT.gallery.next,
    close: clientT.common.close,
  };

  // Real, curated cross-sell (`metafields.pairsWith`), resolved against the
  // catalogue already fetched for Ask Atlantic below — no extra request.
  // Recommendations is filtered against the same set so the two sections
  // never show the same product twice on one page.
  const completeTheSystemProducts = product.metafields.pairsWith
    .map((pairHandle) => catalogue.nodes.find((candidate) => candidate.handle === pairHandle))
    .filter((candidate): candidate is Product => Boolean(candidate));
  const completeTheSystemHandles = new Set(completeTheSystemProducts.map((candidate) => candidate.handle));
  const dedupedRecommendations = recommendations.filter(
    (entry) => !completeTheSystemHandles.has(entry.product.handle),
  );

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
      <section className="editorial grid gap-12 pt-28 pb-(--spacing-section) lg:grid-cols-2 lg:gap-20 lg:pt-36">
        {/*
          `top-[calc(var(--header-height)+1.5rem)]` matches the header plus a
          little air, and agrees with the 5rem `scroll-padding-top` in
          globals.css. Both columns are sticky now, not just the gallery: the
          gallery can run taller than one screen (main frame plus a grid of
          supporting frames), and pinning the purchase panel too keeps it
          reachable without scrolling back up while the gallery scrolls past.
        */}
        {/*
          `min-w-0`: without it, this grid item's width defaults to its
          content's min-content size — and the mobile gallery strip's
          `overflow-x-auto` track does not shrink that min-content the way it
          visually clips the box, so the column (and the page) rendered
          ~1148px wide on a 390px viewport before this was added.
        */}
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <ProductGallery product={product} copy={galleryCopy} />
        </div>

        {/*
          `@container` makes this column a container-query context so the
          headline below can be sized against the COLUMN rather than the
          viewport. See the h1 for why that is necessary.
        */}
        <div className="@container flex flex-col lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link href={routes.collection(locale)} className="micro-label text-ink-subtle hover:text-ink">
              {t.collection.title}
            </Link>
          </nav>

          <Eyebrow>{product.metafields.material}</Eyebrow>

          {/*
            Sized in `cqi` (percent of the CONTAINER's inline size), not `vw`.

            `--text-display` is `clamp(2.5rem, 10.5vw, 8.5rem)`, which is right
            for a full-bleed headline but wrong here: this h1 lives in half a
            grid track, so the viewport-driven size overflowed the column by
            62–68px at every desktop width (measured 1024/1150/1280/1440) and
            `overflow-x: clip` on body swallowed it silently — the "cut off"
            text. Container units track the column, so it fits by construction
            at any width. The clamp bounds keep it identical on mobile, where
            the column is already the full width.
          */}
          <RevealText
            as="h1"
            driver="css"
            split="none"
            className="mt-6 text-[clamp(2.5rem,17cqi,8.5rem)] font-medium leading-[0.9] tracking-[-0.04em] text-ink"
          >
            {product.title}
          </RevealText>

          <p className="mt-4 text-subtitle text-ink-muted">{product.subtitle}</p>

          <div className="mt-7 flex items-center gap-5">
            <Price
              value={initialVariant?.price ?? product.priceRange.min}
              compareAt={initialVariant?.compareAtPrice}
              locale={locale}
              size="title"
            />
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
            <PurchasePanel product={product} locale={locale} sizeGuideCopy={t.pages.sizeGuide} />
          </div>
        </div>
      </section>

      {/* ── FEATURES: progressive reveal against a held product ──────────── */}
      <FeatureProgression
        media={hero}
        features={product.metafields.features}
        label={t.product.details}
      />

      {/* ── MATERIAL: a short chapter beat naming what it's made of ───────── */}
      <section className="relative isolate overflow-clip border-y border-hairline py-(--spacing-section)">
        <MaterialMacro
          seed={`${product.handle}-macro`}
          className="absolute inset-0 -z-10 opacity-35"
        />
        <div className="editorial">
          <Eyebrow>{t.product.material}</Eyebrow>
          <RevealText as="h2" className="text-headline mt-8 font-medium text-ink" split="none">
            {product.metafields.material}
          </RevealText>
        </div>
      </section>

      {/* ── TECHNICAL SPECIFICATION ─────────────────────────────────────── */}
      <TechnicalSpecSection specs={product.metafields.specs} copy={t.product.technicalSpec} />

      {/* ── PRODUCT STORY ────────────────────────────────────────────────── */}
      <ProductStory
        handle={product.handle}
        title={product.title}
        story={product.metafields.story}
        locale={locale}
        copy={{ eyebrow: t.product.story }}
      />

      {/* ── DETAILS ──────────────────────────────────────────────────────── */}
      <section className="editorial py-(--spacing-section)">
        <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <Eyebrow>{t.product.details}</Eyebrow>
            <h2 className="text-title mt-6 font-medium text-ink">{t.product.details}</h2>
          </div>
          <DetailsAccordion sections={detailSections} />
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      {/*
        No `content-visibility: auto` here, unlike the other heavy sections.

        This section is a fragment-navigation TARGET — the rating link beside
        the price points at `#reviews`. With its subtree skipped the browser
        scrolls to the `contain-intrinsic-size` placeholder and only then lays
        the real content out, so the jump landed a few hundred pixels off and
        the page lurched underneath the reader. A target you can navigate to
        has to be laid out.
      */}
      <section id="reviews" className="editorial border-t border-hairline py-(--spacing-section)">
        <Rule label={t.product.reviews} className="mb-14" />
        {/*
          The fit meter only makes sense where "size" is a concept — derived
          from whether this product exposes a size option at all, which is
          already the exact line the rest of the page draws between apparel
          and accessories. See ReviewSummaryPanel for why.
        */}
        <ReviewSummaryPanel
          summary={reviews.summary}
          locale={locale}
          copy={t.reviews}
          showFit={product.options.some((option) => option.name === 'size')}
        />
        <div className="mt-20">
          <ReviewList reviews={reviews.nodes} copy={t.reviews} />
        </div>
      </section>

      {/* ── COMPLETE THE SYSTEM ─────────────────────────────────────────── */}
      <CompleteTheSystem products={completeTheSystemProducts} locale={locale} copy={t.product.completeTheSystem} />

      {/* ── RECOMMENDATIONS ──────────────────────────────────────────────── */}
      <RelatedProducts
        recommendations={dedupedRecommendations}
        locale={locale}
        copy={t.product}
        productCardCopy={productCardCopy}
      />

      {/* ── ASK ATLANTIC ─────────────────────────────────────────────────── */}
      <AskAtlantic
        product={product}
        catalogue={catalogue.nodes.map((item) => ({ handle: item.handle, title: item.title }))}
      />

      <StickyBuyBar product={product} locale={locale} watchId="buy" />
    </main>
  );
}
