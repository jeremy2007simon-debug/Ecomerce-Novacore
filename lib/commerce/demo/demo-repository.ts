import { DEMO_COLLECTIONS } from '@/data/collections';
import { DEMO_PRODUCTS } from '@/data/products';
import { formsForCategory } from '@/lib/commerce/product-form-groups';
import { rankRecommendations } from '@/lib/commerce/recommendations';
import { paginate, reviewsForHandle, summarise } from '@/lib/commerce/reviews';
import { searchIndex } from '@/lib/commerce/search';
import type { Collection, Connection, Product } from '@/types/commerce';
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

    if (query.category) {
      const forms = formsForCategory(query.category);
      products = products.filter((p) => forms.has(p.form));
    }

    if (query.size) {
      products = products.filter((p) =>
        p.options
          .find((o) => o.name === 'size')
          ?.values.some((v) => v.value === query.size && v.available),
      );
    }

    if (query.priceMin !== undefined) {
      products = products.filter((p) => p.priceRange.min.amount >= query.priceMin!);
    }

    if (query.priceMax !== undefined) {
      products = products.filter((p) => p.priceRange.min.amount <= query.priceMax!);
    }

    if (query.availability === 'in-stock') {
      products = products.filter((p) => p.availableForSale);
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

    let reviews = reviewsForHandle(productHandle, ctx.locale);

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
