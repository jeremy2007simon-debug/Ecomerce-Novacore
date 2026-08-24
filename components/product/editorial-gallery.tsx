import { ProductVisual } from '@/components/visual/product-visual';
import { Rule } from '@/components/ui/rule';
import type { ProductMedia } from '@/types/visual';

/**
 * Horizontal editorial gallery.
 *
 * CSS scroll-snap, zero JavaScript. A carousel library would add 12kB to
 * reimplement momentum that the browser already does better — and native
 * scrolling keeps the trackpad, the scrollbar, keyboard arrows and VoiceOver
 * gestures all working, none of which a custom carousel gets for free.
 *
 * `data-scroll-snap` lets the reduced-motion block in motion.css disable
 * snapping, which can be disorienting for the people that setting exists for.
 */
export function EditorialGallery({ media, label }: { media: ProductMedia[]; label: string }) {
  if (media.length === 0) return null;

  return (
    <section aria-label={label} className="py-[--spacing-section]">
      <div className="editorial">
        <Rule label={label} className="mb-10" />
      </div>

      <div
        data-scroll-snap
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[--spacing-gutter] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {media.map((item, i) => (
          <figure
            key={i}
            className="w-[min(84vw,34rem)] shrink-0 snap-center first:snap-start last:snap-end"
          >
            <ProductVisual media={item} slot="gallery" />
            <figcaption className="micro-label mt-3 text-ink-subtle" data-numeric>
              {String(i + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
