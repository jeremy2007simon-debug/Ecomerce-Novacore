import { Rule } from '@/components/ui/rule';
import { cn } from '@/lib/utils/cn';

/**
 * Product details.
 *
 * Native <details>/<summary>. It is keyboard accessible, announced correctly by
 * screen readers, findable by in-page search (browsers open a closed <details>
 * to reveal a match), and works with JavaScript disabled — none of which a
 * hand-rolled accordion gets without real effort.
 *
 * The marker is replaced with a rotating plus, and `interpolate-size` lets the
 * height animate to `auto` in browsers that support it, degrading to an instant
 * open elsewhere.
 */
export function DetailsAccordion({
  sections,
}: {
  sections: { title: string; body?: string; items?: string[] }[];
}) {
  return (
    <div className="flex flex-col">
      {sections.map((section) => (
        <details key={section.title} className="group border-b border-hairline">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="label text-ink">{section.title}</span>
            <span
              aria-hidden="true"
              className="relative size-3 shrink-0 text-ink-subtle transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-open:rotate-45"
            >
              <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
              <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
            </span>
          </summary>

          <div className="pb-6">
            {section.body ? <p className="reading text-small text-ink-muted">{section.body}</p> : null}
            {section.items ? (
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-small text-ink-muted">
                    <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-hairline-strong" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}

/**
 * Spec table. Hairline rows, mono labels, tabular values.
 *
 * Two columns are decided by a CONTAINER query, not a viewport one. This table
 * lives in half a grid track, so `sm:` — true from a 640px viewport — split it
 * into two columns inside a 421px column at 1024px, crushing "PESO 340 g/m²"
 * onto two lines. `@2xl` (42rem) is the width at which two label/value pairs
 * plus their gap actually fit, whatever the viewport is doing.
 *
 * The last row spans both columns when the count is odd. ATLANTIC 01 has five
 * specs where the others have four, and the orphan left a half-width hairline
 * hanging in mid-air under the final row.
 */
export function SpecTable({
  specs,
  label,
}: {
  specs: { label: string; value: string }[];
  label: string;
}) {
  const orphanLastRow = specs.length % 2 === 1;

  return (
    <div className="@container">
      <Rule label={label} className="mb-6" />
      <dl className="grid grid-cols-1 @2xl:grid-cols-2 @2xl:gap-x-12">
        {specs.map((spec, i) => (
          <div
            key={spec.label}
            className={cn(
              'flex items-baseline justify-between gap-6 border-b border-hairline py-3.5',
              orphanLastRow && i === specs.length - 1 && '@2xl:col-span-2',
            )}
          >
            <dt className="micro-label text-ink-subtle">{spec.label}</dt>
            <dd className="text-small text-ink" data-numeric>
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
