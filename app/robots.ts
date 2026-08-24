import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atlantic-supply.demo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Checkout and the NovaCore dashboard have no business being crawled.
      disallow: ['/es/checkout', '/en/checkout', '/es/demo/', '/en/demo/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
