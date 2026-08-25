'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useMemo, useState } from 'react';
import { Stars } from './stars';
import { DemoBadge } from '@/components/ui/demo-badge';
import { IconCheck } from '@/components/visual/icons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatAbsoluteDate, formatRelativeDate } from '@/lib/utils/demo-time';
import { cn } from '@/lib/utils/cn';
import type { Review } from '@/types/commerce';

type Sort = 'recent' | 'helpful' | 'rating-desc' | 'rating-asc';

/**
 * Review list with client-side sort and rating filter.
 *
 * Sorting happens in the browser because the whole set for one product is a
 * handful of items — a round trip to re-sort twelve reviews would be slower and
 * would show a loading state for no reason.
 *
 * PRODUCTION NOTE: a real catalogue paginates this through
 * `commerce.getReviews`, which already accepts `sort`, `rating` and a cursor.
 * The component's props do not change.
 */
export function ReviewList({
  reviews,
  copy,
}: {
  reviews: Review[];
  copy: {
    verified: string;
    helpful: string;
    sortLabel: string;
    sortRecent: string;
    sortHelpful: string;
    sortRatingDesc: string;
    sortRatingAsc: string;
    showAll: string;
    empty: string;
    size: string;
  };
}) {
  const { locale, fmt } = useLocale();
  const [sort, setSort] = useState<Sort>('recent');
  const [rating, setRating] = useState<number | null>(null);

  const visible = useMemo(() => {
    const filtered = rating ? reviews.filter((r) => r.rating === rating) : [...reviews];

    // Every comparator ends with a stable id tiebreak so the order can never
    // differ between renders.
    switch (sort) {
      case 'helpful':
        return filtered.sort((a, b) => b.helpfulCount - a.helpfulCount || a.id.localeCompare(b.id));
      case 'rating-desc':
        return filtered.sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id));
      case 'rating-asc':
        return filtered.sort((a, b) => a.rating - b.rating || a.id.localeCompare(b.id));
      default:
        return filtered.sort(
          (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
        );
    }
  }, [reviews, sort, rating]);

  /*
    The rating filter offers exactly the ratings that exist in this set.

    It used to hardcode 5/4/3, which was wrong in both directions: the one
    thing a shopper most wants from a review filter — show me the bad ones —
    was missing, and a product whose reviews are all 4★ and 5★ still offered a
    3★ button that could only ever return "no reviews match that filter". A
    filter that leads to an empty state is worse than no filter.
  */
  const available = useMemo(
    () => [5, 4, 3, 2, 1].filter((star) => reviews.some((review) => review.rating === star)),
    [reviews],
  );

  const sorts: { key: Sort; label: string }[] = [
    { key: 'recent', label: copy.sortRecent },
    { key: 'helpful', label: copy.sortHelpful },
    { key: 'rating-desc', label: copy.sortRatingDesc },
    { key: 'rating-asc', label: copy.sortRatingAsc },
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-hairline pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="micro-label text-ink-subtle">{copy.sortLabel}</span>
          {sorts.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              aria-pressed={sort === option.key}
              className={cn(
                'micro-label transition-colors',
                sort === option.key ? 'text-ember' : 'text-ink-subtle hover:text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRating(null)}
            aria-pressed={rating === null}
            className={cn(
              'micro-label transition-colors',
              rating === null ? 'text-ember' : 'text-ink-subtle hover:text-ink',
            )}
          >
            {copy.showAll}
          </button>
          {available.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? null : star)}
              aria-pressed={rating === star}
              className={cn(
                'micro-label transition-colors',
                rating === star ? 'text-ember' : 'text-ink-subtle hover:text-ink',
              )}
              data-numeric
            >
              {star}★
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-small text-ink-muted">{copy.empty}</p>
      ) : (
        <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((review) => (
              <m.li
                key={review.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-hairline pt-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Stars value={review.rating} size={12} />
                    <h3 className="mt-3 text-[0.9375rem] font-medium text-ink">{review.title}</h3>
                  </div>
                  <time
                    dateTime={review.createdAt}
                    title={formatAbsoluteDate(review.createdAt, locale)}
                    className="micro-label shrink-0 text-ink-subtle"
                  >
                    {formatRelativeDate(review.createdAt, locale)}
                  </time>
                </div>

                <p className="mt-4 text-small leading-relaxed text-ink-muted">{review.body}</p>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="micro-label text-ink">{review.author}</span>
                  <span className="micro-label text-ink-subtle">{review.location}</span>
                  {review.size ? (
                    <span className="micro-label text-ink-subtle">
                      {copy.size} {review.size}
                    </span>
                  ) : null}
                  {review.verified ? (
                    <span className="micro-label flex items-center gap-1 text-ember">
                      <IconCheck className="size-3" />
                      {copy.verified}
                    </span>
                  ) : null}
                  <span className="micro-label text-ink-subtle" data-numeric>
                    {fmt(copy.helpful, { count: review.helpfulCount })}
                  </span>
                </div>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <p className="mt-10 flex justify-center">
        <DemoBadge label={locale === 'es' ? 'OPINIONES DE DEMOSTRACIÓN' : 'DEMO REVIEWS'} />
      </p>
    </div>
  );
}
