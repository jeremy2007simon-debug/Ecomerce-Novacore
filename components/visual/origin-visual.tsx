import { createRng, fx, valueNoise1D } from '@/lib/utils/prng';
import { cn } from '@/lib/utils/cn';

/**
 * Scene 01 — ORIGIN.
 *
 * An abstract volcanic profile: a cone silhouette built from noise-displaced
 * ridgelines, sitting under a contour field, with the ocean implied by a set of
 * horizontal strata below it.
 *
 * Server Component, deterministic, zero client JS. It is drawn rather than
 * photographed on purpose — a literal photo of Teide would tip the brand into
 * tourism, which the brief explicitly rules out. This reads as survey data.
 */
export function OriginVisual({ className, seed = 'origin' }: { className?: string; seed?: string }) {
  const rng = createRng(`${seed}:relief`);
  const noise = valueNoise1D(`${seed}:ridge`, 128);

  // Ridgelines: each is the same cone, sampled a little further down the noise
  // field, so they nest the way real terrain profiles do.
  const ridges: { d: string; opacity: number }[] = [];
  const ridgeCount = 9;

  for (let r = 0; r < ridgeCount; r += 1) {
    const t = r / (ridgeCount - 1);
    const baseY = 62 + t * 26;
    const peakHeight = 40 - t * 21;
    const jitter = rng.float(0.85, 1.15);

    const points: string[] = [`M-4 ${fx(baseY + 6)}`];
    for (let x = -4; x <= 204; x += 9) {
      const nx = x / 200;
      // A cone profile: a raised cosine, sharpened by an exponent.
      const cone = Math.pow(Math.max(0, Math.cos((nx - 0.46) * Math.PI * 1.42)), 2.1);
      const detail = noise(t * 1.7 + nx * 2.6) * 3.4 * jitter;
      const y = baseY - cone * peakHeight + detail;
      points.push(`L${x} ${fx(y, 1)}`);
    }
    points.push(`L204 ${fx(baseY + 6)}`, 'L204 130', 'L-4 130', 'Z');

    ridges.push({
      d: points.join(''),
      opacity: 0.1 + t * 0.5,
    });
  }

  // Ocean strata: horizontal bands, tightening toward the horizon.
  const strata = Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    return {
      y: 92 + Math.pow(t, 1.6) * 36,
      opacity: 0.16 * (1 - t) + 0.02,
      dash: `${fx(rng.float(6, 40))} ${fx(rng.float(4, 22))}`,
    };
  });

  return (
    <svg
      viewBox="0 0 200 130"
      className={cn('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.0942 0.0042 264)" />
          <stop offset="52%" stopColor="oklch(0.1382 0.0088 258)" />
          <stop offset="100%" stopColor="oklch(0.1082 0.0062 262)" />
        </linearGradient>

        {/* The one warm element: a low ember glow behind the cone, as though
            the light is coming from inside the island rather than the sky. */}
        <radialGradient id={`glow-${seed}`} cx="46%" cy="52%" r="42%">
          <stop offset="0%" stopColor="oklch(0.6618 0.1523 47.8)" stopOpacity="0.2" />
          <stop offset="70%" stopColor="oklch(0.5487 0.1428 43.2)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`ridge-${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.2408 0.0102 254)" />
          <stop offset="100%" stopColor="oklch(0.1182 0.0052 262)" />
        </linearGradient>
      </defs>

      <rect width="200" height="130" fill={`url(#sky-${seed})`} />
      <ellipse cx="92" cy="66" rx="86" ry="40" fill={`url(#glow-${seed})`} />

      {ridges.map((ridge, i) => (
        <path key={i} d={ridge.d} fill={`url(#ridge-${seed})`} fillOpacity={ridge.opacity} />
      ))}

      {/* Ridge crest hairlines — the survey-drawing quality. */}
      {ridges.slice(0, 5).map((ridge, i) => (
        <path
          key={`c${i}`}
          d={ridge.d}
          fill="none"
          stroke="oklch(0.8619 0.0119 79.2)"
          strokeOpacity={0.09 - i * 0.014}
          strokeWidth="0.3"
        />
      ))}

      <g stroke="oklch(0.5924 0.0812 219.4)" strokeWidth="0.35">
        {strata.map((band, i) => (
          <line
            key={i}
            x1="-4"
            y1={fx(band.y)}
            x2="204"
            y2={fx(band.y)}
            strokeOpacity={band.opacity}
            strokeDasharray={band.dash}
          />
        ))}
      </g>
    </svg>
  );
}
