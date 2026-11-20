// PC 반갈 첫 덮개 = 검정 새싹 대신 다른 화면과 같은 점 셋(형 11-20 09:11 dm-gik 깃 옮김 「그리고 처음에 키면 항상 저 메인화면 한쪽이 안드로이드 인앱화면처럼 검정으로 뜨는데 저거 저렇지 않고, 그냥 다른 화면처럼 로딩으로 뜨게해 점세개로」) · 폰 = 새싹 그대로
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("반갈 = 바탕 없는 덮개 + 점 셋(.nm-lazy) · 그동안 홈 칸 숨김 · 폰 = 새싹", () => {
  const s = readFileSync(new URL("../home/home-screen.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../home/home-scene.css", import.meta.url), "utf8");
  assert.match(s, /\{first && split \? <div className="nm-home-splash dots" aria-hidden><div className="nm-lazy"><i \/><i \/><i \/><\/div><\/div>/);
  assert.match(s, /: first \? <div className="nm-home-splash" aria-hidden style=\{intro\.bg \? \{ background: intro\.bg \} : undefined\}><IntroFace item=\{intro\} \/><\/div> : null\}/);
  assert.match(s, /className=\{`nm-home-grid\$\{first && split \? " dots-wait" : ""\} yeta-set/);
  assert.match(css, /\.nm-home-splash\.dots \{ background:none; \}/);
  assert.match(css, /html\[data-home-wait\] \.nm-home-grid\.dots-wait > :not\(\.nm-home-splash\) \{ visibility:hidden; \}/);
});
