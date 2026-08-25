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
 *
 * ── HOW THE TEXT COLUMN IS STACKED ──────────────────────────────────────────
 *
 * The captions must occupy the SAME space (they hand off to one another) while
 * the column still sizes itself to the tallest of them. That is a grid stack:
 * every caption is placed in row 1, column 1 of an inner grid, so the grid's
 * height is the tallest caption's height and nothing needs to be measured.
 *
 * This replaced `min-h-[13rem]` with every child `absolute` — a fixed box that
 * could not grow, so a three-line caption ran straight over the progress ticks
 * pinned to its bottom. The eyebrow and the ticks are now in normal flow, which
 * is what makes the column self-sizing.
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

          {/*
            The sticky buy bar is fixed, so it reserves no space and sat on top
            of the ticks on a phone. Padding by the bar's own token clears it,
            and only where that bar exists — it is `lg:hidden`.
          */}
          <div className="grid content-start gap-8 pb-(--spacing-buy-bar) lg:pb-0">
            <SceneLayer from={[0, 0.08]} to={{ opacity: [0, 1] }}>
              <Eyebrow>{label}</Eyebrow>
            </SceneLayer>

            {/* The stack: one grid cell, every caption in it. */}
            <div className="grid">
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
                    className="col-start-1 row-start-1"
                  >
                    <p className="label text-ember">{feature.label}</p>
                    <p className="reading mt-4 text-title font-medium leading-tight text-ink">
                      {feature.detail}
                    </p>
                  </SceneLayer>
                );
              })}
            </div>

            {/* Progress ticks — one per feature, filling as the scene advances. */}
            <div className="flex gap-1.5">
              {features.map((feature, i) => {
                const span = 0.82 / features.length;
                const start = 0.12 + i * span;
                return (
                  <div key={feature.key} className="h-px w-8 bg-hairline-strong">
                    {/*
                      `scaleX`, not `scale`: a uniform scale on a 1px-tall rail
                      shrinks its height too, so a half-filled tick rendered as
                      a sub-pixel line that all but disappeared.
                    */}
                    <SceneLayer
                      from={[start, start + span * 0.3]}
                      to={{ scaleX: [0, 1] }}
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
