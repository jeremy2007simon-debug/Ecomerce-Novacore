'use client';

import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/ui/demo-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Confirmation } from './confirmation';
import { Field } from './field';
import { OrderSummary } from './order-summary';
import { PaymentMethods } from './payment-methods';
import {
  CHECKOUT_STEPS,
  DEMO_ORDER_ID,
  INITIAL_CHECKOUT,
  checkoutReducer,
  nextStep,
  previousStep,
  validateStep,
  type CheckoutStep,
} from './checkout-machine';
import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/locale-provider';
import { orderTotal, subtotal } from '@/lib/commerce/cart-math';
import { useCartHydrated, useCartLines, useCartStore } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils/cn';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHECKOUT — DEMO.
 *
 * NO PAYMENT IS PROCESSED. See checkout-machine.ts.
 *
 * The step lives in a reducer and is mirrored into `?step=` with
 * history.replaceState, so the URL always describes what is on screen without
 * pushing four entries onto the history stack — a shopper pressing Back from
 * the payment step expects to leave checkout, not to walk back through it one
 * field at a time.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function CheckoutFlow({ title }: { title: string }) {
  const { t, locale, fmt } = useLocale();
  const [state, dispatch] = useReducer(checkoutReducer, INITIAL_CHECKOUT);

  const lines = useCartLines();
  const hydrated = useCartHydrated();
  const clear = useCartStore((store) => store.clear);

  // Mirror the step into the URL. replaceState, not push — see above.
  //
  // Also return to the top of the step. Without this, advancing from a long
  // form leaves the visitor part-way down the next one, and completing an
  // order drops them into the middle of the confirmation with the tick
  // animation already off-screen above them.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', state.step);
    window.history.replaceState(null, '', url.toString());

    window.scrollTo({
      top: 0,
      // 'instant' rather than 'smooth': a step change is a new screen, and
      // animating the scroll on top of the step transition reads as two
      // competing movements.
      behavior: 'instant',
    });
  }, [state.step]);

  const total = orderTotal(lines, state.delivery);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const advance = () => {
    const errors = validateStep(state.step, state.fields, {
      required: t.checkout.required,
      invalidEmail: t.checkout.invalidEmail,
      invalidPostal: t.checkout.invalidPostal,
    });

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'set-errors', errors });
      return;
    }

    const target = nextStep(state.step);
    dispatch({ type: 'go-to', step: target });
    track({
      name: 'checkout_step',
      payload: { step: target, index: CHECKOUT_STEPS.indexOf(target) },
    });
  };

  const submit = () => {
    dispatch({ type: 'submitting' });

    // A fixed pause so the confirmation does not appear instantaneously. It is
    // NOT waiting on a network call — there is no network call.
    window.setTimeout(() => {
      track({
        name: 'checkout_completed',
        payload: {
          orderId: DEMO_ORDER_ID,
          value: total.amount,
          itemCount,
          method: state.payment,
        },
      });
      dispatch({ type: 'confirmed', orderId: DEMO_ORDER_ID });
      clear();
    }, 950);
  };

  /* ── Confirmation ─────────────────────────────────────────────────────── */
  // Replaces the whole page including its heading — leaving "Checkout" standing
  // above a confirmed order describes the wrong screen.
  if (state.step === 'confirmation' && state.orderId) {
    return <Confirmation orderId={state.orderId} email={state.fields.email} />;
  }

  /* ── Empty cart ───────────────────────────────────────────────────────── */
  // Gate on `hydrated` so the empty state cannot flash before the persisted
  // cart has been read.
  if (hydrated && lines.length === 0) {
    return (
      <EmptyState
        seed="checkout-empty"
        eyebrow={t.checkout.title}
        title={t.checkout.emptyCartTitle}
        body={t.checkout.emptyCartBody}
        action={
          <Button as={Link} href={routes.collection(locale)} variant="outline">
            {t.cart.emptyCta}
          </Button>
        }
      />
    );
  }

  const stepIndex = CHECKOUT_STEPS.indexOf(state.step);
  const stepLabels: Record<CheckoutStep, string> = {
    contact: t.checkout.steps.contact,
    delivery: t.checkout.steps.delivery,
    payment: t.checkout.steps.payment,
    confirmation: t.checkout.steps.confirmation,
  };

  return (
    <>
      <h1 className="text-headline mb-12 font-medium text-ink">{title}</h1>

      <div className="grid gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
        <div>
        {/* DEMO banner — the first thing on the page. */}
        <div className="mb-10 flex items-start gap-3 rounded-xs border border-ember/30 bg-ember/[0.07] p-4">
          <DemoBadge tone="accent" />
          <p className="text-small text-ink-muted">{t.checkout.demoBanner}</p>
        </div>

        {/* Step rail */}
        <ol className="mb-12 flex items-center gap-3">
          {CHECKOUT_STEPS.slice(0, 3).map((step, i) => (
            <li key={step} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                // Only completed steps are clickable; jumping forward past
                // validation would defeat the point of validating.
                disabled={i >= stepIndex}
                onClick={() => dispatch({ type: 'go-to', step })}
                className={cn(
                  'micro-label whitespace-nowrap transition-colors',
                  i === stepIndex && 'text-ink',
                  i < stepIndex && 'text-ember hover:underline',
                  i > stepIndex && 'text-ink-subtle',
                )}
                aria-current={i === stepIndex ? 'step' : undefined}
              >
                {String(i + 1).padStart(2, '0')} {stepLabels[step]}
              </button>
              {i < 2 ? (
                <span className="h-px grow bg-hairline-strong">
                  <m.span
                    className="block h-full origin-left bg-ember"
                    initial={false}
                    animate={{ scaleX: i < stepIndex ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={state.step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {state.step === 'contact' ? (
              <div className="flex flex-col gap-8">
                <Field
                  label={t.checkout.email}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={state.fields.email}
                  error={state.errors.email}
                  onChange={(value) => dispatch({ type: 'set-field', field: 'email', value })}
                />
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field
                    label={t.checkout.firstName}
                    autoComplete="given-name"
                    value={state.fields.firstName}
                    error={state.errors.firstName}
                    onChange={(value) => dispatch({ type: 'set-field', field: 'firstName', value })}
                  />
                  <Field
                    label={t.checkout.lastName}
                    autoComplete="family-name"
                    value={state.fields.lastName}
                    error={state.errors.lastName}
                    onChange={(value) => dispatch({ type: 'set-field', field: 'lastName', value })}
                  />
                </div>
                <Field
                  label={t.checkout.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  optional
                  value={state.fields.phone}
                  onChange={(value) => dispatch({ type: 'set-field', field: 'phone', value })}
                />
              </div>
            ) : null}

            {state.step === 'delivery' ? (
              <div className="flex flex-col gap-8">
                <Field
                  label={t.checkout.address}
                  autoComplete="address-line1"
                  value={state.fields.address}
                  error={state.errors.address}
                  onChange={(value) => dispatch({ type: 'set-field', field: 'address', value })}
                />
                <Field
                  label={t.checkout.apartment}
                  autoComplete="address-line2"
                  optional
                  value={state.fields.apartment}
                  onChange={(value) => dispatch({ type: 'set-field', field: 'apartment', value })}
                />
                <div className="grid gap-8 sm:grid-cols-3">
                  <Field
                    label={t.checkout.postalCode}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={state.fields.postalCode}
                    error={state.errors.postalCode}
                    onChange={(value) => dispatch({ type: 'set-field', field: 'postalCode', value })}
                  />
                  <Field
                    label={t.checkout.city}
                    autoComplete="address-level2"
                    value={state.fields.city}
                    error={state.errors.city}
                    onChange={(value) => dispatch({ type: 'set-field', field: 'city', value })}
                  />
                  <Field
                    label={t.checkout.province}
                    autoComplete="address-level1"
                    value={state.fields.province}
                    error={state.errors.province}
                    onChange={(value) => dispatch({ type: 'set-field', field: 'province', value })}
                  />
                </div>

                <fieldset className="mt-4">
                  <legend className="label mb-5 text-ink-subtle">{t.checkout.deliveryMethod}</legend>
                  <div className="flex flex-col gap-2">
                    {(['express', 'standard'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => dispatch({ type: 'set-delivery', value: method })}
                        aria-pressed={state.delivery === method}
                        className={cn(
                          'flex items-center justify-between gap-4 rounded-xs border px-5 py-4 text-left transition-colors',
                          state.delivery === method
                            ? 'border-ink bg-white/[0.04]'
                            : 'border-hairline-strong hover:border-mist',
                        )}
                      >
                        <span>
                          <span className="label block text-ink">
                            {method === 'express' ? t.checkout.express : t.checkout.standard}
                          </span>
                          <span className="micro-label mt-1.5 block text-ink-subtle">
                            {method === 'express' ? t.checkout.expressTime : t.checkout.standardTime}
                          </span>
                        </span>
                        <span className="label shrink-0 text-ember" data-numeric>
                          {method === 'standard' || subtotal(lines).amount >= 12000
                            ? t.cart.shippingFree
                            : formatMoney({ amount: 590, currencyCode: 'EUR' }, locale)}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : null}

            {state.step === 'payment' ? (
              <PaymentMethods
                selected={state.payment}
                onSelect={(value) => dispatch({ type: 'set-payment', value })}
              />
            ) : null}
          </m.div>
        </AnimatePresence>

        <div className="mt-12 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'go-to', step: previousStep(state.step) })}
              className="label text-ink-subtle transition-colors hover:text-ink"
            >
              ← {t.checkout.back}
            </button>
          ) : (
            <Link href={routes.collection(locale)} className="label text-ink-subtle hover:text-ink">
              ← {t.cart.continue}
            </Link>
          )}

          {state.step === 'payment' ? (
            <Button variant="accent" size="lg" onClick={submit} disabled={state.submitting}>
              {state.submitting
                ? t.checkout.processing
                : `${t.checkout.payNow} · ${formatMoney(total, locale)}`}
            </Button>
          ) : (
            <Button variant="solid" size="lg" onClick={advance}>
              {state.step === 'contact'
                ? t.checkout.continueToDelivery
                : t.checkout.continueToPayment}
            </Button>
          )}
        </div>

        <p className="micro-label mt-8 text-ink-subtle" data-numeric>
          {itemCount === 1 ? t.cart.itemCountOne : fmt(t.cart.itemCount, { count: itemCount })}
        </p>
      </div>

        <OrderSummary lines={lines} delivery={state.delivery} />
      </div>
    </>
  );
}
