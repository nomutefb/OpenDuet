// 활동 칸 한눈 보기 — 형이 보는 것은 둘(형 11-14 「지금 쉬고있어서 일을 받을 상태가 되어있냐」 · 「신호가 끊긴게 아니냐」)
//   줄 하나 = 다섯 갈래 중 하나 · 차례 = 멈춤(먼저 봐야 함) → 받을 수 있음 → 일 → 쉼(대기 신호로 확인 안 된 쉼) → 모름
//   서버(editor functions/api/office/_activity.js)가 준 state · ready 만 읽는다 — 여기서 새로 판정하지 않는다
export type ActKind = "lost" | "ready" | "work" | "rest" | "unknown";
export type ActRow = { value?: string; state?: string; ready?: boolean };
export const ACT_ORDER: ActKind[] = ["lost", "ready", "work", "rest", "unknown"];
export const ACT_KO: Record<ActKind, string> = { lost: "멈춤", ready: "받을 수 있음", work: "일", rest: "쉼", unknown: "모름" };

export function actKind(r: ActRow): ActKind {
  const s = String(r.state || r.value || "").trim();
  if (s.startsWith("멈춤")) return "lost";
  if (s.startsWith("일")) return "work";
  if (s.startsWith("쉼")) return r.ready || String(r.value || "").includes("받을 수 있음") ? "ready" : "rest";
  return "unknown";
}

export function actSum(rows: ActRow[]): Record<ActKind, number> {
  const n: Record<ActKind, number> = { lost: 0, ready: 0, work: 0, rest: 0, unknown: 0 };
  for (const r of rows) n[actKind(r)]++;
  return n;
}

/** 같은 갈래 안에서는 서버가 준 차례 그대로 */
export function actSort<T extends ActRow>(rows: T[]): T[] {
  return rows.map((r, i) => ({ r, i, k: ACT_ORDER.indexOf(actKind(r)) })).sort((a, b) => a.k - b.k || a.i - b.i).map((x) => x.r);
}
