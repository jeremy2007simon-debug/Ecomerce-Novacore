'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Desktop grid density (2/3/4 columns), persisted across visits — a genuinely
 * different concern from `ui-store.ts` (deliberately NOT persisted, since
 * nobody wants a reload to find the search overlay still open). Not a URL
 * param, per the brief's own instruction.
 *
 * `skipHydration` + `hydrated` follow the exact same pattern as
 * `cart-store.ts`: the first client render must match the server-rendered
 * HTML (which has no access to localStorage), so `ProductGrid` renders the
 * DEFAULT_DENSITY until this store has rehydrated, then switches — never the
 * other way round, which would cause a hydration mismatch.
 */

export type GridDensity = 2 | 3 | 4;

export const DEFAULT_DENSITY: GridDensity = 3;

interface CollectionDensityState {
  density: GridDensity;
  hydrated: boolean;
  setDensity: (density: GridDensity) => void;
  markHydrated: () => void;
}

export const useCollectionDensityStore = create<CollectionDensityState>()(
  persist(
    (set) => ({
      density: DEFAULT_DENSITY,
      hydrated: false,
      setDensity: (density) => set({ density }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'atl.collection-density.v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ density: state.density }),
    },
  ),
);
