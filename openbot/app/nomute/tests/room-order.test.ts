// 고정 밖 방 차례 — 개인방(1:1) → 단톡 → 예비(손님) · 칸 안 = 시간 새 것 위 · 안 읽음은 차례에 안 씀
//   형 11-21 05:33 dm-sia 시아 옮김 「✓ 기타: 개인방 아래로 가는데 단톡도 시간 순」 「PM 고정 개인 단톡 예비 순 이려나」 「그다음 조건이 시간이고」
//   · 예비 = 형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isGroup, restOrder, restRank, type RestRoom } from "../ui/room-rest-order.ts";

type R = RestRoom & { t: number; last: number };
const ids = (rs: R[]) => restOrder(rs, (r) => r.t, (r) => r.last).map((r) => r.id);
const meet: R = { id: "all", t: 100, last: 509 };
const bap: R = { id: "tmp-mw8seuv1", t: 200, last: 300 };
const flower: R = { id: "tmp-flower", t: 900, last: 17 };   // 11-17 옛 임시방(안 읽음이어도 차례엔 안 씀)
const wind: R = { id: "tmp-wind", t: 50, last: 16 };
const sia: R = { id: "dm-sia", with: "시아", t: 400, last: 400 };
const fast: R = { id: "dm-fast", with: "빠르", t: 10, last: 10 };   // 안 읽은 1:1 이어도 시간 순
const spare: R = { id: "dm-spare01", with: "한싹이", guest: true, t: 999, last: 999 };
const spare2: R = { id: "dm-spare02", with: "두싹이", guest: true, t: 5, last: 5 };

test("칸 = 개인방 0 · 단톡 1 · 예비 2 · 예비는 단톡 아님", () => {
  assert.equal(restRank(sia), 0); assert.equal(restRank(meet), 1); assert.equal(restRank(spare), 2);
  assert.ok(isGroup(meet) && isGroup(flower)); assert.ok(!isGroup(sia)); assert.ok(!isGroup(spare));
});

test("개인방 → 단톡 → 예비 · 칸 안 시간 순 · 옛 임시방이 회의실 위로 안 뜸", () => {
  assert.deepEqual(ids([flower, spare2, wind, bap, meet, spare, sia, fast]), ["dm-sia", "dm-fast", "all", "tmp-mw8seuv1", "tmp-flower", "tmp-wind", "dm-spare01", "dm-spare02"]);
});

test("개인방 시간 = talk · 단톡 시간 = 목록 시각(when)", () => {
  assert.deepEqual(ids([fast, sia]), ["dm-sia", "dm-fast"]);
  assert.deepEqual(ids([flower, bap, meet]), ["all", "tmp-mw8seuv1", "tmp-flower"]);   // talk 로는 봄꽃이 위지만 단톡은 when
});

test("room-list.tsx 가 이 차례를 씀 · PM 1:1 늘 맨 위 · 종 · 시각 수평", () => {
  const s = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(s, /const rest = restOrder\(shown\.filter\(\(r\) => !pinned\(r\.id\)\), talk, \(r\) => r\.last_ts \|\| 0\);/);
  assert.match(s, /\.sort\(\(a, b\) => Number\(b\.id === pmRoom\) - Number\(a\.id === pmRoom\) \|\| rank\(a\.id\) - rank\(b\.id\)/);
  assert.match(s, /min-h-\[1lh\] items-center[^"]*">\{notify\.data && nOn \?/);
  assert.match(s, /<span className="nm-rtime">\{listTime\(r\.last_ts\)\}<\/span>/);
  assert.match(css, /\.nm-rtime \{ text-box:trim-both cap alphabetic; \}/);
  assert.match(css, /\.nm-rbell \{[^}]*transform:translateY\(1px\);/);
});
