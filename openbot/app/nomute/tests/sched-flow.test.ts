import assert from "node:assert/strict";
import { test } from "node:test";
import { type Rect, flowOf, modelKo, routeEdge, routeRail, stem, timeKey } from "../ui/sched-flow-core.ts";
import type { RunnerJob, SchedRunners } from "../ui/settings-extra.tsx";

// 러너 스케줄 흐름 그림 셈(봄 배분 19 · 시아 05:17 ②: 선 = after/calls 있는 것만 · 선 없는 잡은 시각 순 왼→오 · after 값은 .yml 없는 줄기 이름)
const job = (id: string, fork: string, more: Partial<RunnerJob> = {}): RunnerJob => ({ id, name: id, file: `${id}.yml`, kind: "script", fork, ...more });
const MAP: SchedRunners = {
  groups: [{ id: "collect", name: "수집·판정" }, { id: "guard", name: "지킴·기록" }],
  forks: [{ id: "job.beat", name: "수집 박자", group: "collect" }, { id: "job.watch", name: "살피기", group: "collect", on: false }, { id: "job.metric", name: "지표·기록", group: "guard" }],
  jobs: [
    job("judge", "job.beat", { cron_kst: ["CRON_TZ=Asia/Seoul 15 9 * * *"], out: { calls: ["analyze.yml"] }, health: { st: "ok", next_at: 2_000 } }),
    job("analyze", "job.beat", { clock: ["after"] }),
    job("sweep", "job.watch", { when: "10분마다", cron_kst: ["*/10 * * * *"], out: { calls: ["judge.yml", "analyze.yml", "state.yml"] } }),
    job("dawn", "job.beat", { cron_kst: ["CRON_TZ=Asia/Seoul 0 6 * * *"], health: { st: "late", next_at: 1_000 } }),
    job("manual", "job.beat", { starts: ["workflow_dispatch"] }),
    job("state", "job.metric", { in: { after: ["judge", "sweep"] }, clock: ["after"] }),
    { id: "mac", name: "맥 줄", file: "", kind: "script", fork: "job.metric" },
  ],
};

test("줄기 = .yml/.yaml 떼기", () => {
  assert.equal(stem("breaking-judge.yml"), "breaking-judge");
  assert.equal(stem("x.YAML "), "x");
  assert.equal(stem("breaking-judge"), "breaking-judge");
});

test("차례 열쇠 = 시각 → N분마다 → 뒤따름 → 부를 때만", () => {
  assert.equal(timeKey(job("a", "f", { cron_kst: ["CRON_TZ=Asia/Seoul 30 7 * * 1-5"] })), 450);
  assert.equal(timeKey(job("b", "f", { cron_kst: ["*/10 * * * *"] })), 1450);
  assert.equal(timeKey(job("c", "f", { when: "3시간마다" })), 1620);
  assert.equal(timeKey(job("d", "f", { clock: ["after"] })), 2880);
  assert.equal(timeKey(job("e", "f")), 4320);
  // 모루 06:36 ②: cron 줄 전부 · 시·분 목록 중 제일 이른 것
  assert.equal(timeKey(job("g", "f", { cron_kst: ["0 18 * * *", "0 6 * * *"] })), 360);
  assert.equal(timeKey(job("h", "f", { cron_kst: ["15,45 7 * * *"] })), 435);
  assert.equal(timeKey(job("i", "f", { cron_kst: ["CRON_TZ=Asia/Seoul 30 9,18 * * 1-5"] })), 570);
  assert.equal(timeKey(job("j", "f", { cron_kst: ["5 * * * *"] })), 1500);
});

test("「다음 차례」 = 아직 안 온 next_at 중 제일 가까운 켜진 잡(지난 것 · 꺼진 잡 · 꺼진 포크 뺌)", () => {
  const now = 5_000;
  const m: SchedRunners = { groups: [{ id: "g", name: "g" }], forks: [{ id: "f1", name: "f1", group: "g" }, { id: "f2", name: "f2", group: "g", on: false }], jobs: [
    job("past", "f1", { health: { st: "ok", next_at: 4_000 } }),
    job("off", "f1", { on: false, health: { st: "ok", next_at: 6_000 } }),
    job("forkoff", "f2", { health: { st: "ok", next_at: 6_500 } }),
    job("next", "f1", { health: { st: "ok", next_at: 7_000 } }),
    job("later", "f1", { health: { st: "ok", next_at: 9_000 } }),
  ] };
  assert.equal(flowOf(m, "g", now).soon, "next");
  assert.equal(flowOf(m, "g", 10_000).soon, "");
  // 시계 경계(모루 07:57): next_at 과 같은 시각이면 이미 지난 것 → 다음 잡으로 · 1ms 전이면 아직
  assert.equal(flowOf(m, "g", 7_000).soon, "later");
  assert.equal(flowOf(m, "g", 6_999).soon, "next");
});

test("선 길 = 바로 옆은 ㄱ자 · 사이에 블록 있거나 다른 줄이면 블록 밖 통로(3·4·5열)", () => {
  const W = 200, G = 28, H = 90;   // 격자 칸 · 가로 틈 · 블록 높이
  const cell = (col: number, row: number): Rect => ({ left: col * (W + G), right: col * (W + G) + W, top: row * (H + 18), bottom: row * (H + 18) + H });
  const yc = (r: Rect) => (r.top + r.bottom) / 2;
  for (const cols of [3, 4, 5]) {
    const row0 = Array.from({ length: cols }, (_, c) => cell(c, 0)), row1 = Array.from({ length: cols }, (_, c) => cell(c, 1));
    const all = [...row0, ...row1];
    const others = (a: Rect, b: Rect) => all.filter((r) => r !== a && r !== b);
    // 0 → 1(바로 옆) = ㄱ자: 가운데서 한 번 꺾음 · 줄 틈으로 안 내려감
    const d01 = routeEdge(row0[0], row0[1], others(row0[0], row0[1]));
    assert.equal(d01, `M${W} ${yc(row0[0])} H${W + G / 2} V${yc(row0[1])} H${W + G - 5}`, `${cols}열 0→1`);
    // 0 → 2(사이에 1) = 출발 줄 밑 틈(bottom+14)으로 돌아감 · 1 번 블록을 안 지남
    const d02 = routeEdge(row0[0], row0[2], others(row0[0], row0[2]));
    assert.ok(d02.includes(`V${row0[0].bottom + 14}`), `${cols}열 0→2 통로`);
    assert.ok(d02.includes(`H${row0[2].left - 14}`), `${cols}열 0→2 도착 세로 틈`);
    // 0 → 아래 줄 2 = 통로 · 2 → 위 줄 0(왼쪽 위) = 위 틈(top-14)
    assert.ok(routeEdge(row0[0], row1[2], others(row0[0], row1[2])).includes(`V${row0[0].bottom + 14}`), `${cols}열 아래 줄`);
    assert.ok(routeEdge(row1[2], row0[0], others(row1[2], row0[0])).includes(`V${row1[2].top - 14}`), `${cols}열 위 줄`);
  }
});

test("모델 짧게", () => {
  assert.equal(modelKo(job("a", "f", { model: ["claude-opus-5-5", "gemini-3.1-flash-image"] })), "opus 5.5 +1");
  assert.equal(modelKo(job("b", "f", { providers: ["클로드"] })), "클로드");
  assert.equal(modelKo(job("c", "f")), "LLM 없음");
});

test("갈래 안 선 · 차례 · 다른 갈래 칩 · 다음 차례", () => {
  const f = flowOf(MAP, "collect", 0);   // now=0 → 시험 next_at(1000 · 2000)이 「아직 안 옴」
  assert.deepEqual(f.rows.map((r) => r.f.id), ["job.beat", "job.watch"]);
  // 수집 박자: 선 없는 셋은 시각 순(dawn 06:00 → judge 09:15 → manual 맨 뒤) · analyze 는 judge 뒤따름(열 1)이라 맨 끝 · sweep 이 judge·analyze 를 부르지만 sweep 은 열 0 그대로
  assert.deepEqual(f.rows[0].jobs.map((j) => j.id), ["dawn", "judge", "manual", "analyze"]);
  assert.deepEqual(f.rows[1].jobs.map((j) => j.id), ["sweep"]);
  assert.deepEqual(f.edges.map((e) => `${e.from.id}>${e.to.id}:${e.kind}`).sort(), ["judge>analyze:calls", "sweep>analyze:calls", "sweep>judge:calls"]);
  // 다른 갈래로 가는 선 = 칩(갈래 이름까지) · state 는 guard
  assert.deepEqual(f.far.get("sweep")?.map((x) => `${x.dir}:${x.job.id}@${x.group}`), ["out:state@guard"]);
  assert.deepEqual(f.far.get("judge")?.map((x) => `${x.dir}:${x.job.id}@${x.group}`), ["out:state@guard"]);
  assert.equal(f.soon, "dawn");   // next_at 제일 가까운 잡 하나 = 라임
});

test("다른 갈래 쪽에서 보면 들어오는 칩 · after 줄기 이름으로 맞춤 · file 없는 줄은 선 주인 아님", () => {
  const g = flowOf(MAP, "guard", 0);
  assert.deepEqual(g.rows[0].jobs.map((j) => j.id), ["state", "mac"]);
  assert.equal(g.edges.length, 0);
  assert.deepEqual(g.far.get("state")?.map((x) => `${x.dir}:${x.job.id}`).sort(), ["in:judge", "in:sweep"]);
  assert.equal(g.soon, "");
});

test("폰 선 = 왼쪽 레일(lane 마다 4px 안쪽) · 아래로도 위로도 · 도착은 왼쪽 가장자리 화살", () => {
  const a: Rect = { left: 26, right: 360, top: 100, bottom: 190 }, b: Rect = { left: 26, right: 360, top: 204, bottom: 294 };
  assert.equal(routeRail(a, b), "M26 145 H20 V249 H21");
  assert.equal(routeRail(a, b, 2), "M26 145 H12 V249 H21");
  assert.equal(routeRail(b, a, 1), "M26 249 H16 V145 H21");
});
