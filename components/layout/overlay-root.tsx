'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useOverlay } from '@/lib/store/ui-store';
import type { Collection, Product } from '@/types/commerce';

/**
 * Mounts the overlays, lazily.
 *
 * Each is a `next/dynamic` chunk with `ssr: false`, so none of this JavaScript
 * is on the initial page load — a visitor who never opens the cart never
 * downloads the cart drawer.
 *
 * They are prefetched on requestIdleCallback rather than on first click,
 * because a drawer that has to fetch its own code before opening feels slower
 * than one that was always there. Idle prefetch gets both: nothing on the
 * critical path, and an instant first open.
 */

const CartDrawer = dynamic(() => import('@/components/commerce/cart-drawer').then((m) => m.CartDrawer), {
  ssr: false,
});
const SearchOverlay = dynamic(
  () => import('@/components/commerce/search-overlay').then((m) => m.SearchOverlay),
  { ssr: false },
);
const MobileMenu = dynamic(() => import('@/components/layout/mobile-menu').then((m) => m.MobileMenu), {
  ssr: false,
});

export function OverlayRoot({
  products,
  collections,
  nav,
}: {
  products: Product[];
  collections: Collection[];
  nav: { shop: string; story: string; close: string; menu: string };
}) {
  const overlay = useOverlay();
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const idle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback
        : (cb: IdleRequestCallback) => window.setTimeout(() => cb({} as IdleDeadline), 1400);

    const handle = idle(() => setWarm(true));
    return () => {
      if (typeof window.cancelIdleCallback === 'function' && typeof handle === 'number') {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  // Mount once anything has been opened, or once the browser has gone idle.
  const shouldMount = warm || overlay !== null;
  if (!shouldMount) return null;

  return (
    <>
      <CartDrawer />
      <SearchOverlay products={products} />
      <MobileMenu collections={collections} nav={nav} />
    </>
  );
}
