import Link from 'next/link';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion';
import { Price } from '@/components/commerce/price';
import { ProductVisual } from '@/components/visual/product-visual';
import { Eyebrow } from '@/components/ui/eyebrow';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

export interface CompleteTheSystemCopy {
  eyebrow: string;
  title: string;
}

/**
 * COMPLETE THE SYSTEM.
 *
 * Sourced from `product.metafields.pairsWith` — real, curated cross-sell
 * data that already exists and already powers `complementaryStrategy` in
 * lib/commerce/recommendations.ts, never invented here.
 *
 * Deliberately links, not multi-select: five of the eight products require a
 * size, so an "ADD SELECTED" control would have to either guess a size on
 * the shopper's behalf (never done anywhere else in this codebase) or
 * silently block whenever any selected item needs one. Each card is one
 * link to its own product page, where the real purchase panel already
 * lives — this section never triggers Quick Add.
 *
 * Compact cards, not `ProductCard`: that component carries colour swatches
 * and a Quick Add trigger this section deliberately excludes, so the frame
 * is built directly from the same primitives (`ProductVisual`, `Price`)
 * rather than a new visual design.
 */
export function CompleteTheSystem({
  products,
  locale,
  copy,
}: {
  products: Product[];
  locale: Locale;
  copy: CompleteTheSystemCopy;
}) {
  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="complete-the-system-heading"
      className="editorial border-t border-hairline py-(--spacing-section)"
    >
      <Reveal className="mb-14">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 id="complete-the-system-heading" className="text-headline mt-6 font-medium text-ink">
          {copy.title}
        </h2>
      </Reveal>

      <RevealGroup className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <RevealItem
            key={product.handle}
            className="w-[min(70vw,20rem)] shrink-0 snap-start last:snap-end sm:w-64"
          >
            <Link href={routes.product(locale, product.handle)} className="group block focus-visible:outline-none">
              <span className="absolute -inset-2 rounded-xs group-focus-visible:ring-2 group-focus-visible:ring-ember group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-void" />
              <div className="overflow-clip rounded-xs">
                <div className="transition-transform duration-[900ms] ease-(--ease-out-expo) group-hover:scale-[1.035]">
                  <ProductVisual media={product.media[0]!} slot="card" />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <h3 className="text-[0.9375rem] font-medium leading-tight tracking-[-0.02em] text-ink">
                  {product.title}
                </h3>
                <Price value={product.priceRange.min} locale={locale} size="label" className="mt-0.5" />
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
