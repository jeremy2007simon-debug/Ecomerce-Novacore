import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocumentPage } from '@/components/layout/document-page';
import { TrackOrderForm } from '@/components/layout/track-order-form';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * ORDER TRACKING.
 *
 * There is no order system — this demo never creates a real order (checkout
 * is a simulation) — so the form declares that plainly rather than pretending
 * to look one up. Same shell, same voice as Shipping/Returns/Contact.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.trackOrder;

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${locale}/track-order`,
      languages: { 'es-ES': '/es/track-order', en: '/en/track-order' },
    },
  };
}

export default async function TrackOrderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.trackOrder;

  return (
    <DocumentPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <TrackOrderForm
        copy={{
          orderNumber: page.orderNumber,
          email: page.email,
          submit: page.submit,
          demo: page.demo,
        }}
      />
    </DocumentPage>
  );
}
