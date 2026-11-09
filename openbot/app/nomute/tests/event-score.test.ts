// Hot Issue 점수·차례 = 뉴스 알고리즘 점수(형 11-09 12:3x 「점수대로 제대로 구현좀 되게 해주셈」 · 「점수가 근본이없네 순위가」)
import test from "node:test";
import assert from "node:assert/strict";
import { byEvent, eventIndex, eventKeysOfUrl, eventOf } from "../home/event-score.ts";

test("주소 → 열쇠: 네이버 oid:aid · 네이트 id · 그 밖 rss(쿼리 뗀 꼴도)", () => {
  assert.ok(eventKeysOfUrl("https://n.news.naver.com/mnews/article/001/0016430119?sid=102").includes("naver:001:0016430119"));
  assert.ok(eventKeysOfUrl("https://news.naver.com/main/read.naver?mode=x&oid=005&aid=0001883849").includes("naver:005:0001883849"));
  assert.ok(eventKeysOfUrl("https://m.news.nate.com/view/20261109n05529?mid=m03").includes("natenews:20261109n05529"));
  assert.ok(eventKeysOfUrl("https://www.yna.co.kr/view/AKR20261109024500004?section=x").includes("rss:yna.co.kr/view/akr20261109024500004"));
  assert.deepEqual(eventKeysOfUrl(""), []);
});

test("줄 = 그 줄 주소 중 가장 높은 사건 점수 · 차례 = 점수 큰 것부터 · 못 맞춘 줄 = 끝 · 빠지는 줄 0", () => {
  const idx = eventIndex([
    { s: 69.7, why: "69.7(2위)", brk: true, keys: ["naver:001:0016430119", "rss:https://www.yna.co.kr/view/AKR20261109024500004"] },
    { s: 85.2, keys: ["rss:https://www.sedaily.com/article/20111763"] },
    { s: 12, keys: ["rss:https://a.kr/x?utm=1"] },
  ]);
  const rows = [
    { k: "커뮤", urls: ["https://dcinside.com/1"] },
    { k: "낮음", urls: ["https://a.kr/x"] },
    { k: "속보", urls: ["https://n.news.naver.com/article/001/0016430119"] },
    { k: "묶음", urls: ["https://x.kr/1"], items: [{ url: "https://www.sedaily.com/article/20111763/" }] },
  ];
  assert.equal(eventOf(rows[2], idx)?.s, 69.7);
  assert.equal(eventOf(rows[2], idx)?.brk, true);
  assert.equal(eventOf(rows[1], idx)?.s, 12);
  assert.equal(eventOf(rows[0], idx), null);
  assert.deepEqual(byEvent(rows, (r) => eventOf(r, idx)).map((r) => r.k), ["묶음", "속보", "낮음", "커뮤"]);
});

test("점수 없음 = 그대로", () => {
  const rows = [{ k: 1 }, { k: 2 }];
  assert.deepEqual(byEvent(rows, () => null), rows);
  assert.equal(eventIndex(null).size, 0);
});
