// 폰 = 미디어 게이지를 미디어 밑 가로 한 줄로(형 11-13 22:15 「영상 0% 랑 프리임 0% 부분 이 잘린다」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("폰(640 밑) = 게이지 position static · 미디어 밑(order 2) · 가로 · ✓ 는 그대로", () => {
  const css = readFileSync(new URL("../ui/attachment-up.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*\.nm-encrow > \.nm-encg:not\(\.ok\) \{ position:static; order:2; flex-direction:row;/);
});
