/**
 * Deterministic pseudo-randomness.
 *
 * Every procedural visual on this site is generated from a string seed rather
 * than Math.random(). This is not a stylistic preference — the art is rendered
 * inside Server Components, so server and client MUST produce byte-identical
 * SVG. A single Math.random() call would make them disagree, React 19 would
 * discard and re-render the whole subtree, and the hero's entrance animation
 * would visibly replay. ESLint bans Math.random() for exactly this reason.
 */

/** FNV-1a. Maps an arbitrary seed string to a 32-bit unsigned integer. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough distribution for visual work. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convenience: a seeded generator straight from a string. */
export function seeded(seed: string): () => number {
  return mulberry32(hashSeed(seed));
}

export interface Rng {
  /** Uniform float in [min, max). */
  float(min: number, max: number): number;
  /** Uniform integer in [min, max]. */
  int(min: number, max: number): number;
  /** Pick one element. Returns undefined only for an empty array. */
  pick<T>(items: readonly T[]): T | undefined;
  /** True with probability p. */
  chance(p: number): boolean;
}

export function createRng(seed: string): Rng {
  const next = seeded(seed);
  return {
    float: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (p) => next() < p,
  };
}

/**
 * 1D value noise with cubic smoothstep interpolation. Used to displace contour
 * vertices so the topographic lines read as eroded terrain rather than as
 * concentric circles — that difference is most of why the art looks designed
 * instead of generated.
 */
export function valueNoise1D(seed: string, samples = 256): (t: number) => number {
  const next = seeded(seed);
  const table = Array.from({ length: samples }, () => next() * 2 - 1);

  return function sample(t: number): number {
    const scaled = t * samples;
    const i = Math.floor(scaled);
    const frac = scaled - i;
    const a = table[((i % samples) + samples) % samples] ?? 0;
    const b = table[(((i + 1) % samples) + samples) % samples] ?? 0;
    const smooth = frac * frac * (3 - 2 * frac);
    return a + (b - a) * smooth;
  };
}

/** Trim a float for SVG path output — shorter markup, smaller RSC payload. */
export function fx(n: number, precision = 2): string {
  return Number(n.toFixed(precision)).toString();
}
