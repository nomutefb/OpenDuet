// 저장 답 → 캐시 칸(모루 #2987 23:52 · 실제 답 꼴 = 빠르 23:5x 라이브 실물 「top=ok,room,members · room keys=id,name,kind,temp,purpose,exp」)
import { test } from "node:test";
import assert from "node:assert/strict";
import { savedRoomPart } from "../ui/room-save.ts";

const REPLY = { ok: true, room: { id: "tmp-x", name: "개발자 모임", kind: "group", temp: true, purpose: "p", exp: 0 }, members: ["A", "C"] };

test("임시방 답 = room 칸 + 최상위 members(room 안엔 명단 없음) → B 뺀 새 명단이 캐시에", () => {
  const part = savedRoomPart(REPLY, "tmp-x", { members: ["A", "B", "C"] });
  assert.deepEqual(part.members, ["A", "C"]);
  assert.equal(part.name, "개발자 모임");
});

test("다른 방 답 · 빈 답 = 보낸 값 · room 안 members 는 최상위 없을 때만", () => {
  assert.deepEqual(savedRoomPart({ room: { id: "other" }, members: ["Z"] }, "tmp-x", { members: ["A"] }).members, ["Z"]);
  assert.deepEqual(savedRoomPart(null, "tmp-x", { members: ["A"], name: "n" }), { members: ["A"], name: "n" });
  assert.deepEqual(savedRoomPart({ room: { id: "tmp-x", members: ["Q"] } }, "tmp-x", { members: ["A"] }).members, ["Q"]);
});

test("다시 열기 흉내 — 캐시 고친 뒤 다시 연 창의 시작 명단 = 새 명단(B 안 되살아남)", () => {
  let cache = [{ id: "tmp-x", members: ["A", "B"] }];
  const part = savedRoomPart({ room: { id: "tmp-x" }, members: ["A"] }, "tmp-x", { members: ["A"] });
  cache = cache.map((x) => (x.id === "tmp-x" ? { ...x, ...part } as typeof x : x));
  const reopened = cache.find((x) => x.id === "tmp-x")!.members;
  assert.deepEqual([...reopened, "C"], ["A", "C"]);
});
