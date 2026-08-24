import type { AnalyticsSink, TrackedEvent } from '@/types/analytics';

/**
 * DEMO SINKS.
 *
 * Neither of these makes a network request. There is no analytics vendor
 * configured, and the architecture is deliberately arranged so that adding one
 * means registering a third sink — not editing any component.
 */

/** Development only: readable, grouped console output. */
export const consoleSink: AnalyticsSink = {
  id: 'console',
  send(event: TrackedEvent) {
    if (process.env.NODE_ENV === 'production') return;
    console.debug(
      `%c analytics %c ${event.event.name}`,
      'background:#B4552A;color:#0A0B0D;padding:1px 4px;border-radius:2px',
      'color:#8A9099',
      event.event.payload,
    );
  },
};

const RING_CAPACITY = 120;
const STORAGE_KEY = 'atl.events.v1';

/**
 * A bounded ring buffer of the events this session produced.
 *
 * This powers the live EVENT STREAM panel on /demo/dashboard: a business owner
 * browses the store, opens the dashboard, and sees their own visit. It
 * demonstrates the analytics layer far more convincingly than a static chart.
 *
 * WHY IT IS PERSISTED TO sessionStorage
 *
 * The dashboard is deliberately not linked from the storefront — the intended
 * path is someone typing /demo/dashboard into the address bar. That is a hard
 * navigation, which tears down module state, so a purely in-memory buffer
 * arrives empty exactly when the feature is being demonstrated. (Verified: the
 * panel showed nothing after a real browse-then-navigate run.)
 *
 * sessionStorage keeps it honest — scoped to the tab, cleared when it closes,
 * never transmitted anywhere — while making the feature work the way it is
 * actually used.
 *
 * Hydration happens on first `subscribe`, which runs in an effect, so the
 * server snapshot and the first client render both see an empty buffer and
 * there is no mismatch.
 */
class MemorySink implements AnalyticsSink {
  readonly id = 'memory';
  private buffer: TrackedEvent[] = [];
  private listeners = new Set<(events: TrackedEvent[]) => void>();
  private hydrated = false;

  send(event: TrackedEvent) {
    this.buffer = [event, ...this.buffer].slice(0, RING_CAPACITY);
    this.persist();
    this.emit();
  }

  /** Newest first. Stable reference between changes. */
  snapshot(): TrackedEvent[] {
    return this.buffer;
  }

  subscribe(listener: (events: TrackedEvent[]) => void): () => void {
    this.hydrate();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear() {
    this.buffer = [];
    this.persist();
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener(this.buffer);
  }

  private hydrate() {
    if (this.hydrated || typeof window === 'undefined') return;
    this.hydrated = true;

    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const stored = JSON.parse(raw) as TrackedEvent[];
      if (!Array.isArray(stored) || stored.length === 0) return;

      // Merge rather than replace: events fired during this page's own load
      // are already in the buffer and are newer than anything stored.
      const seen = new Set(this.buffer.map((event) => `${event.sessionId}:${event.id}`));
      const restored = stored.filter((event) => !seen.has(`${event.sessionId}:${event.id}`));

      this.buffer = [...this.buffer, ...restored].slice(0, RING_CAPACITY);
      this.emit();
    } catch {
      // Private mode, blocked storage, or malformed JSON. Analytics must never
      // break the page, so a failed restore is simply an empty feed.
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.buffer));
    } catch {
      // Quota or blocked storage — non-fatal.
    }
  }
}

export const memorySink = new MemorySink();
