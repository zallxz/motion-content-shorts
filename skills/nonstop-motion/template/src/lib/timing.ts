import type { Beat, Script } from "./types";
import { Grid, MUSIC } from "./music";

/**
 * TEMPO SYSTEM — "fast but still readable".
 * wps     : words-per-second the viewer must read (comfortable on-screen reading ≈ 3–4 wps for short lines)
 * min     : floor for any beat (seconds) — below this the brain can't register a shot
 * pad     : reaction time added to every beat (eye has to find the text first)
 * overlap : frames the outgoing beat overlaps the incoming one (no dead frames between shots)
 * stagger : frames between each word pop-in
 */
export const TEMPO = {
  chill: { wps: 2.6, min: 1.6, pad: 0.6, overlap: 10, stagger: 3 },
  fast: { wps: 3.5, min: 1.0, pad: 0.45, overlap: 7, stagger: 2 },
  hyper: { wps: 4.0, min: 0.75, pad: 0.3, overlap: 5, stagger: 1.5 },
} as const;
export type TempoName = keyof typeof TEMPO;
export type Tempo = (typeof TEMPO)[TempoName];

export const stripMarks = (s: string) => s.replace(/\*/g, "");

export const countWords = (s: string) =>
  stripMarks(s)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((acc, w) => acc + (/\d/.test(w) ? 1.5 : 1), 0);

/** Seconds of reading load + fixed "extra" time for things that animate (counters, typing, stagger). */
const load = (b: Beat, t: Tempo): { words: number; extra: number } => {
  switch (b.type) {
    case "hook":
      return { words: countWords(b.text) + (b.kicker ? countWords(b.kicker) : 0), extra: 0.25 };
    case "statement":
      return { words: countWords(b.text) + (b.sub ? countWords(b.sub) * 0.7 : 0), extra: 0 };
    case "dialog":
      return { words: countWords(b.text), extra: 0.15 };
    case "stat":
      return { words: countWords(b.label) + 1, extra: 0.55 };
    case "list":
      return {
        words: countWords(b.title) + b.items.reduce((a, i) => a + countWords(i), 0),
        extra: b.items.length * (t.stagger * 0.06),
      };
    case "compare":
      return {
        words:
          countWords(b.left.label) + countWords(b.left.text) + countWords(b.right.label) + countWords(b.right.text),
        extra: 0.35,
      };
    case "ui":
      return {
        words: b.lines.reduce((a, l) => a + countWords(l) * 0.35, 0) + (b.caption ? countWords(b.caption) : 0),
        extra: 0.3 + b.lines.length * 0.1,
      };
    case "chat":
      return {
        words: b.messages.reduce((a, m) => a + countWords(m.text), 0),
        extra: b.messages.length * 0.25,
      };
    case "punch":
      return { words: countWords(b.text), extra: 0 };
    case "cta":
      return { words: countWords(b.text) + (b.sub ? countWords(b.sub) : 0), extra: 0.9 };
  }
};

export const beatSeconds = (b: Beat, t: Tempo) => {
  const { words, extra } = load(b, t);
  const raw = Math.max(t.min, t.pad + words / t.wps + extra);
  return raw * (b.hold ?? 1);
};

export type ScheduledBeat = { beat: Beat; index: number; start: number; dur: number };

export const gridFor = (script: Script): Grid => {
  const def = MUSIC[script.meta.tempo];
  const m = script.meta.music;
  const bpm = (m && m.bpm) || def.bpm;
  const halfTime = m && m.halfTime !== undefined ? m.halfTime : m && m.file ? false : def.halfTime;
  return { bpm, spb: 60 / bpm, halfTime };
};

/**
 * Beats are QUANTIZED to the music grid: each beat lasts a whole number of musical beats
 * (rounded UP, so readability is never sacrificed). Every cut therefore lands on a kick.
 * Starts are computed in seconds and rounded once, so there is no drift over the video.
 */
export const schedule = (script: Script, fps: number) => {
  const t = TEMPO[script.meta.tempo];
  const g = gridFor(script);
  let beatCursor = 0;
  const startFrames: number[] = [];
  for (const beat of script.beats) {
    startFrames.push(Math.round(beatCursor * g.spb * fps));
    const need = beatSeconds(beat, t) / g.spb;
    beatCursor += Math.max(1, Math.ceil(need - 0.12)); // 0.12 beat tolerance avoids adding a whole beat for a hair
  }
  const endFrame = Math.round(beatCursor * g.spb * fps);
  const items: ScheduledBeat[] = script.beats.map((beat, index) => ({
    beat,
    index,
    start: startFrames[index],
    dur: (index + 1 < startFrames.length ? startFrames[index + 1] : endFrame) - startFrames[index],
  }));
  // tail: ring out for one more musical beat
  const total = endFrame + Math.round(g.spb * fps);
  return { items, total, tempo: t, grid: g };
};
