'use client';

import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef } from 'react';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconArrowRight } from '@/components/visual/icons';
import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/locale-provider';
import { DURATION_FAST, EASE_OUT_EXPO } from '@/lib/motion/tokens';
import { buildMegaMenuFeatured, buildMegaMenuSections, type MegaMenuColumn } from '@/lib/navigation/nav-config';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import type { ClientDictionary } from '@/lib/i18n/dictionaries/en';
import { formatMoney } from '@/lib/utils/money';
import type { Product } from '@/types/commerce';

type MegaMenuCopy = ClientDictionary['megaMenu'];

/**
 * SHOP mega-menu — a dropdown, not a modal.
 *
 * Deliberately does NOT reuse `useFocusTrap`/`Overlay`'s auto-focus-on-open:
 * this panel opens on hover as well as on click (see the hover-intent timers in
 * SiteHeader), and stealing keyboard focus every time a mouse passes over SHOP
 * would be a real accessibility regression, not a nicety. Tab flows through the
 * panel in normal DOM order instead — SHOP button, then the panel's own links,
 * then whatever follows in the header. Escape/outside-click/scroll-away and a
 * closed panel on every link click cover the cases that matter.
 *
 * No `useScrollLock` — a dropdown under the header must not block page scroll
 * the way a fullscreen overlay does.
 */
export function MegaMenu({ id, label, products }: { id: string; label: string; products: Product[] }) {
  const { locale, t } = useLocale();
  const open = useIsOverlayOpen('megamenu');
  const close = useUIStore((state) => state.close);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) close();
    };
    // Registered on the next tick so the click that opened the panel does not
    // also close it.
    const timer = window.setTimeout(() => document.addEventListener('mousedown', onPointerDown), 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 4) close();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open, close]);

  const sections = buildMegaMenuSections(locale);
  const featured = buildMegaMenuFeatured(locale);
  const featuredProduct = products.find((product) => product.handle === featured.productHandle);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          ref={panelRef}
          id={id}
          role="region"
          aria-label={label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: DURATION_FAST, ease: EASE_OUT_EXPO }}
          className="absolute inset-x-0 top-full z-(--z-header-panel) hidden border-b border-hairline-strong bg-surface-raised md:block"
        >
          <div className="editorial grid grid-cols-4 gap-8 py-10">
            <div className="col-span-3 grid grid-cols-3 gap-8">
              {sections.map((column) => (
                <MegaMenuColumnList key={column.id} column={column} copy={t.megaMenu} onNavigate={close} />
              ))}
            </div>

            {featuredProduct ? (
              <Link
                href={featured.href}
                onClick={() => {
                  close();
                  track({
                    name: 'select_item',
                    payload: {
                      productId: featuredProduct.id,
                      handle: featuredProduct.handle,
                      listId: 'mega_menu_featured',
                      position: 0,
                    },
                  });
                }}
                className="group"
              >
                <div className="relative">
                  <ProductVisual media={featuredProduct.media[0]!} slot="feature" />
                  <span className="micro-label absolute left-3 top-3 rounded-pill bg-void/80 px-2.5 py-1 text-ink">
                    {t.megaMenu.newLabel}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <p className="text-[0.9375rem] font-medium text-ink">{featuredProduct.title}</p>
                  <IconArrowRight className="size-4 shrink-0 -translate-x-1 text-ember opacity-0 transition-all duration-(--duration-base) group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="label text-ink-muted" data-numeric>
                  {formatMoney(featuredProduct.priceRange.min, locale)}
                </p>
              </Link>
            ) : null}
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

function MegaMenuColumnList({
  column,
  copy,
  onNavigate,
}: {
  column: MegaMenuColumn;
  copy: MegaMenuCopy;
  onNavigate: () => void;
}) {
  const label = (key: string) => copy[key as keyof MegaMenuCopy];

  return (
    <div>
      {column.titleHref ? (
        <Link
          href={column.titleHref}
          onClick={onNavigate}
          className="micro-label text-ink-subtle transition-colors hover:text-ink"
        >
          {label(column.titleKey)}
        </Link>
      ) : (
        <p className="micro-label text-ink-subtle">{label(column.titleKey)}</p>
      )}
      <ul className="mt-4 flex flex-col gap-3">
        {column.links.map((link) => (
          <li key={link.labelKey}>
            {link.disabled || !link.href ? (
              <span className="label inline-flex items-center gap-2 text-ink-subtle">
                {label(link.labelKey)}
                <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5 text-ink-subtle">
                  {copy.soon}
                </span>
              </span>
            ) : (
              <Link
                href={link.href}
                onClick={() => {
                  onNavigate();
                  if (column.id === 'discover') {
                    track({ name: 'story_view', payload: { storyId: link.labelKey, handle: 'atlantic-01' } });
                  }
                }}
                className="label text-ink-muted transition-colors hover:text-ink"
              >
                {label(link.labelKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
