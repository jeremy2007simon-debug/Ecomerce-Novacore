'use client';

import { create } from 'zustand';
import type { CartInput } from './cart-store';

/**
 * The product page's current selection, published for the sticky buy bar.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * The mobile sticky bar said ADD TO BAG and added nothing: it scrolled back to
 * the real control, and — through an inverted condition — opened the cart only
 * when the item was SOLD OUT. A button must do what its label says.
 *
 * It could not add on its own because the variant lives in `PurchasePanel`,
 * and duplicating that state would give "which size is selected" two owners.
 * So this is not a second owner: `PurchasePanel` is the only writer, the bar
 * is a reader. One source of truth with a subscriber.
 *
 * Not persisted, and cleared when the panel unmounts, so a stale selection can
 * never survive a navigation to another product.
 *
 * `activeColor` follows the same one-writer pattern for Phase 5's Gallery V2:
 * `PurchasePanel` is still the sole writer, and `ProductGallery` becomes a
 * second reader alongside the sticky bar — exactly the "second subscriber"
 * this store was already built to support, not a new problem to solve.
 */
interface PDPState {
  /** Non-null only when a complete, purchasable variant is selected. */
  input: CartInput | null;
  /** True when the selected variant exists but is out of stock. */
  soldOut: boolean;
  /** True when the product has sizes and none has been chosen yet. */
  needsSize: boolean;
  /** The selected colour option value, or null before a default resolves. */
  activeColor: string | null;

  publish: (selection: { input: CartInput | null; soldOut: boolean; needsSize: boolean }) => void;
  setActiveColor: (color: string) => void;
  clear: () => void;
}

const EMPTY = { input: null, soldOut: false, needsSize: false, activeColor: null } as const;

export const usePDPStore = create<PDPState>()((set) => ({
  ...EMPTY,
  publish: (selection) => set(selection),
  setActiveColor: (color) => set({ activeColor: color }),
  clear: () => set({ ...EMPTY }),
}));
