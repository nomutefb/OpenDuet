// 요약 대기열 판 상태(ui/task-state.ts) — 봄 11-09 06:20 2) · 모루 #3000 「요약 성공 뒤 피드에 없는 기사를 「완료」로 보임」
import test from "node:test";
import assert from "node:assert/strict";
import { Q_LAG_MIN, panelOf, qEff, taskOf } from "../ui/task-state.ts";

const NOW = Date.parse("2026-11-09T06:30:00+09:00");

test("요약 끝(succ) · 피드 없음 · 20분 넘음 = lag(분석 완료 · 반영 대기) · 「완료」 아님", () => {
  const e = qEff("succ", false, NOW - (Q_LAG_MIN * 60e3 + 1000), NOW);
  assert.equal(e, "lag");
  const t = taskOf("succ", e);
  assert.equal(t.label, "분석 완료 · 반영 대기");
  assert.equal(t.ring, "lag");
  const p = panelOf([{ status: "succ", e }]);
  assert.equal(p.tail, "분석 완료 · 반영 대기");
  assert.notEqual(p.tail, "완료");
});

test("요약 끝 · 피드 없음 · 20분 안 = 피드 반영 중", () => {
  const e = qEff("succ", false, NOW - 5 * 60e3, NOW);
  assert.equal(e, "processing");
  assert.equal(taskOf("succ", e).label, "피드 반영 중");
  assert.equal(panelOf([{ status: "succ", e }]).tail, "피드 반영 중");
});

test("요약 끝 · 피드에 있음 = succ(판에서 빠질 것) · 도는 중·실패는 그대로", () => {
  assert.equal(qEff("succ", true, NOW - 99 * 60e3, NOW), "succ");
  assert.equal(qEff("processing", false, NOW, NOW), "processing");
  assert.equal(taskOf("fail", "fail").label, "요약 실패");
  assert.equal(panelOf([{ status: "processing", e: "processing" }, { status: "succ", e: "lag" }]).tail, "1/2 건");
});
