'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { track } from '@/lib/analytics';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALE_LABELS } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/types/i18n';

/**
 * Language switch WITHOUT a full page reload.
 *
 * router.replace on a locale-prefixed path is an App Router soft navigation:
 * Next fetches the RSC payload for the new locale and patches the tree. No
 * document reload, no white flash, scroll position preserved.
 *
 * The catch is that app/[locale]/layout.tsx is the root layout, so changing the
 * segment remounts it and destroys any React state held there. That is exactly
 * why the cart lives in a module-scope Zustand store — a visitor with three
 * items in their bag keeps them across a language change.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next: Locale = locale === 'es' ? 'en' : 'es';

  const switchTo = () => {
    track({ name: 'language_changed', payload: { from: locale, to: next } });

    // Remember the choice so the proxy honours it on the next cold visit.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

    const target = pathname.replace(/^\/(es|en)/, `/${next}`) as Route;
    router.replace(target, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={switchTo}
      className={cn(
        'label inline-flex items-center gap-1.5 text-ink-subtle transition-colors hover:text-ink',
        className,
      )}
      aria-label={`${LOCALE_LABELS[locale].full} → ${LOCALE_LABELS[next].full}`}
    >
      <span className="text-ink">{LOCALE_LABELS[locale].short}</span>
      <span aria-hidden="true" className="text-hairline-strong">
        /
      </span>
      <span>{LOCALE_LABELS[next].short}</span>
    </button>
  );
}
