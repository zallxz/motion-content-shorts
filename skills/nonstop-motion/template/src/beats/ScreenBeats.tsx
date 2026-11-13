import React from "react";
import { AbsoluteFill } from "remotion";
import { KineticText, fitSize } from "../components/KineticText";
import { Mascot } from "../components/Mascot";
import { BeatProps, useStyle } from "../lib/context";
import { cardStyle } from "../lib/themes";
import { BACK, EASE_OUT, prog, wobble } from "../lib/motion";
import type { Beat } from "../lib/types";

type B<T extends Beat["type"]> = Extract<Beat, { type: T }>;

const CHARS_PER_FRAME = { chill: 1.4, fast: 2.4, hyper: 3.6 };

export const Ui: React.FC<BeatProps<B<"ui">>> = ({ beat, f }) => {
  const { theme: th, tempo } = useStyle();
  const hard = th.depth === "hard";
  const cpf = tempo.wps > 3.8 ? CHARS_PER_FRAME.hyper : tempo.wps > 3 ? CHARS_PER_FRAME.fast : CHARS_PER_FRAME.chill;
  const capOffset = beat.caption ? 4 : 0;
  const typeStart = 8 + capOffset;
  let budget = Math.max(0, (f - typeStart) * cpf);
  const status = beat.status ?? "none";
  const allChars = beat.lines.reduce((a, l) => a + l.length, 0);
  const done = (f - typeStart) * cpf >= allChars;
  const statusColor = status === "error" ? th.danger : status === "success" ? th.ok : th.accent;
  const statusText = status === "error" ? "● failed" : status === "success" ? "● passed" : "● running";
  const p = prog(f, 0, 12, BACK);
  const doneAt = typeStart + allChars / cpf;
  const hit = f >= doneAt ? Math.max(0, 1 - (f - doneAt) / 10) : 0;
  const errShake = status === "error" ? Math.sin(f * 2.6) * hit * 18 : 0;
  const glow = status !== "none" && done ? 0.35 + 0.25 * Math.sin(f * 0.25) : 0;
  return (
    <AbsoluteFill style={{ padding: "240px 70px 400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50, perspective: 1600 }}>
      {beat.caption ? <KineticText text={beat.caption} f={f} size={fitSize(beat.caption, 84, 920, 260, 50)} /> : null}
      <div
        style={{
          ...cardStyle(th),
          width: 940,
          overflow: "hidden",
          background: hard ? "#fff" : th.name === "terminal" ? "rgba(5,12,6,0.85)" : "rgba(12,12,30,0.75)",
          rotate: `x ${8 - p * 4 + wobble(f, 1) * 2}deg`,
          translate: `${errShake}px ${(1 - p) * 300}px`,
          scale: (0.8 + 0.2 * p) * (1 + hit * 0.03),
          boxShadow: glow ? `0 0 ${60 + hit * 80}px ${statusColor}${Math.round(glow * 255).toString(16).padStart(2, "0")}` : cardStyle(th).boxShadow,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "24px 30px",
            borderBottom: hard ? `4px solid ${th.text}` : `2px solid ${th.cardBorder}`,
          }}
        >
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c, border: hard ? `3px solid ${th.text}` : undefined }} />
          ))}
          <div style={{ marginLeft: 16, fontFamily: th.mono, fontSize: 32, color: hard ? th.text : "#C9C6E8", flex: 1 }}>{beat.title}</div>
          {status !== "none" ? (
            <div
              style={{
                fontFamily: th.mono,
                fontWeight: 700,
                fontSize: 28,
                padding: "8px 18px",
                borderRadius: 999,
                color: statusColor,
                border: `3px solid ${statusColor}`,
                opacity: done ? 1 : 0.35 + 0.65 * Math.abs(Math.sin(f * 0.3)),
                scale: done ? 1 + Math.max(0, 1 - (f - typeStart - allChars / cpf) / 8) * 0.25 : 1,
              }}
            >
              {done ? statusText : "● running"}
            </div>
          ) : null}
        </div>
        <div style={{ padding: "30px 36px 40px", display: "flex", flexDirection: "column", gap: 16, minHeight: 300 }}>
          {beat.lines.map((line, i) => {
            const shown = line.slice(0, Math.max(0, Math.floor(budget)));
            const isTyping = budget > 0 && budget < line.length;
            budget -= line.length;
            if (!shown.length && !isTyping) return <div key={i} style={{ height: 44 }} />;
            const t = line.trim();
            const color =
              /^(✗|x |error|ERR|fail)/i.test(t) ? th.danger : /^(✓|ok|done|success)/i.test(t) ? th.ok : /^(\$|>)/.test(t) ? th.accent2 : hard ? th.text : "#E9E7FF";
            return (
              <div key={i} style={{ fontFamily: th.mono, fontSize: fitSize(line, 38, 860, 50, 24), color, whiteSpace: "pre", fontWeight: 500 }}>
                {shown}
                {isTyping && Math.floor(f / 4) % 2 === 0 ? <span style={{ background: th.accent, color: "transparent" }}>_</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Chat: React.FC<BeatProps<B<"chat">>> = ({ beat, f, dur }) => {
  const { theme: th, mascot, mascotName } = useStyle();
  const hard = th.depth === "hard";
  const n = beat.messages.length;
  const gap = Math.max(8, (dur * 0.7) / n);
  return (
    <AbsoluteFill style={{ padding: "230px 70px 380px", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          ...cardStyle(th),
          width: 940,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          rotate: `${wobble(f, 4) * 0.8}deg`,
          scale: 0.85 + 0.15 * prog(f, 0, 10, BACK),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 30px", borderBottom: hard ? `4px solid ${th.text}` : `2px solid ${th.cardBorder}` }}>
          {mascot ? (
            <div style={{ width: 80, height: 80, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
              <Mascot f={f} size={80} />
            </div>
          ) : (
            <div style={{ width: 70, height: 70, borderRadius: 35, background: th.accent }} />
          )}
          <div style={{ fontFamily: th.body, fontWeight: 800, fontSize: 40, color: th.text }}>{beat.them ?? mascotName}</div>
          <div style={{ marginLeft: "auto", fontFamily: th.mono, fontSize: 26, color: th.ok }}>● online</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 36, justifyContent: "flex-end", flex: 1, minHeight: 760 }}>
          {beat.messages.map((m, i) => {
            const at = 6 + i * gap;
            const typing = m.from === "them" && f >= at - 8 && f < at;
            if (f < at && !typing) return null;
            const p = prog(f, at, 8, BACK);
            const me = m.from === "me";
            const bubbleBg = me ? th.accent2 : hard ? th.bg[0] : "rgba(255,255,255,0.1)";
            const ink = me ? "#fff" : th.text;
            return (
              <div key={i} style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: 680,
                    padding: "24px 32px",
                    borderRadius: 40,
                    borderBottomRightRadius: me ? 10 : 40,
                    borderBottomLeftRadius: me ? 40 : 10,
                    background: bubbleBg,
                    border: hard ? `4px solid ${th.text}` : undefined,
                    color: ink,
                    fontFamily: th.body,
                    fontWeight: 600,
                    fontSize: fitSize(m.text, 60, 620, 240, 40),
                    lineHeight: 1.2,
                    scale: typing ? 1 : p,
                    transformOrigin: me ? "100% 100%" : "0% 100%",
                  }}
                >
                  {typing ? (
                    <div style={{ display: "flex", gap: 10, padding: "8px 4px" }}>
                      {[0, 1, 2].map((k) => (
                        <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: th.text, opacity: 0.3 + 0.7 * Math.abs(Math.sin(f * 0.35 - k * 0.8)) }} />
                      ))}
                    </div>
                  ) : (
                    <span style={{ opacity: prog(f, at + 1, 5, EASE_OUT) }}>{m.text.replace(/\*/g, "")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
