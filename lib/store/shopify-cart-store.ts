'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { track } from '@/lib/analytics';
import {
  addCartLines,
  createCart,
  fetchCart,
  removeCartLines,
  updateCartLines,
  type ShopifyCartLineNode,
  type ShopifyCartNode,
} from '@/lib/commerce/shopify/cart-actions';
import { normalizeImage, normalizeMoney } from '@/lib/commerce/shopify/normalize';
import type { Locale } from '@/types/i18n';
import type { Money } from '@/types/commerce';
import type { ProductMedia } from '@/types/visual';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SHOPIFY CART — server-authoritative, mounted only when COMMERCE_PROVIDER=shopify.
 *
 * Deliberately a separate store from lib/store/cart-store.ts, not a shared
 * interface: the demo cart computes price/stock locally and IS the truth: the
 * Shopify cart's price/stock come back FROM the mutation response, and local
 * state can drift from it (a price change, a variant selling out between
 * requests). Forcing one interface to serve both would mean either faking
 * server latency in demo mode or faking synchronicity in Shopify mode.
 *
 * Only `cartId`/`checkoutUrl` persist to localStorage — `lines`/`cost` are
 * always re-fetched from Shopify on hydration (see ShopifyCartHydrator),
 * since those are never trusted from a stale local copy the way the demo
 * cart's lines are.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ShopifyCartLine {
  /** Shopify cart line id — gid://shopify/CartLine/... */
  lineId: string;
  variantId: string;
  handle: string;
  title: string;
  colorLabel: string;
  sizeLabel: string | null;
  quantity: number;
  lineTotal: Money;
  media: ProductMedia | null;
}

function toCartLine(node: ShopifyCartLineNode): ShopifyCartLine {
  const color = node.merchandise.selectedOptions.find((o) => o.name.toLowerCase() === 'color');
  const size = node.merchandise.selectedOptions.find((o) => o.name.toLowerCase() === 'size');

  return {
    lineId: node.id,
    variantId: node.merchandise.id,
    handle: node.merchandise.product.handle,
    title: node.merchandise.product.title,
    colorLabel: color?.value ?? '',
    sizeLabel: size?.value ?? null,
    quantity: node.quantity,
    lineTotal: normalizeMoney(node.cost.totalAmount),
    media: node.merchandise.image
      ? normalizeImage(node.merchandise.image, node.merchandise.product.title)
      : null,
  };
}

function applyCart(cart: ShopifyCartNode): {
  cartId: string;
  checkoutUrl: string;
  lines: ShopifyCartLine[];
  cost: { subtotal: Money; total: Money };
} {
  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines.nodes.map(toCartLine),
    cost: {
      subtotal: normalizeMoney(cart.cost.subtotalAmount),
      total: normalizeMoney(cart.cost.totalAmount),
    },
  };
}

interface ShopifyCartState {
  cartId: string | null;
  checkoutUrl: string | null;
  lines: ShopifyCartLine[];
  cost: { subtotal: Money; total: Money };
  status: 'idle' | 'loading';
  error: string | null;
  hydrated: boolean;

  add: (
    variantId: string,
    quantity: number,
    locale: Locale,
    displayHandle: string,
    surface?: 'pdp' | 'home' | 'collection',
  ) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number, locale: Locale) => Promise<void>;
  remove: (lineId: string, locale: Locale) => Promise<void>;
  hydrate: (locale: Locale) => Promise<void>;
  dismissError: () => void;
}

const ZERO_MONEY: Money = { amount: 0, currencyCode: 'EUR' };

export const useShopifyCartStore = create<ShopifyCartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      lines: [],
      cost: { subtotal: ZERO_MONEY, total: ZERO_MONEY },
      status: 'idle',
      error: null,
      hydrated: false,

      add: async (variantId, quantity, locale, displayHandle, surface) => {
        set({ status: 'loading', error: null });
        const { cartId } = get();

        const result = cartId
          ? await addCartLines(cartId, [{ merchandiseId: variantId, quantity }], locale)
          : await createCart([{ merchandiseId: variantId, quantity }], locale);

        if (result.userErrors.length > 0) {
          set({ status: 'idle', error: result.userErrors[0]!.message });
          return;
        }
        if (!result.cart) {
          set({ status: 'idle', error: null });
          return;
        }

        set({ ...applyCart(result.cart), status: 'idle', error: null });
        track({
          name: 'add_to_cart',
          payload: {
            productId: displayHandle,
            variantId,
            handle: displayHandle,
            quantity,
            value: 0,
            ...(surface ? { surface } : {}),
          },
        });
      },

      updateQuantity: async (lineId, quantity, locale) => {
        const { cartId, lines } = get();
        if (!cartId) return;

        if (quantity <= 0) {
          await get().remove(lineId, locale);
          return;
        }

        // Optimistic: apply locally first, reconcile with the server response.
        const previousLines = lines;
        set({
          lines: lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
          status: 'loading',
          error: null,
        });

        const result = await updateCartLines(cartId, [{ id: lineId, quantity }], locale);

        if (result.userErrors.length > 0) {
          set({ lines: previousLines, status: 'idle', error: result.userErrors[0]!.message });
          return;
        }
        if (!result.cart) {
          set({ lines: previousLines, status: 'idle' });
          return;
        }
        set({ ...applyCart(result.cart), status: 'idle', error: null });
      },

      remove: async (lineId, locale) => {
        const { cartId, lines } = get();
        if (!cartId) return;

        const previousLines = lines;
        set({ lines: lines.filter((l) => l.lineId !== lineId), status: 'loading', error: null });

        const result = await removeCartLines(cartId, [lineId], locale);

        if (result.userErrors.length > 0) {
          set({ lines: previousLines, status: 'idle', error: result.userErrors[0]!.message });
          return;
        }
        if (!result.cart) {
          set({ lines: previousLines, status: 'idle' });
          return;
        }
        set({ ...applyCart(result.cart), status: 'idle', error: null });
      },

      hydrate: async (locale) => {
        const { cartId } = get();
        if (!cartId) {
          set({ hydrated: true });
          return;
        }

        const cart = await fetchCart(cartId, locale);
        if (cart) {
          set({ ...applyCart(cart), hydrated: true });
        } else {
          // The Shopify cart expired or was completed server-side — start fresh
          // rather than pointing at a dead cart id.
          set({ cartId: null, checkoutUrl: null, lines: [], hydrated: true });
        }
      },

      dismissError: () => set({ error: null }),
    }),
    {
      name: 'atl.shopify-cart.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
      skipHydration: true,
    },
  ),
);

const EMPTY_SHOPIFY_LINES: ShopifyCartLine[] = [];

export function useShopifyCartLines(): ShopifyCartLine[] {
  return useShopifyCartStore((state) => (state.hydrated ? state.lines : EMPTY_SHOPIFY_LINES));
}

export function useShopifyCartCount(): number {
  return useShopifyCartStore((state) =>
    state.hydrated ? state.lines.reduce((sum, l) => sum + l.quantity, 0) : 0,
  );
}

export function useShopifyCartHydrated(): boolean {
  return useShopifyCartStore((state) => state.hydrated);
}
