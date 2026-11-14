// 러너 스케줄러 = 노드 트리의 셈(순수 · 화면은 ./sched-tree.tsx · 시험 tests/sched-tree.test.ts)
//   형 11-14 클라우드 세션 창 「스케줄러를 중간에 있는 이 형태로 짜서 트리구조로 만들거임」(노드 영상 178b5184) · 「러너들 스케줄러, 그리고 그게 실제로 반영되게」
//   나무 = 러너(뿌리) → 갈래 → 포크 → 잡 · 잡 밑 잡 = 같은 포크 안에서 뒤따름(in.after) · 부름(out.calls)으로 이어진 것(앞선 잡 하나를 부모로) · 나머지 잡은 포크 바로 밑
//   자리 = PC 는 왼→오(깊이) · 위→아래(잎 차례) · 부모는 자식들 가운데 높이 / 폰은 위→아래 한 줄 쌓기 + 깊이만큼 들여쓰기(down) · 접은 가지는 잎으로 셈
//   처음 = 뿌리 · 갈래 · 잡 가지는 펼침 · 포크는 접힘(잡 118개를 한꺼번에 안 쏟음 — 포크를 누르면 그 밑이 펼쳐짐)
import type { RunnerJob, SchedRunners } from "./settings-extra";
import { stem, timeKey } from "./sched-flow-core.ts";

export type TKind = "root" | "group" | "fork" | "job";
export type TNode = { id: string; kind: TKind; name: string; parent: string; depth: number; x: number; y: number; w: number; h: number; kids: number; open: boolean; via: "tree" | "after" | "calls"; job?: RunnerJob; fork?: SchedRunners["forks"][number] };
export type TEdge = { k: string; from: string; to: string; kind: "tree" | "after" | "calls" };
export type Tree = { nodes: TNode[]; edges: TEdge[]; w: number; h: number };
export const SIZE: Record<TKind, { w: number; h: number }> = { root: { w: 104, h: 44 }, group: { w: 148, h: 48 }, fork: { w: 204, h: 58 }, job: { w: 236, h: 86 } };
export const GAP_X = 64, GAP_Y = 22, PAD = 28, INDENT = 20, GAP_DOWN = 12;

type Raw = { id: string; kind: TKind; name: string; via: TNode["via"]; job?: RunnerJob; fork?: SchedRunners["forks"][number]; kids: Raw[] };

/** 한 갈래의 나무 재료(자리 셈 전) — 포크 안 잡을 뒤따름 · 부름 선으로 엮음 · 고리는 끊음 */
export function rawOf(map: SchedRunners, group: string): Raw {
  const g = map.groups.find((x) => x.id === group);
  const byStem = new Map<string, RunnerJob>();
  for (const j of map.jobs) if (j.file && !byStem.has(stem(j.file))) byStem.set(stem(j.file), j);
  const order = (a: RunnerJob, b: RunnerJob) => timeKey(a) - timeKey(b) || a.name.localeCompare(b.name, "ko");
  const forks = map.forks.filter((f) => f.group === group).map((f): Raw => {
    const jobs = map.jobs.filter((j) => j.fork === f.id).sort(order), inF = new Set(jobs.map((j) => j.id));
    const parent = new Map<string, { p: string; via: "after" | "calls" }>();
    const link = (from: RunnerJob | undefined, to: RunnerJob | undefined, via: "after" | "calls") => {
      if (!from || !to || from.id === to.id || !inF.has(from.id) || !inF.has(to.id) || parent.has(to.id)) return;
      for (let p: string | undefined = from.id, n = 0; p && n < 200; p = parent.get(p)?.p, n++) if (p === to.id) return;   // 고리 = 안 엮음
      parent.set(to.id, { p: from.id, via });
    };
    for (const j of jobs) for (const a of j.in?.after || []) link(byStem.get(stem(a)), j, "after");
    for (const j of jobs) for (const c of j.out?.calls || []) link(j, byStem.get(stem(c)), "calls");
    const node = (j: RunnerJob): Raw => ({ id: j.id, kind: "job", name: j.name, via: parent.get(j.id)?.via || "tree", job: j, kids: jobs.filter((x) => parent.get(x.id)?.p === j.id).map(node) });
    return { id: f.id, kind: "fork", name: f.name, via: "tree", fork: f, kids: jobs.filter((j) => !parent.has(j.id)).map(node) };
  });
  return { id: `g:${group}`, kind: "group", name: g?.name || group, via: "tree", kids: forks };
}
/** 러너 전체 = 뿌리 하나 밑에 갈래들 */
export function rawAll(map: SchedRunners): Raw {
  return { id: "root", kind: "root", name: "러너", via: "tree", kids: map.groups.map((g) => rawOf(map, g.id)) };
}
/** 처음 펼침 = 포크만 접힘 */
export const openOf = (open: Record<string, boolean>, id: string, kind: TKind) => open[id] ?? kind !== "fork";

/** 깊이마다 왼쪽 자리 = 앞 깊이들의 폭 + 틈(뿌리 → 갈래 → 포크 → 잡 → 잡 …) */
const xOf = (depth: number) => { let x = PAD; const ks: TKind[] = ["root", "group", "fork"]; for (let d = 0; d < depth; d++) x += SIZE[ks[d] || "job"].w + GAP_X; return x; };

/** 나무 자리 셈 — 접힌 가지는 자식 안 그림(수만 kids 에) · down = 폰(판 폭) */
export function treeOf(map: SchedRunners, open: Record<string, boolean> = {}, down = 0): Tree {
  const nodes: TNode[] = [], edges: TEdge[] = [];
  let cursor = PAD, maxX = 0;
  const count = (r: Raw): number => r.kids.reduce((a, k) => a + (k.kind === "job" ? 1 : 0) + count(k), 0);   // 밑에 달린 잡 수
  const place = (r: Raw, depth: number, parent: string): TNode => {
    const s = SIZE[r.kind], isOpen = r.kids.length > 0 && openOf(open, r.id, r.kind);
    const n: TNode = { id: r.id, kind: r.kind, name: r.name, parent, depth, x: xOf(depth), y: 0, w: s.w, h: s.h, kids: count(r), open: isOpen, via: r.via, job: r.job, fork: r.fork };
    nodes.push(n);
    if (down) {   // 폰 = 한 줄 쌓기 · 들여쓰기
      n.x = PAD / 2 + depth * INDENT; n.w = Math.max(160, down - n.x - PAD / 2); n.y = cursor; cursor += s.h + GAP_DOWN;
      if (isOpen) for (const k of r.kids) { const c = place(k, depth + 1, r.id); edges.push({ k: `${r.id}>${c.id}`, from: r.id, to: c.id, kind: c.via }); }
    } else if (isOpen) {
      const ks = r.kids.map((k) => place(k, depth + 1, r.id));
      const top = ks[0].y + ks[0].h / 2, bot = ks[ks.length - 1].y + ks[ks.length - 1].h / 2;
      n.y = (top + bot) / 2 - s.h / 2;
      for (const k of ks) edges.push({ k: `${r.id}>${k.id}`, from: r.id, to: k.id, kind: k.via });
      if (n.y + s.h + GAP_Y > cursor) cursor = n.y + s.h + GAP_Y;   // 부모가 자식 묶음보다 키가 클 때
    } else { n.y = cursor; cursor += s.h + GAP_Y; }
    maxX = Math.max(maxX, n.x + n.w);
    return n;
  };
  place(rawAll(map), 0, "");
  return { nodes, edges, w: down || maxX + PAD, h: Math.max(cursor - (down ? GAP_DOWN : GAP_Y), 0) + PAD };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
/** 선 하나의 길 = 부모 오른쪽 가운데 → 가운데 세로 통로 → 자식 왼쪽 가운데 · 꺾이는 곳은 둥글게(R) — 영상의 선 꼴 */
export function edgePath(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; h: number }, R = 10): string {
  const x1 = r1(a.x + a.w), y1 = r1(a.y + a.h / 2), x2 = r1(b.x), y2 = r1(b.y + b.h / 2), mx = r1((x1 + x2) / 2);
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) return `M${x1} ${y1} H${x2}`;
  const r = Math.min(R, Math.abs(dy) / 2, Math.abs(mx - x1), Math.abs(x2 - mx)), s = dy > 0 ? 1 : -1;
  return `M${x1} ${y1} H${r1(mx - r)} Q${mx} ${y1} ${mx} ${r1(y1 + s * r)} V${r1(y2 - s * r)} Q${mx} ${y2} ${r1(mx + r)} ${y2} H${x2}`;
}

/** 폰 선 = 부모 왼쪽 아래에서 내려와 자식 왼쪽 가운데로(둥근 꺾임 하나) */
export function railPath(a: { x: number; y: number; h: number }, b: { x: number; y: number; h: number }, R = 8): string {
  const x = r1(a.x + INDENT / 2), y1 = r1(a.y + a.h), y2 = r1(b.y + b.h / 2), r = Math.min(R, Math.abs(b.x - x), Math.abs(y2 - y1));
  return `M${x} ${y1} V${r1(y2 - r)} Q${x} ${y2} ${r1(x + r)} ${y2} H${r1(b.x)}`;
}

/** 처음 보일 배율 · 자리 = 나무가 판보다 넓으면 줄여서 다 보이게(바닥 0.45) · 세로는 위에서부터 */
export function fitOf(tree: { w: number; h: number }, view: { w: number; h: number }): { k: number; x: number; y: number } {
  const k = Math.max(0.45, Math.min(1, view.w / Math.max(1, tree.w)));
  return { k: Math.round(k * 100) / 100, x: Math.max(0, Math.round((view.w - tree.w * k) / 2)), y: 0 };
}
/** 배율 바꾸기 = 손가락(마우스) 밑 점이 제자리에 있게 */
export function zoomAt(v: { k: number; x: number; y: number }, to: number, px: number, py: number): { k: number; x: number; y: number } {
  const k = Math.max(0.3, Math.min(1.6, to));
  return { k, x: px - ((px - v.x) / v.k) * k, y: py - ((py - v.y) / v.k) * k };
}
