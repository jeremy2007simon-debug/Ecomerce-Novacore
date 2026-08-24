'use client';

import { useTransform, type MotionValue } from 'motion/react';
// `m` MUST come from motion/react-m: importing the full `motion` factory pulls
// the entire feature bundle onto the critical path and defeats LazyMotion.
// Motion 13's react-m entry exports the elements directly (div, span, ...),
// not an `m` namespace object, so this is a namespace import.
import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useScene } from './scene-context';

/**
 * Declarative mapping from scene progress to transform.
 *
 * The rule this component exists to enforce: scroll-linked values NEVER pass
 * through React state. Writing
 *
 *     const [p, setP] = useState(0);
 *     useMotionValueEvent(progress, 'change', setP);
 *     <div style={{ scale: 1 + p }} />
 *
 * re-renders the subtree sixty times a second and is guaranteed jank on a
 * phone. useTransform subscribes the DOM node directly to the MotionValue, so
 * React renders each layer exactly once and the compositor does the rest.
 *
 * Note there is no `blur` output. Animating filter: blur() re-rasterises the
 * layer every frame; cross-fade a sharp and a pre-blurred sibling instead.
 * There is no `scale` on text either — iOS rasterises text at its pre-scale
 * size, so scaled type goes blurry and then repaints.
 */

export type Range = [number, number];

/**
 * Input and output accept any number of matching keyframes, not just two.
 *
 * Two-point ranges can only ramp in one direction, which meant an element that
 * faded in stayed at full opacity for the rest of the scene. Anything that has
 * to hand off to a successor — the feature callouts in scene 02, where three
 * captions share one position — needs at least four points:
 *
 *     from={[0.30, 0.38, 0.48, 0.54]}  to={{ opacity: [0, 1, 1, 0] }}
 *              in ▲     hold     ▼ out
 */
export type Keyframes = number[];

export interface SceneLayerOutputs {
  opacity?: Keyframes;
  /** Pixels. */
  y?: Keyframes;
  x?: Keyframes;
  scale?: Keyframes;
  rotate?: Keyframes;
  /** clip-path inset from the top, as a percentage. Used for masked reveals. */
  clipTop?: Keyframes;
  /** clip-path inset from the bottom, as a percentage. */
  clipBottom?: Keyframes;
}

export interface SceneLayerProps {
  /** Input keyframes in scene progress, ascending, e.g. [0.1, 0.45]. */
  from: Keyframes;
  to: SceneLayerOutputs;
  as?: 'div' | 'section' | 'figure' | 'header' | 'span';
  className?: string;
  children: ReactNode;
  /** Marks this layer for compositor promotion while its stage is on screen. */
  promote?: boolean;
}

/**
 * Maps scene progress onto one output channel.
 *
 * When the channel is not requested it returns a flat value, so the transform
 * still exists (hooks must not be conditional) but contributes nothing.
 * Output length is padded or trimmed to match the input, because a mismatch
 * makes Motion throw at runtime rather than at build time.
 */
function useOutput(
  progress: MotionValue<number>,
  from: Keyframes,
  values: Keyframes | undefined,
  fallback: number,
): MotionValue<number> {
  const output = values ?? from.map(() => fallback);
  const matched =
    output.length === from.length
      ? output
      : from.map((_, i) => output[Math.min(i, output.length - 1)] ?? fallback);

  return useTransform(progress, from, matched);
}

export function SceneLayer({
  from,
  to,
  as = 'div',
  className,
  children,
  promote = true,
}: SceneLayerProps) {
  const { progress } = useScene();

  const opacity = useOutput(progress, from, to.opacity, 1);
  const y = useOutput(progress, from, to.y, 0);
  const x = useOutput(progress, from, to.x, 0);
  const scale = useOutput(progress, from, to.scale, 1);
  const rotate = useOutput(progress, from, to.rotate, 0);
  const clipTop = useOutput(progress, from, to.clipTop, 0);
  const clipBottom = useOutput(progress, from, to.clipBottom, 0);

  const clipPath = useTransform(
    [clipTop, clipBottom],
    ([top, bottom]: number[]) =>
      // A little negative inset on the sides stops descenders and italic
      // overhangs being shaved off by the mask.
      `inset(${top ?? 0}% -6% ${bottom ?? 0}% -6%)`,
  );

  const Component = m[as];
  const useClip = to.clipTop !== undefined || to.clipBottom !== undefined;

  return (
    <Component
      className={cn(promote && 'atl-promote', className)}
      style={{
        ...(to.opacity ? { opacity } : {}),
        ...(to.y ? { y } : {}),
        ...(to.x ? { x } : {}),
        ...(to.scale ? { scale } : {}),
        ...(to.rotate ? { rotate } : {}),
        ...(useClip ? { clipPath } : {}),
      }}
    >
      {children}
    </Component>
  );
}
