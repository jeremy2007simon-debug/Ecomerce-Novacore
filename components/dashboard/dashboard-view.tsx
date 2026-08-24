'use client';

import { useState } from 'react';
import { KpiCard } from './kpi-card';
import { RangeToggle, SalesChart } from './sales-chart';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { DashboardSeries, RangeKey } from '@/types/dashboard';

/**
 * The interactive half of the dashboard: range toggle, KPI row and chart.
 *
 * Everything else on the page — automation table, top products, insights — is
 * server-rendered, because none of it changes with the range.
 */
export function DashboardView({
  series,
  copy,
}: {
  /** All four ranges, resolved on the server — see lib/dashboard. */
  series: DashboardSeries;
  copy: {
    revenue: string;
    orders: string;
    conversion: string;
    averageOrder: string;
    visitors: string;
    salesTitle: string;
    vsPrevious: string;
    ranges: Record<string, string>;
  };
}) {
  const { locale } = useLocale();
  const [range, setRange] = useState<RangeKey>('d30');

  const { summary, points } = series[range];

  const kpis = [
    { label: copy.revenue, value: summary.revenue, format: 'money' as const, delta: summary.deltas.revenue },
    { label: copy.orders, value: summary.orders, format: 'number' as const, delta: summary.deltas.orders },
    { label: copy.conversion, value: summary.conversion, format: 'percent' as const, delta: summary.deltas.conversion },
    { label: copy.averageOrder, value: summary.averageOrder, format: 'money' as const, delta: summary.deltas.averageOrder },
    { label: copy.visitors, value: summary.visitors, format: 'number' as const, delta: summary.deltas.visitors },
  ];

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
        <h2 className="label text-ink">{copy.salesTitle}</h2>
        <RangeToggle
          value={range}
          onChange={(next) => setRange(next as RangeKey)}
          labels={copy.ranges}
        />
      </div>

      {/*
        Re-keyed on range so the Counters re-run. Without the key they hold
        their previous value and the KPI row silently stops matching the chart.
      */}
      <div
        key={`${range}-${locale}`}
        className="mb-16 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-5"
      >
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            format={kpi.format}
            delta={kpi.delta}
            vsLabel={copy.vsPrevious}
          />
        ))}
      </div>

      <SalesChart points={points} rangeKey={range} idleLabel={copy.revenue} />
    </>
  );
}
