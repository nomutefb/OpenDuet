// 점수 펴서 보이기(형 11-12 11:43 「웅 그렇게해줘!」 「원래 점수는 없어도돼」 · home/event-score.ts shownScore · scale = 서버 ?f=event 머리 칸)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SCORE_LOG, shownScore } from "../home/event-score.ts";

test("화면 점수 = 15 × log2(원점 ÷ 1.8) · 원점 = −60 × ln(1 − s/100) · 0 ~ 100(봄 11-12 18:10 · 빠르 식)", () => {
  assert.deepEqual(SCORE_LOG, { step: 15, floor: 1.8, raw: 60 });
  assert.equal(shownScore(62.1), 75); assert.equal(shownScore(28.8), 53); assert.equal(shownScore(18), 41);
  assert.equal(shownScore(100), 100); assert.equal(shownScore(99.9), 100, "위는 100 에서 멈춤"); assert.equal(shownScore(0), 0); assert.equal(shownScore(1), 0, "아래는 0");
  const a = -60 * Math.log(1 - 40 / 100), b = -60 * Math.log(1 - 64 / 100);
  assert.ok(Math.abs(15 * Math.log2(b / a) - (shownScore(64) - shownScore(40))) <= 1, "15점 차이 = 원점 2배");
});

test("홈 카드 · HOT ISSUE 둘 다 보이는 숫자만 폄 · 차례는 h.s", () => {
  const nf = readFileSync(new URL("../home/news-feed.tsx", import.meta.url), "utf8"), nl = readFileSync(new URL("../home/news-list.tsx", import.meta.url), "utf8");
  assert.match(nf, /r\.score = shownScore\(h\.s\)/); assert.ok(!/scaleOf/.test(nf), "scale 펴기 걷음");
  assert.match(nl, /score: shownScore\(h\.s\)/); assert.ok(!/scaleOf/.test(nl), "scale 펴기 걷음");
});
