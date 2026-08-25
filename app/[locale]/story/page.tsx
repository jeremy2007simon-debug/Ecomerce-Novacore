import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Parallax, Reveal, RevealText, ScrollScene, SceneLayer, StickyStage } from '@/components/motion';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Rule } from '@/components/ui/rule';
import { ContourField } from '@/components/visual/contour-field';
import { MaterialMacro } from '@/components/visual/material-macro';
import { OriginVisual } from '@/components/visual/origin-visual';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * STORY.
 *
 * Long-form editorial, assembled entirely from primitives that already exist.
 * A Server Component with no client JS beyond the shared scroll wrappers.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getServerDictionary(locale);

  return {
    title: t.story.title,
    description: t.story.chapters.placeBody,
    alternates: {
      canonical: `/${locale}/story`,
      languages: { 'es-ES': '/es/story', en: '/en/story' },
    },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getServerDictionary(locale);
  const chapters = [
    { key: 'place', title: t.story.chapters.place, body: t.story.chapters.placeBody },
    { key: 'method', title: t.story.chapters.method, body: t.story.chapters.methodBody },
    { key: 'making', title: t.story.chapters.making, body: t.story.chapters.makingBody },
  ];

  return (
    <main id="main">
      {/* ── OPENING ──────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[86svh] items-end overflow-clip pb-(--spacing-section) pt-32">
        <ContourField
          seed="story"
          tone="atlantic"
          rings={32}
          origin={{ x: 34, y: 62 }}
          className="absolute inset-0 -z-10 opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-void to-transparent"
        />

        <div className="editorial">
          <Eyebrow index="—">{t.nav.story}</Eyebrow>
          <h1 className="text-display mt-8 font-medium text-ink">
            <span className="block overflow-clip py-[0.04em]">
              <span className="atl-enter-mask block" style={{ ['--atl-delay' as string]: '0.12s' }}>
                {t.story.title}
              </span>
            </span>
            <span className="block overflow-clip py-[0.04em]">
              <span
                className="atl-enter-mask block text-ink-muted"
                style={{ ['--atl-delay' as string]: '0.26s' }}
              >
                {t.story.subtitle}
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* ── TERRAIN ──────────────────────────────────────────────────────── */}
      <ScrollScene id="story-terrain" length="200svh">
        <StickyStage className="isolate items-center overflow-clip">
          <SceneLayer
            from={[0, 1]}
            to={{ scale: [1.14, 1], y: [50, -30] }}
            className="absolute inset-0 -z-10"
          >
            <OriginVisual seed="story-terrain" className="h-full w-full" />
          </SceneLayer>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-void to-transparent"
          />

          <div className="editorial relative flex h-full flex-col justify-center">
            <SceneLayer from={[0.1, 0.35]} to={{ opacity: [0, 1], y: [24, 0] }}>
              <p className="label text-ember" data-numeric>
                28.2916° N {locale === 'es' ? '16.6291° O' : '16.6291° W'}
              </p>
            </SceneLayer>
            <RevealText
              as="h2"
              driver="scene"
              from={[0.24, 0.6]}
              split="none"
              className="text-headline mt-8 font-medium text-ink"
            >
              {chapters[0]!.title}
            </RevealText>
            <SceneLayer from={[0.46, 0.76]} to={{ opacity: [0, 1], y: [22, 0] }} className="reading mt-8">
              <p className="text-body text-ink-muted">{chapters[0]!.body}</p>
            </SceneLayer>
          </div>
        </StickyStage>
      </ScrollScene>

      {/* ── REMAINING CHAPTERS ───────────────────────────────────────────── */}
      <section className="editorial py-(--spacing-section)">
        <div className="flex flex-col gap-(--spacing-section)">
          {chapters.slice(1).map((chapter, i) => (
            // `id` per chapter: the footer links "Sustainability" straight to
            // `#making`, the chapter that actually covers sourcing, factories
            // and how far materials travel.
            <article
              key={chapter.key}
              id={chapter.key}
              className="grid scroll-mt-24 gap-10 lg:grid-cols-[0.4fr_0.6fr] lg:gap-20"
            >
              <div>
                <Reveal>
                  <Rule label={String(i + 2).padStart(2, '0')} />
                  <h2 className="text-title mt-8 font-medium text-ink">{chapter.title}</h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="text-subtitle leading-relaxed text-ink-muted">{chapter.body}</p>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      {/* ── MATERIAL CODA ────────────────────────────────────────────────── */}
      {/* Linked from the footer as "Materials". */}
      <section id="materials" className="relative isolate scroll-mt-24 overflow-clip border-t border-hairline">
        <Parallax speed={0.16} className="h-[60svh]">
          <MaterialMacro seed="story-macro" className="h-full w-full opacity-70" />
        </Parallax>
        <div className="editorial absolute inset-0 flex items-center">
          <RevealText as="p" split="none" className="text-headline font-medium text-ink">
            {t.home.material.title}
          </RevealText>
        </div>
      </section>
    </main>
  );
}
