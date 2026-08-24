import { demoRepository } from './demo/demo-repository';
import type { shopifyRepository as ShopifyRepositoryModule } from './shopify/shopify-repository';
import type { CommerceRepository } from './repository';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PROVIDER SEAM — the only place in the codebase that chooses a backend.
 *
 * Pages import `commerce` and call its methods. They do not know, and must not
 * know, whether the data came from data/products.ts or from a Shopify store.
 *
 * The Shopify module is imported lazily so that its GraphQL documents and fetch
 * wrapper are never pulled into a demo-mode build.
 * ─────────────────────────────────────────────────────────────────────────────
 */

function resolveRepository(): CommerceRepository {
  if (process.env.COMMERCE_PROVIDER === 'shopify') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./shopify/shopify-repository') as {
      shopifyRepository: typeof ShopifyRepositoryModule;
    };
    return mod.shopifyRepository;
  }
  return demoRepository;
}

export const commerce: CommerceRepository = resolveRepository();

/** True when the storefront is running on demo data. Drives DEMO badging. */
export const IS_DEMO_MODE = commerce.id === 'demo';

export type {
  CommerceRepository,
  ProductQuery,
  RecommendationIntent,
  RecommendationOptions,
  RequestContext,
  ReviewConnection,
  ReviewQuery,
  ScoredProduct,
} from './repository';
