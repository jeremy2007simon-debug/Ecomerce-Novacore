'use client';

// Motion 13's react-m entry exports the elements directly (div, span, ...),
// not an `m` namespace object, so this is a namespace import.
import * as m from 'motion/react-m';
import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { useOptionalScene } from './scene-context';
import { SceneLayer, type Range } from './scene-layer';

/**
 * Masked line/word reveal.
 *
 * The mask (clip-path) rather than a fade is the point: OPACITY STAYS AT 1
 * throughout. An LCP candidate that starts transparent is treated as not-yet-
 * painted, so a fading headline pushes Largest Contentful Paint out by the full
 * duration of the fade — which on a hero is the difference between a 95 and a
 * 65 performance score.
 *
 * Three drivers, because the right mechanism depends on where the text is:
 *   css      — pure CSS keyframes. Runs before hydration, so this is the ONLY
 *              correct choice above the fold.
 *   viewport — Motion whileInView. For mid-page content.
 *   scene    — driven by the enclosing ScrollScene's progress.
 */

export interface RevealTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  /** Splitting is deterministic (on \n or spaces), so SSR and client agree. */
  split?: 'lines' | 'words' | 'none';
  stagger?: number;
  delay?: number;
  driver?: 'css' | 'viewport' | 'scene';
  /** Required when driver='scene'. */
  from?: Range;
  className?: string;
  /** String only — enables deterministic splitting during a server render. */
  children: string;
}

export function RevealText({
  as: Tag = 'p',
  split = 'lines',
  stagger = 0.055,
  delay = 0,
  driver = 'viewport',
  from = [0, 0.4],
  className,
  children,
}: RevealTextProps) {
  const scene = useOptionalScene();

  const parts = useMemo(() => {
    if (split === 'none') return [children];
    if (split === 'words') return children.split(' ');
    return children.split('\n');
  }, [children, split]);

  /* ── CSS driver ─────────────────────────────────────────────────────────
     No JavaScript at all. Each part gets a staggered animation-delay through
     a custom property. */
  if (driver === 'css') {
    return (
      <Tag className={cn('block', className)}>
        {parts.map((part, i) => (
          <span key={i} className="block overflow-clip py-[0.06em]">
            <span
              className="atl-enter-mask block"
              style={{ ['--atl-delay' as string]: `${delay + i * stagger}s` }}
            >
              {part}
              {split === 'words' && i < parts.length - 1 ? ' ' : null}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  /* ── Scene driver ───────────────────────────────────────────────────────
     Tied to the enclosing scene's scroll progress. Each part animates over a
     slice of the given range so they arrive in sequence. */
  if (driver === 'scene' && scene) {
    const span = from[1] - from[0];
    const step = parts.length > 1 ? (span * 0.45) / (parts.length - 1) : 0;

    return (
      <Tag className={cn('block', className)}>
        {parts.map((part, i) => (
          <span key={i} className="block overflow-clip py-[0.06em]">
            <SceneLayer
              as="span"
              from={[from[0] + i * step, from[0] + i * step + span * 0.55]}
              to={{ clipTop: [104, -12], y: [26, 0] }}
              className="block"
            >
              {part}
              {split === 'words' && i < parts.length - 1 ? ' ' : null}
            </SceneLayer>
          </span>
        ))}
      </Tag>
    );
  }

  /* ── Viewport driver ────────────────────────────────────────────────────  */
  return (
    <Tag className={cn('block', className)}>
      {parts.map((part, i) => (
        <span key={i} className="block overflow-clip py-[0.06em]">
          <m.span
            className="block"
            initial={{ clipPath: 'inset(104% -6% -12% -6%)', y: '0.3em' }}
            whileInView={{ clipPath: 'inset(-12% -6% -12% -6%)', y: 0 }}
            viewport={{ once: true, margin: '-12% 0px -18% 0px' }}
            transition={{
              duration: 0.9,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {part}
            {split === 'words' && i < parts.length - 1 ? ' ' : null}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}
