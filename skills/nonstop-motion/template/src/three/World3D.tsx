import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Theme } from "../lib/themes";
import type { Grid } from "../lib/music";
import { beatInfo } from "../lib/music";
import type { ScheduledBeat } from "../lib/timing";
import type { Mood } from "../lib/types";
import { kick } from "../lib/motion";
import { Blip3D } from "./Blip3D";
import { Atmosphere, DeskSet, RooftopSet, StageSet } from "./Sets";
import { Cam, Planned, SETS, SHOTS, V3 } from "./shots";

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.up.set(Math.sin(cam.roll), Math.cos(cam.roll), 0);
    c.lookAt(...cam.target);
    c.fov = cam.fov;
    c.near = 0.05;
    c.far = 200;
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

const DEFAULT_MOOD: Record<string, Mood> = {
  hook: "shocked",
  statement: "neutral",
  dialog: "neutral",
  ui: "think",
  chat: "think",
  stat: "shocked",
  list: "happy",
  compare: "think",
  punch: "smug",
  cta: "happy",
};

type Props = { items: ScheduledBeat[]; plan: Planned[]; theme: Theme; grid: Grid; mascot: boolean };

/**
 * One continuous 3D world behind the motion graphics. Each beat = one camera shot
 * on one set; cuts land on the music grid, the camera punches in on every kick.
 */
export const World3D: React.FC<Props> = ({ items, plan, theme: th, grid, mascot }) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const w = th.world;

  let idx = items.findIndex((it) => f >= it.start && f < it.start + it.dur);
  if (idx < 0) idx = items.length - 1;
  const it = items[idx];
  const pl = plan[idx];
  const local = f - it.start;
  const p = Math.min(1, Math.max(0, local / Math.max(1, it.dur)));
  const set = SETS[pl.set];
  const { pulse, down } = beatInfo(f, fps, grid);

  // camera: shot move + beat punch (fov) + tiny handheld drift
  const raw = SHOTS[pl.shot](set.focus, p, pl.sign, set.alt);
  // open locations get wider framing than the cozy desk
  const SET_DIST = { desk: 1, rooftop: 1.4, stage: 1.5 } as const;
  const k = pl.shot === "screen" ? 1 : SET_DIST[pl.set];
  const base: Cam = {
    ...raw,
    pos: [raw.target[0] + (raw.pos[0] - raw.target[0]) * k, raw.target[1] + (raw.pos[1] - raw.target[1]) * k, raw.target[2] + (raw.pos[2] - raw.target[2]) * k],
  };
  const hand: V3 = [Math.sin(f * 0.07) * 0.012, Math.sin(f * 0.051 + 1) * 0.012, 0];
  // compose for vertical video: graphics live in the top half, so tilt up → subject sits lower in frame
  const dist = Math.hypot(base.pos[0] - base.target[0], base.pos[1] - base.target[1], base.pos[2] - base.target[2]);
  const lift = dist * Math.tan((base.fov * Math.PI) / 360) * 0.42;
  const cam: Cam = {
    pos: [base.pos[0] + hand[0], base.pos[1] + hand[1] + pulse * 0.006, base.pos[2]],
    target: [base.target[0], base.target[1] + lift, base.target[2]],
    fov: base.fov - pulse * 1.6 - down * 1.2,
    roll: base.roll + Math.sin(f * 0.04) * 0.004,
  };

  const beat = it.beat;
  const mood: Mood = beat.mascot ?? (beat.type === "dialog" && beat.speaker ? "neutral" : DEFAULT_MOOD[beat.type]);
  const talking = beat.type === "dialog" && !beat.speaker;
  const react = kick(local, 0, 12);
  const energy = 0.3 + pulse * 0.6;
  const blipColors = th.mascot;

  return (
    <ThreeCanvas width={width} height={height} linear={false} flat={false} gl={{ antialias: true }}>
      <color attach="background" args={[w.sky]} />
      <fog attach="fog" args={[w.fog, w.fogNear, w.fogFar]} />
      <CameraRig cam={cam} />
      <ambientLight color={w.ambient} intensity={w.ambientI} />
      <directionalLight position={[-6, 10, 6]} color={w.rim} intensity={w.rimI} />
      {/* front key so characters keep their true colors */}
      <directionalLight position={[set.origin[0] + 3, 5, 8]} color="#FFF4E6" intensity={0.9} />

      {/* only the active set is mounted → each frame renders one location (fast in software GL) */}
      {pl.set === "desk" ? (
        <group position={SETS.desk.origin}>
          <DeskSet w={w} f={f} pulse={pulse} accent={th.accent} accent2={th.accent2} screenGlow={beat.type === "ui" || beat.type === "chat" ? 1 : 0} />
          {mascot ? <Blip3D f={f} mood={mood} colors={blipColors} accent={th.accent} pulse={pulse} react={react} talking={talking} position={[-0.45, 1.0, 0.15]} rotationY={0.25} scale={0.82} /> : null}
        </group>
      ) : null}
      {pl.set === "rooftop" ? (
        <group position={SETS.rooftop.origin}>
          <RooftopSet w={w} f={f} pulse={pulse} accent={th.accent} />
          {mascot ? <Blip3D f={f} mood={mood} colors={blipColors} accent={th.accent} pulse={pulse} react={react} talking={talking} position={[0, 0.5, 0.6]} /> : null}
        </group>
      ) : null}
      {pl.set === "stage" ? (
        <group position={SETS.stage.origin}>
          <StageSet w={w} f={f} pulse={pulse} down={down} accent={th.accent} accent2={th.accent2} />
          {mascot ? <Blip3D f={f} mood={mood} colors={blipColors} accent={th.accent} pulse={pulse} react={react} talking={false} position={[0, 0.4, 0.1]} scale={0.95} /> : null}
        </group>
      ) : null}

      <Atmosphere w={w} f={f} center={set.origin} energy={energy} />
    </ThreeCanvas>
  );
};
