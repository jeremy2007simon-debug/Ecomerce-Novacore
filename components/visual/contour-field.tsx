import { createRng, fx } from '@/lib/utils/prng';
import { cn } from '@/lib/utils/cn';

/**
 * Seeded topographic contour field — Server Component, zero client JS.
 *
 * This single element is what makes the procedural art read as deliberate
 * cartography instead of "a gradient". Each ring is a closed path whose
 * vertices are displaced radially by 1D value noise, so the lines erode and
 * crowd the way real elevation contours do around a volcanic cone.
 *
 * Determinism matters here: the same `seed` must yield the same path data on
 * the server and in the browser, or hydration fails. All randomness routes
 * through createRng/valueNoise1D — never Math.random().
 */

export interface ContourFieldProps {
  seed: string;
  /** Number of concentric contour rings. */
  rings?: number;
  /**
   * Vertices per ring.
   *
   * Kept deliberately low. The displacement is a sum of low harmonics, so the
   * curve is smooth BY CONSTRUCTION and does not need dense sampling to look
   * smooth — unlike value noise, which is why the first version used 168.
   *
   * This matters more than it sounds: at 168 points across 26 rings the path
   * data alone was ~55 kB of inlined markup per field, and it was the single
   * largest contributor to a 121 kB HTML document on the product page.
   */
  resolution?: number;
  /** How strongly noise displaces each vertex, as a fraction of the radius. */
  amplitude?: number;
  /** Where the cone sits, in viewBox percentages. */
  origin?: { x: number; y: number };
  tone?: 'ember' | 'atlantic' | 'neutral';
  className?: string;
  'aria-hidden'?: boolean;
}

const TONE_STROKE: Record<NonNullable<ContourFieldProps['tone']>, string> = {
  ember: 'oklch(0.6618 0.1523 47.8)',
  atlantic: 'oklch(0.5924 0.0812 219.4)',
  neutral: 'oklch(0.8619 0.0119 79.2)',
};

export function ContourField({
  seed,
  rings = 26,
  resolution = 64,
  amplitude = 0.075,
  origin = { x: 50, y: 62 },
  tone = 'neutral',
  className,
  'aria-hidden': ariaHidden = true,
}: ContourFieldProps) {
  const rng = createRng(`${seed}:contour`);

  /*
    Displacement is a sum of low harmonics, not value noise.

    Value noise sampled around a ring has two problems that both showed up on
    screen: the sample rate has to be high enough to look organic, which makes
    the line zigzag rather than curve, and the start and end of the ring land on
    different noise values, so every contour has a visible seam. A short
    harmonic series is periodic by construction — it closes seamlessly — and is
    smooth by construction, which is what makes these read as surveyed elevation
    rather than as a scribble.
  */
  const HARMONICS = 4;
  const harmonics = Array.from({ length: HARMONICS }, (_, k) => ({
    // Amplitude falls off with frequency: the shape is dominated by the first
    // one or two harmonics, with the rest adding just enough irregularity.
    amplitude: rng.float(0.5, 1) / Math.pow(k + 1.7, 1.5),
    phase: rng.float(0, Math.PI * 2),
    // Non-integer-free frequencies would break periodicity, so these stay whole.
    frequency: k + 2,
  }));

  const paths: { d: string; opacity: number; width: number }[] = [];

  for (let r = 0; r < rings; r += 1) {
    const t = (r + 1) / rings;
    const radius = 7 + Math.pow(t, 1.38) * 76;

    // Each ring rotates the harmonic phases a little, so contours drift against
    // one another the way real terrain does instead of sitting concentric.
    const drift = r * 0.16;
    const bandAmp = amplitude * (0.45 + t * 0.75);

    const points: string[] = [];
    for (let i = 0; i <= resolution; i += 1) {
      const angle = (i / resolution) * Math.PI * 2;

      let displacement = 0;
      for (const h of harmonics) {
        displacement += h.amplitude * Math.sin(h.frequency * angle + h.phase + drift);
      }

      const rr = radius * (1 + displacement * bandAmp);
      // Elongated on X and flattened on Y: a circle reads as a target, an
      // ellipse reads as terrain seen in perspective.
      const x = origin.x + Math.cos(angle) * rr * 1.28;
      const y = origin.y + Math.sin(angle) * rr * 0.66;
      // One decimal place: at these path lengths the extra precision is
      // invisible and costs roughly a third of the markup.
      points.push(`${fx(x, 1)},${fx(y, 1)}`);
    }

    paths.push({
      d: `M${points.join('L')}Z`,
      // Fade outward so the field dissolves rather than stopping at an edge.
      opacity: 0.42 * (1 - Math.pow(t, 1.8)) + 0.03,
      // Every fifth ring is an index contour, as on a real map.
      width: r % 5 === 0 ? 0.4 : 0.2,
    });
  }

  return (
    <svg
      className={cn('h-full w-full', className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden={ariaHidden}
      focusable="false"
    >
      <defs>
        {/* Radial mask keeps the contours from touching the frame edge. */}
        <radialGradient id={`cf-fade-${seed}`} cx={`${origin.x}%`} cy={`${origin.y}%`} r="72%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="58%" stopColor="white" stopOpacity="0.75" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`cf-mask-${seed}`}>
          <rect width="100" height="100" fill={`url(#cf-fade-${seed})`} />
        </mask>
      </defs>

      <g mask={`url(#cf-mask-${seed})`} stroke={TONE_STROKE[tone]} vectorEffect="non-scaling-stroke">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            strokeWidth={p.width}
            strokeOpacity={p.opacity}
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  );
}
