# Style principles

The visual language of Nonstop Motion and the reasoning behind each choice. These principles are drawn from what works in high-retention short-form animation in general. The skill does not imitate any particular creator.

## 1. Mood world + warm focal accent
A cohesive world (night city, sunny pastel, neon terminal, clean clay) sets the mood instantly. Inside it, **one warm accent color** marks what matters: the emphasized word, the button, the lamp, the antenna bulb. The eye always knows where to land.
→ The `theme` sets the world palette plus `accent`. `*emphasis*` uses the accent.

## 2. A character turns information into a story
People follow characters, not bullet points. A simple, expressive mascot gives facts an emotional reaction (shocked at a number, smug at a punchline) and turns tips into mini-skits.
→ **Blip** is an original faceted squircle bot with an antenna bulb and 7 moods, in both 2D and 3D. It can be renamed, recolored or turned off.

## 3. Real interface moments make it credible
A typed terminal, a chat thread, or a failing build status grounds a joke or claim in everyday reality. The viewer recognizes their own life on screen.
→ `ui` and `chat` beats, with typing, status reactions and a shake on errors.

## 4. Nothing is ever still
Even a "holding" shot keeps moving through particles, light flicker, camera drift and character idle. This separates motion graphics from slides.
→ Camera, world, graphics layer and content each move on their own, at all times.

## 5. Rhythm = comprehension at speed
Fast pacing works when it's **regular**. Cuts on the beat feel intentional, and the brain predicts the next change instead of being startled by it.
→ Durations are computed from reading load and then locked to the music grid, with a camera punch on each kick.

## 6. Cinematic vocabulary, used briskly
Classic camera language (dolly, crane, dutch angle, dolly-zoom, whip) carries meaning: tension, reveal, realization. Here it runs at short-form speed, one move per beat and never the same move twice in a row.
→ 14-shot library in `three/shots.ts`.

## 7. Short lines, one idea per beat
On-screen text stays at 12 words or fewer, centered, high contrast, and in the top half of a vertical frame (the character and world own the bottom half).
→ Linter rules and `fitSize()`.

## 8. Sound-off first, sound-on better
Everything important is readable without audio. With audio, the generated soundtrack and SFX make the edit feel tight.
