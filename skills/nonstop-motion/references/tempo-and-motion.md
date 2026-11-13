# Tempo & motion system

## Timing math (`template/src/lib/timing.ts`)
```
seconds = max(min, pad + words / wps + extra) × hold
```
- `words` counts tokens on screen. Numbers count as 1.5 because they're slower to parse.
- `extra` is fixed time for things that animate: counters, typing, list stagger, the CTA button.
- `pad` is the reaction time for the eye to find the text after a cut.

| tempo | wps | min | pad | overlap (frames) | word stagger |
|---|---|---|---|---|---|
| chill | 2.6 | 1.6 s | 0.6 | 10 | 3 |
| fast | 3.5 | 1.0 s | 0.45 | 7 | 2 |
| hyper | 4.0 | 0.75 s | 0.3 | 5 | 1.5 |

Then the result is **quantized to the music grid**: rounded up to whole musical beats (92/118/140 bpm by tempo), so every cut lands on a kick. See `camera-and-music.md`.

Comfortable reading for short on-screen lines is ~3–4 words/s. Above 4.5, people miss words. Above ~12 words per beat, even `hyper` turns into a reading test, so split the beat instead.

## Motion layers (always on)
1. **3D camera** (`three/World3D.tsx`, `three/shots.ts`): one cinematic move per beat, handheld micro-drift, and a FOV punch on every kick. In flat mode, the 2D Ambient layer (`Ambient.tsx`) takes its place.
2. **3D world**: falling particles, a rotating star dome, blinking antennas, spinning fans, pulsing lights, and a bobbing, blinking, squashing mascot that hops at each cut.
3. **2D camera** (`NonstopShort.tsx`): continuous drift of the graphics layer, plus a kick on every cut and a pulse on every beat.
4. **Content** (`Shot.tsx` + beats):
   - **Enter:** push / zoom / whip / drop / cut. Consecutive beats never repeat the same entrance.
   - **Hold:** a slow push-in of about 4.5% over the beat, while words breathe and the mascot bobs, blinks and sways.
   - **Exit:** mirrors the next beat's entrance and overlaps it, so there are no dead frames.

## Motion vocabulary
- Easing: `EASE_OUT` (0.16,1,0.3,1) for arrivals, `EASE_IN` for exits, `BACK` overshoot for UI pops and stickers.
- Words: rise + de-blur + overshoot (`pop`), scale-down impact (`slam`) for hooks and punches, or `type`.
- Impacts: `kick()` decaying impulses drive the camera punch, hook shake and error shake.
- Everything is driven by `useCurrentFrame()`. Never use CSS transitions or animations, `useFrame`, or `Math.random()`; use `random(seed)`.

## Safe areas (1080×1920)
- **Top ~200 px:** platform UI. The progress bar sits at y=130 and the handle at y=160.
- **Bottom ~380 px:** captions, buttons and the username overlay. Keep key content out of it.
- **Sides:** at least 70–80 px.
- Minimum text sizes: headline ≥ 84 px, supporting text ≥ 44 px. `fitSize()` auto-shrinks to fit but never goes below the floor.
