// 썸네일 미리보기 = 굽는 쪽(천둥 editor #4598)과 같은 꼴(형 11-21 08:06~08:13 dm-eyes 뜸 옮김 · R0083 · 앱 몫 R0089)
//   「그 에터에 썸네일도 이거로 통일할게」 「프리텐다드로 하고」 「한도는 940으로 항상 박자」 「자간은 저게 -45면 -35까지만 하자」 · 강조 「✓ ② B #6EFF66」
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("post 한도 940 · 자간 바닥 -35 · 강조 #6EFF66 · 미리보기 글꼴 프리텐다드(reels 그대로)", () => {
  const cards = rd("../ui/thumb-maker/engine/p10-cards.ts"), prev = rd("../ui/thumb-maker/engine/p02-preview.ts"), css = rd("../ui/thumb-maker/thumb-maker.css");
  assert.match(cards, /post: +\{ H: 70, S: 17, N: 48, fs: 76, limit: 940, start: 0, +floor: -35, basis: 'adv' \}/);
  assert.match(cards, /reels: \{ H: 72, S: 18, N: 48, fs: 78, limit: 844, start: -1, floor: -30, basis: 'adv' \}/);
  assert.match(prev, /export const CPV_GREEN = '#6EFF66';/);
  assert.match(prev, /export const CP_PREV_FONT = 'Pretendard Variable';/);
  assert.match(css, /@font-face\{font-family:'Pretendard Variable';font-weight:45 920;[^}]*url\(\/assets\/fonts\/pretendard\.woff2\)/);
  assert.match(css, /\.nm-tm \.cpprev-stage,[^{]*\{ font-family:'Pretendard Variable','Noto Sans KR'/);
});
