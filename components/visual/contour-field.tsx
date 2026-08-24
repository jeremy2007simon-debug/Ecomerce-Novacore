import { createRng, fx, valueNoise1D } from '@/lib/utils/prng';
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
  /** Vertices per ring. Higher = smoother, larger markup. */
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
  resolution = 120,
  amplitude = 0.19,
  origin = { x: 50, y: 62 },
  tone = 'neutral',
  className,
  'aria-hidden': ariaHidden = true,
}: ContourFieldProps) {
  const rng = createRng(`${seed}:contour`);
  const noise = valueNoise1D(`${seed}:noise`, 128);

  // Rings are spaced on a curve, not linearly: tight near the summit, opening
  // out toward the base. Even spacing is the giveaway of generated art.
  const paths: { d: string; opacity: number; width: number }[] = [];

  for (let r = 0; r < rings; r += 1) {
    const t = (r + 1) / rings;
    const radius = 6 + Math.pow(t, 1.42) * 78;

    // Each ring samples a different band of the noise field so adjacent
    // contours share a family resemblance without ever crossing.
    const bandOffset = r * 0.135;
    const bandAmp = amplitude * (0.35 + t * 0.85);
    const wobble = rng.float(0.86, 1.14);

    const points: string[] = [];
    for (let i = 0; i <= resolution; i += 1) {
      const angle = (i / resolution) * Math.PI * 2;
      const noiseAt = noise(bandOffset + (i / resolution) * 1.85);
      // Elongate slightly on X: a perfect circle reads as a target, an ellipse
      // reads as terrain seen in perspective.
      const rr = radius * (1 + noiseAt * bandAmp * wobble);
      const x = origin.x + Math.cos(angle) * rr * 1.24;
      const y = origin.y + Math.sin(angle) * rr * 0.72;
      points.push(`${fx(x)},${fx(y)}`);
    }

    paths.push({
      d: `M${points.join('L')}Z`,
      // Fade outward so the field dissolves into the background instead of
      // stopping at a hard edge.
      opacity: 0.5 * (1 - Math.pow(t, 1.7)) + 0.045,
      width: r % 5 === 0 ? 0.42 : 0.22,
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
