'use client';

import { useScroll, useSpring, useMotionValue, type UseScrollOptions } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { useMemo, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { SceneContext, type SceneContextValue } from './scene-context';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SCROLL SCENE — the spine of the storytelling sections.
 *
 * Owns exactly ONE useScroll for its range and publishes the progress through
 * context. Layers inside derive their own transforms with useTransform, so ten
 * animated elements cost one scroll subscription and zero React re-renders.
 *
 * REDUCED MOTION COLLAPSES THE SCENE.
 *
 * This is the part that is usually got wrong. Disabling the animation while
 * leaving a 240svh pinned section in place means a visitor with reduced motion
 * enabled scrolls through two screens of nothing to reach the next section —
 * a worse experience than the animation was. Here the scene collapses to its
 * natural height and progress is pinned at the end state, so they see the
 * finished composition immediately.
 *
 * The spring on progress is also deliberate: it is what produces the "premium"
 * lag between finger and content WITHOUT hijacking the scroll itself. Smooth
 * scroll libraries buy the same feel by replacing native momentum, which on
 * iOS reads as broken within one flick and — because they transform a wrapper
 * element — destroy every position:sticky containing block on the page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ScrollSceneProps {
  id: string;
  /** Scroll distance the scene occupies. Ignored under reduced motion. */
  length?: string;
  /** Spring the raw progress. `false` scrubs 1:1 with the scrollbar. */
  smooth?: boolean | { stiffness?: number; damping?: number };
  /**
   * Motion offset syntax, e.g. ['start start', 'end end'].
   * Typed as Motion's own ScrollOffset rather than string[], so a malformed
   * offset is a compile error instead of a scene that silently never animates.
   */
  offset?: UseScrollOptions['offset'];
  /** Progress value used under reduced motion. 1 = the finished composition. */
  reducedProgress?: number;
  className?: string;
  /** Server-rendered content passes straight through — costs no client JS. */
  children: ReactNode;
}

export function ScrollScene({
  id,
  length = '220svh',
  smooth = true,
  offset = ['start start', 'end end'],
  reducedProgress = 1,
  className,
  children,
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset });

  const springConfig =
    typeof smooth === 'object'
      ? { stiffness: smooth.stiffness ?? 130, damping: smooth.damping ?? 30, restDelta: 0.001 }
      : { stiffness: 130, damping: 30, restDelta: 0.001 };

  const smoothed = useSpring(scrollYProgress, springConfig);
  const staticProgress = useMotionValue(reducedProgress);

  const progress = reduced ? staticProgress : smooth ? smoothed : scrollYProgress;

  const value = useMemo<SceneContextValue>(
    () => ({ progress, reduced, id }),
    [progress, reduced, id],
  );

  return (
    <SceneContext.Provider value={value}>
      <section
        ref={ref}
        id={id}
        data-scene={id}
        className={cn('relative', className)}
        style={
          reduced
            ? { minHeight: '100svh' }
            : { height: length }
        }
      >
        {children}
      </section>
    </SceneContext.Provider>
  );
}
