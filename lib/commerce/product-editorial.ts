/**
 * Re-export seam for data/product-editorial.ts. UI must read demo fixtures
 * through lib/commerce, never straight from data/ (enforced by the
 * `no-restricted-imports` ESLint rule) — same pattern as looks.ts and
 * search-providers.ts's DEMO_STORIES.
 */
export {
  PRODUCT_EDITORIAL,
  type ProductEditorial,
  type ProductHotspot,
} from '@/data/product-editorial';
