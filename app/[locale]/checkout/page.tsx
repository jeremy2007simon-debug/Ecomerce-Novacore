import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CheckoutFlow } from '@/components/commerce/checkout/checkout-flow';
import { getClientDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * Checkout.
 *
 * A server shell around one client island. The heading and metadata are
 * server-rendered; only the flow itself — which needs the cart and form state —
 * is client-side.
 *
 * NO PAYMENT IS PROCESSED. See components/commerce/checkout/checkout-machine.ts.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getClientDictionary(locale);

  return {
    title: t.checkout.title,
    // A checkout page has no business being indexed.
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // The checkout copy lives in the client slice (the flow is a client
  // island); reading it here avoids duplicating the string on the server side.
  const t = await getClientDictionary(locale);

  return (
    <main id="main" className="editorial pb-(--spacing-section) pt-28 lg:pt-36">
      {/*
        The heading is rendered by the flow rather than here, because the
        confirmation step replaces the entire screen — including its title.
        The string still originates on the server.
      */}
      <CheckoutFlow title={t.checkout.title} />
    </main>
  );
}
