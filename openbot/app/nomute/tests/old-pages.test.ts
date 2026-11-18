// 옛 에디터 화면(편집 · 스토리보드 · 유튜브 · 음원) = 앱 안에서 직접 돎(형 11-19 00:45 「그거 다 지금 정원으로 제대로 이식해서 가져와」) — iframe · 옛 화면 파일에 기댐 0
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { rootHtml, rootUrl, scopeCss } from "../ui/old-pages/scope-css.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const PAGES = ["edit", "sb", "ys", "song"];

test("만든 파일: 옷 = 뿌리 · 화면 단위 · 화면 폭 조건이 다 틀 것으로 · 글꼴 규칙은 따로", () => {
  const css = rd("../ui/old-pages/css.gen.ts");
  assert.match(css, /export const SHEETS = \{/); assert.match(css, /export const FONTS = `@font-face/);
  assert.doesNotMatch(css.slice(0, css.indexOf("export const FONTS")), /@font-face/, "글꼴 규칙은 틀 옷에 안 섞음(그림자 뿌리 안에선 안 먹음)");
  for (const f of ["css", ...PAGES]) {
    const g = rd(`../ui/old-pages/${f}.gen.ts`);
    assert.doesNotMatch(g, /\d(?:svh|dvh|lvh)\b/, f + " = 화면 높이 단위 0");
    assert.doesNotMatch(g, /@media \((?:max|min)-(?:width|height)/, f + " = 화면 폭 조건 0(틀 크기 조건으로)");
  }
  assert.match(rd("../ui/old-pages/edit.gen.ts"), /@container nd \(max-width:\s*520px\)/);
  assert.match(rd("../ui/old-pages/edit.gen.ts"), /nd-html\.inmodal/); assert.match(css, /\.nd-root\s*\{/);
});

test("만든 파일: 스크립트 = 맨이름은 틀 창으로 · 자리 읽기 · 주소 넣기는 틀 손으로 · 꼬리표는 안 도는 표지로 제자리", () => {
  const lib = rd("../ui/old-pages/lib.gen.ts"), edit = rd("../ui/old-pages/edit.gen.ts");
  assert.match(lib, /function nm_rail_js\(window, document, __nm\) \{/);
  assert.match(lib, /window\.setTimeout\(/); assert.match(lib, /window\.fetch\(/);
  assert.match(edit, /__nm\.rect\(/); assert.match(edit, /__nm\.cx\(/); assert.match(edit, /__nm\.u\(/); assert.match(edit, /__nm\.h\(/);
  assert.doesNotMatch(edit.replace(/`[^`]*`/g, ""), /\.getBoundingClientRect\(\)/, "자리 읽기 = 다 틀 기준으로");
  assert.match(edit, /__nm\.ex\(\{/, "맨 위 이름 = 틀의 창 서랍에");
  assert.match(edit, /__nm\.leak\(\{tkImgFb\}\)/, "on…= 속성이 부르는 함수 = 앱 창에도");
  assert.match(edit, /<script type="text\/nm-off" data-nm-i="\d+" src="\/nm-rail\.js" data-scope="cap" data-dlname="video\.mp4" data-jobkey="nm_edit_pend" data-srv="api\/edit\?recent=48"/, "제 꼬리표 속성을 읽는 스크립트(nm-rail) = 표지에서 그대로 읽음");
  assert.match(edit, /import\("\.\.\/\.\.\/home\/deck\/vendor\/morphicons\/dom\.js"\)/, "딸린 묶음 = 앱 안 것");
  for (const p of PAGES) assert.match(rd(`../ui/old-pages/${p}.gen.ts`), new RegExp(`path: "/${p}\\.html",`));
});

test("틀: 그림자 뿌리 · 꼬리표 이름(nd-html · nd-body) · 붙박이는 틀 안 · 화면 주소 · 뒤로 가기 기록은 앱 것과 따로", () => {
  const fr = rd("../ui/old-pages/frame.ts");
  assert.match(fr, /:host\{all:initial;[^}]*contain:layout style;container-type:size;container-name:nd\}/);
  assert.match(fr, /RD\.createElement\("nd-html"\)/);
  assert.match(fr, /get pathname\(\) \{ return page\.path; \}/);
  assert.match(fr, /replaceState: \(s: unknown, _t: string, u\?: string \| null\) => \{ hist\.state = s; if \(u != null\) setUrl\(u\); \}/, "앱 주소를 안 건드림");
  assert.match(fr, /if \(k === "innerWidth"\) return el\.clientWidth;/);
  assert.match(fr, /for \(const f of \[\.\.\.byes\]\) call\(f, win, e\);/, "걷힐 때 pagehide 손 한 번(쓰던 글 저장)");
});

test("실행 때 끼우는 옷 · 덧씌우는 옷 = 원본 문서 꼴 → 틀 것", () => {
  assert.equal(scopeCss("html,html.x:not(:has(#w)),body{background:transparent}"), "nd-html,nd-html.x:not(:has(#w)),nd-body{background:transparent}");
  assert.equal(scopeCss(".a{b:c}body::before{display:none}"), ".a{b:c}nd-body::before{display:none}");
  assert.equal(scopeCss(":root{--accent:#CFFF40!important}"), ".nd-root{--accent:#CFFF40!important}");
  assert.equal(scopeCss("@media (max-width:767px){#pvsec .cpprev-box{max-height:min(58svh,620px)}}"), "@container nd (max-width:767px){#pvsec .cpprev-box{max-height:min(58cqh,620px)}}");
  assert.equal(scopeCss("@media (prefers-reduced-motion:reduce){.a{animation:none}}"), "@media (prefers-reduced-motion:reduce){.a{animation:none}}", "기기 조건은 그대로");
  assert.equal(scopeCss(".tbody{a:b}.html-x{c:d}#body{e:f}"), ".tbody{a:b}.html-x{c:d}#body{e:f}", "이름에 든 html · body 는 안 건드림");
});

test("상대 주소 = 뿌리 기준(원본 문서가 / 에 있었다)", () => {
  assert.equal(rootUrl("api/dl?u=x"), "/api/dl?u=x"); assert.equal(rootUrl("./song_out/a.mp3"), "/song_out/a.mp3");
  for (const v of ["/api/x", "https://a/b", "blob:x", "data:x", "#a", "?a=1", "", null, 3]) assert.equal(rootUrl(v), v);
  assert.equal(rootHtml('<img src="ys_out/a.png" alt=""><a href="https://x/y">z</a><video poster=\'p.jpg\' src="/abs.mp4">'), '<img src="/ys_out/a.png" alt=""><a href="https://x/y">z</a><video poster=\'/p.jpg\' src="/abs.mp4">');
  assert.equal(rootHtml('<img src="" data-x="a/b">'), '<img src="" data-x="a/b">');
});
