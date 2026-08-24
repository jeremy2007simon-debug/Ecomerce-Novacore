import Link from 'next/link';
import { AtlanticMonogram } from '@/components/visual/atlantic-mark';
import { ContourField } from '@/components/visual/contour-field';
import { GradientField } from '@/components/visual/gradient-field';
import { IconArrowDown } from '@/components/visual/icons';
import { routes } from '@/lib/utils/routes';
import type { Locale } from '@/types/i18n';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HERO — 100svh, Server Component, ZERO client JavaScript.
 *
 * Every animation here is a CSS keyframe from styles/motion.css. That is not a
 * stylistic choice: Motion's feature bundle is dynamically imported, so a
 * JS-driven hero entrance would not begin until after hydration, and Lighthouse
 * would record LCP at the END of the animation.
 *
 * The headline reveals via clip-path with OPACITY PINNED AT 1. An element that
 * starts transparent does not count as painted, so a fade-in headline pushes
 * LCP out by the full duration of the fade. Do not "improve" this by adding a
 * fade — it is the single highest-leverage performance decision on the page.
 *
 * Height is 100svh, never 100vh: on iOS, 100vh is the LARGE viewport, so the
 * CTA would sit under the browser toolbar on first load.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function Hero({
  locale,
  copy,
}: {
  locale: Locale;
  copy: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    cta: string;
    scrollHint: string;
  };
}) {
  return (
    <section className="relative isolate flex h-[100svh] w-full flex-col overflow-clip">
      {/* Backdrop: three layers, all server-rendered SVG/CSS. */}
      <GradientField seed="hero-field" tone="basalt" className="-z-20" />
      <ContourField
        seed="hero"
        tone="ember"
        rings={34}
        amplitude={0.09}
        origin={{ x: 64, y: 78 }}
        className="absolute inset-0 -z-10 opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-void to-transparent"
      />

      <div className="editorial safe-top relative flex grow flex-col pt-6">
        {/* Mark */}
        <div className="atl-enter-fade" style={{ ['--atl-delay' as string]: '0.1s' }}>
          <AtlanticMonogram className="size-7 text-ink" title="Atlantic Supply" />
        </div>

        <div className="flex grow flex-col justify-end pb-[max(2rem,env(safe-area-inset-bottom))]">
          {/* Eyebrow */}
          <p
            className="label atl-enter-fade mb-6 flex items-center gap-3 text-ink-subtle"
            style={{ ['--atl-delay' as string]: '0.28s' }}
          >
            <span className="text-ember">{copy.eyebrow}</span>
            <span aria-hidden="true" className="h-px w-8 bg-hairline-strong" />
            <span>{locale === 'es' ? 'Colección 2026' : 'Collection 2026'}</span>
          </p>

          {/*
            THE LCP ELEMENT.
            Two masked lines, each in its own overflow-clip track. The mask
            travels; opacity never does.
          */}
          <h1 className="text-hero font-medium text-ink">
            <span className="block overflow-clip py-[0.04em]">
              <span
                className="atl-enter-mask block"
                style={{ ['--atl-delay' as string]: '0.16s' }}
              >
                {copy.titleTop}
              </span>
            </span>
            <span className="block overflow-clip py-[0.04em]">
              <span
                className="atl-enter-mask block"
                style={{ ['--atl-delay' as string]: '0.3s' }}
              >
                {copy.titleBottom}
              </span>
            </span>
          </h1>

          <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <p
              className="atl-enter-rise reading text-subtitle text-ink-muted"
              style={{ ['--atl-delay' as string]: '0.52s' }}
            >
              {copy.subtitle}
            </p>

            {/* CTA — discreet, as the brief asks. An outline rule, not a pill. */}
            <Link
              href={routes.anchor(locale, 'origin')}
              className="atl-enter-rise group inline-flex shrink-0 items-center gap-4 self-start border-b border-hairline-strong pb-3 transition-colors duration-[--duration-fast] hover:border-ember focus-visible:border-ember sm:self-auto"
              style={{ ['--atl-delay' as string]: '0.62s' }}
            >
              <span className="label text-ink">{copy.cta}</span>
              <IconArrowDown className="size-4 text-ember transition-transform duration-[--duration-base] ease-[--ease-out-expo] group-hover:translate-y-1" />
            </Link>
          </div>

          {/* Scroll hint: a travelling tick in a hairline track. */}
          <div
            aria-hidden="true"
            className="atl-enter-fade mt-14 flex items-center gap-4"
            style={{ ['--atl-delay' as string]: '0.9s' }}
          >
            <span className="micro-label text-ink-subtle">{copy.scrollHint}</span>
            <span className="atl-scroll-hint relative h-10 w-px overflow-clip bg-hairline">
              <span className="absolute inset-x-0 top-0 h-3 origin-top bg-ember" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
