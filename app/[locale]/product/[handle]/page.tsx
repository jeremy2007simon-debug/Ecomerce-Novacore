import { notFound } from 'next/navigation';
import { commerce } from '@/lib/commerce';
import { isLocale, LOCALES } from '@/types/i18n';

export const dynamicParams = false;

export async function generateStaticParams() {
  const handles = await commerce.getAllHandles();
  return LOCALES.flatMap((locale) => handles.map((handle) => ({ locale, handle })));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();

  const product = await commerce.getProduct(handle, { locale });
  if (!product) notFound();

  return (
    <main id="main" className="editorial py-32">
      <h1 className="text-display">{product.title}</h1>
    </main>
  );
}
