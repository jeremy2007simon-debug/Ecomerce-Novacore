import type { Locale } from './i18n';

/**
 * A closed, discriminated union of every event the storefront emits.
 *
 * Typing events as a union rather than `track(name: string, props: object)` is
 * what makes the dashboard's event feed possible and what will make a real
 * provider integration mechanical: the adapter gets an exhaustive switch, and
 * adding an event without handling it is a compile error.
 */
export type AnalyticsEvent =
  | { name: 'page_view'; payload: { path: string; locale: Locale } }
  | { name: 'product_view'; payload: { productId: string; handle: string; price: number } }
  | {
      name: 'add_to_cart';
      payload: {
        productId: string;
        variantId: string;
        handle: string;
        quantity: number;
        value: number;
        /** Where the add happened — omitted defaults to the PDP's own buy box. */
        surface?: 'pdp' | 'home' | 'collection';
      };
    }
  | {
      name: 'remove_from_cart';
      payload: { productId: string; variantId: string; handle: string; quantity: number };
    }
  | { name: 'cart_viewed'; payload: { itemCount: number; value: number } }
  | { name: 'checkout_started'; payload: { value: number; itemCount: number } }
  | { name: 'checkout_step'; payload: { step: string; index: number } }
  | {
      name: 'checkout_completed';
      payload: { orderId: string; value: number; itemCount: number; method: string };
    }
  | { name: 'search'; payload: { query: string; resultCount: number } }
  | { name: 'language_changed'; payload: { from: Locale; to: Locale } }
  | { name: 'ai_assistant_opened'; payload: { surface: 'pdp' | 'search' | 'nav'; handle?: string } }
  | { name: 'ai_assistant_query'; payload: { intent: string; matched: boolean } }
  | { name: 'recommendation_clicked'; payload: { from: string; to: string; reasons: string[] } }
  | { name: 'select_item'; payload: { productId: string; handle: string; listId: string; position: number } }
  | { name: 'filter_applied'; payload: { facet: string; value: string } }
  | { name: 'sort_applied'; payload: { sort: string } }
  | { name: 'wishlist_add'; payload: { productId: string; variantId: string; handle: string } }
  | { name: 'story_view'; payload: { storyId: string; handle: string } }
  | { name: 'size_guide_open'; payload: { productId: string; handle: string } }
  | { name: 'newsletter_signup'; payload: { surface: 'footer' | 'home' } };

export type AnalyticsEventName = AnalyticsEvent['name'];

/** An event plus the ambient context every sink needs. */
export interface TrackedEvent {
  id: string;
  ts: number;
  sessionId: string;
  locale: Locale;
  path: string;
  event: AnalyticsEvent;
}

export interface AnalyticsSink {
  id: string;
  send(event: TrackedEvent): void;
}
