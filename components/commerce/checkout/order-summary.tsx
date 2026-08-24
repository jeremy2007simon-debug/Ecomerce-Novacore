'use client';

import { ProductVisual } from '@/components/visual/product-visual';
import { useLocale } from '@/lib/i18n/locale-provider';
import { orderTotal, shippingCost, subtotal } from '@/lib/commerce/cart-math';
import { formatMoney } from '@/lib/utils/money';
import type { CartLine } from '@/lib/store/cart-store';
import type { DeliveryMethod } from './checkout-machine';

export function OrderSummary({
  lines,
  delivery,
}: {
  lines: CartLine[];
  delivery: DeliveryMethod;
}) {
  const { t, locale } = useLocale();

  const goods = subtotal(lines);
  const shipping = shippingCost(lines, delivery);
  const total = orderTotal(lines, delivery);

  return (
    <aside
      aria-label={t.checkout.orderSummary}
      className="rounded-xs border border-hairline bg-surface-raised p-6 lg:sticky lg:top-24"
    >
      <h2 className="label mb-6 text-ink">{t.checkout.orderSummary}</h2>

      <ul className="flex flex-col gap-5">
        {lines.map((line) => (
          <li key={line.lineId} className="flex gap-4">
            <div className="relative w-16 shrink-0">
              <ProductVisual media={line.media} slot="bag" />
              <span
                className="micro-label absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-pill bg-slate text-ink"
                data-numeric
              >
                {line.quantity}
              </span>
            </div>
            <div className="min-w-0 grow">
              <p className="truncate text-[0.875rem] font-medium text-ink">{line.title}</p>
              <p className="micro-label mt-1 text-ink-subtle">
                {line.colorLabel}
                {line.sizeLabel ? ` · ${line.sizeLabel}` : null}
              </p>
            </div>
            <p className="label shrink-0 text-ink-muted" data-numeric>
              {formatMoney(
                { amount: line.unitPrice.amount * line.quantity, currencyCode: line.unitPrice.currencyCode },
                locale,
              )}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6">
        <div className="flex items-baseline justify-between">
          <dt className="micro-label text-ink-subtle">{t.cart.subtotal}</dt>
          <dd className="text-small text-ink" data-numeric>
            {formatMoney(goods, locale)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="micro-label text-ink-subtle">{t.cart.shipping}</dt>
          <dd className="text-small text-ink" data-numeric>
            {shipping.amount === 0 ? t.cart.shippingFree : formatMoney(shipping, locale)}
          </dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-hairline pt-4">
          <dt className="label text-ink">{t.cart.total}</dt>
          <dd className="text-title font-medium text-ink" data-numeric>
            {formatMoney(total, locale)}
          </dd>
        </div>
      </dl>

      <p className="micro-label mt-5 text-ink-subtle">{t.cart.taxNote}</p>
    </aside>
  );
}
