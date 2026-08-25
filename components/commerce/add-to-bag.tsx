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
 */
export function AddToBag({
  input,
  disabled = false,
  disabledLabel,
  size = 'lg',
  block = true,
  openDrawer = true,
  className,
}: {
  input: CartInput | null;
  disabled?: boolean;
  disabledLabel?: string;
  size?: 'md' | 'lg';
  block?: boolean;
  openDrawer?: boolean;
  className?: string;
}) {
  const { t, locale } = useLocale();
  const isDemoMode = useIsDemoMode();
  const add = useCartStore((state) => state.add);
  const shopifyAdd = useShopifyCartStore((state) => state.add);
  const open = useUIStore((state) => state.open);
  const [added, setAdded] = useState(false);

  const isDisabled = disabled || input === null;

  const handleClick = () => {
    if (!input) return;

    if (isDemoMode) {
      add(input, 1);
    } else {
      // Genuinely async — a real cartCreate/cartLinesAdd round trip, not a
      // simulated delay. The drawer still opens immediately; its line
      // renders once the mutation resolves.
      void shopifyAdd(input.variantId, 1, locale, input.handle);
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
      disabled={isDisabled}
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
            {isDisabled ? (disabledLabel ?? t.product.soldOut) : t.product.addToBag}
          </m.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
