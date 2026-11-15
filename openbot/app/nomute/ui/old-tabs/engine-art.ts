// @ts-nocheck
/* eslint-disable */
// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs art 가 옛 에디터 viewer/index.html 에서 떼어 옴 · 대체 조각 = tools/prelude.js 앞쪽 + tools/prelude-art.js)
//   옛 「기사 창」(#dlg · open(a))이 돌던 코드 그대로(선언 312개) · 문서 = 이 화면 틀(ROOT) · 듣기 · 타이머 = 끌 때 다 걷음
export function startOldArt(ROOT, host) {
  // ── 앱 안에서 돌리기 위한 틀(원본에 없던 줄) ──
  let __dead = false;
  const __offs = [];
  const __on = (t, ...a) => { t.addEventListener(...a); __offs.push(() => t.removeEventListener(...a)); };
  const __T = new Set(), __I = new Set(), __R = new Set();
  const setTimeout = (f, ms, ...a) => { const id = window.setTimeout(() => { __T.delete(id); if (!__dead) f(...a); }, ms); __T.add(id); return id; };
  const setInterval = (f, ms, ...a) => { const id = window.setInterval(() => { if (!__dead) f(...a); }, ms); __I.add(id); return id; };
  const requestAnimationFrame = (f) => { const id = window.requestAnimationFrame((t) => { __R.delete(id); if (!__dead) f(t); }); __R.add(id); return id; };
  const __never = () => 0;
  const __obs = (C) => (C ? class extends C { constructor(...a) { super(...a); __offs.push(() => this.disconnect()); } } : undefined);
  const ResizeObserver = __obs(window.ResizeObserver), IntersectionObserver = __obs(window.IntersectionObserver), MutationObserver = __obs(window.MutationObserver);
  const __stop = () => { __dead = true; for (const f of __offs.splice(0)) { try { f(); } catch {} } __T.forEach((i) => window.clearTimeout(i)); __I.forEach((i) => window.clearInterval(i)); __R.forEach((i) => window.cancelAnimationFrame(i)); __T.clear(); __I.clear(); __R.clear(); };
  // 주소 = 옛 화면은 사이트 맨 위(/)에서 돌았음 → 상대 주소를 맨 위 기준으로
  const __abs = (u) => (typeof u === "string" && !/^([a-z][a-z0-9+.-]*:|\/)/i.test(u) ? "/" + u : u);
  const fetch = (u, o) => window.fetch(__abs(u), o);
  // 화면 칸 = 이 틀 안에서만 찾음(앱 다른 화면과 id 안 섞임)
  const $ = (s) => ROOT.querySelector(s);
  const __byId = (id) => ROOT.querySelector("#" + CSS.escape(id));
  // 스크롤 = 앱 판(.nm-scroll) · 없으면 창
  const __sc = () => ROOT.closest(".nm-scroll");
  const __scrollTo = (a, b) => { const s = __sc() || window; if (a && typeof a === "object") s.scrollTo(a); else s.scrollTo(a, b); };
  const __scrollY = () => { const s = __sc(); return s ? s.scrollTop : window.scrollY; };
  // 깊이 보기 창(일별 상세 · 게시물 탐색)이 뒤로 가기 기록을 쌓던 것 = 안 쌓음(앱 길잡이 기록과 안 섞이게 · 닫기 = X · Esc)
  const history = { state: null, pushState() {}, replaceState() {}, back() {} };
  // ── 기사 창: 앱에 없는 옛 뼈대 대신 서는 것(원본에 없던 줄 · 형 11-15 「그때 시안을 여기에 붙일 수 있나?」) ──
  let __want = "", __noLock = "";
  // 기사 목록 = 앱이 읽은 것(host.feed · ../../news-data.ts newsListQuery 와 같은 /articles.json) → 원본 load() 가 받던 꼴({ ok, json() })로
  //   옛 화면은 사이트 맨 위(/)에서 돌아 그림 주소(cards/… · thumb_out/…)가 상대 길이었음 → 앱은 /office-app/ 아래라 받을 때 맨 위 기준으로 바꿔 둠(글줄로 박히는 src · href 까지 한 번에)
  const __absArt = (a) => { const c = a && a.cards; if (!c) return { ...a };   // 늘 새 그릇(원본 줄이 a.body · a.cards 를 채워 넣음 → 앱 목록 것과 안 섞이게)
    const th = (l) => (Array.isArray(l) ? l.map((t) => (t && typeof t === "object" && t.img ? { ...t, img: __abs(t.img) } : t)) : l);
    const vs = c.versions && typeof c.versions === "object" ? Object.fromEntries(Object.entries(c.versions).map(([k, l]) => [k, Array.isArray(l) ? l.map((v) => (v && v.img ? { ...v, img: __abs(v.img) } : v)) : l])) : c.versions;
    return { ...a, cards: { ...c, thumb_search: th(c.thumb_search), thumb_gen: th(c.thumb_gen), thumb_prompts_url: c.thumb_prompts_url ? __abs(c.thumb_prompts_url) : c.thumb_prompts_url, images: Array.isArray(c.images) ? c.images.map(__abs) : c.images, versions: vs } }; };
  const __feed = () => host.feed().then((j) => ({ ok: true, status: 200, json: async () => ({ ...j, articles: (j.articles || []).map(__absArt) }) }));
  // 본문 그리기 = 옛 화면이 따로 읽던 marked · DOMPurify(앱이 건넴 · 같은 판 12.0.2 · 줄바꿈 = <br> 켠 채)
  const marked = host.marked, DOMPurify = host.purify;
  // 판 안 작은 창들 = 원본은 창 전역 이름(id)으로 불렀음 → 이 틀 안에서 찾음
  const revdlg = $("#revdlg"), editdlg = $("#editdlg");
  __on(ROOT, "click", (e) => { const b = e.target.closest && e.target.closest("[data-oa-x]"); if (b) { const d = __byId(b.getAttribute("data-oa-x")); if (d && d.close) d.close(); } });
  // 옛 첫 화면 목록 · 알림함 · 잠금 화면 = 앱 것이 대신(여기선 빈 손)
  let CURTAB = "feed", NM_SET = {};
  const SCRAP_LOADED = false;
  const render = () => {};   // 옛 목록 다시 그리기 = 앱 왼쪽 목록이 같은 자료(host.feed)를 봄
  const dateHead = () => {}, renderScrap = () => {}, renderMsgBadge = () => {}, renderMsgList = () => {}, setAuthStale = () => {};
  const isComposingModalOpen = () => !!ROOT.querySelector("dialog[open]:not(#dlg)");   // 작은 창(수정 요청 · 카드 변경 · 크게 보기)이 떠 있는 동안 = 뒤 다시 그리기 미룸(원본과 같은 뜻)
  const isLocked = () => false;
  // 로그인 끝남 판정 = 옛 머리 줄 지킴이(window.nmAuthCheck)가 앱엔 없음 → 「회선」으로만 답함(원본 nmAuthNote 의 「판단 못 함」 갈래 그대로)
  const nmAuthNote = () => Promise.resolve("net");
  const __RETRY_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>';
  const MSG_ACTIONS = { "data-retry": { label: "다시 받아오기", svg: __RETRY_SVG, fn: () => {} }, relogin: { label: "다시 로그인", svg: __RETRY_SVG, fn: () => { try { window.location.reload(); } catch {} } } };
  // 「+ AI」 = 앱 이미지 생성 창(../../thumb-gen.tsx GenPane · 같은 /api/genimg) · 옛 #genidlg(스튜디오 탭과 한 몸)는 안 가져옴
  const openGenIdlg = (file) => { try { host.gen(file); } catch {} };
  const makeDraggable = () => {};

// ───────── 여기부터 원본 줄 ─────────
const CHECK_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d=" M8,-5.5 C8,-5.5 -3,5.5 -3,5.5 C-3,5.5 -8,0.5 -8,0.5" transform="matrix(1 0 0 1 16 15.5)"/></svg>';
const COPY_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-3.5,6.5 C-3.5,6.5 -4.5,6.5 -4.5,6.5 C-5.6,6.5 -6.5,5.6 -6.5,4.5 C-6.5,4.5 -6.5,-4.5 -6.5,-4.5 C-6.5,-5.6 -5.6,-6.5 -4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C5.6,-6.5 6.5,-5.6 6.5,-4.5 C6.5,-4.5 6.5,-3.5 6.5,-3.5" transform="matrix(1 0 0 1 12.5 12.5)"/><path d=" M-4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C5.6,-6.5 6.5,-5.6 6.5,-4.5 C6.5,-4.5 6.5,4.5 6.5,4.5 C6.5,5.6 5.6,6.5 4.5,6.5 C4.5,6.5 -4.5,6.5 -4.5,6.5 C-5.6,6.5 -6.5,5.6 -6.5,4.5 C-6.5,4.5 -6.5,-4.5 -6.5,-4.5 C-6.5,-5.6 -5.6,-6.5 -4.5,-6.5z" transform="matrix(1 0 0 1 19.5 19.5)"/></svg>';
const PASTE_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M16,4 C16,4 18,4 18,4 C19.11,4 20,4.89 20,6 C20,6 20,20 20,20 C20,21.11 19.11,22 18,22 C18,22 6,22 6,22 C4.89,22 4,21.11 4,20 C4,20 4,6 4,6 C4,4.89 4.89,4 6,4 C6,4 8,4 8,4" transform="matrix(1 0 0 1 4 4)"/><path d=" M9,2 C9,2 15,2 15,2 C15.55,2 16,2.45 16,3 C16,3 16,5 16,5 C16,5.55 15.55,6 15,6 C15,6 9,6 9,6 C8.45,6 8,5.55 8,5 C8,5 8,3 8,3 C8,2.45 8.45,2 9,2z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const ERASE_SVG = '<svg width="13" height="13" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,4 C21,4 8,4 8,4 C8,4 1,12 1,12 C1,12 8,20 8,20 C8,20 21,20 21,20 C22.11,20 23,19.11 23,18 C23,18 23,6 23,6 C23,4.89 22.11,4 21,4z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,9 C12,9 18,15 18,15 M18,9 C18,9 12,15 12,15" transform="matrix(1 0 0 1 4 4)"/></svg>';
const UNDO_SVG = '<svg width="13" height="13" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M20,20 C20,20 20,13 20,13 C20,10.79 18.21,9 16,9 C16,9 4,9 4,9 M9,14 C9,14 4,9 4,9 C4,9 9,4 9,4" transform="matrix(1 0 0 1 4 4)"/></svg>';
const DOWNLOAD_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,15 C21,15 21,19 21,19 C21,20.11 20.11,21 19,21 C19,21 5,21 5,21 C3.9,21 3,20.11 3,19 C3,19 3,15 3,15" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,15 C12,15 12,3 12,3 M7,10 C7,10 12,15 12,15 C12,15 17,10 17,10" transform="matrix(1 0 0 1 4 4)"/></svg>';
const WARN_SVG = '<svg width="14" height="14" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-1.57,-7.95 C-1.57,-7.95 -10.04,6.19 -10.04,6.19 C-10.6,7.15 -10.27,8.37 -9.31,8.93 C-9.01,9.1 -8.68,9.19 -8.33,9.19 C-8.33,9.19 8.61,9.19 8.61,9.19 C9.71,9.18 10.6,8.28 10.58,7.17 C10.58,6.83 10.49,6.49 10.32,6.19 C10.32,6.19 1.85,-7.95 1.85,-7.95 C1.27,-8.89 0.04,-9.19 -0.9,-8.62 C-1.18,-8.45 -1.41,-8.22 -1.57,-7.95z" transform="matrix(1 0 0 1 15.86 15.81)"/><path d=" M12,9 C12,9 12,13 12,13" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,17 C12,17 12,17 12,17z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const ARROW_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,5 C12,5 19,12 19,12 C19,12 12,19 12,19 M5,12 C5,12 19,12 19,12" transform="matrix(1 0 0 1 4 4)"/></svg>';
const CHEV_L_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(1 0 0 1 16 16)"/></svg>';
const CHEV_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(-1 0 0 -1 16 16)"/></svg>';
const EDIT_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M16.5,3.5 C17.33,2.67 18.67,2.67 19.5,3.5 C20.33,4.33 20.33,5.67 19.5,6.5 C19.5,6.5 7,19 7,19 C7,19 3,20 3,20 C3,20 4,16 4,16 C4,16 16.5,3.5 16.5,3.5z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,20 C12,20 21,20 21,20" transform="matrix(1 0 0 1 4 4)"/></svg>';
const LAYERS_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M2,17 C2,17 12,22 12,22 C12,22 22,17 22,17" transform="matrix(1 0 0 1 4 4)"/><path d=" M2,12 C2,12 12,17 12,17 C12,17 22,12 22,12" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,2 C12,2 2,7 2,7 C2,7 12,12 12,12 C12,12 22,7 22,7 C22,7 12,2 12,2z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const G_SVG = '<svg viewBox="2 2 20 20" fill="currentColor"><path d="M12.04 10.96v2.32h3.84c-.16 1-1.15 2.9-3.84 2.9-2.31 0-4.2-1.91-4.2-4.27s1.89-4.27 4.2-4.27c1.32 0 2.2.56 2.7 1.05l1.84-1.77c-1.18-1.1-2.68-1.77-4.54-1.77-3.74 0-6.74 3-6.74 6.76s3 6.76 6.74 6.76c3.89 0 6.47-2.74 6.47-6.59 0-.44-.05-.78-.11-1.12l-6.36.04z"/></svg>';
const ERASE_UNDO_MS = 10000;
async function clipCopy(text, btn, after) {   // 복사 → ✓ 피드백
  try { await navigator.clipboard.writeText(text || ''); } catch {}
  btn.innerHTML = CHECK_SVG; btn._icon = 'check'; btn.classList.add('ok');   // _icon 갱신 = 'ok' 해제 후 refresh가 원아이콘 복원하게(번쩍 가드와 짝)
  setTimeout(() => { btn.classList.remove('ok'); after(); }, 1200);
}
async function clipPasteText() {   // 클립보드 텍스트 읽기(폴백 포함) — 칩·textarea 공용
  try { if (navigator.clipboard && navigator.clipboard.readText) { const t = await navigator.clipboard.readText(); if (t) return t; } } catch {}
  return await clipPasteFallback();   // readText 거부/빈값 → 사용자 네이티브 붙여넣기 받는 입력
}
function clipPasteFallback() {
  return new Promise(resolve => {
    const ov = document.createElement('dialog'); ov.className = 'pastefb';   // dialog = top-layer(카드변경 등 열린 모달 위에도 보장)
    ov.innerHTML = '<div class="pastefb-box"><div class="pastefb-msg">아래 칸을 <b>길게 눌러 “붙여넣기”</b> 하면 자동 반영돼</div>'
      + '<textarea class="pastefb-ta" placeholder="여기에 붙여넣기" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>'
      + '<div class="pastefb-row"><button type="button" class="pastefb-btn pastefb-cancel">취소</button><button type="button" class="pastefb-btn pastefb-ok">적용</button></div></div>';
    ROOT.appendChild(ov);
    const ta = ov.querySelector('.pastefb-ta'); let done = false;
    const finish = v => { if (done) return; done = true; try { ov.close(); } catch {} ov.remove(); resolve(v || null); };
    ta.addEventListener('paste', () => setTimeout(() => { if (ta.value) finish(ta.value); }, 30));   // 붙여넣기 즉시 자동 반영
    ov.querySelector('.pastefb-ok').onclick = () => finish(ta.value);
    ov.querySelector('.pastefb-cancel').onclick = () => finish(null);
    ov.addEventListener('cancel', e => { e.preventDefault(); finish(null); });   // ESC
    ov.addEventListener('click', e => { if (e.target === ov) finish(null); });   // 백드롭 탭
    try { ov.showModal(); } catch { ov.setAttribute('open', ''); }
    setTimeout(() => { try { ta.focus(); } catch {} }, 60);
  });
}
function attachCopyPaste(el, withErase) {   // 빈칸=붙여넣기 / 내용 있으면 [복사][붙여넣기](+지우개) · 지우개 누르면 비움→~10초 되돌리기. thumb.html 정본과 동일 로직(운영자 260627)
  if (!el || el._clipBound) return; el._clipBound = true;   // 중복 부착 가드
  const wrap = document.createElement('div'); wrap.style.position = 'relative'; wrap.classList.add('iowrap');
  el.parentNode.insertBefore(wrap, el); wrap.appendChild(el);
  const split = true;   // 붙여넣기 항상 유지 + 복사 별도(좌측)
  const nBtn = (split ? 2 : 1) + (withErase ? 1 : 0);
  el.style.paddingRight = (el.tagName !== 'TEXTAREA' || el.classList.contains('ta1l')) ? (14 + nBtn * 32) + 'px' : '42px';   // 텍스트칸 = 버튼이 1행 위 테두리로 떠 안 겹침 → 42 유지   // ⚠ 판정 축 = 태그가 아니라 **첫 줄이 세로중앙인가** — `.ta1l`(자동 성장 한 줄 칸 · 260810)은 태그만 textarea고 빈 칸일 때 한 줄 높이라 42로 주면 첫 줄 글자가 클립 3종 밑으로 들어간다 · 짝 = thumb.html 정본 동문
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'iobtn iobtn-edge' + (withErase ? ' iobtn-pp' : ''); wrap.appendChild(btn);
  let copyB = null;
  if (split) {
    copyB = document.createElement('button'); copyB.type = 'button'; copyB.className = 'iobtn iobtn-edge iobtn-copy' + (withErase ? ' iobtn-copy-e' : '') + ' iobtn-hide';
    copyB.innerHTML = COPY_SVG; copyB.setAttribute('aria-label', '복사'); copyB.title = '복사';
    copyB.onclick = ev => { ev.preventDefault(); clipCopy(el.value, copyB, refresh); };
    wrap.appendChild(copyB);
  }
  let eraser = null, undoTimer = null, undoVal = '', prog = false, armUndo = null;   // prog = 프로그램적 변경(지움/복원) = 되돌리기창 종료 트리거 아님 · armUndo = 되돌리기 무장(지움·붙여넣기 공용)
  const setIcon = (b, svg, key) => { if (b._icon !== key) { b.innerHTML = svg; b._icon = key; } };   // 아이콘 동일하면 innerHTML 재대입 안 함 = 타이핑마다 SVG 파괴·재생성(번쩍거림) 차단(운영자 260628)
  const refresh = () => {
    const filled = (el.value || '').trim().length > 0;
    if (!btn.classList.contains('ok')) { setIcon(btn, PASTE_SVG, 'paste'); btn.dataset.mode = 'paste'; btn.setAttribute('aria-label', '붙여넣기'); btn.title = '붙여넣기'; }
    if (copyB && !copyB.classList.contains('ok')) { setIcon(copyB, COPY_SVG, 'copy'); copyB.classList.toggle('iobtn-hide', !filled); }
    if (eraser) eraser.classList.toggle('iobtn-off', !filled && !eraser.classList.contains('iobtn-undo'));
  };
  if (withErase) {
    eraser = document.createElement('button'); eraser.type = 'button'; eraser.className = 'iobtn iobtn-edge iobtn-erase';
    eraser.innerHTML = ERASE_SVG; eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기';
    const exitUndo = () => {
      if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
      eraser.classList.remove('iobtn-undo'); eraser.innerHTML = ERASE_SVG;
      eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기'; refresh();
    };
    armUndo = prev => {   // 직전 입력(prev) 복원용 되돌리기 무장 — 지움·붙여넣기 공용
      undoVal = prev;
      eraser.classList.remove('iobtn-off'); eraser.classList.add('iobtn-undo');
      eraser.innerHTML = UNDO_SVG; eraser.setAttribute('aria-label', '되돌리기'); eraser.title = '되돌리기 (직전 입력 복원)';
      if (undoTimer) clearTimeout(undoTimer); undoTimer = setTimeout(exitUndo, ERASE_UNDO_MS);
    };
    eraser.onclick = ev => {
      ev.preventDefault();
      if (el.disabled) return;   // 비활성 칸 우회 입력 차단(운영자 260628)
      if (eraser.classList.contains('iobtn-undo')) {   // 되돌리기 모드 = 직전 입력 복원
        prog = true; el.value = undoVal; el.dispatchEvent(new Event('input', { bubbles: true })); prog = false;
        try { el.focus(); } catch {} exitUndo(); return;
      }
      if (!(el.value || '').length) return;
      const prev = el.value;
      prog = true; el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); prog = false;
      try { el.focus(); } catch {}
      armUndo(prev);
    };
    el.addEventListener('input', () => { if (!prog && undoTimer) exitUndo(); });
    wrap.appendChild(eraser);
  }
  btn.onclick = async ev => {
    ev.preventDefault();
    if (el.disabled) return;   // 비활성 칸 우회 입력 차단(운영자 260628)
    const selS = el.selectionStart, selE = el.selectionEnd;   // await 전 캐럿/선택 스냅
    const t = await clipPasteText();   // readText→폴백 공용(통일 기틀)
    if (t) {
      const prev = el.value;
      prog = true;
      if (typeof el.setRangeText === 'function' && typeof selS === 'number') el.setRangeText(t, selS, selE, 'end');   // 캐럿/선택영역에 삽입(기존 보존) = 일반 붙여넣기 · 덮어쓰기 폐지(운영자 260702)
      else el.value += t;   // 폴백 = 끝에 이어붙임
      el.dispatchEvent(new Event('input', { bubbles: true })); prog = false;   // 삽입 후 수동 input(refresh·자간 등) · prog=되돌리기창 즉시종료 방지
      if (armUndo && prev) armUndo(prev);   // 붙여넣기도 되돌리기 가능(직전 전체값 복원·운영자 260628)
    }
    refresh();   // 붙여넣기(캐럿삽입)
  };
  el.addEventListener('input', refresh); refresh();
}
let DATA = [], DATA_LOADED = false;
let FEED_GEN = '';
let CUR = '';
let CUR_A = null;
let CUR_STATE = '';
let FEED_ERR = '', FEED_RETRIED = false;
let LOAD_SEQ = 0;
const fetchFeedLive = () => fetch('api/feedlive').then(r => r.ok ? r.json() : null).then(d => (d && Array.isArray(d.rows)) ? d.rows : []).catch(() => []);
async function load() {
  const _g = ++LOAD_SEQ;
  const _liveP = fetchFeedLive();
  try {
    const r = await __feed();
    if (!r.ok) throw new Error('HTTP ' + r.status);   // 오류 응답 본문이 JSON이어도 빈 피드로 착각하지 않는다
    const j = await r.json();
    if (_g !== LOAD_SEQ) return;   // stale 응답 폐기 — 더 새 load가 떠 있음(그쪽이 렌더)
    DATA = j.articles || [];
    const _live = await Promise.race([_liveP, new Promise(res => setTimeout(() => res([]), 4000))]);   // 4s 상한 = 정적 렌더를 붙잡지 않는다
    if (_g !== LOAD_SEQ) return;
    if (_live.length) {
      const _have = new Set(DATA.map(a => a.file));
      const _add = _live.filter(x => x && x.file && !_have.has(x.file));
      if (_add.length) DATA = [..._add, ...DATA].sort((a, b) => (a.file < b.file ? 1 : a.file > b.file ? -1 : 0));   // 빌드와 같은 최신순(파일명 YYMMDD-HHMM)
    }
    FEED_GEN = j.generated || '';   // 이 피드가 만들어진 배포본 시각 — 대기열 lag 행이 '어디까지 반영됐나'를 그 자리서 말한다(배포 적체 진단 · 260803)
    dateHead(j.count || DATA.length);
    FEED_ERR = ''; FEED_RETRIED = false;
    setAuthStale(false);   // 조회 성공 = 세션 유효(다른 탭 재로그인 등) → 만료 항목 소등
  } catch(e) {
    if (_g !== LOAD_SEQ) return; if (!DATA_LOADED) DATA = []; FEED_ERR = DATA.length ? '' : 'srv'; const d = $('#dhCnt'); if (d) d.textContent = 'articles.json 없음';
    if (e instanceof TypeError || !DATA.length) nmAuthNote().then(k => { if ((k === 'auth' || k === 'net') && _g === LOAD_SEQ) { if (e instanceof TypeError) { const d2 = $('#dhCnt'); if (d2) d2.textContent = k === 'auth' ? '로그인 만료' : '연결 끊김'; } if (!DATA.length && FEED_ERR !== k) { FEED_ERR = k; render(); } } });   // 빈 피드 실패 = 응답 코드 실패(401·403 등)도 만료·회선 판정(수집함과 같은 축)   // fetch reject = Access 만료(302→CORS)·회선 → 원인 확정 후 문구 교정('없음' 오분류 차단)
  }   // last-good 유지(분신8 260706): 60s 폴 중 네트워크 blip 1회에 피드 전체가 '결과 없음'으로 비워지던 것 차단 — 첫 로드 실패만 빈 상태
  const _firstLoad = !DATA_LOADED; DATA_LOADED = true;   // 첫 로드 완료 표시
  render();
  if (_firstLoad && CURTAB === 'scrap' && SCRAP_LOADED) renderScrap();   // 첫 DATA 도착 = 수집함 1회 재렌더(pickInFeed 정확·Picking 깜빡 보정)
  if ($('#dlg').open && CUR) {
    const a = DATA.find(x => x.file === CUR);
    if (a) await ensureDetail(a);   // 폴링이 DATA를 통째 교체 → 열린 기사의 lazy body/md 재로드(없으면 재렌더가 빈 카드로 깨짐)
    if (a && $('#mdbody .md-deterr')) { if (!a._detErr && a.body) await open(a); else paintDetErr(a); }   // 실패 줄이 떠 있는 기사 = 폴이 받아 오면 자동 복구 · 계속 실패면 사유만 갱신
    // 상태 안 바뀌면 재렌더 생략 — 60초 폴링이 펼쳐둔 프롬프트를 도로 접는 것 방지
    if (a && ((a.cards && a.cards.state) || '') !== CUR_STATE) { cardSec(a); feedSec(a); }
    // 썸네일 섹션 라이브 동기화 — 픽 직후 '생성 중' 자리표시를 thumb_gen 도착 시 실제 썸네일로 자동 교체(폴링). 수동 '다시 만들기'(THUMB_REDO)는 아래 전용 경로가 처리하므로 제외.
    if (a && !THUMB_REDO.has(CUR)) {
      const cur = $('#mdbody .thumbsec'), sig = thumbSecSig(a);
      if ((cur ? cur.dataset.sig : '') !== sig) {
        const fresh = thumbSec(a);
        if (cur && fresh) cur.replaceWith(fresh);
        else if (cur) cur.remove();
        else if (fresh) { const h1 = $('#mdbody h1'); (h1 ? h1.insertAdjacentElement('afterend', fresh) : $('#mdbody').insertAdjacentElement('afterbegin', fresh)); }
      }
    }
  }
  // 변경 발사 후 자동 제자리 교체 — Map에서 새 이미지(?v 갱신) 온 카드만 빼고 1회 재구성(스크롤 보존).
  if (REPENDING.size && $('#dlg').open && CUR) {
    const a = DATA.find(x => x.file === CUR), c = a && a.cards;
    if (c && c.images && c.images.length) {
      const model = buildFeedModel(a); let swapped = false;
      for (const [k, v] of [...REPENDING]) {
        if (v.file !== CUR) continue;
        // 완료판정 = oldImg(발사 시점 card.versions[cur].image)와 *같은 소스*인 model.versions[cur].image로 비교.
        // ⚠️ c.images[slot](R2/name 경로)은 versions 경로(oldImg)와 URL 체계가 달라, 2판+(이미 한 번 수정) 카드선
        //    내용 무관 항상 !== → 첫 폴(빌드 전)에 조기 '완료' 오판 → 옛 이미지로 되돌리고 폴 중단 = 미반영(운영자 260630).
        const mm = model.find(m => m.n === v.card);
        let done;
        if (v.baseVer != null) {   // 다중판으로 시작 = 같은 카드에 요청 직전 K 보다 큰 판(K+2 도 됨)이 보일 때만 — 구판을 골라 고쳐도 기존 최신판으로 조기 완료하지 않음 · 목록이 잠깐 빠져도 URL 비교로 안 돌아감
          const kNow = mm ? cardMaxVer(mm) : null;
          done = kNow != null && kNow > v.baseVer;
        } else {
          const newImg = mm ? ((mm.versions[mm.cur] || {}).image || null) : null;
          done = !!newImg && newImg !== v.oldImg;
        }
        if (done) { REPENDING.delete(k); swapped = true; }
      }
      if (swapped) {   // 새 이미지(+버전) 반영 — 캐러셀 위치 보존하며 피드 재구성(고정 UI가 현재 사진에 재바인딩)
        const tr = $('#feedsec .feedtrack');
        const keepIdx = tr ? Math.round(tr.scrollLeft / (tr.clientWidth || 1)) : 0;
        feedSec(a, keepIdx);
      }
    }
  }
  // 썸네일 '수정·재생성' 완료 감지 — per-sid: 그 화풍 img(?v=)가 바뀌면 그 sid만 해제. 어느 하나 완료 시 섹션 재렌더(완료분=새 이미지 · 잔여분=진행바 유지=thumbStatic 복원)·6분 타임아웃.
  if (THUMB_REDO.size && $('#dlg').open && CUR && THUMB_REDO.has(CUR)) {
    const a = DATA.find(x => x.file === CUR);
    if (a) {
      const rec = THUMB_REDO.get(CUR); let dirty = false;
      for (const base of Object.keys(rec.snap || {})) {
        if (genGenCount(a, base) > rec.snap[base]) { delete rec.snap[base]; dirty = true; }   // 그 화풍 계열이 +1장 = 수정본 도착(운영자 260807) — 구판은 원본 img ?v= 변화를 봤는데 이제 원본은 안 바뀐다
      }
      if (Date.now() - rec.t0 > 600000) {   // 10분 타임아웃(러너 큐+Pages 배포로 6분 초과 가능·평의회 async)
        THUMB_REDO.delete(CUR); dirty = true;
        if (typeof qFlash === 'function') qFlash('이미지 수정이 지연되거나 실패했을 수 있어 — 안 바뀌면 다시 시도해', WARN_SVG);   // 무피드백 침묵 타임아웃 해소(revise 20분 폴백 패턴 계승)
      } else if (!Object.keys(rec.snap || {}).length) THUMB_REDO.delete(CUR);   // 전부 완료(방어적 ||{} — 평의회 통합)
      if (dirty) {
        const old = $('#mdbody .thumbsec'), fresh = thumbSec(a);
        if (old && fresh) old.replaceWith(fresh); else if (old) old.remove();
      }
    }
  }
  reapplyReshooting();   // 재렌더(상태변화·교체)로 사라진 대기 카드 잠금 배지 재적용
}
function repDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  if (!m) return esc(date || '');
  const W = ['일','월','화','수','목','금','토'];
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return `${+m[2]}/${+m[3]} (${W[d.getDay()]})`;
}
function repDateTime(a) {
  const base = repDate(a.date);
  const t = (a.time || '').trim();
  if (!/^\d{1,2}:\d{2}$/.test(t)) return base;
  const est = a.time_est && String(a.time_est).trim() && String(a.time_est).trim() !== 'false';   // 추정 시각이면 "(추정)" 꼬리표(운영자 260621)
  return `${base} ${esc(t)}${est ? ' (추정)' : ''}`;
}
function inDateTime(a) {
  const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || '');
  if (!m) return { txt: '', today: false };
  const W = ['일','월','화','수','목','금','토'];
  const d = new Date(2000 + +m[1], +m[2] - 1, +m[3]);
  return { txt: `${+m[2]}/${+m[3]} (${W[d.getDay()]}) ${m[4]}:${m[5]}`, today: `${m[1]}${m[2]}${m[3]}` === todayYMD6() };
}
const biasZone = v => { v = Math.min(10, Math.max(1, v)); return v <= 2 ? '강좌' : v <= 4 ? '좌' : v <= 6 ? '중립' : v <= 8 ? '우' : '강우'; };
const biasZoneHtml = v => `<span class="biasv">${biasZone(v)} </span><span class="biasnum">${v}</span>`;
const biasFlowHtml = (N, M) => {   // 원문 N → 요약 M (보정 표기 포함). 보정0이면 단일값.
  const d = M - N;
  if (!d) return biasZoneHtml(N);
  const corr = ` <span class="biaspar">(</span><span class="biascorr">${d > 0 ? '+' : '−'}${Math.abs(d)}</span><span class="biaspar"> / </span><span class="biasdir">${d > 0 ? '우' : '좌'} 보정</span><span class="biaspar">)</span>`;
  return `${biasZoneHtml(N)}${corr} <span class="biasar">${ARROW_R_SVG}</span> ${biasZoneHtml(M)}`;
};
const CAT_MAP = { '사회':'사회','정치':'정치','시사':'사회','경제':'경제','문화':'문화','국제':'국제','외교':'국제','테크':'테크','과학':'테크','IT':'테크','AI':'테크','스포츠':'문화','연예':'문화' };
const CAT_COLOR = { '정치':'var(--cat-pol)','사회':'var(--cat-soc)','경제':'var(--cat-eco)','국제':'var(--cat-intl)','문화':'var(--cat-cul)','테크':'var(--cat-tech)' };
function catBucket(cat) { const c = (cat || '').trim(); return CAT_MAP[c] || (['정치','사회','경제','문화','국제','테크'].includes(c) ? c : ''); }
function articleAgeH(a) {   // 보도(발행) 나이 — a.date(+a.time)=KST → Date.UTC(−9h)로 절대시각 고정(브라우저 TZ 무관·feedAgeH와 동일 기준). 무효=1e7(relAge 9000 가드 밖 → 폴백 · 옛 999는 사다리 '달' 티어에 걸려 가짜 "1달 전" 회귀라 상향·260621).
  a = a || {};   // null 방어
  const dm = /^(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/.exec(String(a.date || ''));
  if (!dm) return 1e7;
  const tm = /^(\d{1,2}):(\d{2})/.exec(String(a.time || '').trim());
  const t = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], (tm ? +tm[1] : 0) - 9, tm ? +tm[2] : 0);
  return isNaN(t) ? 1e7 : Math.max(0, (Date.now() - t) / 3600000);
}
function feedAgeH(a) {
  const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || '');
  if (m) return Math.max(0, (Date.now() - Date.UTC(2000 + +m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5])) / 3600000);   // 파일명=KST wall-clock → UTC instant(−9h) = 브라우저 TZ 무관·KST 고정(수집함 scTs와 동일 절대시각 기준)
  return articleAgeH(a);
}
async function ensureDetail(a) {
  if (!a || !a.file) return;
  const ver = (a.rev || 0) + '.' + ((a.cards && a.cards.rev) || 0) + '.' + ((a.cards && a.cards.updated) || '');
  if (a._detVer === ver && a.body != null) return;   // 이 버전 이미 로드됨
  if (a._live && a.body != null) { a._detVer = ver; return; }   // 빌드 전 라이브 행 = 본문 동봉(정적 detail 아직 없음)
  try {
    const r = await fetch('detail/' + encodeURIComponent(a.file) + '.json?v=' + encodeURIComponent(ver));
    if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });   // 오류 응답을 '빈 본문 로드 완료'로 캐시하지 않는다(다음 열기·폴에서 다시 받는다)
    const d = await r.json();
    a.body = d.body || '';
    if (!a.cards) a.cards = {};
    a.cards.md = d.cards_md || '';
    a._detVer = ver; a._detErr = ''; a._detCode = 0;
  } catch (e) {   // 실패해도 렌더는 진행 — 대신 사유를 남겨 open()이 요약 자리에 사유 1줄 + 다시 받아오기를 그린다(QA 261019 S1-18 「조용히 빈칸」)
    if (a.body == null) a.body = '';
    const net = isNetErr(e);
    a._detErr = net ? 'net' : 'srv'; a._detCode = (e && e.status) || 0;   // 회선(fetch reject) · 서버(HTTP 오류·JSON 아님) — 입력·외부·코드 원인을 섞지 않는다
    if (net || a._detCode === 401 || a._detCode === 403) nmAuthNote().then(k => {   // 만료(Access 302→CORS reject·401/403) = 원인 확정 후 '다시 로그인'으로 교정(피드 FEED_ERR 판정 축 계승)
      if (k === 'auth' && a._detErr && a._detErr !== 'auth') { a._detErr = 'auth'; paintDetErr(a); }
    });
  }
}
function paintDetErr(a) {
  const md = $('#mdbody'); if (!md || !a || CUR !== a.file) return;
  const old = md.querySelector('.md-deterr'), sig = (a._detErr || '') + ':' + (a._detCode || 0);
  if (!a._detErr || a.body) { if (old) old.remove(); return; }
  if (old && old.dataset.sig === sig) return;
  const box = document.createElement('div'); box.className = 'md-deterr'; box.dataset.sig = sig; box.setAttribute('role', 'status');
  box.innerHTML = scrapErrHtml(a._detErr, '요약 본문');
  const line = box.firstElementChild, txt = line && line.firstChild;
  if (a._detErr === 'srv' && a._detCode && txt && txt.nodeType === 3) txt.textContent += ' (HTTP ' + a._detCode + ')';   // 서버 사유 = 응답 코드까지(404 = 아직 배포 전·파일 없음)
  const b = box.querySelector('.md-actbtn');
  if (b) b.onclick = async () => {
    if (a._detErr === 'auth') return MSG_ACTIONS.relogin.fn(b);
    b.disabled = true; const sp = b.querySelector('span'); if (sp) sp.textContent = '받는 중…';
    await ensureDetail(a);
    if (CUR !== a.file) return;
    if (!a._detErr) { open(a); return; }   // 회복 = 기사 창을 같은 경로로 다시 그린다(요약·카드 섹션 동시 복구)
    b.disabled = false; if (sp) sp.textContent = '아직 안 돼 — 다시';   // 실패 = 재시도 여지(feedRetry 문법)
    paintDetErr(a);
  };
  if (old) old.replaceWith(box); else md.append(box);
}
async function open(a) {
  CUR = a.file; CUR_A = a;
  await ensureDetail(a);
  if (CUR !== a.file) return;   // 로딩 중 다른 기사로 이동했으면 이 렌더 폐기(레이스 가드)
  const md = $('#mdbody');
  md.innerHTML = DOMPurify.sanitize(marked.parse(a.body || ''));
  decorate(md);
  addCopyButtons(md);
  md.insertAdjacentHTML('afterbegin', overviewMeta(a));   // Z: 요약 헤더 아래 기본 개요(지침칩 대체)
  const _h1c = md.querySelector('h1');   // 화면에 보이는 그 제목(AI 헤드라인) 그대로 복사 (운영자 260620·260627 표시값 우선 정정)
  const _ttl = _h1c ? (_h1c.textContent.trim() || a.title || '') : '';   // ⚠️ 표시값(h1=AI 헤드) 우선 — a.title(원본 스크랩 제목)이 아니라 화면에 보이는 제목을 복사(불일치 버그 봉합) · 아래 기사 타이틀 중복대조와 공용
  if (_h1c && _ttl) tapCopy(_h1c, _ttl);   // 우상단 복사버튼 폐지 → 제목 탭 = 복사(운영자 260805 "복사 버튼이 나란히 있으니 버그같은데 · 둘다 제목 클릭 > 복사")
  // 기사 원래 타이틀(기자가 뽑은 헤드 = frontmatter title) = 개요메타 아래·요약 타이틀 위(운영자 260805 "기자들이 뽑은 것이라 퀄리티가 제법 있어") — 표현·간격 = 위 CSS .md-srct(h1 100% 사본).
  // ⚠️ div로 그린다(h1 태그 금지) — md.querySelector('h1')이 썸네일 후보 박스·외신 원문제목·타이틀 복사·다운로드 헤더의 공용 앵커라, 두 번째 h1이 생기면 그 넷이 전부 이 줄을 물어 오작동한다.
  { const _st = (a.title || '').trim();
    const _tkey = s => String(s).replace(/^\s*\p{Extended_Pictographic}️?\s*/u, '').replace(/\s+/g, '');   // 선두 토픽 이모지·공백 무시 비교(피드 목록 이모지 앞자름 관용구 계승)
    if (_st && _tkey(_st) !== _tkey(_ttl)) {   // 옛 분석분(H1 = 원본 제목 그대로 · 260805 실측 = 표시분 559건 중 117건)은 같은 제목이 2줄 = 잡음 → 생략
      const _sd = document.createElement('div'); _sd.className = 'md-srct'; _sd.textContent = _st;   // textContent = XSS 안전(.md-orig 문법 계승)
      tapCopy(_sd, _st);   // 복사 = 요약 타이틀과 같은 탭 복사(버튼 0 = 두 줄이 같은 문법)
      if (_h1c) _h1c.insertAdjacentElement('beforebegin', _sd);
      else { const _om = md.querySelector('.ovmeta'); if (_om) _om.insertAdjacentElement('afterend', _sd); }   // H1 없는 본문(요약 유실·빈 상태) 폴백 = 개요메타 바로 아래
    } }
  const tsec = thumbSec(a);   // 썸네일 후보(검색 + AI생성 2화풍) — 기사 제목 바로 아래
  if (tsec) { const h1 = md.querySelector('h1'); (h1 ? h1.insertAdjacentElement('afterend', tsec) : md.insertAdjacentElement('afterbegin', tsec)); }
  if (a.title_orig && _h1c) { const _od = document.createElement('div'); _od.className = 'md-orig'; _od.textContent = a.title_orig; _h1c.insertAdjacentElement('afterend', _od); }   // 외신 = 번역 제목(H1) *바로 아래* 원문 기사 타이틀 MUT 1줄 → 그 다음이 구분선(다음 섹션 border-top) — 운영자 260703 확정 배치("제목 아래 mut·그 다음 구분선" · 옛 하단 배치 폐지의 재배치). ⚠️ tsec 삽입 *뒤*에 넣어야 h1↔썸네일 사이(제목 직하)에 선다 · textContent = XSS 안전.
  paintDetErr(a);   // 요약 본문을 못 받았으면 사유 1줄 + 다시 받아오기(빈칸 침묵 금지)
  cardSec(a);
  feedSec(a);     // 섹션 3: 카드 피드(이미지 있을 때만 표시)
  const _rt = $('#revText'); if (_rt) _rt.value = '';   // 기사로 이동 시 = 수정 요청 입력칸도 비움(이전 기사에 적던 지시 안 넘어오게 · 체크박스 리셋과 마찬가지 · 운영자 260622)
  const _crt = $('#crevText'); if (_crt) _crt.value = ''; if (typeof resetCrevSend === 'function') resetCrevSend(); if (typeof updateCrevClip === 'function') updateCrevClip();   // 카드 수정 입력칸도 동일 리셋 + 클립버튼 갱신(이전 기사 지시 누수 차단·260627)
  _editKeptKey = null;   // 기사 이동 = 이전 기사 카드의 보존 편집 폐기(다른 기사 카드에 복원 누수 차단·운영자 260628)
  resetRevSend(); updateRevClip();   // 버튼 재확인(arm) 상태·클립(붙여넣기/복사) 아이콘도 원복
  { const _tt = $('#tredoText'); if (_tt) _tt.value = ''; if (typeof resetTredoSend === 'function') resetTredoSend(); if (typeof updateTredoClip === 'function') updateTredoClip(); TREDO_SID = ''; TREDO_LAST = ''; }   // 이미지 재생성 코멘트도 기사 이동 시 리셋(이전 기사 지시 누수·오발사 차단 · 평의회 엣지 ❌ 픽스 · crev 패턴)
  applyReviseMarks();   // 이 기사가 변경 중이면 IG/Thread 소주제 '(변경 중)' + 연필 FAB 물결
  setupScrub();   // 모달 헤더 = 스크롤 위치 스크러버(게이지 + 요약·프롬프트·카드 틱 + 클릭 점프)
  // 원문 버튼 = 항상 표시. url 있으면 이동 / 없으면(전문 붙여넣기 등) .off = 흐리게+빗금·클릭 불가(운영자 260704)
  const src = $('#src'); src.style.display='';
  if (a.url){ src.href=hrefOk(a.url); src.classList.remove('off'); src.removeAttribute('aria-disabled'); src.title='원문 열기'; src.setAttribute('aria-label','원문 열기'); }
  else { src.removeAttribute('href'); src.classList.add('off'); src.setAttribute('aria-disabled','true'); src.title='원문 링크 없음'; src.setAttribute('aria-label','원문 링크 없음'); }
  const dlg = $('#dlg'); const _dlgWasOpen = dlg.open; if (!_dlgWasOpen) { dlg.showModal(); try { history.pushState({ dlg: true }, ''); } catch {} }   // 신규 열림만 showModal+pushState(폰 뒤로가기=요약모달 먼저 닫기·lbox 패턴·!wasOpen=재진입 이중 push/show 방지·260630 QA ③)
  $('#dlgbody').scrollTop = 0;  // 재진입 시 이전 스크롤 위치 유지 버그 → 맨 위 리셋(스크롤=본문 래퍼 .dlg-body)
  const dt = $('#dlgtop'); if (dt) dt.classList.remove('show');   // 모달 탑 버튼(제거됨) 초기 숨김 — null 가드(없으면 throw로 아래 스크롤락·포커스가 안 돌던 잠복버그 차단)
  updateRevFab();   // 열릴 때 FAB 초기 상태(맨 위라 보통 숨김)
  updateCrevFab();   // 🃏 카드 수정 FAB도 동일 초기화
  __noLock = 'hidden';   // PC: 모달 밖(백드롭) 스크롤 시 배경 페이지 스크롤 차단(#5)
  // 첫 focusable 버튼(요약/원문)이 showModal에 auto-focus되면 포커스 링(테두리)·상태바 URL 노출 →
  // 닫기(X) 버튼으로 포커스를 옮겨 차단. (.dlg-x 명시 — 첫 버튼=요약 ⬇에 링 안 생기게.)
  const cb = $('#dlg').querySelector('.dlg-x'); if (cb) cb.focus();
}
function addCopyButtons(root) {
  root.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    // 강조 마커 *문구*/**문구** → 문구만 강조색 <i>(별표 미표시). 복사는 codeCopyText가 data-mk로 *…* 복원.
    if (code && !code.dataset.hl) {
      code.dataset.hl = '1';
      // marked가 *문구*를 <em>/<strong>로 먼저 바꿨어도(코드펜스 밖 등) .cem으로 흡수 → 색·복사 일관(별표 복원)
      code.innerHTML = code.innerHTML
        .replace(/<em>([^<>]*)<\/em>/g, '<i class="cem" data-mk="*">$1</i>')
        .replace(/<strong>([^<>]*)<\/strong>/g, '<i class="cem" data-mk="**">$1</i>')
        .replace(/(\*{1,2})([^*\n<>]+?)\*{1,2}/g,
          (m, mk, t) => `<i class="cem" data-mk="${mk}">${t}</i>`);
    }
    const _cb = copyBtn(() => code ? codeCopyText(code) : pre.innerText, '복사'); _cb.classList.add('boxcopy'); pre.insertBefore(_cb, pre.firstChild);   // float:right 첫 자식 = 텍스트가 버튼 위만 비켜 감기고 나머지 폭 활용(우측 컬럼 안 놀게)
  });
}
function codeCopyText(code) {
  let out = '';
  code.childNodes.forEach(n => {
    if (n.nodeType === 1 && n.classList && n.classList.contains('cem')) {
      const mk = n.getAttribute('data-mk') || '*'; out += mk + n.textContent + mk;
    } else { out += n.textContent; }
  });
  return out;
}
function todayYMD6() {
  const n = new Date(), p = x => String(x).padStart(2,'0');
  return `${String(n.getFullYear()).slice(2)}${p(n.getMonth()+1)}${p(n.getDate())}`;
}
function dlStamp(a) {
  const m = a && /^(\d{6})-(\d{4})/.exec(a.file || '');
  if (m) return `${m[1]}_${m[2]}`;
  const n = new Date(), p = x => String(x).padStart(2, '0');
  return `${String(n.getFullYear()).slice(2)}${p(n.getMonth() + 1)}${p(n.getDate())}_${p(n.getHours())}${p(n.getMinutes())}`;
}
function dlSlug(s) { return (String(s == null ? '' : s).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').replace(/^[._]+|[._]+$/g, '').slice(0, 40)) || 'thumb'; }
function addClip(pre) {
  pre.classList.add('clip');
  // 강제 줄바꿈만(뷰어 모달용) — 줄바꿈은 강제하되 폭은 건드리지 않는다. ⚠️ 옛 max-width:calc(100vw-44px)·box-sizing는 자유요약 박스를 .md 컨테이너보다 좁혀 IG 박스와 폭이 어긋나고(우측 여백) 복사버튼이 같은 세로선에서 밀리던 원인 → 제거(운영자 260625). 오버플로는 .md pre의 white-space:pre-wrap !important·overflow-wrap:anywhere !important가 이미 보장.
  const _wrapForce = el => { if (!el) return; el.style.setProperty('white-space', 'pre-wrap', 'important'); el.style.setProperty('word-break', 'break-word', 'important'); el.style.setProperty('overflow-wrap', 'anywhere', 'important'); };
  _wrapForce(pre); _wrapForce(pre.querySelector('code'));
  const mb = document.createElement('button');
  mb.className = 'morebtn'; mb.innerHTML = '더 보기 ' + CHEVRON_SVG;
  mb.onclick = ev => { ev.stopPropagation();
    const clipped = pre.classList.toggle('clip');
    mb.innerHTML = clipped ? '더 보기 ' + CHEVRON_SVG : '접기 ' + CHEVRON_SVG.replace('vertical-align:-1px', 'vertical-align:-1px;transform:rotate(180deg)'); };
  pre.after(mb);
}
const BIAS_RE = /[🟥🟦🟩🟨🟧🟪🟫🔴🟠🟡🟢🔵🟣⬛⬜📊✅]/gu;
const KW_RE = /(앵글(?:\s*후보)?\s*[①-⑳0-9]+|약보수 보정|[가-힣A-Za-z0-9]{1,8} ?관점)/g;
function decorate(root) {
  // 0) 다각도 '이렇게 볼 수도' 래퍼 li 제거 + 중첩된 관점 불릿을 한 단계 끌어올림(들여쓰기 삭제 · 운영자 260621)
  root.querySelectorAll('li').forEach(li => {
    if (!/^\s*이렇게\s*볼\s*수도/.test(li.textContent)) return;
    const inner = li.querySelector('ul, ol'); if (!inner) return;
    const parent = li.parentElement;
    while (inner.firstElementChild) parent.insertBefore(inner.firstElementChild, li);
    li.remove();
  });
  // 0a) 다각도 '이렇게 볼 수도 ①' 인라인 접두 제거 → 관점 라벨로 바로(템플릿 고정 보강 · 기존 분석건·LLM 일탈 대비 · 운영자 260625)
  root.querySelectorAll('li').forEach(li => {
    const tn = li.firstChild;
    if (!tn || tn.nodeType !== 3 || !/^\s*이렇게\s*볼\s*수도/.test(tn.data)) return;
    tn.data = tn.data.replace(/^\s*이렇게\s*볼\s*수도\s*[①-⑳0-9]*\s*[)）.·]?\s*/, '');
  });
  // 0c) 활용옵션 편향 불릿(li) 통째 제거 → 편향은 콘텐츠 초안(자유요약) 편향줄에서만 표시(중복 제거 · 운영자 260629·260630).
  //   ⚠️ textContent + 머리 편향 이모지(📊 등 BIAS_RE) 제거 후 판정 — '**편향**:'(bold·firstChild=<strong>)·'📊 편향:'(이모지 머리) 둘 다 포착(이모지 strip은 step3라 0c 시점엔 잔존). 옛 firstChild-텍스트노드 검사는 bold·이모지 누락.
  root.querySelectorAll('li').forEach(li => {
    if (/^편향\s*[:：]/.test((li.textContent || '').replace(BIAS_RE, '').trimStart())) li.remove();   // (이모지 제외) 불릿 머리가 '편향:'인 것만 — 앵글·시사점 본문 중 편향 언급은 보존
  });
  // 0b) 다각도 해석: '라벨: 설명'의 라벨(콜론 앞)을 항상 강조(굵게)로 통일 — AI가 **굵게** 안 달아도(라벨은 창의·고정 아님) 앵글 요약 라벨이면 항상 강조(운영자 260622)
  const _dh2 = [...root.querySelectorAll('h2')].find(h => /다각도/.test(h.textContent || ''));
  if (_dh2) {
    const _lis = [];
    for (let el = _dh2.nextElementSibling; el && el.tagName !== 'H2' && el.tagName !== 'H1'; el = el.nextElementSibling) {
      if (el.tagName === 'UL' || el.tagName === 'OL') _lis.push(...el.querySelectorAll(':scope > li'));
    }
    _lis.forEach(li => {
      const f = li.firstChild; if (!f) return;
      if (f.nodeType === 1 && /^(STRONG|B)$/.test(f.tagName)) { f.classList.add('angle-lbl'); return; }   // AI가 이미 **굵게** → 표식만(키워드 데코 제외 → 초록 [] 안 붙고 통일)
      if (f.nodeType !== 3) return;
      const m = f.data.match(/^(\s*)([^:：\n(][^:：\n]{0,23}?)(\s*[:：]\s)/);   // 라벨: (1~24자 · 괄호시작/문장 제외)
      if (!m || /[.!?。…]/.test(m[2])) return;
      const sp = document.createElement('strong'); sp.className = 'angle-lbl'; sp.textContent = m[2].trim();
      f.data = m[3] + f.data.slice(m[0].length);
      li.insertBefore(sp, f);
    });
  }
  // 1) [썸네일 타이틀] 섹션 제거(h3 + 다음 heading 전까지) — 맨 위 기사 제목이 곧 썸네일
  root.querySelectorAll('h3').forEach(h => {
    if (!/썸네일/.test(h.textContent)) return;
    let n = h.nextElementSibling;
    while (n && !/^H[1-3]$/.test(n.tagName)) { const k = n; n = n.nextElementSibling; k.remove(); }
    h.remove();
  });
  // 2) 섹션 헤더 이모지 strip(시사점 💡만 유지) + 드래프트 글자수 메타(— 약 N자) 미강조
  root.querySelectorAll('h2, h3').forEach(h => {
    if (/시사점/.test(h.textContent)) return;
    if (h.firstChild && h.firstChild.nodeType === 3)
      h.firstChild.data = h.firstChild.data.replace(/^\s*\p{Extended_Pictographic}️?\s*/u, '');
    // h3 드래프트 [라벨 — 약 N/M자]: 라벨·실제 카운트(N)만 강조, 나머지([·—·약·/M·자])는 미강조
    const dm = h.textContent.match(/^(\[)(.+?)(\s*[—\-]\s*약\s*)(\d+)(.*)$/);
    if (dm) { h.innerHTML = `<span class="cnt">${esc(dm[1])}</span>${esc(dm[2])}<span class="cnt">${esc(dm[3])}</span>${esc(dm[4])}<span class="cnt">${esc(dm[5])}</span>`; return; }
    // h2 섹션: 괄호 부연(…) 제거 (📍 말머리 폐지 — 운영자 260621: • 소머리와 겹쳐 어색)
    if (h.tagName === 'H2') {
      const pm = h.textContent.match(/^(.+?)\s*\(([^)]+)\)\s*$/);   // AO: 부제 괄호 부연 제거(해시태그도 X)
      if (pm) h.innerHTML = esc(pm[1].trim());
    }
  });
  // 2c) 섹션 헤더(h2) 바로 밑 서브헤더(h3) = 사이 구분선·빈 줄 제거(콘텐츠 초안→자유요약 등)
  root.querySelectorAll('h3').forEach(h => {
    const pv = h.previousElementSibling;
    if (pv && pv.tagName === 'H2') h.classList.add('subtop');
  });
  // 2b) 기사 제목(h1) 맨 앞 이모지 제거(요청 — 제목엔 이모지 X)
  root.querySelectorAll('h1').forEach(h => {
    if (h.firstChild && h.firstChild.nodeType === 3)
      h.firstChild.data = h.firstChild.data.replace(/^\s*\p{Extended_Pictographic}️?\s*/u, '');
  });
  // 2d) 시사점 = 마지막 문장(던지는 메시지) 강조 — 흰 산문 끝에서 메시지가 또렷(운영자 260625·A 꼬리강조).
  //     서식 없는 순수 문단만(children 0). 문장경계 = 문장부호+공백(소수점 '7.1' 등 제외) 중 마지막. 단문(경계 없음)이면 그대로.
  const sisaH = [...root.querySelectorAll('h2, h3, h4')].find(h => /시사점/.test(h.textContent || ''));
  if (sisaH) {
    let sp = null;
    for (let el = sisaH.nextElementSibling; el && !/^H[1-4]$/.test(el.tagName); el = el.nextElementSibling)
      if (el.tagName === 'P' && el.children.length === 0 && el.textContent.trim()) sp = el;   // 헤더 뒤 마지막 순수 문단
    if (sp) {
      const t = sp.textContent.trim();
      const re = /(?<![0-9])[.!?][)”"'’]?\s+/g; let last = -1, mm;
      while ((mm = re.exec(t))) last = re.lastIndex;   // 마지막 문장 경계
      if (last > 0 && last < t.length) {
        sp.textContent = '';
        sp.appendChild(document.createTextNode(t.slice(0, last)));
        const msg = document.createElement('span'); msg.className = 'sisa-msg'; msg.textContent = t.slice(last);
        sp.appendChild(msg);
      }
    }
  }
  // 3) 본문 텍스트노드: 편향 색도형 strip + 키워드 강조 (pre/code/헤더 제외 — 복사 draft 보존)
  const nodes = [], tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.parentElement || n.parentElement.closest('pre, code, h1, h2, h3, .angle-lbl, .sisa-msg')) continue;   // .angle-lbl(앵글 라벨)·.sisa-msg(시사점 메시지) = 통일 강조 유지(키워드 [] 중복 데코 차단)
    nodes.push(n);
  }
  nodes.forEach(n => {
    const s = n.data.replace(BIAS_RE, '').replace(/노뮤트\s*(?=앵글(?:\s*후보)?\s*[①-⑳0-9])/g, '');   // 앵글 후보 앞 '노뮤트' 브랜드 접두 제거(기존 생성분 소급 · 프롬프트도 260704 동시 제거 — 운영자 260704 "노뮤트 어쩌고 안 나오게")
    const parts = s.split(KW_RE);
    if (parts.length < 2) { if (s !== n.data) n.data = s; return; }
    const frag = document.createDocumentFragment();
    parts.forEach((p, i) => { if (!p) return;
      if (i % 2) {
        if (/^앵글/.test(p)) {                                                       // 앵글 ①② / 앵글 후보 ①② = [] 감쌈 + 강조색 볼드(관점 키워드와 통일·운영자 260621)
          const sp = document.createElement('span'); sp.className = 'angle'; sp.textContent = '[' + p.trim() + ']'; frag.append(sp);
        } else if (/관점\s*$/.test(p)) {                                              // 관점 키워드(…관점) = [] 감쌈 + 강조색 볼드(운영자 260621)
          const sp = document.createElement('span'); sp.className = 'kw'; sp.textContent = '[' + p.trim() + ']'; frag.append(sp);
        } else {
          const sp = document.createElement('span'); sp.className = 'kw'; sp.textContent = p; frag.append(sp);   // J: 약보수 보정 등 — 그대로(편향과 같은 줄)
        }
      } else frag.append(document.createTextNode(p)); });
    n.replaceWith(frag);
  });
  // 다각도 '이렇게 볼 수도' 불릿 맨 앞 (관점 라벨) → [관점 라벨] 강조색 볼드(운영자 260621). 라벨=괄호 1~16자(문장 아님)만 — Fact/Inference/활용옵션 불릿은 (로 시작 안 해 미적용.
  root.querySelectorAll('li').forEach(li => {
    const tn = li.firstChild;
    if (!tn || tn.nodeType !== 3) return;
    const m = tn.data.match(/^\s*\(([^)]{1,16})\)\s*/);
    if (!m) return;
    const sp = document.createElement('span'); sp.className = 'kw'; sp.textContent = '[' + m[1].trim() + ']';
    tn.data = ' ' + tn.data.slice(m[0].length);
    li.insertBefore(sp, tn);
  });
  // G: 앵글 후보 배지 뒤 ' : ' 콜론 제거
  root.querySelectorAll('.angle').forEach(ag => {
    const nx = ag.nextSibling;
    if (nx && nx.nodeType === 3) nx.data = nx.data.replace(/^\s*:\s*/, ' ');
  });
  // M: 편향 줄(단독 p) — 자유요약은 원문→요약 보정 흐름으로 재구성(라벨은 숫자 도출=드리프트 차단). IG·Thread 섹션 편향줄은 위(자유요약·활용옵션)에 이미 나오므로 삭제(운영자 260624). 무관/N/A=축약.
  root.querySelectorAll('p').forEach(p => {
    if (!/^\s*편향\s*[:：]/.test(p.textContent)) return;
    let _h = p.previousElementSibling;   // 섹션 헤더 역추적 — IG·Thread면 중복이라 줄 통째 제거(클립 로직과 동일 워크)
    while (_h && !/^H[1-3]$/.test(_h.tagName)) _h = _h.previousElementSibling;
    if (_h && /\b(IG|Thread)\b/.test(_h.textContent)) { p.remove(); return; }
    const t = p.textContent;
    const why = (t.match(/보정[^()]*\(([^)]*)\)/) || [])[1] || '';   // 약보수 보정 사유 — 화살표 줄 아래 '약보수 보정 :' 흰색 줄로(운영자 260625 · 옛 ↳ 회색 폐지)
    const whyHtml = why ? ` <span class="biaswhy"><b>약보수 보정</b> : ${esc(why)}</span>` : '';
    // 무관(면제) — 지침 §79 'F형·아동피해·성범죄·추모·순수정보·스포츠·행정' 등 좌우 축 부적용. 'N/A'·'무관' 외 'AI가 숫자(중립N)로 줬는데 why=면제/좌우 쟁점 아님'인 일탈도 포착 → '무관'(mut·카드 biasLabel과 통일·운영자 260629 "본문도 무관으로"). 설명(why)은 그대로.
    if (/무관|N\s*\/?\s*A|좌우\s*쟁점.{0,8}아/i.test(t)) { p.innerHTML = '편향: <b class="bias" style="color:var(--mut)">무관</b>' + whyHtml; p.classList.add('bullet'); return; }
    const flow = t.match(/원문\s*(\d+)\s*[\/／]\s*10[^\n]*?(?:요약|큐레이션)\s*(\d+)\s*[\/／]\s*10/);   // 자유요약 = 원문→요약 (전각슬래시·줄경계 강건화·평의회1)
    if (flow) {
      const N = +flow[1], M = +flow[2];
      // 새 포맷(운영자 260629): '중립 5 (+1 / 우 보정) → 중립 6' — 보정을 원문 옆 괄호로 · 강조색=숫자/델타/방향
      p.innerHTML = `편향: ${biasFlowHtml(N, M)}` + whyHtml;
    } else {
      const one = t.match(/(\d+)\s*[\/／]\s*10/);   // IG·Thread = 단일값(원문 없음) → 숫자 도출 라벨로 정리
      if (one) { const M = +one[1];
        p.innerHTML = `편향: ${biasZoneHtml(M)}` + whyHtml;
      }
    }
    p.classList.add('bullet');
  });
  // 4) 요약 드래프트 더보기/접기 — '자유요약'만 클립(IG·Thread는 전체 표시)
  root.querySelectorAll('pre').forEach(pre => {
    let h = pre.previousElementSibling;
    while (h && !/^H[1-3]$/.test(h.tagName)) h = h.previousElementSibling;
    if (h && /자유요약/.test(h.textContent)) addClip(pre);
  });
  // 5) 상단 기사 제목 = 복사 버튼 없음(#3) — 카드뉴스 제목만 복사 영역으로(cardSec)
}
const _thumbFile = a => (a && a.file) || '';
const THUMB_PR_KO = { photo: '포토 에디토리얼', webtoon: '웹툰 극화', watercolor: '수채화' };
const THUMB_PR_ORDER = ['photo', 'webtoon', 'watercolor'];
const THUMB_PR_OPEN = new Set();
const THUMB_PR_CACHE = new Map();
const PROMPT_IC = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/></svg>';
function thumbPrLabel(sid, gen) {
  const g = (gen || []).find(x => x && x.sid === sid);
  if (g && g.label) return g.label;
  const base = String(sid).replace(/_r\d+$/, ''), n = (String(sid).match(/_r(\d+)$/) || [])[1];
  return (THUMB_PR_KO[base] || base) + (n ? ' 수정 ' + n : '');
}
function thumbPromptPanel(a) {
  const c = a.cards || {}, file = _thumbFile(a), url = c.thumb_prompts_url || '';
  const box = document.createElement('div'); box.className = 'thumb-pr'; box.hidden = !THUMB_PR_OPEN.has(file);
  const render = (pm) => {
    const sids = Object.keys(pm || {}).filter(s => typeof pm[s] === 'string' && pm[s].trim());
    if (!sids.length) {
      box.innerHTML = '<div class="thumb-pr-empty"><span>아직 프롬프트가 없어 — 분석 결과로 4화풍 프롬프트만 뽑을 수 있어 <small>(Gemini 0 · 이미지 생성 안 함)</small></span>'
        + '<button type="button" class="sbtn cref-dlall thumb-pr-go" title="프롬프트만 뽑기 — 이미지 생성 없이 4화풍 프롬프트 산출(과금 0)" aria-label="프롬프트만 뽑기">' + PROMPT_IC + '<span class="cref-dllbl">프롬프트만 뽑기</span></button></div>';
      const go = box.querySelector('.thumb-pr-go');
      go.addEventListener('click', async e => {
        e.stopPropagation(); go.disabled = true; go.classList.add('busy');
        try {
          const r = await fetch('/api/thumbredo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ article: file, dry: '1' }) });
          const d = await r.json().catch(() => ({}));
          if (!r.ok || !d.ok) throw new Error(d.error || ('서버 ' + r.status));
          box.innerHTML = '<div class="thumb-pending"><span class="tp-dot"></span>프롬프트 뽑는 중… <small>준비되면 자동 표시(1~2분)</small></div>';
        } catch (err) { go.disabled = false; go.classList.remove('busy'); qFlash('프롬프트 발사 실패: ' + err.message); }   // 상태문구 = qFlash 토스트(재생성 팝업과 동일 · 운영자 260720)
      });
      return;
    }
    const order = THUMB_PR_ORDER.filter(s => sids.includes(s)).concat(sids.filter(s => !THUMB_PR_ORDER.includes(s)).sort());
    const lab = s => thumbPrLabel(s, c.thumb_gen);
    box.innerHTML = '<div class="thumb-pr-h thumb-pr-top"><b>프롬프트 4종</b><small>' + order.length + '개 · 본문 탭 = 펼치기</small>'
      + '<button type="button" class="sbtn thumb-pr-all" title="전체 복사(4화풍 이어붙임)" aria-label="프롬프트 전체 복사">' + COPY_SVG + '</button></div>'
      + order.map(s => '<div class="thumb-pr-row" data-sid="' + esc(s) + '"><div class="thumb-pr-h"><b>' + esc(lab(s)) + '</b><small>' + pm[s].length.toLocaleString() + '자</small>'
        + '<button type="button" class="sbtn thumb-pr-cp" title="복사" aria-label="' + esc(lab(s)) + ' 프롬프트 복사">' + COPY_SVG + '</button></div>'
        + '<pre class="thumb-pr-tx">' + esc(pm[s]) + '</pre></div>').join('');
    box.querySelectorAll('.thumb-pr-cp').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); copyText(pm[b.closest('.thumb-pr-row').dataset.sid], b); }));
    box.querySelectorAll('.thumb-pr-tx').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); t.classList.toggle('open'); }));
    const all = box.querySelector('.thumb-pr-all');
    if (all) all.addEventListener('click', e => { e.stopPropagation(); copyText(order.map(s => '=== ' + lab(s) + ' (' + s + ') ===\n' + pm[s]).join('\n\n'), all); });
  };
  if (!url) { render({}); return box; }
  if (THUMB_PR_CACHE.has(url)) { render(THUMB_PR_CACHE.get(url)); return box; }
  box.innerHTML = '<div class="thumb-pending"><span class="tp-dot"></span>프롬프트 불러오는 중…</div>';
  fetch(url).then(r => (r.ok ? r.json() : {})).catch(() => ({})).then(pm => { pm = (pm && typeof pm === 'object') ? pm : {}; THUMB_PR_CACHE.set(url, pm); render(pm); });
  return box;
}
function thumbSec(a) {
  const c = a.cards || {};
  if (!a.has_body && !a.body && !c.state) return null;   // 픽(분석)된 기사에만 (has_body=경량 인덱스 플래그·body는 detail lazy → 게이트는 플래그 우선)
  // 실제 이미지(검색 og:image / AI 생성)가 하나라도 있을 때만 표시 — 빈 안내·레거시 폴백(구글검색 링크·위키미디어·'곧 반영' placeholder)은 띄우지 않음(요약 위 잡음 제거 · 운영자 260620)
  const search = Array.isArray(c.thumb_search) ? c.thumb_search : [];
  const gen = Array.isArray(c.thumb_gen) ? c.thumb_gen : [];
  const hasPr = !!(c.thumb_prompts_url && _thumbFile(a));   // 프롬프트 원장만 있는 기사(드라이런 · no_thumb)도 섹션을 세운다(260908 Q1680)
  if (!search.length && !gen.length && !hasPr) {
    // 픽됐는데 썸네일 아직 = thumb_gen은 분석과 별도 잡(픽 후 ~십몇 분) — 신규(30분 내)면 '생성 중' 자리표시(폴링이 준비 시 실제 썸네일로 자동 교체). 오래된 기사(생성 안 옴)는 미표시였으나(잡음 0·운영자 260621) 261025부터 픽 파일이 있으면 「사진 못 찾음」 머리로 진입로만 남긴다(운영자 «기사 유관 사진이 항상 나오려면»).
    if ((a.has_body || a.body) && feedAgeH(a) < 0.5) {
      const ph = document.createElement('div'); ph.className = 'thumbsec'; ph.dataset.sig = thumbSecSig(a);
      ph.innerHTML = '<div class="thumbsec-h">썸네일 후보 — 검색 · AI 생성</div>'
        + '<div class="thumb-pending">썸네일 생성 중… <small>준비되면 자동 표시</small></div>';
      return ph;
    }
    if (!_thumbFile(a)) return null;   // 픽 기사(file)는 아래로 = 「사진 못 찾음」 머리 + AI 생성·프롬프트 진입로(2차 평의회 261025 — 30분이 지나면 칸째 사라져 손쓸 버튼까지 0이던 구멍 · 버튼 2개 = 잡음 최소)
  }
  const wrap = document.createElement('div'); wrap.className = 'thumbsec'; wrap.dataset.sig = thumbSecSig(a);
  const dlAllH = (search.length + gen.length) ? '<button type="button" class="sbtn cref-dlall dlbtn thsec-dlall" title="썸네일 후보 전체 저장" aria-label="썸네일 후보 전체 저장">' + DLSEQ_IC + '<span class="cref-dllbl">전체</span></button>' : '';   // 전체저장 = 제목 라인 우측(검색+AI생성 통합 · .dlbtn 표준 · 운영자 260622)
  const secLbl = (search.length ? ['검색'] : []).concat(gen.length ? ['AI 생성'] : []).concat((!search.length && !gen.length && hasPr) ? ['프롬프트'] : []).join(' · ') || '사진 못 찾음';   // 헤더 = 실존 캐러셀만 표기 — AI 생성 스킵(no_thumb) 기사에 'AI 생성' 영구 오버-프로미스 방지(평의회 260711)
  // 발사 버튼 폴백 = 검색 카러셀이 없는 기사(og:image 0장 = fetch 차단 매체 등)에만 섹션 헤더로 이주 — 정상 기사는 종전대로 검색 소머리 우측 그대로(운영자 260801 "거기 버튼 위치 좋고").
  // 없으면 그 기사만 영영 진입로 0(누를 + 자체가 안 그려짐) = 사후 AI 생성 불가 구멍이었다.
  const secGenH = (!search.length && _thumbFile(a)) ? '<button type="button" class="sbtn cref-more cref-gen thsec-gen" title="AI 이미지 생성" aria-label="AI 이미지 생성"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg><span class="cref-dllbl">AI</span></button>' : '';
  // 「프롬프트」 = 4화풍 완전 프롬프트 패널 토글(운영자 260908 Q1680) — 전체저장(.cref-dlall) 버튼 문법 계승 · 픽 기사(file)면 항상(원장 없으면 패널이 「뽑기」 안내)
  const prH = _thumbFile(a) ? '<button type="button" class="sbtn cref-dlall thsec-pr" title="프롬프트 4종 — 기사→4화풍 완전 프롬프트 보기·복사" aria-label="프롬프트 4종" aria-expanded="' + (THUMB_PR_OPEN.has(a.file) ? 'true' : 'false') + '">' + PROMPT_IC + '<span class="cref-dllbl">프롬프트</span></button>' : '';
  wrap.innerHTML = '<div class="thumbsec-h"><span class="thsec-t">썸네일 후보 — ' + secLbl + '</span>' + secGenH + prH + dlAllH + '</div>';
  // 1) 검색 이미지(4:5 캐러셀) — 실제 추출분이 있을 때만. 라벨 옆 토큰=검색·비전 비용(현재 0)
  if (search.length) {
    // 좌측(회색 돋보기) = 기사 제목 검색(불변) · 키워드(한/영 + 토글)는 thumbStatic이 kwData로 처리(운영자 260622)
    const _titleHref = 'https://www.google.com/search?tbm=isch&tbs=qdr:d&q=' + encodeURIComponent((a.title || '뉴스').slice(0, 100));
    wrap.appendChild(thumbStatic('검색 이미지', search, 'search', _titleHref, c.thumb_usage,
      { ko: (a.image_query || '').trim(), en: (a.image_query_en || '').trim() }));
  }
  // 2) AI 생성(4:5 × 4화풍 · 260908 복귀) — 생성분이 있을 때만. 라벨 옆 토큰=생성 비용(전 화풍+재생성 누적)
  if (gen.length) wrap.appendChild(thumbStatic('AI 생성', gen, 'gen', null, c.thumb_usage));
  // 3) 프롬프트 4종 패널(접힘 기본 · 헤더 「프롬프트」가 토글 · 260908 Q1680)
  const prB = wrap.querySelector('.thsec-pr');
  if (prB) {
    const pn = thumbPromptPanel(a); wrap.appendChild(pn);
    prB.addEventListener('click', e => { e.stopPropagation(); const open = pn.hidden; pn.hidden = !open; prB.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) THUMB_PR_OPEN.add(a.file); else THUMB_PR_OPEN.delete(a.file); });
  }
  const genH = wrap.querySelector('.thsec-gen');   // 폴백 발사(검색 카러셀 부재 기사) = 검색 소머리 + 와 동일 경로(openGenIdlg) · wrap = 섹션(=imgFetchGo가 AI 트랙을 찾거나 만든다)
  if (genH) genH.addEventListener('click', e => { e.stopPropagation(); openGenIdlg(_thumbFile(a), wrap, genH); });
  const dlH = wrap.querySelector('.thsec-dlall');   // 제목 라인 전체저장 = 검색+AI생성 전 이미지 통합 순차 다운로드(.dlbtn 표준 dlAllSeq)
  if (dlH) {
    const meta = search.map((it, i) => ['검색 이미지', it, i]).concat(gen.map((it, i) => ['AI 생성', it, i]));
    dlH.addEventListener('click', e => { e.stopPropagation(); dlAllSeq(dlH, meta.map(m => m[1].img), k => thumbDlName(meta[k][0], meta[k][1], meta[k][2])); });
  }
  return wrap;
}
const THV_KEY = 'nm_thvote';
function thVoteGet(file, sid) { try { return (JSON.parse(localStorage.getItem(THV_KEY) || '{}'))[file + '#' + sid] || null; } catch { return null; } }
function thVoteSet(file, sid, v) {
  let m = {}; try { m = JSON.parse(localStorage.getItem(THV_KEY) || '{}'); } catch { /* noop */ }
  if (v) m[file + '#' + sid] = v; else delete m[file + '#' + sid];
  try { localStorage.setItem(THV_KEY, JSON.stringify(m)); } catch { /* noop */ }
}
function thVoteApply(slot, file, sid) {
  const v = thVoteGet(file, sid), up = slot.querySelector('.fbup'), dn = slot.querySelector('.fbdown');
  if (!up || !dn) return;
  up.classList.toggle('voted', v === 'up'); dn.classList.toggle('voted', v === 'down');
  up.disabled = v === 'down'; dn.disabled = v === 'up';   // 한쪽 기록되면 반대쪽 잠금(카드 정본 applyVoteState 동일)
}
function thVoteWire(slot, a, sid) {
  const file = a.file || '';
  thVoteApply(slot, file, sid);
  slot.querySelectorAll('.fbup, .fbdown').forEach(btn => {
    const vote = btn.classList.contains('fbup') ? 'up' : 'down';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const cur = thVoteGet(file, sid);
      if (cur === vote) {                                   // 같은 쪽 재탭 = 인라인 arm → 한 번 더 탭하면 취소(카드 정본 문법·팝업 0)
        if (btn.classList.contains('thumb-arm')) { disarmThumb(btn); thVoteSend(a, sid, ''); thVoteSet(file, sid, null); thVoteApply(slot, file, sid); return; }
        slot.querySelectorAll('.sbtn.thumb-arm').forEach(disarmThumb);
        btn._iconHTML = btn.innerHTML; btn.classList.add('thumb-arm'); btn.textContent = '취소';   // 픽토→텍스트 단독 교체(§📐 공존금지)
        clearTimeout(btn._armT); btn._armT = setTimeout(() => disarmThumb(btn), 2600);
        return;
      }
      if (cur) return;                                      // 반대쪽 이미 투표 = 잠김(disabled와 이중)
      thVoteSet(file, sid, vote); thVoteApply(slot, file, sid);   // 로컬 먼저 = 즉시 반응(전송은 fire-and-forget · 실패해도 화면 안 죽는다)
      thVoteSend(a, sid, vote);
    });
  });
}
function thVoteSend(a, sid, vote) {
  postRate({ id: a.file || '', url: a.url || '', title: (a.title || '').slice(0, 300),
             action: 'thumb', reason: (vote ? vote : 'clear') + ':' + sid });
}
const GEM_RATE = 0.00003;
function usageText(bucket, kind) {
  if (!bucket) return '';
  const tok = bucket.cumulative || 0;
  const usd = (tok * GEM_RATE).toFixed(1);
  const title = kind === 'search'
    ? (tok ? '검색·비전 Gemini 누적 ' + tok.toLocaleString() + '토큰 · 추정 $' + usd
           : '검색 = og:image 스크래핑(AI 비전 미사용) · Gemini 0')
    : 'Gemini — AI 생성 전 화풍+재생성 누적 ' + tok.toLocaleString() + '토큰 · 추정 $' + usd
      + (bucket.calls ? ' (최근 ' + bucket.calls + '콜)' : '');
  return '<span class="cref-usage" title="' + esc(title) + '">$ ' + usd + '</span>';   // 달러만 표시(토큰 T는 hover 툴팁 title에만 · 카드 비용표시(3498)와 동일 통일 · 운영자 260630)
}
const REFRESH_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg>';
const SEARCH_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
function thumbStatic(label, items, kind, href, usage, kwData) {
  const list = items.slice(0, kind === 'search' ? 60 : 40);   // 검색이미지 = '+5장 더'로 누적되니 cap 해제(7→60, 12장↑ 표시) · 운영자 260622   // AI 생성 cap 7→40(운영자 260807): 수정본이 덮어쓰기가 아니라 +1장으로 쌓이므로(1/2→1/3→1/4…) 구 7은 수정 5회면 도달해 그 뒤 수정본이 **조용히 잘린다**
  const wrap = document.createElement('div'); wrap.className = 'cref';
  // 수정 대기 슬롯 = 아직 도착 안 한 수정본의 자리(운영자 260807 "1/3 2/3 3/3(새로 만들어지고 있는 중인 거)").
  // 원본 위에 진행바를 덮던 구판(markSlotReshooting)과 달리 **원본은 그대로 보이고** 트랙 끝에 제작중 슬롯이 붙는다.
  const _pend = (kind === 'gen' && CUR_A) ? thumbRedoPendList(CUR_A.file).length : 0;
  const _total = list.length + _pend;   // 순번 분모 = 실존분 + 대기분(= 발사 즉시 1/3 2/3 3/3으로 늘어난다)
  const kd = kwData || {};
  const _moreFile = (kind === 'search' && CUR_A) ? CUR_A.file : '';   // '+5장 더' = 현재 모달 기사(CUR_A)에 관련 뉴스이미지 더 검색(api/moreimg · 운영자 260622)
  const hasKw = kind === 'search' && (kd.ko || kd.en);
  let _lang = kd.en ? 'en' : 'ko';   // 🌍해외(en 有)=영문 우선 기본 / 국내=한
  const _gis = (q, en) => 'https://www.google.com/search?tbm=isch&' + (en ? 'hl=en&gl=us&' : '') + 'tbs=qdr:d&q=' + encodeURIComponent((q || '').slice(0, 100));
  const _chip = q => String(q || '').trim().split(/\s+/).filter(Boolean).join(', ');   // 공백→쉼표+간격(#736)
  // 검색 헤더 우측 = [제목 돋보기(회색)] · [키워드 분절박스: K돋보기(검색) | 한/영(토글)·박스색 전환] · [전체저장(아이콘+전체)]
  const hbtn = href ? '<a class="sbtn cref-srch" href="' + escUrl(href) + '" target="_blank" rel="noopener" title="기사 제목으로 이미지 검색" aria-label="제목 이미지 검색">' + SEARCH_SVG + '</a>' : '';
  const kwbox = hasKw
    ? '<span class="cref-kwbox iq">'
      + '<a class="cref-kwsrch" target="_blank" rel="noopener" aria-label="키워드로 이미지 검색"><span class="cref-klbl">K</span>' + SEARCH_SVG + '</a>'
      + ((kd.ko && kd.en)
          ? '<button type="button" class="cref-kwtog" title="키워드 언어 전환(한/영)" aria-label="키워드 언어 전환(한/영)"></button>'
          : '<span class="cref-kwtog cref-kwtog-static"></span>')
      + '</span>'
    : '';
  const dlAll = '';   // 전체저장 = 섹션 제목 라인(.thumbsec-h)으로 이관 = 검색+AI생성 통합 1버튼(운영자 260622)
  const moreBtn = _moreFile ? '<button type="button" class="sbtn cref-more cref-gen" title="AI 이미지 생성·더 가져오기 — 버튼 옵션 프롬프팅(Opus 5.5 작성·Gemini 렌더) 또는 관련 실사진 재검색(1~2분)" aria-label="AI 이미지 생성·더 가져오기"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg><span class="cref-dllbl">AI</span></button>' : '';   // + AI = 이미지 생성 팝업(#genidlg · 기존 실사진 재검색 = 팝업 보조 버튼으로 보존 · 운영자 260707) · 'AI' 라벨 = 운영자 260801(픽토만으론 발사 버튼 식별 불가 — .cref-dlall 문법 계승)
  const acts = (hbtn || kwbox || moreBtn) ? '<span class="cref-acts">' + moreBtn + hbtn + kwbox + '</span>' : '';   // 전체(dlAll)는 키워드와 함께 cref-kwrow 한 줄(우측정렬·세로중앙 · 운영자 260622)
  const bucket = usage ? (kind === 'gen' ? usage.gen : kind === 'search' ? usage.search : null) : null;
  const kwHtml = hasKw ? '<span class="cref-kw"></span>' : '';   // 키워드 칩(검정 글래스) — 텍스트·색은 언어따라 JS가 채움
  // 키워드(좌) + 전체저장(우)을 한 줄에 세로중앙 — 키워드를 '전체' 버튼과 같은 중앙선에(운영자 260622: 더는 별도 줄로 안 내려감)
  const kwRow = (kwHtml || dlAll) ? '<div class="cref-kwrow">' + kwHtml + dlAll + '</div>' : '';
  // 대기 슬롯 = imgFetchGo 로딩 슬라이드(.cref-slot.cref-loading + .cref-ld + nmLoader) **100% 계승**(새 부품 창작 0).
  // 다른 점 두 가지뿐 = ⓐ 자리가 맨 좌측이 아니라 **트랙 끝**(수정본은 마지막 N/N으로 붙는다) ⓑ .tredo-ld 마커 —
  // imgFetchGo 의 중복발사 가드(`track.querySelector('.cref-loading')`)가 이 슬롯을 '진행 중'으로 오인해
  // AI 생성 버튼을 조용히 잠그는 것을 막는다(수정 대기 ≠ 생성 진행). 로더 종류 solving = 구 markSlotReshooting 동값.
  const _pendH = Array.from({ length: _pend }, (_, k) =>
    '<div class="cref-slot cref-loading tredo-ld chin" style="animation-delay:0ms,0s">'
    + '<span class="cref-no"><b>' + (list.length + k + 1) + '</b>/' + _total + '</span>'
    + '<div class="cref-ld">' + (window.nmLoader ? nmLoader('solving', '제작중…') : '<span class="cref-ld-tx">제작중…</span>') + '</div></div>').join('');
  wrap.innerHTML = '<div class="cref-h"><span class="cref-lblrow"><span class="cref-lbl">' + esc(label) + '</span>' + usageText(bucket, kind) + '</span>' + acts + '</div>'
    + kwRow   // 키워드(좌)+전체(우) 한 줄·세로중앙(운영자 260622)
    + '<div class="cref-track">' + (list.map((it, i) => {
        const cap = ((kind === 'gen' || it.label === '생성') && it.label) ? '<span class="tgen-cap">' + esc(it.label) + '</span>' : '';   // gen=화풍명 유지 · search '유사' 라벨 제거(의미없음·운영자 260622) · '생성'(genimg 제미나이 생성물)은 검색 카러셀 안에서 구분 표기(운영자 260707)
        const no = '<span class="cref-no"><b>' + (i + 1) + '</b>/' + _total + '</span>';   // 좌상단 순번 = 카드 캐러셀 '1/N'(현재 초록·총개수) 동일
        const dname = thumbDlName(label, it, i);
        const sidAttr = (kind === 'gen' && it.sid) ? ' data-sid="' + esc(it.sid) + '"' : '';   // 생성 슬롯 = 화풍 sid(재생성 진행바 타깃·복원용)
        // 저장 = 진짜 <a download href=api/dl 프록시>(같은-출처 attachment) = 모바일/인앱 브라우저 네이티브 다운로드(합성 a.click()보다 안정 · 운영자 260622).
        // AI 생성 슬롯만 = 화풍 선호 투표(운영자 260805 "좋으면 thumb up · 별로면 thumb down · 남게끔") —
        // 부품은 카드뉴스 투표 정본 100% 계승(.fbup/.fbdown · THUMBUP/THUMBDOWN_SVG · .voted · 2탭 취소).
        // 검색 이미지는 우리가 만든 게 아니라 프롬프트 개선의 정답지가 못 된다 → gen 한정.
        const voteH = (kind === 'gen' && it.sid)
          ? '<button type="button" class="sbtn fbup" aria-label="좋은 썸네일" title="좋음">' + THUMBUP_SVG + '</button>'
            + '<button type="button" class="sbtn fbdown" aria-label="아쉬운 썸네일" title="아쉬움">' + THUMBDOWN_SVG + '</button>'
          : '';
        return '<div class="cref-slot ' + kind + '" data-i="' + i + '"' + sidAttr + ' role="button" tabindex="0" aria-label="확대">'
          + '<img loading="lazy" referrerpolicy="no-referrer" src="' + escUrl(it.img) + '" alt=""'
          + ' onerror="this.closest(\'.cref-slot\').style.display=\'none\'">' + no + cap
          + '<div class="timg-acts">' + voteH
          +   '<a class="sbtn timg-dl dlbtn" href="' + escUrl(dlSrc(it.img, dname)) + '" download="' + esc(dname) + '" aria-label="이미지 저장" title="이미지 저장">' + DOWNLOAD_SVG + '</a>'
          + '</div></div>';
      }).join('') + _pendH || '<div class="cref-empty">이미지 없음</div>') + '</div>';
  wrap.querySelectorAll('.cref-slot').forEach(slot => {
    const i = +slot.dataset.i, it = list[i]; if (!it) return;
    const acts = slot.querySelector('.timg-acts');
    if (kind === 'gen') { slot.classList.add('chin'); slot.style.animationDelay = Math.min(i, 14) * 32 + 'ms'; }   // 생성물 등장 촤르륵 = cardIn + i×32ms 스태거(4223 산식 그대로 · 운영자 260801 "추가되는 거 촤르륵으로") — 검색 슬롯은 무접촉(재검색 5장 누적이라 매번 전체 재생 = 과함)
    if (kind === 'gen' && it.sid) acts.insertBefore(thumbRedoSbtn(it.sid), acts.firstChild);   // 생성 슬롯마다 수정 .sbtn(저장 앞)
    // (구) 재생성 대기 화풍 = 원본 슬롯에 진행바 오버레이 → 폐지(운영자 260807) : 수정은 원본을 덮지 않으므로 원본은 끝까지 깨끗하게 보인다.   // 대기 표시는 트랙 끝 .tredo-ld 슬롯(_pendH)이 담당 — markSlotReshooting은 dormant 보존.
    if (kind === 'gen' && it.sid && CUR_A) thVoteWire(slot, CUR_A, it.sid);   // 화풍 선호 투표(👍/👎) — 상태 복원 + 1탭 기록 + 2탭 취소
    const _tdl = slot.querySelector('.timg-dl'); if (dlSeen(it.img)) _tdl.classList.add('dl-done');   // 재렌더 시 '받음' mut 복원
    _tdl.addEventListener('click', e => { e.stopPropagation(); dlMark(it.img, _tdl); });   // 저장 앵커 탭 = 네이티브 다운로드(확대 라이트박스로 안 번지게만) + '받음' mut
    slot.addEventListener('click', e => { if (!e.target.closest('.timg-acts')) openLightbox(list, i, label); });   // 탭=확대(복사는 확대뷰에서)
    slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(list, i, label); } });
  });
  // 키워드 분절박스 — 칩 텍스트/색 · 박스 색 · 검색 쿼리 · 토글 라벨(한/영)을 _lang 따라 즉시 갱신(운영자 260622)
  if (hasKw) {
    const kwEl = wrap.querySelector('.cref-kw');
    const box = wrap.querySelector('.cref-kwbox'), srch = box && box.querySelector('.cref-kwsrch'), tog = box && box.querySelector('.cref-kwtog');
    let _curChip = '';
    const apply = () => {
      const en = _lang === 'en', q = en ? kd.en : kd.ko, chip = _chip(q);
      _curChip = chip;
      if (kwEl) { kwEl.textContent = chip; kwEl.title = '탭하면 키워드 복사'; kwEl.classList.toggle('en', en); }
      if (box) box.classList.toggle('en', en);   // 박스 전체 색 한(초록)↔영(파랑)
      if (srch) { srch.href = _gis(q, en); srch.title = (en ? '영문' : '한글') + ' 키워드로 이미지 검색'; }
      if (tog) tog.textContent = en ? '영' : '한';
    };
    apply();
    if (tog && !tog.classList.contains('cref-kwtog-static'))
      tog.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); _lang = _lang === 'en' ? 'ko' : 'en'; apply(); });
    if (kwEl) {   // 키워드 칩 탭 = 복사 + 눌림 플래시(글자 스왑 없음 · 안 B · 운영자 260622)
      kwEl.addEventListener('animationend', () => kwEl.classList.remove('copied'));   // 끝나면 클래스 제거 = 반복 탭 재생
      kwEl.addEventListener('click', async e => {
        e.stopPropagation();
        await copyText(_curChip);
        kwEl.classList.remove('copied'); void kwEl.offsetWidth; kwEl.classList.add('copied');   // reflow로 애니 재시작
      });
    }
  }
  const dlAllBtn = wrap.querySelector('.cref-dlall');   // 우상단 전체 저장 — 이 카러셀 이미지 전부 순차 다운로드
  if (dlAllBtn) dlAllBtn.addEventListener('click', e => { e.stopPropagation(); dlAllSeq(dlAllBtn, list.map(it => it.img), i => thumbDlName(label, list[i], i)); });   // 통합: 진행 i/N → 초록 ✓
  const moreEl = wrap.querySelector('.cref-more');   // + = 이미지 생성 팝업 열기(버튼 프롬프팅 · 기존 재검색은 팝업 안 보조 버튼 · 운영자 260707)
  if (moreEl && _moreFile) moreEl.addEventListener('click', e => { e.stopPropagation(); openGenIdlg(_moreFile, wrap, moreEl); });
  attachCarouselDrag(wrap.querySelector('.cref-track'));   // PC 마우스 드래그 좌우 슬라이드(feedtrack 패턴 계승·운영자 260622)
  return wrap;
}
function _imgFromClipboard(e) {   // paste 이벤트 → 첫 이미지 File(없으면 null) — askText 선례(#askText paste) 공통화
  const items = (e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData) || {}).items || [];
  for (const it of items) { if (it.type && it.type.indexOf('image/') === 0) { const f = it.getAsFile(); if (f) return f; } }
  return null;
}
function bindImgPaste(el, onImg) {   // el(입력칸·슬롯·모달)에서 Ctrl+V 이미지 → onImg(file) · 전 이미지 첨부 슬롯 공통 배선(운영자 260713 "붙여넣기 핸들러가 모든 곳에 다 들어가야함")
  if (!el || el._imgPasteBound) return; el._imgPasteBound = true;   // 이중 바인딩 가드(재호출·reparent 대비)
  el.addEventListener('paste', e => { const f = _imgFromClipboard(e); if (f) { e.preventDefault(); onImg(f); } });
}
function attachCarouselDrag(track) {
  if (!track || track._dragInit) return; track._dragInit = true;
  track.addEventListener('mousedown', e => {
    if (e.button !== 0 || (e.target.closest && e.target.closest('.sbtn,.timg-acts,a,button'))) return;   // 버튼 위에선 드래그 안 함(저장/재생성/검색)
    const sl = track.scrollLeft, x0 = e.clientX; let moved = false;
    track.classList.add('dragging');
    const mv = ev => { track.scrollLeft = sl - (ev.clientX - x0); if (Math.abs(ev.clientX - x0) > 4) moved = true; };
    const up = () => {
      window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up);
      track.classList.remove('dragging'); track._dragged = moved;
      const ss = track.querySelectorAll('.cref-slot');   // 놓으면 가장 가까운 슬롯으로 스냅
      if (ss.length > 1) { const stride = ss[1].offsetLeft - ss[0].offsetLeft; if (stride > 0) track.scrollTo({ left: Math.round(track.scrollLeft / stride) * stride, behavior: 'smooth' }); }
    };
    __on(window, 'mousemove', mv); __on(window, 'mouseup', up); e.preventDefault();
  });
  track.addEventListener('click', e => { if (track._dragged) { e.stopPropagation(); e.preventDefault(); track._dragged = false; } }, true);   // 드래그 직후 클릭(확대) 억제
}
function thumbRedoSbtn(sid) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'sbtn'; b.title = '이 화풍 수정'; b.setAttribute('aria-label', '이 화풍 수정');
  b.innerHTML = EDIT_SVG;   // 연필 = 수정(카드 편집 아이콘과 통일 · 새로고침 아님)
  b.addEventListener('click', e => { e.stopPropagation(); openTredo(sid); });
  return b;
}
const DLED = new Set();
const _dlKey = u => (u || '').split('?')[0].split('#')[0];
const dlSeen = u => !!u && DLED.has(_dlKey(u));
const dlMark = (u, btn) => { if (u) DLED.add(_dlKey(u)); if (btn) btn.classList.add('dl-done'); };
async function dlAllSeq(btn, urls, namer, fire) {
  if (!btn || btn._dlbusy) return;
  urls = (urls || []).filter(Boolean);
  if (!urls.length) return;
  btn._dlbusy = 1; btn.style.pointerEvents = 'none';
  btn.style.minWidth = Math.ceil(btn.getBoundingClientRect().width) + 'px';   // 폭 잠금 — 옛 '저장 중… i/N' 라벨이 버튼 폭을 키워 행이 출렁(thumb 전체버튼 동일 실측 · 운영자 260705). 진행 라벨은 숫자만이라 잠근 폭 안 = 시퀀스 내내 레이아웃 무이동
  const lbl = btn.querySelector('.cref-dllbl');
  const orig = lbl ? lbl.textContent : '';
  btn.classList.remove('dlseq-done', 'dlseq-release'); btn.classList.add('dlseq-busy');   // 좌→우 채움 시작(글래스 §9)
  btn.style.setProperty('--p', '0');
  for (let i = 0; i < urls.length; i++) {
    if (fire) fire(urls[i], i); else downloadImg(urls[i], namer(i));   // fire = 저장 방식이 downloadImg가 아닌 호출처(설정▸다운로드 = api/dl 직행 앵커·linkgrab 프록시)의 주입구 — 진행표기·✓팝·폭잠금 등 시퀀스 계약은 이 정본 한 곳이 그대로 담당(버튼 재설계·로직 복제 0)
    if (lbl) lbl.textContent = `${i + 1}/${urls.length}`;   // 산문 '저장 중…' 제거 = 숫자만(픽토+진행수 어포던스·§디자인 산문 최소화·tabular-nums) — 폭 잠금과 짝(운영자 260705 · thumb dlAllSeq와 1:1 — 구 jSaveSeq 폐기 260705)
    btn.style.setProperty('--p', String((i + 1) / urls.length));   // 진행률만큼 채움(검정 글자 드러남)
    await new Promise(r => setTimeout(r, 280));
  }
  if (lbl) lbl.textContent = '완료';
  btn.classList.remove('dlseq-busy'); btn.classList.add('dlseq-done', 'dl-done');   // 꽉 채움 + ✓ 팝 + 글로우 · dl-done=전체 받음 mut 유지
  if (!fire) urls.forEach(u => DLED.add(_dlKey(u)));   // 개별 URL도 '받음' 기억(개별 버튼도 mut 복원) · fire 경로는 '받음' 표식을 호출처가 자기 키(기기 로컬 got)로 이미 남긴다 = 여기서 중복 기록 안 함
  setTimeout(() => {   // ✓ 잠깐 보여준 뒤 즉시 복귀(드레인 없음 = 글자 안 가려짐·운영자 260622)
    btn.classList.add('dlseq-snap'); btn.classList.remove('dlseq-done');
    if (lbl) lbl.textContent = orig || '전체';
    btn.style.setProperty('--p', '0'); btn.style.minWidth = '';   // 폭 잠금 해제(운영자 260705)
    requestAnimationFrame(() => btn.classList.remove('dlseq-snap'));
    btn._dlbusy = 0; btn.style.pointerEvents = '';
  }, 1050);
}
function _flashBtn(btn, mode) {   // mode: true|'ok'=초록체크 · 'warn'=부분(앰버·URL만/새탭) · 'err'=실패(빨강)
  if (!btn) return;
  if (!btn.dataset.icon) btn.dataset.icon = btn.innerHTML;
  const m = mode === true ? 'ok' : mode;
  if (m === 'ok') { btn.innerHTML = CHECK_SVG; btn.classList.add('ok'); }
  else if (m === 'warn') { btn.innerHTML = CHECK_SVG; btn.classList.add('warnflash'); }
  else { btn.classList.add('errflash'); }
  setTimeout(() => { btn.innerHTML = btn.dataset.icon; btn.classList.remove('ok', 'warnflash', 'errflash'); }, 1500);
}
async function _blobToPng(blob) {   // 클립보드는 png가 가장 호환 — fetch blob(미오염)을 캔버스로 png 변환
  const bmp = await createImageBitmap(blob);
  const cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
  cv.getContext('2d').drawImage(bmp, 0, 0);
  return await new Promise(res => cv.toBlob(res, 'image/png'));
}
async function copyImg(url, btn) {
  if (!url) return;
  try {
    const r = await fetch(dlSrc(url)); if (!r.ok) throw new Error('proxy ' + r.status);   // R2는 같은-출처 프록시 경유 → 이미지 복사도 CORS 무관 성공
    const blob = await r.blob();
    const png = blob.type === 'image/png' ? blob : await _blobToPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    _flashBtn(btn, 'ok');
  } catch (e) {                                            // 이미지 복사 불가(CORS·권한) → URL 텍스트라도(정직: warn 표시)
    try { await navigator.clipboard.writeText(url); if (btn) btn.title = '이미지 복사 불가(외부) — URL을 복사함'; _flashBtn(btn, 'warn'); }
    catch { _flashBtn(btn, 'err'); }
  }
}
function dlSrc(url, name) {
  try {
    const u = new URL(url, location.href);
    if (/^https?:$/.test(u.protocol) && u.origin !== location.origin)
      return '/api/dl?u=' + encodeURIComponent(url) + (name != null ? '&n=' + encodeURIComponent(name) : '');
  } catch (e) { /* 상대/비정상 url → 원본 */ }
  return url;
}
async function downloadImg(url, name, btn) {
  if (!url) return;
  const proxied = dlSrc(url, name);
  const host = document.querySelector('dialog[open]') || document.body;
  const ua = navigator.userAgent || '';
  const isIOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  if (isIOS) {   // iOS = a[download] 무시 + blob 인라인 → Web Share(파일)로 '사진 저장', 없으면 attachment 새 내비
    try {
      const res = await fetch(proxied, { cache: 'no-store' });
      if (res.ok && navigator.canShare) {
        const file = new File([await res.blob()], name || 'image.jpg', { type: res.headers.get('content-type') || 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); _flashBtn(btn, 'ok'); return; }
      }
    } catch (e) { if (e && e.name === 'AbortError') { _flashBtn(btn, 'ok'); return; } }   // 공유 취소 = 정상
    const a = document.createElement('a'); a.href = proxied; a.target = '_blank'; a.rel = 'noopener';
    host.appendChild(a); a.click(); a.remove(); _flashBtn(btn, 'warn'); return;
  }
  try {   // 데스크탑·안드로이드 = blob 강제 저장(같은-출처 프록시라 fetch CORS 무관)
    const res = await fetch(proxied, { cache: 'no-store' });
    if (!res.ok) throw new Error('http ' + res.status);
    const burl = URL.createObjectURL(await res.blob());
    const a = document.createElement('a'); a.href = burl; a.download = name || 'image';
    host.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(burl), 6000);
    _flashBtn(btn, 'ok');
  } catch (e) {   // 폴백 = 프록시 attachment 직접(같은-출처라 a[download] 동작)
    const a = document.createElement('a'); a.href = proxied; a.download = name || '';
    host.appendChild(a); a.click(); a.remove(); _flashBtn(btn, 'ok');
  }
}
function thumbDlName(label, it, i) {
  const stamp = (typeof CUR_A !== 'undefined' && CUR_A) ? dlStamp(CUR_A) : '';
  const ext = ((/\.(png|jpe?g|webp)(?:\?|$)/i.exec(it.img || '') || [, 'png'])[1] || 'png').toLowerCase().replace('jpeg', 'jpg');
  const slug = dlSlug(it.label || label || 'thumb');
  return (stamp ? stamp + '_' : '') + slug + '_' + (i + 1) + '.' + ext;
}
let LBOX = null, LBOX_ITEMS = [], LBOX_LABEL = '', _lboxPop = false;
function thumbSecSig(a) { const c = (a && a.cards) || {}; const j = arr => (Array.isArray(arr) ? arr : []).map(x => x && x.img).join(','); const s = j(c.thumb_search), g = j(c.thumb_gen), p = c.thumb_prompts_url || ''; if (s || g || p) return 'r|' + s + '|' + g + '|' + p; return (a && (a.has_body || a.body) && feedAgeH(a) < 0.5) ? 'p' : ''; }
const THUMB_REDO = new Map();
function _ensureLbox() {
  if (LBOX) return LBOX;
  const d = document.createElement('dialog'); d.className = 'lbox'; d.id = 'lbox';
  d.innerHTML =
    '<div class="lbox-bar">'
    + '<button type="button" class="sbtn lbox-copy" aria-label="이미지 복사">' + COPY_SVG + '</button>'
    + '<a class="sbtn lbox-dl dlbtn" download aria-label="이미지 저장" title="이미지 저장">' + DOWNLOAD_SVG + '</a>'
    + '<span class="lbox-no"></span>'
    + '<a class="lbox-src" target="_blank" rel="noopener" hidden>출처</a>'
    + '<button type="button" class="tool-x lbox-x" aria-label="닫기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button>'
    + '</div><div class="lbox-track"></div>';
  ROOT.appendChild(d);
  const track = d.querySelector('.lbox-track');
  const idx = () => Math.round(track.scrollLeft / (track.clientWidth || 1));
  const cur = () => LBOX_ITEMS[idx()] || LBOX_ITEMS[0] || {};
  const sync = () => {
    d.querySelector('.lbox-no').textContent = LBOX_ITEMS.length ? (idx() + 1) + ' / ' + LBOX_ITEMS.length : '';
    const it = cur(), src = d.querySelector('.lbox-src'), dl = d.querySelector('.lbox-dl');
    if (it.link) { src.href = it.link; src.hidden = false; } else src.hidden = true;
    if (dl && it.img) { const dn = thumbDlName(LBOX_LABEL, it, idx()); dl.href = dlSrc(it.img, dn); dl.download = dn; dl.classList.toggle('dl-done', dlSeen(it.img)); }   // 슬라이드별 저장 앵커(api/dl 프록시·네이티브 다운로드 · href는 DOM 프로퍼티라 raw) + '받음' mut
  };
  track.addEventListener('scroll', () => { clearTimeout(track._t); track._t = setTimeout(sync, 90); });
  d.querySelector('.lbox-copy').addEventListener('click', e => copyImg(cur().img, e.currentTarget));
  d.querySelector('.lbox-dl').addEventListener('click', () => dlMark(cur().img));   // 네이티브 다운로드 + '받음' mut(sync가 다음 슬라이드서 복원)
  d.querySelector('.lbox-x').addEventListener('click', () => d.close());
  d.addEventListener('click', e => { if (e.target === d) d.close(); });   // 백드롭 탭=닫기
  d.addEventListener('cancel', e => { e.preventDefault(); d.close(); });   // ESC=닫기
  d.addEventListener('close', () => { if (_lboxPop) { _lboxPop = false; } else if (history.state && history.state.lbox) history.back(); });
  d._track = track; d._sync = sync; LBOX = d; return d;
}
function openLightbox(items, i, label) {
  LBOX_ITEMS = items; LBOX_LABEL = label;
  const d = _ensureLbox(), track = d._track;
  track.innerHTML = items.map(it => '<div class="lbox-slide"><img referrerpolicy="no-referrer" src="' + escUrl(it.img) + '" alt=""></div>').join('');
  if (!d.open) { d.showModal(); history.pushState({ lbox: true }, ''); }   // 폰 뒤로가기=닫고 직전 화면 복귀
  requestAnimationFrame(() => { track.scrollLeft = i * track.clientWidth; d._sync(); });
}
function cardSec(a) {
  const sec = $('#cardsec'); sec.innerHTML = '';
  const c = a.cards || {}, st = c.state || '';
  CUR_STATE = st;
  // stale = 카드 제작 후 요약을 또 revise함(a.rev > 카드가 만들어진 회차 c.rev). 이미지 있는 카드(done/fired_partial)만 —
  // 이미지는 보존하고 '다시 제작'(앰버 버튼) 권유로 운영자가 새 요약 반영(text_done은 card_refresh가 자동 갱신하므로 제외).
  const stale = (st === 'done' || st === 'fired_partial') && (Number(a.rev || 0) > Number(c.rev || 0));
  // 시간 기반 실패 감지 — 경고·재시도 버튼 노출용(progGauge와 동일 기준). 임계 = 그 백엔드 상한과 정합이 정본:
  //   렌더(fired_partial) = 10분 유지(운영자 260704 "10분 안에 안되면 실패") · 프롬프팅(generating) = 26분
  //   (= cardmake CARD_TIMEOUT 1500s(25분)+여유 1분 · 260711 900→1500 상향 동행 — 10분이면 이제 성공하는 11~25분
  //   카드를 '실패(시간초과)'로 오표시 → 오인 재시도·중복 생성 유발[전반평의회③ P1]. 타임아웃 재시도 시 updated 재스탬프라 2차 시도도 커버).
  const stuckMin = c.updated ? Math.floor((Date.now() - Date.parse(c.updated)) / 60000) : 999;   // updated 없으면 비정상(스탬프 안 됨) = stuck 취급
  const stuck = stuckMin > 10;        // fired_partial(이미지 렌더) = 10분 유지
  const genStuck = stuckMin > 26;     // generating(프롬프팅) = CARD_TIMEOUT(25분)+1 정합
  // 카드 phase 헤더에 상태 반영(접어도 보이게)
  const sumlabel = { '':'2. 카드 뉴스 프롬프트', generating:'2. 카드 뉴스 프롬프트 — 프롬프팅 중…', text_done:'2. 카드 뉴스 프롬프트',   // text_done '— 텍스트·프롬프트' 접미 제거(운영자 260629 "저 말 빼자")
    done:'2. 카드 뉴스 프롬프트', fired_partial:'2. 카드 뉴스 프롬프트 — 생성됨', failed:'2. 카드 뉴스 프롬프트 — 실패' };
  const cs = $('#cardsum'); if (cs) cs.textContent = (st === 'generating' && genStuck) ? '2. 카드 뉴스 프롬프트 — 실패(시간초과)' : (sumlabel[st] || '카드 뉴스 프롬프트');   // phase 2 = 카드 뉴스 프롬프트(운영자 260629). 프롬프팅 10분 초과 = 접힌 헤더도 '실패'로

  if (!st || st === 'failed') {
    if (cardFirePending(a.file)) { sec.innerHTML = cardFireStat(); return; }   // 발사됨·서버 상태 반영 전 = 버튼 대신 로더 유지(재열람 시 버튼 복귀 → 연타 → 큐 상호취소 봉합 · 260727)
    // 실패 = 로그 박스 노출 안 함(사유는 error.log에 기록됨) → 버튼만 '재생성'으로. 실패 표식은 헤더 '— 실패'(sumlabel)로 유지(운영자 260630).
    const b = document.createElement('button');
    b.className = st === 'failed' ? 'mkbtn retry' : 'mkbtn';   // 실패 재시도 = 레몬(노랑) 통일(운영자 260701)
    b.textContent = st === 'failed' ? '프롬프트 다시 생성' : '프롬프트 생성';
    b.onclick = () => makeCards(a.file, b, 'text');   // 2단계(텍스트·프롬프트)만 — 이미지(3단계)는 text_done 후 아래 '카드 이미지 생성' 버튼에서만
    sec.appendChild(b);
    return;
  }
  if (st === 'generating') {
    if (genStuck) {   // 10분째 프롬프팅 멈춤 = 워크플로 중단/타임아웃 추정 → 실패로 표시·재시도(멘트 삭제·헤더 '실패(시간초과)'로 표식·운영자 260701 · 15→10분 260704)
      if (cardFirePending(a.file)) { sec.innerHTML = cardFireStat(); return; }   // 재발사 접수 대기 중 = 재시도 버튼 대신 로더(위 ''/failed 분기와 동일 가드)
      const b = document.createElement('button');
      b.className = 'mkbtn retry';
      b.textContent = '프롬프트 다시 생성';
      b.onclick = () => makeCards(a.file, b, 'text');   // 프롬프팅 재시도 = 2단계만(이미지는 카드 이미지 생성 버튼)
      sec.appendChild(b);
    } else {
      // generating이어도 cards.md가 이미 있으면 = 이미지 생성(슛) 중 / 없으면 = 프롬프팅(텍스트) 중 — 백엔드는 슛·텍스트 둘 다 'generating'이라(cardmake.sh:173) has_md로 구분(운영자 260630)
      const phase = c.has_md ? '카드 이미지 생성 중' : '카드뉴스 프롬프팅 중';
      const rtag = (Number(c.retry) || 0) > 0 ? ` <span class="gen-rn nm-shim">(${Number(c.retry)}회)</span>` : '';   // 로더에 붙은 글자 = 빛 스윕 동참(운영자 260731)   // 자동 재시도 회차 = 기존 배너 '중' 뒤 띄어쓰기 하나 + '(N회)'(MUT·크기 동일) · 운영자 260701
      sec.innerHTML = `<div class="genstat live">${window.nmLoader ? nmLoader(c.has_md ? 'solving' : 'prompting', '제작중…') + rtag : phase + rtag + '<span class="gdots"><i>.</i><i>.</i><i>.</i></span>'}</div>`;   // orb 로더(이미지=Solving·프롬프팅=Prompting · 운영자 260723 Q461) · 재시도 회차 rtag 유지 · 폴백 = 구 점3   // 「예상 : N분」 제거(운영자 260805) = 아래 cardFireStat 주석 참조
    }
    return;
  }
  // fired_partial 멘트(설명 문장) 삭제 — 재시도는 아래 노랑 버튼으로 유도(운영자 260701). stuck은 버튼 문구 '(일부)' 분기에 사용.
  // 카드 이미지는 섹션 3 '카드 피드'(feedSec)에서 렌더. #cardsec은 텍스트·프롬프트·복사·슛 정본 유지.
  if (c.md) {
    // 🃏 카드 수정 = 우측 반투명 FAB(#crevFab)로만 노출(요약 수정 FAB 미러 · 큰 mkbtn 폐지 · 운영자 260624). 색=cards.crev 독립.
    const div = document.createElement('div');
    div.innerHTML = DOMPurify.sanitize(marked.parse(c.md));
    // 카드 제목(h1) 맨 앞 이모지 제거 — 다이제스트 h1 strip(§2b)과 동일 게이트(AI가 🚸 등 머리 이모지 넣어도 렌더 단계서 항상 제거 = 재발 방지·운영자 260628)
    div.querySelectorAll('h1').forEach(h => {
      if (h.firstChild && h.firstChild.nodeType === 3)
        h.firstChild.data = h.firstChild.data.replace(/^\s*\p{Extended_Pictographic}️?\s*/u, '');
    });
    // [카드 N] 헤더 = 📍 말머리 폐지(운영자 260621: 핀 제거)
    div.querySelectorAll('p > strong').forEach(s => {                                        // 텍스트·이미지프롬프트 = 소머리(•)
      if (/^(텍스트|이미지\s*프롬프트)$/.test((s.textContent || '').trim())) s.parentElement.classList.add('lbl');
    });
    // [프롬프트 설계] 개요 = 제목과 [카드 1] 사이 · 구분선 2개(.pdesign border 上下) 사이로 렌더(화풍·분위기·연출 = card-make가 디자인사고로 작성 · 운영자 260625)
    const pdHead = [...div.querySelectorAll('p')].find(p => /^\s*\[?\s*프롬프트\s*설계\s*\]?\s*$/.test((p.textContent || '').trim()));
    if (pdHead) {
      const wrap = document.createElement('div'); wrap.className = 'pdesign';
      pdHead.classList.add('pd-h');
      const ul = pdHead.nextElementSibling;
      pdHead.parentNode.insertBefore(wrap, pdHead);
      wrap.appendChild(pdHead);
      if (ul && ul.tagName === 'UL') {
        ul.querySelectorAll(':scope > li').forEach(li => {                                   // 화풍/분위기/연출 방향 라벨(콜론 앞) = 강조색(다각도 angle-lbl 패턴 계승)
          const f = li.firstChild; if (!f) return;
          if (f.nodeType === 1 && /^(STRONG|B)$/.test(f.tagName)) { f.classList.add('pd-lbl'); return; }
          if (f.nodeType !== 3) return;
          const m = f.data.match(/^\s*([^:：\n]{1,12})\s*[:：]\s/);
          if (!m) return;
          const sp = document.createElement('strong'); sp.className = 'pd-lbl'; sp.textContent = m[1].trim();
          f.data = ' : ' + f.data.slice(m[0].length);
          li.insertBefore(sp, f);
        });
        wrap.appendChild(ul);
      }
    }
    // 이미지 프롬프트 박스 = 기본 3줄 클립 + 더보기/접기(내부 스크롤 X). 직전 라벨에 '이미지 프롬프트' 있는 pre.
    div.querySelectorAll('pre').forEach(pre => {
      const prev = pre.previousElementSibling;
      if (prev && /이미지\s*프롬프트/.test(prev.textContent || '')) addClip(pre);
    });
    div.querySelectorAll('pre').forEach(pre => {   // 검색어 박스 = 별도 표기 제거(카드마다 중복) → 검색어 줄의 복사 버튼으로 대체(운영자 260622)
      const pv = pre.previousElementSibling;
      if (pv && /^검색어$/.test((pv.textContent || '').trim())) { pv.remove(); pre.remove(); }
    });
    addCopyButtons(div);   // 텍스트·프롬프트 각 블록 개별 복사
    // 카드별 검색어 줄 — 이미지 프롬프트 박스 아래 [현재 검색어(좌·1줄)] + [G+돋보기 구글 이미지 검색 버튼](운영자 260620).
    const _refCards = parseCards(c.md), _refTtl = a.title || feedTitle(c.md) || '';
    [...div.querySelectorAll('pre')].filter(p => { const pv = p.previousElementSibling; return pv && /이미지\s*프롬프트/.test(pv.textContent || ''); })
      .forEach((pre, i) => {
        // 검색 쿼리 = ① card-make가 뽑은 카드 씬별 AI 키워드(최소 명사) → ② 없으면 캡션 명사추출 폴백 → ③ 제목 (260620 AI 디자인싱킹)
        const rc = _refCards[i];
        const q = (rc && (rc.keyword || captionKeywords(rc.caption))) || _refTtl;
        if (!q) return;
        const row = document.createElement('div'); row.className = 'srchrow';
        const qCsv = String(q).trim().split(/\s+/).filter(Boolean).join(', ');   // 표시·복사 공통(쉼표 구분)
        // 키워드 = 검색이미지 칩(.cref-kw) 형태 계승 · 강조색 제거(mut) · 탭 복사 + 눌림 플래시(라벨 'Keyword ='·복사버튼 제거 · 운영자 260622)
        const note = document.createElement('button'); note.type = 'button'; note.className = 'cardkw';
        note.textContent = qCsv; note.title = '탭하면 키워드 복사';
        note.addEventListener('animationend', () => note.classList.remove('copied'));
        note.onclick = async ev => { ev.stopPropagation(); await copyText(qCsv); note.classList.remove('copied'); void note.offsetWidth; note.classList.add('copied'); };
        const s = document.createElement('a'); s.className = 'gsrch';
        s.href = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(String(q).slice(0, 80));
        s.target = '_blank'; s.rel = 'noopener'; s.title = '구글 이미지 검색'; s.setAttribute('aria-label', '구글 이미지 검색');
        s.innerHTML = G_SVG + SEARCH_SVG;
        row.append(note, s);   // [키워드 칩(탭 복사·눌림)] … [구글검색] — 복사 버튼 제거(칩이 복사)
        pre.insertAdjacentElement('afterend', row);   // 프롬프트 박스 바로 아래
      });
    const ch1 = div.querySelector('h1');   // 카드뉴스 제목(=썸네일)도 복사 가능 영역으로
    if (ch1) { const t = ch1.textContent; ch1.appendChild(copyBtn(() => t, '제목 복사')); }
    sec.appendChild(div);
  }
  // stale = 요약이 카드 제작 후 또 수정됨 → 이미지는 보존하고 '다시 제작'(앰버) 권유. 기본 슛/재발사 버튼 대체.
  if (stale) {
    sec.insertAdjacentHTML('beforeend',
      `<div class="cardnote stale">카드 제작 뒤 요약이 수정됐어 — 이 카드는 옛 요약 기준이야. 아래를 누르면 <b>프롬프트만</b> 새 요약으로 다시 만들어(기존 이미지는 그대로 보존). 이미지를 새로 뽑으려면 그 뒤 '카드 이미지 생성' 버튼을 눌러.</div>`);
    const b = document.createElement('button');
    b.className = 'mkbtn stale';
    b.textContent = '프롬프트 다시 생성 (요약 수정 반영)';
    b.onclick = () => makeCards(a.file, b, 'text');   // 2단계만 — 새 요약으로 프롬프트 갱신·이미지 보존. 새 이미지는 text_done 후 카드 이미지 생성 버튼에서만
    sec.appendChild(b);
    return;
  }
  // text_done = 이미지 발사 버튼(3단계) — 이미지 나오면(done) 사라짐
  if (st === 'text_done') {
    const b = document.createElement('button');
    const shot = !!c.failedOnce;   // 한 번 슛(이미지) 실패해 error.log 잔존(피드 게이지 scar와 동기) → 첫 시도 아닌 '재시도' 표기(노랑·fired_partial과 통일·운영자 260701)
    b.className = shot ? 'mkbtn retry' : 'mkbtn';
    b.textContent = shot ? '카드 이미지 생성 재시도' : '카드 이미지 생성';
    b.onclick = () => makeCards(a.file, b, 'shoot');
    sec.appendChild(b);
  }
  // fired_partial = 발사됐으나 미완 → 재발사(텍스트 재사용·렌더만).
  if (st === 'fired_partial') {
    const b = document.createElement('button');
    b.className = 'mkbtn retry';   // 재시도 = 레몬(노랑) 통일
    b.textContent = stuck ? '카드 이미지 생성 재시도' : '카드 이미지 생성 재시도 (일부)';   // (일부)=일부만 생성 / 10분+ 미완이면 (일부) 없이(운영자 260701 · 18→10분 260704)
    b.onclick = () => makeCards(a.file, b, 'shoot');
    sec.appendChild(b);
  }
}
const _KW_STOP = new Set('이 그 저 것 등 및 수 때 더 또 좀 약 총 중 데 점 곳 곳곳 관련 위해 통해 대한 따라 함께 모든 여러 어떤 무슨 이런 그런 저런 가장 매우 너무 다시 계속 아직 이미 거의 바로 결국 주요 상태 경우 부분 사람 사람들 우리 자신 서로 만에 처음 이번 당시 최근 오늘 내일 어제 모두 일부 대부분 가운데 사이 이후 이전 동안 무렵 정도 가량 까지 안'.split(/\s+/));
const _KW_JOSA = /(으로서|으로써|이라고|라는|라고|에서|에게|한테|께서|처럼|보다|까지|부터|마다|조차|만큼|이라|이며|이고|에도|에는|으론|으로|로서|로써|은|는|이|가|을|를|에|의|와|과|도|로|만|나|며|란|랑)$/;
const _KW_VERB = /(았다|었다|였다|겠다|졌다|났다|왔다|갔다|쳤다|혔다|뒀다|는다|ㄴ다|린다|운다|진다|긴다|다고|다는|다며|다면|라고|라는|자고|냐고|느냐|나요|까요|세요|어요|아요|여요|군요|거든|잖아|는데|지만|면서|으며|었던|았던|였던|지지|졌|쳐|져|혀|와서|봐|줘|아서|어서|여서|시며|되며|하며)$/;
function captionKeywords(s, max = 5) {
  const words = String(s || '').replace(/[""''「」『』（）()\[\]<>{}"']/g, ' ').replace(/[.,!?…∼~\/:;]+/g, ' ').split(/\s+/).filter(Boolean);
  const out = [];
  for (let w of words) {
    w = w.replace(/(했다|했고|했지만|한다|하는|하고|하며|하면|해서|됐다|됐고|된다|되는|되고|되며|되면|됨|함)$/, '');   // 한자어 서술어 → 명사
    if (_KW_VERB.test(w)) continue;                              // native 동사·연결형·인용형
    if (/다$/.test(w)) continue;                                 // 남은 서술어
    const m = w.match(_KW_JOSA);
    if (m && w.length - m[0].length >= 2) w = w.slice(0, -m[0].length);   // 조사(2글자+ 남을 때만 = 단어 깨짐 방지)
    if (/^\d+[가-힣]{0,2}$/.test(w)) continue;                   // 숫자+단위(5명·22일·27년·3시) — 5·18 등은 통과
    w = w.replace(/^[·\-'']+|[·\-'']+$/g, '');
    if (w.length < 2) continue;
    if (_KW_STOP.has(w)) continue;
    if (/(나요|까요|세요|어요|아요|으며|면서|는데)$/.test(w)) continue;
    if (!out.includes(w)) out.push(w);
    if (out.length >= max) break;
  }
  return out.join('+');
}
function parseCards(md = '') {
  const out = [];
  const re = /###\s*\[카드\s*(\d+)\][\s\S]*?\*\*텍스트\*\*\s*```(?:text)?\s*([\s\S]*?)```(?:[\s\S]*?\*\*이미지\s*프롬프트\*\*\s*```(?:text)?\s*([\s\S]*?)```)?(?:(?:(?!###\s*\[카드)[\s\S])*?\*\*검색어\*\*\s*```(?:text)?\s*([\s\S]*?)```)?/g;
  let m; while ((m = re.exec(md))) out.push({ n: +m[1], caption: (m[2] || '').trim(), prompt: (m[3] || '').trim(), keyword: (m[4] || '').trim() });
  return out;
}
function feedTitle(md = '') { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : ''; }
const STYLE_MAP = [
  [/serious drama|drama illustration|graphic novel|극화/, '극화'],   // 뉴스 기본 = 극화(만화풍 시리어스 드라마)
  [/korean manhwa|\bmanhwa\b/, '만화풍'], [/film-?noir|\bnoir\b/, '느와르'],
  [/chiaroscuro|low-key/, '명암 대비'], [/water\s?color/, '수채'], [/3d render|octane|pixar|unreal/, '3D 렌더'],
  [/photoreal|photo-?realistic|photograph/, '실사'], [/oil paint/, '유화'], [/flat\s?design|\bvector\b/, '플랫 벡터'],
  [/desaturated|muted palette/, '저채도'], [/single color accent|neon green|#0?ffd0?02/, '네온 포인트'],
];
function styleSource(md = '') {
  const pm = md.match(/\*\*이미지\s*프롬프트\*\*\s*```(?:text)?\s*([\s\S]*?)```/);
  const sm = md.match(/^\s*Style:\s*(.+)$/mi);
  return (pm ? pm[1] : sm ? sm[1] : md).toLowerCase();
}
function styleLabels(md = '') {
  const s = styleSource(md), hits = [];
  for (const [re, ko] of STYLE_MAP) if (re.test(s) && !hits.includes(ko)) hits.push(ko);
  return hits.slice(0, 3);
}
function oneLineSummary(body = '') {
  const m = body.match(/한\s*줄\s*요약[^\n]*\n+([\s\S]*?)(?=\n\s*\n|\n#|$)/);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}
const MOOD_MAP = [
  [/film-?noir|\bnoir\b/, '느와르'], [/tense|suspense|thriller/, '긴장'],
  [/somber|melanchol|grief|tragic|mourn/, '비장'], [/serious|heavy|grave|drama/, '진중'],
  [/hope|warm|uplift|bright/, '희망적'], [/calm|quiet|still|serene/, '담담'],
];
function moodLabel(md = '') {
  const s = styleSource(md);
  for (const [re, ko] of MOOD_MAP) if (re.test(s)) return ko;
  return '진중';
}
const DRUG_RE = /마약|펜타닐|필로폰|대마초|코카인|헤로인|메스암페타민|향정신성|엑스터시|케타민|아편/;
const SENSITIVE_MAP = [
  [/성범죄|성착취|불법촬영|디지털\s?성|n번방/, '디지털성범죄'], [/전쟁|공습|미사일|교전|종전|개전|폭격/, '전쟁'],
  [/자살|부고|사망|숨졌|목숨|투신/, '인명피해'], [DRUG_RE, '마약'], [/아동|미성년|소아/, '아동'],
  [/참사|재난|붕괴|화재|침몰/, '참사'], [/학대|폭행|폭력|구타/, '폭력'], [/혐오|차별|증오/, '혐오'], [/테러/, '테러'],
];
function sensitiveTags(text = '') {
  const hits = [];
  for (const [re, ko] of SENSITIVE_MAP) {
    const m = text.match(new RegExp(re.source, 'gi'));
    if (m) hits.push({ ko, n: m.length });
  }
  hits.sort((a, b) => b.n - a.n);   // 많이 언급 = 더 유관
  return hits.slice(0, 2).map(h => h.ko);
}
function buildFeedModel(a) {
  const c = a.cards || {}, imgs = c.images || [], vmap = c.versions || {};
  const cards = parseCards(c.md);
  const base = cards.length ? cards : imgs.map((_, i) => ({ n: i + 1, caption: '', prompt: '' }));   // 파싱 실패 폴백
  return base.map((cd, i) => {
    const vh = vmap[String(cd.n)];   // 버전 히스토리(앞뒤) — [{img,text}…] v0..vK(마지막=현재)
    if (vh && vh.length > 1) {
      return {
        n: cd.n, ratio: '4/5',
        versions: vh.map((v, k) => ({ image: v.img, prompt: cd.prompt,
          caption: k === vh.length - 1 ? cd.caption : (v.text || cd.caption) })),
        cur: vh.length - 1,   // 현재 = 마지막 판
      };
    }
    return { n: cd.n, ratio: '4/5', versions: [{ caption: cd.caption, prompt: cd.prompt, image: imgs[i] || null }], cur: 0 };
  });
}
function feedSec(a, keepIdx = 0) {
  const ph = $('#ph-feed'), host = $('#feedsec'); if (!ph || !host) return;
  host.innerHTML = '';
  const c = a.cards || {}, imgs = c.images || [];
  if (!imgs.length) { ph.hidden = true; return; }     // 이미지 없으면 섹션 3 숨김(섹션 2가 텍스트·슛 담당)
  ph.hidden = false;

  const model = buildFeedModel(a);
  const title = feedTitle(c.md) || a.title || '카드 뉴스';
  const slug = title.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').slice(0, 40) || 'nomute';
  const styles = styleLabels(c.md);
  const doneN = imgs.length, totalN = model.length, partial = c.state === 'fired_partial' || doneN < totalN;

  // 섹션 헤더 = '3. 카드 뉴스'만(총 N장은 표현기법 줄 좌측으로 이동).
  const sm = ph.querySelector('summary');
  if (sm) sm.textContent = '3. 카드 뉴스';

  // 개요 = 제목(부제·박스 밖) + 한줄요약 + 표현기법 1줄(총 N장 | 화풍 | 분위기 | 민감 키워드). 전부 기존 데이터 유도.
  const summary = oneLineSummary(a.body);
  const stags = sensitiveTags(`${title} ${summary}`);   // 최대 2개·유관도순
  // 비용 = 카드 제미나이 생성 누적 토큰/추정$(c.card_usage) — 슛·재생성마다 갱신(썸네일 usageText와 동일 단가). 없으면 '—'.
  const _cu = c.card_usage;
  const _ctok = (_cu && _cu.cumulative) || 0;
  const _costStr = _ctok ? '$ ' + (_ctok * GEM_RATE).toFixed(1) : '—';   // 달러만 표시(토큰 T는 hover 툴팁 _costTitle에만 · 운영자 260629)
  const _costTitle = _ctok ? 'Gemini 카드 제작 누적 ' + _ctok.toLocaleString() + '토큰 · 추정 $' + (_ctok * GEM_RATE).toFixed(1) + (_cu.calls ? ' (최근 ' + _cu.calls + '콜)' : '') : '아직 슛 안 함(카드 이미지 미생성)';
  const tech = `총 <b>${totalN}</b>장${partial ? ` (${totalN - doneN} 대기)` : ''}<span class="fi-sep">|</span>`
    + `화풍 : <b>${esc(styles[0] || '—')}</b><span class="fi-sep">|</span>분위기 : <b>${esc(moodLabel(c.md))}</b>`
    + `<span class="fi-sep">|</span>비용 : <b title="${esc(_costTitle)}">${_costStr}</b>`
    + (stags.length ? `<span class="fi-sep">|</span>주의 : ${stags.map(s => `<b class="acc">#${esc(s)}</b>`).join(' ')}` : '');

  const intro = document.createElement('div'); intro.className = 'feedhead';
  intro.innerHTML =
    `<div class="fi-top"><h3 class="fi-title">${esc(title)}</h3>
       <button class="sbtn cref-dlall dlbtn" type="button" title="전체 다운로드" aria-label="전체 다운로드">${DLSEQ_IC}<span class="cref-dllbl">전체</span></button></div>
     <div class="fi-card">
       ${summary ? `<div class="fi-summary">${esc(summary)}</div>` : ''}
       <div class="fi-tech">${tech}</div>
     </div>`;
  host.appendChild(intro);
  intro.querySelector('.cref-dlall').onclick = e => { e.stopPropagation(); dlAllSeq(e.currentTarget, model.map(m => m.versions[m.cur].image), i => `${dlStamp(CUR_A)}_${slug}_${String(i + 1).padStart(2, '0')}.jpg`); };   // 통합: 진행 i/N → 초록 ✓(검색이미지 전체와 동일)

  const track = document.createElement('div'); track.className = 'feedtrack'; track.tabIndex = 0;
  track.setAttribute('aria-label', '카드 뉴스 피드 — 좌우로 한 장씩 넘겨보기');
  model.forEach((card, i) => track.appendChild(renderSlide(card, i, { slug, total: totalN, file: a.file })));
  const wrap = document.createElement('div'); wrap.className = 'feedwrap'; wrap.appendChild(track);
  if (totalN > 1) {   // 좌우 글래스 화살표(PC 넘김 — 모바일은 스와이프 병행)
    const step = dir => track.scrollBy({ left: dir * (track.clientWidth || 1), behavior: 'smooth' });
    const navP = document.createElement('button'), navN = document.createElement('button');
    navP.type = navN.type = 'button'; navP.className = 'feednav prev'; navN.className = 'feednav next';
    navP.setAttribute('aria-label', '이전'); navN.setAttribute('aria-label', '다음');
    navP.innerHTML = CHEV_L_SVG; navN.innerHTML = CHEV_R_SVG;   // 표지판 도형 = SVG 픽토그램(유니코드 ‹› 폐지·§🔒 3-1·nm-svg CHEV_*_SVG = 아이콘 SSOT 게이트 편입)
    navP.onclick = () => step(-1); navN.onclick = () => step(1);
    const updateNav = () => { const max = track.scrollWidth - track.clientWidth - 2; navP.disabled = track.scrollLeft <= 2; navN.disabled = track.scrollLeft >= max; };
    track.addEventListener('scroll', updateNav, { passive: true });
    wrap.append(navP, navN); requestAnimationFrame(updateNav);
  }
  host.appendChild(wrap);

  // 키보드 ←/→ = 한 장씩(스냅). 위치 카운트는 각 슬라이드 좌상단 오버레이.
  track.addEventListener('keydown', e => {
    const w = track.clientWidth || 1, idx = Math.round(track.scrollLeft / w);
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollTo({ left: (idx + 1) * w, behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollTo({ left: (idx - 1) * w, behavior: 'smooth' }); }
  });
  // PC: 마우스로 잡아끌어 좌우 넘김(터치는 네이티브 스와이프). 드래그 후 클릭(라이트박스)은 억제.
  track.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('.sbtn,.vbtn,.slide-fb,.feednav')) return;   // 버튼/패널 위에선 드래그 안 함
    const sl = track.scrollLeft, x0 = e.clientX; let moved = false;
    track.classList.add('dragging');
    const mv = ev => { track.scrollLeft = sl - (ev.clientX - x0); if (Math.abs(ev.clientX - x0) > 4) moved = true; };
    const up = () => {
      window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up);
      track.classList.remove('dragging'); track._dragged = moved;
      const w = track.clientWidth || 1; track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: 'smooth' });
    };
    __on(window, 'mousemove', mv); __on(window, 'mouseup', up); e.preventDefault();
  });
  track.addEventListener('click', e => { if (track._dragged) { e.stopPropagation(); e.preventDefault(); track._dragged = false; } }, true);   // 드래그 직후 클릭 억제

  // ── 고정 UI 오버레이 — 사진만 넘어가고 카운트·버튼·버전네비는 제자리. 스크롤 정착 시 현재 사진에 바인딩 ──
  const ui = document.createElement('div'); ui.className = 'feed-ui';
  ui.innerHTML =
    `<span class="slide-no"></span>
     <div class="slide-acts">
       <button class="sbtn fbup" type="button" aria-label="좋았던 카드">${THUMBUP_SVG}</button>
       <button class="sbtn fbdown" type="button" aria-label="아쉬운 카드">${THUMBDOWN_SVG}</button>
       <button class="sbtn edit" type="button" aria-label="이 카드 수정" title="이 카드 수정">${EDIT_SVG}</button>
       <button class="sbtn ovl dlbtn" type="button" aria-label="오버레이만 투명 PNG" title="오버레이만 투명 PNG(글자+그라데이션)">${LAYERS_SVG}</button>
       <a class="sbtn save dlbtn" aria-label="이 사진 저장">${DOWNLOAD_SVG}</a>
     </div>
     <div class="slide-ver">
       <button class="vbtn vprev" type="button" aria-label="이전 판">전</button>
       <button class="vbtn vnext" type="button" aria-label="다음 판">후</button>
     </div>`;
  wrap.appendChild(ui);
  const uiNo = ui.querySelector('.slide-no'), uiEdit = ui.querySelector('.edit'), uiSave = ui.querySelector('.save'),
    uiVer = ui.querySelector('.slide-ver'), uiVlbl = ui.querySelector('.vlbl'),
    uiVprev = ui.querySelector('.vprev'), uiVnext = ui.querySelector('.vnext');
  let curIdx = -1;
  const setSlideImage = (slideEl, image) => {   // 같은 자리 사진만 교체(버전 넘김)
    const im = slideEl && slideEl.querySelector('img'); if (!im) return;
    im.classList.remove('in'); im.onload = () => im.classList.add('in'); im.src = image;   // 라이트박스 끔(탭 확대 없음)
  };
  const syncFeed = idx => {   // 현재 사진(idx)에 오버레이 바인딩 — '넘어간 후 그 사진에 버튼 적용'
    const card = model[idx]; if (!card) return;
    curIdx = idx;
    const v = card.versions[card.cur] || {};
    uiNo.innerHTML = `<b>${card.n}</b>/${totalN}`;
    uiEdit.onclick = () => openEdit({ card, idx, file: a.file });
    if (v.image) { uiSave.style.display = ''; const dn = `${dlStamp(CUR_A)}_${slug}_${String(idx + 1).padStart(2, '0')}.jpg`; uiSave.href = v.image; uiSave.setAttribute('download', dn); uiSave.classList.toggle('dl-done', dlSeen(v.image)); uiSave.onclick = e => { e.preventDefault(); downloadImg(v.image, dn, uiSave); dlMark(v.image, uiSave); }; }   // R2=프록시 경유(교차출처 a[download] 무시 문제 해소)·href는 폴백 · '받음' mut
    else { uiSave.style.display = 'none'; uiSave.onclick = null; }
    const uiOvl = ui.querySelector('.ovl'); uiOvl.classList.remove('dl-done');   // 오버레이 PNG = 카드별 산출 → 카드 전환 시 초기화(클릭 시 generic 핸들러가 mut)
    uiOvl.onclick = () => exportOverlay(card, idx, slug);   // 오버레이만 투명 PNG
    ui.querySelector('.fbup').onclick = () => onThumb(card, 'up', ui, a.file);
    ui.querySelector('.fbdown').onclick = () => onThumb(card, 'down', ui, a.file);
    applyVoteState(ui, a.file, card.n);   // 기존 투표(localStorage) 반영
    // 버전 네비 = 전/후. 여러 판일 때만 노출, 그 방향 판이 있으면 흰색+그림자(:not(:disabled)) 없으면 25% 비활성.
    const showVer = card.versions.length > 1;
    uiVer.classList.toggle('show', showVer);   // [hidden]은 .slide-ver{display}에 눌려서 안 먹음 → 클래스로 제어
    if (showVer) { uiVprev.disabled = card.cur <= 0; uiVnext.disabled = card.cur >= card.versions.length - 1; }
    const fb = ui.querySelector('.slide-fb'); if (fb) fb.remove();   // 카드 전환 = 열린 피드백 패널 닫기
    ui.classList.toggle('reshooting', !!(track.children[idx] && track.children[idx].classList.contains('reshooting')));   // 재생성 중 카드면 오버레이 조작 잠금
  };
  const changeVer = d => {
    const card = model[curIdx]; if (!card) return;
    const nc = card.cur + d; if (nc < 0 || nc >= card.versions.length) return;
    card.cur = nc; setSlideImage(track.children[curIdx], card.versions[nc].image); syncFeed(curIdx);
  };
  uiVprev.onclick = () => changeVer(-1); uiVnext.onclick = () => changeVer(1);
  track._sync = syncFeed;   // REPENDING 자동교체 후 재바인딩용
  // 스크롤로 다른 사진이 가운데 오면(인덱스 변화) 그 사진에 버튼 재바인딩
  track.addEventListener('scroll', () => {
    const idx = Math.round(track.scrollLeft / (track.clientWidth || 1));
    if (idx !== curIdx) syncFeed(idx);
  }, { passive: true });
  const startIdx = Math.min(Math.max(0, keepIdx), totalN - 1);
  if (startIdx > 0) requestAnimationFrame(() => { track.scrollLeft = startIdx * (track.clientWidth || 1); });   // REPENDING 후 위치 복원
  syncFeed(startIdx);
}
function renderSlide(card, i, ctx) {
  const v = card.versions[card.cur];
  const fig = document.createElement('div'); fig.className = 'slide'; fig.dataset.card = card.n;   // 자동 제자리 교체용
  // 슬라이드 = 사진만(버튼·카운트·버전네비는 고정 오버레이 .feed-ui로 이관 — 넘길 때 UI 그대로, 사진만 넘어감).
  if (v.image) {
    fig.innerHTML = `<div class="slide-img"><img class="slide-photo" loading="lazy" alt="카드 ${card.n}"></div>`;
    const im = fig.querySelector('img');
    im.onload = () => im.classList.add('in'); im.onerror = () => im.classList.add('in'); im.src = v.image;
    // 탭 확대(라이트박스) 끔 — 요청. (스와이프·드래그만)
  } else {
    fig.innerHTML = `<div class="slide-img"><div class="slide-wait">이미지 생성 대기…<br>다음 갱신 때 채워져</div></div>`;
  }
  return fig;   // 캡션은 이미지에 박혀 있어 미표시 — 텍스트는 수정 팝업(1b)에서 편집.
}
let EDIT_CTX = null, edLines = [], PENDING_FOCUS = null, PENDING_EDIT = null, _edRendering = false, _edFiring = false, _edArmed = false, _edArmT = null, edCardIo = null;
let _editKeptKey = null, _editDiscardOnClose = false;
const cardKeyOf = o => (o && o.card) ? (o.file + '#' + o.card.n) : null;
const MAX_LINES = 4;
function openEdit(o) {
  const dlg = $('#editdlg'), key = cardKeyOf(o);
  // ★ 같은 카드 변경버튼 재진입 = 보존된 미제출 편집 복원(재로드·리셋 스킵 · wish·edLines·sync·scene는 globals/DOM에 그대로 살아있음 · 최소화 폐지·운영자 260628)
  if (_editKeptKey && _editKeptKey === key && EDIT_CTX) {
    _editKeptKey = null; EDIT_CTX = o;   // 카드 ref만 갱신(미제출이라 caption 동일 = edLines 유효)
    dlg.querySelector('.ed-title').textContent = `카드 ${o.card.n} 변경`;
    const img = dlg.querySelector('.ed-img'); img.alt = `카드 ${o.card.n}`;
    if (!editScene) { const v = o.card.versions[o.card.cur] || {}; img.src = v.image || ''; }   // scene 있으면 updateEditAttach→updateEditBaf가 미리보기로 채움
    renderEditChips(); resetEditFootLight(); updateEditAttach();   // 보존 칩·버튼클린·첨부UI/전후배지 복원
    dlg.querySelector('.ed-body').scrollTop = 0; $('#edtop').classList.remove('show');
    openComposeDlg(dlg); fitEditLines($('#edChips'));
    if (editScene) schedEditPreview();   // 첨부 미리보기 재합성
    return;
  }
  _editKeptKey = null;   // 다른 카드 = 보존 폐기·fresh 로드
  EDIT_CTX = o;
  const v = o.card.versions[o.card.cur];
  dlg.querySelector('.ed-title').textContent = `카드 ${o.card.n} 변경`;
  const img = dlg.querySelector('.ed-img'); img.src = v.image || ''; img.alt = `카드 ${o.card.n}`;
  edLines = parseEmphLines(v.caption || '');   // *마커 → 줄별 어절 배열(줄바꿈 보존·강조 어절)
  PENDING_FOCUS = null; PENDING_EDIT = null; _edRendering = false;   // 이전 세션 잔여 편집상태 격리(재열기 stale 차단)
  $('#edWish').value = '';
  renderEditChips();
  resetEditFoot();   // 확인 게이트·#edGo 비활성/라벨·확인메시지·발사잠금 초기화(끊긴 fetch·재열기 잔존 차단)
  dlg.querySelector('.ed-body').scrollTop = 0; $('#edtop').classList.remove('show');   // 맨 위
  openComposeDlg(dlg);   // showModal + 폰 뒤로가기 칸(입력 손실 방지·260627)
  fitEditLines($('#edChips'));   // 모달 표시 직후(레이아웃 확정) 행 폭 즉시 맞춤(첫 열림 보장)
}
function parseEmphLines(s) {
  const arr = [...s]; const plain = []; const ce = []; let on = false;
  for (let p = 0; p < arr.length; p++) {
    if (arr[p] === '*') { on = !on; continue; }
    plain.push(arr[p]); ce.push(on);   // ce[i] = plain[i]가 강조 안인지
  }
  const lines = [[]]; let cur = lines[0]; let i = 0;
  while (i < plain.length) {
    const ch = plain[i];
    if (ch === '\n') { cur = []; lines.push(cur); i++; continue; }
    if (ch === ' ' || ch === '\t') { i++; continue; }   // 공백 = 어절 구분(토큰 안 만듦)
    let j = i, text = ''; const em = []; let allOn = true, allOff = true;
    while (j < plain.length && plain[j] !== ' ' && plain[j] !== '\t' && plain[j] !== '\n') {
      em.push(ce[j]); if (ce[j]) allOff = false; else allOn = false; text += plain[j]; j++;
    }
    if (allOn) cur.push({ text, on: true });
    else if (allOff) cur.push({ text, on: false });
    else cur.push({ text, on: false, em });   // 어절 중간 경계 → 글자맵 보존
    i = j;
  }
  return lines.slice(0, MAX_LINES);   // 로드 시 4줄 하드캡(방어)
}
const EDLINE_HANGUL = 18, EDLINE_WIDTH = 19.5, EDLINE_SOFT = 14;
function edHangul(s) { return (s.match(/[가-힣]/g) || []).length; }
function edWidth(s) { let w = 0; for (const ch of s) w += /[가-힣ㄱ-ㅎㅏ-ㅣ‘-‟…　-〿＀-￯]/.test(ch) ? 1 : 0.5; return w; }
function edMarkWarn() {   // 줄별 '글자단위': 누적이 한도(가중폭19.5·한글18) 넘는 글자부터 빨강(_overFrom). 줄 길면 호박(_warn).
  for (const line of edLines) {
    let w = 0, hg = 0, over = false;
    line.forEach((wd, k) => {
      if (k) w += 0.5;   // 어절 사이 공백
      const wasOver = over; let from = -1;
      const chars = [...wd.text];
      for (let ci = 0; ci < chars.length; ci++) {
        w += edWidth(chars[ci]); hg += edHangul(chars[ci]);
        if (!over && (w > EDLINE_WIDTH || hg > EDLINE_HANGUL)) { over = true; from = ci; }   // 이 글자에서 처음 넘침
      }
      if (wasOver) { wd._over = true; wd._overFrom = 0; }          // 앞 어절서 이미 초과 → 통째 빨강
      else if (over) { wd._over = true; wd._overFrom = from >= 0 ? from : 0; }   // 이 어절의 from글자부터 빨강
      else { wd._over = false; wd._overFrom = -1; }
    });
    let tw = 0; line.forEach((wd, k) => { if (k) tw += 0.5; tw += edWidth(wd.text); });
    const warn = tw > EDLINE_SOFT;
    line.forEach(wd => { wd._warn = warn && !wd._over; });
  }
}
function lineWidthWith(li, wi, newText) {   // li줄에서 wi어절을 newText로 본 줄 길이(편집 중 라이브 빨강 체크)
  let w = 0, hg = 0;
  edLines[li].forEach((wd, k) => { if (k) w += 0.5; const t = k === wi ? newText : wd.text; w += edWidth(t); hg += edHangul(t); });
  return { w, hg };
}
function lineFull(line) {   // 줄이 한도(가중폭19.5·한글18)에 닿음 = 더 못 담음 → 줄끝 어절+ 숨김(item 3)
  let w = 0, hg = 0;
  line.forEach((wd, k) => { if (k) w += 0.5; w += edWidth(wd.text); hg += edHangul(wd.text); });
  return w >= EDLINE_WIDTH || hg >= EDLINE_HANGUL;
}
function clipLineOver(li) {   // 도형 이탈 시: 줄 한도 넘는 글자부터 전부 탈락(걸린 음절·뒤 어절 자동 정리) — 가나다라마 → 가나다라
  const line = edLines[li]; if (!line) return;
  let w = 0, hg = 0;
  for (let k = 0; k < line.length; k++) {
    if (k) w += 0.5;   // 어절 사이 공백
    const chars = [...line[k].text];
    let cut = -1;
    for (let ci = 0; ci < chars.length; ci++) {
      w += edWidth(chars[ci]); hg += edHangul(chars[ci]);
      if (w > EDLINE_WIDTH || hg > EDLINE_HANGUL) { cut = ci; break; }
    }
    if (cut < 0) continue;
    const kept = chars.slice(0, cut).join('');
    if (kept) { line[k].text = kept; line[k].em = null; line.length = k + 1; }   // 이 어절 일부만 남기고 뒤 어절 전부 제거(글자맵 무효)
    else { line.length = k; }                                  // 앞 공백서 이미 초과 → 이 어절 통째 탈락
    for (let j = line.length - 1; j >= 0; j--) if (line[j].text === '') line.splice(j, 1);   // 빈 어절 정리
    return;
  }
}
function edReject(el) { el.classList.add('reject'); setTimeout(() => el.classList.remove('reject'), 600); }
function renderEditChips() {   // 어절칩 렌더 — 중첩 모델(edLines). 메인 필터칩 renderChips와 별개.
  _edRendering = true;   // innerHTML='' 가 포커스 칩을 떼면 동기 blur가 터짐 → 그 stale blur가 분할 재실행하는 것 차단
  edDisarm();   // 텍스트 바뀌면 재확인(arm) 해제(stale 발사 방지)
  schedEditPreview();   // 첨부 사진 미리보기 있으면 새 문구로 갱신(디바운스·editScene 없으면 no-op)
  const wrap = $('#edChips'); wrap.innerHTML = ''; wrap.classList.add('ed-building');   // 재빌드 동안 전환 억제(아래 rAF서 해제)
  // 빈 어절칩 정리 — 갓 추가돼 편집 대기 중인 1개(PENDING_EDIT)만 남기고 모두 제거.
  // (_edRendering 가드가 빈칩 blur 정리를 삼켜 '+' 반복 시 빈 도형이 잔존하던 것 방지)
  edLines.forEach((line, li) => {
    for (let j = line.length - 1; j >= 0; j--) {
      const pending = PENDING_EDIT && PENDING_EDIT.li === li && PENDING_EDIT.wi === j;
      if (line[j].text === '' && !pending) {
        line.splice(j, 1);
        if (PENDING_EDIT && PENDING_EDIT.li === li && PENDING_EDIT.wi > j) PENDING_EDIT.wi--;   // 인덱스 보정
      }
    }
  });
  edMarkWarn();
  const full = edLines.length >= MAX_LINES;
  edLines.forEach((line, li) => {
    const row = document.createElement('div'); row.className = 'ed-line'; row.dataset.li = li;
    if (line.length === 0) {   // 빈 줄 = 입력용 placeholder 칩
      const e = document.createElement('span'); e.className = 'ed-chip ed-empty'; e.contentEditable = 'true'; e.spellcheck = true; e.lang = 'ko';
      e.oninput = ev => {   // 타이핑 중 스페이스 = 그 자리서 즉시 어절 분리(어절칩 oninput 세포분열과 동일 · IME 조합 중 제외 · 제작 칩과 통일 · 운영자 260710)
        const raw = e.textContent, si = raw.search(/\s/);
        if (si >= 0 && !ev.isComposing) {
          const left = raw.slice(0, si).trim(), right = raw.slice(si + 1).trim();
          if (left) { edLines[li] = [{ text: left, on: false }, { text: right, on: false }]; PENDING_EDIT = { li, wi: 1 }; renderEditChips(); return; }
          e.textContent = right;   // 맨 앞 공백만 = 제거하고 계속
          const sel = window.getSelection(), r = document.createRange(); r.selectNodeContents(e); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);   // textContent 교체로 캐럿이 앞으로 튐 → 끝 복원
        }
        fitEditLines(wrap);
      };
      e.onkeydown = ev => {
        if (ev.key === 'Enter') {   // 엔터 = 줄바꿈: 기존 커밋(blur=어절 분리·한도 클립) 후 아래 새 줄 + 커서(빈 입력은 기존 줄 정리 그대로 · 제작 칩과 통일 · 운영자 260710)
          ev.preventDefault();
          const filled = !!e.textContent.replace(/\s+/g, ' ').trim();
          e.blur();
          if (filled) addLineAfter(li);   // MAX_LINES 가드 = addLineAfter
        }
      };
      e.onblur = () => {
        if (_edRendering || !e.isConnected) return;   // 재렌더 중/떨어져 나간 stale blur 무시(빈줄 이중삭제 방지)
        const nt = e.textContent.replace(/\s+/g, ' ').trim();
        if (!nt) { dropLine(li); return; }   // 안 채우고 떠남 → 줄 제거
        edLines[li] = nt.split(/\s+/).map(t => ({ text: t, on: false }));
        clipLineOver(li);   // 한 줄에 너무 많이 입력 → 한도 초과분 자동 탈락
        renderEditChips();
      };
      row.appendChild(e);
    } else {
      line.forEach((wd, wi) => {
        const chip = document.createElement('span');
        chip.className = 'ed-chip' + (wd.on ? ' on' : '') + (wd._warn ? ' warn' : '') + (wd._over ? ' over' : '');
        chip.dataset.li = li; chip.dataset.wi = wi;
        if (wd._over && wd._overFrom > 0) {   // 글자단위: 안전부분 + 초과부분(빨강 span)
          const a = [...wd.text];
          chip.innerHTML = esc(a.slice(0, wd._overFrom).join('')) + '<span class="ovc">' + esc(a.slice(wd._overFrom).join('')) + '</span>';
        } else if (wd._over) { chip.innerHTML = '<span class="ovc">' + esc(wd.text) + '</span>'; }   // 통째 초과
        else if (wd.em) {   // 어절 중간 강조 경계 = 글자별 초록/흰색 부분 하이라이트(카드와 동일)
          const a = [...wd.text]; let h = '', run = null;
          a.forEach((c, ci) => { const e = !!wd.em[ci]; if (e !== run) { if (run !== null) h += '</span>'; h += e ? '<span class="emon">' : '<span>'; run = e; } h += esc(c); });
          if (run !== null) h += '</span>'; chip.innerHTML = h;
        }
        else { chip.textContent = wd.text; }
        chip.title = '탭=강조 / 더블탭=수정(비우면 삭제)';
        chip.onclick = () => {   // 탭=강조 토글. 더블탭(수정)과 충돌 차단 — 칩별 200ms 디바운스(dblclick 오면 취소). 칩별 타이머라 다른 칩 탭끼린 안 지움.
          if (chip.isContentEditable) return;
          clearTimeout(chip._tapT);
          chip._tapT = setTimeout(() => {
            if (wd.em) { wd.em = null; wd.on = true; renderEditChips(); return; }   // 혼합 → 탭 1회로 통째 강조 확정
            wd.on = !wd.on; chip.classList.toggle('on');
          }, 200);
        };
        chip.ondblclick = () => { clearTimeout(chip._tapT); chip.textContent = wd.text; chip.contentEditable = 'true'; chip.spellcheck = true; chip.lang = 'ko'; chip.classList.add('editing'); chip.focus(); window.getSelection()?.selectAllChildren(chip); };
        chip.onkeydown = ev => {
          if (ev.key === 'Enter') {   // 엔터 = 커밋 + 줄바꿈(줄 끝 어절 입력 중 한정 = 타이핑 흐름 · 중간 어절 수정은 커밋만 · 제작 칩과 통일 · 운영자 260710)
            ev.preventDefault();
            const last = wi === edLines[li].length - 1, survive = !!chip.textContent.replace(/\s+/g, ' ').trim() || edLines[li].length > 1;
            chip.blur();   // 기존 커밋 경로 그대로(분할·삭제·한도 클립)
            if (last && survive) addLineAfter(li);   // 줄 자체가 사라지는 경우(마지막 어절 비움) 제외 · MAX_LINES 가드 = addLineAfter
            return;
          }
          // 어절을 다 지운 뒤 백스페이스 = 앞 어절로 넘어가 이어서 지움(같은 줄 안에서만 · wi=0이면 멈춤=이전 줄로 안 감=마지노선 · 운영자 260630)
          if (ev.key === 'Backspace' && !ev.isComposing && wi > 0 && !chip.textContent.replace(/[\s\u200b\uFEFF\u2060]/g, '')) {   // !isComposing=IME 조합 중 자모삭제 보호 · 정규식=ZWSP/BOM/word-joiner 잔존도 빈칩 판정
            ev.preventDefault();
            edLines[li].splice(wi, 1);           // 빈 어절 제거
            PENDING_EDIT = { li, wi: wi - 1 };   // 앞 어절 편집 진입(커서 끝 — 이어서 백스페이스 가능)
            renderEditChips();
          }
        };
        chip.oninput = ev => {   // 편집 중: 스페이스=그 자리서 두 어절로 분리(세포 분열·IME 조합 중 제외) / 폭 / 라이브 빨강
          const raw = chip.textContent, si = raw.search(/\s/);
          if (si >= 0 && !ev.isComposing) {
            const left = raw.slice(0, si).trim(), right = raw.slice(si + 1).trim();
            if (left) { edLines[li].splice(wi, 1, { text: left, on: wd.on }, { text: right, on: wd.on }); PENDING_EDIT = { li, wi: wi + 1 }; renderEditChips(); return; }
            chip.textContent = right;   // 맨 앞 공백만 = 제거하고 계속
          }
          fitEditLines(wrap);
          const { w, hg } = lineWidthWith(li, wi, raw.replace(/\s+/g, ' ').trim());
          chip.classList.toggle('over', w > EDLINE_WIDTH || hg > EDLINE_HANGUL);
        };
        chip.onblur = () => {
          if (_edRendering || !chip.isConnected) return;   // 재렌더 중/떨어진 stale blur 무시(분할 이중실행 차단)
          chip.contentEditable = 'false'; chip.classList.remove('editing');
          const nt = chip.textContent.replace(/\s+/g, ' ').trim();
          if (nt === wd.text) { clipLineOver(li); renderEditChips(); return; }
          if (!nt) { edLines[li].splice(wi, 1); if (edLines[li].length === 0) { dropLine(li); return; } }   // 비움 → 어절 삭제(+빈줄이면 줄 제거)
          else if (/\s/.test(nt)) { edLines[li].splice(wi, 1, ...nt.split(/\s+/).map(t => ({ text: t, on: wd.on }))); }   // 공백 → 어절 분할(줄 수 불변)
          else { wd.text = nt; wd.em = null; }   // 텍스트 변경 → 글자맵 무효(인덱스 어긋남)
          clipLineOver(li);   // 이탈 시 한도 초과분 자동 탈락
          renderEditChips();
        };
        row.appendChild(chip);
      });
      if (!lineFull(line)) {   // 한도 닿은 줄엔 어절+ 안 보임(item 3 — 더 못 담음)
        const addw = document.createElement('span'); addw.className = 'ed-addw'; addw.textContent = '+'; addw.title = '이 줄에 어절 추가';   // 줄 끝 글자 + = 어절 추가
        addw.onclick = () => { edLines[li].push({ text: '', on: false }); PENDING_EDIT = { li, wi: edLines[li].length - 1 }; renderEditChips(); };
        row.appendChild(addw);
      }
    }
    const add = document.createElement('button'); add.type = 'button'; add.className = 'ed-add' + (full ? ' cap' : '') + (li === 0 ? ' ed-half' : ''); add.textContent = '+'; add.setAttribute('aria-label', '새 줄 추가'); add.title = full ? '최대 4줄' : '아래에 줄 추가';   // 첫 줄 +는 절반·우하단(위 클립버튼 겹침 회피·260629)
    add.onclick = () => { if (full) { edReject(add); return; } addLineAfter(li); };   // 4줄이면 거부(흔들기)
    row.appendChild(add);
    wrap.appendChild(row);
  });
  if (PENDING_FOCUS != null) {   // 줄 추가 직후 '동기' 포커스(모바일 키보드 유지 — rAF 금지)
    const e = wrap.querySelector(`.ed-line[data-li="${PENDING_FOCUS}"] .ed-empty`);
    if (e) e.focus();
    PENDING_FOCUS = null;
  }
  if (PENDING_EDIT) {   // 어절 추가·분할 직후 그 칩 편집 진입(커서 끝)
    const { li: pl, wi: pw } = PENDING_EDIT; PENDING_EDIT = null;
    const c = wrap.querySelector(`.ed-chip[data-li="${pl}"][data-wi="${pw}"]`), pwd = edLines[pl] && edLines[pl][pw];
    if (c && pwd) {
      c.textContent = pwd.text; c.contentEditable = 'true'; c.spellcheck = true; c.lang = 'ko'; c.classList.add('editing'); c.focus();
      const sel = window.getSelection(), r = document.createRange(); r.selectNodeContents(c); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
    }
  }
  _edRendering = false;   // 렌더·포커스 복원 끝 — 이후 사용자 blur는 정상 처리
  if (edCardIo) edCardIo();   // 카드변경 칩 클립버튼(복사/지우개) 상태 갱신(내용 유무 따라)
  requestAnimationFrame(() => { wrap.classList.remove('ed-building'); fitEditLines(wrap); });   // 다음 프레임 = 전환 복원(탭 토글 애니 정상) + 반응형 폭 맞춤
}
function addLineAfter(li) {   // 그 줄 바로 아래 빈 줄 + 커서
  if (edLines.length >= MAX_LINES) return;
  edLines.splice(li + 1, 0, []);
  PENDING_FOCUS = li + 1;
  renderEditChips();
}
function dropLine(li) {   // 빈 줄 제거 — 단 마지막 1줄은 빈 채로 유지(저장 게이트가 빈 텍스트 막음)
  if (edLines.length <= 1) { edLines[0] = []; renderEditChips(); return; }
  edLines.splice(li, 1);
  renderEditChips();
}
function fitEditLines(wrap) {
  if (!wrap) return;
  const rows = wrap.querySelectorAll('.ed-line');
  if (!rows.length) return;
  const cs = getComputedStyle(wrap);
  const avail = wrap.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0) - 2;
  if (avail <= 0) return;
  // 기준 줄 = 가중폭 ~19.5(카드 전형 4어절). content-width로 재려고 absolute(stretch 영향 제거).
  // 측정 1배는 ref에만 — 실제 줄(wrap)을 매 키마다 1배로 리셋하면 폰트크기가 커졌다 줄며 떨림(분신술 A9). ref만 1배라 측정값 동일·실제 줄은 직전 스케일 유지.
  const ref = document.createElement('div'); ref.className = 'ed-line';
  ref.style.cssText = 'position:absolute; left:-9999px; top:0; visibility:hidden; width:max-content; --eds:1;';
  ['뉴스종합', '정치경제', '국제사회', '심층분석속보'].forEach(t => {   // 18자 4어절 ≈ 가중폭 19.5(어절 사이 = .ed-line gap)
    const c = document.createElement('span'); c.className = 'ed-chip'; c.textContent = t; ref.appendChild(c);
  });
  { const aw = document.createElement('span'); aw.className = 'ed-addw'; aw.textContent = '+'; ref.appendChild(aw); }   // 줄 끝 어절+ 도 폭 반영(실제 행과 대칭)
  wrap.appendChild(ref);
  const refW = ref.getBoundingClientRect().width;
  wrap.removeChild(ref);
  let eds = refW > 0 ? Math.min(1.1, avail / refW) : 1;   // 19.5 줄 = 박스폭 (소폭 확대 허용)
  eds = Math.max(0.45, eds);
  const setEds = v => { const s = v.toFixed(3); if (wrap.style.getPropertyValue('--eds') !== s) wrap.style.setProperty('--eds', s); };   // 값 동일하면 set 생략(불필요 style 무효화·떨림 차단)
  setEds(eds);
  // 안전망 — 어느 줄이든 박스를 넘으면(빽빽/비선형/한도초과) 수렴 축소해 박스 안에 둠
  // (초과줄도 박스 안에 들어오되 넘치는 어절은 빨강으로 보임 → '오버되는 부분'이 화면 안에서 빨갛게 보임).
  for (let pass = 0; pass < 4; pass++) {
    let maxw = 0; rows.forEach(r => { if (r.scrollWidth > maxw) maxw = r.scrollWidth; });
    if (maxw <= avail) break;
    eds = Math.max(0.4, eds * avail / maxw);
    setEds(eds);
  }
}
function buildEmphText() {
  const charEm = (wd, ci) => wd.em ? !!wd.em[ci] : wd.on;   // 글자 ci의 강조 여부(em 있으면 글자맵, 없으면 어절 통째)
  return edLines.map(line => {
    const words = line.filter(wd => wd.text !== '');
    // (글자, 강조) 시퀀스 — 어절 사이 공백은 양쪽 끝 글자가 둘 다 강조일 때만 강조 안(=병합)
    const seq = [];
    words.forEach((wd, k) => {
      const chars = [...wd.text];
      if (k) {
        const prev = words[k - 1], pc = [...prev.text];
        seq.push({ c: ' ', e: charEm(prev, pc.length - 1) && charEm(wd, 0) });
      }
      chars.forEach((c, ci) => seq.push({ c, e: charEm(wd, ci) }));
    });
    let out = '', on = false;
    seq.forEach(s => { if (s.e && !on) { out += '*'; on = true; } else if (!s.e && on) { out += '*'; on = false; } out += s.c; });
    if (on) out += '*';   // 줄끝 강조 닫기(합성기 '줄넘김 강조 금지')
    return out;
  }).filter(s => s !== '').join('\n');   // 빈 줄(앞·중간·끝) 제거 → 카드에 빈 줄 안 들어감
}
const REPENDING = new Map();
function cardVerNo(u) { const m = /\/versions\/card-\d+\/v(\d+)\.jpe?g(?:\?|$)/i.exec(u || ''); return m ? parseInt(m[1], 10) : null; }
function cardMaxVer(card) { let k = null; for (const v of (card && card.versions) || []) { const n = cardVerNo(v.image); if (n != null && (k == null || n > k)) k = n; } return k; }
let _polling = false;
const rpKey = (file, card) => file + '#' + card;
const REVISING = new Map();
const REV_PEND_KEY = 'nomute_rev_pending';
const RV_COLORS = ['0,238,210', '255,225,61', '56,198,255'];
const revColor = g => g <= 0 ? RV_COLORS[0] : RV_COLORS[1 + ((((g - 1) % 2) + 2) % 2)];
const artRev = file => { const a = DATA.find(x => x.file === file); return a ? (Number(a.rev) || 0) : 0; };
const isRevising = file => REVISING.has(file);
const saveRevising = () => { try { localStorage.setItem(REV_PEND_KEY, JSON.stringify([...REVISING])); } catch {} };
function loadRevising() {   // 부팅 복원 — 진행 중이던 수정(20분 내)만 되살려 폴 재개(reqRev 원값 보존 = 완료 오인 방지)
  try {
    const now = Date.now();
    for (const [file, v] of JSON.parse(localStorage.getItem(REV_PEND_KEY) || '[]'))
      if (v && typeof v.ts === 'number' && now - v.ts < 20 * 60000) REVISING.set(file, v);
  } catch {}
  if (REVISING.size) startRevisePoll();
}
function startRevising(file) {
  if (!file) return;
  REVISING.set(file, { reqRev: artRev(file), ts: Date.now() });   // 요청 시점 서버 회차 스냅(완료 = a.rev가 이보다 ↑)
  saveRevising();
  render();                                                  // 피드 카드 물결·잠금 반영(복원 260623)
  if ($('#dlg').open && CUR === file) applyReviseMarks();
  startRevisePoll();
}
let _revPoll = null;
function startRevisePoll() {
  if (_revPoll) return;
  _revPoll = setInterval(async () => {
    if (isComposingModalOpen()) return;   // ⚠️ 작성 모달 중엔 폴 보류(load→render가 backdrop-filter 뒤 DOM 갱신 = 깜빡임 · 다음 틱 재개 · 260627)
    await load();                                            // DATA 갱신(articles.json = a.rev 최신)
    let changed = false;
    for (const [file, v] of [...REVISING]) {
      if (artRev(file) > v.reqRev) {                         // 서버 회차 ↑ = 수정 반영 완료
        REVISING.delete(file); changed = true;
        if ($('#dlg').open && CUR === file) {                // 열린 본문 자동 갱신(스크롤 위치 보존)
          const a = DATA.find(x => x.file === file);
          if (a) { const db = $('#dlgbody'), st = db ? db.scrollTop : 0; open(a).then(() => { if (db) db.scrollTop = st; }); }
        }
      } else if (Date.now() - v.ts > 20 * 60000) {           // 20분 폴백 — revise 최대 15분+빌드 여유(색은 a.rev로 추후 자동 반영)
        REVISING.delete(file); changed = true;
        const ra = DATA.find(x => x.file === file);           // 조용히 사라지지 말고 표면화(운영자 260620): 20분 내 회차 안 오름 = 지연이거나 실패 → 다시 시도 안내(정직 = 단정 안 함)
        qFlash('수정요청 20분째 반영 안 됨 — 지연이거나 실패. 색 안 바뀌면 다시 시도해' + (ra && ra.title ? ' (' + ra.title.slice(0, 16) + '…)' : ''), WARN_SVG);
      }
    }
    if (changed) { saveRevising(); render(); if ($('#dlg').open && CUR) applyReviseMarks(); }
    if (!REVISING.size) { clearInterval(_revPoll); _revPoll = null; }
  }, 20000);
}
const CARD_FIRE = new Map();
const CF_PEND_KEY = 'nomute_cardfire_pending';
const cardSig = file => { const a = DATA.find(x => x.file === file), c = (a && a.cards) || {}; return (c.state || '') + '|' + (c.updated || '') + '|' + (c.rev || ''); };
const saveCardFire = () => { try { localStorage.setItem(CF_PEND_KEY, JSON.stringify([...CARD_FIRE])); } catch {} };
function startCardFire(file) { if (!file) return; CARD_FIRE.set(file, { req: cardSig(file), ts: Date.now() }); saveCardFire(); render(); startCardFirePoll(); }
let _cfPoll = null;
function startCardFirePoll() {
  if (_cfPoll) return;
  _cfPoll = setInterval(async () => {
    if (isComposingModalOpen()) return;   // 작성 모달 중 폴 보류(REVISING 6471 동일 사유)
    await load();   // cards.state 최신화 — 열린 기사면 load 내 상태변화 감지가 cardSec까지 자동 재렌더
    let changed = false;
    for (const [file, v] of [...CARD_FIRE]) {
      if (cardSig(file) !== v.req) { CARD_FIRE.delete(file); changed = true; }   // 서버가 카드 상태를 뭐라도 씀 = 접수 확인(이후는 기존 상태머신)
      else if (Date.now() - v.ts > 20 * 60000) {   // 20분 폴백 — 큐 취소·워크플로 불발 표면화 후 버튼 복귀(재시도 가능)
        CARD_FIRE.delete(file); changed = true;
        const ra = DATA.find(x => x.file === file);
        qFlash('프롬프트 생성 20분째 반영 안 됨 — 지연이거나 실패(다른 카드 제작 대기 중 취소됐을 수 있어). 다시 눌러봐' + (ra && ra.title ? ' (' + ra.title.slice(0, 16) + '…)' : ''), WARN_SVG);
        if ($('#dlg').open && CUR === file && ra) { cardSec(ra); feedSec(ra); }
      }
    }
    if (changed) { saveCardFire(); render(); }   // render() = 임시상태 해제(접수·20분 폴백)를 피드 진행바에도 반영 — 20분 폴백은 서버 데이터가 안 바뀌어 load()의 sig 가 동일 = 그 경로가 없으면 게이지가 영원히 펄스로 남는다(260805)
    if (!CARD_FIRE.size) { clearInterval(_cfPoll); _cfPoll = null; }
  }, 20000);
}
const cardFirePending = file => CARD_FIRE.has(file);
const cardFireStat = () => `<div class="genstat live">${window.nmLoader ? nmLoader('prompting', '제작중…') : '카드뉴스 프롬프팅 중<span class="gdots"><i>.</i><i>.</i><i>.</i></span>'}</div>`;
function applyReviseFab() {
  const fab = $('#revFab'); if (!fab) return;
  const pending = !!(CUR && isRevising(CUR));
  const g = CUR ? artRev(CUR) : 0;
  fab.classList.toggle('revving', pending);
  fab.classList.toggle('locked', pending);
  fab.classList.toggle('revdone', !pending && g > 0);
  if (pending) {
    fab.style.setProperty('--rv-from', 'rgb(' + revColor(g) + ')');
    fab.style.setProperty('--rv-to', 'rgb(' + revColor(g + 1) + ')');
    fab.style.setProperty('--rv-ring', 'rgba(' + revColor(g + 1) + ',.5)');
  } else if (g > 0) {
    fab.style.setProperty('--rv-solid', revColor(g));
  }
}
function applyReviseMarks() {
  const root = $('#mdbody'); if (!root) { applyReviseFab(); return; }
  const pending = !!(CUR && isRevising(CUR));
  const g = CUR ? artRev(CUR) : 0;
  root.querySelectorAll('h3').forEach(h => {
    const old = h.querySelector('.revchg'); if (old) old.remove();
    h.classList.remove('revsec', 'revsec-done'); h.style.removeProperty('--rv-solid');
    if (!/\[\s*(IG|Thread|인스타|스레드|쓰레드)/i.test(h.textContent)) return;
    if (pending) {                                           // 진행 중 = 펄스 + (변경 중)
      h.classList.add('revsec');
      const s = document.createElement('i'); s.className = 'revchg'; s.textContent = ' (변경 중)';
      h.appendChild(s);
    } else if (g > 0) {                                      // 완료 = 노랑 고정(펄스 없음)
      h.classList.add('revsec-done');
      h.style.setProperty('--rv-solid', revColor(g));
    }
  });
  applyReviseFab();
}
function edSetLabel(t) { const x = $('#edGo .ed-tx'); if (x) x.textContent = t; }
function edUpdateRegen() {   // 유료(재생성 = 체크 or wish) 신호 = ↻ 재생성 아이콘 노출(없으면 숨김)
  const g = $('#edGo'); if (!g) return;
  const paid = edSync() || !!$('#edWish').value.trim();
  g.classList.toggle('regen', paid);
  const ic = g.querySelector('.ed-ic'); const key = paid ? 'refresh' : 'none';
  if (ic && ic._icon !== key) { ic.innerHTML = paid ? REFRESH_SVG : ''; ic._icon = key; }   // 동일 상태면 재대입 안 함 = 타이핑마다 ↻ SVG 재생성(번쩍) 차단(분신술 A7·260628)
}
function edDisarm() {   // 재확인(arm)·발사 상태 해제 — 의도(텍스트·체크·wish) 바뀌면 stale arm 발사 방지
  _edArmed = false; clearTimeout(_edArmT);
  const g = $('#edGo'); if (g) { g.classList.remove('arm', 'firing', 'okdone', 'checking'); g.removeAttribute('aria-busy'); edSetLabel('변경'); }
  edUpdateRegen();   // 의도 바뀌었으니 ↻ 재생성 아이콘 상태도 갱신(wish·체크 변경 반영)
}
function resetEditFoot() {   // 변경 푸터 초기화 — 확인 게이트·arm 해제·#edGo 재활성·라벨·발사잠금·체크박스/wish 초기화(open·close 공통 choke point)
  _edFiring = false; edDisarm();
  const foot = $('#editdlg .ed-foot'); if (foot) foot.classList.remove('confirm');
  const g = $('#edGo'); if (g) { g.disabled = false; g.classList.remove('firing', 'okdone', 'checking', 'arm', 'regen'); edSetLabel('변경'); }
  const y = $('#editdlg .ed-cyes'); if (y) { y.disabled = false; y.textContent = '확인'; }
  const m = $('#editdlg .ed-cmsg'); if (m) m.textContent = '이 카드만 다시 생성할까요?';
  const s = $('#edSync'); if (s) { s.checked = false; s.disabled = false; }   // 첨부가 비활성화했던 체크 재활성
  const w = $('#edWish'); if (w) { w.disabled = false; w.removeAttribute('aria-disabled'); }
  // 첨부 사진 상태 초기화 — stale 첨부/배지/게이지/미리보기 차단(열기·닫기 공통)
  editScene = null; _edSceneArmed = false; _edAfterSrc = null; _edBaf = 'after'; clearTimeout(_edPrevT);
  const ga = $('#edAttach'); if (ga) ga.classList.remove('firing', 'okdone', 'checking', 'armed', 'has', 'shake');
  const th = $('#edAttachThumb'); if (th) { th.hidden = true; th.removeAttribute('src'); }
  const gb = $('#edAttachBadge'); if (gb) { gb.hidden = true; gb.classList.remove('pop'); }
  const gf = $('#edFile'); if (gf) gf.value = '';
  const im = $('#editdlg .ed-img'); if (im) { im.classList.remove('scene-on'); im.title = ''; }
  const bf = $('#editdlg .ed-baf'); if (bf) bf.hidden = true;
  edStatus('');
  edUpdateRegen();   // 초기화 후 ↻ 재생성 아이콘 상태 동기화(열 때 깨끗)
}
function resetEditFootLight() {   // 버튼·확인게이트·발사잠금만 리셋(wish·edLines·sync·scene 보존) — X 닫기/같은카드 재진입 복원용(운영자 260628)
  _edFiring = false; edDisarm();
  const foot = $('#editdlg .ed-foot'); if (foot) foot.classList.remove('confirm');
  const g = $('#edGo'); if (g) { g.disabled = false; g.classList.remove('firing', 'okdone', 'checking', 'arm', 'regen'); edSetLabel('변경'); }
  const y = $('#editdlg .ed-cyes'); if (y) { y.disabled = false; y.textContent = '확인'; }
  const m = $('#editdlg .ed-cmsg'); if (m) m.textContent = '이 카드만 다시 생성할까요?';
  edStatus('');
  edUpdateRegen();   // wish/sync 따라 ↻ 아이콘 동기화
}
function edSync() { const s = $('#edSync'); return !!(s && s.checked); }
function fireEdit() {
  if (!EDIT_CTX || _edFiring) return;   // 재진입 잠금(더블탭·중복 발사 → 유료 제미나이 2발 차단)
  const ctx = EDIT_CTX;
  if (REPENDING.has(rpKey(ctx.file, ctx.card.n))) { alert('이 카드는 지금 다시 그리는 중이야 — 잠시 후 다시.'); return; }   // 이미 발사된 카드 재발사 차단(중복 과금·스왑꼬임)
  _edFiring = true;
  const scene = editScene;                           // 첨부 4:5 사진(있으면 장면 교체 = 순수 합성·제미나이 0)
  const sync = !scene && edSync();                   // 첨부 시 체크 무시(사진이 곧 장면)
  const text = buildEmphText().trim(), wish = (scene || sync) ? '' : $('#edWish').value.trim();   // 첨부/체크면 wish 무시
  const regen = !!scene || sync || !!wish;           // 첨부 = 이미지 교체이므로 재생성 취급(🍌 다시 그리는 중 배지)
  const baseVer = ctx.card.versions.length > 1 ? cardMaxVer(ctx.card) : null;   // 요청 직전 기준(다중판만 · 번호를 못 읽으면 null = 예전 URL 비교)
  if (!scene) $('#edGo').disabled = true;            // #edGo 경로만 disable(첨부버튼은 firing 클래스로 잠금)
  const reset = () => { _edFiring = false;
    const gg = $('#edGo'); if (gg) { gg.classList.remove('firing', 'arm', 'okdone', 'checking', 'regen'); gg.removeAttribute('aria-busy'); gg.disabled = false; }
    const ga = $('#edAttach'); if (ga) ga.classList.remove('firing', 'okdone'); _edSceneArmed = !!editScene;
    edSetLabel('변경'); edUpdateRegen(); updateEditAttach();
  };
  fetch('api/make-cards', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ article: ctx.file, mode: 'edit', card: String(ctx.card.n), text, wish, sync: sync ? 1 : 0, sceneB64: scene ? scene.dataUrl : '' }),
  }).then(async r => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
    .then(({ ok, j }) => {
      reset();
      if (ok && j.ok) {
        REPENDING.set(rpKey(ctx.file, ctx.card.n), { file: ctx.file, card: ctx.card.n, oldImg: ctx.card.versions[ctx.card.cur].image, baseVer, textOnly: !regen, tries: 0 });
        markReshooting(ctx.card.n, !regen);   // 재생성(첨부 포함)=🍌 다시그리는중 / 문구만=✍️ 배지 구분
        _editDiscardOnClose = true;     // 제출 성공 = 닫을 때 full 리셋(보존 안 함·편집 적용됨)
        $('#editdlg').close();          // 보던 캐러셀 그대로(스크롤 유지)
        pollWhilePending();
      } else { alert(j.error || `실패 (${ok ? 'ok' : 'err'})`); }
    }).catch(e => { reset(); netMsg(e).then(m => alert('요청 실패: ' + (m || e.message))); });
}
function markReshooting(n, textOnly) {
  const s = $(`#feedsec .slide[data-card="${n}"]`); if (!s) return;
  s.classList.add('reshooting');
  const ui = $('#feedsec .feed-ui'); if (ui) ui.classList.add('reshooting');   // 편집은 현재 표시 카드 = 오버레이 즉시 잠금(중복 발사 방지)
  if (!s.querySelector('.reshoot-badge')) {
    const b = document.createElement('div'); b.className = 'reshoot-badge';
    b.innerHTML = (window.nmLoader ? nmLoader('solving','제작중…',{size:15,gap:7,fs:12.5}) : (textOnly ? '문구 바꾸는 중' : '다시 그리는 중') + '<span class="gdots"><i>.</i><i>.</i><i>.</i></span>');   /* 강조색 텍스트 + gdots 점모션(수정중 표시 통일·운영자 260705) */
    (s.querySelector('.slide-img') || s).appendChild(b);
  }
}
function reapplyReshooting() {   // 재렌더로 사라진 잠금 배지를 대기 중 카드에 재적용
  if (!REPENDING.size || !$('#dlg').open || !CUR) return;
  for (const v of REPENDING.values()) if (v.file === CUR) markReshooting(v.card, v.textOnly);
}
async function pollWhilePending() {
  if (_polling || !REPENDING.size) return;   // 단일 루프(중복 폴러 방지)
  _polling = true;
  while (REPENDING.size) {
    await new Promise(res => setTimeout(res, 18000));
    for (const [k, v] of [...REPENDING]) { v.tries++; if (v.tries > 20) REPENDING.delete(k); }   // 상한 초과 = 포기
    if (!REPENDING.size) break;
    await load();
  }
  _polling = false;
}
function openFeedback(card, vote, slideEl, file) {
  const host = slideEl.querySelector('.slide-img') || slideEl; if (!host) return;   // 오버레이(.feed-ui)면 자신이 host
  const ex = host.querySelector('.slide-fb'); if (ex) { ex.remove(); }
  const up = vote === 'up';
  const fb = document.createElement('div'); fb.className = 'slide-fb';
  fb.innerHTML =
    `<div class="fb-head"><b class="fb-title">${up ? '좋았던 점' : '아쉬운 점'}</b><div class="fb-headact"><button type="button" class="fb-save asksend"><span>기록</span></button><button type="button" class="fb-x askx" aria-label="닫기"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div></div>
     <div class="fb-aspect"><button type="button" data-a="image" class="on">이미지</button><button type="button" data-a="text">텍스트</button></div>
     <textarea class="fb-comment" rows="2" maxlength="300" placeholder="의견" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>`;
  let aspect = 'image';
  fb.querySelectorAll('.fb-aspect button').forEach(b => b.onclick = () => {
    aspect = b.dataset.a; fb.querySelectorAll('.fb-aspect button').forEach(x => x.classList.toggle('on', x === b));
  });
  fb.querySelector('.fb-x').onclick = () => fb.remove();
  fb.querySelector('.fb-save').onclick = () => submitFeedback({ file, card: card.n, vote, aspect, comment: fb.querySelector('.fb-comment').value.trim() }, fb, slideEl);
  host.appendChild(fb);
  attachCopyPaste(fb.querySelector('.fb-comment'), true);   // 첨부3(수정요청) 통일 = [붙여넣기][지우개] 클립(하단걸침 · .slide-fb 스코프)
  setTimeout(() => fb.querySelector('.fb-comment').focus({ preventScroll: true }), 50);
}
function submitFeedback(p, fb, slideEl) {
  const save = fb.querySelector('.fb-save');
  if (save.classList.contains('firing')) return;                                  // 중복 전송 가드(게이지 진행 중)
  // 전송버튼(.asksend) 계승 = 초록 게이지 좌→우 채움 → 다 차면 ✓ 팝(요약요청/수정요청과 동일 상태머신·askShowCheck 공용)
  save.disabled = true; askHideCheck(save); gaugeStart(save);   // 게이지 = 응답까지 진행(옛 pickGauge 0.72s는 fetch 길면 꽉 찬 채 멈춤 · 운영자 260702)
  fetch('api/feedback', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'record', article: p.file, card: String(p.card), vote: p.vote, aspect: p.aspect, comment: p.comment }),
  }).then(async r => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
    .then(({ ok, j }) => {
      if (ok && j.ok) {
        setVote(p.file, p.card, p.vote);            // 1표 상태 저장 → 반대쪽 잠금
        applyVoteState(slideEl, p.file, p.card);
        save.classList.remove('done'); void save.offsetWidth; save.classList.add('done'); gaugeDone(save);   // settle 펄스 + 게이지 현위치→100% 급속(asksend 공용)
        setTimeout(() => askShowCheck(save), 300);   // 게이지 채움완료(gdone .3s)와 물려 ✓ 팝(멈칫 제거·시안2·운영자 260703)
        setTimeout(() => fb.remove(), 1500);                                                             // ✓ 보여주고 패널 닫음
      } else { gaugeClear(save); save.classList.add('shake'); setTimeout(() => save.classList.remove('shake'), 420); save.disabled = false; alert(j.error || '실패'); }
    }).catch(e => { gaugeClear(save); save.classList.add('shake'); setTimeout(() => save.classList.remove('shake'), 420); save.disabled = false; netMsg(e).then(m => alert('요청 실패: ' + (m || e.message))); });
}
function getVote(file, card) { try { return (JSON.parse(localStorage.getItem('nomute_fb') || '{}'))[`${file}#${card}`] || null; } catch { return null; } }
function setVote(file, card, v) {
  let m = {}; try { m = JSON.parse(localStorage.getItem('nomute_fb') || '{}'); } catch { /* noop */ }
  if (v) m[`${file}#${card}`] = v; else delete m[`${file}#${card}`];
  try { localStorage.setItem('nomute_fb', JSON.stringify(m)); } catch { /* noop */ }
}
function applyVoteState(fig, file, card) {
  const v = getVote(file, card), up = fig.querySelector('.fbup'), down = fig.querySelector('.fbdown');
  if (!up || !down) return;
  up.classList.toggle('voted', v === 'up'); down.classList.toggle('voted', v === 'down');
  up.disabled = v === 'down'; down.disabled = v === 'up';   // 하나 기록되면 다른 쪽 비활성
}
function onThumb(card, vote, fig, file) {
  const cur = getVote(file, card.n);
  if (cur === vote) { armCancelThumb(card, vote, fig, file); return; }   // 같은 쪽 재탭 = 인라인 arm(버튼 안 '취소' 표시) → 한 번 더 탭하면 취소(팝업 폐지·운영자 260629)
  if (cur) return;                                                          // 다른 쪽 이미 투표 = 잠김(disabled)
  openFeedback(card, vote, fig, file);                                      // 미투표 = 패널(크로스전환은 패널서)
}
function armCancelThumb(card, vote, fig, file) {
  const btn = fig.querySelector(vote === 'up' ? '.fbup' : '.fbdown'); if (!btn) return;
  if (btn.classList.contains('thumb-arm')) { cancelVote(card, vote, fig, file, btn); return; }   // 2탭 = 취소 확정
  fig.querySelectorAll('.sbtn.thumb-arm').forEach(disarmThumb);   // 한 번에 하나만 arm
  btn._iconHTML = btn.innerHTML; btn.classList.add('thumb-arm'); btn.textContent = '취소';   // 픽토그램 보존 → '취소' 텍스트(텍스트/픽토 단독 교체 = §📐 공존금지 준수)
  clearTimeout(btn._armT); btn._armT = setTimeout(() => disarmThumb(btn), 2600);   // 미확정 = 자동 해제
}
function disarmThumb(btn) {
  if (!btn || !btn.classList.contains('thumb-arm')) return;
  clearTimeout(btn._armT); btn.classList.remove('thumb-arm');
  if (btn._iconHTML != null) { btn.innerHTML = btn._iconHTML; btn._iconHTML = null; }   // 아이콘 복원
}
function cancelVote(card, vote, fig, file, btn) {
  if (btn) { clearTimeout(btn._armT); btn.disabled = true; }
  fetch('api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'delete', article: file, card: String(card.n), vote }) })
    .then(async r => ({ ok: r.ok, j: await r.json().catch(() => ({})) }))
    .then(({ ok, j }) => {
      if (btn) { btn.disabled = false; disarmThumb(btn); }
      if (ok && j.ok) { setVote(file, card.n, null); applyVoteState(fig, file, card.n); }   // 성공 = 투표 제거 + 썸 원복(아이콘·활성)
      else alert(j.error || '취소 실패');
    }).catch(e => { if (btn) { btn.disabled = false; disarmThumb(btn); } netMsg(e).then(m => alert('요청 실패: ' + (m || e.message))); });
}
async function makeCards(target, btn, mode) {
  // mode: 'text'=프롬프트(2단계)만 생성·이미지 0 / 'shoot'=이미지(3단계·유료)만 / 그 외=full(프롬프트+이미지 한방)
  const reqMode = (mode === 'shoot' || mode === 'text') ? mode : 'full';
  const isText = reqMode === 'text';
  // 유료(3단계 슛) 재확인 — 한 번 더 눌러야 발사(오발 과금 방지·운영자 260622 재설정). text(2단계)·full은 즉시.
  if (reqMode === 'shoot' && btn) {
    if (!btn.dataset.armed) {
      btn.dataset.armed = '1';
      if (!btn.dataset.lbl) btn.dataset.lbl = btn.textContent;
      btn.classList.add('arm'); btn.textContent = '이미지 생성 확인';
      clearTimeout(btn._armT);
      btn._armT = setTimeout(() => { delete btn.dataset.armed; btn.classList.remove('arm'); btn.textContent = btn.dataset.lbl || '카드 이미지 생성'; }, 3500);
      return;   // 1차 = 재확인 무장만(발사 X)
    }
    clearTimeout(btn._armT); btn.classList.remove('arm');   // 2차 = 확정 → 발사 진행
  }
  // 액티브 효과 = 합성기 '이미지 제작'(.go) 전송 상태머신 계승: 초록 풀필 → ✓ 체크(문구는 그대로·운영자 260622).
  if (btn) { gaugeStart(btn); btn.style.pointerEvents = 'none'; }   // glive 점근(응답까지 차오름) = 전송·수정 버튼과 동일 기틀(운영자 260704 · 옛 goFill 고정 .72s는 fetch 늦으면 꽉 찬 채 멈칫)
  try {
    const r = await fetch('api/make-cards', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ article: target, mode: reqMode }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) {
      if (reqMode !== 'shoot') startCardFire(target);   // 발사 접수 임시상태 등록(shoot는 text_done 이후라 상태 공백 없음) — cards.state 반영 전 재열람에도 로더 유지·연타 차단
      if (btn) {   // 응답 = 게이지 현위치→100% 급속 마무리(gdone) → ✓ 체크 그려짐 → 상태문구로 교체
        gaugeDone(btn);
        await new Promise(res => setTimeout(res, reduceMotion() ? 90 : 340));   // gdone(.3s) 채움이 눈에 따라오게
        btn.classList.remove('glive', 'grun', 'gdone');   // 게이지 클래스 정리(okdone 초록 배경으로 인계)
        btn.classList.add('okdone', 'checking');
        btn.innerHTML = '<svg class="gck" viewBox="0 0 24 24" role="img" aria-label="전송됨"><path d="M5 13l4 4L19 7"/></svg>';
        await new Promise(res => setTimeout(res, 520));
      }
      if (btn) btn.outerHTML = `<div class="genstat live">${window.nmLoader ? nmLoader(isText ? 'prompting' : 'solving', '제작중…') : (isText ? '카드뉴스 프롬프팅 중' : '카드 이미지 생성 중') + '<span class="gdots"><i>.</i><i>.</i><i>.</i></span>'}</div>`;   // orb 로더(카드뉴스=Prompting·이미지=Solving · 운영자 260723 Q461) · 폴백 = 구 점3   // 「예상 : N분」 제거(운영자 260805) = cardFireStat 주석 참조
      return true;   // 발사 성공 — 버튼 없는 호출부(피드 게이지 라벨 재시도)가 성패로 임시상태를 켜고 끈다
    }
    if (btn) { gaugeClear(btn); btn.classList.remove('okdone', 'checking'); btn.style.pointerEvents = ''; }
    alert(j.error || `실패 (${r.status})`);
    return false;
  } catch (e) { if (btn) { gaugeClear(btn); btn.classList.remove('okdone', 'checking'); btn.style.pointerEvents = ''; } netMsg(e).then(m => alert('요청 실패: ' + (m || e.message))); return false; }
}
attachCopyPaste($('#revText'), true);
attachCopyPaste($('#crevText'), true);
attachCopyPaste($('#tredoText'), true);
attachCopyPaste($('#edWish'), true);
(function () {
  const wrap = $('#editdlg .edcardwrap'); if (!wrap) return;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'iobtn iobtn-edge iobtn-pp'; wrap.appendChild(btn);   // 붙여넣기 = 항상 노출(지우개 좌측 46)
  const copyB = document.createElement('button'); copyB.type = 'button'; copyB.className = 'iobtn iobtn-edge iobtn-copy-e iobtn-hide'; copyB.innerHTML = COPY_SVG; copyB.setAttribute('aria-label', '복사'); copyB.title = '복사'; wrap.appendChild(copyB);   // 복사 = 내용 있을 때만(78)
  const eraser = document.createElement('button'); eraser.type = 'button'; eraser.className = 'iobtn iobtn-edge iobtn-erase'; eraser.innerHTML = ERASE_SVG; eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기'; wrap.appendChild(eraser);   // 지우개 = 최우측(14)
  let undoTimer = null, undoLines = null;
  const setIcon = (el, svg, key) => { if (el._icon !== key) { el.innerHTML = svg; el._icon = key; } };   // 번쩍임 차단(§🎨 _icon 가드 — 칩 편집/분할마다 SVG 재생성하던 것 차단·260630 QA)
  const exitUndo = () => { if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; } eraser.classList.remove('iobtn-undo'); eraser.innerHTML = ERASE_SVG; eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기'; if (edCardIo) edCardIo(); };
  edCardIo = () => {   // 붙여넣기 항상 / 복사는 내용 있을 때만 / 지우개 = 빈칸 dim
    const filled = buildEmphText().trim().length > 0;
    if (!btn.classList.contains('ok')) { setIcon(btn, PASTE_SVG, 'paste'); btn.dataset.mode = 'paste'; btn.setAttribute('aria-label', '붙여넣기'); btn.title = '붙여넣기'; }
    if (!copyB.classList.contains('ok')) { setIcon(copyB, COPY_SVG, 'copy'); copyB.classList.toggle('iobtn-hide', !filled); }
    if (!eraser.classList.contains('iobtn-undo')) eraser.classList.toggle('iobtn-off', !filled);
  };
  copyB.onclick = ev => { ev.preventDefault(); clipCopy(buildEmphText(), copyB, edCardIo); };   // 복사 전용
  btn.onclick = async ev => {   // 붙여넣기(readText→폴백 공용·칩 교체)
    ev.preventDefault();
    const t = await clipPasteText(); if (t) { edLines = parseEmphLines(t); if (!edLines.length) edLines = [[]]; renderEditChips(); } edCardIo();
  };
  eraser.onclick = ev => {   // 지우개 = 칩 전부 비움 → ~10초 되돌리기(직전 칩 구조 복원·무손실)
    ev.preventDefault();
    if (eraser.classList.contains('iobtn-undo')) { if (undoLines) { edLines = undoLines; if (!edLines.length) edLines = [[]]; renderEditChips(); } exitUndo(); return; }
    if (buildEmphText().trim().length === 0) return;
    try { undoLines = JSON.parse(JSON.stringify(edLines)); } catch { undoLines = null; }
    edLines = [[]]; renderEditChips();
    eraser.classList.remove('iobtn-off'); eraser.classList.add('iobtn-undo'); eraser.innerHTML = UNDO_SVG; eraser.setAttribute('aria-label', '되돌리기'); eraser.title = '되돌리기 (직전 입력 복원)';
    if (undoTimer) clearTimeout(undoTimer); undoTimer = setTimeout(exitUndo, ERASE_UNDO_MS);
  };
  edCardIo();
})();
const OVL = { W: 1080, H: 1350, FS: 54, LH: 88, SX: 87, SY: 888, HL: '#00EED2', DEF: '#ffffff' };
const OVL_OPEN = '“‘「『«‹', OVL_CLOSE = '”’」』»›';
let _ovlFont = false;
async function ovlLoadFont() {   // 카드 폰트(NotoSansCJK Bold) 근사 = Noto Sans KR 700
  if (_ovlFont) return;
  if (!__byId('ovl-font')) {
    const l = document.createElement('link'); l.id = 'ovl-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=block';
    document.head.appendChild(l);
  }
  try { await document.fonts.load('700 54px "Noto Sans KR"'); await document.fonts.ready; } catch { /* 실패 시 시스템 한글 폴백 */ }
  _ovlFont = true;
}
function ovlGradient(ctx) {   // 상단 38.6% 투명 → 하단 alpha 236 (곡선 a=1.268 b=3.217)
  const start = Math.floor(OVL.H * 0.386), a = 1.268, b = 3.217;
  for (let row = start; row < OVL.H; row++) {
    const t = (row - start) / (OVL.H - start);
    let al = (Math.pow(t, a) / (Math.pow(t, a) + Math.pow(1 - t, b))) * 236;
    al = Math.max(0, Math.min(236, al));
    ctx.fillStyle = `rgba(0,0,0,${(al / 255).toFixed(4)})`;
    ctx.fillRect(0, row, OVL.W, 1);
  }
}
function ovlSegs(line) {   // *강조* → [{h:true|false, text}]
  const out = [];
  line.split(/(\*[^*]+\*)/).forEach(p => { if (!p) return; (p.startsWith('*') && p.endsWith('*')) ? out.push({ h: true, text: p.slice(1, -1) }) : out.push({ h: false, text: p }); });
  return out;
}
function ovlOffsets(ctx, lines) {   // 여는 따옴표가 줄 넘어 닫힐 때 그 사이 줄 들여쓰기(card_news compute_line_offsets)
  const offs = [], stack = [], ascii = { '"': false, "'": false }, mw = ch => ctx.measureText(ch).width;
  for (const line of lines) {
    let cur = stack.reduce((s, w) => s + w, 0);
    for (const ch in ascii) if (ascii[ch]) cur += mw(ch);
    offs.push(cur);
    for (const ch of line.replace(/\*([^*]+)\*/g, '$1')) {
      if (OVL_OPEN.includes(ch)) stack.push(mw(ch));
      else if (OVL_CLOSE.includes(ch)) { if (stack.length) stack.pop(); }
      else if (ch === '"' || ch === "'") ascii[ch] = !ascii[ch];
    }
  }
  return offs;
}
async function exportOverlay(card, idx, slug) {
  const cap = ((card.versions[card.cur] || {}).caption || '').trim();
  if (!cap) { alert('이 카드는 텍스트가 없어 — 오버레이 뽑을 게 없음.'); return; }
  const btn = $('#feedsec .feed-ui .sbtn.ovl'); if (btn) btn.classList.add('busy');
  try {
    await ovlLoadFont();
    const cv = document.createElement('canvas'); cv.width = OVL.W; cv.height = OVL.H;
    const ctx = cv.getContext('2d');
    ovlGradient(ctx);
    ctx.font = `700 ${OVL.FS}px "Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
    ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    const lines = cap.split('\n'), offs = ovlOffsets(ctx, lines);
    lines.forEach((line, i) => {
      let x = OVL.SX + offs[i]; const y = OVL.SY + i * OVL.LH;
      ovlSegs(line).forEach(seg => { ctx.fillStyle = seg.h ? OVL.HL : OVL.DEF; ctx.fillText(seg.text, x, y); x += ctx.measureText(seg.text).width; });
    });
    // PNG 고정 = **투명 RGBA 오버레이**(자막판을 영상·사진 위에 얹는 레이어 = 알파가 산출의 본질).
    // ⚠ 260805 「투명 아닌 건 전부 JPG q90」 통일의 **운영자 지정 예외축** — JPG로 바꾸면 알파가 죽어 검은 판이 화면을 덮는다.
    cv.toBlob(blob => {
      if (!blob) { alert('PNG 생성 실패'); return; }
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = `${dlStamp(CUR_A)}_${slug}_overlay_${String(idx + 1).padStart(2, '0')}.png`;
      ROOT.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, 'image/png');
  } catch (e) { alert('오버레이 생성 실패: ' + e.message); }
  finally { if (btn) btn.classList.remove('busy'); }
}
let editScene = null;
let _edSceneArmed = false;
let _edPrevT = null;
let _edAfterSrc = null, _edBaf = 'after', _edBefore = '';
function updateEditBaf() {   // 상단 미리보기 = _edBaf에 따라 원본(전)↔첨부합성(후) + 배지(전/후)
  const im = $('#editdlg .ed-img'), b = $('#editdlg .ed-baf'); if (!im) return;
  if (!editScene) { im.classList.remove('scene-on'); im.title = ''; if (b) b.hidden = true; return; }
  im.classList.add('scene-on'); im.title = '탭하면 전/후 비교';
  im.src = (_edBaf === 'before') ? (_edBefore || '') : (_edAfterSrc || im.src);
  if (b) { b.hidden = false; b.textContent = (_edBaf === 'before') ? '전' : '후'; b.classList.toggle('is-before', _edBaf === 'before'); }
}
function edToggleBaf() {   // 상단 미리보기 탭 = 전↔후 전환(첨부 시에만)
  if (!editScene || _edFiring) return;
  _edBaf = (_edBaf === 'before') ? 'after' : 'before'; updateEditBaf();
}
const ED_RATIO = 4 / 5, ED_TOL = 0.02;
function edStatus(t, cls, html) { const s = $('#edStatus'); if (!s) return; if (html) s.innerHTML = t || ''; else s.textContent = t || ''; s.className = 'ed-status' + (cls ? ' ' + cls : ''); }
function updateEditAttach() {   // 첨부 버튼 = image 2 슬롯식(첨부 시 픽토그램 자리에 썸네일 · 운영자 260627). 옛 ✓배지·armed 펄스 폐지.
  const lab = $('#edAttach'); if (!lab) return;
  const has = !!editScene;
  lab.classList.toggle('has', has); lab.classList.remove('armed');
  const th = $('#edAttachThumb');
  if (th) { if (has && editScene.dataUrl) { th.src = editScene.dataUrl; th.hidden = false; } else { th.hidden = true; th.removeAttribute('src'); } }
  const badge = $('#edAttachBadge'); if (badge) { badge.hidden = true; badge.classList.remove('pop'); }   // ✓배지 폐지 — 썸네일이 표식
  lab.title = has ? '첨부됨 — 탭하면 제거' : '이미지 첨부 (4:5)';
  updateEditBaf();   // 상단 전/후 배지·이미지 동기
}
async function ovlPreviewTo(bgDataUrl, caption) {   // 첨부사진+오버레이 합성 미리보기(근사·정본은 백엔드) → dataURL. exportOverlay 본문 + 배경 drawImage.
  await ovlLoadFont();
  const cv = document.createElement('canvas'); cv.width = OVL.W; cv.height = OVL.H;
  const ctx = cv.getContext('2d');
  const bg = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = bgDataUrl; });
  const sr = bg.width / bg.height, dr = OVL.W / OVL.H; let sw, sh, sx, sy;   // 4:5 cover fit(중앙·상단편향 0.4 ≈ recompose ImageOps.fit centering)
  if (sr > dr) { sh = bg.height; sw = sh * dr; sx = (bg.width - sw) / 2; sy = 0; }
  else { sw = bg.width; sh = sw / dr; sx = 0; sy = (bg.height - sh) * 0.4; }
  ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, OVL.W, OVL.H);
  ovlGradient(ctx);
  ctx.font = `700 ${OVL.FS}px "Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
  ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  const lines = (caption || '').split('\n'), offs = ovlOffsets(ctx, lines);
  lines.forEach((line, i) => {
    let x = OVL.SX + offs[i]; const y = OVL.SY + i * OVL.LH;
    ovlSegs(line).forEach(seg => { ctx.fillStyle = seg.h ? OVL.HL : OVL.DEF; ctx.fillText(seg.text, x, y); x += ctx.measureText(seg.text).width; });
  });
  return cv.toDataURL('image/jpeg', 0.9);
}
async function renderEditPreview() {   // editScene 있으면 합성 미리보기(_edAfterSrc)로 갱신 → 전/후 상태대로 .ed-img 적용(칩 편집 시 재호출)
  if (!editScene) return;
  const im = $('#editdlg .ed-img'); if (!im) return;
  try { _edAfterSrc = await ovlPreviewTo(editScene.dataUrl, buildEmphText()); } catch { return; }
  try { const pre = new Image(); pre.src = _edAfterSrc; if (pre.decode) await pre.decode(); } catch {}   // 화면 교체 전 오프스크린 디코드 = 스왑 시 디코드 지연 빈프레임 제거(분신술 A6·운영자 260628)
  if (!editScene) return;   // 디코드 대기 중 첨부 제거됐으면 중단
  updateEditBaf();   // _edBaf='after'면 즉시 반영 / 'before' 보는 중이면 다음 전환 때(합성본만 갱신)
}
function schedEditPreview() { if (!editScene) return; clearTimeout(_edPrevT); _edPrevT = setTimeout(renderEditPreview, 120); }
async function addEditScene(file) {   // 파일 1장 — 4:5 검증 후 editScene 세팅·미리보기(검증 실패=거부+가드)
  if (!file || !file.type || !file.type.startsWith('image/')) { edStatus('이미지 파일만 첨부돼 (JPG·PNG).', 'err'); return; }
  let w = 0, h = 0, _u = null;
  try {
    _u = URL.createObjectURL(file);
    const i = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = _u; });
    w = i.naturalWidth; h = i.naturalHeight;
  } catch { edStatus('이미지를 읽지 못했어 (HEIC면 JPG·PNG로 변환해줘).', 'err'); return; }
  finally { if (_u) URL.revokeObjectURL(_u); }   // onerror reject 경로 objectURL 누수 차단(분신술 A9)
  if (!w || !h) { edStatus('이미지 크기를 못 읽었어.', 'err'); return; }
  if (Math.abs(w / h - ED_RATIO) / ED_RATIO > ED_TOL) {   // 4:5 아님 → 거부 + shake/멘트(빈입력 가드 계승)
    const lab = $('#edAttach'); if (lab) { lab.classList.remove('shake'); void lab.offsetWidth; lab.classList.add('shake'); setTimeout(() => lab.classList.remove('shake'), 460); }
    edStatus(`비율이 4:5가 아닙니다 (현재 ${w}:${h})`, 'err');
    return;
  }
  try { editScene = await compressImg(file, 1350, 0.85); }   // 카드 배경 = 4:5 긴변 1350(=합성 캔버스 높이) → 가로 1080 보장·고화질(LLM용 1280/0.6과 분리·분신술 A10)
  catch { edStatus('이미지 처리 실패.', 'err'); return; }
  _edSceneArmed = false;   // 2단 폐지 — 합성은 '변경' 버튼만
  _edBefore = (EDIT_CTX && EDIT_CTX.card && EDIT_CTX.card.versions[EDIT_CTX.card.cur]) ? (EDIT_CTX.card.versions[EDIT_CTX.card.cur].image || '') : '';
  _edBaf = 'after';   // 첨부 직후 = '후'(첨부 적용본) 보여줌
  const sy = $('#edSync'); if (sy) { sy.checked = false; sy.disabled = true; }   // 첨부=장면 직접지정 → 체크/희망 비활성(제미나이 0)
  const wi = $('#edWish'); if (wi) { wi.value = ''; wi.disabled = true; }
  edDisarm(); updateEditAttach();
  edStatus(CHECK_SVG + ' 4:5 사진 첨부됨 — 상단 미리보기 탭하면 전/후 비교 · [변경]으로 적용', 'ok', true);
  await renderEditPreview();
}
function edAttachClick(e) {   // 첨부 버튼 = image 2 슬롯식(운영자 260627): 첨부됨이면 탭=제거(파일선택 가로채기) / 미첨부면 기본(파일선택). 합성은 '변경' 버튼만.
  if (editScene) { if (e) { e.preventDefault(); e.stopPropagation(); } edClearScene(); }
}
function edClearScene() {   // 첨부 제거(첨부 버튼 탭) — 썸네일·전후·원본 복원·체크/희망 재활성
  if (!editScene) return;
  editScene = null; _edSceneArmed = false; _edAfterSrc = null; _edBaf = 'after'; clearTimeout(_edPrevT);
  const ga = $('#edAttach'); if (ga) ga.classList.remove('firing', 'okdone', 'armed', 'has', 'shake');
  const th = $('#edAttachThumb'); if (th) { th.hidden = true; th.removeAttribute('src'); }
  const gb = $('#edAttachBadge'); if (gb) { gb.hidden = true; gb.classList.remove('pop'); }
  const bf = $('#editdlg .ed-baf'); if (bf) bf.hidden = true;
  const gf = $('#edFile'); if (gf) gf.value = '';
  const sy = $('#edSync'); if (sy) sy.disabled = false;
  const wi = $('#edWish'); if (wi) wi.disabled = false;
  if (EDIT_CTX) { const v = EDIT_CTX.card.versions[EDIT_CTX.card.cur] || {}; const im = $('#editdlg .ed-img'); if (im) { im.src = v.image || ''; im.classList.remove('scene-on'); im.title = ''; } }
  edStatus('첨부 제거됨 — 다시 첨부하려면 이미지 버튼을 눌러', '');
}
const THUMBUP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3z"/><path d="M7 10l4.5-7.5a2 2 0 0 1 2.5 2V8h5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 17.6 20H7"/></svg>';
const THUMBDOWN_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3z"/><path d="M17 14l-4.5 7.5a2 2 0 0 1-2.5-2V16H5a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 6.4 4H17"/></svg>';
const CHEVRON_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="M6 9l6 6 6-6"/></svg>';
const DLSEQ_IC = '<span class="dlseq-ic">' + DOWNLOAD_SVG.replace('<svg ', '<svg class="dn" ') + CHECK_SVG.replace('<svg ', '<svg class="chk" ') + '</span>';
async function copyText(text, btn) {
  text = (text || '').replace(/\n+$/, '');
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch {}
  if (!ok) {   // 폴백: 모달(showModal)은 dialog 밖이 inert → textarea를 **지금 열린 맨 위 모달** 안에 두고 선택영역 명시(구 = 늘 #dlg → 보기 창 등 다른 모달에선 inert 라 실패 · 평의회 261026) · 모달 없음 = body
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
    let host = null; try { const ms = document.querySelectorAll('dialog:modal'); host = ms[ms.length - 1] || null; } catch { host = document.querySelector('dialog[open]'); }   // :modal 미지원 = 열린 dialog
    const fo = document.activeElement;
    (host || document.body).appendChild(ta); ta.focus(); ta.select();
    try { ta.setSelectionRange(0, text.length); } catch {}
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove(); if (fo && fo.focus) try { fo.focus({ preventScroll: true }); } catch {}   // 포커스 = 누른 자리로 복귀
  }
  if (btn && ok) { btn.innerHTML = CHECK_SVG; btn.classList.add('ok');   // ✓ = 실제로 복사됐을 때만(거짓 성공 0)
    setTimeout(() => { btn.innerHTML = COPY_SVG; btn.classList.remove('ok'); }, 1500); }
  return ok;
}
function tapCopy(el, text) {
  el.title = '탭하면 제목 복사'; el.tabIndex = 0;
  let t = 0;
  const run = async ev => { ev.stopPropagation(); await copyText(text); el.classList.add('copied'); clearTimeout(t); t = setTimeout(() => el.classList.remove('copied'), 620); };   // 플래시 = 클래스 유지 620ms(정본 askPhFlash 총 길이) → transition이 --dur로 들고 난다 · 연타 = 타이머 갱신(마지막 탭 기준 · 구 animationend 축은 위 CSS ⚠ 사유로 폐기)
  el.onclick = run;
  el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); run(ev); } });
}
function copyBtn(getText, label) {
  const b = document.createElement('button'); b.className = 'copy'; b.type = 'button';
  b.innerHTML = COPY_SVG; b.setAttribute('aria-label', label || '복사');
  b.onclick = ev => { ev.stopPropagation(); copyText(getText(), b); };
  return b;
}
function igHead() {
  const md = $('#mdbody'); if (!md) return null;
  const hs = [...md.querySelectorAll('h1,h2,h3,h4')];
  return hs.find(h => /^\s*\[?\s*IG\b/i.test(h.textContent)) || hs.find(h => /콘텐츠\s*초안/.test(h.textContent)) || null;
}
function sisaHead() {
  const md = $('#mdbody'); if (!md) return null;
  return [...md.querySelectorAll('h1,h2,h3,h4')].find(h => /시사점/.test(h.textContent)) || null;
}
function revStartHead() {
  const md = $('#mdbody'); if (!md) return null;
  return [...md.querySelectorAll('h1,h2,h3,h4')].find(h => /콘텐츠\s*초안/.test(h.textContent)) || igHead() || null;
}
function revFabVisible() {
  const dlg = $('#dlg'); if (!dlg || !dlg.open) return false;
  const sum = $('#ph-sum'); if (!sum) return false;
  const centerY = window.innerHeight / 2;
  const start = revStartHead() || sum;                      // 콘텐츠 초안 섹션(igHead SNS용과 분리) — 없으면 요약 섹션 시작
  if (start.getBoundingClientRect().top > centerY) return false;   // 아직 콘텐츠 초안 전(중앙 밑) → 숨김
  const endH = sisaHead();                                  // 이 기사의 시사점
  if (endH) return endH.getBoundingClientRect().top > centerY;     // 시사점이 중앙 위로 넘어가면 숨김
  return sum.getBoundingClientRect().bottom > centerY;      // 시사점 헤더 없는 옛 포맷 → 요약 섹션 끝 기준
}
function updateRevFab() {
  const fab = $('#revFab'); if (!fab) return;
  const dlg = $('#dlg');
  const show = !!(dlg && dlg.open && !revdlg.open && !$('#crevdlg').open && revFabVisible());   // 팝업(요약·카드) 열려 있으면 FAB 숨김(겹침 방지)
  fab.classList.toggle('show', show);
  // #dlg가 positioned <dialog>(UA position:absolute)라 그 박스가 absolute 컨테이닝블록 → 내부 absolute는 콘텐츠와 함께 스크롤됨(backdrop-filter 무관 · 260704 컨테이너 blur 제거돼도 유효).
  // top을 scrollTop만큼 보정해 뷰포트 70%(중하단) 라인에 고정(스크롤해도 화면 같은 자리).
  if (show) fab.style.top = Math.round(dlg.clientHeight * 0.7 - 26) + 'px';
  applyReviseFab();   // FAB 재노출 시 잔류 표기 클래스 정리(표기 자체는 제거됨)
}
function crevFabVisible() {
  const dlg = $('#dlg'); if (!dlg || !dlg.open) return false;
  const a = CUR ? DATA.find(x => x.file === CUR) : null;
  const st = a && a.cards ? (a.cards.state || '') : '';
  if (st !== 'text_done' && st !== 'done' && st !== 'fired_partial') return false;   // 카드 프롬프트 있을 때만(수정 대상)
  const card = $('#ph-card'); if (!card) return false;
  const centerY = window.innerHeight / 2;
  if (card.getBoundingClientRect().top > centerY) return false;             // 아직 카드 프롬프트 구간 전(중앙 밑) → 숨김
  const feed = $('#ph-feed');
  if (feed && !feed.hidden) return feed.getBoundingClientRect().top > centerY;   // 이미지(피드) 넘어가면 숨김 = '이미지 생성 직전'까지만
  const sec = $('#cardsec');
  return sec ? sec.getBoundingClientRect().bottom > centerY : true;         // 피드 없으면(text_done) 카드섹션 끝 기준
}
function applyCrevFab() {
  const fab = $('#crevFab'); if (!fab) return;
  const pending = !!(CUR && isCardRevising(CUR));
  const a = CUR ? DATA.find(x => x.file === CUR) : null;
  const g = a && a.cards ? (Number(a.cards.crev) || 0) : 0;   // 카드 수정 회차 — 요약 a.rev과 독립(0 초록·1 노랑·2 파랑 순환)
  fab.classList.toggle('revving', pending);
  fab.classList.toggle('locked', pending);
  fab.classList.toggle('revdone', !pending && g > 0);
  if (pending) {
    fab.style.setProperty('--rv-from', 'rgb(' + revColor(g) + ')');
    fab.style.setProperty('--rv-to', 'rgb(' + revColor(g + 1) + ')');
    fab.style.setProperty('--rv-ring', 'rgba(' + revColor(g + 1) + ',.5)');
  } else if (g > 0) {
    fab.style.setProperty('--rv-solid', revColor(g));
  }
}
function updateCrevFab() {
  const fab = $('#crevFab'); if (!fab) return;
  const dlg = $('#dlg');
  const show = !!(dlg && dlg.open && !$('#crevdlg').open && !$('#revdlg').open && crevFabVisible());   // 팝업 열렸으면 숨김(겹침 방지)
  fab.classList.toggle('show', show);
  if (show) fab.style.top = Math.round(dlg.clientHeight * 0.7 - 26) + 'px';   // 요약 FAB과 동일 = 뷰포트 70% 라인 고정(구간 안 겹쳐 동시 노출 없음)
  applyCrevFab();
}
function jumpTo(which) {
  const sec = $('#cardsec');
  let el;
  if (which === 'n')      el = $('#ph-sum');                       // 1/4 요약(시작 = 위 구분선)
  else if (which === 's') el = igHead() || $('#ph-sum');           // 2/4 SNS 요약(인스타 초안 시작점)
  else if (which === 'm') el = $('#ph-card');                      // 3/4 프롬프트 — 카드뉴스 텍스트
  else if (which === 't') { const f = $('#ph-feed'); el = (f && !f.hidden) ? f : (sec.querySelector('.mkbtn') || $('#ph-card')); }  // 4/4 카드 피드
  if (!el) return;
  const d = el.closest('details'); if (d) d.setAttribute('open', '');   // 접혀 있으면 펼침
  const db = $('#dlgbody');
  requestAnimationFrame(() => {
    const top = db.scrollTop + (el.getBoundingClientRect().top - db.getBoundingClientRect().top);
    db.scrollTo({ top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const escUrl = u => { const s = String(u ?? '').trim().replace(/[\u0000-\u001f]/g, ''); return /^(javascript|data|vbscript):/i.test(s) ? '#' : esc(s); };
const hrefOk = u => { const s = String(u ?? '').trim().replace(/[\u0000-\u001f]/g, ''); return /^(javascript|data|vbscript):/i.test(s) ? '#' : s; };
const FOREIGN_MEDIA = new Set(['BBC', 'BBC뉴스', '가디언', '더가디언', '알자지라', '블룸버그', '로이터', '로이터통신', 'AP', 'AP통신', 'AFP', 'CNN', '뉴욕타임스', 'NYT', '월스트리트저널', 'WSJ', '워싱턴포스트', '니혼게이자이', '요미우리', '아사히', 'NHK', '신화통신', '타스', '폴리티코', '악시오스', 'France24', '프랑스24', 'DW', '도이체벨레', '스카이뉴스', 'Sky News']);
function fmtReporter(rp, media) {
  rp = (rp || '').trim();
  if (!rp || rp === '-') return '';
  const foreign = FOREIGN_MEDIA.has((media || '').trim());
  const sfx = foreign ? '' : ' 기자';                                  // 국내=「기자」 호칭 / 해외=생략(관례)
  const nm = s => { s = s.trim(); const i = s.indexOf(' '); return i < 0 ? '<b class="ov-rp">' + esc(s) + '</b>' : '<b class="ov-rp">' + esc(s.slice(0, i)) + '</b>' + esc(s.slice(i)); };   // 이름(첫 어절)=흰색 · 직함(특파원 등)=기본(운영자 260621)
  const ex = rp.match(/^(.+?)\s*외\s*(\d+)\s*명/);                      // 이미 '외 N명' 형식이면 보존
  if (ex) return nm(ex[1].replace(/\s*기자\s*$/, '').trim()) + sfx + ' 외 ' + ex[2] + '명';
  rp = rp.replace(/\s*기자\s*$/, '').trim();                            // 끝 '기자' 제거(중복 방지)
  const names = rp.split(/\s*[,·、\/]\s*/).map(s => s.trim()).filter(Boolean);
  if (names.length >= 2) return nm(names[0]) + sfx + ' 외 ' + (names.length - 1) + '명';   // 2명+ = 000 기자 외 N명(운영자 260621)
  return nm(names[0] || rp) + sfx;                                    // 단독: 국내=000 기자 / 해외=000
}
function overviewMeta(a) {
  const cat = catBucket(a.category);
  const rp = ((a.body || '').match(/출처[:：]\s*[^()\n]*\(([^)]+)\)/) || [, ''])[1].trim();
  const inn = inDateTime(a);
  const sep = '<span class="ov-sep">·</span>';
  const line1 = [];   // 1줄 = 대분류·매체·기자명
  if (cat) line1.push(`<span class="ov-cat" style="color:${CAT_COLOR[cat]}">${esc(cat)}</span>`);
  if (a.media) line1.push(`<span class="ov-media">${esc(a.media)}</span>`);
  const rpf = fmtReporter(rp, a.media); if (rpf) line1.push('<span class="ov-rp-row">' + rpf + '</span>');   // 래퍼=flex 1아이템(이름 span↔직함/'기자' 띄어쓰기 보존 · flex가 별개 아이템 경계공백 먹던 것 차단 · 운영자 260621)
  const line2 = [];   // 2줄 = WRITE(보도일시)·IN(적재)
  const _wd = repDateTime(a); if (_wd && _wd.trim() && _wd.trim() !== '-') line2.push(`<span class="ov-l">보도</span><span class="ov-d">${esc(_wd)}</span>`);   // 보도일시(옛 WRITE) 확인 어려우면(빈값) 스킵(운영자 260621·260625 용어한글화)
  if (inn.txt) line2.push(`<span class="ov-l">스크랩</span><span class="ov-d">${esc(inn.txt)}</span>`);   // 스크랩(옛 IN=적재)
  return `<div class="ovmeta">${line1.join(sep)}<span class="ov-nl"></span>${line2.join(sep)}</div>`;
}
const AUTH_EXPIRED_TXT = '로그인이 만료됐어 — 다시 로그인해줘';
function isNetErr(e) { return !!e && e.name === 'TypeError' && /^(failed to fetch|load failed|networkerror when attempting to fetch resource)/i.test(String(e.message || '')); }
async function netMsg(e) {   // '' = fetch reject 아님(호출부 기존 문구) · 만료 = AUTH_EXPIRED_TXT(+ 메시지함 '다시 로그인' 점등 = nmAuthNote) · 그 외 = 회선
  if (!isNetErr(e)) return '';
  return (await nmAuthNote()) === 'auth' ? AUTH_EXPIRED_TXT : '네트워크 오류 — 다시 시도';
}
$('#dlgbody').addEventListener('scroll', updateScrub, { passive: true });
new ResizeObserver(() => { if ($('#dlg').open) updateScrub(); }).observe($('#dlgbody'));
function setupScrub() {
  const dp = $('#dlgprog'); if (!dp) return;
  const h = $('.dlg-h'); if (h) h.classList.remove('scrolled');   // 열릴 땐 맨 위(원문/X)
  dp.innerHTML = `<div class="scrub"><div class="scrub-bar" id="scrubBar"><div class="scrub-fill" id="scrubFill"></div><i class="scrub-tick" data-j="n"></i><i class="scrub-tick" data-j="s"></i><i class="scrub-tick" data-j="m"></i><i class="scrub-tick" data-j="t"></i><div class="scrub-dot" id="scrubDot"></div></div><div class="scrub-labels"><span class="scrub-lb" data-j="n">요약</span><span class="scrub-lb" data-j="s">SNS 요약</span><span class="scrub-lb" data-j="m">프롬프트</span><span class="scrub-lb" data-j="t">카드</span></div></div>`;
  const bar = $('#scrubBar');
  bar.onclick = e => {
    const db = $('#dlgbody'), r = bar.getBoundingClientRect(), range = db.scrollHeight - db.clientHeight;
    db.scrollTo({ top: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * range, behavior: 'smooth' });
  };
  dp.querySelectorAll('.scrub-lb').forEach(lb => { lb.onclick = () => jumpTo(lb.dataset.j); });
  requestAnimationFrame(updateScrub);
}
function scrubTargets() {
  const sec = $('#cardsec'), f = $('#ph-feed');
  return { n: $('#ph-sum'), s: igHead(), m: $('#ph-card'), t: (f && !f.hidden) ? f : (sec ? (sec.querySelector('.mkbtn') || null) : null) };
}
function updateScrub() {
  const dlg = $('#dlg'); if (!dlg || !dlg.open) return;
  const dp = $('#dlgprog'); if (!dp || !dp.firstElementChild) return;
  const db = $('#dlgbody'), range = db.scrollHeight - db.clientHeight, st = db.scrollTop;
  const pct = range > 0 ? Math.max(0, Math.min(100, st / range * 100)) : 0;
  // ① 읽기 일괄 — getBoundingClientRect를 style 쓰기 사이에 끼우면 scroll마다 강제 reflow 5회(쓰기→읽기 thrash).
  //   읽기(db.top + 4타깃)를 먼저 모아 reflow 1회로. 스크럽바 쓰기는 헤더 요소라 #dlgbody 콘텐츠 위치 불변 = 출력 동일(260630 QA ③).
  const top = db.getBoundingClientRect().top, tg = scrubTargets();
  let cur = 'n';
  const rows = ['n', 's', 'm', 't'].map(k => {
    const tick = dp.querySelector(`.scrub-tick[data-j="${k}"]`), lb = dp.querySelector(`.scrub-lb[data-j="${k}"]`), el = tg[k];
    if (!el) return { tick, lb, el: null };
    const off = st + (el.getBoundingClientRect().top - top);
    if (st >= off - 8) cur = k;
    return { tick, lb, el, p: range > 0 ? Math.max(0, Math.min(100, off / range * 100)) : 0 };
  });
  // ② 쓰기 일괄(읽기 끝난 뒤 = reflow 1회)
  const fill = $('#scrubFill'), dot = $('#scrubDot');
  if (fill) fill.style.width = pct + '%';
  if (dot) dot.style.left = pct + '%';
  rows.forEach(r => {
    if (!r.el) { if (r.tick) r.tick.style.display = 'none'; if (r.lb) r.lb.classList.add('off'); return; }
    if (r.lb) r.lb.classList.remove('off');
    if (r.tick) { r.tick.style.display = ''; r.tick.style.left = r.p + '%'; }
  });
  dp.querySelectorAll('.scrub-lb').forEach(lb => lb.classList.toggle('cur', lb.dataset.j === cur && !lb.classList.contains('off')));
  const hd = $('.dlg-h'); if (hd) hd.classList.toggle('scrolled', st > 60);
  updateRevFab();   // 요약 수정 FAB 점멸 구간 갱신(콘텐츠 초안~시사점)
  updateCrevFab();   // 🃏 카드 수정 FAB 점멸 구간 갱신(카드 프롬프트~이미지 직전)
}
$('#editdlg .ed-cno').onclick = () => $('#editdlg .ed-foot').classList.remove('confirm');
$('#editdlg .ed-cyes').onclick = fireEdit;
$('#editdlg').addEventListener('close', () => {   // 닫힘(✕·취소·백드롭·ESC) 시 — 최소화 폐지(운영자 260628): X=입력 보존(라이브 globals 유지·버튼만 리셋·같은 카드 변경버튼 재진입서 복원) / 제출·기사이동=full 리셋(편집 적용·소멸)
  if (_editDiscardOnClose) { _editDiscardOnClose = false; _editKeptKey = null; resetEditFoot(); return; }   // 제출 성공 = 편집 적용됐으니 깨끗이 비움
  resetEditFootLight();   // X·백드롭·ESC = wish·edLines·sync·scene 보존(끊긴 fetch·arm·firing만 정리)
  _editKeptKey = EDIT_CTX ? cardKeyOf(EDIT_CTX) : null;   // 이 카드 변경버튼 재진입 시 복원할 키
});
$('#edSync').addEventListener('change', () => {   // 체크 = 이미지수정희망 잠금(이미지=텍스트 따라감) · 의도 변하니 arm 해제
  const on = $('#edSync').checked, w = $('#edWish');
  w.disabled = on; w.setAttribute('aria-disabled', on ? 'true' : 'false');   // disabled=true면 브라우저가 자동 포커스 해제(키보드 닫힘) — 별도 호출 불필요
  edDisarm();
});
$('#edWish').addEventListener('input', edDisarm);
$('#edAttach').addEventListener('click', edAttachClick);
bindImgPaste($('#editdlg'), f => addEditScene(f));
$('#editdlg .ed-img').addEventListener('click', () => { edToggleBaf(); });
$('#editdlg .ed-baf').addEventListener('click', e => { e.stopPropagation(); edToggleBaf(); });
__on(window, 'resize', () => { if ($('#editdlg').open) fitEditLines($('#edChips')); }, { passive: true });
$('#editdlg').addEventListener('click', e => { if (e.target.id === 'editdlg') $('#editdlg').close(); });
const qEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function qFlash(msg, iconSvg) {   // 짧은 토스트(링크 빌드 랙 안내 + 팝업 상태문구 전량 위임 · 운영자 260720 "문자열 말고 포스트 알림") · iconSvg 주면 픽토그램+esc(메시지) innerHTML(XSS 가드)
  let t = __byId('qFlash');
  if (!t) { t = document.createElement('div'); t.id = 'qFlash'; t.className = 'qflash'; }
  // 열린 모달(showModal·top-layer)은 z로 못 이김(reparentNav 11219 실측 전례) → 최상위 열린 dialog 안으로 이주 = 비inert 자식으로 백드롭 위에 표시 · 없으면 body. fixed라 좌표는 viewport 그대로(컴포즈 모달 transform 잔존은 popIn to{none}이라 무해 · PC 드래그 중 예외 열화만 수용).
  const _dl = document.querySelectorAll('dialog[open]');
  const host = _dl.length ? _dl[_dl.length - 1] : ROOT;
  if (t.parentElement !== host) host.appendChild(t);
  t.innerHTML = '<span class="ft-msg">' + esc(msg) + '</span>';   // iconSvg 인자 무시(호출처 호환 유지) — 가족 픽토그램 = 긴급 BELL·실패 WARN 둘만(운영자 260712) · 한 줄 말줄임 = .ft-msg CSS
  t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2500);   // 2600→2500(운영자 260712 회신)
}
const FOLLOW_OF = new Map();
function scrapErrHtml(k, what = '수집함') {   // what = 못 받은 목록 이름(뉴스 요약 피드도 같은 줄을 쓴다)
  const cfg = MSG_ACTIONS[k === 'auth' ? 'relogin' : 'data-retry'];
  const msg = k === 'auth' ? AUTH_EXPIRED_TXT : k === 'net' ? '네트워크 오류로 ' + what + '을 못 불러왔어' : '서버에서 ' + what + '을 못 받아왔어';
  return '<div class="scrap-empty">' + qEsc(msg) + (cfg ? '<br><br><button class="md-actbtn" type="button">' + cfg.svg + '<span>' + qEsc(cfg.label) + '</span></button>' : '') + '</div>';
}
async function failWhy(r) {
  let raw = ''; try { raw = await r.text(); } catch {}
  let why = '';
  try { why = String((JSON.parse(raw) || {}).error || ''); } catch { why = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200); }
  return (why ? why + ' ' : '') + '(HTTP ' + r.status + ')';
}
function pickHttpMsg(status, why) {   // 서버 거절 문구 = 상태코드를 **앞에**(한 줄 말줄임 토스트에서도 코드 유실 0 · failWhy 260728 원칙) + 서버 사유 뒤(전문 = title·이벤트 message)
  const rest = String(why || '').replace(/\s*\(HTTP \d+\)$/, '').trim();
  return '서버 거절(HTTP ' + status + ')' + (rest ? ' — ' + rest : '');
}
let _rateFailT = 0;
function rateFail(m) { const now = Date.now(); if (now - _rateFailT < 3000) return; _rateFailT = now; qFlash('판단 기록 실패 — ' + m); }
function rateSend(body) {
  fetch('api/rate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    .then(async r => { if (!r.ok) rateFail(pickHttpMsg(r.status, await failWhy(r))); })
    .catch(async e => rateFail((await netMsg(e)) || ('앱 오류 — ' + ((e && e.message) || e))));
}
function postRate(p) { rateSend(p);
  const f = p && FOLLOW_OF.get(p.id); if (f) rateSend({ ...p, id: f.id, url: f.url }); }
function reduceMotion() { try { return matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (_) { return false; } }
function backdropClose(dlg, sels, more) {
  const dirty = () => sels.some(s => { const t = $(s); return !!(t && t.value.trim()); }) || !!(more && more());
  dlg.addEventListener('click', e => { if (e.target === dlg && !dirty()) dlg.close(); });
}
function draftClear(sel, after) { const t = $(sel); if (!t || !t.value) return; t.value = ''; t.dispatchEvent(new Event('input', { bubbles: true })); if (after) after(); }
async function compressImg(file, max = 1280, q = 0.6) {   // 토큰 절약: 긴 변 1280px·JPEG로 압축(고품질 해석 불필요)
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  let w = img.width, h = img.height; const s = Math.max(w, h);
  if (s > max) { w = Math.round(w * max / s); h = Math.round(h * max / s); }
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', q));   // q-ok: 산출물 아님 = 요약요청 첨부 압축(기본 q0.6·긴변 1280 — 고품질 해석이 불필요한 입력이라 토큰을 아낀다 · 파일로 안 나간다)
  const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  return { dataUrl, kb: Math.round(blob.size / 1024) };
}
function askShowCheck(btn){ if (!btn || btn.querySelector('.ack')) return; btn.classList.add('checked');
  const d = document.createElement('span'); d.className = 'ack';
  d.innerHTML = '<svg viewBox="0 0 24 24" role="img" aria-label="완료"><path d="M5 13l4 4L19 7"/></svg>'; btn.appendChild(d); }
function askHideCheck(btn){ if (!btn) return; btn.classList.remove('checked'); const d = btn.querySelector('.ack'); if (d) d.remove(); }
function gaugeStart(btn){ if (!btn) return; btn.classList.add('glive', 'firing'); requestAnimationFrame(() => requestAnimationFrame(() => { if (btn.classList.contains('glive')) btn.classList.add('grun'); })); }
function gaugeDone(btn){ if (btn) btn.classList.add('gdone'); }
function gaugeClear(btn){ if (btn) btn.classList.remove('glive', 'firing', 'grun', 'gdone'); }
let revConfirmT = null;
function resetRevSend() {   // 발사 버튼 원복(재확인 해제)
  clearTimeout(revConfirmT);
  const btn = $('#revSend'); if (!btn) return;
  btn.classList.remove('confirm');
  const lbl = btn.querySelector('span'); if (lbl) lbl.textContent = '수정';
}
function openRev() {
  if (!CUR) { return; }
  if (isRevising(CUR)) { return; }   // 수정 중 = FAB 눌러도 입력 팝업 안 열림(무반응) · 시각 표식(revving/locked·'수정 중' 힌트)은 그대로 유지 — 운영자 260626(옛 260623 '그냥 팝업 열기' 폐기: 팝업이 떠 전송 가능해 보이는 게 문제)
  resetRevSend();
  $('#revSend').classList.remove('firing'); $('#revSend').disabled = false;   // (revStatus 잔상 리셋 소멸 — 상태문자열 폐지·qFlash 위임 260720)
  updateRevClip(); openComposeDlg(revdlg);   // 폰 뒤로가기 칸(입력 손실 방지·260627)
  $('#revFab').classList.remove('show');         // 팝업 열림 → FAB 숨김(닫히면 updateRevFab가 복원)
  setTimeout(() => $('#revText').focus(), 60);   // 열리자마자 커서 활성(askdlg 패턴)
}
function updateRevClip() { const t = $('#revText'); if (t) t.dispatchEvent(new Event('input', { bubbles: true })); }
(function(){
  const src = $('#src');
  if (src) src.addEventListener('pointerdown', e => {   // 원문(↗) = 플래시+ic-rise를 pointerdown(누르는 순간·탭 전환 *전*)에 선발화 — click 시점 발화는 새 탭 전환 즉시라 백그라운드 재생 = 안 보임, :active만으론 모바일 빠른 탭서 미점등(운영자 260705 "이동 픽토그램 액티브 작동 안 함"). ⚠️ 열기 지연(0.28s) 금지 — 합성 앵커클릭(failOpen 패턴)은 setTimeout 안에선 팝업 차단(실측 260705) + window.open은 전역 open(피드 모달)에 가려짐 → 선발화가 유일 경로. 위임 click 모션 셀렉터에서 #src 제외(이중발화 방지·짝 수정).
    if (e.pointerType === 'mouse' && e.button !== 0) return;   // 마우스 우클릭·휠클릭 = 발화 제외
    const svg = src.querySelector('svg'); if (svg) { svg.classList.remove('ic-src'); void src.offsetWidth; svg.classList.add('ic-src'); }   // 리플로우는 HTMLElement 기준(svg.offsetWidth는 undefined = 플러시 안 됨 · 8364 동일 함정) · openflash(배경 알약) 제거 = 픽토온리(운영자 260705 배경 네모 X) → 누름 피드백은 ic-src 모션 단독
  });
})();
__on(ROOT, 'click', e => {
  if (e.defaultPrevented) return;   // 드래그/취소된 클릭(캐러셀 스와이프 등)엔 헛모션 방지
  const b = e.target.closest('.sbtn,.tool-x,.dlg-x,.mx,.ed-x,.askx,.qh-x,.pmenu-rf,.ts-rf,.vh-rf,#profile,.fb-x,.sc-rsn-x,.askimg-x,.copy,.titlecopy,.gsrch,.dlgtop,.bnav-fab,.fi-saveall');   /* .vh-rf = 헤더 수동 재수집 픽토(260803 평의회 지적 — CSS 주석은 'ic-spin 위임'이라 적었는데 이 목록에 없어 누름 피드백이 0이었다 = 주석과 사실 불일치) */   // #src(원문·외부이동)는 click 발화가 새 탭 전환에 삼켜져 여기서 제외 → 전용 pointerdown 선발화(8355 · 운영자 260705)
  if (!b) return;
  const svg = b.querySelector('svg'); if (!svg) return;
  if (window.NMUA && NMUA.has(svg)) return;   // useAnimations 누름 재생이 맡는 아이콘(nm-ua.js · 운영자 261024 「가능한 재생 모두」) = CSS 모션 안 얹음(이중 모션 0)
  const m = b.dataset.motion ? ('ic-' + b.dataset.motion) : (b.matches('.save,.fi-saveall,[aria-label*="저장"],[aria-label*="다운로드"],[title*="다운로드"]') ? 'ic-bounce' : 'ic-spin');   // data-motion=rise(↗이동)/check(✓확인) 명시 우선(운영자 260702·260703) · 없으면 다운로드=바운스/그외=회전
  svg.classList.remove('ic-spin', 'ic-bounce', 'ic-rise', 'ic-check', 'ic-arrow'); void b.offsetWidth; svg.classList.add(m);   // ⚠️ 리플로우는 버튼(HTMLElement) 기준 — svg.offsetWidth는 SVGElement에 없어(undefined) 스타일 플러시가 안 일어나 remove→add가 한 프레임에 합쳐짐 = 2회째부터 모션 무발화(별자리 훑기 '처음만 작동' 진범 · 운영자 260704)
}, true);
__on(ROOT, 'click', e => {
  const b = e.target.closest('.dlbtn'); if (!b) return;
  if (!b.matches('.cref-dlall')) b.classList.add('dl-done');   // 클릭 즉시 '받음' mut(전체=.cref-dlall은 완료 시 별도 처리·운영자 260701·색 260706)
  const o = document.createElement('span'); o.className = 'dl-ack';
  o.innerHTML = '<span class="dl-ring"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
  b.appendChild(o); setTimeout(() => o.remove(), 700);
}, true);
$('#revFab').addEventListener('click', openRev);
$('#crevFab').addEventListener('click', openCrev);
const CARD_REVISING = new Map();
const CREV_PEND_KEY = 'nomute_crev_pending';
const cardUpdated = file => { const a = DATA.find(x => x.file === file); return (a && a.cards && a.cards.updated) || ''; };
const isCardRevising = file => CARD_REVISING.has(file);
const saveCardRevising = () => { try { localStorage.setItem(CREV_PEND_KEY, JSON.stringify([...CARD_REVISING])); } catch {} };
function loadCardRevising() {
  try {
    const now = Date.now();
    for (const [file, v] of JSON.parse(localStorage.getItem(CREV_PEND_KEY) || '[]'))
      if (v && typeof v.ts === 'number' && now - v.ts < 20 * 60000) CARD_REVISING.set(file, v);
  } catch {}
  if (CARD_REVISING.size) startCardRevisePoll();
}
function startCardRevising(file) {
  if (!file) return;
  CARD_REVISING.set(file, { reqUpdated: cardUpdated(file), ts: Date.now() });
  saveCardRevising();
  startCardRevisePoll();
  updateCrevFab();   // 즉시 revving(물결) 반영
}
let _crevPoll = null;
function startCardRevisePoll() {
  if (_crevPoll) return;
  _crevPoll = setInterval(async () => {
    if (isComposingModalOpen()) return;   // ⚠️ 작성 모달 중엔 폴 보류(backdrop-filter 깜빡임 방지 · 다음 틱 재개 · 260627)
    await load();
    let changed = false;
    for (const [file, v] of [...CARD_REVISING]) {
      if (cardUpdated(file) !== v.reqUpdated) {           // cards.updated 변경 = 카드 재기획 반영 완료
        CARD_REVISING.delete(file); changed = true;
        if ($('#dlg').open && CUR === file) {              // 열린 카드 자동 갱신(스크롤 보존) — open이 ensureDetail로 새 cards.md 재로드
          const a = DATA.find(x => x.file === file);
          if (a) { const db = $('#dlgbody'), st = db ? db.scrollTop : 0; open(a).then(() => { if (db) db.scrollTop = st; }); }
        }
      } else if (Date.now() - v.ts > 20 * 60000) {        // 20분 폴백 — 조용히 사라지지 말고 표면화
        CARD_REVISING.delete(file); changed = true;
        const ra = DATA.find(x => x.file === file);
        qFlash('카드 수정요청 20분째 반영 안 됨 — 지연이거나 실패. 안 바뀌면 다시 시도해' + (ra && ra.title ? ' (' + ra.title.slice(0, 16) + '…)' : ''), WARN_SVG);
      }
    }
    if (changed) { saveCardRevising(); updateCrevFab(); }   // 완료 → revving 해제·회차색(crev) 반영
    if (!CARD_REVISING.size) { clearInterval(_crevPoll); _crevPoll = null; }
  }, 20000);
}
let crevConfirmT = null;
function resetCrevSend() {
  clearTimeout(crevConfirmT);
  const btn = $('#crevSend'); if (!btn) return;
  btn.classList.remove('confirm');
  const lbl = btn.querySelector('span'); if (lbl) lbl.textContent = '수정';
}
function openCrev() {
  if (!CUR) return;
  if (isCardRevising(CUR)) return;   // 카드 수정 중 = FAB 눌러도 입력 팝업 안 열림(무반응) · 시각 표식(카드 수정 중)은 유지 — 운영자 260626(요약 openRev 미러)
  resetCrevSend();
  $('#crevSend').classList.remove('firing'); $('#crevSend').disabled = false;   // (crevStatus 잔상 리셋 소멸 — 상태문자열 폐지·qFlash 위임 260720)
  updateCrevClip(); openComposeDlg($('#crevdlg'));   // 폰 뒤로가기 칸(입력 손실 방지·260627)
  setTimeout(() => $('#crevText').focus(), 60);
}
function updateCrevClip() { const t = $('#crevText'); if (t) t.dispatchEvent(new Event('input', { bubbles: true })); }
$('#crevX').addEventListener('click', () => $('#crevdlg').close());
backdropClose($('#crevdlg'), ['#crevText']);
$('#crevdlg').addEventListener('close', () => { resetCrevSend(); if (!$('#crevdlg')._minimizing) draftClear('#crevText', updateCrevClip); });
$('#crevText').addEventListener('input', () => { resetCrevSend(); });
$('#crevSend').addEventListener('click', async () => {
  if (CUR && isCardRevising(CUR)) return;   // 진행 중 재전송 차단(silent)
  const instruction = $('#crevText').value.trim();
  if (!instruction) { qFlash('카드 수정 지시를 한 줄 적어줘'); return; }   // 전 상태문구 = qFlash 토스트(팝업 내 문자열 폐지 · 운영자 260720)
  if (!CUR) { qFlash('대상 카드를 못 찾음'); return; }
  const btn = $('#crevSend'), lbl = btn.querySelector('span');
  if (!btn.classList.contains('confirm')) {   // 1차 = 재확인
    btn.classList.add('confirm'); if (lbl) lbl.textContent = '재확인';
    clearTimeout(crevConfirmT); crevConfirmT = setTimeout(resetCrevSend, 4000);
    return;
  }
  clearTimeout(crevConfirmT);                  // 2차 = 전송
  btn.classList.remove('confirm'); if (lbl) lbl.textContent = '수정';
  btn.disabled = true; askHideCheck(btn); gaugeStart(btn);   // 게이지 = 재확인 탭 즉시·응답까지 진행(옛 'fetch 후 firing' 무반응 멈춤 제거 · 운영자 260702)
  try {
    const r = await fetch('api/revise-cards', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file: CUR, instruction }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) {
      gaugeDone(btn);
      setTimeout(() => askShowCheck(btn), 300);   // 게이지 채움완료(gdone .3s)와 물려 ✓ 팝(멈칫 제거·운영자 260703)
      startCardRevising(CUR);
      setTimeout(() => { $('#crevdlg').close(); $('#crevText').value = ''; btn.disabled = false; gaugeClear(btn); updateCrevClip(); }, 1400);
    } else {
      gaugeClear(btn); btn.disabled = false; qFlash((d && d.error) ? String(d.error).slice(0, 80) : '전송 실패 — 다시');
    }
  } catch (e) {
    gaugeClear(btn); btn.disabled = false; qFlash((await netMsg(e)) || '네트워크 오류 — 다시');   // 만료 = 로그인 안내(260923 · 카드 편집 4곳 형제)
  }
});
loadCardRevising();
$('#revX').addEventListener('click', () => revdlg.close());
backdropClose(revdlg, ['#revText']);
revdlg.addEventListener('close', () => { resetRevSend(); updateRevFab(); if (!revdlg._minimizing) draftClear('#revText', updateRevClip); });
$('#revText').addEventListener('input', () => { resetRevSend(); });
$('#revSend').addEventListener('click', async () => {
  if (CUR && isRevising(CUR)) { return; }   // 진행 중 재전송 차단 — silent(표기 없음·운영자 260623)
  const instruction = $('#revText').value.trim();
  if (!instruction) { qFlash('수정 지시를 한 줄 적어줘'); return; }   // 전 상태문구 = qFlash 토스트(팝업 내 문자열 폐지 · 운영자 260720)
  if (!CUR) { qFlash('대상 카드를 못 찾음'); return; }
  const btn = $('#revSend'), lbl = btn.querySelector('span');
  if (!btn.classList.contains('confirm')) {   // 1차 클릭 = 재확인(버튼 색·라벨로만 표시 — 안내 문구 없음)
    btn.classList.add('confirm'); if (lbl) lbl.textContent = '재확인';
    clearTimeout(revConfirmT); revConfirmT = setTimeout(resetRevSend, 4000);   // 4초 내 재확인 없으면 원복
    return;
  }
  clearTimeout(revConfirmT);                   // 2차 클릭 = 실제 전송
  btn.classList.remove('confirm'); if (lbl) lbl.textContent = '수정';
  btn.disabled = true; askHideCheck(btn); gaugeStart(btn);   // 게이지 = 재확인 탭 즉시 시작·응답까지 진행(옛 'fetch 후 firing'은 fetch 동안 무반응 멈춤 · 운영자 260702) · '보내는 중' 문구 없음
  try {
    const r = await fetch('api/revise', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file: CUR, instruction }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) {
      gaugeDone(btn);   // 게이지 현재위치→100% 급속 마무리
      setTimeout(() => askShowCheck(btn), 300);   // 게이지 채움완료(gdone .3s)와 물려 ✓ 팝(멈칫 제거·시안2·운영자 260703)
      startRevising(CUR);   // 완료 폴링·자동 갱신만 시작(시각 표기 없음 · 운영자 260623)
      setTimeout(() => { revdlg.close(); gaugeClear(btn); askHideCheck(btn); btn.disabled = false;
        $('#revText').value = ''; updateRevClip();   // ⚠️ 입력 리셋 = 닫은 뒤(게이지 도는 1.6s 동안 빈칸이 보여 '내가 쓴 게 사라졌나' 불안 차단 · askSend와 동일 표준 · 운영자 260622·260627)
      }, 1600);   // 닫힐 때까지 disabled(중복전송 차단)
      return;
    }
    qFlash(d.error || `서버 ${r.status}`);
  } catch { qFlash('전송 실패 (백엔드 배선 전이면 예상된 동작)'); }
  gaugeClear(btn); btn.disabled = false;
});
let TREDO_SID = '', TREDO_LAST = '', tredoConfirmT = null;
function thumbBaseSid(sid) { return String(sid || '').replace(/_r\d+$/, ''); }
function genGenCount(a, base) { return ((a && a.cards && a.cards.thumb_gen) || []).filter(g => g && g.sid && thumbBaseSid(g.sid) === base).length; }
function thumbRedoPendList(file) { const r = THUMB_REDO.get(file); return (r && r.snap) ? Object.keys(r.snap) : []; }
function thumbRedoPending(file, sid) { const r = THUMB_REDO.get(file); return !!(r && r.snap && r.snap[thumbBaseSid(sid)] !== undefined); }
function updateTredoClip() { const t = $('#tredoText'); if (t) t.dispatchEvent(new Event('input', { bubbles: true })); }
function resetTredoSend() {   // 발사 버튼 원복(재확인·게이지 해제)
  clearTimeout(tredoConfirmT);
  const btn = $('#tredoSend'); if (!btn) return;
  btn.classList.remove('confirm'); gaugeClear(btn); askHideCheck(btn); btn.disabled = false;
  const lbl = btn.querySelector('span'); if (lbl) lbl.textContent = '수정';
}
function openTredo(sid) {
  if (!CUR) return;
  if (thumbRedoPending(CUR, sid)) return;   // 이미 그 화풍 수정 중 = 무반응(중복 발사 방지 · openRev 미러)
  if (TREDO_LAST && TREDO_LAST !== sid) { const _t = $('#tredoText'); if (_t) _t.value = ''; }   // 다른 화풍 전환 = 이전 화풍 코멘트 잔류 차단(오전송 방지·평의회 UX) · 같은 화풍 재진입은 초안 보존
  TREDO_LAST = sid || ''; TREDO_SID = sid || '';
  resetTredoSend();
  updateTredoClip(); openComposeDlg($('#tredodlg'));   // 폰 뒤로가기 칸(입력 손실 방지)
  setTimeout(() => $('#tredoText').focus(), 60);
}
$('#tredoX').addEventListener('click', () => $('#tredodlg').close());
$('#tredodlg').addEventListener('close', () => { resetTredoSend(); if (!$('#tredodlg')._minimizing) draftClear('#tredoText', updateTredoClip); });
backdropClose($('#tredodlg'), ['#tredoText']);
$('#tredoText').addEventListener('input', () => { resetTredoSend(); });
$('#tredoSend').addEventListener('click', async () => {
  if (CUR && thumbRedoPending(CUR, TREDO_SID)) return;   // 진행 중 재전송 차단
  const btn = $('#tredoSend'), lbl = btn.querySelector('span');
  const wish = $('#tredoText').value.trim();   // 비우면 그대로 재추첨(운영자 260702)
  if (!btn.classList.contains('confirm')) {   // 1차 = 재확인(색·라벨로만)
    btn.classList.add('confirm'); if (lbl) lbl.textContent = '재확인';
    clearTimeout(tredoConfirmT); tredoConfirmT = setTimeout(resetTredoSend, 4000);
    return;
  }
  clearTimeout(tredoConfirmT);                 // 2차 = 실제 전송
  btn.classList.remove('confirm'); if (lbl) lbl.textContent = '수정';
  btn.disabled = true; askHideCheck(btn); gaugeStart(btn);   // 게이지 = 재확인 탭 즉시·응답까지 진행(옛 'fetch 후 firing' 무반응 멈춤 제거 · 운영자 260702)
  try {
    const r = await fetch('/api/thumbredo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ article: CUR, sid: TREDO_SID, wish }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) {
      gaugeDone(btn);   // 게이지 현재위치→100% 급속 마무리
      setTimeout(() => askShowCheck(btn), 300);   // 게이지 채움완료(gdone .3s)와 물려 ✓ 팝(멈칫 제거·운영자 260703)
      const rec = THUMB_REDO.get(CUR) || { t0: Date.now(), snap: {} };   // per-화풍 등록(동일 기사 다화풍 동시 수정 추적)
      rec.t0 = Date.now();
      const _rb = thumbBaseSid(TREDO_SID), _fa = DATA.find(x => x.file === CUR) || CUR_A;
      rec.snap[_rb] = genGenCount(_fa, _rb);   // 완료 기준 = 그 화풍 계열 장수(수정본이 +1되면 도착) · ⚠️ fresh 소스 — CUR_A는 open서 동결이라 재발사 시 stale→조기완료(260630 클래스) 방지(평의회 async)
      THUMB_REDO.set(CUR, rec);
      const _old = $('#mdbody .thumbsec'), _fresh = thumbSec(_fa);
      if (_old && _fresh) _old.replaceWith(_fresh);   // 즉시 재렌더 = 원본은 그대로 두고 트랙 끝에 '제작중' 슬롯이 붙는다(1/2 2/2 → 1/3 2/3 3/3 · 운영자 260807)
      setTimeout(() => { $('#tredodlg').close(); resetTredoSend(); $('#tredoText').value = ''; updateTredoClip(); }, 1600);   // 게이지 후 닫기 + 입력 리셋(닫은 뒤 = 빈칸 불안 차단)
      return;
    }
    qFlash(d.error || ('서버 ' + r.status));   // 전 상태문구 = qFlash 토스트(팝업 내 문자열 폐지 · 운영자 260720)
  } catch { qFlash('전송 실패 (백엔드 배선 전이면 예상된 동작)'); }
  gaugeClear(btn); btn.disabled = false;
});
loadRevising();
let _composeDlgStack = [], _composeRecovering = false;
function openComposeDlg(dlg) {
  if (!dlg) return;
  if (isLocked()) return;   // 잠금화면 뜬 동안엔 어떤 컴포즈 모달도 열지 않음 — top-layer라 z로 못 막는 dialog가 딥링크/async로 잠금 위에 뜨는 레이스 차단(lockNow의 1회 close 보완 · 평의회3 260705)
  if (!dlg._composeHistBound) {   // close 시 칸 회수 = 모달당 1회만 바인딩(showModal 사이트 5곳 외 close 사이트 안 건드림)
    dlg._composeHistBound = true;
    dlg.addEventListener('close', () => {   // ⚠️ <dialog>.close()의 close 이벤트는 비동기(queued) → popping 리셋은 *여기서*(동기 리셋하면 이 핸들러가 볼 땐 이미 false라 back 중복)
      const i = _composeDlgStack.indexOf(dlg); if (i < 0) return;   // 이 모달이 칸을 안 가졌으면(이미 회수·composeDlg 외 경로) 무시
      _composeDlgStack.splice(i, 1);                                // 자기 칸 제거(겹쳐 있어도 자기 것만)
      const wasPopping = dlg._composePopping; dlg._composePopping = false;
      if (!wasPopping && history.state && history.state.composeDlg) { _composeRecovering = true; try { history.back(); } catch { _composeRecovering = false; } }   // X·ESC·백드롭·전송완료·최소화 = push한 칸 회수(popstate 경로면 이미 소비 → 생략). ⚠️ 내 칸이 history top일 때만 back(no-op back에 _composeRecovering stuck·非LIFO 오취소 방지 — 평의회 V1/V2/V3). _composeRecovering = 이 back의 popstate가 *아래 모달·뒤 오버레이까지* 닫는 cascade/누수 차단 표식(compose 핸들러만 소비·리셋 · 타 popstate 핸들러는 첫 줄서 무시)
    });
  }
  dlg.showModal();
  try { history.pushState({ composeDlg: true }, ''); if (_composeDlgStack.indexOf(dlg) < 0) _composeDlgStack.push(dlg); } catch {}   // includes 가드 = 같은 모달 이중 push 방지(정상 흐름엔 닫힐 때 pop돼 없음)
}
// ───────── 원본 줄 끝 ─────────
  const __first = load();   // 기사 목록(앱이 읽은 것) → DATA · 그 뒤 고른 기사를 그림
  const show = async (file) => { __want = file; try { await __first; } catch {} if (__dead || __want !== file) return; const a = DATA.find((x) => x.file === file); if (!a) { host.miss(file); return; } if (CUR === file && $('#mdbody').firstChild) return; await open(a); };
  return { show, refresh: () => { if (!__dead && DATA_LOADED) return load(); }, stop: () => { __stop(); } };
}
