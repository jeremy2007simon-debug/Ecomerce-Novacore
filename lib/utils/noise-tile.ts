/**
 * A single 128×128 fractal-noise tile, serialized once as a data URI and tiled
 * with background-repeat.
 *
 * Why a tile and not `filter: url(#noise)` on the elements that need grain: a
 * live SVG filter over a large area is one of the most expensive things you can
 * ask iOS Safari to composite, and it is re-evaluated on every paint. A
 * rasterised tile is effectively free, and at 5% opacity nobody can tell the
 * difference. The whole page gets exactly ONE fixed grain layer (GrainOverlay),
 * never a per-card filter.
 */
const TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="128" height="128" filter="url(#n)" opacity="0.55"/></svg>`;

/** `url("data:…")`, ready to drop into a background-image declaration. */
export const NOISE_TILE_URL = `url("data:image/svg+xml,${encodeURIComponent(TILE_SVG)}")`;
