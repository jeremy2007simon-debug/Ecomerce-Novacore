'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContourField } from '@/components/visual/contour-field';
import { useLocale } from '@/lib/i18n/locale-provider';

/**
 * Collection-scoped error boundary — overrides the generic root
 * `app/[locale]/error.tsx` for this route only, so a real provider failure
 * reads as "we couldn't load the collection" rather than the site-wide
 * "something broke". Distinct from `EmptyState`'s "no products match your
 * filters" — that's a successful response with zero results, this is a
 * failed request. Same `reset()` pattern as the root boundary.
 */
export default function CollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error('[atlantic] collection route error', error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main" className="relative isolate flex min-h-[60svh] items-center overflow-clip pt-28 lg:pt-36">
      <ContourField seed="collection-error" rings={22} className="absolute inset-0 -z-10 opacity-25" />
      <div className="editorial">
        <h1 className="text-title font-medium text-ink">{t.collectionError.title}</h1>
        <p className="reading mt-4 text-body text-ink-muted">{t.collectionError.body}</p>
        <Button onClick={reset} variant="outline" className="mt-10">
          {t.error.retry}
        </Button>
      </div>
    </main>
  );
}
