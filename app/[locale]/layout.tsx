import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';

import { CartHydrator } from '@/components/commerce/cart-hydrator';
import { GrainOverlay } from '@/components/visual/grain-overlay';
import { getClientDictionary, getServerDictionary } from '@/lib/i18n/get-dictionary';
import { HREFLANG, LOCALES } from '@/lib/i18n/config';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { fontVariables } from '@/styles/fonts';
import { isLocale, type Locale } from '@/types/i18n';

/**
 * ROOT LAYOUT.
 *
 * There is no app/layout.tsx — this file IS the root, which is what makes
 * `<html lang>` change with the locale. The consequence is that switching
 * language remounts this tree, so nothing that must survive a language switch
 * may live in a provider here. (The cart doesn't: it's a module-scope store.)
 *
 * Note there is no `'use client'` anywhere in this file. The providers below
 * are client leaves that accept server-rendered `children`, so all page copy,
 * product data and SVG art passes straight through as an RSC payload and costs
 * zero client JS.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0A0B0D',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // Required for env(safe-area-inset-*) to report real values on a notched
  // iPhone — without it the sticky buy bar sits under the home indicator.
  viewportFit: 'cover',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlantic-supply.demo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getServerDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t.meta.siteName} — ${t.meta.tagline}`,
      template: `%s · ${t.meta.siteName}`,
    },
    description: t.meta.description,
    applicationName: t.meta.siteName,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [HREFLANG.es]: '/es',
        [HREFLANG.en]: '/en',
        'x-default': '/es',
      },
    },
    openGraph: {
      type: 'website',
      siteName: t.meta.siteName,
      title: `${t.meta.siteName} — ${t.meta.tagline}`,
      description: t.meta.description,
      locale: locale === 'es' ? 'es_ES' : 'en_GB',
      url: `/${locale}`,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false, address: false, email: false },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const [clientDictionary, t] = await Promise.all([
    getClientDictionary(typedLocale),
    getServerDictionary(typedLocale),
  ]);

  return (
    <html lang={typedLocale} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-[100svh] bg-surface text-ink antialiased">
        <a href="#main" className="sr-only-focusable label">
          {t.nav.skipToContent}
        </a>

        <LocaleProvider locale={typedLocale} dictionary={clientDictionary}>
          {children}
        </LocaleProvider>

        {/* The page's single grain layer — see lib/utils/noise-tile.ts. */}
        <GrainOverlay />

        {/* Renders nothing; reads the persisted cart after first paint. */}
        <CartHydrator />
      </body>
    </html>
  );
}
