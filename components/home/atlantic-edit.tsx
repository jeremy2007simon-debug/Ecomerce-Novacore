import Link from 'next/link';
import type { Route } from 'next';
import { Reveal, RevealGroup, RevealItem, RevealText } from '@/components/motion';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconArrowRight } from '@/components/visual/icons';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { Product } from '@/types/commerce';

/**
 * SECTION 07 — THE ATLANTIC EDIT.
 *
 * Three real collections (outerwear/essentials/technical), reframed
 * editorially as COAST/CITY/MOVEMENT rather than fabricating new ones. Each
 * tile's image is a real, existing product photo representative of that
 * collection — there is no dedicated collection hero art in the commerce
 * layer (every Collection.heroMedia is null today), so this reuses
 * photography already fetched elsewhere on the page rather than inventing
 * new imagery.
 */
export function AtlanticEdit({
  editions,
  copy,
}: {
  editions: { href: Route; product: Product; title: string; cta: string }[];
  copy: { index: string; label: string; title: string };
}) {
  return (
    <section className="editorial py-(--spacing-section)">
      <header className="mb-10 flex flex-col gap-4">
        <Reveal>
          <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
        </Reveal>
        <RevealText as="h2" className="text-headline font-medium text-ink" split="none">
          {copy.title}
        </RevealText>
      </header>

      <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {editions.map((edition) => (
          <RevealItem key={edition.href}>
            <Link href={edition.href} className="group relative block">
              <ProductVisual media={edition.product.media[0]!} slot="feature" />
              <div className="mt-4 flex items-center justify-between">
                <span className="label text-ink">{edition.title}</span>
                <span className="inline-flex items-center gap-2 text-ink-muted transition-colors duration-(--duration-fast) group-hover:text-ink">
                  <span className="label">{edition.cta}</span>
                  <IconArrowRight className="size-4 text-ember transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
