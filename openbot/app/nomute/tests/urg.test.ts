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

test("화면 = 긴급 표지 0 · 긴급 줄도 점수 · 「N시간 전」 = 흰색(형 11-13 11:00 「긴급 -> 없어도 되구, / 0시간전 > 이거 그냥 흰색으로 뜨면 돼」)", () => {
  const nl = readFileSync(new URL("../home/news-list.tsx", import.meta.url), "utf8");
  assert.ok(!/className="sc urg"/.test(nl), "빨간 긴급 알약 뺌");
  assert.match(nl, /urg: h\.urg \}/, "차례(긴급 맨 위)는 그대로");
  const css = readFileSync(new URL("../home/news-list.css", import.meta.url), "utf8");
  assert.ok(!/\.sc\.urg/.test(css));
  assert.match(css, /\.nm-nlist-ol \.ag \{[^}]*color:#e8eae8;/);
});
