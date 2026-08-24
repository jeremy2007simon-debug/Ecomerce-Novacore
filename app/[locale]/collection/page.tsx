import { notFound } from 'next/navigation';
import { commerce } from '@/lib/commerce';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { formatMoney } from '@/lib/utils/money';
import { isLocale } from '@/types/i18n';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getServerDictionary(locale);
  const { nodes } = await commerce.getProducts({ collection: 'all' }, { locale });

  return (
    <main id="main" className="editorial py-32">
      <h1 className="text-display mb-16">{t.collection.title}</h1>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((product) => (
          <li key={product.handle} className="rule-t pt-5">
            <p className="label text-ink-subtle">{product.handle}</p>
            <h2 className="text-title mt-2">{product.title}</h2>
            <p className="mt-1 text-small text-ink-muted">{product.subtitle}</p>
            <p className="mt-3 text-small" data-numeric>
              {formatMoney(product.priceRange.min, locale)}
            </p>
            <p className="micro-label mt-2 text-ink-subtle">
              {product.variants.length} variants · {product.rating.value} ★ ({product.rating.count})
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
