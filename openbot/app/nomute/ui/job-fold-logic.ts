// 작업 알림 글 알아보기 · 리모콘 목록(./job-fold.tsx · 깃 #-019 · 뎅) — 순수 셈(시험 = tests/job-fold.test.ts)
export type JobMsg = { who?: string; text?: string; relay?: unknown; ts?: number; id?: string };
export type Job = { kind: "done" | "recv"; no: string; title: string; by: string; ts: number; id: string };

export function jobOf(m: JobMsg): Job | null {
  const ev = (m.relay && typeof m.relay === "object" ? (m.relay as { event?: string }).event : "") || "";
  const t = String(m.text || "");
  const kind = ev === "job_done" ? "done" : ev === "job_recv" ? "recv" : m.who === "기차봇" ? (/^\s*✅\s*완료/.test(t) ? "done" : /^\s*📥\s*접수/.test(t) ? "recv" : null) : null;
  if (!kind) return null;
  const bold = /\*\*([^*\n]+)\*\*/.exec(t)?.[1]?.trim() || "";
  const head = bold || t.replace(/^\s*(✅\s*완료|📥\s*접수)\s*[·:]?\s*/, "").split("\n")[0].trim();
  const no = /#-\d+/.exec(head)?.[0] || "";
  const title = head.replace(/^#-\d+\s*[·:]?\s*/, "").trim();
  const who = /•\s*([^\n·]+?)\s*\((?:클로드|그록|지피티)\)([^\n]*)/.exec(t);
  const took = who ? /\(약\s*([^)]+)\)/.exec(who[2])?.[1] : "";
  return { kind, no, title, by: who ? `${who[1]}${took ? " · " + took : ""}` : "", ts: m.ts || 0, id: m.id || "" };
}

/** 리모콘 목록 = #-0NN 마다 마지막 상태(접수 → 완료) · 새것 위 · 번호 없는 완료(오더 없는 판)는 뒤에 */
export function jobBoard(ms: JobMsg[], max = 12): Job[] {
  const by = new Map<string, Job>();
  for (const m of ms) {
    const j = jobOf(m);
    if (!j) continue;
    const k = j.no || "id:" + j.id;
    const had = by.get(k);
    if (!had || j.ts >= had.ts) by.set(k, had && had.kind === "done" && j.kind === "recv" ? had : j);
  }
  return [...by.values()].sort((a, b) => (b.no ? 1 : 0) - (a.no ? 1 : 0) || b.ts - a.ts).slice(0, max);
}
