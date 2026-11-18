// 옛 에디터 화면 떼어 오기 — `viewer/edit.html` · `sb.html` · `ys.html` · `song.html`(판 + 딸린 옷 + 스크립트)을 앱 코드로 바꿔 낸다
//   형 11-19 00:45 「그거 다 지금 정원으로 제대로 이식해서 가져와」 — 전엔 영상 편집(ui/video-editor.tsx)이 이 넷을 iframe 으로 품었다(옛 에디터 파일에 기댐).
//   길 = 홈 뉴스 덱(home/deck/tools/gen.mjs)과 같음: 원본 코드를 사람이 안 고치고 기계가 정해진 규칙으로만 바꿈 · 문서와 창은 「이 화면 틀」(../frame.ts)이 준다.
//   만드는 것 = public/old-pages/ 의 정적 모듈(css.<지문>.js = 같이 쓰는 옷 · lib.<지문>.js = 같이 쓰는 스크립트 · <화면>.<지문>.js = 판 · 그 화면만의 옷 · 스크립트 차례) + ../manifest.gen.ts(파일 이름표)
//     앱 묶음(rollup) 밖에 둠 = 빌드가 이 글(1MB)을 읽고 다듬느라 메모리를 안 씀 — 묶음 안에 넣은 첫 판은 배포 빌드가 메모리 한도(2GB)를 넘겨 죽었다(11-19 02:06 pages-direct 44354916032)
//     이름에 내용 지문 = 내용이 바뀔 때만 새 주소(캐시가 스스로 맞음) · 받는 손 = ../load.ts(고를 때 실행 중에 받음 · 옛 iframe 도 고를 때 읽었다)
//   쓰는 법 = 앱 폴더(openbot/app/nomute)에서: node ui/old-pages/tools/gen.mjs <에디터 저장소의 viewer 폴더>
//   원본 자리 = 에디터 저장소(nomutefb/editor) 깃 꼬리표 old-editor-final — 옛 화면은 11-19 에 main 에서 지웠다(형 「옛 에디터 걷고 지워버려」 · 「너가 직접 이식완료하고 없야」).
//     꺼내는 법: git -C <에디터 사본> worktree add /tmp/old-editor old-editor-final → 위 명령에 /tmp/old-editor/viewer 를 줌(다 쓰면 git worktree remove /tmp/old-editor).
//     화면을 고칠 일이 생기면 그 원본을 이 폴더 src/ 로 들여와 여기서 고치고 다시 뽑는 것이 맞다(지금은 꼬리표가 원본).
//   옷 규칙(원본 뜻 그대로):
//     · 뿌리: `html` → `nd-html` · `body` → `nd-body`(꼬리표 이름 = 고르개 점수 그대로) · `:root` → `.nd-root`
//     · 화면 크기 단위(vh · svh · vw …) → 틀 크기 단위(cqh · cqw) · 화면 폭 · 높이 조건(@media) → 틀 크기 조건(@container nd) · 기기 조건(손가락 · 움직임 줄이기)은 @media 그대로
//     · @font-face = 문서에 한 번 올릴 글로 따로 뺌(그림자 뿌리 안에서는 안 먹음) · url(상대 주소) → 뿌리 기준
//   스크립트 규칙:
//     · 스크립트 하나 = 함수 하나(window · document = 틀 것). 그 스크립트 안에서 안 정한 맨이름(fetch · setTimeout · 다른 스크립트가 정한 nmRail …) → `window.이름`
//     · 맨 위에 정한 이름(function · var · let · const) → 틀의 창 서랍에 내놓음(__nm.ex) = 원본에서 스크립트끼리 · 부모가 window.이름 으로 부르던 것
//     · 자리 읽기: x.getBoundingClientRect() → __nm.rect(x) · e.clientX → __nm.cx(e)(틀 왼쪽 위 기준 = 옛 iframe 창 기준)
//     · 주소 넣기: x.src = v · x.href = v → __nm.u(v) · x.innerHTML = s · insertAdjacentHTML → __nm.h(s)(상대 주소를 뿌리 기준으로)
//     · 글자로 짠 HTML 속 on…="함수(…)" 가 부르는 맨 위 함수(그림 못 받을 때 tkImgFb) → 앱 창에도 내놓음(__nm.leak · 그런 속성은 창에서 이름을 찾는다)
//     · import('./vendor/…') = public/old-pages/vendor/ 로 옮겨 둔 같은 파일(옛 에디터 것 그대로 · 주소는 원본 그대로 = 모듈 옆)
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const HERE = path.dirname(new URL(import.meta.url).pathname), OUT = path.resolve(HERE, ".."), APP = path.resolve(HERE, "../../.."), PUB = path.resolve(APP, "public/old-pages");
const req = createRequire(APP + "/package.json");
const postcss = req("postcss"), sp = req("postcss-selector-parser");
const { parse } = req("@babel/parser"), traverse = req("@babel/traverse").default, generate = req("@babel/generator").default, t = req("@babel/types");
const esbuild = req("esbuild");

const V = process.argv[2];
// track.html(트래킹) = 안 옮김: 앱 메뉴에서 걷혔고(형 11-18 「다 지움(의류수거함)」) 편집 화면의 넘김 단추(#xtrGo)는 원본에서 늘 숨겨져 있어 닿는 길이 없다
const PAGES = [["edit", "edit.html"], ["sb", "sb.html"], ["ys", "ys.html"], ["song", "song.html"]];
if (!V || !fs.existsSync(path.join(V, "edit.html"))) { console.error("쓰는 법: node ui/old-pages/tools/gen.mjs <에디터 저장소의 viewer 폴더>"); process.exit(1); }
/** 앱 안에서는 안 도는 스크립트 = 그 갈래만 남긴 글로 갈음(원본 파일을 다 옮기지 않음)
 *  nm-scene.js(3D 바탕) = 품은 쪽이 끈 화면(data-nm-scene="off")이면 표시만 하고 끝남 → 그 갈래 그대로 · nm-wave.js(물결 바탕 엔진) = 그 장면만 부름 → 안 옮김 */
const STUB = {
  "nm-scene.js": "(function () { if (window.NMScene) return; var root = document.documentElement; var canvas = document.getElementById('wavebg'); if (canvas) canvas.classList.add('off'); root.classList.remove('nm-scene-ready'); root.dataset.nmScene = 'inherited'; window.NMScene = Object.freeze({version: '1', owner: 'host'}); })();",
  "nm-wave.js": "",
};
const read = (f) => fs.readFileSync(path.join(V, f.split("?")[0]), "utf8");
const die = (m) => { console.error(m); process.exit(1); };
const VENDOR = path.resolve(PUB, "vendor");

// ── 옷 ──
const SIZE_F = /^\(\s*(?:(?:min-|max-)?(?:width|height|aspect-ratio)\s*:|orientation\s*:)|^\([^)]*\b(?:width|height)\s*[<>]=?/;
/** @media 조건 한 줄 → [기기 조건, 틀 크기 조건] 묶음들(쉼표 = 또는) · null = 기기 조건뿐(그대로 둠) */
function mediaPacks(params, from) {
  const packs = [];
  let anyBox = false;
  for (const q0 of params.split(",")) {
    let q = q0.trim().replace(/^only\s+/, "");
    if (/^not\b/.test(q) || /\bprint\b/.test(q)) { if (/\b(?:width|height|orientation|aspect-ratio)\b/.test(q)) die("못 바꾸는 화면 조건(" + from + "): @media " + params + " — gen.mjs mediaPacks 에 규칙을 더할 것"); packs.push([q, ""]); continue; }
    q = q.replace(/^(?:screen|all)\s+and\s+/, "").replace(/^(?:screen|all)$/, "");
    const parts = q ? q.split(/\s+and\s+/) : [], dev = [], box = [];
    for (const p of parts) { if (!/^\(.*\)$/.test(p)) die("모르는 화면 조건 조각(" + from + "): " + p + " ← @media " + params); (SIZE_F.test(p) ? box : dev).push(p); }
    if (box.length) anyBox = true;
    packs.push([dev.join(" and "), box.join(" and ")]);
  }
  return anyBox ? packs : null;
}
const unit = (v) => v.replace(/(\d|\.)(?:svh|dvh|lvh|vh)\b/g, "$1cqh").replace(/(\d|\.)(?:svw|dvw|lvw|vw)\b/g, "$1cqw").replace(/(\d|\.)vmax\b/g, "$1cqmax").replace(/(\d|\.)vmin\b/g, "$1cqmin");
const absUrl = (v) => v.replace(/url\(\s*(["']?)(?![a-z][a-z0-9+.-]*:|\/|#)([^)"']+)\1\s*\)/gi, (_m, q, u) => "url(" + q + "/" + u.replace(/^\.\//, "") + q + ")");
const rootSel = sp((sel) => {
  sel.walk((n) => {
    if (n.type === "pseudo" && n.value === ":root") n.replaceWith(sp.className({ value: "nd-root" }));
    else if (n.type === "tag" && n.value === "html") n.value = "nd-html";
    else if (n.type === "tag" && n.value === "body") n.value = "nd-body";
    else if (n.type === "tag" && n.value === "head") n.value = "nd-head";
  });
});
const fonts = new Set();
function cssFix(text, from) {
  const rootNode = postcss.parse(text.replace(/\/\*[\s\S]*?\*\//g, ""), { from });   // 주석은 안 옮김(값 사이에 낀 주석까지)
  rootNode.walkAtRules("font-face", (r) => { r.walkDecls((d) => { d.value = absUrl(d.value); }); fonts.add(r.toString().replace(/\s+/g, " ")); r.remove(); });
  rootNode.walkAtRules(/^(import|property)$/, (r) => die("못 옮기는 규칙(" + from + "): @" + r.name + " " + r.params));
  rootNode.walkRules((r) => { if (r.parent?.type === "atrule" && /keyframes$/.test(r.parent.name)) return; r.selector = rootSel.processSync(r.selector); });
  rootNode.walkDecls((d) => {
    if (/\d(?:\.\d+)?rem\b/.test(d.value)) die("rem 단위(" + from + "): " + d.prop + ":" + d.value + " — 앱 뿌리 글자 크기를 따르게 됨 · 규칙을 더할 것");
    d.value = absUrl(unit(d.value));
  });
  rootNode.walkAtRules("media", (r) => {
    const packs = mediaPacks(r.params, from);
    if (!packs) return;
    r.replaceWith(packs.map(([dev, box]) => {
      const kids = () => r.nodes.map((n) => n.clone());
      if (!box) { const m = postcss.atRule({ name: "media", params: dev }); m.append(kids()); return m; }
      const inner = postcss.atRule({ name: "container", params: "nd " + box }); inner.append(kids());
      if (!dev) return inner;
      const outer = postcss.atRule({ name: "media", params: dev }); outer.append(inner); return outer;
    }));
  });
  rootNode.walkRules((r) => { if (r.parent?.type === "atrule" && /keyframes$/.test(r.parent.name)) return; if (/(^|[\s,>+~(])(?:html|body)(?=[\s,.:#\[>+~)]|$)|:root\b/.test(r.selector)) die("옷에 안 바뀐 뿌리 고르개(" + from + "): " + r.selector); });
  rootNode.walkDecls((d) => { if (/[\d.](?:svh|dvh|lvh|vh|vw|vmax|vmin)\b/.test(d.value)) die("옷에 안 바뀐 화면 단위(" + from + "): " + d.prop + ":" + d.value); });
  return rootNode.toString().replace(/\n\s*\n/g, "\n").trim();
}

// ── 스크립트 ──
const COORD = Object.assign(Object.create(null), { clientX: "cx", clientY: "cy", pageX: "px", pageY: "py" });
const URL_PROP = new Set(["src", "href", "poster"]), HTML_PROP = new Set(["innerHTML", "outerHTML"]);
const nmCall = (fn, arg) => t.callExpression(t.memberExpression(t.identifier("__nm"), t.identifier(fn)), [arg]);
const vendorSeen = new Set();
function jsFix(code, name, isModule) {
  const ast = parse(code, { sourceType: isModule ? "module" : "script" });
  const tops = [], called = new Set();
  let topAwait = false;
  const onAttr = (s) => { for (const m of s.matchAll(/\bon[a-z]+=\\?["']\s*([A-Za-z_$][\w$]*)\(/g)) called.add(m[1]); };
  traverse(ast, {
    Program(p) {
      if (isModule) return;
      for (const [k, b] of Object.entries(p.scope.bindings)) tops.push([k, b.kind === "const" || b.path.isClassDeclaration() ? 0 : 1, b.kind === "hoisted" || b.kind === "var"]);
    },
    AwaitExpression(p) { if (!p.getFunctionParent()) topAwait = true; },
    ImportDeclaration() { die("정적 import(" + name + ") — 규칙 없음"); },
    WithStatement() { die("with(" + name + ") — 못 옮김"); },
    StringLiteral(p) { if (/\d(?:svh|dvh|lvh|vh|vw)\b/.test(p.node.value)) die("글자 속 화면 단위(" + name + "): " + p.node.value.slice(0, 60)); onAttr(p.node.value); },
    TemplateElement(p) { if (/\d(?:svh|dvh|lvh|vh|vw)\b/.test(p.node.value.raw)) die("글자 속 화면 단위(" + name + "): " + p.node.value.raw.slice(0, 60)); onAttr(p.node.value.raw); },
    ObjectPattern(p) { for (const x of p.node.properties) if (x.key && COORD[x.key.name]) die("자리 값을 풀어 받음(" + name + ":" + p.node.loc.start.line + ") — 규칙 없음"); },
    Import(p) {
      const call = p.parentPath.node, a = call.arguments[0];
      if (!t.isStringLiteral(a) || !a.value.startsWith("./vendor/")) die("못 옮기는 import(" + name + "): " + code.slice(call.start, call.end).slice(0, 80));
      vendorSeen.add(a.value.slice(9));   // 주소는 그대로(모듈 옆 ./vendor/…) · 파일만 옮김(copyVendor)
    },
    "CallExpression|OptionalCallExpression": { exit(p) {
      const n = p.node, c = n.callee;
      if ((t.isMemberExpression(c) || t.isOptionalMemberExpression(c)) && !c.computed && t.isIdentifier(c.property)) {
        const pn = c.property.name;
        if ((pn === "getBoundingClientRect" || pn === "getClientRects") && n.arguments.length === 0) { p.replaceWith(nmCall(pn === "getBoundingClientRect" ? "rect" : "rects", c.object)); p.skip(); return; }
        if (pn === "insertAdjacentHTML" && n.arguments.length === 2) n.arguments[1] = nmCall("h", n.arguments[1]);
        if (pn === "setAttribute" && n.arguments.length === 2 && t.isStringLiteral(n.arguments[0]) && URL_PROP.has(n.arguments[0].value)) n.arguments[1] = nmCall("u", n.arguments[1]);
      }
    } },
    NewExpression: { exit(p) { const n = p.node; if (t.isIdentifier(n.callee, { name: "Audio" }) && n.arguments.length === 1 && !p.scope.hasBinding("Audio")) n.arguments[0] = nmCall("u", n.arguments[0]); } },
    AssignmentExpression: { exit(p) {
      const l = p.node.left;
      if (!t.isMemberExpression(l) || l.computed || !t.isIdentifier(l.property)) return;
      if (p.node.operator === "=" && URL_PROP.has(l.property.name)) p.node.right = nmCall("u", p.node.right);
      else if ((p.node.operator === "=" || p.node.operator === "+=") && HTML_PROP.has(l.property.name)) p.node.right = nmCall("h", p.node.right);
    } },
    "MemberExpression|OptionalMemberExpression": { exit(p) {
      const n = p.node;
      if (n.computed || !t.isIdentifier(n.property) || !COORD[n.property.name]) return;
      const pp = p.parentPath;
      if ((pp.isAssignmentExpression() && pp.node.left === n) || pp.isUpdateExpression() || (pp.isUnaryExpression({ operator: "delete" }))) die("자리 값에 넣음(" + name + ":" + n.loc.start.line + ") — 규칙 없음");
      p.replaceWith(nmCall(COORD[n.property.name], n.object)); p.skip();
    } },
  });
  // 맨이름 → window.이름(위 바꿈이 끝난 나무에서 · 범위는 다시 셈)
  traverse(ast, {
    Program(p) { p.scope.crawl(); },
    Identifier(p) {
      const n = p.node.name;
      if (n === "window" || n === "document" || n === "__nm" || n === "undefined" || n === "arguments") return;
      const pp = p.parentPath;
      const ref = p.isReferencedIdentifier() || (pp.isAssignmentExpression() && pp.node.left === p.node) || (pp.isUpdateExpression() && pp.node.argument === p.node) || (pp.isForXStatement() && pp.node.left === p.node);
      if (!ref || p.scope.hasBinding(n)) return;
      if (pp.isObjectProperty({ shorthand: true }) && pp.node.value === p.node) pp.node.shorthand = false;
      p.replaceWith(t.memberExpression(t.identifier("window"), t.identifier(n))); p.skip();
    },
  });
  let out = generate(ast, { comments: false, compact: false, jsescOption: { minimal: true } }).code;
  if (/\bimport\(/.test(out) && !out.includes("/* @vite-ignore */")) { /* 주소가 글자로 박힌 import 만 남음(위에서 걸렀다) */ }
  const leak = [...called].filter((k) => tops.some(([n]) => n === k));
  const lost = [...called].filter((k) => !leak.includes(k));
  if (lost.length) die("on… 속성이 부르는 함수를 이 스크립트 맨 위에서 못 찾음(" + name + "): " + lost.join(", "));
  const ex = (tops.length ? "__nm.ex({" + tops.map(([k, w]) => JSON.stringify(k) + ":[()=>" + k + (w ? ",(v)=>{" + k + "=v;}" : "") + "]").join(",") + "});\n" : "")
    + (leak.length ? "__nm.leak({" + leak.join(",") + "});\n" : "");
  return { body: ex + out, async: topAwait, tops: tops.length };
}
function copyVendor() {
  for (const rel of vendorSeen) {
    const dir = path.dirname(rel);
    for (const f of fs.readdirSync(path.join(V, "vendor", dir))) {
      const from = path.join(V, "vendor", dir, f), to = path.join(VENDOR, dir, f);
      if (!fs.statSync(from).isFile()) continue;
      if (fs.existsSync(to) && fs.readFileSync(to).equals(fs.readFileSync(from))) continue;
      fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); console.log("딸린 묶음 옮김: public/old-pages/vendor/" + dir + "/" + f);
    }
  }
}

// ── 화면 한 장 ──
const attrsOf = (s) => Object.fromEntries([...String(s || "").matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map((m) => [m[1], m[2] ?? m[3] ?? m[4] ?? ""]));
const lit = (s) => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
const ident = (f) => f.replace(/\W+/g, "_");
const sheets = new Map(), libs = new Map();
const HEAD = (what, src) => "/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 " + what + ") · 원본 = " + src + " */\n";
/** 정적 모듈로 씀 — 줄여서(esbuild minify · 뜻 그대로) 내용 지문을 이름에 */
const written = new Set();
function emit(stem, head, code) {
  const min = esbuild.transformSync(code, { minify: true, format: "esm", target: "es2022", charset: "utf8", legalComments: "none" }).code;
  const name = stem + "." + crypto.createHash("sha256").update(min).digest("hex").slice(0, 10) + ".js";
  fs.mkdirSync(PUB, { recursive: true });
  fs.writeFileSync(path.join(PUB, name), head + min);
  written.add(name);
  return name;
}
const pages = [];

for (const [key, file] of PAGES) {
  const html = read(file);
  const hm = html.match(/<html\b([^>]*)>/), bm = html.match(/<body\b([^>]*)>/), bEnd = html.lastIndexOf("</body>");
  if (!hm || !bm || bEnd < 0) die(file + ": html · body 를 못 찾음");
  const bStart = bm.index + bm[0].length;
  const TOK = /<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script>|<style\b[^>]*>([\s\S]*?)<\/style>|<link\b([^>]*)>/g;
  const css = [], scripts = [], headTags = [];
  let markup = "", last = bStart, inl = 0;
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  for (const m of html.matchAll(TOK)) {
    const at = m.index, end = at + m[0].length;
    if (at >= bStart && at < bEnd) { markup += html.slice(last, at); last = end; }
    if (m[0].startsWith("<!--")) continue;
    if (m[0].startsWith("<link")) {
      const a = attrsOf(m[4]);
      if (a.rel !== "stylesheet") continue;
      if (/^https?:/.test(a.href)) die(file + ": 밖 옷 링크 " + a.href);
      if (!sheets.has(a.href)) sheets.set(a.href, cssFix(read(a.href), a.href));
      css.push({ sheet: a.href });
    } else if (m[0].startsWith("<style")) {
      css.push({ text: cssFix(m[3], file + " <style>") });
    } else {
      const a = attrsOf(m[1]), type = a.type || "";
      if (type && type !== "module" && type !== "text/javascript") die(file + ": 모르는 스크립트 종류 " + type);
      if ("async" in a) die(file + ": async 스크립트 " + (a.src || ""));
      // 스크립트 꼬리표 = 안 도는 표지로 제자리에 남김(원본이 `script[src$="nm-rail.js"]` 로 제 꼬리표의 data- 속성을 읽는다 · document.currentScript 도 이 표지)
      const tag = "<script type=\"text/nm-off\" data-nm-i=\"" + scripts.length + "\"" + (a.src ? " src=\"/" + esc(a.src) + "\"" : "") + Object.entries(a).filter(([k]) => k.startsWith("data-")).map(([k, v]) => " " + k + "=\"" + esc(v) + "\"").join("") + "></script>";
      if (at >= bStart && at < bEnd) markup += tag; else headTags.push(tag);
      if (a.src) {
        if (/^https?:/.test(a.src)) die(file + ": 밖 스크립트 " + a.src);
        if (type === "module") die(file + ": 모듈 파일 스크립트 " + a.src);
        if (!libs.has(a.src)) libs.set(a.src, jsFix(a.src in STUB ? STUB[a.src] : read(a.src), a.src, false));
        scripts.push({ src: a.src, defer: "defer" in a });
      } else {
        scripts.push({ inline: jsFix(m[2], file + "#" + ++inl, type === "module"), defer: type === "module", n: inl });
      }
    }
  }
  markup += html.slice(last, bEnd);
  markup = markup.replace(/\n\s*\n/g, "\n").trim();
  if (/\d(?:svh|dvh|lvh|vh|vw)\b/.test(markup.replace(/<svg[\s\S]*?<\/svg>/g, ""))) die(file + ": 판 속 화면 단위(style 속성) — 규칙 없음");
  if (/\son[a-z]+\s*=\s*["'](?!this\.)/.test(markup.replace(/<script type="text\/nm-off"[^>]*>/g, ""))) die(file + ": 판 속 on… 속성이 화면 함수를 부름 — 규칙 없음");
  markup = markup.replace(/(\s(?:src|href|poster))=(["'])(?![a-z][a-z0-9+.-]*:|\/|#|\?|\2)([^"']*)\2/gi, (_m, a, q, u) => a + "=" + q + "/" + u.replace(/^\.\//, "") + q);

  const usedLibs = [...new Set(scripts.filter((s) => s.src).map((s) => s.src))], usedSheets = [...new Set(css.filter((c) => c.sheet).map((c) => c.sheet))];
  let out = scripts.filter((s) => s.inline).map((s) => (s.inline.async ? "async " : "") + "function inline" + s.n + "(window, document, __nm) {\n" + s.inline.body + "\n}\n").join("");
  out += "export const PAGE = {\n  path: " + JSON.stringify("/" + file) + ",\n  fonts: FONTS,\n"
    + "  css: [" + css.map((c) => (c.sheet ? "SHEETS[" + JSON.stringify(c.sheet) + "]" : lit(c.text))).join(",\n    ") + "],\n"
    + "  scheme: " + JSON.stringify(((html.match(/<meta\s+name="color-scheme"\s+content="([^"]+)"/) || [])[1] || "normal")) + ",\n"
    + "  htmlAttrs: " + JSON.stringify(attrsOf(hm[1])) + ",\n  bodyAttrs: " + JSON.stringify(attrsOf(bm[1])) + ",\n"
    + "  html: " + lit(markup) + ",\n  headTags: " + lit(headTags.join("")) + ",\n"
    + "  scripts: [" + scripts.map((s) => (s.src ? "{ src: " + JSON.stringify(s.src) + (s.defer ? ", defer: true" : "") + ", run: LIB[" + JSON.stringify(s.src) + "] }" : "{ " + (s.defer ? "defer: true, " : "") + "run: inline" + s.n + " }")).join(",\n    ") + "],\n};\n";
  pages.push({ key, file, body: out, head: HEAD(file + " 화면", file + " + " + usedSheets.join(" · ") + " + " + usedLibs.join(" · ")), info: "옷 " + css.length + "장 · 스크립트 " + scripts.length + "개 · 판 " + markup.length + "자" });
}
copyVendor();
const cssName = emit("css", HEAD("같이 쓰는 옷", [...sheets.keys()].join(" · ")),
  "export const SHEETS = {\n" + [...sheets].map(([k, v]) => "  " + JSON.stringify(k) + ": " + lit(v)).join(",\n") + ",\n};\nexport const FONTS = " + lit([...fonts].join("\n")) + ";\n");
const libName = emit("lib", HEAD("같이 쓰는 스크립트", [...libs.keys()].join(" · ")),
  [...libs].map(([k, v]) => (v.async ? "async " : "") + "function " + ident(k) + "(window, document, __nm) {\n" + v.body + "\n}\n").join("")
  + "export const LIB = {\n" + [...libs.keys()].map((k) => "  " + JSON.stringify(k) + ": " + ident(k)).join(",\n") + ",\n};\n");
const names = {};
for (const p of pages) {
  names[p.key] = emit(p.key, p.head, "import { SHEETS, FONTS } from \"./" + cssName + "\";\nimport { LIB } from \"./" + libName + "\";\n" + p.body);
  console.log(p.file + " → public/old-pages/" + names[p.key] + " · " + p.info + " · " + fs.statSync(path.join(PUB, names[p.key])).size + "자");
}
for (const f of fs.readdirSync(PUB)) if (f.endsWith(".js") && !written.has(f)) { fs.unlinkSync(path.join(PUB, f)); console.log("옛 판 걷음: public/old-pages/" + f); }
fs.writeFileSync(path.join(OUT, "manifest.gen.ts"), "/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs) · 옛 에디터 화면의 정적 모듈 이름표(public/old-pages/ · 이름 = 내용 지문) */\nexport const FILES = " + JSON.stringify(names) + " as const;\nexport const SHARED = " + JSON.stringify({ css: cssName, lib: libName }) + " as const;\n");
console.log("같이 쓰는 옷 " + sheets.size + "장 · 스크립트 " + libs.size + "개 · 글꼴 규칙 " + fonts.size + "개");
