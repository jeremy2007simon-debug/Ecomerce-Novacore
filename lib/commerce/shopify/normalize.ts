import type {
  Money,
  Product,
  ProductMetafields,
  ProductOption,
  ProductOptionValue,
  Variant,
} from '@/types/commerce';
import type { Locale } from '@/types/i18n';
import type { ImageMedia, MediaAspect, ProductForm } from '@/types/visual';

/**
 * Shopify Storefront API node → our domain types.
 *
 * Real once SHOPIFY_STORE_DOMAIN/SHOPIFY_STOREFRONT_TOKEN are set and
 * COMMERCE_PROVIDER=shopify — see shopify-repository.ts and the README's
 * "Shopify mode" section for the metafields this expects to find on each
 * product.
 */

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ShopifyVariantNode {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
}

export interface ShopifyOptionNode {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  seo: { title: string | null; description: string | null };
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
  options: ShopifyOptionNode[];
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariantNode[] };
  collections: { nodes: { handle: string }[] };
  metafields: (ShopifyMetafield | null)[];
}

/**
 * Shopify returns decimal strings ("129.00"); we hold minor units. Parsing via
 * Math.round(parseFloat * 100) is correct here because Shopify guarantees at
 * most two decimal places for these currencies.
 */
export function normalizeMoney(input: ShopifyMoney): Money {
  return {
    amount: Math.round(Number.parseFloat(input.amount) * 100),
    currencyCode: input.currencyCode as Money['currencyCode'],
  };
}

function nearestAspect(width: number, height: number): MediaAspect {
  const ratio = width / height;
  const candidates: [MediaAspect, number][] = [
    ['1/1', 1],
    ['4/5', 0.8],
    ['3/4', 0.75],
    ['3/2', 1.5],
    ['16/9', 16 / 9],
  ];

  let best: MediaAspect = '4/5';
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const [aspect, value] of candidates) {
    const delta = Math.abs(ratio - value);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = aspect;
    }
  }
  return best;
}

/**
 * Already complete: our ImageMedia was shaped to match Shopify's image node
 * precisely so that this function stays a rename rather than a translation.
 * Note the alt-text fallback — a null altText must never reach the DOM.
 */
export function normalizeImage(image: ShopifyImage, productTitle: string): ImageMedia {
  return {
    kind: 'image',
    url: image.url,
    altText: image.altText ?? productTitle,
    width: image.width,
    height: image.height,
    aspect: nearestAspect(image.width, image.height),
  };
}

/**
 * `productType` is free text set per-product in the Shopify admin — no enum,
 * no guaranteed vocabulary. Matched case-insensitively against a fixed table
 * rather than fuzzy-matched (fuzzy matching on free text is exactly the kind
 * of non-determinism this codebase avoids elsewhere). Unmapped values fall
 * back to 'tee' — the most generic apparel form — because that fails toward
 * SHOWING a size selector rather than hiding one a shopper actually needs;
 * the safer failure direction. Document this table for the store owner: any
 * productType not in the left column silently buckets to 'tee'.
 */
const PRODUCT_TYPE_MAP: Record<string, ProductForm> = {
  shell: 'shell',
  jacket: 'shell',
  outerwear: 'shell',
  overshirt: 'overshirt',
  shirt: 'overshirt',
  tee: 'tee',
  't-shirt': 'tee',
  knit: 'knit',
  sweater: 'knit',
  jumper: 'knit',
  pant: 'pant',
  pants: 'pant',
  trouser: 'pant',
  trousers: 'pant',
  bag: 'bag',
  cap: 'cap',
  hat: 'cap',
  bottle: 'bottle',
};

function mapProductForm(productType: string): ProductForm {
  return PRODUCT_TYPE_MAP[productType.trim().toLowerCase()] ?? 'tee';
}

const OPTION_LABELS: Record<string, Record<Locale, string>> = {
  color: { es: 'Color', en: 'Colour' },
  size: { es: 'Talla', en: 'Size' },
};

function optionLabel(name: string, locale: Locale): string {
  const known = OPTION_LABELS[name.toLowerCase()];
  if (known) return known[locale];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function metafieldValue(metafields: (ShopifyMetafield | null)[], key: string): string | null {
  return metafields.find((m) => m?.key === key)?.value ?? null;
}

/** List metafields (care, features, specs, pairsWith) serialize as a JSON string. */
function parseListMetafield<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // A malformed metafield must not crash the whole product's normalization —
    // it degrades to the empty/default value instead.
    return fallback;
  }
}

function normalizeMetafields(node: ShopifyProductNode): ProductMetafields {
  const mf = node.metafields;
  return {
    material: metafieldValue(mf, 'material') ?? '',
    composition: metafieldValue(mf, 'composition') ?? '',
    weightGrams: Number(metafieldValue(mf, 'weight_grams') ?? 0) || 0,
    origin: metafieldValue(mf, 'origin') ?? '',
    care: parseListMetafield<string[]>(metafieldValue(mf, 'care'), []),
    story: metafieldValue(mf, 'body') ?? '',
    features: parseListMetafield(metafieldValue(mf, 'features'), []),
    specs: parseListMetafield(metafieldValue(mf, 'specs'), []),
    // Expected as list.single_line_text_field of HANDLES (not
    // list.product_reference GIDs) — see the README's metafield table. Storing
    // handles directly here avoids a second GraphQL round trip to resolve
    // product references.
    pairsWith: parseListMetafield<string[]>(metafieldValue(mf, 'pairs_with'), []),
    shipping: metafieldValue(mf, 'shipping') ?? '',
    returns: metafieldValue(mf, 'returns') ?? '',
  };
}

function normalizeOptions(node: ShopifyProductNode, locale: Locale): ProductOption[] {
  return node.options.map((option) => {
    const values: ProductOptionValue[] = option.values.map((value) => {
      const available = node.variants.nodes.some(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.some((so) => so.name === option.name && so.value === value),
      );
      return { value, label: value, available };
    });

    return {
      id: option.id,
      name: option.name.toLowerCase(),
      label: optionLabel(option.name, locale),
      values,
    };
  });
}

function normalizeVariants(node: ShopifyProductNode): Variant[] {
  return node.variants.nodes.map((v) => ({
    id: v.id,
    sku: v.sku ?? '',
    title: v.title,
    availableForSale: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
    price: normalizeMoney(v.price),
    compareAtPrice: v.compareAtPrice ? normalizeMoney(v.compareAtPrice) : null,
    selectedOptions: v.selectedOptions.map((so) => ({ name: so.name.toLowerCase(), value: so.value })),
    media: v.image ? normalizeImage(v.image, node.title) : null,
  }));
}

/**
 * The one function a real integration must actually write.
 *
 * Every field below has a documented fallback — a product missing a
 * metafield must normalize successfully with a sane empty default, never
 * throw. Throwing stays reserved for the function not existing at all (the
 * state before this was written), not for real-world data gaps once it does.
 */
export function normalizeProduct(node: ShopifyProductNode, locale: Locale): Product {
  const price = normalizeMoney(node.priceRange.minVariantPrice);
  const maxPrice = normalizeMoney(node.priceRange.maxVariantPrice);

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    subtitle: metafieldValue(node.metafields, 'subtitle') ?? '',
    description: node.description,
    vendor: node.vendor,
    tags: node.tags,
    collectionHandles: node.collections.nodes.map((c) => c.handle),
    form: mapProductForm(node.productType),
    availableForSale: node.availableForSale,
    priceRange: { min: price, max: maxPrice },
    options: normalizeOptions(node, locale),
    variants: normalizeVariants(node),
    media: node.images.nodes.map((img) => normalizeImage(img, node.title)),
    metafields: normalizeMetafields(node),
    // No Shopify equivalent for a product rating object — default to zero
    // rather than fabricate a number. See the README's Shopify mapping table.
    rating: { value: 0, count: 0, distribution: [0, 0, 0, 0, 0] },
    seo: {
      title: node.seo.title ?? node.title,
      description: node.seo.description ?? node.description,
    },
  };
}
