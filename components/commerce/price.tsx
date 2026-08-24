import { cn } from '@/lib/utils/cn';
import { formatMoney } from '@/lib/utils/money';
import type { Money } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Price display. Server-safe: Intl formatting is identical on both sides of
 * hydration, so this never needs to be a client component.
 *
 * `data-numeric` applies tabular figures — without it, prices in a grid sit at
 * slightly different widths and the column stops looking aligned.
 */
export function Price({
  value,
  compareAt,
  locale,
  className,
  size = 'body',
}: {
  value: Money;
  compareAt?: Money | null;
  locale: Locale;
  className?: string;
  size?: 'body' | 'label' | 'title';
}) {
  const onSale = compareAt && compareAt.amount > value.amount;

  return (
    <span className={cn('inline-flex items-baseline gap-2.5', className)} data-numeric>
      <span
        className={cn(
          size === 'label' && 'label',
          size === 'body' && 'text-small',
          size === 'title' && 'text-title font-medium',
          onSale && 'text-ember',
        )}
      >
        {formatMoney(value, locale)}
      </span>
      {onSale ? (
        <s className={cn('text-ink-subtle', size === 'title' ? 'text-small' : 'text-micro')}>
          {formatMoney(compareAt, locale)}
        </s>
      ) : null}
    </span>
  );
}
