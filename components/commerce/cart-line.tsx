'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { ProductVisual } from '@/components/visual/product-visual';
import { QuantityStepper } from './quantity-stepper';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import type { Money } from '@/types/commerce';
import type { ProductMedia } from '@/types/visual';

/**
 * Display shape both cart stores can produce. `colorHex` is nullable because
 * a Shopify cart line's `merchandise.selectedOptions` carries a colour NAME
 * but no swatch hex — the demo store's own colourway data supplies it, the
 * Shopify one does not, and this component shows a name-only label instead
 * of inventing a hex.
 */
export interface CartLineDisplay {
  lineId: string;
  handle: string;
  title: string;
  colorLabel: string;
  colorHex: string | null;
  sizeLabel: string | null;
  quantity: number;
  maxQuantity: number;
  media: ProductMedia | null;
}

export function CartLineItem({
  line,
  lineTotal,
  isNew,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineDisplay;
  /** Pre-computed line total — unitPrice × quantity for the demo cart, cost.totalAmount as-is for Shopify's. */
  lineTotal: Money;
  isNew: boolean;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
}) {
  const { t, locale } = useLocale();

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
        {line.media ? (
          <ProductVisual media={line.media} slot="bag" />
        ) : (
          // A Shopify cart line's merchandise can genuinely have no image —
          // the demo cart's media is always present (build-product.ts
          // guarantees it), so only this branch needs a placeholder.
          <div className="aspect-[4/5] rounded-xs bg-white/[0.04]" />
        )}
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
              {line.colorHex ? (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-pill ring-1 ring-inset ring-white/20"
                  style={{ backgroundColor: line.colorHex }}
                />
              ) : null}
              {line.colorLabel}
              {line.sizeLabel ? ` · ${line.sizeLabel}` : null}
            </p>
          </div>

          <p className="label shrink-0 text-ink" data-numeric>
            {formatMoney(lineTotal, locale)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper quantity={line.quantity} max={line.maxQuantity} onChange={onQuantityChange} />
          <button
            type="button"
            onClick={onRemove}
            className="micro-label text-ink-subtle underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-ink"
          >
            {t.cart.remove}
          </button>
        </div>
      </div>
    </m.li>
  );
}
