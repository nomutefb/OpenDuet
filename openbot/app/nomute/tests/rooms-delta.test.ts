import { expect, test } from "bun:test";
import { mergeRooms } from "../data/rooms-merge";

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
