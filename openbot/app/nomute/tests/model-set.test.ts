// 설정 「모델 · 노력도」 논리(ui/model-set-logic.ts) — 형 11-15 「설정에서 일괄 모델 하고 노력도 변경 반영이 가능하게」
import { test } from "node:test";
import assert from "node:assert/strict";
import { PIPE_BASE, PIPE_DEF, PIPE_GROUPS, effortChoices, koOf, modelChoices, modelName, pickKo, pipeAllChoices, pipeChoices, pipePatch, pipeRows, sameOf, sumKo, tierName } from "../ui/model-set-logic.ts";

const MODELS = modelChoices([{ id: "claude-opus-5-5", ko: "오퍼스 5.5" }, { id: "claude-sonnet-5-5", ko: "소넷 5.5" }]);
const EFFORTS = effortChoices();

test("글자 = 모델은 정식 이름(ID 에서 만듦) · 노력도는 CLI 낱말 그대로 · 모르는 꼴은 받은 그대로", () => {
  assert.equal(modelName("claude-opus-5-5"), "Opus 5.5");
  assert.equal(modelName("claude-sonnet-5-5"), "Sonnet 5.5");
  assert.equal(modelName("claude-haiku-5-5"), "Haiku 5.5");
  assert.equal(modelName("claude-fable-5-2"), "Fable 5.2");
  assert.equal(modelName("claude-opus-6"), "Opus 6");
  assert.equal(modelName("gpt-6-astra"), "gpt-6-astra");   // 꼴이 다르면 그대로(지어내지 않음)
  assert.equal(modelName(""), "");
  assert.deepEqual(MODELS.map((m) => m.ko), ["Opus 5.5", "Sonnet 5.5"]);   // 서버가 준 우리말 이름은 안 씀
  assert.deepEqual(EFFORTS.map((e) => [e.id, e.ko]), [["low", "low"], ["medium", "medium"], ["high", "high"], ["xhigh", "xhigh"], ["max", "max"]]);
  assert.equal(koOf(MODELS, "claude-next-9"), "claude-next-9");   // 표에 없는 값 = 빈 칸이 아님
  assert.equal(pickKo(MODELS, EFFORTS, { model: "claude-sonnet-5-5", effort: "xhigh" }), "Sonnet 5.5 · xhigh");
});

test("「모두」 줄 = 다 같으면 그 값 · 하나라도 다르면 빈 글(= 섞임) · 묶음 줄 한마디도 같은 눈", () => {
  const a = { model: "claude-opus-5-5", effort: "high" }, b = { model: "claude-opus-5-5", effort: "medium" };
  assert.equal(sameOf([a, a], "model"), "claude-opus-5-5");
  assert.equal(sameOf([a, b], "model"), "claude-opus-5-5");
  assert.equal(sameOf([a, b], "effort"), "");
  assert.equal(sameOf([], "model"), "");
  assert.equal(sumKo([a, a], MODELS, EFFORTS), "Opus 5.5 · high");
  assert.equal(sumKo([a, b], MODELS, EFFORTS), "Opus 5.5 · 섞임");
  assert.equal(sumKo(undefined, MODELS, EFFORTS), "");   // 아직 못 읽음 = 빈 글(지어내지 않음)
  assert.equal(sumKo([], MODELS, EFFORTS), "");
});

test("파이프라인 중분류 = 갈래 일곱 · 안 고른 칸 · 표 밖 값은 「기본」 · 「기본」을 고르면 빈 글로 보냄(그 칸 지움) · 모두 = 일곱 갈래 한 번에", () => {
  assert.deepEqual(PIPE_GROUPS.map((g) => g.id), ["summary", "card", "judge", "create", "video", "brief", "read"]);   // 서버 shared/llm_groups.json 과 같은 이름 · 차례
  assert.deepEqual(Object.keys(PIPE_BASE), PIPE_GROUPS.map((g) => g.id));   // 갈래마다 「원래 값」이 있음
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

test("파이프라인 칸 = 안 고른 칸에도 지금 실제로 쓰이는 값이 보임(스크립트 값) · 갈래 안에서 호출마다 다르면 그렇게 적음 · 모델 이름은 서버 표에서 그 계열을 찾아 정식으로", () => {
  assert.equal(tierName("opus", MODELS), "Opus 5.5");
  assert.equal(tierName("sonnet", MODELS), "Sonnet 5.5");
  assert.equal(tierName("opus", []), "Opus");   // 서버 표를 못 읽음 = 계열 이름만(판 번호를 지어내지 않음)
  const c = pipeChoices("summary", MODELS);
  assert.deepEqual(c.tiers.map((t) => [t.id, t.ko]), [[PIPE_DEF, "Opus 5.5"], ["opus", "Opus 5.5"], ["sonnet", "Sonnet 5.5"]]);   // 첫 칸(안 고름) = 지금 쓰이는 값
  assert.deepEqual(c.efforts.map((e) => e.ko), ["high", "low", "medium", "high", "xhigh", "max"]);
  assert.equal(pipeChoices("judge", MODELS).tiers[0].ko, "여러 값");   // 판정 = 속보는 Sonnet · 등급은 Opus 처럼 섞여 있음
  assert.equal(pipeChoices("read", MODELS).tiers[0].ko, "Sonnet 5.5");
  assert.deepEqual(pipeAllChoices(MODELS).tiers.map((t) => t.ko), ["기본", "Opus 5.5", "Sonnet 5.5"]);
});
