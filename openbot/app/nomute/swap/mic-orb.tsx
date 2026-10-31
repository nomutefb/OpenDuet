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

// 테 색(형 10-31 「그 캐릭터 고유 색에 맞춰서 색은 내가 정해줄게」 · 「봄은 분홍, 시아는 노뮤트색, 윈터는 흰은색, 빠르는 로얄블루네온, 뎅은 갈색+네온」 → 「그리고 너가 노뮤트색을 해주고, 시아가 흰색을 해줘」) = 이름별 · 값 정본 = 봄 대시보드 #1797(뎅 = 네온 테 쪽) · 윈터 = .nm-orb 기본과 같은 값 · 없으면 말풍선 색 → 분류색
const RING: Record<string, string> = { "윈터 PM": "#0FFD02", 봄: "#FF6FB5", 시아: "#DDE3EA", 빠르: "#2F6BFF", 뎅: "#FFB300" };
const RING_CLS: Record<string, string> = { 그록봇: "#22d3ee", 클로드: "#FFAA4D", 닷: "#C9A7FF", 부름: "#C9A7FF" };
export const ringOf = (p?: { who: string; cls?: string; bubble?: string }) => (p ? RING[p.who] || p.bubble || RING_CLS[p.cls || ""] : undefined);

const LOOK: Record<MicOrbState, string> = { idle: "rest", listening: "listen", thinking: "work", done: "done", finished: "done" };   // 쉼 · 듣는 중 · 일하는 중 · 끝남

export function MicOrb({ className, size, state = "idle", still = false, id = WINTER_ID, tint }: { className?: string; colour?: OrbColour; keystrokes?: number; size: number; state?: MicOrbState; still?: boolean; id?: string; tint?: string }) {
  const look = LOOK[state] || "rest";
  return (
    <span aria-hidden="true" className={`nm-orb nm-${look}${still ? " nm-still" : ""}${tint === RING.시아 ? " nm-silver" : ""}${tint === RING.빠르 ? " nm-royal" : ""} ${className || ""}`} style={{ width: size, height: size, "--s": `${size}px`, ...(tint ? { "--c": tint } : {}) } as CSSProperties}>
      <i className="nm-ring" />
      {look === "work" ? (
        <i className="nm-arc">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" pathLength="100" strokeDasharray="30 70" transform="rotate(-90 20 20)" />
            <circle cx="37.1" cy="25.6" r="2.4" fill="currentColor" />
          </svg>
        </i>
      ) : null}
      <FaceImg id={id} size={Math.round(size * 0.8)} className="nm-orb-face" />
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
