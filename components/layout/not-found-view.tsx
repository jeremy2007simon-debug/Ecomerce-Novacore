'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContourField } from '@/components/visual/contour-field';
import { useLocale } from '@/lib/i18n/locale-provider';
import { fontVariables } from '@/styles/fonts';
import { routes } from '@/lib/utils/routes';

/**
 * The 404 body.
 *
 * A client island purely to get the language right. `not-found.tsx` cannot
 * read route params, so it used to render `DEFAULT_LOCALE` unconditionally:
 * an English visitor who mistyped a URL got the page in Spanish, and both CTAs
 * dropped them into `/es`, discarding the language they had chosen.
 *
 * Two other routes to the same information were rejected. `cookies()` reads
 * the language cookie correctly but is a dynamic API, and calling it here
 * opted the ENTIRE `[locale]` tree out of static prerendering — every product
 * page went from `●` to `ƒ` in the build output. `usePathname()` works but
 * only fixes the links, not the copy.
 *
 * This reads the locale from the provider that `[locale]/layout.tsx` already
 * wraps every page in, including this one. Correct language, correct links,
 * and the build stays fully static. The `notFound` strings moved from the
 * server slice to the client slice to make it possible — five short strings.
 */
export function NotFoundView() {
  const { t, locale } = useLocale();

  /*
    Restore `lang` and the font variables on <html>.

    On a not-found render Next replaces the root element with its own error
    shell — `<html id="__next_error__">`, with no attributes — so the layout's
    `lang` and font-variable classes are dropped. The header, footer and body
    styling all survive; these two do not. Without `lang` a screen reader reads
    Spanish copy in an English voice, and without the variables every `--font-*`
    falls back, so the 404 was the one page on the site in the wrong typeface.

    Effect rather than markup because the element is outside React's tree here.
  */
  useEffect(() => {
    const root = document.documentElement;
    if (root.lang === locale) return;
    root.lang = locale;
    root.classList.add(...fontVariables.split(' ').filter(Boolean));
  }, [locale]);

  return (
    <main id="main" className="relative isolate flex min-h-[86svh] items-center overflow-clip">
      <ContourField
        seed="not-found"
        tone="ember"
        rings={28}
        origin={{ x: 68, y: 40 }}
        className="absolute inset-0 -z-10 opacity-35"
      />

      <div className="editorial">
        <p className="text-hero font-medium leading-none text-ink" data-numeric>
          {t.notFound.code}
        </p>
        <h1 className="text-title mt-8 font-medium text-ink">{t.notFound.title}</h1>
        <p className="reading mt-4 text-body text-ink-muted">{t.notFound.body}</p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button as={Link} href={routes.collection(locale)} variant="solid">
            {t.notFound.cta}
          </Button>
          <Button as={Link} href={routes.home(locale)} variant="outline">
            {t.notFound.home}
          </Button>
        </div>
      </div>
    </main>
  );
}
