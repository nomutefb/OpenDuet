// 카드 덧줄 부제 · 출처 = 굽는 쪽 card_news split_extras · render_extras(천둥 editor #4602 · R0083)와 같은 가름 · 같은 자리 — 미리보기 둘(썸네일 만들기 카드뉴스 · 카드 편집 덮개) · 칩 편집기 둘(줄 한도 · 폭 면제)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CARD, PRET, baseOf, cssBaseIn, extraAt, headBase, lineCap, pilAsc, splitExtras } from "../ui/card-extras.ts";

test("가름 = 굽는 쪽 tests/test_content_style.py Extras 그대로", () => {
  const plain = ["167년 동안 아무도 못 풀었고,", "*상금 100만 달러*가 걸렸다."];
  assert.deepEqual(splitExtras(plain), { head: null, body: plain, credit: null });   // 옛 카드 = 손 0
  assert.deepEqual(splitExtras(["2. 리만 가설이 의미하는 것", "167년 동안", "*상금*이 걸렸다.", "자료 · 사이언티픽 아메리칸"]), { head: "2. 리만 가설이 의미하는 것", body: ["167년 동안", "*상금*이 걸렸다."], credit: "자료 · 사이언티픽 아메리칸" });
  for (const first of ["1) 무엇인가", "1-2 다음 물음", "• 요점", "10. 열째"]) assert.equal(splitExtras([first, "자막"]).head, first);
  for (const first of ["2000년엔 밀레니엄", "1.5배 늘었다", "3·1절에"]) assert.equal(splitExtras([first, "자막"]).head, null);
  assert.deepEqual(splitExtras(["1. 하나뿐"]), { head: null, body: ["1. 하나뿐"], credit: null });   // 한 줄 = 안 가름
  assert.equal(splitExtras(["*1.* 강조 머리", "자막"]).head, "1. 강조 머리");   // 강조 표 걷고 봄 · 걷은 글로 그림
  assert.equal(splitExtras(["자막", "영상 · @x (X)"]).credit, "영상 · @x (X)");
  assert.equal(splitExtras(["자막", "출처: 연합"]).credit, "출처: 연합");
});

test("칩 편집기 = 덧줄 줄은 폭 셈 밖 · 줄 한도 = 자막 4 + 덧줄", () => {
  const six = ["1. 머리", "가", "나", "다", "라", "영상 · @x (X)"];
  assert.deepEqual(six.map((_, i) => extraAt(six, i)), [true, false, false, false, false, true]);
  assert.equal(lineCap(six), 6);
  assert.equal(lineCap(["가", "나"]), 4);
  assert.equal(lineCap(["1. 머리", "가"]), 5);
});

test("자리 = 굽는 쪽 PIL 과 같은 바탕선(자막 888 + 52 + 88i · 부제 = 한 줄 위 · 출처 1320) · 프리텐다드 위 0.952 아래 0.241", () => {
  assert.deepEqual([pilAsc(54), pilAsc(32), pilAsc(18)], [52, 31, 18]);   // PIL getmetrics()[0](Pretendard-Bold.otf 실측 11-21)
  assert.equal(baseOf(0), 940); assert.equal(baseOf(3), 1204); assert.equal(headBase(), 852);
  assert.equal(Math.round(CARD.FS * CARD.HEAD_SCALE), 32);
  assert.equal(+cssBaseIn(1000, 3000).toFixed(1), 1855.5);   // 앱 Pretendard Variable 줄 상자 실측(L 3000 · 1000px → 1855.5)과 같은 셈
  assert.deepEqual(PRET, { A: 0.952, D: 0.241 });
});

test("미리보기 둘 · 칩 편집기 둘이 덧줄 가름을 씀", () => {
  const prev = readFileSync(new URL("../ui/thumb-maker/engine/p02-preview.ts", import.meta.url), "utf8");
  const cards = readFileSync(new URL("../ui/thumb-maker/engine/p10-cards.ts", import.meta.url), "utf8");
  const art = readFileSync(new URL("../ui/old-tabs/engine-art.ts", import.meta.url), "utf8");
  assert.match(prev, /const \{ head, body: cl, credit \} = splitExtras\(cur\.cl \|\| \[\]\);/);
  assert.match(prev, /top:\$\{py\(baseOf\(0\) - cssBaseIn\(CARD\.FS, CARD\.LH\)\)\}/);   // 자막 바탕선 = 결과(앞 판 888 = 11 아래)
  assert.match(prev, /top:\$\{py\(headBase\(\) - cssBaseIn\(hfs, hfs\)\)\}/);
  assert.match(prev, /right:\$\{px\(CARD\.CREDIT_RIGHT\)\};top:\$\{py\(CARD\.CREDIT_BASE - cssBaseIn\(CARD\.CREDIT_FS, CARD\.CREDIT_FS\)\)\}/);
  assert.match(prev, /const qc = quoteIndents\(cl,/);
  for (const src of [cards, art]) {
    assert.match(src, /return capLines\(lines\);/);
    assert.match(src, /full = (S\.)?edLines\.length >= edCap\(\);/);
    assert.match(src, /if \((S\.)?edLines\.length >= edCap\(\)\) return;/);
    assert.match(src, /if \(edExtra\(li\)\) \{ line\.forEach\(wd => \{ wd\._over = false; wd\._overFrom = -1; wd\._warn = false; \}\); continue; \}/);
    assert.match(src, /if \(!line \|\| edExtra\(li\)\) return;/);
  }
  assert.match(art, /HL: '#6EFF66'/);
  assert.doesNotMatch(art, /"Noto Sans KR"|Noto\+Sans\+KR/);   // 글꼴 줄 · 구글 글꼴 받기 0(주석의 「앞 판」 말은 둠)
  assert.match(art, /ovlGradient\(ctx\);\n\s+ovlText\(ctx, cap(tion)?\);/);
  assert.equal((art.match(/^\s+ovlText\(ctx, cap/gm) || []).length, 2);   // 부르는 곳 = 오버레이 PNG · 첨부 미리보기 둘 다
});
