// PM 방 러너맵 축소판(./pm-runner-mini.tsx)의 아이 한 줄 — 서버 활동 판정(editor functions/api/office/_activity.js)을 읽기만 함 · 여기서 새로 판정하지 않음
//   일함 · 쉼(받을 수 있음) · 쉼 · 멈춤(까닭) · 모름 — 「멈춤?」 같은 짐작 말은 안 씀(형 11-14 「멈춤? 이렇게 뜨는거 없어야 함」)
import { actKind, type ActKind } from "./activity-sum.ts";

export type MiniRow = { name: string; state?: string; value?: string; ready?: boolean };
export type MiniLine = { name: string; kind: ActKind; label: string; sub: string };
const LABEL: Record<ActKind, string> = { work: "일함", ready: "쉼", rest: "쉼", lost: "멈춤", unknown: "모름" };

export function miniLine(r: MiniRow): MiniLine {
  const kind = actKind(r);
  const sub = kind === "ready" ? "받을 수 있음" : kind === "lost" ? String(r.value || "").replace(/^멈춤\s*·?\s*/, "") : "";
  return { name: r.name, kind, label: LABEL[kind], sub };
}
