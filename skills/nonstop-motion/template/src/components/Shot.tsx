import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useStyle } from "../lib/context";
import { BACK, EASE_IN, EASE_OUT, lerp, prog } from "../lib/motion";

export type Kind = "push" | "zoom" | "whip" | "drop" | "cut";

const ROTATION: Kind[] = ["push", "zoom", "whip", "push", "drop", "zoom", "whip"];
export const resolveKind = (k: string | undefined, index: number, type: string): Kind => {
  if (k && k !== "auto") return k as Kind;
  if (index === 0) return "cut"; // frame 0 must already show the hook — no fade-in from black
  if (type === "punch") return "cut";
  return ROTATION[index % ROTATION.length];
};

type Props = {
  enter: Kind;
  exit: Kind | null; // kind of the NEXT beat (so the pair reads as one move); null = last beat
  dur: number;
  children: (f: number) => React.ReactNode;
};

/** Wraps a beat: entrance, continuous hold drift, exit. There is never a static frame. */
export const Shot: React.FC<Props> = ({ enter, exit, dur, children }) => {
  const f = useCurrentFrame();
  const { tempo, theme: th } = useStyle();
  const ov = tempo.overlap;

  const tin = enter === "cut" ? 1 : prog(f, 0, Math.round(ov * 1.7), enter === "drop" ? BACK : EASE_OUT);
  const tout = exit ? prog(f, dur, ov, EASE_IN) : 0;

  let x = 0,
    y = 0,
    s = 1,
    r = 0,
    blur = 0,
    o = 1;

  // ENTER
  switch (enter) {
    case "push":
      y += (1 - tin) * 520;
      o *= Math.min(1, tin * 1.6);
      break;
    case "zoom":
      s *= lerp(0.55, 1, tin);
      blur += (1 - tin) * 22;
      o *= tin;
      break;
    case "whip":
      x += (1 - tin) * 1100;
      blur += (1 - tin) * 28;
      r += (1 - tin) * 6;
      break;
    case "drop":
      y += (1 - tin) * -900;
      r += (1 - tin) * -8;
      break;
  }
  // EXIT (mirrors the next beat's entrance direction)
  switch (exit) {
    case "push":
      y += tout * -520;
      o *= 1 - tout;
      break;
    case "zoom":
      s *= lerp(1, 2.1, tout);
      blur += tout * 22;
      o *= 1 - tout;
      break;
    case "whip":
      x += tout * -1100;
      blur += tout * 28;
      r += tout * -6;
      break;
    case "drop":
      y += tout * 900;
      o *= 1 - tout * 0.6;
      break;
    case "cut":
      o *= tout > 0 ? 0 : 1;
      break;
  }
  // HOLD drift — slow push-in so the shot is alive while the viewer reads
  s *= 1 + 0.045 * Math.min(1, f / Math.max(dur, 1));

  const flash = enter === "cut" && f < 5 ? (1 - f / 5) * 0.32 : 0;

  return (
    <AbsoluteFill
      style={{
        translate: `${x}px ${y}px`,
        scale: s,
        rotate: `${r}deg`,
        opacity: o,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children(f)}
      {flash > 0 ? (
        <AbsoluteFill style={{ background: th.depth === "hard" ? th.accent : "#fff", opacity: flash, mixBlendMode: "screen" }} />
      ) : null}
    </AbsoluteFill>
  );
};
