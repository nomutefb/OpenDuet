// 머리 판 묶음 칸(ui/model-set-logic.ts jobGroups) — 형 11-21 17:25 dm-eyes 뜸 옮김 「그리고 여기 뜸 보조 라고 해서 밥풀하고 주걱, 각각 역할 간단히 서술되고 모델 들어가고 실제로 반영도 되어야해 그리고 콘티 만드는것도 그니까 총 3개인거지.」
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { jobGroups, modelChoices, sheetKo } from "../ui/model-set-logic.ts";

const p = (model: string, effort: string) => ({ model, effort });
const job = (id: string, ko: string, group?: string, where?: string) => ({ id, ko, where, group, def: p("claude-sonnet-5-5", "low"), now: p("claude-sonnet-5-5", "low") });

test("group 없는 일 = plain 그대로 · 있는 일 = 묶음 머리 밑(서버 groups 차례 · 이름)", () => {
  const s = { jobs: [job("sort", "일감 가르기"), job("bap", "밥풀", "ddeum", "그림 고르기"), job("k", "클링 즉답"), job("jug", "주걱", "ddeum"), job("conti", "콘티", "ddeum")], groups: [{ id: "ddeum", ko: "뜸 보조" }] };
  const g = jobGroups(s);
  assert.deepEqual(g.plain.map((j) => j.id), ["sort", "k"]);
  assert.deepEqual(g.groups.map((x) => [x.id, x.ko, x.jobs.map((j) => j.id)]), [["ddeum", "뜸 보조", ["bap", "jug", "conti"]]]);
  assert.equal(g.groups[0].jobs[0].where, "그림 고르기", "한 줄 역할 = 서버 where 그대로");
});

test("groups 표에 없는 묶음 = 처음 나온 차례 · 이름 = id · 서버가 아직 묶음을 안 주면 = 묶음 0(앞 판 그대로)", () => {
  const g = jobGroups({ jobs: [job("a", "가", "x"), job("b", "나", "y"), job("c", "다", "x")], groups: [{ id: "y", ko: "와이" }] });
  assert.deepEqual(g.groups.map((x) => [x.id, x.ko, x.jobs.length]), [["y", "와이", 1], ["x", "x", 2]]);
  assert.deepEqual(jobGroups({ jobs: [job("sort", "일감 가르기"), job("k", "클링 즉답")] }).groups, []);
  assert.deepEqual(jobGroups(undefined), { plain: [], groups: [] });
});

test("sheetKo 가 묶음 칸 · groups 를 지우지 않음 · 페이블 5.2 = 「Fable 5.2」 미토스 · 오퍼스 다음", () => {
  const s = sheetKo({ jobs: [job("bap", "밥풀", "ddeum")], models: [], efforts: [], groups: [{ id: "ddeum", ko: "뜸 보조" }] });
  assert.equal(s.jobs[0].group, "ddeum");
  assert.deepEqual(s.groups, [{ id: "ddeum", ko: "뜸 보조" }]);
  assert.deepEqual(modelChoices([{ id: "claude-sonnet-5-5", ko: "" }, { id: "claude-fable-5-2", ko: "" }, { id: "claude-opus-5-5", ko: "" }, { id: "claude-mythos-5-2", ko: "" }]).map((c) => c.ko), ["Mythos 5.2", "Opus 5.5", "Fable 5.2", "Sonnet 5.5"]);
});

test("머리 판 = 묶음마다 제 머리 · 줄 = 이름 + 서버 where + 같은 저장 길(POST modelset {job})", () => {
  const src = readFileSync(new URL("../ui/model-set.tsx", import.meta.url), "utf8");
  assert.match(src, /const jg = jobGroups\(s\), plain = jg\.plain;/);
  assert.match(src, /\{jg\.groups\.map\(\(g\) => \(/);
  assert.match(src, /<h3>\{g\.ko\} <small>다음 호출부터<\/small><\/h3>/);
  assert.match(src, /g\.jobs\.map\(\(j\) => jobRow\(j, j\.ko, j\.where\)\)/);
  assert.match(src, /onPick=\{\(p\) => jobSave\.mutate\(\{ job: j\.id, \.\.\.p \}\)\}/);
});
