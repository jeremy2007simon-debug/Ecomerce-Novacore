import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  DocumentNotes,
  DocumentPage,
  DocumentSection,
  DocumentTable,
} from '@/components/layout/document-page';
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
