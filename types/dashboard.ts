/**
 * Dashboard view types.
 *
 * These live in types/ rather than in data/dashboard.ts so that UI components
 * can reference them without importing the fixtures — the same separation the
 * commerce layer uses, enforced by the `no-restricted-imports` seam.
 */
export type RangeKey = 'today' | 'd7' | 'd30' | 'd90';

export interface SeriesPoint {
  /** ISO date, or an ISO timestamp for the hourly "today" series. */
  t: string;
  /** Revenue in minor units. */
  revenue: number;
  orders: number;
  visitors: number;
}

export interface RangeSummary {
  revenue: number;
  orders: number;
  visitors: number;
  conversion: number;
  averageOrder: number;
  /** Change vs the previous window of the same length, as a ratio. */
  deltas: {
    revenue: number;
    orders: number;
    conversion: number;
    averageOrder: number;
    visitors: number;
  };
}

/** Everything the interactive half of the dashboard needs, per range. */
export interface RangeData {
  points: SeriesPoint[];
  summary: RangeSummary;
}

export type DashboardSeries = Record<RangeKey, RangeData>;
