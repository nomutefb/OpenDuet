// 원본 components/duet/mic-orb.tsx 자리 — OpenDuet 구슬 대신 우리 구슬 「등불 테」(형 10-28 07:35 「등불」 · 시안 claude-state assign/2026-10-28/office-orb/)
// 이름·꼴은 원본 그대로(MicOrb · MicOrbState · FINISH_MS) · 얼굴 = 윈터(앱 자기 봇) · 상태 = 부르는 쪽 state(머리 = 원본 useChatOrb)
import type { CSSProperties } from "react";
import { FINISH_S } from "@/components/duet/mic-orb-draw";
import type { OrbColour } from "@/components/duet/mic-orb-draw";
import { FaceImg } from "../ui/faces";
import { WINTER_ID } from "../data/office";
import "./mic-orb.css";

export type MicOrbState = "idle" | "listening" | "thinking" | "done" | "finished";
export const FINISH_MS = FINISH_S * 1000;

const LOOK: Record<MicOrbState, string> = { idle: "rest", listening: "listen", thinking: "work", done: "done", finished: "done" };   // 쉼 · 듣는 중 · 일하는 중 · 끝남

export function MicOrb({ className, size, state = "idle", still = false }: { className?: string; colour?: OrbColour; keystrokes?: number; size: number; state?: MicOrbState; still?: boolean }) {
  const look = LOOK[state] || "rest";
  return (
    <span aria-hidden="true" className={`nm-orb nm-${look}${still ? " nm-still" : ""} ${className || ""}`} style={{ width: size, height: size, "--s": `${size}px` } as CSSProperties}>
      <i className="nm-ring" />
      {look === "work" ? (
        <i className="nm-arc">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" pathLength="100" strokeDasharray="30 70" transform="rotate(-90 20 20)" />
            <circle cx="37.1" cy="25.6" r="2.4" fill="currentColor" />
          </svg>
        </i>
      ) : null}
      <FaceImg id={WINTER_ID} size={Math.round(size * 0.8)} className="nm-orb-face" />
      {look === "done" ? (
        <i className="nm-tick">
          <svg viewBox="0 0 24 24" fill="none" stroke="#070a12" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </i>
      ) : null}
    </span>
  );
}
