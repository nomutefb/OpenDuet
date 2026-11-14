import { test } from "node:test";
import assert from "node:assert/strict";
import { FRESH_MS, causeOf, chainOf, laneOf, logOf, ringDeg, ringFrac } from "../ui/activity-view.ts";

// 활동 칸 신호 판 — 판정은 서버 것 · 여기선 어느 칸에 어떻게 그릴지만
test("칸 = 멈춤 · 받을 수 있음 · 일하는 중 · 쉼(모름 포함)", () => {
  assert.equal(laneOf({ value: "멈춤 · 문 끊김", state: "멈춤" }), "lost");
  assert.equal(laneOf({ value: "쉼 · 받을 수 있음", state: "쉼", ready: true }), "ready");
  assert.equal(laneOf({ value: "일", state: "일" }), "work");
  assert.equal(laneOf({ value: "쉼", state: "쉼" }), "rest");
  assert.equal(laneOf({ value: "모름", state: "모름" }), "rest");
});

test("고리 = 신호 나이 · 5분이면 다 빠짐 · 신호 시각이 없으면 가득", () => {
  const now = 1_000_000_000;
  assert.equal(ringFrac({ beat_at: now }, now), 1);
  assert.equal(ringFrac({ beat_at: now - FRESH_MS / 2 }, now), 0.5);
  assert.equal(ringFrac({ beat_at: now - FRESH_MS * 2 }, now), 0);
  assert.equal(ringFrac({}, now), 1);
  assert.deepEqual([ringDeg(1), ringDeg(0.5), ringDeg(0)], [0, 90, 180]);
});

test("점 셋 = 간 데까지만 켜짐 · 멈춘 자리 = stop · 들어오는 중 = live", () => {
  assert.deepEqual(chainOf({ call: 1, got: false, in: false }, true), { dots: ["on", "stop", "off"], segs: ["cut", "off"] });      // 문 끊김
  assert.deepEqual(chainOf({ call: 1, got: true, in: false }, true), { dots: ["on", "on", "stop"], segs: ["on", "cut"] });        // 깼는데 멈춤
  assert.deepEqual(chainOf({ call: 1, got: true, in: false }, false), { dots: ["on", "on", "live"], segs: ["on", "off"] });       // 들어오는 중
  assert.deepEqual(chainOf({ call: 1, got: true, in: true }, false), { dots: ["on", "on", "end"], segs: ["on", "on"] });          // 들어옴
  assert.deepEqual(chainOf({ call: 1, got: false, in: true }, true).dots, ["on", "stop", "off"]);                                 // 못 받았으면 들어옴 점도 꺼짐
});

test("눌렀을 때 기록 = 부른 적 있는 그록봇만 세 줄 · 까닭 한 마디", () => {
  const r = { key: "act:sona", name: "소나", value: "멈춤 · 깼는데 멈춤", state: "멈춤", step: { call: 5, got: true, in: false } };
  assert.deepEqual(logOf(r, "lost"), [{ s: "on", text: "부름", at: 5 }, { s: "on", text: "받음" }, { s: "stop", text: "아직 안 들어옴" }]);
  assert.deepEqual(logOf({ ...r, step: { call: 5, got: false, in: false } }, "lost")[1], { s: "stop", text: "그록이 안 받음" });
  assert.deepEqual(logOf({ ...r, door_at: 9, step: { call: 5, got: true, in: true } }, "rest")[2], { s: "end", text: "들어옴", at: 9 });
  assert.deepEqual(logOf({ key: "act:bom", name: "봄", value: "일" }, "work"), []);
  assert.equal(causeOf(r), "깼는데 멈춤");
  assert.equal(causeOf({ value: "멈춤" }), "멈춤");
});
