// 옛 에디터 화면(편집 · 스토리보드 · 유튜브 · 음원) = 앱 안에서 직접 돎(형 11-19 00:45 「그거 다 지금 정원으로 제대로 이식해서 가져와」) — iframe · 옛 화면 파일에 기댐 0
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { rootHtml, rootUrl, scopeCss } from "../ui/old-pages/scope-css.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const PAGES = ["edit", "sb", "ys", "song"];
// 만든 파일 = 앱 묶음 밖 정적 모듈(public/old-pages/ · 이름표 ../ui/old-pages/manifest.gen.ts)
const names = JSON.parse(/export const FILES = (\{[^}]+\})/.exec(rd("../ui/old-pages/manifest.gen.ts"))![1]) as Record<string, string>;
const shared = JSON.parse(/export const SHARED = (\{[^}]+\})/.exec(rd("../ui/old-pages/manifest.gen.ts"))![1]) as Record<string, string>;
const gen = (k: string) => rd("../public/old-pages/" + (names[k] || shared[k]));

test("만든 파일 = 앱 묶음 밖 정적 모듈(빌드 메모리 0) · 이름 = 내용 지문 · 받는 손은 실행 중에", () => {
  for (const k of PAGES) { assert.match(names[k], new RegExp(`^${k}\\.[0-9a-f]{10}\\.js$`)); assert.ok(existsSync(new URL("../public/old-pages/" + names[k], import.meta.url)), k); }
  assert.ok(!readdirSync(new URL("../ui/old-pages/", import.meta.url)).some((f) => /\.gen\.ts$/.test(f) && f !== "manifest.gen.ts"), "묶음 안에 만든 큰 파일 0(배포 빌드가 메모리 한도를 넘겨 죽었던 꼴)");
  const ld = rd("../ui/old-pages/load.ts");
  assert.match(ld, /import\(\/\* @vite-ignore \*\/ `\$\{import\.meta\.env\.BASE_URL\}old-pages\/\$\{FILES\[k\]\}`\)/);
  const on = readdirSync(new URL("../public/old-pages/", import.meta.url)).filter((f) => f.endsWith(".js")).sort();
  assert.deepEqual(on, [...Object.values(names), ...Object.values(shared)].sort(), "옛 판 파일이 안 남음");
  assert.match(gen("edit"), new RegExp(`from"\\./${shared.css.replace(/\./g, "\\.")}";import\\{LIB(?: as \\w+)?\\}from"\\./${shared.lib.replace(/\./g, "\\.")}"`), "화면 모듈 → 같이 쓰는 옷 · 스크립트(옆 파일)");
});

test("만든 파일: 옷 = 뿌리 · 화면 단위 · 화면 폭 조건이 다 틀 것으로 · 글꼴 규칙은 따로", () => {
  const css = gen("css");
  assert.match(css, /as SHEETS\b/); assert.match(css, /as FONTS\b/);
  assert.equal(css.split("@font-face").length, 2, "글꼴 규칙 = 한 번만");
  assert.match(css, /=["`]@font-face\{[^"`]*\}["`];export\{\w+ as FONTS,/, "글꼴 규칙 = 따로 한 글(FONTS) — 틀 옷(SHEETS)에 안 섞음(그림자 뿌리 안에선 안 먹음)");
  for (const f of PAGES) assert.doesNotMatch(gen(f), /@font-face/, f + " = 글꼴 규칙 0");
  for (const f of ["css", ...PAGES]) {
    const g = gen(f);
    assert.doesNotMatch(g, /\d(?:svh|dvh|lvh)\b/, f + " = 화면 높이 단위 0");
    assert.doesNotMatch(g, /@media \((?:max|min)-(?:width|height)/, f + " = 화면 폭 조건 0(틀 크기 조건으로)");
  }
  assert.match(gen("edit"), /@container nd \(max-width:\s*520px\)/);
  assert.match(gen("edit"), /nd-html\.inmodal/); assert.match(css, /\.nd-root\s*\{/);
});

test("만든 파일: 스크립트 = 맨이름은 틀 창으로 · 자리 읽기 · 주소 넣기는 틀 손으로 · 꼬리표는 안 도는 표지로 제자리", () => {
  const lib = gen("lib"), edit = gen("edit");
  assert.match(lib, /"nm-rail\.js":\w+/); assert.match(lib, /as LIB\b/);
  assert.match(lib, /\.setTimeout\(/); assert.match(lib, /\.fetch\(/);
  assert.match(edit, /\.rect\(/); assert.match(edit, /\.cx\(/); assert.match(edit, /\.u\(/); assert.match(edit, /\.h\(/);
  assert.doesNotMatch(edit.replace(/`[^`]*`/g, ""), /\.getBoundingClientRect\(\)/, "자리 읽기 = 다 틀 기준으로");
  assert.match(edit, /\.ex\(\{/, "맨 위 이름 = 틀의 창 서랍에");
  assert.match(edit, /\.leak\(\{tkImgFb(?::\w+)?\}\)/, "on…= 속성이 부르는 함수 = 앱 창에도");
  assert.match(edit, /<script type="text\/nm-off" data-nm-i="\d+" src="\/nm-rail\.js" data-scope="cap" data-dlname="video\.mp4" data-jobkey="nm_edit_pend" data-srv="api\/edit\?recent=48"/, "제 꼬리표 속성을 읽는 스크립트(nm-rail) = 표지에서 그대로 읽음");
  assert.match(edit, /import\("\.\/vendor\/morphicons\/dom\.js"\)/, "딸린 묶음 = 모듈 옆(public/old-pages/vendor)");
  assert.ok(existsSync(new URL("../public/old-pages/vendor/morphicons/dom.js", import.meta.url)) && existsSync(new URL("../public/old-pages/vendor/useanimations/player.js", import.meta.url)));
  for (const p of PAGES) assert.match(gen(p), new RegExp(`path:"/${p}\\.html",`));
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

test("알림 누름 = 옛 에디터 길도 정원 화면으로(기사 · 알림메세지 · SNS · 이미지 에디터 · 모르는 옛 길 = 홈)", () => {
  const sw = rd("../sw.js"), m = /const OLD_TAB = [^\n]+\nfunction gardenOf\(u\) \{[\s\S]*?\n\}/.exec(sw);
  assert.ok(m, "gardenOf");
  const location = { origin: "https://edit.nomute.kr" };
  const gardenOf = new Function("location", "URL", m[0] + "\nreturn gardenOf;")(location, URL) as (u: URL) => URL;
  const go = (p: string) => { const r = gardenOf(new URL(p, location.origin)); return r.pathname + r.search + r.hash; };
  assert.equal(go("/?a=251119-0101-x.md&nmv=1"), "/garden-app/#/newsed?a=251119-0101-x.md");
  assert.equal(go("/?msg=fail-abc"), "/garden-app/#/edmsgs");
  assert.equal(go("/?tab=trend"), "/garden-app/#/sns");
  assert.equal(go("/thumb.html?done=1"), "/garden-app/#/edtool");
  assert.equal(go("/?nosw=1"), "/garden-app/");
  assert.equal(go("/garden-app/#/channels/x"), "/garden-app/#/channels/x", "정원 길은 그대로");
  assert.equal(gardenOf(new URL("https://example.com/?a=1")).href, "https://example.com/?a=1", "남의 주소는 그대로");
});

test("옛 화면이 사이트 뿌리에서 받던 파일 = 앱 안으로(옛 에디터 파일에 기댐 0)", () => {
  const fr = rd("../ui/old-pages/frame.ts");
  assert.match(fr, /const LOCAL: Record<string, string> = \{ "\/marked\.min\.js": "old-pages\/vendor\/marked\.min\.js", "\/purify\.min\.js": "old-pages\/vendor\/purify\.min\.js", "\/ys-worker-guide\.html": "old-pages\/ys-worker-guide\.html" \};/);
  for (const f of ["vendor/marked.min.js", "vendor/purify.min.js", "ys-worker-guide.html"]) assert.ok(existsSync(new URL("../public/old-pages/" + f, import.meta.url)), f);
  assert.doesNotMatch(rd("../public/old-pages/ys-worker-guide.html"), /<(?:link|script)\b[^>]*\b(?:href|src)="(?!https?:|\/|#)/, "안내 문서 = 홀로 섬(옆 파일 안 부름)");
  assert.match(fr, /if \(o\?\.method === "HEAD" && full\.pathname === page\.path\) return Promise\.resolve\(new Response\(null, \{ status: 200, headers: \{ etag: '"nm-old-page"' \} \}\)\);/, "제 문서 판 확인 = 늘 같은 답(앱이 올라갈 때마다 화면이 저를 다시 붙이지 않게)");
  assert.match(fr, /if \(full\.pathname === "\/nm-sync\.js"\) return serverFetch\(RW\.location\.origin \+ BASE_URL \+ "version\.json" \+ full\.search, o\);/, "로그인 만료 확인 = 앱의 판 표지 파일로");
  assert.match(fr, /u: localUrl, h: localHtml,/);
});

test("앱 폴더 안 따로 선 문서(.html) 링크 = 판이 아니라 앱 안 한 겹", async () => {
  const src = rd("../ui/inapp.ts");
  assert.match(src, /const doc = \/\\\.html\$\/i\.test\(u\.pathname\) && !\/\\\/index\\\.html\$\/i\.test\(u\.pathname\);/);
  assert.match(src, /if \(u\.pathname\.startsWith\(APP\) && !doc\) return u\.hash\.replace\(\/\^#\/, ""\) \|\| "\/";/);
});
