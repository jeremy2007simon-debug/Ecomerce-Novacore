/** Product silhouettes the procedural renderer knows how to draw. */
export type ProductForm = 'shell' | 'overshirt' | 'tee' | 'knit' | 'pant' | 'bag' | 'cap' | 'bottle';

/** Named lighting/colour treatments for the procedural material stack. */
export type PaletteKey = 'basalt' | 'ember' | 'atlantic' | 'sail' | 'moss' | 'sand';

/** Where a visual is being used. Drives `sizes` and the intrinsic aspect. */
export type VisualSlot = 'card' | 'hero' | 'gallery' | 'thumb' | 'bag' | 'feature' | 'viewer';

export type MediaAspect = '1/1' | '4/5' | '3/4' | '16/9' | '3/2';

/**
 * Photography. Shaped to match Shopify's `image` node so the adapter can emit
 * it without a translation step.
 */
export interface ImageMedia {
  kind: 'image';
  /** Stable identity for gallery keys/active-frame tracking — the image URL itself in Shopify mode. */
  id: string;
  url: string;
  altText: string;
  width: number;
  height: number;
  aspect: MediaAspect;
  blurDataURL?: string;
  /**
   * The real option value this frame depicts, when a provider can honestly
   * attribute one — e.g. demo's per-colorway primary photo/art. Shared
   * frames (material studies, or any Shopify image today, since the
   * Storefront query in use carries no variant/image association) leave
   * this unset. The gallery only filters by colorway when at least one item
   * in a product's media sets it — see lib/commerce/product-gallery.ts.
   */
  colorwayKey?: string;
}

/**
 * What a procedural frame depicts.
 *
 *  product  — the garment silhouette on the studio set. Matches the framing of
 *             the photography so the two can sit side by side in one gallery.
 *  material — an abstract macro of the fabric structure. Used for the wide
 *             editorial frames, where a letterboxed silhouette would look like
 *             a mistake and where generated art genuinely outperforms a
 *             mediocre photograph.
 */
export type ProceduralVariant = 'product' | 'material';

/**
 * Generated art. Always deterministic from `seed` — see lib/utils/prng.ts.
 * This branch is the guarantee that the site can never show a broken image.
 */
export interface ProceduralMedia {
  kind: 'procedural';
  /** Stable identity for gallery keys/active-frame tracking — the deterministic seed itself. */
  id: string;
  seed: string;
  form: ProductForm;
  palette: PaletteKey;
  aspect: MediaAspect;
  variant: ProceduralVariant;
  alt: string;
  /** See ImageMedia.colorwayKey. */
  colorwayKey?: string;
}

export type ProductMedia = ImageMedia | ProceduralMedia;

/** CSS custom properties a colorway writes onto the ProductVisual shell. */
export interface VisualTint {
  base: string;
  accent: string;
}
