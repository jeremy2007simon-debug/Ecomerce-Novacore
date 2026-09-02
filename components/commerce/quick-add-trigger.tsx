'use client';

import { useUIStore, type QuickAddSurface } from '@/lib/store/ui-store';
import type { Product } from '@/types/commerce';

/**
 * Opens the shared Quick Add sheet (`QuickAddSheet`, mounted once in
 * `overlay-root.tsx`) for `product`. Many of these can exist on one page —
 * every `ProductCard` in a collection grid, plus Home's Drop section — all
 * pointing at the same shared overlay slot, which is why `openQuickAdd`
 * writes the target product into `useUIStore` rather than each trigger
 * owning its own `<Overlay>`.
 */
export function QuickAddTrigger({
  product,
  surface,
  label,
  className,
}: {
  product: Product;
  surface: QuickAddSurface;
  label: string;
  className?: string;
}) {
  const openQuickAdd = useUIStore((state) => state.openQuickAdd);

  return (
    <button type="button" onClick={() => openQuickAdd(product, surface)} className={className}>
      {label}
    </button>
  );
}
