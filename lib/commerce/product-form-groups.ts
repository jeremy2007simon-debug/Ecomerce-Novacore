import type { ProductForm } from '@/types/visual';

/**
 * The two super-categories the catalogue actually has — real, structural
 * groupings of the existing `Product.form` field, not a fabricated
 * "category" concept. Shared by both CommerceRepository implementations so
 * `ProductQuery.category` resolves identically in demo and Shopify mode.
 */
export const APPAREL_FORMS: ReadonlySet<ProductForm> = new Set([
  'shell',
  'overshirt',
  'tee',
  'knit',
  'pant',
]);

export const ACCESSORY_FORMS: ReadonlySet<ProductForm> = new Set(['bag', 'cap', 'bottle']);

export function formsForCategory(category: 'apparel' | 'accessories'): ReadonlySet<ProductForm> {
  return category === 'apparel' ? APPAREL_FORMS : ACCESSORY_FORMS;
}
