/** Product silhouettes the procedural renderer knows how to draw. */
export type ProductForm = 'shell' | 'overshirt' | 'tee' | 'knit' | 'pant' | 'bag' | 'cap' | 'bottle';

/** Named lighting/colour treatments for the procedural material stack. */
export type PaletteKey = 'basalt' | 'ember' | 'atlantic' | 'sail' | 'moss' | 'sand';

/** Where a visual is being used. Drives `sizes` and the intrinsic aspect. */
export type VisualSlot = 'card' | 'hero' | 'gallery' | 'thumb' | 'bag' | 'feature';

export type MediaAspect = '1/1' | '4/5' | '3/4' | '16/9' | '3/2';

/**
 * Photography. Shaped to match Shopify's `image` node so the adapter can emit
 * it without a translation step.
 */
export interface ImageMedia {
  kind: 'image';
  url: string;
  altText: string;
  width: number;
  height: number;
  aspect: MediaAspect;
  blurDataURL?: string;
}

/**
 * Generated art. Always deterministic from `seed` — see lib/utils/prng.ts.
 * This branch is the guarantee that the site can never show a broken image.
 */
export interface ProceduralMedia {
  kind: 'procedural';
  seed: string;
  form: ProductForm;
  palette: PaletteKey;
  aspect: MediaAspect;
  alt: string;
}

export type ProductMedia = ImageMedia | ProceduralMedia;

/** CSS custom properties a colorway writes onto the ProductVisual shell. */
export interface VisualTint {
  base: string;
  accent: string;
}
