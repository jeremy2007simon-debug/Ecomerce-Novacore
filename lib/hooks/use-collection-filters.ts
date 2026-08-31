'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { useCallback, useMemo } from 'react';
import {
  EMPTY_COLLECTION_STATE,
  parseCollectionQueryState,
  serializeCollectionQueryState,
  type CollectionQueryState,
} from '@/lib/utils/collection-url-state';

/**
 * Reads/writes collection filter state from the URL — the same mechanics
 * `CollectionToolbar` already established (`router.push`, not `replace`, so
 * Back undoes one filter at a time; `scroll: false` so applying a filter
 * doesn't jump the page to the top), generalized for the new filter set via
 * the shared parse/serialize in lib/utils/collection-url-state.ts.
 *
 * This hook always writes the FULL next state, not a patch — callers pass
 * `{...state, size: 'M'}` rather than a partial, which is what keeps desktop
 * (instant apply) and mobile (draft + Apply) both correct: the mobile drawer
 * holds its own local draft `useState` seeded from `state` and only calls
 * `applyState(draft)` once, on "Show N products".
 */
export function useCollectionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => parseCollectionQueryState(searchParams), [searchParams]);

  const applyState = useCallback(
    (next: CollectionQueryState) => {
      const query = serializeCollectionQueryState(next).toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
    },
    [router, pathname],
  );

  /** Clears every filter but preserves sort — a deliberate choice, not an oversight. */
  const clearFilters = useCallback(() => {
    applyState({ ...EMPTY_COLLECTION_STATE, sort: state.sort });
  }, [applyState, state.sort]);

  return { state, applyState, clearFilters };
}
