import { Reveal, RevealText } from '@/components/motion';
import { SpecTable } from '@/components/product/details-accordion';
import { Eyebrow } from '@/components/ui/eyebrow';

export interface TechnicalSpecCopy {
  eyebrow: string;
  title: string;
  intro: string;
}

/**
 * TECHNICAL SPECIFICATION.
 *
 * A second mount of the same `SpecTable` the Material section already uses —
 * identical `product.metafields.specs` data, no new field on `ProductSpec`
 * (`unit`/`priority` were considered and rejected: every value already
 * carries its own unit, e.g. "340 g (M)", and no product needs reordering).
 * What is new is the framing: its own section, its own heading, and a large
 * decorative count numeral, so a shopper reads this as a spec sheet rather
 * than a plain table sitting under the material story.
 */
export function TechnicalSpecSection({
  specs,
  copy,
}: {
  specs: { label: string; value: string }[];
  copy: TechnicalSpecCopy;
}) {
  if (specs.length === 0) return null;

  return (
    <section className="editorial border-t border-hairline py-(--spacing-section)">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <RevealText as="h2" className="text-headline mt-8 font-medium text-ink" split="none">
            {copy.title}
          </RevealText>
          <p className="reading mt-8 max-w-prose text-body text-ink-muted">{copy.intro}</p>
          <p
            aria-hidden="true"
            data-numeric
            className="mt-12 text-[clamp(3rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.03em] text-ink-subtle"
          >
            {String(specs.length).padStart(2, '0')}
          </p>
        </div>
        <Reveal delay={0.1}>
          <SpecTable specs={specs} label={copy.title} />
        </Reveal>
      </div>
    </section>
  );
}
