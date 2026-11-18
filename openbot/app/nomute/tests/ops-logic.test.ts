// 5번 위 탭 「살림」의 셈(../ui/ops-logic.ts) — 눈금 · 막대 자리 · 7일 전 견줌 · 단계 띠
import assert from "node:assert/strict";
import { test } from "node:test";
import { type OpsRow, avgBefore, barGeom, hm, lensDelta, lineOver, man, niceMax, stepRows, weekBefore } from "../ui/ops-logic.ts";

test("큰 수 · 시간 글", () => {
  assert.equal(man(7699721), "770만"); assert.equal(man(12006), "1.2만"); assert.equal(man(483), "483"); assert.equal(man(60995076), "6100만");
  assert.equal(hm(45), "45분"); assert.equal(hm(1178.2), "19시간 38분"); assert.equal(hm(120), "2시간");
});
test("눈금 끝", () => { assert.equal(niceMax(7.3e6), 8e6); assert.equal(niceMax(29.3), 30); assert.equal(niceMax(41.7), 50); assert.equal(niceMax(0), 1); assert.equal(niceMax(2300), 2500); assert.equal(niceMax(1000), 1000); });
test("막대 자리 — 값 없는 날은 막대 없음 · 틀 안", () => {
  const g = barGeom([10, null, 20], 300, 168);
  assert.equal(g.max, 20); assert.equal(g.bars[1].v, null); assert.equal(g.bars[1].h, 0);
  assert.equal(Math.round(g.bars[2].y), g.top);
  for (const b of g.bars) assert.ok(b.x >= g.l && b.x + b.w <= 300 - g.r);
  assert.match(lineOver([1, null, 2], g).d, /^M[\d.]+,[\d.]+M[\d.]+,[\d.]+$/);   // 값 없는 날에서 선이 끊김
});
const row = (day: string, cart: [string, number][]): OpsRow => ({ day, lens: { cart: cart.map(([wf, min]) => ({ wf, min })), cart_together: [], bulb: [], post: [], door: [] } });
test("7일 전과 견줌", () => {
  const rows = [row("2026-11-11", [["a", 100], ["b", 10]]), row("2026-11-17", [["a", 1]]), row("2026-11-18", [["a", 60], ["b", 10.4], ["c", 5]])];
  assert.equal(weekBefore(rows, 2), 0); assert.equal(weekBefore(rows, 1), -1);
  assert.deepEqual(lensDelta(rows, 2, "cart", "a"), { kind: "down", by: 40 });
  assert.deepEqual(lensDelta(rows, 2, "cart", "b"), { kind: "same" });
  assert.deepEqual(lensDelta(rows, 2, "cart", "c"), { kind: "new" });
  assert.deepEqual(lensDelta(rows, 1, "cart", "a"), { kind: "none" });
});
test("단계 띠 — 가장 긴 것이 100%", () => {
  const r: OpsRow = { day: "2026-11-18", run: { total: { runs: 0, skipped: 0, failed: 0, cancelled: 0, empty: 0, wall_min: 0, runner_min_est: 0 }, together: [],
    wf: { a: { n: 50, skipped: 2, failed: 0, empty: 0, wall_min: 9, job_s: 100, checkout_s: 20, setup_s: 0, work_s: 30, commit_s: 50, wait_s: 0, top_steps: [["커밋", 50]] }, b: { n: 3, skipped: 0, failed: 0, empty: 0, wall_min: 1 } } } };
  const s = stepRows(r);
  assert.equal(s.length, 1); assert.equal(s[0].n, 48); assert.equal(s[0].top, "커밋 50초");
  assert.equal(Math.round(s[0].segs.reduce((a, x) => a + x.pct, 0)), 100); assert.deepEqual(s[0].segs.map((x) => x.cls), ["ck", "wk", "cm"]);
});
test("앞 7일 평균", () => { assert.equal(avgBefore([10, null, 20, 99], 3), 15); assert.equal(avgBefore([5], 0), null); });
