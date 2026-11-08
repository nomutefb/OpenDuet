import assert from "node:assert/strict";
import { test } from "node:test";
import { flowOf, modelKo, stem, timeKey } from "../ui/sched-flow-core.ts";
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
});

test("모델 짧게", () => {
  assert.equal(modelKo(job("a", "f", { model: ["claude-opus-5-5", "gemini-3.1-flash-image"] })), "opus 5.5 +1");
  assert.equal(modelKo(job("b", "f", { providers: ["클로드"] })), "클로드");
  assert.equal(modelKo(job("c", "f")), "LLM 없음");
});

test("갈래 안 선 · 차례 · 다른 갈래 칩 · 다음 차례", () => {
  const f = flowOf(MAP, "collect");
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
  const g = flowOf(MAP, "guard");
  assert.deepEqual(g.rows[0].jobs.map((j) => j.id), ["state", "mac"]);
  assert.equal(g.edges.length, 0);
  assert.deepEqual(g.far.get("state")?.map((x) => `${x.dir}:${x.job.id}`).sort(), ["in:judge", "in:sweep"]);
  assert.equal(g.soon, "");
});
