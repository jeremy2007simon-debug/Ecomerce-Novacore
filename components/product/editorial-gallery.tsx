import { ProductVisual } from '@/components/visual/product-visual';
import { Rule } from '@/components/ui/rule';
import type { MediaAspect, ProductMedia } from '@/types/visual';

/**
 * Horizontal editorial gallery.
 *
 * CSS scroll-snap, zero JavaScript. A carousel library would add 12kB to
 * reimplement momentum that the browser already does better — and native
 * scrolling keeps the trackpad, the scrollbar, keyboard arrows and VoiceOver
 * gestures all working, none of which a custom carousel gets for free.
 *
 * ── ONE HEIGHT, VARYING WIDTHS ──────────────────────────────────────────────
 *
 * Every frame in the row shares a height; the width comes from each frame's own
 * aspect ratio. That is how an editorial spread actually works: a landscape
 * crop among portraits is WIDER, never shorter.
 *
 * Previously each visual applied its own `aspect-*` class at a shared width, so
 * the single 3/2 material study rendered at 218px beside 409px neighbours on a
 * phone (363 vs 680 on desktop) and its caption floated ~300px above the rest.
 * Measured on all eight products at every viewport.
 *
 * The height is derived, not hardcoded: `--gal-w` is the portrait width the row
 * was always designed around, and `--gal-h` is that width at 4:5. Each figure
 * then takes `--gal-h` and multiplies by its own ratio for width. No magic
 * numbers, and portrait frames keep exactly the size they have today.
 *
 * `data-scroll-snap` lets the reduced-motion block in motion.css disable
 * snapping, which can be disorienting for the people that setting exists for.
 */

/** Width-to-height ratio per supported aspect. */
const RATIO: Record<MediaAspect, number> = {
  '1/1': 1,
  '4/5': 0.8,
  '3/4': 0.75,
  '3/2': 1.5,
  '16/9': 16 / 9,
};

export function EditorialGallery({ media, label }: { media: ProductMedia[]; label: string }) {
  if (media.length === 0) return null;

  return (
    <section aria-label={label} className="py-(--spacing-section)">
      <div className="editorial">
        <Rule label={label} className="mb-10" />
      </div>

      <div
        data-scroll-snap
        style={{
          // The portrait width the row is designed around, and the shared row
          // height derived from it at 4:5.
          ['--gal-w' as string]: 'min(84vw, 34rem)',
          ['--gal-h' as string]: 'calc(var(--gal-w) * 5 / 4)',
        }}
        className={[
          'flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain',
          // `edge`, not `gutter`: this row is full-bleed but its Rule above
          // lives inside `.editorial`, which stops growing at 82rem. A plain
          // gutter left the first frame ~300px left of the Rule past 1456px.
          // `edge` also carries the matching scroll-padding, so a snapped
          // frame keeps that margin instead of hitting the scrollport edge.
          'edge pb-4',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        ].join(' ')}
      >
        {media.map((item, i) => (
          <figure
            key={i}
            className="shrink-0 snap-start last:snap-end"
            style={{
              // Capped at the viewport so a landscape crop cannot become wider
              // than the screen: at 390px an uncapped 3/2 frame would be 613px
              // and could never be seen whole. Beyond the cap the visual simply
              // crops a little more (object-cover); the HEIGHT never changes,
              // which is what keeps the row aligned.
              width: `min(calc(var(--gal-h) * ${RATIO[item.aspect]}), 92vw)`,
            }}
          >
            <div className="h-(--gal-h)">
              <ProductVisual media={item} slot="gallery" fill />
            </div>
            <figcaption className="micro-label mt-3 text-ink-subtle" data-numeric>
              {String(i + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
