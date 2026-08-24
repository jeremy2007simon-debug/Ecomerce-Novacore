import { cn } from '@/lib/utils/cn';
import { createRng, fx, valueNoise1D } from '@/lib/utils/prng';
import type { PaletteKey, ProceduralMedia } from '@/types/visual';
import { formGeometry } from './product-forms';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PROCEDURAL ART — the branch that guarantees no image can ever be broken.
 *
 * Server Component: renders to SVG in the RSC payload, zero client JS, fully
 * deterministic from the seed so server and client markup are identical.
 *
 * THE GOVERNING RULE: this art shares a set with the photography.
 *
 * The backdrop is always the same warm grey concrete sweep, lit from upper-left
 * at 35° with a soft contact shadow — the same set the product photographs were
 * shot on. Only the GARMENT takes the colorway tint, exactly as a real shoot
 * works: you do not repaint the studio when you change the sample.
 *
 * An earlier version tinted the whole field per colorway. It produced glowing
 * coloured boxes that looked nothing like the photographs sitting next to them,
 * which is the single fastest way to make a catalogue look assembled rather
 * than art-directed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The shared set. Sampled from the actual photography, not invented. */
const SET = {
  wallTop: 'oklch(0.4142 0.0102 82)',
  wallBottom: 'oklch(0.3018 0.0088 78)',
  floor: 'oklch(0.3452 0.0094 80)',
  horizon: 'oklch(0.2604 0.0072 76)',
};

/** Garment tints. Muted on purpose — nothing here is more saturated than cloth. */
const GARMENT: Record<PaletteKey, { base: string; shadow: string; light: string }> = {
  basalt: {
    base: 'oklch(0.2312 0.0092 248)',
    shadow: 'oklch(0.1584 0.0064 250)',
    light: 'oklch(0.3308 0.0112 246)',
  },
  ember: {
    base: 'oklch(0.4482 0.0932 42)',
    shadow: 'oklch(0.3126 0.0684 38)',
    light: 'oklch(0.5618 0.1084 46)',
  },
  atlantic: {
    base: 'oklch(0.3624 0.0512 224)',
    shadow: 'oklch(0.2508 0.0374 228)',
    light: 'oklch(0.4712 0.0596 220)',
  },
  sail: {
    base: 'oklch(0.8194 0.0142 84)',
    shadow: 'oklch(0.6842 0.0148 80)',
    light: 'oklch(0.9182 0.0102 86)',
  },
  moss: {
    base: 'oklch(0.3908 0.0324 138)',
    shadow: 'oklch(0.2764 0.0248 140)',
    light: 'oklch(0.4914 0.0378 134)',
  },
  sand: {
    base: 'oklch(0.7248 0.0288 78)',
    shadow: 'oklch(0.5806 0.0284 74)',
    light: 'oklch(0.8402 0.0224 82)',
  },
};

/* ── PRODUCT VARIANT ────────────────────────────────────────────────────────── */

function ProductComposition({ media }: { media: ProceduralMedia }) {
  const { seed, form, palette } = media;
  const geometry = formGeometry(form);
  const rng = createRng(`${seed}:art`);
  const tint = GARMENT[palette];
  const uid = seed.replace(/[^a-zA-Z0-9]/g, '');

  // Seeded, but within a narrow band — the set barely moves between shots,
  // because a photographer does not rebuild the lighting for every sample.
  const horizonY = fx(rng.float(196, 206));
  const lampX = fx(rng.float(26, 38));

  return (
    <svg
      viewBox="0 0 200 250"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={media.alt}
      focusable="false"
    >
      <defs>
        {/* The wall: a soft sweep, brightest around the key light. */}
        <radialGradient id={`w-${uid}`} cx={`${lampX}%`} cy="22%" r="98%">
          <stop offset="0%" stopColor={SET.wallTop} />
          <stop offset="62%" stopColor={SET.wallBottom} />
          <stop offset="100%" stopColor={SET.horizon} />
        </radialGradient>

        <linearGradient id={`fl-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={SET.horizon} />
          <stop offset="100%" stopColor={SET.floor} />
        </linearGradient>

        {/* Garment: key from upper-left, falling into shadow lower-right. */}
        <linearGradient id={`g-${uid}`} x1="16%" y1="4%" x2="88%" y2="98%">
          <stop offset="0%" stopColor={tint.light} />
          <stop offset="38%" stopColor={tint.base} />
          <stop offset="100%" stopColor={tint.shadow} />
        </linearGradient>

        {/* Parts behind the torso are further from the key light, so they run
            one step darker across the whole ramp. */}
        <linearGradient id={`gb-${uid}`} x1="16%" y1="4%" x2="88%" y2="98%">
          <stop offset="0%" stopColor={tint.base} />
          <stop offset="46%" stopColor={tint.shadow} />
          <stop offset="100%" stopColor={tint.shadow} stopOpacity="0.78" />
        </linearGradient>

        {/* Contact shadow. A shadow, never a glow. */}
        <radialGradient id={`s-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.10 0 0)" stopOpacity="0.62" />
          <stop offset="62%" stopColor="oklch(0.10 0 0)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="oklch(0.10 0 0)" stopOpacity="0" />
        </radialGradient>

        {/* Cast shadow on the wall, thrown down-right by the key light. */}
        <filter id={`cs-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        <radialGradient id={`v-${uid}`} cx="50%" cy="42%" r="76%">
          <stop offset="52%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="oklch(0.09 0 0)" stopOpacity="0.46" />
        </radialGradient>
      </defs>

      {/* SET */}
      <rect width="200" height="250" fill={`url(#w-${uid})`} />
      <rect y={horizonY} width="200" height={250 - Number(horizonY)} fill={`url(#fl-${uid})`} />
      <line
        x1="0"
        y1={horizonY}
        x2="200"
        y2={horizonY}
        stroke="oklch(0.22 0 0)"
        strokeOpacity="0.34"
        strokeWidth="0.6"
      />

      {/* Cast shadow — offset down-right, consistent with the key light. */}
      <g filter={`url(#cs-${uid})`} opacity="0.34">
        <path d={geometry.body} fill="oklch(0.12 0 0)" transform="translate(11 8) skewX(-4)" />
      </g>

      {/* Contact shadow at the base. */}
      <ellipse cx="103" cy={Number(horizonY) + 12} rx="52" ry="8" fill={`url(#s-${uid})`} />

      {/*
        GARMENT — scaled to 88% about the frame centre so it sits in the frame
        with air around it, matching how the photography is composed. A
        silhouette that fills its box reads as an icon, not as a photograph.
      */}
      <g transform="translate(100 128) scale(0.88) translate(-100 -128)">
        {/* Behind: hoods, sleeves, straps. Opaque, one step darker. */}
        {geometry.behind?.map((d, i) => (
          <path key={`b${i}`} d={d} fill={`url(#gb-${uid})`} />
        ))}

        <path d={geometry.body} fill={`url(#g-${uid})`} />

        {/* In front: pockets, yokes, ribs. */}
        {geometry.panels?.map((d, i) => (
          <path key={`p${i}`} d={d} fill={tint.shadow} fillOpacity="0.3" />
        ))}

        {/* One specular sliver, upper-left facing. Restraint is the whole point. */}
        {geometry.specular ? (
          <path
            d={geometry.specular}
            fill="none"
            stroke={tint.light}
            strokeOpacity="0.42"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ) : null}

        {/* Construction hairlines: zips, seams, closures. */}
        {geometry.detail?.map((d, i) => (
          <path
            key={`d${i}`}
            d={d}
            fill="none"
            stroke="oklch(0.08 0 0)"
            strokeOpacity="0.36"
            strokeWidth="0.55"
            strokeLinecap="round"
          />
        ))}
      </g>

      <rect width="200" height="250" fill={`url(#v-${uid})`} />
    </svg>
  );
}

/* ── MATERIAL VARIANT ───────────────────────────────────────────────────────── */

/**
 * A macro of the fabric structure: warp threads displaced by value noise, with
 * a raking light across them.
 *
 * This is where generated art genuinely beats a mediocre photograph — a weave
 * at this scale is pure structure, so there is no uncanny valley to fall into.
 * It also solves the wide editorial frames, where a letterboxed silhouette
 * looked like a mistake.
 */
/**
 * Material macros stay dark whatever the colorway.
 *
 * A macro is a lighting study, and the light in this brand's world is low. Run
 * the pale colorways (sail, sand) at full value and you get what looks like
 * crumpled white paper glowing out of a black page — the one frame in the
 * gallery that breaks the mood. The colorway survives as a hue cast, not as a
 * brightness.
 */
const MATERIAL: Record<PaletteKey, { base: string; deep: string; thread: string }> = {
  basalt: { base: 'oklch(0.2184 0.0088 250)', deep: 'oklch(0.1284 0.0052 258)', thread: 'oklch(0.4618 0.0122 246)' },
  ember: { base: 'oklch(0.2724 0.0498 40)', deep: 'oklch(0.1462 0.0242 36)', thread: 'oklch(0.5384 0.0908 46)' },
  atlantic: { base: 'oklch(0.2418 0.0362 226)', deep: 'oklch(0.1392 0.0198 230)', thread: 'oklch(0.4906 0.0562 218)' },
  sail: { base: 'oklch(0.2508 0.0072 84)', deep: 'oklch(0.1436 0.0044 80)', thread: 'oklch(0.6284 0.0128 84)' },
  moss: { base: 'oklch(0.2462 0.0228 138)', deep: 'oklch(0.1408 0.0132 142)', thread: 'oklch(0.4682 0.0348 134)' },
  sand: { base: 'oklch(0.2596 0.0164 76)', deep: 'oklch(0.1472 0.0092 72)', thread: 'oklch(0.5768 0.0296 78)' },
};

function MaterialComposition({ media }: { media: ProceduralMedia }) {
  const { seed, palette } = media;
  const rng = createRng(`${seed}:material`);
  const noise = valueNoise1D(`${seed}:weave`, 96);
  const tint = MATERIAL[palette];
  const uid = seed.replace(/[^a-zA-Z0-9]/g, '');

  const threadCount = 58;
  const drift = rng.float(-6, 6);

  const threads: { d: string; opacity: number; width: number }[] = [];
  for (let i = 0; i < threadCount; i += 1) {
    const t = i / (threadCount - 1);
    const y = 4 + t * 142;
    const points: string[] = [];
    for (let x = 0; x <= 200; x += 8) {
      // Two noise bands: a slow undulation plus a fast weave crimp.
      const slow = noise(t * 0.9 + x / 900) * 5.5;
      const fast = Math.sin((x / 200) * Math.PI * 14 + i * 0.55) * 1.15;
      points.push(`${x},${fx(y + slow + fast + drift * t)}`);
    }
    threads.push({
      d: `M${points.join('L')}`,
      // Raking light: brighter toward the upper left, dying out lower right.
      opacity: 0.1 + (1 - t) * 0.3,
      width: i % 6 === 0 ? 1.15 : 0.62,
    });
  }

  return (
    <svg
      viewBox="0 0 200 150"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={media.alt}
      focusable="false"
    >
      <defs>
        <linearGradient id={`mb-${uid}`} x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor={tint.base} />
          <stop offset="58%" stopColor={tint.deep} />
          <stop offset="100%" stopColor="oklch(0.1082 0.004 262)" />
        </linearGradient>

        {/* Raking key light across the weave. */}
        <linearGradient id={`mk-${uid}`} x1="0%" y1="0%" x2="78%" y2="88%">
          <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.1" />
          <stop offset="44%" stopColor="oklch(1 0 0)" stopOpacity="0.015" />
          <stop offset="100%" stopColor="oklch(0 0 0)" stopOpacity="0.4" />
        </linearGradient>

        <radialGradient id={`mv-${uid}`} cx="42%" cy="34%" r="80%">
          <stop offset="46%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="oklch(0.08 0 0)" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <rect width="200" height="150" fill={`url(#mb-${uid})`} />

      <g stroke={tint.thread} fill="none" strokeLinecap="round">
        {threads.map((thread, i) => (
          <path
            key={i}
            d={thread.d}
            strokeOpacity={thread.opacity}
            strokeWidth={thread.width}
          />
        ))}
      </g>

      {/* Cross-weave: the perpendicular set, much fainter. */}
      <g stroke="oklch(0.08 0 0)" strokeOpacity="0.12" strokeWidth="0.5">
        {Array.from({ length: 34 }, (_, i) => (
          <line key={i} x1={i * 6} y1="0" x2={i * 6 - 8} y2="150" />
        ))}
      </g>

      <rect width="200" height="150" fill={`url(#mk-${uid})`} />
      <rect width="200" height="150" fill={`url(#mv-${uid})`} />
    </svg>
  );
}

export function ProceduralProductArt({
  media,
  className,
}: {
  media: ProceduralMedia;
  className?: string;
}) {
  return (
    <div className={cn('h-full w-full', className)}>
      {media.variant === 'material' ? (
        <MaterialComposition media={media} />
      ) : (
        <ProductComposition media={media} />
      )}
    </div>
  );
}
