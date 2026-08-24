'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import { AtlanticLockup } from '@/components/visual/atlantic-mark';
import { IconBag, IconMenu, IconSearch } from '@/components/visual/icons';
import { LocaleSwitcher } from './locale-switcher';
import { useCartCount, useCartHydrated } from '@/lib/store/cart-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/utils/routes';

/**
 * Site header.
 *
 * The one place on the site allowed to use backdrop-filter — it is ~64px tall,
 * so the compositing cost is bounded. Everything else uses opaque surfaces.
 *
 * Scroll state comes from a passive scroll listener that only ever writes a
 * boolean, so it cannot thrash layout: no getBoundingClientRect, no measuring.
 */
export function SiteHeader({
  nav,
}: {
  nav: { shop: string; story: string; search: string; bag: string; menu: string };
}) {
  const { locale } = useLocale();
  const open = useUIStore((state) => state.open);
  const count = useCartCount();
  const hydrated = useCartHydrated();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-(--z-header) transition-[background-color,border-color,backdrop-filter] duration-[--duration-base]',
        scrolled
          ? 'border-b border-hairline bg-void/72 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="gutter safe-top flex h-16 items-center justify-between gap-4">
        {/* Mobile: menu trigger. Desktop: nav links. */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => open('menu')}
            className="-ml-2 p-2 text-ink transition-opacity hover:opacity-70 md:hidden"
            aria-label={nav.menu}
          >
            <IconMenu />
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label={nav.menu}>
            <Link href={routes.collection(locale)} className="label text-ink-muted transition-colors hover:text-ink">
              {nav.shop}
            </Link>
            <Link href={routes.story(locale)} className="label text-ink-muted transition-colors hover:text-ink">
              {nav.story}
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

          <button
            type="button"
            onClick={() => open('search')}
            className="p-2 text-ink transition-opacity hover:opacity-70"
            aria-label={nav.search}
          >
            <IconSearch />
          </button>

          <button
            type="button"
            onClick={() => open('cart')}
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
    </header>
  );
}
