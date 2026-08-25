'use client';

import { useId, useState } from 'react';
import { DemoBadge } from '@/components/ui/demo-badge';

/**
 * Newsletter sign-up — DEMO.
 *
 * NOTHING IS TRANSMITTED. No action, no fetch, no storage.
 *
 * What changed, and why it mattered: the form carried `action="#"` and a
 * `type="button"` submit control. So the button did nothing at all, while
 * pressing Enter in the field triggered a real GET navigation to `#` — the
 * page reloaded and the shopper lost their bag drawer, their scroll position
 * and any filter they had applied. A demo that is inert should be inert in
 * both directions.
 *
 * Now: `onSubmit` calls `preventDefault`, there is no `action` to fall back
 * to, the input carries a `name`, and both Enter and the button reach the same
 * acknowledgement.
 */
export function NewsletterForm({
  copy,
}: {
  copy: { placeholder: string; cta: string; demo: string; infoLabel: string };
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
        className="mt-7 flex items-center gap-3 border-b border-hairline-strong pb-3"
      >
        <label htmlFor={id} className="sr-only">
          {copy.placeholder}
        </label>
        <input
          id={id}
          name="email"
          type="email"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (sent) setSent(false);
          }}
          placeholder={copy.placeholder}
          className="w-full bg-transparent text-small text-ink outline-none placeholder:text-ink-subtle"
        />
        <button
          type="submit"
          className="label shrink-0 text-ember transition-colors duration-(--duration-fast) hover:text-paper"
        >
          {copy.cta}
        </button>
      </form>

      <p
        className="micro-label mt-3 flex items-center gap-2 text-ink-subtle"
        {...(sent ? { role: 'status' } : {})}
      >
        <DemoBadge />
      </p>

      <details className="group mt-2">
        <summary className="label inline-flex cursor-pointer list-none items-center gap-2 text-ink-subtle [&::-webkit-details-marker]:hidden">
          {copy.infoLabel}
          <span
            aria-hidden="true"
            className="text-[0.625rem] transition-transform duration-(--duration-fast) group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <p className="reading mt-2 text-small text-ink-muted">{copy.demo}</p>
      </details>
    </>
  );
}
