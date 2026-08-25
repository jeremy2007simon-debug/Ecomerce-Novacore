import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  DocumentNotes,
  DocumentPage,
  DocumentSection,
  DocumentTable,
} from '@/components/layout/document-page';
import { DemoBadge } from '@/components/ui/demo-badge';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * SHIPPING.
 *
 * The footer linked here from day one; the link went to `/story`. The rates
 * table is the same information the product page states in one sentence,
 * expanded — one source of copy, in the dictionary, so the two cannot drift.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.shipping;

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${locale}/shipping`,
      languages: { 'es-ES': '/es/shipping', en: '/en/shipping' },
    },
  };
}

export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.shipping;

  return (
    <DocumentPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      {/*
        Shipping quotes concrete SLAs and a cutoff time — the most
        operational-sounding page on the site — so it gets the same demo
        disclosure Terms, Privacy and Checkout already carry. No magic
        spacing here: it is simply the first item in `DocumentPage`'s own
        gapped column, so the existing `--spacing-section` gap separates it
        from the table below like any other section.
      */}
      <p className="reading flex items-center gap-3 text-small text-ink-subtle">
        <DemoBadge />
        {page.demo}
      </p>

      <DocumentSection label={page.tableLabel}>
        <DocumentTable
          caption={page.tableLabel}
          columns={page.columns}
          rows={page.rows.map((row) => [row.region, row.method, row.time, row.cost])}
        />
      </DocumentSection>

      <DocumentSection label={page.notesLabel}>
        <DocumentNotes items={page.notes} />
      </DocumentSection>
    </DocumentPage>
  );
}
