import Image from 'next/image';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import type { MediaAspect, ProductMedia, VisualSlot, VisualTint } from '@/types/visual';
import { ProceduralProductArt } from './procedural-product-art';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PHOTOGRAPHY SEAM
 *
 * One component, two branches, ONE shell. Photography and generated art render
 * into the same frame with the same aspect ratio, radius, vignette, hairline
 * and alt-text position — so switching a product from generated art to a real
 * photograph is a change in `data`, never a change in layout.
 *
 * Three properties make that true and are worth preserving:
 *   1. both branches are wrapped by the identical `.pv-shell` box
 *   2. both carry alt text in the same place
 *   3. the aspect ratio comes from the media object, not from the caller
 *
 * Server Component. The `image` branch uses next/image so the committed WebP is
 * served at the right size for its slot with a blur placeholder inlined into
 * the prerendered HTML — no layout shift, no flash of empty frame.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * `sizes` per slot. Getting these wrong is the most common cause of a good
 * Lighthouse score collapsing: without them the browser downloads the largest
 * candidate for every thumbnail on the page.
 */
const SLOT_SIZES: Record<VisualSlot, string> = {
  hero: '100vw',
  gallery: '(max-width: 768px) 88vw, 46vw',
  feature: '(max-width: 768px) 92vw, 52vw',
  card: '(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw',
  thumb: '96px',
  bag: '88px',
};

const ASPECT_CLASS: Record<MediaAspect, string> = {
  '1/1': 'aspect-square',
  '4/5': 'aspect-4/5',
  '3/4': 'aspect-3/4',
  '3/2': 'aspect-3/2',
  '16/9': 'aspect-video',
};

export interface ProductVisualProps {
  media: ProductMedia;
  slot: VisualSlot;
  /** Set on the LCP candidate only — usually one image per page. */
  priority?: boolean;
  /**
   * Colorway tint. Written as CSS custom properties, so changing colour is a
   * variable update rather than a re-render or a new network request.
   */
  tint?: VisualTint;
  className?: string;
  /** Suppresses the vignette where the visual sits inside another frame. */
  bare?: boolean;
}

export function ProductVisual({
  media,
  slot,
  priority = false,
  tint,
  className,
  bare = false,
}: ProductVisualProps) {
  const alt = media.kind === 'image' ? media.altText : media.alt;

  const style = tint
    ? ({ '--pv-base': tint.base, '--pv-accent': tint.accent } as CSSProperties)
    : undefined;

  return (
    <div
      className={cn(
        // `overflow-clip`, not `overflow-hidden`: hidden creates a scroll
        // container, which kills any position:sticky ancestor further up. The
        // PDP's sticky product column depends on this.
        'pv-shell relative isolate w-full overflow-clip rounded-xs bg-surface-inset',
        ASPECT_CLASS[media.aspect],
        className,
      )}
      style={style}
    >
      {media.kind === 'image' ? (
        <Image
          src={media.url}
          alt={alt}
          width={media.width}
          height={media.height}
          sizes={SLOT_SIZES[slot]}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          placeholder={media.blurDataURL ? 'blur' : 'empty'}
          {...(media.blurDataURL ? { blurDataURL: media.blurDataURL } : {})}
          className="h-full w-full object-cover"
        />
      ) : (
        <ProceduralProductArt media={media} className="h-full w-full" />
      )}

      {!bare ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.055]"
        />
      ) : null}
    </div>
  );
}
