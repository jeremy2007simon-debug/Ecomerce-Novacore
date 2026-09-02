'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { Overlay } from '@/components/ui/overlay';
import { AtlanticLockup } from '@/components/visual/atlantic-mark';
import { ContourField } from '@/components/visual/contour-field';
import { IconArrowDown, IconArrowRight, IconClose, IconHeart, IconUser } from '@/components/visual/icons';
import { LocaleSwitcher } from './locale-switcher';
import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/locale-provider';
import { DURATION_SLOW, EASE_OUT_EXPO } from '@/lib/motion/tokens';
import { buildMegaMenuFeatured, buildMegaMenuSections } from '@/lib/navigation/nav-config';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';

/**
 * Fullscreen mobile menu.
 *
 * Fully self-sourced from `useLocale()` — no `nav`/`collections` props. SHOP
 * and DISCOVER reuse the exact same `nav-config.ts` structure as the desktop
 * mega-menu (single source of truth: the two can never list different links).
 * Each renders as a native `<details>` disclosure, the same zero-JS accordion
 * pattern already used elsewhere in the app (Ask Atlantic's "How this works").
 *
 * The links stagger in as masked lines rather than fading as a block — the
 * stagger is what makes a fullscreen takeover feel composed rather than like a
 * panel that simply appeared.
 */
export function MobileMenu() {
  const { locale, t } = useLocale();
  const open = useIsOverlayOpen('menu');
  const close = useUIStore((state) => state.close);

  const featured = buildMegaMenuFeatured(locale);
  const sections = buildMegaMenuSections(locale);
  const shopSections = sections.filter((s) => s.id === 'apparel' || s.id === 'accessories');
  const discoverSection = sections.find((s) => s.id === 'discover')!;

  const label = (key: string) => t.megaMenu[key as keyof typeof t.megaMenu];

  return (
    <Overlay id="mobile-menu-panel" open={open} onClose={close} placement="full" label={t.mobileMenu.title} className="bg-void">
      <ContourField
        seed="menu"
        tone="ember"
        rings={26}
        origin={{ x: 78, y: 88 }}
        className="pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="safe-top gutter relative flex h-(--header-height) items-center justify-between">
        <AtlanticLockup compact className="text-ink" />
        <button
          type="button"
          onClick={close}
          className="-mr-2 p-2 text-ink transition-opacity hover:opacity-70"
          aria-label={t.common.close}
        >
          <IconClose />
        </button>
      </div>

      <nav className="gutter relative flex grow flex-col justify-center gap-1 overflow-y-auto py-6" aria-label={t.mobileMenu.title}>
        <m.div
          initial={{ y: '110%' }}
          animate={open ? { y: 0 } : { y: '110%' }}
          transition={{ delay: 0.06, duration: DURATION_SLOW, ease: EASE_OUT_EXPO }}
          className="overflow-clip"
        >
          <Link href={featured.href} onClick={close} className="group flex items-baseline justify-between gap-6 py-2">
            <span className="text-headline font-medium text-ink">{label(featured.labelKey)}</span>
            <IconArrowRight className="size-5 shrink-0 -translate-x-2 text-ember opacity-0 transition-all duration-(--duration-base) group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        </m.div>

        <m.div
          initial={{ y: '110%' }}
          animate={open ? { y: 0 } : { y: '110%' }}
          transition={{ delay: 0.1, duration: DURATION_SLOW, ease: EASE_OUT_EXPO }}
          className="overflow-clip"
        >
          <details className="group border-t border-hairline py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
              <span className="text-headline font-medium text-ink">{t.mobileMenu.shopTitle}</span>
              <IconArrowDown className="size-4 shrink-0 text-ink-subtle transition-transform duration-(--duration-fast) group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-5 pb-3 pt-3">
              {shopSections.map((section) => (
                <div key={section.id}>
                  {section.titleHref ? (
                    <Link
                      href={section.titleHref}
                      onClick={close}
                      className="micro-label text-ink-subtle transition-colors hover:text-ink"
                    >
                      {label(section.titleKey)}
                    </Link>
                  ) : (
                    <p className="micro-label text-ink-subtle">{label(section.titleKey)}</p>
                  )}
                  <ul className="mt-2 flex flex-col gap-2.5">
                    {section.links.map((link) =>
                      link.disabled || !link.href ? (
                        <li key={link.labelKey} className="label inline-flex items-center gap-2 text-ink-subtle">
                          {label(link.labelKey)}
                          <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5">
                            {t.megaMenu.soon}
                          </span>
                        </li>
                      ) : (
                        <li key={link.labelKey}>
                          <Link href={link.href} onClick={close} className="label text-ink-muted transition-colors hover:text-ink">
                            {label(link.labelKey)}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </m.div>

        <m.div
          initial={{ y: '110%' }}
          animate={open ? { y: 0 } : { y: '110%' }}
          transition={{ delay: 0.14, duration: DURATION_SLOW, ease: EASE_OUT_EXPO }}
          className="overflow-clip"
        >
          <details className="group border-t border-hairline py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
              <span className="text-headline font-medium text-ink">{t.mobileMenu.discoverTitle}</span>
              <IconArrowDown className="size-4 shrink-0 text-ink-subtle transition-transform duration-(--duration-fast) group-open:rotate-180" />
            </summary>
            <ul className="flex flex-col gap-2.5 pb-3 pt-3">
              {discoverSection.links.map((link) =>
                link.disabled || !link.href ? (
                  <li key={link.labelKey} className="label inline-flex items-center gap-2 text-ink-subtle">
                    {label(link.labelKey)}
                    <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5">{t.megaMenu.soon}</span>
                  </li>
                ) : (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      onClick={() => {
                        close();
                        track({ name: 'story_view', payload: { storyId: link.labelKey, handle: 'atlantic-01' } });
                      }}
                      className="label text-ink-muted transition-colors hover:text-ink"
                    >
                      {label(link.labelKey)}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </details>
        </m.div>

        <m.div
          initial={{ y: '110%' }}
          animate={open ? { y: 0 } : { y: '110%' }}
          transition={{ delay: 0.18, duration: DURATION_SLOW, ease: EASE_OUT_EXPO }}
          className="flex flex-col gap-1 border-t border-hairline py-2 overflow-clip"
        >
          <span
            aria-disabled="true"
            className="label inline-flex items-center gap-2 py-1.5 text-ink-subtle"
          >
            <IconUser className="size-4" />
            {t.mobileMenu.accountTitle}
            <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5">{t.mobileMenu.soon}</span>
          </span>
          <span
            aria-disabled="true"
            className="label inline-flex items-center gap-2 py-1.5 text-ink-subtle"
          >
            <IconHeart className="size-4" />
            {t.mobileMenu.wishlistTitle}
            <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5">{t.mobileMenu.soon}</span>
          </span>
        </m.div>
      </nav>

      <div className="gutter safe-bottom relative flex items-center justify-between border-t border-hairline pt-5">
        <LocaleSwitcher />
        <p className="micro-label text-ink-subtle">{t.mobileMenu.tagline}</p>
      </div>
    </Overlay>
  );
}
