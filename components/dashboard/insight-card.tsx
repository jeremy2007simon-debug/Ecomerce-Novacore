import { IconSpark } from '@/components/visual/icons';
import { cn } from '@/lib/utils/cn';

/**
 * An AI insight.
 *
 * Two details keep this honest rather than oracular: the confidence is shown,
 * and the card is explicitly labelled as generated from demo data. An insight
 * panel that states conclusions with no uncertainty is the part of a dashboard
 * mockup that a sceptical buyer disbelieves first.
 */
export function InsightCard({
  body,
  confidence,
  tone,
  confidenceLabel,
}: {
  body: string;
  confidence: number;
  tone: 'positive' | 'neutral' | 'action';
  confidenceLabel: string;
}) {
  return (
    <article
      className={cn(
        'relative flex flex-col gap-4 rounded-xs border p-5',
        tone === 'action' ? 'border-ember/30 bg-ember/[0.06]' : 'border-hairline bg-white/[0.02]',
      )}
    >
      <IconSpark className={cn('size-4', tone === 'action' ? 'text-ember' : 'text-ink-subtle')} />
      <p className="text-small leading-relaxed text-ink">{body}</p>

      <div className="mt-auto flex items-center gap-3 pt-2">
        <span className="h-px w-14 bg-hairline-strong">
          <span
            className="block h-full origin-left bg-ember"
            style={{ transform: `scaleX(${confidence})` }}
          />
        </span>
        <span className="micro-label text-ink-subtle" data-numeric>
          {confidenceLabel} {Math.round(confidence * 100)}%
        </span>
      </div>
    </article>
  );
}
