'use client';

import { useMotionValue, useSpring, useReducedMotion } from 'motion/react';
// Motion 13's react-m entry exports the elements directly (div, span, ...),
// not an `m` namespace object, so this is a namespace import.
import * as m from 'motion/react-m';
import { useRef, type ReactNode } from 'react';
import { useFinePointer } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils/cn';

/**
 * A CTA that leans slightly toward the cursor.
 *
 * Gated on `(pointer: fine)` — on touch there is no cursor to lean toward, and
 * running the handlers anyway just costs battery. Travel is capped at a few
 * pixels: this should be felt rather than noticed, and a button that visibly
 * chases the mouse is the definition of a cheap effect.
 */
export function Magnetic({
  strength = 0.22,
  className,
  children,
}: {
  strength?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reduced = useReducedMotion() ?? false;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 22, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 260, damping: 22, mass: 0.4 });

  if (!finePointer || reduced) {
    return <div className={cn('inline-block', className)}>{children}</div>;
  }

  return (
    <m.div
      ref={ref}
      className={cn('inline-block', className)}
      style={{ x, y }}
      onPointerMove={(event) => {
        const node = ref.current;
        if (!node) return;
        // One rect read per pointer move, outside any scroll handler — this is
        // the only place in the codebase that measures during interaction.
        const rect = node.getBoundingClientRect();
        rawX.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        rawY.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </m.div>
  );
}
