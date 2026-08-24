import type { Route } from 'next';
import type { Locale } from '@/types/i18n';

/**
 * Typed href builders.
 *
 * `typedRoutes` is on, which is worth keeping — it catches a link to a route
 * that does not exist at build time. What it cannot do is statically prove that
 * an interpolated string like `/${locale}/product/${handle}` matches a known
 * route pattern, because both halves are variables.
 *
 * So the assertion happens ONCE, here, rather than at every call site. If a
 * route is renamed, these functions are the only place that needs to change,
 * and the `Route` return type means callers are still checked against the real
 * route table wherever they pass the result to <Link>.
 */
const route = (path: string) => path as Route;

export const routes = {
  home: (locale: Locale) => route(`/${locale}`),
  collection: (locale: Locale) => route(`/${locale}/collection`),
  collectionFiltered: (locale: Locale, query: string) =>
    route(`/${locale}/collection${query ? `?${query}` : ''}`),
  product: (locale: Locale, handle: string) => route(`/${locale}/product/${handle}`),
  checkout: (locale: Locale) => route(`/${locale}/checkout`),
  search: (locale: Locale, query?: string) =>
    route(`/${locale}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  story: (locale: Locale) => route(`/${locale}/story`),
  /** Story sections that the footer links to by name. */
  storyAnchor: (locale: Locale, id: 'materials' | 'making') =>
    route(`/${locale}/story#${id}`),
  shipping: (locale: Locale) => route(`/${locale}/shipping`),
  returns: (locale: Locale) => route(`/${locale}/returns`),
  sizeGuide: (locale: Locale) => route(`/${locale}/size-guide`),
  contact: (locale: Locale) => route(`/${locale}/contact`),
  terms: (locale: Locale) => route(`/${locale}/terms`),
  privacy: (locale: Locale) => route(`/${locale}/privacy`),
  dashboard: (locale: Locale) => route(`/${locale}/demo/dashboard`),
  anchor: (locale: Locale, id: string) => route(`/${locale}#${id}`),
} as const;
