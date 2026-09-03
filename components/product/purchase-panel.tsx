'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AddToBag } from '@/components/commerce/add-to-bag';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconTruck } from '@/components/visual/icons';
import { SizeGuideDrawer, type SizeGuideCopy } from '@/components/product/size-guide-drawer';
import { track } from '@/lib/analytics';
import { getDefaultColor } from '@/lib/commerce/product-gallery';
import { useLocale } from '@/lib/i18n/locale-provider';
import { usePDPStore } from '@/lib/store/pdp-store';
import { cn } from '@/lib/utils/cn';
import { formatMoney } from '@/lib/utils/money';
import type { Product, Variant } from '@/types/commerce';
import type { VisualTint } from '@/types/visual';

/**
 * Owns variant selection for the whole product page.
 *
 * Colour lives in `pdp-store` (`activeColor`/`setActiveColor`), not local
 * state — `ProductGallery` is a second reader of the exact same selection,
 * which is what makes picking a colour here actually update the gallery's
 * leading image. This panel stays the only writer. Where photography exists
 * for a colourway the variant carries it; otherwise the tinted generated art
 * stands in — both render into the identical frame, so switching between
 * them causes no layout shift.
 *
 * A colour pick also syncs `?color=` via `router.replace` (never `push`) —
 * the same non-history-polluting soft-navigation pattern `LocaleSwitcher`
 * already uses, so a hard refresh restores the gallery's leading image
 * without turning every swatch click into a Back-button stop.
 *
 * The restore itself happens CLIENT-SIDE (`useSearchParams()`, on mount),
 * not by the server page reading `searchParams` and passing it down. That is
 * a deliberate trade-off, not an oversight: this page's `notFound()` for an
 * unknown handle only produces a real HTTP 404 status while the route stays
 * statically generated (`generateStaticParams`); the moment the SERVER page
 * itself reads `searchParams`, Next marks the whole route dynamic, and a
 * `notFound()` thrown from a dynamic render no longer sets the response
 * status (confirmed empirically — the branded 404 content still rendered
 * correctly, only the status code broke, silently, for every unknown
 * product URL). Resolving the colour here instead costs one client-only
 * correction just after hydration on a hard reload with a non-default
 * colour in the URL — the same page is already 100% client-interactive for
 * every other purchase action, so that cost is small next to serving a 200
 * for a dead product link.
 */

function hexToTint(hex: string, accentHex: string): VisualTint {
  return { base: hex, accent: accentHex };
}

export function PurchasePanel({
  product,
  locale,
  showVisual = false,
  className,
  sizeGuideCopy,
  surface = 'pdp',
}: {
  product: Product;
  locale: 'es' | 'en';
  showVisual?: boolean;
  className?: string;
  /** The `pages.sizeGuide` server-dictionary block, threaded down for the drawer. */
  sizeGuideCopy: SizeGuideCopy;
  /** Where this panel lives, for add_to_cart attribution — see AddToBag. */
  surface?: 'pdp' | 'home' | 'collection';
}) {
  const { t, fmt } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const colorOption = product.options.find((option) => option.name === 'color');
  const sizeOption = product.options.find((option) => option.name === 'size');

  const activeColor = usePDPStore((state) => state.activeColor);
  const setActiveColor = usePDPStore((state) => state.setActiveColor);
  const color = activeColor ?? getDefaultColor(product) ?? '';

  // Restore `?color=` on mount, client-side — see the file doc comment for
  // why this can't be a server-passed prop. Only ever runs once: after this,
  // `activeColor` is non-null and this effect's own check short-circuits.
  useEffect(() => {
    if (activeColor !== null) return;
    const requested = searchParams.get('color');
    if (requested && colorOption?.values.some((value) => value.value === requested)) {
      setActiveColor(requested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [size, setSize] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const sizeFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [sizeAttentionRequested, setSizeAttentionRequested] = useState(false);

  // Clear the "select a size" attention once a size is actually chosen —
  // adjusting state during render, same pattern used by ProductGallery for
  // its own colour-change reset, rather than a setState-in-effect.
  const [sizeSnapshot, setSizeSnapshot] = useState(size);
  if (sizeSnapshot !== size) {
    setSizeSnapshot(size);
    if (size !== null) setSizeAttentionRequested(false);
  }

  const selectColor = (value: string) => {
    setActiveColor(value);
    const params = new URLSearchParams();
    if (value !== getDefaultColor(product)) params.set('color', value);
    router.replace((params.size > 0 ? `${pathname}?${params}` : pathname) as Route, { scroll: false });
  };

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

  const selectedColor = useMemo(
    () => colorOption?.values.find((value) => value.value === color),
    [colorOption, color],
  );
  const needsSize = Boolean(sizeOption) && size === null;
  const soldOut = variant ? !variant.availableForSale : false;
  const lowStock =
    variant?.quantityAvailable !== null &&
    variant?.quantityAvailable !== undefined &&
    variant.quantityAvailable > 0 &&
    variant.quantityAvailable <= 6;

  /*
    Memoised because it is published to the PDP store below. A fresh object
    every render would push a new value into the store on every render, and
    every subscriber — the sticky bar — would re-render with it.
  */
  const cartInput = useMemo(
    () =>
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
        : null,
    [product, variant, selectedColor, size, needsSize],
  );

  /*
    Publish the selection for the mobile sticky bar.

    This panel stays the only writer — the bar merely reads — so there is still
    exactly one answer to "which size is selected".

    Two SEPARATE effects, deliberately — not one effect that publishes and
    returns `clearSelection` as its cleanup. A single effect's cleanup runs
    before EVERY re-run, not only on unmount, so combined with `[..., cartInput,
    ...]` it fired `clear()` — which also resets `activeColor` — on every size
    click (any `cartInput` change), wiping the colour selection back to default
    a moment after `publish` had already put the fresh input back. Once
    `activeColor` joined the store this stopped being a harmless flash and
    started being a real bug. Splitting them keeps the publish reactive while
    the clear runs only on true unmount, via its own stable-dependency effect.
  */
  const publish = usePDPStore((state) => state.publish);
  const clearSelection = usePDPStore((state) => state.clear);
  useEffect(() => {
    publish({ input: cartInput, soldOut, needsSize });
  }, [publish, cartInput, soldOut, needsSize]);
  useEffect(() => clearSelection, [clearSelection]);

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
            {colorOption.values.map((value) => {
              const isSelected = color === value.value;
              const nameParts = [`${colorOption.label}: ${value.label}`];
              if (isSelected) nameParts.push(t.product.selected);
              if (!value.available) nameParts.push(t.product.soldOut);
              return (
                <button
                  key={value.value}
                  type="button"
                  disabled={!value.available}
                  onClick={() => selectColor(value.value)}
                  aria-pressed={isSelected}
                  aria-label={nameParts.join(', ')}
                  title={value.label}
                  className={cn(
                    'relative size-9 rounded-pill transition-transform duration-(--duration-fast) ease-(--ease-out-back)',
                    'ring-1 ring-inset ring-white/15',
                    isSelected && 'ring-2 ring-ember ring-offset-2 ring-offset-surface',
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
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* SIZE */}
      {sizeOption ? (
        <fieldset ref={sizeFieldsetRef} className="mb-8">
          <legend className="label mb-4 flex w-full items-baseline justify-between text-ink-subtle">
            <span>{sizeOption.label}</span>
            {/*
              A real action, and a distinct label.

              This was first a `<button>` with no `onClick` at all — carrying
              `t.product.size`, the SAME string as the legend beside it, so
              the picker read "TALLA  TALLA" — then a `<Link>` to the
              standalone size-guide page, which worked but took the shopper
              off the product they were buying. Now it opens the measurements
              in place, over this page, in a drawer.
            */}
            <button
              type="button"
              onClick={() => {
                setSizeGuideOpen(true);
                track({ name: 'size_guide_open', payload: { productId: product.id, handle: product.handle } });
              }}
              className="text-ink underline decoration-hairline-strong underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-ember"
            >
              {t.product.sizeGuide}
            </button>
          </legend>

          {/*
            Six across only once the panel itself is wide enough. `sm:` was a
            viewport query — true from 640px — so at a 1024px viewport the six
            buttons were crammed into a 421px column at 3.4rem each with their
            labels touching the borders.
          */}
          <div className="grid grid-cols-3 gap-2 @sm:grid-cols-6">
            {sizeOption.values.map((value) => {
              const isSelected = size === value.value;
              const stateLabel = isSelected ? t.product.selected : value.available ? t.product.available : t.product.soldOut;
              return (
                <button
                  key={value.value}
                  type="button"
                  disabled={!value.available}
                  onClick={() => setSize(value.value)}
                  aria-pressed={isSelected}
                  aria-label={`${sizeOption.label} ${value.label}, ${stateLabel}`}
                  className={cn(
                    'label flex h-11 items-center justify-center border transition-colors duration-(--duration-fast)',
                    isSelected
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
              );
            })}
          </div>

          {/* Real inline attention, not an alert() — see AddToBag's onNeedsSizeClick. */}
          {sizeAttentionRequested && needsSize ? (
            <p role="alert" className="micro-label mt-3 text-ember">
              {t.product.selectSizeInline}
            </p>
          ) : null}

          {/*
            Only mounted where a size exists in the first place — there is no
            path to it on a sizeless product, since the "Size guide" trigger
            above lives inside this same `sizeOption` block.
          */}
          <SizeGuideDrawer
            open={sizeGuideOpen}
            onClose={() => setSizeGuideOpen(false)}
            copy={sizeGuideCopy}
            formKey={product.form === 'pant' ? 'trade-pant' : 'apparel'}
          />
        </fieldset>
      ) : null}

      {/* STOCK */}
      {lowStock && !soldOut ? (
        <p className="micro-label mb-4 text-ember" data-numeric>
          {fmt(t.product.lowStock, { count: variant?.quantityAvailable ?? 0 })}
        </p>
      ) : null}

      {/*
        No caption duplicating the button's own label below it.

        `AddToBag` already renders `disabledLabel` — "Select a size" — AS the
        button's text whenever `cartInput` is null, which it is for the whole
        time `needsSize` is true. A second paragraph directly underneath used
        to repeat the identical string, so the prompt appeared twice at once.
        The button already says it; nothing else needs to.
      */}
      <AddToBag
        input={cartInput}
        disabled={soldOut}
        disabledLabel={soldOut ? t.product.soldOut : t.product.selectSizeFirst}
        surface={surface}
        needsSize={needsSize}
        onNeedsSizeClick={() => {
          sizeFieldsetRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          sizeFieldsetRef.current
            ?.querySelector<HTMLButtonElement>('button:not([disabled])')
            ?.focus({ preventScroll: true });
          setSizeAttentionRequested(true);
        }}
      />

      {/* DELIVERY / RETURNS — same fields the Details accordion already
          renders, a second, compact read of the one real source, directly
          under the CTA where a shopper decides whether to buy. */}
      <div className="mt-6 flex flex-col gap-2.5 border-t border-hairline pt-6">
        <p className="flex flex-wrap items-baseline gap-x-2 text-small text-ink-muted">
          <span className="micro-label shrink-0 text-ink-subtle">{t.product.shipping}</span>
          {product.metafields.shipping}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 text-small text-ink-muted">
          <span className="micro-label shrink-0 text-ink-subtle">{t.product.returnsPolicy}</span>
          {product.metafields.returns}
        </p>
      </div>

      <p className="micro-label mt-6 flex items-center justify-center gap-2 text-ink-subtle">
        <IconTruck className="size-4" />
        {formatMoney(product.priceRange.min, locale)} · {product.metafields.origin} · {t.product.secureCheckout}
      </p>
    </div>
  );
}
