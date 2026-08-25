import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  DocumentList,
  DocumentNotes,
  DocumentPage,
  DocumentSection,
} from '@/components/layout/document-page';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/** RETURNS. Four numbered steps, then the exceptions worth stating. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.returns;

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${locale}/returns`,
      languages: { 'es-ES': '/es/returns', en: '/en/returns' },
    },
  };
}

export default async function ReturnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.returns;

  return (
    <DocumentPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <DocumentSection label={page.stepsLabel}>
        <DocumentList items={page.steps} numbered />
      </DocumentSection>

      <DocumentSection label={page.notesLabel}>
        <DocumentNotes items={page.notes} />
      </DocumentSection>
    </DocumentPage>
  );
}
