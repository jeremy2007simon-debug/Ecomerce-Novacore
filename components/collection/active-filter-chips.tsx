'use client';

import { IconClose } from '@/components/visual/icons';
import { useCollectionFilters } from '@/lib/hooks/use-collection-filters';
import type { FilterOption } from '@/components/collection/filter-drawer';

/**
 * "SIZE: M ×  COLOR: BLACK ×  CLEAR ALL" — reads straight from the URL via
 * `useCollectionFilters`, same source of truth as the filter drawer, so the
 * two can never disagree about what's active.
 *
 * `sizeOptions`/`colorOptions` resolve the stored option VALUE (a stable
 * identifier, e.g. "basalt") to its real display label (e.g. "Basalto") —
 * the same option lists the filter drawer itself renders, never guessed.
 * Passed as plain data (not functions) because this is a Client Component
 * rendered from the server page — functions can't cross that boundary.
 */
export function ActiveFilterChips({
  sizeOptions,
  colorOptions,
  copy,
}: {
  sizeOptions: FilterOption[];
  colorOptions: FilterOption[];
  copy: { size: string; color: string; price: string; inStock: string; clearAll: string };
}) {
  const { state, applyState, clearFilters } = useCollectionFilters();

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (state.size) {
    const sizeValue = state.size;
    chips.push({
      key: 'size',
      label: `${copy.size}: ${sizeOptions.find((o) => o.value === sizeValue)?.label ?? sizeValue}`,
      onRemove: () => applyState({ ...state, size: null }),
    });
  }
  if (state.color) {
    const colorValue = state.color;
    chips.push({
      key: 'color',
      label: `${copy.color}: ${colorOptions.find((o) => o.value === colorValue)?.label ?? colorValue}`,
      onRemove: () => applyState({ ...state, color: null }),
    });
  }
  if (state.priceMin != null || state.priceMax != null) {
    chips.push({
      key: 'price',
      label: copy.price,
      onRemove: () => applyState({ ...state, priceMin: null, priceMax: null }),
    });
  }
  if (state.inStock) {
    chips.push({
      key: 'availability',
      label: copy.inStock,
      onRemove: () => applyState({ ...state, inStock: false }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="label inline-flex items-center gap-1.5 rounded-pill border border-hairline-strong px-3 py-1.5 text-ink-muted transition-colors hover:border-ember hover:text-ink"
        >
          {chip.label}
          <IconClose className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearFilters}
        className="micro-label text-ink-subtle underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-ink"
      >
        {copy.clearAll}
      </button>
    </div>
  );
}
