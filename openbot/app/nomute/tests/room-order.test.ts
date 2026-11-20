// 고정 밖 방 차례 — 개인방(1:1) → 단톡 → 예비(손님) 맨 아래
//   · 예비 = 형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」
//   · 개인방 = 안 읽은 방 먼저(형 11-19 21:42 dm-sia) → talk
//   · 단톡 = 형 11-21 05:13 dm-sia 시아 옮김 「단톡방끼리는 우성순위 유지. 한싹이 같은것만 별도」 「개인방이랑」 · 05:33 「✓ 기타: 개인방 아래로 가는데 단톡도 시간 순」
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isGroup, restOrder, restRank, type RestRoom } from "../ui/room-rest-order.ts";

type R = RestRoom & { un?: boolean; t: number; last: number };
const ids = (rs: R[]) => restOrder(rs, (r) => !!r.un, (r) => r.t, (r) => r.last).map((r) => r.id);
const meet: R = { id: "all", t: 100, last: 509 };
const bap: R = { id: "tmp-mw8seuv1", t: 200, last: 300 };
const flower: R = { id: "tmp-flower", t: 900, last: 17, un: true };   // 11-17 옛 임시방 · 안 읽음
const wind: R = { id: "tmp-wind", t: 50, last: 16, un: true };
const sia: R = { id: "dm-sia", with: "시아", t: 400, last: 400 };
const fast: R = { id: "dm-fast", with: "빠르", t: 10, last: 10, un: true };
const spare: R = { id: "dm-spare01", with: "한싹이", guest: true, t: 999, last: 999, un: true };

test("칸 = 개인방 0 · 단톡 1 · 예비 2 · 예비는 단톡 아님", () => {
  assert.equal(restRank(sia), 0); assert.equal(restRank(meet), 1); assert.equal(restRank(spare), 2);
  assert.ok(isGroup(meet) && isGroup(flower)); assert.ok(!isGroup(sia)); assert.ok(!isGroup(spare));
});

test("개인방 아래 단톡 · 단톡은 시간 순 · 안 읽은 옛 임시방이 회의실 위로 안 뜀 · 예비 맨 아래", () => {
  assert.deepEqual(ids([flower, wind, bap, meet, spare, sia, fast]), ["dm-fast", "dm-sia", "all", "tmp-mw8seuv1", "tmp-flower", "tmp-wind", "dm-spare01"]);
});

test("개인방끼리는 앞 판 그대로(안 읽음 먼저 → 대화 시각)", () => {
  assert.deepEqual(ids([sia, fast]), ["dm-fast", "dm-sia"]);
});

test("단톡끼리 = 마지막 글 시각만(talk · 안 읽음 안 봄)", () => {
  assert.deepEqual(ids([flower, bap, meet]), ["all", "tmp-mw8seuv1", "tmp-flower"]);
});

test("room-list.tsx 가 이 차례를 씀", () => {
  const s = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.match(s, /const rest = restOrder\(shown\.filter\(\(r\) => !pinned\(r\.id\)\), unread, talk, \(r\) => r\.last_ts \|\| 0\);/);
});
