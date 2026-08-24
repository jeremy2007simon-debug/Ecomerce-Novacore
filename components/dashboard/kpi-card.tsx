'use client';

import { Counter } from '@/components/motion';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatMoneyRounded, formatNumber, formatPercent } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';

/**
 * A KPI figure with its change against the previous window.
 *
 * The delta carries a sign and a colour, but the arrow is a text glyph rather
 * than an icon so it inherits the tabular figure alignment — a mixed
 * icon-and-number row never quite lines up.
 */
export function KpiCard({
  label,
  value,
  format,
  delta,
  vsLabel,
}: {
  label: string;
  value: number;
  format: 'money' | 'number' | 'percent';
  delta: number;
  vsLabel: string;
}) {
  const { locale } = useLocale();

  const formatValue = (input: number) => {
    if (format === 'money') return formatMoneyRounded({ amount: Math.round(input), currencyCode: 'EUR' }, locale);
    if (format === 'percent') return formatPercent(input, locale, 1);
    return formatNumber(Math.round(input), locale);
  };

  const positive = delta >= 0;

  return (
    <div className="flex flex-col gap-3 border-t border-hairline pt-5">
      <p className="micro-label text-ink-subtle">{label}</p>
      <p className="text-title font-medium leading-none text-ink">
        <Counter to={value} format={formatValue} />
      </p>
      <p className="micro-label flex items-center gap-2" data-numeric>
        <span className={cn(positive ? 'text-positive' : 'text-negative')}>
          {positive ? '↑' : '↓'} {formatPercent(Math.abs(delta), locale, 1)}
        </span>
        <span className="text-ink-subtle">{vsLabel}</span>
      </p>
    </div>
  );
}
