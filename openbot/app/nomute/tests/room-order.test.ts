// 예비(손님) 창 = 늘 맨 아래(형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("고정 아닌 방 차례 = 손님(guest) 맨 아래 → 안 읽은 방 → 대화 시각", () => {
  const s = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.match(s, /const guest = \(r: Room\) => !!\(r as \{ guest\?: boolean \}\)\.guest;/);
  assert.match(s, /\.sort\(\(a, b\) => Number\(guest\(a\)\) - Number\(guest\(b\)\) \|\| Number\(unread\(b\)\) - Number\(unread\(a\)\) \|\| talk\(b\) - talk\(a\)\)/);
});
