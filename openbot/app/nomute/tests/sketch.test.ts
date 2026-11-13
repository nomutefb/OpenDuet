// 화상회의 스케치 순수 판(ui/sketch-logic.ts · 뜸 11-13)
import { test } from "node:test";
import assert from "node:assert/strict";
import { pathOf, skColor } from "../ui/sketch-logic.ts";

test("그린 사람 색 = 형 라임 · 우리 제 색 · 모르는 이도 늘 같은 색", () => {
  assert.equal(skColor("형"), "#CFFF40");
  assert.equal(skColor("챙"), "#8FC45A");
  assert.equal(skColor("누군가"), skColor("누군가"));
  assert.match(skColor("누군가"), /^#[0-9A-F]{6}$/i);
});

test("자유선 · 화살표 = ‰ path", () => {
  assert.equal(pathOf({ id: "a", k: "free", who: "형", at: 0, p: [[0, 0], [10, 20], [30, 40]] }), "M0 0L10 20L30 40");
  assert.equal(pathOf({ id: "b", k: "arrow", who: "깃", at: 0, x: 1, y: 2, x2: 3, y2: 4 }), "M1 2L3 4");
  assert.equal(pathOf({ id: "c", k: "free", who: "형", at: 0, p: [] }), "");
});
