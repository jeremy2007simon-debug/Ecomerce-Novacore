'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { setAnalyticsContext, track } from '@/lib/analytics';
import type { Locale } from '@/types/i18n';

/**
 * Keeps the analytics ambient context in step with the route, and emits a
 * page_view on each navigation.
 *
 * Without this every event is stamped with the default path, which makes the
 * dashboard's event stream far less convincing — the whole point of that panel
 * is that a visitor recognises their own journey in it.
 *
 * Renders nothing.
 */
export function AnalyticsContextSync({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    setAnalyticsContext({ locale, path: pathname });
    track({ name: 'page_view', payload: { path: pathname, locale } });
  }, [pathname, locale]);

  return null;
}
