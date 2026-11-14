import { test } from "node:test";
import assert from "node:assert/strict";
import { traceKo, traceOn, traceStop } from "../ui/signal-step.ts";

// 그록봇 신호 자국 — 부름 → 받음 → 들어옴 중 어디서 멈췄나(판정은 서버 것 · 여기선 그림 재료만)
test("문 끊김 = 받음에서 멈춤 · 깼는데 멈춤 = 들어옴에서 멈춤 · 들어옴 = 끝까지", () => {
  const door = { call: 1, got: false, in: false }, noshow = { call: 1, got: true, in: false }, inn = { call: 1, got: true, in: true };
  assert.deepEqual([traceStop(door), traceStop(noshow), traceStop(inn)], [1, 2, -1]);
  assert.deepEqual(traceOn(door), [true, false, false]);
  assert.deepEqual(traceOn(noshow), [true, true, false]);
  assert.deepEqual(traceOn(inn), [true, true, true]);
  assert.deepEqual(traceOn({ call: 1, got: false, in: true }), [true, false, false]);   // 못 받았으면 들어옴 구슬도 꺼짐(문 끊김 뒤 다른 길로 들어온 봇)
});

test("풀이 글 = 멈춤이면 까닭 · 5분 안이면 들어오는 중", () => {
  assert.equal(traceKo({ call: 1, got: false, in: false }, true), "불렀는데 그록이 안 받음");
  assert.equal(traceKo({ call: 1, got: true, in: false }, true), "받았는데 사무실에 안 들어옴");
  assert.equal(traceKo({ call: 1, got: true, in: false }, false), "받음 · 들어오는 중");
  assert.equal(traceKo({ call: 1, got: true, in: true }, false), "부르고 · 받고 · 들어옴");
});
