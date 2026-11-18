// 옛 에디터 「기사 창」(viewer/index.html <dialog id="dlg"> · 주소 /?old&a=<file>) 묶음 — gen-js.mjs · gen-css.mjs 가 읽음
//   형 11-15 「우측에 이내용, 예~전 뉴스요약 부분 혹시 찾을수있으면 그게 더 훌륭하거든? 그때 시안을 여기에 붙일 수 있나? 만약에 붙일수잇으면 그걸 여기에 가져오고 지금건 없애면될거같아.」 · 「어 저거맞음」
//      「저기에 있는 거의 모든 카드뉴스 제작부터해가지고, 지금 안가져온게 있으면 더 가져와야해」 → 그리기(open) · 다듬기(decorate) · 썸네일 후보 · 프롬프트 · 카드뉴스 제작 · 카드 뉴스 칸 · 요약 수정 · 카드 수정 · 이미지 수정 · 카드 한 장 변경 · 스크러버까지 원본 줄 그대로
//   채널 · SNS 묶음(gen-js.mjs TABS)과 같은 길: 뿌리(ROOTS)에서 선언을 따라감 · STOP = 앱에 없는 옛 뼈대 → prelude-art.js 의 가벼운 대체 · EXTRA = 맨 위에서 바로 도는 줄 가운데 가져올 것
//   다른 점 = 모달이 아니라 칸 안에 박힘(판의 <dialog id="dlg" open> = 열린 채 · showModal · 뒤로 가기 기록 0) · 기사 목록 = 앱이 읽은 것(host.feed) · 「+ AI」 이미지 생성 창 = 앱 것(host.gen · 옛 #genidlg 는 안 가져옴)
//   만드는 곳 = ../engine-art.ts · ../markup-art.ts · ../art.gen.css(전부 .oa 안)
import fs from "node:fs";
import { APP, read } from "./lib.mjs";

const P = {};
P.ROOTS = ["open", "load", "openCrev", "openTredo", "startCardRevising", "backdropClose", "draftClear", "attachCopyPaste"];   // 요약 수정(openRev · api/revise · news-revise) = 걷음(형 11-18 12:03 「!깃 ✓ ① 다 지움(의류수거함)」) · 카드 수정 = 남김(형 13:14 「응, 카드뉴스는 놔둘게.」)
// 앱에 없는 옛 뼈대 = 끊는 자리(prelude-art.js 가 대신 섬)
P.STOP = [
  "$", "CURTAB", "NM_SET", "SCRAP_LOADED",
  "render", "dateHead", "renderScrap", "renderMsgBadge", "renderMsgList",   // 옛 첫 화면 목록 · 알림함 = 앱 왼쪽 칸이 대신
  "setAuthStale", "nmAuthNote", "MSG_ACTIONS",   // 로그인 끝남 알림 길 = 앱 것
  "isComposingModalOpen", "isLocked", "lockscr",   // 옛 잠금 화면
  "openGenIdlg",   // 「+ AI」 이미지 생성 창(#genidlg · 스튜디오 탭과 한 몸 · 약 110KB) = 앱 이미지 생성 창(../../thumb-gen.tsx GenPane)으로 넘김
  "makeDraggable",   // PC 창 끌기 = 칸 안에 박혀서 뜻 없음
  "_firstLoad",   // load() 안 그 자리 변수와 이름만 같은 맨 위 함수(옛 첫 화면 딥링크 · 탭 열기) = 안 따라감
];
// 맨 위에서 바로 도는 줄 가운데 가져올 것(글머리로 고름)
P.EXTRA = [
  /^attachCopyPaste\(\$\('#crevText'\), true\);$/, /^attachCopyPaste\(\$\('#tredoText'\), true\);$/, /^attachCopyPaste\(\$\('#edWish'\), true\);$/,
  /^\$\('#dlgbody'\)\.addEventListener\('scroll', updateScrub/,
  /^new ResizeObserver\(\(\) => \{ if \(\$\('#dlg'\)\.open\) updateScrub\(\); \}\)/,
  /^\(function\(\)\{\s*const src = \$\('#src'\);/,   // 원문(↗) 누름 반짝
  /^document\.addEventListener\('click', e => \{\s*if \(e\.defaultPrevented\) return;\s*\/\/ 드래그/,   // 단추 누름 그림 움직임(한 번)
  /^document\.addEventListener\('click', e => \{\s*const b = e\.target\.closest\('\.dlbtn'\)/,   // 저장 단추 누름 = 「받음」 표시 + 체크 한 번
  /^\$\('#crevFab'\)\.addEventListener\('click', openCrev\);$/,
  // 카드 수정 요청 창
  /^\$\('#crevX'\)\.addEventListener\('click'/, /^backdropClose\(\$\('#crevdlg'\), \['#crevText'\]\);$/, /^\$\('#crevdlg'\)\.addEventListener\('close'/, /^\$\('#crevText'\)\.addEventListener\('input'/, /^\$\('#crevSend'\)\.addEventListener\('click', async/,
  /^loadCardRevising\(\);$/,   // 새로 고쳐도 「수정 중」 이어 보기
  // 이미지 수정 요청 창
  /^\$\('#tredoX'\)\.addEventListener\('click'/, /^\$\('#tredodlg'\)\.addEventListener\('close'/, /^backdropClose\(\$\('#tredodlg'\), \['#tredoText'\]\);$/, /^\$\('#tredoText'\)\.addEventListener\('input'/, /^\$\('#tredoSend'\)\.addEventListener\('click', async/,
  // 카드 한 장 변경 창
  /^\(function \(\) \{\s*const wrap = \$\('#editdlg \.edcardwrap'\);/,
  /^\$\('#editdlg \.ed-cno'\)\.onclick/, /^\$\('#editdlg \.ed-cyes'\)\.onclick = fireEdit;$/, /^\$\('#editdlg'\)\.addEventListener\('close'/, /^\$\('#edSync'\)\.addEventListener\('change'/, /^\$\('#edWish'\)\.addEventListener\('input', edDisarm\);$/,
  /^\$\('#edAttach'\)\.addEventListener\('click', edAttachClick\);$/, /^bindImgPaste\(\$\('#editdlg'\)/, /^\$\('#editdlg \.ed-img'\)\.addEventListener\('click'/, /^\$\('#editdlg \.ed-baf'\)\.addEventListener\('click'/,
  /^window\.addEventListener\('resize', \(\) => \{ if \(\$\('#editdlg'\)\.open\) fitEditLines/, /^\$\('#editdlg'\)\.addEventListener\('click', e => \{ if \(e\.target\.id === 'editdlg'\)/,
];
P.REWRITE = [
  [/!\$\('#revdlg'\)\.open/g, "!(revdlg && revdlg.open)"],   // 요약 수정 창(revdlg) = 걷음 → 카드 수정 단추가 그 창 열림을 볼 때 빈 값이면 닫힌 것
  [/\bfetch\('articles\.json\?_=' \+ Date\.now\(\)\)/g, "__feed()"],   // 기사 목록 = 앱이 읽은 것(같은 3.9MB 를 두 번 안 받음)
  [/return 'api\/dl\?u=' \+ /g, "return '/api/dl?u=' + "],   // 저장 길(다른 출처 그림 = 서버 거쳐 받기) = 글줄로 href 에 박힘 → 맨 위 기준
  [/_dl\[_dl\.length - 1\] : document\.body;/g, "_dl[_dl.length - 1] : ROOT;"],   // 짧은 알림(qFlash) 자리 = 이 틀 안(옷이 .oa 안에만 있음)
  [/\bdocument\.body\.appendChild\(/g, "ROOT.appendChild("],   // 크게 보기 창(#lbox) 등 = 이 틀 안(같은 까닭)
  [/\bdocument\.documentElement\.style\.overflow = /g, "__noLock = "],   // 모달이 뒤 화면 스크롤을 잠그던 것 = 칸 안이라 안 잠금
  [/^document\.addEventListener\('click', e => \{(\s*)if \(e\.defaultPrevented\) return;(\s*)\/\/ 드래그/m, "__on(ROOT, 'click', e => {$1if (e.defaultPrevented) return;$2// 드래그"],   // 누름 그림 움직임 = 이 틀 안 단추만
  [/^document\.addEventListener\('click', e => \{(\s*)const b = e\.target\.closest\('\.dlbtn'\)/m, "__on(ROOT, 'click', e => {$1const b = e.target.closest('.dlbtn')"],   // 「받음」 표시 = 이 틀 안 저장 단추만
  [/\bwindow\.addEventListener\(/g, "__on(window, "],
  [/\bdocument\.addEventListener\(/g, "__on(document, "],
  [/\bdocument\.getElementById\(/g, "__byId("],
];
P.ICONS = [];
P.FILES = ["nm-svg.js", "nm-clip.js"];   // 옛 화면이 따로 읽던 것 가운데 기사 창이 쓰는 것(아이콘 글줄 · 입력칸 붙여넣기/복사/지우개)
// 대체 조각 = 채널 · SNS 것의 앞쪽 틀(듣기 · 타이머 · 주소 · 칸 찾기 · 기록 안 쌓기)은 그대로 같이 쓰고 · 뒤쪽(옛 기능 대신 서는 것)만 기사 창 것
P.prelude = () => {
  const base = read(new URL("./prelude.js", import.meta.url).pathname), mark = "  // ── 앱에 없는 옛 기능 대신 서는 것 ──";
  if (!base.includes(mark)) { console.error("prelude.js 에 나눔 줄이 없음"); process.exit(1); }
  return base.slice(0, base.indexOf(mark)) + read(new URL("./prelude-art.js", import.meta.url).pathname);
};
P.out = "ui/old-tabs/engine-art.ts";
// 판 = 기사 창(열린 채 박힘 · 닫기 × 뺌) + 그 창이 여는 작은 창 넷(뉴스 수정 · 카드 수정 · 이미지 수정 · 카드 변경)
P.markup = ({ cut, lit }) => {
  let dlg = cut(/<dialog id="dlg">[\s\S]*?<\/dialog>/, "기사 창");
  const x = /<button class="tool-x dlg-x" onclick="dlg\.close\(\)"[\s\S]*?<\/button>/;
  if (!x.test(dlg)) { console.error("판 조각 못 찾음: 기사 창 닫기 단추"); process.exit(1); }
  dlg = dlg.replace('<dialog id="dlg">', '<dialog id="dlg" open aria-label="뉴스 요약">').replace(x, "");   // 닫기 × = 칸 안이라 뺌(폰 = 앱 「목록」 단추)
  const fab = /\s*<!-- 요약 수정 FAB[\s\S]*?<button class="rev-fab" id="revFab"[\s\S]*?<\/button>/;   // 요약 수정 = 걷음(의류수거함 11-18)
  dlg = dlg.replace(fab, "");   // 원본(viewer)에서도 걷히면 없는 대로
  const ed = cut(/<dialog id="editdlg">[\s\S]*?<\/dialog>/, "카드 변경").replace(' onclick="editdlg.close()"', ' data-oa-x="editdlg"');   // 판 안 onclick="editdlg.close()" = 창 전역 이름 → 엔진이 틀 안에서 찾아 닫음
  const rev = cut(/<dialog id="crevdlg"[\s\S]*?<\/dialog>/, "카드 수정") + cut(/<dialog id="tredodlg"[\s\S]*?<\/dialog>/, "이미지 수정");
  fs.writeFileSync(APP + "ui/old-tabs/markup-art.ts", `// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs art · 옛 에디터 viewer/index.html 의 기사 창 판 그대로)
//   기사 창 = 열린 채 칸 안에 박힘(뒤 막 · 닫기 × 없음) · 그 창이 여는 작은 창 넷(카드 변경 · 뉴스 수정 · 카드 수정 · 이미지 수정)은 원본처럼 위에 뜸
export const ART_HTML = ${lit(dlg + ed + rev)};
`);
};
P.wrap = ({ PRELUDE, body, take }) => `// @ts-nocheck
/* eslint-disable */
// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs art 가 옛 에디터 viewer/index.html 에서 떼어 옴 · 대체 조각 = tools/prelude.js 앞쪽 + tools/prelude-art.js)
//   옛 「기사 창」(#dlg · open(a))이 돌던 코드 그대로(선언 ${take.size}개) · 문서 = 이 화면 틀(ROOT) · 듣기 · 타이머 = 끌 때 다 걷음
export function startOldArt(ROOT, host) {
${PRELUDE}
// ───────── 여기부터 원본 줄 ─────────
${body}
// ───────── 원본 줄 끝 ─────────
  const __first = load();   // 기사 목록(앱이 읽은 것) → DATA · 그 뒤 고른 기사를 그림
  const show = async (file) => { __want = file; try { await __first; } catch {} if (__dead || __want !== file) return; const a = DATA.find((x) => x.file === file); if (!a) { host.miss(file); return; } if (CUR === file && $('#mdbody').firstChild) return; await open(a); };
  return { show, refresh: () => { if (!__dead && DATA_LOADED) return load(); }, stop: () => { __stop(); } };
}
`;
export default P;
