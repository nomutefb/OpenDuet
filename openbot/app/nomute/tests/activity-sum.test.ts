import { test } from "node:test";
import assert from "node:assert/strict";
import { actKind, actSort, actSum } from "../ui/activity-sum.ts";

const rows = [
  { name: "봄", value: "일", state: "일" },
  { name: "시아", value: "쉼 · 받을 수 있음", state: "쉼", ready: true },
  { name: "결", value: "모름", state: "모름" },
  { name: "깃", value: "멈춤 · 신호 끊김", state: "멈춤" },
  { name: "촉", value: "쉼", state: "쉼" },
  { name: "빠르", value: "쉼 · 받을 수 있음", state: "쉼", ready: true },
];

test("활동 줄 갈래 = 서버가 준 state · ready 그대로", () => {
  assert.deepEqual(rows.map(actKind), ["work", "ready", "unknown", "lost", "rest", "ready"]);
  assert.equal(actKind({ value: "쉼 · 받을 수 있음" }), "ready");   // ready 칸 없이 글만 와도
  assert.equal(actKind({}), "unknown");
});

test("활동 합계 = 갈래마다 몇인지", () => {
  assert.deepEqual(actSum(rows), { lost: 1, ready: 2, work: 1, rest: 1, unknown: 1 });
});

test("활동 줄 차례 = 멈춤 → 받을 수 있음 → 일 → 쉼 → 모름 · 같은 갈래는 온 차례", () => {
  assert.deepEqual(actSort(rows).map((r) => r.name), ["깃", "시아", "빠르", "봄", "촉", "결"]);
});
