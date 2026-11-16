// 1:1 에서 여럿을 부르면 서버가 여는 임시방 — 앱 쪽 셈(형 11-16 20:09 dm-bom 「개인대화에서 내가 누구 호출 가능하게 해줘 다수로 그러면 자동으로 1시간 유지방 생성 되게하고 … 나는 바로 그 방으로 이동해야하고」 · 서버 꼴 = 깃 20:22)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { OfficeRoom } from "../data/office.ts";
import { fwdEnd, leftKo, spawnedOf, withSpawned } from "../ui/spawn-room.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const NOW = 1_794_828_000_000, M = 60_000;

test("보내기 답의 새 방 칸 = 방 id 가 있을 때만 · 없으면 예전 그대로", () => {
  assert.deepEqual(spawnedOf({ ok: true, message: { room: "tmp-a" }, spawned: { id: "tmp-a", name: "봄07 🌷", exp: NOW + 60 * M, from: "dm-gik", members: ["깃", "번개", "구름"] } })?.id, "tmp-a");
  for (const j of [null, undefined, {}, { message: {} }, { spawned: null }, { spawned: {} }, { spawned: { id: "" } }, { spawned: { id: 7 } }]) assert.equal(spawnedOf(j), null);
});

test("방 목록 캐시 = 새 방을 임시방 꼴로 먼저 넣음 · 이미 있으면 그 줄만 덮음 · 목록이 아직 없으면 그대로", () => {
  const rooms = [{ id: "dm-gik", name: "깃", kind: "dm", with: "깃" }] as OfficeRoom[];
  const sp = { id: "tmp-a", name: "봄07 🌷", exp: NOW + 60 * M, from: "dm-gik", members: ["깃", "번개", "구름"] };
  const out = withSpawned(rooms, sp)!;
  assert.equal(out.length, 2); assert.equal(rooms.length, 1);   // 앞 목록은 안 건드림
  assert.deepEqual(out[1], { id: "tmp-a", name: "봄07 🌷", kind: "group", temp: true, exp: NOW + 60 * M, members: ["깃", "번개", "구름"], from: "dm-gik", spawned: true });
  assert.equal(withSpawned(out, { ...sp, name: "봄07 🌷 새" })!.length, 2);
  assert.equal(withSpawned(out, { ...sp, name: "봄07 🌷 새" })![1].name, "봄07 🌷 새");
  assert.equal(withSpawned(undefined, sp), undefined);
});

test("남은 시간 = 1시간 안쪽은 분 · 그 위는 시간 · 하루 넘으면 일 · 지나면 곧 사라짐", () => {
  assert.equal(leftKo(NOW + 60 * M, NOW), "1시간 남음");
  assert.equal(leftKo(NOW + 59 * M, NOW), "59분 남음");
  assert.equal(leftKo(NOW + 46 * M + 20_000, NOW), "47분 남음");
  assert.equal(leftKo(NOW + 30_000, NOW), "1분 남음");
  assert.equal(leftKo(NOW - 1, NOW), "곧 사라짐");
  assert.equal(leftKo(NOW + 5 * 60 * M, NOW), "5시간 남음");
  assert.equal(leftKo(NOW + 49 * 60 * M, NOW), "3일 남음");
});

test("옮겨 온 글 끝 = 이 글은 옮겨 온 글 · 다음 글은 아님", () => {
  const f = { fwd: { room: "dm-gik", id: "1", ts: NOW } };
  assert.equal(fwdEnd(f, {}), true); assert.equal(fwdEnd(f, undefined), true);
  assert.equal(fwdEnd(f, f), false); assert.equal(fwdEnd({}, f), false); assert.equal(fwdEnd(undefined, {}), false);
});

test("배선 = 보낸 답에 새 방이 있으면 그 방으로 옮기고 이 1:1 엔 글을 안 얹음 · 방 머리 남은 시간 누름 = 기한 바꾸기", () => {
  const chat = rd("../ui/office-chat.tsx"), temp = rd("../ui/temp-room.tsx");
  const a = chat.indexOf("const sp = spawnedOf(j);"), b = chat.indexOf("if (j.message) qc.setQueryData<Page>(officeKeys.msgs(room), (old) => merge(old, [j.message as Msg]));", a);
  assert.ok(a > 0 && a < b, "새 방 판정이 이 방 캐시에 얹기보다 먼저");
  assert.match(chat.slice(a, b), /withSpawned\(old, sp\)[\s\S]*nav\(\{ to: "\/channels\/\$channelId", params: \{ channelId: sp\.id \} \}\);\s*return;/);
  assert.match(chat, /\{moved \? <p className="ydate yfwd">여기까지 앞 방에서 옮겨 온 글<\/p> : null\}/);
  assert.match(temp, /export const tempLeft = leftKo;/);
  assert.match(temp, /onClick=\{\(\) => setEdit\(\(v\) => !v\)\}>\{r\.exp \? tempLeft\(r\.exp, now\) : "영구"\}<\/button>/);
  assert.match(temp, /\{edit \? <TempLeftEdit r=\{r\} \/> : null\}/);   // 그 자리 막대(창 0 · 형 11-16 「모달 최소화」)
  assert.doesNotMatch(temp.slice(temp.indexOf("function TempLeftEdit"), temp.indexOf("/** 방 설정 「방 사진」")), /TempRoomDialog/);   // 남은 시간 쪽은 방 설정 창을 안 띄움
  assert.match(temp, /JSON\.stringify\(\{ name: r\.name \|\| "", purpose: r\.purpose \|\| "", members: r\.members \|\| \[\], hours: h \}\)/);
  assert.match(temp, /export function TempLeftChip\(\{ r \}: \{ r: OfficeRoom \}\)/);   // 이름 옆 늘 보이는 남은 시간 표
  assert.match(temp, /if \(!r\.temp \|\| !r\.exp\) return null;/);
  assert.match(rd("../ui/top.tsx"), /<\/button><TempLeftChip r=\{r\} \/>/);
});
