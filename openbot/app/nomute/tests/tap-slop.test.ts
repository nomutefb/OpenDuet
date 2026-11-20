// 손가락 화면에서 누르는 자리만 넓힘(형 11-21 「모바일도 체크해주고 모바일 버전」) — 규칙 = ../ui/tap-slop.css
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("손가락 화면에서만 · 보이는 값은 안 건드림(안 여백 + 같은 만큼 뺀 바깥 여백 · 안 보이는 덧판)", () => {
  const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  const css = rd("../ui/tap-slop.css"), main = rd("../main.tsx");
  assert.match(main, /import "\.\/ui\/tap-slop\.css";/);
  const body = css.slice(css.indexOf("@media (pointer: coarse)"));
  assert.ok(body.length > 50 && css.indexOf("@media (pointer: coarse)") > 0, "전부 손가락 화면 조건 안");
  assert.ok(!/\n\.[a-z]/.test(css.slice(0, css.indexOf("@media (pointer: coarse)"))), "조건 밖 규칙 0(마우스 화면은 그대로)");
  assert.match(body, /\.nm-kwb button\.q \{ padding-block:11px; margin-block:-11px; \}/, "키워드 줄 = 줄 키 38 그대로");
  assert.match(body, /\n  button\.nm-top-name\.nm-top-btn \{ padding-block:12px; margin-block:-12px; \}/, "방 이름 = 위아래만 · button 을 붙여 뒤 규칙(padding:0)을 이김");
  assert.ok(!/(color|font|background|border|width|height|opacity|transform)\s*:/.test(body.replace(/\/\*[\s\S]*?\*\//g, "")), "색 · 글자 · 크기 값은 안 바꿈");
  for (const sel of [".nm-bd-allbtn::after", ".lane-fold::after", ".nm-mask-b::after", ".nm-hotswap-t::after", ".nm-qr-btn::after"]) assert.ok(body.includes(sel), sel);
});
