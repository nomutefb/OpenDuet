// 읽는 중 · 못 읽음 글 한 벌(ui/wait-text.ts)
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFail, reading } from "../ui/wait-text.ts";

test("읽는 중 = 「[무엇] 읽는 중…」", () => {
  assert.equal(reading(), "읽는 중…");
  assert.equal(reading("표"), "표 읽는 중…");
});
test("못 읽음 = 무엇을/를 — 다음 행동 (까닭은 꼬리)", () => {
  assert.equal(readFail(new Error("봄의 정원 서버 502"), "스케줄 표"), "스케줄 표를 못 읽었어 — 다시 열어 줘 (봄의 정원 서버 502)");
  assert.equal(readFail(new Error("x"), "설정"), "설정을 못 읽었어 — 다시 열어 줘 (x)");
  assert.equal(readFail(null), "못 읽었어 — 다시 열어 줘");
  assert.equal(readFail(new Error("가".repeat(200))).length < 110, true);
});
