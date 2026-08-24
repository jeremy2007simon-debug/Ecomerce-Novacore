'use client';

import { useEffect } from 'react';

/**
 * Locks body scroll while an overlay is open.
 *
 * Compensates for the scrollbar's width so the page does not shift sideways
 * when it disappears — that jump is small, but it is the difference between an
 * overlay that feels engineered and one that feels bolted on.
 *
 * `position: fixed` on the body is NOT used, even though it is the usual iOS
 * workaround: it loses scroll position, and it would create a containing block
 * that breaks every position:sticky element on the page underneath.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [active]);
}
