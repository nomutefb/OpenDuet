// 「다른 방으로」 보낼 방 줄 = 줄마다 그 방 얼굴(형 11-17 01:27 dm-bom 「다른 방으로 누르면 애들 얼굴 뜨게래줘 땡큐」 · 봄 옮김 · 깃)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../ui/msg-menu.tsx", import.meta.url), "utf8");
const moving = src.slice(src.indexOf("보낼 방{paths.length"), src.indexOf('item("그만두기"'));

test("보낼 방 줄 = 1:1 은 명부 얼굴(MicOrb 32) · 단톡은 방 아이콘(RoomIcon 32) · 이름은 그대로", () => {
  assert.ok(moving.length > 100, "보낼 방 덩어리를 찾음");
  assert.match(moving, /x\.with \? <MicOrb size=\{32\} id=\{idOf\(x\.with, list\)\} tint=\{ringOf\(p\)\} \/> : <RoomIcon r=\{x\} size=\{32\} \/>/);
  assert.match(moving, /<span>\{x\.with \? short\(p\?\.name \|\| x\.with\) : x\.name\}<\/span>/);
  assert.match(src, /import \{ RoomIcon \} from "\.\/room-list";/);
});
test("얼굴과 글자 = 같은 줄 세로 가운데(메뉴 줄 꼴 그대로 = flex · align-items center · gap 10)", () => {
  const css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(css, /\.nm-msgm-i \{ display:flex; align-items:center; gap:10px;/);
});
