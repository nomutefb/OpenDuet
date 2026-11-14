import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 형 11-14 21:51(깃 옮김) 「어 그리고 PM은 이름표에 빛지나가는 효과나게하셈」 · #-0001
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("PM 이름 알약만 빛줄기 · transform 만 · 움직임 줄이기 0", () => {
  assert.match(rd("../ui/name-label.tsx"), /yname tab\$\{pm \? " pm" : ""\}/);
  assert.match(rd("../ui/office-chat.tsx"), /pm=\{!!p\?\.pm\}/);
  const css = rd("../ui/yeta-chat.css");
  assert.match(css, /@keyframes ypmShine \{[^}]*transform:translateX/);
  assert.match(css, /prefers-reduced-motion:reduce\) \{ \.ychat \.ymsg \.yname\.tab\.pm::after \{ animation:none/);
});
