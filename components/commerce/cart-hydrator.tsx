'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';

/**
 * Rehydrates the persisted cart, once, after the first paint.
 *
 * This is the other half of `skipHydration: true` in cart-store.ts. Reading
 * localStorage here rather than at module scope means the first client render
 * matches the server-rendered HTML exactly, so React never discards the tree.
 *
 * Renders nothing.
 */
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    useCartStore.getState().markHydrated();
  }, []);

  return null;
}
