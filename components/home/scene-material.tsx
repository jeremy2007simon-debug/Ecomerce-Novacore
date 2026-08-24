import { ScrollScene, StickyStage, SceneLayer, RevealText } from '@/components/motion';
import { MaterialMacro } from '@/components/visual/material-macro';
import { Eyebrow } from '@/components/ui/eyebrow';

/**
 * SCENE 03 — BUILT DIFFERENT.
 *
 * The macro fills the stage and the headline sits on top of it. The transition
 * is carried by light: the macro starts dark and low-contrast and resolves as
 * the scene progresses, so the material appears to come INTO the light rather
 * than to slide into frame.
 *
 * The spec figures arrive last, as a hairline table — the moment where the
 * poetry hands off to evidence.
 */
export function SceneMaterial({
  copy,
}: {
  copy: {
    index: string;
    label: string;
    title: string;
    subtitle: string;
    body: string;
    specs: Record<string, string>;
  };
}) {
  const specs = [
    { label: copy.specs.membrane, value: copy.specs.membraneValue },
    { label: copy.specs.column, value: copy.specs.columnValue },
    { label: copy.specs.breathability, value: copy.specs.breathabilityValue },
    { label: copy.specs.finish, value: copy.specs.finishValue },
  ];

  return (
    <ScrollScene id="material" length="300svh">
      <StickyStage className="isolate justify-center overflow-clip">
        {/* Macro: scales down slightly as it brightens — a lens pulling focus. */}
        <SceneLayer
          from={[0, 1]}
          to={{ scale: [1.24, 1.02], opacity: [0.3, 1] }}
          className="absolute inset-0 -z-20"
        >
          <MaterialMacro className="h-full w-full" />
        </SceneLayer>

        {/* Scrim: heaviest at the start, lifting as the scene resolves. */}
        <SceneLayer
          from={[0, 0.55]}
          to={{ opacity: [0.92, 0.42] }}
          className="absolute inset-0 -z-10 bg-void"
        >
          <span className="sr-only" />
        </SceneLayer>

        <div className="editorial relative flex h-full flex-col justify-center">
          <SceneLayer from={[0.02, 0.16]} to={{ opacity: [0, 1], y: [16, 0] }}>
            <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
          </SceneLayer>

          <RevealText
            as="h2"
            driver="scene"
            from={[0.14, 0.5]}
            split="none"
            className="text-display mt-10 font-medium text-ink"
          >
            {copy.title}
          </RevealText>

          <SceneLayer
            from={[0.34, 0.56]}
            to={{ opacity: [0, 1], y: [20, 0] }}
            className="mt-6"
          >
            <p className="text-subtitle text-ink-muted">{copy.subtitle}</p>
          </SceneLayer>

          <SceneLayer
            from={[0.48, 0.7]}
            to={{ opacity: [0, 1], y: [20, 0] }}
            className="reading mt-8"
          >
            <p className="text-body text-ink-muted">{copy.body}</p>
          </SceneLayer>

          {/* Evidence. Hairline rows, mono values, tabular figures. */}
          <SceneLayer from={[0.66, 0.9]} to={{ opacity: [0, 1], y: [24, 0] }} className="mt-14">
            <dl className="grid max-w-3xl grid-cols-1 gap-px sm:grid-cols-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rule-t flex items-baseline justify-between gap-6 py-4"
                >
                  <dt className="label text-ink-subtle">{spec.label}</dt>
                  <dd className="label text-ink" data-numeric>
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </SceneLayer>
        </div>
      </StickyStage>
    </ScrollScene>
  );
}
