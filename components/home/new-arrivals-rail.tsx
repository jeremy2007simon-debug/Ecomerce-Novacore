'use client';

import { useRef } from 'react';
import { ProductCard, type ProductCardCopy } from '@/components/commerce/product-card';
import { Reveal, RevealText } from '@/components/motion';
import { Eyebrow } from '@/components/ui/eyebrow';
import { IconArrowRight } from '@/components/visual/icons';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * SECTION 05 — NEW ARRIVALS.
 *
 * Native CSS scroll-snap, zero JavaScript for the scrolling itself — same
 * recipe as components/product/editorial-gallery.tsx, with ProductCard in
 * place of bare media figures. No carousel library, no drag (Motion's
 * `domMax` feature set isn't loaded anywhere in this app).
 *
 * The prev/next buttons exist because a rail that only responds to swipe
 * gestures has no discoverable affordance for a keyboard or screen-reader
 * user — `scrollBy` is the only JS this file adds beyond the ref.
 */
export function NewArrivalsRail({
  products,
  locale,
  copy,
  productCardCopy,
}: {
  products: Product[];
  locale: Locale;
  copy: { index: string; label: string; title: string; subtitle: string; prevLabel: string; nextLabel: string };
  productCardCopy: ProductCardCopy;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: 1 | -1) => {
    const node = railRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="py-(--spacing-section)">
      <header className="editorial mb-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Reveal>
            <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
          </Reveal>
          <RevealText as="h2" className="text-headline mt-6 font-medium text-ink" split="none">
            {copy.title}
          </RevealText>
          <Reveal delay={0.08}>
            <p className="mt-4 max-w-sm text-small text-ink-muted">{copy.subtitle}</p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={copy.prevLabel}
            className="rounded-pill border border-hairline-strong p-2.5 text-ink transition-colors duration-(--duration-fast) hover:border-ink"
          >
            <IconArrowRight className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={copy.nextLabel}
            className="rounded-pill border border-hairline-strong p-2.5 text-ink transition-colors duration-(--duration-fast) hover:border-ink"
          >
            <IconArrowRight className="size-4" />
          </button>
        </Reveal>
      </header>

      <div
        ref={railRef}
        data-scroll-snap
        className="edge flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, i) => (
          <div key={product.handle} className="w-[min(62vw,20rem)] shrink-0 snap-start last:snap-end">
            <ProductCard product={product} locale={locale} index={i} copy={productCardCopy} />
          </div>
        ))}
      </div>
    </section>
  );
}
