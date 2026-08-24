'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { Button } from '@/components/ui/button';
import { DemoBadge } from '@/components/ui/demo-badge';
import { ContourField } from '@/components/visual/contour-field';
import { useLocale } from '@/lib/i18n/locale-provider';
import { routes } from '@/lib/utils/routes';

/**
 * ORDER CONFIRMED.
 *
 * The check draws itself with stroke-dashoffset rather than scaling in — a
 * drawn line reads as something being completed, where a popping tick reads as
 * a notification. It is one animation, once, and it is the only celebratory
 * moment on the entire site, which is what keeps it from feeling cheap.
 *
 * The DEMO badge is prominent here on purpose: a convincing confirmation screen
 * is exactly where someone might forget nothing was actually purchased.
 */
export function Confirmation({ orderId, email }: { orderId: string; email: string }) {
  const { t, locale, fmt } = useLocale();

  const rows = [
    { label: t.checkout.orderNumber, value: `#${orderId}` },
    { label: t.checkout.email, value: email },
    { label: t.checkout.deliveryMethod, value: `${t.checkout.express} · ${t.checkout.expressTime}` },
  ];

  return (
    <div className="relative isolate flex min-h-[70svh] flex-col items-center justify-center overflow-clip py-24 text-center">
      <ContourField
        seed="confirmed"
        tone="ember"
        rings={24}
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
      />

      <m.svg
        viewBox="0 0 64 64"
        className="size-16 text-ember"
        fill="none"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <m.circle
          cx="32"
          cy="32"
          r="29"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <m.path
          d="M20 33.5 L28.5 42 L44 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.34, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        />
      </m.svg>

      <m.h1
        className="text-headline mt-10 font-medium text-ink"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        {t.checkout.orderConfirmed}
      </m.h1>

      {/* Receipt rows stagger in beneath the headline. */}
      <dl className="mt-12 w-full max-w-sm">
        {rows.map((row, i) => (
          <m.div
            key={row.label}
            className="flex items-baseline justify-between gap-6 border-b border-hairline py-3.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 + i * 0.06, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <dt className="micro-label text-ink-subtle">{row.label}</dt>
            <dd className="text-small text-ink" data-numeric>
              {row.value}
            </dd>
          </m.div>
        ))}
      </dl>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.68, duration: 0.34 }}
        className="mt-10 flex flex-col items-center gap-6"
      >
        <p className="reading text-small text-ink-muted">
          {fmt(t.checkout.confirmationBody, { email })}
        </p>
        <DemoBadge tone="accent" label={locale === 'es' ? 'PEDIDO DE DEMOSTRACIÓN' : 'DEMO ORDER'} />
        <Button as={Link} href={routes.collection(locale)} variant="outline" className="mt-2">
          {t.checkout.continueShopping}
        </Button>
      </m.div>
    </div>
  );
}
