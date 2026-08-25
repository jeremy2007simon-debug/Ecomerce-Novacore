'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/ui/demo-badge';

/**
 * Contact form — DEMO.
 *
 * NOTHING IS TRANSMITTED. There is no action, no fetch and no storage: the
 * submit handler calls `preventDefault` and swaps the form for an on-page
 * acknowledgement that says, in the visitor's own language, that nothing was
 * sent. That is the same posture as the checkout — show the whole flow, never
 * imply a real system behind it.
 *
 * The fields are genuinely writable and genuinely controlled, which is the
 * distinction that matters: a form you cannot type into reads as broken, not
 * as a demo.
 */
export function ContactForm({
  copy,
}: {
  copy: { name: string; email: string; message: string; send: string; demo: string };
}) {
  const id = useId();
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 border border-hairline-strong p-8"
      >
        <DemoBadge />
        <p className="reading text-body text-ink-muted">{copy.demo}</p>
        <Button variant="link" size="sm" onClick={() => setSent(false)}>
          {copy.send}
        </Button>
      </div>
    );
  }

  return (
    <form
      // DEMO: preventDefault and stop. No action attribute, so there is no
      // navigation to fall back to and pressing Enter cannot reload the page.
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-8"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <TextField
          id={`${id}-name`}
          name="name"
          label={copy.name}
          value={values.name}
          onChange={set('name')}
          autoComplete="name"
        />
        <TextField
          id={`${id}-email`}
          name="email"
          type="email"
          label={copy.email}
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor={`${id}-message`} className="micro-label mb-2.5 text-ink-subtle">
          {copy.message}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => set('message')(event.target.value)}
          className="w-full resize-y border-b border-hairline-strong bg-transparent pb-3 text-body text-ink outline-none transition-colors focus:border-ink"
        />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" variant="solid">
          {copy.send}
        </Button>
        <p className="micro-label flex items-center gap-2 text-ink-subtle">
          <DemoBadge />
          {copy.demo}
        </p>
      </div>
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="micro-label mb-2.5 text-ink-subtle">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-b border-hairline-strong bg-transparent pb-3 text-body text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-ink"
      />
    </div>
  );
}
