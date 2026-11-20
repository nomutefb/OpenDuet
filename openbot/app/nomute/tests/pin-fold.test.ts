// 대화방 위 공지 띠 = 아무 데나 한 번 접기 · 접힌 한 줄 아무 데나 한 번 펴기(형 11-21 05:39 dm-bom 봄 옮김 「글구 상단에 공지하면 접기가 어려운데 쉽게 좀 해줘」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("띠 하나 · 누름 = 접기/펴기 · 이력 = 펼친 띠 오른쪽 시계 · 접힘 = 한 줄(핀 동그라미 0)", () => {
  const ui = rd("../ui/pins.tsx"), css = rd("../ui/pins.css");
  assert.match(ui, /<div className=\{`nm-pinbar\$\{folded \? " fold" : ""\}`\} role="region" aria-label="공지">/);
  assert.match(ui, /className="nm-pinbar-main" aria-expanded=\{!folded\} aria-label=\{`공지 \$\{folded \? "펼치기" : "접기"\} — /);
  assert.match(ui, /onClick=\{toggle\}>/);
  assert.match(ui, /\{folded \? null : <small>/);   // 접힘 = 한 줄
  assert.match(ui, /\{folded \? null : <button type="button" className="nm-pinbar-hist" aria-label="공지 이력 보기"/);
  assert.doesNotMatch(ui, /nm-pin-mini|nm-pinbar-fold/);
  assert.match(css, /\.nm-pinbar\.fold \.nm-pinbar-chev \{ transform:rotate\(90deg\); \}/);
  assert.match(css, /@keyframes nmPinLine \{ from \{ opacity:0; transform:translateY\(-3px\); \} \}/);   // 움직임 = transform · opacity 만
});
