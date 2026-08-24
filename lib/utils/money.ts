import type { CurrencyCode, Money } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/** Build a Money value from minor units. */
export function money(amount: number, currencyCode: CurrencyCode = 'EUR'): Money {
  return { amount, currencyCode };
}

const LOCALE_TAG: Record<Locale, string> = { es: 'es-ES', en: 'en-IE' };

/**
 * Format minor units for display.
 *
 * Whole amounts drop the decimals ("129 €", not "129,00 €") — a catalogue full
 * of trailing zeros reads as a spreadsheet. Amounts with cents keep them.
 * Formatting is Intl-based and identical on server and client, so it is safe to
 * render during SSR.
 */
export function formatMoney(value: Money, locale: Locale): string {
  const major = value.amount / 100;
  const hasCents = value.amount % 100 !== 0;

  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: 'currency',
    currency: value.currencyCode,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(major);
}

/**
 * Whole-currency formatting for dashboard figures.
 *
 * A KPI reading "19.716,61 €" looks like an invoice line; a KPI reading
 * "19.717 €" looks like a metric. Cents are noise at this magnitude and they
 * make the row harder to scan.
 */
export function formatMoneyRounded(value: Money, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: 'currency',
    currency: value.currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value.amount / 100));
}

/** Compact form for dashboard figures: €1,5 k / €1.5k. */
export function formatMoneyCompact(value: Money, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: 'currency',
    currency: value.currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value.amount / 100);
}

export function addMoney(a: Money, b: Money): Money {
  return { amount: a.amount + b.amount, currencyCode: a.currencyCode };
}

export function multiplyMoney(value: Money, factor: number): Money {
  return { amount: Math.round(value.amount * factor), currencyCode: value.currencyCode };
}

export function formatNumber(value: number, locale: Locale, fractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, locale: Locale, fractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
