---
name: nonstop-motion
description: Make full-motion-graphics vertical videos (Reels, Shorts, TikTok) on any topic. They combine a low-poly 3D world, cinematic camera shots, a 3D mascot and kinetic graphics, with every cut synced to music. Fast-paced but easy to follow, with no static frames. Use for motion-graphic shorts or reels, animated explainers, faceless short-form videos, or turning an idea, fact, tip, story or product into a 9:16 clip.
---

# Nonstop Motion

Turns a topic into a **15–40 s vertical motion-graphics video** that:
1. **Stops the scroll** in the first 0.5 s (frame 0 already shows the hook, never a fade from black).
2. **Never stands still.** Three motion layers run at all times (camera, ambient, content).
3. **Moves fast but stays readable.** Each beat's length is *computed* from how many words it has, so every line stays on screen long enough to read and no longer.
4. **Fits any topic.** The beats are generic (hook, stat, list, compare, ui, chat, dialog…). Four themes and three tempos cover tech, finance, education, comedy, product and story content.

Each video is built from two layers:
- **Behind:** a low-poly 3D world with three sets (desk, rooftop, stage), the 3D mascot Blip, and 14 cinematic camera shots (snap-zoom, vertigo dolly-zoom, whip, crane, dutch, orbit…). Each beat gets its own shot.
- **In front:** kinetic typography, UI windows, chat, stat rings, lists and full-screen punches.
- **Sound:** original generated music. Every cut lands on a kick, the camera punches on every beat, and SFX hit on cuts.

The engine is a Remotion project in `template/`. **You do not write animation code for a normal video.** You write `scripts/<slug>.json`, then render.

---

## Workflow (follow in order)

### 1. Brief (ask only what you can't infer)
- **Topic + the one takeaway** the viewer should leave with (a single sentence).
- **Audience + language.** Write in the language the creator posts in, including slang, e.g. Indonesian casual "lu/gw".
- **Goal → CTA:** follow (series), save (useful list), share (relatable), comment (opinion or question).
- **Niche → theme + tempo.** See `references/adaptation.md`.

### 2. Pick a structure
Pick one arc from `references/adaptation.md` (Problem→Twist, Myth→Truth, Story/POV, Listicle, Versus, Number-first, Build-up→Punch), then map it to beats. Target **6–10 beats, 18–35 s**.

### 3. Write the beat script
Read `references/beats.md` for every beat's fields. Hard rules:
- **Beat 1 is always `hook`**, at most 8 words, with a curiosity gap or tension (formulas in `references/retention.md`).
- **One idea per beat.** Keep text beats at 12 words or fewer. If a line is longer, split it into two beats; fast pacing comes from more beats, not more words.
- **Mark one emphasis per beat** with `*asterisks*`. It renders in the accent color with a marker sweep, and the viewer's eye goes there first.
- **Change the beat type at least every 2 beats.** Never put 3 of the same type in a row. Use a `punch` or `stat` as a pattern interrupt about every 3–4 beats.
- **Show, don't caption.** If the topic involves software, use `ui`. A conversation goes in `chat`, numbers go in `stat`, and A-vs-B goes in `compare`.
- **The last beat is `cta`.** Its CTA must match the goal from step 1.
- **Never invent facts.** Mark example numbers as examples ("contoh", "e.g.") or use real, sourced figures.

### 4. Lint, render, QA
`template/` lives next to this SKILL.md. On first use, if `template/node_modules` is missing, run `npm install` there (it takes ~1 min).
```bash
cd template
npm install                                    # first time only
npm run lint:script -- scripts/<slug>.json     # readability, pacing, shot plan, beat-grid timing
npx remotion render NonstopShort out/<slug>-draft.mp4 --props=scripts/<slug>.json --scale=0.4   # fast draft
npx remotion render NonstopShort out/<slug>.mp4 --props=scripts/<slug>.json                 # final 1080×1920
bash scripts/qa-sheet.sh out/<slug>.mp4        # contact sheet → out/<slug>-sheet.png
```
Open the contact sheet and check:
- **Frame 0:** is the hook visible?
- **Each beat:** is the text legible and inside the safe area?
- **Static stretches:** is any shot dead for more than about 1 s?
- **Overlaps:** do any pieces collide?

Fix by editing the JSON first: split beats, use `hold` (0.8 tightens, 1.3 lingers), or change `transition`, `shot` or `set`. Edit code only when the JSON can't express the change. 3D renders take ~1–2 s per frame on a CPU server, so always QA a `--scale=0.4` draft first.

Preview interactively: `npx remotion studio`.

### 5. Deliver
Deliver the MP4, the JSON, and a caption with 3–5 hashtags. Music and SFX are already in the MP4: an original generated track whose BPM matches the tempo. To use a trending sound instead, render with `"music": false` and add the sound in the app; the cuts still follow a 92/118/140 bpm grid.

---

## Themes × tempos

| theme | look | best for |
|---|---|---|
| `midnight` | night-sky indigo, warm amber accents, soft glow, mascot | AI/tech, storytelling, POV skits |
| `paper` | cream paper, black outlines, offset "sticker" shadows | education, science facts, lifestyle, comedy |
| `terminal` | near-black, phosphor green, 3D scrolling grid | dev humor, hacking/security, gaming |
| `editorial` | off-white, serif display, calm lines | finance, business, news, self-improvement |

| tempo | read speed | min beat | feel |
|---|---|---|---|
| `chill` | 2.6 wps | 1.6 s | storytelling, emotional |
| `fast` (default) | 3.5 wps | 1.0 s | most content |
| `hyper` | 4.0 wps | 0.75 s | memes, rapid lists, Gen-Z humor |

`meta.mascot: false` removes the mascot (use it for serious or brand content). `meta.mascotName` renames it.
`meta.world: "flat"` drops the 3D world (2D only, ~3× faster). `meta.music`: `false` or `{ file, bpm, volume }`. `meta.sfx: false` mutes the whooshes.

## Reference files (read when needed)
- `references/beats.md`: every beat type, its fields and when to use it. **Read before writing a script.**
- `references/adaptation.md`: niche → theme/tempo/arc, with ready beat sequences.
- `references/retention.md`: hook formulas, pattern interrupts, loops, CTAs.
- `references/camera-and-music.md`: sets, the 14 camera shots, beat-sync rules, custom music, render speed.
- `references/tempo-and-motion.md`: the timing math and motion principles; read before changing code.
- `references/style-principles.md`: the visual principles behind the look (mood world, accent, character, rhythm).
- `references/originality.md`: rules for staying original (read before any brand/IP request).
- `references/extending.md`: add a theme, beat type, custom mascot, music or voiceover, or other aspect ratios.
