'use client';

import { useEffect, useState } from 'react';
import { AtlanticMonogram } from '@/components/visual/atlantic-mark';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BRAND LOADER — an overlay that animates OUT. Never a gate.
 *
 * Rules, all of them learned the hard way:
 *
 *  1. It NEVER delays or hides content structurally. The hero is in the DOM and
 *     painted underneath from the first frame; this sits on top and leaves.
 *
 *  2. THE EXIT IS PURE CSS. The first version used Motion's AnimatePresence —
 *     but Motion's feature bundle is dynamically imported, so on a throttled
 *     connection the chunk arrived late, the opaque overlay lingered over the
 *     LCP element, and the product page lost 0.6s of LCP and six Lighthouse
 *     points. Measured, not guessed. Anything that must run independently of
 *     hydration has to be CSS.
 *
 *  3. It holds for 180ms and fades over 260ms — no waiting on fonts. The brief
 *     is explicit that the site must not be artificially delayed, and every
 *     millisecond here is a millisecond the LCP element spends occluded.
 *
 *  4. Skipped entirely for repeat visits in the session, reduced-motion users,
 *     and anyone on Save-Data.
 *
 *  5. `pointer-events-none` throughout, so it can never swallow a tap.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SESSION_KEY = 'atl.intro.seen';
/*
  Occlusion budget.

  Every millisecond this overlay is opaque is a millisecond the LCP element is
  covered, and LCP is measured against when it becomes visible. 180ms is long
  enough for the mark to register as a deliberate brand moment and short enough
  that it costs nothing measurable.

  It no longer waits on `document.fonts.ready`: under throttling that resolves
  late, which is precisely the occlusion we are trying to avoid, and the mark is
  an SVG that does not need a font at all.
*/
const HARD_CAP_MS = 180;
const FADE_MS = 260;

type Phase = 'hidden' | 'visible' | 'leaving';

export function BrandLoader() {
  // Starts hidden: the loader must never appear for a visitor whose browser
  // conditions have not been checked yet.
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    let seen = true;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Blocked storage — treat as seen and skip the intro entirely.
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;

    if (seen || reduced || saveData) return;

    /*
      Reading sessionStorage, matchMedia and navigator.connection is inherently
      post-mount — none of it can happen during render without a hydration
      mismatch. This is the "synchronise with an external system" case: it runs
      once, is guarded by the early return above, and cannot cascade.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase('visible');

    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Non-fatal.
    }

    let removeTimer = 0;
    const leave = () => {
      setPhase('leaving');
      removeTimer = window.setTimeout(() => setPhase('hidden'), FADE_MS);
    };

    const cap = window.setTimeout(leave, HARD_CAP_MS);

    return () => {
      window.clearTimeout(cap);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div
      aria-hidden="true"
      data-leaving={phase === 'leaving'}
      className="atl-loader pointer-events-none fixed inset-0 z-(--z-loader) flex items-center justify-center bg-void"
    >
      <div className="atl-loader-mark flex flex-col items-center gap-5">
        <AtlanticMonogram className="size-8 text-ink" />
        <span className="h-px w-16 overflow-clip bg-hairline-strong">
          <span className="atl-loader-rule block h-full bg-ember" />
        </span>
      </div>
    </div>
  );
}
