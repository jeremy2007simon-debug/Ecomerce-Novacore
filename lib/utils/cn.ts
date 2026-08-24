import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * tailwind-merge MUST be taught this project's theme scales.
 *
 * Out of the box it does not know that `text-display` is a font size and
 * `text-ink` is a colour — it only sees two `text-*` classes, decides they
 * conflict, and keeps the last one. The symptom is subtle and easy to ship:
 *
 *     cn('text-display font-medium text-ink')   →   'font-medium text-ink'
 *
 * i.e. the heading silently loses its font size and renders at body scale.
 * That is exactly what happened to the product page h1 and to the scene
 * headings, and it looks like a CSS bug rather than a class-merging one.
 *
 * Registering the custom scales here fixes it globally. Any NEW token added to
 * styles/theme.css under --text-* or --color-* must be added below too.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const FONT_SIZES = [
  'hero',
  'display',
  'headline',
  'title',
  'subtitle',
  'body',
  'small',
  'label',
  'micro',
] as const;

const COLORS = [
  // Ramp
  'void',
  'abyss',
  'basalt',
  'slate',
  'ash',
  'stone',
  'mist',
  'sand',
  'bone',
  'paper',
  // Accents
  'ember',
  'ember-deep',
  'atlantic',
  'atlantic-deep',
  // Semantic
  'surface',
  'surface-raised',
  'surface-inset',
  'ink',
  'ink-muted',
  'ink-subtle',
  'hairline',
  'hairline-strong',
  'accent',
  'positive',
  'negative',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...FONT_SIZES] }],
      'text-color': [{ text: [...COLORS] }],
      'bg-color': [{ bg: [...COLORS] }],
      'border-color': [{ border: [...COLORS] }],
      'ring-color': [{ ring: [...COLORS] }],
    },
  },
});

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
