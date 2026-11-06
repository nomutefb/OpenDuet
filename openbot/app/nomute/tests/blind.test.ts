import assert from "node:assert/strict";
import { test } from "node:test";
import { BLIND_ALPHA, BLIND_IDLE_MS, blindDue } from "../ui/blind-rule.ts";

test("화면 가림 = 입력 15분 없으면 덮음 · 가림 85%(형 11-06 17:31)", () => {
  assert.equal(BLIND_IDLE_MS, 15 * 60_000);
  assert.equal(BLIND_ALPHA, 0.85);
  const t0 = 1_000_000;
  assert.equal(blindDue(true, false, t0, t0 + BLIND_IDLE_MS - 1), false);   // 15분 직전 = 아직
  assert.equal(blindDue(true, false, t0, t0 + BLIND_IDLE_MS), true);        // 15분 = 덮음
  assert.equal(blindDue(true, false, t0, t0 + 3 * BLIND_IDLE_MS), true);    // 탭이 오래 가려져 있다 돌아옴 = 덮음
});

test("화면 가림 = 끔이면 안 덮음 · 이미 덮였으면 다시 안 덮음", () => {
  const t0 = 1_000_000;
  assert.equal(blindDue(false, false, t0, t0 + 10 * BLIND_IDLE_MS), false);
  assert.equal(blindDue(true, true, t0, t0 + 10 * BLIND_IDLE_MS), false);
});
