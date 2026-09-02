'use client';

import { Overlay } from '@/components/ui/overlay';
import { PurchasePanel } from '@/components/product/purchase-panel';
import type { SizeGuideCopy } from '@/components/product/size-guide-drawer';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import type { Locale } from '@/types/i18n';

/**
 * The ONE shared Quick Add sheet — mounted once in `overlay-root.tsx`,
 * shown for whichever product a `QuickAddTrigger` most recently opened it
 * for (read from `useUIStore`'s `quickAddProduct`/`quickAddSurface`).
 *
 * A bottom-sheet wrapping the exact same `PurchasePanel` the PDP uses, not a
 * rebuilt variant selector — no fabricated default size, the shopper picks
 * one here exactly as they would on the product page.
 *
 * `'quickadd'` is a real slot on the shared `useUIStore`, not local state —
 * load-bearing, not just conventional. `AddToBag` (inside `PurchasePanel`)
 * already calls `open('cart')` on the same single-slot store when an item is
 * added, which atomically replaces `'quickadd'` with `'cart'`: the sheet
 * closes and the drawer opens in one state transition, no extra code.
 *
 * `key={product.handle}` forces `PurchasePanel` to remount (and so reset its
 * internal colour/size selection) whenever the sheet is opened for a
 * different product, rather than carrying over a stale selection.
 */
export function QuickAddSheet({
  locale,
  sizeGuideCopy,
  copy,
}: {
  locale: Locale;
  sizeGuideCopy: SizeGuideCopy;
  copy: { label: string };
}) {
  const open = useIsOverlayOpen('quickadd');
  const close = useUIStore((state) => state.close);
  const product = useUIStore((state) => state.quickAddProduct);
  const surface = useUIStore((state) => state.quickAddSurface);

  if (!product) return null;

  return (
    <Overlay
      id="quick-add-panel"
      open={open}
      onClose={close}
      placement="bottom"
      label={`${copy.label} — ${product.title}`}
    >
      <div className="editorial max-h-[80svh] overflow-y-auto py-8">
        <PurchasePanel
          key={product.handle}
          product={product}
          locale={locale}
          sizeGuideCopy={sizeGuideCopy}
          showVisual
          surface={surface}
        />
      </div>
    </Overlay>
  );
}
