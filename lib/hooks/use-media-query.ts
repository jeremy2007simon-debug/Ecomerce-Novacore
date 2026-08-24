'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to a media query.
 *
 * `useSyncExternalStore` rather than useState+useEffect: a MediaQueryList IS an
 * external store, and this is the primitive built for one. It also gives a
 * proper server snapshot, so there is no render-then-correct flash and no
 * setState cascade.
 *
 * The server snapshot is always `false`. Matching a media query during SSR is
 * impossible, so components that must not flash should render the default
 * (mobile) branch and enhance upward from there.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Desktop pointer — gates hover-only affordances such as cursor effects. */
export function useFinePointer(): boolean {
  return useMediaQuery('(pointer: fine)');
}

/** Below the `sm` breakpoint. Used where behaviour, not just layout, differs. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
