import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 removed the `eslint` config key along with `next lint`; linting is
  // no longer part of `next build` at all. The `verify` npm script is the gate.
  typedRoutes: true,
  images: {
    // Brand photography is committed to public/ in demo mode. In Shopify mode
    // (COMMERCE_PROVIDER=shopify), product/collection images are served from
    // Shopify's CDN, which the Storefront API always returns as cdn.shopify.com
    // regardless of the store's own domain.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['motion'],
  },
};

export default nextConfig;
