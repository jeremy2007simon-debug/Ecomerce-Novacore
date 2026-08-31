'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/ui/demo-badge';

/**
 * Order tracking form — DEMO.
 *
 * Same posture as the contact form: NOTHING IS TRANSMITTED. There is no order
 * system behind this, so the submit handler never pretends to look one up —
 * it swaps the form for the same honest disclosure the rest of the site uses,
 * in the visitor's own language.
 */
export function TrackOrderForm({
  copy,
}: {
  copy: { orderNumber: string; email: string; submit: string; demo: string };
}) {
  const id = useId();
  const [values, setValues] = useState({ orderNumber: '', email: '' });
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 border border-hairline-strong p-8">
        <DemoBadge />
        <p className="reading text-body text-ink-muted">{copy.demo}</p>
        <Button variant="link" size="sm" onClick={() => setSent(false)}>
          {copy.submit}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-8"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor={`${id}-order`} className="micro-label mb-2.5 text-ink-subtle">
            {copy.orderNumber}
          </label>
          <input
            id={`${id}-order`}
            name="orderNumber"
            value={values.orderNumber}
            onChange={(event) => set('orderNumber')(event.target.value)}
            className="w-full border-b border-hairline-strong bg-transparent pb-3 text-body text-ink outline-none transition-colors focus:border-ink"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={`${id}-email`} className="micro-label mb-2.5 text-ink-subtle">
            {copy.email}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set('email')(event.target.value)}
            className="w-full border-b border-hairline-strong bg-transparent pb-3 text-body text-ink outline-none transition-colors focus:border-ink"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" variant="solid">
          {copy.submit}
        </Button>
        <p className="micro-label flex items-center gap-2 text-ink-subtle">
          <DemoBadge />
          {copy.demo}
        </p>
      </div>
    </form>
  );
}
