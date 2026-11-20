// 미리보기 따옴표 들여쓰기 = 굽는 쪽 quote_indent.py 새 판(형 11-21 R0083 · 시아 R0089 ② 「형이 보는 미리보기 = 결과」) · 굵기 700 · 릴스 헤더 하한 -35(천둥 08:40)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { quoteIndents, stripEmph } from "../ui/thumb-maker/engine/quote-indent.ts";

const adv = () => 10;   // 글자마다 10px(셈만 봄)
test("줄 시작 · 한두 어절 뒤 연 따옴표 = 이어지는 줄을 안쪽 첫 글자 아래로 · 셋째 어절부터 = 안 들여씀 · 닫히면 끝", () => {
  assert.deepEqual(quoteIndents(["“6·25전쟁 당연히", "북침…긴장했다”", "끝"], adv), [0, 10, 0]);   // 줄 시작 = 따옴표 폭만
  assert.deepEqual(quoteIndents(["한 총리 “6·25 당연히", "북침”"], adv), [0, 60]);   // 두 어절 뒤 = 앞 글 5자(공백 포함) + 따옴표
  assert.deepEqual(quoteIndents(["가 나 다 “라마", "바사”"], adv), [0, 0]);   // 셋째 어절 뒤 = 안 들여씀
  assert.deepEqual(quoteIndents(["*한* \"둘", "셋\""], adv), [0, 30]);   // 강조 표 걷고 셈 · ASCII 따옴표 토글
  assert.equal(stripEmph("*가*나"), "가나");
});

test("미리보기 = 줄 앞 빈 칸으로 들여씀 · 오버레이 · 헤더 제목 굵기 700(프리텐다드 Bold) · 릴스 헤더 하한 -35", () => {
  const prev = readFileSync(new URL("../ui/thumb-maker/engine/p02-preview.ts", import.meta.url), "utf8"), fit = readFileSync(new URL("../ui/thumb-maker/engine/p11-fit.ts", import.meta.url), "utf8");
  assert.match(prev, /const qi = quoteIndents\(fitLines, ch => _ovCharW\(ch, TRK\[ovKey\]\) \+ trO \/ 1000 \* TRK\[ovKey\]\.fs\);/);
  assert.match(prev, /const ind = qi\[li\] > 0 \? `<span style="display:inline-block;width:\$\{px\(qi\[li\]\)\}"><\/span>` : '';/);
  assert.doesNotMatch(prev, /font-weight:800/);
  assert.match(fit, /sub: +\{ H: 60\.72, S: 14\.98, N: 38\.94, fs: 66, avail: 960, floor: -35, basis: 'adv' \}/);
  assert.match(fit, /title: \{ H: 82\.80, S: 20\.44, N: 53\.09, fs: 90, avail: 960, floor: -35, basis: 'adv' \}/);
});
