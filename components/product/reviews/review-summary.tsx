import { Stars } from './stars';
import { cn } from '@/lib/utils/cn';
import type { ReviewSummary as Summary } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Rating summary: headline figure, distribution bars, and a fit meter.
 *
 * The distribution bars use scaleX on a transform, not width, for the same
 * reason as the shipping meter — width animates on the layout thread.
 *
 * The fit meter is included because it is the single most useful piece of
 * information on an apparel review block, and almost every template omits it.
 */
export function ReviewSummaryPanel({
  summary,
  locale,
  copy,
}: {
  summary: Summary;
  locale: Locale;
  copy: {
    basedOn: string;
    recommend: string;
    fitTitle: string;
    fitSmall: string;
    fitTrue: string;
    fitLarge: string;
  };
}) {
  const total = summary.distribution.reduce((sum, n) => sum + n, 0) || 1;
  const fmt = (template: string, vars: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));

  // fitBias runs -1 (small) → +1 (large); map onto a 0–100% marker position.
  const fitPercent = ((summary.fitBias + 1) / 2) * 100;

  return (
    <div className="grid gap-12 lg:grid-cols-[auto_1fr_1fr] lg:gap-16">
      <div>
        {/*
          `text-headline`, not `text-hero`.

          `--text-hero` tops out at 13rem — 208px — and it was set beside a
          distribution block only 87px tall, so "4,9" was more than twice the
          height of everything it summarises and claimed a quarter of the row's
          width. `--text-headline` (68px at its ceiling) reads as the figure
          that heads this block without dwarfing it.
        */}
        <p className="text-headline font-medium leading-none text-ink" data-numeric>
          {summary.average.toFixed(1).replace('.', locale === 'es' ? ',' : '.')}
        </p>
        <Stars value={summary.average} size={16} className="mt-4" />
        <p className="micro-label mt-3 text-ink-subtle" data-numeric>
          {fmt(copy.basedOn, { count: summary.count })}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star - 1] ?? 0;
          const ratio = count / total;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="micro-label w-3 shrink-0 text-ink-subtle" data-numeric>
                {star}
              </span>
              <span className="h-px grow bg-hairline-strong">
                <span
                  className="block h-full origin-left bg-ember"
                  style={{ transform: `scaleX(${ratio})` }}
                />
              </span>
              <span className="micro-label w-8 shrink-0 text-right text-ink-subtle" data-numeric>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col justify-center">
        <p className="label mb-5 text-ink-subtle">{copy.fitTitle}</p>
        <div className="relative h-px w-full bg-hairline-strong">
          <span
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-ember"
            style={{ left: `${fitPercent}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between">
          <span className="micro-label text-ink-subtle">{copy.fitSmall}</span>
          <span className={cn('micro-label', Math.abs(summary.fitBias) < 0.2 ? 'text-ink' : 'text-ink-subtle')}>
            {copy.fitTrue}
          </span>
          <span className="micro-label text-ink-subtle">{copy.fitLarge}</span>
        </div>

        <p className="micro-label mt-8 text-ember" data-numeric>
          {fmt(copy.recommend, { percent: summary.recommendPercent })}
        </p>
      </div>
    </div>
  );
}
