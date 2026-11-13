import React from "react";
import { useStyle } from "../lib/context";
import { BACK, EASE_OUT, prog, wobble } from "../lib/motion";

type Token = { w: string; em: boolean };

/** "*word*" or "*two words*" marks emphasis (accent color + marker sweep). */
export const tokenize = (text: string): Token[] => {
  const out: Token[] = [];
  let on = false;
  for (const raw of text.trim().split(/\s+/)) {
    let w = raw;
    let em = on;
    if (w.startsWith("*")) {
      em = true;
      on = true;
      w = w.slice(1);
    }
    if (w.endsWith("*") || /\*[.,!?:;]+$/.test(w)) {
      w = w.replace(/\*([.,!?:;]*)$/, "$1");
      on = false;
    }
    out.push({ w, em });
  }
  return out;
};

/** Font size that fits the text inside a box (rough but reliable for Latin text). */
export const fitSize = (text: string, max: number, boxW = 920, boxH = 640, min = 44) => {
  const toks = tokenize(text);
  const chars = toks.reduce((a, t) => a + t.w.length + 1, 0);
  const longest = Math.max(...toks.map((t) => t.w.length), 1);
  const byWord = boxW / (longest * 0.62);
  const byArea = Math.sqrt((boxH * boxW) / (0.62 * 1.12 * Math.max(chars, 1)));
  return Math.max(min, Math.min(max, byWord, byArea));
};

type Props = {
  text: string;
  f: number;
  start?: number;
  size: number;
  /** "pop" = rise+blur, "slam" = scale-down impact per word, "type" = instant per word */
  mode?: "pop" | "slam" | "type";
  align?: "center" | "left";
  color?: string;
  font?: "display" | "body" | "mono";
  weight?: number;
  shout?: boolean;
  maxWidth?: number;
  staggerMul?: number;
  lineHeight?: number;
};

export const KineticText: React.FC<Props> = ({
  text,
  f,
  start = 0,
  size,
  mode = "pop",
  align = "center",
  color,
  font = "display",
  weight,
  shout,
  maxWidth = 920,
  staggerMul = 1,
  lineHeight = 1.06,
}) => {
  const { theme: th, tempo, world3d, dark } = useStyle();
  const toks = tokenize(text);
  const stagger = tempo.stagger * staggerMul;
  const family = font === "display" ? th.display : font === "mono" ? th.mono : th.body;
  const upper = shout ?? false;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "baseline",
        columnGap: size * 0.26,
        rowGap: size * (lineHeight - 1),
        maxWidth,
        fontFamily: family,
        fontWeight: weight ?? (font === "display" ? th.displayWeight : 700),
        letterSpacing: font === "display" ? th.displayTracking : "-0.01em",
        fontSize: size,
        lineHeight,
        color: color ?? th.text,
        textTransform: upper ? "uppercase" : "none",
        textShadow: world3d ? (dark ? "0 6px 30px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.6)" : "0 4px 24px rgba(255,255,255,0.7)") : undefined,
      }}
    >
      {toks.map((t, i) => {
        const at = start + i * stagger;
        const p = prog(f, at, mode === "slam" ? 7 : 9, mode === "slam" ? EASE_OUT : BACK);
        const pr = prog(f, at, 6, EASE_OUT);
        const marker = prog(f, at + 4, 8, EASE_OUT);
        const live = wobble(f, i, 1.4); // words keep breathing after landing
        let translate = `0px ${(1 - p) * size * 0.55 + live * 1.5}px`;
        let scale = 0.85 + 0.15 * p;
        let blur = (1 - pr) * 10;
        if (mode === "slam") {
          scale = 1 + (1 - p) * 0.9;
          translate = `0px ${live * 1.5}px`;
          blur = (1 - pr) * 14;
        }
        if (mode === "type") {
          scale = 1;
          blur = 0;
          translate = "0px 0px";
        }
        const visible = mode === "type" ? (f >= at ? 1 : 0) : pr;
        return (
          <span
            key={i}
            style={{
              position: "relative",
              display: "inline-block",
              opacity: visible,
              translate,
              scale,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              color: t.em ? th.accent : undefined,
              fontStyle: t.em && th.name === "editorial" ? "italic" : undefined,
              whiteSpace: "nowrap",
            }}
          >
            {t.em ? (
              <span
                style={{
                  position: "absolute",
                  left: -size * 0.08,
                  right: -size * 0.08,
                  bottom: size * 0.04,
                  height: size * 0.2,
                  background: th.depth === "hard" ? th.text : th.accent,
                  opacity: th.depth === "hard" ? 1 : 0.22,
                  borderRadius: size * 0.05,
                  transformOrigin: "left center",
                  scale: `${marker} 1`,
                  zIndex: -1,
                }}
              />
            ) : null}
            {t.w}
          </span>
        );
      })}
    </div>
  );
};
