import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 removed the `eslint` config key along with `next lint`; linting is
  // no longer part of `next build` at all. The `verify` npm script is the gate.
  typedRoutes: true,
  images: {
    // Brand photography is committed to public/ — no remote hosts are permitted.
    // A future Shopify integration adds its CDN to `remotePatterns` here.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['motion'],
  },
};

export default nextConfig;
