import type { Money, Product } from '@/types/commerce';
import type { ImageMedia, MediaAspect } from '@/types/visual';

/**
 * PRODUCTION INTEGRATION REQUIRED — Shopify node → our domain types.
 *
 * The functions here are typed and their contracts are fixed; the bodies that
 * throw are the ones a real integration must fill in. Everything already
 * implemented below is the part that is genuinely provider-agnostic and worth
 * having written in advance.
 */

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  [key: string]: unknown;
}

/**
 * Shopify returns decimal strings ("129.00"); we hold minor units. Parsing via
 * Math.round(parseFloat * 100) is correct here because Shopify guarantees at
 * most two decimal places for these currencies.
 */
export function normalizeMoney(input: ShopifyMoney): Money {
  return {
    amount: Math.round(Number.parseFloat(input.amount) * 100),
    currencyCode: input.currencyCode as Money['currencyCode'],
  };
}

function nearestAspect(width: number, height: number): MediaAspect {
  const ratio = width / height;
  const candidates: [MediaAspect, number][] = [
    ['1/1', 1],
    ['4/5', 0.8],
    ['3/4', 0.75],
    ['3/2', 1.5],
    ['16/9', 16 / 9],
  ];

  let best: MediaAspect = '4/5';
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const [aspect, value] of candidates) {
    const delta = Math.abs(ratio - value);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = aspect;
    }
  }
  return best;
}

/**
 * Already complete: our ImageMedia was shaped to match Shopify's image node
 * precisely so that this function stays a rename rather than a translation.
 * Note the alt-text fallback — a null altText must never reach the DOM.
 */
export function normalizeImage(image: ShopifyImage, productTitle: string): ImageMedia {
  return {
    kind: 'image',
    url: image.url,
    altText: image.altText ?? productTitle,
    width: image.width,
    height: image.height,
    aspect: nearestAspect(image.width, image.height),
  };
}

/**
 * The one function a real integration must actually write.
 *
 * Left throwing rather than half-implemented on purpose: a partial normaliser
 * that silently returns an incomplete Product is far harder to debug than one
 * that refuses to run.
 */
export function normalizeProduct(_node: ShopifyProductNode): Product {
  throw new Error(
    '[shopify] normalizeProduct is not implemented. This build runs in DEMO MODE — ' +
      'see lib/commerce/shopify/normalize.ts and the README section "PRODUCTION INTEGRATIONS PENDING".',
  );
}
