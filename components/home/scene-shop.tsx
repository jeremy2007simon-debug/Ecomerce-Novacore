import Link from 'next/link';
import { Reveal, RevealGroup, RevealItem, RevealText } from '@/components/motion';
import { ProductCard } from '@/components/commerce/product-card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { IconArrowRight } from '@/components/visual/icons';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * SCENE 04 — THE COLLECTION.
 *
 * The storytelling ends and the shop begins. Deliberately NOT a pinned scene:
 * after three sticky sections the reader needs the page to start behaving like
 * a page again, and a fourth pin would read as a gimmick that will not stop.
 *
 * `content-visibility: auto` is safe here precisely because nothing in this
 * section is sticky — applying it to a scene with a StickyStage inside would
 * silently break the pinning.
 */
export function SceneShop({
  products,
  locale,
  copy,
}: {
  products: Product[];
  locale: Locale;
  copy: { index: string; label: string; title: string; subtitle: string; cta: string };
}) {
  return (
    <section
      id="collection"
      className="editorial relative py-[--spacing-section] [content-visibility:auto] [contain-intrinsic-size:auto_1400px]"
    >
      <header className="mb-16 flex flex-col gap-8 md:mb-24 md:flex-row md:items-end md:justify-between">
        <div>
          <Reveal>
            <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
          </Reveal>
          <RevealText as="h2" className="text-headline mt-8 font-medium text-ink" split="none">
            {copy.title}
          </RevealText>
        </div>

        <Reveal delay={0.12} className="max-w-sm">
          <p className="text-small text-ink-muted">{copy.subtitle}</p>
          <Link
            href={routes.collection(locale)}
            className="group mt-6 inline-flex items-center gap-3 border-b border-hairline-strong pb-2 transition-colors hover:border-ember"
          >
            <span className="label text-ink">{copy.cta}</span>
            <IconArrowRight className="size-4 text-ember transition-transform duration-[--duration-base] ease-[--ease-out-expo] group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </header>

      <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {products.map((product, i) => (
          <RevealItem key={product.handle}>
            <ProductCard product={product} locale={locale} index={i} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
