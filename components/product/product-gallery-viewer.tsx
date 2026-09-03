'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconArrowRight, IconClose } from '@/components/visual/icons';
import { useFinePointer } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils/cn';
import type { MediaAspect, ProductMedia } from '@/types/visual';

/** Width-to-height ratio per supported aspect — same table EditorialGallery used. */
const RATIO: Record<MediaAspect, number> = {
  '1/1': 1,
  '4/5': 0.8,
  '3/4': 0.75,
  '3/2': 1.5,
  '16/9': 16 / 9,
};

function mediaAlt(item: ProductMedia): string {
  return item.kind === 'image' ? item.altText : item.alt;
}

/**
 * Fullscreen gallery content — mounted inside `<Overlay placement="full">`,
 * which already supplies the scrim, focus trap, scroll lock, Escape-to-close
 * and portal. This component only adds what a dialog shell can't: a counter,
 * arrow-key/button navigation, swipe (native scroll-snap), and a desktop-only
 * click-to-zoom.
 *
 * Zoom is gated behind `useFinePointer()` so mobile gets no click handler at
 * all on the image — native pinch-zoom is left completely alone, per the
 * brief's explicit "don't block it" instruction.
 */
export function ProductGalleryViewer({
  media,
  index,
  onIndexChange,
  onClose,
  copy,
}: {
  media: ProductMedia[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  copy: { counter: string; previous: string; next: string; close: string };
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isFinePointer = useFinePointer();
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('center');

  // Keep the track scrolled to `index` — covers the arrow buttons and
  // keyboard nav; the scroll listener below is what lets a swipe move
  // `index` the other way.
  useEffect(() => {
    const node = trackRef.current?.children[index] as HTMLElement | undefined;
    node?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
  }, [index]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onIndexChange(Math.min(media.length - 1, index + 1));
      else if (event.key === 'ArrowLeft') onIndexChange(Math.max(0, index - 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, media.length, onIndexChange]);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || zoomed) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index && next >= 0 && next < media.length) onIndexChange(next);
  }, [index, media.length, onIndexChange, zoomed]);

  const toggleZoom = (event: MouseEvent<HTMLDivElement>) => {
    if (!zoomed) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setOrigin(`${x}% ${y}%`);
    }
    setZoomed((value) => !value);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="safe-top gutter flex h-(--header-height) shrink-0 items-center justify-between">
        <p className="micro-label text-ink-subtle" data-numeric>
          {copy.counter.replace('{current}', String(index + 1)).replace('{total}', String(media.length))}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="-mr-2 p-2 text-ink transition-opacity hover:opacity-70"
        >
          <IconClose />
        </button>
      </div>

      <div className="relative flex grow items-center overflow-hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((item, i) => (
            <div key={item.id} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-6">
              <div
                className={cn(
                  'relative h-full max-h-[80svh] max-w-[90vw] transition-transform duration-300 ease-(--ease-out-expo)',
                  isFinePointer && 'cursor-zoom-in',
                  isFinePointer && zoomed && i === index && 'scale-[1.7] cursor-zoom-out',
                )}
                style={{ aspectRatio: RATIO[item.aspect], ...(i === index ? { transformOrigin: origin } : {}) }}
                onClick={isFinePointer ? toggleZoom : undefined}
              >
                <ProductVisual
                  media={item}
                  slot="viewer"
                  priority={i === index}
                  bare
                  fill
                  className="h-full w-full"
                />
                <span className="sr-only">{mediaAlt(item)}</span>
              </div>
            </div>
          ))}
        </div>

        {media.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onIndexChange(Math.max(0, index - 1))}
              disabled={index === 0}
              aria-label={copy.previous}
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-pill border border-hairline-strong bg-void/60 p-3 text-ink transition-opacity hover:bg-void/80 disabled:pointer-events-none disabled:opacity-0 lg:block"
            >
              <IconArrowRight className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => onIndexChange(Math.min(media.length - 1, index + 1))}
              disabled={index === media.length - 1}
              aria-label={copy.next}
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-pill border border-hairline-strong bg-void/60 p-3 text-ink transition-opacity hover:bg-void/80 disabled:pointer-events-none disabled:opacity-0 lg:block"
            >
              <IconArrowRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
