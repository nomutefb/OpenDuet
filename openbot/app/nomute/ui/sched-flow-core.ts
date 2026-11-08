// 러너 스케줄 흐름 그림의 셈(순수 · 화면은 ./sched-flow.tsx · 시험 tests/sched-flow.test.ts) —
//   선 = in.after(뒤따름) · out.calls(부름) 있는 것만 · after 값은 .yml 없는 줄기 이름(「breaking-judge」) · calls 는 「news-analyze.yml」 → 둘 다 줄기로 맞춤(러너 지도 실물 11-09)
//   차례 = 앞선 잡(같은 갈래 선) 깊이 → 하루 중 첫 시각 → 이름 · 선 없는 잡은 시각 순 왼→오(시아 11-09 05:17 ②)
import type { RunnerJob, SchedRunners } from "./settings-extra";

export type Edge = { k: string; from: RunnerJob; to: RunnerJob; kind: "after" | "calls" };
export type Far = { dir: "in" | "out"; job: RunnerJob; group: string };   // 다른 갈래와 잇는 선 = 블록 밑 칩(누르면 그 갈래로)
export const stem = (s: string) => s.trim().replace(/\.ya?ml$/i, "");
const CRON_H = /^CRON_TZ=\S+\s+/;
const add = <T,>(m: Map<string, T[]>, k: string, v: T) => { const a = m.get(k); if (a) a.push(v); else m.set(k, [v]); };

/** 왼→오 차례 열쇠(분) = 하루 중 첫 시각 · N분마다 = 하루 뒤(1440+N) · 못 읽는 cron = 1470 · 뒤따름 = 2880 · 부를 때만 = 4320(맨 뒤) */
export function timeKey(j: RunnerJob): number {
  const c = (j.cron_kst || [])[0]?.replace(CRON_H, "").trim().split(/\s+/);
  if (c && c.length === 5) {
    const ev = c[0].match(/^\*\/(\d+)/); if (ev) return 1440 + +ev[1];
    const h = c[1].match(/^\d+/); if (h) return +h[0] * 60 + (/^\d+$/.test(c[0]) ? +c[0] : 0);
    return 1440 + 30;
  }
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
/** 한 갈래의 그림 재료 = 포크별 잡 차례 · 갈래 안 선 · 다른 갈래로 가는 칩 · 「다음 차례」(next_at 제일 가까운 잡 하나 = 라임 한 곳) */
export function flowOf(map: SchedRunners, group: string): Flow {
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
  const soon = map.jobs.filter((j) => inG(j) && j.health?.next_at).sort((a, b) => (a.health?.next_at || 0) - (b.health?.next_at || 0))[0]?.id || "";
  return { rows, edges, far, soon };
}
