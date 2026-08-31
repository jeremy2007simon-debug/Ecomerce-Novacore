'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  DEFAULT_DENSITY,
  useCollectionDensityStore,
  type GridDensity,
} from '@/lib/store/collection-density-store';

const OPTIONS: GridDensity[] = [2, 3, 4];

/**
 * Desktop-only 2/3/4 column control. Not shown on mobile — the brief is
 * explicit that mobile stays a fixed 2-column grid, where a density toggle
 * adds a control nobody there can use meaningfully.
 */
export function GridDensityControl({ ariaLabelTemplate }: { ariaLabelTemplate: string }) {
  const density = useCollectionDensityStore((state) => state.density);
  const hydrated = useCollectionDensityStore((state) => state.hydrated);
  const setDensity = useCollectionDensityStore((state) => state.setDensity);

  useEffect(() => {
    void useCollectionDensityStore.persist.rehydrate();
    useCollectionDensityStore.getState().markHydrated();
  }, []);

  const shown = hydrated ? density : DEFAULT_DENSITY;

  return (
    <div className="hidden items-center gap-1 lg:flex" role="group">
      {OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          aria-label={ariaLabelTemplate.replace('{count}', String(n))}
          aria-pressed={shown === n}
          onClick={() => setDensity(n)}
          className={cn(
            'micro-label flex size-7 items-center justify-center rounded-xs transition-colors',
            shown === n ? 'bg-surface-inset text-ink' : 'text-ink-subtle hover:text-ink',
          )}
          data-numeric
        >
          {n}
        </button>
      ))}
    </div>
  );
}
