'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AddToBag } from '@/components/commerce/add-to-bag';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconTruck } from '@/components/visual/icons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import type { Product, Variant } from '@/types/commerce';
import type { VisualTint } from '@/types/visual';

/**
 * Owns variant selection for the whole product page.
 *
 * Colour changes the visual by writing CSS custom properties on the shell — no
 * re-render of the image, no network request, and the transition is handled by
 * the browser. Where photography exists for a colourway the variant carries it;
 * otherwise the tinted generated art stands in. Both render into the identical
 * frame, so switching between them causes no layout shift.
 */

function hexToTint(hex: string, accentHex: string): VisualTint {
  return { base: hex, accent: accentHex };
}

export function PurchasePanel({
  product,
  locale,
  showVisual = false,
  className,
}: {
  product: Product;
  locale: 'es' | 'en';
  showVisual?: boolean;
  className?: string;
}) {
  const { t, fmt } = useLocale();

  const colorOption = product.options.find((option) => option.name === 'color');
  const sizeOption = product.options.find((option) => option.name === 'size');

  const [color, setColor] = useState(
    () => colorOption?.values.find((value) => value.available)?.value ?? '',
  );
  const [size, setSize] = useState<string | null>(null);

  const variant: Variant | undefined = useMemo(() => {
    return product.variants.find((candidate) => {
      const matchesColor = candidate.selectedOptions.some(
        (option) => option.name === 'color' && option.value === color,
      );
      if (!matchesColor) return false;
      if (!sizeOption) return true;
      return candidate.selectedOptions.some(
        (option) => option.name === 'size' && option.value === size,
      );
    });
  }, [product.variants, color, size, sizeOption]);

  // The visual for the currently selected colour, whichever branch it is.
  const selectedMedia = useMemo(() => {
    const match = product.variants.find((candidate) =>
      candidate.selectedOptions.some((option) => option.name === 'color' && option.value === color),
    );
    return match?.media ?? product.media[0];
  }, [product, color]);

  const selectedColor = colorOption?.values.find((value) => value.value === color);
  const needsSize = Boolean(sizeOption) && size === null;
  const soldOut = variant ? !variant.availableForSale : false;
  const lowStock =
    variant?.quantityAvailable !== null &&
    variant?.quantityAvailable !== undefined &&
    variant.quantityAvailable > 0 &&
    variant.quantityAvailable <= 6;

  const cartInput =
    variant && variant.availableForSale && !needsSize
      ? {
          productId: product.id,
          variantId: variant.id,
          handle: product.handle,
          title: product.title,
          variantTitle: variant.title,
          colorLabel: selectedColor?.label ?? '',
          colorHex: selectedColor?.swatchHex ?? '#000000',
          sizeLabel: size,
          unitPrice: variant.price,
          media: variant.media ?? product.media[0]!,
          maxQuantity: Math.max(1, variant.quantityAvailable ?? 10),
        }
      : null;

  return (
    // `@container`: the size grid below sizes itself against THIS panel, not
    // the viewport. The panel is half a grid track on desktop.
    <div className={cn('@container flex flex-col', className)}>
      {showVisual && selectedMedia ? (
        <div className="mb-8">
          <ProductVisual
            media={selectedMedia}
            slot="gallery"
            tint={
              selectedColor?.swatchHex
                ? hexToTint(selectedColor.swatchHex, selectedColor.swatchHex)
                : undefined
            }
          />
        </div>
      ) : null}

      {/* COLOUR */}
      {colorOption ? (
        <fieldset className="mb-8">
          <legend className="label mb-4 flex w-full items-baseline justify-between text-ink-subtle">
            <span>{colorOption.label}</span>
            <span className="text-ink">{selectedColor?.label}</span>
          </legend>

          <div className="flex flex-wrap gap-2.5">
            {colorOption.values.map((value) => (
              <button
                key={value.value}
                type="button"
                disabled={!value.available}
                onClick={() => setColor(value.value)}
                aria-pressed={color === value.value}
                aria-label={value.label}
                title={value.label}
                className={cn(
                  'relative size-9 rounded-pill transition-transform duration-(--duration-fast) ease-(--ease-out-back)',
                  'ring-1 ring-inset ring-white/15',
                  color === value.value &&
                    'ring-2 ring-ember ring-offset-2 ring-offset-surface',
                  !value.available && 'cursor-not-allowed opacity-30',
                  value.available && 'hover:scale-105',
                )}
                style={{ backgroundColor: value.swatchHex }}
              >
                {!value.available ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="h-px w-7 rotate-45 bg-ink" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* SIZE */}
      {sizeOption ? (
        <fieldset className="mb-8">
          <legend className="label mb-4 flex w-full items-baseline justify-between text-ink-subtle">
            <span>{sizeOption.label}</span>
            {/*
              A real destination, and a distinct label.

              This was a `<button>` with no `onClick` — nothing happened when
              you pressed it — carrying `t.product.size`, the SAME string as
              the legend beside it, so the picker read "TALLA  TALLA". It now
              says "Guía de tallas" and goes to the size guide, which exists.
            */}
            <Link
              href={routes.sizeGuide(locale)}
              className="text-ink underline decoration-hairline-strong underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-ember"
            >
              {t.product.sizeGuide}
            </Link>
          </legend>

          {/*
            Six across only once the panel itself is wide enough. `sm:` was a
            viewport query — true from 640px — so at a 1024px viewport the six
            buttons were crammed into a 421px column at 3.4rem each with their
            labels touching the borders.
          */}
          <div className="grid grid-cols-3 gap-2 @sm:grid-cols-6">
            {sizeOption.values.map((value) => (
              <button
                key={value.value}
                type="button"
                disabled={!value.available}
                onClick={() => setSize(value.value)}
                aria-pressed={size === value.value}
                className={cn(
                  'label flex h-11 items-center justify-center border transition-colors duration-(--duration-fast)',
                  size === value.value
                    ? 'border-ink bg-paper text-void'
                    : 'border-hairline-strong text-ink-muted hover:border-mist hover:text-ink',
                  // Sold-out sizes stay visible and struck through rather than
                  // being hidden: knowing your size is gone is information.
                  !value.available &&
                    'cursor-not-allowed border-hairline text-ink-subtle line-through opacity-45 hover:border-hairline hover:text-ink-subtle',
                )}
              >
                {value.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* STOCK */}
      {lowStock && !soldOut ? (
        <p className="micro-label mb-4 text-ember" data-numeric>
          {fmt(t.product.lowStock, { count: variant?.quantityAvailable ?? 0 })}
        </p>
      ) : null}

      <AddToBag
        input={cartInput}
        disabled={soldOut}
        disabledLabel={soldOut ? t.product.soldOut : t.product.selectSizeFirst}
      />

      {needsSize && !soldOut ? (
        <p className="micro-label mt-3 text-center text-ink-subtle">{t.product.selectSizeFirst}</p>
      ) : null}

      <p className="micro-label mt-6 flex items-center justify-center gap-2 text-ink-subtle">
        <IconTruck className="size-4" />
        {formatMoney(product.priceRange.min, locale)} · {product.metafields.origin}
      </p>
    </div>
  );
}
