import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// 윈터 탭 되살림(형 11-17 02:28) · 옛 윈터 글(11-15 18:00 KST 앞)만 거름(형 11-14)
const src = readFileSync(new URL("../ui/stories.tsx", import.meta.url), "utf8");
const [y, mo, d, h] = src.match(/GONE_BEFORE = Date\.UTC\((\d+), (\d+), (\d+), (\d+)\)/)!.slice(1).map(Number);
const cut = Date.UTC(y, mo, d, h);
const shown = (s: { who: string; ts: number }) => !(["윈터", "winter"].includes(s.who) && !(Number(s.ts) >= cut));
test("거름 선 = 11-15 18:00 KST", () => assert.equal(new Date(cut + 9 * 3600e3).toISOString().slice(0, 16), "2026-11-15T18:00"));
test("옛 윈터 글 0 · 새 윈터 글 보임 · 남 글 그대로", () => {
  assert.equal(shown({ who: "윈터", ts: cut - 1 }), false);
  assert.equal(shown({ who: "winter", ts: cut - 1 }), false);
  assert.equal(shown({ who: "윈터", ts: cut }), true);
  assert.equal(shown({ who: "카리나", ts: 0 }), true);
  assert.match(src, /export const shown = \(s: Pick<Story, "who" \| "ts">\) => !\(GONE\.has\(s\.who\) && !\(Number\(s\.ts\) >= GONE_BEFORE\)\);/);
});
