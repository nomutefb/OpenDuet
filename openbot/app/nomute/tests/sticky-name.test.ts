// 긴 말풍선 = 좌상단 얼굴 · 이름 라벨 붙어 따라옴(형 11-16 20:39 「글 길어져도 좌상단에 프로필 라벨이랑 나오게 해줘」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("얼굴 · 이름 = position:sticky(스크롤 셈 0) · 1:1 100 · 단톡 52", () => {
  const c = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(c, /\.ychat \.ymsg \.yava \{ position:sticky; top:var\(--nm-stick\);/);
  assert.match(c, /\.ychat \.ymsg \.ycol > \.yname, \.ychat \.ymsg \.ycol > \.yname\.tab\.pm \{ position:sticky;/, "PM 이름도 sticky(relative 가 이기면 top 만 남아 글 위로 밀림)");
  assert.match(c, /:root:has\(header\.nm-head\.absolute \.nm-room-mark\) \.ychat \{ --nm-stick: 52px; \}/);
});
