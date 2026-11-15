// #-048 「모두 내보내기」 = 단체방 방 메뉴 사람 칸 한 줄 · 형만 · 「정말 내보내시겠습니까?」 [예] [아니오(라임 · 기본)] · 예 = 창 바로 닫고 POST rooms/kick-all {room}(형 11-15)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (f: string) => readFileSync(new URL(`../ui/${f}`, import.meta.url), "utf8");
const s = rd("room-menu.tsx");
test("메뉴 칸 「모두 내보내기」 = 형만(me.kind human) · 단체방 규칙", () => {
  assert.match(s, /<MorphAsk role="menuitem" yesText="내보내기" onYes=\{\(\) => kickAllGo\(r\)\}>모두 내보내기<\/MorphAsk>/);
  assert.match(s, /canKickAll = !!r && me\?\.kind === "human" && kickAllRoom\(r\)/);
  assert.match(s, /kickAllRoom = \(r: OfficeRoom\) => !r\.with && r\.kind !== "dm" && !isPairRoom\(r\.id\) && r\.id !== "notice" && r\.id !== "repair" && r\.id !== "ideation"/);
  assert.match(s, />잠시 내보내기<small>/);   // 회의실 잠시 내보내기 그대로
});
test("확인 = 창(모달) 대신 그 자리 알약 둘 · 아니오 autoFocus(라임) · Esc · 딴 데 누름 · 6초 = 아니오(형 11-16 03:0x 「모달로 안뜨게하구」)", () => {
  const m = readFileSync(new URL("../ui/morph-ask.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(s, /function KickAllAsk|createPortal\(\s*<div className="nrc-veil nm-yeta" role="presentation" \{\.\.\.backdrop\(no\)\}/);
  assert.match(m, /<button type="button" className="no" autoFocus onClick=\{\(\) => \{ setAsk\(false\); setBack\(true\); \}\}>\{noText\}<\/button>/);
  assert.match(m, /<button type="button" className="yes" onClick=\{\(\) => \{ setAsk\(false\); onYes\(\); \}\}>\{yesText\}<\/button>/);
  assert.match(m, /e\.key === "Escape"\) \{[^}]*no\(\)/);
  assert.match(m, /HOLD_MS = 6000/);
  assert.doesNotMatch(m, /createPortal|role="alertdialog"|aria-modal/);
});
test("예 = 창 먼저 닫고 POST rooms/kick-all {room} · 기다리지 않음 · 실패 = setErr · 뒤에 rooms 다시 읽음", () => {
  const go = s.slice(s.indexOf("const kickAllGo"), s.indexOf("const canKickAll"));
  assert.match(s, /const KICK_ALL = "rooms\/kick-all"/);
  assert.match(go, /office\(KICK_ALL, \{ method: "POST", body: JSON\.stringify\(\{ room: x\.id \}\) \}\)/);
  assert.ok(go.indexOf("close()") >= 0 && go.indexOf("close()") < go.indexOf("office(KICK_ALL"), "메뉴 닫기가 먼저");
  assert.doesNotMatch(go, /await /);
  assert.match(go, /flash\(`모두 내보내지 못했어/);   // 메뉴가 이미 닫혔으니 실패 = 화면 아래 알림 한 줄
  assert.match(go, /setTimeout\(\(\) => void qc\.invalidateQueries\(\{ queryKey: \["nomute", "rooms"\] \}\), 1500\)/);
});
