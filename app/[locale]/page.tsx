import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { AtlanticLockup } from '@/components/visual/atlantic-mark';
import { ContourField } from '@/components/visual/contour-field';
import { GradientField } from '@/components/visual/gradient-field';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getServerDictionary(locale);

  return (
    <main id="main" className="relative isolate min-h-[100svh] overflow-clip">
      <GradientField seed="hero" tone="ember" />
      <ContourField seed="hero" className="absolute inset-0 opacity-40" tone="ember" />
      <div className="editorial relative flex min-h-[100svh] flex-col justify-center gap-8">
        <AtlanticLockup />
        <Eyebrow index="01">{t.home.hero.eyebrow}</Eyebrow>
        <h1 className="text-hero font-medium">
          {t.home.hero.titleTop} <br /> {t.home.hero.titleBottom}
        </h1>
        <p className="text-subtitle text-ink-muted">{t.home.hero.subtitle}</p>
        <div>
          <Button variant="outline">{t.home.hero.cta}</Button>
        </div>
      </div>
    </main>
  );
}
