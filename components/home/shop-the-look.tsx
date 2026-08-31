'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconArrowRight, IconClose } from '@/components/visual/icons';
import { DURATION_FAST, EASE_OUT_EXPO } from '@/lib/motion/tokens';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import type { Look } from '@/lib/commerce/looks';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Shop the Look — built, but NOT imported by app/[locale]/page.tsx this
 * phase. See data/looks.ts for why: no genuine multi-product lifestyle
 * photograph exists in this codebase, and a single-product studio photo
 * cannot honestly stand in for "a look." Activate by populating
 * data/looks.ts and importing this component once real photography exists.
 *
 * Hotspots are real <button> elements (keyboard/AT accessible, not
 * <div onClick>), in the same DOM order as `look.hotspots` — keep that array
 * in left-to-right / top-to-bottom visual order so Tab order matches what a
 * sighted user sees. Selecting one opens a small product card (name, price,
 * CTA) rather than navigating away, mirroring the mini-card pattern already
 * used by the search overlay's product rows.
 */
export function ShopTheLook({
  look,
  products,
  locale,
  copy,
}: {
  look: Look;
  products: Product[];
  locale: Locale;
  copy: { cta: string; close: string };
}) {
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  if (!look.image) return null;

  const activeProduct = products.find((product) => product.handle === activeHandle) ?? null;
  const aspectRatio = look.image.aspect.replace('/', ' / ');

  return (
    <div className="relative overflow-clip rounded-xs" style={{ aspectRatio }}>
      <Image src={look.image.src} alt={look.image.alt[locale]} fill className="object-cover" sizes="100vw" />

      {look.hotspots.map((hotspot) => {
        const product = products.find((candidate) => candidate.handle === hotspot.productHandle);
        if (!product) return null;

        return (
          <button
            key={hotspot.productHandle}
            type="button"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onClick={() =>
              setActiveHandle((current) => (current === hotspot.productHandle ? null : hotspot.productHandle))
            }
            aria-haspopup="dialog"
            aria-expanded={activeHandle === hotspot.productHandle}
            aria-label={product.title}
            className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border border-paper/50 bg-void/55 backdrop-blur-sm transition-transform duration-(--duration-fast) hover:scale-110"
          >
            <span aria-hidden="true" className="size-2 rounded-pill bg-paper" />
          </button>
        );
      })}

      <AnimatePresence>
        {activeProduct ? (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: DURATION_FAST, ease: EASE_OUT_EXPO }}
            role="dialog"
            aria-label={activeProduct.title}
            className="absolute inset-x-4 bottom-4 flex items-center gap-4 border border-hairline-strong bg-surface-raised p-4 sm:inset-x-auto sm:right-4 sm:w-72"
          >
            <div className="w-16 shrink-0">
              <ProductVisual media={activeProduct.media[0]!} slot="thumb" />
            </div>
            <div className="min-w-0 grow">
              <p className="truncate text-[0.9375rem] font-medium text-ink">{activeProduct.title}</p>
              <p className="label text-ink-muted" data-numeric>
                {formatMoney(activeProduct.priceRange.min, locale)}
              </p>
              <Link
                href={routes.product(locale, activeProduct.handle)}
                className="label mt-1 inline-flex items-center gap-1 text-ember"
              >
                {copy.cta}
                <IconArrowRight className="size-3.5" />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setActiveHandle(null)}
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
