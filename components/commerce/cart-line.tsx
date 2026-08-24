'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { ProductVisual } from '@/components/visual/product-visual';
import { QuantityStepper } from './quantity-stepper';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useCartStore, type CartLine as Line } from '@/lib/store/cart-store';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';

export function CartLineItem({ line, isNew }: { line: Line; isNew: boolean }) {
  const { t, locale } = useLocale();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);

  return (
    <m.li
      layout
      // A newly added line arrives with a little more travel than the others,
      // so the eye lands on the thing that just changed.
      initial={isNew ? { opacity: 0, x: 28 } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className="flex gap-4 border-b border-hairline py-5 first:pt-0"
    >
      <Link href={routes.product(locale, line.handle)} className="w-[5.5rem] shrink-0">
        <ProductVisual media={line.media} slot="bag" />
      </Link>

      <div className="flex min-w-0 grow flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={routes.product(locale, line.handle)}>
              <h3 className="truncate text-[0.9375rem] font-medium leading-snug text-ink">
                {line.title}
              </h3>
            </Link>
            <p className="micro-label mt-1.5 flex items-center gap-2 text-ink-subtle">
              <span
                aria-hidden="true"
                className="size-2 rounded-pill ring-1 ring-inset ring-white/20"
                style={{ backgroundColor: line.colorHex }}
              />
              {line.colorLabel}
              {line.sizeLabel ? ` · ${line.sizeLabel}` : null}
            </p>
          </div>

          <p className="label shrink-0 text-ink" data-numeric>
            {formatMoney(
              { amount: line.unitPrice.amount * line.quantity, currencyCode: line.unitPrice.currencyCode },
              locale,
            )}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            quantity={line.quantity}
            max={line.maxQuantity}
            onChange={(next) => setQuantity(line.lineId, next)}
          />
          <button
            type="button"
            onClick={() => remove(line.lineId)}
            className="micro-label text-ink-subtle underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-ink"
          >
            {t.cart.remove}
          </button>
        </div>
      </div>
    </m.li>
  );
}
