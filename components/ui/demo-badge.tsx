import { cn } from '@/lib/utils/cn';

/**
 * Marks anything the visitor could otherwise mistake for a live system:
 * simulated payment methods, mock dashboard figures, scripted AI answers.
 *
 * This is a product requirement, not decoration. Nothing in this build talks to
 * a payment processor, a model provider, or an analytics vendor, and the
 * interface must never imply otherwise.
 */
export function DemoBadge({
  label = 'DEMO',
  tone = 'default',
  className,
}: {
  label?: string;
  tone?: 'default' | 'accent' | 'inverse';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'micro-label inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-[3px] leading-none',
        tone === 'default' && 'border-hairline-strong text-ink-subtle',
        tone === 'accent' && 'border-ember/40 bg-ember/10 text-ember',
        tone === 'inverse' && 'border-void/20 bg-void/10 text-void',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-[3px] rounded-pill',
          tone === 'accent' ? 'bg-ember' : 'bg-current',
        )}
      />
      {label}
    </span>
  );
}
