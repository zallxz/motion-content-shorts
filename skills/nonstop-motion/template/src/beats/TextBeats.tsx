import React from "react";
import { AbsoluteFill } from "remotion";
import { KineticText, fitSize } from "../components/KineticText";
import { Mascot } from "../components/Mascot";
import { BeatProps, useStyle } from "../lib/context";
import { BACK, EASE_OUT, kick, prog, wobble } from "../lib/motion";
import type { Beat } from "../lib/types";
import { countWords } from "../lib/timing";

type B<T extends Beat["type"]> = Extract<Beat, { type: T }>;

const Center: React.FC<{ children: React.ReactNode; top?: number; bottom?: number; band?: boolean }> = ({
  children,
  top = 220,
  bottom = 380,
  band,
}) => {
  const { world3d: w3 } = useStyle();
  const world3d = w3 && !band;
  return (
  <AbsoluteFill
    style={{
      paddingTop: world3d ? 250 : top,
      paddingBottom: world3d ? 1000 : bottom,
      paddingLeft: 80,
      paddingRight: 80,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 36,
    }}
  >
    {children}
  </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; f: number; at?: number; color?: string; ink?: string }> = ({ text, f, at = 0, color, ink }) => {
  const { theme: th } = useStyle();
  const p = prog(f, at, 8, BACK);
  return (
    <div
      style={{
        fontFamily: th.mono,
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "12px 26px",
        borderRadius: 999,
        background: color ?? th.accent,
        color: ink ?? (th.depth === "hard" ? th.text : "#0B0B1A"),
        border: th.depth === "hard" ? `4px solid ${th.text}` : undefined,
        scale: p,
        rotate: `${(1 - p) * -12 + wobble(f, 3) * 1.5}deg`,
      }}
    >
      {text}
    </div>
  );
};

export const Hook: React.FC<BeatProps<B<"hook">>> = ({ beat, f }) => {
  const { theme: th, tempo, mascot: m2, world3d } = useStyle();
  const mascot = m2 && !world3d;
  const size = fitSize(beat.text, world3d ? 128 : 150, 920, world3d ? 560 : 640, 70);
  const n = beat.text.trim().split(/\s+/).length;
  const st = beat.kicker ? 4 : 0;
  // micro screen-shake every time a word lands
  let shake = 0;
  for (let i = 0; i < n; i++) shake += kick(f, st + i * tempo.stagger * 1.4 + 3, 7);
  const showM = mascot && beat.mascot;
  return (
    <Center bottom={showM ? 620 : 380}>
      <div style={{ translate: `${Math.sin(f * 2.3) * shake * 10}px ${Math.cos(f * 1.9) * shake * 8}px`, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        {beat.kicker ? <Pill text={beat.kicker} f={f} /> : null}
        <KineticText text={beat.text} f={f} start={st} size={size} mode="slam" shout={th.shout} staggerMul={1.4} />
      </div>
      {showM ? (
        <div style={{ position: "absolute", bottom: 330, left: "50%", marginLeft: -170, translate: `0px ${(1 - prog(f, 6, 10, BACK)) * 600}px` }}>
          <Mascot mood={beat.mascot} f={f} size={340} />
        </div>
      ) : null}
    </Center>
  );
};

export const Statement: React.FC<BeatProps<B<"statement">>> = ({ beat, f }) => {
  const { theme: th, tempo, mascot: m2, world3d } = useStyle();
  const mascot = m2 && !world3d;
  const size = fitSize(beat.text, world3d ? 100 : 116, 920, world3d ? 520 : 600, 60);
  const words = beat.text.trim().split(/\s+/).length;
  const subAt = words * tempo.stagger + 6;
  const showM = mascot && beat.mascot;
  return (
    <Center bottom={showM ? 640 : 380}>
      <KineticText text={beat.text} f={f} size={size} />
      {beat.sub ? (
        <div style={{ opacity: prog(f, subAt, 8), translate: `0px ${(1 - prog(f, subAt, 10)) * 30}px` }}>
          <KineticText text={beat.sub} f={f} start={subAt} size={46} font="body" weight={500} color={th.dim} staggerMul={0.6} />
        </div>
      ) : null}
      {showM ? (
        <div style={{ position: "absolute", bottom: 340, right: 90, rotate: `${wobble(f, 2) * 6}deg`, scale: prog(f, 4, 10, BACK) }}>
          <Mascot mood={beat.mascot} f={f} size={270} look={-1} />
        </div>
      ) : null}
    </Center>
  );
};

export const Dialog: React.FC<BeatProps<B<"dialog">>> = ({ beat, f }) => {
  const { theme: th, mascot: m2, mascotName, world3d } = useStyle();
  const mascot = m2 && !world3d;
  const size = fitSize(beat.text, 92, 820, 380, 52);
  const p = prog(f, 0, 9, BACK);
  const hard = th.depth === "hard";
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          scale: 0.7 + 0.3 * p,
          opacity: p,
          transformOrigin: "50% 100%",
          rotate: `${wobble(f, 7) * 1.2}deg`,
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "56px 56px 60px",
            borderRadius: 48,
            background: hard ? "#fff" : th.card,
            border: hard ? `6px solid ${th.text}` : `2px solid ${th.cardBorder}`,
            boxShadow: hard ? `12px 12px 0 ${th.text}` : "0 30px 80px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            minWidth: 520,
          }}
        >
          <div style={{ position: "absolute", top: -34, left: 48 }}>
            <Pill text={beat.speaker ?? mascotName} f={f} at={2} />
          </div>
          <KineticText text={beat.text} f={f} start={3} size={size} maxWidth={840} />
          <div
            style={{
              position: "absolute",
              bottom: -38,
              left: "50%",
              marginLeft: -30,
              width: 60,
              height: 60,
              rotate: "45deg",
              background: hard ? "#fff" : th.card,
              borderRight: hard ? `6px solid ${th.text}` : `2px solid ${th.cardBorder}`,
              borderBottom: hard ? `6px solid ${th.text}` : `2px solid ${th.cardBorder}`,
            }}
          />
        </div>
      </div>
      {mascot ? (
        <div style={{ position: "absolute", bottom: 300, left: "50%", marginLeft: -230, translate: `0px ${(1 - prog(f, 0, 10, BACK)) * 500}px` }}>
          <Mascot mood={beat.mascot ?? "neutral"} f={f} size={460} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Punch: React.FC<BeatProps<B<"punch">>> = ({ beat, f }) => {
  const { theme: th, world3d } = useStyle();
  const w3 = world3d;
  const r = prog(f, 0, 8, EASE_OUT);
  const size = fitSize(beat.text, world3d ? 124 : 170, 900, world3d ? 460 : 700, 64);
  const ink = th.depth === "hard" ? th.text : th.bg[0];
  // 3D: a slanted band wipes across so the world stays visible above & below
  const clip = world3d
    ? `polygon(0% ${42 - 20 * r}%, ${r * 100}% ${38 - 20 * r}%, ${r * 100}% ${42 + 20 * r}%, 0% ${46 + 20 * r}%)`
    : `circle(${r * 120}% at 50% 50%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: th.accent, clipPath: clip }} />
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(${-20 + f * 0.3}deg, ${ink}14 0 26px, transparent 26px 70px)`,
          clipPath: clip,
        }}
      />
      <Center band top={w3 ? 250 : 220} bottom={w3 ? 560 : 380}>
        <div style={{ rotate: `${-3 + wobble(f, 1) * 1.5}deg` }}>
          <KineticText text={beat.text.replace(/\*/g, "")} f={f} start={2} size={size} mode="slam" color={ink} shout={th.shout || countWords(beat.text) <= 4} />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

export const Cta: React.FC<BeatProps<B<"cta">>> = ({ beat, f }) => {
  const { theme: th, tempo, mascot: m2, world3d } = useStyle();
  const mascot = m2 && !world3d;
  const size = fitSize(beat.text, 110, 920, 420, 60);
  const words = beat.text.trim().split(/\s+/).length;
  const bAt = words * tempo.stagger + 6;
  const pulse = 1 + Math.max(0, Math.sin(f * 0.25)) * 0.06;
  const hard = th.depth === "hard";
  return (
    <Center bottom={mascot ? 600 : 380}>
      <KineticText text={beat.text} f={f} size={size} />
      {beat.sub ? <KineticText text={beat.sub} f={f} start={bAt - 4} size={44} font="body" weight={500} color={th.dim} staggerMul={0.6} /> : null}
      <div
        style={{
          marginTop: 20,
          scale: prog(f, bAt, 10, BACK) * pulse,
          padding: "30px 64px",
          borderRadius: 999,
          background: th.accent,
          color: hard ? th.text : "#0B0B1A",
          fontFamily: th.body,
          fontWeight: 800,
          fontSize: 52,
          border: hard ? `5px solid ${th.text}` : undefined,
          boxShadow: hard ? `8px 8px 0 ${th.text}` : `0 0 ${40 + Math.sin(f * 0.25) * 20}px ${th.accent}88`,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {beat.button ?? "Follow"}
        <span style={{ display: "inline-block", translate: `${Math.abs(Math.sin(f * 0.25)) * 14}px 0px` }}>→</span>
      </div>
      {mascot ? (
        <div style={{ position: "absolute", bottom: 300, left: "50%", marginLeft: -170, translate: `0px ${(1 - prog(f, 4, 10, BACK)) * 500}px` }}>
          <Mascot mood={beat.mascot ?? "happy"} f={f} size={340} />
        </div>
      ) : null}
    </Center>
  );
};
