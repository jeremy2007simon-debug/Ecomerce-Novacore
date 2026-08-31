'use client';

import { useEffect } from 'react';
import { ProductCard, type ProductCardCopy } from '@/components/commerce/product-card';
import {
  DEFAULT_DENSITY,
  useCollectionDensityStore,
  type GridDensity,
} from '@/lib/store/collection-density-store';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

const DENSITY_CLASS: Record<GridDensity, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

/**
 * A plain grid — deliberately NOT wrapped in `RevealGroup`/`RevealItem`.
 *
 * Those primitives stagger children via a single `whileInView` trigger on
 * the parent with `once: true`; once that has fired (the grid's first paint),
 * a product that becomes newly visible after a filter change would mount at
 * its hidden variant and never receive a second trigger to reveal it — a real
 * risk, not a hypothetical one, given how `RevealGroup` is built. Filtering
 * is a commerce action, not a storytelling moment: results should update
 * immediately, matching the brief's own "no 30 fade-outs" instruction.
 */
export function ProductGrid({
  products,
  locale,
  productCardCopy,
}: {
  products: Product[];
  locale: Locale;
  productCardCopy: ProductCardCopy;
}) {
  const density = useCollectionDensityStore((state) => state.density);
  const hydrated = useCollectionDensityStore((state) => state.hydrated);

  useEffect(() => {
    void useCollectionDensityStore.persist.rehydrate();
    useCollectionDensityStore.getState().markHydrated();
  }, []);

  const shown = hydrated ? density : DEFAULT_DENSITY;

  return (
    <div className={cn('grid gap-x-4 gap-y-14 sm:gap-x-6 lg:gap-x-8 lg:gap-y-20', DENSITY_CLASS[shown])}>
      {products.map((product, i) => (
        <ProductCard
          key={product.handle}
          product={product}
          locale={locale}
          index={i}
          priority={i < 2}
          copy={productCardCopy}
        />
      ))}
    </div>
  );
}
