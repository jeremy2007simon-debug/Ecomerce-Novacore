'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { Overlay } from '@/components/ui/overlay';
import { AtlanticLockup } from '@/components/visual/atlantic-mark';
import { ContourField } from '@/components/visual/contour-field';
import { IconArrowRight, IconClose } from '@/components/visual/icons';
import { LocaleSwitcher } from './locale-switcher';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import { routes } from '@/lib/utils/routes';
import type { Collection } from '@/types/commerce';

/**
 * Fullscreen mobile menu.
 *
 * The links stagger in as masked lines rather than fading as a block — the
 * stagger is what makes a fullscreen takeover feel composed rather than like a
 * panel that simply appeared.
 */
export function MobileMenu({
  collections,
  nav,
}: {
  collections: Collection[];
  nav: { shop: string; story: string; close: string; menu: string };
}) {
  const { locale } = useLocale();
  const open = useIsOverlayOpen('menu');
  const close = useUIStore((state) => state.close);

  const links = [
    ...collections.slice(0, 5).map((c) => ({
      href: c.handle === 'all' ? routes.collection(locale) : routes.collectionFiltered(locale, `collection=${c.handle}`),
      label: c.title,
    })),
    { href: routes.story(locale), label: nav.story },
  ];

  return (
    <Overlay open={open} onClose={close} placement="full" label={nav.menu} className="bg-void">
      <ContourField
        seed="menu"
        tone="ember"
        rings={26}
        origin={{ x: 78, y: 88 }}
        className="pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="safe-top gutter relative flex h-16 items-center justify-between">
        <AtlanticLockup compact className="text-ink" />
        <button
          type="button"
          onClick={close}
          className="-mr-2 p-2 text-ink transition-opacity hover:opacity-70"
          aria-label={nav.close}
        >
          <IconClose />
        </button>
      </div>

      <nav className="gutter relative flex grow flex-col justify-center" aria-label={nav.menu}>
        <ul className="flex flex-col gap-1">
          {links.map((link, i) => (
            <li key={link.href} className="overflow-clip">
              <m.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.06 + i * 0.045, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.href}
                  onClick={close}
                  className="group flex items-baseline justify-between gap-6 py-2"
                >
                  <span className="text-headline font-medium text-ink">{link.label}</span>
                  <IconArrowRight className="size-5 shrink-0 -translate-x-2 text-ember opacity-0 transition-all duration-[--duration-base] group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </m.div>
            </li>
          ))}
        </ul>
      </nav>

      <div className="gutter safe-bottom relative flex items-center justify-between border-t border-hairline pt-5">
        <LocaleSwitcher />
        <p className="micro-label text-ink-subtle">Atlantic Supply · Tenerife</p>
      </div>
    </Overlay>
  );
}
