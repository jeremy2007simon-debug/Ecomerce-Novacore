import 'server-only';
import type { Locale } from '@/types/i18n';
import type { Dictionary } from './dictionaries/en';

/**
 * Server-side dictionary loader.
 *
 * `import 'server-only'` makes it a BUILD ERROR to import this from a client
 * component — which matters, because the full dictionary is roughly six times
 * the size of the `client` slice and there is no reason for any of the server
 * copy to reach the browser.
 *
 * The dynamic imports mean a page only ever loads the locale it renders.
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => (await import('./dictionaries/en')).en as Dictionary,
  es: async () => (await import('./dictionaries/es')).es,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

/** The server slice — what Server Components actually read. */
export async function getServerDictionary(locale: Locale) {
  return (await getDictionary(locale)).server;
}

/** The client slice — the only part passed across the RSC boundary. */
export async function getClientDictionary(locale: Locale) {
  return (await getDictionary(locale)).client;
}
