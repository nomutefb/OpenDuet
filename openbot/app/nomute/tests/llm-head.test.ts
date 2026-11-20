// 러너 일 「머리」(서브 LLM = 모델 · 노력도)를 스케줄러에 녹임(형 11-17 02:0x 구름 맥 창 · 봄 02:04 협의) — 셈 = ../ui/llm-head-logic.ts · 화면 = ../ui/llm-head.tsx
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { headKeyOf, headMates, headNote, headOf } from "../ui/llm-head-logic";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const MODELS = [{ id: "claude-haiku-5-5", ko: "하이쿠 5.5" }, { id: "claude-sonnet-5-5", ko: "소넷 5.5" }, { id: "claude-opus-5-5", ko: "오퍼스 5.5" }];
const pick = (model: string, effort: string) => ({ model, effort });
// 라이브 modelset 답(11-17 02:1x) 꼴
const SHEET = { models: MODELS, jobs: [
  { id: "audit", ko: "안 닫힌 오더 판독", def: pick("claude-sonnet-5-5", "low"), now: pick("claude-sonnet-5-5", "medium") },
  { id: "sort", ko: "일감 가르기", def: pick("claude-sonnet-5-5", "low"), now: pick("claude-sonnet-5-5", "medium") },
  { id: "k", ko: "클링 즉답", def: pick("claude-opus-5-5", "high"), now: pick("claude-opus-5-5", "high") },
] };

test("머리 갈래 = 서버 llm_group 칸 먼저 · 없으면 아는 표(일감 가르기) · 모르면 줄 없음", () => {
  assert.deepEqual(headKeyOf({ id: "wf.garden-judge", name: "정원 일감 가르기·점검" }), { kind: "ms", ids: ["sort", "audit"] });
  // 서버 러너 지도 칸(빠르 #4092 · 라이브 11-17 02:2x 꼴 그대로)
  assert.deepEqual(headKeyOf({ id: "wf.garden-judge", name: "정원 일감 가르기·점검", llm_group: ["modelset"], llm: ["modelset:audit·sort"] }), { kind: "ms", ids: ["audit", "sort"] });
  assert.deepEqual(headKeyOf({ id: "wf.breaking-judge", name: "속보", llm_group: ["judge"], llm: ["BREAKING_MODEL", "GATE_MODEL"] }), { kind: "pipe", id: "judge" });
  assert.deepEqual(headKeyOf({ id: "wf.imggen", name: "생성형 이미지", llm_group: ["create"], llm: ["FABLE_MODEL"] }), { kind: "pipe", id: "create" });
  assert.equal(headKeyOf({ id: "wf.x", name: "x", llm_group: ["modelset"] }), null);
  assert.deepEqual(headKeyOf({ id: "wf.news-analyze", name: "뉴스 요약(PICK)", llm_group: "summary" }), { kind: "pipe", id: "summary" });
  assert.deepEqual(headKeyOf({ id: "wf.x", name: "x", llm_group: ["ms:k"] }), { kind: "ms", ids: ["k"] });
  assert.equal(headKeyOf({ id: "wf.news-analyze", name: "뉴스 요약(PICK)" }), null);   // 갈래 칸이 오기 전 = 안 그림
  assert.equal(headKeyOf({ id: "wf.x", name: "x", llm_group: "없는갈래" }), null);
});

test("같이 바뀌는 일 = 같은 갈래를 읽는 러너 일(이 일 포함) → 재확인 토글 덧글", () => {
  const jobs = [{ id: "a", name: "뉴스 요약(PICK)", llm_group: "summary" }, { id: "b", name: "뉴스 요약(수동)", llm_group: "summary" }, { id: "c", name: "카드 뉴스(초안)", llm_group: "card" }, { id: "d", name: "배포" }];
  assert.deepEqual(headMates(jobs, jobs[0]), ["뉴스 요약(PICK)", "뉴스 요약(수동)"]); assert.deepEqual(headMates(jobs, jobs[2]), ["카드 뉴스(초안)"]); assert.deepEqual(headMates(jobs, jobs[3]), []);
  const h = headOf({ kind: "pipe", id: "summary" }, SHEET, undefined, true)!;
  assert.equal(headNote(["a", "b"], h, { kind: "pipe", id: "summary" }), "같이 바뀌는 일 2"); assert.equal(headNote(["a"], h, { kind: "pipe", id: "summary" }), "");
  const m = headOf({ kind: "ms", ids: ["sort", "audit"] }, SHEET, undefined, false)!;
  assert.equal(headNote(["정원 일감 가르기·점검"], m, { kind: "ms", ids: ["sort", "audit"] }), "안 닫힌 오더 판독 · 일감 가르기 같이");   // 서버 일 둘이 묶임 = 그 이름
});

test("지금 값 = 설정 화면과 같은 표 · 같은 말", () => {
  const m = headOf({ kind: "ms", ids: ["sort", "audit"] }, SHEET, undefined, false)!;
  assert.equal(m.title, "안 닫힌 오더 판독 · 일감 가르기"); assert.equal(m.model, "claude-sonnet-5-5"); assert.equal(m.effort, "medium");
  assert.deepEqual(m.models.map((c) => c.ko), ["Haiku 5.5", "Sonnet 5.5", "Opus 5.5"]); assert.deepEqual(m.efforts.map((c) => c.ko), ["low", "medium", "high", "xhigh", "max"]);
  assert.equal(m.dimModel, true); assert.equal(m.dimEffort, false);   // 모델 = 기본 그대로 · 노력도 = 고친 값
  assert.equal(headOf({ kind: "ms", ids: ["없음"] }, SHEET, undefined, false), null); assert.equal(headOf({ kind: "ms", ids: ["sort"] }, undefined, undefined, false), null);
  const p = headOf({ kind: "pipe", id: "summary" }, SHEET, { summary: { tier: "sonnet", effort: "" } }, true)!;
  assert.equal(p.title, "파이프라인 · 뉴스 요약");   // 형 11-21 05:46 「요약 분석 용어 뉴스 요약」 assert.equal(p.model, "sonnet"); assert.equal(p.effort, "default"); assert.equal(p.dimEffort, true);
  assert.deepEqual(p.models.map((c) => c.ko), ["Opus 5.5", "Opus 5.5", "Sonnet 5.5"]);   // 첫 칸 = 안 고름(스크립트가 원래 쓰는 값)
  assert.equal(headOf({ kind: "pipe", id: "summary" }, SHEET, undefined, false), null);   // 설정을 아직 못 읽음 = 값 지어내지 않음
});

test("값 주인 하나 = 설정과 같은 열쇠 · 같은 길 · 바꾸기는 그 자리 재확인 토글", () => {
  const h = rd("../ui/llm-head.tsx"), s = rd("../ui/model-set.tsx"), r = rd("../ui/runner-sheet.tsx"), t = rd("../ui/sched-tree.tsx");
  assert.match(h, /import \{ useJobSave, useModelSet, usePipeLlm, usePipeSave \} from "\.\/model-set";/);
  assert.match(s, /const jobSave = useJobSave\(\), pipe = usePipeLlm\(\), pipeSave = usePipeSave\(\);/);   // 설정 화면도 같은 훅
  assert.equal((s.match(/office<Sheet>\("modelset", \{ method: "POST"/g) || []).length, 1); assert.equal((s.match(/fetch\("\/api\/settings", \{ method: "POST"/g) || []).length, 1);   // 쓰는 길은 한 군데씩
  assert.match(h, /<MorphAsk className="w" disabled=\{busy\} yesText="바꾸기" note=\{note \|\| undefined\}/);
  assert.match(r, /<LlmHead job=\{job\} jobs=\{jobs \|\| \[job\]\} \/>/); assert.match(t, /<RunnerSheet job=\{sel\.job\} jobs=\{map\.jobs\}/);
});
