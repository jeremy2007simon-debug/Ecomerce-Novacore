import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocumentList, DocumentPage, DocumentSection } from '@/components/layout/document-page';
import { DemoBadge } from '@/components/ui/demo-badge';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/** TERMS. States plainly that this is a demonstration storefront. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.terms;

  return {
    title: page.title,
    description: page.demo,
    alternates: {
      canonical: `/${locale}/terms`,
      languages: { 'es-ES': '/es/terms', en: '/en/terms' },
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.terms;

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
