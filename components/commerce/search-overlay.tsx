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
import {
  POPULAR_SEARCHES,
  searchCollections,
  searchIndex,
  searchStories,
  topTrending,
  type CollectionSearchHit,
  type StorySearchHit,
} from '@/lib/commerce/search-providers';
import { track } from '@/lib/analytics';
import { formatMoney } from '@/lib/utils/money';
import { routes } from '@/lib/utils/routes';
import type { Collection, Product } from '@/types/commerce';

/**
 * Instant, sectioned search.
 *
 * The whole product index and collection list are passed in from the server —
 * a few kilobytes together — so results appear on the keystroke with no
 * network round trip at all. Stories come from lib/commerce/search-providers,
 * a small hand-authored demo dataset (see data/stories.ts).
 *
 * `useDeferredValue` keeps the input responsive: React renders the character
 * immediately and the (cheap, but non-zero) ranked lists at a lower priority.
 *
 * PRODUCTION NOTE: with a real catalogue/search service this becomes a
 * debounced request. The component boundary does not change — only the
 * source of each section's results.
 */
export function SearchOverlay({ products, collections }: { products: Product[]; collections: Collection[] }) {
  const { t } = useLocale();
  const open = useIsOverlayOpen('search');
  const close = useUIStore((state) => state.close);

  return (
    <Overlay
      id="search-overlay-panel"
      open={open}
      onClose={close}
      placement="full"
      label={t.search.placeholder}
      className="bg-void"
    >
      {/*
        Keyed on `open`, so the panel — and with it the query — is thrown away
        and rebuilt every time the overlay opens.
      */}
      <SearchPanel key={open ? 'open' : 'closed'} products={products} collections={collections} onClose={close} />
    </Overlay>
  );
}

type ResultEntry =
  | { kind: 'product'; key: string; product: Product; href: ReturnType<typeof routes.product> }
  | { kind: 'collection'; key: string; hit: CollectionSearchHit; href: ReturnType<typeof routes.collectionFiltered> }
  | { kind: 'story'; key: string; hit: StorySearchHit; href: ReturnType<typeof routes.story> };

function SearchPanel({
  products,
  collections,
  onClose,
}: {
  products: Product[];
  collections: Collection[];
  onClose: () => void;
}) {
  const { t, locale, fmt } = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const deferredQuery = useDeferredValue(query);
  const hasQuery = query.trim().length > 0;

  // The active index only makes sense against the current result set — reset
  // it during render when the settled query changes, React's documented
  // pattern for adjusting state in response to a prop/derived-value change
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [resetForQuery, setResetForQuery] = useState(deferredQuery);
  if (resetForQuery !== deferredQuery) {
    setResetForQuery(deferredQuery);
    setActiveIndex(-1);
  }

  const productHits = useMemo(
    () => searchIndex(products, deferredQuery, 6).map((hit) => hit.product),
    [products, deferredQuery],
  );
  const collectionHits = useMemo(
    () => searchCollections(collections, deferredQuery, 3),
    [collections, deferredQuery],
  );
  const storyHits = useMemo(() => searchStories(deferredQuery, locale, 3), [deferredQuery, locale]);

  const entries: ResultEntry[] = useMemo(
    () => [
      ...productHits.map((product): ResultEntry => ({
        kind: 'product',
        key: `product-${product.handle}`,
        product,
        href: routes.product(locale, product.handle),
      })),
      ...collectionHits.map((hit): ResultEntry => ({
        kind: 'collection',
        key: `collection-${hit.collection.handle}`,
        hit,
        href: routes.collectionFiltered(locale, `collection=${hit.collection.handle}`),
      })),
      ...storyHits.map((hit): ResultEntry => ({
        kind: 'story',
        key: `story-${hit.story.id}`,
        hit,
        href: routes.story(locale),
      })),
    ],
    [productHits, collectionHits, storyHits, locale],
  );

  const totalResultCount = entries.length;

  // Fire one analytics event per settled query rather than per keystroke.
  useEffect(() => {
    if (deferredQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      track({ name: 'search', payload: { query: deferredQuery, resultCount: totalResultCount } });
    }, 600);
    return () => clearTimeout(timer);
  }, [deferredQuery, totalResultCount]);

  const trending = useMemo(() => topTrending(products, 4), [products]);
  const popular = POPULAR_SEARCHES[locale];

  const navigateTo = (entry: ResultEntry) => {
    if (entry.kind === 'product') {
      track({
        name: 'select_item',
        payload: { productId: entry.product.id, handle: entry.product.handle, listId: 'search_results', position: entries.indexOf(entry) },
      });
    } else if (entry.kind === 'story') {
      track({ name: 'story_view', payload: { storyId: entry.hit.story.id, handle: '' } });
    }
    router.push(entry.href);
    onClose();
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasQuery || entries.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % entries.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? entries.length - 1 : i - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const entry = entries[activeIndex];
      if (entry) navigateTo(entry);
    }
  };

  return (
    <>
      <div className="safe-top gutter flex h-(--header-height) items-center justify-end">
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
        {/* A real <form>: Enter with nothing selected goes to /search?q=… */}
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (activeIndex >= 0) {
              const entry = entries[activeIndex];
              if (entry) return navigateTo(entry);
            }
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
            data-autofocus
            type="search"
            name="q"
            role="combobox"
            aria-expanded={hasQuery && entries.length > 0}
            aria-controls="search-results-listbox"
            aria-activedescendant={activeIndex >= 0 ? entries[activeIndex]?.key : undefined}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
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

        {hasQuery ? (
          <p className="label mt-5 text-ink-subtle" aria-live="polite">
            {fmt(t.search.resultCount, { count: totalResultCount })}
          </p>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {hasQuery && totalResultCount === 0 ? (
            <m.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="py-16"
            >
              <p className="text-title font-medium text-ink">{fmt(t.search.noResults, { query })}</p>
              <p className="mt-3 text-small text-ink-muted">{t.search.noResultsBody}</p>
            </m.div>
          ) : hasQuery ? (
            <m.div
              key="results"
              id="search-results-listbox"
              role="listbox"
              aria-label={fmt(t.search.resultCount, { count: totalResultCount })}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="mt-6 flex flex-col gap-8"
            >
              {productHits.length > 0 ? (
                <ResultSection title={t.search.productsTitle}>
                  {productHits.map((product, i) => {
                    const entry = entries[i]!;
                    return (
                      <ProductRow
                        key={entry.key}
                        entry={entry}
                        product={product}
                        active={activeIndex === i}
                        locale={locale}
                        onClick={() => navigateTo(entry)}
                      />
                    );
                  })}
                </ResultSection>
              ) : null}

              {collectionHits.length > 0 ? (
                <ResultSection title={t.search.collectionsTitle}>
                  {collectionHits.map((hit, i) => {
                    const index = productHits.length + i;
                    const entry = entries[index]!;
                    return (
                      <TextRow
                        key={entry.key}
                        id={entry.key}
                        active={activeIndex === index}
                        title={hit.collection.title}
                        body={hit.collection.description}
                        href={entry.href}
                        onClick={() => navigateTo(entry)}
                      />
                    );
                  })}
                </ResultSection>
              ) : null}

              {storyHits.length > 0 ? (
                <ResultSection title={t.search.storiesTitle}>
                  {storyHits.map((hit, i) => {
                    const index = productHits.length + collectionHits.length + i;
                    const entry = entries[index]!;
                    return (
                      <TextRow
                        key={entry.key}
                        id={entry.key}
                        active={activeIndex === index}
                        title={hit.story.title[locale]}
                        body={hit.story.excerpt[locale]}
                        href={entry.href}
                        onClick={() => navigateTo(entry)}
                      />
                    );
                  })}
                </ResultSection>
              ) : null}
            </m.div>
          ) : (
            <m.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="mt-8 flex flex-col gap-8"
            >
              {popular && popular.length > 0 ? (
                <div>
                  <p className="micro-label text-ink-subtle">{t.search.popularSearchesTitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {popular.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="label rounded-pill border border-hairline px-3 py-1.5 text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {trending.length > 0 ? (
                <div>
                  <p className="micro-label text-ink-subtle">{t.search.trendingTitle}</p>
                  <ul className="mt-3 flex flex-col">
                    {trending.map((product, i) => (
                      <li key={product.handle}>
                        <Link
                          href={routes.product(locale, product.handle)}
                          onClick={() => {
                            track({
                              name: 'select_item',
                              payload: { productId: product.id, handle: product.handle, listId: 'search_trending', position: i },
                            });
                            onClose();
                          }}
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
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="micro-label text-ink-subtle">{title}</p>
      <ul className="mt-3 flex flex-col">{children}</ul>
    </div>
  );
}

function ProductRow({
  entry,
  product,
  active,
  locale,
  onClick,
}: {
  entry: ResultEntry;
  product: Product;
  active: boolean;
  locale: Parameters<typeof formatMoney>[1];
  onClick: () => void;
}) {
  return (
    <li id={entry.key} role="option" aria-selected={active}>
      <Link
        href={entry.href}
        onClick={(event) => {
          event.preventDefault();
          onClick();
        }}
        className={`group flex items-center gap-4 border-b border-hairline py-4 ${active ? 'bg-surface-raised' : ''}`}
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
    </li>
  );
}

function TextRow({
  id,
  active,
  title,
  body,
  href,
  onClick,
}: {
  id: string;
  active: boolean;
  title: string;
  body: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <li id={id} role="option" aria-selected={active}>
      <Link
        href={href as ReturnType<typeof routes.story>}
        onClick={(event) => {
          event.preventDefault();
          onClick();
        }}
        className={`block border-b border-hairline py-4 ${active ? 'bg-surface-raised' : ''}`}
      >
        <p className="text-[0.9375rem] font-medium text-ink">{title}</p>
        <p className="mt-1 truncate text-small text-ink-muted">{body}</p>
      </Link>
    </li>
  );
}
