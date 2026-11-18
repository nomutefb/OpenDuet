// 홈 뉴스 덱 = 앱 안에서 직접 돎(형 11-19 00:45 「그거 다 지금 정원으로 제대로 이식해서 가져와」) — 옛 에디터 화면(iframe) · 실행 때 불러오던 파일에 다시 기대지 않게 지키는 시험
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { scopeTone } from "../home/deck/tone.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/ .*$/gm, "");   // 주석 뺀 글

test("홈 뉴스 덱: 옛 에디터 화면을 품지 않고(iframe 0) 옛 파일을 실행 때 안 부름", () => {
  const nf = code(rd("../home/news-feed.tsx")), sb = code(rd("../home/send-button.tsx")), nl = code(rd("../home/news-list.tsx"));
  for (const [name, s] of [["news-feed", nf], ["send-button", sb], ["news-list", nl]] as const) {
    assert.doesNotMatch(s, /<iframe|contentWindow|contentDocument/, name + " = 품은 화면 0");
    assert.doesNotMatch(s, /["'`]\/?modern-[a-z-]+\.(html|js|css)/, name + " = 옛 에디터 modern-* 파일 주소 0");
  }
  assert.match(nf, /mountDeck\(/); assert.match(nf, /modernDataNow/);
  assert.match(sb, /deck\.current\?\.post\("key", \{ action: "next" \}\)/);
});

test("홈 뉴스 덱: 옷 = 뿌리 · 화면 크기 단위 · 화면 폭 조건이 다 틀(그림자 뿌리 · 크기 그릇) 것으로 바뀌어 있음", () => {
  const gen = rd("../home/deck/deck.gen.ts");
  const css = gen.slice(gen.indexOf("export const DECK_CSS"), gen.indexOf("export const DECK_HTML")).replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(css.length > 30000, "옷이 들어 있음");
  assert.doesNotMatch(css, /(^|[\s,}])(:root|html|body)[\s,{.:[]/m, "뿌리 선택자 0");
  assert.doesNotMatch(css, /[\d.](svh|dvh|lvh|vh|vw|vmax|vmin)\b/, "화면 크기 단위 0");
  assert.doesNotMatch(css, /@media[^{]*(width|height|orientation)/, "화면 폭 · 높이 조건 0(틀 조건으로)");
  assert.doesNotMatch(css, /@font-face/, "글꼴은 앱 것");
  assert.match(css, /@container nd \(max-width:620px\)/); assert.match(css, /\.nd-html\{/); assert.match(css, /100cqh/);
  assert.match(gen, /export function runDeck\(window, document, G\) \{\n"use strict";/);
  assert.doesNotMatch(gen.slice(gen.indexOf("export function runDeck")), /[^.\w]innerWidth\b/, "맨이름 innerWidth 0(틀 폭으로)");
  for (const f of ["useanimations/icons.js", "useanimations/player.js", "morphicons/dom.js"]) assert.ok(existsSync(new URL("../home/deck/vendor/" + f, import.meta.url)), "딸린 묶음 " + f);
  assert.match(rd("../home/deck/modern-data.gen.ts"), /export function installModernData\(root\)/);
});

test("홈 뉴스 덱: 덧옷(앱 톤 · 홈 덧줄)의 뿌리 · 폭 조건 · svh 도 틀 것으로", () => {
  assert.equal(scopeTone(":root{--a:1}html,body{background:transparent!important}"), ".nd-html{--a:1}.nd-html,.nd-body{background:transparent!important}");
  assert.equal(scopeTone("@media (max-width:480px){.x{height:clamp(156px,34svh,330px)}}"), "@container nd (max-width:480px){.x{height:clamp(156px,34cqh,330px)}}");
  const nf = rd("../home/news-feed.tsx"), deck = nf.slice(nf.indexOf("const DECK = (dark: boolean) =>"), nf.indexOf("// 11-11 사진 높이"));
  const out = scopeTone(deck);
  assert.doesNotMatch(out, /:root|[\d.]svh|@media\s*\((max|min)-(width|height)/, "홈 덧줄에 틀 밖 것이 안 남음");
  assert.doesNotMatch(deck, /@media(?!\s*\((max|min)-(width|height):)/, "홈 덧줄의 화면 조건 = 폭 · 높이뿐(다른 꼴이 생기면 scopeTone 에 더할 것)");
});
