// 설정 「모델 · 노력도」 논리(ui/model-set-logic.ts) — 형 11-15 「설정에서 일괄 모델 하고 노력도 변경 반영이 가능하게」
import { test } from "node:test";
import assert from "node:assert/strict";
import { EFFORT_KO, koOf, pickKo, sameOf, sumKo } from "../ui/model-set-logic.ts";

const MODELS = [{ id: "claude-opus-5-5", ko: "오퍼스 5.5" }, { id: "claude-sonnet-5-5", ko: "소네트 5.5" }];
const EFFORTS = ["low", "medium", "high", "xhigh", "max"].map((id) => ({ id, ko: EFFORT_KO[id] }));

test("글자 = 표에 있으면 우리말 · 없으면 받은 그대로 · 한 벌 = 「모델 · 노력도」", () => {
  assert.equal(koOf(MODELS, "claude-opus-5-5"), "오퍼스 5.5");
  assert.equal(koOf(MODELS, "claude-next-9"), "claude-next-9");   // 서버가 새 값을 줘도 빈 칸이 아님
  assert.equal(pickKo(MODELS, EFFORTS, { model: "claude-sonnet-5-5", effort: "xhigh" }), "소네트 5.5 · 아주 높음");
  assert.deepEqual(EFFORTS.map((e) => e.ko), ["낮음", "보통", "높음", "아주 높음", "최대"]);
});

test("「모두」 줄 = 다 같으면 그 값 · 하나라도 다르면 빈 글(= 섞임) · 묶음 줄 한마디도 같은 눈", () => {
  const a = { model: "claude-opus-5-5", effort: "high" }, b = { model: "claude-opus-5-5", effort: "medium" };
  assert.equal(sameOf([a, a], "model"), "claude-opus-5-5");
  assert.equal(sameOf([a, b], "model"), "claude-opus-5-5");
  assert.equal(sameOf([a, b], "effort"), "");
  assert.equal(sameOf([], "model"), "");
  assert.equal(sumKo([a, a], MODELS, EFFORTS), "봇 오퍼스 5.5 · 높음");
  assert.equal(sumKo([a, b], MODELS, EFFORTS), "봇 오퍼스 5.5 · 섞임");
  assert.equal(sumKo(undefined, MODELS, EFFORTS), "");   // 아직 못 읽음 = 빈 글(지어내지 않음)
  assert.equal(sumKo([], MODELS, EFFORTS), "");
});
