import type {
  Collection,
  Connection,
  Product,
  ProductSort,
  Review,
  ReviewSummary,
} from '@/types/commerce';
import type { CurrencyCode } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * ───────────────────────────────────────────────────────────────────────
 * THE COMMERCE SEAM
 *
 * Every page reads product data through this interface and nothing else. The
 * demo implementation (lib/commerce/demo) and the Shopify implementation
 * (lib/commerce/shopify) are interchangeable because they return the same
 * types — the demo repository is a MOCK OF THE REAL ONE, not a different shape
 * the UI has to know about.
 *
 * Method signatures deliberately mirror the Shopify Storefront API:
 *   • `Connection<T>` with `pageInfo.endCursor` is Relay pagination
 *   • `RequestContext { locale }` maps onto `@inContext(language: …)`
 *   • `getRecommendations(intent)` maps onto `productRecommendations(intent:)`
 *
 * Because of that symmetry the adapter swap is a configuration change, not a
 * refactor. See lib/commerce/index.ts.
 * ───────────────────────────────────────────────────────────────────────
 */

export interface RequestContext {
  locale: Locale;
  currency?: CurrencyCode;
}

export interface ProductQuery {
  collection?: string;
  tags?: string[];
  colorway?: string;
  /** Product size, matched against any variant's real size option value. */
  size?: string;
  /** Minor currency units — same convention as Money.amount. */
  priceMin?: number;
  priceMax?: number;
  /**
   * At least one variant purchasable — the same rollup already exposed as
   * `Product.availableForSale`.
   */
  availability?: 'in-stock';
  /**
   * A super-category grouping derived from the real `Product.form` field
   * (apparel = shell/overshirt/tee/knit/pant, accessories =
   * bag/cap/bottle) — for collections that have no single matching
   * provider handle. See lib/commerce/collection-config.ts.
   */
  category?: 'apparel' | 'accessories';
  sort?: ProductSort;
  first?: number;
  after?: string | null;
}

export type RecommendationIntent = 'related' | 'complementary' | 'trending';

export interface RecommendationOptions {
  intent: RecommendationIntent;
  limit: number;
}

/** A recommendation carrying the reasons it was selected — surfaced in the UI. */
export interface ScoredProduct {
  product: Product;
  score: number;
  reasons: string[];
}

export interface ReviewQuery {
  first: number;
  after?: string | null;
  sort?: 'recent' | 'rating-desc' | 'rating-asc' | 'helpful';
  rating?: number;
}

export type ReviewConnection = Connection<Review> & { summary: ReviewSummary };

export interface CommerceRepository {
  readonly id: 'demo' | 'shopify';

  getProducts(query: ProductQuery, ctx: RequestContext): Promise<Connection<Product>>;
  getProduct(handle: string, ctx: RequestContext): Promise<Product | null>;
  /** Drives generateStaticParams — must not require a locale. */
  getAllHandles(): Promise<string[]>;
  getCollection(handle: string, ctx: RequestContext): Promise<Collection | null>;
  getCollections(ctx: RequestContext): Promise<Collection[]>;
  searchProducts(query: string, ctx: RequestContext): Promise<Product[]>;
  getRecommendations(
    handle: string,
    options: RecommendationOptions,
    ctx: RequestContext,
  ): Promise<ScoredProduct[]>;
  getReviews(productHandle: string, query: ReviewQuery, ctx: RequestContext): Promise<ReviewConnection>;
}

/** Thrown by an adapter that has no credentials configured. */
export class NotConfiguredError extends Error {
  constructor(provider: string, missing: string[]) {
    super(
      `[commerce] The "${provider}" provider is not configured. Missing: ${missing.join(', ')}. ` +
        'This build runs in DEMO MODE — see .env.example and the "PRODUCTION INTEGRATION REQUIRED" section of the README.',
    );
    this.name = 'NotConfiguredError';
  }
}
