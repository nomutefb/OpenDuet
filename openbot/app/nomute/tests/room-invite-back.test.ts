// 「!종료」로 나간 이를 방 머리 「+ 초대」로 다시 부름 — 형 11-20 13:25 dm-sia 「그리고 루미 계쏙 나감으로뜨는데 확인좀 부탁해! 초대해도 나감으로떠서」
//   앞 판 = 나간 이도 명단(members)엔 남아 있어 「+ 초대」 후보(명단 밖만)에서 빠짐 → 방 설정 저장은 바뀐 멤버 0 이라 나간 표를 안 건드림 → 「나감」 그대로
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { type OfficePerson, type OfficeRoom, inviteCands, invitePlan } from "../data/office.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const ppl = [{ who: "형", kind: "human" }, { who: "봄", kind: "bot" }, { who: "루미", kind: "bot" }, { who: "이슬", kind: "bot" }, { who: "별", kind: "bot", gone: true }] as OfficePerson[];
const bap = { id: "tmp-mw8seuv1", name: "밥상", kind: "group", temp: true, members: ["봄", "루미"], left: ["루미"] } as unknown as OfficeRoom;

test("후보 = 명단 밖 + 나간 이 · 형 · 없어진 봇 · 남은 멤버는 빠짐", () => {
  assert.deepEqual(inviteCands(bap, ppl).map((x) => x.who), ["루미", "이슬"]);   // 앞 판 = ["이슬"](루미 없음)
  assert.deepEqual(inviteCands({ ...bap, left: [] }, ppl).map((x) => x.who), ["이슬"]);
  assert.deepEqual(inviteCands({ ...bap, left: ["형"] }, ppl).map((x) => x.who), ["이슬"]);   // 형이 나간 것 = 후보 아님
  assert.deepEqual(inviteCands({ ...bap, members: undefined, left: undefined }, ppl).map((x) => x.who), ["봄", "루미", "이슬"]);
});

test("고른 이 나누기 = 나간 이는 다시 부름 · 명단 밖은 멤버 더하기 · 남은 멤버는 어느 쪽도 아님", () => {
  assert.deepEqual(invitePlan(bap, ["루미"]), { back: ["루미"], fresh: [] });
  assert.deepEqual(invitePlan(bap, ["루미", "이슬"]), { back: ["루미"], fresh: ["이슬"] });
  assert.deepEqual(invitePlan(bap, ["봄"]), { back: [], fresh: [] });
  assert.deepEqual(invitePlan({ ...bap, left: undefined }, ["이슬"]), { back: [], fresh: ["이슬"] });
});

test("배선 = 방 머리가 이 셈을 쓰고 · 나간 이는 rooms/<방>/invite(대화 위 단추와 같은 서버 길) · 명단 밖만 temprooms", () => {
  const top = rd("../ui/top.tsx");
  assert.match(top, /const outside = inviteCands\(r, list\)/);
  assert.match(top, /const \{ back, fresh \} = invitePlan\(r, pick\)/);
  assert.match(top, /rooms\/\$\{encodeURIComponent\(r\.id\)\}\/invite`, \{ method: "POST", body: JSON\.stringify\(\{ who \}\) \}/);
  assert.match(top, /members: \[\.\.\.\(r\.members \|\| \[\]\), \.\.\.fresh\]/);
  assert.doesNotMatch(top, /members: \[\.\.\.\(r\.members \|\| \[\]\), \.\.\.pick\]/);   // 앞 판 = 고른 이 통째로 멤버에 더함(나간 이는 이미 멤버라 그대로)
  assert.match(top, /gone\.has\(x\.who\) \? " \(나감\)" : ""/);
  assert.match(rd("../ui/office-chat.tsx"), /rooms\/\$\{enc\(room\)\}\/invite/);   // 서버 길 = 앞 판 단추와 하나
});
