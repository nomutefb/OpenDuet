import assert from "node:assert/strict";
import test from "node:test";
import { isDirect, kSpec, lenFit, segCanAdd, segCanGrow, segFit, segLast, segOk, segPayload, segSpans, segValid, type Seg } from "../ui/k-logic.ts";

// 서랍 「프롬프팅」 판 2(ui/kprompt.tsx) — 원본 viewer/k.html 과 같은 값이 서버(functions/api/k.js)로 가는지
const S = (s: number, txt = ""): Seg => ({ s, txt });

test("길이 = 모델 상한 안으로 · 자동(0)은 그대로 · 프리셋 밖 = 직접", () => {
  assert.equal(kSpec("kling4").max, 30);
  assert.equal(kSpec("kling").max, 15);
  assert.equal(lenFit(0, "kling"), 0);
  assert.equal(lenFit(30, "kling"), 15, "4.0 30초 → 3.0 으로 바꾸면 15초");
  assert.equal(lenFit(1, "kling4"), 3, "서버 하한 3초");
  assert.equal(lenFit(12, "kling4"), 12);
  assert.equal(isDirect(12, "kling4"), true);
  assert.equal(isDirect(15, "kling4"), false);
  assert.equal(isDirect(20, "kling"), true, "3.0 프리셋엔 20 없음");
  assert.equal(isDirect(0, "kling4"), false);
});

test("분막 = 6초부터 · 마지막 구간 = 나머지", () => {
  assert.equal(segOk(5), false);
  assert.equal(segOk(6), true);
  const a = [S(3, "문 열림"), S(0, "달려 나감")];
  assert.equal(segLast(a, 15), 12, "운영자 예 15s = 3 + 12");
  assert.deepEqual(segPayload(a, 15), [{ s: 3, txt: "문 열림" }, { s: 12, txt: "달려 나감" }]);
  assert.deepEqual(segSpans([S(3), S(4), S(0)], 15), [{ from: 0, to: 3 }, { from: 3, to: 7 }, { from: 7, to: 15 }]);
});

test("길이가 줄면 뒤 고정 구간부터 걷고 · 그래도 안 되면 두 구간으로", () => {
  const a = [S(5, "가"), S(5, "나"), S(5, "다"), S(0, "끝")];
  assert.deepEqual(segFit(a, 20).map((g) => g.s), [5, 5, 5, 0], "20초면 그대로(나머지 5)");
  assert.deepEqual(segFit(a, 15).map((g) => g.txt), ["가", "나", "끝"], "15초 = 셋째를 걷음(나머지 5)");
  assert.deepEqual(segFit(a, 8), [S(5, "가"), S(0, "끝")], "8초 = 둘만 남음(나머지 3)");
  assert.deepEqual(segFit([S(8, "가"), S(0, "끝")], 10), [S(3, "가"), S(0, "끝")], "나머지 2 → 두 구간 3 + 7 로 되돌림");
  assert.deepEqual(segFit([], 10), [S(3), S(0)], "빈 초안 = 두 구간");
  assert.deepEqual(segFit([S(1, "가"), S(0, "끝")], 10)[0].s, 3, "구간 최소 3초");
  assert.equal(segFit([S(3), S(3), S(3), S(3), S(3), S(3), S(0)], 30).length, 5, "많아야 5구간");
});

test("구간 더하기 · 늘리기 문턱", () => {
  assert.equal(segCanAdd([S(3), S(0)], 9), true, "나머지 6 → 3 떼도 3 남음");
  assert.equal(segCanAdd([S(3), S(0)], 8), false);
  assert.equal(segCanAdd([S(3), S(3), S(3), S(3), S(0)], 30), false, "5구간 끝");
  assert.equal(segCanGrow([S(3), S(0)], 6), false, "나머지가 3 이면 못 늘림");
  assert.equal(segCanGrow([S(3), S(0)], 7), true);
});

test("서버가 받는 꼴만 보냄 — api/k.js: 2~5구간 · 3 ~ 상한 정수 · 합 ≤ 상한", () => {
  assert.equal(segValid([S(3), S(0)], 15, "kling"), true);
  assert.equal(segValid([S(13), S(0)], 15, "kling"), false, "나머지 2");
  assert.equal(segValid([S(3), S(0)], 20, "kling"), false, "3.0 상한 15 를 넘는 합");
  assert.equal(segValid([S(3), S(0)], 20, "kling4"), true);
  assert.equal(segValid([S(3)], 15, "kling"), false, "한 구간");
  const p = segPayload([S(3, "가".repeat(600)), S(0)], 10);
  assert.equal(p[0].txt.length, 500, "서술 500자");
  assert.equal(p.reduce((a, g) => a + g.s, 0), 10, "합 = 길이");
});
