'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Collection, ProductSort } from '@/types/commerce';

/**
 * Collection filters and sort.
 *
 * State lives in the URL, not in React. That means a filtered view is
 * shareable, survives a reload, and works with the browser's back button —
 * three things a useState-based filter silently gives up, and all three matter
 * on a page a shopper will navigate away from and return to.
 *
 * `push`, not `replace`. The paragraph above promised the back button, and
 * `replace` overwrites the current entry, so Back skipped straight past every
 * filter the shopper had applied and left the page instead of undoing them one
 * at a time.
 *
 * `scroll: false` keeps the viewport where it is when a filter changes;
 * jumping to the top of the page on every filter click is disorienting.
 */
export function CollectionToolbar({
  collections,
  copy,
}: {
  collections: Collection[];
  copy: {
    sortLabel: string;
    sort: Record<string, string>;
    filterAll: string;
    clearFilters: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCollection = searchParams.get('collection') ?? 'all';
  const activeSort = (searchParams.get('sort') ?? 'featured') as ProductSort;

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === 'all' || (key === 'sort' && value === 'featured')) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const query = next.toString();
      router.push((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const sorts: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'rating', 'newest'];
  const hasFilters = activeCollection !== 'all' || activeSort !== 'featured';

  return (
    <div className="flex flex-col gap-6 border-y border-hairline py-5 lg:flex-row lg:items-center lg:justify-between">
      {/*
        Collections.

        `min-w-0` is what stops this row overflowing the page. A flex item
        defaults to `min-width: auto`, i.e. it refuses to shrink below its
        content — and the content is `whitespace-nowrap`. Combined with
        `lg:overflow-visible`, which removed the scroll container exactly where
        the row turns horizontal, the Spanish sort labels pushed the toolbar
        369px past the viewport at 1024px (125px at 1280, 37px at 1440).

        The scroller now survives at every width: below `lg` it bleeds into the
        gutters, above it sits inside the grid, and in both cases the overflow
        scrolls instead of escaping the page.
      */}
      <div className="min-w-0 -mx-(--spacing-gutter) overflow-x-auto px-(--spacing-gutter) [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        <ul className="flex items-center gap-6 whitespace-nowrap">
          {collections.map((collection) => (
            <li key={collection.handle}>
              <button
                type="button"
                onClick={() => setParam('collection', collection.handle)}
                aria-pressed={activeCollection === collection.handle}
                className={cn(
                  'label transition-colors',
                  activeCollection === collection.handle
                    ? 'text-ink'
                    : 'text-ink-subtle hover:text-ink-muted',
                )}
              >
                {collection.handle === 'all' ? copy.filterAll : collection.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort */}
      <div className="flex min-w-0 items-center gap-5">
        <span className="micro-label shrink-0 text-ink-subtle">{copy.sortLabel}</span>
        <div className="min-w-0 -mx-(--spacing-gutter) overflow-x-auto px-(--spacing-gutter) [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center gap-4 whitespace-nowrap">
            {sorts.map((sort) => (
              <li key={sort}>
                <button
                  type="button"
                  onClick={() => setParam('sort', sort)}
                  aria-pressed={activeSort === sort}
                  className={cn(
                    'micro-label transition-colors',
                    activeSort === sort ? 'text-ember' : 'text-ink-subtle hover:text-ink',
                  )}
                >
                  {copy.sort[sort]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.push(pathname as Route, { scroll: false })}
            className="micro-label shrink-0 text-ink-subtle underline decoration-hairline-strong underline-offset-4 hover:text-ink"
          >
            {copy.clearFilters}
          </button>
        ) : null}
      </div>
    </div>
  );
}
