import type { Money } from '@/types/commerce';

/**
 * Pure cart arithmetic.
 *
 * These are functions over the line array, never stored fields. Persisting a
 * derived `subtotal` guarantees that one day it disagrees with the lines that
 * produced it — usually after a schema migration, and usually in front of a
 * customer.
 */

/** Free express shipping threshold, in minor units. */
export const FREE_SHIPPING_THRESHOLD = 12000;

export const EXPRESS_SHIPPING_COST = 590;

export interface CartLineLike {
  unitPrice: Money;
  quantity: number;
}

export function itemCount(lines: CartLineLike[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function subtotal(lines: CartLineLike[]): Money {
  const amount = lines.reduce((total, line) => total + line.unitPrice.amount * line.quantity, 0);
  return { amount, currencyCode: lines[0]?.unitPrice.currencyCode ?? 'EUR' };
}

export function qualifiesForFreeShipping(lines: CartLineLike[]): boolean {
  return subtotal(lines).amount >= FREE_SHIPPING_THRESHOLD;
}

/** Remaining spend to unlock free shipping. Zero once unlocked. */
export function freeShippingRemaining(lines: CartLineLike[]): Money {
  const current = subtotal(lines).amount;
  return {
    amount: Math.max(0, FREE_SHIPPING_THRESHOLD - current),
    currencyCode: lines[0]?.unitPrice.currencyCode ?? 'EUR',
  };
}

/** Progress toward the threshold, 0–1. Drives the meter's scaleX. */
export function freeShippingProgress(lines: CartLineLike[]): number {
  const current = subtotal(lines).amount;
  return Math.min(1, current / FREE_SHIPPING_THRESHOLD);
}

export function shippingCost(lines: CartLineLike[], method: 'standard' | 'express'): Money {
  const currencyCode = lines[0]?.unitPrice.currencyCode ?? 'EUR';
  if (method === 'standard') return { amount: 0, currencyCode };
  return {
    amount: qualifiesForFreeShipping(lines) ? 0 : EXPRESS_SHIPPING_COST,
    currencyCode,
  };
}

export function orderTotal(lines: CartLineLike[], method: 'standard' | 'express'): Money {
  const goods = subtotal(lines);
  const shipping = shippingCost(lines, method);
  return { amount: goods.amount + shipping.amount, currencyCode: goods.currencyCode };
}
