'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useScene } from './scene-context';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STICKY STAGE — pins its children while the surrounding scene scrolls past.
 *
 * ⚠️  THE STICKY KILL-LIST  ⚠️
 *
 * `position: sticky` silently stops working — with no error, and usually only
 * on iOS — if ANY ancestor has:
 *
 *     overflow: hidden | auto | scroll      contain: paint
 *     transform (any, including none→matrix) content-visibility: auto
 *     filter                                 backdrop-filter
 *
 * Consequences that are already baked into this codebase, and must stay:
 *   • body uses `overflow-x: clip`, never `hidden` (clip does not create a
 *     scroll container)
 *   • clipping happens on leaf elements via clip-path or `overflow: clip`
 *   • `content-visibility` is only ever applied to non-sticky sections
 *   • every overlay portals to document.body, so no transformed ancestor can
 *     capture its `position: fixed`
 *
 * If a scene ever stops pinning, look for a newly added wrapper before looking
 * anywhere else.
 *
 * Height is svh, never vh or dvh: 100vh on iOS is the LARGE viewport, so the
 * stage is clipped by the toolbar on load; dvh changes as the toolbar collapses,
 * which resizes the scene mid-scroll and invalidates useScroll's measurements.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function StickyStage({
  height = 100,
  align = 'center',
  className,
  children,
}: {
  height?: number;
  align?: 'center' | 'start' | 'end';
  className?: string;
  children: ReactNode;
}) {
  const { reduced } = useScene();
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Promote to a compositor layer only while the stage is on screen.
   *
   * `will-change` applied permanently holds a full-resolution GPU texture for
   * the life of the page; iOS has a hard memory ceiling after which it starts
   * evicting and repainting, which is far worse than never promoting at all.
   */
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.active = entry?.isIntersecting ? 'true' : 'false';
      },
      { rootMargin: '20% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      data-active="false"
      className={cn(
        'flex w-full flex-col',
        align === 'center' && 'justify-center',
        align === 'start' && 'justify-start',
        align === 'end' && 'justify-end',
        className,
        // Positioning comes LAST so it always wins the tailwind-merge conflict
        // resolution. A caller passing `relative` in its own className (to set a
        // containing block for absolutely positioned children) would otherwise
        // silently strip `sticky` and the scene would stop pinning — which is
        // exactly what happened the first time, and it looks like a scroll bug
        // rather than a class-order bug.
        //
        // Under reduced motion the scene has collapsed, so pinning would leave
        // the content stranded. Fall back to normal flow.
        reduced ? 'relative' : 'sticky top-0',
      )}
      style={reduced ? { minHeight: `${height}svh` } : { height: `${height}svh` }}
    >
      {children}
    </div>
  );
}
