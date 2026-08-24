import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { ContourField } from '@/components/visual/contour-field';

/**
 * Empty and error states keep the brand rather than dropping to a grey box with
 * a shrug emoji. Each one gets the same contour field the storytelling scenes
 * use, so a dead end still looks like part of the same world.
 */
export function EmptyState({
  eyebrow,
  title,
  body,
  action,
  seed = 'empty',
  className,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
  seed?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative isolate flex flex-col items-center justify-center overflow-clip px-6 py-24 text-center',
        className,
      )}
    >
      <ContourField
        seed={seed}
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden
      />
      {eyebrow ? <p className="label mb-6 text-ink-subtle">{eyebrow}</p> : null}
      <h2 className="text-title max-w-[18ch] font-medium text-ink">{title}</h2>
      {body ? <p className="reading mt-4 text-small text-ink-muted">{body}</p> : null}
      {action ? <div className="mt-9">{action}</div> : null}
    </div>
  );
}
