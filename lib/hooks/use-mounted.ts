'use client';

import { useSyncExternalStore } from 'react';

/** A store that never changes: the value differs only between server and client. */
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False during SSR and the hydrating render, true afterwards.
 *
 * Use this instead of `typeof window !== 'undefined'` inside a render body.
 * That check is false on the server and true on the client's very first render,
 * which is by definition a hydration mismatch. This hook is false on both, so
 * the trees agree, and React updates it immediately after hydration.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, getClientSnapshot, getServerSnapshot);
}
