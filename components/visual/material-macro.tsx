import { createRng, fx, valueNoise1D } from '@/lib/utils/prng';
import { cn } from '@/lib/utils/cn';

/**
 * Scene 03 — a macro of the three-layer membrane, seen edge-on.
 *
 * Three bonded strata with different structures: a woven face, a microporous
 * membrane, and a knitted backer. Drawn rather than photographed because at
 * this magnification the subject is pure structure, so there is no uncanny
 * valley — and a real macro photograph of a membrane looks, unhelpfully, like
 * grey fog.
 */
export function MaterialMacro({ className, seed = 'membrane' }: { className?: string; seed?: string }) {
  const rng = createRng(`${seed}:macro`);
  const noise = valueNoise1D(`${seed}:fibre`, 128);

  // Face fabric: dense diagonal weave.
  const face = Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    const y = 6 + t * 26;
    const points: string[] = [];
    for (let x = 0; x <= 200; x += 12) {
      points.push(`${x},${fx(y + noise(t * 1.2 + x / 700) * 1.9 + Math.sin(x / 6 + i) * 0.5, 1)}`);
    }
    return { d: `M${points.join('L')}`, opacity: 0.16 + (1 - t) * 0.3 };
  });

  // Membrane: irregular micropores, not a grid.
  const pores = Array.from({ length: 90 }, () => ({
    cx: rng.float(0, 200),
    cy: rng.float(40, 72),
    r: rng.float(0.35, 1.5),
    o: rng.float(0.06, 0.3),
  }));

  // Backer: knitted loops.
  const loops = Array.from({ length: 14 }, (_, i) => {
    const y = 82 + (i % 2) * 5;
    return Array.from({ length: 14 }, (_, j) => ({
      cx: j * 15 + (i % 2 ? 7 : 0),
      cy: y + Math.floor(i / 2) * 9,
    }));
  }).flat();

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
        <linearGradient id={`mm-${seed}`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.2708 0.0102 250)" />
          <stop offset="46%" stopColor="oklch(0.1682 0.0068 258)" />
          <stop offset="100%" stopColor="oklch(0.1128 0.0048 262)" />
        </linearGradient>
        <linearGradient id={`key-${seed}`} x1="0%" y1="0%" x2="72%" y2="92%">
          <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.14" />
          <stop offset="52%" stopColor="oklch(1 0 0)" stopOpacity="0.01" />
          <stop offset="100%" stopColor="oklch(0 0 0)" stopOpacity="0.42" />
        </linearGradient>
      </defs>

      <rect width="200" height="130" fill={`url(#mm-${seed})`} />

      {/* Layer 1 — woven face */}
      <g stroke="oklch(0.7226 0.0074 250)" strokeWidth="0.42" fill="none">
        {face.map((line, i) => (
          <path key={i} d={line.d} strokeOpacity={line.opacity} />
        ))}
      </g>

      {/* Bond lines between strata */}
      <line x1="0" y1="36" x2="200" y2="36" stroke="oklch(0.6618 0.1523 47.8)" strokeOpacity="0.3" strokeWidth="0.5" />
      <line x1="0" y1="76" x2="200" y2="76" stroke="oklch(0.6618 0.1523 47.8)" strokeOpacity="0.18" strokeWidth="0.5" />

      {/* Layer 2 — microporous membrane */}
      <g fill="oklch(0.8619 0.0119 79.2)">
        {pores.map((pore, i) => (
          <circle key={i} cx={fx(pore.cx, 1)} cy={fx(pore.cy, 1)} r={fx(pore.r, 1)} fillOpacity={fx(pore.o, 2)} />
        ))}
      </g>

      {/* Layer 3 — knitted backer */}
      <g stroke="oklch(0.5595 0.0083 254)" strokeOpacity="0.24" strokeWidth="0.4" fill="none">
        {loops.map((loop, i) => (
          <ellipse key={i} cx={loop.cx} cy={loop.cy} rx="3.4" ry="2.4" />
        ))}
      </g>

      <rect width="200" height="130" fill={`url(#key-${seed})`} />
    </svg>
  );
}
