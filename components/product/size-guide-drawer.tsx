'use client';

import { useId, useState } from 'react';
import { DemoBadge } from '@/components/ui/demo-badge';
import { Overlay } from '@/components/ui/overlay';
import { DocumentNotes, DocumentTable } from '@/components/layout/document-page';
import { IconClose } from '@/components/visual/icons';
import { useLocale } from '@/lib/i18n/locale-provider';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SIZE GUIDE DRAWER.
 *
 * The "Size guide" control on the product page used to be a full navigation
 * to `/size-guide` — correct, but it takes the shopper off the page they were
 * trying to buy from. This opens the same measurements in place, over the
 * product, using the same `Overlay` primitive as the cart and search (bottom
 * placement: a sheet reads better than a right-hand drawer for a wide table).
 *
 * The table and copy are the exact `t.pages.sizeGuide` object that already
 * renders the standalone page — passed down as a prop from the server-rendered
 * product page, since this is a client component and the size-guide copy
 * lives in the server dictionary slice. One source of measurements, shown two
 * ways; the standalone page still exists for the footer link, SEO and anyone
 * without JavaScript.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SizeGuideCopy = {
  eyebrow: string;
  title: string;
  tableLabel: string;
  columns: readonly string[];
  rows: readonly { size: string; chest: string; waist: string; length: string; sleeve: string }[];
  howToLabel: string;
  howTo: readonly string[];
  note: string;
  estimator: {
    title: string;
    body: string;
    height: string;
    weight: string;
    cta: string;
    result: string;
    demo: string;
  };
  /**
   * `trade-pant` is the one product measured by numeric waist rather than
   * letter size — a second, real table, not a reinterpretation of the
   * letter one. Everything else (how-to, note, estimator) is shared.
   */
  tradePant: {
    tableLabel: string;
    columns: readonly string[];
    rows: readonly { size: string; waist: string; hip: string; inseam: string }[];
  };
};

/**
 * A demo heuristic, not a real fit algorithm — height decides the band, and a
 * build noticeably heavier or lighter than that band's rough baseline nudges
 * it one size either way. Good enough to demonstrate the feature; nowhere
 * close to what a real size-recommendation system would use.
 */
const HEIGHT_BANDS: { maxCm: number; size: string }[] = [
  { maxCm: 165, size: 'XS' },
  { maxCm: 172, size: 'S' },
  { maxCm: 180, size: 'M' },
  { maxCm: 188, size: 'L' },
  { maxCm: 195, size: 'XL' },
  { maxCm: Infinity, size: 'XXL' },
];

function estimateSize(heightCm: number, weightKg: number): string {
  const bandIndex = Math.max(
    0,
    HEIGHT_BANDS.findIndex((band) => heightCm <= band.maxCm),
  );
  const typicalWeight = 50 + heightCm * 0.35;
  const delta = weightKg - typicalWeight;
  const nudge = delta > 12 ? 1 : delta < -12 ? -1 : 0;
  const index = Math.min(HEIGHT_BANDS.length - 1, Math.max(0, bandIndex + nudge));
  return HEIGHT_BANDS[index]!.size;
}

export function SizeGuideDrawer({
  open,
  onClose,
  copy,
  formKey = 'apparel',
}: {
  open: boolean;
  onClose: () => void;
  copy: SizeGuideCopy;
  /** Which real table to show — letter sizes (default) or trade-pant's numeric waist. */
  formKey?: 'apparel' | 'trade-pant';
}) {
  const { t, fmt } = useLocale();
  const heightId = useId();
  const weightId = useId();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const canEstimate = Number(height) > 0 && Number(weight) > 0;
  const isTradePant = formKey === 'trade-pant';

  return (
    <Overlay open={open} onClose={onClose} placement="bottom" label={copy.title}>
      <header className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
        <h2 className="label text-ink">{copy.title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
          aria-label={t.common.close}
        >
          <IconClose />
        </button>
      </header>

      <div className="grow overflow-y-auto overscroll-contain px-5 py-6">
        {isTradePant ? (
          <DocumentTable
            caption={copy.tradePant.tableLabel}
            columns={copy.tradePant.columns}
            rows={copy.tradePant.rows.map((row) => [row.size, row.waist, row.hip, row.inseam])}
          />
        ) : (
          <DocumentTable
            caption={copy.tableLabel}
            columns={copy.columns}
            rows={copy.rows.map((row) => [row.size, row.chest, row.waist, row.length, row.sleeve])}
          />
        )}
        <p className="reading mt-6 text-small text-ink-subtle">{copy.note}</p>

        <p className="micro-label mt-10 mb-4 text-ink-subtle">{copy.howToLabel}</p>
        <DocumentNotes items={copy.howTo} />

        {/* DEMO ESTIMATOR — a toy heuristic, clearly labelled as such. */}
        <div className="mt-10 border-t border-hairline pt-8">
          <p className="label flex items-center gap-2.5 text-ink">
            {copy.estimator.title}
            <DemoBadge tone="accent" />
          </p>
          <p className="reading mt-2 text-small text-ink-muted">{copy.estimator.body}</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!canEstimate) return;
              setResult(estimateSize(Number(height), Number(weight)));
            }}
            className="mt-5 grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col">
              <label htmlFor={heightId} className="micro-label mb-2 text-ink-subtle">
                {copy.estimator.height}
              </label>
              <input
                id={heightId}
                type="number"
                inputMode="numeric"
                min={100}
                max={230}
                value={height}
                onChange={(event) => {
                  setHeight(event.target.value);
                  setResult(null);
                }}
                className="w-full border-b border-hairline-strong bg-transparent pb-2 text-body text-ink outline-none focus:border-ink"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor={weightId} className="micro-label mb-2 text-ink-subtle">
                {copy.estimator.weight}
              </label>
              <input
                id={weightId}
                type="number"
                inputMode="numeric"
                min={30}
                max={200}
                value={weight}
                onChange={(event) => {
                  setWeight(event.target.value);
                  setResult(null);
                }}
                className="w-full border-b border-hairline-strong bg-transparent pb-2 text-body text-ink outline-none focus:border-ink"
              />
            </div>

            <button
              type="submit"
              disabled={!canEstimate}
              className="label col-span-2 mt-2 h-11 border border-hairline-strong text-ink transition-colors hover:border-mist disabled:pointer-events-none disabled:opacity-40"
            >
              {copy.estimator.cta}
            </button>
          </form>

          {result ? (
            <p className="reading mt-5 text-body text-ink" role="status" data-numeric>
              {fmt(copy.estimator.result, { size: result })}
            </p>
          ) : null}

          <p className="micro-label mt-4 text-ink-subtle">{copy.estimator.demo}</p>
        </div>
      </div>
    </Overlay>
  );
}
