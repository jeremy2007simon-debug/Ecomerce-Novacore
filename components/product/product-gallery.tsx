'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Overlay } from '@/components/ui/overlay';
import { ProductVisual } from '@/components/visual/product-visual';
import { ProductGalleryViewer } from './product-gallery-viewer';
import { galleryForSelection, getDefaultColor } from '@/lib/commerce/product-gallery';
import { usePDPStore } from '@/lib/store/pdp-store';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import type { Product } from '@/types/commerce';
import type { ProductMedia } from '@/types/visual';

export interface ProductGalleryCopy {
  /** Also doubles as the fullscreen Overlay's required aria-label. */
  label: string;
  counter: string;
  previous: string;
  next: string;
  close: string;
}

function mediaAlt(item: ProductMedia): string {
  return item.kind === 'image' ? item.altText : item.alt;
}

/**
 * Gallery V2 — the fix for the single gap Phase 1's audit flagged as the
 * biggest one on the whole site: picking a colour on the PDP used to change
 * nothing visible. This reads the colour `PurchasePanel` publishes to
 * `pdp-store` and recomposes the gallery around it via `galleryForSelection`.
 *
 * Desktop: one large leading frame, remaining real frames in a 2-column
 * grid below — "main image + supporting images", sized to whatever the
 * product actually has (3 real frames per colourway today: the variant's
 * own photo/art plus the two shared material studies — never padded with
 * anything invented). Mobile: a horizontal scroll-snap strip with a
 * discrete "n / total" counter, per the brief's explicit preference over
 * tiny thumbnails.
 *
 * Every frame opens the fullscreen viewer at its own index on click/tap.
 */
export function ProductGallery({ product, copy }: { product: Product; copy: ProductGalleryCopy }) {
  const activeColor = usePDPStore((state) => state.activeColor);
  const overlayOpen = useIsOverlayOpen('gallery');
  const openOverlay = useUIStore((state) => state.open);
  const close = useUIStore((state) => state.close);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  // `activeColor` already carries a `?color=` restore by the time this
  // reads it — see PurchasePanel's own mount effect, the sole writer.
  const color = activeColor ?? getDefaultColor(product);

  const variant = useMemo(
    () => product.variants.find((v) => v.selectedOptions.some((o) => o.name === 'color' && o.value === color)),
    [product.variants, color],
  );

  const media = useMemo(() => galleryForSelection(product, color, variant), [product, color, variant]);

  // The leading frame changes when colour changes — reset both indices so a
  // stale mid-gallery position from the previous colour doesn't linger.
  // Adjusting state during render (React's documented pattern for this)
  // rather than in an effect — same pattern already used by filter-drawer.tsx.
  const [colorSnapshot, setColorSnapshot] = useState(color);
  if (colorSnapshot !== color) {
    setColorSnapshot(color);
    setViewerIndex(0);
    setMobileIndex(0);
  }

  // Scrolling the mobile track is a real DOM mutation, so it stays in an effect.
  useEffect(() => {
    mobileTrackRef.current?.scrollTo({ left: 0 });
  }, [color]);

  const openAt = (index: number) => {
    setViewerIndex(index);
    openOverlay('gallery');
  };

  const onMobileScroll = useCallback(() => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== mobileIndex && next >= 0 && next < media.length) setMobileIndex(next);
  }, [media.length, mobileIndex]);

  if (media.length === 0) return null;
  const [primary, ...supporting] = media;

  return (
    <div>
      {/* Desktop: main image + supporting grid. */}
      <div className="hidden lg:block">
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={mediaAlt(primary!)}
          className="block w-full text-left focus-visible:outline-none"
        >
          <ProductVisual media={primary!} slot="hero" priority />
        </button>

        {supporting.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {supporting.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openAt(i + 1)}
                aria-label={mediaAlt(item)}
                className="block text-left focus-visible:outline-none"
              >
                <ProductVisual media={item} slot="gallery" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Mobile: horizontal scroll-snap strip. */}
      <div className="lg:hidden">
        <div
          ref={mobileTrackRef}
          onScroll={onMobileScroll}
          data-scroll-snap
          style={{
            // 84vw, not a rounder-looking 92 — this gallery lives inside
            // `.editorial`'s own gutter (unlike the retired EditorialGallery,
            // which bled full-bleed to the viewport edge), so its frames must
            // fit within the gutter-reduced width, not the raw viewport. This
            // is the same 84vw already measured and documented against real
            // layouts in product-visual.tsx's `SLOT_SIZES.gallery`.
            ['--gal-w' as string]: 'min(84vw, 34rem)',
            ['--gal-h' as string]: 'calc(var(--gal-w) * 5 / 4)',
          }}
          className="edge flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openAt(i)}
              aria-label={mediaAlt(item)}
              className="h-(--gal-h) w-(--gal-w) shrink-0 snap-start text-left last:snap-end focus-visible:outline-none"
            >
              <ProductVisual media={item} slot="gallery" fill priority={i === 0} />
            </button>
          ))}
        </div>
        {media.length > 1 ? (
          <p className="micro-label mt-3 px-(--spacing-gutter) text-ink-subtle" data-numeric>
            {copy.counter.replace('{current}', String(mobileIndex + 1)).replace('{total}', String(media.length))}
          </p>
        ) : null}
      </div>

      <Overlay
        id="gallery-viewer-panel"
        open={overlayOpen}
        onClose={close}
        placement="full"
        label={copy.label}
        className="bg-void"
      >
        <ProductGalleryViewer
          media={media}
          index={viewerIndex}
          onIndexChange={setViewerIndex}
          onClose={close}
          copy={copy}
        />
      </Overlay>
    </div>
  );
}
