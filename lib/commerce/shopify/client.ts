import { NotConfiguredError } from '../repository';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Shopify Storefront API — the fetch wrapper every query and mutation goes
 * through.
 *
 * To activate:
 *   1. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in a gitignored
 *      .env.local (server-side only — never NEXT_PUBLIC_*, since those are
 *      inlined into the client bundle).
 *   2. Set COMMERCE_PROVIDER=shopify.
 *
 * The Storefront token is a public-scope token, but it still belongs on the
 * server: exposing it client-side hands anyone an unthrottled read API for the
 * whole catalogue. Cart mutations, which are triggered from client
 * components, reach this file through the Server Actions in ./cart-actions.ts
 * rather than calling storefront() directly from the browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ShopifyConfig {
  domain: string;
  token: string;
  apiVersion: string;
}

export function readShopifyConfig(): ShopifyConfig {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2025-07';

  const missing: string[] = [];
  if (!domain) missing.push('SHOPIFY_STORE_DOMAIN');
  if (!token) missing.push('SHOPIFY_STOREFRONT_TOKEN');
  if (missing.length > 0) throw new NotConfiguredError('shopify', missing);

  return { domain: domain as string, token: token as string, apiVersion };
}

export interface StorefrontResponse<T> {
  data?: T;
  errors?: { message: string; path?: string[] }[];
}

/**
 * The single fetch wrapper every query would go through.
 *
 * Note `next: { revalidate }` — with the App Router this is what gives the
 * storefront ISR without any component knowing about caching.
 */
export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { revalidate?: number } = {},
): Promise<T> {
  const config = readShopifyConfig();

  const response = await fetch(
    `https://${config.domain}/api/${config.apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.token,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: options.revalidate ?? 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`[shopify] ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as StorefrontResponse<T>;

  if (payload.errors?.length) {
    throw new Error(`[shopify] ${payload.errors.map((e) => e.message).join('; ')}`);
  }
  if (!payload.data) {
    throw new Error('[shopify] Response contained no data');
  }

  return payload.data;
}
