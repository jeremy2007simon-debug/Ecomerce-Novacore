'use client';

import { animate, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Counts a figure up when it scrolls into view. Used for dashboard KPIs.
 *
 * The value is rendered through `format` rather than as a raw number so the
 * currency/percent formatting is applied on every frame — a counter that ticks
 * up as "743.2" and then snaps to "€743,20" at the end looks broken.
 *
 * `data-numeric` on the element applies tabular figures, without which the
 * digits change width as they animate and the whole row jitters.
 */
export function Counter({
  to,
  from = 0,
  duration = 1.1,
  format,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  format: (value: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setValue,
    });

    return () => controls.stop();
  }, [inView, from, to, duration]);

  return (
    <span ref={ref} data-numeric className={cn(className)}>
      {format(inView ? value : from)}
    </span>
  );
}
