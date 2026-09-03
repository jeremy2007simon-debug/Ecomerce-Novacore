'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconCheck } from '@/components/visual/icons';
import { useIsDemoMode } from '@/lib/commerce/is-demo-mode';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useCartStore, type CartInput } from '@/lib/store/cart-store';
import { useShopifyCartStore } from '@/lib/store/shopify-cart-store';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';

/**
 * ADD TO BAG.
 *
 * The interaction the brief asks for, in order and all within ~600ms:
 *   1. the button presses in (active:scale, from Button)
 *   2. the label swaps to a tick — a state change, not a spinner, because
 *      nothing is actually loading and a spinner would be a lie
 *   3. the drawer springs open with the new line animating in
 *   4. the header badge scale-pops
 *
 * There is no artificial delay. The 420ms before the label reverts exists only
 * so the tick is perceivable; the cart is updated synchronously on click.
 *
 * `needsSize` is a real, clickable state, not a disabled one: a shopper who
 * has not picked a size yet still gets a working button that shows them where
 * to go, via `onNeedsSizeClick`, rather than a dead `disabled` control they
 * have to figure out on their own. Only `disabled` (sold out) removes the
 * native `disabled` attribute's actual click-blocking — never `needsSize`.
 */
export function AddToBag({
  input,
  disabled = false,
  disabledLabel,
  size = 'lg',
  block = true,
  openDrawer = true,
  surface = 'pdp',
  needsSize = false,
  onNeedsSizeClick,
  className,
}: {
  input: CartInput | null;
  disabled?: boolean;
  disabledLabel?: string;
  size?: 'md' | 'lg';
  block?: boolean;
  openDrawer?: boolean;
  /** Where this button lives, for add_to_cart attribution. */
  surface?: 'pdp' | 'home' | 'collection';
  /** True while the product has sizes and none is selected — see the note above. */
  needsSize?: boolean;
  /** Called instead of adding, when `needsSize` is true and the shopper clicks anyway. */
  onNeedsSizeClick?: () => void;
  className?: string;
}) {
  const { t, locale } = useLocale();
  const isDemoMode = useIsDemoMode();
  const add = useCartStore((state) => state.add);
  const shopifyAdd = useShopifyCartStore((state) => state.add);
  const open = useUIStore((state) => state.open);
  const [added, setAdded] = useState(false);

  // Only a genuinely sold-out variant blocks the click structurally.
  // `needsSize` shows the same fallback label but stays a real button.
  const showsFallbackLabel = disabled || input === null;

  const handleClick = () => {
    if (needsSize && !disabled) {
      onNeedsSizeClick?.();
      return;
    }
    if (!input) return;

    if (isDemoMode) {
      add(input, 1, surface);
    } else {
      // Genuinely async — a real cartCreate/cartLinesAdd round trip, not a
      // simulated delay. The drawer still opens immediately; its line
      // renders once the mutation resolves.
      void shopifyAdd(input.variantId, 1, locale, input.handle, surface);
    }

    setAdded(true);
    if (openDrawer) open('cart');

    window.setTimeout(() => setAdded(false), 420);
  };

  return (
    <Button
      variant="solid"
      size={size}
      block={block}
      disabled={disabled}
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
      aria-live="polite"
    >
      {/* Both states occupy the same box, so the button never changes width. */}
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <m.span
            key="added"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2"
          >
            <IconCheck className="size-4" />
            {t.product.added}
          </m.span>
        ) : (
          <m.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {showsFallbackLabel ? (disabledLabel ?? t.product.soldOut) : t.product.addToBag}
          </m.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
