// 미디어 체크(사진 · 움짤 · 스티커 숫자 칸 위) = opacity 로 켬 · 11px(형 11-14 07:07 봄 옮김 「이 체크가 대화방 까지 이어지네 ㅠㅠ」 · 「크기 30% 줄여서 1이랑 수직을 맞추고 싶은거라」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("미디어 체크 = opacity 로 켬(숨긴 대화 칸 뚫지 않음) · 11px(형 11-14 07:07)", () => {
  const c = rd("../ui/yeta-chat.css");
  assert.match(c, /\.ychat \.yb-st \.yb-ck \{ display:block; opacity:0; pointer-events:none; width:11px; height:11px;/);
  assert.doesNotMatch(c, /\.yb-ck \{ visibility:visible; \}/);
});
