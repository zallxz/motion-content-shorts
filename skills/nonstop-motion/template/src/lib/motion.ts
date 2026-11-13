import { Easing, interpolate } from "remotion";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.out(Easing.back(1.8));

/** 0→1 progress between start and start+len, clamped, eased. */
export const prog = (f: number, start: number, len: number, easing = EASE_OUT) =>
  interpolate(f, [start, start + Math.max(1, len)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth pseudo-noise from summed sines — deterministic, render-safe. */
export const wobble = (f: number, seed = 0, speed = 1) =>
  Math.sin(f * 0.045 * speed + seed * 1.7) * 0.6 + Math.sin(f * 0.021 * speed + seed * 4.1) * 0.4;

/** Exponentially decaying impulse (camera kicks, impacts). */
export const kick = (f: number, at: number, len = 10) => {
  const d = f - at;
  if (d < 0 || d > len) return 0;
  return Math.exp(-d / (len / 3.2)) * (1 - d / len);
};
