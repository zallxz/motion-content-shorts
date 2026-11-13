import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import type { WorldPalette } from "../lib/themes";

// Lambert = cheap per-pixel lighting → fast software-WebGL renders, still faceted "low-poly" look.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Std: React.FC<{ c: string; e?: string; ei?: number; r?: number; m?: number }> = ({ c, e, ei = 0 }) => (
  <meshLambertMaterial color={c} emissive={e ?? "#000000"} emissiveIntensity={ei} flatShading />
);

/** Procedural lit-window texture (deterministic). */
const useWindowTex = (w: WorldPalette, seed: string) =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 128;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#000000";
    g.fillRect(0, 0, 64, 128);
    for (let y = 4; y < 124; y += 10)
      for (let x = 4; x < 60; x += 10) {
        const r = random(`${seed}-${x}-${y}`);
        g.fillStyle = r > 0.58 ? "#ffffff" : r > 0.5 ? "#555555" : "#0a0a0a";
        g.fillRect(x, y, 6, 6);
      }
    const t = new THREE.CanvasTexture(cv);
    t.magFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [w, seed]);

const Building: React.FC<{ p: [number, number, number]; s: [number, number, number]; w: WorldPalette; tex: THREE.Texture; antenna?: boolean; f: number; i: number }> = ({ p, s, w, tex, antenna, f, i }) => (
  <group position={p}>
    <mesh position={[0, s[1] / 2, 0]}>
      <boxGeometry args={s} />
      <meshLambertMaterial color={w.building} emissive={w.windowLit} emissiveMap={tex} emissiveIntensity={1.1} flatShading />
    </mesh>
    {antenna ? (
      <>
        <mesh position={[0, s[1] + 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 1.6, 4]} />
          <Std c={w.metal} />
        </mesh>
        <mesh position={[0, s[1] + 1.65, 0]}>
          <sphereGeometry args={[0.12, 6, 4]} />
          <meshBasicMaterial color={Math.floor(f / 20 + i) % 2 ? "#ff3b4f" : "#4a0d14"} />
        </mesh>
      </>
    ) : null}
  </group>
);

export const Skyline: React.FC<{ w: WorldPalette; f: number; origin: [number, number, number]; count?: number; zFrom?: number; spread?: number }> = ({ w, f, origin, count = 46, zFrom = -9, spread = 26 }) => {
  const t1 = useWindowTex(w, "a");
  const t2 = useWindowTex(w, "b");
  const items = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const z = zFrom - random(`bz${i}`) * 34;
        const x = (random(`bx${i}`) - 0.5) * spread * 2 * (1 + (zFrom - z) / 40);
        const h = 3 + random(`bh${i}`) ** 1.6 * 16;
        const wd = 1.6 + random(`bw${i}`) * 2.6;
        return { x, z, h, wd, d: 1.6 + random(`bd${i}`) * 2, ant: random(`ba${i}`) > 0.82 };
      }),
    [count, zFrom, spread],
  );
  return (
    <group position={origin}>
      {items.map((b, i) => (
        <Building key={i} i={i} f={f} p={[b.x, -0.5, b.z]} s={[b.wd, b.h, b.d]} w={w} tex={i % 2 ? t1 : t2} antenna={b.ant} />
      ))}
    </group>
  );
};

/** Desk corner: wall with a window onto the city, desk, laptop, lamp, plant, shelf. */
export const DeskSet: React.FC<{ w: WorldPalette; f: number; pulse: number; accent: string; accent2: string; screenGlow: number }> = ({ w, f, pulse, accent, accent2, screenGlow }) => {
  const deskY = 1.0;
  return (
    <group>
      {/* floor + walls (window opening at x∈[-0.9,1.9], y∈[1.5,3.3]) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <Std c={w.floor} r={0.95} />
      </mesh>
      {[
        { p: [-4.95, 2.5, -2.6], s: [8.1, 5, 0.25] },
        { p: [5.45, 2.5, -2.6], s: [7.1, 5, 0.25] },
        { p: [0.5, 0.75, -2.6], s: [2.8, 1.5, 0.25] },
        { p: [0.5, 4.15, -2.6], s: [2.8, 1.7, 0.25] },
      ].map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]}>
          <boxGeometry args={b.s as [number, number, number]} />
          <Std c={w.wall} r={0.95} />
        </mesh>
      ))}
      {/* window frame + cross */}
      {[
        { p: [0.5, 1.5, -2.45], s: [2.9, 0.1, 0.12] },
        { p: [0.5, 3.3, -2.45], s: [2.9, 0.1, 0.12] },
        { p: [-0.9, 2.4, -2.45], s: [0.1, 1.9, 0.12] },
        { p: [1.9, 2.4, -2.45], s: [0.1, 1.9, 0.12] },
        { p: [0.5, 2.4, -2.45], s: [0.06, 1.8, 0.08] },
      ].map((b, i) => (
        <mesh key={i} position={b.p as [number, number, number]}>
          <boxGeometry args={b.s as [number, number, number]} />
          <Std c={w.wood} />
        </mesh>
      ))}
      <Skyline w={w} f={f} origin={[0.5, 0, -4]} count={24} zFrom={-3} spread={10} />
      {/* poster + shelf */}
      <mesh position={[-2.6, 2.6, -2.46]} rotation={[0, 0, 0.04]}>
        <planeGeometry args={[1.1, 1.5]} />
        <meshLambertMaterial color={accent2} emissive={accent2} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-2.6, 2.75, -2.44]}>
        <circleGeometry args={[0.3, 6]} />
        <meshLambertMaterial color={accent} emissive={accent} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[3.1, 2.6, -2.3]}>
        <boxGeometry args={[1.8, 0.07, 0.4]} />
        <Std c={w.wood} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[2.5 + i * 0.22, 2.83 + (i === 3 ? -0.04 : 0), -2.3]} rotation={[0, 0, i === 3 ? 0.35 : 0]}>
          <boxGeometry args={[0.16, 0.42 - (i % 2) * 0.08, 0.3]} />
          <Std c={[accent, accent2, w.metal, accent][i]} />
        </mesh>
      ))}
      {/* desk */}
      <mesh position={[0, deskY - 0.04, 0]}>
        <boxGeometry args={[3, 0.08, 1.3]} />
        <Std c={w.wood} r={0.7} />
      </mesh>
      {[
        [-1.4, 0.6],
        [1.4, 0.6],
        [-1.4, -0.6],
        [1.4, -0.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, (deskY - 0.08) / 2, z]}>
          <boxGeometry args={[0.08, deskY - 0.08, 0.08]} />
          <Std c={w.metal} />
        </mesh>
      ))}
      {/* laptop */}
      <group position={[0.55, deskY, 0.15]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.66, 0.03, 0.44]} />
          <Std c={w.metal} m={0.4} r={0.4} />
        </mesh>
        <group position={[0, 0.03, -0.21]} rotation={[-0.28, 0, 0]}>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.66, 0.44, 0.02]} />
            <Std c={w.metal} m={0.4} r={0.4} />
          </mesh>
          <mesh position={[0, 0.22, 0.012]}>
            <planeGeometry args={[0.6, 0.38]} />
            <meshLambertMaterial color="#0d0f24" emissive={accent2} emissiveIntensity={0.55 + screenGlow * 1.2} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[-0.2 + ((i * 37) % 5) * 0.02, 0.36 - i * 0.06, 0.014]}>
              <planeGeometry args={[0.18 + ((i * 53) % 7) * 0.035, 0.018]} />
              <meshBasicMaterial color={i === 2 ? accent : "#ffffff"} transparent opacity={0.75} />
            </mesh>
          ))}
        </group>
        <pointLight position={[0, 0.3, 0.4]} color={accent2} intensity={1.6 + screenGlow * 3} distance={3} decay={1.5} />
      </group>
      {/* lamp */}
      <group position={[1.25, deskY, -0.35]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 8]} />
          <Std c={w.metal} />
        </mesh>
        <mesh position={[-0.05, 0.38, 0]} rotation={[0, 0, 0.18]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 5]} />
          <Std c={w.metal} />
        </mesh>
        <mesh position={[-0.2, 0.72, 0.05]} rotation={[0.2, 0, 0.9]}>
          <coneGeometry args={[0.17, 0.24, 7, 1, true]} />
          <meshLambertMaterial color={accent} side={THREE.DoubleSide} flatShading emissive={w.key} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-0.27, 0.66, 0.06]}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshBasicMaterial color={w.key} />
        </mesh>
        <pointLight position={[-0.3, 0.6, 0.15]} color={w.key} intensity={w.keyI * (5 + pulse * 1.5)} distance={6} decay={1.4} />
      </group>
      {/* mug, plant, books */}
      <mesh position={[-1.15, deskY + 0.1, 0.25]}>
        <cylinderGeometry args={[0.09, 0.08, 0.2, 8]} />
        <Std c={accent} />
      </mesh>
      <group position={[-1.2, deskY, -0.35]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.14, 0.11, 0.24, 7]} />
          <Std c={w.wood} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.sin(i * 1.7) * 0.1, 0.36 + i * 0.07, Math.cos(i * 1.7) * 0.1]} rotation={[0, i, Math.sin(f * 0.05 + i) * 0.08]}>
            <icosahedronGeometry args={[0.15 - i * 0.02, 0]} />
            <Std c="#3FAE7A" />
          </mesh>
        ))}
      </group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.6, deskY + 0.03 + i * 0.06, -0.4]} rotation={[0, 0.2 * i, 0]}>
          <boxGeometry args={[0.42, 0.055, 0.3]} />
          <Std c={[accent2, w.wall, accent][i]} />
        </mesh>
      ))}
    </group>
  );
};

/** Rooftop at night: roof slab, crate, water tank, AC units, string lights, skyline. */
export const RooftopSet: React.FC<{ w: WorldPalette; f: number; pulse: number; accent: string }> = ({ w, f, pulse, accent }) => {
  const bulbs = 14;
  return (
    <group>
      <mesh position={[0, -0.2, -1]}>
        <boxGeometry args={[14, 0.4, 10]} />
        <Std c={w.floor} r={0.95} />
      </mesh>
      <mesh position={[0, 0.3, -5.9]}>
        <boxGeometry args={[14, 0.6, 0.3]} />
        <Std c={w.wall} />
      </mesh>
      {/* crate Blip sits on */}
      <mesh position={[0, 0.25, 0.6]}>
        <boxGeometry args={[0.9, 0.5, 0.8]} />
        <Std c={w.wood} />
      </mesh>
      {/* water tank */}
      <group position={[3.4, 0, -2.6]}>
        {[
          [-0.6, -0.6],
          [0.6, -0.6],
          [-0.6, 0.6],
          [0.6, 0.6],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.6, z]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <Std c={w.metal} />
          </mesh>
        ))}
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[1, 1, 1.5, 9]} />
          <Std c={w.wood} />
        </mesh>
        <mesh position={[0, 2.95, 0]}>
          <coneGeometry args={[1.1, 0.5, 9]} />
          <Std c={w.metal} />
        </mesh>
      </group>
      {/* AC units with spinning fans */}
      {[-3.2, -2.1].map((x, i) => (
        <group key={i} position={[x, 0.35, -2 - i * 0.3]}>
          <mesh>
            <boxGeometry args={[0.9, 0.7, 0.7]} />
            <Std c={w.metal} />
          </mesh>
          <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, f * 0.4 + i]}>
            <circleGeometry args={[0.26, 5]} />
            <meshLambertMaterial color={w.building} />
          </mesh>
        </group>
      ))}
      {/* antenna mast */}
      <mesh position={[-4.6, 2.2, -3.8]}>
        <cylinderGeometry args={[0.05, 0.09, 4.4, 5]} />
        <Std c={w.metal} />
      </mesh>
      <mesh position={[-4.6, 4.45, -3.8]}>
        <sphereGeometry args={[0.13, 6, 4]} />
        <meshBasicMaterial color={Math.floor(f / 18) % 2 ? "#ff3b4f" : "#3a0a10"} />
      </mesh>
      {/* string lights */}
      {new Array(bulbs).fill(0).map((_, i) => {
        const t = i / (bulbs - 1);
        const x = -4.5 + t * 9;
        const y = 2.9 - Math.sin(t * Math.PI) * 0.55;
        const on = 0.75 + 0.25 * Math.sin(f * 0.2 + i * 1.3) + pulse * 0.4;
        return (
          <mesh key={i} position={[x, y, -0.8]}>
            <sphereGeometry args={[0.06, 6, 4]} />
            <meshBasicMaterial color={i % 4 === 2 ? accent : w.key} transparent opacity={Math.min(1, on)} />
          </mesh>
        );
      })}
      <pointLight position={[0, 2.4, 0]} color={w.key} intensity={w.keyI * (4 + pulse * 2)} distance={8} decay={1.3} />
      <Skyline w={w} f={f} origin={[0, -2, -8]} />
      {/* moon / sun */}
      <mesh position={[9, 15, -48]}>
        <icosahedronGeometry args={[3, 1]} />
        <meshBasicMaterial color={w.stars ? "#FFF3D6" : "#FFFFFF"} />
      </mesh>
    </group>
  );
};

/** Abstract stage for data beats: podium, glowing rings, orbiting shapes, light pulses. */
export const StageSet: React.FC<{ w: WorldPalette; f: number; pulse: number; down: number; accent: string; accent2: string }> = ({ w, f, pulse, down, accent, accent2 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[18, 24]} />
      <Std c={w.floor} r={0.9} />
    </mesh>
    {new Array(10).fill(0).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[2.2 + i * 1.4, 2.24 + i * 1.4, 40]} />
        <meshBasicMaterial color={accent2} transparent opacity={0.25 - i * 0.02 + (i === Math.floor(f / 4) % 10 ? 0.25 : 0)} />
      </mesh>
    ))}
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[1.6, 1.75, 0.4, 10]} />
      <Std c={w.wall} />
    </mesh>
    <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.62, 0.03, 4, 40]} />
      <meshBasicMaterial color={accent} />
    </mesh>
    {/* back arch */}
    <mesh position={[0, 0, -4]}>
      <torusGeometry args={[4.6, 0.14, 6, 30, Math.PI]} />
      <meshLambertMaterial color={accent2} emissive={accent2} emissiveIntensity={1.2 + down * 2} />
    </mesh>
    {/* orbiting rings */}
    {[0, 1].map((i) => (
      <mesh key={i} position={[0, 1.5, 0]} rotation={[1.2 + i * 0.5, f * 0.012 * (i ? -1 : 1), 0.3 * i]}>
        <torusGeometry args={[2.4 + i * 0.6, 0.025, 4, 48]} />
        <meshBasicMaterial color={i ? accent : accent2} transparent opacity={0.7} />
      </mesh>
    ))}
    {/* floating shapes */}
    {new Array(9).fill(0).map((_, i) => {
      const a = (i / 9) * Math.PI * 2 + f * 0.006;
      const r = 4 + (i % 3);
      const s = 0.25 + (i % 3) * 0.12 + pulse * 0.05;
      return (
        <mesh key={i} position={[Math.cos(a) * r, 1.4 + Math.sin(f * 0.04 + i) * 0.5 + (i % 3), Math.sin(a) * r - 1]} rotation={[f * 0.02 + i, f * 0.015, 0]} scale={s}>
          {i % 3 === 0 ? <icosahedronGeometry args={[1, 0]} /> : i % 3 === 1 ? <octahedronGeometry args={[1, 0]} /> : <boxGeometry args={[1.2, 1.2, 1.2]} />}
          <Std c={[accent, accent2, w.metal][i % 3]} e={[accent, accent2, w.metal][i % 3]} ei={0.25} />
        </mesh>
      );
    })}
    <pointLight position={[-3, 3, 2]} color={accent} intensity={6 + pulse * 10} distance={12} decay={1.3} />
    <pointLight position={[3, 3, 2]} color={accent2} intensity={6 + down * 12} distance={12} decay={1.3} />
  </group>
);

/** Falling particles (snow / dust / pollen) + star dome. Always moving. */
export const Atmosphere: React.FC<{ w: WorldPalette; f: number; center: [number, number, number]; energy: number }> = ({ w, f, center, energy }) => {
  const N = 260;
  const base = useMemo(() => new Array(N).fill(0).map((_, i) => [random(`ax${i}`), random(`ay${i}`), random(`az${i}`), random(`as${i}`)]), []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = new Float32Array(N * 3);
  base.forEach(([x, y, z, s], i) => {
    const H = 9;
    const yy = (((y * H - f * (0.012 + s * 0.02) * (1 + energy)) % H) + H) % H;
    pos[i * 3] = center[0] + (x - 0.5) * 14 + Math.sin(f * 0.02 + i) * 0.2;
    pos[i * 3 + 1] = yy;
    pos[i * 3 + 2] = center[2] + (z - 0.5) * 12;
  });
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const th = random(`st${i}`) * Math.PI * 2;
      const ph = random(`sp${i}`) * Math.PI * 0.45;
      p[i * 3] = Math.cos(th) * Math.cos(ph) * 80;
      p[i * 3 + 1] = Math.sin(ph) * 80 + 5;
      p[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 80;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <>
      <points geometry={geo}>
        <pointsMaterial color={w.particles} size={0.045} transparent opacity={0.8} sizeAttenuation />
      </points>
      {w.stars ? (
        <points geometry={stars} position={[center[0], 0, center[2]]} rotation={[0, f * 0.0008, 0]}>
          <pointsMaterial color="#ffffff" size={0.35} transparent opacity={0.85} sizeAttenuation fog={false} />
        </points>
      ) : null}
    </>
  );
};
