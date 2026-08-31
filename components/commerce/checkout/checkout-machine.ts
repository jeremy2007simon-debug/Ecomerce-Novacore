/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHECKOUT — DEMO STATE MACHINE
 *
 * NO PAYMENT IS PROCESSED. Nothing here contacts a payment provider, no card
 * details are read, stored or transmitted, and no API key exists in this
 * project. The "processing" pause is a fixed timeout so the confirmation does
 * not appear instantaneously — it is not waiting on anything.
 *
 * PRODUCTION INTEGRATION REQUIRED: a real checkout replaces `submit` with a
 * server action that creates a payment intent. The step machine and every form
 * component stay exactly as they are.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { isValidEmail } from '@/lib/utils/email';

export const CHECKOUT_STEPS = ['contact', 'delivery', 'payment', 'confirmation'] as const;
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export type DeliveryMethod = 'standard' | 'express';
export type PaymentMethod = 'card' | 'apple-pay' | 'google-pay';

export interface CheckoutFields {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  fields: CheckoutFields;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  errors: Partial<Record<keyof CheckoutFields, string>>;
  submitting: boolean;
  orderId: string | null;
}

export type CheckoutAction =
  | { type: 'set-field'; field: keyof CheckoutFields; value: string }
  | { type: 'set-delivery'; value: DeliveryMethod }
  | { type: 'set-payment'; value: PaymentMethod }
  | { type: 'set-errors'; errors: CheckoutState['errors'] }
  | { type: 'go-to'; step: CheckoutStep }
  | { type: 'submitting' }
  | { type: 'confirmed'; orderId: string };

export const INITIAL_CHECKOUT: CheckoutState = {
  step: 'contact',
  fields: {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'España',
  },
  delivery: 'express',
  payment: 'card',
  errors: {},
  submitting: false,
  orderId: null,
};

export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'set-field': {
      // Clear this field's error as soon as the visitor edits it. Leaving an
      // error visible while someone is actively fixing it is the most annoying
      // form behaviour there is.
      const errors = { ...state.errors };
      delete errors[action.field];
      return {
        ...state,
        fields: { ...state.fields, [action.field]: action.value },
        errors,
      };
    }
    case 'set-delivery':
      return { ...state, delivery: action.value };
    case 'set-payment':
      return { ...state, payment: action.value };
    case 'set-errors':
      return { ...state, errors: action.errors };
    case 'go-to':
      return { ...state, step: action.step, errors: {} };
    case 'submitting':
      return { ...state, submitting: true };
    case 'confirmed':
      return { ...state, submitting: false, step: 'confirmation', orderId: action.orderId };
    default:
      return state;
  }
}

/** Fields each step requires before it will advance. */
const REQUIRED: Record<CheckoutStep, (keyof CheckoutFields)[]> = {
  contact: ['email', 'firstName', 'lastName'],
  delivery: ['address', 'city', 'postalCode', 'province'],
  payment: [],
  confirmation: [],
};

const POSTAL_PATTERN = /^\d{5}$/;

export function validateStep(
  step: CheckoutStep,
  fields: CheckoutFields,
  messages: { required: string; invalidEmail: string; invalidPostal: string },
): CheckoutState['errors'] {
  const errors: CheckoutState['errors'] = {};

  for (const field of REQUIRED[step]) {
    if (fields[field].trim().length === 0) {
      errors[field] = messages.required;
    }
  }

  if (step === 'contact' && fields.email.trim() && !isValidEmail(fields.email)) {
    errors.email = messages.invalidEmail;
  }

  if (step === 'delivery' && fields.postalCode.trim() && !POSTAL_PATTERN.test(fields.postalCode.trim())) {
    errors.postalCode = messages.invalidPostal;
  }

  return errors;
}

export function nextStep(step: CheckoutStep): CheckoutStep {
  const index = CHECKOUT_STEPS.indexOf(step);
  return CHECKOUT_STEPS[Math.min(index + 1, CHECKOUT_STEPS.length - 1)] as CheckoutStep;
}

export function previousStep(step: CheckoutStep): CheckoutStep {
  const index = CHECKOUT_STEPS.indexOf(step);
  return CHECKOUT_STEPS[Math.max(index - 1, 0)] as CheckoutStep;
}

/**
 * The demo order number. Fixed, per the brief — a real implementation returns
 * this from the order-creation call.
 */
export const DEMO_ORDER_ID = 'ATL-2048';
