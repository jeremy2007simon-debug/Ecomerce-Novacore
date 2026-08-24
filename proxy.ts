import { NextResponse, type NextRequest } from 'next/server';

/**
 * Locale negotiation.
 *
 * NOTE: in Next 16 this file is `proxy.ts`, not `middleware.ts` — the file was
 * renamed and the export with it. It runs on the Node.js runtime.
 *
 * Every content URL is locale-prefixed (/es/…, /en/…). Only the bare, unmatched
 * path is redirected, so all real routes stay statically prerendered. The
 * alternative — one URL serving both languages off a cookie — would force every
 * Server Component to read a cookie, which opts the route out of static
 * rendering entirely and takes the Lighthouse score with it.
 */

const LOCALES = ['es', 'en'] as const;
const DEFAULT_LOCALE = 'es';

function negotiate(request: NextRequest): string {
  const cookie = request.cookies.get('atl_locale')?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie;

  // Parse Accept-Language by quality, taking the first supported match.
  const header = request.headers.get('accept-language');
  if (header) {
    const preferences = header
      .split(',')
      .map((part) => {
        const [tag = '', q = 'q=1'] = part.trim().split(';');
        return { tag: tag.trim().toLowerCase(), q: Number.parseFloat(q.replace('q=', '')) || 0 };
      })
      .sort((a, b) => b.q - a.q);

    for (const preference of preferences) {
      const base = preference.tag.split('-')[0];
      if (base && (LOCALES as readonly string[]).includes(base)) return base;
    }
  }

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = negotiate(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, and anything with a file extension.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
