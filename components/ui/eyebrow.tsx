import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

/**
 * The mono micro-label voice: "ATLANTIC 01 · SHELL", "ESCENA 02", "28.2916° N".
 * An index prop renders a leading numeral tick, which is what gives the
 * storytelling scenes their editorial rhythm.
 */
export function Eyebrow({
  children,
  index,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  index?: string;
  tone?: 'muted' | 'accent' | 'ink';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'label flex items-center gap-3',
        tone === 'muted' && 'text-ink-subtle',
        tone === 'accent' && 'text-ember',
        tone === 'ink' && 'text-ink',
        className,
      )}
    >
      {index ? (
        <>
          <span className="text-ember" aria-hidden="true">
            {index}
          </span>
          <span className="h-px w-6 bg-hairline-strong" aria-hidden="true" />
        </>
      ) : null}
      {children}
    </p>
  );
}
