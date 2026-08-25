import { notFound } from 'next/navigation';

/**
 * Catch-all inside the locale segment, so unmatched URLs get the real 404.
 *
 * Without it, `/es/anything` matched no route at all and Next served its own
 * built-in error page — bare white type reading "404: This page could not be
 * found.", in English, with no header, no footer and no way back. The branded
 * 404 in `[locale]/not-found.tsx` was unreachable from every path on the site.
 *
 * A `not-found.tsx` only renders for a `notFound()` call raised INSIDE its
 * segment; it does not catch URLs that match no route. This route makes the
 * unmatched URL match something, which then raises `notFound()` — and because
 * that happens inside `[locale]`, the layout, the language and the locale
 * provider are all in place by the time the 404 renders.
 *
 * More specific routes always win over a catch-all, so nothing real is
 * shadowed by this.
 */
export default function CatchAll(): never {
  notFound();
}
