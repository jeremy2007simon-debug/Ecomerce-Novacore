import { Reveal, RevealText } from '@/components/motion';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { Eyebrow } from '@/components/ui/eyebrow';

/**
 * SECTION 09 — FIELD NOTES.
 *
 * An editorial-styled instance of the same newsletter component the footer
 * already uses — not a rebuilt form, not a SaaS-style box. Reuses the
 * existing `t.footer.newsletter*` copy (the message is the same whichever
 * moment it appears in) rather than inventing a duplicate set of strings.
 * The footer itself is untouched and keeps its own slim instance — two
 * newsletter moments on one page is an intentional, common e-commerce
 * pattern, not a duplication bug. `surface="home"` (see
 * components/layout/newsletter-form.tsx) keeps signup attribution honest —
 * without it every Field Notes signup would be silently mislabeled as
 * coming from the footer.
 */
export function FieldNotes({
  copy,
  newsletterCopy,
}: {
  copy: { index: string; label: string; title: string; body: string };
  newsletterCopy: { placeholder: string; cta: string; demo: string; infoLabel: string; loading: string };
}) {
  return (
    <section className="editorial py-(--spacing-section)">
      <div className="mx-auto max-w-lg text-center">
        <Reveal>
          <Eyebrow index={copy.index} className="justify-center">
            {copy.label}
          </Eyebrow>
        </Reveal>
        <RevealText as="h2" className="text-headline mt-6 font-medium text-ink" split="none">
          {copy.title}
        </RevealText>
        <Reveal delay={0.08}>
          <p className="reading mx-auto mt-4 text-small text-ink-muted">{copy.body}</p>
        </Reveal>

        <Reveal delay={0.14} className="mt-8">
          <NewsletterForm copy={newsletterCopy} surface="home" />
        </Reveal>
      </div>
    </section>
  );
}
