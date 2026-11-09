// 러너 스케줄 흐름 그림의 셈(순수 · 화면은 ./sched-flow.tsx · 시험 tests/sched-flow.test.ts) —
//   선 = in.after(뒤따름) · out.calls(부름) 있는 것만 · after 값은 .yml 없는 줄기 이름(「breaking-judge」) · calls 는 「news-analyze.yml」 → 둘 다 줄기로 맞춤(러너 지도 실물 11-09)
//   차례 = 앞선 잡(같은 갈래 선) 깊이 → 하루 중 첫 시각 → 이름 · 선 없는 잡은 시각 순 왼→오(시아 11-09 05:17 ②)
import type { RunnerJob, SchedRunners } from "./settings-extra";

export type Edge = { k: string; from: RunnerJob; to: RunnerJob; kind: "after" | "calls" };
export type Far = { dir: "in" | "out"; job: RunnerJob; group: string };   // 다른 갈래와 잇는 선 = 블록 밑 칩(누르면 그 갈래로)
export const stem = (s: string) => s.trim().replace(/\.ya?ml$/i, "");
const CRON_H = /^CRON_TZ=\S+\s+/;
const add = <T,>(m: Map<string, T[]>, k: string, v: T) => { const a = m.get(k); if (a) a.push(v); else m.set(k, [v]); };

/** 왼→오 차례 열쇠(분) = 하루 중 첫 시각(cron 줄 전부 · 시·분 목록의 제일 이른 것 · 모루 11-09 06:36 ②) · N분마다 = 하루 뒤(1440+N) · 못 읽는 cron = 1470 · 뒤따름 = 2880 · 부를 때만 = 4320(맨 뒤) */
export function timeKey(j: RunnerJob): number {
  const keys: number[] = [];
  for (const line of j.cron_kst || []) {
    const c = line.replace(CRON_H, "").trim().split(/\s+/);
    if (c.length !== 5) continue;
    const ev = c[0].match(/^\*\/(\d+)/); if (ev) { keys.push(1440 + +ev[1]); continue; }
    const first = (f: string) => { const ns = f.split(",").map((x) => x.match(/^\d+/)).filter(Boolean).map((m) => +m![0]); return ns.length ? Math.min(...ns) : null; };   // 「15,45」 → 15 · 「9-17/2」 → 9 · 「*」 → 없음
    const h = first(c[1]), m = first(c[0]) ?? 0;
    keys.push(h === null ? 1440 + 60 : h * 60 + m);   // 시 칸이 * = 매시간 → N분마다 다음
  }
  if (keys.length) return Math.min(...keys);
  const w = j.when || "", n = w.match(/(\d+)\s*분마다/), hr = w.match(/(\d+)\s*시간마다/), hm = w.match(/(\d{1,2}):(\d{2})/);
  if (n) return 1440 + +n[1];
  if (hr) return 1440 + 60 * +hr[1];
  if (hm) return +hm[1] * 60 + +hm[2];
  if ((j.clock || []).includes("after")) return 2880;
  return 4320;
}

/** 모델 짧게(시아 ③) = 첫 모델만 + 「+N」 · claude-opus-5-5 → opus 5.5 · gemini-3.1-flash-image → gemini 3.1 flash · 없으면 providers · 그것도 없으면 「LLM 없음」 */
export function modelKo(j: RunnerJob): string {
  const ms = j.model?.length ? j.model : j.providers || [];
  if (!ms.length) return "LLM 없음";
  const one = (m: string) => {
    const c = m.match(/^claude-(\w+)-(\d+)-(\d+)$/); if (c) return `${c[1]} ${c[2]}.${c[3]}`;
    const g = m.match(/^gemini-([\d.]+)-([a-z]+)/); if (g) return `gemini ${g[1]} ${g[2]}`;
    return m.length > 16 ? `${m.slice(0, 15)}…` : m;
  };
  return one(ms[0]) + (ms.length > 1 ? ` +${ms.length - 1}` : "");
}

export type Flow = { rows: { f: SchedRunners["forks"][number]; jobs: RunnerJob[] }[]; edges: Edge[]; far: Map<string, Far[]>; soon: string };
/** 한 갈래의 그림 재료 = 포크별 잡 차례 · 갈래 안 선 · 다른 갈래로 가는 칩 · 「다음 차례」(아직 안 온 next_at 중 제일 가까운 켜진 잡 하나 = 라임 한 곳) */
export function flowOf(map: SchedRunners, group: string, now = Date.now()): Flow {
  const forks = map.forks.filter((f) => f.group === group);
  const groupOf = (j: RunnerJob) => map.forks.find((f) => f.id === j.fork)?.group || "";
  const inG = (j: RunnerJob) => groupOf(j) === group;
  const byStem = new Map<string, RunnerJob>();
  for (const j of map.jobs) if (j.file && !byStem.has(stem(j.file))) byStem.set(stem(j.file), j);   // 맥 줄은 file "" (뜸 11-02) → 파일 있는 줄만 · 먼저 난 줄이 주인
  const edges: Edge[] = [], far = new Map<string, Far[]>(), seen = new Set<string>();
  const push = (from: RunnerJob, to: RunnerJob, kind: Edge["kind"]) => {
    if (from.id === to.id) return;
    const fi = inG(from), ti = inG(to);
    const k = `${from.id}>${to.id}`;   // 같은 선이 after·calls 양쪽에 적혀 있어도 하나(러너 지도엔 둘 다 적힌 줄이 있음)
    if (seen.has(k)) return;
    seen.add(k);
    if (fi && ti) edges.push({ k, from, to, kind });
    else if (fi) add(far, from.id, { dir: "out", job: to, group: groupOf(to) });
    else if (ti) add(far, to.id, { dir: "in", job: from, group: groupOf(from) });
  };
  for (const j of map.jobs) {
    for (const a of j.in?.after || []) { const s = byStem.get(stem(a)); if (s) push(s, j, "after"); }
    for (const c of j.out?.calls || []) { const d = byStem.get(stem(c)); if (d) push(j, d, "calls"); }
  }
  const preds = new Map<string, RunnerJob[]>();
  for (const e of edges) add(preds, e.to.id, e.from);
  const col = new Map<string, number>(), walking = new Set<string>();
  const colOf = (j: RunnerJob): number => {   // 열 = 같은 포크 안 앞선 잡 중 제일 깊은 것 + 1 · 고리는 끊음
    const got = col.get(j.id); if (got !== undefined) return got;
    if (walking.has(j.id)) return 0;
    walking.add(j.id);
    const c = Math.max(0, ...(preds.get(j.id) || []).filter((p) => p.fork === j.fork).map((p) => colOf(p) + 1));   // 같은 포크 안 선만 열을 밂(다른 포크 선은 그리기만 · 줄 차례는 그 포크 시각대로)
    walking.delete(j.id); col.set(j.id, c); return c;
  };
  const rows = forks.map((f) => ({ f, jobs: map.jobs.filter((j) => j.fork === f.id).sort((a, b) => colOf(a) - colOf(b) || timeKey(a) - timeKey(b) || a.name.localeCompare(b.name, "ko")) }));
  const forkOn = (j: RunnerJob) => map.forks.find((f) => f.id === j.fork)?.on !== false;
  const soon = map.jobs.filter((j) => inG(j) && j.on !== false && forkOn(j) && (j.health?.next_at || 0) > now).sort((a, b) => (a.health?.next_at || 0) - (b.health?.next_at || 0))[0]?.id || "";   // 지난 next_at · 꺼진 잡·포크는 뺌(모루 06:36 덧)
  return { rows, edges, far, soon };
}

export type Rect = { left: number; right: number; top: number; bottom: number };
const r1 = (n: number) => Math.round(n * 10) / 10;
/** 선 하나의 길(그림 좌표 · 블록 밖 통로만 · 모루 11-09 06:36 ①) —
 *  같은 줄 바로 옆(사이에 블록 0) = 가운데서 한 번 꺾는 ㄱ자 · 그 밖(사이에 블록 있음 · 다른 줄 · 왼쪽) = 출발 블록 옆 세로 틈 → 줄 사이 가로 틈 → 도착 블록 왼쪽 세로 틈(격자라 세로 틈은 모든 줄에서 비어 있음) → 도착 · G = 틈 반(14) */
export function routeEdge(a: Rect, b: Rect, others: Rect[], G = 14): string {
  const x1 = r1(a.right), y1 = r1((a.top + a.bottom) / 2), x2 = r1(b.left), y2 = r1((b.top + b.bottom) / 2);
  const band = (r: Rect) => Math.abs((r.top + r.bottom) / 2 - y1) < (a.bottom - a.top) / 2;   // 같은 줄 = 세로 가운데가 출발 블록 높이 안
  const between = others.some((o) => band(o) && o.left >= a.right - 1 && o.right <= b.left + 1);
  if (band(b) && b.left >= a.right && !between) { const mx = r1((x1 + x2) / 2); return `M${x1} ${y1} H${mx} V${y2} H${x2 - 5}`; }
  const ym = r1(b.top >= a.bottom || band(b) ? a.bottom + G : a.top - G);   // 아래 줄 · 같은 줄 = 출발 줄 밑 틈 · 위 줄 = 출발 줄 위 틈
  return `M${x1} ${y1} H${r1(x1 + G)} V${ym} H${r1(x2 - G)} V${y2} H${x2 - 5}`;
}

/** 폰 선(세로 한 줄 쌓기 · 시아 11-09 08:14 【2】) = 출발 블록 왼쪽 가장자리 → 왼쪽 레일(lane 마다 4px 안쪽) → 도착 블록 왼쪽 가장자리(화살) · 위·아래 다 됨 */
export function routeRail(a: Rect, b: Rect, lane = 0): string {
  const y1 = r1((a.top + a.bottom) / 2), y2 = r1((b.top + b.bottom) / 2), x = r1(Math.min(a.left, b.left) - 6 - lane * 4);
  return `M${r1(a.left)} ${y1} H${x} V${y2} H${r1(b.left) - 5}`;
}

// ---- 바꾸기 판(【3】 2단 · 서버 POST schedule/runner · 형만) 순수 칸 ----
export type RunnerAct = { at: number; who: string; action: string; from?: string; to?: string };
export type RunnerRes = { ok: boolean; error?: string; why?: string; dry?: boolean; action?: string; would?: string; to?: string | null; red?: boolean; id: string; name: string; file: string; host?: string; owner?: string; state: string; state_why?: string; followers: string[]; acts: RunnerAct[]; dispatch: boolean };
export const ACTION_KO: Record<string, string> = { run: "지금 돌리기", on: "켬", off: "끔", state: "상태 보기" };
/** 깃허브 워크플로 상태 → 말(active = 켜짐 · disabled_* = 꺼짐 · 빈 값 = 모름) */
export const stateKo = (s: string) => (s === "active" ? "켜짐" : s ? `꺼짐(${s === "disabled_manually" ? "손으로" : s})` : "상태 모름");
/** 켬끔 스위치를 누르면 할 일 = 지금 켜져 있으면 off · 아니면 on */
export const toggleOf = (s: string): "on" | "off" => (s === "active" ? "off" : "on");
/** 서버가 손댈 수 있는 잡인가(깃허브 워크플로) — 몸 안 잡은 주인 칩만(시아 11-09 08:55 ③) */
export const ghJob = (j: RunnerJob) => j.host === "github" && /^gh:/.test(String(j.src || "")) && /\.ya?ml$/i.test(j.file || "");
