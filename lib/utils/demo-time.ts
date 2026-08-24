/**
 * A fixed "now" for the entire demo.
 *
 * Every relative date on the site — review timestamps, dashboard ranges, the
 * order confirmation — is computed from this constant rather than the wall
 * clock. Two reasons, both load-bearing:
 *
 *  1. Hydration. `new Date()` on the server and `new Date()` in the browser are
 *     different values. Any date-derived text rendered from the real clock is a
 *     guaranteed mismatch. ESLint bans both `Date.now()` and zero-argument
 *     `new Date()` in render for this reason.
 *  2. Reproducibility. A sales demo must look identical every time it is shown.
 *     A dashboard whose "today" drifts is a dashboard that eventually shows an
 *     empty chart in front of a client.
 */
export const DEMO_NOW = new Date('2026-08-24T17:40:00.000Z');

export const DAY_MS = 86_400_000;

/** An ISO timestamp `days` before DEMO_NOW. */
export function daysBeforeDemoNow(days: number): string {
  return new Date(DEMO_NOW.getTime() - days * DAY_MS).toISOString();
}

/**
 * Relative time in the visitor's language. Deliberately coarse — "hace 3 días"
 * rather than "hace 3 días y 4 horas", which is both more readable and immune
 * to off-by-one rendering across timezones.
 */
export function formatRelativeDate(iso: string, locale: 'es' | 'en'): string {
  const then = new Date(iso).getTime();
  const days = Math.max(0, Math.round((DEMO_NOW.getTime() - then) / DAY_MS));

  if (days === 0) return locale === 'es' ? 'Hoy' : 'Today';
  if (days === 1) return locale === 'es' ? 'Ayer' : 'Yesterday';
  if (days < 30) return locale === 'es' ? `Hace ${days} días` : `${days} days ago`;

  const months = Math.round(days / 30);
  if (months < 12) {
    if (locale === 'es') return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.round(months / 12);
  if (locale === 'es') return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/** Absolute date, for the `datetime` attribute's human-readable sibling. */
export function formatAbsoluteDate(iso: string, locale: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
