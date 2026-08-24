import type { AnalyticsEvent, AnalyticsSink, TrackedEvent } from '@/types/analytics';
import type { Locale } from '@/types/i18n';
import { DEFAULT_LOCALE } from '@/types/i18n';
import { consoleSink, memorySink } from './sinks';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ANALYTICS — DEMO MODE
 *
 * Events are typed, dispatched and buffered locally. NOTHING is sent anywhere:
 * there is no vendor, no script tag, no beacon, no cookie.
 *
 * PRODUCTION INTEGRATION REQUIRED: register an additional sink here that maps
 * `TrackedEvent` onto a provider's SDK (GA4, Segment, Shopify Web Pixels…).
 * Because AnalyticsEvent is a closed union, that adapter gets an exhaustive
 * switch and the compiler catches any event it forgets to handle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const sinks: AnalyticsSink[] = [consoleSink, memorySink];

export function registerSink(sink: AnalyticsSink): () => void {
  sinks.push(sink);
  return () => {
    const index = sinks.indexOf(sink);
    if (index >= 0) sinks.splice(index, 1);
  };
}

/** Ambient context, set once by the layout and updated on navigation. */
let context: { locale: Locale; path: string } = { locale: DEFAULT_LOCALE, path: '/' };

export function setAnalyticsContext(next: Partial<typeof context>) {
  context = { ...context, ...next };
}

let sessionId: string | null = null;
let sequence = 0;

/**
 * Session id is generated lazily and only in the browser. Generating it at
 * module scope would run during SSR and produce a different value than the
 * client's — the same class of bug as reading localStorage during render.
 */
function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return 'ssr';

  try {
    const existing = window.sessionStorage.getItem('atl.session');
    if (existing) {
      sessionId = existing;
      return existing;
    }
  } catch {
    // Private mode or blocked storage — fall through to an ephemeral id.
  }

  const generated = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  sessionId = generated;
  try {
    window.sessionStorage.setItem('atl.session', generated);
  } catch {
    // Non-fatal: analytics must never break the page.
  }
  return generated;
}

export function track(event: AnalyticsEvent): void {
  // Server renders must not emit events: a static page is prerendered once at
  // build time, so anything tracked there would be a build artefact, not a visit.
  if (typeof window === 'undefined') return;

  sequence += 1;
  const tracked: TrackedEvent = {
    id: `e${sequence.toString(36)}`,
    ts: Date.now(),
    sessionId: getSessionId(),
    locale: context.locale,
    path: context.path,
    event,
  };

  for (const sink of sinks) {
    try {
      sink.send(tracked);
    } catch {
      // A failing sink must never take the storefront down with it.
    }
  }
}

export { memorySink };
export type { AnalyticsEvent, TrackedEvent };
