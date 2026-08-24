import { notFound } from 'next/navigation';
import { ProductVisual } from '@/components/visual/product-visual';
import { commerce } from '@/lib/commerce';
import { isLocale } from '@/types/i18n';

/** TEMPORARY sandbox — deleted before the final build. */
export default async function SandboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { nodes } = await commerce.getProducts({ collection: 'all' }, { locale });

  return (
    <main id="main" className="editorial py-20">
      <h1 className="text-title mb-10">Visual sandbox</h1>
      {nodes.map((product) => (
        <section key={product.handle} className="mb-16">
          <p className="label mb-4 text-ink-subtle">
            {product.title} — {product.media.length} media
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {product.media.map((media, i) => (
              <div key={i}>
                <ProductVisual media={media} slot="card" />
                <p className="micro-label mt-2 text-ink-subtle">{media.kind}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
