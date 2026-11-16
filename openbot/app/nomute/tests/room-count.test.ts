// 방 사람 수 = 한 셈(멤버 + 형) — 방 안 머리 · 대화 목록 · 방 정보가 같은 숫자(형 11-16 19:42 dm-bom 「단톡방 안에서는 5라고 뜨는데 외부에선 4라고 떠.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { type OfficePerson, type OfficeRoom, roomHeadCount } from "../data/office.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const bots = ["봄", "시아", "구름", "빠르"].map((who) => ({ who, kind: "bot" }) as unknown as OfficePerson);
const room = (x: Partial<OfficeRoom>) => ({ id: "tmp-1", name: "봄 연구소", ...x }) as OfficeRoom;

test("셈 = 든 봇 + 형 1 · 1:1 · 접수처 · 메모 · 요약실 · 빈 방 = 0", () => {
  assert.equal(roomHeadCount(room({ members: ["봄", "시아", "구름", "빠르"] }), bots), 5);   // 형이 본 방: 멤버 넷 + 형 = 5(목록은 4 였음)
  assert.equal(roomHeadCount(room({ id: "all", members: ["봄"] }), bots), 2);
  assert.equal(roomHeadCount(room({ id: "all" }), bots), 5);   // 멤버 칸이 없는 옛 회의실 = 봇 전부 + 형
  assert.equal(roomHeadCount(room({ members: [] }), bots), 0);
  assert.equal(roomHeadCount(room({ with: "봄" }), bots), 0);
  for (const id of ["repair", "memo", "summary"]) assert.equal(roomHeadCount(room({ id, members: ["봄"] }), bots), 0);
});

test("배선 = 방 머리 · 목록 · 방 정보가 따로 세지 않음", () => {
  const top = rd("../ui/top.tsx"), list = rd("../ui/room-list.tsx");
  assert.match(top, /<i>\{roomHeadCount\(r, list\)\}<\/i>/);
  assert.doesNotMatch(top, /ids\.length \+ 1/);
  assert.match(list, /tabular-nums text-muted-foreground">\{roomHeadCount\(r, list\)\}<\/span>/);
  assert.doesNotMatch(list, /crew\.length/);
  assert.match(list, /<b>사람 \{names\.length \+ 1\}<\/b> · 형 · /);
});
