import Link from 'next/link';
import type { Route } from 'next';
import { RevealGroup, RevealItem, RevealText, Magnetic } from '@/components/motion';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconArrowRight } from '@/components/visual/icons';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { Product } from '@/types/commerce';

/**
 * SECTION 03 — CATEGORY DISCOVERY.
 *
 * Two large, fully-clickable tiles — real <Link>s, not clickable <div>s.
 * Apparel has no single matching collection handle (it spans four: outerwear,
 * essentials, knitwear, technical), so it links to the unfiltered collection
 * rather than an arbitrary one of the four; Accessories has an exact handle
 * match.
 */
export function CategoryDiscovery({
  apparelHref,
  apparelProduct,
  accessoriesHref,
  accessoriesProduct,
  copy,
}: {
  apparelHref: Route;
  apparelProduct: Product;
  accessoriesHref: Route;
  accessoriesProduct: Product;
  copy: {
    index: string;
    label: string;
    title: string;
    apparel: { title: string; cta: string };
    accessories: { title: string; cta: string };
  };
}) {
  const tiles = [
    { href: apparelHref, product: apparelProduct, ...copy.apparel },
    { href: accessoriesHref, product: accessoriesProduct, ...copy.accessories },
  ];

  return (
    <section className="editorial py-(--spacing-section)">
      <RevealGroup className="mb-10 flex flex-col gap-4">
        <RevealItem>
          <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
        </RevealItem>
        <RevealItem>
          <RevealText as="h2" className="text-headline font-medium text-ink" split="none">
            {copy.title}
          </RevealText>
        </RevealItem>
      </RevealGroup>

      <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {tiles.map((tile) => (
          <RevealItem key={tile.href}>
            <Link href={tile.href} className="group relative block">
              <ProductVisual media={tile.product.media[0]!} slot="hero" />
              <div className="mt-5 flex items-center justify-between">
                <span className="text-title font-medium text-ink">{tile.title}</span>
                <Magnetic>
                  <span className="label inline-flex items-center gap-2 text-ink-muted transition-colors duration-(--duration-fast) group-hover:text-ink">
                    {tile.cta}
                    <IconArrowRight className="size-4 text-ember transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-hover:translate-x-1" />
                  </span>
                </Magnetic>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
