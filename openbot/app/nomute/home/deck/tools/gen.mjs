// 홈 뉴스 덱 떼어 오기 — 옛 에디터 `viewer/modern-home.html`(판) · 거기 딸린 CSS 열한 장(옷) · 스크립트 여덟(엔진)과 `modern-data.js`(카드 재료 셈)를 앱 코드로 바꿔 낸다
//   형 11-19 00:4x 「그거 다 지금 정원으로 제대로 이식해서 가져와」 — 전엔 홈이 /modern-home.html 을 iframe 으로 품고 /modern-data.js 를 실행 때 불러 왔다(옛 에디터 파일에 기댐).
//   길 = 썸네일 제작기(ui/thumb-maker) · 채널 탭(ui/old-tabs)과 같음: 원본 줄 그대로 · 문서와 창만 「이 화면 틀」로 바꿔 끼움. 덱은 제 문서 한 장을 통째로 쓰던 화면이라 틀 = 그림자 뿌리(../index.ts).
//   만드는 것 = ../deck.gen.ts(DECK_CSS · DECK_HTML · runDeck) · ../modern-data.gen.ts(installModernData)
//   쓰는 법 = 앱 폴더(openbot/app/nomute)에서: node home/deck/tools/gen.mjs <에디터 저장소의 viewer 폴더>
//   옷 바꾸는 규칙(원본 뜻 그대로):
//     · 뿌리: `:root` · `html` → `.nd-html` / `body` → `.nd-body`(그림자 뿌리 안 두 겹 = 원본 html · body 자리)
//     · 화면 크기 단위: svh · dvh · lvh · vh → cqh / vw → cqw / vmax → cqmax / vmin → cqmin(틀 = 크기 그릇 · 옛 iframe 창 크기와 같은 뜻)
//     · 화면 폭 · 높이 조건(@media) → 틀 크기 조건(@container nd) · 손가락 · 움직임 줄이기 같은 기기 조건은 @media 그대로(아래 MEDIA 표 — 표에 없는 조건이 원본에 생기면 멈춤)
//     · @font-face 는 안 가져옴(앱이 같은 글꼴 이름으로 이미 올림 · ui/font-all.css)
//   엔진 바꾸는 것 = 맨이름 innerWidth → window.innerWidth 하나(그 밖 = 감싼 함수의 문서 · 창 · 타이머 이름이 가림 · ../index.ts)
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname), APP = path.resolve(HERE, "../../..");
const req = createRequire(APP + "/package.json");
const postcss = req("postcss"), sp = req("postcss-selector-parser");
const { parse } = req("@babel/parser"), traverse = req("@babel/traverse").default;

const V = process.argv[2];
if (!V || !fs.existsSync(path.join(V, "modern-home.html"))) { console.error("쓰는 법: node home/deck/tools/gen.mjs <에디터 저장소의 viewer 폴더>"); process.exit(1); }
const read = (f) => fs.readFileSync(path.join(V, f), "utf8");
const html = read("modern-home.html");
const CSS = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
const JS = [...html.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map((m) => m[1]);
if (CSS.length < 5 || JS.length < 5) { console.error("판(modern-home.html)의 꼴이 바뀜 — 옷 " + CSS.length + " · 스크립트 " + JS.length); process.exit(1); }

// ── 옷 ──
/** 화면 조건 → [기기 조건(@media · 없으면 "") , 틀 크기 조건(@container · 없으면 "")] 의 묶음들(여러 묶음 = 「또는」) */
const MEDIA = {
  "(max-width:620px)": [["", "(max-width:620px)"]],
  "(max-width:480px)": [["", "(max-width:480px)"]],
  "(max-height:720px)": [["", "(max-height:720px)"]],
  "(orientation:landscape) and (max-height:500px)": [["", "(orientation:landscape) and (max-height:500px)"]],
  "(max-width:620px),(orientation:landscape) and (max-height:500px)": [["", "(max-width:620px) or ((orientation:landscape) and (max-height:500px))"]],
  "(min-width:621px) and (hover:hover) and (pointer:fine)": [["(hover:hover) and (pointer:fine)", "(min-width:621px)"]],
  "not all and (min-width:621px) and (hover:hover) and (pointer:fine)": [["", "not (min-width:621px)"], ["not ((hover:hover) and (pointer:fine))", "(min-width:621px)"]],   // 「아님(넓음 그리고 마우스)」 = 좁음 또는 (넓음 그리고 마우스 아님)
  "(prefers-reduced-motion:reduce)": null, "(hover:hover)": null, "(prefers-reduced-motion:reduce),(forced-colors:active)": null,   // 기기 조건뿐 = 그대로
};
const norm = (p) => p.replace(/\s*([:,()])\s*/g, "$1").replace(/\)and\(/g, ") and (").replace(/\ball and\(/g, "all and (").replace(/\s+/g, " ").trim();
const unit = (v) => v.replace(/(\d|\.)(svh|dvh|lvh|vh)\b/g, "$1cqh").replace(/(\d|\.)(svw|dvw|lvw|vw)\b/g, "$1cqw").replace(/(\d|\.)vmax\b/g, "$1cqmax").replace(/(\d|\.)vmin\b/g, "$1cqmin");
const rootSel = sp((sel) => {
  sel.walk((n) => {
    if (n.type === "pseudo" && n.value === ":root") n.replaceWith(sp.className({ value: "nd-html" }));
    else if (n.type === "tag" && n.value === "html") n.replaceWith(sp.className({ value: "nd-html" }));
    else if (n.type === "tag" && n.value === "body") n.replaceWith(sp.className({ value: "nd-body" }));
  });
});
let cssOut = "";
for (const f of CSS) {
  const rootNode = postcss.parse(read(f), { from: f });
  rootNode.walkAtRules("font-face", (r) => r.remove());
  rootNode.walkRules((r) => { if (r.parent?.type === "atrule" && /keyframes$/.test(r.parent.name)) return; r.selector = rootSel.processSync(r.selector); });
  rootNode.walkDecls((d) => { d.value = unit(d.value); });
  rootNode.walkAtRules("media", (r) => {
    const key = norm(r.params);
    if (!(key in MEDIA)) { console.error("모르는 화면 조건(" + f + "): @media " + r.params + " → 정규화 「" + key + "」 — gen.mjs MEDIA 표에 더할 것"); process.exit(1); }
    const packs = MEDIA[key];
    if (!packs) return;
    const made = packs.map(([dev, box]) => {
      const inner = postcss.atRule({ name: "container", params: "nd " + box });
      r.nodes.forEach((n) => inner.append(n.clone()));
      if (!dev) return inner;
      const outer = postcss.atRule({ name: "media", params: dev });
      outer.append(inner);
      return outer;
    });
    r.replaceWith(made);
  });
  cssOut += "/* " + f + " */\n" + rootNode.toString().trim() + "\n";
}
const left = cssOut.replace(/\/\*[\s\S]*?\*\//g, "").match(/[\d.](?:svh|dvh|lvh|vh|vw|vmax|vmin)\b|(?:^|[\s,}])(?::root|html|body)[\s,{.:\[]/m);
if (left) { console.error("옷에 안 바뀐 뿌리 · 화면 단위가 남음: " + left[0]); process.exit(1); }

// ── 판 ──
const body = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<!--[\s\S]*?-->/g, "").replace(/\n\s*\n/g, "\n").trim();

// ── 엔진 ──
const src = JS.map((f) => "/* ── " + f + " ── */\n" + read(f)).join("\n;\n");
const ast = parse(src, { sourceType: "script" });
const free = new Map(), spots = [];
traverse(ast, {
  ReferencedIdentifier(p) { const n = p.node.name; if (p.scope.hasBinding(n)) return; free.set(n, (free.get(n) || 0) + 1); if (n === "innerWidth" || n === "innerHeight") spots.push([p.node.start, p.node.end, "window." + n]); },
});
let code = src;
for (const [a, b, t] of spots.sort((x, y) => y[0] - x[0])) code = code.slice(0, a) + t + code.slice(b);
// 실행 때 불러오는 딸린 묶음(import('./vendor/…') = 누름 재생 아이콘 · 모양 바뀌는 아이콘) = 옛 에디터 것을 ../vendor/ 에 그대로 옮겨 둠(주소는 원본 그대로 = 이 파일 옆)
//   앱의 vendor/useanimations 와 이름은 같아도 아이콘 묶음이 다르다(앱 = 설정 줄 12개 · 에디터 = 21개) → 섞지 않고 덱 것은 덱 폴더에
const vend = [...new Set([...code.matchAll(/import\('\.\/vendor\/([^']+)'\)/g)].map((m) => m[1]))];
for (const rel of vend) {
  const dir = path.dirname(rel);
  for (const f of fs.readdirSync(path.join(V, "vendor", dir))) {
    const from = path.join(V, "vendor", dir, f), to = path.join(HERE, "../vendor", dir, f);
    if (!fs.statSync(from).isFile()) continue;
    if (fs.existsSync(to) && fs.readFileSync(to).equals(fs.readFileSync(from))) continue;
    fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); console.log("딸린 묶음 옮김: home/deck/vendor/" + dir + "/" + f);
  }
}
/** 감싼 함수가 가리는 맨이름(틀 것으로 바꿔 끼움 · ../index.ts 의 G) · 그 밖 맨이름은 브라우저 것 그대로 */
const SHADOW = ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "addEventListener", "removeEventListener", "ResizeObserver", "MutationObserver", "IntersectionObserver", "fetch", "parent", "scrollX", "scrollY"];
const KNOWN = new Set([...SHADOW, "window", "document", "innerWidth", "innerHeight", "AbortController", "console", "Element", "Event", "getComputedStyle", "location", "matchMedia", "module", "performance", "queueMicrotask", "URL", "ModernGallery", "ModernScoreScale", "Intl", "Math", "Number", "Object", "Array", "String", "Date", "JSON", "Map", "Set", "WeakMap", "WeakSet", "Promise", "Symbol", "Error", "TypeError", "RegExp", "Boolean", "parseFloat", "parseInt", "isFinite", "isNaN", "undefined", "NaN", "Infinity", "CSS", "DOMParser", "Node", "HTMLElement", "SVGElement", "Image", "navigator", "structuredClone", "encodeURIComponent", "decodeURIComponent", "Reflect", "globalThis", "Proxy", "Path2D", "DOMMatrix", "DOMRect", "CustomEvent", "KeyboardEvent", "PointerEvent", "AbortSignal", "TextEncoder", "requestAnimationFrame", "getSelection", "devicePixelRatio", "history", "screen", "visualViewport", "localStorage", "sessionStorage", "Float32Array", "Float64Array", "Uint8Array", "Int32Array", "ArrayBuffer", "BigInt", "arguments"]);
const unknown = [...free.keys()].filter((n) => !KNOWN.has(n));
if (unknown.length) { console.error("엔진이 쓰는 모르는 맨이름: " + unknown.join(", ") + " — 브라우저 것이면 gen.mjs KNOWN 에, 틀 것으로 가려야 하면 SHADOW 에"); process.exit(1); }

// 덱이 쓰지만 스스로 안 정하는 변수 = 원본(제 문서)에선 「없음」이었다 → 앱 것이 같은 이름으로 물려 들어오지 않게 틀에서 비움(../index.ts BASE)
const bare = cssOut.replace(/\/\*[\s\S]*?\*\//g, "");
const usedVars = new Set([...(bare + code).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
const madeVars = new Set([...bare.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const unset = [...usedVars].filter((v) => !madeVars.has(v)).sort();

const HEAD = "// @ts-nocheck\n/* 만든 파일 — 손으로 고치지 말 것(home/deck/tools/gen.mjs · 옛 에디터 viewer 의 홈 뉴스 덱 그대로)\n   원본 = modern-home.html + " + CSS.join(" · ") + " + " + JS.join(" · ") + " */\n";
const lit = (s) => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
fs.writeFileSync(path.join(HERE, "../deck.gen.ts"), HEAD
  + "export const DECK_CSS = " + lit(cssOut) + ";\n"
  + "export const DECK_HTML = " + lit(body) + ";\n"
  + "/** 덱이 쓰지만 스스로 안 정하는 변수(원본에선 없음) — 틀에서 비울 이름들 */\nexport const DECK_UNSET = " + JSON.stringify(unset) + ";\n"

  + "/** 엔진 = 원본 스크립트를 한 몸으로(원본도 한 문서의 한 전역을 같이 씀) · window · document = 틀이 주는 것 · G = 가릴 맨이름들 */\n"
  + "export function runDeck(window, document, G) {\n\"use strict\";\nconst { " + SHADOW.join(", ") + " } = G;\n" + code + "\n}\n");

const md = read("modern-data.js"), tail = "})(typeof window === 'undefined' ? globalThis : window);";
if (!md.trimEnd().endsWith(tail)) { console.error("modern-data.js 끝 꼴이 바뀜"); process.exit(1); }
fs.writeFileSync(path.join(HERE, "../modern-data.gen.ts"), "// @ts-nocheck\n/* 만든 파일 — 손으로 고치지 말 것(home/deck/tools/gen.mjs · 옛 에디터 viewer/modern-data.js 그대로 · 끝의 붙일 자리만 인자로) */\nexport function installModernData(root) {\n"
  + md.trimEnd().slice(0, -tail.length) + "})(root);\n  return root.ModernData;\n}\n");
console.log("틀에서 비울 변수: " + unset.join(" "));
console.log("옷 " + CSS.length + "장 " + cssOut.length + "자 · 판 " + body.length + "자 · 엔진 " + JS.length + "개 " + code.length + "자(맨이름 바꿈 " + spots.length + ") · modern-data " + md.length + "자");
