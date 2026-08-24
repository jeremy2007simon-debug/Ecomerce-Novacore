'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Locale } from '@/types/i18n';
import type { ClientDictionary } from './dictionaries/en';
import { format } from './format';

/**
 * Locale context for CLIENT islands only.
 *
 * Server Components read their copy directly from getServerDictionary — they
 * never consume this. What crosses the RSC boundary is the `client` slice
 * alone, which is a few kilobytes rather than the whole message tree.
 *
 * Note what is NOT stored here: the cart. Switching locale remounts the root
 * layout (the [locale] segment changes), so any state held in a provider at
 * this level is destroyed. That is exactly why cart and UI state live in
 * module-scope Zustand stores instead — see lib/store/.
 */

interface LocaleContextValue {
  locale: Locale;
  t: ClientDictionary;
  /** Interpolate a template from `t`: fmt(t.cart.itemCount, { count: 3 }). */
  fmt: (template: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: ClientDictionary;
  children: ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: dictionary, fmt: format }),
    [locale, dictionary],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside <LocaleProvider>');
  }
  return context;
}

/** Shorthand for the common case. */
export function useT(): ClientDictionary {
  return useLocale().t;
}
