import { cn } from '@/lib/utils/cn';

/**
 * A hairline divider, optionally carrying a mono label on the left. Used
 * instead of card borders and drop shadows for essentially all separation on
 * the site — space and a 1px line, never elevation.
 */
export function Rule({
  label,
  className,
  tone = 'default',
}: {
  label?: string;
  className?: string;
  tone?: 'default' | 'strong';
}) {
  const line = tone === 'strong' ? 'bg-hairline-strong' : 'bg-hairline';

  if (!label) {
    return <hr className={cn('h-px w-full border-0', line, className)} />;
  }

  return (
    <div className={cn('flex items-center gap-5', className)}>
      <span className="label shrink-0 text-ink-subtle">{label}</span>
      <span className={cn('h-px w-full', line)} aria-hidden="true" />
    </div>
  );
}
