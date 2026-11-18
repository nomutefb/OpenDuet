// 이름 알약 표지 = 사파리 엔진에서만 작게(그 엔진이 작은 이모지를 1.4배로 그림) — 형 11-19 08:04 「라벨 틀어진다 입모지가」 「다른애들도 그러나봐봐」
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
test("이름 알약 표지: 웹킷 가름(@supports font:-apple-system-body) 안에서만 크기를 낮춤 · 기본 꼴(.95em)은 그대로", () => {
  const css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(css, /@supports \(font:-apple-system-body\) \{ \.ychat \.ymsg \.yname \.ymark \{ font-size:\.72em; \} \}/);
  assert.match(css, /\.ymark, \.nm-rmark \{[^}]*font-size:\.95em/);
});
