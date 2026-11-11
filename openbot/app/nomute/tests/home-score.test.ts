import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { byEvent, eventIndex, eventOf } from "../home/event-score.ts";

// 홈 카드판 = 뉴스 알고리즘 점수 하나(형 11-11 08:53 「글구 메인화면에서 그 점수 별로 카드 보이는거 잇지? 그거 점수마다 보여야 함 한 알고리즘 대로」)
const feed = readFileSync(new URL("../home/news-feed.tsx", import.meta.url), "utf8");

test("카드판이 Hot Issue 와 같은 사건 점수(/api/trends?f=event)로 점수 · 차례를 단다", () => {
  assert.match(feed, /\/api\/trends\?f=event/);
  assert.match(feed, /r\.score = h\.s; r\.score_int = true;/);
  assert.match(feed, /delete r\.score;/);   // 못 맞춘 카드 = 옛 점수 안 섞음
  assert.match(feed, /rows = byEvent\(rows, /);
});

test("같은 사건 한 장 · 점수 큰 차례 · 못 맞춘 카드는 뒤(byEvent)", () => {
  const ei = eventIndex([{ s: 40, keys: ["rss:a.com/x"] }, { s: 90, keys: ["naver:001:0000001"], m: "e1" }, { s: 70, keys: ["rss:b.com/y"], m: "e1" }]);
  const rows = [{ urls: ["https://a.com/x"] }, { urls: ["https://c.com/none"] }, { urls: ["https://n.news.naver.com/article/001/0000001"] }, { urls: ["https://www.b.com/y/"] }];
  const out = byEvent(rows, (r) => eventOf(r, ei));
  assert.deepEqual(out.map((r) => r.urls[0]), ["https://n.news.naver.com/article/001/0000001", "https://a.com/x", "https://c.com/none"]);
});
