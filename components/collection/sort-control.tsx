'use client';

import { Overlay } from '@/components/ui/overlay';
import { IconCheck } from '@/components/visual/icons';
import { useCollectionFilters } from '@/lib/hooks/use-collection-filters';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';
import type { ProductSort } from '@/types/commerce';

const SORTS: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'rating', 'newest'];

/**
 * Desktop: an inline row of buttons, same visual language as the original
 * toolbar. Mobile: a compact bottom sheet with radio-style options, per the
 * brief's own preference over a native `<select>`, which reads as a stock
 * theme control rather than something built for this brand. Sort is a
 * single-value choice, so unlike the filter drawer it applies instantly on
 * both — a draft+Apply step would be ceremony for a one-tap decision.
 */
export function SortControl({
  label,
  options,
}: {
  label: string;
  options: Record<ProductSort, string>;
}) {
  const { state, applyState } = useCollectionFilters();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="micro-label shrink-0 text-ink-subtle">{label}</span>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {SORTS.map((sort) => (
            <li key={sort}>
              <button
                type="button"
                aria-pressed={state.sort === sort}
                onClick={() => applyState({ ...state, sort })}
                className={cn(
                  'micro-label whitespace-nowrap transition-colors',
                  state.sort === sort ? 'text-ember' : 'text-ink-subtle hover:text-ink',
                )}
              >
                {options[sort]}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <MobileSort label={label} options={options} sort={state.sort} onChange={(sort) => applyState({ ...state, sort })} />;
}

function MobileSort({
  label,
  options,
  sort,
  onChange,
}: {
  label: string;
  options: Record<ProductSort, string>;
  sort: ProductSort;
  onChange: (sort: ProductSort) => void;
}) {
  const open = useIsOverlayOpen('sort');
  const openOverlay = useUIStore((state) => state.open);
  const close = useUIStore((state) => state.close);

  return (
    <>
      <button
        type="button"
        onClick={() => openOverlay('sort')}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="sort-panel"
        className="micro-label text-ink-subtle"
      >
        {label}
      </button>

      <Overlay id="sort-panel" open={open} onClose={close} placement="bottom" label={label}>
        <div className="flex flex-col">
          <div className="border-b border-hairline px-6 py-5">
            <p className="label text-ink">{label}</p>
          </div>
          <ul className="flex flex-col px-6 py-2">
            {SORTS.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    close();
                  }}
                  className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
                >
                  <span className={cn('label', sort === option ? 'text-ink' : 'text-ink-muted')}>
                    {options[option]}
                  </span>
                  {sort === option ? <IconCheck className="size-4 text-ember" /> : null}
                </button>
              </li>
            ))}
          </ul>
          <div className="h-6 shrink-0 safe-bottom" />
        </div>
      </Overlay>
    </>
  );
}
