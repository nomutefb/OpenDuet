// 점수 펴서 보이기(형 11-12 11:43 「웅 그렇게해줘!」 「원래 점수는 없어도돼」 · home/event-score.ts shownScore · scale = 서버 ?f=event 머리 칸)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { scaleOf, shownScore } from "../home/event-score.ts";

test("scale 있으면 min(100, s × 100 / scale) · 없으면 옛 그대로", () => {
  assert.equal(shownScore(62.1, 60), 100); assert.equal(shownScore(32, 56.5), 57); assert.equal(shownScore(12, 56.5), 21);
  assert.equal(shownScore(80, 56.5), 100, "위는 100 에서 멈춤");
  assert.equal(shownScore(32, null), 32); assert.equal(shownScore(32, 0), 32);
  assert.equal(scaleOf({ scale: 60 }), 60); assert.equal(scaleOf({}), null); assert.equal(scaleOf({ scale: "x" }), null);
});

test("홈 카드 · HOT ISSUE 둘 다 보이는 숫자만 폄 · 차례는 h.s", () => {
  const nf = readFileSync(new URL("../home/news-feed.tsx", import.meta.url), "utf8"), nl = readFileSync(new URL("../home/news-list.tsx", import.meta.url), "utf8");
  assert.match(nf, /r\.score = shownScore\(h\.s, scale\)/); assert.match(nf, /scale = scaleOf\(ev\)/);
  assert.match(nl, /score: shownScore\(h\.s, scale\)/); assert.match(nl, /scale = scaleOf\(ev\)/);
});
