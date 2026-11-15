import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// 뉴스 에디터 기사 한 장 = 옛 에디터 「기사 창」(#dlg)을 칸 안에 직접 붙임(./ui/old-tabs/art.tsx)
//   형 11-15 「우측에 이내용, 예~전 뉴스요약 부분 혹시 찾을수있으면 그게 더 훌륭하거든? 그때 시안을 여기에 붙일 수 있나? 만약에 붙일수잇으면 그걸 여기에 가져오고 지금건 없애면될거같아.」
//      「저게 시안대신 라임만 들어가면됨.」 · 「저기에 있는 거의 모든 카드뉴스 제작부터해가지고, 지금 안가져온게 있으면 더 가져와야해」
//   잣대 = 채널 · SNS(tests/old-tabs.test.ts)와 같음: 엔진은 이 틀 안에서만 찾고 끌 때 다 걷음 · 옷은 전부 틀(.oa) 안 · 끝없이 도는 움직임은 덧줄로 끔
const read = (p: string) => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const ned = read("ui/news-editor.tsx"), art = read("ui/old-tabs/art.tsx"), engine = read("ui/old-tabs/engine-art.ts"), markup = read("ui/old-tabs/markup-art.ts"), css = read("ui/old-tabs/art.gen.css"), fit = read("ui/old-tabs/art.css");
const body = engine.slice(engine.indexOf("여기부터 원본 줄"));

test("뉴스 에디터 기사 한 장 = 옛 기사 창(PC 오른쪽 칸 · 폰 화면 통째 둘 다) · 따로 받는 조각", () => {
  assert.match(ned, /const oldArt = \(\) => import\("\.\/old-tabs\/art"\);/);   // 채널 · SNS 조각(./old-tabs)과 따로 · 뉴스 에디터를 열면 뒤에서 미리
  assert.match(ned, /void oldArt\(\)\.catch\(\(\) => undefined\);/);
  assert.match(ned, /<div className="nm-ned-r art">\{cur \? <Suspense fallback=\{artWait\}><ArtPane file=\{cur\} \/><\/Suspense>/);
  assert.match(ned, /<div className="nm-ned-one art">\s*<button type="button" className="nm-ned-back" onClick=\{back\}>[^\n]*목록<\/button>\s*<Suspense fallback=\{artWait\}><ArtPane file=\{sel\} \/><\/Suspense>/);   // 폰 = 「목록」 단추 그대로
  assert.ok(!/NewsDetail/.test(ned.split("\n").filter((l) => !l.trimStart().startsWith("//")).join("\n")), "뉴스 에디터는 앞 판 기사 한 장(news-detail)을 안 그림");
  assert.match(read("ui/news.tsx"), /import \{ NewsDetail \} from "\.\/news-detail";/);   // 서랍 「뉴스 요약」은 그대로 앞 판
  assert.ok(!/from "\.\/(engine|markup)"/.test(art), "기사 창 조각은 채널 · SNS 엔진을 안 끌고 옴");
  assert.ok(!/engine-art|markup-art|art\.gen\.css/.test(read("ui/old-tabs/index.tsx")), "채널 · SNS 조각은 기사 창 엔진을 안 끌고 옴");
});

test("엔진 = 옛 기사 창의 그리기 · 고치기 · 만들기 함수가 다 들어 있다", () => {
  for (const f of ["async function open(a)", "async function ensureDetail(a)", "function paintDetErr(a)", "function decorate(root)", "function addCopyButtons(root)", "function overviewMeta(", "function thumbSec(a)", "function thumbStatic(", "function thumbPromptPanel(a)",
    "function cardSec(", "async function makeCards(", "function feedSec(", "function setupScrub()", "function updateScrub()", "function openRev()", "function openCrev()", "function openTredo(", "function openEdit(", "function openLightbox(", "async function load()"]) assert.ok(engine.includes(f), f);
  for (const u of ["'detail/' + encodeURIComponent(a.file)", "api/feedlive", "api/make-cards", "api/revise'", "api/revise-cards", "/api/thumbredo", "api/rate", "api/feedback"]) assert.ok(engine.includes(u), u);   // 읽기 · 쓰기 주소 = 원본 그대로
  assert.match(engine, /\$\('#revFab'\)\.addEventListener\('click', openRev\);/);   // 떠 있는 「요약 수정」 · 「카드 수정」 단추
  assert.match(engine, /\$\('#crevFab'\)\.addEventListener\('click', openCrev\);/);
  assert.ok(!read("ui/old-tabs/engine.ts").includes("function thumbSec(a)"), "채널 · SNS 엔진은 그대로(기사 창 줄이 안 섞임)");
});

test("엔진 = 이 틀 안에서만 찾고 · 끌 때 다 걷고 · 모달 · 기록을 안 쌓는다", () => {
  assert.ok(!/\bwindow\.addEventListener\(|\bdocument\.addEventListener\(|\bdocument\.getElementById\(/.test(body));   // 듣기 = __on(끌 때 걷힘) · 칸 찾기 = 틀 안
  assert.ok(!/\bdocument\.body\.appendChild\(/.test(body));   // 크게 보기 창 · 짧은 알림 = 틀 안(옷이 .oa 안에만 있음)
  assert.ok(!/document\.documentElement\.style\.overflow/.test(body));   // 뒤 화면 스크롤 잠금 없음(칸 안)
  assert.match(engine, /const \$ = \(s\) => ROOT\.querySelector\(s\);/);
  assert.match(engine, /const fetch = \(u, o\) => window\.fetch\(__abs\(u\), o\);/);   // 상대 주소 = 사이트 맨 위 기준(앱은 /office-app/ 아래)
  assert.match(engine, /const history = \{ state: null, pushState\(\) \{\}, replaceState\(\) \{\}, back\(\) \{\} \};/);   // 뒤로 가기 기록 0(앱 길잡이와 안 섞임)
  assert.ok(!body.includes("fetch('articles.json"), "기사 목록(3.9MB)을 따로 또 안 받음");
  assert.match(body, /const r = await __feed\(\);/);
  assert.match(engine, /const __feed = \(\) => host\.feed\(\)/);
  assert.match(engine, /return '\/api\/dl\?u=' \+ encodeURIComponent\(url\)/);   // 저장 길 = 맨 위 기준(href 에 박힘)
  assert.match(engine, /const openGenIdlg = \(file\) => \{ try \{ host\.gen\(file\); \} catch \{\} \};/);   // 「+ AI」 = 앱 이미지 생성 창
  assert.match(engine, /return \{ show, refresh: \(\) => \{ if \(!__dead && DATA_LOADED\) return load\(\); \}, stop: \(\) => \{ __stop\(\); \} \};/);
  assert.match(art, /return \(\) => \{ try \{ eng\.current\?\.stop\(\); \} catch \{[^}]*\} eng\.current = null; \};/);
});

test("판 = 열린 채 칸 안에 박힌 기사 창(닫기 × 없음) + 작은 창 넷", () => {
  assert.match(markup, /<dialog id="dlg" open aria-label="뉴스 요약">/);
  for (const id of ["src", "dlgprog", "dlgbody", "ph-sum", "mdbody", "ph-card", "cardsum", "cardsec", "ph-feed", "feedsec", "revFab", "crevFab", "editdlg", "edChips", "edWish", "revdlg", "revText", "revSend", "crevdlg", "crevText", "crevSend", "tredodlg", "tredoText", "tredoSend"]) assert.ok(markup.includes(`id="${id}"`), id);
  assert.ok(!/dlg-x|onclick="dlg\.close\(\)"|onclick="editdlg\.close\(\)"/.test(markup), "닫기 × · 창 전역 이름을 부르는 onclick 없음");
  assert.ok(!/id="(genidlg|askdlg|pindlg|tooldlg)"/.test(markup), "안 가져온 창(이미지 생성 · 요약 요청 · PIN · 도구)");
});

test("옷 = 전부 .oa 안(앱 다른 화면 · 채널 · SNS 판에 안 샘) · 색 = 앱 라임 · 계속 도는 움직임 없음", () => {
  const noAt = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  for (const m of noAt.matchAll(/(?:^|[{}])\s*([^{}@]+)\{/g)) for (const s of m[1].split(/,(?![^()]*\))/)) { const t = s.trim(); if (t) assert.ok(/^(div)?\.oa\b/.test(t), "틀 밖 선택자: " + t.slice(0, 80)); }
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)/g)) assert.ok(m[1].startsWith("oa-"), m[1]);
  assert.ok(!/(^|[\s,{}])\.ot\b/.test(css), "채널 · SNS 틀(.ot) 이름을 안 씀(두 옷이 한 틀에 걸리면 차례가 흐트러짐)");
  assert.match(fit, /^\.oa \{[^}]*--modern-accent:#CFFF40 !important; --modern-accent-rgb:207,255,64 !important;[^}]*--accent:#CFFF40 !important/m);   // 형 「시안대신 라임」
  assert.match(fit, /html:not\(\.dark\) \.oa \{ background:#161716; \}/);
  assert.match(fit, /^:where\(\.oa\) \*:not\(svg, svg \*\) \{ all:revert; \}/m);   // 앱 바탕 다듬기(preflight)를 이 틀 안에서만 되돌림 · 무게 0 = 만든 옷이 늘 이김
  for (const m of css.matchAll(/([^{}]*)\{[^{}]*\binfinite\b[^{}]*\}/g)) { const sels = m[1].replace(/\/\*[\s\S]*?\*\//g, "").split(",").map((s) => s.trim()); for (const s of sels) assert.ok(fit.includes(s), "끝없이 도는 규칙을 덧줄이 안 끔: " + s); }
  assert.match(fit, /\.oa #dlg \{ position:relative;[^}]*box-shadow:none; background:transparent;/);   // 모달 꼴(뒤 막 · 테 · 그림자) 없이 칸 안
});
