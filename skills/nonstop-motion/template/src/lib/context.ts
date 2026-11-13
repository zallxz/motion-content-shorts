import { createContext, useContext } from "react";
import { THEMES, Theme } from "./themes";
import { TEMPO, Tempo } from "./timing";

export type Ctx = { theme: Theme; tempo: Tempo; mascot: boolean; mascotName: string; world3d: boolean; dark: boolean };
export const StyleCtx = createContext<Ctx>({
  theme: THEMES.midnight,
  tempo: TEMPO.fast,
  mascot: true,
  mascotName: "Blip",
  world3d: false,
  dark: true,
});
export const useStyle = () => useContext(StyleCtx);

/** Props every beat receives. `f` = local frame, `dur` = frames until exit starts. */
export type BeatProps<B> = { beat: B; f: number; dur: number; index: number };
