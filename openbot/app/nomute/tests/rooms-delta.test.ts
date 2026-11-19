import { expect, test } from "bun:test";
import { mergeRooms, seenChanged } from "../data/rooms-merge.ts";

// 방 목록 = 바뀐 방만 받아 합침(빠르 11-14 · 봄 「가」 ① · 형 09:16 「매번 받아오게 했다」)
const cur = [{ id: "all", n: 1 }, { id: "guide", n: 1 }, { id: "dm-fast", n: 1 }];

test("바뀐 방 칸만 갈아 끼움 · 차례 그대로", () => {
  const out = mergeRooms(cur, ["guide"], { partial: true, rooms: [{ id: "guide", n: 2 }] });
  expect(out).toEqual([{ id: "all", n: 1 }, { id: "guide", n: 2 }, { id: "dm-fast", n: 1 }]);
});

test("내 목록에 없고 답에도 없는 방(남의 둘의 방 등) = 그냥 둠", () => {
  expect(mergeRooms(cur, ["pair-a-b"], { partial: true, rooms: [] })).toEqual(cur);
});

test("새 방 · 없어진 방 = null(통째로 다시)", () => {
  expect(mergeRooms(cur, ["tmp-new"], { partial: true, rooms: [{ id: "tmp-new", n: 1 }] })).toBeNull();
  expect(mergeRooms(cur, ["guide"], { partial: true, rooms: [] })).toBeNull();
});

test("옛 서버(partial 없음) = 받은 통째 그대로", () => {
  const full = [{ id: "all", n: 9 }];
  expect(mergeRooms(cur, ["all"], { rooms: full })).toEqual(full);
});

// 읽음 표가 바뀌면 달라진 방 칸만 다시 받음(형 11-19 「또 이런 비효율적인게 있나?」 — 앞 판 = 읽음이 바뀔 때마다 방 목록 통째 · 실측 = 형이 대화하는 2분에 통째 35번)
test("읽음 표에서 달라진 방만 = ts · at 바뀜 · 생김 · 사라짐", () => {
  const prev = { a: { ts: 1, at: 10 }, b: { ts: 2, at: 20 }, gone: { ts: 3, at: 30 } };
  const next = { a: { ts: 1, at: 10 }, b: { ts: 5, at: 21 }, fresh: { ts: 7, at: 70 } };
  expect(seenChanged(prev, next).sort()).toEqual(["b", "fresh", "gone"]);
});

test("이 탭이 올린 읽음(서버가 받아 준 값이 이미 표에 있음) = 달라진 방 0 = 방 목록 부름 0", () => {
  const mine = { a: { ts: 9, at: 90 } };
  expect(seenChanged(mine, { a: { ts: 9, at: 90 } })).toEqual([]);
  expect(seenChanged({ a: { ts: 9, at: 90 } }, { a: { ts: 9, at: 91 } })).toEqual(["a"]);   // 같은 글까지지만 다시 찍힘(안 읽음으로 돌렸다 다시 읽음 등)
});

