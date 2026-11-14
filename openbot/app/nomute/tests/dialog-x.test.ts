// #-042 방 만들기 판 닫기 = 창 X 하나 · 빈 판 바로 닫힘 · 쓰던 중 한 문장 확인(형 11-15 07:55)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (f: string) => readFileSync(new URL(`../ui/${f}`, import.meta.url), "utf8");
test("판 안 「닫기」 글자 단추 0 · 창 X(DialogX) = 닫기 길(g.request)", () => {
  const s = rd("temp-room.tsx"), i = s.indexOf("export function TempRoomDialog"), j = s.indexOf("export function TempDeleteDialog"), t = s.slice(i, j);
  assert.match(t, /<DialogX onClose=\{g\.request\} \/>/);
  assert.doesNotMatch(t, />닫기<\/button>/);
  assert.doesNotMatch(t, /SaveAsk/);
  assert.match(t, /<CloseAsk.*onClose=\{\(\) => \{ draftDrop\(dk\); onClose\(\); \}\}/);
});
test("확인 글 = 형 문장 그대로 · 단추 취소 · 닫기", () => {
  const s = rd("save-ask.tsx");
  assert.match(s, /작성 중인 내용이 사라집니다\. 창을 닫으시겠습니까\?/);
  assert.match(s, /export function CloseAsk/);
});
test("빈 판 = 묻지 않고 닫힘(useCloseGuard 가 dirty 아니면 바로 close)", () => {
  assert.match(rd("save-ask.tsx"), /if \(!dirty\) \{ close\(\); return; \}/);
});
