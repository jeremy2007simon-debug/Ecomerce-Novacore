import { Reveal, RevealText } from '@/components/motion';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PRODUCT_EDITORIAL } from '@/lib/commerce/product-editorial';
import type { Locale } from '@/types/i18n';

export interface ProductStoryCopy {
  eyebrow: string;
}

/**
 * PRODUCT STORY.
 *
 * The body is always `product.metafields.story` — the one real narrative
 * source, already used elsewhere on this page, never duplicated here. The
 * only thing this section adds is a short editorial headline, from
 * `PRODUCT_EDITORIAL[handle]` where one exists (today: only `atlantic-01`).
 *
 * A handle without an entry still gets a complete section — the headline
 * falls back to the product's own title, never a blank or a broken layout.
 */
export function ProductStory({
  handle,
  title,
  story,
  locale,
  copy,
}: {
  handle: string;
  title: string;
  story: string;
  locale: Locale;
  copy: ProductStoryCopy;
}) {
  const headline = PRODUCT_EDITORIAL[handle]?.headline[locale] ?? title;

  return (
    <section className="editorial border-t border-hairline py-(--spacing-section)">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="justify-center">{copy.eyebrow}</Eyebrow>
        <RevealText as="h2" className="text-headline mt-8 font-medium text-ink" split="none">
          {headline}
        </RevealText>
        <Reveal delay={0.1}>
          <p className="reading mt-8 text-body text-ink-muted">{story}</p>
        </Reveal>
      </div>
    </section>
  );
}
