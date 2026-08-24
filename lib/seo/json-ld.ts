import type { Product, ReviewSummary } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Structured data.
 *
 * `aggregateRating` reflects the DEMO dataset. That is acceptable for a demo,
 * but a production deployment MUST replace it with real review data — Google
 * treats fabricated ratings as spam, and that gets a domain penalised rather
 * than merely ignored.
 */
export function productJsonLd(
  product: Product,
  summary: ReviewSummary,
  locale: Locale,
  siteUrl: string,
) {
  const url = `${siteUrl}/${locale}/product/${product.handle}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: product.vendor },
    material: product.metafields.material,
    url,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: product.priceRange.min.currencyCode,
      lowPrice: (product.priceRange.min.amount / 100).toFixed(2),
      highPrice: (product.priceRange.max.amount / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: summary.average,
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Atlantic Supply',
    url: siteUrl,
    foundingLocation: { '@type': 'Place', name: 'Tenerife, Canary Islands' },
  };
}
