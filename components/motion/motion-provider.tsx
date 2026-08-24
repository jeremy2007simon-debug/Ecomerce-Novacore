'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

const loadFeatures = () => import('./motion-features').then((m) => m.default);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTION PROVIDER
 *
 * Two decisions worth keeping:
 *
 * 1. LazyMotion with a DYNAMIC feature import means no Motion animation code is
 *    on the critical path at all. That is precisely why the hero entrance is
 *    written as CSS keyframes (styles/motion.css) — it has to run before this
 *    chunk arrives, or Lighthouse records LCP at the end of the animation.
 *
 * 2. `strict` makes it a runtime error in development to import the full
 *    `motion` component factory instead of `m` from motion/react-m. Without it
 *    a single stray `<motion.div>` silently pulls the entire feature bundle
 *    back onto the critical path, and nothing visibly breaks — the site just
 *    quietly gets slower. ESLint blocks the import as well; this catches
 *    anything that slips past it.
 *
 * `reducedMotion="user"` is the first of three levels of reduced-motion
 * handling. See ScrollScene for the one that actually matters — collapsing
 * scene height, not just disabling animation.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
