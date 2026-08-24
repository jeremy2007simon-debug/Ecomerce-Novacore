import type { ProductForm } from '@/types/visual';

/**
 * Product silhouettes, drawn on a shared 200×250 grid (4:5).
 *
 * Every form follows the same lighting model — key from upper-left at roughly
 * 35°, one specular sliver, one contact shadow — because consistency of light
 * direction across a set is most of what makes it read as art-directed rather
 * than as clip art assembled from different sources.
 *
 * Fills reference CSS custom properties (--pv-base / --pv-accent) rather than
 * literal colours, so a colorway change is a variable write on the shell and
 * costs neither a re-render nor a new asset.
 */

export interface FormGeometry {
  /**
   * Parts that sit BEHIND the torso — hoods, sleeves, straps. Drawn first and
   * fully opaque in a slightly darker tone, because they are further from the
   * key light. Rendering these translucent (the first attempt) made the body
   * show through the sleeves, which instantly reads as a flat vector drawing
   * rather than a lit object.
   */
  behind?: string[];
  /** The torso — the main silhouette. */
  body: string;
  /** Parts ON TOP of the torso: pockets, yokes, ribs. Subtle, low opacity. */
  panels?: string[];
  /** The specular highlight, one stroke, upper-left facing. */
  specular?: string;
  /** Hairline construction detail: zips, stitching, closures. */
  detail?: string[];
}

export const PRODUCT_FORMS: Record<ProductForm, FormGeometry> = {
  shell: {
    // Torso only. Sleeves are drawn as their own shapes below — trying to
    // encode a hanging sleeve in the same closed path is what produced stubby
    // tabs floating beside the body in the first version.
    body:
      'M100 52c-14 0-24 3-29 5l-24 10c-5 2-8 7-8 12v135c0 5 4 9 9 9h104c5 0 9-4 9-9V79c0-5-3-10-8-12l-24-10c-5-2-15-5-29-5z',
    behind: [
      // Hood: a collar that rises behind the neck, not a balloon above it
      'M74 62c0-14 11-24 26-24s26 10 26 24c0 8-4 13-11 15-5 2-10 2-15 2s-10 0-15-2c-7-2-11-7-11-15z',
      // Left sleeve: shoulder to cuff, tapering, hanging past the hem
      'M47 67c-8 3-13 8-15 15l-12 78c-1 6 2 10 8 11l14 2c6 1 10-2 11-8l8-72z',
      // Right sleeve
      'M153 67c8 3 13 8 15 15l12 78c1 6-2 10-8 11l-14 2c-6 1-10-2-11-8l-8-72z',
    ],
    panels: [
      // Shoulder yoke seam
      'M43 84c15-6 35-9 57-9s42 3 57 9l1 9c-15-7-35-10-58-10s-43 3-58 10z',
    ],
    specular: 'M63 84c-3 24-4 66-3 112',
    detail: [
      // Centre zip, running the full length
      'M100 62v148',
      // Hand-pocket openings, angled
      'M58 152l22-5M142 152l-22-5',
      // Hem drawcord channel
      'M43 196h114',
      // Cuff lines
      'M22 168h26M152 168h26',
    ],
  },

  overshirt: {
    body:
      'M100 40c-12 0-20 3-25 5l-22 9c-5 2-8 7-8 12v146c0 5 4 9 9 9h92c5 0 9-4 9-9V66c0-5-3-10-8-12l-22-9c-5-2-13-5-25-5z',
    behind: [
      // Camp collar
      'M72 38h56v18H72z',
      // Left sleeve
      'M53 54c-8 3-12 8-14 14l-11 74c-1 6 2 10 8 11l13 2c6 1 10-2 11-8l7-68z',
      // Right sleeve
      'M147 54c8 3 12 8 14 14l11 74c1 6-2 10-8 11l-13 2c-6 1-10-2-11-8l-7-68z',
    ],
    panels: [
      // Bellowed chest pockets
      'M58 100h32v28H58zM110 100h32v28h-32z',
    ],
    specular: 'M64 70c-2 22-3 62-2 102',
    detail: [
      'M100 64v148',
      'M58 100h32M110 100h32',
      // Button placket
      'M100 82h0M100 104h0M100 126h0M100 148h0',
      'M28 156h24M148 156h24',
    ],
  },

  tee: {
    body: 'M100 40c-11 0-18 2-23 4l-38 16c-5 2-7 6-6 11l9 34c1 5 5 7 10 6l11-3v96c0 5 4 8 9 8h76c5 0 9-3 9-8v-96l11 3c5 1 9-1 10-6l9-34c1-5-1-9-6-11l-38-16c-5-2-12-4-23-4z',
    panels: [
      // Ribbed collar
      'M79 40c5 8 12 12 21 12s16-4 21-12c-6-3-13-4-21-4s-15 1-21 4z',
    ],
    behind: [],
    specular: 'M66 74c-2 22-3 66-2 98',
    detail: ['M79 46h42'],
  },

  knit: {
    body:
      'M100 46c-11 0-19 2-24 4l-20 8c-5 2-8 7-8 12v134c0 5 4 9 9 9h86c5 0 9-4 9-9V70c0-5-3-10-8-12l-20-8c-5-2-13-4-24-4z',
    behind: [
      // Left sleeve, tapering to a ribbed cuff
      'M56 58c-8 3-12 8-14 14l-10 72c-1 6 2 10 8 11l13 2c6 1 10-2 11-8l6-66z',
      // Right sleeve
      'M144 58c8 3 12 8 14 14l10 72c1 6-2 10-8 11l-13 2c-6 1-10-2-11-8l-6-66z',
    ],
    panels: [
      // Crew neck rib
      'M78 46c5 10 13 15 22 15s17-5 22-15c-6-2-13-4-22-4s-16 2-22 4z',
      // Cuff ribs
      'M32 150h26v14H32zM142 150h26v14h-26z',
      // Waist rib
      'M48 190h104v13H48z',
    ],
    specular: 'M66 74c-2 22-3 62-2 104',
    detail: [
      // Knit wale lines
      'M74 66v122M88 64v124M112 64v124M126 66v122',
      'M48 190h104',
    ],
  },

  pant: {
    body: 'M62 34h76c4 0 7 3 7 7l6 42-8 133c0 4-3 6-7 6h-19c-4 0-6-2-7-6l-10-96-10 96c-1 4-3 6-7 6H64c-4 0-7-2-7-6L49 83l6-42c0-4 3-7 7-7z',
    behind: [
      // Waistband, sitting behind the leg panels
      'M55 34h90v18H55z',
    ],
    panels: [
      // Front pocket seams
      'M60 56c8 4 12 12 12 20M140 56c-8 4-12 12-12 20',
    ],
    specular: 'M74 62c-3 26-4 90-3 140',
    detail: ['M100 50v34', 'M55 50h90'],
  },

  bag: {
    body: 'M42 96c0-7 5-13 12-13h92c7 0 12 6 12 13v88c0 7-5 13-12 13H54c-7 0-12-6-12-13z',
    behind: [
      // Shoulder strap, looping up behind the body
      'M52 96c6-30 22-46 48-46s42 16 48 46l-9 2c-5-25-18-38-39-38s-34 13-39 38z',
    ],
    panels: [
      // Front pocket panel
      'M52 132h96v50H52z',
    ],
    specular: 'M58 106v70',
    detail: [
      // Zip line
      'M50 116h100',
      // Buckle
      'M88 66h24v10H88z',
    ],
  },

  cap: {
    body: 'M42 148c0-38 26-64 58-64s58 26 58 64c0 5-4 8-9 8H51c-5 0-9-3-9-8z',
    behind: [
      // Brim, projecting forward under the crown
      'M36 152h128c8 0 14 5 14 12s-6 12-14 12H36c-8 0-14-5-14-12s6-12 14-12z',
    ],
    specular: 'M66 126c6-16 18-26 34-28',
    detail: [
      // Panel seams
      'M100 84v72M70 92c-6 20-9 43-9 64M130 92c6 20 9 43 9 64',
    ],
  },

  bottle: {
    body: 'M76 74h48c5 0 8 4 8 9v129c0 6-4 10-10 10H78c-6 0-10-4-10-10V83c0-5 3-9 8-9z',
    behind: [
      // Screw cap
      'M80 42h40c4 0 6 3 6 6v26H74V48c0-3 2-6 6-6z',
    ],
    panels: [
      // Shoulder taper
      'M68 92h64v10H68z',
    ],
    specular: 'M84 96v112',
    detail: [
      // Cap knurling
      'M80 50v18M90 50v18M100 50v18M110 50v18M120 50v18',
    ],
  },
};

export function formGeometry(form: ProductForm): FormGeometry {
  return PRODUCT_FORMS[form];
}
