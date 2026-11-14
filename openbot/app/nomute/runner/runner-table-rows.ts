// 러너 여섯 표의 순수 칸(깃 11-14 · 화면 = ./runner-table.tsx)
import type { RunnerJob, RunnerRow } from "./runner-data";

export const EV: Record<string, string> = { push: "코드 올림", schedule: "시계", workflow_dispatch: "손", repository_dispatch: "부름", workflow_run: "앞 일 뒤", pull_request: "PR" };
export const short = (n: string) => n.replace(/^nomute-/, "");
export const mins = (s: number) => { const v = Math.max(0, s); return v < 60 ? `${Math.floor(v)}초` : v < 3600 ? `${Math.floor(v / 60)}분` : `${Math.floor(v / 3600)}시간 ${Math.floor((v / 60) % 60)}분`; };

export type TableRow = { n: string; heavy: boolean; st: "work" | "idle" | "down"; title: string; since: number | null; ev: string };

/** 순수 칸(시험 = tests/runner-table.test.ts · JSX 없는 이 파일만 node 가 엶) — 자리 하나 = 줄 하나 · 일 = 그 자리에서 도는 잡(여럿이면 먼저 시작한 것) · 자리 이름 차례. */
export function tableRows(d: RunnerRow | null): TableRow[] {
  const seats = Array.isArray(d?.seats) ? d!.seats! : [];
  const jobs: RunnerJob[] = Array.isArray(d?.jobs) ? d!.jobs!.filter((j) => j && j.running) : [];
  return seats
    .filter((s) => s && s.n)
    .map((s) => {
      const j = jobs.filter((x) => x.seat === s.n).sort((a, b) => (a.start ?? 0) - (b.start ?? 0))[0];
      const st: TableRow["st"] = s.d ? "down" : j || s.b ? "work" : "idle";
      return { n: s.n, heavy: !!s.L, st, title: j ? String(j.title || j.workflow || "") : "", since: j && typeof j.start === "number" ? j.start : null, ev: j?.ev ? EV[j.ev] || j.ev : "" };
    })
    .sort((a, b) => a.n.localeCompare(b.n, undefined, { numeric: true }));
}
