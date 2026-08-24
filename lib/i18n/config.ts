export { LOCALES, DEFAULT_LOCALE, isLocale, type Locale, type Localized } from '@/types/i18n';

/** Cookie holding the visitor's explicit language preference. */
export const LOCALE_COOKIE = 'atl_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Human labels for the language switcher. */
export const LOCALE_LABELS: Record<'es' | 'en', { short: string; full: string }> = {
  es: { short: 'ES', full: 'Español' },
  en: { short: 'EN', full: 'English' },
};

/** `hreflang` values emitted in metadata. */
export const HREFLANG: Record<'es' | 'en', string> = {
  es: 'es-ES',
  en: 'en',
};
