import { ScrollScene, StickyStage, SceneLayer } from '@/components/motion';
import { ProductVisual } from '@/components/visual/product-visual';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { ProductFeature } from '@/types/commerce';
import type { ProductMedia } from '@/types/visual';

/**
 * The PDP's storytelling section: the product holds still while its features
 * hand off to one another around it.
 *
 * Same in/hold/out envelope as the home page's scene 02 — a caption that fades
 * in without fading out means every caption ends up stacked on the last one.
 */
export function FeatureProgression({
  media,
  features,
  label,
}: {
  media: ProductMedia;
  features: ProductFeature[];
  label: string;
}) {
  if (features.length === 0) return null;

  return (
    <ScrollScene id="features" length={`${140 + features.length * 60}svh`}>
      <StickyStage className="isolate overflow-clip" align="center">
        <div className="editorial grid h-full w-full items-center gap-10 lg:grid-cols-2">
          {/* Product: a slow, shallow scale across the whole scene. */}
          <SceneLayer
            from={[0, 1]}
            to={{ scale: [0.96, 1.04] }}
            className="mx-auto w-[min(62vw,26rem)] lg:w-full"
          >
            <ProductVisual media={media} slot="feature" />
          </SceneLayer>

          <div className="relative min-h-[13rem]">
            <SceneLayer from={[0, 0.08]} to={{ opacity: [0, 1] }} className="absolute inset-x-0 top-0">
              <Eyebrow>{label}</Eyebrow>
            </SceneLayer>

            {features.map((feature, i) => {
              const span = 0.82 / features.length;
              const start = 0.12 + i * span;
              const isLast = i === features.length - 1;

              return (
                <SceneLayer
                  key={feature.key}
                  from={[start, start + span * 0.28, start + span * 0.72, start + span]}
                  to={{
                    opacity: [0, 1, 1, isLast ? 1 : 0],
                    y: [24, 0, 0, isLast ? 0 : -18],
                  }}
                  className="absolute inset-x-0 top-12"
                >
                  <p className="label text-ember">{feature.label}</p>
                  <p className="reading mt-4 text-title font-medium leading-tight text-ink">
                    {feature.detail}
                  </p>
                </SceneLayer>
              );
            })}

            {/* Progress ticks — one per feature, filling as the scene advances. */}
            <div className="absolute inset-x-0 bottom-0 flex gap-1.5">
              {features.map((feature, i) => {
                const span = 0.82 / features.length;
                const start = 0.12 + i * span;
                return (
                  <div key={feature.key} className="h-px w-8 bg-hairline-strong">
                    <SceneLayer
                      from={[start, start + span * 0.3]}
                      to={{ scale: [0, 1] }}
                      className="h-full w-full origin-left bg-ember"
                    >
                      <span className="sr-only" />
                    </SceneLayer>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </StickyStage>
    </ScrollScene>
  );
}
