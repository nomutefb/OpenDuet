// #-048 「모두 내보내기」 = 단체방 방 메뉴 사람 칸 한 줄 · 형만 · 「정말 내보내시겠습니까?」 [예] [아니오(라임 · 기본)] · 예 = 창 바로 닫고 POST rooms/kick-all {room}(형 11-15)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (f: string) => readFileSync(new URL(`../ui/${f}`, import.meta.url), "utf8");
const s = rd("room-menu.tsx");
const ask = s.slice(s.indexOf("function KickAllAsk"), s.indexOf("type Ask ="));
test("메뉴 칸 「모두 내보내기」 = 형만(me.kind human) · 단체방 규칙", () => {
  assert.match(s, />모두 내보내기<\/button>/);
  assert.match(s, /canKickAll = !!r && me\?\.kind === "human" && kickAllRoom\(r\)/);
  assert.match(s, /kickAllRoom = \(r: OfficeRoom\) => !r\.with && r\.kind !== "dm" && !isPairRoom\(r\.id\) && r\.id !== "notice" && r\.id !== "repair" && r\.id !== "ideation"/);
  assert.match(s, />잠시 내보내기<small>/);   // 회의실 잠시 내보내기 그대로
});
test("확인 창 = 「정말 내보내시겠습니까?」 · 아니오 autoFocus(라임 nrc-ok) · Esc/바탕/창 X = 아니오", () => {
  assert.match(ask, /정말 내보내시겠습니까\?/);
  assert.match(ask, /<button type="button" className="nrc-ok no" autoFocus onClick=\{no\}>아니오<\/button>/);
  assert.match(ask, /<button type="button" className="yes" onClick=\{yes\}>예<\/button>/);
  assert.match(ask, /<DialogX onClose=\{no\} \/>/);
  assert.match(ask, /backdrop\(no\)/);
  assert.match(ask, /e\.key === "Escape"\) \{[^}]*no\(\)/);
  assert.match(ask, /e\.key === "Enter"[^\n]*no\(\)/);
  assert.match(ask, /createPortal\(/);
});
test("예 = 창 먼저 닫고 POST rooms/kick-all {room} · 기다리지 않음 · 실패 = setErr · 뒤에 rooms 다시 읽음", () => {
  const go = s.slice(s.indexOf("const kickAllGo"), s.indexOf("const canKickAll"));
  assert.match(s, /const KICK_ALL = "rooms\/kick-all"/);
  assert.match(go, /office\(KICK_ALL, \{ method: "POST", body: JSON\.stringify\(\{ room: x\.id \}\) \}\)/);
  assert.ok(go.indexOf("setKickAll(false)") < go.indexOf("office(KICK_ALL"), "창 닫기가 먼저");
  assert.doesNotMatch(go, /await /);
  assert.match(go, /setErr\(/);
  assert.match(go, /setTimeout\(\(\) => void qc\.invalidateQueries\(\{ queryKey: \["nomute", "rooms"\] \}\), 1500\)/);
});
