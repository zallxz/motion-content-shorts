import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fonts are bundled locally in public/fonts (all SIL Open Font License) so renders
 * work offline / behind proxies and never wait on Google Fonts.
 */
const FONTS: [string, string, string, string?][] = [
  ["NM Inter", "Inter-500.woff2", "500"],
  ["NM Inter", "Inter-700.woff2", "700"],
  ["NM Inter", "Inter-800.woff2", "800"],
  ["NM Grotesk", "SpaceGrotesk-700.woff2", "700"],
  ["NM Bricolage", "Bricolage-800.woff2", "800"],
  ["NM Mono", "JetBrainsMono-500.woff2", "500"],
  ["NM Mono", "JetBrainsMono-700.woff2", "700"],
  ["NM Serif", "InstrumentSerif-400.woff2", "400"],
  ["NM Serif", "InstrumentSerif-400i.woff2", "400", "italic"],
];
for (const [family, file, weight, style] of FONTS) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style: style ?? "normal" });
}
const inter = { fontFamily: "'NM Inter', sans-serif" };
const grotesk = { fontFamily: "'NM Grotesk', 'NM Inter', sans-serif" };
const bricolage = { fontFamily: "'NM Bricolage', 'NM Inter', sans-serif" };
const mono = { fontFamily: "'NM Mono', monospace" };
const serif = { fontFamily: "'NM Serif', serif" };

export type Ambient = "stars" | "dots" | "grid" | "lines";

/** Colors + light for the 3D world. */
export type WorldPalette = {
  sky: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  ambient: string;
  ambientI: number;
  key: string; // warm practical light (lamps, bulbs)
  keyI: number;
  rim: string; // cool fill / moon light
  rimI: number;
  floor: string;
  wall: string;
  wood: string;
  metal: string;
  building: string;
  windowLit: string;
  windowOff: string;
  particles: string;
  stars: boolean;
};

export type Theme = {
  name: string;
  bg: [string, string];
  text: string;
  dim: string;
  accent: string;
  accent2: string;
  danger: string;
  ok: string;
  mascot: [string, string];
  card: string;
  cardBorder: string;
  /** "glow" = soft light, "hard" = sticker/brutalist offset shadow */
  depth: "glow" | "hard";
  ambient: Ambient;
  display: string;
  body: string;
  mono: string;
  displayWeight: number;
  displayTracking: string;
  /** uppercase hooks/punches? */
  shout: boolean;
  world: WorldPalette;
};

export const THEMES: Record<string, Theme> = {
  /** Night-diorama mood: cool indigo world, warm amber accents, soft glow. */
  midnight: {
    name: "midnight",
    bg: ["#070A1F", "#1C1450"],
    text: "#F5F2FF",
    dim: "#A39DD6",
    accent: "#FFB547",
    accent2: "#7C6CFF",
    danger: "#FF5C7A",
    ok: "#5CF2B5",
    mascot: ["#7AF5D0", "#22B48C"],
    card: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.16)",
    depth: "glow",
    ambient: "stars",
    display: grotesk.fontFamily,
    body: inter.fontFamily,
    mono: mono.fontFamily,
    displayWeight: 700,
    displayTracking: "-0.03em",
    shout: false,
    world: { sky: "#080B24", fog: "#141038", fogNear: 10, fogFar: 46, ambient: "#7D79D6", ambientI: 0.75, key: "#FFB15C", keyI: 1, rim: "#8C7BFF", rimI: 1.2, floor: "#1D1A4A", wall: "#262062", wood: "#7A4E3C", metal: "#3A3F7A", building: "#16143E", windowLit: "#FFC970", windowOff: "#221E58", particles: "#FFFFFF", stars: true },
  },
  /** Loud sticker/zine look: cream paper, black outlines, offset shadows. */
  paper: {
    name: "paper",
    bg: ["#FFF4DE", "#FFE3B8"],
    text: "#141414",
    dim: "#6B5E4C",
    accent: "#FF4D2E",
    accent2: "#2E5BFF",
    danger: "#E8243C",
    ok: "#00A86B",
    mascot: ["#FFD23F", "#F29E00"],
    card: "#FFFFFF",
    cardBorder: "#141414",
    depth: "hard",
    ambient: "dots",
    display: bricolage.fontFamily,
    body: inter.fontFamily,
    mono: mono.fontFamily,
    displayWeight: 800,
    displayTracking: "-0.035em",
    shout: true,
    world: { sky: "#FFE6BE", fog: "#FFE0B0", fogNear: 14, fogFar: 60, ambient: "#FFF1DA", ambientI: 1.6, key: "#FFF0D0", keyI: 1.2, rim: "#9BB4FF", rimI: 0.8, floor: "#F4C98E", wall: "#FF9F86", wood: "#D9824F", metal: "#6B8CFF", building: "#F7B267", windowLit: "#FFFFFF", windowOff: "#E98A4B", particles: "#FFFFFF", stars: false },
  },
  /** Dev / hacker look: near-black, phosphor green, scrolling grid. */
  terminal: {
    name: "terminal",
    bg: ["#030603", "#0A160C"],
    text: "#E8FFEA",
    dim: "#7FA785",
    accent: "#B6FF3B",
    accent2: "#38E1FF",
    danger: "#FF4F5E",
    ok: "#B6FF3B",
    mascot: ["#B6FF3B", "#5BB51A"],
    card: "rgba(182,255,59,0.05)",
    cardBorder: "rgba(182,255,59,0.35)",
    depth: "glow",
    ambient: "grid",
    display: mono.fontFamily,
    body: inter.fontFamily,
    mono: mono.fontFamily,
    displayWeight: 700,
    displayTracking: "-0.04em",
    shout: false,
    world: { sky: "#020602", fog: "#03140A", fogNear: 8, fogFar: 40, ambient: "#5E9A68", ambientI: 0.7, key: "#B6FF3B", keyI: 1, rim: "#38E1FF", rimI: 1.2, floor: "#06180B", wall: "#0A2412", wood: "#1C3A22", metal: "#12301C", building: "#05140A", windowLit: "#B6FF3B", windowOff: "#0C2614", particles: "#B6FF3B", stars: true },
  },
  /** Calm-premium magazine look for finance / business / education. */
  editorial: {
    name: "editorial",
    bg: ["#F3F2EC", "#E5E3DA"],
    text: "#111111",
    dim: "#6E6B63",
    accent: "#3D2BFF",
    accent2: "#FF5A36",
    danger: "#D9261C",
    ok: "#0E8A55",
    mascot: ["#5B4BFF", "#2E1FD1"],
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.12)",
    depth: "glow",
    ambient: "lines",
    display: serif.fontFamily,
    body: inter.fontFamily,
    mono: mono.fontFamily,
    displayWeight: 400,
    displayTracking: "-0.02em",
    shout: false,
    world: { sky: "#EEECE5", fog: "#E8E6DE", fogNear: 14, fogFar: 60, ambient: "#FFFFFF", ambientI: 1.5, key: "#FFFFFF", keyI: 1.1, rim: "#B9B3FF", rimI: 0.7, floor: "#DCD9CF", wall: "#E9E6DD", wood: "#BBA58A", metal: "#5B4BFF", building: "#D3CFC3", windowLit: "#5B4BFF", windowOff: "#C4C0B3", particles: "#3D2BFF", stars: false },
  },
};

export const cardStyle = (th: Theme): React.CSSProperties =>
  th.depth === "hard"
    ? {
        background: th.card,
        border: `5px solid ${th.cardBorder}`,
        boxShadow: `12px 12px 0 ${th.text}`,
        borderRadius: 28,
      }
    : {
        background: th.card,
        border: `2px solid ${th.cardBorder}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)`,
        borderRadius: 32,
        backdropFilter: "blur(12px)",
      };
