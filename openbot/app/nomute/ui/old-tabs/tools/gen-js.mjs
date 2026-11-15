// 옛 에디터 「채널 요약」 · 「SNS」 탭 엔진 떼어 오기 — viewer/index.html 스크립트에서 두 탭이 쓰는 선언만 골라 ../engine.ts 로
//   고르는 법 = 뿌리(ROOTS)에서 부르는 맨 위 선언을 따라감 · STOP = 앱에 없는 옛 기능(대기열 · 보기 창 · 알림 …) → PRELUDE 의 가벼운 대체
//   맨 위에서 바로 도는 줄(듣기 붙이기 등)은 EXTRA 에 적힌 것만 · 원본 줄은 한 글자도 안 고침(REWRITE 의 창 · 문서 · 타이머 이름 바꿈만)
//   쓰는 법(앱 폴더 openbot/app/nomute 에서) = node ui/old-tabs/tools/gen-js.mjs <에디터 저장소 길> [묶음]
//   묶음 = 안 적으면 채널 · SNS(아래 TABS → ../engine.ts · ../markup.ts) · art = 기사 창(./pack-art.mjs → ../engine-art.ts · ../markup-art.ts · 형 11-15 「그때 시안을 여기에 붙일 수 있나?」)
//     묶음마다 뿌리 · 끊는 자리 · 바로 도는 줄 · 이름 바꿈 · 대체 조각 · 판 · 겉 틀이 따로 — 채널 · SNS 쪽 결과는 묶음을 나누기 전과 한 글자도 같아야 함(다시 만들어 diff 0)
import { createRequire } from "node:module";
import fs from "node:fs";
import { APP, read, scripts, topLevel } from "./lib.mjs";
const req = createRequire(APP + "package.json");
const { parse } = req("@babel/parser");
const traverse = req("@babel/traverse").default;

const EDITOR = process.argv[2], PACK = process.argv[3] || "tabs";
if (!EDITOR) { console.error("쓰는 법: node ui/old-tabs/tools/gen-js.mjs <에디터 저장소 길> [묶음: tabs(기본) | art]"); process.exit(1); }

const TABS = {};
TABS.ROOTS = ["chThFail", "gyPostRepaint", "renderChan", "loadChan", "renderSnsTrends", "loadTrends", "loadSocial", "renderSns", "openChDay", "openChPost", "segPill", "chDlgOpen", "_chPop", "_chClosing", "_condRz", "_sigRz", "_chuRz"];
// 앱에 없는 옛 기능 = 끊는 자리(PRELUDE 가 대신 섬)
TABS.STOP = ["$", "CURTAB", "NM_SET", "renderMsgBadge", "renderScrap", "renderMsgList", "quakeNotify", "openTrView", "openTref", "trEmbed", "isComposingModalOpen", "CHANF", "SNSF", "loadPending", "qGo", "qMatch", "qEff", "saveSettings", "_dg", "_searchRender", "SCRAP_LOADED", "FWATCH", "openIgPost", "geniRailSetup", "geniRailUpd"];
// 맨 위에서 바로 도는 줄 가운데 가져올 것(글머리로 고름)
TABS.EXTRA = [
  /^try \{ if \(document\.fonts && document\.fonts\.ready\) document\.fonts\.ready\.then\(\(\) => chuFit/,
  /^window\.addEventListener\('resize', \(\) => \{ clearTimeout\(_chuRz\)/,
  /^window\.addEventListener\('resize', \(\) => \{ clearTimeout\(_condRz\)/,
  /^window\.addEventListener\('resize', \(\) => \{ clearTimeout\(_sigRz\)/,
  /^\{ const cb = \$\('#chanBox'\)/,
  /^try \{ GY_SORT = localStorage/,
  /^if \(!\['new', 'score', 'star', 'todo'\]\.includes\(GY_SORT\)\)/,
  /^\{ const _cst = document\.getElementById\('chanSrcTgl'\)/,
  /^\(\(\) => \{ const w = \$\('#chpostdlg'\)/,
  /^window\.addEventListener\('popstate', \(\) => \{\s*if \(_chClosing\)/,
  /^\['#chdaydlg', '#chpostdlg'\]\.forEach/,
  /^document\.addEventListener\('click', e => \{\s*const b = e\.target\.closest\('\.ch-rangeseg > button'\)/,
];
TABS.REWRITE = [
  [/\bwindow\.scrollTo\(/g, "__scrollTo("], [/\bwindow\.scrollY\b/g, "__scrollY()"],   // 옛 화면은 창이 스크롤 · 앱은 판(.nm-scroll)이 스크롤
  [/_dl\[_dl\.length - 1\] : document\.body;/g, "_dl[_dl.length - 1] : ROOT;"],   // 짧은 알림(qFlash) 자리 = 이 틀 안(옷이 .ot 안에만 있음)
  [/\bwindow\.addEventListener\(/g, "__on(window, "],
  [/\bdocument\.addEventListener\(/g, "__on(document, "],
  [/\bdocument\.getElementById\(/g, "__byId("],
  [/box\._trRot = setInterval\(/g, "box._trRot = __never("],
  [/const _t = setInterval\(\(\) => \{\s*try \{\s*if \(!document\.body\.contains\(_stkRows\[0\]\)\)/g, (m) => m.replace("setInterval(", "__never(")],   // 주식 줄 5초마다 값 바꿔 끼우기 = 끔(같은 까닭)   // TOP 10 저절로 넘김 = 끔(계속 도는 움직임 없음 · 손으로 넘김은 그대로)
];

TABS.ICONS = ["EYE_SVG", "CHEV_L_SVG", "CHEV_R_SVG"];
TABS.prelude = () => read(new URL("./prelude.js", import.meta.url).pathname);
TABS.out = "ui/old-tabs/engine.ts";
// 판(markup) = 옛 index.html 에서 그 칸만: 출처 바꿈 단추 · 두 탭 자리 · 채널 깊이 보기 창 둘
TABS.markup = ({ cut, lit }) => {
const srcSeg = cut(/<span class="ch-srcsw" id="chanSrcSeg">[\s\S]*?<\/button><\/span>/, "출처 바꿈");
const dlgs = cut(/<dialog id="chdaydlg"[\s\S]*?<\/dialog>/, "일별 상세") + cut(/<dialog id="chpostdlg"[\s\S]*?<\/dialog>/, "게시물 탐색");
fs.writeFileSync(APP + "ui/old-tabs/markup.ts", `// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs · 옛 에디터 viewer/index.html 의 그 칸 그대로)
//   머리 줄(시각 · 새로고침 · 실검 띠)은 안 가져옴 · 출처 바꿈 단추만 맨 위 오른쪽 · 시각 칸(#vhTimeTxt)은 엔진이 값을 적어서 숨긴 채 둠
export const CHAN_HTML = ${lit('<div class="ot-top"><span class="vh-time" id="vhTime"><span id="vhTimeTxt"></span></span>' + srcSeg + '</div><section class="chanview" id="chanview"><div id="chanBox"></div></section>' + dlgs)};
export const SNS_HTML = ${lit('<span id="vhTime" hidden><span id="vhTimeTxt"></span></span><section class="trendview" id="trendview"><div id="snsTrends"></div><section class="snsview" id="snsview" hidden><div id="snsList"></div></section></section>')};
`);
};
TABS.wrap = ({ PRELUDE, body, take }) => `// @ts-nocheck
/* eslint-disable */
// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs 가 옛 에디터 viewer/index.html 에서 떼어 옴 · 대체 조각 = tools/prelude.js)
//   옛 「채널 요약」 · 「SNS」 탭이 돌던 코드 그대로(선언 ${take.size}개) · 문서 = 이 화면 틀(ROOT) · 듣기 · 타이머 = 끌 때 다 걷음
export function startOldTabs(ROOT, which, host) {
${PRELUDE}
// ───────── 여기부터 원본 줄 ─────────
${body}
// ───────── 원본 줄 끝 ─────────
  window.chThFail = chThFail;   // 판 안 onerror="…" 가 부르는 이름(원본은 창 전역)
  if (which === "chan") { loadChan(); __loadSet(); } else { loadTrends(); loadSocial(); }
  return () => { __stop(); };
}
`;

// ── 여기부터 묶음 공용 ──
const P = PACK === "tabs" ? TABS : (await import("./pack-" + PACK + ".mjs")).default;
const html = read(EDITOR + "/viewer/index.html");
const items = topLevel([...(P.FILES || []).map((f) => ({ code: read(EDITOR + "/viewer/" + f) })), ...scripts(html)]);   // FILES = 옛 화면이 따로 읽던 작은 JS(아이콘 · 입력칸 클립 …)도 같은 식으로 골라 옴(묶음이 적을 때만)
const by = new Map(); for (const it of items) for (const n of it.names) by.set(n, it);
const { ROOTS, STOP, EXTRA, REWRITE } = P;
const stop = new Set(STOP), seen = new Set(), q = [...ROOTS];
const take = new Set();
for (const it of items) if (!it.decl && EXTRA.some((re) => re.test(it.code))) { take.add(it); for (const u of it.uses) q.push(u); }
for (const re of EXTRA) if (!items.some((it) => !it.decl && re.test(it.code))) { console.error("EXTRA 못 찾음(원본이 바뀜): " + re); process.exit(1); }
while (q.length) { const n = q.shift(); if (seen.has(n) || stop.has(n)) continue; const it = by.get(n); if (!it) continue; seen.add(n); take.add(it); for (const u of it.uses) if (!seen.has(u)) q.push(u); for (const m of it.names) seen.add(m); }
for (const r of ROOTS) if (!by.has(r)) { console.error("뿌리 못 찾음: " + r); process.exit(1); }

let body = items.filter((it) => take.has(it)).map((it) => it.code).join("\n");
for (const [re, to] of REWRITE) body = body.replace(re, to);

// 아이콘 글줄 = 옛 화면이 따로 읽던 nm-svg.js 에서 그 줄만
const svgSrc = read(EDITOR + "/viewer/nm-svg.js");
const ICONS = P.ICONS.map((n) => { const m = svgSrc.match(new RegExp("^const " + n + " = .*$", "m")); if (!m) { console.error("아이콘 못 찾음: " + n); process.exit(1); } return "  " + m[0]; }).join("\n");
const PRELUDE = P.prelude() + ICONS;

const cut = (re, what) => { const m = html.match(re); if (!m) { console.error("판 조각 못 찾음: " + what); process.exit(1); } return m[0]; };
const lit = (s2) => "`" + s2.replace(/<!--[\s\S]*?-->/g, "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
P.markup({ html, cut, lit });
const out = P.wrap({ PRELUDE, body, take });
fs.writeFileSync(APP + P.out, out);

// 안 채워진 이름 찾기(브라우저에 없는 것만 남기려면 뒤 목록을 보고 PRELUDE · STOP 을 고침)
const ast = parse(out, { sourceType: "module" });
let globals = [];
traverse(ast, { Program(p) { globals = Object.keys(p.scope.globals); p.stop(); } });
const ids = [...new Set([...out.matchAll(/\$\('#([A-Za-z][\w-]*)/g)].map((m) => m[1]).concat([...out.matchAll(/__byId\('([\w-]+)'/g)].map((m) => m[1])))];
if (process.env.OT_REPORT) fs.writeFileSync(process.env.OT_REPORT + ".js.json", JSON.stringify({ globals, ids, names: [...seen] }, null, 1));   // 자세한 목록 = OT_REPORT=<길> 줄 때만
console.log("선언 " + take.size + "개 · " + (out.length / 1024).toFixed(0) + "KB · 바깥 이름 " + globals.length + "개 · 화면 칸 id " + ids.length + "개");
