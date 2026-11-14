// 아이 한 줄 글 — 서버 활동 판정(editor functions/api/office/_activity.js · GET status/activity)을 읽기만 함 · 여기서 새로 판정하지 않음
//   쓰는 곳 = PM 방 러너맵 축소판(./pm-runner-mini.tsx) · 설정 「지금 봇」(./settings-extra.tsx · ./yeta-settings.tsx) — 봇 현황 한 장 · 작동 표 활동 칸과 같은 줄
//   일함 · 쉼(받을 수 있음) · 쉼 · 멈춤(까닭) · 모름 — 「멈춤?」 같은 짐작 말은 안 씀(형 11-14 「멈춤? 이렇게 뜨는거 없어야 함」 · 「어어그렇게 더 확대해서 유지보수해줘」)
//   옛 bots 자료(깸 · 잠 · 모름 = 지금 턴이 도는가)는 「생각 중」 글 · 얼굴 테처럼 그 순간을 보는 곳에만 남김
import { actKind, type ActKind } from "./activity-sum.ts";

export type MiniRow = { name: string; state?: string; value?: string; ready?: boolean; last_at?: number };
export type MiniLine = { name: string; kind: ActKind; label: string; sub: string };
const LABEL: Record<ActKind, string> = { work: "일함", ready: "쉼", rest: "쉼", lost: "멈춤", unknown: "모름" };
export const ACT_QUERY_KEY = ["nomute", "activity"] as const;   // 같은 캐시 열쇠(러너맵 · 설정이 한 번 받은 것을 같이 씀)

export function miniLine(r: MiniRow): MiniLine {
  const kind = actKind(r);
  const sub = kind === "ready" ? "받을 수 있음" : kind === "lost" ? String(r.value || "").replace(/^멈춤\s*·?\s*/, "") : "";
  return { name: r.name, kind, label: LABEL[kind], sub };
}

/** 설정 「지금 봇」 한 줄 글 — 일하는 중 · 받을 수 있음 · 쉼 · N분 전 · 멈춤 · 까닭 · 활동 줄 없는 자리 = 빈 글(부르는 쪽이 대신 씀). */
export function botLine(r: MiniRow | undefined, ago: (ts?: number) => string): { kind: ActKind | "none"; text: string } {
  if (!r) return { kind: "none", text: "" };
  const l = miniLine(r);
  if (l.kind === "work") return { kind: "work", text: "일하는 중" };
  if (l.kind === "ready") return { kind: "ready", text: "받을 수 있음" };
  if (l.kind === "lost") return { kind: "lost", text: l.sub ? `멈춤 · ${l.sub}` : "멈춤" };
  if (l.kind === "rest") return { kind: "rest", text: r.last_at ? `쉼 · ${ago(r.last_at)}` : "쉼" };
  return { kind: "unknown", text: r.last_at ? ago(r.last_at) : "활동 모름" };
}

/** 머리 셈 — 일하는 중 · 받을 수 있음 몇. */
export function actCount(rows: MiniRow[]): { work: number; ready: number; total: number } {   // total = 같은 줄들의 수(분모를 다른 목록에서 세면 「9/7」처럼 어긋남 · 형 11-15 08:00 「일하는 중 9/7 이라 뜨네 버그」)
  let work = 0, ready = 0;
  for (const r of rows) { const k = actKind(r); if (k === "work") work++; else if (k === "ready") ready++; }
  return { work, ready, total: rows.length };
}
