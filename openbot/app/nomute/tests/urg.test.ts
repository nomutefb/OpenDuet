// 수집함 긴급 = HOT ISSUE 맨 위 · 점수 대신 「긴급 07:46」(봄 11-13 05:31 · 빠르 urg 칸)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { byEvent, eventIndex, eventOf } from "../home/event-score.ts";

test("urg 있는 사건 = 맨 위 · HH:MM(서울) · 점수 낮아도", () => {
  const idx = eventIndex([
    { s: 60, keys: ["rss:https://a.com/1"] },
    { s: 12.5, keys: ["rss:https://b.com/2"], urg: { at: "2026-11-12T07:46:10+09:00", g: 3 } },
  ]);
  const rows = [{ urls: ["https://a.com/1"] }, { urls: ["https://b.com/2"] }];
  const out = byEvent(rows, (r) => eventOf(r, idx));
  assert.equal(out[0], rows[1]);
  assert.equal(eventOf(rows[1], idx)!.urg, "07:46");
  assert.equal(eventOf(rows[0], idx)!.urg, undefined);
});

test("화면 = 긴급 줄 점수 칸 「긴급 HH:MM」", () => {
  const nl = readFileSync(new URL("../home/news-list.tsx", import.meta.url), "utf8");
  assert.match(nl, /row\.urg \? <span className="sc urg"/);
  assert.match(nl, /urg: h\.urg \}/);
  assert.match(readFileSync(new URL("../home/news-list.css", import.meta.url), "utf8"), /li:has\(\.sc\.urg\) \{ grid-template-columns:16px 18px minmax\(0,1fr\) auto 50px 76px; \}/);
});
