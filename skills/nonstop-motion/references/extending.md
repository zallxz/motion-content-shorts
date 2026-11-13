# Extending the engine

All code is in `template/src/`. Run `npx tsc --noEmit` after changes, then render a still to check:
`npx remotion still NonstopShort out/check.png --props=scripts/x.json --frame=30`

## Add a theme
1. Add an entry to `THEMES` in `src/lib/themes.ts`. Copy the closest theme and change the colors and fonts.
2. Add its name to the `theme` enum in `src/lib/types.ts`.
3. Pick an `ambient` (`stars | dots | grid | lines`) or add a new branch in `components/Ambient.tsx`. Keep it moving with `f`.
4. Brand kits: map the brand's primary color to `accent`, its secondary to `accent2`, and its font to `display`.

## Custom mascot / brand character
`components/Mascot.tsx` is an SVG driven by `mood` + frame. Options:
- Recolor only: change `theme.mascot` colors.
- New shape: replace the body `<rect>` and keep the eye/mouth `switch` blocks. Expressions carry most of the personality.
- Use the brand's own artwork: swap the SVG for `<Img src={staticFile("brand/mascot.png")}/>` and keep the bob/squash wrapper so it still moves.

## Add a 3D set or shot
- **Set:** build it in `src/three/Sets.tsx` from primitives with `flatShading` and Lambert materials (keeps renders fast). Then register its anchor in `SETS` (`shots.ts`) at a free x (e.g. `[80,0,0]`), mount it in `World3D.tsx`, and add it to `setSchema`. Use at most 2 point lights per set.
- **Shot:** add a function to `SHOTS` in `shots.ts`: `(focus, p 0→1, sign ±1, alt) => { pos, target, fov, roll }`. Add it to `shotSchema` and to the `BY_TYPE` lists where it fits.
- **Brand mascot in 3D:** edit `three/Blip3D.tsx` (body is a `RoundedBoxGeometry`). For a modelled character, load a GLB with `useGLTF`-style loading wrapped in `delayRender`, and drive every animation from the frame.

## Add a beat type
1. Add a zod object to `beatSchema` in `types.ts`.
2. Add its reading load in `timing.ts` → `load()`.
3. Write the component (receives `beat, f, dur, index`; drive everything from `f`).
4. Add it to `renderBeat()` in `NonstopShort.tsx` and document it in `references/beats.md`.

Ideas: `quote` (testimonial card), `timeline` (dated steps), `map` (pin drop), `poll` (bar race), `before-after` (wipe slider), `image` (screenshot with Ken Burns + callout circles).

## Music & sound effects
Built in. See `camera-and-music.md` for custom tracks. The SFX files live in `public/sfx/` (regenerate them with `npm run music`, or replace them with your own whoosh/impact). The soundtrack component is `Soundtrack` in `NonstopShort.tsx`.

## Voiceover
Generate per-beat TTS (e.g. ElevenLabs) and measure each clip's length. Then set each beat's duration to `max(computed, voiceLength)`. Add an optional `voice` field to beats, and use `calculateMetadata` with `getAudioDurationInSeconds` / mediabunny to read durations. With a voiceover, captions can be shorter than the spoken line.

## Other formats
- Square 1080×1080 or landscape 1920×1080: register another `<Composition>` with a new width/height in `Root.tsx`. Beats use flex centering, so most adapt; adjust the paddings for safe areas.
- 60 fps: set `FPS = 60` in `Root.tsx`. Timing is in seconds, so it scales automatically.

## Non-Latin text
Add a font that covers the script (e.g. Noto Sans JP/Arabic) to `public/fonts`, register it in `themes.ts`, and append it to the `display`/`body` family fallbacks.
