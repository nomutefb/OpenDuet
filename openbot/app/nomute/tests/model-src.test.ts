// 갈래 안 호출 줄의 셈(./ui/model-set-logic.ts) — 형 11-19 「판정 < 여러값 … 그 안에서 분류되어야할듯」 「거기서 설정한게 실제로 반영도되어야하고」
import assert from "node:assert/strict";
import { test } from "node:test";
import { type LlmUse, PIPE_DEF, groupChoices, mixedOf, pipePatchSrc, srcChoices, srcKo, srcRows, tierOf, wfSources } from "../ui/model-set-logic.ts";

const now = Date.parse("2026-11-19T09:00:00+09:00"), models = [{ id: "claude-opus-5-5", ko: "" }, { id: "claude-sonnet-5-5", ko: "" }];
const use: LlmUse = {
  groups: [{ id: "judge", ko: "판정", sources: ["breaking", "recap", "gate", "group", "autopick"] }, { id: "create", ko: "창작", sources: ["k", "song-*"] }],
  last: {
    gate: { model: "claude-opus-5-5", effort: "high", ts: "2026-11-19T08:16+09:00", wf: "breaking-judge", group: "judge", ko: "경중 채점(gate)" },
    breaking: { model: "claude-sonnet-5-5", effort: "high", ts: "2026-11-19T08:15+09:00", wf: "breaking-judge", group: "judge", ko: "속보 판정(breaking)" },
    group: { model: "claude-opus-5-5", effort: "high", ts: "2026-11-19T08:15+09:00", wf: "breaking-judge", group: "judge", ko: "" },
    pushdedup: { model: "claude-opus-5", effort: "high", ts: "2026-08-16T20:50+09:00", wf: "breaking-judge", group: "judge", ko: "" },
    "song-suno": { model: "claude-opus-5-5", effort: "high", ts: "2026-10-26T01:32+09:00", wf: "song-make", group: "create", ko: "" },
    "garden-combined-1-to-1": { model: "claude-sonnet-5-5", effort: "medium", ts: "2026-11-19T08:20+09:00", wf: "garden-judge", group: "", ko: "정원 판독" },
  },
};

test("호출 줄 = 그 갈래 · 최근 30일 것만 · 갈래 표 차례 · 이름표는 끝 괄호를 뗌 · 따로 고른 값이 없으면 「기본」", () => {
  const rows = srcRows("judge", use, { judge: { effort: "xhigh", src: { breaking: { tier: "opus" }, gate: { effort: "medium", tier: "gpt" } } } }, now);
  assert.deepEqual(rows.map((r) => r.id), ["breaking", "gate", "group"]);   // 석 달 전 pushdedup = 줄 0(옛 모델이 지금 값처럼 안 보이게)
  assert.deepEqual(rows.map((r) => r.ko), ["속보 판정", "경중 채점", "사건 묶기"]);   // 서버 이름표가 없으면 앱의 작은 표 → 그것도 없으면 호출 이름
  assert.deepEqual(rows[0].pick, { model: "opus", effort: PIPE_DEF }); assert.deepEqual(rows[1].pick, { model: PIPE_DEF, effort: "medium" });   // 표 밖 값 = 「기본」
  assert.deepEqual(rows[2].pick, { model: PIPE_DEF, effort: PIPE_DEF });
  assert.deepEqual(srcRows("create", use, undefined, now).map((r) => r.id), ["song-suno"]);   // 별표 이름(song-*)도 그 갈래
  assert.deepEqual(srcRows("judge", undefined, undefined, now), []);
  assert.equal(srcKo("x", ""), "x"); assert.equal(tierOf("claude-sonnet-5-5"), "sonnet"); assert.equal(tierOf("gpt-6"), "");
});

test("갈래 줄 「기본」 글 = 호출들이 실제 쓰는 값(섞였으면 「여러 값」) · 호출 줄 「기본」 글 = 갈래에서 골랐으면 그 값 · 아니면 제 마지막 값", () => {
  const rows = srcRows("judge", use, undefined, now);
  assert.equal(mixedOf(rows, "model"), true); assert.equal(mixedOf(rows, "effort"), false);
  const g = groupChoices("judge", rows, models);
  assert.equal(g.tiers[0].ko, "여러 값"); assert.equal(g.efforts[0].ko, "high"); assert.deepEqual(g.tiers.map((t) => t.id), [PIPE_DEF, "opus", "sonnet"]);
  assert.equal(groupChoices("create", srcRows("create", use, undefined, now), models).tiers[0].ko, "Opus 5.5");
  const s0 = srcChoices(rows[0], { model: PIPE_DEF, effort: PIPE_DEF }, models), s1 = srcChoices(rows[0], { model: "opus", effort: "xhigh" }, models);
  assert.equal(s0.tiers[0].ko, "Sonnet 5.5"); assert.equal(s0.efforts[0].ko, "high");   // 안 고름 = 실제 마지막 값
  assert.equal(s1.tiers[0].ko, "Opus 5.5"); assert.equal(s1.efforts[0].ko, "xhigh");   // 갈래에서 고름 = 그 값을 따라감
});

test("호출 하나만 바꾸기 = 그 갈래 src 칸만 · 「기본」 = 빈 글(그 칸만 지움) · 워크플로의 호출들 = 그 일 판 머리 줄", () => {
  assert.deepEqual(pipePatchSrc("judge", "breaking", { model: "opus" }), { judge: { src: { breaking: { tier: "opus" } } } });
  assert.deepEqual(pipePatchSrc("judge", "gate", { effort: PIPE_DEF }), { judge: { src: { gate: { effort: "" } } } });
  assert.deepEqual(wfSources("breaking-judge", use, undefined, now).map((r) => `${r.group}:${r.id}`), ["judge:breaking", "judge:gate", "judge:group"]);
  assert.deepEqual(wfSources("garden-judge", use, undefined, now), []);   // 갈래 밖 호출(서버 일 = modelset) = 여기 줄 아님
  assert.deepEqual(wfSources("", use, undefined, now), []);
});
