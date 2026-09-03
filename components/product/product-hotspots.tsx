'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconClose } from '@/components/visual/icons';
import { DURATION_FAST, EASE_OUT_EXPO } from '@/lib/motion/tokens';
import type { ProductHotspot } from '@/lib/commerce/product-editorial';
import type { ProductMedia } from '@/types/visual';
import type { Locale } from '@/types/i18n';

/**
 * DETAIL HOTSPOTS — built and typed, not imported by any product page this
 * phase. See data/product-editorial.ts: none of the 8 products has a real
 * macro/detail photograph (one studio shot of the default colourway each),
 * and numbered callouts over generated art would misrepresent it as
 * documented product detail. Ready to mount the day real detail photography
 * exists and a handle's `PRODUCT_EDITORIAL[handle].hotspots` is populated.
 *
 * Same pattern as `components/home/shop-the-look.tsx`: hotspots are real
 * `<button>` elements in reading order, never `<div onClick>`; selecting one
 * opens an inline panel rather than navigating away.
 */
export function ProductHotspots({
  media,
  hotspots,
  locale,
  copy,
}: {
  media: ProductMedia;
  hotspots: ProductHotspot[];
  locale: Locale;
  copy: { close: string };
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = hotspots.find((hotspot) => hotspot.id === activeId) ?? null;

  return (
    <div className="relative">
      <ProductVisual media={media} slot="feature" />

      {hotspots.map((hotspot, index) => (
        <button
          key={hotspot.id}
          type="button"
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          onClick={() => setActiveId((current) => (current === hotspot.id ? null : hotspot.id))}
          aria-haspopup="dialog"
          aria-expanded={activeId === hotspot.id}
          aria-label={hotspot.label[locale]}
          className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border border-paper/50 bg-void/55 text-[0.6875rem] text-paper backdrop-blur-sm transition-transform duration-(--duration-fast) hover:scale-110"
        >
          <span aria-hidden="true" data-numeric>
            {String(index + 1).padStart(2, '0')}
          </span>
        </button>
      ))}

      <AnimatePresence>
        {active ? (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: DURATION_FAST, ease: EASE_OUT_EXPO }}
            role="dialog"
            aria-label={active.label[locale]}
            className="absolute inset-x-4 bottom-4 flex items-center gap-4 border border-hairline-strong bg-surface-raised p-4 sm:inset-x-auto sm:right-4 sm:w-72"
          >
            <p className="reading grow text-small text-ink">{active.label[locale]}</p>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label={copy.close}
              className="p-1 text-ink-subtle transition-colors hover:text-ink"
            >
              <IconClose className="size-4" />
            </button>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
