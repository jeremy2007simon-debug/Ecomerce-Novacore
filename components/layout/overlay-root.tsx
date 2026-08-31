'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useOverlay } from '@/lib/store/ui-store';
import type { SizeGuideCopy } from '@/components/product/size-guide-drawer';
import type { Collection, Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

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
const QuickAddSheet = dynamic(
  () => import('@/components/commerce/quick-add-sheet').then((m) => m.QuickAddSheet),
  { ssr: false },
);

export function OverlayRoot({
  products,
  collections,
  locale,
  sizeGuideCopy,
  quickAddCopy,
}: {
  products: Product[];
  collections: Collection[];
  locale: Locale;
  sizeGuideCopy: SizeGuideCopy;
  quickAddCopy: { label: string };
}) {
  const overlay = useOverlay();
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    /*
      Warm AFTER the load event, not merely when the main thread goes idle.

      requestIdleCallback fires during the page's own loading window on a slow
      connection — there is idle time while the browser waits on the network —
      so the drawer, search and menu chunks were being fetched in competition
      with the LCP image. Waiting for `load` guarantees the critical path has
      finished before any of this is requested.
    */
    let handle = 0;
    const schedule = () => {
      const idle =
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback
          : (cb: IdleRequestCallback) => window.setTimeout(() => cb({} as IdleDeadline), 200);
      handle = idle(() => setWarm(true)) as unknown as number;
    };

    if (document.readyState === 'complete') {
      schedule();
      return;
    }

    window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (typeof window.cancelIdleCallback === 'function' && handle) {
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
      <SearchOverlay products={products} collections={collections} />
      <MobileMenu />
      <QuickAddSheet locale={locale} sizeGuideCopy={sizeGuideCopy} copy={quickAddCopy} />
    </>
  );
}
