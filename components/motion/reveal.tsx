'use client';

// Motion 13's react-m entry exports the elements directly (div, span, ...),
// not an `m` namespace object, so this is a namespace import.
import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Generic entrance for non-text content: fade plus a short rise.
 *
 * Fading is acceptable here in a way it is not for headlines, because these
 * elements are never the LCP candidate. Keep the travel short — 12 to 20px.
 * Anything further reads as a slideshow rather than as material arriving.
 */
export function Reveal({
  delay = 0,
  y = 16,
  duration = 0.62,
  once = true,
  className,
  children,
}: {
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <m.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-8% 0px -14% 0px' }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}

/** Staggers direct children. Used for grids and spec lists. */
export function RevealGroup({
  stagger = 0.07,
  delay = 0,
  className,
  children,
}: {
  stagger?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <m.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-6% 0px -12% 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({
  y = 18,
  className,
  children,
}: {
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <m.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </m.div>
  );
}
