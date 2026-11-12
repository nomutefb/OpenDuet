// 둘의 방 귀속(형 11-13 08:29 「둘 대화로 귀속시켜주면 안돼? 둘 대화인데 따로 빠지는게 영 어색하네」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isPairRoom, mergeTs, pairOf } from "../ui/pair-fold.ts";

test("dm-bom ↔ pair-bom-chaeng(「봄 · 챙」) · 없으면 빈 · 글 = 시각 차례 · 같은 id 하나", () => {
  const rooms = [{ id: "dm-bom", name: "봄", with: "봄" }, { id: "pair-bom-chaeng", name: "봄 · 챙" }, { id: "dm-sia", name: "시아", with: "시아" }];
  assert.equal(pairOf(rooms[0], rooms), "pair-bom-chaeng");
  assert.equal(pairOf(rooms[2], rooms), "");
  assert.equal(pairOf({ id: "all", name: "회의실" }, rooms), "");
  assert.deepEqual(mergeTs([{ id: "a", ts: 1 }, { id: "c", ts: 5 }], [{ id: "b", ts: 3 }, { id: "a", ts: 1 }]).map((m) => m.id), ["a", "b", "c"]);
  assert.equal(isPairRoom("pair-bom-chaeng"), true); assert.equal(isPairRoom("dm-bom"), false);
});
test("목록 · 띠 = 둘의 방 줄 0 · 1:1 = 섞어 그림 · 섞은 글은 다 보임", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(rl, /&& !isPairRoom\(r\.id\)\);/);
  assert.match(oc, /const pairId = pairOf\(r, roomsQ\.data \|\| \[\]\);/);
  assert.match(oc, /const showM = \(m: Msg\) => \(!!r && !!m\.room && m\.room !== r\.id\) \|\|/);
});
