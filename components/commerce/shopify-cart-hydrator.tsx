'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useShopifyCartStore } from '@/lib/store/shopify-cart-store';

/**
 * The Shopify-mode counterpart to CartHydrator (lib/store/cart-store.ts).
 *
 * Same skipHydration reasoning applies for the persisted cartId/checkoutUrl,
 * but this hydrator also re-fetches the real cart from Shopify once the id is
 * known — lines/cost are never trusted from a stale local copy, since price
 * and stock can have changed server-side since the last visit.
 *
 * Renders nothing.
 */
export function ShopifyCartHydrator() {
  const { locale } = useLocale();
  // Ref, not a dependency: the fetch below should run once on mount with
  // whatever locale is current then — a later locale switch does not need to
  // re-fetch the same cart. Written from its own effect (every render), never
  // during render itself.
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  });

  useEffect(() => {
    void useShopifyCartStore.persist.rehydrate();
    void useShopifyCartStore.getState().hydrate(localeRef.current);
  }, []);

  return null;
}
