// 활동 칸 보기 셈(순수 · ./activity-board.tsx 가 그림) — 서버(editor functions/api/office/_activity.js)가 준 줄만 읽는다 · 여기서 새로 판정하지 않는다
//   형이 보는 것 둘(형 11-14 「지금 쉬고있어서 일을 받을 상태가 되어있냐」 · 「신호가 끊긴게 아니냐」) → 칸 넷: 멈춤 · 받을 수 있음 · 일하는 중 · 쉼 · 모름
import { type ActRow as SumRow, actKind } from "./activity-sum.ts";

/** 그록봇 부름 자국(서버 hookOf) — call = 부른 때 · got = 그록이 받음 · in = 사무실에 들어옴 */
export type SigStep = { call: number; got: boolean; in: boolean };
export type ActRow = SumRow & { key: string; name: string; note?: string; step?: SigStep; beat_at?: number; door_at?: number; last_at?: number };
export type Lane = "lost" | "ready" | "work" | "rest";
export const LANES: Lane[] = ["lost", "ready", "work", "rest"];
export const LANE_KO: Record<Lane, string> = { lost: "멈춤", ready: "받을 수 있음", work: "일하는 중", rest: "쉼 · 모름" };
export const laneOf = (r: SumRow): Lane => { const k = actKind(r); return k === "unknown" ? "rest" : k; };

/** 대기 신호 5분 = 고리가 다 빠지는 때(서버 BEAT_FRESH_MS 와 같은 값) */
export const FRESH_MS = 5 * 60e3;
/** 고리가 찬 정도 0~1 = 신호 나이 · 신호 시각을 안 주는 서버(옛 판)면 가득 */
export const ringFrac = (r: { beat_at?: number }, now: number) => (!r.beat_at ? 1 : Math.max(0, Math.min(1, 1 - (now - r.beat_at) / FRESH_MS)));
/** 반쪽 고리를 돌릴 각도(0 = 가득 · 180 = 다 빠짐) — 빈틈이 맨 위 가운데에서 양쪽으로 벌어짐 */
export const ringDeg = (frac: number) => Math.round((1 - frac) * 1800) / 10;
/** 멈춤 얼굴 밑 한 마디 = 까닭만 */
export const causeOf = (r: { value?: string }) => String(r.value || "").replace(/^멈춤\s*·?\s*/, "") || "멈춤";

export type Dot = "on" | "end" | "stop" | "live" | "off";
export type Seg = "on" | "cut" | "off";
/** 점 셋(부름 · 받음 · 들어옴)과 그 사이 선 둘 — 간 데까지만 켜지고 · 멈춘 자리 = stop · 들어오는 중 = live */
export function chainOf(s: SigStep, lost: boolean): { dots: [Dot, Dot, Dot]; segs: [Seg, Seg] } {
  const got = !!s.got, inn = got && !!s.in;
  return {
    dots: ["on", got ? "on" : lost ? "stop" : "off", inn ? "end" : got ? (lost ? "stop" : "live") : "off"],
    segs: [got ? "on" : lost ? "cut" : "off", inn ? "on" : got && lost ? "cut" : "off"],
  };
}
export type LogLine = { s: "on" | "end" | "stop" | "off"; text: string; at?: number };
/** 눌렀을 때 기록 세 줄(부른 적 있는 그록봇만 · 그 밖은 서버 덧말을 그대로 씀) */
export function logOf(r: ActRow, lane: Lane): LogLine[] {
  const s = r.step; if (!s) return [];
  const lost = lane === "lost", got = !!s.got, inn = got && !!s.in;
  return [
    { s: "on", text: "부름", at: s.call },
    got ? { s: "on", text: "받음" } : { s: lost ? "stop" : "off", text: lost ? "그록이 안 받음" : "받는 중" },
    inn ? { s: "end", text: "들어옴", at: r.door_at } : got ? { s: lost ? "stop" : "off", text: lost ? "아직 안 들어옴" : "들어오는 중" } : { s: "off", text: "들어옴" },
  ];
}
