import { NOISE_TILE_URL } from '@/lib/utils/noise-tile';

/**
 * The page's one and only grain layer. Rendered once in the root layout, fixed
 * to the viewport, non-interactive.
 *
 * Grain is what stops large flat dark fields from banding on OLED phones and is
 * a large part of why the palette reads as film rather than as CSS. It must
 * stay a single fixed layer — see lib/utils/noise-tile.ts for why per-element
 * filters are forbidden.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.055] mix-blend-overlay"
      style={{
        backgroundImage: NOISE_TILE_URL,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}
