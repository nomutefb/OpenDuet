// 고정 밖 방 차례 — 예비(손님) 늘 맨 아래(형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」)
//   · 안 읽은 방 먼저(형 11-19 21:42 dm-sia) · 단톡끼리는 차례 그대로(형 11-21 05:13 dm-sia 시아 옮김 「단톡방끼리는 우성순위 유지. 한싹이 같은것만 별도」 「개인방이랑」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { groupRank, isBap, isGroup, restOrder, type RestRoom } from "../ui/room-rest-order.ts";

type R = RestRoom & { un?: boolean; t: number };
const ids = (rs: R[]) => restOrder(rs, (r) => !!r.un, (r) => r.t).map((r) => r.id);
const meet: R = { id: "all", name: "회의실", t: 100 };
const bap: R = { id: "tmp-mw8seuv1", name: "밥상 🍚", t: 200 };
const wind: R = { id: "tmp-wind", name: "봄바람", t: 50, un: true };
const rain: R = { id: "tmp-rain", name: "봄비", t: 300 };
const sia: R = { id: "dm-sia", name: "시아", with: "시아", t: 400 };
const fast: R = { id: "dm-fast", name: "빠르", with: "빠르", t: 10, un: true };
const spare: R = { id: "dm-spare01", name: "예비 1", with: "한싹이", guest: true, t: 999, un: true };

test("단톡 칸 = 회의실 → 밥상 → 나머지 · 1:1 · 예비는 단톡 아님", () => {
  assert.equal(groupRank(meet), 0); assert.equal(groupRank(bap), 1); assert.equal(groupRank(wind), 2);
  assert.ok(isBap({ id: "guide", name: "옛 밥상" })); assert.ok(!isBap(rain));
  assert.ok(isGroup(meet) && isGroup(wind)); assert.ok(!isGroup(sia)); assert.ok(!isGroup(spare));
});

test("안 읽은 봄바람이 와도 회의실 · 밥상 아래 · 단톡이 앉은 자리만 다시 채움", () => {
  // 앞 판(안 읽음 → 대화 시각) = 봄바람(안 읽음) · 빠르(안 읽음) · 시아 · 봄비 · 밥상 · 회의실 · 예비 → 단톡 자리 넷(1 · 4 · 5 · 6째)에 회의실 · 밥상 · 봄비 · 봄바람
  assert.deepEqual(ids([meet, bap, wind, rain, sia, fast, spare]), ["all", "dm-fast", "dm-sia", "tmp-mw8seuv1", "tmp-rain", "tmp-wind", "dm-spare01"]);
});

test("1:1 끼리는 앞 판 그대로(안 읽음 먼저 → 대화 시각) · 예비는 안 읽어도 맨 아래", () => {
  assert.deepEqual(ids([sia, fast, spare]), ["dm-fast", "dm-sia", "dm-spare01"]);
});

test("나머지 단톡끼리 = 안 읽음 말고 새 대화 순", () => {
  assert.deepEqual(ids([wind, rain]), ["tmp-rain", "tmp-wind"]);
});

test("room-list.tsx 가 이 차례를 씀", () => {
  const s = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8");
  assert.match(s, /const rest = restOrder\(shown\.filter\(\(r\) => !pinned\(r\.id\)\), unread, talk\);/);
});
