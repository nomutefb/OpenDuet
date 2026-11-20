// 방 목록 고정 밖 차례 = 형과 마지막으로 대화한 때(구름 11-19 · 형 13:27 · 16:49 dm-bom 봄 옮김 · 봄 16:53 「형이 쓴 글로도 올라와야(카톡처럼) · max(heard_ts, 그 방 형 마지막 글 시각)」)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("고정 밖 개인방 시간 = max(그 애가 형한테 말한 때 heard_ts, 형이 그 방에 쓴 때) · 둘 다 없으면 마지막 글 시각", () => {
  const ui = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), d = readFileSync(new URL("../data/office.ts", import.meta.url), "utf8");
  assert.match(ui, /const talk = \(r: Room\) => \{ const l = lastOf\(r\), mine = l && l\.kind === "human" \? l\.ts : 0; return Math\.max\(r\.heard_ts \|\| 0, mine\) \|\| \(l \? l\.ts : r\.last_ts \|\| 0\); \};/);
  assert.match(ui, /const rest = restOrder\(shown\.filter\(\(r\) => !pinned\(r\.id\)\), talk, \(r\) => r\.last_ts \|\| 0\);/);   // 개인방(talk) → 단톡(시간 순) → 예비 · 안 읽음은 차례에 안 씀(형 11-21 05:33) = ./room-rest-order.ts · 행동 시험 = room-order.test.ts
  assert.match(d, /heard_ts\?: number;/);
});
