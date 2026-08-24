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
 * SIZE GUIDE.
 *
 * This page is also what makes the product page's size-guide button real: it
 * was a `<button>` with no handler, labelled with the same string as the
 * legend above it, so the picker read "TALLA TALLA".
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.sizeGuide;

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${locale}/size-guide`,
      languages: { 'es-ES': '/es/size-guide', en: '/en/size-guide' },
    },
  };
}

export default async function SizeGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.sizeGuide;

  return (
    <DocumentPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <DocumentSection label={page.tableLabel}>
        <DocumentTable
          caption={page.tableLabel}
          columns={page.columns}
          rows={page.rows.map((row) => [row.size, row.chest, row.waist, row.length, row.sleeve])}
        />
        <p className="reading mt-8 text-small text-ink-subtle">{page.note}</p>
      </DocumentSection>

      <DocumentSection label={page.howToLabel}>
        <DocumentNotes items={page.howTo} />
      </DocumentSection>
    </DocumentPage>
  );
}
