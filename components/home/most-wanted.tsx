import { Reveal, RevealGroup, RevealItem, RevealText } from '@/components/motion';
import { ProductCard } from '@/components/commerce/product-card';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * SECTION 06 — MOST WANTED.
 *
 * "Most Wanted" is an editorial label, not a statistical claim — there is no
 * production sales/order data to draw a real bestseller list from. This is
 * genuine curation instead: `curatedProducts` (never `bestSellers`, in code
 * or props) is sourced from each product's real, hand-set `featuredRank`
 * (sort: 'featured'), with the Drop section's own product already filtered
 * out server-side in app/[locale]/page.tsx so the two sections never repeat
 * the same piece seconds apart.
 */
export function MostWanted({
  curatedProducts,
  locale,
  copy,
}: {
  curatedProducts: Product[];
  locale: Locale;
  copy: { index: string; label: string; title: string; subtitle: string };
}) {
  if (curatedProducts.length === 0) return null;

  return (
    <section className="editorial py-(--spacing-section)">
      <header className="mb-10 flex flex-col gap-4">
        <Reveal>
          <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
        </Reveal>
        <RevealText as="h2" className="text-headline font-medium text-ink" split="none">
          {copy.title}
        </RevealText>
        <Reveal delay={0.08}>
          <p className="max-w-sm text-small text-ink-muted">{copy.subtitle}</p>
        </Reveal>
      </header>

      <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {curatedProducts.map((product, i) => (
          <RevealItem key={product.handle}>
            <ProductCard product={product} locale={locale} index={i} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
