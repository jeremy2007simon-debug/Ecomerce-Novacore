'use client';

import { useScroll, useTransform } from 'motion/react';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
// Motion 13's react-m entry exports the elements directly (div, span, ...),
// not an `m` namespace object, so this is a namespace import.
import * as m from 'motion/react-m';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Controlled parallax.
 *
 * Kept deliberately shallow — `speed` beyond about ±0.35 stops reading as depth
 * and starts reading as elements sliding out of their frames, which is the
 * cheapest-looking effect on the web.
 *
 * The element must be OVERSIZED relative to its frame (scale slightly above 1),
 * or translating it reveals the edge. That is handled here rather than left to
 * every call site.
 */
export function Parallax({
  speed = 0.18,
  className,
  children,
}: {
  speed?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const travel = Math.abs(speed) * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`${-travel}px`, `${travel}px`]);

  if (reduced) {
    return <div className={cn('relative overflow-clip', className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn('relative overflow-clip', className)}>
      <m.div
        className="atl-promote h-full w-full"
        style={{ y, scale: 1 + Math.abs(speed) * 0.55 }}
      >
        {children}
      </m.div>
    </div>
  );
}
