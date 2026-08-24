import { cn } from '@/lib/utils/cn';

/**
 * Star rating.
 *
 * Rendered as a single clipped overlay rather than five separate part-filled
 * glyphs, so a 4.7 shows genuine partial fill instead of rounding to 5 — which
 * is both more honest and visually more precise.
 */
export function Stars({
  value,
  size = 14,
  className,
  label,
}: {
  value: number;
  size?: number;
  className?: string;
  label?: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  const row = (filled: boolean) => (
    <span className="flex" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.2"
          className="shrink-0"
        >
          <path d="m10 2.6 2.3 4.9 5.2.7-3.8 3.7.95 5.3L10 14.7l-4.65 2.5.95-5.3L2.5 8.2l5.2-.7z" />
        </svg>
      ))}
    </span>
  );

  return (
    <span
      className={cn('relative inline-flex text-ember', className)}
      role="img"
      aria-label={label ?? `${value} / 5`}
    >
      <span className="opacity-30">{row(false)}</span>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${percent}%` }}
      >
        {row(true)}
      </span>
    </span>
  );
}
