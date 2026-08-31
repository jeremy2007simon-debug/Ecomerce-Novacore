import type { ClientDictionary, ServerDictionary } from '@/lib/i18n/dictionaries/en';
import type { ProductCardCopy } from '@/components/commerce/product-card';

/**
 * One place that builds ProductCard's copy prop from the two dictionaries —
 * every page that renders a grid/rail of ProductCards needs the identical
 * shape, so this avoids repeating the same five-field object at each call
 * site.
 */
export function buildProductCardCopy(t: ServerDictionary, clientT: ClientDictionary): ProductCardCopy {
  return {
    soldOut: t.product.soldOut,
    sale: t.product.sale,
    colorOptions: t.product.colorOptions,
    quickAdd: clientT.quickAdd.cta,
    wishlist: `${t.nav.wishlist} — ${clientT.megaMenu.soon}`,
  };
}
