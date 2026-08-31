'use client';

import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import { Overlay } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { IconClose } from '@/components/visual/icons';
import { ContourField } from '@/components/visual/contour-field';
import { CartLineItem, type CartLineDisplay } from './cart-line';
import { FreeShippingMeter } from './free-shipping-meter';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useIsDemoMode } from '@/lib/commerce/is-demo-mode';
import { useCartLines, useCartStore } from '@/lib/store/cart-store';
import { useShopifyCartLines, useShopifyCartStore } from '@/lib/store/shopify-cart-store';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import { subtotal } from '@/lib/commerce/cart-math';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import { track } from '@/lib/analytics';
import type { Money } from '@/types/commerce';

/** A real Shopify cart line carries no per-variant stock ceiling in the cart response — cap the stepper at a sane default, same fallback purchase-panel.tsx uses when quantityAvailable is unknown. */
const SHOPIFY_LINE_MAX_QUANTITY = 10;

/**
 * Cart drawer.
 *
 * This IS the add-to-bag feedback. There is no toast: the drawer springs open,
 * the new line animates in from the right, the shipping meter fills and the
 * header badge pops. A "Added to cart ✓" notification in the corner would be
 * both less informative and less satisfying.
 *
 * Demo mode and Shopify mode diverge here: the demo cart is local truth, the
 * Shopify cart is server truth reached through lib/store/shopify-cart-store.ts.
 * The free shipping meter is demo-only — it estimates against a flat
 * threshold that has no equivalent in the Shopify cart response.
 */
export function CartDrawer() {
  const { t, locale, fmt } = useLocale();
  const isDemoMode = useIsDemoMode();
  const open = useIsOverlayOpen('cart');
  const close = useUIStore((state) => state.close);

  const demoLines = useCartLines();
  const demoLastAddedId = useCartStore((state) => state.lastAddedId);
  const setDemoQuantity = useCartStore((state) => state.setQuantity);
  const removeDemoLine = useCartStore((state) => state.remove);

  const shopifyLines = useShopifyCartLines();
  const shopifyCost = useShopifyCartStore((state) => state.cost);
  const shopifyCheckoutUrl = useShopifyCartStore((state) => state.checkoutUrl);
  const shopifyError = useShopifyCartStore((state) => state.error);
  const dismissShopifyError = useShopifyCartStore((state) => state.dismissError);
  const updateShopifyQuantity = useShopifyCartStore((state) => state.updateQuantity);
  const removeShopifyLine = useShopifyCartStore((state) => state.remove);

  const lines: CartLineDisplay[] = isDemoMode
    ? demoLines.map((l) => ({
        lineId: l.lineId,
        handle: l.handle,
        title: l.title,
        colorLabel: l.colorLabel,
        colorHex: l.colorHex,
        sizeLabel: l.sizeLabel,
        quantity: l.quantity,
        maxQuantity: l.maxQuantity,
        media: l.media,
      }))
    : shopifyLines.map((l) => ({
        lineId: l.lineId,
        handle: l.handle,
        title: l.title,
        colorLabel: l.colorLabel,
        colorHex: null,
        sizeLabel: l.sizeLabel,
        quantity: l.quantity,
        maxQuantity: SHOPIFY_LINE_MAX_QUANTITY,
        media: l.media,
      }));

  const lineTotal = (lineId: string): Money => {
    if (isDemoMode) {
      const line = demoLines.find((l) => l.lineId === lineId)!;
      return { amount: line.unitPrice.amount * line.quantity, currencyCode: line.unitPrice.currencyCode };
    }
    return shopifyLines.find((l) => l.lineId === lineId)!.lineTotal;
  };

  const total = isDemoMode ? subtotal(demoLines) : shopifyCost.subtotal;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const lastAddedId = isDemoMode ? demoLastAddedId : null;

  return (
    <Overlay id="cart-drawer-panel" open={open} onClose={close} placement="right" label={t.cart.title}>
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

      {!isDemoMode && shopifyError ? (
        <p
          role="alert"
          className="mx-5 mt-4 border border-hairline-strong bg-white/[0.03] px-4 py-3 text-small text-ink"
        >
          {shopifyError}{' '}
          <button
            type="button"
            onClick={dismissShopifyError}
            className="underline decoration-hairline-strong underline-offset-4"
          >
            {t.cart.close}
          </button>
        </p>
      ) : null}

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
                  <CartLineItem
                    key={line.lineId}
                    line={line}
                    lineTotal={lineTotal(line.lineId)}
                    isNew={line.lineId === lastAddedId}
                    onQuantityChange={(next) =>
                      isDemoMode
                        ? setDemoQuantity(line.lineId, next)
                        : void updateShopifyQuantity(line.lineId, next, locale)
                    }
                    onRemove={() =>
                      isDemoMode ? removeDemoLine(line.lineId) : void removeShopifyLine(line.lineId, locale)
                    }
                  />
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <footer className="safe-bottom border-t border-hairline px-5 pt-5">
            {isDemoMode ? <FreeShippingMeter lines={demoLines} /> : null}

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

            {isDemoMode ? (
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
            ) : (
              <Button
                as="a"
                href={shopifyCheckoutUrl ?? undefined}
                rel="noopener"
                variant="solid"
                size="lg"
                block
                className="mt-5"
                aria-disabled={!shopifyCheckoutUrl}
                onClick={(event) => {
                  if (!shopifyCheckoutUrl) {
                    event.preventDefault();
                    return;
                  }
                  track({
                    name: 'checkout_started',
                    payload: { value: total.amount, itemCount: count },
                  });
                }}
              >
                {t.cart.checkout}
              </Button>
            )}

            <p className="micro-label mt-3.5 text-center text-ink-subtle">{t.cart.taxNote}</p>
          </footer>
        </>
      )}
    </Overlay>
  );
}
