import type { Route } from 'next';
import { routes } from '@/lib/utils/routes';
import type { Locale } from '@/types/i18n';

/**
 * Structural navigation data — the mega-menu's and mobile menu's shared
 * source of truth, so the two can never drift out of sync.
 *
 * Lives under lib/, not data/: components/layout/site-header.tsx imports
 * this directly, and the `no-restricted-imports` ESLint rule blocks
 * `@/data/*` from `components/`/`app/` (only lib/commerce/**, lib/assistant/**
 * and lib/dashboard/** are exempted). This module holds no dictionary
 * strings and needs none — it returns hrefs plus translation keys, and the
 * caller resolves labels via useLocale().
 *
 * Product handles are referenced as string literals, the same way the home
 * page already hardcodes commerce.getProduct('atlantic-01', ...).
 */

export interface NavLink {
  href: Route | null;
  labelKey: string;
  /** True = renders inert (no navigation), with a "soon" cue — see decision 8 in the Phase 2 plan. */
  disabled?: boolean;
}

export interface MegaMenuColumn {
  id: 'apparel' | 'accessories' | 'discover';
  titleKey: string;
  links: NavLink[];
}

export interface MegaMenuFeatured {
  labelKey: string;
  href: Route;
  productHandle: string;
}

export function buildMainNavigation(locale: Locale): NavLink[] {
  return [{ href: routes.story(locale), labelKey: 'stories' }];
}

export function buildMegaMenuFeatured(locale: Locale): MegaMenuFeatured {
  return {
    labelKey: 'newLabel',
    href: routes.product(locale, 'atlantic-01'),
    productHandle: 'atlantic-01',
  };
}

/**
 * Apparel/accessories sub-links point straight at the one real product each
 * name maps to — there is no per-category collection filter today (that is
 * a later phase), so linking to an imprecise existing `?collection=` filter
 * would group unrelated forms under the wrong label. The catalogue has 5
 * apparel forms; only 3 (Jackets/Overshirts/T-Shirts) came from the original
 * brief — Knitwear and Trousers are added so the other 2 real products are
 * not hidden from navigation.
 */
export function buildMegaMenuSections(locale: Locale): MegaMenuColumn[] {
  return [
    {
      id: 'apparel',
      titleKey: 'apparelTitle',
      links: [
        { href: routes.product(locale, 'atlantic-01'), labelKey: 'jackets' },
        { href: routes.product(locale, 'tide-01'), labelKey: 'overshirts' },
        { href: routes.product(locale, 'volcanic-tee'), labelKey: 'tshirts' },
        { href: routes.product(locale, 'basalt-knit'), labelKey: 'knitwear' },
        { href: routes.product(locale, 'trade-pant'), labelKey: 'trousers' },
      ],
    },
    {
      id: 'accessories',
      titleKey: 'accessoriesTitle',
      links: [
        { href: routes.product(locale, 'current-bag'), labelKey: 'bags' },
        { href: routes.product(locale, 'north-cap'), labelKey: 'headwear' },
        { href: routes.product(locale, 'atlantic-bottle'), labelKey: 'drinkware' },
      ],
    },
    {
      id: 'discover',
      titleKey: 'discoverTitle',
      links: [
        { href: routes.story(locale), labelKey: 'atlanticStory' },
        { href: routes.storyAnchor(locale, 'materials'), labelKey: 'materialResearch' },
        { href: null, labelKey: 'lookbook', disabled: true },
      ],
    },
  ];
}
