import { Reveal, RevealGroup, RevealItem } from '@/components/motion';
import { ProductCard } from '@/components/commerce/product-card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { strategyLabel } from '@/lib/commerce/recommendations';
import type { ScoredProduct } from '@/lib/commerce';
import type { Locale } from '@/types/i18n';

/**
 * YOU MAY ALSO LIKE.
 *
 * The recommendations arrive with the reasons they were selected, and those
 * reasons are SHOWN — "MATCHED ON: COMPLEMENTARY · SAME COLLECTION".
 *
 * That is a deliberate demo decision. A business owner evaluating NovaCore
 * cannot see an algorithm working; a small mono label under each card makes the
 * personalisation legible in a way that no amount of "powered by AI" copy does.
 * When the demo engine is swapped for a real one, the labels keep working
 * because `reasons` is part of the repository contract, not of this component.
 */
export function RelatedProducts({
  recommendations,
  locale,
  copy,
}: {
  recommendations: ScoredProduct[];
  locale: Locale;
  copy: { relatedTitle: string; relatedSubtitle: string; matchedOn: string };
}) {
  if (recommendations.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="editorial border-t border-hairline py-[--spacing-section] [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <Reveal className="mb-14">
        <Eyebrow>{copy.relatedSubtitle}</Eyebrow>
        <h2 id="related-heading" className="text-headline mt-6 font-medium text-ink">
          {copy.relatedTitle}
        </h2>
      </Reveal>

      <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
        {recommendations.map((entry, i) => {
          const labels = entry.reasons
            .map((reason) => strategyLabel(reason, locale))
            .filter((label): label is string => Boolean(label));

          return (
            <RevealItem key={entry.product.handle}>
              <ProductCard product={entry.product} locale={locale} index={i} />
              {labels.length > 0 ? (
                <p className="micro-label mt-3 text-ink-subtle">
                  <span className="text-ember">{copy.matchedOn}:</span> {labels.join(' · ')}
                </p>
              ) : null}
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
