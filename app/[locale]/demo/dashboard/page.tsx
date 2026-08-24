import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DashboardView } from '@/components/dashboard/dashboard-view';
import { EventFeed } from '@/components/dashboard/event-feed';
import { InsightCard } from '@/components/dashboard/insight-card';
import { DemoBadge } from '@/components/ui/demo-badge';
import { Rule } from '@/components/ui/rule';
import { AtlanticMonogram } from '@/components/visual/atlantic-mark';
import { ProductVisual } from '@/components/visual/product-visual';
import { getDashboardData } from '@/lib/dashboard/get-dashboard-data';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { formatMoneyRounded, formatNumber, formatPercent } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import { isLocale } from '@/types/i18n';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NOVACORE COMMERCE — DEMO DASHBOARD
 *
 * Deliberately NOT linked from the storefront navigation. A shopper should
 * never stumble into it; a salesperson types the URL.
 *
 * EVERY FIGURE ON THIS PAGE IS SIMULATED. There is no backend, no database and
 * no analytics vendor. The banner says so, each panel carries a DEMO badge, and
 * the page is excluded from indexing.
 *
 * The one genuinely live thing is the event stream, which reads the in-memory
 * analytics buffer and shows the visitor their own session — and it is labelled
 * as such.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getServerDictionary(locale);

  return {
    title: `${t.dashboard.title} · NovaCore`,
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, data] = await Promise.all([
    getServerDictionary(locale),
    getDashboardData(locale),
  ]);

  const d = t.dashboard;

  return (
    <main id="main" className="pb-[--spacing-section] pt-24 lg:pt-28">
      {/* ── DEMO BANNER — first thing on the page ────────────────────────── */}
      <div className="editorial">
        <div className="flex flex-col gap-3 rounded-xs border border-ember/30 bg-ember/[0.07] p-5 sm:flex-row sm:items-center">
          {/* Short label: the sentence beside it already spells out what this
              means, and a two-word badge wraps inside its own border. */}
          <DemoBadge tone="accent" />
          <p className="text-small text-ink-muted">{d.demoNotice}</p>
        </div>
      </div>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="editorial mt-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="micro-label flex items-center gap-2.5 text-ember">
            <AtlanticMonogram className="size-4" />
            NovaCore Commerce
          </p>
          <h1 className="text-headline mt-5 font-medium text-ink">{d.title}</h1>
          <p className="micro-label mt-3 text-ink-subtle">{d.subtitle}</p>
        </div>

        <Link href={routes.home(locale)} className="label text-ink-subtle hover:text-ink">
          ← {d.backToStore}
        </Link>
      </header>

      {/* ── KPIs + CHART ─────────────────────────────────────────────────── */}
      <section className="editorial mt-16" aria-label={d.salesTitle}>
        <DashboardView
          series={data.series}
          copy={{
            revenue: d.revenue,
            orders: d.orders,
            conversion: d.conversion,
            averageOrder: d.averageOrder,
            visitors: d.visitors,
            salesTitle: d.salesTitle,
            vsPrevious: d.vsPrevious,
            ranges: d.ranges,
          }}
        />
      </section>

      {/* ── AUTOMATION ───────────────────────────────────────────────────── */}
      <section className="editorial mt-24" aria-labelledby="automation-heading">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="automation-heading" className="label text-ink">
              {d.automationTitle}
            </h2>
            <p className="micro-label mt-2 text-ink-subtle">{d.automationSubtitle}</p>
          </div>
          <DemoBadge />
        </div>

        <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {[
            { label: d.abandonedCarts, value: formatNumber(data.automation.abandonedCarts, locale) },
            { label: d.recovered, value: formatNumber(data.automation.recovered, locale) },
            {
              label: d.recoveredRevenue,
              value: formatMoneyRounded({ amount: data.automation.recoveredRevenue, currencyCode: 'EUR' }, locale),
            },
            { label: d.recoveryRate, value: formatPercent(data.automation.recoveryRate, locale, 0) },
          ].map((stat) => (
            <div key={stat.label} className="border-t border-hairline pt-5">
              <p className="micro-label text-ink-subtle">{stat.label}</p>
              <p className="text-title mt-3 font-medium text-ink" data-numeric>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Flow table. Hairline rows, no zebra striping, no card. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse">
            <thead>
              <tr className="border-b border-hairline-strong">
                <th className="micro-label py-3 text-left font-normal text-ink-subtle">{d.flow}</th>
                <th className="micro-label py-3 text-right font-normal text-ink-subtle">{d.sent}</th>
                <th className="micro-label py-3 text-right font-normal text-ink-subtle">{d.opened}</th>
                <th className="micro-label py-3 text-right font-normal text-ink-subtle">{d.converted}</th>
                <th className="micro-label py-3 text-right font-normal text-ink-subtle">{d.revenueCol}</th>
              </tr>
            </thead>
            <tbody>
              {data.flows.map((flow) => (
                <tr key={flow.id} className="border-b border-hairline">
                  <td className="py-4 text-small text-ink">{flow.label}</td>
                  <td className="py-4 text-right text-small text-ink-muted" data-numeric>
                    {formatNumber(flow.sent, locale)}
                  </td>
                  <td className="py-4 text-right text-small text-ink-muted" data-numeric>
                    {formatNumber(flow.opened, locale)}
                  </td>
                  <td className="py-4 text-right text-small text-ink-muted" data-numeric>
                    {formatNumber(flow.converted, locale)}
                  </td>
                  <td className="py-4 text-right text-small text-ember" data-numeric>
                    {formatMoneyRounded({ amount: flow.revenue, currencyCode: 'EUR' }, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── TOP PRODUCTS + EVENT STREAM ──────────────────────────────────── */}
      <section className="editorial mt-24 grid gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="mb-8">
            <h2 className="label text-ink">{d.topProductsTitle}</h2>
            <p className="micro-label mt-2 text-ink-subtle">{d.topProductsSubtitle}</p>
          </div>

          <ol className="flex flex-col">
            {data.topProducts.map((entry, i) => (
              <li key={entry.handle} className="flex items-center gap-4 border-b border-hairline py-4">
                <span className="micro-label w-5 shrink-0 text-ink-subtle" data-numeric>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-12 shrink-0">
                  {entry.media ? <ProductVisual media={entry.media} slot="thumb" /> : null}
                </div>
                <div className="min-w-0 grow">
                  <Link
                    href={routes.product(locale, entry.handle)}
                    className="truncate text-[0.9375rem] font-medium text-ink hover:text-ember"
                  >
                    {entry.title}
                  </Link>
                  <p className="micro-label mt-1 text-ink-subtle" data-numeric>
                    {formatNumber(entry.units, locale)} u.
                  </p>
                </div>
                <p className="label shrink-0 text-ink" data-numeric>
                  {formatMoneyRounded({ amount: entry.revenue, currencyCode: 'EUR' }, locale)}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <EventFeed
          copy={{
            title: d.eventStreamTitle,
            subtitle: d.eventStreamSubtitle,
            empty: d.eventStreamEmpty,
            note: d.eventStreamNote,
          }}
        />
      </section>

      {/* ── AI INSIGHTS ──────────────────────────────────────────────────── */}
      <section className="editorial mt-24" aria-labelledby="insights-heading">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="insights-heading" className="label text-ember">
              {d.insightsTitle}
            </h2>
            <p className="micro-label mt-2 text-ink-subtle">{d.insightsSubtitle}</p>
          </div>
          <DemoBadge tone="accent" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {data.insights.map((insight) => (
            <InsightCard
              key={insight.id}
              body={insight.body}
              confidence={insight.confidence}
              tone={insight.tone}
              confidenceLabel={locale === 'es' ? 'Confianza' : 'Confidence'}
            />
          ))}
        </div>
      </section>

      <div className="editorial mt-24">
        <Rule label="NovaCore Commerce" />
      </div>
    </main>
  );
}
