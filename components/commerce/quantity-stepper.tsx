'use client';

import { IconMinus, IconPlus } from '@/components/visual/icons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

/**
 * Quantity control.
 *
 * The minus button stops at 1, and that is the whole point of it stopping.
 * It used to call `onChange(0)`, which deleted the line outright — a button
 * labelled "reduce quantity", with no confirmation, that removed the item.
 * Removing is a different decision from reducing, it is destructive, and the
 * cart line already carries its own REMOVE control beside this one.
 */
export function QuantityStepper({
  quantity,
  max,
  onChange,
  className,
}: {
  quantity: number;
  max: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        className="flex size-8 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        aria-label={t.cart.decrease}
      >
        <IconMinus className="size-3.5" />
      </button>

      {/* Fixed width + tabular figures: the row must not shift when 9 becomes 10. */}
      <span className="label w-6 text-center text-ink" data-numeric aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        className="flex size-8 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
        aria-label={t.cart.increase}
      >
        <IconPlus className="size-3.5" />
      </button>
    </div>
  );
}
