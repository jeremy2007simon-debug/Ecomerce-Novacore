'use client';

import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import { Overlay } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { IconClose } from '@/components/visual/icons';
import { ContourField } from '@/components/visual/contour-field';
import { CartLineItem } from './cart-line';
import { FreeShippingMeter } from './free-shipping-meter';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useCartLines, useCartStore } from '@/lib/store/cart-store';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import { subtotal } from '@/lib/commerce/cart-math';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import { track } from '@/lib/analytics';

/**
 * Cart drawer.
 *
 * This IS the add-to-bag feedback. There is no toast: the drawer springs open,
 * the new line animates in from the right, the shipping meter fills and the
 * header badge pops. A "Added to cart ✓" notification in the corner would be
 * both less informative and less satisfying.
 */
export function CartDrawer() {
  const { t, locale, fmt } = useLocale();
  const open = useIsOverlayOpen('cart');
  const close = useUIStore((state) => state.close);
  const lines = useCartLines();
  const lastAddedId = useCartStore((state) => state.lastAddedId);

  const total = subtotal(lines);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Overlay open={open} onClose={close} placement="right" label={t.cart.title}>
      <header className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
        <div className="flex items-baseline gap-3">
          <h2 className="label text-ink">{t.cart.title}</h2>
          {count > 0 ? (
            <span className="micro-label text-ink-subtle" data-numeric>
              {count === 1 ? t.cart.itemCountOne : fmt(t.cart.itemCount, { count })}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={close}
          className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
          aria-label={t.cart.close}
        >
          <IconClose />
        </button>
      </header>

      {lines.length === 0 ? (
        <div className="relative flex grow flex-col items-center justify-center px-8 text-center">
          <ContourField
            seed="cart-empty"
            rings={20}
            className="pointer-events-none absolute inset-0 opacity-25"
          />
          <p className="relative text-title font-medium text-ink">{t.cart.empty}</p>
          <p className="relative mt-3 text-small text-ink-muted">{t.cart.emptyBody}</p>
          <Button
            as={Link}
            href={routes.collection(locale)}
            onClick={close}
            variant="outline"
            className="relative mt-8"
          >
            {t.cart.emptyCta}
          </Button>
        </div>
      ) : (
        <>
          <div className="grow overflow-y-auto overscroll-contain px-5 py-5">
            <ul>
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartLineItem key={line.lineId} line={line} isNew={line.lineId === lastAddedId} />
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <footer className="safe-bottom border-t border-hairline px-5 pt-5">
            <FreeShippingMeter lines={lines} />

            <dl className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <dt className="label text-ink-subtle">{t.cart.subtotal}</dt>
                <dd className="label text-ink" data-numeric>
                  {formatMoney(total, locale)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="label text-ink-subtle">{t.cart.shipping}</dt>
                <dd className="label text-ember">{t.cart.shippingFree}</dd>
              </div>
            </dl>

            <Button
              as={Link}
              href={routes.checkout(locale)}
              variant="solid"
              size="lg"
              block
              className="mt-5"
              onClick={() => {
                track({
                  name: 'checkout_started',
                  payload: { value: total.amount, itemCount: count },
                });
                close();
              }}
            >
              {t.cart.checkout}
            </Button>

            <p className="micro-label mt-3.5 text-center text-ink-subtle">{t.cart.taxNote}</p>
          </footer>
        </>
      )}
    </Overlay>
  );
}
