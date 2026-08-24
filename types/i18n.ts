export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Spanish is the default: the demo's primary audience reads Spanish. */
export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

/**
 * A value that exists once per locale.
 *
 * Demo data is authored in this shape and collapsed to plain strings by the
 * repository layer — exactly what the Shopify adapter does with
 * `@inContext(language: …)`. The UI therefore never sees a Localized<T>, which
 * is what keeps the swap from touching component code.
 */
export type Localized<T> = Record<Locale, T>;
