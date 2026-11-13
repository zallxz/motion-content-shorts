import React from "react";
import { useStyle } from "../lib/context";
import type { Mood } from "../lib/types";

/**
 * "Blip" — an original squircle bot with an antenna.
 * Always moving: idle bob, squash & stretch, antenna sway, blinking.
 * Swap the look per brand via theme.mascot colors or replace this component.
 */
export const Mascot: React.FC<{ mood?: Mood; f: number; size?: number; look?: number }> = ({
  mood = "neutral",
  f,
  size = 420,
  look = 0,
}) => {
  const { theme: th } = useStyle();
  const [c1, c2] = th.mascot;
  const ink = th.depth === "hard" ? "#141414" : "#0B0B1A";
  const bob = Math.sin(f * 0.16) * 10;
  const squash = 1 + Math.sin(f * 0.32) * 0.035;
  const sway = Math.sin(f * 0.11) * 14 + (mood === "shocked" ? Math.sin(f * 1.4) * 10 : 0);
  const blinkPhase = f % 78;
  const blink = mood !== "happy" && blinkPhase > 72 ? 0.12 : 1;
  const shake = mood === "angry" ? Math.sin(f * 2.1) * 4 : 0;
  const lx = look * 10 + Math.sin(f * 0.05) * 4;

  const eyes = () => {
    switch (mood) {
      case "happy":
        return (
          <g stroke={ink} strokeWidth={14} strokeLinecap="round" fill="none">
            <path d={`M ${118 + lx} 168 q 22 -30 44 0`} />
            <path d={`M ${198 + lx} 168 q 22 -30 44 0`} />
          </g>
        );
      case "shocked":
        return (
          <g>
            <circle cx={140 + lx} cy={158} r={30} fill="#fff" />
            <circle cx={220 + lx} cy={158} r={30} fill="#fff" />
            <circle cx={140 + lx} cy={158} r={11} fill={ink} />
            <circle cx={220 + lx} cy={158} r={11} fill={ink} />
          </g>
        );
      case "smug":
        return (
          <g>
            <rect x={116 + lx} y={152} width={50} height={18} rx={9} fill={ink} />
            <rect x={196 + lx} y={152} width={50} height={18} rx={9} fill={ink} />
          </g>
        );
      case "sad":
        return (
          <g fill={ink}>
            <ellipse cx={141 + lx} cy={172} rx={15} ry={20 * blink} />
            <ellipse cx={221 + lx} cy={172} rx={15} ry={20 * blink} />
            <path d="M 112 132 L 160 146" stroke={ink} strokeWidth={10} strokeLinecap="round" />
            <path d="M 248 132 L 200 146" stroke={ink} strokeWidth={10} strokeLinecap="round" />
          </g>
        );
      case "angry":
        return (
          <g fill={ink}>
            <ellipse cx={141 + lx} cy={168} rx={15} ry={18 * blink} />
            <ellipse cx={221 + lx} cy={168} rx={15} ry={18 * blink} />
            <path d="M 112 132 L 162 150" stroke={ink} strokeWidth={12} strokeLinecap="round" />
            <path d="M 250 132 L 200 150" stroke={ink} strokeWidth={12} strokeLinecap="round" />
          </g>
        );
      case "think":
        return (
          <g fill={ink}>
            <ellipse cx={148 + lx} cy={150} rx={15} ry={22 * blink} />
            <ellipse cx={228 + lx} cy={150} rx={15} ry={22 * blink} />
          </g>
        );
      default:
        return (
          <g fill={ink}>
            <ellipse cx={141 + lx} cy={162} rx={16} ry={24 * blink} />
            <ellipse cx={221 + lx} cy={162} rx={16} ry={24 * blink} />
          </g>
        );
    }
  };

  const mouth = () => {
    switch (mood) {
      case "happy":
        return <path d={`M ${150 + lx} 214 q 30 32 60 0`} fill={ink} />;
      case "shocked":
        return <ellipse cx={180 + lx} cy={232} rx={20 + Math.sin(f * 0.6) * 3} ry={26} fill={ink} />;
      case "smug":
        return <path d={`M ${160 + lx} 222 q 30 10 52 -12`} stroke={ink} strokeWidth={10} fill="none" strokeLinecap="round" />;
      case "sad":
        return <path d={`M ${155 + lx} 236 q 25 -22 50 0`} stroke={ink} strokeWidth={10} fill="none" strokeLinecap="round" />;
      case "angry":
        return <rect x={152 + lx} y={222} width={56} height={12} rx={6} fill={ink} />;
      case "think":
        return <circle cx={196 + lx} cy={226} r={8} fill={ink} />;
      default:
        return <path d={`M ${160 + lx} 218 q 20 16 40 0`} stroke={ink} strokeWidth={10} fill="none" strokeLinecap="round" />;
    }
  };

  return (
    <div style={{ width: size, height: size * 1.15, position: "relative", translate: `${shake}px ${bob}px` }}>
      <svg viewBox="0 0 360 414" width={size} height={size * 1.15} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`mg-${th.name}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
          <radialGradient id={`mglow-${th.name}`}>
            <stop offset="0" stopColor={th.accent} stopOpacity={0.9} />
            <stop offset="1" stopColor={th.accent} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* shadow */}
        <ellipse cx={180} cy={398} rx={120 - bob} ry={14} fill="#000" opacity={0.22} />
        <g style={{ transformOrigin: "180px 390px", scale: `${1 / squash} ${squash}` }}>
          {/* antenna */}
          <g style={{ transformOrigin: "180px 70px", rotate: `${sway}deg` }}>
            <line x1={180} y1={70} x2={180} y2={18} stroke={th.depth === "hard" ? ink : c2} strokeWidth={10} strokeLinecap="round" />
            <circle cx={180} cy={14} r={34} fill={`url(#mglow-${th.name})`} opacity={0.6 + Math.sin(f * 0.3) * 0.3} />
            <circle cx={180} cy={14} r={15} fill={th.accent} stroke={th.depth === "hard" ? ink : "none"} strokeWidth={6} />
          </g>
          {/* body */}
          <rect
            x={40}
            y={68}
            width={280}
            height={320}
            rx={110}
            fill={`url(#mg-${th.name})`}
            stroke={th.depth === "hard" ? ink : "none"}
            strokeWidth={10}
          />
          {/* face plate */}
          <rect x={84} y={108} width={192} height={170} rx={70} fill="#fff" opacity={0.18} />
          {/* cheek light */}
          <ellipse cx={100} cy={150} rx={18} ry={44} fill="#fff" opacity={0.22} />
          {eyes()}
          {mouth()}
          {(mood === "happy" || mood === "smug") && (
            <g fill={th.accent} opacity={0.5}>
              <ellipse cx={108 + lx} cy={210} rx={18} ry={10} />
              <ellipse cx={252 + lx} cy={210} rx={18} ry={10} />
            </g>
          )}
          {/* little arms */}
          <rect x={14} y={250 + Math.sin(f * 0.2) * 8} width={44} height={86} rx={22} fill={c2} stroke={th.depth === "hard" ? ink : "none"} strokeWidth={8} />
          <rect x={302} y={250 - Math.sin(f * 0.2) * 8} width={44} height={86} rx={22} fill={c2} stroke={th.depth === "hard" ? ink : "none"} strokeWidth={8} />
        </g>
        {mood === "think" && (
          <g fill={th.text}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={300 + i * 28} cy={60 - i * 14} r={8 + i * 2} opacity={0.4 + 0.6 * ((Math.sin(f * 0.3 - i) + 1) / 2)} />
            ))}
          </g>
        )}
        {mood === "shocked" && (
          <g stroke={th.accent} strokeWidth={9} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.5))}>
            <line x1={18} y1={70} x2={-12} y2={40} />
            <line x1={342} y1={70} x2={372} y2={40} />
            <line x1={6} y1={120} x2={-30} y2={116} />
            <line x1={354} y1={120} x2={390} y2={116} />
          </g>
        )}
      </svg>
    </div>
  );
};
