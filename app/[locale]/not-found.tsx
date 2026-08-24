import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ContourField } from '@/components/visual/contour-field';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { DEFAULT_LOCALE } from '@/types/i18n';
import { routes } from '@/lib/utils/routes';

/**
 * 404.
 *
 * A not-found render cannot read route params, so it falls back to the default
 * locale. Both links are still valid routes in either language.
 */
export default async function NotFound() {
  const t = await getServerDictionary(DEFAULT_LOCALE);

  return (
    <main id="main" className="relative isolate flex min-h-[86svh] items-center overflow-clip">
      <ContourField
        seed="not-found"
        tone="ember"
        rings={28}
        origin={{ x: 68, y: 40 }}
        className="absolute inset-0 -z-10 opacity-35"
      />

      <div className="editorial">
        <p className="text-hero font-medium leading-none text-ink" data-numeric>
          {t.notFound.code}
        </p>
        <h1 className="text-title mt-8 font-medium text-ink">{t.notFound.title}</h1>
        <p className="reading mt-4 text-body text-ink-muted">{t.notFound.body}</p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button as={Link} href={routes.collection(DEFAULT_LOCALE)} variant="solid">
            {t.notFound.cta}
          </Button>
          <Button as={Link} href={routes.home(DEFAULT_LOCALE)} variant="outline">
            {t.notFound.home}
          </Button>
        </div>
      </div>
    </main>
  );
}
