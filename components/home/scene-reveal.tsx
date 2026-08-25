import Link from 'next/link';
import { ScrollScene, StickyStage, SceneLayer } from '@/components/motion';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconArrowRight } from '@/components/visual/icons';
import { Eyebrow } from '@/components/ui/eyebrow';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * SCENE 02 — PRODUCT REVEAL.
 *
 * The product starts small and distant and grows as the scene scrolls, while
 * three feature callouts hand off to one another around it.
 *
 * The VISUAL scales; the type never does. iOS rasterises text at its pre-scale
 * size, so animating scale on a headline makes it go blurry and then repaint —
 * the text here moves with translateY instead.
 *
 * Feature callouts overlap their ranges slightly (each fades out as the next
 * fades in) rather than cutting, which is what makes the sequence feel like one
 * continuous move instead of three separate animations.
 */
export function SceneReveal({
  product,
  locale,
  copy,
}: {
  product: Product;
  locale: Locale;
  copy: { index: string; label: string; title: string; subtitle: string; cta: string };
}) {
  const features = product.metafields.features.slice(0, 3);
  const hero = product.media[0];

  return (
    <ScrollScene id="reveal" length="320svh">
      <StickyStage className="isolate items-center overflow-clip">
        <div className="editorial relative flex h-full w-full flex-col justify-center">
          <SceneLayer
            from={[0, 0.12]}
            to={{ opacity: [0, 1] }}
            className="absolute inset-x-[var(--spacing-gutter)] top-[max(4.5rem,12svh)]"
          >
            <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
          </SceneLayer>

          <div className="relative flex h-full items-center justify-center">
            {/* THE PRODUCT — small and low, growing and rising. */}
            {hero ? (
              <SceneLayer
                from={[0, 0.72]}
                to={{ scale: [0.44, 1], y: [64, 0], opacity: [0.4, 1] }}
                className="w-[min(78vw,30rem)]"
              >
                <ProductVisual media={hero} slot="feature" />
              </SceneLayer>
            ) : null}

            {/* Product name sits behind the visual, scaled once by CSS, never
                animated — see the note about text rasterisation above. */}
            <SceneLayer
              from={[0.08, 0.4]}
              to={{ opacity: [0, 0.14], y: [40, 0] }}
              className="pointer-events-none absolute inset-x-0 -z-10 flex justify-center"
            >
              <p className="text-display whitespace-nowrap font-medium text-ink">{copy.title}</p>
            </SceneLayer>
          </div>

          {/* FEATURE CALLOUTS — three ranges, overlapping at the edges. */}
          <div className="pointer-events-none absolute inset-x-[var(--spacing-gutter)] bottom-[max(4rem,10svh)]">
            {features.map((feature, i) => {
              // Each caption occupies the same spot, so it must hand off:
              // rise in, hold, fall out. The last one stays up, because there
              // is nothing after it to take over.
              const start = 0.28 + i * 0.19;
              const isLast = i === features.length - 1;
              const from = [start, start + 0.06, start + 0.14, start + 0.19];
              return (
                <SceneLayer
                  key={feature.key}
                  from={from}
                  to={{
                    opacity: [0, 1, 1, isLast ? 1 : 0],
                    y: [20, 0, 0, isLast ? 0 : -14],
                  }}
                  className="absolute inset-x-0 bottom-0"
                >
                  <div className="flex flex-col gap-3">
                    <p className="label text-ember">{feature.label}</p>
                    <p className="reading text-subtitle text-ink">{feature.detail}</p>
                  </div>
                </SceneLayer>
              );
            })}
          </div>

          {/* Price + CTA arrive last, once the product is at full size. */}
          <SceneLayer
            from={[0.82, 0.96]}
            to={{ opacity: [0, 1], y: [16, 0] }}
            className="absolute inset-x-[var(--spacing-gutter)] bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="rule-t flex items-center justify-between pt-4">
              <p className="label text-ink-subtle">{copy.subtitle}</p>
              <Link
                href={routes.product(locale, product.handle)}
                className="group inline-flex items-center gap-3"
              >
                <span className="label text-ink">{copy.cta}</span>
                <span className="label text-ember" data-numeric>
                  {formatMoney(product.priceRange.min, locale)}
                </span>
                <IconArrowRight className="size-4 text-ember transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-hover:translate-x-1" />
              </Link>
            </div>
          </SceneLayer>
        </div>
      </StickyStage>
    </ScrollScene>
  );
}
