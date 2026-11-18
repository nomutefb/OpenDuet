import assert from "node:assert/strict";
import test from "node:test";
import { KW_N, kwFit } from "../home/kw-board-core.ts";

// 형 11-18 14:37(구름 1:1) 「키워드 부분 해결해줘 겹치게 안보여야해, 스크롤 이 잇길 원하진 않아」 — 넓은 칸 줄 수 = 판 높이에 들어가는 만큼
test("넓은 칸 = 판 높이 ÷ 한 줄 글자 키(겹침 0 · 스크롤 0)", () => {
  assert.equal(kwFit(943, 234), KW_N);   // 1920×1080 = 10줄 그대로
  assert.equal(kwFit(703, 148), 8);      // 1440×900 = 8줄(앞 판 10줄 = 줄 14.8 < 글자 17.5 → 겹침)
  assert.equal(kwFit(783, 90), 5);       // 탭 두 칸처럼 짧은 판
  assert.equal(kwFit(600, 160), KW_N);   // 좁힌 PC 461~700 = 16
  assert.equal(kwFit(800, 5), 1);        // 아무리 짧아도 한 줄은
});
test("폰(460 아래) · 못 잰 때 = 손대지 않음(css 7줄)", () => {
  assert.equal(kwFit(361, 266), KW_N);
  assert.equal(kwFit(800, 0), KW_N);
});
