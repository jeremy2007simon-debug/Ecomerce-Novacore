import { DEMO_NOW, daysBeforeDemoNow } from '@/lib/utils/demo-time';
import { createRng } from '@/lib/utils/prng';
import type { RangeKey, RangeSummary, SeriesPoint } from '@/types/dashboard';
import type { Localized } from '@/types/i18n';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DASHBOARD — DEMO DATA. ALL OF IT.
 *
 * Nothing on /demo/dashboard reflects real orders, real visitors or a real
 * store. There is no backend, no database and no analytics vendor.
 *
 * Every series is generated from a FIXED SEED and anchored to DEMO_NOW, so:
 *   • the chart looks identical every time the demo is shown
 *   • server and client render byte-identical markup (no hydration mismatch)
 *   • the numbers stay internally consistent — revenue, orders and average
 *     order value actually agree with one another, which is the detail that
 *     separates a credible dashboard from a set of random figures
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Builds a deterministic series with a weekly rhythm and a mild upward trend.
 *
 * The weekday shape matters: real e-commerce traffic dips at the weekend, and a
 * chart without that rhythm reads as noise rather than as a business.
 */
function buildDailySeries(days: number, seed: string): SeriesPoint[] {
  const rng = createRng(seed);
  const points: SeriesPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const iso = daysBeforeDemoNow(i);
    const date = new Date(iso);
    const weekday = date.getUTCDay();

    // Sat/Sun run softer; Tue–Thu are the peak.
    const weekdayFactor = weekday === 0 || weekday === 6 ? 0.72 : weekday >= 2 && weekday <= 4 ? 1.14 : 1;
    // Gentle growth across the window.
    const trend = 1 + ((days - i) / days) * 0.22;
    const noise = rng.float(0.86, 1.16);

    const visitors = Math.round(340 * weekdayFactor * trend * noise);
    const conversionRate = rng.float(0.031, 0.046);
    const orders = Math.max(1, Math.round(visitors * conversionRate));
    const averageOrder = rng.float(3900, 5200);

    points.push({
      t: iso.slice(0, 10),
      revenue: Math.round(orders * averageOrder),
      orders,
      visitors,
    });
  }

  return points;
}

/** Hourly series for TODAY, running 08:00 → 21:00. */
function buildHourlySeries(seed: string): SeriesPoint[] {
  const rng = createRng(seed);
  const points: SeriesPoint[] = [];
  const base = new Date(DEMO_NOW);

  // A double hump: a lunchtime rise and a larger evening peak.
  const shape = [0.3, 0.42, 0.58, 0.74, 0.92, 0.86, 0.7, 0.64, 0.72, 0.88, 1, 0.94, 0.7, 0.44];

  for (let hour = 0; hour < shape.length; hour += 1) {
    const stamp = new Date(base);
    stamp.setUTCHours(8 + hour, 0, 0, 0);

    const factor = (shape[hour] ?? 0.5) * rng.float(0.9, 1.1);
    const visitors = Math.round(46 * factor);
    const orders = Math.max(0, Math.round(visitors * rng.float(0.03, 0.05)));

    points.push({
      t: stamp.toISOString(),
      revenue: Math.round(orders * rng.float(3900, 5200)),
      orders,
      visitors,
    });
  }

  return points;
}

export const SERIES: Record<RangeKey, SeriesPoint[]> = {
  today: buildHourlySeries('atl:today'),
  d7: buildDailySeries(7, 'atl:d7'),
  d30: buildDailySeries(30, 'atl:d30'),
  d90: buildDailySeries(90, 'atl:d90'),
};

function summarise(points: SeriesPoint[], deltaSeed: string): RangeSummary {
  const rng = createRng(deltaSeed);

  const revenue = points.reduce((sum, p) => sum + p.revenue, 0);
  const orders = points.reduce((sum, p) => sum + p.orders, 0);
  const visitors = points.reduce((sum, p) => sum + p.visitors, 0);

  return {
    revenue,
    orders,
    visitors,
    conversion: visitors === 0 ? 0 : orders / visitors,
    averageOrder: orders === 0 ? 0 : Math.round(revenue / orders),
    deltas: {
      revenue: rng.float(0.04, 0.24),
      orders: rng.float(0.02, 0.19),
      conversion: rng.float(-0.03, 0.14),
      averageOrder: rng.float(-0.05, 0.11),
      visitors: rng.float(0.03, 0.21),
    },
  };
}

export const SUMMARIES: Record<RangeKey, RangeSummary> = {
  today: summarise(SERIES.today, 'delta:today'),
  d7: summarise(SERIES.d7, 'delta:d7'),
  d30: summarise(SERIES.d30, 'delta:d30'),
  d90: summarise(SERIES.d90, 'delta:d90'),
};

/** Abandoned-cart recovery, matching the figures in the brief. */
export const AUTOMATION = {
  abandonedCarts: 8,
  recovered: 3,
  recoveredRevenue: 12900,
  flows: [
    { id: 'cart-1h', sent: 42, opened: 27, converted: 6, revenue: 25400 },
    { id: 'cart-24h', sent: 31, opened: 16, converted: 4, revenue: 17600 },
    { id: 'browse', sent: 88, opened: 39, converted: 5, revenue: 21300 },
    { id: 'winback', sent: 24, opened: 9, converted: 2, revenue: 9800 },
  ] as const,
};

export const FLOW_LABELS: Record<string, Localized<string>> = {
  'cart-1h': { es: 'Carrito abandonado · 1 h', en: 'Abandoned cart · 1 h' },
  'cart-24h': { es: 'Carrito abandonado · 24 h', en: 'Abandoned cart · 24 h' },
  browse: { es: 'Navegación sin compra', en: 'Browse abandonment' },
  winback: { es: 'Recuperación de cliente', en: 'Customer win-back' },
};

/** Top products by revenue over the last 30 days. */
export const TOP_PRODUCTS = [
  { handle: 'atlantic-01', revenue: 154800, units: 12 },
  { handle: 'volcanic-tee', revenue: 88200, units: 18 },
  { handle: 'current-bag', revenue: 62100, units: 9 },
  { handle: 'basalt-knit', revenue: 54500, units: 5 },
  { handle: 'tide-01', revenue: 44500, units: 5 },
] as const;

export interface Insight {
  id: string;
  tone: 'positive' | 'neutral' | 'action';
  body: Localized<string>;
  /** Confidence, shown so the insight does not read as an oracle. */
  confidence: number;
}

export const INSIGHTS: Insight[] = [
  {
    id: 'mobile-conversion',
    tone: 'positive',
    body: {
      es: 'La conversión de ATLANTIC 01 subió un 18 % esta semana. El tráfico móvil representa el 74 % de las compras, frente al 61 % del mes pasado.',
      en: 'ATLANTIC 01 conversion rose 18% this week. Mobile traffic accounts for 74% of purchases, up from 61% last month.',
    },
    confidence: 0.92,
  },
  {
    id: 'recovery',
    tone: 'action',
    body: {
      es: '8 clientes abandonaron el pago hoy. La recuperación automática ya ha recuperado 129 € de los 412 € en juego.',
      en: '8 customers abandoned checkout today. Automated recovery has already recovered €129 of the €412 at stake.',
    },
    confidence: 0.88,
  },
  {
    id: 'size-signal',
    tone: 'neutral',
    body: {
      es: 'La talla M de ATLANTIC 01 se agota 2,4 veces más rápido que el resto. Las opiniones mencionan que talla justa de hombros: conviene revisar el escalado.',
      en: 'ATLANTIC 01 in M sells out 2.4× faster than the rest. Reviews mention it runs close across the shoulders — worth reviewing the grading.',
    },
    confidence: 0.71,
  },
];
