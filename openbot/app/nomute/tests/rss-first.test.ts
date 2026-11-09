// Hot Issue 차례 = RSS 바탕 · 커뮤 섞기(home/rss-first.ts) — 형 11-09 09:34 「rss가 기준이 되어야」 · 깃 42)
import test from "node:test";
import assert from "node:assert/strict";
import { rssFirst } from "../home/rss-first.ts";

test("RSS 2장마다 순위 묶음 1개 · 남는 묶음 끝 · 빠지는 줄 0", () => {
  const rows = [{ type: "ranked", k: "c1" }, { type: "ranked", k: "c2" }, { type: "existing", k: "n1" }, { type: "existing", k: "n2" }, { type: "existing", k: "n3" }, { type: "ranked", k: "c3" }];
  assert.deepEqual(rssFirst(rows).map((r) => r.k), ["n1", "n2", "c1", "n3", "c2", "c3"]);
  assert.equal(rssFirst(rows).length, rows.length);
});
test("RSS 없음 = 그대로", () => {
  const rows = [{ type: "ranked", k: "c1" }, { type: "ranked", k: "c2" }];
  assert.deepEqual(rssFirst(rows), rows);
});
