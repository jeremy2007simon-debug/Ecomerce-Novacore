import { NotConfiguredError, type CommerceRepository } from '../repository';

/**
 * PRODUCTION INTEGRATION REQUIRED — Shopify implementation of CommerceRepository.
 *
 * Every method is present and correctly typed, and every method refuses to run.
 * That combination is the point: the interface is provably implementable, the
 * compiler enforces that this adapter and the demo adapter stay in step, and
 * nothing here can silently pretend to be connected to a real store.
 */

function refuse(method: string): never {
  throw new NotConfiguredError(`shopify.${method}`, [
    'SHOPIFY_STORE_DOMAIN',
    'SHOPIFY_STOREFRONT_TOKEN',
    'lib/commerce/shopify/normalize.ts#normalizeProduct',
  ]);
}

export const shopifyRepository: CommerceRepository = {
  id: 'shopify',
  getProducts: () => refuse('getProducts'),
  getProduct: () => refuse('getProduct'),
  getAllHandles: () => refuse('getAllHandles'),
  getCollection: () => refuse('getCollection'),
  getCollections: () => refuse('getCollections'),
  searchProducts: () => refuse('searchProducts'),
  getRecommendations: () => refuse('getRecommendations'),
  getReviews: () => refuse('getReviews'),
};
