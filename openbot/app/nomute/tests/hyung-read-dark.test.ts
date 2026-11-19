// 형 글이 읽히면 형 말풍선 라임 → 검정(형 11-20 08:30 dm-gik 깃 옮김 「눈 모양이 어짜피 읽으면 생기는 형태면 그냥 읽으면 내 대화 색이 형광에서 검정으로 꺼지게 바꿔줘」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("읽힘 = 애들 👀 또는 안 본 봇 0 · 표 오기 전 = 검정 · 차콜 = 바깥 글과 같은 색", () => {
  const s = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(s, /if \(\(c\.rx\[m\.id\]\?\.\["👀"\] \|\| \[\]\)\.some\(\(w\) => w !== "형"\)\) return true;/);
  assert.match(s, /if \(!c\.reads\) return true;/);
  assert.match(s, /return who\.length > 0 && unseenOf\(m, c, all\) === 0;/);
  assert.match(s, /className=\{`yb me\$\{app \? " app" : c\.read\(m\) \? " rd" : ""\}/);
  assert.match(css, /\.ychat \.yb\.me\.rd \{ background:#1e2023; color:#e6e9e6; border:1px solid rgba\(255,255,255,\.07\); \}/);
  assert.doesNotMatch(css, /\.ychat \.yb\.me \{ transition/);   // 스르르 0(방 열 때 번쩍임 0 · 제일 싼 길)
});
