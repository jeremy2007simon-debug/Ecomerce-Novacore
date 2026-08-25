'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Overlay } from '@/components/ui/overlay';
import { ProductVisual } from '@/components/visual/product-visual';
import { IconClose, IconSearch } from '@/components/visual/icons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { useIsOverlayOpen, useUIStore } from '@/lib/store/ui-store';
import { searchIndex } from '@/lib/commerce/search';
import { track } from '@/lib/analytics';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';

/**
 * Instant search.
 *
 * The whole product index is passed in from the server — eight products is a
 * few kilobytes, and shipping it means results appear on the keystroke with no
 * network round trip at all. That is what makes typing "atl" feel instant
 * rather than merely fast.
 *
 * `useDeferredValue` keeps the input responsive: React renders the character
 * immediately and the (cheap, but non-zero) ranked list at a lower priority, so
 * the caret never lags the thumb.
 *
 * PRODUCTION NOTE: with a real catalogue this becomes a debounced request to a
 * search service. The component boundary does not change — only the source of
 * `results`.
 */
export function SearchOverlay({ products }: { products: Product[] }) {
  const { t } = useLocale();
  const open = useIsOverlayOpen('search');
  const close = useUIStore((state) => state.close);

  return (
    <Overlay open={open} onClose={close} placement="full" label={t.search.placeholder} className="bg-void">
      {/*
        Keyed on `open`, so the panel — and with it the query — is thrown away
        and rebuilt every time the overlay opens. Resetting state with a key is
        the React-idiomatic alternative to clearing it from an effect, and it
        removes a render pass rather than adding one.
      */}
      <SearchPanel key={open ? 'open' : 'closed'} products={products} onClose={close} />
    </Overlay>
  );
}

function SearchPanel({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const { t, locale, fmt } = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => searchIndex(products, deferredQuery, 6).map((hit) => hit.product),
    [products, deferredQuery],
  );

  // Fire one analytics event per settled query rather than per keystroke.
  useEffect(() => {
    if (deferredQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      track({
        name: 'search',
        payload: { query: deferredQuery, resultCount: results.length },
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [deferredQuery, results.length]);

  const popular = products.slice(0, 4);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      <div className="safe-top gutter flex h-16 items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 p-2 text-ink transition-opacity hover:opacity-70"
          aria-label={t.search.close}
        >
          <IconClose />
        </button>
      </div>

      <div className="gutter flex grow flex-col overflow-y-auto overscroll-contain pb-10">
        {/*
          A real <form>, and a large unadorned input on a hairline.

          It used to be a bare input, so Enter — the single most natural thing
          to press after typing a query — did nothing at all. Submitting now
          goes to `/search?q=…`, the server-rendered results page that already
          existed and that nothing in the app linked to: `routes.search` had
          zero call sites. The overlay stays the fast path; the page is what
          makes a query shareable, bookmarkable and reachable without JS.
        */}
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const term = query.trim();
            if (!term) return;
            router.push(routes.search(locale, term));
            onClose();
          }}
          className="flex items-center gap-4 border-b border-hairline-strong pb-5"
        >
          <IconSearch className="size-6 shrink-0 text-ink-subtle" />
          <input
            ref={inputRef}
            // Focused when the overlay opens. Without it the trap takes the
            // first focusable in DOM order, which is the close button.
            data-autofocus
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search.placeholder}
            aria-label={t.search.placeholder}
            autoComplete="off"
            className="w-full bg-transparent text-title font-medium text-ink outline-none placeholder:text-ink-subtle"
          />
          {hasQuery ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="micro-label shrink-0 text-ink-subtle transition-colors hover:text-ink"
            >
              {t.search.clear}
            </button>
          ) : null}
        </form>

        <p className="label mt-5 text-ink-subtle" aria-live="polite">
          {hasQuery ? fmt(t.search.resultCount, { count: results.length }) : t.search.placeholder}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {hasQuery && results.length === 0 ? (
            <m.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="py-16"
            >
              <p className="text-title font-medium text-ink">
                {fmt(t.search.noResults, { query })}
              </p>
              <p className="mt-3 text-small text-ink-muted">{t.search.noResultsBody}</p>
            </m.div>
          ) : (
            <m.ul
              key={hasQuery ? 'results' : 'popular'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Deliberately fast: search results that ease in over half a
              // second feel slower than a page that simply loaded.
              transition={{ duration: 0.14 }}
              className="mt-6 flex flex-col"
            >
              {(hasQuery ? results : popular).map((product, i) => (
                <m.li
                  key={product.handle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={routes.product(locale, product.handle)}
                    onClick={onClose}
                    className="group flex items-center gap-4 border-b border-hairline py-4"
                  >
                    <div className="w-14 shrink-0">
                      <ProductVisual media={product.media[0]!} slot="thumb" />
                    </div>
                    <div className="min-w-0 grow">
                      <p className="truncate text-[0.9375rem] font-medium text-ink">{product.title}</p>
                      <p className="truncate text-small text-ink-muted">{product.subtitle}</p>
                    </div>
                    <p className="label shrink-0 text-ink-muted" data-numeric>
                      {formatMoney(product.priceRange.min, locale)}
                    </p>
                  </Link>
                </m.li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
