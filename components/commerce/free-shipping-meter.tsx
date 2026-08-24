'use client';

import * as m from 'motion/react-m';
import { useLocale } from '@/lib/i18n/locale-provider';
import { freeShippingProgress, freeShippingRemaining } from '@/lib/commerce/cart-math';
import { formatMoney } from '@/lib/utils/money';
import type { CartLine } from '@/lib/store/cart-store';

/**
 * Progress toward free express shipping.
 *
 * The bar animates scaleX with transform-origin: left — NOT width. Animating
 * width forces layout on every frame; scaleX runs on the compositor. This is
 * the single most-repeated mistake in progress indicators and it is free to
 * avoid.
 */
export function FreeShippingMeter({ lines }: { lines: CartLine[] }) {
  const { t, fmt, locale } = useLocale();

  const progress = freeShippingProgress(lines);
  const remaining = freeShippingRemaining(lines);
  const unlocked = remaining.amount === 0;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="micro-label text-ink-muted">
        {unlocked
          ? t.cart.freeShippingUnlocked
          : fmt(t.cart.freeShippingProgress, { amount: formatMoney(remaining, locale) })}
      </p>

      <div
        className="h-px w-full origin-left bg-hairline-strong"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={t.cart.shipping}
      >
        <m.div
          className="h-full w-full origin-left bg-ember"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ type: 'spring', stiffness: 260, damping: 34 }}
        />
      </div>
    </div>
  );
}
