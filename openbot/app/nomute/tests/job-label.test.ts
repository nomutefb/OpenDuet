// 직무 라벨 = 대화방 목록 이름 바로 뒤 그림(형 확정 11-20 13:25 · 루미 시안 · 13:28~13:29 「응 uxd들은 다 uxd고, 픽서들은 다 픽서야. (소나-이슬-루미 라인)」 「uxd 라인 > (구름-하늘)」 · 「dev랑 ops는 너가 배치해」)
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("라벨 = 이름 뒤 · 세로 가운데 · FIXER · MD · Dev · Ops 20px · UXD 12px · 웹용 webp · 없는 애 = 옛 글 알약", () => {
  const lab = rd("../ui/job-label.tsx"), list = rd("../ui/room-list.tsx");
  assert.ok(lab.includes(`const JOB_OF: Record<string, Job> = { 구름: "UXD", 하늘: "UXD", 소나: "FIXER", 이슬: "FIXER", 루미: "FIXER", 천둥: "DEV", 빠르: "OPS", 번개: "OPS" };`));
  // 그림 높이 = 화면의 2배(40 · 24) → 그려지는 높이 20 · 12
  for (const [k, h] of [["FIXER", 40], ["MD", 40], ["UXD", 24], ["DEV", 40], ["OPS", 40]] as const) assert.match(lab, new RegExp(`${k}: \\{ src: "/garden-app/job-${k.toLowerCase()}\\.webp(\\?v=\\d+)?", w: \\d+, h: ${h} \\}`), k);
  // DeV · OpS = 하늘 그림(형 13:43~13:44 「저기에 보면 ba랑 y가 강하잖아. 그걸 활요해서 만들라고해.」) · 그림 바꾸면 ?v 올림(캐시)
  assert.match(lab, /DEV: \{ src: "\/garden-app\/job-dev\.webp\?v=2", w: 106, h: 40 \}/);
  assert.match(lab, /OPS: \{ src: "\/garden-app\/job-ops\.webp\?v=2", w: 111, h: 40 \}/);
  assert.match(lab, /width=\{g\.w \/ 2\} height=\{g\.h \/ 2\}/);
  for (const k of ["fixer", "md", "uxd", "dev", "ops"]) assert.ok(statSync(new URL(`../public/job-${k}.webp`, import.meta.url)).size < 8_000, k);
  // 자리 = 이름 바로 뒤(같은 줄 · items-center = 세로 가운데) · 라벨 있으면 글 알약 대신
  assert.match(list, /\{slim \? null : jobOf\(p\) \? <JobLabel job=\{jobOf\(p\)!\} \/>/);
  assert.match(list, /: p\?\.role \? <span data-content/);
});
