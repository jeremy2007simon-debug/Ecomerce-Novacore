import type { ReactNode } from 'react';
import { Reveal, RevealText } from '@/components/motion';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Rule } from '@/components/ui/rule';

/**
 * The shell for the site's information pages — shipping, returns, size guide,
 * contact, terms, privacy.
 *
 * These pages exist because the footer linked to them. Rather than six
 * one-off layouts, they share this one, which is assembled from the
 * primitives the rest of the site already uses: the mono eyebrow, a
 * `text-headline` title, a `reading`-width intro and hairline-ruled sections.
 * Nothing new is introduced to the design language.
 *
 * Server Component throughout. The only client code any of these pages carries
 * is the shared layout chrome.
 */
export function DocumentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main id="main" className="editorial pt-28 pb-(--spacing-section) lg:pt-36">
      <header className="border-b border-hairline pb-(--spacing-section)">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <RevealText
          as="h1"
          driver="css"
          split="none"
          className="text-headline mt-6 font-medium text-ink"
        >
          {title}
        </RevealText>
        {intro ? (
          <Reveal delay={0.1}>
            <p className="reading mt-8 text-subtitle leading-relaxed text-ink-muted">{intro}</p>
          </Reveal>
        ) : null}
      </header>

      <div className="flex flex-col gap-(--spacing-section) pt-(--spacing-section)">{children}</div>
    </main>
  );
}

/**
 * One block within a document page: a ruled label on the left, content on the
 * right. Same 0.7/1.3 split as the PDP's details section, so the two read as
 * parts of one site.
 */
export function DocumentSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
      <div>
        <Rule label={label} />
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/**
 * A definition-style prose list: title, then body. Used for the returns steps
 * and both legal pages.
 */
export function DocumentList({
  items,
  numbered = false,
}: {
  // `readonly`: the dictionaries are `as const`, so every array reaching these
  // components is a readonly tuple. Widening here is what keeps the typed
  // dictionary — where a missing key is a compile error — usable from JSX.
  items: readonly { readonly title: string; readonly body: string }[];
  numbered?: boolean;
}) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={item.title} className="border-b border-hairline py-6 first:pt-0 last:border-0">
          <div className="flex items-baseline gap-4">
            {numbered ? (
              <span className="micro-label shrink-0 text-ember" data-numeric>
                {String(i + 1).padStart(2, '0')}
              </span>
            ) : null}
            <h2 className="text-title font-medium text-ink">{item.title}</h2>
          </div>
          <p className="reading mt-3 text-body text-ink-muted">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * A responsive data table.
 *
 * Below `md` it is not a table at all: each row becomes a stacked block with
 * its column name beside each value, because a five-column table on a 375px
 * screen either overflows the page or shrinks the type to nothing. The markup
 * stays a real `<table>` with real headers throughout, so it is still announced
 * correctly — only the visual layout changes.
 */
export function DocumentTable({
  columns,
  rows,
  caption,
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  caption: string;
}) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <thead className="hidden md:table-header-group">
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              scope="col"
              className="micro-label border-b border-hairline-strong pb-3 pr-6 font-normal text-ink-subtle last:pr-0"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="block md:table-row-group">
        {rows.map((row) => (
          <tr
            key={row[0]}
            className="block border-b border-hairline py-4 md:table-row md:py-0"
          >
            {row.map((cell, i) => (
              <td
                key={columns[i]}
                data-numeric={i > 0 ? '' : undefined}
                className="flex items-baseline justify-between gap-6 py-1 text-small text-ink md:table-cell md:border-b md:border-hairline md:py-4 md:pr-6 md:last:pr-0"
              >
                <span className="micro-label text-ink-subtle md:hidden" aria-hidden="true">
                  {columns[i]}
                </span>
                <span className={i === 0 ? 'text-ink' : 'text-ink-muted md:text-ink'}>{cell}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** A hairline-separated list of plain notes. */
export function DocumentNotes({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item} className="flex gap-4 text-body text-ink-muted">
          <span aria-hidden="true" className="mt-3.5 h-px w-4 shrink-0 bg-hairline-strong" />
          <span className="reading">{item}</span>
        </li>
      ))}
    </ul>
  );
}
