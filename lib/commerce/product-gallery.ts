import type { Product, Variant } from '@/types/commerce';
import type { ProductMedia } from '@/types/visual';

/**
 * The default colour value — the first available option value, before a
 * shopper (or a `?color=` URL param) has chosen one.
 *
 * A pure function of already-fetched product data: every reader
 * (`PurchasePanel`, `ProductGallery`) computes the identical default on its
 * own first client render, so there is no flash and no mount-time effect
 * required to agree on a starting colour.
 */
export function getDefaultColor(product: Product): string | null {
  const colorOption = product.options.find((option) => option.name === 'color');
  if (!colorOption) return null;
  return colorOption.values.find((value) => value.available)?.value ?? colorOption.values[0]?.value ?? null;
}

/**
 * The gallery frames to show for the current colour selection.
 *
 * Filtering only activates when at least one item in `product.media` sets
 * `colorwayKey` — Shopify's media never does, since the Storefront fields
 * already queried carry no variant/option association, so this degrades to
 * the full, unfiltered array there (identical to pre-Phase-5 behaviour).
 * Items with no `colorwayKey` (the shared material-study frames) always stay.
 *
 * When a resolved, purchasable variant carries its own media, that frame
 * leads the gallery even if it isn't already the scoped array's first item —
 * this is what makes picking a colour visibly update the leading image.
 */
export function galleryForSelection(
  product: Product,
  activeColor: string | null,
  variant: Variant | undefined,
): ProductMedia[] {
  const hasColorwayData = product.media.some((item) => item.colorwayKey);
  if (!hasColorwayData) return product.media;

  const scoped = product.media.filter((item) => !item.colorwayKey || item.colorwayKey === activeColor);

  const variantMedia = variant?.media;
  if (variantMedia && variantMedia.id !== scoped[0]?.id) {
    return [variantMedia, ...scoped.filter((item) => item.id !== variantMedia.id)];
  }

  return scoped;
}
