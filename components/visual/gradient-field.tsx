import { createRng, fx } from '@/lib/utils/prng';
import { cn } from '@/lib/utils/cn';

/**
 * The base layer of the five-layer material stack: three to four overlapping
 * radial gradients in OKLCH, combined with blend modes.
 *
 * The thing this exists to avoid is `bg-gradient-to-br from-x to-y`. A two-stop
 * linear gradient is the single most recognisable "template" signal there is.
 * Overlapping radials at different scales, screened together over a near-black
 * base, produce a field with actual depth — light that appears to come from
 * somewhere rather than to slide across the box.
 */

export type FieldTone = 'basalt' | 'ember' | 'atlantic' | 'sand' | 'abyss';

interface Lamp {
  color: string;
  /** Relative luminance of this lamp — drives its alpha. */
  intensity: number;
}

const TONES: Record<FieldTone, { base: string; lamps: Lamp[]; blend: string }> = {
  basalt: {
    base: 'oklch(0.1183 0.0058 264.53)',
    lamps: [
      { color: 'oklch(0.42 0.0224 258)', intensity: 0.55 },
      { color: 'oklch(0.3 0.0186 240)', intensity: 0.42 },
      { color: 'oklch(0.55 0.0182 84)', intensity: 0.16 },
    ],
    blend: 'screen',
  },
  ember: {
    base: 'oklch(0.1183 0.0088 40)',
    lamps: [
      { color: 'oklch(0.6618 0.1523 47.8)', intensity: 0.34 },
      { color: 'oklch(0.4487 0.1128 33)', intensity: 0.46 },
      { color: 'oklch(0.34 0.032 262)', intensity: 0.5 },
    ],
    blend: 'screen',
  },
  atlantic: {
    base: 'oklch(0.1254 0.0102 234)',
    lamps: [
      { color: 'oklch(0.5924 0.0812 219.4)', intensity: 0.4 },
      { color: 'oklch(0.3518 0.0604 228)', intensity: 0.52 },
      { color: 'oklch(0.62 0.0242 70)', intensity: 0.14 },
    ],
    blend: 'screen',
  },
  sand: {
    base: 'oklch(0.9481 0.0092 84.6)',
    lamps: [
      { color: 'oklch(0.8619 0.0119 79.2)', intensity: 0.72 },
      { color: 'oklch(0.9762 0.0058 88)', intensity: 0.85 },
      { color: 'oklch(0.78 0.0182 62)', intensity: 0.3 },
    ],
    blend: 'multiply',
  },
  abyss: {
    base: 'oklch(0.0942 0.0042 264)',
    lamps: [
      { color: 'oklch(0.28 0.014 250)', intensity: 0.48 },
      { color: 'oklch(0.2 0.0102 262)', intensity: 0.6 },
    ],
    blend: 'screen',
  },
};

export function GradientField({
  seed,
  tone = 'basalt',
  className,
}: {
  seed: string;
  tone?: FieldTone;
  className?: string;
}) {
  const rng = createRng(`${seed}:field`);
  const config = TONES[tone];

  // Lamp positions are seeded, so a given product/scene always lights the same
  // way, but no two seeds light alike.
  const layers = config.lamps.map((lamp, i) => {
    const x = rng.float(i === 0 ? 12 : 0, i === 0 ? 52 : 100);
    const y = rng.float(i === 0 ? 4 : 10, i === 0 ? 44 : 96);
    const spread = rng.float(46, 92);
    const alpha = lamp.intensity;
    return `radial-gradient(${fx(spread)}% ${fx(spread * rng.float(0.72, 1.06))}% at ${fx(x)}% ${fx(y)}%, color-mix(in oklch, ${lamp.color} ${fx(alpha * 100, 1)}%, transparent) 0%, transparent 68%)`;
  });

  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0', className)}
      style={{
        backgroundColor: config.base,
        backgroundImage: layers.join(','),
        backgroundBlendMode: config.lamps.map(() => config.blend).join(','),
      }}
    />
  );
}
