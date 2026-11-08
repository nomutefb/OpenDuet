import assert from "node:assert/strict";
import test from "node:test";
import { pickHost } from "../ui/runner-pick.ts";

// 모루 #2904 — 옛 host(hwang) 온도만 신선 · 새 host(sia) CPU 신선 → 새 host(점수 2 > 1) · 첫 묶음을 고르던 옛 길이면 hwang
test("옛 host 온도만 신선 + 새 host CPU 신선 = 새 host(hw 신선 2 > 온도 신선 1)", () => {
  const hw = [
    { key: "hwang", stale: true, reported_at: 100, metrics: { cpu: 1 } },
    { key: "hwang-temp", stale: false, reported_at: 900, metrics: { cpu_temp: 43 } },
    { key: "sia", stale: false, reported_at: 950, metrics: { cpu: 4 } },
  ];
  const p = pickHost(hw, ["hwang", "sia"]);
  assert.equal(p?.a?.key, "sia");
  assert.equal(p?.b, undefined);   // sia-temp 줄 없음 = 온도 빈칸(hwang 온도를 끌어오지 않음 · 모루 #2899 호스트 안 섞음)
});

test("둘 다 신선한 host 가 CPU 만 신선한 host 보다 먼저(3 > 2)", () => {
  const hw = [
    { key: "a", stale: false, reported_at: 500, metrics: { cpu: 10 } },
    { key: "b", stale: false, reported_at: 400, metrics: { cpu: 20 } },
    { key: "b-temp", stale: false, reported_at: 400, metrics: { cpu_temp: 50 } },
  ];
  const p = pickHost(hw, ["a", "b"]);
  assert.equal(p?.a?.key, "b");
  assert.equal(p?.b?.key, "b-temp");
});

test("alias 둘 다 낡음 = 마지막 보고가 최근인 host · 숫자는 그 host 것만", () => {
  const hw = [
    { key: "old", stale: true, reported_at: 100, metrics: { cpu: 1 } },
    { key: "old-temp", stale: true, reported_at: 120, metrics: { cpu_temp: 40 } },
    { key: "new", stale: true, reported_at: 300, metrics: { cpu: 2 } },
  ];
  const p = pickHost(hw, ["old", "new"]);
  assert.equal(p?.a?.key, "new");
  assert.equal(p?.b, undefined);
});

test("hosts 차례와 무관 · 보고 줄이 하나도 없으면 undefined", () => {
  const hw = [{ key: "x", stale: false, reported_at: 1, metrics: { cpu: 1 } }];
  assert.equal(pickHost(hw, ["y", "x"])?.a?.key, "x");
  assert.equal(pickHost(hw, ["y", "z"]), undefined);
  assert.equal(pickHost([], ["x"]), undefined);
});

test("온도 줄만 있는 host(hw 줄 0 · 누리 첫 보고 꼴) 도 고름(점수 1)", () => {
  const hw = [{ key: "nuri-temp", stale: false, reported_at: 10, metrics: { cpu_temp: 33 } }];
  const p = pickHost(hw, ["nuri"]);
  assert.equal(p?.a, undefined);
  assert.equal(p?.b?.key, "nuri-temp");
});
