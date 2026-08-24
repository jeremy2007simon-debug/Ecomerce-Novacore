'use client';

import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useUIStore } from '@/lib/store/ui-store';
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
  const openOverlay = useUIStore((state) => state.open);
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
              Scrolls back to the real control rather than duplicating variant
              state. Two sources of truth for "which size is selected" is a bug
              waiting to happen, and the picker is what the shopper needs anyway.
            */}
            <button
              type="button"
              onClick={() => {
                document.getElementById(watchId)?.scrollIntoView({ block: 'center' });
                if (!product.availableForSale) openOverlay('cart');
              }}
              className="label h-11 shrink-0 rounded-xs bg-paper px-6 text-void transition-colors hover:bg-bone active:scale-[0.985]"
            >
              {t.product.addToBag}
            </button>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
