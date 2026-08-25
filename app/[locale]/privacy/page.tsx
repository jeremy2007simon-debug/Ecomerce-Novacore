import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocumentList, DocumentPage, DocumentSection } from '@/components/layout/document-page';
import { DemoBadge } from '@/components/ui/demo-badge';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/** PRIVACY. There is no back end, and the page says exactly that. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.privacy;

  return {
    title: page.title,
    description: page.demo,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { 'es-ES': '/es/privacy', en: '/en/privacy' },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.privacy;

  return (
    <DocumentPage eyebrow={page.eyebrow} title={page.title}>
      <DocumentSection label={page.updated}>
        <p className="reading mb-10 flex items-center gap-3 text-small text-ink-subtle">
          <DemoBadge />
          {page.demo}
        </p>
        <DocumentList items={page.sections} />
      </DocumentSection>
    </DocumentPage>
  );
}
