import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// #-0005 · 형 11-14 22:21(깃 옮김) 「그리고 클로드 이렇게 빛나는거 없애고 그냥 불로 해줭. 그리고 애들 이름은 항상 볼드로 나오게해줘」
const css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
test("「클로드」 무지개 0 · 이름 늘 볼드", () => {
  assert.doesNotMatch(css, /#ff6fb5, #0ffd02/);
  assert.match(css, /\.ychat \.yname-c \{ color:#0891b2; font-weight:700; \}/);
});
