'use client';

import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AddToBag } from '@/components/commerce/add-to-bag';
import { useLocale } from '@/lib/i18n/locale-provider';
import { usePDPStore } from '@/lib/store/pdp-store';
import { formatMoney } from '@/lib/utils/money';
import type { Product } from '@/types/commerce';

/**
 * Mobile sticky buy bar.
 *
 * Appears only once the real ADD TO BAG has scrolled out of view, which is
 * detected with an IntersectionObserver on that button — NOT with scroll
 * position maths. Scroll-position thresholds break the moment the layout
 * changes; an observer on the element itself cannot.
 *
 * `safe-bottom` pads for env(safe-area-inset-bottom); without it the bar sits
 * underneath the iPhone home indicator, which is exactly the kind of detail
 * that makes a demo feel unfinished on the device it is being demoed on.
 *
 * The bar is fixed, so it reserves no layout space and covers whatever is at
 * the bottom of the viewport. `--spacing-buy-bar` is the token other sections
 * pad by to clear it; the bar claims that token as its own min-height so the
 * two can never drift apart.
 */
export function StickyBuyBar({
  product,
  locale,
  watchId,
}: {
  product: Product;
  locale: 'es' | 'en';
  watchId: string;
}) {
  const { t } = useLocale();
  // Read-only: `PurchasePanel` owns the selection and publishes it here.
  const input = usePDPStore((state) => state.input);
  const soldOut = usePDPStore((state) => state.soldOut);
  const [visible, setVisible] = useState(false);
  const observed = useRef(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;

    observed.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the bar when the primary CTA has scrolled ABOVE the viewport,
        // not when it is merely off screen in either direction.
        const above = (entry?.boundingClientRect.top ?? 0) < 0;
        setVisible(!entry?.isIntersecting && above);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <AnimatePresence>
      {visible ? (
        <m.div
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ type: 'spring', stiffness: 420, damping: 40 }}
          className="safe-bottom fixed inset-x-0 bottom-0 z-(--z-sticky) min-h-(--spacing-buy-bar) border-t border-hairline-strong bg-void/94 px-4 pt-3 backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0 grow">
              <p className="truncate text-[0.875rem] font-medium text-ink">{product.title}</p>
              <p className="micro-label text-ink-subtle" data-numeric>
                {formatMoney(product.priceRange.min, locale)}
              </p>
            </div>

            {/*
              A real ADD TO BAG.

              It used to be labelled "add to bag" and only scroll — and,
              through an inverted condition, opened the cart when the item was
              SOLD OUT rather than when it had been added. Now it reads the
              selection `PurchasePanel` publishes and adds the same variant the
              panel would, opening the drawer exactly as the primary control
              does.

              When there is nothing addable yet the button says so instead of
              lying: with a size still to pick it reads "select a size" and
              takes you to the picker; when the variant is sold out it is
              disabled and says sold out.
            */}
            {input ? (
              <AddToBag input={input} size="md" block={false} className="shrink-0 px-6" />
            ) : (
              <button
                type="button"
                disabled={soldOut}
                onClick={() => {
                  const target = document.getElementById(watchId);
                  target?.scrollIntoView({ block: 'center' });
                  // Move focus with the scroll, so a keyboard or screen-reader
                  // user lands on the picker rather than being left behind on a
                  // button that has just scrolled off screen.
                  target?.querySelector<HTMLElement>('button:not([disabled])')?.focus({
                    preventScroll: true,
                  });
                }}
                className="label h-11 shrink-0 rounded-xs bg-paper px-6 text-void transition-colors duration-(--duration-fast) hover:bg-bone active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40"
              >
                {soldOut ? t.product.soldOut : t.product.selectSizeFirst}
              </button>
            )}
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
