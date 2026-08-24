/** Constrain `value` to the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Map `value` from [inMin, inMax] onto [outMin, outMax], clamped at both ends. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** Inclusive integer range, e.g. range(3) → [0, 1, 2]. */
export function range(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}
