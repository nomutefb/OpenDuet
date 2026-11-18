// 작동 표 자료 한 벌(GET status) — 러너 층(./status-board.tsx) · 애 카드 몸 칸(./body-chips.tsx) · 스케줄 배선 「수집」(./sched-collect.tsx)이 같은 열쇠 · 같은 답을 같이 씀
//   형 11-19 「자세히 칸 목록안에잇는거 모든거를 그냥 다 위에 다 반복안되게 귀속시켜」 → 칸마다 제 자리로 흩어 놓되 받아오기는 한 번(60초 · 지난 값 먼저)
import { office } from "../data/office";
import { lastPut, lastSeed } from "../data/last-cache";
import { type Body, bodiesOf } from "../data/bodies";
import type { HealthSt } from "./sched-bits";
import type { SigStep } from "./activity-view";

export type CliItem = { n?: number; name?: string; account?: string; active?: boolean; type?: string; provider?: string; user?: string; domain?: string };
export type Cell = { st: HealthSt; note?: string; label?: string; items?: CliItem[]; at?: number };
export type StatusRow = { key: string; name: string; st: HealthSt; last_at?: number; next_at?: number; left_days?: number; value?: string; note?: string; cron?: string[]; zone?: string; cells?: Record<string, Cell>; state?: string; ready?: boolean; step?: SigStep; beat_at?: number; door_at?: number; host?: string; stale?: boolean; reported_at?: number; metrics?: Record<string, number>; brain?: string; when?: string };   // state · ready · step(그록 부름 → 받음 → 들어옴) · beat_at(대기 신호 때) · door_at(문 확인 때) = 활동 칸(서버 _activity.js)
export type StatusCat = { id: string; name: string; rows: StatusRow[]; cols?: { id: string; name: string; grp?: string; title?: string }[]; at?: number; grp?: string };
export type StatusData = { cats: StatusCat[]; at?: number; bodies?: Body[]; hosts?: { host: string; by?: string; stale?: boolean }[] };

export const STATUS_KEY = ["nomute", "status"] as const;
/** 받아오기 한 벌 — 지난 작동 표를 먼저 그림(빈 「읽는 중…」 0 · 형 11-17 「처음브터 제대로 나오게」) · 60초마다 */
export const statusOpts = () => ({ queryKey: STATUS_KEY, queryFn: () => office<StatusData>("status").then((j) => lastPut("status", j)), ...lastSeed<StatusData>("status"), refetchInterval: 60_000, retry: false as const });

/** 서버 불(뜸 _status.js = 🟢🟡🔴⚪) → 화면 낱말 · 줄·칸 둘 다 */
const LIGHT: Record<string, HealthSt> = { "🟢": "ok", "🟡": "late", "🔴": "miss", "⚪": "unknown" };
export const stIn = (v: unknown): HealthSt => (typeof v === "string" && (LIGHT[v] || (["ok", "late", "miss", "unknown", "off"].includes(v) ? (v as HealthSt) : "unknown"))) || "unknown";
export const nameKo = (bs: Body[], n?: string) => { const s = n || "", t = s.split(/\s/)[0], b = bs.find((x) => x.hosts.includes(t)); return b && t !== b.body && !b.body.includes(t) ? b.body + s.slice(t.length) : s; };   // 줄 이름 맨 앞 host(hwang) → 몸 이름(시아 PC) · 정본에서
export const rowIn = (bs: Body[]) => (r: StatusRow): StatusRow => ({ ...r, name: nameKo(bs, r.name), st: stIn(r.st), ...(r.cells ? { cells: Object.fromEntries(Object.entries(r.cells).map(([k, c]) => [k, { ...c, st: stIn(c.st) }])) } : {}) });
export const hostOf = (r: StatusRow) => String(r.host || r.key.split(":")[0]);
/** 서버 답에서 한 칸의 줄(불 낱말로 바꿈 · 줄 이름 host → 몸 이름) · 답이 없으면 빈 줄 */
export const catRows = (d: StatusData | undefined, id: string, bs: Body[] = bodiesOf(d?.bodies)): StatusRow[] => (d?.cats?.find((c) => c.id === id)?.rows || []).map(rowIn(bs));
/** 몸 줄 고르기 = 그 몸 host 이름 전부 중 신선한 보고 먼저 · 없으면 마지막 보고(낡음) — 시아 PC 보고 이름 hwang → sia(11-08) 처럼 바뀌어도 칸이 안 빔(형 09:03 「오프라고 뜨는데 그래도 온도는 나와야해」) */
export const pickRow = <R extends { key: string; stale?: boolean; reported_at?: number }>(rows: R[], hosts: string[], suffix = ""): R | undefined => { const rs = hosts.map((h) => rows.find((r) => r.key === h + suffix)).filter((r): r is R => !!r); return rs.find((r) => !r.stale) ?? rs.sort((x, y) => (y.reported_at || 0) - (x.reported_at || 0))[0]; };
export const worst = (rows: StatusRow[]): HealthSt => { const all = rows.flatMap((r) => [r.st, ...Object.values(r.cells || {}).map((x) => x.st)]); return all.includes("miss") ? "miss" : all.includes("late") ? "late" : all.length && all.every((x) => x === "ok" || x === "off") ? "ok" : "unknown"; };
export const count = (rows: StatusRow[], st: HealthSt) => rows.reduce((n, r) => { const cs = Object.values(r.cells || {}); return n + (cs.length ? cs.filter((x) => x.st === st).length : r.st === st ? 1 : 0); }, 0);   // 칸 있는 줄 = 칸만 셈(줄 불은 칸에서 나온 것 · 두 번 세지 않음)
