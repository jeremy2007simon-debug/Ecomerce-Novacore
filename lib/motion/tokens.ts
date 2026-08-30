/**
 * Mirrors styles/theme.css's --duration-* and --ease-* custom properties for
 * JS-side Motion/React consumers, which cannot read CSS custom properties
 * inside a `transition` object. Any change here MUST be mirrored in
 * styles/theme.css and vice versa — these are not independent sources.
 *
 * Flat exports, not a forced taxonomy: theme.css's own comment on the two
 * easings ("expo is the arrival curve for entrances; quint is the transit
 * curve for anything that leaves and returns") is the real grouping logic,
 * and it doesn't divide into four even categories — so this file names the
 * six durations and four easings directly rather than inventing buckets the
 * tokens don't actually have.
 */

export const DURATION_INSTANT = 0.12;
export const DURATION_FAST = 0.22;
export const DURATION_BASE = 0.38;
export const DURATION_SLOW = 0.62;
export const DURATION_SCENE = 0.9;
export const DURATION_REVEAL = 0.54;

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1] as const;
export const EASE_OUT_BACK = [0.34, 1.42, 0.64, 1] as const;
