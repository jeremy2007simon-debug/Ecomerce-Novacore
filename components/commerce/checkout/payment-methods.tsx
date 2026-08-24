'use client';

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
 * looks complete, and their values are never read, validated or transmitted;
 * they are deliberately not even wired to state.
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
          {/*
            Uncontrolled on purpose. These inputs have no onChange and no state
            binding, so the values physically cannot leave the DOM node they are
            typed into.
          */}
          <Field
            label={t.checkout.cardNumber}
            value=""
            onChange={() => {}}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            autoComplete="off"
          />
          <div className="grid grid-cols-2 gap-6">
            <Field label={t.checkout.expiry} value="" onChange={() => {}} placeholder="MM / AA" autoComplete="off" />
            <Field label={t.checkout.cvc} value="" onChange={() => {}} placeholder="123" autoComplete="off" />
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
