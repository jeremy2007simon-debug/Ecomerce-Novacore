import { ImageResponse } from 'next/og';
import { getServerDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale } from '@/types/i18n';

/**
 * Social card, generated at build time.
 *
 * Deliberately typographic rather than photographic: the card is most often
 * seen at thumbnail size in a feed, where a product photo becomes an
 * indistinct dark rectangle but a wordmark on black stays legible.
 *
 * No custom font is loaded — ImageResponse would have to fetch and embed the
 * woff2 for every card, and the system sans renders this layout perfectly well.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Atlantic Supply';

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : 'es';
  const t = await getServerDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A0B0D',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Ember rim light, echoing the site's own lighting. */}
        <div
          style={{
            position: 'absolute',
            top: -260,
            right: -160,
            width: 760,
            height: 760,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(200,92,42,0.22) 0%, rgba(10,11,13,0) 68%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 10,
              height: 10,
              background: '#C85C2A',
              borderRadius: 999,
              display: 'flex',
            }}
          />
          <span
            style={{
              color: '#8B8F96',
              fontSize: 22,
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}
          >
            Atlantic Supply
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: '#F7F4EE',
              fontSize: 92,
              lineHeight: 1,
              letterSpacing: -3.5,
              fontWeight: 600,
              maxWidth: 940,
            }}
          >
            {t.meta.tagline}
          </span>
          <span style={{ color: '#8B8F96', fontSize: 26, marginTop: 32, letterSpacing: 4 }}>
            28.2916° N · TENERIFE
          </span>
        </div>
      </div>
    ),
    size,
  );
}
