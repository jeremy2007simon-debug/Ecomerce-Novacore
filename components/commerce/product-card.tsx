import Link from 'next/link';
import { ProductVisual } from '@/components/visual/product-visual';
import { Price } from '@/components/commerce/price';
import { cn } from '@/lib/utils/cn';
import { routes } from '@/lib/utils/routes';
import type { Product } from '@/types/commerce';
import type { Locale } from '@/types/i18n';

/**
 * Collection card. Server Component — no client JS at all.
 *
 * Note what is absent: no rounded-2xl, no drop shadow, no hover-lift. The card
 * is not a card; it is an image with type beneath it. Separation comes from
 * space. The only hover affordance is a slow scale on the visual inside its
 * clipped frame, which reads as the photograph breathing rather than as a
 * component reacting.
 *
 * The colour swatches are rendered as real dots rather than as a count, because
 * "3 colours" is information a shopper has to act on, while three dots is
 * information they can absorb.
 */
export function ProductCard({
  product,
  locale,
  priority = false,
  index = 0,
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
  index?: number;
}) {
  const media = product.media[0];
  const colors = product.options.find((option) => option.name === 'color')?.values ?? [];
  const soldOut = !product.availableForSale;

  return (
    <article className="group relative">
      <Link
        href={routes.product(locale, product.handle)}
        className="block focus-visible:outline-none"
      >
        {/* Focus ring goes on the whole card, not just the text. */}
        <span className="absolute -inset-2 rounded-xs group-focus-visible:ring-2 group-focus-visible:ring-ember group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-void" />

        <div className="relative overflow-clip rounded-xs">
          {media ? (
            <div className="transition-transform duration-[900ms] ease-[--ease-out-expo] group-hover:scale-[1.035]">
              <ProductVisual media={media} slot="card" priority={priority} />
            </div>
          ) : null}

          {soldOut ? (
            <span className="micro-label absolute left-3 top-3 rounded-xs bg-void/80 px-2 py-1 text-ink">
              {locale === 'es' ? 'Agotado' : 'Sold out'}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          {/* One line, always. A wrapping eyebrow pushes the title down on some
              cards and not others, and the row instantly stops looking set. */}
          <p className="micro-label truncate text-ink-subtle">
            {String(index + 1).padStart(2, '0')} · {product.metafields.material}
          </p>
          <h3 className="text-[1.0625rem] font-medium leading-tight tracking-[-0.02em] text-ink">
            {product.title}
          </h3>
          <p className="text-small text-ink-muted">{product.subtitle}</p>
          <Price value={product.priceRange.min} locale={locale} className="mt-1.5" />
        </div>
      </Link>

      {colors.length > 1 ? (
        <ul className="mt-3 flex items-center gap-1.5" aria-label={locale === 'es' ? 'Colores' : 'Colours'}>
          {colors.map((color) => (
            <li key={color.value}>
              <span
                title={color.label}
                className={cn(
                  'block size-[9px] rounded-pill ring-1 ring-inset ring-white/20',
                  !color.available && 'opacity-30',
                )}
                style={{ backgroundColor: color.swatchHex }}
              />
              <span className="sr-only">{color.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
