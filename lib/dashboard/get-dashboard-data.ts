import { AUTOMATION, FLOW_LABELS, INSIGHTS, SERIES, SUMMARIES, TOP_PRODUCTS } from '@/data/dashboard';
import { commerce } from '@/lib/commerce';
import type { Locale } from '@/types/i18n';
import type { DashboardSeries } from '@/types/dashboard';
import type { ProductMedia } from '@/types/visual';

/**
 * Resolves the dashboard's demo fixtures into locale-ready view data, joining
 * the top-products list against the real catalogue so the thumbnails and titles
 * come from the same source the storefront uses.
 *
 * This lives in lib/dashboard rather than in the page so that the page stays a
 * layout, and so the data layer is the only thing importing @/data.
 */
export async function getDashboardData(locale: Locale) {
  const catalogue = await commerce.getProducts({ collection: 'all', first: 50 }, { locale });
  const byHandle = new Map(catalogue.nodes.map((product) => [product.handle, product]));

  const topProducts = TOP_PRODUCTS.map((entry) => {
    const product = byHandle.get(entry.handle);
    return {
      handle: entry.handle,
      title: product?.title ?? entry.handle,
      revenue: entry.revenue,
      units: entry.units,
      media: (product?.media[0] ?? null) as ProductMedia | null,
    };
  });

  const flows = AUTOMATION.flows.map((flow) => ({
    id: flow.id,
    label: FLOW_LABELS[flow.id]?.[locale] ?? flow.id,
    sent: flow.sent,
    opened: flow.opened,
    converted: flow.converted,
    revenue: flow.revenue,
  }));

  // All four ranges are serialised to the client so the toggle is instant. The
  // whole set is a few kilobytes — smaller than the request that fetching one
  // range on demand would cost.
  const series: DashboardSeries = {
    today: { points: SERIES.today, summary: SUMMARIES.today },
    d7: { points: SERIES.d7, summary: SUMMARIES.d7 },
    d30: { points: SERIES.d30, summary: SUMMARIES.d30 },
    d90: { points: SERIES.d90, summary: SUMMARIES.d90 },
  };

  return {
    series,
    automation: {
      abandonedCarts: AUTOMATION.abandonedCarts,
      recovered: AUTOMATION.recovered,
      recoveredRevenue: AUTOMATION.recoveredRevenue,
      recoveryRate: AUTOMATION.recovered / AUTOMATION.abandonedCarts,
    },
    flows,
    topProducts,
    insights: INSIGHTS.map((insight) => ({
      id: insight.id,
      tone: insight.tone,
      confidence: insight.confidence,
      body: insight.body[locale],
    })),
  };
}
