import { Reveal, RevealText } from '@/components/motion';
import { ProductVisual } from '@/components/visual/product-visual';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { ProductMedia } from '@/types/visual';

/**
 * Collection Hero — a real entry point per collection, not a 100vh moment.
 *
 * `media` is `ProductMedia | null`: the architecture accepts a real photo (or,
 * later, video) but never REQUIRES one. Every demo collection's `heroMedia` is
 * `null` today (confirmed — Collection.heroMedia is always null in this repo),
 * so the text-led composition below is the default case, not a fallback edge
 * case — and it is deliberately not a stretched product photo standing in for
 * dedicated collection art. See the Phase 4 report's asset gaps section.
 *
 * `title`/`description` are the REAL provider collection title/description
 * (or, for the synthetic "apparel" grouping, the editorial dictionary text) —
 * `eyebrow`/`tagline` are a layer on top, never a replacement.
 */
export function CollectionHero({
  eyebrow,
  title,
  tagline,
  description,
  productCountLabel,
  media,
}: {
  eyebrow?: string;
  title: string;
  tagline?: string;
  description?: string;
  productCountLabel: string;
  media?: ProductMedia | null;
}) {
  return (
    <header
      className={
        media
          ? 'editorial relative flex min-h-[32svh] flex-col justify-end overflow-clip py-10 lg:min-h-[42vh] lg:py-14'
          : 'editorial flex flex-col py-10 lg:py-14'
      }
    >
      {media ? (
        <div className="absolute inset-0 -z-10">
          <ProductVisual media={media} slot="hero" bare fill className="h-full w-full" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent"
          />
        </div>
      ) : null}

      {eyebrow ? (
        <Reveal>
          <Eyebrow tone={media ? 'ink' : 'muted'}>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}

      <RevealText as="h1" driver="css" split="none" className="text-display mt-4 font-medium text-ink">
        {title}
      </RevealText>

      {tagline ? (
        <Reveal delay={0.08}>
          <p className="reading mt-4 max-w-xl text-subtitle text-ink-muted">{tagline}</p>
        </Reveal>
      ) : null}

      {description ? (
        <Reveal delay={0.12}>
          <p className="reading mt-3 max-w-xl text-small text-ink-subtle">{description}</p>
        </Reveal>
      ) : null}

      <p className="micro-label mt-6 text-ink-subtle" data-numeric>
        {productCountLabel}
      </p>
    </header>
  );
}
