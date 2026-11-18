// 러버밴드 게이지 셈(ui/rbs-gauge-core.ts · 원본 = editor viewer/nm-gauge.js at() · 넘친 거리 ×.32) — 봄 11-18
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { K, rbsAt, rbsFrac } from "../ui/rbs-gauge-core.ts";

test("넘친 거리 추종 비율 = kinetics 원본 동값 .32", () => { assert.equal(K, 0.32); });
test("트랙 안 = 칸에 맞춘 값 · 그릴 자리 = 손 자리 그대로", () => {
  assert.deepEqual(rbsAt(0.5, 0, 8, 1), [4, 0.5]);
  assert.deepEqual(rbsAt(0.42, 5, 100, 5), [45, 0.42]);   // 5 + round(.42 × 95 / 5) × 5
});
test("트랙 밖 = 값은 끝에서 멈추고 그림만 넘친 거리 ×.32", () => {
  const [v, p] = rbsAt(1.5, 5, 100, 5);
  assert.equal(v, 100); assert.ok(Math.abs(p - 1.16) < 1e-9);
  const [v2, p2] = rbsAt(-0.25, 0, 8, 1);
  assert.equal(v2, 0); assert.ok(Math.abs(p2 + 0.08) < 1e-9);
});
test("값 → 자리 = 0~1 로 가둠 · 범위가 0 이면 0", () => {
  assert.equal(rbsFrac(20, 5, 100), 15 / 95); assert.equal(rbsFrac(200, 5, 100), 1); assert.equal(rbsFrac(1, 5, 100), 0); assert.equal(rbsFrac(3, 3, 3), 0);
});
test("설정 슬라이더 둘 = 이 게이지 하나(브라우저 기본 range 를 따로 그리지 않음)", () => {
  for (const f of ["pin-tint.tsx", "lock.tsx"]) {
    const t = readFileSync(new URL(`../ui/${f}`, import.meta.url), "utf8");
    assert.match(t, /<RbsGauge /, f);
    assert.doesNotMatch(t, /<input type="range"/, f);
  }
});
