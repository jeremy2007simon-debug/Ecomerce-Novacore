import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Hero } from '@/components/home/hero';
import { SceneOrigin } from '@/components/home/scene-origin';
import { SceneReveal } from '@/components/home/scene-reveal';
import { SceneMaterial } from '@/components/home/scene-material';
import { SceneShop } from '@/components/home/scene-shop';
import { commerce } from '@/lib/commerce';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * HOME.
 *
 * A Server Component with no 'use client' anywhere in the file — enforced by
 * ESLint. The scenes below are client shells wrapping server-rendered content,
 * so all of this copy, all of the product data and every SVG in the storytelling
 * sequence arrives as an RSC payload and costs zero client JavaScript.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getServerDictionary(locale);

  return {
    title: t.meta.tagline,
    description: t.meta.description,
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, collection, hero] = await Promise.all([
    getServerDictionary(locale),
    commerce.getProducts({ collection: 'all', sort: 'featured', first: 8 }, { locale }),
    commerce.getProduct('atlantic-01', { locale }),
  ]);

  return (
    <main id="main">
      <Hero locale={locale} copy={t.home.hero} />
      <SceneOrigin copy={t.home.origin} />
      {hero ? <SceneReveal product={hero} locale={locale} copy={t.home.reveal} /> : null}
      <SceneMaterial copy={t.home.material} />
      <SceneShop products={collection.nodes} locale={locale} copy={t.home.shop} />
    </main>
  );
}
