'use client';

import { useId, useState } from 'react';
import { DemoBadge } from '@/components/ui/demo-badge';
import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/locale-provider';
import { isValidEmail } from '@/lib/utils/email';

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Newsletter sign-up — DEMO.
 *
 * NOTHING IS TRANSMITTED. No action, no fetch, no storage. The `loading` pause
 * is a fixed short timeout — explicitly simulated latency, not a real network
 * request — and `error` is driven by real email-shape validation (the same
 * `isValidEmail` checkout uses), never a fabricated random failure rate. A
 * fake failure chance would read as a bug in a demo whose entire point is to
 * look production-real.
 */
export function NewsletterForm({
  copy,
}: {
  copy: { placeholder: string; cta: string; demo: string; infoLabel: string; loading: string };
}) {
  const { t } = useLocale();
  const id = useId();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (status === 'loading') return;

          if (!isValidEmail(value)) {
            setStatus('error');
            return;
          }

          setStatus('loading');
          window.setTimeout(() => {
            setStatus('success');
            track({ name: 'newsletter_signup', payload: { surface: 'footer' } });
          }, 500);
        }}
        className="mt-7 flex items-center gap-3 border-b border-hairline-strong pb-3"
        noValidate
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
            if (status !== 'idle' && status !== 'loading') setStatus('idle');
          }}
          placeholder={copy.placeholder}
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? `${id}-error` : undefined}
          disabled={status === 'loading'}
          className="w-full bg-transparent text-small text-ink outline-none placeholder:text-ink-subtle disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="label shrink-0 text-ember transition-colors duration-(--duration-fast) hover:text-paper disabled:opacity-60"
        >
          {status === 'loading' ? copy.loading : copy.cta}
        </button>
      </form>

      {status === 'error' ? (
        <p id={`${id}-error`} role="alert" className="mt-3 text-small text-ember">
          {t.checkout.invalidEmail}
        </p>
      ) : (
        <p
          className="micro-label mt-3 flex items-center gap-2 text-ink-subtle"
          {...(status === 'success' ? { role: 'status' } : {})}
        >
          <DemoBadge />
        </p>
      )}

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
