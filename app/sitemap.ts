import type { MetadataRoute } from 'next';
import { commerce } from '@/lib/commerce';
import { LOCALES } from '@/types/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlantic-supply.demo';

/**
 * Sitemap covering both locales, with hreflang alternates on every entry so
 * search engines treat /es and /en as translations rather than duplicates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const handles = await commerce.getAllHandles();

  const paths = [
    { path: '', priority: 1, frequency: 'weekly' as const },
    { path: '/collection', priority: 0.9, frequency: 'daily' as const },
    { path: '/story', priority: 0.6, frequency: 'monthly' as const },
    ...handles.map((handle) => ({
      path: `/product/${handle}`,
      priority: 0.8,
      frequency: 'weekly' as const,
    })),
  ];

  return LOCALES.flatMap((locale) =>
    paths.map((entry) => ({
      url: `${SITE_URL}/${locale}${entry.path}`,
      lastModified: new Date('2026-08-24'),
      changeFrequency: entry.frequency,
      priority: entry.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((alt) => [
            alt === 'es' ? 'es-ES' : 'en',
            `${SITE_URL}/${alt}${entry.path}`,
          ]),
        ),
      },
    })),
  );
}
