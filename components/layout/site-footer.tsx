import Link from 'next/link';
import { AtlanticMonogram } from '@/components/visual/atlantic-mark';
import { NewsletterForm } from './newsletter-form';
import { LocaleSwitcher } from './locale-switcher';
import { Rule } from '@/components/ui/rule';
import { routes } from '@/lib/utils/routes';
import type { Locale } from '@/types/i18n';

/**
 * Footer. Server Component.
 *
 * NovaCore appears exactly once, at the very bottom, as a single line of
 * small type. The brief is explicit about this and it is also simply correct:
 * the demo only works as a sales asset if Atlantic Supply reads as a real
 * company, and a real company does not carry its agency's logo on every page.
 *
 * Every link here goes somewhere real. Discover replaces the old About column
 * — same destinations (story, materials, sustainability), renamed, plus
 * Lookbook marked "soon" rather than pointing anywhere fabricated (there is no
 * lookbook page yet — that is Phase 7). Legal deliberately carries only Terms
 * and Privacy: the dictionary's `links.cookies` stays declared-but-unused
 * rather than linking to a `#cookies` anchor that does not exist on the
 * Privacy page, or duplicating the Privacy link outright.
 */
export function SiteFooter({
  locale,
  copy,
}: {
  locale: Locale;
  copy: {
    newsletterTitle: string;
    newsletterBody: string;
    newsletterPlaceholder: string;
    newsletterCta: string;
    newsletterDemo: string;
    newsletterInfoLabel: string;
    newsletterLoading: string;
    soon: string;
    shop: string;
    discover: string;
    help: string;
    legal: string;
    language: string;
    country: string;
    countryValue: string;
    rights: string;
    novacore: string;
    links: Record<string, string>;
  };
}) {
  const columns = [
    {
      title: copy.shop,
      links: [
        { label: copy.links.allProducts, href: routes.collection(locale) },
        { label: copy.links.outerwear, href: routes.collectionFiltered(locale, 'collection=outerwear') },
        { label: copy.links.essentials, href: routes.collectionFiltered(locale, 'collection=essentials') },
        { label: copy.links.accessories, href: routes.collectionFiltered(locale, 'collection=accessories') },
      ],
    },
    {
      title: copy.discover,
      links: [
        { label: copy.links.story, href: routes.story(locale) },
        // Materials and sustainability are sections of the story, not pages of
        // their own — the material coda and the "making" chapter.
        { label: copy.links.materials, href: routes.storyAnchor(locale, 'materials') },
        { label: copy.links.sustainability, href: routes.storyAnchor(locale, 'making') },
      ],
      soon: [{ label: copy.links.lookbook }],
    },
    {
      title: copy.help,
      links: [
        { label: copy.links.shipping, href: routes.shipping(locale) },
        { label: copy.links.returns, href: routes.returns(locale) },
        { label: copy.links.sizeGuide, href: routes.sizeGuide(locale) },
        { label: copy.links.contact, href: routes.contact(locale) },
        { label: copy.links.trackOrder, href: routes.trackOrder(locale) },
      ],
    },
    {
      title: copy.legal,
      links: [
        { label: copy.links.terms, href: routes.terms(locale) },
        { label: copy.links.privacy, href: routes.privacy(locale) },
      ],
    },
  ];

  return (
    <footer className="editorial border-t border-hairline pt-(--spacing-section) pb-10">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
        {/* Newsletter — clearly labelled as a demo form. */}
        <div className="max-w-sm">
          <h2 className="text-title font-medium text-ink">{copy.newsletterTitle}</h2>
          <p className="mt-3 text-small text-ink-muted">{copy.newsletterBody}</p>

          <NewsletterForm
            copy={{
              placeholder: copy.newsletterPlaceholder,
              cta: copy.newsletterCta,
              demo: copy.newsletterDemo,
              infoLabel: copy.newsletterInfoLabel,
              loading: copy.newsletterLoading,
            }}
          />

          <div className="mt-10 flex items-center gap-6 border-t border-hairline pt-6">
            <div>
              <p className="micro-label text-ink-subtle">{copy.language}</p>
              <LocaleSwitcher className="mt-1.5" />
            </div>
            <div>
              <p className="micro-label text-ink-subtle">{copy.country}</p>
              <p className="mt-1.5 text-small text-ink-muted">{copy.countryValue}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <Rule label={column.title} className="mb-5" />
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      // Footer links are low-intent. Next prefetches every link
                      // in the viewport by default, and the footer is in the
                      // viewport on every page — that was ~144 kB of RSC
                      // payloads competing with the LCP image for bandwidth.
                      prefetch={false}
                      className="text-small text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {column.soon?.map((item) => (
                  <li key={item.label} className="inline-flex items-center gap-2 text-small text-ink-subtle">
                    {item.label}
                    <span className="micro-label rounded-pill border border-hairline px-1.5 py-0.5">{copy.soon}</span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-6 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AtlanticMonogram className="size-5 text-ink-subtle" />
          <p className="micro-label text-ink-subtle">
            © 2026 Atlantic Supply. {copy.rights}
          </p>
        </div>

        {/* The single NovaCore mention on the entire storefront. */}
        <p className="micro-label text-ink-subtle">{copy.novacore}</p>
      </div>
    </footer>
  );
}
