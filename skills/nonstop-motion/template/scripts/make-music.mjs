/**
 * Procedural, royalty-free music + SFX generator (no dependencies).
 * Every track starts on a kick at t=0 and stays on a strict BPM grid, so the
 * video's cuts (quantized to the same grid) land exactly on the beat.
 *
 *   node scripts/make-music.mjs                 → generates the 3 default tracks + SFX
 *   node scripts/make-music.mjs --bpm 124 --bars 24 --style fast --out public/music/custom.wav
 *
 * styles: chill (half-time lo-fi), fast (four-on-the-floor synth-pop), hyper (fast, busy, trap hats)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const SR = 44100;

// ---------- helpers ----------
const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

function writeWav(path, L, R) {
  mkdirSync(dirname(path), { recursive: true });
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

function master(L, R, gain = 0.9) {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak > 0 ? gain / peak : 1;
  for (let i = 0; i < L.length; i++) {
    L[i] = Math.tanh(L[i] * g * 1.2) / Math.tanh(1.2);
    R[i] = Math.tanh(R[i] * g * 1.2) / Math.tanh(1.2);
  }
  // 15 ms fade-in / 600 ms fade-out
  const fi = Math.round(SR * 0.015), fo = Math.round(SR * 0.6);
  for (let i = 0; i < fi; i++) { L[i] *= i / fi; R[i] *= i / fi; }
  for (let i = 0; i < fo; i++) { const k = (L.length - 1 - i); L[k] *= i / fo; R[k] *= i / fo; }
}

// ---------- instruments (add into stereo buffers) ----------
function kick(L, R, t0, amp = 1) {
  const s = Math.round(t0 * SR), len = Math.round(0.42 * SR);
  let ph = 0;
  for (let i = 0; i < len && s + i < L.length; i++) {
    const t = i / SR;
    const f = 45 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 7.5);
    const click = i < 90 ? (1 - i / 90) * 0.35 : 0;
    const v = (Math.sin(ph) * env + click) * amp;
    L[s + i] += v; R[s + i] += v;
  }
}
function noiseHit(L, R, t0, { dur, decay, amp, hp = 0.6, pan = 0, rnd }) {
  const s = Math.round(t0 * SR), len = Math.round(dur * SR);
  let prev = 0;
  for (let i = 0; i < len && s + i < L.length; i++) {
    const t = i / SR;
    const n = rnd() * 2 - 1;
    const h = n - prev * hp; // crude high-pass
    prev = n;
    const v = h * Math.exp(-t * decay) * amp;
    L[s + i] += v * (1 - pan); R[s + i] += v * (1 + pan);
  }
}
function clap(L, R, t0, rnd, amp = 0.26) {
  for (const o of [0, 0.011, 0.023]) noiseHit(L, R, t0 + o, { dur: 0.25, decay: o === 0.023 ? 24 : 70, amp, hp: 0.7, rnd });
  // body tone
  const s = Math.round(t0 * SR), len = Math.round(0.12 * SR);
  for (let i = 0; i < len && s + i < L.length; i++) {
    const v = Math.sin((2 * Math.PI * 190 * i) / SR) * Math.exp((-i / SR) * 30) * 0.25 * amp;
    L[s + i] += v; R[s + i] += v;
  }
}
function voice(L, R, t0, dur, freq, { amp = 0.2, cutoff = 0.08, attack = 0.01, release = 0.1, detune = 0.007, pan = 0, wave = "saw", duck }) {
  const s = Math.round(t0 * SR), len = Math.round((dur + release) * SR);
  let lp1 = 0, lp2 = 0, p1 = 0, p2 = 0;
  for (let i = 0; i < len && s + i < L.length; i++) {
    const t = i / SR;
    p1 = (p1 + (freq * (1 + detune)) / SR) % 1;
    p2 = (p2 + (freq * (1 - detune)) / SR) % 1;
    let o;
    if (wave === "square") o = (p1 < 0.5 ? 1 : -1) * 0.5 + (p2 < 0.5 ? 1 : -1) * 0.5;
    else if (wave === "sine") o = Math.sin(p1 * 2 * Math.PI);
    else o = (2 * p1 - 1) * 0.5 + (2 * p2 - 1) * 0.5;
    lp1 += cutoff * (o - lp1);
    lp2 += cutoff * (lp1 - lp2);
    let env = t < attack ? t / attack : 1;
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / release);
    const d = duck ? duck(t0 + t) : 1;
    const v = lp2 * env * amp * d;
    L[s + i] += v * (1 - pan); R[s + i] += v * (1 + pan);
  }
}

// ---------- song ----------
function song({ bpm, bars, style, seed = 7 }) {
  const rnd = seeded(seed);
  const spb = 60 / bpm;
  const total = bars * 4 * spb + 1.2;
  const L = new Float32Array(Math.ceil(total * SR));
  const R = new Float32Array(L.length);
  // A minor: Am – F – C – G   (roots + triads)
  const prog = [
    { root: 45, chord: [57, 60, 64] },
    { root: 41, chord: [57, 60, 65] },
    { root: 48, chord: [55, 60, 64] },
    { root: 43, chord: [55, 59, 62] },
  ];
  const kickTimes = [];
  const halfTime = style === "chill";
  for (let b = 0; b < bars; b++) {
    for (let q = 0; q < 4; q++) {
      const t = (b * 4 + q) * spb;
      if (!halfTime || q === 0 || (q === 2 && b % 2 === 1)) kickTimes.push(t);
      if (halfTime && q === 2 && b % 2 === 0) kickTimes.push(t + spb * 0.5);
    }
  }
  const duck = (t) => {
    let d = 1;
    for (let k = kickTimes.length - 1; k >= 0; k--) {
      if (kickTimes[k] <= t) { const dt = t - kickTimes[k]; d = 0.35 + 0.65 * Math.min(1, dt / (spb * 0.45)); break; }
    }
    return d;
  };
  for (const t of kickTimes) kick(L, R, t, style === "hyper" ? 1.05 : 1);

  for (let b = 0; b < bars; b++) {
    const c = prog[b % 4];
    const bt = b * 4 * spb;
    const intro = b === 0;
    // claps / snares
    if (halfTime) clap(L, R, bt + 2 * spb, rnd, 0.24);
    else { clap(L, R, bt + spb, rnd); clap(L, R, bt + 3 * spb, rnd); }
    // hats
    const steps = style === "hyper" ? 16 : 8;
    for (let h = 0; h < steps; h++) {
      const t = bt + (h * 4 * spb) / steps;
      const off = steps === 8 ? h % 2 === 1 : h % 4 === 2;
      let amp = off ? 0.22 : 0.09;
      if (style === "hyper" && b % 2 === 1 && h >= 12) {
        // trap roll on the last beat of every other bar
        for (let r = 0; r < 3; r++) noiseHit(L, R, t + (r * spb) / 12, { dur: 0.04, decay: 90, amp: 0.12, hp: 0.95, pan: 0.3, rnd });
        continue;
      }
      noiseHit(L, R, t, { dur: 0.06, decay: off ? 55 : 80, amp, hp: 0.95, pan: 0.25, rnd });
    }
    // open hat / ride lift on bars 4n+3
    if (b % 4 === 3 && !halfTime) noiseHit(L, R, bt + 3.5 * spb, { dur: 0.35, decay: 9, amp: 0.15, hp: 0.95, pan: -0.2, rnd });
    // bass
    const bassSteps = halfTime ? 2 : 8;
    for (let k = 0; k < bassSteps; k++) {
      const t = bt + (k * 4 * spb) / bassSteps;
      const note = c.root - 12 + (style !== "chill" && k % 4 === 3 ? 12 : 0);
      voice(L, R, t, ((4 * spb) / bassSteps) * 0.8, midi(note), {
        amp: halfTime ? 0.55 : 0.45, cutoff: halfTime ? 0.03 : 0.06, wave: halfTime ? "sine" : "saw", release: 0.05, duck,
      });
    }
    // pad
    for (const [i, n] of c.chord.entries()) {
      voice(L, R, bt, 4 * spb, midi(n), { amp: 0.11, cutoff: halfTime ? 0.025 : 0.04, attack: 0.25, release: 0.4, detune: 0.011, pan: (i - 1) * 0.5, duck });
    }
    // arp / pluck (not in intro bar)
    if (!intro) {
      const arpSteps = style === "chill" ? 8 : 16;
      const pattern = [0, 1, 2, 1, 2, 0, 2, 1];
      for (let k = 0; k < arpSteps; k++) {
        const t = bt + (k * 4 * spb) / arpSteps;
        if (style === "chill" && rnd() < 0.35) continue;
        const n = c.chord[pattern[k % 8]] + 12 + (k % 8 === 7 ? 12 : 0);
        voice(L, R, t, (spb / (arpSteps / 4)) * 0.4, midi(n), {
          amp: style === "chill" ? 0.07 : 0.06, cutoff: 0.18, attack: 0.002, release: 0.12, wave: style === "chill" ? "sine" : "square", pan: k % 2 ? 0.4 : -0.4, duck,
        });
      }
    }
  }
  master(L, R);
  return { L, R };
}

// ---------- SFX ----------
function whoosh(rnd) {
  const dur = 0.45;
  const L = new Float32Array(Math.round(dur * SR)), R = new Float32Array(L.length);
  let lp = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR, p = t / dur;
    const c = 0.02 + 0.5 * Math.sin(Math.PI * p) ** 2;
    lp += c * ((rnd() * 2 - 1) - lp);
    const env = Math.sin(Math.PI * Math.min(1, p * 1.2)) ** 2;
    L[i] = lp * env * (1 - p * 0.6); R[i] = lp * env * (0.4 + p * 0.6);
  }
  master(L, R, 0.8);
  return { L, R };
}
function impact(rnd) {
  const dur = 1.1;
  const L = new Float32Array(Math.round(dur * SR)), R = new Float32Array(L.length);
  kick(L, R, 0, 1.2);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = (rnd() * 2 - 1) * Math.exp(-t * 5) * 0.35 + Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 3) * 0.4;
    L[i] += v; R[i] += v;
  }
  master(L, R, 0.9);
  return { L, R };
}
function pop(rnd) {
  const dur = 0.18;
  const L = new Float32Array(Math.round(dur * SR)), R = new Float32Array(L.length);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (300 + 900 * Math.exp(-t * 40))) / SR;
    const v = Math.sin(ph) * Math.exp(-t * 28) * 0.8;
    L[i] = v; R[i] = v;
  }
  master(L, R, 0.7);
  return { L, R };
}

// ---------- CLI ----------
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
if (args.bpm) {
  const bpm = Number(args.bpm), bars = Number(args.bars ?? 24), style = args.style ?? "fast";
  const out = args.out ?? `public/music/custom-${style}-${bpm}.wav`;
  const { L, R } = song({ bpm, bars, style, seed: Number(args.seed ?? 7) });
  writeWav(out, L, R);
  console.log(`✓ ${out}  (${bpm} bpm, ${bars} bars, ${style})`);
} else {
  for (const [style, bpm, bars] of [["chill", 92, 20], ["fast", 118, 24], ["hyper", 140, 28]]) {
    const out = `public/music/nm-${style}-${bpm}.wav`;
    const { L, R } = song({ bpm, bars, style });
    writeWav(out, L, R);
    console.log(`✓ ${out}`);
  }
  const rnd = seeded(99);
  for (const [name, fn] of [["whoosh", whoosh], ["impact", impact], ["pop", pop]]) {
    const { L, R } = fn(rnd);
    writeWav(`public/sfx/${name}.wav`, L, R);
    console.log(`✓ public/sfx/${name}.wav`);
  }
}
