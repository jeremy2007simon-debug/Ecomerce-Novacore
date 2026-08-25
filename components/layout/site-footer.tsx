import Link from 'next/link';
import { AtlanticMonogram } from '@/components/visual/atlantic-mark';
import { NewsletterForm } from './newsletter-form';
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
 * Every link here goes somewhere real. Ten differently-labelled links used to
 * resolve to `/story` — a page that says nothing about shipping, returns,
 * sizing, contact or the legal terms. Six of them now have pages; materials
 * and sustainability point at the sections of the story that cover them.
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
    shop: string;
    about: string;
    help: string;
    legal: string;
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
      title: copy.about,
      links: [
        { label: copy.links.story, href: routes.story(locale) },
        // Materials and sustainability are sections of the story, not pages of
        // their own — the material coda and the "making" chapter. They now
        // link to those sections rather than to the top of `/story`.
        { label: copy.links.materials, href: routes.storyAnchor(locale, 'materials') },
        { label: copy.links.sustainability, href: routes.storyAnchor(locale, 'making') },
      ],
    },
    {
      title: copy.help,
      links: [
        { label: copy.links.shipping, href: routes.shipping(locale) },
        { label: copy.links.returns, href: routes.returns(locale) },
        { label: copy.links.sizeGuide, href: routes.sizeGuide(locale) },
        { label: copy.links.contact, href: routes.contact(locale) },
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
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
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

        <div className="flex items-center gap-6">
          <Link
            href={routes.terms(locale)}
            prefetch={false}
            className="micro-label text-ink-subtle hover:text-ink"
          >
            {copy.links.terms}
          </Link>
          <Link
            href={routes.privacy(locale)}
            prefetch={false}
            className="micro-label text-ink-subtle hover:text-ink"
          >
            {copy.links.privacy}
          </Link>
          {/* The single NovaCore mention on the entire storefront. */}
          <p className="micro-label text-ink-subtle">{copy.novacore}</p>
        </div>
      </div>
    </footer>
  );
}
