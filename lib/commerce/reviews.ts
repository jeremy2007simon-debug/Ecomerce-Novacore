import { DEMO_PRODUCTS } from '@/data/products';
import { DEMO_REVIEWS, reviewCreatedAt, type DemoReview } from '@/data/reviews';
import type { Connection, Product, Review, ReviewSummary } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Review helpers shared by every CommerceRepository implementation.
 *
 * Reviews stay demo data in every mode — Shopify has no native reviews API,
 * and this project does not invent one. A Shopify product whose handle has
 * no matching demo review simply returns an empty, honest ReviewConnection;
 * see shopify/shopify-repository.ts#getReviews. `paginate` also backs
 * getProducts in both repositories — it is Relay-pagination, not
 * review-specific, and lives here only because this is where the extraction
 * happened.
 */

/**
 * Every review for a product handle, in either mode. A real Shopify handle
 * that has no matching demo review simply returns an empty array — the
 * honest empty state, not an error and not an invented review.
 */
export function reviewsForHandle(productHandle: string, locale: Locale): Review[] {
  return DEMO_REVIEWS.filter((r) => r.productHandle === productHandle).map((r) => toReview(r, locale));
}

export function toReview(source: DemoReview, locale: Locale): Review {
  const product = DEMO_PRODUCTS.find((p) => p.handle === source.productHandle);
  const review: Review = {
    id: source.id,
    productId: product?.id ?? source.productHandle,
    author: source.author,
    location: source.location,
    rating: source.rating,
    title: source.title[locale],
    body: source.body[locale],
    createdAt: reviewCreatedAt(source),
    verified: source.verified,
    helpfulCount: source.helpfulCount,
  };
  if (source.fit) review.fit = source.fit;
  if (source.size) review.size = source.size;
  return review;
}

export function summarise(reviews: Review[], product: Product | undefined): ReviewSummary {
  // The catalogue carries an authoritative rating (the "all-time" figure); the
  // review list is a curated excerpt of it. Trust the catalogue for the headline
  // number so the PDP does not claim 4.9 next to a list averaging 4.6.
  if (product) {
    const total = product.rating.distribution.reduce((sum, n) => sum + n, 0) || 1;
    const positive = (product.rating.distribution[3] ?? 0) + (product.rating.distribution[4] ?? 0);
    const fitVotes = reviews.filter((r) => r.fit);
    const bias =
      fitVotes.length === 0
        ? 0
        : fitVotes.reduce((sum, r) => sum + (r.fit === 'small' ? -1 : r.fit === 'large' ? 1 : 0), 0) /
          fitVotes.length;

    return {
      average: product.rating.value,
      count: product.rating.count,
      distribution: product.rating.distribution,
      recommendPercent: Math.round((positive / total) * 100),
      fitBias: Number(bias.toFixed(2)),
    };
  }

  const count = reviews.length || 1;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const bucket = r.rating - 1;
    distribution[bucket] = (distribution[bucket] ?? 0) + 1;
  }

  return {
    average: Number(average.toFixed(1)),
    count: reviews.length,
    distribution,
    recommendPercent: Math.round((reviews.filter((r) => r.rating >= 4).length / count) * 100),
    fitBias: 0,
  };
}

export function paginate<T>(items: T[], first: number, after: string | null | undefined): Connection<T> {
  const startIndex = after ? Number.parseInt(after, 10) || 0 : 0;
  const nodes = items.slice(startIndex, startIndex + first);
  const nextIndex = startIndex + nodes.length;

  return {
    nodes,
    pageInfo: {
      hasNextPage: nextIndex < items.length,
      endCursor: nextIndex < items.length ? String(nextIndex) : null,
    },
  };
}
