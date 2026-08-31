'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { AtlanticLockup } from '@/components/visual/atlantic-mark';
import { IconBag, IconHeart, IconMenu, IconSearch, IconUser } from '@/components/visual/icons';
import { MegaMenu } from './mega-menu';
import { LocaleSwitcher } from './locale-switcher';
import { useIsDemoMode } from '@/lib/commerce/is-demo-mode';
import { useCartCount, useCartHydrated } from '@/lib/store/cart-store';
import { useShopifyCartCount, useShopifyCartHydrated } from '@/lib/store/shopify-cart-store';
import { useOverlay, useUIStore } from '@/lib/store/ui-store';
import { useLocale } from '@/lib/i18n/locale-provider';
import { buildMainNavigation } from '@/lib/navigation/nav-config';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';

const MEGA_MENU_PANEL_ID = 'mega-menu-panel';

interface HeaderNav {
  shop: string;
  story: string;
  stories: string;
  account: string;
  wishlist: string;
  search: string;
  bag: string;
  menu: string;
}

/**
 * Site header.
 *
 * The one place on the site allowed to use backdrop-filter — it is ~64px tall,
 * so the compositing cost is bounded. Everything else uses opaque surfaces.
 *
 * Scroll state comes from a passive scroll listener that only ever writes a
 * boolean, so it cannot thrash layout: no getBoundingClientRect, no measuring.
 *
 * SHOP opens the mega-menu on click (works for keyboard/touch/mouse alike) AND
 * on hover-intent for pointer devices — a short open/close delay so moving the
 * cursor toward the panel does not close it mid-transit, gated behind
 * `matchMedia('(hover: hover)')` so it never fires from a touch tap.
 */
export function SiteHeader({ nav, products }: { nav: HeaderNav; products: Product[] }) {
  const { locale } = useLocale();
  const isDemoMode = useIsDemoMode();
  const open = useUIStore((state) => state.open);
  const close = useUIStore((state) => state.close);
  const toggle = useUIStore((state) => state.toggle);
  const overlay = useOverlay();
  const demoCount = useCartCount();
  const demoHydrated = useCartHydrated();
  const shopifyCount = useShopifyCartCount();
  const shopifyHydrated = useShopifyCartHydrated();
  const count = isDemoMode ? demoCount : shopifyCount;
  const hydrated = isDemoMode ? demoHydrated : shopifyHydrated;
  const [scrolled, setScrolled] = useState(false);
  const hoverTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
  }, []);

  const megaMenuOpen = overlay === 'megamenu';
  const solid = scrolled || megaMenuOpen;
  const supportsHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const scheduleOpen = () => {
    if (!supportsHover()) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => open('megamenu'), 150);
  };
  const scheduleClose = () => {
    if (!supportsHover()) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => close(), 200);
  };

  const storiesLink = buildMainNavigation(locale)[0]!;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-(--z-header) transition-[background-color,border-color,backdrop-filter] duration-(--duration-base)',
        solid
          ? 'border-b border-hairline bg-void/72 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="gutter safe-top flex h-(--header-height) items-center justify-between gap-4">
        {/* Mobile: menu trigger. Desktop: nav links. */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => open('menu')}
            aria-haspopup="true"
            aria-expanded={overlay === 'menu'}
            aria-controls="mobile-menu-panel"
            className="-ml-2 p-2 text-ink transition-opacity hover:opacity-70 md:hidden"
            aria-label={nav.menu}
          >
            <IconMenu />
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label={nav.menu}>
            <div onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
              <button
                type="button"
                onClick={() => toggle('megamenu')}
                aria-haspopup="true"
                aria-expanded={megaMenuOpen}
                aria-controls={MEGA_MENU_PANEL_ID}
                className="label text-ink-muted transition-colors hover:text-ink"
              >
                {nav.shop}
              </button>
            </div>
            <Link href={storiesLink.href ?? routes.story(locale)} className="label text-ink-muted transition-colors hover:text-ink">
              {nav.stories}
            </Link>
          </nav>
        </div>

        {/* Wordmark, optically centred on mobile. */}
        <Link
          href={routes.home(locale)}
          className="absolute left-1/2 -translate-x-1/2 text-ink md:static md:translate-x-0"
          aria-label="Atlantic Supply"
        >
          <AtlanticLockup compact />
        </Link>

        <div className="flex items-center gap-1 md:gap-5">
          <LocaleSwitcher className="hidden md:inline-flex" />

          {/*
            Account/Wishlist have no destination yet (no auth, no wishlist
            store — later phases). Disabled buttons with a visible "Soon" cue
            rather than a fabricated route, per decision 9 of the Phase 2 plan.
          */}
          <span
            aria-disabled="true"
            aria-label={`${nav.account} — soon`}
            className="hidden cursor-not-allowed p-2 text-ink-subtle opacity-50 md:inline-flex"
          >
            <IconUser />
          </span>
          <span
            aria-disabled="true"
            aria-label={`${nav.wishlist} — soon`}
            className="hidden cursor-not-allowed p-2 text-ink-subtle opacity-50 md:inline-flex"
          >
            <IconHeart />
          </span>

          <button
            type="button"
            onClick={() => open('search')}
            aria-haspopup="true"
            aria-expanded={overlay === 'search'}
            aria-controls="search-overlay-panel"
            className="p-2 text-ink transition-opacity hover:opacity-70"
            aria-label={nav.search}
          >
            <IconSearch />
          </button>

          <button
            type="button"
            onClick={() => open('cart')}
            aria-haspopup="true"
            aria-expanded={overlay === 'cart'}
            aria-controls="cart-drawer-panel"
            className="group relative -mr-2 p-2 text-ink transition-opacity hover:opacity-70"
            aria-label={`${nav.bag} (${count})`}
          >
            <IconBag />
            {/*
              The badge only exists once the persisted cart has been read, so
              server HTML and first client render agree. The scale-pop on
              arrival turns that constraint into a designed moment.
            */}
            {hydrated && count > 0 ? (
              <m.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 620, damping: 24 }}
                className="micro-label absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-pill bg-ember text-void"
                data-numeric
              >
                {count}
              </m.span>
            ) : null}
          </button>
        </div>
      </div>

      <MegaMenu id={MEGA_MENU_PANEL_ID} label={nav.shop} products={products} />
    </header>
  );
}
