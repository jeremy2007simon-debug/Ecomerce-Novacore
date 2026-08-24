import { cn } from '@/lib/utils/cn';

/**
 * ATLANTIC SUPPLY identity.
 *
 * The monogram is an "A" whose crossbar is displaced into two offset strokes —
 * a horizon line and its reflection. It reads as a letterform at 20px and as a
 * seascape at 200px, which is the whole idea: a mark that carries the origin
 * story without ever drawing a palm tree.
 */

export function AtlanticMonogram({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8', className)}
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {/* Apex + flanks */}
      <path
        d="M16 4.5 L27.5 27.5 M16 4.5 L4.5 27.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      {/* Horizon crossbar, offset from its reflection */}
      <path d="M9.4 19.6 H22.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      <path
        d="M11.1 23.4 H20.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        opacity="0.4"
      />
    </svg>
  );
}

export function AtlanticWordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-display font-semibold uppercase leading-none',
        compact ? 'text-[0.8125rem] tracking-[0.22em]' : 'text-sm tracking-brand',
        className,
      )}
    >
      Atlantic&nbsp;Supply
    </span>
  );
}

export function AtlanticLockup({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <AtlanticMonogram className={compact ? 'size-[18px]' : 'size-5'} />
      <AtlanticWordmark compact={compact} />
    </span>
  );
}
