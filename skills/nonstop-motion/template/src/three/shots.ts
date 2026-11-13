import { Easing } from "remotion";
import type { Beat, SetName, ShotName } from "../lib/types";

export type V3 = [number, number, number];
export type Cam = { pos: V3; target: V3; fov: number; roll: number };

/** World anchors — every set lives in the same scene, the camera just cuts between them. */
export const SETS: Record<Exclude<SetName, "auto">, { origin: V3; focus: V3; alt: V3 }> = {
  desk: { origin: [0, 0, 0], focus: [-0.45, 1.5, 0.15], alt: [0.55, 1.28, 0.2] }, // Blip / laptop screen
  rooftop: { origin: [-40, 0, 0], focus: [-40, 1.45, 0.6], alt: [-40, 5, -18] }, // Blip / skyline
  stage: { origin: [40, 0, 0], focus: [40, 1.35, 0], alt: [40, 2.6, -3] }, // podium / arch
};

const ease = Easing.bezier(0.45, 0, 0.25, 1); // cinematic in-out
const expoOut = Easing.out(Easing.exp);

/** Vertical 9:16 frames are narrow, so every distance is scaled up to keep subjects framed. */
export const PORTRAIT = 2.0;
const orbit = (F: V3, r0: number, yaw: number, pitch: number): V3 => {
  const r = r0 * PORTRAIT;
  return [F[0] + Math.sin(yaw) * Math.cos(pitch) * r, F[1] + Math.sin(pitch) * r, F[2] + Math.cos(yaw) * Math.cos(pitch) * r];
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Camera moves. p = 0→1 over the beat; s = random-ish sign so mirrored variants exist. */
export const SHOTS: Record<Exclude<ShotName, "auto">, (F: V3, p: number, s: number, alt: V3) => Cam> = {
  "push-in": (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, lerp(4.2, 2.6, e), s * lerp(0.35, 0.15, e), 0.12), target: F, fov: 36, roll: 0 };
  },
  "pull-out": (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, lerp(2.2, 5.2, e), s * lerp(0.1, 0.45, e), lerp(0.08, 0.25, e)), target: F, fov: 38, roll: 0 };
  },
  orbit: (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, 3.6, s * lerp(-0.7, 0.7, e), 0.2), target: F, fov: 38, roll: 0 };
  },
  "crane-up": (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, lerp(3.4, 4.8, e), s * 0.25, lerp(-0.05, 0.75, e)), target: add(F, [0, lerp(0, 0.6, e), 0]), fov: 40, roll: 0 };
  },
  "crane-down": (F, p, s) => {
    const e = expoOut(Math.min(1, p * 1.4));
    return { pos: orbit(F, lerp(6, 3.3, e), s * 0.2, lerp(1.1, 0.12, e)), target: F, fov: 38, roll: 0 };
  },
  "dutch-push": (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, lerp(3.2, 2.3, e), s * 0.4, 0.05), target: F, fov: 40, roll: s * lerp(0.12, 0.22, e) };
  },
  "snap-zoom": (F, p, s) => {
    const snap = expoOut(Math.min(1, p / 0.18));
    const drift = p * 0.25;
    return { pos: orbit(F, lerp(7, 2.4, snap) - drift, s * (0.12 + drift * 0.3), 0.1), target: F, fov: 30, roll: 0 };
  },
  whip: (F, p, s) => {
    const w = expoOut(Math.min(1, p / 0.22));
    return { pos: orbit(F, 3.2, s * lerp(1.8, 0.2, w) + s * p * 0.15, 0.14), target: F, fov: 40, roll: s * (1 - w) * 0.25 };
  },
  truck: (F, p, s) => {
    const e = ease(p);
    const x = s * lerp(-1.6, 1.6, e);
    return { pos: [F[0] + x * PORTRAIT, F[1] + 0.5, F[2] + 3.6 * PORTRAIT], target: [F[0] + x * 0.7, F[1], F[2]], fov: 38, roll: 0 };
  },
  "low-hero": (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, lerp(2.8, 2.1, e), s * lerp(0.4, 0.2, e), -0.42), target: add(F, [0, 0.15, 0]), fov: 46, roll: s * 0.04 };
  },
  "top-down": (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, 4.6, s * lerp(0, 0.6, e), 1.35), target: F, fov: 40, roll: 0 };
  },
  vertigo: (F, p, s) => {
    // dolly-zoom: camera moves back while lens narrows → subject size stays, world stretches
    const e = ease(p);
    const r = lerp(2.2, 6, e);
    const k = 2.2 * PORTRAIT * Math.tan(((58 / 2) * Math.PI) / 180);
    const fov = (2 * Math.atan(k / (r * PORTRAIT)) * 180) / Math.PI;
    return { pos: orbit(F, r, s * 0.18, 0.1), target: F, fov, roll: 0 };
  },
  spiral: (F, p, s) => {
    const e = ease(p);
    return { pos: orbit(F, lerp(5.2, 2.7, e), s * lerp(-0.2, 1.3, e), lerp(0.55, 0.1, e)), target: F, fov: 38, roll: 0 };
  },
  screen: (_F, p, s, alt) => {
    const e = ease(p);
    return { pos: orbit(alt, lerp(1.9, 1.05, e), s * lerp(0.25, 0.05, e), lerp(0.22, 0.12, e)), target: alt, fov: 42, roll: 0 };
  },
};

const BY_TYPE: Record<Beat["type"], { shots: Exclude<ShotName, "auto">[]; sets: Exclude<SetName, "auto">[] }> = {
  hook: { shots: ["snap-zoom", "crane-down", "whip"], sets: ["rooftop", "desk"] },
  statement: { shots: ["orbit", "truck", "spiral", "push-in", "low-hero"], sets: ["desk", "rooftop"] },
  dialog: { shots: ["push-in", "dutch-push", "low-hero", "whip"], sets: ["desk"] },
  ui: { shots: ["screen"], sets: ["desk"] },
  chat: { shots: ["dutch-push", "screen"], sets: ["desk"] },
  stat: { shots: ["vertigo", "top-down", "spiral"], sets: ["stage"] },
  list: { shots: ["truck", "orbit"], sets: ["stage"] },
  compare: { shots: ["orbit", "truck"], sets: ["stage"] },
  punch: { shots: ["whip", "dutch-push", "snap-zoom"], sets: ["stage"] },
  cta: { shots: ["pull-out", "crane-up"], sets: ["rooftop"] },
};

export type Planned = { shot: Exclude<ShotName, "auto">; set: Exclude<SetName, "auto">; sign: number };

/** Choose a shot + set per beat: fits the beat type, never repeats the previous shot, alternates direction. */
export const planShots = (beats: Beat[]): Planned[] => {
  const out: Planned[] = [];
  const counters: Record<string, number> = {};
  beats.forEach((b, i) => {
    const opt = BY_TYPE[b.type];
    const c = (counters[b.type] = (counters[b.type] ?? -1) + 1);
    let shot = b.shot && b.shot !== "auto" ? b.shot : opt.shots[(c + i) % opt.shots.length];
    const prev = out[i - 1];
    if ((!b.shot || b.shot === "auto") && prev && prev.shot === shot)
      shot = opt.shots.length > 1 ? opt.shots[(opt.shots.indexOf(shot) + 1) % opt.shots.length] : "dutch-push";
    const set = b.set && b.set !== "auto" ? b.set : opt.sets[c % opt.sets.length];
    out.push({ shot, set, sign: i % 2 === 0 ? 1 : -1 });
  });
  return out;
};
