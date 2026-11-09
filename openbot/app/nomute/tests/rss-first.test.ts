// Hot Issue 차례 = RSS 바탕 · 커뮤 섞기(home/rss-first.ts) — 형 11-09 09:34 「rss가 기준이 되어야」 · 깃 42)
import test from "node:test";
import assert from "node:assert/strict";
import { isBreaking, rssFirst, RSS_FRESH_MS } from "../home/rss-first.ts";

test("맨 위 셋 = RSS · 그 뒤 RSS 2장마다 순위 묶음 1개 · 남는 묶음 끝 · 빠지는 줄 0", () => {
  const rows = [{ type: "ranked", k: "c1" }, { type: "ranked", k: "c2" }, { type: "existing", k: "n1" }, { type: "existing", k: "n2" }, { type: "existing", k: "n3" }, { type: "ranked", k: "c3" }];
  assert.deepEqual(rssFirst(rows).map((r) => r.k), ["n1", "n2", "n3", "c1", "c2", "c3"]);   // RSS 셋뿐 = 맨 위 셋 RSS · 묶음은 뒤
  assert.equal(rssFirst(rows).length, rows.length);
});
test("RSS 없음 = 그대로", () => {
  const rows = [{ type: "ranked", k: "c1" }, { type: "ranked", k: "c2" }];
  assert.deepEqual(rssFirst(rows), rows);
});

test("맨 위 셋 = 늘 RSS(책임질 기사 · 형 09:35) · 그 뒤 묶음 1 · RSS 2", () => {
  const rows = [{ type: "ranked", k: "c1" }, { type: "ranked", k: "c2" }, ...["n1", "n2", "n3", "n4", "n5", "n6", "n7"].map((k) => ({ type: "existing", k }))];
  assert.deepEqual(rssFirst(rows).map((r) => r.k), ["n1", "n2", "n3", "c1", "n4", "n5", "c2", "n6", "n7"]);
});

test("머리표([속보]·[단독]) = 차례에 안 씀(형 11-09 「속보라는 타이틀 언론사에서 자체적으로 붙인거는 아무 의미없음」) · 받은 차례 그대로", () => {
  const rows = [{ type: "existing", k: "n1", title: "평범 1" }, { type: "existing", k: "n2", title: "[속보] 지진" }, { type: "existing", k: "n3", title: "평범 3" }, { type: "existing", k: "n4", title: "[단독] 문건" }, { type: "ranked", k: "c1", title: "커뮤" }];
  assert.deepEqual(rssFirst(rows).map((r) => r.k), ["n1", "n2", "n3", "c1", "n4"]);
  assert.equal(isBreaking({ title: "(긴급) 대피" }), true);
  assert.equal(isBreaking({ title: "속보 아님 [속보]" }), false);
});

test("RSS 8시간 넘은 줄 = 뺌(형 11-09 12:01 「메인 화면에 옛날 기사」 · 11-05 「8시간 전은 다 쳐내셈」) · 시각 모름 = 둠 · 묶음 손 0", () => {
  const now = Date.parse("2026-11-09T03:00:00Z"), at = (h: number) => ({ published: { at: new Date(now - h * 3600_000).toISOString() } });
  const rows = [{ type: "existing", k: "old", title: "[속보] 사흘 전", meta: at(93) }, { type: "existing", k: "n1", meta: at(1) }, { type: "ranked", k: "c1", meta: at(50) }, { type: "existing", k: "n2" }, { type: "existing", k: "edge", meta: { published: { at: new Date(now - RSS_FRESH_MS).toISOString() } } }];
  assert.deepEqual(rssFirst(rows, 2, 3, now).map((r) => r.k), ["n1", "n2", "edge", "c1"]);
});
