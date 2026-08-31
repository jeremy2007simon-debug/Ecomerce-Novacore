'use client';

import { Overlay } from '@/components/ui/overlay';
import { PurchasePanel } from '@/components/product/purchase-panel';
import type { SizeGuideCopy } from '@/components/product/size-guide-drawer';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Quick Add — a bottom-sheet wrapping the exact same `PurchasePanel` the PDP
 * uses, not a rebuilt variant selector. No fabricated default size: if the
 * product needs one, the shopper picks it here exactly as they would on the
 * product page.
 *
 * `'quickadd'` is a real slot on the shared `useUIStore`, not local state —
 * load-bearing, not just conventional. `AddToBag` (inside `PurchasePanel`)
 * already calls `open('cart')` on the same single-slot store when an item is
 * added, which atomically replaces `'quickadd'` with `'cart'`: the sheet
 * closes and the drawer opens in one state transition, no extra code. Local
 * state would leave both open at once.
 *
 * Mounted directly inside the Drop section, not via `overlay-root.tsx` —
 * that file is global, idle-prefetched infrastructure loaded on every route;
 * Quick Add only exists on Home. `Overlay` portals to `document.body`
 * regardless of where it's rendered, so nothing about positioning depends on
 * living in the shared overlay root.
 */
export function QuickAdd({
  product,
  locale,
  sizeGuideCopy,
  copy,
}: {
  product: Product;
  locale: Locale;
  sizeGuideCopy: SizeGuideCopy;
  copy: { cta: string; label: string };
}) {
  const open = useIsOverlayOpen('quickadd');
  const openOverlay = useUIStore((state) => state.open);
  const close = useUIStore((state) => state.close);

  return (
    <>
      <button
        type="button"
        onClick={() => openOverlay('quickadd')}
        className="label border-b border-hairline-strong pb-0.5 text-ink transition-colors duration-(--duration-fast) hover:border-ember hover:text-ember"
      >
        {copy.cta}
      </button>

      <Overlay id="home-quick-add" open={open} onClose={close} placement="bottom" label={copy.label}>
        <div className="editorial max-h-[80svh] overflow-y-auto py-8">
          <PurchasePanel product={product} locale={locale} sizeGuideCopy={sizeGuideCopy} showVisual />
        </div>
      </Overlay>
    </>
  );
}
