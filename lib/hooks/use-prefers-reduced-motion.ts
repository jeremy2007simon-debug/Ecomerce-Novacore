'use client';

import { useMediaQuery } from './use-media-query';

/**
 * Whether the visitor has asked for reduced motion.
 *
 * This exists instead of Motion's `useReducedMotion()` because that hook reads
 * its value through `useState(prefersReducedMotion.current)` — captured once,
 * on the very first render, before its own listener has necessarily been
 * initialised — and then never updates. Motion's own source carries a TODO
 * about exactly that.
 *
 * The practical consequence was that scenes did NOT collapse for reduced-motion
 * visitors: the media query matched, but the hook still returned false, so a
 * scene kept its full 260svh of scroll track with nothing animating in it. That
 * is precisely the failure the collapse behaviour exists to prevent.
 *
 * `useMediaQuery` is built on useSyncExternalStore, so it is SSR-safe (false on
 * the server and on the hydrating render, avoiding a mismatch) AND reactive to
 * a change made while the page is open.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
