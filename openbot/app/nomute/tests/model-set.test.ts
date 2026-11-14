// 설정 「모델 · 노력도」 논리(ui/model-set-logic.ts) — 형 11-15 「설정에서 일괄 모델 하고 노력도 변경 반영이 가능하게」
import { test } from "node:test";
import assert from "node:assert/strict";
import { EFFORT_KO, PIPE_EFFORTS, PIPE_GROUPS, PIPE_TIERS, koOf, pickKo, pipePatch, pipeRows, sameOf, sumKo } from "../ui/model-set-logic.ts";

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

test("파이프라인 중분류 = 갈래 일곱 · 안 고른 칸 · 표 밖 값은 「기본」 · 「기본」을 고르면 빈 글로 보냄(그 칸 지움) · 모두 = 일곱 갈래 한 번에", () => {
  assert.deepEqual(PIPE_GROUPS.map((g) => g.id), ["summary", "card", "judge", "create", "video", "brief", "read"]);   // 서버 shared/llm_groups.json 과 같은 이름 · 차례
  assert.deepEqual(PIPE_TIERS.map((t) => t.id), ["default", "opus", "sonnet"]);
  assert.deepEqual(PIPE_EFFORTS.map((e) => e.id), ["default", "low", "medium", "high", "xhigh", "max"]);
  const rows = pipeRows({ summary: { tier: "sonnet", effort: "medium" }, judge: { effort: "xhigh" }, card: { tier: "gpt", effort: "ultra" } });
  assert.deepEqual(rows[0], { model: "sonnet", effort: "medium" });
  assert.deepEqual(rows[1], { model: "default", effort: "default" });   // 표 밖 값 = 기본
  assert.deepEqual(rows[2], { model: "default", effort: "xhigh" });
  assert.deepEqual(pipeRows(undefined).every((r) => r.model === "default" && r.effort === "default"), true);
  assert.deepEqual(pipePatch(["summary"], { model: "opus" }), { summary: { tier: "opus" } });
  assert.deepEqual(pipePatch(["summary"], { effort: "default" }), { summary: { effort: "" } });   // 기본 = 지움
  const all = pipePatch(PIPE_GROUPS.map((g) => g.id), { model: "sonnet" });
  assert.deepEqual(Object.keys(all).length, 7);
  assert.deepEqual(all.read, { tier: "sonnet" });
  assert.equal(sameOf(rows, "model"), "");   // 섞임
});
