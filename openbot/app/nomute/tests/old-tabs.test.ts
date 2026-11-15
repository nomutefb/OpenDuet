import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// 「채널」 · 「SNS」 = 옛 에디터 탭을 앱 안에 직접 붙임(./ui/old-tabs · 형 11-15 「로딩해서 가져오는게 아니라」) · 자리 = 뉴스 에디터 위 탭(형 11-15 「서랍의 sns와 채널 … 저기 박혀야 하고」 · tests/ned-tabs.test.ts)
const read = (p: string) => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const shell = read("ui/shell.tsx"), engine = read("ui/old-tabs/engine.ts"), markup = read("ui/old-tabs/markup.ts"), css = read("ui/old-tabs/old-tabs.gen.css"), fit = read("ui/old-tabs/old-tabs.css");

test("채널 · SNS 는 옛 에디터 화면을 품지(iframe) 않는다", () => {
  const frame = shell.split("\n").find((l) => l.startsWith("const FRAME:"))!.split("//")[0];
  assert.ok(!/chan|sns|tab=/.test(frame), frame);
  const ned = read("ui/news-editor.tsx");
  assert.ok(!/ChanTab|SnsTab|old-tabs"/.test(shell), "껍데기는 옛 탭을 직접 안 그림(뉴스 에디터 안 탭)");
  assert.match(ned, /const oldTabs = \(\) => import\("\.\/old-tabs"\);/);   // 따로 받는 조각(첫 화면 무게 0) · 뉴스 에디터를 열면 뒤에서 미리
  assert.match(ned, /<div key=\{k\} className="nm-scroll nm-ned-old" hidden=\{tab !== k\}>/);   // nm-scroll = 엔진이 찾는 스크롤 판
});

test("엔진 = 옛 탭의 그리기 · 받아오기 함수가 다 들어 있다", () => {
  for (const f of ["function renderChan()", "async function loadChan(", "function renderSnsTrends()", "async function loadTrends(", "async function loadSocial()", "function renderSns()", "function chLiftChart(", "function chChart(", "function renderChanGyeol(", "function openChDay()", "function renderChPost()"]) assert.ok(engine.includes(f), f);
  for (const u of ["api/chan?f=", "api/trends", "f=xtop", "f=brief", "social_candidates.json"]) assert.ok(engine.includes(u), u);   // 자료 주소 = 원본 그대로
});

test("엔진 = 이 틀 안에서만 찾고 · 끌 때 다 걷는다", () => {
  const body = engine.slice(engine.indexOf("여기부터 원본 줄"));
  assert.ok(!/\bwindow\.addEventListener\(|\bdocument\.addEventListener\(|\bdocument\.getElementById\(/.test(body));   // 듣기 = __on(끌 때 걷힘) · 칸 찾기 = 틀 안
  assert.ok(!/\bwindow\.scrollTo\(|\bwindow\.scrollY\b/.test(body));   // 스크롤 = 앱 판
  assert.match(engine, /const \$ = \(s\) => ROOT\.querySelector\(s\);/);
  assert.match(engine, /const fetch = \(u, o\) => window\.fetch\(__abs\(u\), o\);/);   // 상대 주소 = 사이트 맨 위 기준(앱은 /office-app/ 아래)
  assert.match(engine, /return \(\) => \{ __stop\(\); \};/);
});

test("계속 도는 움직임 없음 — 저절로 넘김 · 값 바꿔 끼우기 · 실검 띠", () => {
  assert.ok(!/box\._trRot = setInterval\(/.test(engine));
  assert.match(engine, /box\._trRot = __never\(/);
  assert.match(engine, /const _t = __never\(\(\) => \{\s*try \{\s*if \(!document\.body\.contains\(_stkRows\[0\]\)\)/);
  assert.ok(!markup.includes("tkrHost"));   // 실검 띠 자리 없음 = 안 그려짐
  for (const m of css.matchAll(/([^{}]*)\{[^{}]*\binfinite\b[^{}]*\}/g)) { const sels = m[1].split(",").map((s) => s.trim().replace(/^\.ot /, "")); for (const s of sels) assert.ok(fit.includes(s), "끝없이 도는 규칙을 덧줄이 안 끔: " + s); }
});

test("판 = 옛 머리 줄은 없고 출처 바꿈 단추 · 두 탭 자리 · 깊이 보기 창만", () => {
  for (const id of ["chanSrcTgl", "chanBox", "chdaydlg", "chpostdlg", "chpList", "vhTimeTxt", "snsTrends", "snsList"]) assert.ok(markup.includes(`id="${id}"`), id);
  for (const id of ["snsFreshBtn", "chanFreshBtn", "topRefresh", "searchToggle"]) assert.ok(!markup.includes(`id="${id}"`), id);
});

test("옷 = 전부 .ot 안(앱 다른 화면에 안 샘) · 색 = 앱 라임", () => {
  const noAt = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  for (const m of noAt.matchAll(/(?:^|[{}])\s*([^{}@]+)\{/g)) for (const s of m[1].split(/,(?![^()]*\))/)) { const t = s.trim(); if (t) assert.ok(/^(div)?\.ot\b/.test(t), "틀 밖 선택자: " + t.slice(0, 80)); }
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)/g)) assert.ok(m[1].startsWith("ot-"), m[1]);
  assert.match(fit, /^\.ot \{[^}]*--modern-accent:#CFFF40 !important/m);
  assert.match(fit, /html:not\(\.dark\) \.ot \{ background:#161716; \}/);   // 밝은 앱 = 이 판만 어두운 바탕(옛 탭엔 밝은 값이 없음)
});
