# Beat reference

A script is `{ "meta": {...}, "beats": [ ... ] }`. Duration is computed automatically; never set frames by hand.

```json
{
  "meta": {
    "title": "internal name",
    "theme": "midnight | paper | terminal | editorial",
    "tempo": "chill | fast | hyper",
    "mascot": true,
    "mascotName": "Blip",
    "progress": true,
    "handle": "@yourhandle",
    "world": "3d",
    "music": { "volume": 0.55 },
    "sfx": true
  },
  "beats": []
}
```

Fields every beat accepts:
- `hold`: duration multiplier (0.7–1.5). Use 0.8 to tighten a beat that's obvious and 1.3 to let a key line land.
- `transition`: `auto` (default) | `push` | `zoom` | `whip` | `drop` | `cut`. This is how the beat **enters**; the previous beat exits in the matching direction. Beat 1 and `punch` beats default to `cut` with a flash.
- `mascot`: `neutral | happy | shocked | sad | smug | think | angry`. This is the mascot's reaction, shown on beats that support it. In 3D, the 3D Blip wears this mood; dialog without a `speaker` makes Blip "talk".
- `shot` (3D): `auto | push-in | pull-out | orbit | crane-up | crane-down | dutch-push | snap-zoom | whip | truck | low-hero | top-down | vertigo | spiral | screen`. See `camera-and-music.md`.
- `set` (3D): `auto | desk | rooftop | stage`.

Emphasis: wrap words in `*asterisks*` → accent color + marker underline. Use one per beat.

---

## `hook`: scroll-stopper (always beat 1)
Words slam in one by one with a micro screen-shake. An optional `kicker` pill sits above ("POV", "Jumat 16:59", "Myth #1").
```json
{ "type": "hook", "kicker": "POV", "text": "Lu nyuruh AI *benerin 1 bug*", "mascot": "smug" }
```
At most 8 words. Create a gap the viewer needs closed.

## `statement`: one clear sentence (+ optional `sub`)
The workhorse. `sub` is a smaller, dimmer line that explains or adds nuance.
```json
{ "type": "statement", "text": "Namanya *lifestyle creep*.", "sub": "Pengeluaran ikut naik diam-diam.", "mascot": "think" }
```

## `dialog`: a character speaks (speech bubble + big mascot)
Good for skits, POV, and personifying a product, an AI, or your brain/wallet/body. `speaker` defaults to `mascotName`. When the *viewer* speaks, set `"speaker": "Lu"` / `"You"`; the mascot then reacts with its mood.
```json
{ "type": "dialog", "speaker": "Lu", "text": "Halaman *login* gue mana?", "mascot": "shocked" }
```

## `stat`: number count-up with a ring
`suffix: "%"` makes the ring fill to that percentage. Otherwise the ring sweeps fully.
```json
{ "type": "stat", "value": 50, "suffix": " ms", "label": "Waktu otak bikin kesan pertama" }
{ "type": "stat", "value": 2.5, "prefix": "Rp", "suffix": " jt", "decimals": 1, "label": "..." }
```
Only use real or clearly-labelled example numbers.

## `list`: 1–5 rapid items, the active one highlighted
Items arrive one at a time. Earlier items dim, so the eye always knows where to look. Keep items to 6 words or fewer.
```json
{ "type": "list", "title": "3 hal yang kebaca dalam sekejap:", "items": ["Kontras warna", "Ruang kosong", "1 titik fokus"] }
```

## `compare`: A vs B (stacked panels + spinning VS)
`winner: "left" | "right"` dims the loser and badges the winner partway through the beat.
```json
{ "type": "compare",
  "left":  { "label": "Dulu",     "text": "Edit 3 jam per video" },
  "right": { "label": "Sekarang", "text": "Tulis naskah, render 2 menit" },
  "winner": "right" }
```

## `ui`: app/terminal window that types itself
3D-tilted window with typed lines and a status pill. When typing finishes, `error` makes the window shake and glow red, and `success` glows green. Line colors are automatic: `$`/`>` → command color, `✓` → green, `✗`/`error` → red.
```json
{ "type": "ui", "title": "my-app — build", "caption": "Lu cek dulu...",
  "lines": ["$ npm run build", "✓ bug #42 fixed", "✗ 37 errors found"], "status": "error" }
```
Use it for anything with software in it: dashboards, banking apps (write the lines as "Saldo: Rp 0"), search results, notifications.

## `chat`: messaging thread with typing indicator
`from: "me"` = right/colored bubble and `from: "them"` = left. `them` is the contact name. Up to 5 messages; 3 is the sweet spot.
```json
{ "type": "chat", "them": "Bos", "messages": [
  { "from": "them", "text": "Web kok mati?" },
  { "from": "me", "text": "Lagi maintenance pak" } ] }
```

## `punch`: full-screen pattern interrupt
An accent color floods the screen and the text slams in. Lines of 4 words or fewer are auto-uppercased. Use it for the twist, the moral, or the line people will screenshot. Use 1–2 per video.
```json
{ "type": "punch", "text": "Bayar diri lu dulu." }
```

## `cta`: closing action
A pulsing button with an arrow. Match `button` to the goal: Follow, Save, Share, Comment, Link in bio.
```json
{ "type": "cta", "text": "Pernah ngalamin juga?", "sub": "Tulis di komen", "button": "Follow buat part 2", "mascot": "happy" }
```

---

### Choosing beats fast
| You want to… | Beat |
|---|---|
| open / stop the scroll | `hook` |
| explain one idea | `statement` |
| make it a story / skit | `dialog`, `chat` |
| prove it | `stat`, `ui` |
| contrast | `compare` |
| give steps / tips | `list` |
| twist / moral / reset attention | `punch` |
| close | `cta` |
