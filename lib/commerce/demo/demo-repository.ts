import { DEMO_COLLECTIONS } from '@/data/collections';
import { DEMO_PRODUCTS } from '@/data/products';
import { DEMO_REVIEWS, reviewCreatedAt, type DemoReview } from '@/data/reviews';
import { rankRecommendations } from '@/lib/commerce/recommendations';
import { searchIndex } from '@/lib/commerce/search';
import type {
  Collection,
  Connection,
  Product,
  Review,
  ReviewSummary,
} from '@/types/commerce';
import type { Locale } from '@/types/i18n';
import type {
  CommerceRepository,
  ProductQuery,
  RecommendationOptions,
  RequestContext,
  ReviewConnection,
  ReviewQuery,
  ScoredProduct,
} from '../repository';
import { buildProduct } from './build-product';

/**
 * The DEMO implementation of CommerceRepository.
 *
 * It is deliberately async even though nothing here awaits: the Shopify
 * implementation will be genuinely async, and having the demo share that shape
 * means no call site changes when the provider is swapped.
 *
 * Locale-resolved products are memoised per locale — buildProduct expands the
 * full variant matrix, and doing that on every request during a static build of
 * 8 products × 2 locales is wasted work.
 */

const productCache = new Map<Locale, Product[]>();

function allProducts(locale: Locale): Product[] {
  const cached = productCache.get(locale);
  if (cached) return cached;

  const built = DEMO_PRODUCTS.map((source) => buildProduct(source, locale));
  productCache.set(locale, built);
  return built;
}

function sortProducts(products: Product[], sort: ProductQuery['sort']): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'price-asc':
      sorted.sort(
        (a, b) =>
          a.priceRange.min.amount - b.priceRange.min.amount || a.handle.localeCompare(b.handle),
      );
      break;
    case 'price-desc':
      sorted.sort(
        (a, b) =>
          b.priceRange.min.amount - a.priceRange.min.amount || a.handle.localeCompare(b.handle),
      );
      break;
    case 'rating':
      sorted.sort(
        (a, b) => b.rating.value - a.rating.value || b.rating.count - a.rating.count,
      );
      break;
    case 'newest':
      // Newest = reverse catalogue order. Demo data has no createdAt by design;
      // adding one would be inventing a fact the UI would then present as real.
      sorted.reverse();
      break;
    case 'featured':
    default: {
      const rank = new Map(DEMO_PRODUCTS.map((p) => [p.handle, p.featuredRank]));
      sorted.sort(
        (a, b) => (rank.get(a.handle) ?? 999) - (rank.get(b.handle) ?? 999),
      );
      break;
    }
  }

  return sorted;
}

function toCollection(handle: string, locale: Locale): Collection | null {
  const source = DEMO_COLLECTIONS.find((c) => c.handle === handle);
  if (!source) return null;

  return {
    handle: source.handle,
    title: source.title[locale],
    description: source.description[locale],
    heroMedia: null,
  };
}

function toReview(source: DemoReview, locale: Locale): Review {
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

function summarise(reviews: Review[], product: Product | undefined): ReviewSummary {
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
    recommendPercent: Math.round(
      (reviews.filter((r) => r.rating >= 4).length / count) * 100,
    ),
    fitBias: 0,
  };
}

function paginate<T>(items: T[], first: number, after: string | null | undefined): Connection<T> {
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

export const demoRepository: CommerceRepository = {
  id: 'demo',

  async getProducts(query: ProductQuery, ctx: RequestContext): Promise<Connection<Product>> {
    let products = allProducts(ctx.locale);

    if (query.collection && query.collection !== 'all') {
      products = products.filter((p) => p.collectionHandles.includes(query.collection as string));
    }

    if (query.tags && query.tags.length > 0) {
      products = products.filter((p) => query.tags!.some((tag) => p.tags.includes(tag)));
    }

    if (query.colorway) {
      products = products.filter((p) =>
        p.options
          .find((o) => o.name === 'color')
          ?.values.some((v) => v.value === query.colorway && v.available),
      );
    }

    return paginate(sortProducts(products, query.sort), query.first ?? 24, query.after);
  },

  async getProduct(handle: string, ctx: RequestContext): Promise<Product | null> {
    return allProducts(ctx.locale).find((p) => p.handle === handle) ?? null;
  },

  async getAllHandles(): Promise<string[]> {
    return DEMO_PRODUCTS.map((p) => p.handle);
  },

  async getCollection(handle: string, ctx: RequestContext): Promise<Collection | null> {
    return toCollection(handle, ctx.locale);
  },

  async getCollections(ctx: RequestContext): Promise<Collection[]> {
    return [...DEMO_COLLECTIONS]
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        handle: c.handle,
        title: c.title[ctx.locale],
        description: c.description[ctx.locale],
        heroMedia: null,
      }));
  },

  async searchProducts(query: string, ctx: RequestContext): Promise<Product[]> {
    return searchIndex(allProducts(ctx.locale), query).map((hit) => hit.product);
  },

  async getRecommendations(
    handle: string,
    options: RecommendationOptions,
    ctx: RequestContext,
  ): Promise<ScoredProduct[]> {
    const pool = allProducts(ctx.locale);
    const seed = pool.find((p) => p.handle === handle);
    if (!seed) return [];

    return rankRecommendations(seed, pool, options).map((entry) => ({
      product: entry.product,
      score: entry.score,
      reasons: entry.reasons,
    }));
  },

  async getReviews(
    productHandle: string,
    query: ReviewQuery,
    ctx: RequestContext,
  ): Promise<ReviewConnection> {
    const product = allProducts(ctx.locale).find((p) => p.handle === productHandle);

    let reviews = DEMO_REVIEWS.filter((r) => r.productHandle === productHandle).map((r) =>
      toReview(r, ctx.locale),
    );

    const summary = summarise(reviews, product);

    if (query.rating) {
      reviews = reviews.filter((r) => r.rating === query.rating);
    }

    switch (query.sort) {
      case 'rating-desc':
        reviews.sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id));
        break;
      case 'rating-asc':
        reviews.sort((a, b) => a.rating - b.rating || a.id.localeCompare(b.id));
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpfulCount - a.helpfulCount || a.id.localeCompare(b.id));
        break;
      case 'recent':
      default:
        reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
        break;
    }

    return { ...paginate(reviews, query.first, query.after), summary };
  },
};
