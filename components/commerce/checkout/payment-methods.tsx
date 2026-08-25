'use client';

import { useState } from 'react';
import { DemoBadge } from '@/components/ui/demo-badge';
import { Field } from './field';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { PaymentMethod } from './checkout-machine';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PAYMENT METHODS — ALL DEMO.
 *
 * No provider is contacted. Selecting Apple Pay or Google Pay does NOT open a
 * wallet sheet — it shows a note saying so. The card fields exist so the flow
 * looks complete.
 *
 * Those fields ARE typeable, and that is the fix. They used to be controlled
 * with a literal `value=""` and an empty `onChange`, above a comment claiming
 * they were uncontrolled — so React rewrote every keystroke back to the empty
 * string and the checkout looked broken rather than simulated. They now hold
 * their text in local component state: it never leaves this component, is
 * never read by the checkout machine, never validated, never persisted and
 * never transmitted, and it is discarded the moment the step unmounts.
 *
 * The DEMO badge sits on the section itself rather than only in a source
 * comment, because the person being shown this needs to know it too.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const WALLET_MARKS: Record<Exclude<PaymentMethod, 'card'>, string> = {
  'apple-pay': 'Pay',
  'google-pay': 'Pay',
};

export function PaymentMethods({
  selected,
  onSelect,
}: {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}) {
  const { t } = useLocale();

  /*
    Local, and deliberately local. This state has no setter outside this
    component and is passed to nothing — the only thing it does is let the
    characters appear on screen.
  */
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const setField = (key: keyof typeof card) => (value: string) =>
    setCard((previous) => ({ ...previous, [key]: value }));

  const methods: { id: PaymentMethod; label: string }[] = [
    { id: 'card', label: t.checkout.card },
    { id: 'apple-pay', label: t.checkout.applePay },
    { id: 'google-pay', label: t.checkout.googlePay },
  ];

  return (
    <fieldset>
      <legend className="label mb-5 flex w-full items-center justify-between text-ink-subtle">
        <span>{t.checkout.paymentMethod}</span>
        <DemoBadge tone="accent" />
      </legend>

      <div className="grid grid-cols-3 gap-2">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            aria-pressed={selected === method.id}
            className={cn(
              'flex h-14 flex-col items-center justify-center gap-1 rounded-xs border transition-colors duration-(--duration-fast)',
              selected === method.id
                ? 'border-ink bg-white/[0.04] text-ink'
                : 'border-hairline-strong text-ink-muted hover:border-mist hover:text-ink',
            )}
          >
            <span className="micro-label">{method.label}</span>
            {method.id !== 'card' ? (
              <span aria-hidden="true" className="text-[0.625rem] tracking-tight opacity-50">
                {WALLET_MARKS[method.id]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {selected === 'card' ? (
        <div className="mt-8 flex flex-col gap-7">
          <Field
            label={t.checkout.cardNumber}
            value={card.number}
            onChange={setField('number')}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            autoComplete="off"
          />
          <div className="grid grid-cols-2 gap-6">
            <Field
              label={t.checkout.expiry}
              value={card.expiry}
              onChange={setField('expiry')}
              placeholder="MM / AA"
              autoComplete="off"
            />
            <Field
              label={t.checkout.cvc}
              value={card.cvc}
              onChange={setField('cvc')}
              placeholder="123"
              autoComplete="off"
            />
          </div>
          <p className="micro-label text-ink-subtle">{t.checkout.demoCardNote}</p>
        </div>
      ) : (
        <div className="mt-8 rounded-xs border border-hairline-strong bg-white/[0.02] p-5">
          <p className="text-small text-ink-muted">{t.checkout.demoWalletNote}</p>
        </div>
      )}
    </fieldset>
  );
}
