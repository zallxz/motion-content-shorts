import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { useStyle } from "../lib/context";

/**
 * Background layer that NEVER stops moving. This is what keeps the frame alive
 * even when the foreground is "holding" a line of text for reading.
 */
export const Ambient: React.FC<{ energy: number }> = ({ energy }) => {
  const f = useCurrentFrame();
  const { theme: th } = useStyle();
  const [b0, b1] = th.bg;
  // light backgrounds get a whisper of vignette; dark ones get a deep one
  const isDark = parseInt(b0.slice(1, 3), 16) < 0x80;

  const blobs = [0, 1, 2].map((i) => {
    const x = 50 + Math.sin(f * 0.006 * (i + 1) + i * 2) * 38;
    const y = 30 + i * 25 + Math.cos(f * 0.008 * (i + 1) + i) * 14;
    const c = i === 1 ? th.accent : th.accent2;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: 900,
          height: 900,
          marginLeft: -450,
          marginTop: -450,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${c} 0%, transparent 65%)`,
          opacity: th.depth === "hard" ? 0.22 : isDark ? 0.18 + energy * 0.08 : 0.1 + energy * 0.05,
        }}
      />
    );
  });

  let layer: React.ReactNode = null;

  if (th.ambient === "stars") {
    layer = new Array(90).fill(0).map((_, i) => {
      const sx = random(`x${i}`) * 1080;
      const speed = 0.25 + random(`s${i}`) * 1.2 + energy * 1.5;
      const sy = (((random(`y${i}`) * 2100 - f * speed) % 2100) + 2100) % 2100 - 90;
      const r = 1.5 + random(`r${i}`) * 4;
      const tw = 0.35 + 0.65 * ((Math.sin(f * 0.12 + i) + 1) / 2);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: sx + Math.sin(f * 0.02 + i) * 12,
            top: sy,
            width: r,
            height: r,
            borderRadius: "50%",
            background: "#fff",
            opacity: tw * 0.8,
            boxShadow: r > 4 ? `0 0 ${r * 3}px #fff` : undefined,
          }}
        />
      );
    });
  }

  if (th.ambient === "dots") {
    const off = (f * (1.2 + energy)) % 48;
    layer = (
      <>
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(${th.text}22 3px, transparent 3.5px)`,
            backgroundSize: "48px 48px",
            backgroundPosition: `${off}px ${off}px`,
          }}
        />
        {new Array(7).fill(0).map((_, i) => {
          const shapes = ["50%", "18px", "0"];
          const x = random(`px${i}`) * 1000;
          const y = ((random(`py${i}`) * 2200 + f * (0.8 + random(`ps${i}`))) % 2200) - 150;
          const s = 50 + random(`pz${i}`) * 90;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: s,
                height: s,
                borderRadius: shapes[i % 3],
                border: `5px solid ${th.text}`,
                background: i % 2 ? th.accent : th.accent2,
                opacity: 0.16,
                rotate: `${f * (i % 2 ? 0.8 : -0.6) + i * 30}deg`,
              }}
            />
          );
        })}
      </>
    );
  }

  if (th.ambient === "grid") {
    const off = (f * (3 + energy * 6)) % 120;
    layer = (
      <>
        <AbsoluteFill style={{ perspective: 700, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: -600,
              right: -600,
              top: 1100,
              height: 1800,
              transformOrigin: "50% 0%",
              rotate: "x 68deg",
              backgroundImage: `linear-gradient(${th.accent}55 2px, transparent 2px), linear-gradient(90deg, ${th.accent}55 2px, transparent 2px)`,
              backgroundSize: "120px 120px",
              backgroundPosition: `0px ${off}px`,
              maskImage: "linear-gradient(to bottom, transparent, black 30%)",
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 6px)",
            backgroundPosition: `0 ${f % 6}px`,
            opacity: 0.6,
          }}
        />
      </>
    );
  }

  if (th.ambient === "lines") {
    layer = new Array(9).fill(0).map((_, i) => {
      const y = ((i * 240 + f * (0.9 + energy)) % 2160) - 120;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: y,
            height: 2,
            background: th.text,
            opacity: 0.07,
          }}
        />
      );
    });
  }

  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${b0} 0%, ${b1} 100%)`, overflow: "hidden" }}>
      {blobs}
      {layer}
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            th.depth === "hard" || !isDark
              ? "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.06) 100%)"
              : "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
