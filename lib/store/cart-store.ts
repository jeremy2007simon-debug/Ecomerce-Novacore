'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { track } from '@/lib/analytics';
import { itemCount, subtotal } from '@/lib/commerce/cart-math';
import type { Money } from '@/types/commerce';
import type { ProductMedia } from '@/types/visual';

/**
 * ───────────────────────────────────────────────────────────────────────
 * CART
 *
 * A module-scope store, deliberately. Two consequences that both matter:
 *
 *  1. Any component can add to the bag — the PDP, a collection card, the AI
 *     assistant — without a provider wrapping all of them, and the header badge
 *     re-renders on change while the page does not.
 *
 *  2. It SURVIVES THE LOCALE SWITCH. Changing /es/… to /en/… changes the
 *     [locale] segment, which remounts the root layout and destroys anything
 *     held in React context. Module state is untouched, so a visitor with three
 *     items in the bag keeps them when they change language mid-flow.
 * ───────────────────────────────────────────────────────────────────────
 */

export interface CartLine {
  /** `${productId}:${variantId}` — stable, and its own dedupe key. */
  lineId: string;
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  colorLabel: string;
  colorHex: string;
  sizeLabel: string | null;
  unitPrice: Money;
  quantity: number;
  media: ProductMedia;
  maxQuantity: number;
}

export type CartInput = Omit<CartLine, 'lineId' | 'quantity'>;

interface CartState {
  lines: CartLine[];
  /**
   * False until the persisted cart has been read. Every consumer MUST gate on
   * this — see the note on skipHydration below.
   */
  hydrated: boolean;
  /** Line id of the most recent addition, for the drawer's entrance animation. */
  lastAddedId: string | null;

  add: (input: CartInput, quantity?: number, surface?: 'pdp' | 'home' | 'collection') => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      lastAddedId: null,

      add: (input, quantity = 1, surface) => {
        const lineId = `${input.productId}:${input.variantId}`;
        const existing = get().lines.find((line) => line.lineId === lineId);

        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, existing.maxQuantity);
          set({
            lines: get().lines.map((line) =>
              line.lineId === lineId ? { ...line, quantity: nextQuantity } : line,
            ),
            lastAddedId: lineId,
          });
        } else {
          set({
            lines: [...get().lines, { ...input, lineId, quantity }],
            lastAddedId: lineId,
          });
        }

        track({
          name: 'add_to_cart',
          payload: {
            productId: input.productId,
            variantId: input.variantId,
            handle: input.handle,
            quantity,
            value: input.unitPrice.amount * quantity,
            ...(surface ? { surface } : {}),
          },
        });
      },

      remove: (lineId) => {
        const line = get().lines.find((l) => l.lineId === lineId);
        set({ lines: get().lines.filter((l) => l.lineId !== lineId) });

        if (line) {
          track({
            name: 'remove_from_cart',
            payload: {
              productId: line.productId,
              variantId: line.variantId,
              handle: line.handle,
              quantity: line.quantity,
            },
          });
        }
      },

      setQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().remove(lineId);
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.lineId === lineId
              ? { ...line, quantity: Math.min(quantity, line.maxQuantity) }
              : line,
          ),
        });
      },

      clear: () => set({ lines: [], lastAddedId: null }),

      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'atl.cart.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),

      /**
       * THE LOAD-BEARING LINE.
       *
       * Without skipHydration, Zustand reads localStorage during module
       * evaluation. The first client render then has three cart lines while the
       * server-rendered HTML has zero — a hydration mismatch, which React 19
       * resolves by discarding the subtree and re-rendering it client-side. On
       * the home page that means the hero remounts and its entrance animation
       * visibly replays.
       *
       * With it, the first client render matches the server exactly (empty),
       * and CartHydrator fills the cart in an effect on the next frame.
       */
      skipHydration: true,
    },
  ),
);

/* ── Selectors ───────────────────────────────────────────────────────────────────────
   All of these return the empty-cart value until `hydrated` flips, so nothing
   derived from persisted state can differ between the server HTML and the
   first client paint. */

export function useCartCount(): number {
  return useCartStore((state) => (state.hydrated ? itemCount(state.lines) : 0));
}

export function useCartSubtotal(): Money {
  return useCartStore((state) =>
    state.hydrated ? subtotal(state.lines) : { amount: 0, currencyCode: 'EUR' },
  );
}

export function useCartLines(): CartLine[] {
  return useCartStore((state) => (state.hydrated ? state.lines : EMPTY_LINES));
}

export function useCartHydrated(): boolean {
  return useCartStore((state) => state.hydrated);
}

/** Stable reference — returning a fresh [] would re-render on every store change. */
const EMPTY_LINES: CartLine[] = [];
