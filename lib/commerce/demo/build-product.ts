import { DEMO_PRODUCTS, type DemoColorway, type DemoProduct } from '@/data/products';
import { money } from '@/lib/utils/money';
import type {
  Product,
  ProductOption,
  Variant,
} from '@/types/commerce';
import type { Locale } from '@/types/i18n';
import type { ProductMedia } from '@/types/visual';

/**
 * Collapses a bilingual DemoProduct into a locale-resolved `Product`, expanding
 * colorway × size into the variant matrix.
 *
 * This is precisely what a Shopify adapter does when it normalises a product
 * node fetched with `@inContext(language: ES)` — same input concept, same
 * output type. Keeping the two symmetrical is what makes the provider
 * swappable.
 */

const SIZELESS_FORMS = new Set(['bag', 'cap', 'bottle']);

/** Deterministic media set for a product/colorway pair. */
function buildMedia(product: DemoProduct, colorway: DemoColorway, locale: Locale): ProductMedia {
  return {
    kind: 'procedural',
    seed: `${product.handle}:${colorway.key}`,
    form: product.form,
    palette: colorway.palette,
    aspect: '4/5',
    alt:
      locale === 'es'
        ? `${product.title} en color ${colorway.label.es}`
        : `${product.title} in ${colorway.label.en}`,
  };
}

/** The gallery: one frame per colorway plus two editorial crops. */
function buildGallery(product: DemoProduct, locale: Locale): ProductMedia[] {
  const primary = product.colorways.map((c) => buildMedia(product, c, locale));

  const editorial: ProductMedia[] = [
    {
      kind: 'procedural',
      seed: `${product.handle}:editorial-a`,
      form: product.form,
      palette: product.colorways[0]?.palette ?? 'basalt',
      aspect: '3/2',
      alt:
        locale === 'es'
          ? `${product.title} fotografiada en exterior`
          : `${product.title} photographed outdoors`,
    },
    {
      kind: 'procedural',
      seed: `${product.handle}:editorial-b`,
      form: product.form,
      palette: product.colorways[1]?.palette ?? 'sand',
      aspect: '4/5',
      alt:
        locale === 'es'
          ? `Detalle de material de ${product.title}`
          : `Material detail of ${product.title}`,
    },
  ];

  return [...primary, ...editorial];
}

function buildOptions(product: DemoProduct, locale: Locale): ProductOption[] {
  const options: ProductOption[] = [
    {
      id: `${product.id}-color`,
      name: 'color',
      label: locale === 'es' ? 'Color' : 'Colour',
      values: product.colorways.map((c) => ({
        value: c.key,
        label: c.label[locale],
        swatchHex: c.hex,
        available: c.available,
      })),
    },
  ];

  if (!SIZELESS_FORMS.has(product.form)) {
    options.push({
      id: `${product.id}-size`,
      name: 'size',
      label: locale === 'es' ? 'Talla' : 'Size',
      values: product.sizes.map((s) => ({
        value: s.value,
        label: s.value,
        available: s.available,
      })),
    });
  }

  return options;
}

function buildVariants(product: DemoProduct, locale: Locale): Variant[] {
  const variants: Variant[] = [];
  const sizeless = SIZELESS_FORMS.has(product.form);
  const sizes = sizeless ? [{ value: 'ONE', available: true, stock: 40 }] : product.sizes;

  for (const colorway of product.colorways) {
    for (const size of sizes) {
      const available = colorway.available && size.available;
      const title = sizeless ? colorway.label[locale] : `${colorway.label[locale]} / ${size.value}`;

      variants.push({
        id: `${product.id}-${colorway.key}-${size.value.toLowerCase()}`,
        sku: `${product.handle.toUpperCase().replace(/-/g, '')}-${colorway.key.toUpperCase().slice(0, 3)}-${size.value}`,
        title,
        availableForSale: available,
        quantityAvailable: available ? size.stock : 0,
        price: money(product.priceCents),
        compareAtPrice: product.compareAtCents ? money(product.compareAtCents) : null,
        selectedOptions: sizeless
          ? [{ name: 'color', value: colorway.key }]
          : [
              { name: 'color', value: colorway.key },
              { name: 'size', value: size.value },
            ],
        media: buildMedia(product, colorway, locale),
      });
    }
  }

  return variants;
}

export function buildProduct(source: DemoProduct, locale: Locale): Product {
  const variants = buildVariants(source, locale);
  const price = money(source.priceCents);

  return {
    id: source.id,
    handle: source.handle,
    title: source.title,
    subtitle: source.subtitle[locale],
    description: source.description[locale],
    vendor: source.vendor,
    tags: source.tags,
    collectionHandles: source.collectionHandles,
    availableForSale: variants.some((v) => v.availableForSale),
    priceRange: { min: price, max: price },
    options: buildOptions(source, locale),
    variants,
    media: buildGallery(source, locale),
    metafields: {
      material: source.material[locale],
      composition: source.composition[locale],
      weightGrams: source.weightGrams,
      origin: source.origin[locale],
      care: source.care[locale],
      story: source.story[locale],
      features: source.features[locale],
      specs: source.specs[locale],
      pairsWith: source.pairsWith,
      shipping: source.shipping[locale],
      returns: source.returns[locale],
    },
    rating: {
      value: source.rating.value,
      count: source.rating.count,
      distribution: source.rating.distribution,
    },
    seo: source.seo[locale],
  };
}

/** Featured rank, exposed for the "featured" sort and trending weights. */
export function featuredRankOf(handle: string): number {
  return DEMO_PRODUCTS.find((p) => p.handle === handle)?.featuredRank ?? 999;
}
