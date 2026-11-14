// 무게 재기 ?perf= 스위치(봄 11-14 09:15)
import assert from "node:assert/strict";
import test from "node:test";
import { perfOff } from "../ui/perf-switch.ts";
test("perf 꼬리표 → 끌 것", () => {
  assert.deepEqual(perfOff("?perf=face,glass"), ["face", "glass"]);
  assert.deepEqual(perfOff("?perf=nope"), []);
  assert.equal(perfOff("?perf=all").length, 9);
  assert.deepEqual(perfOff(""), []);
});
