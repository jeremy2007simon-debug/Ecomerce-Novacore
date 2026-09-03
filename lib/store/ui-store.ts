'use client';

import { create } from 'zustand';
import { track } from '@/lib/analytics';
import type { Product } from '@/types/commerce';

/**
 * Overlay and transient UI state, kept in a SEPARATE store from the cart.
 *
 * Two reasons: opening the drawer should not notify cart subscribers, and the
 * cart is persisted while none of this should be — nobody wants to reload the
 * page and find the search overlay still open.
 *
 * A single `overlay` slot rather than four booleans makes mutual exclusion
 * structural: it is not possible to have the cart and search open at once,
 * because there is nowhere to store that state.
 */

export type OverlayId =
  | 'cart'
  | 'search'
  | 'menu'
  | 'megamenu'
  | 'assistant'
  | 'quickadd'
  | 'filters'
  | 'sort'
  | 'gallery';

export type QuickAddSurface = 'home' | 'collection';

interface UIState {
  overlay: OverlayId | null;
  /** Where the assistant was opened from, for analytics attribution. */
  assistantSurface: 'pdp' | 'search' | 'nav';
  assistantHandle: string | null;
  /**
   * The product currently shown in the shared Quick Add sheet, and where it
   * was triggered from (for add_to_cart attribution). One shared sheet, many
   * triggers (every ProductCard in a collection grid, plus Home's Drop
   * section) — this is what lets a single `<Overlay id="quick-add-panel">`
   * mounted once in overlay-root.tsx show the right product regardless of
   * which trigger opened it.
   */
  quickAddProduct: Product | null;
  quickAddSurface: QuickAddSurface;

  open: (id: OverlayId, meta?: { surface?: 'pdp' | 'search' | 'nav'; handle?: string }) => void;
  close: () => void;
  toggle: (id: OverlayId) => void;
  openQuickAdd: (product: Product, surface: QuickAddSurface) => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  overlay: null,
  assistantSurface: 'nav',
  assistantHandle: null,
  quickAddProduct: null,
  quickAddSurface: 'home',

  open: (id, meta) => {
    if (id === 'assistant') {
      set({
        overlay: id,
        assistantSurface: meta?.surface ?? 'nav',
        assistantHandle: meta?.handle ?? null,
      });
      const payload: { surface: 'pdp' | 'search' | 'nav'; handle?: string } = {
        surface: meta?.surface ?? 'nav',
      };
      if (meta?.handle) payload.handle = meta.handle;
      track({ name: 'ai_assistant_opened', payload });
      return;
    }

    set({ overlay: id });
  },

  close: () => set({ overlay: null }),

  toggle: (id) => (get().overlay === id ? get().close() : get().open(id)),

  openQuickAdd: (product, surface) => set({ overlay: 'quickadd', quickAddProduct: product, quickAddSurface: surface }),
}));

export function useOverlay(): OverlayId | null {
  return useUIStore((state) => state.overlay);
}

export function useIsOverlayOpen(id: OverlayId): boolean {
  return useUIStore((state) => state.overlay === id);
}
