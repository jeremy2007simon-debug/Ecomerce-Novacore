'use server';

import type { Locale } from '@/types/i18n';
import { storefront } from './client';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from './fragments';

/**
 * PRODUCTION INTEGRATION — Server Actions for the Shopify cart.
 *
 * `storefront()` reads SHOPIFY_STOREFRONT_TOKEN from process.env, which Next
 * only inlines into a bundle for NEXT_PUBLIC_* names — a plain server var
 * resolves to undefined in client code. Cart mutations are triggered from
 * client components (the add-to-bag button, the cart drawer), so this file
 * is the boundary: it runs on the server (the 'use server' directive makes
 * every export here an RPC endpoint Next wires up automatically), and
 * lib/store/shopify-cart-store.ts calls these functions like any other
 * async function. The token never reaches the browser.
 */

export interface ShopifyCartLineNode {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    image: { url: string; altText: string | null; width: number; height: number } | null;
    product: { handle: string; title: string };
  };
  cost: { totalAmount: { amount: string; currencyCode: string } };
}

export interface ShopifyCartNode {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: { nodes: ShopifyCartLineNode[] };
}

export interface CartUserError {
  field: string[] | null;
  message: string;
  code: string | null;
}

export interface CartMutationResult {
  cart: ShopifyCartNode | null;
  userErrors: CartUserError[];
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

// The storefront's primary market is Spain (see shopify-repository.ts's own
// shopifyContext) — cart actions only carry a Locale, not a currency, so the
// country half stays fixed rather than guessed from language.
const SHOPIFY_COUNTRY = 'ES';

function shopifyLanguage(locale: Locale): string {
  return locale.toUpperCase();
}

interface CartCreateResponse {
  cartCreate: CartMutationResult;
}
interface CartLinesAddResponse {
  cartLinesAdd: CartMutationResult;
}
interface CartLinesUpdateResponse {
  cartLinesUpdate: CartMutationResult;
}
interface CartLinesRemoveResponse {
  cartLinesRemove: CartMutationResult;
}
interface CartQueryResponse {
  cart: ShopifyCartNode | null;
}

export async function createCart(lines: CartLineInput[], locale: Locale): Promise<CartMutationResult> {
  const data = await storefront<CartCreateResponse>(CART_CREATE_MUTATION, {
    lines,
    language: shopifyLanguage(locale),
    country: SHOPIFY_COUNTRY,
  });
  return data.cartCreate;
}

export async function addCartLines(
  cartId: string,
  lines: CartLineInput[],
  locale: Locale,
): Promise<CartMutationResult> {
  const data = await storefront<CartLinesAddResponse>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines,
    language: shopifyLanguage(locale),
    country: SHOPIFY_COUNTRY,
  });
  return data.cartLinesAdd;
}

export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdateInput[],
  locale: Locale,
): Promise<CartMutationResult> {
  const data = await storefront<CartLinesUpdateResponse>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines,
    language: shopifyLanguage(locale),
    country: SHOPIFY_COUNTRY,
  });
  return data.cartLinesUpdate;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
  locale: Locale,
): Promise<CartMutationResult> {
  const data = await storefront<CartLinesRemoveResponse>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
    language: shopifyLanguage(locale),
    country: SHOPIFY_COUNTRY,
  });
  return data.cartLinesRemove;
}

export async function fetchCart(cartId: string, locale: Locale): Promise<ShopifyCartNode | null> {
  const data = await storefront<CartQueryResponse>(CART_QUERY, {
    cartId,
    language: shopifyLanguage(locale),
    country: SHOPIFY_COUNTRY,
  });
  return data.cart;
}
