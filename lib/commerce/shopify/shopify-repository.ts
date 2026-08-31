import { formsForCategory } from '@/lib/commerce/product-form-groups';
import { rankRecommendations } from '@/lib/commerce/recommendations';
import { paginate, reviewsForHandle, summarise } from '@/lib/commerce/reviews';
import type { Collection, Connection, Product, ProductSort } from '@/types/commerce';
import { storefront } from './client';
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  PRODUCTS_IN_COLLECTION_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_HANDLES_QUERY,
  RECOMMENDATIONS_QUERY,
} from './fragments';
import { normalizeImage, normalizeProduct, type ShopifyProductNode } from './normalize';
import type { CommerceRepository } from '../repository';
import type {
  ProductQuery,
  RecommendationIntent,
  RecommendationOptions,
  RequestContext,
  ReviewConnection,
  ReviewQuery,
  ScoredProduct,
} from '../repository';

/**
 * PRODUCTION INTEGRATION — Shopify implementation of CommerceRepository.
 *
 * Reviews stay demo data in every mode (Shopify has no native reviews API —
 * see lib/commerce/reviews.ts). Everything else is real: catalogue, search
 * and recommendations all go through the Storefront API.
 */

/**
 * `@inContext` needs a LanguageCode/CountryCode pair, not our two-letter
 * Locale. Country follows the requested currency when one is given (EUR
 * carries no unambiguous country of its own across the eurozone, but this
 * storefront's primary market is Spain, so EUR/unset defaults there).
 */
function shopifyContext(ctx: RequestContext): { language: string; country: string } {
  const country = ctx.currency === 'USD' ? 'US' : ctx.currency === 'GBP' ? 'GB' : 'ES';
  return { language: ctx.locale.toUpperCase(), country };
}

function mapSort(sort: ProductSort | undefined): { sortKey?: string; reverse?: boolean } {
  switch (sort) {
    case 'price-asc':
      return { sortKey: 'PRICE', reverse: false };
    case 'price-desc':
      return { sortKey: 'PRICE', reverse: true };
    case 'newest':
      return { sortKey: 'CREATED', reverse: true };
    case 'featured':
      return { sortKey: 'BEST_SELLING' };
    case 'rating':
      // Storefront has no rating-based sort key — no order data this
      // integration fetches could substitute for it honestly. Falls back to
      // the store's default ordering rather than faking a rating sort.
      return {};
    default:
      return {};
  }
}

function buildSearchQuery(query: ProductQuery): string | undefined {
  const clauses: string[] = [];
  if (query.tags && query.tags.length > 0) {
    clauses.push('(' + query.tags.map((tag) => `tag:'${tag}'`).join(' OR ') + ')');
  }
  return clauses.length > 0 ? clauses.join(' AND ') : undefined;
}

/**
 * Colorway, size, category, price and availability have no Storefront
 * query-string filter — applied client-side against the already-fetched
 * page, same pattern already shipped for colorway. `category` reads the
 * real `Product.form` field (see lib/commerce/product-form-groups.ts), same
 * as the demo repository — never a fabricated grouping.
 */
function applyClientFilters(products: Product[], query: ProductQuery): Product[] {
  let result = products;

  if (query.colorway) {
    result = result.filter((p) =>
      p.options.find((o) => o.name === 'color')?.values.some((v) => v.value === query.colorway && v.available),
    );
  }

  if (query.size) {
    result = result.filter((p) =>
      p.options.find((o) => o.name === 'size')?.values.some((v) => v.value === query.size && v.available),
    );
  }

  if (query.category) {
    const forms = formsForCategory(query.category);
    result = result.filter((p) => forms.has(p.form));
  }

  if (query.priceMin !== undefined) {
    result = result.filter((p) => p.priceRange.min.amount >= query.priceMin!);
  }

  if (query.priceMax !== undefined) {
    result = result.filter((p) => p.priceRange.min.amount <= query.priceMax!);
  }

  if (query.availability === 'in-stock') {
    result = result.filter((p) => p.availableForSale);
  }

  return result;
}

interface ProductsResponse {
  products: { nodes: ShopifyProductNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
}

interface ProductsInCollectionResponse {
  collection: {
    products: { nodes: ShopifyProductNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  } | null;
}

interface ProductByHandleResponse {
  product: ShopifyProductNode | null;
}

interface ProductHandlesResponse {
  products: { nodes: { handle: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
}

interface RecommendationsResponse {
  productRecommendations: ShopifyProductNode[] | null;
}

interface ShopifyCollectionNode {
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null; width: number; height: number } | null;
}

interface CollectionByHandleResponse {
  collection: ShopifyCollectionNode | null;
}

interface CollectionsResponse {
  collections: { nodes: ShopifyCollectionNode[] };
}

function normalizeCollection(node: ShopifyCollectionNode): Collection {
  return {
    handle: node.handle,
    title: node.title,
    description: node.description,
    heroMedia: node.image ? normalizeImage(node.image, node.title) : null,
  };
}

const RECOMMENDATION_INTENT_MAP: Record<RecommendationIntent, string> = {
  related: 'RELATED',
  complementary: 'COMPLEMENTARY',
  // Storefront has no native "trending" intent — RELATED is the closest
  // available signal, and is documented here rather than silently reused.
  trending: 'RELATED',
};

export const shopifyRepository: CommerceRepository = {
  id: 'shopify',

  async getProducts(query: ProductQuery, ctx: RequestContext): Promise<Connection<Product>> {
    const { language, country } = shopifyContext(ctx);
    const { sortKey, reverse } = mapSort(query.sort);
    const first = query.first ?? 24;

    if (query.collection && query.collection !== 'all') {
      const data = await storefront<ProductsInCollectionResponse>(PRODUCTS_IN_COLLECTION_QUERY, {
        handle: query.collection,
        first,
        after: query.after,
        sortKey,
        reverse,
        language,
        country,
      });
      const connection = data.collection?.products ?? { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
      const products = applyClientFilters(
        connection.nodes.map((n) => normalizeProduct(n, ctx.locale)),
        query,
      );
      return { nodes: products, pageInfo: connection.pageInfo };
    }

    const data = await storefront<ProductsResponse>(PRODUCTS_QUERY, {
      first,
      after: query.after,
      query: buildSearchQuery(query),
      sortKey,
      reverse,
      language,
      country,
    });
    const products = applyClientFilters(
      data.products.nodes.map((n) => normalizeProduct(n, ctx.locale)),
      query,
    );
    return { nodes: products, pageInfo: data.products.pageInfo };
  },

  async getProduct(handle: string, ctx: RequestContext): Promise<Product | null> {
    const { language, country } = shopifyContext(ctx);
    const data = await storefront<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, {
      handle,
      language,
      country,
    });
    return data.product ? normalizeProduct(data.product, ctx.locale) : null;
  },

  async getAllHandles(): Promise<string[]> {
    const handles: string[] = [];
    let after: string | null = null;

    for (;;) {
      const data: ProductHandlesResponse = await storefront<ProductHandlesResponse>(
        PRODUCT_HANDLES_QUERY,
        { first: 250, after },
      );
      handles.push(...data.products.nodes.map((n) => n.handle));
      if (!data.products.pageInfo.hasNextPage) break;
      after = data.products.pageInfo.endCursor;
    }

    return handles;
  },

  async getCollection(handle: string, ctx: RequestContext): Promise<Collection | null> {
    const { language, country } = shopifyContext(ctx);
    const data = await storefront<CollectionByHandleResponse>(COLLECTION_BY_HANDLE_QUERY, {
      handle,
      language,
      country,
    });
    return data.collection ? normalizeCollection(data.collection) : null;
  },

  async getCollections(ctx: RequestContext): Promise<Collection[]> {
    const { language, country } = shopifyContext(ctx);
    const data = await storefront<CollectionsResponse>(COLLECTIONS_QUERY, {
      first: 50,
      language,
      country,
    });
    return data.collections.nodes.map(normalizeCollection);
  },

  async searchProducts(query: string, ctx: RequestContext): Promise<Product[]> {
    const { language, country } = shopifyContext(ctx);
    // Storefront's `query:` parameter already performs full-text search —
    // this replaces lib/commerce/search.ts entirely in Shopify mode; that
    // module stays exclusive to the demo repository.
    const data = await storefront<ProductsResponse>(PRODUCTS_QUERY, {
      first: 24,
      query,
      language,
      country,
    });
    return data.products.nodes.map((n) => normalizeProduct(n, ctx.locale));
  },

  async getRecommendations(
    handle: string,
    options: RecommendationOptions,
    ctx: RequestContext,
  ): Promise<ScoredProduct[]> {
    const { language, country } = shopifyContext(ctx);

    const seedData = await storefront<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, {
      handle,
      language,
      country,
    });
    if (!seedData.product) return [];
    const seed = normalizeProduct(seedData.product, ctx.locale);

    const recData = await storefront<RecommendationsResponse>(RECOMMENDATIONS_QUERY, {
      productId: seedData.product.id,
      intent: RECOMMENDATION_INTENT_MAP[options.intent],
      language,
      country,
    });
    const pool = (recData.productRecommendations ?? []).map((n) => normalizeProduct(n, ctx.locale));

    // Reuses the same provider-agnostic scoring engine the demo repository
    // uses (lib/commerce/recommendations.ts) against the Shopify-sourced
    // pool, rather than a second scoring implementation.
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
    // Deliberately does not call Shopify — see the module doc comment.
    let reviews = reviewsForHandle(productHandle, ctx.locale);
    const summary = summarise(reviews, undefined);

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
