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

export type BkLine = { n: string; ago: number | null; mb: number | null; f: number | null; bad: boolean; cloud: string; why: string };

/** 몸마다 백업 줄(번개 bk 칸) — 빠짐(26시간) · 클라우드 늦음 = bad · 빠진 줄 먼저 · 그 밖 = 받은 차례 그대로. */
export function bkLines(d: RunnerRow | null, nowS: number): BkLine[] {
  const rows = Array.isArray(d?.bk?.rows) ? d!.bk!.rows! : [];
  return rows
    .filter((r) => r && r.n)
    .map((r) => {
      const cloud = r.cloud === "ok" ? "" : r.cloud === "늦음" ? "클라우드 늦음" : r.cloud ? "클라우드 모름" : "";
      return { n: r.n, ago: typeof r.ok === "number" ? Math.max(0, nowS - r.ok) : null, mb: typeof r.mb === "number" ? r.mb : null, f: typeof r.f === "number" ? r.f : null,
        bad: !!r.miss || r.cloud === "늦음", cloud, why: r.miss ? (r.why || "26시간 넘게 안 됨") : "" };
    })
    .sort((a, b) => Number(b.bad) - Number(a.bad));
}

// 봇 일(형 11-15 11:42 dm-gik 「그리고 지금 그 봇으로 매달은 애들잇잖아 촉봇이나 그런애들은 사용량이 따로 러너칸에 찍히게 하주셈」 · 깃 #-063 · 뜸)
//   자료 = 이미 받는 GET schedule(지도 · 스테이터스 판과 같은 열쇠) 의 bots(봇마다 예약 깸 시각) + runners.jobs(주인 · 마지막 돈 때) — 새로 받아 오는 것 0
//   토큰 = 그록봇 깸 한 번 ≈ 5만(그록봇 프로필 「깰 때마다 약 5만 이상의 토큰」) × 오늘 지난 깸 = 어림(≈)
export type SchedBot = { bot: string; who: string; wakes?: number[]; next_ts?: number; on?: boolean };
export type SchedJob = { id: string; name?: string; owner?: string; health?: { last_at?: number } };
export type BotUse = { bot: string; who: string; done: number; next: number | null; jobs: number; last: number | null; tok: number };
const KST = 9 * 3600e3, WAKE_TOK = 50_000;
const bare = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
export function botUse(bots: SchedBot[] | undefined, jobs: SchedJob[] | undefined, nowMs: number): BotUse[] {
  const day0 = Math.floor((nowMs + KST) / 864e5) * 864e5 - KST;
  return (bots || []).filter((b) => b.on !== false).map((b) => {
    const w = (b.wakes || []).filter((t) => Number.isFinite(t));
    const done = w.filter((t) => t >= day0 && t <= nowMs).length;
    const next = w.find((t) => t > nowMs) ?? null;
    const mine = (jobs || []).filter((j) => (j.owner && bare(j.owner) === bare(b.who)) || new RegExp(`(^|[.\\-])${b.bot}([\\-.]|$)`).test(j.id));
    const last = mine.reduce<number | null>((a, j) => { const t = j.health?.last_at; return t && (a == null || t > a) ? t : a; }, null);
    return { bot: b.bot, who: b.who, done, next, jobs: mine.length, last, tok: done * WAKE_TOK };
  }).filter((u) => u.done > 0 || u.next != null);   // 예약 깸이 있는 봇만(깃 · 결처럼 깸 0 · 주인 일만 있는 자리 = 봇 일 아님 · 실물 11-15 12:1x)
}
