import { ScrollScene, StickyStage, SceneLayer, RevealText } from '@/components/motion';
import { OriginVisual } from '@/components/visual/origin-visual';
import { Eyebrow } from '@/components/ui/eyebrow';

/**
 * SCENE 01 — ORIGIN.
 *
 * A near-black stage. Coordinates arrive first, then the place name, then the
 * terrain resolves out of the dark as the visual scales up.
 *
 * Note the composition: ScrollScene and its layers are client components, but
 * everything they wrap — the copy, the entire SVG relief — is server-rendered
 * and passes through as an RSC payload. The client cost of this scene is the
 * couple of kilobytes of primitives, not the content.
 */
export function SceneOrigin({
  copy,
}: {
  copy: {
    index: string;
    label: string;
    coordinates: string;
    place: string;
    region: string;
    body: string;
  };
}) {
  return (
    <ScrollScene id="origin" length="260svh">
      <StickyStage className="isolate items-center overflow-clip">
        {/* Terrain: creeps up and scales as the scene progresses. */}
        <SceneLayer
          from={[0, 1]}
          to={{ scale: [1.16, 1], y: [70, -40], opacity: [0.25, 1] }}
          className="absolute inset-0 -z-10"
        >
          <OriginVisual className="h-full w-full" />
        </SceneLayer>

        {/* Floor gradient keeps the terrain from ending on a hard edge. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-void via-void/70 to-transparent"
        />

        <div className="editorial relative flex h-full flex-col justify-center">
          {/* Coordinates — the first thing to arrive, in mono. */}
          <SceneLayer from={[0.02, 0.2]} to={{ opacity: [0, 1], y: [18, 0] }}>
            <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
          </SceneLayer>

          <SceneLayer from={[0.06, 0.26]} to={{ opacity: [0, 1], y: [24, 0] }} className="mt-10">
            <p className="label text-[0.8125rem] text-ember" data-numeric>
              {copy.coordinates}
            </p>
          </SceneLayer>

          {/* Place name, masked in line by line off the scene progress. */}
          <RevealText
            as="h2"
            driver="scene"
            from={[0.22, 0.62]}
            split="lines"
            className="text-display mt-6 font-medium text-ink"
          >
            {`${copy.place}\n${copy.region}`}
          </RevealText>

          <SceneLayer
            from={[0.52, 0.82]}
            to={{ opacity: [0, 1], y: [22, 0] }}
            className="reading mt-10"
          >
            <p className="text-body text-ink-muted">{copy.body}</p>
          </SceneLayer>
        </div>
      </StickyStage>
    </ScrollScene>
  );
}
