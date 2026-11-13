import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Mood } from "../lib/types";

const INK = "#0B0B1A";

type Props = {
  f: number;
  mood: Mood;
  colors: [string, string];
  accent: string;
  pulse: number;
  /** 0→1 impulse at the start of the beat (little hop) */
  react: number;
  talking: boolean;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
};

/** Low-poly 3D version of Blip: faceted squircle body, face plate, antenna bulb, stubby arms. */
export const Blip3D: React.FC<Props> = ({ f, mood, colors, accent, pulse, react, talking, position, rotationY = 0, scale = 1 }) => {
  const body = useMemo(() => new RoundedBoxGeometry(0.74, 0.82, 0.62, 2, 0.24), []);
  const plate = useMemo(() => new RoundedBoxGeometry(0.56, 0.42, 0.06, 2, 0.16), []);
  const foot = useMemo(() => new RoundedBoxGeometry(0.2, 0.1, 0.24, 1, 0.05), []);
  const plateColor = useMemo(() => new THREE.Color(colors[0]).lerp(new THREE.Color("#ffffff"), 0.55).getStyle(), [colors]);

  const bob = Math.sin(f * 0.16) * 0.025 + react * 0.16;
  const sq = 1 + Math.sin(f * 0.32) * 0.02 + pulse * 0.05 - react * 0.06;
  const blink = mood !== "happy" && f % 84 > 79 ? 0.12 : 1;
  const yaw = rotationY + Math.sin(f * 0.035) * 0.18;
  const sway = Math.sin(f * 0.11) * 0.25 + (mood === "shocked" ? Math.sin(f * 1.3) * 0.2 : 0);
  const shake = mood === "angry" ? Math.sin(f * 2.2) * 0.012 : 0;
  const talk = talking ? 0.4 + 0.6 * Math.abs(Math.sin(f * 0.9)) : 1;
  const armSwing = Math.sin(f * 0.2) * 0.3 + (mood === "happy" ? Math.sin(f * 0.6) * 0.4 : 0);
  const Z = 0.345; // face depth

  const dark = <meshLambertMaterial color={INK} />;

  const eyes = () => {
    const L = -0.12, R = 0.12, y = 0.06;
    switch (mood) {
      case "happy":
        return [L, R].map((x) => (
          <mesh key={x} position={[x, y - 0.02, Z]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.055, 0.018, 6, 10, Math.PI]} />
            {dark}
          </mesh>
        ));
      case "shocked":
        return [L, R].map((x) => (
          <group key={x} position={[x, y + 0.01, Z]}>
            <mesh scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.078, 10, 8]} />
              <meshLambertMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.03]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.034, 8, 6]} />
              {dark}
            </mesh>
          </group>
        ));
      case "smug":
        return [L, R].map((x) => (
          <mesh key={x} position={[x, y, Z]}>
            <boxGeometry args={[0.11, 0.032, 0.03]} />
            {dark}
          </mesh>
        ));
      case "think":
        return [L, R].map((x) => (
          <mesh key={x} position={[x + 0.03, y + 0.05, Z]} scale={[0.055, 0.085 * blink, 0.03]}>
            <sphereGeometry args={[1, 8, 6]} />
            {dark}
          </mesh>
        ));
      default: {
        const lower = mood === "sad" ? -0.03 : 0;
        return (
          <>
            {[L, R].map((x) => (
              <mesh key={x} position={[x, y + lower, Z]} scale={[0.055, 0.085 * blink, 0.03]}>
                <sphereGeometry args={[1, 8, 6]} />
                {dark}
              </mesh>
            ))}
            {(mood === "sad" || mood === "angry") &&
              [L, R].map((x) => (
                <mesh key={`b${x}`} position={[x, y + 0.13, Z]} rotation={[0, 0, (x < 0 ? 1 : -1) * (mood === "angry" ? -0.45 : 0.35)]}>
                  <boxGeometry args={[0.13, 0.03, 0.03]} />
                  {dark}
                </mesh>
              ))}
          </>
        );
      }
    }
  };

  const mouth = () => {
    switch (mood) {
      case "happy":
        return (
          <mesh position={[0, -0.09, Z]} rotation={[0, 0, Math.PI]} scale={[1, talk, 1]}>
            <circleGeometry args={[0.065, 10, 0, Math.PI]} />
            {dark}
          </mesh>
        );
      case "shocked":
        return (
          <mesh position={[0, -0.11, Z]} scale={[0.045, 0.06 * (0.8 + 0.2 * talk), 0.02]}>
            <sphereGeometry args={[1, 10, 8]} />
            {dark}
          </mesh>
        );
      case "sad":
        return (
          <mesh position={[0, -0.13, Z]}>
            <torusGeometry args={[0.05, 0.014, 6, 10, Math.PI]} />
            {dark}
          </mesh>
        );
      case "angry":
        return (
          <mesh position={[0, -0.1, Z]} scale={[1, talk, 1]}>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            {dark}
          </mesh>
        );
      case "smug":
        return (
          <mesh position={[0.04, -0.09, Z]} rotation={[0, 0, Math.PI + 0.35]}>
            <torusGeometry args={[0.05, 0.014, 6, 10, Math.PI * 0.8]} />
            {dark}
          </mesh>
        );
      case "think":
        return (
          <mesh position={[0.05, -0.1, Z]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            {dark}
          </mesh>
        );
      default:
        return (
          <mesh position={[0, -0.075, Z]} rotation={[0, 0, Math.PI]} scale={[1, talk, 1]}>
            <torusGeometry args={[0.045, 0.014, 6, 10, Math.PI]} />
            {dark}
          </mesh>
        );
    }
  };

  return (
    <group position={[position[0] + shake, position[1] + bob, position[2]]} rotation={[0, yaw, 0]} scale={scale}>
      {/* contact shadow */}
      <mesh position={[0, -bob + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42 - react * 0.1, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} />
      </mesh>
      <group scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]}>
        {/* feet */}
        <mesh geometry={foot} position={[-0.17, 0.05, 0.03]}>
          <meshLambertMaterial color={colors[1]} flatShading />
        </mesh>
        <mesh geometry={foot} position={[0.17, 0.05, 0.03]}>
          <meshLambertMaterial color={colors[1]} flatShading />
        </mesh>
        <group position={[0, 0.52, 0]}>
          <mesh geometry={body}>
            <meshLambertMaterial color={colors[0]} flatShading />
          </mesh>
          <mesh geometry={plate} position={[0, 0.0, 0.3]}>
            <meshLambertMaterial color={plateColor} flatShading />
          </mesh>
          {eyes()}
          {mouth()}
          {(mood === "happy" || mood === "smug") &&
            [-0.2, 0.2].map((x) => (
              <mesh key={x} position={[x, -0.05, Z - 0.005]}>
                <circleGeometry args={[0.04, 10]} />
                <meshBasicMaterial color={accent} transparent opacity={0.7} />
              </mesh>
            ))}
          {/* arms */}
          {[-1, 1].map((d) => (
            <mesh key={d} position={[d * 0.43, -0.1, 0]} rotation={[0, 0, d * (0.25 + (d > 0 ? armSwing : -armSwing * 0.5) * (mood === "happy" && d > 0 ? 2 : 1))]}>
              <capsuleGeometry args={[0.07, 0.2, 3, 8]} />
              <meshLambertMaterial color={colors[1]} flatShading />
            </mesh>
          ))}
          {/* antenna */}
          <group position={[0, 0.41, 0]} rotation={[0, 0, sway]}>
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.018, 0.022, 0.22, 6]} />
              <meshLambertMaterial color={colors[1]} flatShading />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <icosahedronGeometry args={[0.06, 0]} />
              <meshLambertMaterial color={accent} emissive={accent} emissiveIntensity={1.4 + pulse * 2.5} flatShading />
            </mesh>
          </group>
        </group>
      </group>
      {mood === "think" &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[0.45 + i * 0.12, 1.15 + i * 0.1, 0]}>
            <icosahedronGeometry args={[0.03 + i * 0.012, 0]} />
            <meshLambertMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3 + 0.7 * Math.abs(Math.sin(f * 0.25 - i))} />
          </mesh>
        ))}
    </group>
  );
};
