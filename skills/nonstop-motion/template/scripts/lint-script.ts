/**
 * Readability + pacing linter for a beat script.
 * Usage: npm run lint:script -- scripts/my-video.json
 */
import { readFileSync } from "node:fs";
import { scriptSchema } from "../src/lib/types";
import { TEMPO, beatSeconds, countWords, schedule } from "../src/lib/timing";
import { planShots } from "../src/three/shots";

const file = process.argv[2];
if (!file) {
  console.error("usage: npm run lint:script -- scripts/<file>.json");
  process.exit(2);
}

const raw = JSON.parse(readFileSync(file, "utf8"));
const parsed = scriptSchema.safeParse(raw);
if (!parsed.success) {
  console.error("✗ Schema error:\n" + JSON.stringify(parsed.error.issues, null, 2));
  process.exit(1);
}
const s = parsed.data;
const t = TEMPO[s.meta.tempo];
const errors: string[] = [];
const warns: string[] = [];

const mainText = (b: (typeof s.beats)[number]) =>
  "text" in b ? b.text : b.type === "list" ? b.title : b.type === "stat" ? b.label : "";

if (s.beats[0].type !== "hook") errors.push("Beat 1 must be a `hook`.");
if (s.beats[0].type === "hook" && countWords(s.beats[0].text) > 8)
  warns.push(`Hook has ${countWords(s.beats[0].text)} words — aim for ≤ 8.`);
if (s.beats[s.beats.length - 1].type !== "cta") warns.push("Last beat is not a `cta`.");

let total = 0;
let run = 1;
let sincePunch = 0;
s.beats.forEach((b, i) => {
  const sec = beatSeconds(b, t);
  total += sec;
  const w = countWords(mainText(b));
  if (["statement", "dialog", "punch", "cta", "hook"].includes(b.type) && w > 12)
    errors.push(`Beat ${i + 1} (${b.type}) has ${w} words — split it into two beats (max 12).`);
  if (b.type === "list") b.items.forEach((it, k) => countWords(it) > 7 && warns.push(`Beat ${i + 1} item ${k + 1} is long (${countWords(it)} words).`));
  const em = (JSON.stringify(b).match(/\*/g) ?? []).length / 2;
  if (em > 2) warns.push(`Beat ${i + 1} has ${em} emphasis marks — one per beat keeps focus.`);
  if (sec > (b.type === "list" ? 6.5 : 4.5)) warns.push(`Beat ${i + 1} (${b.type}) holds ${sec.toFixed(1)}s — consider splitting for pace.`);
  if (i > 0 && s.beats[i - 1].type === b.type) {
    run++;
    if (run >= 3) errors.push(`Beats ${i - 1}–${i + 1} are 3× \`${b.type}\` in a row — vary the beat type.`);
  } else run = 1;
  sincePunch = ["punch", "stat", "ui", "chat", "compare"].includes(b.type) ? 0 : sincePunch + 1;
  if (sincePunch === 5) warns.push(`No pattern interrupt (punch/stat/ui/chat/compare) for 5 beats around beat ${i + 1}.`);
});

total += 0.4;
if (total < 12) warns.push(`Total ${total.toFixed(1)}s is very short — fine for memes, thin for value content.`);
if (total > 45) warns.push(`Total ${total.toFixed(1)}s — over 45s retention drops; cut or split into parts.`);

const sch = schedule(s, 30);
const plan = planShots(s.beats);
const w3 = (s.meta.world ?? "3d") === "3d";
console.log(`\n${s.meta.title}  ·  theme=${s.meta.theme}  tempo=${s.meta.tempo}  world=${w3 ? "3d" : "flat"}  bpm=${sch.grid.bpm}`);
sch.items.forEach((it, i) => {
  const beats = Math.round(it.dur / 30 / sch.grid.spb);
  const cam = w3 ? `${plan[i].set}/${plan[i].shot}`.padEnd(20) : "";
  console.log(`  ${String(i + 1).padStart(2)}. ${it.beat.type.padEnd(9)} ${(it.dur / 30).toFixed(2)}s (${beats} beats)  ${cam} ${mainText(it.beat).slice(0, 44)}`);
});
console.log(`  total = ${(sch.total / 30).toFixed(1)}s  (cuts locked to the ${sch.grid.bpm} bpm grid)\n`);
warns.forEach((w) => console.log("  ⚠ " + w));
errors.forEach((e) => console.log("  ✗ " + e));
if (!errors.length) console.log(warns.length ? "\n✓ OK with warnings" : "\n✓ Clean");
process.exit(errors.length ? 1 : 0);
