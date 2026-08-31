'use client';

import { useState } from 'react';
import { Overlay } from '@/components/ui/overlay';
import { Button } from '@/components/ui/button';
import { IconClose } from '@/components/visual/icons';
import { useCollectionFilters } from '@/lib/hooks/use-collection-filters';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import {
  EMPTY_COLLECTION_STATE,
  activeFilterCount,
  type CollectionQueryState,
} from '@/lib/utils/collection-url-state';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/commerce';

export interface FilterOption {
  value: string;
  label: string;
  swatchHex?: string;
}

/**
 * Desktop = instant apply, a right-hand `Overlay` panel. Mobile = draft +
 * Apply, a bottom sheet — every change stays local until "Show N products",
 * with Cancel (Escape/backdrop/close button) reverting the draft, per the
 * brief's explicit preference. One component, not two, so the two models
 * never fall out of sync with each other or with `useCollectionFilters`.
 *
 * Only size/colour options that actually occur in `scopedProducts` are shown
 * — never a facet with nothing behind it. `scopedProducts` is the collection/
 * category scoped set BEFORE size/colour/price/availability are applied (so
 * switching one facet doesn't hide the others' remaining options), used here
 * only to build the option lists and a live preview count for the mobile
 * "Show N products" button — never a second source of truth for what's
 * actually rendered in the grid (that stays the server's `ProductQuery`).
 */
export function FilterDrawer({
  scopedProducts,
  sizeOptions,
  colorOptions,
  copy,
}: {
  scopedProducts: Product[];
  sizeOptions: FilterOption[];
  colorOptions: FilterOption[];
  copy: {
    filter: string;
    close: string;
    size: string;
    color: string;
    price: string;
    priceMinPlaceholder: string;
    priceMaxPlaceholder: string;
    inStock: string;
    clearAll: string;
    showProducts: string;
  };
}) {
  const open = useIsOverlayOpen('filters');
  const openOverlay = useUIStore((state) => state.open);
  const close = useUIStore((state) => state.close);
  const { state, applyState } = useCollectionFilters();
  const isMobile = useIsMobile();

  const [draft, setDraft] = useState<CollectionQueryState>(state);

  // Reset the draft to the applied state every time the sheet opens, so a
  // cancelled edit never leaks into the next open. Adjusting state during
  // render (React's documented pattern for this) rather than in an effect —
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [openSnapshot, setOpenSnapshot] = useState(open);
  if (open !== openSnapshot) {
    setOpenSnapshot(open);
    if (open) setDraft(state);
  }

  const current = isMobile ? draft : state;

  const update = (patch: Partial<CollectionQueryState>) => {
    const next = { ...current, ...patch };
    if (isMobile) setDraft(next);
    else applyState(next);
  };

  const clear = () => {
    const cleared = { ...EMPTY_COLLECTION_STATE, sort: current.sort, collection: current.collection };
    if (isMobile) setDraft(cleared);
    else applyState(cleared);
  };

  const count = activeFilterCount(current);
  const previewCount = scopedProducts.filter((product) => matchesDraft(product, current)).length;

  return (
    <>
      <button
        type="button"
        onClick={() => openOverlay('filters')}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="filter-drawer-panel"
        className="label inline-flex items-center gap-2 text-ink transition-colors hover:text-ink-muted"
      >
        {copy.filter}
        {count > 0 ? <span data-numeric>({count})</span> : null}
      </button>

      <Overlay
        id="filter-drawer-panel"
        open={open}
        onClose={close}
        placement={isMobile ? 'bottom' : 'right'}
        label={copy.filter}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
            <p className="label text-ink">{copy.filter}</p>
            <button type="button" onClick={close} aria-label={copy.close} className="p-1 text-ink-subtle hover:text-ink">
              <IconClose className="size-4" />
            </button>
          </div>

          <div className="flex grow flex-col gap-8 overflow-y-auto px-6 py-6">
            {sizeOptions.length > 0 ? (
              <fieldset>
                <legend className="micro-label mb-3 text-ink-subtle">{copy.size}</legend>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={current.size === option.value}
                      onClick={() => update({ size: current.size === option.value ? null : option.value })}
                      className={cn(
                        'label flex h-10 min-w-10 items-center justify-center border px-3 transition-colors',
                        current.size === option.value
                          ? 'border-ink bg-paper text-void'
                          : 'border-hairline-strong text-ink-muted hover:border-mist hover:text-ink',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {colorOptions.length > 0 ? (
              <fieldset>
                <legend className="micro-label mb-3 text-ink-subtle">{copy.color}</legend>
                <div className="flex flex-col gap-1">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={current.color === option.value}
                      onClick={() => update({ color: current.color === option.value ? null : option.value })}
                      className={cn(
                        'label flex items-center gap-3 py-2 text-ink-muted transition-colors hover:text-ink',
                        current.color === option.value && 'text-ink',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="size-4 shrink-0 rounded-pill ring-1 ring-inset ring-white/20"
                        style={{ backgroundColor: option.swatchHex }}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <fieldset>
              <legend className="micro-label mb-3 text-ink-subtle">{copy.price}</legend>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={copy.priceMinPlaceholder}
                  value={current.priceMin != null ? String(Math.round(current.priceMin / 100)) : ''}
                  onChange={(event) =>
                    update({ priceMin: event.target.value ? Number(event.target.value) * 100 : null })
                  }
                  className="w-full border-b border-hairline-strong bg-transparent pb-2 text-body text-ink outline-none placeholder:text-ink-subtle focus:border-ink"
                />
                <span aria-hidden="true" className="text-ink-subtle">
                  –
                </span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={copy.priceMaxPlaceholder}
                  value={current.priceMax != null ? String(Math.round(current.priceMax / 100)) : ''}
                  onChange={(event) =>
                    update({ priceMax: event.target.value ? Number(event.target.value) * 100 : null })
                  }
                  className="w-full border-b border-hairline-strong bg-transparent pb-2 text-body text-ink outline-none placeholder:text-ink-subtle focus:border-ink"
                />
              </div>
            </fieldset>

            <label className="label flex items-center gap-3 text-ink">
              <input
                type="checkbox"
                checked={current.inStock}
                onChange={(event) => update({ inStock: event.target.checked })}
                className="size-4 accent-ember"
              />
              {copy.inStock}
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-hairline px-6 py-5">
            <button
              type="button"
              onClick={clear}
              className="micro-label shrink-0 text-ink-subtle underline decoration-hairline-strong underline-offset-4 hover:text-ink"
            >
              {copy.clearAll}
            </button>
            {isMobile ? (
              <Button
                variant="solid"
                onClick={() => {
                  applyState(draft);
                  close();
                }}
              >
                {copy.showProducts.replace('{count}', String(previewCount))}
              </Button>
            ) : null}
          </div>
        </div>
      </Overlay>
    </>
  );
}

/** Mirrors the repository's own simple filter predicates — a live preview only, never the authoritative source (that stays the server ProductQuery after Apply). */
function matchesDraft(product: Product, state: CollectionQueryState): boolean {
  if (state.size) {
    const has = product.options
      .find((option) => option.name === 'size')
      ?.values.some((value) => value.value === state.size && value.available);
    if (!has) return false;
  }
  if (state.color) {
    const has = product.options
      .find((option) => option.name === 'color')
      ?.values.some((value) => value.value === state.color && value.available);
    if (!has) return false;
  }
  if (state.priceMin != null && product.priceRange.min.amount < state.priceMin) return false;
  if (state.priceMax != null && product.priceRange.min.amount > state.priceMax) return false;
  if (state.inStock && !product.availableForSale) return false;
  return true;
}
