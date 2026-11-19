// 방 목록 고정 밖 차례 = 형한테 최근에 말한 이 먼저(구름 11-19 · 형 13:27 dm-bom 봄 옮김 「그리고 나한테 최근에 말을 한 사람이 위로 올라오게해줘 고정다음으로」)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("고정 밖 = 안 읽은 방 먼저 → 형한테 마지막으로 말한 때(heard_ts · 없으면 마지막 글이 형 글 아니면 그 시각) · 형이 읽은 때로 안 올라감", () => {
  const ui = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), d = readFileSync(new URL("../data/office.ts", import.meta.url), "utf8");
  assert.match(ui, /const heard = \(r: Room\) => \{ if \(r\.heard_ts\) return r\.heard_ts; const l = lastOf\(r\); return l && l\.kind !== "human" \? l\.ts : r\.last_ts \|\| 0; \};/);
  assert.match(ui, /\.sort\(\(a, b\) => Number\(unread\(b\)\) - Number\(unread\(a\)\) \|\| heard\(b\) - heard\(a\)\);/);
  assert.match(d, /heard_ts\?: number;/);
});
