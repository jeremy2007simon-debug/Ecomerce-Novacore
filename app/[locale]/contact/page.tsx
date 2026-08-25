import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContactForm } from '@/components/layout/contact-form';
import { DocumentPage, DocumentSection } from '@/components/layout/document-page';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * CONTACT.
 *
 * The form is a declared demo: it never submits, never stores and says so on
 * the page, in the same voice as the newsletter form in the footer.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = (await getServerDictionary(locale)).pages.contact;

  return {
    title: page.title,
    description: page.intro,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { 'es-ES': '/es/contact', en: '/en/contact' },
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = (await getServerDictionary(locale)).pages.contact;

  return (
    <DocumentPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <DocumentSection label={page.channelsLabel}>
        <dl className="flex flex-col">
          {page.channels.map((channel) => (
            <div key={channel.label} className="border-b border-hairline py-6 first:pt-0 last:border-0">
              <dt className="micro-label text-ink-subtle">{channel.label}</dt>
              <dd className="mt-2 text-title font-medium text-ink">{channel.value}</dd>
              <dd className="mt-2 text-small text-ink-muted">{channel.detail}</dd>
            </div>
          ))}
        </dl>
      </DocumentSection>

      <DocumentSection label={page.formLabel}>
        <ContactForm
          copy={{
            name: page.name,
            email: page.email,
            message: page.message,
            send: page.send,
            demo: page.demo,
          }}
        />
      </DocumentSection>
    </DocumentPage>
  );
}
