import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { KineticText, fitSize } from "../components/KineticText";
import { Mascot } from "../components/Mascot";
import { BeatProps, useStyle } from "../lib/context";
import { cardStyle } from "../lib/themes";
import { BACK, EASE_OUT, prog, wobble } from "../lib/motion";
import type { Beat } from "../lib/types";

type B<T extends Beat["type"]> = Extract<Beat, { type: T }>;

export const Stat: React.FC<BeatProps<B<"stat">>> = ({ beat, f, dur }) => {
  const { theme: th, mascot: m2, world3d } = useStyle();
  const mascot = m2 && !world3d;
  const countLen = Math.min(22, Math.round(dur * 0.45));
  const p = prog(f, 2, countLen, Easing.bezier(0.22, 1, 0.36, 1));
  const v = beat.value * p;
  const dec = beat.decimals ?? (Number.isInteger(beat.value) ? 0 : 1);
  const str = `${beat.prefix ?? ""}${v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}${beat.suffix ?? ""}`;
  const isPct = beat.suffix?.trim() === "%";
  const ring = isPct ? Math.min(1, v / 100) : p;
  const R = 330;
  const C = 2 * Math.PI * R;
  const big = Math.min(250, 1500 / Math.max(4, str.length));
  const landed = f > countLen + 2 ? Math.max(0, 1 - (f - countLen - 2) / 8) : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
      <div style={{ position: "relative", width: 760, height: 760, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={760} height={760} style={{ position: "absolute", rotate: `${-90 + f * 0.4}deg` }}>
          <circle cx={380} cy={380} r={R} stroke={th.text} strokeOpacity={0.1} strokeWidth={26} fill="none" />
          <circle
            cx={380}
            cy={380}
            r={R}
            stroke={th.accent}
            strokeWidth={26}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${C * ring} ${C}`}
            style={{ filter: th.depth === "glow" ? `drop-shadow(0 0 18px ${th.accent})` : undefined }}
          />
          {new Array(24).fill(0).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={380 + Math.cos(a) * 365}
                y1={380 + Math.sin(a) * 365}
                x2={380 + Math.cos(a) * 380}
                y2={380 + Math.sin(a) * 380}
                stroke={th.text}
                strokeOpacity={0.25}
                strokeWidth={4}
              />
            );
          })}
        </svg>
        <div
          style={{
            fontFamily: th.display,
            fontWeight: th.displayWeight,
            letterSpacing: th.displayTracking,
            fontSize: big,
            color: th.text,
            fontVariantNumeric: "tabular-nums",
            scale: 1 + landed * 0.12,
          }}
        >
          {str}
        </div>
      </div>
      <div style={{ marginTop: 40, maxWidth: 900 }}>
        <KineticText text={beat.label} f={f} start={6} size={fitSize(beat.label, 72, 900, 260, 44)} font="body" weight={700} />
      </div>
      {mascot && beat.mascot ? (
        <div style={{ position: "absolute", top: 260, right: 70, scale: prog(f, countLen, 10, BACK), rotate: "12deg" }}>
          <Mascot mood={beat.mascot} f={f} size={220} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const List: React.FC<BeatProps<B<"list">>> = ({ beat, f, dur }) => {
  const { theme: th } = useStyle();
  const n = beat.items.length;
  const first = 7;
  const gap = Math.max(5, (dur * 0.72 - first) / n);
  const hard = th.depth === "hard";
  const active = beat.items.reduce((a, _, i) => (f >= first + i * gap ? i : a), -1);
  return (
    <AbsoluteFill style={{ padding: "240px 70px 400px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
      <KineticText text={beat.title} f={f} size={fitSize(beat.title, 104, 920, 300, 60)} align="left" />
      <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 20 }}>
        {beat.items.map((it, i) => {
          const at = first + i * gap;
          const p = prog(f, at, 9, BACK);
          const isActive = i === active;
          return (
            <div
              key={i}
              style={{
                ...cardStyle(th),
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "38px 40px",
                opacity: f < at ? 0 : isActive ? 1 : 0.5,
                translate: `${(1 - p) * 700}px ${wobble(f, i) * 3}px`,
                scale: isActive ? 1.03 : 0.97,
                rotate: `${(1 - p) * 8}deg`,
                borderColor: isActive && !hard ? th.accent : undefined,
              }}
            >
              <div
                style={{
                  flex: "0 0 auto",
                  width: 96,
                  height: 96,
                  borderRadius: hard ? 18 : 42,
                  background: isActive ? th.accent : "transparent",
                  border: `4px solid ${isActive ? th.accent : th.dim}`,
                  color: isActive ? (hard ? th.text : "#0B0B1A") : th.dim,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: th.mono,
                  fontWeight: 700,
                  fontSize: 42,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily: th.body, fontWeight: 700, fontSize: fitSize(it, 66, 740, 170, 42), color: th.text, lineHeight: 1.15 }}>
                {it.replace(/\*/g, "")}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Compare: React.FC<BeatProps<B<"compare">>> = ({ beat, f, dur }) => {
  const { theme: th } = useStyle();
  const hard = th.depth === "hard";
  const p1 = prog(f, 0, 10, EASE_OUT);
  const p2 = prog(f, 8, 10, EASE_OUT);
  const vs = prog(f, 12, 10, BACK);
  const judge = prog(f, Math.round(dur * 0.55), 8, BACK);
  const panel = (side: "left" | "right", p: number, dir: number) => {
    const d = beat[side];
    const win = beat.winner === side;
    const lose = beat.winner && beat.winner !== "none" && !win;
    return (
      <div
        style={{
          ...cardStyle(th),
          flex: 1,
          padding: "46px 50px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          justifyContent: "center",
          translate: `${(1 - p) * 1100 * dir}px ${wobble(f, dir) * 4}px`,
          opacity: 1 - (lose ? judge * 0.55 : 0),
          scale: 1 + (win ? judge * 0.04 : 0) - (lose ? judge * 0.04 : 0),
          borderColor: win && judge > 0.5 ? th.accent : undefined,
          background: hard ? (side === "left" ? "#fff" : th.card) : th.card,
          position: "relative",
        }}
      >
        <div style={{ fontFamily: th.mono, fontWeight: 700, fontSize: 34, letterSpacing: "0.1em", textTransform: "uppercase", color: side === "left" ? th.accent2 : th.accent }}>
          {d.label}
        </div>
        <KineticText text={d.text} f={f} start={side === "left" ? 4 : 12} size={fitSize(d.text, 100, 800, 300, 48)} align="left" font="body" weight={700} maxWidth={820} />
        {win ? (
          <div
            style={{
              position: "absolute",
              top: -30,
              right: 40,
              scale: judge,
              background: th.ok,
              color: "#0B0B1A",
              fontFamily: th.body,
              fontWeight: 800,
              fontSize: 40,
              padding: "10px 26px",
              borderRadius: 999,
              border: hard ? `4px solid ${th.text}` : undefined,
            }}
          >
            ✓
          </div>
        ) : null}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ padding: "250px 70px 400px", display: "flex", flexDirection: "column", gap: 70 }}>
      {panel("left", p1, -1)}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "calc(250px + (100% - 650px) / 2)",
          marginLeft: -78,
          marginTop: -78,
          width: 156,
          height: 156,
          borderRadius: "50%",
          background: th.accent,
          color: hard ? th.text : "#0B0B1A",
          border: hard ? `6px solid ${th.text}` : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: th.display,
          fontWeight: 800,
          fontSize: 62,
          zIndex: 2,
          scale: vs,
          rotate: `${(1 - vs) * 180 + wobble(f, 9) * 6}deg`,
          boxShadow: hard ? `6px 6px 0 ${th.text}` : `0 0 50px ${th.accent}99`,
        }}
      >
        VS
      </div>
      {panel("right", p2, 1)}
    </AbsoluteFill>
  );
};


