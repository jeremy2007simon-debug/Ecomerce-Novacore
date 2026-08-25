import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';
import type { RecommendationIntent } from './repository';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RECOMMENDATION ENGINE — DEMO
 *
 * A weighted strategy ensemble, not a hardcoded "related products" array.
 *
 * Why it is built this way for a demo: NovaCore's pitch is that the storefront
 * is ready for real personalisation. A strategy interface makes that credible
 * and testable — swapping in Shopify's `productRecommendations` or a
 * collaborative-filtering service means implementing `RecommendationStrategy`,
 * not touching a single component.
 *
 * The scores are also SURFACED in the UI ("MATCHED ON: COMPLEMENTARY ·
 * COLLECTION"), which turns an invisible algorithm into something a business
 * owner can see working.
 *
 * Determinism: scores are pure functions of the catalogue, and ties break on
 * handle, so the order is identical on the server and in the browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface StrategyResult {
  score: number;
  /** Human-readable reason, shown as a mono label when it contributes. */
  reason?: string;
}

export interface RecommendationStrategy {
  id: string;
  label: Record<Locale, string>;
  weight: number;
  score(candidate: Product, seed: Product): StrategyResult;
}

function overlapRatio(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((item) => setB.has(item)).length;
  return shared / Math.min(a.length, b.length);
}

/** Products the brand explicitly designed to work together. */
export const complementaryStrategy: RecommendationStrategy = {
  id: 'complementary',
  label: { es: 'COMPLEMENTARIO', en: 'COMPLEMENTARY' },
  weight: 0.36,
  score: (candidate, seed) => ({
    score: seed.metafields.pairsWith.includes(candidate.handle) ? 1 : 0,
    reason: seed.metafields.pairsWith.includes(candidate.handle) ? 'complementary' : undefined,
  }),
};

/** Same corner of the catalogue. */
export const collectionStrategy: RecommendationStrategy = {
  id: 'collection',
  label: { es: 'MISMA COLECCIÓN', en: 'SAME COLLECTION' },
  weight: 0.24,
  score: (candidate, seed) => {
    // "all" contains everything, so it carries no signal.
    const a = candidate.collectionHandles.filter((h) => h !== 'all');
    const b = seed.collectionHandles.filter((h) => h !== 'all');
    const ratio = overlapRatio(a, b);
    return { score: ratio, reason: ratio > 0.4 ? 'collection' : undefined };
  },
};

/** Shared construction vocabulary — technical with technical, essential with essential. */
export const tagStrategy: RecommendationStrategy = {
  id: 'tags',
  label: { es: 'MISMA FAMILIA', en: 'SAME FAMILY' },
  weight: 0.14,
  score: (candidate, seed) => {
    const ratio = overlapRatio(candidate.tags, seed.tags);
    return { score: ratio, reason: ratio > 0.5 ? 'tags' : undefined };
  },
};

/**
 * Price affinity. Recommending a €35 bottle alongside a €129 shell is fine;
 * recommending it as the TOP match is not, because it reads as a downsell.
 * Falls off over a €60 spread.
 */
export const priceAffinityStrategy: RecommendationStrategy = {
  id: 'price',
  label: { es: 'RANGO SIMILAR', en: 'SIMILAR RANGE' },
  weight: 0.14,
  score: (candidate, seed) => {
    const delta = Math.abs(candidate.priceRange.min.amount - seed.priceRange.min.amount);
    const score = Math.max(0, 1 - delta / 6000);
    return { score, reason: score > 0.7 ? 'price' : undefined };
  },
};

/**
 * Trending. In production this reads from real order velocity; here it reads
 * the demo rating volume, which is a reasonable stand-in and — importantly —
 * is not random.
 */
export const trendingStrategy: RecommendationStrategy = {
  id: 'trending',
  label: { es: 'EN TENDENCIA', en: 'TRENDING' },
  weight: 0.12,
  score: (candidate) => {
    // Normalised against the highest review count in the catalogue (46, on
    // VOLCANIC TEE) with the same ~3% headroom the old divisor (220 against a
    // then-highest 213) used. When the demo review counts were turned down to
    // a credible size, this divisor had to come down with them — left at 220
    // every product would have scored under 0.2 and "trending" could never
    // fire for anyone.
    const score = Math.min(1, candidate.rating.count / 48) * (candidate.rating.value / 5);
    return { score, reason: score > 0.75 ? 'trending' : undefined };
  },
};

export const DEFAULT_STRATEGIES: RecommendationStrategy[] = [
  complementaryStrategy,
  collectionStrategy,
  tagStrategy,
  priceAffinityStrategy,
  trendingStrategy,
];

/** Intent reweights the same strategies rather than swapping the pipeline. */
const INTENT_MULTIPLIERS: Record<RecommendationIntent, Record<string, number>> = {
  related: { complementary: 1, collection: 1.3, tags: 1.2, price: 1, trending: 0.7 },
  complementary: { complementary: 2.2, collection: 0.7, tags: 0.6, price: 0.9, trending: 0.6 },
  trending: { complementary: 0.5, collection: 0.6, tags: 0.6, price: 0.7, trending: 2.4 },
};

export interface RankedProduct {
  product: Product;
  score: number;
  reasons: string[];
}

export function rankRecommendations(
  seed: Product,
  pool: Product[],
  options: { intent: RecommendationIntent; limit: number; strategies?: RecommendationStrategy[] },
): RankedProduct[] {
  const strategies = options.strategies ?? DEFAULT_STRATEGIES;
  const multipliers = INTENT_MULTIPLIERS[options.intent];

  return pool
    .filter((candidate) => candidate.handle !== seed.handle)
    .map((product) => {
      let score = 0;
      const reasons: string[] = [];

      for (const strategy of strategies) {
        const result = strategy.score(product, seed);
        const multiplier = multipliers[strategy.id] ?? 1;
        score += result.score * strategy.weight * multiplier;
        if (result.reason) reasons.push(strategy.id);
      }

      // Out-of-stock products still rank, but never above an available one.
      if (!product.availableForSale) score *= 0.25;

      return { product, score, reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.handle.localeCompare(b.product.handle))
    .slice(0, options.limit);
}

/** Map a strategy id back to its display label. */
export function strategyLabel(id: string, locale: Locale): string | undefined {
  return DEFAULT_STRATEGIES.find((s) => s.id === id)?.label[locale];
}
