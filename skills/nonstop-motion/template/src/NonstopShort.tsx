import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { World3D } from "./three/World3D";
import { planShots } from "./three/shots";
import { beatInfo, MUSIC } from "./lib/music";
import { Ambient } from "./components/Ambient";
import { Shot, resolveKind } from "./components/Shot";
import { StyleCtx, useStyle } from "./lib/context";
import { kick, prog, wobble } from "./lib/motion";
import { THEMES } from "./lib/themes";
import { schedule, ScheduledBeat } from "./lib/timing";
import type { Beat, Script } from "./lib/types";
import { Cta, Dialog, Hook, Punch, Statement } from "./beats/TextBeats";
import { Compare, List, Stat } from "./beats/DataBeats";
import { Chat, Ui } from "./beats/ScreenBeats";

const ENERGY = { chill: 0.15, fast: 0.45, hyper: 0.85 };

const renderBeat = (beat: Beat, f: number, dur: number, index: number) => {
  const p = { f, dur, index };
  switch (beat.type) {
    case "hook":
      return <Hook beat={beat} {...p} />;
    case "statement":
      return <Statement beat={beat} {...p} />;
    case "dialog":
      return <Dialog beat={beat} {...p} />;
    case "stat":
      return <Stat beat={beat} {...p} />;
    case "list":
      return <List beat={beat} {...p} />;
    case "compare":
      return <Compare beat={beat} {...p} />;
    case "ui":
      return <Ui beat={beat} {...p} />;
    case "chat":
      return <Chat beat={beat} {...p} />;
    case "punch":
      return <Punch beat={beat} {...p} />;
    case "cta":
      return <Cta beat={beat} {...p} />;
  }
};

const Progress: React.FC<{ items: ScheduledBeat[]; total: number }> = ({ items, total }) => {
  const f = useCurrentFrame();
  const { theme: th } = useStyle();
  return (
    <div style={{ position: "absolute", top: 130, left: 80, right: 80, display: "flex", gap: 8 }}>
      {items.map((it) => {
        const p = Math.min(1, Math.max(0, (f - it.start) / it.dur));
        return (
          <div key={it.index} style={{ flex: it.dur / total, height: 8, borderRadius: 4, background: `${th.text}22`, overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: th.accent }} />
          </div>
        );
      })}
    </div>
  );
};

const Soundtrack: React.FC<{ script: Script; items: ScheduledBeat[]; total: number }> = ({ script, items, total }) => {
  const { fps } = useVideoConfig();
  const m = script.meta.music;
  const sfx = script.meta.sfx !== false;
  const file = m === false ? null : (m && m.file) || MUSIC[script.meta.tempo].file;
  const vol = m && m.volume !== undefined ? m.volume : 0.55;
  const fadeOut = Math.round(fps * 0.8);
  return (
    <>
      {file ? (
        <Audio
          src={staticFile(file)}
          volume={(fr: number) => vol * Math.min(1, Math.max(0, (total - fr) / fadeOut))}
        />
      ) : null}
      {sfx
        ? items.map((it, i) => {
            const hit = it.beat.type === "punch" || i === 0;
            const lead = hit ? 0 : Math.round(fps * 0.12); // whoosh starts just before the cut
            return (
              <Sequence key={`sfx${i}`} from={Math.max(0, it.start - lead)} durationInFrames={Math.round(fps * 1.1)} layout="none">
                <Audio src={staticFile(hit ? "sfx/impact.mp3" : "sfx/whoosh.mp3")} volume={hit ? 0.55 : 0.28} />
              </Sequence>
            );
          })
        : null}
    </>
  );
};

const Stage: React.FC<{ script: Script }> = ({ script }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme: th, world3d, mascot, dark } = useStyle();
  const { items, total, tempo, grid } = useMemo(() => schedule(script, fps), [script, fps]);
  const plan = useMemo(() => planShots(script.beats), [script.beats]);
  const base = ENERGY[script.meta.tempo];
  const { pulse } = beatInfo(f, fps, grid);

  // Camera: always drifting + a punch-in on every cut.
  let k = 0;
  for (const it of items) k += kick(f, it.start, 12);
  const energy = Math.min(1, base + k * 0.6);
  const camScale = 1.0 + k * (world3d ? 0.025 : 0.05) + Math.sin(f * 0.03) * 0.008 + pulse * 0.006;
  const camRot = wobble(f, 0, 0.8) * (0.4 + base * 0.6) + k * (items.findIndex((i) => f >= i.start && f < i.start + 12) % 2 ? 1 : -1) * 0.8;
  const camX = wobble(f, 5, 0.7) * 10;
  const camY = wobble(f, 9, 0.6) * 12;

  return (
    <AbsoluteFill style={{ background: th.bg[0], overflow: "hidden" }}>
      {world3d ? (
        <>
          <World3D items={items} plan={plan} theme={th} grid={grid} mascot={mascot} />
          {/* readability scrim for the graphics layer */}
          <AbsoluteFill
            style={{
              background: dark
                ? "linear-gradient(180deg, rgba(4,4,18,0.72) 0%, rgba(4,4,18,0.35) 30%, rgba(4,4,18,0) 50%, rgba(4,4,18,0) 75%, rgba(4,4,18,0.45) 100%)"
                : `linear-gradient(180deg, ${th.bg[0]}E6 0%, ${th.bg[0]}80 30%, ${th.bg[0]}00 50%, ${th.bg[0]}00 78%, ${th.bg[0]}99 100%)`,
            }}
          />
        </>
      ) : (
        <AbsoluteFill style={{ scale: 1.08 + k * 0.02, translate: `${camX * -0.5}px ${camY * -0.5}px` }}>
          <Ambient energy={energy} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ scale: camScale, rotate: `${camRot}deg`, translate: `${camX}px ${camY}px` }}>
        {items.map((it, i) => {
          const next = items[i + 1];
          const enter = resolveKind(it.beat.transition, i, it.beat.type);
          const exit = next ? resolveKind(next.beat.transition, i + 1, next.beat.type) : null;
          const len = next ? it.dur + tempo.overlap : total - it.start;
          return (
            <Sequence key={i} from={it.start} durationInFrames={len} layout="absolute-fill" name={`${i + 1}. ${it.beat.type}`}>
              <Shot enter={enter} exit={exit} dur={it.dur}>
                {(lf) => renderBeat(it.beat, lf, it.dur, i)}
              </Shot>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Soundtrack script={script} items={items} total={total} />
      {script.meta.progress !== false ? <Progress items={items} total={items.reduce((a, b) => a + b.dur, 0)} /> : null}
      {script.meta.handle ? (
        <div
          style={{
            position: "absolute",
            top: 160,
            width: "100%",
            textAlign: "center",
            fontFamily: th.mono,
            fontSize: 28,
            color: th.dim,
            opacity: 0.8 * prog(f, 0, 10),
            letterSpacing: "0.06em",
          }}
        >
          {script.meta.handle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const NonstopShort: React.FC<Script> = (script) => {
  const theme = THEMES[script.meta.theme] ?? THEMES.midnight;
  const { fps } = useVideoConfig();
  const { tempo } = schedule(script, fps);
  const dark = parseInt(theme.bg[0].slice(1, 3), 16) < 0x80;
  return (
    <StyleCtx.Provider
      value={{
        theme,
        tempo,
        mascot: script.meta.mascot !== false,
        mascotName: script.meta.mascotName ?? "Blip",
        world3d: (script.meta.world ?? "3d") === "3d",
        dark,
      }}
    >
      <Stage script={script} />
    </StyleCtx.Provider>
  );
};
