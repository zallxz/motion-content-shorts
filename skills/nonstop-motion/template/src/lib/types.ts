import { z } from "zod";

export const moodSchema = z.enum([
  "neutral",
  "happy",
  "shocked",
  "sad",
  "smug",
  "think",
  "angry",
]);
export type Mood = z.infer<typeof moodSchema>;

export const transitionSchema = z.enum([
  "auto",
  "push",
  "zoom",
  "whip",
  "drop",
  "cut",
]);

export const shotSchema = z.enum([
  "auto",
  "push-in",
  "pull-out",
  "orbit",
  "crane-up",
  "crane-down",
  "dutch-push",
  "snap-zoom",
  "whip",
  "truck",
  "low-hero",
  "top-down",
  "vertigo",
  "spiral",
  "screen",
]);
export type ShotName = z.infer<typeof shotSchema>;
export const setSchema = z.enum(["auto", "desk", "rooftop", "stage"]);
export type SetName = z.infer<typeof setSchema>;

const base = {
  /** 3D camera move for this beat (world: "3d"). "auto" picks a fitting, non-repeating shot. */
  shot: shotSchema.optional(),
  /** 3D location for this beat. "auto" picks by beat type. */
  set: setSchema.optional(),
  /** Multiplies the auto-computed duration. 1 = auto. 0.8 = faster, 1.3 = linger. */
  hold: z.number().optional(),
  /** How this beat ENTERS. "auto" rotates through a set so cuts never feel the same. */
  transition: transitionSchema.optional(),
  /** Optional mascot reaction shown on beats that support it. */
  mascot: moodSchema.optional(),
};

export const beatSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hook"),
    text: z.string(),
    kicker: z.string().optional(),
    ...base,
  }),
  z.object({
    type: z.literal("statement"),
    text: z.string(),
    sub: z.string().optional(),
    ...base,
  }),
  z.object({
    type: z.literal("dialog"),
    speaker: z.string().optional(),
    text: z.string(),
    ...base,
  }),
  z.object({
    type: z.literal("stat"),
    value: z.number(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    decimals: z.number().optional(),
    label: z.string(),
    ...base,
  }),
  z.object({
    type: z.literal("list"),
    title: z.string(),
    items: z.array(z.string()).min(1).max(5),
    ...base,
  }),
  z.object({
    type: z.literal("compare"),
    left: z.object({ label: z.string(), text: z.string() }),
    right: z.object({ label: z.string(), text: z.string() }),
    winner: z.enum(["left", "right", "none"]).optional(),
    ...base,
  }),
  z.object({
    type: z.literal("ui"),
    title: z.string(),
    lines: z.array(z.string()).min(1).max(7),
    status: z.enum(["error", "success", "running", "none"]).optional(),
    caption: z.string().optional(),
    ...base,
  }),
  z.object({
    type: z.literal("chat"),
    messages: z
      .array(z.object({ from: z.enum(["me", "them"]), text: z.string() }))
      .min(1)
      .max(5),
    them: z.string().optional(),
    ...base,
  }),
  z.object({
    type: z.literal("punch"),
    text: z.string(),
    ...base,
  }),
  z.object({
    type: z.literal("cta"),
    text: z.string(),
    sub: z.string().optional(),
    button: z.string().optional(),
    ...base,
  }),
]);
export type Beat = z.infer<typeof beatSchema>;

export const scriptSchema = z.object({
  meta: z.object({
    title: z.string(),
    theme: z.enum(["midnight", "paper", "terminal", "editorial"]),
    tempo: z.enum(["chill", "fast", "hyper"]),
    mascot: z.boolean().optional(),
    mascotName: z.string().optional(),
    progress: z.boolean().optional(),
    handle: z.string().optional(),
    /** "3d" = low-poly world + cinematic camera behind the graphics (default). "flat" = 2D only, renders ~3× faster. */
    world: z.enum(["3d", "flat"]).optional(),
    /** Background music. Omit = default track for the tempo. false = silent. */
    music: z
      .union([
        z.literal(false),
        z.object({ file: z.string().optional(), bpm: z.number().optional(), volume: z.number().optional(), halfTime: z.boolean().optional() }),
      ])
      .optional(),
    /** Whoosh on cuts, impact on hook/punch. Default true. */
    sfx: z.boolean().optional(),
  }),
  beats: z.array(beatSchema).min(1),
});
export type Script = z.infer<typeof scriptSchema>;
