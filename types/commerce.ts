import type { ProductForm, ProductMedia } from './visual';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

/**
 * Money is held in MINOR UNITS (cents).
 *
 * Cart maths on floats accumulates error that eventually shows up as a subtotal
 * ending in .0000000001 on someone's screen. Integers make that impossible, and
 * it is also how Shopify and every payment processor represent amounts.
 */
export interface Money {
  amount: number;
  currencyCode: CurrencyCode;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductOptionValue {
  value: string;
  label: string;
  /** Present on colour options only; drives the swatch and the visual tint. */
  swatchHex?: string;
  available: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  label: string;
  values: ProductOptionValue[];
}

export interface Variant {
  id: string;
  sku: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  media: ProductMedia | null;
}

export interface ProductFeature {
  key: string;
  label: string;
  detail: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductMetafields {
  material: string;
  composition: string;
  weightGrams: number;
  origin: string;
  care: string[];
  story: string;
  features: ProductFeature[];
  specs: ProductSpec[];
  /** Handles of products designed to be worn/used with this one. */
  pairsWith: string[];
  shipping: string;
  returns: string;
}

export interface ProductRating {
  value: number;
  count: number;
  /** Count per star, index 0 = 1★. */
  distribution: [number, number, number, number, number];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  vendor: string;
  tags: string[];
  collectionHandles: string[];
  /**
   * What kind of thing this is — 'shell' | 'overshirt' | 'tee' | 'knit' |
   * 'pant' | 'bag' | 'cap' | 'bottle'. This is the one field UI reaches for to
   * decide which modules apply (a fit meter makes no sense on a bottle; a
   * clothing-size prompt makes no sense on a cap), instead of branching on
   * product name or handle at every call site. It is also exactly the shape
   * Shopify exposes as productType, so nothing here needs to change shape when
   * this demo repository is swapped for a real Storefront API adapter.
   */
  form: ProductForm;
  availableForSale: boolean;
  priceRange: { min: Money; max: Money };
  options: ProductOption[];
  variants: Variant[];
  media: ProductMedia[];
  metafields: ProductMetafields;
  rating: ProductRating;
  seo: { title: string; description: string };
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  heroMedia: ProductMedia | null;
}

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: ReviewRating;
  title: string;
  body: string;
  /** Fixed ISO string. Never computed at render — see DEMO_NOW. */
  createdAt: string;
  verified: boolean;
  helpfulCount: number;
  fit?: 'small' | 'true' | 'large';
  size?: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: [number, number, number, number, number];
  recommendPercent: number;
  fitBias: number;
}

/** Relay-shaped pagination, mirroring Shopify so call sites survive the swap. */
export interface Connection<T> {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
