/**
 * Re-export seam for data/looks.ts — see that file for why DEMO_LOOKS is
 * empty. UI must read demo fixtures through lib/commerce, never straight
 * from data/ (enforced by the `no-restricted-imports` ESLint rule); this
 * mirrors the same pattern already used for stories in search-providers.ts.
 */
export { DEMO_LOOKS, type Look, type LookHotspot } from '@/data/looks';
