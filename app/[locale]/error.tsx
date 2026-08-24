'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContourField } from '@/components/visual/contour-field';
import { useLocale } from '@/lib/i18n/locale-provider';

/**
 * Route-level error boundary.
 *
 * Keeps the brand rather than dropping to a stack trace, and offers `reset()`
 * — which re-renders the segment without a full reload, so an error in one
 * section does not cost the visitor their cart or their scroll position.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    // The digest is what maps this to a server log entry in production.
    console.error('[atlantic] route error', error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main" className="relative isolate flex min-h-[80svh] items-center overflow-clip">
      <ContourField seed="error" rings={22} className="absolute inset-0 -z-10 opacity-25" />
      <div className="editorial">
        <h1 className="text-title font-medium text-ink">{t.error.title}</h1>
        <p className="reading mt-4 text-body text-ink-muted">{t.error.body}</p>
        <Button onClick={reset} variant="outline" className="mt-10">
          {t.error.retry}
        </Button>
      </div>
    </main>
  );
}
