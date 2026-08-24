import { notFound } from 'next/navigation';
import { isLocale } from '@/types/i18n';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="editorial py-32">dashboard</main>;
}
