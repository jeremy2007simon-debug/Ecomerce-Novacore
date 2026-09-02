'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Price } from '@/components/commerce/price';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconHeart } from '@/components/visual/icons';
import { QuickAddTrigger } from '@/components/commerce/quick-add-trigger';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';
import type { ProductMedia as ProductMediaType } from '@/types/visual';
import type { Locale } from '@/types/i18n';

/**
 * Collection card.
 *
 * Note what is absent: no rounded-2xl, no drop shadow, no hover-lift. The card
 * is not a card; it is an image with type beneath it. Separation comes from
 * space. The only hover affordance is a slow scale on the visual inside its
 * clipped frame, which reads as the photograph breathing rather than as a
 * component reacting.
 *
 * The colour swatches are rendered as real dots rather than as a count, because
 * "3 colours" is information a shopper has to act on, while three dots is
 * information they can absorb. Hovering/selecting one swaps the card's image
 * to that colour's real photo/art (via `variant.media`), the same mechanism
 * PDP's own colour selector already uses, just lighter (no size dimension).
 *
 * A client component: the single `<Link>` has to wrap both the image AND the
 * title/price (one click target, matching the site's established card
 * pattern), while the colour swatches sit OUTSIDE it as real siblings —
 * nesting an interactive swatch/Quick-Add control inside an `<a>` is invalid,
 * inaccessible markup. Since the swatches need to update the image inside the
 * Link on hover, the two have to share client state, which is what pulls the
 * whole card (not just a leaf) into the client boundary.
 */
export interface ProductCardCopy {
  soldOut: string;
  sale: string;
  colorOptions: string;
  quickAdd: string;
  /** Full, already-composed accessible name, e.g. "Wishlist — Soon". */
  wishlist: string;
}

export function ProductCard({
  product,
  locale,
  priority = false,
  index = 0,
  copy,
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
  index?: number;
  copy: ProductCardCopy;
}) {
  const colors = product.options.find((option) => option.name === 'color')?.values ?? [];
  const soldOut = !product.availableForSale;

  const mediaByColor = useMemo(() => {
    const map = new Map<string, ProductMediaType>();
    for (const variant of product.variants) {
      const colorValue = variant.selectedOptions.find((option) => option.name === 'color')?.value;
      if (colorValue && variant.media && !map.has(colorValue)) map.set(colorValue, variant.media);
    }
    return map;
  }, [product]);

  const [activeColor, setActiveColor] = useState<string | null>(null);
  const media = (activeColor && mediaByColor.get(activeColor)) || product.media[0];

  const saleVariant = product.variants.find(
    (variant) => variant.compareAtPrice && variant.compareAtPrice.amount > variant.price.amount,
  );

  return (
    <article className="group relative">
      <Link href={routes.product(locale, product.handle)} className="block focus-visible:outline-none">
        {/* Focus ring goes on the whole card, not just the text. */}
        <span className="absolute -inset-2 rounded-xs group-focus-visible:ring-2 group-focus-visible:ring-ember group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-void" />

        <div className="relative overflow-clip rounded-xs">
          {media ? (
            <div className="transition-transform duration-[900ms] ease-(--ease-out-expo) group-hover:scale-[1.035]">
              <ProductVisual media={media} slot="card" priority={priority} />
            </div>
          ) : null}

          {soldOut ? (
            <span className="micro-label absolute left-3 top-3 rounded-xs bg-void/80 px-2 py-1 text-ink">
              {copy.soldOut}
            </span>
          ) : saleVariant ? (
            <span className="micro-label absolute left-3 top-3 rounded-xs bg-ember px-2 py-1 text-void">
              {copy.sale}
            </span>
          ) : null}

          {/* Inert — no real wishlist store yet. Same "Soon" treatment as the header. */}
          <span
            aria-disabled="true"
            aria-label={copy.wishlist}
            className="absolute right-3 top-3 rounded-pill bg-void/60 p-1.5 text-ink-subtle"
          >
            <IconHeart className="size-4" />
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          {/* One line, always. A wrapping eyebrow pushes the title down on some
              cards and not others, and the row instantly stops looking set. */}
          <p className="micro-label truncate text-ink-subtle">
            {String(index + 1).padStart(2, '0')} · {product.metafields.material}
          </p>
          <h3 className="text-[1.0625rem] font-medium leading-tight tracking-[-0.02em] text-ink">
            {product.title}
          </h3>
          <p className="text-small text-ink-muted">{product.subtitle}</p>
          <Price value={product.priceRange.min} locale={locale} className="mt-1.5" />
        </div>
      </Link>

      <div className="mt-3 flex min-h-6 items-center justify-between gap-3">
        {colors.length > 1 ? (
          <ul className="flex items-center gap-1" aria-label={copy.colorOptions}>
            {colors.map((color) => (
              <li key={color.value}>
                <button
                  type="button"
                  disabled={!color.available}
                  onMouseEnter={() => setActiveColor(color.value)}
                  onMouseLeave={() => setActiveColor(null)}
                  onFocus={() => setActiveColor(color.value)}
                  onBlur={() => setActiveColor(null)}
                  onClick={() => setActiveColor(color.value)}
                  aria-label={color.label}
                  aria-pressed={activeColor === color.value}
                  className={cn(
                    'flex size-[26px] items-center justify-center rounded-pill p-1.5',
                    !color.available && 'cursor-not-allowed opacity-30',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="block size-full rounded-pill ring-1 ring-inset ring-white/20"
                    style={{ backgroundColor: color.swatchHex }}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}

        {!soldOut ? (
          <QuickAddTrigger
            product={product}
            surface="collection"
            label={copy.quickAdd}
            className={cn(
              'micro-label text-ink-subtle transition-opacity duration-(--duration-fast) hover:text-ink',
              '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100',
            )}
          />
        ) : null}
      </div>
    </article>
  );
}
