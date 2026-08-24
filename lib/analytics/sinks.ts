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

const RING_CAPACITY = 200;

/**
 * A bounded in-memory ring buffer.
 *
 * This is what powers the live EVENT STREAM panel on /demo/dashboard: a
 * business owner browses the store, opens the dashboard, and sees the events
 * their own visit produced. It costs nothing and it demonstrates the analytics
 * layer more convincingly than any static chart.
 *
 * Session-scoped and memory-only — nothing is persisted or transmitted.
 */
class MemorySink implements AnalyticsSink {
  readonly id = 'memory';
  private buffer: TrackedEvent[] = [];
  private listeners = new Set<(events: TrackedEvent[]) => void>();

  send(event: TrackedEvent) {
    this.buffer = [event, ...this.buffer].slice(0, RING_CAPACITY);
    for (const listener of this.listeners) listener(this.buffer);
  }

  /** Newest first. */
  snapshot(): TrackedEvent[] {
    return this.buffer;
  }

  subscribe(listener: (events: TrackedEvent[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear() {
    this.buffer = [];
    for (const listener of this.listeners) listener(this.buffer);
  }
}

export const memorySink = new MemorySink();
