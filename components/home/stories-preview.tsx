import Link from 'next/link';
import { Reveal, RevealGroup, RevealItem, RevealText } from '@/components/motion';
import { Eyebrow } from '@/components/ui/eyebrow';
import { routes } from '@/lib/utils/routes';
import type { DemoStory } from '@/lib/commerce/search-providers';
import type { Locale } from '@/types/i18n';

/**
 * SECTION 08 — STORIES PREVIEW.
 *
 * Up to 3 cards from data/stories.ts (built in Phase 2 for Search — no
 * changes here). Every card links to /story, the one real destination that
 * exists today (there is no per-story page yet). "View all stories" stays
 * inert with a "soon" badge — the same pattern already used for the disabled
 * Lookbook nav entry — rather than linking to a /stories index that does not
 * exist. Building that index is out of scope for this phase.
 */
export function StoriesPreview({
  stories,
  locale,
  copy,
}: {
  stories: DemoStory[];
  locale: Locale;
  copy: { index: string; label: string; title: string; viewAllCta: string; soon: string };
}) {
  const preview = stories.slice(0, 3);
  if (preview.length === 0) return null;

  return (
    <section className="editorial py-(--spacing-section)">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <Eyebrow index={copy.index}>{copy.label}</Eyebrow>
          </Reveal>
          <RevealText as="h2" className="text-headline mt-6 font-medium text-ink" split="none">
            {copy.title}
          </RevealText>
        </div>

        <Reveal delay={0.1}>
          <span className="label inline-flex items-center gap-2 text-ink-subtle">
            {copy.viewAllCta}
            <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5 text-ink-subtle">
              {copy.soon}
            </span>
          </span>
        </Reveal>
      </header>

      <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {preview.map((story) => (
          <RevealItem key={story.id}>
            <Link href={routes.story(locale)} className="group block border-t border-hairline pt-6">
              <p className="text-title font-medium text-ink">{story.title[locale]}</p>
              <p className="reading mt-3 text-small text-ink-muted">{story.excerpt[locale]}</p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
