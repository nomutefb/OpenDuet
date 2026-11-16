// 「모아 깨우기」 셈(ui/kind-wait-logic.ts) — 낱말 · 고를 수 있는 값 · 지금 값 끼우기
import { test } from "bun:test";
import assert from "node:assert/strict";
import { waitKo, waitOk, waitOpts } from "../ui/kind-wait-logic";

test("분 → 한 마디 — 2분 = 바로 · 시간 · 날", () => {
  assert.deepEqual([2, 5, 30, 60, 90, 240, 720, 1440, 2880].map(waitKo), ["바로", "5분", "30분", "1시간", "1시간 30분", "4시간", "12시간", "1일", "2일"]);
});
test("고를 수 있는 값 = 서버 잣대(2 ~ 240 · 기한 안)", () => {
  assert.equal(waitOk(2), true); assert.equal(waitOk(1), false); assert.equal(waitOk(241), false); assert.equal(waitOk(2.5), false);
  assert.equal(waitOk(60, 30), false); assert.equal(waitOk(30, 30), true);
});
test("낱말 줄 = 기한 안의 기본 값 + 지금 값(밖이면 끼움)", () => {
  assert.deepEqual(waitOpts(2, 30), [2, 5, 10, 30]);                       // 속보 경보(기한 30분)
  assert.deepEqual(waitOpts(240, 1440), [2, 5, 10, 30, 60, 120, 240]);
  assert.deepEqual(waitOpts(720, 1440), [2, 5, 10, 30, 60, 120, 240, 720]);   // 범위 밖 지금 값도 줄에 보임
  assert.deepEqual(waitOpts(15, 60), [2, 5, 10, 15, 30, 60]);
  assert.deepEqual(waitOpts(undefined, 60), [2, 5, 10, 30, 60]);
});
