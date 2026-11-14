// @ts-nocheck
/* eslint-disable */
// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs 가 옛 에디터 viewer/index.html 에서 떼어 옴 · 대체 조각 = tools/prelude.js)
//   옛 「채널 요약」 · 「SNS」 탭이 돌던 코드 그대로(선언 158개) · 문서 = 이 화면 틀(ROOT) · 듣기 · 타이머 = 끌 때 다 걷음
export function startOldTabs(ROOT, which, host) {
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
  // ── 앱에 없는 옛 기능 대신 서는 것 ──
  let CURTAB = which === "chan" ? "chan" : "trend";
  let NM_SET = {};
  let FWATCH = [];
  const SCRAP_LOADED = false;
  const __fresh = { paint() {}, sync() {}, hold() {}, start() {} };
  const CHANF = __fresh, SNSF = __fresh;   // 머리 줄 「지금 새로 수집」 단추 = 머리 줄을 뺐음
  const renderMsgBadge = () => {}, renderScrap = () => {}, renderMsgList = () => {}, quakeNotify = () => {}, loadPending = () => {}, qGo = () => {};
  const qMatch = () => null, qEff = () => "", _searchRender = () => {};
  const isComposingModalOpen = () => false;
  // 설정 서버 = 「결과 함께」 올림 표시(gyPost)만 씀 · 앱 ../gyeol.tsx 와 같은 길(패치 + 기준)
  const saveSettings = (patch) => { const base = {}; for (const k in patch) base[k] = NM_SET[k] || []; NM_SET = { ...NM_SET, ...patch };
    return window.fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch, base }) }).then((r) => r.json().catch(() => ({}))).catch(() => ({})); };
  const __loadSet = () => window.fetch("/api/settings?_=" + Date.now(), { credentials: "same-origin", cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (__dead || !d || !Array.isArray(d.gyPost)) return; NM_SET = { ...NM_SET, gyPost: d.gyPost }; if (CHAN_SRC === "gyeol") gyPostRepaint(); }).catch(() => {});
  const trEmbed = () => null;   // 옛 「앱 안 보기 창」 대신 = 링크 그대로(새 창)
  const openTrView = (emb) => { if (emb && emb.src) host.open(emb.src); }, openTref = (i) => { const r = ((BRIEF && BRIEF.refs) || [])[i]; if (r && r.url) host.open(r.url); }, openIgPost = (u) => host.open(u);
  const geniRailSetup = () => {}, geniRailUpd = () => {};
  const EYE_SVG = '<svg width="16" height="16" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-11,0 C-11,0 -7,-8 0,-8 C7,-8 11,0 11,0 C11,0 7,8 0,8 C-7,8 -11,0 -11,0z" transform="matrix(1 0 0 1 16 16)"/><path d=" M0,-3 C1.66,-3 3,-1.66 3,0 C3,1.66 1.66,3 0,3 C-1.66,3 -3,1.66 -3,0 C-3,-1.66 -1.66,-3 0,-3z" transform="matrix(1 0 0 1 16 16)"/></svg>';   // 눈 = PIN 전체 표시 토글(.pin-eye · 설정/화면잠금 공유 · 운영자 260705) — on 상태는 색(accent)으로 표기(아이콘 교체 없음)
  const CHEV_L_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(1 0 0 1 16 16)"/></svg>';
  const CHEV_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(-1 0 0 -1 16 16)"/></svg>';
// ───────── 여기부터 원본 줄 ─────────
function relAge(h) {
  if (!isFinite(h) || h < 0 || h >= 9000) return '';
  const min = h * 60;
  if (min < 30) return '방금';
  if (min < 60) return '30분 전';
  if (h < 24) return Math.floor(h) + '시간 전';
  const d = Math.floor(h / 24);
  if (d < 7) return d + '일 전';
  if (d < 30) return Math.floor(d / 7) + '주일 전';
  return Math.floor(d / 30) + '개월 전';
}
const LINK_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';
const FIRE_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 11 11 11c0-2-1-4 1-9z"/><path d="M8.5 13a5.5 5.5 0 1 0 7 0c0 2-1.5 3-1.5 3s.5-3-2-5c-1 2-3 3-3 7z"/></svg>';
const AISPARK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px"><path d="M12 2c.5 4.2 1.9 5.6 6 6-4.1.4-5.5 1.8-6 6-.5-4.2-1.9-5.6-6-6 4.1-.4 5.5-1.8 6-6z"/><path d="M19 12.5c.25 2 .95 2.75 3 3-2.05.25-2.75.95-3 3-.25-2-.95-2.75-3-3 2.05-.25 2.75-.95 3-3z"/><path class="gpic-lt gpic-lts" d="M12 2c.5 4.2 1.9 5.6 6 6-4.1.4-5.5 1.8-6 6-.5-4.2-1.9-5.6-6-6 4.1-.4 5.5-1.8 6-6z" pathLength="100" fill="none"/></svg>';
const TRENDUP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M2 17.5 8.5 10.5l5 5L22 6.5"/><path d="M16 6.5h6v6"/><path class="gpic-lt" d="M2 17.5 8.5 10.5l5 5L22 6.5" pathLength="100" fill="none" stroke="none"/></svg>';
const CHEVRON_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="M6 9l6 6 6-6"/></svg>';
const CAFE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 11.3a2 2 0 0 1-2 1.7H9a2 2 0 0 1-2-1.7L6 8z"/><path d="M4.5 8h15"/><path d="M9.2 2.8c-.6 1 .6 1.8 0 2.8M14.2 2.8c-.6 1 .6 1.8 0 2.8"/></svg>';
const BLOG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const dimTags = s => { const t = String(s ?? ''); const m = t.match(/((?:#[A-Za-z0-9_]+[  ]*)+)$/); return (m && m[1].trim()) ? esc(t.slice(0, m.index)) + '<span class="tag-dim">' + esc(m[1].replace(/[  ]+$/, '')) + '</span>' : esc(t); };
const escUrl = u => { const s = String(u ?? '').trim().replace(/[\u0000-\u001f]/g, ''); return /^(javascript|data|vbscript):/i.test(s) ? '#' : esc(s); };
const SYS_PLAT_KO = { x: 'X', tiktok: '틱톡', insta: '인스타그램', youtube: '유튜브', threads: '스레드' };
function subRunState(c) {
  c = c || {};
  if (typeof c.run_ok !== 'number') return '';
  const f = (c.run_fail && typeof c.run_fail === 'object') ? Object.keys(c.run_fail).length : 0;
  return f ? 'fail' : (c.run_ok > 0 ? 'quiet' : '');
}
function subFailKo(plat, codes) {
  const P = SYS_PLAT_KO[plat] || plat, cs = (codes || []).map(String);
  const pick = f => cs.find(v => f(v, Number(v) || 0));
  let v;
  if ((v = pick((s, n) => n >= 500))) return { k: 'srv', t: P + ' 서버가 응답을 거절했어요(HTTP ' + v + ' — ' + P + ' 쪽 일시 장애)' };
  if (pick((s, n) => n === 429)) return { k: '429', t: '요청이 몰려 ' + P + '이(가) 잠시 막았어요(HTTP 429)' };
  if ((v = pick((s, n) => n === 401 || n === 403))) return { k: 'deny', t: P + '이(가) 수집 서버의 접근을 막았어요(HTTP ' + v + ')' };
  if (pick(s => s === 'err')) return { k: 'net', t: P + ' 응답을 못 받았어요(연결 오류·시간 초과)' };
  if (pick(s => s === 'gone')) return { k: 'gone', t: '등록한 계정이 ' + P + '에 없어요(삭제됐거나 아이디를 바꿨어요)' };
  if (pick(s => s === 'nolist')) return { k: 'nolist', t: '계정은 살아있는데 영상 목록이 0건으로 와요(영상을 가져오는 창구 문제)' };
  return null;
}
const FW_GAP_MS = 45 * 60e3;
const fwWide = s => String(s || '').replace(/(특별자치도|특별자치시|특별시|광역시|자치도|자치시).*$/, '').split(/\s+/)[0] || '';
function fwOf(d) {   // 이 재난문자에 걸린 추적 항목(없으면 null)
  if (!d || !Array.isArray(FWATCH) || !FWATCH.length) return null;
  const t = Date.parse(d.time || '') || 0; if (!t) return null;
  const w = fwWide(d.area), k = d.kind || '';
  return FWATCH.find(f => f && f.kind === k && fwWide(f.area) === w && Math.abs((f.t0 || 0) * 1000 - t) <= FW_GAP_MS) || null;
}
function fwChip(d) {
  const f = fwOf(d); if (!f) return '';
  if (f.picked) return `<span class="fw-chip on">${esc(f.sig === 'scale' ? '대형화재 · 큐 넘김' : '사상자 확인 · 큐 넘김')}</span>`;
  const min = Math.max(0, Math.round((Date.now() - (f.t0 || 0) * 1000) / 60000));
  return `<span class="fw-chip">추적 중 ${min}분${f.grade === 'LO' ? '' : ''}</span>`;   // 등급은 창 길이일 뿐 = 화면 문구로 안 낸다(운영자가 읽을 정보는 '보고 있다'와 '넘겼다' 둘)
}
const DIS_CRIT_KIND = /지진|해일|화재|산불|폭발|붕괴|방사능|방사성|테러|민방공|화생방|공습|경계경보|핵/;
function disCrit(d) {
  if (!d) return false;
  if (d.crit != null) return !!d.crit;                                   // 신규 수집분 = 서버 판정 그대로
  const sev = Number(d.sev); if (Number.isFinite(sev) && sev > 0) return Math.floor((sev % 1000) / 10) >= 77;   // sev 역산(= level*1000 + rank*10 + gr)
  return DIS_CRIT_KIND.test(String(d.kind || '') + ' ' + String(d.title || ''));   // 라벨·유형 텍스트(구 폰 축 = title이 본문 원문)
}
function qAgo(t) {
  if (!t) return '?';
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return '방금';
  if (m < 60) return m + '분 전';
  return relAge(m / 60);   // 1시간 이상 = 공통 사다리(N시간/N일/N주일/N개월) — 복합표기('5시간 17분') 폐지·열 정렬 일정·기틀(운영자 260621)
}
const Q_REFR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg>';
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
let SOCIAL = [], SOCIAL_LOADED = false, SOCIAL_LOADING = false, SOC_LM = 0;
const SOC_SENT_KEY = 'nm_soc_sent', SOC_PKLABEL = 'Pk-ng', SOC_PKDONE = 'Pk-ed';
const SOC_SENT_CAP = 200;
const SOC_PIN_MS = 24 * 3600e3;
let SOC_SENT = (() => {
  try {
    const a = JSON.parse(localStorage.getItem(SOC_SENT_KEY) || '[]');
    if (Array.isArray(a)) return new Map(a.map(x => (x && typeof x === 'object') ? [String(x.k || ''), { ask: String(x.ask || ''), q: String(x.q || ''), ...(x.snap && x.at ? { snap: x.snap, at: +x.at || 0 } : {}) }] : [String(x || ''), { ask: '', q: '' }]).filter(([k]) => k));
  } catch {}
  return new Map();
})();
const socKey = r => (r && (r.url || r.title)) || '';
const socSentSave = () => { try { const _n = Date.now(); localStorage.setItem(SOC_SENT_KEY, JSON.stringify([...SOC_SENT].slice(-SOC_SENT_CAP).map(([k, v]) => ({ k, ask: v.ask || '', q: v.q || '', ...(v.snap && v.at && _n - v.at <= SOC_PIN_MS ? { snap: v.snap, at: v.at } : {}) })))); } catch {} };
const socSentAdd = (k, ask, snap) => { if (!k) return; SOC_SENT.delete(k); SOC_SENT.set(k, { ask: String(ask || ''), q: '', ...(snap ? { snap, at: Date.now() } : {}) }); socSentSave(); };
const socPinned = k => { const v = SOC_SENT.get(k); return !!(v && v.at && Date.now() - v.at <= SOC_PIN_MS); };
const socSnap = (url, title) => {   // 전송 시점 카드 스냅샷 — renderSns가 그리는 필드 전부(수집 목록에서 빠져도 이 값으로 같은 카드를 다시 그린다) · age0 = 전송 시점 표시 나이(스캔 스냅샷 나이 + 파일 경과 = renderSns 보정과 같은 자)
  const r = (Array.isArray(SOCIAL) ? SOCIAL : []).find(x => socKey(x) === socKey({ url, title })); if (!r) return null;
  const _el = SOC_LM ? Math.max(0, (Date.now() - SOC_LM) / 3600000) : 0;
  return { url: r.url || '', title: r.title || '', desc: r.desc || '', burst: +r.burst || 0, source_count: +r.source_count || 0, posts: +r.posts || 0, sources: (r.sources || []).slice(0, 14), age0: Math.round(((+r.age_h || 0) + _el) * 10) / 10 };
};
const socGhosts = () => {   // 전송분 중 수집 목록에서 이미 빠진 카드 = 스냅샷으로 잔류(운영자 260821) — 목록에 살아있는 행이 있으면 그쪽이 정본(스냅샷 미사용 = 최신 수집값 우선) · _pinAge = 전송 시점 나이 + 전송 후 경과(자기 앵커 = 나이 표기가 계속 정직하게 자란다)
  if (!SOC_SENT.size || !Array.isArray(SOCIAL)) return [];
  const live = new Set(SOCIAL.map(socKey)), out = [];
  for (const [k, v] of SOC_SENT) { if (v && v.snap && !live.has(k) && socPinned(k)) out.push({ ...v.snap, _pinAge: (+v.snap.age0 || 0) + (Date.now() - v.at) / 3600000 }); }
  return out;
};
async function loadSocial() {
  if (SOCIAL_LOADING) return; SOCIAL_LOADING = true;
  try {
    await loadSocLean();   // 소스 성향 정본 선로드 — 렌더 전 완료 보장(깜빡임 0)·1회 가드·fail-soft(운영자 260717)
    const r = await fetch('social_candidates.json?_=' + Date.now());
    if (r.ok) { const d = await r.json(); if (Array.isArray(d)) SOCIAL = d; SOC_LM = Date.parse(r.headers.get('last-modified') || '') || 0; }   // Last-Modified = 스캔 산출 시각 근사(정적 서빙 = 파일 도장) — age_h 경과 보정 앵커(Q359 ㉠ · 결측 = 0 = 보정 없음 fail-soft)
  } catch { /* 없으면 빈 레인 */ }
  finally { SOCIAL_LOADED = true; SOCIAL_LOADING = false; if (CURTAB === 'trend') renderSns(); }
}
let SOC_LEAN_MAP = {
  '클리앙':'ll','보배드림':'ll','82쿡':'ll','더쿠':'ll','오유':'ll','인스티즈':'ll','루리웹':'ll','뽐뿌':'ll',   // 강진보(뽐뿌 = 운영자 260717 극좌 재분류: 약진보 l → 강진보 ll)
  'SLR':'l','이토랜드':'l','웃대':'l',   // 약진보(친민주 다수)
  '인벤':'mid',   // 중립(2022 맵 중도·게임 위주)
  '엠팍':'r','와이고수':'r',   // 약보수(엠팍=조국 후 反與·와이고수=우경화)
  '에펨코리아':'rr','디시':'rr','일베':'rr',   // 강보수
};
const socLean = s => { const v = SOC_LEAN_MAP[s] || (NAVER_CHIP[s] ? 'mid' : ''); return v ? 'lean-' + v : ''; };
const NAVER_CHIP = {
  '네이버카페':   { cls: 'src-naver src-naver-cafe ico', icon: CAFE_SVG, label: '카페' },
  '네이버블로그': { cls: 'src-naver src-naver-blog ico', icon: BLOG_SVG, label: '블로그' },
  '지식iN':       { cls: 'src-naver src-naver-kin',       icon: '',       label: '지식iN' },
};
const socSrc = s => (NAVER_CHIP[s] ? NAVER_CHIP[s].cls : '');
const LEAN_VAL = { ll:1, l:3, mid:5, r:7, rr:9 };
const socVal = s => { const k = SOC_LEAN_MAP[s]; if (k) return LEAN_VAL[k]; if (NAVER_CHIP[s]) return LEAN_VAL.mid; return null; };
let SOC_LEAN_LOADED = false;
async function loadSocLean() {   // 소스 성향 정본(soc_lean.json) 로드 → SOC_LEAN_MAP 덮어씀. loadSocial이 렌더 전 await(깜빡임 0) · 실패 = 폴백 스냅샷 유지(fail-soft) · SPA폴백 가드 = loadTrends 동일.
  if (SOC_LEAN_LOADED) return;
  try {
    const r = await fetch('soc_lean.json?_=' + Date.now());
    if (!r.ok) return;
    const tx = await r.text();
    if (/^\s*</.test(tx)) return;   // SPA 폴백(HTML 200) 가드 = loadTrends·loadSocial 동일
    const j = JSON.parse(tx);
    if (j && typeof j === 'object' && !Array.isArray(j)) { SOC_LEAN_MAP = j; SOC_LEAN_LOADED = true; }   // 정본 오버라이드(_help 키 = 소스명 조회 무해)
  } catch (e) { /* 폴백 스냅샷 유지 */ }
}
let _snsSig = '';
const SOC_HOT10 = 24, SOC_HOT30 = 12;
const SOC_MIN = 10;
const socPass = r => Math.round(((+(r && r.burst) || 0)) * 10) / 10 >= SOC_MIN;
let TRENDS = null, BRIEF = null, _trFetched = 0, _trPainted = 0;
var XTOP = null;
async function loadTrends(force) {
  if (Date.now() - _trFetched < 5 * 60e3) return;   // 5분 TTL(수집 30분 주기 = 충분·탭 재진입 남발 방지)
  try {
    let tx = null;
    for (const u of ['api/trends' + (force ? '?_=' + Date.now() : ''), 'sns_trends.json?t=' + Date.now()]) {
      try {
        const sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(12000) : null;   // 시도마다 새 시그널 = loadCandidates 관용구(하나를 재사용하면 1차 타임아웃이 2차 폴백까지 즉사시킨다)
        const r = await fetch(u, sig ? { signal: sig } : undefined);
        if (!r.ok) continue;
        const t0 = await r.text();
        if (/^\s*</.test(t0)) continue;   // SPA 폴백(HTML 200) 가드 = rszLoad·freeLoad 동일
        const j = JSON.parse(t0);
        if (!j || !j.updated) continue;   // updated 없는 응답 = 서빙 실패 신호 → 다음 소스(candidates 빈배열 SPOF 교훈 미러 · 260714)
        tx = t0; TRENDS = j; break;
      } catch { /* 다음 소스 */ }
    }
    if (tx === null) return;   // 전 소스 실패 = last-good 유지(종전 동작 그대로)
    if (!_trPainted) { _trPainted = 1; try { if (CURTAB === 'scrap' && SCRAP_LOADED) renderScrap(); } catch { /* 렌더 실패가 트렌드 로드를 죽이지 않는다 */ } }   // 첫 실검 도착 = 수집함 1회 재렌더 — 실검은 비동기라 부팅 첫 렌더가 대개 이 앞에 온다(실측: 그 화면은 대세 승격이 빠진 카드 목록) · 1회 도장이라 5분 TTL 재로드마다 깜빡이지 않는다
    _trFetched = Date.now();   // TTL 스탬프 = 성공 시에만(선-set이면 첫 로드 blip 한 번에 트렌드 레인 5분 공백 · 평의회 260713 ⑤)
  } catch (e) { return; }
  try {   // AI 브리프(비서 페르소나 · 운영자 260712) — 없거나 실패 = 블록 미표시(조용한 공백) · 소스 순서 = 본체와 동축(api 우선 → 정적 폴백)
    for (const ub of ['api/trends?f=brief' + (force ? '&_=' + Date.now() : ''), 'sns_brief.json?t=' + Date.now()]) {
      try {
        const rb = await fetch(ub);
        if (!rb.ok) continue;
        const tb = await rb.text();
        if (/^\s*</.test(tb)) continue;
        const jb = JSON.parse(tb);
        if (!jb || !jb.updated) continue;
        BRIEF = jb; break;
      } catch { /* 다음 소스 */ }
    }
  } catch (e2) {}
  try {   // X 급상승 원본(결 · data/x_top10/latest.json) — 수집 블록(xspike)보다 먼저 읽는다. 실패 = null(화면은 블록·빈 상태로 조용히 떨어짐)
    XTOP = null;
    const rx = await fetch('api/trends?f=xtop' + (force ? '&_=' + Date.now() : ''));
    if (rx.ok) {
      const txp = await rx.text();
      if (!/^\s*</.test(txp)) {
        const jx = JSON.parse(txp);
        if (jx && (Array.isArray(jx) || Array.isArray(jx.items) || typeof jx.generated_at === 'string')) XTOP = jx;
      }
    }
  } catch (e2x) { XTOP = null; }
  try {   // ⑭-i 화재·지진 추적 상태(운영자 260803 "기계가 이 건을 놓쳤나를 화면에서") — 없거나 실패 = 칩 미표시(조용한 공백 · 문법 = 위 브리프 그대로)
    const rf = await fetch('fire_watch.json?t=' + Date.now());
    if (rf.ok) { const tf = await rf.text(); if (!/^\s*</.test(tf)) FWATCH = JSON.parse(tf) || []; }
  } catch (e2b) {}
  try { renderSnsTrends(); } catch (e3) {}   // 렌더 예외 격리 — loadTrends 프로미스 reject로 형제 배선까지 전파 차단(평의회 260713 ②)
  try { renderMsgBadge(); const mp = $('#msgpop'); if (mp && !mp.hidden) renderMsgList(); } catch (e4) {}   // 수집 고장(health.subs.stale) 반영 = 기어 색·알림메세지 목록 갱신(syncStaleMsg 본문 문법 계승 · 260725)
  try { quakeNotify(); } catch (e5) {}   // ⑭ 지진 = 기기 알림(운영자 260802) — 알림함 경고(quakeMsgs)는 위 renderMsgBadge가 이미 반영
}
const HEART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
const vfmt = n => n >= 1e8 ? (n / 1e8).toFixed(1) + '억' : n >= 1e4 ? (n < 1e5 ? (n / 1e4).toFixed(1).replace(/\.0$/, '') : String(Math.round(n / 1e4))) + '만' : n > 0 ? (n / 1e4).toFixed(2).replace(/0$/, '').replace(/\.0$/, '') + '만' : '';
const RD_UP_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6"/></svg>';
const TR_LOGO = {
  gg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 10.7v3h4.5c-.2 1.2-1.5 3.4-4.5 3.4a5.1 5.1 0 0 1 0-10.2c1.6 0 2.6.7 3.2 1.2l2.2-2.1A8 8 0 0 0 12 3.9a8.1 8.1 0 1 0 0 16.2c4.7 0 7.8-3.3 7.8-7.9 0-.5 0-.9-.1-1.5H12z"/></svg>',
  yt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26.4 26.4 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8zM10 15.2V8.8L15.5 12z"/></svg>',
  tk: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.7 5.6a4.9 4.9 0 0 1-1.1-3.1h-3.1v12.7a2.66 2.66 0 1 1-2.66-2.66c.28 0 .55.05.81.13V9.5a5.9 5.9 0 0 0-.81-.06 5.76 5.76 0 1 0 5.76 5.76V9.7a7.8 7.8 0 0 0 4.51 1.42V8a4.8 4.8 0 0 1-3.4-2.4z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.9 7.9L22.2 21H16l-4.8-6.3L5.7 21H2.6l7.4-8.4L1.9 3h6.4l4.3 5.7L17.8 3zm-1.1 16.1h1.7L7.4 4.8H5.6l11.1 14.3z"/></svg>',
  kcomm: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="9.2" r="2.1"/><path d="M1.3 17.5c0-2.2 1.6-3.7 3.7-3.7s3.7 1.5 3.7 3.7z"/><circle cx="19" cy="9.2" r="2.1"/><path d="M15.3 17.5c0-2.2 1.6-3.7 3.7-3.7s3.7 1.5 3.7 3.7z"/><circle cx="12" cy="7" r="3"/><path d="M6 18.5c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6z"/></svg>',
  bsk: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 10.8C10.9 8.6 7.9 4.6 5.1 3.6c-1.5-.5-3.1.3-3.1 2.4 0 .6.4 4.7.6 5.4.6 2.3 3 3 5.2 2.6-3.2.5-6 1.5-2.3 5.7C7.8 22 9.6 17.4 10.5 15c.3-.8.6-1.2 1.5-1.2s1.2.4 1.5 1.2c.9 2.4 2.7 7 6.1 4.7 3.7-4.2.9-5.2-2.3-5.7 2.2.4 4.6-.3 5.2-2.6.2-.7.6-4.8.6-5.4 0-2.1-1.6-2.9-3.1-2.4C16.1 4.6 13.1 8.6 12 10.8z"/></svg>',
  rdd: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.1a2.4 2.4 0 0 0-4.1-1.7 11.6 11.6 0 0 0-6-1.9l1-4.8 3.4.7a1.7 1.7 0 1 0 .2-1.5l-4.2-.9a.75.75 0 0 0-.9.6l-1.2 5.8a11.6 11.6 0 0 0-6 1.9A2.4 2.4 0 1 0 3.6 14.4a3.9 3.9 0 0 0 0 .6c0 3.4 3.8 6.1 8.4 6.1s8.4-2.7 8.4-6.1a3.9 3.9 0 0 0 0-.6 2.4 2.4 0 0 0 1.6-2.3z"/><ellipse cx="8.9" cy="13.9" rx="1.5" ry="1.7" fill="var(--bg)"/><ellipse cx="15.1" cy="13.9" rx="1.5" ry="1.7" fill="var(--bg)"/></svg>',   // 레딧 = 대분류 승격(운영자 260727)에 따른 레일 로고 — 지오메트리 = 서드파티 원형(§핵심명령 3-a 예외축) · 단색 currentColor + 눈 구멍 var(--bg) = hn 로고 문법 계승(신규 색 0)
  pop: HEART_SVG,   // 인기 게시물(260731 유튜브+레딧 통합 대분류) 레일 픽토 — 플랫폼 로고가 아니라 성격축이라 로고 대신 **기존 카드 지표 픽토 HEART_SVG 재사용**(신규 픽토 창작 0 · 24뷰박스·stroke2·round 규격 동일 · fin·mv와 같은 stroke 계열) · 폴백('인' 첫 글자)보다 형제 레일 문법 정합
  fin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16l5-5 4 3 6-7"/><path d="M15 7h5v5"/></svg>',
  hn: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.2c-4 0-7 3.1-7 7.2v1.4c-1.1.6-1.7 1.7-1.7 3.2L3 20.2h18l-.3-6.2c0-1.5-.6-2.6-1.7-3.2V9.4c0-4.1-3-7.2-7-7.2z" fill="currentColor"/><ellipse cx="8.7" cy="13" rx="1.4" ry="1.8" fill="var(--bg)"/><ellipse cx="15.3" cy="13" rx="1.4" ry="1.8" fill="var(--bg)"/></svg>',
  mv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7.5" cy="5.3" r="2.2"/><circle cx="12" cy="5.3" r="2.2"/><rect x="4" y="7.3" width="11" height="6.4" rx="1"/><path d="M15 9.4l4-1.8v6.6L15 12.4"/><path d="M9.5 13.7v3.2M9.5 16.9l-3.6 4.1M9.5 16.9l3.6 4.1"/></svg>'
};
const TR_REG_SVG = {   // 지역 세그 픽토 — 국내 = 태극 픽토그램(운영자 260713 "한국 태극기 넣어줄래? 픽토그램이면 더 좋음" · 색 = 팔레트 토큰 계승 --accent-3 레드·--bias-l2 딥블루 = 색이 의미인 요소 · 링 = currentColor로 on/off 세그 상태 동행) · 월드 = 지구본 stroke(표지판 SVG 정본 §디자인 c)
  kr: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12a9 9 0 0 1 18 0a4.5 4.5 0 0 1-9 0a4.5 4.5 0 0 0-9 0Z" fill="var(--accent-3)"/><path d="M3 12a4.5 4.5 0 0 1 9 0a4.5 4.5 0 0 0 9 0a9 9 0 0 1-18 0Z" fill="var(--bias-l2)"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".3" stroke-width="1"/></svg>',
  gl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><ellipse cx="12" cy="12" rx="3.5" ry="8.2"/><path d="M4.4 9.3h15.2M4.4 14.7h15.2"/></svg>'
};
const TR_PCOL = { gg: 'var(--cat-eco)', yt: 'var(--cat-intl)', tk: 'var(--cat-soc)', ig: 'var(--cat-cul)', x: 'var(--cat-pol)' };
function fmtK12(s) { s = String(s || ''); const mo = +s.slice(5, 7), dd = +s.slice(8, 10), H = +s.slice(11, 13); return (mo && dd && Number.isFinite(H)) ? `${mo}/${dd} ${String(H % 12 || 12).padStart(2, '0')}:${s.slice(14, 16)}${H < 12 ? 'AM' : 'PM'}` : ''; }
let TR_TOPF = 'all';
const chuFit = (box = document) => box.querySelectorAll('.chu').forEach(w => {
  const tg = w.querySelector(':scope > details[data-g="top"] > .tgroup-h');   // TOP 10 = 좌측 클러스터 실측 예약(--chu-lr) — 구 정적 208(150+10+48)이 실측 타이틀(폰 390 = 159)에 미달해 광학 갭 10 → 1px 붕괴 = '전체' 칩이 제목에 붙어 헤더 탭을 먹던 것 봉합(운영자 260801) · 측정 문법 = smoke_chan measure/titleEnd·--tpm-l Range 정본 계승(텍스트노드 = Range · 요소 = rect) · seg 실폭(--chu-r)보다 **먼저** = 아래 offsetWidth 읽기가 새 창폭을 반영
  if (tg) { let tR = 0; tg.childNodes.forEach(n => { let r = null; if (n.nodeType === 3 && n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); r = rg.getBoundingClientRect(); } else if (n.nodeType === 1) r = n.getBoundingClientRect(); if (r && r.width) tR = Math.max(tR, r.right); });
    if (tR) w.style.setProperty('--chu-lr', Math.round(tR - w.getBoundingClientRect().left + 10 + 48) + 'px'); }   /* raw-ok: 10 = .chseg-row 원문 주석의 광학 간격 정본(#969) · 48 = right 앵커 짝 */
  const s = w.querySelector(':scope > details > .chseg-row > .ch-rangeseg'); if (s && s.offsetWidth) w.style.setProperty('--chu-r', (48 + s.offsetWidth + 10) + 'px');
  const m = w.querySelector(':scope > details > .ch-hdrmore'); if (m) { const hd = w.querySelector(':scope > details > .tgroup-h'); let tR = 0; hd && hd.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width) tR = Math.max(tR, r.right); } }); if (tR) w.style.setProperty('--tpm-l', (tR - w.getBoundingClientRect().left + 16) + 'px'); } });
try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => chuFit(document)); } catch {}
let _chuRz = 0;
__on(window, 'resize', () => { clearTimeout(_chuRz); _chuRz = setTimeout(() => chuFit(document), 150); });
function renderSnsTrends() {
  const box = $('#snsTrends'); if (!box) return;
  // 첫 방문(TRENDS 미로드) = 빈 화면 대신 로딩 표시 — showTab('trend')의 캐시 즉시 렌더는 첫 방문엔 캐시가 없어 트렌드·AI 요약 영역이 통째 빈칸 → loadTrends 완료(~수초·폰 느린망) 후 갑툭 팝인 = "다른 화면 떴다가 AI 요약으로" 증상(운영자 260715). 로딩 표기 = 아래 renderSns "불러오는 중…"(.empty) 패턴 계승. TRENDS 도착 시 실렌더가 교체(_trSig 미설정 = 무조건 재구축).
  if (!TRENDS) { if (!box.querySelector('.trend-loading')) box.innerHTML = '<div class="empty trend-loading">' + (window.nmLoader?nmLoader('loading','Now loading…'):'Now loading…') + '</div>'; return; }
  const TRREG = localStorage.getItem('nm_trend_region') === 'gl' ? 'gl' : 'kr';   // 지역 모드 = 국내 기본(운영자 260712) · 월드 = 국내 포함 병합(gtrends_gl·youtube_gl = 주요국 KR 제외분)
  const d = TRENDS || {};
  { const vt = __byId('vhTimeTxt') || __byId('vhTime'); if (vt) vt.textContent = d.updated ? (fmtK12(d.updated) || '') : ''; const rb = __byId('snsFreshBtn'); if (rb) rb.hidden = !d.updated; }   // 수집 시각 = 좌상단 #vhTimeTxt 1회(운영자 260720 — 채널요약 탭 Q290 패턴 계승 · 구 대분류별 반복[AI요약·TOP10·실검] tdash-time 폐지 대체 · 260803 픽토 동거 = 내부 스팬 이관·구 #vhTime 폴백) · 시각 있을 때만 재수집 픽토 점등(빈 헤더에 글리프 단독 방지) · 시그니처 가드 위 = 탭 전환 조기 return에도 갱신 · vh-acts(우) 대칭 좌측 · 색 = --mut(.vh-time)
  const _xSig = [(typeof XTOP !== 'undefined' && XTOP && (XTOP.generated_at || (XTOP.example ? 'ex' : ''))) || '', (d.xspike && d.xspike.generated_at) || ''].join(',');
  const _trSig = [d.updated, (typeof BRIEF !== 'undefined' && BRIEF && BRIEF.updated) || '', TRREG, TR_TOPF, localStorage.getItem('nm_trend_sort') || '', localStorage.getItem('nm_trend_gfold') || '', localStorage.getItem('nm_trend_fold') || '', _xSig].join('|');   // 시그니처 가드(평의회⑧ — 무가드 통재구축이 폴링마다 재부양·토글 랙 유발) = 수집함 _scSig 문법 계승 · 데이터·지역·정렬·접힘 동일 = 무접촉 · X 급상승 시각이 바뀌면 다시 그림
  if (_trSig === box._trSig && box.childElementCount) return;
  const mrg = (a3, b3, key) => { const s3 = new Set(a3.map(key)), o3 = a3.slice(); (b3 || []).forEach(x3 => { const k3 = key(x3); if (k3 && !s3.has(k3)) { s3.add(k3); o3.push(x3); } }); return o3; };
  // 외국어 제목·본문 한글 번역 노출(운영자 260719 "미리 다 달아놔") — 서버 sns_tr.py(무키 gtx)가 부착한 ko를 표시 필드(title/text)에 반영 = 전 소비처 자동 한글화(원어는 데이터 보존·미표기) · bsk=자체 LLM ko 경로라 제외 · gt/sig/xtr=검색어라 제외 · 틱톡 매퍼의 ko|| 폴백은 이 패스가 상위 대체(무해 중복) · idempotent(ko 불변 = 재렌더 안전)
  { const _sb = d.subs || {}; [[d.youtube, 'title'], [d.youtube_gl, 'title'], [(d.tiktok || {}).videos, 'title'], [d.shorts, 'title'], [d.aivid, 'title'], [d.reddit, 'title'], [d.hackernews, 'title'], [_sb.x, 'text'], [_sb.tiktok, 'title'], [_sb.youtube, 'title'], [_sb.insta, 'title'], [_sb.threads, 'text']].forEach(p3 => { if (Array.isArray(p3[0])) p3[0].forEach(it3 => { if (it3 && it3.ko) it3[p3[1]] = it3.ko; }); }); }
  // ── 3일 하드컷(운영자 260721 "3일 넘기면 안나오게 — 그거를 제끼고 순위화"): 콘텐츠 아이템(영상·게시물·글)은 실발행 72h 초과 = 표시·랭킹 제외(조회수 무관 = 이슈성 소멸 · 통합 TOP·필터·스택도 소스 공유라 자동 상속). 검색어류(gt·sig·xtr·btr = '지금 순위'가 본질·first_seen은 관측 도장)와 운영 대시보드(금융·재난·박스·도로) = 비대상. 나이 미상(NaN) = 통과(fail-soft — isFreshItem 관용 계승) · freshFirst(12h 신선 부양)는 컷 통과분 안에서 종전대로 · _ageOf/ageVerH = 소스 선언보다 앞이 필요해 freshFirst 블록서 이리 상향 이동(정의 1곳 불변) ──
  const AGE_CUT_H = 72;
  const X_SUB_H = 18;   // X 구독 창(운영자 261001 "구독한 채널 기준 18시간 내, 조회수 순으로 10위까지") — 수집기 sns_trends.X_SUB_H와 같은 값
  const _ageOf = p => {   // 발행값 → 경과 h(숫자) = relP 문자열 파서의 수치판(신선검증 원료) · 무효/미상 = NaN(파싱 실패 ≠ 오래됨 = fail-soft 유지)
    if (p == null || p === '') return NaN;
    const s = String(p).trim();
    if (typeof p === 'number' || /^\d{9,13}$/.test(s)) { const n = +p; return (Date.now() - (n < 1e12 ? n * 1000 : n)) / 3600e3; }   // epoch 초/밀리초(틱톡 create_time 등)
    const h2 = (Date.now() - new Date(s).getTime()) / 3600e3;   // ISO/RFC(yt published·gt started)
    if (isFinite(h2)) return h2;
    let m;   // 기성 상대문자열(쇼츠·AI영상 수집원문 "N시간 전 / N일 전 …") 근사 파싱 — new Date 미파싱분
    if (/^방금/.test(s)) return 0;
    if ((m = s.match(/(\d+)\s*분/))) return +m[1] / 60;
    if ((m = s.match(/(\d+)\s*시간/))) return +m[1];
    if ((m = s.match(/(\d+)\s*일/))) return +m[1] * 24;
    if ((m = s.match(/(\d+)\s*주/))) return +m[1] * 168;
    if ((m = s.match(/(\d+)\s*개월/))) return +m[1] * 720;
    if ((m = s.match(/(\d+)\s*년/))) return +m[1] * 8760;
    return NaN;
  };
  const ageVerH = x => { for (const p of [x.published, x.time, x.started, x.create_time]) { const h = _ageOf(p); if (isFinite(h)) return h; } return NaN; };   // 실발행 나이 = "벌어진 일" 기준 · first_seen 제외(수집관측 도장 ≠ 사건시각 · 운영자 260718 검증 취지) · 전부 미상 = NaN
  const cutH = (arr, mx) => (arr || []).filter(t3 => { const h3 = ageVerH(t3); return !(isFinite(h3) && h3 >= mx); });   // 나이 컷 공통(경계 mx 시간 · 미상 NaN = fail-soft 통과)
  const cut3d = arr => cutH(arr, AGE_CUT_H);   // 3일 컷 필터(위 하드컷 주석 = 정본 사유)
  const gt = TRREG === 'kr' ? (d.gtrends || []) : mrg(d.gtrends || [], d.gtrends_gl, g3 => (g3.query || '').toLowerCase());
  // ── 유튜브 게임 배제(운영자 260818 "유튜브 알고리즘 순위에서 게임은 빼줄 수 있나(top)") ──
  //   실측 = 실시간 TOP 10 5위 「저라뎃의 피파 실력은 과연..?!」 = 게임 카테고리 · 원천인 인기 차트 50건 중 **22건(44%)**이 게임이라
  //   TOP 풀·인기 그리드가 같은 배열을 쓰는 구조상 **원천 한 곳에서 걷어내면 두 자리가 동시에 해소**된다(필터 사본 0).
  //   판정 정본 = 수집기가 실어주는 videos.list `snippet.categoryId`(sns_trends.py `_yt_items` · 260818 신설) = 20이 게임.
  //   ⚠ 폴백은 **cat 결측일 때만** 발동 = 이 필드가 아직 없는 옛 회차 데이터 방어(그 회차의 게임 주제 목록 id 대조).
  //     cat이 있으면 그것만 믿는다 → 게임 주제 수집을 끊어도(같은 날 _CAT_DEF 제외) 배제가 그대로 산다 = 죽은 폴백이 조용히 통과시키는 일 없음.
  //   ⚠ 스코프 = 유튜브 3레인 전부(인기·뉴스·맞춤추천) — TOP 풀이 그 셋을 함께 물어서 한 레인만 걸면 나머지로 게임이 도로 올라온다.
  //   되돌림 = 아래 3줄의 ytNoGame() 벗기기.
  const _YT_GAME_CAT = '20';
  const _ytGameIds = new Set((((d.youtube_cats || {})['20']) || []).map(v3 => v3 && v3.id).filter(Boolean));
  const ytNoGame = arr => (arr || []).filter(v3 => { const c3 = String((v3 && v3.cat) || ''); return c3 ? c3 !== _YT_GAME_CAT : !_ytGameIds.has(v3 && v3.id); });
  const ytRaw = ytNoGame(TRREG === 'kr' ? (d.youtube || []) : mrg(d.youtube || [], d.youtube_gl, v3 => v3.id).sort((a3, b3) => (b3.views || 0) - (a3.views || 0)).slice(0, 15)), yt = cut3d(ytRaw);   // 3일 컷(운영자 260721) · Raw = 10개 보장 후순위 채움 풀(운영자 260721 "썸네일 영상은 무조건 10개 — 없으면 후순위에서")
  const ytrRaw = ytNoGame(d.youtube_reco || []), ytr = cut3d(ytrRaw);   // 맞춤 추천(운영자 260816 "내 추천이 거의 내 채널 큐레이션에 맞는 내용이기 때문에 저게 유의미한 거였고") — 수집 = sns_trends.py yt_reco(로그인 쿠키 + 공식 API 메타) · ⚠ 공식 인기 차트가 **아니다**(운영자 계정 추천)라 별 키로 받는다 · 3일 컷 = 형제 축 동일 · 쿠키 죽음·무키 = 0건 = 종전 동작
  const ytnRaw = ytNoGame(d.youtube_news || []), ytn = cut3d(ytnRaw);   // 뉴스 카테고리 = 국내 축(뉴스 소재 훑기 온-미션 · 모드 무관 표시) · 3일 컷 · Raw = 채움 풀
  // 틱톡 통합 랭킹(운영자 260726 "해외거 까지 가능하게 · 해외거는 감점 · 24시간 넘어가면 없는거 · 해당하는게 없으면 해외가 치고 올라오는거다")
  // ⓐ 24h 하드컷(구 48h) — 국내·해외 공통 · ⓑ 국내 모드도 KR 필터 폐지 = 전 지역 한 랭킹 · ⓒ 해외만 조회수 ×0.2 감점 스코어로 정렬.
  // 계수 0.2 = 7일 이력 실측(260726 · sns_trends.json 커밋 506개 되짚기 · url별 발행후 24h 최근접 관측): 24h 조회수 중앙값
  //   국내 148,246 / 해외 2,155,349 = 해외 14.5배. 완전 동등화는 ×0.069지만 그건 top20 국내 15:해외 5로 해외를 사실상 봉인 →
  //   운영자 지정 0.2 = 국내 12:해외 8(국내 살짝 우세 유지 + 해외 메가바이럴 진입 허용) · 국내 24h분이 적은 날 = 해외가 자동 승격.
  // ⚠ 선형 계수 한계: 상위 꼬리는 못 잡는다(2.41억뷰 × 0.2 = 4,820만 = 여전히 1위) — 지수 압축은 미채택(운영자 판단 대기).
  // ⓓ 조회수 하한 10만 · 창 18h · 표시 10개(운영자 260726 "하한 10만은 되야해 그이하는 공유하지도 마 / 10개만 받아오는거로 / 올린지 18시간")
  //   ⚠ 이 3조건 동시 적용 = 현 창구(tikwm feed/list)로는 상시 0건에 가깝다(실측 260726 10콜·dedup 138건: 18h 국내 1건[511뷰]·
  //   10만↑ 0건 · 24h 국내 4건·10만↑ 0건 · 48h로 늘려야 국내 23건·10만↑ 12건). 원인 = tikwm feed가 인기 랭킹이 아니라 무작위
  //   For-You 표본이라 10만+ 신작이 표본에 걸릴 확률이 낮은 것(수집 누락 아님 — 10콜 전부 code 0). 0건 = 조용한 공백(§디자인 e-가)이
  //   저조회 잡탕보다 낫다는 운영자 판단("그이하는 공유하지도 마")대로 채움 사다리 없음. 근본 해결 = 창구 교체(Creative Center 인기영상).
  // TK_MIN_V 10만 → 1만(260728 실측 = 운영자 "틱톡 인기가 없어졌다") — 수집은 멀쩡한데(117건 신선) **18h 컷 × 10만 문턱이 동시에 걸려 화면 3건**만 남았다.
  //   18h 안에 조회수 10만을 넘기는 영상 자체가 드물다: 신선분 55건 중 1만↑ 9건 · 10만↑ 3건 · **한국분은 10만↑ 0건**(= KR 틱톡이 화면에서 통째로 실종).
  //   시간컷(18h)은 "지금 뜨는 것" 성격이라 그대로 두고 **문턱만** 내린다 = TOP10 슬롯이 채워진다(9건). 되돌리기 = 이 상수 1e4 → 1e5.
  const TK_GL_MUL = .2, TK_MIN_V = 1e4, TK_TOP = 10, TK_CUT_H = 18, tkScore = t3 => (t3.views || 0) * (t3.region === 'KR' ? 1 : TK_GL_MUL);
  const tkvA = ((d.tiktok || {}).videos) || [], tkv = cutH(tkvA, TK_CUT_H).filter(t3 => (t3.views || 0) >= TK_MIN_V).sort(TRREG === 'kr' ? (a3, b3) => tkScore(b3) - tkScore(a3) : (a3, b3) => (b3.views || 0) - (a3.views || 0)).slice(0, TK_TOP), tk = ((d.tiktok || {}).hashtags) || [];   // videos = tikwm 주 경로(260711) · 월드 모드 = 감점 없는 순수 조회수순(종전 규약 유지 — 국내 우대는 국내 모드 전용 축) · slice = tkv 자체를 10개로 절단 = 하위 소비처(lane·sec·fillT) 전부 자동 10개 · hashtags = 구 카나리아 폴백(무시각 = 컷 비대상)
  const sb = d.subs || {}, sxRaw = sb.x || [], stkRaw = sb.tiktok || [], sreRaw = sb.insta || [], sytRaw = sb.youtube || [], sx = cutH(sxRaw, X_SUB_H), stk = cut3d(stkRaw), sre = cut3d(sreRaw), syt = cut3d(sytRaw);   // 구독 축(운영자 260711 — 수집 = SNS_SUBS 게이트) · 3일 컷(260721 — 큐레이션 스테일 carry["8개월 전"]가 최신처럼 랭킹되던 것 봉인 = 컷 후 0건 섹션은 조용한 공백) · X만 X_SUB_H(18h) 컷(운영자 261001 "구독한 채널 기준 18시간 내")
  const shvRaw = d.shorts || [], aivRaw = d.aivid || [], shv = cut3d(shvRaw), aiv = cutH(aivRaw, 168);   // 쇼츠 = 3일 컷 · AI 영상 = 7일 컷 · Raw = 채움 풀(운영자 260721 "10개까지 안나오고 짤림" — 검색 파생 니치 = 일 1~3건 수집이라 3일 창 = 2건 고사 실측 · TOP 풀 제외 소스라 완화 무부작용)
  const sig = d.signal || [], nmuL = (d.namu || []).slice(0, 10);   // ⑨ 시그널 실검(운영자 260712 버튼 승인 · 국내 축 = 모드 무관 표시 · ⑩ X 실시간 트렌드 = 261016 폐지) — 검색어류 = 컷 비대상 · nmuL = 나무위키 실시간 검색어(운영자 260929 · 빈 상태 판정에도 합류)
  const _isoMs = s => Date.parse(String(s || '').replace(/(\.\d{3})\d+/, '$1'));   // 폰 isoformat 마이크로초 6자리 = 사파리 Date.parse NaN(26-ovlGradient 주석 판례) → 밀리초 3자리로
  const rdd = cut3d(d.reddit || []), bsk = cut3d(d.bsky || []), sth = cut3d(sb.threads || []);   // ⑥⑦⑧ 레딧·블루스카이·스레드 구독(운영자 260713 "추천대로" 배치 승인 — 레딧 = 커뮤니티 그룹 · 블스·스레드 = 새 그룹) · 게시물 = 3일 컷
  const hnl = cut3d(d.hackernews || []), finc = d.finance || {}, finR = finc.rates || [], finC = finc.coins || [], finI = finc.indices || [], finS = finc.stocks || [], dsl = d.disaster || [], kob = d.kobis || [], exw = d.expressway || [];   // ⑫⑬⑭⑮⑯ 해커뉴스(3일 컷)·금융(환율/코인/증시/종목 · 운영자 260717 2x2)·재난문자·박스오피스·고속도로 돌발(운영자 260713 "ㄱ" · 데이터 있을 때만 그룹 등장 = 조용한 공백 · 대시보드류 = 컷 비대상)
  if (!gt.length && !yt.length && !ytn.length && !tkv.length && !tk.length && !sx.length && !stk.length && !sre.length && !syt.length && !shv.length && !aiv.length && !sig.length && !nmuL.length && !rdd.length && !bsk.length && !sth.length && !hnl.length && !finR.length && !finC.length && !dsl.length && !kob.length && !exw.length) { box.innerHTML = ''; return; }   // 빈 상태 = 조용한 공백(필러 문구 금지 · §디자인 e-가) — sns_trends.json 레포 상존+실패 시 직전분 보존이라 실무 도달 불가(평의회3 · 의도적 유지) · HN·금융·재난·박스오피스·고속도로 5키 누락 봉합(260720 평의회 F1 — 이 그룹들만 데이터일 때 통삭제 잠복)
  // vfmt = 전역 승격(260720 평의회 후속 — 임베드 모달 인기 댓글도 사용 · 정의 = renderSnsTrends 위 전역 1곳)
  const tfmt = s => { const n2 = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10); return n2 > 0 ? vfmt(n2) + '+' : ''; };   // 구글 검색량 문자열 "20,000+"→"2만+" 만단위 통일 — 천단위 원값은 RSS approx_traffic 저단위 버킷(수집기 교체 검토 = 운영자 결정 대기)
  const tm = fmtK12(String(d.updated || ''));   // 수집 시각(살아있냐 신호 · 평의회10) — 표기 = "7월 16일 2:18PM" 공통(운영자 260716 "시간표시 동일하게")
  let stale = false;   // 수집 65분+ 밀림 = 크론 지연/사망(정직 신호 · 평의회6 — 크론 주기 30분×2 + 지터 여유)
  if (d.updated) { const am = (Date.now() - new Date(d.updated).getTime()) / 60000; stale = am > 65; }
  // 순위 변동 배지(직전 스냅샷 대비 · 평의회4) — isNew=신규진입 / delta>0=상승 / delta<0=하락 / 유지=미표시
  const chg = x => '';   // 운영자 260720 "new 랑 순위 바뀌는거 없애버려" + "뉴카드는 다 빼줘" — NEW·순위변동(▲▼) 배지 전 표면 제거(카드·리스트 chg + TOP10 .tpc-new 렌더까지 · Q228) · 재도입 = 이 반환만 원복(구 로직: state n/+/-/s · isNew · delta ± → git 이력 보존 · 수집기는 isNew/delta 계속 기록 중)
  const cma = n => String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');   // (미사용 260712 #6 — TOP 10 조회수도 vfmt 000만 통일 · 정의는 폴백 보존)
  const relH = p => p ? (Date.now() - new Date(p).getTime()) / 3600e3 : NaN;   // 발행 → 경과 h → relAge(공통 상대시간 사다리 계승)
  const relP = p => {   // 발행값 관용 파서(소스별 포맷 지옥 실측 260712): ISO/RFC 문자열(yt·tk·subs) · epoch 초/밀리초(subs.tk 숫자) · 기성 상대문자열("5일 전" — shorts/aivid 수집 원문) = 그대로 통과 · 무효 = '' (truthy-invalid가 폴백 막던 버그 봉합)
    if (p == null || p === '') return '';
    if (typeof p === 'number' || /^\d{9,13}$/.test(String(p))) { const n = +p; return relAge((Date.now() - (n < 1e12 ? n * 1000 : n)) / 3600e3); }
    const h2 = (Date.now() - new Date(p).getTime()) / 3600e3;
    if (isFinite(h2)) return relAge(h2);
    return /전$|^방금$/.test(String(p).trim()) ? String(p).trim() : '';
  };
  const relT = x => relP(x.published) || relP(x.time) || relP(x.started) || relP(x.first_seen);   // 시간 표기 공통(운영자 260712 "모든 것에 시간 기록") = published(영상 발행) ∥ time(구독 X·틱톡) ∥ started(구글 트렌드 시작시각 = 급상승 실제 나이 · 운영자 260717 "n시간 전 맞나" 직답 — 수집기 gt만 보유·first_seen보다 우선) ∥ first_seen(수집기 최초관측 도장 — 실검 등 무발행·무started 소스 폴백)
  const FRESH_MAX_H = 12;   // 실시간 TOP 신선 상한(운영자 260718 "12시간 내 벌어진 일인지 검증") — 뉴스 보도색 12h 경계(3792)·시간가속 반값 12h(9031)와 동축 · env 아닌 상수(뷰어 즉시 반영) · _ageOf/ageVerH 정의 = 3일 하드컷 블록으로 상향 이동(260721 — 소스 선언 앞 필요 · 정의 1곳 불변)
  const TOP_MAX_H = 24;   // 실시간 TOP 입장 하드컷(운영자 260721 "top10에는 항상 24시간 이내 정보만") — 24h+ = 풀 자체 미입장(리스트·플랫폼 탭·스택 전 뷰 공통) · 미상(NaN) = fail-soft 통과(isFreshItem 동축) · 전멸 = 조용한 공백(kobL "10개 안 나와도 괜찮아" 선례 — 구 "빈칸 0 채움"은 이 컷 안에서만)
  const isFreshItem = t => { const h = ageVerH(t); return !(isFinite(h) && h >= FRESH_MAX_H); };   // 신선 = 12h 미만 · 미상(NaN)=신선 취급(fail-soft — 타임스탬프 없다고 후순위로 침몰 금지)
  const freshFirst = arr => arr.filter(isFreshItem).concat(arr.filter(t => !isFreshItem(t)));   // 안정 분할 = 신선분 위로(내부 순서 보존) → 오래된 것 아래로 차순위 채움(운영자 260718 "신선 없으면 차순위 top 위로 · 빈칸 없이") · 옆 relT 나이표기(N시간 전)는 불변 = 오래된 건 정직하게 표기
  const fill10 = (prim, ...pools) => { const out = prim.slice(0, 10), seen = new Set(out); for (const pool of pools) for (const x of (pool || [])) { if (out.length >= 10) return out; if (!seen.has(x)) { seen.add(x); out.push(x); } } return out; };   // 썸네일 영상 섹션 10개 보장(운영자 260721 "무조건 10개 — 없으면 후순위에서 채움 · 다 일맥상통하게") — 1순위 = 종전 리스트 그대로(신선·정렬 불변 = 컷 취지 유지) · 부족분만 후순위 풀 순서대로 · 동일 참조 dedup · 풀 소진 = 있는 만큼(창작 0) · relT 나이 표기 = 오래된 건 정직 노출 · TOP 풀(lane)은 무접촉 = 24h 입장컷 그대로
  // (구 zig 인터리브·tpc TOP 카드 렌더 = tpg 1:1 레일 폐지(260717 그리드 통일)로 호출 0 고아 → 260720 평의회 삭제 · .tpc* CSS는 스택(tsk) 오버레이가 공유라 존치 · 재도입 = git 이력)
  const row = (i, url, right, x, thumb, pt, qcls) =>   // 공용 행(썸네일 유무·pt=세로 커버) — 순서 = [썸네일] 랭크 제목 변동배지 수치
    `<a class="trend-row${thumb ? ' th' : ''}" href="${escUrl(url)}" target="_blank" rel="noopener">` +
    (thumb ? `<img class="trend-th${pt ? ' pt' : ''}" loading="lazy" referrerpolicy="no-referrer" src="${escUrl(thumb)}" onerror="this.style.display='none'" alt="">` : '') +
    `<span class="trend-rank">${i + 1}</span><span class="trend-q${qcls ? ' ' + qcls : ''}"></span>${chg(x)}<span class="trend-traffic">${right}</span><span class="trend-tm">${relT(x)}</span></a>`;   // 시간 열 = 우측 끝 고정폭(운영자 260712 "모든 것에" · 결측 = 빈 칸 유지)   // qcls = 제목 셀 색 클래스(⑭-d 지진·화재급 골드 dis-crit · 운영자 260803) — 문법·위치 = brow(i,url,right,cls) 의 cls 100% 계승 · 미지정 = 종전 그대로(전 호출부 무영향)
  // 섹션 접기(운영자 260711) = 네이티브 <details> · 기억 = localStorage nm_trend_fold(nomute_tab 관용구 · 빌드 시점 open 복원)
  let TFOLD = {}; try { TFOLD = JSON.parse(localStorage.getItem('nm_trend_fold') || '{}') || {}; } catch { TFOLD = {}; }
  const NOHEAD = new Set();   // 소머리 줄을 CSS로 소거한 키(§671) — 260731 공집합: yt·rdd 숨김이 '인기 게시물' 통합으로 폐지(§691), tk는 260730에 이미 제외 = 전 소분류가 자기 접기 핸들을 가짐(TFOLD 정상 복원). 다시 숨기는 소분류가 생기면 그 키를 여기 넣는다(기존 판정식 무접촉). = 접기 핸들이 없으니 TFOLD 무시하고 항상 open 렌더 — 과거에 접어둔 상태에 본문이 갇히는 것 차단(구 CSS 강제표시 안은 .trend-grid의 display:grid를 block으로 덮어써 2열 그리드가 1열로 깨졌다 · 실측 260726 본문높이 482.8→1256.8)
  const sec = (key, lbl, unit, n, body) =>
    `<details class="trend-sec" data-sec="${key}"${(TFOLD[key] && !NOHEAD.has(key)) ? '' : ' open'}><summary class="trend-lbl"><span class="trend-lbltx">${lbl}</span> <span class="trend-unit">${unit}</span><span class="trend-cnt">${n}</span></summary>${body}</details>`;
  // 구독 축 stale = 섹션을 **지우지 않고 남겨** 사유를 고지(운영자 260727 "큐레이션에 인스타를 만들고 안 받아와지는지 알수있어야해") —
  //   종전 = 0건이면 `if(arr.length)`가 섹션째 삭제 → 화면만 보면 "원래 없는 소분류"와 구분 불가 = 운영자가 세션에 물어봐야만 아는 사각(260727 인스타 429 판례).
  //   발동 = health.subs.stale(= **등록 계정은 있는데 이번 수집 0건**) 한정이라, 계정 미등록 축은 종전대로 조용한 공백(§디자인 e-가 불변).
  //   부품 = `.qempty`(레포 공용 인라인 빈 상태 정본 · 2700행 주석 "인라인 로딩 플레이스홀더 공용") + sec() 그대로 = 새 CSS·새 셀렉터 0.
  //   사유 판정 = sysErrMsgs와 **동일 소스**(TRENDS.health.phone) — 알림과 화면이 어긋나지 않게 한 축으로 묶는다(상세 조치는 알림함이 정본이라 여긴 한 줄 + 유도).
  const _subStale = new Set((((TRENDS && TRENDS.health) || {}).subs || {}).stale || []);
  const _subOff = new Set((((TRENDS && TRENDS.health) || {}).subs || {}).off || []);   // 운영자가 끈 플랫폼(설정 → 구독 채널 → 구독 끄기) = 섹션 자체를 안 그린다(비움 문구도 없음 = 숨김)
  const _PHONE_PLAT = { insta: 1, threads: 1 };   // 메타 데센 IP 차단 = 폰 전용 공급원(sysErrMsgs SYS_PHONE_PLAT과 동일 축)
  // 코드가 끈 구독(scraper/sns_trends.py SUBS_PAUSED → health.subs.paused · 운영자 261022 「구독 받는 용도면 둘다 빼」) = 요청 0 ·
  //   숨김(_subOff)과 달리 칸은 남기고 「꺼짐」이라 말한다(빈칸이면 고장으로 읽힌다) · 부품 = subEmptySec와 같은 sec()+`.qempty` = 새 CSS 0
  const _subPaused = new Set((((TRENDS && TRENDS.health) || {}).subs || {}).paused || []);
  const subPausedSec = (key, lbl) => sec(key, lbl, '', 0, '<div class="qempty">꺼짐<small>부계정 보호로 이 구독은 지금 안 받아요</small></div>');
  const subEmptySec = (key, lbl, plat) => {
    // 등록 0개 = 「구독 비움 상태」 명시(운영자 260810 "비었다고 - 구독 비움 상태 라고 뜨게해줘") — 구판은 여기서 ''를 반환해 **섹션을 통째로 안 그렸다**. `_subStale` 소스가 health.subs.stale = 「등록 계정 있음 ∧ 이번 런 0건」이라, 등록이 0개면 애초에 그 집합에 못 들어와 침묵이 유일한 출력이었다. ⚠ 실사고 260810 = 틱톡 등록 계정이 0개(`viewer/sns_accounts.json` tiktok {kr:[],gl:[]} · 형제는 x6·insta20·youtube30·threads5)라 「틱톡 - 구독」이 화면에서 사라졌고, 바로 옆 「틱톡 - 추천」(tikwm for-you 표본)이 그 자리를 대신하는 것처럼 보여 운영자가 **그것을 자기 구독 채널로 읽었다**. 화면이 침묵하면 사람이 옆 것으로 메운다 = 이 레포가 반복해 겪은 「관측이 지워지면 다음 사람이 추측으로 메운다」와 같은 축(스레드 `[1차 실측]`·틱톡 `_e1`·smoke 사유 0자). 부품 = 아래 stale 분기의 `sec()`+`.qempty` **그대로** = 신규 CSS·신규 셀렉터 0
    // X = 등록은 있는데 X_SUB_H 창 안 0건 → 로그인 경로 상태(health.subs.xauth)로 사유를 가른다(261001 — 비로그인은 옛 인기글만 와서 '비움 상태'·'차례 대기'가 둘 다 거짓말이었다)
    //   off(결측 = 로그인 경로 이전 수집기 = 비로그인과 같다) = 조치 · fail(401·403) = 쿠키 교체 · ok = 정상 침묵 · err(쿼리·레이트·네트워크) = 아래 종전 판정(쿠키 탓 아님)
    //   알림함 sysErrMsgs X 분기와 같은 사유·같은 조치(C-D5 한 축)
    const _hs = ((TRENDS && TRENDS.health) || {}).subs || {}, _xa = _hs.xauth || 'off';
    if (plat === 'x' && _xa !== 'err' && ((((_hs.cover || {}).x) || {}).reg > 0 || _subStale.has('x'))) return sec(key, lbl, '', 0, '<div class="qempty">' +
      (_xa === 'ok' ? `${X_SUB_H}시간 안에 올라온 글이 없어요<small>구독 계정이 새 글을 올리면 조회수 순으로 떠요</small>`
        : _xa === 'fail' ? 'X 로그인 쿠키가 거절됐어요<small>만료·로그아웃 — 가계정 쿠키를 새로 뽑아 저장소 시크릿 X_SUBS_AUTH_TOKEN·X_SUBS_CT0를 갈아 주세요</small>'
        : `${X_SUB_H}시간 안 새 글을 못 받았어요<small>로그인 없이는 X가 옛 인기글만 줘요 — 저장소 시크릿 X_SUBS_AUTH_TOKEN·X_SUBS_CT0(가계정 쿠키)를 넣으면 최신 글이 조회수 순으로 떠요</small>`) + '</div>');
    if (!_subStale.has(plat)) return sec(key, lbl, '', 0, '<div class="qempty">구독 비움 상태<small>설정 → 구독 채널에서 계정을 추가하면 여기에 쌓여요</small></div>');
    const ph = ((TRENDS && TRENDS.health) || {}).phone;
    // 대기 사유는 알림함과 **같은 판정**으로 읽는다(260730 적대검증 C-D5) — 종전엔 입력이 health.phone 하나뿐이라
    //   폰이 살아 있으면 무조건 "막혀서 못 걷고 있어요"였고, 같은 상황에서 알림함은 "차례를 기다리는 중"이라
    //   두 화면이 서로 다른 말을 했다(이 블록 주석의 "한 축으로 묶는다" 규약 자기위반).
    const _cw = (((((TRENDS && TRENDS.health) || {}).subs || {}).cover || {})[plat] || {}).why || {};
    const _tv = Object.values(_cw).map(v => String(v)).filter(v => v !== 'rotate' && v !== 'budget');   // 미시도 제외 = sysErrMsgs 대기 판정과 동일 문법
    const _waiting = !_tv.length || _tv.filter(v => v === 'cooldown' || v === 'gap' || v === '429').length * 2 > _tv.length;
    const _rcv = (((((TRENDS && TRENDS.health) || {}).subs || {}).cover || {})[plat]) || {}, _rs = subRunState(_rcv), _rfk = _rs === 'fail' ? subFailKo(plat, Object.values(_rcv.run_fail)) : null;   // 러너 축 = 알림함과 같은 판정(261020)
    const why = (_PHONE_PLAT[plat] && ph && ph.ok === false) ? '폰 수집기가 멈춰서 못 걷고 있어요'
      : (_PHONE_PLAT[plat] ? (_waiting ? '차례를 기다리는 중이에요 — 자동으로 다시 걷혀요' : '지금은 막혀서 못 걷고 있어요')
         : _rs === 'quiet' ? '조회는 정상인데 새로 올라온 글이 없어요'
         : _rfk ? _rfk.t + ' — 자동으로 다시 시도해요'
                           : '이번 수집에서 0건이에요 — 자동으로 다시 시도해요');
    return sec(key, lbl, '', 0, '<div class="qempty">' + why + '<small>자세한 원인과 조치는 설정 → 알림메세지에</small></div>');
  };
  // 구독 축 carry 고지(운영자 260803 "멈춘 걸 멈췄다고 말하게") — 위 subEmptySec는 **0건일 때만** 사유를 말한다.
  //   그래서 가장 위험한 국면이 무경보였다: 이전 수집분(carry)이 살아 있으면 화면은 **정상 랭킹처럼** 보이는데
  //   이번 런 신규는 0건(260803 실측 = X 구독이 07:10 이후 4런 연속 신규 0 · 12건 그대로 · 화면 무표시 ·
  //   등록 6계정 중 2계정은 아예 0건). stale 판정은 이미 있었고 **소비처만 없었다** = 배선 한 줄.
  //   판정 = subEmptySec와 **같은 소스**(health.subs.stale = 등록 계정 있음 ∧ 이번 런 0건) → 두 화면이 어긋나지 않는다.
  //   부품 = `.tdash-time.stale`(수집 멈춤 정본 배지 · --warn · 큐레이션 대분류 "폰 점검 필요" 12097과 동일 클래스·동일 title 문법)
  //          + sec()의 기존 unit 슬롯 = **신규 CSS·신규 셀렉터 0**.
  //   시각 = 마지막으로 새로 걷힌 때(first_seen 최대) · 정렬은 문자열 비교(전건 +09:00 오프셋 = 사전순 = 시간순 · naive new Date() 금지 [12])
  //          · 표기 = fmtK12(#vhTime·금융과 동일 정본) · first_seen 결측(구데이터) = 시각 없이 문구만 = fail-soft.
  const subStaleUnit = (plat, arr) => {
    if (!_subStale.has(plat)) return '';
    // 이번 회차 조회 결과(261020 · sysErrMsgs와 같은 판정 subRunState) — quiet = 조회 성공 + 새 글만 없음 = 정상이라 경고 배지 없음(운영자 "이슈가 아니니까") ·
    //   fail = 조회가 실패했는데 이월분이 화면을 채운 국면 → 「새 글 0건」이 아니라 「조회 실패」라고 말한다(261013~ 틱톡 503을 새 글 없음으로 오독한 자리).
    const _cv = ((((TRENDS && TRENDS.health) || {}).subs || {}).cover || {})[plat] || {}, _rs = subRunState(_cv);
    if (_rs === 'quiet') return '';
    const at = (arr || []).map(t => String(t.first_seen || '')).filter(Boolean).sort().pop() || '';
    const k = at ? fmtK12(at) : '';
    if (_rs === 'fail') {
      const _fk = subFailKo(plat, Object.values(_cv.run_fail));
      return `<span class="tdash-time stale" title="${esc((_fk ? _fk.t : '조회 실패') + ' — 새 글이 없어서가 아니라 이번 수집에서 조회가 실패했다. 지금 보이는 건 ' + (k ? k + ' ' : '이전 ') + '수집분이다(자동으로 다시 시도한다 · 자세한 원인과 조치는 설정 → 알림메세지에)')}">조회 실패</span>`;
    }
    return `<span class="tdash-time stale" title="등록 계정은 있는데 이번 수집에서 새 글이 0건 — 지금 보이는 건 이전 수집분이다(자동으로 다시 시도한다 · 자세한 원인과 조치는 설정 → 알림메세지에)">${k ? k + ' 이후 ' : ''}새 글 0건</span>`;
  };
  const bySort = (arr, f) => arr.slice().sort((a, b2) => (b2[f] || 0) - (a[f] || 0));
  // (구 TSORT/sortOf/sortbar 정렬 전환 칩 = 운영자 260726 "저 선택지 없애도 될듯 둘 다" 폐지 — X는 RSS 미러 폴백 구간 likes·rts·cmts 전멸(전부 0 · _x_rss)이라 어느 축이든 동순서 = 무기능 실측, 스레드도 좋아요 고정 통일 · nm_trend_sort 키 고아 · 재도입 = git 이력)
  const met = pairs => pairs.filter(p => p[1] > 0).map(p => `<i>${p[0]}<span>${vfmt(p[1])}</span></i>`).join('');   // 0 지표 = 미표기(릴스 조회 비공개 등)
  const covImg = (cov, nofb) => {   // 트렌드 카드 커버 img — 유튜브(ytimg)는 세로 원본 썸네일 oar2.jpg를 먼저 시도해 **세로로 실재하는 영상만** 그 그림을 쓴다(운영자 260803 "쇼츠에 내용 있는 부분만 확대해서 썸네일 가득" · 크롭 = 기존 .tcard-cov img object-fit:cover가 수행 = 신규 CSS 0) → 없거나 가로면 data-fb 원본 커버로 강등(종전 경로 그대로) → 재실패 = 워드마크 폴백(tcCovFail).
    // ⚠ 260803 도입 전제였던 "oar2 = 쇼츠에만 존재(쇼츠 200·일반 404)"는 **틀렸다**(260804 재실측 — 쇼츠 1·4위 bVjSZ8Z67mc·oJNEZIKbtck 둘 다 404. 채널이 16:9 썸네일을 단 쇼츠엔 oar 변형이 아예 없다 = oar2의 실제 축은 '쇼츠'가 아니라 **원본 종횡비가 16:9가 아닌 영상**). 그 전제 오류에 아래 onload 가드 부재가 겹쳐 유튜브 전 블록(인기·쇼츠·뉴스·AI·구독)이 회색판으로 덮였다.
    const m = String(cov).match(/^https:\/\/i\.ytimg\.com\/vi\/([\w-]{11})\//);
    return m ? `<img loading="lazy" referrerpolicy="no-referrer" src="https://i.ytimg.com/vi/${m[1]}/oar2.jpg" data-fb="${escUrl(cov)}" data-nofb="${esc(nofb || '')}" onerror="tcOarDown(this)" onload="if(this.dataset.fb&&this.naturalWidth>=this.naturalHeight)tcOarDown(this)" alt="">`
      : `<img loading="lazy" referrerpolicy="no-referrer" src="${escUrl(cov)}" data-nofb="${esc(nofb || '')}" onerror="tcCovFail(this)" alt="">`;
  };
  // 커버 로드 실패(핫링크 만료·CDN 교체·403) = 타일 **소멸이 아니라** 플랫폼 워드마크 폴백 커버로 강등
  // (운영자 260803 "sns 모두 적용"). 구 onerror는 img를 display:none 해 카드에 **빈 구멍**이 남았다 —
  // 인스타 최근 게시물에서 260718~260803에 걸쳐 세 번 재발한 그 사고 클래스가 SNS 카드 그리드에도
  // 그대로 잠재해 있었고(계측 0·회수 0), 여기서 같은 정본(.tcard-cov.noc.*fb 레딧 폴백)으로 닫는다.
  // data-nofb = 이 카드의 플랫폼 폴백 클래스(card()가 주입) · 없으면 종전 숨김(무회귀).
  window.tcCovFail = function (img) {
    const cv = img && img.closest('.tcard-cov, .xcard-cv');
    // 인스타 커버 1회 재시도 = **공개** 커버 경로(chThFail 13693 정본의 값 사본 — 신규 판정축 0).
    // 수집이 구운 scontent CDN URL은 서명 `oe=`(수집 +약 2일)가 지나거나 CDN이 교체되면 죽지만
    // permalink는 안 죽는다 → 그 자리에서 살아있는 커버를 다시 집어온다. 이 축이 없으면 인스타 구독은
    // 회수층이 **한 겹뿐**이라(채널요약 최근 게시물의 6중 회수와 달리) 만료 즉시 전 타일이 워드마크로 떨어진다.
    // 커버 자산이 없으면 IG가 null.jpg로 302 → 400이라 onerror 재발동 → dataset.rt가 막아 워드마크로 강등(무한 루프 0).
    const _a = img && img.closest('a');
    if (_a && !_a.dataset.rt) {
      const _mo = /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/.exec(_a.getAttribute('href') || '');
      if (_mo) { _a.dataset.rt = '1'; img.src = 'https://www.instagram.com/p/' + _mo[1] + '/media/?size=l'; return; }
    }
    const fb = cv && img.dataset.nofb;
    if (!fb) { if (img) img.style.display = 'none'; return; }
    img.remove();
    cv.classList.add('noc', fb);
  };
  // oar2(세로 원본) → 원본 커버 강등 — 뉴스·구독 정본 사다리 down()(아래 12624)의 문법 계승(신규 판정축 0).
  //   ⚠ 이 강등이 **onload에서도** 불려야 하는 이유 = ytimg의 oar 404는 본문이 1097B·120×90 회색 JPEG라
  //   브라우저가 error가 아니라 **load로 그린다**(260727 봉합 기록과 같은 사고 클래스 · 정본 사다리가
  //   naturalWidth 가드를 둔 이유가 정확히 이것). onerror만 걸면 폴백이 영원히 안 돌고 회색판이 박힌다.
  //   판정 = `naturalWidth >= naturalHeight` = 정본 그대로(회색판 120×90도·가로 영상도 한 술어로 걸린다).
  window.tcOarDown = function (img) {
    if (img.dataset.fb) { img.src = img.dataset.fb; img.removeAttribute('data-fb'); }
    else tcCovFail(img);
  };
  const card = (t, i, wd) =>   // 통일 카드(운영자 260712 #6 "쇼츠형 중구난방 해소") — 썸네일(쇼츠식 커버 크롭) + 아래에 [제목 → 조회수(vfmt 000만) · N일전] · 업로더 제거·오버레이 제목 폐지(제목/메타 항상 커버 아래 = 뉴스식 배치) · 제목 = textContent 후주입(XSS 안전) · 랭크 = 무채 필+top3 강조
    `<a class="tcard" href="${escUrl(t.url || '#')}" target="_blank" rel="noopener">` +
    `<span class="tcard-cov${wd ? ' wd' : ''}${t.cover ? '' : ' noc' + (t.nocls ? ' ' + t.nocls : '')}">${t.cover ? covImg(t.cover, t.nocls) : ''}<span class="tcard-rank${i < 3 ? ' top' : ''}">${i + 1}위</span>${chg(t)}</span>` +
    `<span class="tcard-t"></span><span class="tcard-m">${t.metricHtml != null ? t.metricHtml : (t.views > 0 ? `<i>${EYE_SVG}<span>${vfmt(t.views)}</span></i>` : '')}${relT(t) ? `<span class="tcard-ago${t._fresh24 ? ' fresh24' : ''}">${relT(t)}</span>` : ''}</span></a>`;   // 시간 = published∥time∥first_seen 공통(운영자 260712 "모든 것에") · metricHtml = 사전조립 지표(구글 검색량 등 · 미정의 = 조회수 폴백 = 쇼츠·뉴스·AI 무영향)
  // 게시물 본문 속 영상 링크 = **링크가 아니라 영상**으로(운영자 260727) — 스레드·X 글이 유튜브·틱톡·릴스를 공유하면
  //   ⓐ 커버 = 그 영상 프레임(유튜브만 썸네일 URL 산출 가능 · 틱톡·릴스는 비공개 → 커버 없이 재생 배선만)
  //   ⓑ 탭 = 스레드 글 임베드가 아니라 **그 영상 재생**(카드 `data-emb` → 클릭 핸들러가 우선 채택 · 임베드 뷰어 정본 #trviewdlg 그대로)
  const VID_RE = /https?:\/\/(?:www\.|m\.|vm\.|vt\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)[\w-]{6,}|youtu\.be\/[\w-]{6,}|tiktok\.com\/\S+|instagram\.com\/reel\/[\w-]+)\S*/i;
  const vidOf = s => { const m = String(s || '').match(VID_RE); if (!m) return ''; const u = m[0].replace(/[),.\]]+$/, ''); const yb = u.match(/youtu\.be\/([\w-]{6,})/); return yb ? 'https://www.youtube.com/watch?v=' + yb[1] : u; };   // youtu.be → watch?v= 정규화 = `trEmbed` 정본 무접촉 계승(정본에 가지 추가 대신 입력을 정규화) · 꼬리 문장부호 컷
  const vidCov = u => { const m = String(u).match(/youtube\.com\/(?:watch\?v=|shorts\/)([\w-]{6,})/); return m ? 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg' : ''; };   // 유튜브 커버 = ytimg 핫링크(레포 관용 · 16:9 hqdefault) · id = [\w-] 추출이라 주입 안전
  const xcard = (t, i, nokw) => {   // X·스레드 게시물 카드 — 전문(2줄 클램프)+대표 이미지 · 본문·계정 = textContent 후주입 · nokw = KEYWORD 줄 미출력(X 전용 · 운영자 260727)
    const vu = vidOf(t.text), cov = t.thumb || (vu ? vidCov(vu) : '');   // 수집 thumb 우선(X 대표 이미지) → 없으면 본문 영상 커버
    return `<a class="xcard${i < 3 ? ' r3' : ''}" href="${escUrl(t.url || '#')}"${vu ? ` data-emb="${escUrl(vu)}"` : ''} target="_blank" rel="noopener">` +
    `<span class="xcard-h"><span class="tcard-rank${i < 3 ? ' top' : ''}">${i + 1}위</span><b></b>${chg(t)}</span>` +
    (nokw ? '' : `<span class="xcard-kw"></span>`) + `<span class="xcard-tx s2"></span>` +
    (cov ? `<span class="xcard-cv"><img loading="lazy" referrerpolicy="no-referrer" src="${escUrl(cov)}" data-nofb="${esc(t.nocls || '')}" onerror="tcCovFail(this)" alt=""></span>` : '') +   // 대표 이미지(운영자 260726) — 수집 thumb(pbs.twimg 핫링크 · 영상 트윗 = poster 프레임) · 문법·onerror 은닉 = card() 커버 계승(깨진 링크 = 조용한 공백) · 결측 = 스팬 자체 미출력(fillT 인덱스 무관 = 후주입 대상 아님)
    `<span class="tcard-m">${t.views > 0 ? `<i class="xcard-vw">${TRENDUP_SVG}<span>${t.views >= 1e4 ? vfmt(t.views) : t.views.toLocaleString('ko')}</span></i>` : ''}${relT(t) ? `<span class="tcard-ago">${relT(t)}</span>` : ''}</span></a>`;
  };   // 좌하단 조회수(운영자 260726 "81만 이런식으로만") = 메타행 첫 칸 · 0·결측 = 미표기(met() 0지표 규약 계승)   // 260803 운영자 "차트 모양 픽토그램 옆에 조회수" — 픽토+숫자 짝 = `<i>${픽토}<span>수치</span></i>` = card()/met() 지표 정본 100% 계승(새 셀렉터·새 CSS 0 · `.tcard-m i` inline-flex·gap 3이 그대로 먹는다) · 픽토 = TRENDUP_SVG(레포 유일 '차트' 픽토 정본 = 📈 우상향 · 운영자 260714 "불꽃 어색 → 차트/우상향" · 새 path 창작 0 · 내장 .gpic-lt는 stroke=none이라 .gpic 밖에선 비표시) · 수평 = 광학-잉크(§🔒 3-4-1) = `.tcard-m svg` translateY -.8 보정이 담당 · `<i>` 안 `<span>`은 클래스 스코프 fillT('sx','.xcard-h b'/'.xcard-tx')와 무교차   // 좋아요·RT·댓글 숫자 미표기(운영자 260721 "리트윗·좋아요 숫자 빼고 시간만") — met() 제거, relT(시간)만 유지   // 시간 = 트윗 time(운영자 260712 "모든 것에") · 우측 끝(.tcard-ago ml:auto)   // kw 스팬 = 항상 출력(빈 값 = :empty 비노출 — 조건부 출력이면 fillT 인덱스 어긋남) · 본문 = 무조건 s2(2줄 상수 — 미요약 원문 폴백도 2줄 컷 · 평의회 260726 E석: 혼재 시 클램프 7/2 갈림 = 높이 불일치 부활 차단) · 요약 생성 = sns_sum.sh(소넷 5.5 high) · 승계 = sns_trends.py
  // (구 bcard 블스 게시물 카드 = 운영자 260721 "블루스카이는 실검만 사용"으로 게시물 표면 소멸 · 데이터 축 bsky[]·번역 스키마는 보존 · 재도입 = git 이력)
  // (구 V3 조회수/좋아요/댓글 정렬바 옵션 = 260720 평의회 — 카드 그리드 전 섹션 정렬바 제거로 소멸 · xgrid 게시물 정렬바는 각자 리터럴 배열)
  // 정렬 리스트(그룹 본문·대시보드 공용) — 정렬칩 기억(nm_trend_sort) 그대로
  const tkCov = tkvA.some(t => t.cover);   // 커버 = 수집기 cover 필드(260711) — 구 데이터(커버 없음)는 다음 런까지 행 폴백 · 판정 = 원본(tkvA) 기준(컷 전멸 런에도 채움 경로 유지)
  const tkL = tkCov ? tkv.map(t => { const _h = ageVerH(t); return { ...t, _fresh24: isFinite(_h) && _h < 24 }; }) : [];   // 1일 이내(tkv=24h컷) 감점 스코어순 top 20(운영자 260724 "가장 조회수 높은 순 20개" + 260726 24h 통일·해외 ×0.2) · 재정렬 안 함 = tkv가 이미 tkScore 순(구 bySort 'views'는 감점을 무시해 해외를 되올려놨다) · _fresh24 = 컷이 24h가 된 뒤엔 전건 true(마커 무해 잔존 · .tcard-ago.fresh24 음영) · 구 fill10 스테일 채움 사다리 폐지(하드컷 취지 = 창작 채움보다 조용한 공백 우선)
  // (구 REGN·byReg·REGS = 큐레이션 한국/세계 2군 분리 헬퍼 → 운영자 260724 "큐레이션 지역 구분 없이 다"로 전부 무용화·제거 · 알고리즘 콘텐츠 지역 필터는 TRREG 직접 사용)
  // 계정 다양성 재랭크(운영자 260725 "특정 계정들만으로 큐레이션 도배 · 3개 이상 분기점 넘어가면 다른사람거 나오게 조금 감산") — 뉴스 큐레이션의 source-diversity demotion 계승
  // 산식 = '순위 밀기'(지표 감산 아님): 같은 계정 앞 quota개는 제자리, 초과 회차 tier마다 push칸씩 뒤로 밀어 eff(실효순위) 재정렬 → 4번째 +3칸 · 5번째 +6칸 · 6번째 +9칸(계단)
  // ⚠ 지표 곱셈 감산(× .75^tier)을 먼저 시도했다가 폐기(260725 실측): ⓐ 값 스케일에 좌우돼 1000 vs 280(3.5배) 격차면 tier2(×.56)로도 못 뒤집혀 한 계정이 5연속 잔존 = 요청 미충족 ⓑ X가 RSS 미러 폴백을 타는 구간은 likes·rts·cmts가 전부 0이라(_x_rss) 0×w=0 = 완전 no-op(실측 260725 subs.x 17건 = economysniper0 단독). 순위 밀기는 두 함정 모두 무관 — 지표가 전멸해도, 격차가 몇 배든 동일하게 작동
  // 밀림 = 강등이지 삭제가 아니다(4번째 트윗도 5·6위로 계속 표시) · 계정이 1곳뿐이면 밀 대상이 없어 원순서 유지 = 자연 폴백 · 전원 quota 이하 = 완전 no-op
  // ⚠ 입력은 '정렬 끝난' 배열이어야 한다(쿼터를 지표 높은 순으로 소진 + i = 원순위 보존) · 절단(slice)은 반드시 이 뒤에서
  // 쿼터 자동 산출(운영자 260726 "계정은 더 늘어날 예정임") = clamp(올림(slots ÷ 계정수), 1, 3) — 상수 3이면 칸 수가 고정이라 '칸÷3'에서 다양성이 막힌다(10칸 = 3+3+3+1 → **계정을 6개든 15개든 늘려도 화면엔 4계정**) · 칸을 계정 수로 나누면 등록만 늘려도 자동 대응(상수 손보기 0) · 계정이 적으면 몫이 커져 cap 3에 걸림 = 종전과 동일(무회귀) · 하한 1 = 계정이 칸보다 많아도 최소 1개 보장
  // ⚠ 구 산식 = '순위 밀기'(eff = 원순위 + tier×3칸) — 260726 실측으로 폐기: 밀기 폭이 상수 3칸이라 한 계정이 상위를 통째 독식한 최악 케이스(= 운영자가 호소한 그 상황)에서 뒤쪽 계정의 원순위 격차를 못 넘는다 → 계정을 6·10·15개로 늘려도 top10 계정수가 3에 고정(동적 쿼터를 넣어도 동일). 스케일 실패라 수집 축(_acct_spread)과 같은 '블록 강등'(tier 1차 키)으로 통일 = 쿼터 안은 원순위 그대로, 초과분만 tier 순 뒤로(안정 정렬) · 두 축 산식 일치 = 수집·표시가 같은 방식
  const divRank = (arr, slots = 10, cap = 3) => { const uniq = new Set(arr.map(t => String(t.account || '').toLowerCase())).size, quota = Math.max(1, Math.min(cap, Math.ceil(slots / Math.max(1, uniq)))), c = {}; return arr.map((t, i) => { const a = String(t.account || '').toLowerCase(), n = c[a] = (c[a] || 0) + 1; return { t, i, tier: Math.max(0, n - quota) }; }).sort((a, b2) => a.tier - b2.tier || a.i - b2.i).map(o => o.t); };
  const sxAll = bySort(sx, 'views').slice(0, 10);   // 큐레이션 = 지역 무관 통합(운영자 260724 "큐레이션 지역 구분 없이 다") — 구독은 내가 고른 계정이라 국내/세계 토글과 무관 · 정렬 = 순수 조회수(운영자 261001 "조회수 순으로 10위까지" · 구 좋아요 고정 260726 · divRank 계정 쿼터 해제 = 10계정이면 계정당 1개로 묶여 조회수 순이 깨졌다 · 수집기 x_rank와 같은 축) · 조회수 = 수집 x_enrich/로그인 타임라인 공급 · 결측 0 = 뒤로
  const all10 = (cutA, rawA, sf) => fill10(bySort(cutA, sf), bySort(rawA, sf));   // 큐레이션(영상 카드) 지역 무관 통합 top10(운영자 260724 — 국내/세계 구분 폐지 · 구 reg10 군분리 = 구독엔 부적절[내가 고른 계정 = 지역 무관 다 보기] · 컷분 우선 → raw 채움 = 10개 보장 계승)
  const stkAll = all10(stk, stkRaw, 'views');   // 틱톡 구독 = 지역 무관 통합 top10(운영자 260724) · 조회수 정렬 · 10개 보장
  const sreAll = all10(sre, sreRaw, 'views');   // 인스타 구독 = 지역 무관 통합 top10(운영자 260724) · 조회수 정렬 · 10개 보장
  const _sytCov = v => ({ ...v, cover: String(v.thumb || '') });   // ⚠ 260804 = 구 `.replace('mqdefault','oardefault')` 제거. 세로원본 선요청은 260803부터 **covImg가 oar2로** 수행한다(v.cover는 그 강등 대상 data-fb 자리) → 여기서 미리 oardefault로 바꾸면 유일하게 살아있는 폴백 자산(mqdefault 320×180)이 **파괴**돼 「oar2 404 → oardefault 404」 2연속 회색판(1097B·120×90)으로 끝났다(260804 실측 = 구독 10칸 중 7칸). 구 사다리가 oardefault→mq로 되돌리는 유일한 코드였고 문자열이 oar2로 갈리며 그 회수가 죽은 것 = 같은 사고의 짝. (원래 취지 = 운영자 260720 "썸네일 다 16:9로" — 구 mqdefault는 쇼츠 세로 썸네일 양옆에 유튜브가 잡음 패딩 박은 320px라 16:9 프레임이 지저분 · ytn 승급 사다리(운영자 260717 Q03) 미러 · 가로 영상 = 폴백 hq720 = 16:9 원본)
  const sytAll = all10(syt, sytRaw, 'views').map(_sytCov);   // 유튜브 구독 = 지역 무관 통합 top10(운영자 260724) · cover=oar 세로원본 매핑 계승 · 조회수 정렬 · 10개 보장(매핑은 채움 뒤 = fill10 dedup 보존)
  const shL = fill10(freshFirst(shv), shvRaw).map(t => ({ ...t, cover: t.thumb, account: t.channel }));   // 쇼츠 상한 10(운영자 260717 "1~10위만") · freshFirst = 신선 먼저(운영자 260718) · 부족분 = 3일 컷 밖 후순위 채움(운영자 260721 "무조건 10개" — 컷이 12건 중 2건만 남기던 굶김 봉합)
  const aiL = fill10(freshFirst(aiv), aivRaw).map(t => ({ ...t, cover: t.thumb, account: t.channel }));   // AI영상 상한 10(운영자 260717 "10위까지만") · freshFirst + 후순위 채움(260721)
  // ── 실시간 통합 TOP 10(운영자 260712 IA 재편 — "플랫폼 무관 최고 인기 + 실검식 변동") : 구글 Trending Now 행 문법(순위·지표·변동) × 썸네일 ──
  // 랭킹 = 소스 자체 순위 정규화(1 - r/len) 주정렬 + 조회수 log 타이브레이크(플랫폼 간 절대수치 비교는 스케일 격차로 무의미 · 분신6) · url dedup · 플랫폼 캡 4(유튜브 3레인 독식 방지) · 구독 레인 = 개인 팔로우 피드(인기 아님)·AI 영상 = 검색 파생 니치 → 풀 제외
  const pool = [], seenU = new Set();
  const ggUrl = g => 'https://www.google.com/search?q=' + encodeURIComponent(g.query || '');   // 구글 실검 클릭 = 항상 구글 검색창(검색어 입력된 결과) — 기사 대신 검색(운영자 260724·260725 "구글에 검색어를 입력한 창으로" 재확인 · 표시=ko번역이나 URL은 원문 query 유지) · 정본 1곳 = 실시간 TOP(ggMap)·실검 섹션(gtSec) 공용
  const ggMap = g => ({ url: ggUrl(g), t: g.ko || g.query || '', rv: tfmt(g.traffic), th: g.picture || '', ago: relT(g), tn: parseInt(String(g.traffic || '').replace(/[^0-9]/g, ''), 10) || 0 });   // 표시=ko(번역) 우선(운영자 260719 "검색어도 번역") · 클릭 URL은 원문 query 유지   // 구글 = 검색어·검색량 tfmt 만단위(운영자 260712)·수집기 picture 커버(핫링크 · onerror 로고 폴백)·시간 = first_seen 도장
  const tkMap = v => ({ url: v.url || '', t: v.ko || v.title || ('@' + (v.account || '')), rv: v.views ? vfmt(v.views) : '', th: v.cover || '', v: v.views, pt: 1, ago: relT(v) });   // 틱톡 = published = 수집기 create_time(260712) · 구 데이터 = first_seen 폴백 · ko = 외국어 제목 한글 자동번역(tiktok_tr.py · 운영자 260719 "원어 표기 안해도됨") 우선, 없으면 원어 title
  // ── 플랫폼 간 등가 점수(운영자 260816) — 「유튜브 조회수 30만/24시간 = 구글 검색량 1만 동급」 + 「무조건은 아니고 구글은 5천부터·유튜브는 15만부터 급속도로 가점을 줘, 로그함수처럼 이징」 ──
  //   구 방식 = 레인별 순위 정규화(sc = 1 − r/L)끼리 비교 = **플랫폼마다 자[尺]가 달랐다**(마른 레인 1등이 만점을 먹던 260810 사고와 같은 병의 뿌리) → 자를 하나로 통일한다.
  //   무릎(knee) = 각 플랫폼이 "이슈"로 인정받기 시작하는 값 = 운영자 지정 2값. 두 값이 곧 등가 앵커이기도 하다 — 30만 = 유튜브 무릎 2배 · 1만 = 구글 무릎 2배 = **같은 점수**(2.00)로 자동 성립(별도 환산 상수 창작 0).
  //   곡선 = 무릎 아래는 제곱(가점 거의 없음) · 무릎 위는 로그(급속도로 붙고 그 뒤 완만) — 무릎에서 기울기가 가장 가파르고(아래쪽 2.00 → 위쪽 1.44) 위로 갈수록 완만 = 운영자 "급속도로 … 이징" 그대로. 무릎에서 두 식이 1.00으로 연속.
  //   ⚠ 유튜브 쪽 값 = 그 항목의 누적 조회수 = **곧 24시간 조회수**(레인 입장컷 TOP_MAX_H 24h라 24시간을 넘긴 영상은 애초에 풀에 없다) = 운영자 문장의 "30만/24시간"과 1:1(추정 환산·시간당 외삽 0).
  //   ⚠ 이 점수는 _pen 강등(2차 키)을 못 이긴다 = 「5천 미만은 이슈가 아니다」(GG_MIN_T · 운영자 260721) 계약 불변 = 구글 "5천부터"의 하드 축은 종전 그대로이고 이 곡선은 그 위 구간의 배분을 맡는다.
  //   되돌리기 = 정렬 키에서 eq 항 삭제(sc 순위 비교로 복귀) · 무릎 조정 = EQ_KNEE 2값.
  // ── 유튜브 조회수 → 구글 검색량 환산(운영자 260819 «10만=500, 30만=5천, 50만=3만 · 이 곡선으로 이징 · 딱딱 직선으로 끊지말고» + 2차 «각각 지점까지 직선으로 주지말고, 항상 곡선이게 · 핀 찍는 지점에서는 꺾임이 가능하게 하는 곡선») ──
  //   ⚠ 1차 판(로그-로그 단조 3차 에르미트)은 **화면에서 직선으로 보였다** — 3차 보간은 기울기를 이웃 평균으로 잡아
  //     구간 안이 거의 선형이 되고, 로그 눈금 위에서는 그 잔여 곡률이 눈에 안 남는다(운영자 첨부 실측).
  //   → 구간마다 **S자 이징**(ease-in-out)으로 눕힌다 = 운영자 3차 «이징되는 3차 이징 2번 꺾이는 곡선처럼 생겨서 중간에 핀이 들어가는 느낌».
  //     식 = t^k / (t^k + (1−t)^k) — 시작이 완만 → 중간이 가파름 → 끝이 다시 완만(그래서 「두 번 꺾여」 보인다).
  //     k = 1 이면 직선 · k 가 클수록 S 가 뚜렷해진다.
  //     앵커는 t=0·t=1 에서 그대로 지나므로 **지정 3점은 정확히 재현**되고, 사이만 S 로 휜다.
  //     핀에서 접선이 안 맞아도 된다 = 운영자가 말한 「핀 지점에서는 꺾임이 가능」 그대로.
  //   ⚠ 단조 보장 = k > 0 이면 이 식이 0→1 로 단조 증가라 구간 안에서 순위가 되돌아가지 않는다.
  //   ⚠ 앵커 밖 = 양끝 구간의 로그 기울기로 곧게 연장(외삽) — 10만 미만·50만 초과도 순서 유지.
  //   ⚠ 구글은 환산하지 않는다 = 검색량이 이미 그 자다. 이 함수는 **유튜브를 구글의 자로 옮기는 환산기**다.
  //   조정 = YT_EQ 핀 목록 + YT_EASE 세기 1값(시안 = docs/reports/260819_유튜브환산곡선_플레이그라운드.html 에서 핀을 직접 꼽고 옮긴 뒤 복사).
  //   ⚠ 핀 개수는 자유다 — 2개든 6개든 YT_EQ 를 늘리면 구간이 따라 늘고, 꼽은 자리가 곧 기울기가 바뀌는 지점이 된다(운영자 260819 «핀은 내가 중간에 알아서 꼽는거고 그 꼽는거에따라 기울기가 달라질텐데»).
  const YT_EQ = [[100000, 300], [5000000, 200000]];   // [유튜브 조회수, 같은 값으로 칠 검색량] — 운영자 260819 최종 지정
  //   «10만을 300까지만 끌어올리고, 500만을 20만으로 맞추고 모든 지점을 하나의 곡선으로 통일해줘. s자로 꺾이면 안 돼.»
  //   ⚠ 핀을 **두 끝만** 둔 게 계약이다 — 중간 핀을 더하면 그 자리에서 곡선이 한 번 더 휘어 「하나의 곡선」이 깨진다.
  //   근거(운영자) = 「100만 뷰 이상 유튜브가 그만큼 희소하니까 이징돼서 그렇게 되는 게 맞다」 = 높은 조회수만 크게 쳐주는 가속이 의도된 모양.
  //   ⚠ 지금은 이 곡선이 **순위를 안 바꾼다** — 통합 TOP 풀에서 구글이 빠져(위 260819 폐지) 남은 항목이 전부 같은 함수를 통과하고,
  //     핀이 오름차순이라 단조 변환이기 때문이다. 값이 실제로 일하는 시점 = 검색량 축(구글 등)이 이 풀에 다시 들어올 때.
  const YT_EASE = 2.20;                                  // 가속 세기(전 구간 공통) — 1 = 곧은 선 · 클수록 오른쪽이 가팔라진다 · 핀 개수는 자유(YT_EQ 를 늘리면 구간도 따라 는다)
  const _lg = v => Math.log10(Math.max(1, v || 0));
  // 곡선 = 「전체가 한 번 가속」이 기본이고, 핀을 꼽으면 그 자리를 지나도록 휜다(운영자 260819
  //   «가속형으로 근데 s자로 꺽이지말고 그냥 단순 이징으로 만드셈» · 그 앞 «점으로 움직일때마다 기울기가 달라지게 · 기울기도 곡선이여야함»).
  //   ⚠ 구간마다 이징을 따로 태우면 핀마다 기울기가 0으로 눕고 다시 서서 물결이 진다(= 기울기가 끊긴다).
  //   → 가로축을 **전체 한 번**만 가속으로 눕히고(u), 그 위에서 핀들을 잇는다. 잇는 방식 = 단조 3차 에르미트
  //     = ⓐ 핀에서 기울기가 이어지고 ⓑ 핀이 오름차순이면 순위가 안 뒤집힌다.
  //   ⚠ 시안(docs/reports/260819_유튜브환산곡선_플레이그라운드.html)과 **같은 산식이어야** 그 화면이 실물을 재현한다 = 한쪽만 고치면 시안이 거짓말을 한다.
  const ytEq = (() => {
    const X = YT_EQ.map(a => _lg(a[0])), Y = YT_EQ.map(a => _lg(a[1])), n = X.length;
    const k = YT_EASE > 0 ? YT_EASE : 1;
    const S = t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(t, k);
    const span = X[n - 1] - X[0];
    const ed = span > 0 ? (Y[n - 1] - Y[0]) / span : 0;   // 핀 바깥은 곧게 연장(전체 평균 기울기 · 끝에서 눕히면 그 밖이 전부 같은 값이 된다)
    const U = X.map(x => span > 0 ? S((x - X[0]) / span) : 0);
    const d = [], m = [];
    for (let i = 0; i < n - 1; i++) { const du = U[i + 1] - U[i]; d.push(du > 0 ? (Y[i + 1] - Y[i]) / du : 0); }
    for (let i = 0; i < n; i++) m.push(i === 0 ? d[0] : i === n - 1 ? d[n - 2] : (d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
    for (let i = 0; i < n - 1; i++) {   // Fritsch–Carlson 제한 = 값이 핀 밖으로 튀는 것 차단
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], sq = a * a + b * b;
      if (sq > 9) { const tau = 3 / Math.sqrt(sq); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i]; }
    }
    return v => {
      const x = _lg(v);
      if (x <= X[0]) return Math.pow(10, Y[0] + ed * (x - X[0]));
      if (x >= X[n - 1]) return Math.pow(10, Y[n - 1] + ed * (x - X[n - 1]));
      const u = S((x - X[0]) / span);
      let i = 0; while (i < n - 2 && u > U[i + 1]) i++;
      const h = U[i + 1] - U[i]; if (h <= 0) return Math.pow(10, Y[i]);
      const t = (u - U[i]) / h, t2 = t * t, t3 = t2 * t;
      return Math.pow(10, (2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h * m[i + 1]);
    };
  })();
  const GG_EQ_MUL = 10;   // 구글 가점 배율(운영자 260820 «지금 구글에 가점을 10배 더 주셈») — 실검이 유튜브 조회수에 밀려 TOP 리스트에서 통째로 사라지던 국면 교정(실측 260820 07:39 = TOP 3칸 전부 유튜브·구글 0칸). ⚠ 되돌리기 = 이 값 1.
  const eqScore = (mono, val) => mono === 'gg' ? Math.max(0, val || 0) * GG_EQ_MUL : ytEq(val);   // 구글 = 검색량 × 가점배율 · 그 밖(유튜브 등) = 위 곡선으로 검색량 환산 = 한 자로 비교
  const lane = (plat, mono, arr, n, f, scN, off) => { const el = arr.filter(x => { const ah = ageVerH(x); return !(isFinite(ah) && ah >= TOP_MAX_H); }), s = el.slice(off || 0, n), L = Math.min(scN || n, el.length); s.forEach((x, r0) => { const r = (off || 0) + r0; const it = f(x); if (!it.url || seenU.has(it.url)) return; seenU.add(it.url); pool.push({ plat, mono, sc: 1 - r / L, eq: eqScore(mono, mono === 'gg' ? it.tn : it.v), ht: Math.log10(1 + (it.v || 0)), _fresh: isFreshItem(x), x, ...it }); }); };   // eq = 플랫폼 간 등가 점수(위 EQ_KNEE 블록 = 운영자 260816) — 구글은 검색량·나머지는 24시간 조회수를 각자 무릎으로 나눠 같은 자로 잰다 · sc는 등가 동점 시 소스순위 보조키로 잔존   // scN = 혼합 TOP 점수 분모 고정(미지정 = 통과분 길이) · off = 시작 랭크(확장 레인이 코어 뒤에 이어붙되 sc는 실순위 유지) — 점수 정규화 = 기존 캡 유지(운영자 260717 "구글 11,12 쭉") · 24h 입장컷 = slice **앞** 선필터(운영자 260726 "실시간 top10 4개까지밖에 안받아와져" 해소 — 구 순서 = 소스 상위 n 절단 뒤 컷이라 상위권이 늙은 소스[유튜브 차트 top5·틱톡 KR 전원 24h+ 실측 260726]는 레인 통째 0명 입장 = TOP 굶주림 → 컷 통과분에서 상위 n 선발 = 신선 후보 항상 입장 · sc 순위 = 통과분 기준 자연 압축)
  // 코어 레인(통합 TOP 급원 = 플랫폼당 원래 캡) — 호출 순서 = URL dedup 우선순위: 경쟁 항목(sc>0)이 확장분보다 먼저 URL 선점(평의회 260717 크로스레인 dedup 반례 봉인 = 통합 TOP 구조적 불변)
  // 구글 코어 1~10 — 260819 오전에 «구글은 뺌»으로 잠시 내렸다가 같은 날 «유튜브랑 구글 검색어 둘다 적용할거고»로 복귀.
  //   ⚠ 구글이 이 풀에 있을 때만 환산 곡선(ytEq)이 실제로 일을 한다 = 조회수와 검색량을 한 자로 세우는 게 그 곡선의 존재 이유다.
  lane('구글', 'gg', gt, 10, ggMap, 10);   // scN=10 = 혼합 TOP 점수 분모(#2454 "10으로 맞춰줘" 캡10 계승)
  // ── 유튜브 후보 = **우리가 모은 공식 섹션 전부를 합쳐 조회수로 종합**(운영자 260819 «실시간 top이 유튜브 12시간 지나도 10만도 안넘는게 top에 위치하니까 너무 신뢰도가 떨어지는데 · 유튜브가 주는거 말고 지금 모든 유튜브 수집 섹션에서 종합 후로») ──
  //   ⚠ 구판이 왜 신뢰를 깎았나 = **후보 선발을 유튜브 차트 순서에 맡겼다.** 레인마다 「그 차트 상위 5」만 후보로 올렸고
  //     레인 점수(sc = 1 − r/L)는 레인 안 등수라, 뉴스 레인 1위가 인기 레인 1위와 **같은 만점**을 받았다.
  //     실측 260819 06:36 = 뉴스 레인 후보에 「4.9만회·12.6h」·「9.2만회·20.7h」가 들어오는데,
  //     정작 「메이드 인 코리아 30.8만회·21.6h」는 인기 차트 6번째라 **후보조차 못 됐다** = 조회수 6배 차이가 뒤집힌다.
  //   처방 = 세 레인을 한 풀로 합치고(id·url dedup) **조회수 내림차순**으로 세운 뒤 상위를 후보로 올린다
  //     → 레인 등수가 사라지므로 sc 도 「전체 조회수 등수」가 되고, 등가 점수(eq)와 방향이 같아진다.
  //   ⚠ 합치는 대상 = **공식 차트 계열만**(인기 mostPopular · 뉴스 category25 · 주제별 videoCategoryId · 맞춤 추천).
  //     쇼츠·AI 영상·구독은 260810·260724 운영자 결정으로 이미 풀 밖이다(«공식 아니면 큐레이션임 없애셈» —
  //     쇼츠 = InnerTube 검색 파생 · AI = 검색 파생 니치 · 구독 = 개인 팔로우 피드). 그 계약은 그대로 둔다.
  //   ⚠ 게임 배제(260818 ytNoGame)는 주제별 합류분에도 그대로 적용 = 새 구멍 0.
  //   ⚠ 24h 입장컷·플랫폼 캡 4 무접촉 = 유튜브가 TOP 을 독식하지 않는다.
  //   되돌리기 = 이 블록을 구판 3줄(lane yt/ytn/ytr 각 5)로.
  const YT_ALL_N = 15;   // 종합 후보 수 = 구판 3레인 × 5 와 같은 총량(창작 0)
  // ⚠ 12시간 컷(운영자 260819 «12시간 이내로만 하자 · 수집하는 유튜브 콘텐츠 중에 12시간 이내를 실시간 top에 나열»)
  //   = 통합 TOP 입장컷(24h)보다 유튜브만 더 좁힌다. 구글 실검은 4시간 창(운영자 260819 trending?hours=4)이라 축이 다르다.
  const ytAll = (() => {
    const seen = new Set(), out = [];
    // 구독 채널(설정 ▸ 구독 채널에서 운영자가 고른 유튜브 계정)도 후보다(운영자 260819 «구독 도 포함되는거야? · 설정에서 내가 선택하는거»).
    //   ⚠ 구독 항목은 조회수가 **문자열**로 온다(예 "3495648") — 아래 매핑에서 숫자로 바꾼다(`ht` 계산이 1 + 값 이라 문자열이면 이어붙어 자릿수가 통째로 어긋난다).
    const ytSub = ytNoGame((((d.subs || {}).youtube) || []).filter(z => z && typeof z === 'object'));
    for (const x of [...yt, ...ytn, ...ytr, ...ytSub, ...ytNoGame(Object.values(d.youtube_cats || {}).flat().filter(z => z && typeof z === 'object'))]) {
      const k = (x && (x.id || x.url)) || '';
      if (!k || seen.has(k)) continue;
      const h = ageVerH(x);
      if (isFinite(h) && h >= TOP_MAX_H) continue;   // 24h 넘은 유튜브는 TOP 후보에서 제외(운영자 260820 «24시간까지 넓히고») — ⚠ 12h(FRESH_MAX_H)는 **후보 자격이 아니라 정렬 우대**로 남는다(_fresh → effF 1차 키) = 「12시간 이내를 위에 나열」(260819)과 「10칸을 채운다」(260820)가 둘 다 성립. 실측 260820 07:39 = 12h 후보 4건 → 24h 후보 25건(그 사이 372만·131만·109만뷰가 통째로 빠져 있었다)
      seen.add(k); out.push(x);
    }
    return out.sort((a, b2) => (b2.views || 0) - (a.views || 0));
  })();
  lane('유튜브', 'yt', ytAll, YT_ALL_N, v => { const nv = +v.views || 0; return { url: v.url || '', t: v.title || '', rv: nv ? vfmt(nv) : '', th: v.thumb || '', v: nv, ago: relT(v) }; });   // 조회수 숫자화 = 구독 채널분이 문자열로 오는 축 흡수(등가·조회수 정렬 둘 다 숫자여야 한다)
  // (구 맞춤 추천 단독 레인 = 260819 위 ytAll 종합에 흡수 · 운영자 260816 편입 계약은 그대로 = ytr 이 합집합에 들어간다)
  // (구 쇼츠 레인 `lane('유튜브','yt',shv,12,…)` = 260810 폐지. 운영자 "shv 없애" — 사유 2축: ⓐ **출처 자격** = 쇼츠는 InnerTube 키워드 검색 파생(수집 = sns_trends.py ⑤ · 무키 웹 내부 API)이라 유튜브 공식 mostPopular 차트가 아니다 → 260724에 이미 같은 사유로 대분류에서 큐레이션(gCUR)으로 강등해놓고 통합 TOP 풀에서만 yt·ytn 공식 2레인과 동급 sc를 받고 있었다(자격 이중장부) ⓑ **마른 레인 만점** = sc = 1 − r/L 이라 L(24h 통과분)이 1이면 그 1건이 sc 1.00 만점 → 실측 260810 08:05 = 쇼츠 50건 중 24h 통과 **1건**이 만점을 받아 조회수 2.3만으로 **통합 1위**, 유튜브 공식 인기 1위(22만뷰)는 8위로 밀렸다. 소스가 말라죽을수록 그 소스 1등이 통합 1위가 되는 역설. shv 변수 자체는 유지 = '유튜브 - 쇼츠' 큐레이션 섹션(shL)이 계속 쓴다 = 표시 무손실, TOP 풀 자격만 회수)
  // (구 틱톡 코어 레인 `lane('틱톡','tk',tkv,TK_TOP,tkMap,10)` = 260810 폐지. 운영자 "공식 아니면 큐레이션임 없애셈" — 사유 = **출처 자격**: 창구가 `tikwm.com/api/feed/list?region=KR`(무키 3자 API)의 **추천[for-you] 피드 표본**이고 틱톡엔 공개 최다조회순 차트 API 자체가 없다(수집 = sns_trends.py ③ 493행). 260727에 **같은 사유로 대분류를 이미 큐레이션[gCUR]으로 강등**해놓고(13415행 주석 "틱톡은 공개 최다조회순 API 부재 = tikwm for-you 표본이라 진짜 인기 아님") 통합 TOP 풀에서만 유튜브 공식 레인과 동급 sc를 받고 있었다 = 쇼츠(shv)와 **같은 병의 형제**인 자격 이중장부. 실측 260810 = 조회수 1.6만 for-you 표본이 유튜브 공식 23만보다 위에 섰다)
  // 확장 레인(코어 전원 뒤 = 확장 항목이 경쟁 레인 URL 선점 불가) — 목적 2축: ① TOP 입장 후보 심화(구글 11~25 속 5천+ 진짜 이슈[실측 압록강 5만·11위]가 저검색 상위를 제치고 입장 + 강등·24h컷 결원 채움) ② 스택 11위+ 표시 심화(_tsSeqX 잔여 풀 확장 — 260721 10 봉인 → 260728 복원) · sc≤0 = 자연 침강이라 정상분 위협 없음
  // (구 구글 확장 레인 `lane('구글','gg',gt,25,ggMap,10,10)` = 260810 폐지. 운영자 "트렌드에서 10위까지밖에 제안을 안 해? 그러면 11위부터는 날리셈" — 사유 = **출처 자격**: gt 25건은 두 창구 합성이고 11~25위 구간이 공식이 아니다(수집 = sns_trends.py merge_gtrends 351행 · 1~10위 = `trends.google.com/trending/rss?geo=KR` 공식 RSS[10건 상한] · 11~keep = `_/TrendsUi/data/batchexecute` **비공식 내부 API** = 그 함수 독스트링 자신이 "⚠ 비공식 API = 예고 없는 변동 리스크"라 선언). 실측 260810 = TOP 10에 든 구글 3칸이 전부 레인순위 17·18·19 = 비공식 꼬리였고, 검색어엔 published가 없어 24h 컷·신선 판정을 **구조적으로 면제**받아(ageVerH=NaN fail-soft) 1차 정렬키에서 무조건 이겨 조회수 101만 콘텐츠 위에 섰다 — 주석이 전제한 "sc≤0 = 자연 침강"이 신선 티어 앞키에 막혀 성립하지 않았다. ⚠ 썸네일 스택은 무접촉(운영자 "그 아래 썸네일로 나오는 부분을 날리라는 게 아니야") = `_tsSeqX`·`xRest`·#tstk 로직 한 줄도 안 건드렸다. 스택 길이는 잔여 풀이 줄어든 만큼 자연 감소하는데 그게 이 조치의 목적(비공식 꼬리 회수)이고, 스택 자체·다른 플랫폼 항목은 전량 보존)
  // (구 틱톡 확장 레인 = 260810 동반 폐지 — 코어가 위에서 폐지됐는데 확장분만 남으면 「비공식 for-you 표본을 11위부터 도로 들이는」 역주행이 된다. 원래도 TK_TOP 10 절단으로 초과분 상시 0 = 무연산이었다)
  const GG_MIN_T = 5000;   // 구글 이슈 최소 검색량(운영자 260721 "5천 검색량 아니면 이슈 아니야 · 가점 내리셈") — 미만 = _pen 강등 티어(신선 우대 회수 + 전 정상분[확장 5천+ 포함] 아래) · 항목 제거는 안 함(하위 채움용 잔존 = 빈칸 회피) · 구 sc−1 방식 = 확장 레인 자연 음수 sc와 겹쳐 구글 탭서 저검색이 5만 이슈 위에 남던 결함(평의회 260721 B·P1) → 전용 티어로 교체
  pool.forEach(p2 => { if (p2.mono === 'gg' && (p2.tn || 0) * GG_EQ_MUL < GG_MIN_T) p2._pen = 1; });   // ⚠ 가점 배율(GG_EQ_MUL)을 이 문턱 판정에도 **같이** 적용한다(운영자 260820 «지금 구글에 가점을 10배 더 주셈») — 배율을 랭킹 점수(eq)에만 주면 구글은 여전히 TOP 0칸이다: `_pen` 은 정렬 2차 키이고 eq 는 3차 키라 **가점이 아무리 커도 강등을 못 이긴다**(실측 260820 07:39 = 배율만 준 판에서 TOP 10칸이 전부 유튜브·구글 0칸 = 운영자 «아니 구글이 없잖아!» 그대로 재현). 한 상수 = 한 자 = 「구글 값을 10배로 본다」가 두 자리에서 같은 뜻을 갖는다. ⚠ 실질 = 원 검색량 500 이상이 TOP 후보(260721 «5천 아니면 이슈 아니야» 의 기준선이 그 배율만큼 내려간다 = 되돌리기 = GG_EQ_MUL 1)
  const effF = z => (z._fresh && !z._pen) ? 1 : 0;   // 정렬용 유효 신선 — _pen = 가점만 회수(표시 나이 흐림 .old는 실나이 _fresh 그대로 = 1시간 전이 흐려지는 왜곡 차단)
  pool.sort((a, b2) => (effF(b2) - effF(a)) || ((a._pen || 0) - (b2._pen || 0)) || ((b2.eq || 0) - (a.eq || 0)) || (b2.sc - a.sc) || (b2.ht - a.ht));   // 신선분 우선(운영자 260718 "신선 없으면 차순위 top 위로") → 강등 티어(_pen = 전 정상분 아래 · 강등끼리는 소스순위 유지) → 소스순위(sc) → 조회수(ht) · 24h+ = 입장 컷(TOP_MAX_H) · 24h 내 스테일 = 침몰만(컷 안에서 빈칸 채움 유지)
  const top = [], pcap = {};
  // TOP 진입 자격 = 강등분(_pen) 배제(운영자 260810 "ㅇㅋ" 승인) — 260721 원설계는 「항목 제거는 안 함(하위 채움용 잔존 = 빈칸 회피)」였고 그게 옳았다: 그땐 **구글 확장 레인(11~25위)이 5천+ 이슈를 데려와** 강등분이 실제로 하위에만 앉았기 때문. 그 레인을 같은 날 폐지하자 풀이 41→17건으로 줄었고, 2차 채움(캡 해제)이 **강등분을 5~8위로 끌어올렸다**(실측 260810 = 검색량 200·200·1000·200이 유튜브 공식 40만 아래 4칸 점거) = 「5천 미만은 이슈가 아니다」 계약이 채움 경로에서 무력화된 상태. → 두 루프 공통으로 강등분을 걸러 **TOP은 정상분만**으로 채운다. 10칸이 안 차면 종전대로 조용한 공백(`kobL` "10개 안 나와도 괜찮아" 선례 · 빈칸 회피보다 「빈칸이 나을 만큼 약한 신호」가 우선). ⚠ 강등분을 **풀에서 지우지는 않는다** = `pool` 원본 불변이라 `xRest`·`_tsSeqX` 썸네일 스택엔 그대로 남는다(운영자 260810 "썸네일 부분을 날리라는 게 아니야" 계약 준수 = 260721 「하위 채움용 잔존」 취지는 스택이 흡수)
  const topOk = pool.filter(p2 => !p2._pen);
  for (const it of topOk) { if ((pcap[it.plat] || 0) >= 4) continue; pcap[it.plat] = (pcap[it.plat] || 0) + 1; top.push(it); if (top.length >= 10) break; }
  if (top.length < 10) for (const it of topOk) { if (top.length >= 10) break; if (!top.includes(it)) top.push(it); }   // 2차 채움 = 캡 해제(운영자 260726 "실시간 top10 4개" 해소 — 24h컷 생존 플랫폼이 사실상 구글뿐인 국면이면 캡4에서 TOP이 4개로 굶주림) · 1차 캡4 = 독식 방지 원취지 그대로, 부족분만 풀 정렬 순서대로 추가 · 풀<10 = 있는 만큼(종전 조용한 공백)
  // ── 플랫폼 그룹 본문(대분류 = 플랫폼 · 중분류 = 소머리 details 그대로 = 접기 키·기억 보존) — 구 소스칩(.trend-srcbar)·vis() 폐지 = 점프는 좌측 레일 이관 ──
  let gGG = '', gYT = '', gTK = '', gCUR = '';   // gCUR = 큐레이션 게시물 대분류(운영자 260723 — 구독 전 플랫폼 집약 · 구 gIG/gX/gTH 흡수)
  // (구글 실검 클릭 URL = 위 ggUrl 정본 1곳 — 실시간 TOP(ggMap)과 공용 · 재선언 금지)
  const gtR = freshFirst(gt).slice(0, 10).map((g, i) => [g, i]);   // [항목, 원순위 index] · 1~10위(운영자 260718 "이미지 그냥 빼고 1~10위만" — 텍스트 행) · freshFirst = 신선 먼저(운영자 260718 "다른 화면에도")
  const _cnNorm = s => String(s || '').toLowerCase().replace(/\s+/g, '');   // 실검 키워드 정규화(공백붕괴·소문자) — "제이슨 데이"↔"제이슨데이"·라틴 대소문자 일치
  const _cnSig = new Set(sig.map(s => _cnNorm(s.query)).filter(Boolean));   // 시그널 실검 키워드 집합
  const _cnGt = new Set(gt.map(g => _cnNorm(g.query)).filter(Boolean));     // 구글 실검 키워드 집합
  // 나무위키 실시간 검색어(운영자 260929 «블루스카이처럼 순위 · 겹치면 노란색 · 3군데 겹치면 파란색») — 공급 = 폰 우선 · 러너(셀프 호스트 PC) 폴백(sns_trends.py namu_rank · 클라우드 IP 403)
  //   폰이 멈추면 순위가 낡는다 → namu_updated 180분 초과(폰 하트비트 phoneStale 임계 동률) = 「폰 점검 필요」 배지 + 교차합의 집합에서 제외(낡은 말로 색칠 금지)
  const nmuStale = !!(nmuL.length && !(_isoMs(d.namu_updated) > Date.now() - 180 * 60000));   // 읽지 못한 시각(NaN) = 낡음으로(신선 오판 금지 · 평의회260929 #4)
  const _cnNm = new Set(nmuStale ? [] : nmuL.map(g => _cnNorm(g.query)).filter(Boolean));   // 나무위키 검색어 집합(교차합의 3번째 소스)
  // 교차합의 색 = 구글·시그널·나무위키 중 몇 곳에 떴나 — 2곳 = 골드레몬(cnhot · 종전 구글∩시그널 규칙 그대로) · 3곳 = 스카이시안(cnhot cn3)
  //   **자기 집합 포함 셈**이라 2곳 이상 = 반드시 다른 열 1곳 이상과 겹친 것(자기 집합만 대조하던 전 행 오점화[T10]와 다른 축) · X·블스 = 팬덤이라 합의 제외 유지
  const _cnCls = t => { const n = _cnNorm(t); if (!n) return undefined; const c = (_cnGt.has(n) ? 1 : 0) + (_cnSig.has(n) ? 1 : 0) + (_cnNm.has(n) ? 1 : 0); return c >= 3 ? 'cnhot cn3' : c >= 2 ? 'cnhot' : undefined; };
  const _cnHotGt = t => _cnCls(t);    // 구글 행 색(구 시그널 대조 = 2곳 규칙에 흡수 · 호출부 무변경)
  const _cnHotSig = t => _cnCls(t);   // 시그널 행 색(평의회 260723 #9 원 규칙 = 2곳 = 골드레몬 그대로)
  const rtBase = '';   // 소분류 "· HH:MM 기준" 캡션 폐지(운영자 260720 — 수집 시각 = 좌상단 #vhTime 1회로 집약 · 유튜브·틱톡·구글 실검 소분류 반복 시각 제거) · 금융 소분류 시각도 동일 폐지(운영자 260721 "금융 소분류 옆에 시간 다 빼주고" — 구 finBaseTxt 캡션 제거 · 등락 의미 = 전일 종가 대비 그대로·% 색이 전달) · tm은 #vhTime 전용 잔존
  const brow = (i, url, right, cls, rcls) => `<a class="trend-row" href="${escUrl(url)}" target="_blank" rel="noopener"><span class="trend-rank">${i + 1}</span><span class="trend-q${cls ? ' ' + cls : ''}"></span>${right ? `<span class="trend-traffic${rcls ? ' ' + rcls : ''}">${right}</span>` : ''}</a>`;   // 순위+검색어만(운영자 260718 "순위 빼고 다 없애자") · right = 부가 수치 옵션(박스오피스 관람객수 — 운영자 260720 · 미지정 = 구글·시그널 실검처럼 순위+제목만) · rcls = 우측 수치 셀 색 클래스(박스오피스 top3 관객수 히트 = bo-w/y/t · 운영자 260723 · 미지정 = 종전 --mut) — 변동배지·시각 열 제거 · .trend-row/-rank/-q/-traffic 계승 = 임베드 시퀀스·fillT 무영향 · 신규 컴포넌트 0
  const mag = n => n > 0 ? (n >= 1e4 ? vfmt(n) : n.toLocaleString()) : '';   // 크기 숫자 = 만단위(≥1만)∥천단위 콤마(<1만) — 구글 검색량·블스 포스트 공용(운영자 260723 "구글·블스 크기 숫자" · vfmt 단독은 <1만서 "0.17만" 깨짐 봉합)
  const gTraf = t => { const n = parseInt(String(t || '').replace(/[^0-9]/g, ''), 10); return n > 0 ? mag(n) + '+' : ''; };   // 구글 검색량 버킷 문자열 → "500+"·"5,000+"·"2만+"(플랫폼 내부 크기 · 크로스플랫폼 비교 아님)
  const gtSec = gt.length ? sec('gt', '구글 실시간 검색어', rtBase, Math.min(gt.length, 10), gtR.map(z => brow(z[1], ggUrl(z[0]), gTraf(z[0].traffic), _cnHotGt(z[0].query))).join('')) : '';   // 검색량 재표시(운영자 260723 — 260718 미표기 되돌림 · 우측 = gTraf 만단위∥콤마 · 시그널·X는 원천 볼륨 없어 순위만)
  // (구 mkyt·ytZ·mktk·tkZ = tpg 레일 매핑/인터리브 잔재(호출 0) → 260720 평의회 zig·tpc와 동반 삭제 · ytnL만 생존)
  const ytnL = fill10(freshFirst(ytn), ytnRaw).map(v => ({ ...v, cover: String(v.thumb || ''), account: v.channel }));   // ⚠ 260804 = 구 `.replace('mqdefault','oardefault')` 제거(_sytCov 12414와 같은 사고·같은 봉합 — 세로원본 선요청은 covImg의 oar2가 수행 · 여기 cover는 그 **강등 대상**이라 유효 자산 mqdefault로 둬야 회수가 산다). (원래 취지 = 뉴스 = 쇼츠 매핑(shL 9501) 미러 · 커버 = 세로원본(oardefault 720~1080급) 선요청(운영자 260717 Q03 승인 — mq 320은 3/4 크롭 시 중앙 134px 2.3배 업스케일로 흐릿·양옆 블러 잔재) · 가로 영상(oar 404) 폴백 = fillT 뒤 승급 패스
  const ytGrid = bySort(cutH(ytRaw, 24), 'views').slice(0, 10).map(v => ({ ...v, cover: v.thumb }));   // 유튜브 인기 = 24h 이내만 + 조회수 내림차순(운영자 260726 "24시간 지난 것은 안나오게 · 조회수가 기준이면 동물이 1위여야" — 구 표시순 = mostPopular 차트 순서 그대로[상승속도·최신성 가중]라 58만이 352만 위에 서던 것 교정) · 컷 경계 = TOP 입장컷 TOP_MAX_H(24h · 260721) 동축 · 미상(NaN) = fail-soft 통과(cutH 공통) · 구 freshFirst(12h 부양)·fill10(24h 밖 스테일 채움 10개 보장 260721) = 조회수 순서 왜곡·24h 컷 위반이라 이 섹션 한정 폐지 → 부족분 = 조용한 공백(kobL "10개 안 나와도 괜찮아" 선례)
  if (ytGrid.length) gYT += sec('yt', '유튜브', rtBase, ytGrid.length, '<div class="trend-grid wd">' + ytGrid.map((t, i) => card({ ...t, nocls: 'ytfb' }, i, 1)).join('') + '</div>');   // 출력형식 통일(운영자 260717) — 구 tpg 1:1 레일 → AI영상식 16:9 큰 2열 그리드(유튜브 가로영상 = wd) · ytimg 핫링크 자유(평의회5)
  // 뉴스·쇼츠·AI 영상 = 큐레이션(검색·카테고리 파생 = 유튜브 mostPopular 전체 인기 차트 아님) → 큐레이션 게시물(gCUR)로 이관(운영자 260724 "유튜브 기본 인기 게시물 말고 큐레이션된 부분[뉴스·쇼츠·AI] 모두 큐레이션 영역으로"). 뉴스 = mostPopular category25 뉴스·정치 필터(온-미션 카테고리 선정) · 쇼츠·AI = InnerTube 키워드 검색 파생. 인기(mostPopular 전체)만 유튜브 대분류(gYT) 잔존. gCUR 순서 = 뉴스·쇼츠·AI(키워드/카테고리) → 유튜브·틱톡·인스타·X·스레드(구독)
  // ── 유튜브 주제별 인기(운영자 260731 "유튜브 주제별로 24시간 내 상위 5개까지 · 모든 주제 · 반려동물·노하우스타일·교육 제외") ──
  //   축 = mostPopular 차트를 videoCategoryId로 좁힌 것(채널 목록 아님) · 수집 = scraper youtube_cats{"25":[…]} · 표시 순서 = YT_CATS 배열 순서(설정 재배열분이 오면 그 순서가 정본 = 후속 UI)
  //   컷·정렬 = 유튜브 인기 그리드(ytGrid 11504) **문법 그대로 계승** — cutH 24h → 조회수 내림차순 → slice(상한만 10→5) · 부족분 = 조용한 공백(채움 금지 = 24h 컷 취지 보존)
  //   카드 = .trend-grid.wd + card(,,1) 16:9(형제 소분류 전원 동일) · 신규 CSS·신규 컴포넌트 0
  const YTC_N = 10;   // 주제당 상한 5→10(운영자 260803 "10개를 안정적으로 받아올 수 있는 수준으로 가져오고 그에 따라 24시간을 걸어서 나열") — 형제 소분류 전원(쇼츠·AI영상·구독 4종 = fill10/all10/slice(0,10))이 이미 10인데 주제 축만 5라 홀로 짧던 것 정합. 상한 5는 후보 풀 10건 시절(24h 통과 0~1건)의 값이라 실질 제약이 아니었으나, 수집 50 확대 후 실측(260803 11:10)에서 게임 27건·뉴스 9건이 5장에 잘리며 병목으로 전환 — 컷 통과분이 상한 미만이면 종전대로 조용한 공백(채움 금지 = 컷 취지 보존)이라 스크롤 증가는 신선분이 실재하는 주제에서만 발생
  //   주제 축 나이 컷 24h→72h(운영자 260803 승인 "72시간으로 할게") — 근본원인 = mostPopular가 **누적 인기 차트**라 신규가 차트에
  //   진입할 때쯤 이미 24h를 넘긴다("차트에 진입하는 순간" 운영자 지적). 수집은 이미 API 상한(50)이라 남은 손잡이가 컷뿐이었다.
  //   실측 260803 11:10 = 주제별 회전율이 3배 이상 갈린다(중앙 나이: 게임 21h · 뉴스 74h · 엔터 86h · 스포츠 111h · 음악 162h)
  //   → 24h 단일 컷은 게임만 통과시키고 나머지를 굶겼다(엔터 50건 중 1건 · 2위가 25h로 1시간 차 탈락 · 조회수 104만).
  //   72h 적용 시 엔터 1→10 · 스포츠 1→10 · 코미디 1→10 · 영화 0→10 · 자동차 1→10 · 음악 0→6(게임은 상한 10에 걸려 불변).
  //   선례 = 소스 회전율별 컷 차등이 이 레포 기존 문법: 쇼츠 3일(cut3d)·AI영상 7일(cutH 168 · 260721 "10개까지 안나오고 짤림"
  //   = 니치 소스 3일 창 2건 고사 실측) · 레딧 per 8→12(260727 "10개까지 뜨게"). 상수화 = TK_CUT_H(18) 문법 계승.
  //   유튜브 인기(ytGrid 11976)의 24h는 **무접촉** — 그 축은 TOP 입장컷 TOP_MAX_H와 동축이라 별 계약(260726).
  const YTC_CUT_H = 72;
  const ytcRaw = d.youtube_cats || {};
  const ytcL = YT_CATS.map(c => [c[0], c[1], bySort(cutH(ytcRaw[String(c[0])] || [], YTC_CUT_H), 'views').slice(0, YTC_N).map(v => ({ ...v, cover: v.thumb }))]).filter(z => z[2].length);
  // (구 '유튜브 - 노뮤트 픽' = 주제들을 섞어 재랭킹한 통합 블릿 → 260731 폐지. 운영자 "주제별로 조회수가 많이 차이날거같아서 개별로 봐야할듯" —
  //  실측이 근거: 같은 런에서 뉴스 89.7만·스포츠 46.1만인데 게임은 최고 39.1만이라, 순위 정규화로 섞으면 장르 스케일 차이가 통째로 뭉개진다.
  //  또 그 재랭킹 결과는 유튜브 인기 TOP 10과 2/10건만 겹치되 겹치는 건 전부 게임 = 정보 증분이 주제 블릿 자체보다 작았다.
  //  주제별 블릿(아래 ytcL 루프)이 정본 · 되돌림 = git 이력)
  ytcL.forEach(z => { gCUR += sec('ytc-' + z[0], '유튜브 - ' + z[1], rtBase, z[2].length, '<div class="trend-grid wd">' + z[2].map((t, i) => card({ ...t, nocls: 'ytfb' }, i, 1)).join('') + '</div>'); });
  // 폴백 = youtube_cats 미도착(구 산출·무키)일 때만 구 단일 '유튜브 - 뉴스' 섹션 유지(화면 공백 회귀 차단 · 수집이 새 키를 채우면 이 줄은 미도달)
  if (!ytcL.length && ytnL.length) gCUR += sec('ytn', '유튜브 - 뉴스', rtBase, ytnL.length, '<div class="trend-grid wd">' + ytnL.map((t, i) => card({ ...t, nocls: 'ytfb' }, i, 1)).join('') + '</div>');   // 뉴스 = AI영상 카드 통일(운영자 260717 "뉴스·쇼츠 2블릿 AI영상처럼" — 뉴스 영상 원본 16:9 → wd 가로 카드로 자연 비율 노출[구 3/4 크롭 폐기] · card(,,1)=.tcard-cov.wd) · 뉴스 소재 훑기 온-미션(평의회10 결판)
  // 유튜브 - 쇼츠 = 화면 노출 폐지(운영자 260819 · 레딧과 같은 지시). 수집·감시 원문은 그대로(위 레딧 주석과 같은 이유).
  //   되돌리기 = 아래 한 줄의 주석만 풀면 종전 복귀.
  //  if (shL.length) gCUR += sec('sh', '유튜브 - 쇼츠', rtBase, shL.length, '<div class="trend-grid wd">' + shL.map((t, i) => card({ ...t, nocls: 'ytfb' }, i, 1)).join('') + '</div>');   // 쇼츠 = AI영상 카드 통일(운영자 260717 "뉴스·쇼츠 2블릿 AI영상처럼" — wd 가로 16:9 · 상한 10 = shL slice) · 뉴스와 동일 스타일 계승
  // (구 '유튜브 - AI 영상' 섹션 = 260818 미출력. 운영자 "유튜브 - ai영상 안뜨게 해줘" — 260804 음악·자동차 숨김과 같은 축[접는 게 아니라 섹션 자체 미출력].
  //  ⚠ 수집(sns_trends.py AI_QUERIES)·데이터(aivid)·설정 키워드 칩은 **그대로 둔다** — 키워드 알림 감시가 그 배열을 원료로 쓴다(그 자리를 끊으면 'AI 영상' 키워드 감시가 조용히 죽는다).
  //  되돌림 = 아래 한 줄의 주석 해제)
  // if (aiL.length) gCUR += sec('ai', '유튜브 - AI 영상', rtBase, aiL.length, '<div class="trend-grid wd">' + aiL.map((t, i) => card({ ...t, nocls: 'ytfb' }, i, 1)).join('') + '</div>');
  if (_subOff.has('youtube')) { /* 구독 끔 = 숨김 */ }
  else if (sytAll.length) gCUR += sec('syt', '유튜브 - 구독', subStaleUnit('youtube', sytAll), sytAll.length, '<div class="trend-grid wd">' + sytAll.map((t, i) => card({ ...t, nocls: 'ytfb' }, i, 1)).join('') + '</div>');   // 유튜브 구독 = 큐레이션 게시물 소분류(운영자 260723 · 260724 지역 무관 단일 블록) · 16:9 wd 카드 계승 · 빈 = 미표기(조용한 공백)
  else gCUR += subEmptySec('syt', '유튜브 - 구독', 'youtube');   // 0건이어도 등록 계정이 있으면(stale) 사유를 남긴다(운영자 260727)
  // 틱톡 인기(260726 통합 랭킹 = 18h·10만↑·해외 ×0.2 감점 = tkv/TK_CUT_H 로직 그대로 계승) → 큐레이션 게시물(gCUR) 이관(운영자 260727 "다 큐레이션으로 보내줘" — 틱톡은 공개 최다조회순 API 부재 = tikwm for-you 표본이라 진짜 인기 아님 · 대분류만 이동, 랭킹 로직 무접촉) · 라벨 '틱톡 인기'로 구독 '틱톡'(stk)과 구분 · gTK 대분류 소멸(→ GRPS 자동 제외)
  if (tkL.length) gCUR += sec('tk', '틱톡 - 추천', rtBase, tkL.length, '<div class="trend-grid wd">' + tkL.map((t, i) => card({ ...t, cover: t.cover, nocls: 'tkfb' }, i, 1)).join('') + '</div>');   // 16:9 wd 그리드(AI영상 계승) · 정렬바 0(카드 그리드 문법 · 게시물 xgrid만 정렬바)
  else if (tkv.length) gCUR += sec('tk', '틱톡 - 추천', rtBase, tkv.length, tkv.map((t, i) =>
    row(i, t.url || '#', t.views ? vfmt(t.views) : '', t, '')).join(''));
  else if (tk.length) gCUR += sec('tk', '틱톡 - 해시태그', '· 인기', Math.min(tk.length, 10), '<div class="trend-tags">' + tk.slice(0, 10).map(() => '<span class="trend-tag"></span>').join('') + '</div>');
  if (_subOff.has('tiktok')) { /* 구독 끔 = 숨김 */ }
  else if (stkAll.length) gCUR += sec('stk', '틱톡 - 구독', subStaleUnit('tiktok', stkAll), stkAll.length, '<div class="trend-grid wd">' + stkAll.map((t, i) => card({ ...t, nocls: 'tkfb' }, i, 1)).join('') + '</div>');   // 틱톡 구독 = 큐레이션 게시물 소분류(운영자 260723 · 260724 지역 무관 단일 블록) · 16:9 wd 통일 · 정렬바 없음(stk 기본 조회수순)
  else gCUR += subEmptySec('stk', '틱톡 - 구독', 'tiktok');   // 0건이어도 등록 계정이 있으면(stale) 사유를 남긴다(운영자 260727)
  if (_subOff.has('insta')) { /* 구독 끔 = 숨김 */ }
  else if (_subPaused.has('insta')) gCUR += subPausedSec('sre', '인스타그램 - 구독');   // 코드가 끈 구독 = 「꺼짐」(요청 0)
  else if (sreAll.length) gCUR += sec('sre', '인스타그램 - 구독', subStaleUnit('insta', sreAll), sreAll.length, '<div class="trend-grid wd">' + sreAll.map((t, i) => card({ ...t, nocls: 'igfb' }, i, 1)).join('') + '</div>');   // 인스타 구독 = 큐레이션 게시물 소분류(운영자 260723 · 260724 지역 무관 단일 블록) · 16:9 wd 통일
  else gCUR += subEmptySec('sre', '인스타그램 - 구독', 'insta');   // 0건이어도 등록 계정이 있으면(stale) 사유를 남긴다(운영자 260727)
  // X 큐레이션 = 소분류 라벨('큐레이션 게시물 · 한국') 폐지·대분류 직속(운영자 260720 — kcomm 이중 라벨 해소 선례 계승) · 정렬 칩 = 대분류 헤더 xSeg 이관 · div.trend-sec = 형제 리듬(rt2col 리셋·모바일 구분선)만 계승(details 아님 = 접기 비대상) · data-sec 유지 = fill 계약 불변
  const sxSec = _subOff.has('x') ? '' : sxAll.length ? sec('sx', 'X - 구독', subStaleUnit('x', sxAll), sxAll.length, '<div class="xgrid">' + sxAll.map((t, i) => xcard({ ...t, nocls: 'xfb' }, i, 1)).join('') + '</div>') : subEmptySec('sx', 'X - 구독', 'x');   // nokw=1 = KEYWORD 줄 폐지(운영자 260727 "엑스에 키워드는 빼줘 · 그만큼 글자를 당기면됨") — 그 한 줄을 본문 클램프가 흡수 · 본문 줄수 = .xcard-tx.s2 단일 정본(운영자 260801 3줄 고정 예약 · 구 X 전용 5줄 분기 흡수)   // X 구독 = 큐레이션 게시물 소분류(운영자 260723 · 260724 지역 무관 단일 블록) · 정렬바 폐지 = 좋아요 고정(운영자 260726)
  // ⑦ 블루스카이 = X 우측 열 합류(운영자 260720 "엑스랑 좌우로 배치 · 첨부1 참고" = rt2col 구글|시그널 문법 계승 · 기타(Q240) 대분류 통합 선례) — 한쪽 결측 = 단독 폭(조용한 공백 동축) · 번역본만 노출(운영자 260718) 유지
  gCUR += sxSec;   // X 구독 = 큐레이션 게시물 합류(운영자 260723 · 260724 지역 무관 단일 블록) · 구 gX(X 대분류) 소멸(트렌드는 gGG·구독은 gCUR)
  // (구 X 세계군 별도 sec[sx-gl] = 260724 지역 무관 통합으로 sx 단일 블록에 병합 · 국내/세계 구분 폐지)
  const sigSec = sig.length ? sec('sig', '시그널 실시간 검색어', rtBase, Math.min(sig.length, 10), sig.slice(0, 10).map((g, i) =>
    brow(i, ggUrl(g), undefined, _cnHotSig(g.query))).join('')) : '';   // ⑨ 시그널 실검(운영자 260718) — 클릭 = 구글 웹검색 검색어 입력 상태(운영자 260803 "구글 뉴스가 아닌 '구글'에서 검색자로 투입" — 구 Google News 리버스크론[평의회 260723 #2]은 뉴스만 걸러 보여 원천 맥락이 좁았다 · 목적지 = ggUrl 정본 1곳 공용 = 구글 실검과 동일 문법) · 순위+검색어만(brow)
  gGG += (gtSec && sigSec) ? '<div class="rt2col">' + gtSec + sigSec + '</div>' : gtSec + sigSec;   // 구글|시그널 좌우 2열 매칭(운영자 260718 · 모바일 1열 스택 = .rt2col 미디어) — 한쪽 결측 = 그리드 없이 단독(조용한 공백 동축)
  // 나무위키 = 구글|시그널 아래 좌열(우열 = X 급상승 · 운영자 261016) · 행 = brow(순위+검색어 · 원천 수치 없음 = 시그널과 동일) · 클릭 = 나무위키 검색 검색어 입력 상태
  const _nmPh = d.health && d.health.phone, _nmPhAlive = !!(_nmPh && _isoMs(_nmPh.updated) > Date.now() - 180 * 60000);   // 폰 하트비트(아래 phoneStale 과 같은 180분 축) — 폰은 살았는데 나무만 막힌 경우를 가른다(평의회260929 #3)
  const _nmWhy = ((d.health && d.health.namu) || {}).why ? ' · 최근 사유: ' + esc(String(d.health.namu.why).slice(0, 240)) : '';   // 폰·러너 실패 사유(sns_trends.py health.namu.why · 261014) — 배지 title에만(겉면 불변)
  const nmuSec = nmuL.length ? sec('nmu', '나무위키 실시간 검색어', !nmuStale ? rtBase : _nmPhAlive
    ? '<span class="tdash-time stale" title="폰 수집기는 정상인데 나무위키 순위가 3시간+ 안 들어왔다(러너 폴백도 실패) — 나무위키 쪽 응답 차단·형식 변경 의심' + _nmWhy + '">나무위키 응답 없음</span>'
    : '<span class="tdash-time stale" title="폰 수집기가 3시간+ 멈춤 — 나무위키 순위가 오래됐다(공급원 = 폰 · 러너 폴백도 실패 · 재가동 = phone_subs)' + _nmWhy + '">폰 점검 필요</span>', nmuL.length,
    nmuL.map((g, i) => brow(i, 'https://namu.wiki/Search?q=' + encodeURIComponent(g.query || ''), undefined, nmuStale ? undefined : _cnCls(g.query))).join('')) : '';   // 낡은 나무 행 = 무색(교차합의 불참과 같은 축)
  // X 급상승 1~10(운영자 261015 «에디터 3번 한켠») — 실시간 검색어 카드 안 나무위키 우측 칸(아래 rt2col). 모드(shadow/live/off)와 무관.
  //   원본 = api/trends?f=xtop(data/x_top10/latest.json 직독) · 없으면 수집 블록 xspike. 예제 파일은 라벨만 달고 보여 준다.
  //   진짜 데이터는 generated_at 60분 안. 헤더 = 수집 시각(fmtK12 · KST). 60분 넘게 끊기면 = 마지막 목록을 남기고 헤더에 끊김 배지(.tdash-time.stale ·
  //   나무위키·구독 칸과 같은 관용구 · 운영자 261016 «수집 시각도 뜨게 · 끊기면 다른거처럼 끊김 표시»). 데이터 0 = 같은 칸에 한 줄. 행 = brow(순위·검색어·배수).
  const _xRaw = (typeof XTOP !== 'undefined' && XTOP) ? XTOP : null;
  const _xBlk = (d.xspike && typeof d.xspike === 'object') ? d.xspike : null;
  const _xList = _xRaw ? (Array.isArray(_xRaw) ? _xRaw : (Array.isArray(_xRaw.items) ? _xRaw.items : null)) : null;
  const _xEx = !!(_xRaw && !Array.isArray(_xRaw) && _xRaw.example === true);
  const _xGen = String((_xRaw && !Array.isArray(_xRaw) && _xRaw.generated_at) || (_xList && _xList[0] && _xList[0].generated_at) || (_xBlk && _xBlk.generated_at) || '');
  const _xAge = _xGen ? (Date.now() - Date.parse(_xGen)) : Infinity;
  const _xFresh = Number.isFinite(_xAge) && _xAge >= -10 * 60e3 && _xAge <= 60 * 60e3;
  const _xNorm = arr => (arr || []).filter(it => it && typeof it.keyword === 'string' && it.keyword.trim()).slice().sort((a, b) => ((+a.rank || 99) - (+b.rank || 99))).slice(0, 10);
  let _xState = 'empty', _xRows = [];
  if (_xList && !_xEx && _xFresh) { _xState = 'ok'; _xRows = _xNorm(_xList); }
  else if (_xBlk && Array.isArray(_xBlk.items) && _xBlk.items.length && _xFresh && !_xEx) { _xState = 'ok'; _xRows = _xNorm(_xBlk.items); }
  else if (_xList && _xEx && _xList.length) { _xState = 'example'; _xRows = _xNorm(_xList); }
  else if (_xGen) { _xState = 'stale'; _xRows = _xNorm(_xList || (_xBlk && _xBlk.items)); }   // 끊김 = 목록은 그대로 두고 배지로 알린다(나무위키 stale 관용구)
  const _xK = (() => { const t = Date.parse(_xGen); return Number.isFinite(t) ? fmtK12(new Date(t + 9 * 3600e3).toISOString()) : ''; })();   // 수집 시각 = KST 고정(generated_at 오프셋 무관 · 표기 = #vhTime·구독 끊김과 같은 fmtK12)
  const _xUnit = _xState === 'stale'
    ? '<span class="tdash-time stale" title="X 급상승 수집이 60분 넘게 끊겼다 — 지금 보이는 건 마지막 수집분이다(30분마다 자동 갱신)">' + (_xK ? _xK + ' 이후 ' : '') + '수집 끊김</span>'
    : _xState === 'empty' ? '<span class="tdash-time stale">데이터 없음</span>'
    : (_xState === 'example' ? '예제' : '') + (_xK ? '<span class="tdash-time">' + _xK + ' 수집</span>' : '');
  const _xMul = it => { const s = (it.spike != null && +it.spike > 0) ? +it.spike : +it.growth; if (Number.isFinite(s) && s > 0) return (s >= 10 ? String(Math.round(s)) : String(Math.round(s * 10) / 10)) + '배'; const p = (it.posts_1h != null && +it.posts_1h > 0) ? +it.posts_1h : +it.posts_30m; return (Number.isFinite(p) && p > 0) ? Math.round(p).toLocaleString('ko-KR') + '건' : ''; };   // 글 수 모름(261114) = 빈 칸 · 러너가 줄 growth(지난 판 대비 배수)·posts_30m 도 같은 자리에(docs/x-top10.md 「섞기」)
  const _xUrl = it => { const u = String(it.source_url || ''); return /^https:\/\/(x|twitter)\.com\//.test(u) ? u : ('https://x.com/search?q=' + encodeURIComponent(String(it.keyword || '').replace(/^#/, ''))); };
  const xspSec = sec('xsp', 'X 급상승', _xUnit, _xRows.length, _xRows.length ? _xRows.map((it, i) => brow(i, _xUrl(it), _xMul(it))).join('')
    : '<div class="qempty">아직 들어온 급상승이 없어요<small>30분마다 갱신</small></div>');
  gGG += nmuSec ? '<div class="rt2col">' + nmuSec + xspSec + '</div>' : xspSec;   // 나무위키|X 급상승 좌우 2열(운영자 261016 «x를 저기 우측 비어잇는곳» = 구글|시그널 rt2col 문법 · 모바일 1열 스택 = .rt2col 미디어) — 나무 결측 = X 단독 폭
  // ⑦-b 블루스카이 실시간 트렌드 = 단독 폭(운영자 261016 «엑스트랜드는 없애줄래» — 구 ⑩ X 실시간 트렌드 반갈 좌측 칸 폐지 · 수집도 함께 폐지) · 행 = row(순위·키워드·포스트수·시간) · 클릭 = 블스 검색 검색어 입력 상태(운영자 260803)
  const btrL = (d.bsky_trends || []).slice(0, 10);
  const btrSec = btrL.length ? sec('btr', '블루스카이 실시간 트렌드', '', btrL.length, btrL.map((g, i) =>
    row(i, 'https://bsky.app/search?q=' + encodeURIComponent(g.query || ''), mag(g.posts), g, '')).join('')) : '';   // 클릭 = 블스 검색 검색어 입력 상태(운영자 260803 "블루스카이 및 구글 — 플랫폼에서 검색하게" — 구 link 우선은 trending.bsky.app 피드 페이지라 검색창 투입이 아니었다 · link 필드 = 수집 데이터에 보존·표시만 검색 고정) · 우측 = 포스트수(운영자 260723 크기 숫자 · mag = <1만 콤마 · 구글 검색량과 단위 다름 = 플랫폼 내부 크기 · 크로스비교 아님)
  gGG += btrSec;   // 실시간 검색어 카드(gGG) 안 · 나무위키|X 급상승 아래 단독 폭
  // ⑪ 레딧 = 독립 대분류 승격(운영자 260727 "5번을 레딧으로 · 형식은 3 유튜브 4 틱톡과 동일 · 16:9 썸네일도") — 구 '해외 커뮤니티' 대분류(gCM) 안 '핫 게시물 · 레딧' 소분류 행(row)에서 이관
  //   ⚠배치 = 대분류 순번 5(유튜브·틱톡 바로 뒤 = 플랫폼 대분류 연속) · 본체 = 유튜브 인기(11012)·틱톡 인기(11019) 100% 계승(.trend-grid.wd + card(,,1) 16:9) · 신규 CSS·신규 컴포넌트 0
  //   소머리('핫 게시물 · 레딧') = yt·tk와 동일하게 CSS 소거(NOHEAD) — 대분류가 이미 '레딧'이고 소분류 1개 = 동어반복
  //   커버 = 수집 thumb(레딧 preview 이미지 · 결측 = .tcard-cov.noc 조용한 공백 = 종전 무썸네일 데이터 무회귀) · 지표 = 스코어(업보트 = 조회수 아님 → 눈 픽토 대신 위화살 §3-1 정본 path) · 시간 = relT(time) 공통
  let gRD = '';
  const rddL = rdd.slice(0, 10).map(p2 => ({ ...p2, cover: p2.thumb || '', nocls: 'rdfb', metricHtml: (p2.score > 0 ? `<i>${RD_UP_SVG}<span>${mag(p2.score)}</span></i>` : '') }));   // 상한 10(운영자 260727 "10개까지") · mag = <1만 콤마·≥1만 만단위(스코어는 플랫폼 내부 크기 = 조회수 vfmt 축과 별개)
  // 레딧 = 화면 노출 폐지(운영자 260819 «sns에 레딧, 유튜브-쇼츠, 이거 안뜨게하자 별 도움이 안되네»).
  //   ⚠ **수집은 그대로 둔다** — 이 축은 키워드 알림(kw_watch)·급상승 감시의 **감시 원문**이라, 수집까지 끊으면
  //   등록어가 레딧에서 떠도 못 잡는다(운영자 지시는 화면 축 = "안 뜨게" · 감시망 축소는 지시 밖).
  //   되돌리기 = 아래 한 줄의 주석만 풀면 종전 복귀(rddL·card·sec 정의는 전부 그대로 살아 있다).
  // if (rddL.length) gRD += sec('rdd', '레딧', rtBase, rddL.length, '<div class="trend-grid wd">' + rddL.map((t, i) => card(t, i, 1)).join('') + '</div>');
  // (구 gBS 독립 대분류 = 260720 X 우측 열 합류 → 260721 게시물 표면 소멸 "블루스카이는 실검만" — bskS/bskL/bskSec/bcard 정의 = git 이력 · 잔존 블스 표면 = 실시간 트렌드 반갈 btrSec뿐)
  // ⑧ 스레드 구독 = 큐레이션 게시물(gCUR) 합류(운영자 260723) · 공급 = 폰/맥 phone_subs 전용 · 구 gTH(스레드 대분류) 소멸
  const sthAll = divRank(bySort(sth, 'likes')).slice(0, 10);   // 스레드 구독 = 지역 무관 통합(운영자 260724) · divRank = 계정 도배 감산(260725 Q557 — 운영자 "스레드도 동일한 느낌으로" · X sx 정본 이식 = 같은 함수·같은 쿼터3/밀기3) · 정렬 = 좋아요 고정(운영자 260726 정렬바 폐지)
  if (_subOff.has('threads')) { /* 구독 끔 = 숨김 */ }
  else if (_subPaused.has('threads')) gCUR += subPausedSec('sth', '스레드 - 구독');   // 코드가 끈 구독 = 「꺼짐」(요청 0)
  else if (sthAll.length) gCUR += sec('sth', '스레드 - 구독', subStaleUnit('threads', sthAll), sthAll.length, '<div class="xgrid">' + sthAll.map((t, i) => xcard({ ...t, nocls: 'thfb' }, i, 1)).join('') + '</div>');   // 스레드 구독 = 큐레이션 게시물 소분류(운영자 260723 · 260724 지역 무관 단일 블록) · 정렬바 폐지(260726 · X sx와 동형)   // nokw=1 = KEYWORD 줄 폐지(운영자 260831 "스레드 수집때 키워드 안가져오게" — X 260727 "엑스에 키워드는 빼줘" 처방 동형 이식 · fillT kw 줄도 같은 커밋에 회수 = 스팬 없는 카드에 fillT가 남으면 인덱스 어긋남 · 데이터 축 kw·sum은 무접촉 = X와 동일{요약 파이프 sns_sum.sh는 kw∧sum 동시 채택 계약이라 kw를 끊으면 한줄요약까지 죽는다})
  else gCUR += subEmptySec('sth', '스레드 - 구독', 'threads');   // 0건이어도 등록 계정이 있으면(stale) 사유를 남긴다(운영자 260727)
  let gHN = '';   // ⑫ 해커뉴스 그룹(운영자 260713 · 260720 brow = 순위+제목만[스코어·삼각형·시간열 제거] · 클릭 = 원문/HN)
  const hnL = hnl.slice(0, 8);   // 상한 12→8(운영자 260721 Q383 "해커도 8위까지만" — 박스오피스와 좌우 균형)
  if (hnL.length) gHN += sec('hn', '해커뉴스', '', hnL.length, hnL.map((p2, i) => brow(i, p2.url || p2.hn || '#')).join(''));   // 순위+제목만(운영자 260720 — 톱 스토리→해커뉴스 개명 · 구 삼각형▲·스코어·시간열 제거 · 반폭 rt2col서 제목 .trend-q 말줄임[…] 자동)
  let gFI = '';   // ⑬ 금융 그룹(환율·코인 = 시세 행 · sec 문법 · 표시 전용) — 순위/변동배지 무의미 = 커스텀 행
  const fxHasChg = finR.some(x => typeof x.chg === 'number');   // ⑬ 환율 등락(직전 거래일 종가 대비 · Frankfurter) — 결측(첫 수집·소스 실패) = 등락 열·기준점 캡션 미표기(fail-soft)
  const FIN_ICO = { USD: '$', EUR: '€', JPY: '¥', GBP: '£', CNY: '元', AUD: 'A$', CAD: 'C$', CHF: 'Fr', BTC: 'B', ETH: 'E', XRP: 'X', SOL: 'S', KOSPI: '코', KOSDAQ: '닥', '.IXIC': '나', '.INX': 'S', '005930': '삼', '000660': 'SK', '034020': '두', '012450': '한', 'TSLA.O': 'T', 'NVDA.O': 'N', 'PLTR.O': 'P', 'SPCX.O': 'X' };   // ⑬ 통화·코인·지수·종목 모노그램(운영자 260717 안B · 260719 종목6·지수2 확장 · 260721 기축통화 8종) — 통화기호 $€¥£元 + A$/C$/Fr(호주·캐나다·스위스 = SK 2글자 선례) + 코인 첫글자 + 지수/종목 한글·영문 약칭 · 전부 안정 글리프
  const fxKrw = x => x.code === 'JPY' ? x.krw * 100 : x.krw;   // ⑬ 엔화 = 한국 관례 100엔 기준(스크래퍼 저장 = 1엔당 원화 9.07 · 뷰어 ×100 복원 907 = _capKrw 선례 [15] 우회·즉시 발효 · '(100)' 라벨 = fin-nm 주입 시 부착)
  const FIN_ARROW = { up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7l7 11H5z" fill="currentColor"/></svg>', dn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17 5 6h14z" fill="currentColor"/></svg>' };   // ⑬ 등락 방향 삼각(SVG 픽토 · 문자 ▲▼ 금지 [3-1])
  const finChg = chg => typeof chg !== 'number' ? '' : `<span class="fin-chg ${chg > 0 ? 'up' : chg < 0 ? 'dn' : ''}"><span class="fin-ar">${chg > 0 ? FIN_ARROW.up : chg < 0 ? FIN_ARROW.dn : ''}</span><span class="fin-pct">${chg > 0 ? '+' : ''}${esc(chg)}%</span></span>`;   // ⑬ 등락 셀 = [삼각 슬롯][% 우정렬] · 금융 4개 그룹(증시·암호화폐·환율·종목) 공용 · 운영자 260721 "이렇게 할게(화살표+% 현행색)"
  const finHot = (chg, th) => typeof chg === 'number' && Math.abs(chg) >= th ? ' fin-hot' : '';   // ⑬ 임계 초과 행 골드레몬 판정(운영자 260723 — 증시 국내±5/해외±3 · 암호화폐±5 · 환율±1 · 종목±8 · 결측 = 비적용 fail-soft · 색 = .fin-row.fin-hot CSS)
  const fxSec = finR.length ? sec('fin-fx', '환율', '', finR.length, '<div class="fin-rows">' + finR.map(x => `<div class="fin-row${finHot(x.chg, 1)}"><span class="fin-ico">${FIN_ICO[x.code] || ''}</span><span class="fin-nm"></span><span class="fin-v">${esc(fxKrw(x) >= 100 ? Math.round(fxKrw(x)).toLocaleString() : fxKrw(x))}<i>원</i></span>${fxHasChg ? finChg(x.chg) : ''}</div>`).join('') + '</div>') : '';
  const ccSec = finC.length ? sec('fin-cc', '암호화폐', '', finC.length, '<div class="fin-rows">' + finC.map(c => `<div class="fin-row${finHot(c.chg, 5)}"><span class="fin-ico">${FIN_ICO[c.code] || ''}</span><span class="fin-nm"></span><span class="fin-v">${esc(Math.round(c.krw).toLocaleString())}<i>원</i></span>${finChg(c.chg)}</div>`).join('') + '</div>') : '';
  const idxSec = finI.length ? sec('fin-idx', '증시', '', finI.length, '<div class="fin-rows">' + finI.map(x => `<div class="fin-row${finHot(x.chg, (x.code === 'KOSPI' || x.code === 'KOSDAQ') ? 5 : 3)}"><span class="fin-ico">${FIN_ICO[x.code] || ''}</span><span class="fin-nm"></span><span class="fin-v">${esc((typeof x.val === 'number' ? x.val : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}<i>pt</i></span>${finChg(x.chg)}</div>`).join('') + '</div>') : '';   // ⑬ 증시 지수(코스피·코스닥·나스닥·S&P500 · pt · 전일 종가 대비 · 운영자 260719 pt 접미)
  const finUsd = (finR.find(x => x.code === 'USD') || {}).krw || 1490;   // ⑬ 종목 환산 환율 = 이 유닛 finR USD 시세(구 회전 블록 내부 _fxUsd 정의를 초기 렌더도 쓰게 승격 · 폴백 1490 종전)
  const finStkVal = x => { const v = typeof x.val === 'number' ? x.val : 0; return esc(Math.round(x.cur === 'USD' ? v * finUsd : v).toLocaleString()) + '<i>원</i>'; };   // ⑬ 종목 한화 통일(운영자 260723 "한화로 통일해서 한번" — 구 국내 원/해외 달러 혼재 '가격' 폐지·분할 · 해외 = ×USD 환산 · 원 = 정수 반올림[절삭 아님])
  const stkSec = finS.length ? sec('fin-stk', '종목', '<span class="fin-rot-st">가격 (원)</span>', finS.length, '<div class="fin-rows">' + finS.map(x => `<div class="fin-row${finHot(x.chg, 8)}"><span class="fin-ico">${FIN_ICO[x.code] || ''}</span><span class="fin-nm"></span><span class="fin-v">${finStkVal(x)}</span>${finChg(x.chg)}</div>`).join('') + '</div>') : '';   // ⑬ 주요종목(삼성·SK·두산·한화 원 + 테슬라·엔비디아·팔란티어·스페이스x 달러 · 회전 = 한화→시총→달러(운영자 260723 분할) · 운영자 260719)
  const finSecs = [idxSec, ccSec, fxSec, stkSec].filter(Boolean);   // ⑬ 금융 2x2 그리드(운영자 260717 · 260721 순서 재편) — 1행 증시|암호화폐(각 4개) · 2행 환율|종목(각 8개 · 운영자 "증시 좌상단·암호화폐랑 맞추고 · 환율은 아래 종목과 맞추자") · fin-split 2열 → 4개면 2x2 · nth-child(2)=암호화폐 불변(구분선 처방 유지) · 결측 그룹 자동 제외(조용한 공백)
  gFI = finSecs.length > 1 ? '<div class="fin-split">' + finSecs.join('') + '</div>' : (finSecs[0] || '');
  let gSF = '';   // ⑭⑯ 재난·안전 그룹(재난문자·고속도로 돌발 = 팩트 신호 · 키 게이트라 키 없으면 미등장)
  // ⑭-d 지진·화재급 = 제목 골드레몬(판정 = disCrit) · ⑭-i 우측 = [추적 상태 칩] + 지역(칩은 추적 중인 건에만 = 조용한 공백)
  if (dsl.length) gSF += sec('dis', '재난문자', '· 안전', Math.min(dsl.length, 10), dsl.slice(0, 10).map((p2, i) => row(i, p2.url || '#', fwChip(p2) + '<span class="dis-area">' + esc(p2.area || '') + '</span>', p2, '', 0, disCrit(p2) ? 'dis-crit' : '')).join(''));
  if (exw.length) gSF += sec('exw', '고속도로 돌발', '· 사고', Math.min(exw.length, 10), exw.slice(0, 10).map((p2, i) => row(i, p2.url || '#', esc(p2.route || ''), p2, '')).join(''));   // ⑯ 도로공사(운영자 260713 "대량 사고") — 우측 = 노선명
  let gMV = '';   // ⑮ 문화 그룹(박스오피스 = 카드뉴스·릴스 소재 · 키 게이트)
  const boOld = p2 => { const t = Date.parse(p2.open || ''); return t > 0 && (Date.now() - t) > 365 * 864e5; };   // 재개봉 컷(운영자 260817 "지금 관람객수를 제대로 반영을 못하는데 — 보헤미안 랩소디가 1위") — audi = audiAcc = 원 개봉일부터의 누적이라 재개봉작은 옛 흥행분을 달고 아래 정렬 1위를 강탈(260817 KOBIS 실측 = 보헤미안 랩소디 개봉 2018-10-31 · 누적 995만 · 어제 하루 996명 · 일별 순위 10위) · 판정 = 개봉일 365일 초과(재개봉작도 open = 원 개봉일 유지 = 260817 KOBIS 실측 · 정상 상영은 1년을 안 넘는다) · open 결측 = fail-open 유지(구 수집분·특별상영 — 빈 목록 방지 · 수집기 open 동반 커밋이라 다음 수집부터 발효)
  const kobL = kob.filter(p2 => (p2.audi || 0) >= 1e4 && !boOld(p2)).sort((a2, b2) => (b2.audi || 0) - (a2.audi || 0)).slice(0, 8);   // 누적 관객수 내림차순(운영자 260721 "여튼 관객수대로 순위가 되어야함" — 원천 kobis rank = KOBIS '어제 하루' 관객수 순위라 신작 반짝 1위[호프 227만]가 누적 최다[군체 594만] 위에 뜨던 것 교정 · audi = audiAcc = 개봉일~어제 누적 · filter 새 배열이라 원천 무변형) · 1만명 미만 = 미표기(운영자 260721 Q382 "만명도 안 나온 영화는 출력 X · 10개 안 나와도 괜찮아") — 표시 필터만(원천 sns_trends.json 무접촉 [15] · 만단위 표기 = vfmt 종전) · 전멸 = sec 미생성 → gETC 해커뉴스 단독 스택(기존 분기 = 조용한 공백)
  if (kobL.length) gMV += sec('kob', '박스오피스', '', kobL.length, kobL.map((p2, i) => brow(i, p2.url || '#', p2.audi ? vfmt(p2.audi) + '명' : '', i < 3 ? 'top3' : '', i < 3 ? (p2.audi >= 1e7 ? 'bo-t' : p2.audi >= 3e6 ? 'bo-y' : 'bo-w') : '')).join(''));   // 순위+제목+관람객수만(운영자 260720 — 시간열 제거 · 해커뉴스와 반반 rt2col 계승) · top3 = 영화명 강조색(운영자 260721 Q382 · .trend-q.top3) + 관객수 히트색(운영자 260723 "상위 3개 몇만명 흰색 · 300만↑ 노란색 · 천만↑ 강조1" = bo-w[흰]/bo-y[≥3e6]/bo-t[≥1e7] · 4위↓는 종전 --mut) · '· 어제' 캡션 제거(운영자 260721 — 기타 그룹 = SNS와 동일 sns_trends.json 일괄 수집 = 갱신 시각 #vhTime 1회로 갈음)
  const gKC = (SOCIAL_LOADED && !((typeof SOCIAL !== 'undefined' && SOCIAL.some(socPass)) || socGhosts().length)) ? '' : '<div id="snsHost" class="kcomm-host"></div>';   // 국내 커뮤니티(운영자 260713 극좌 = ① 편성) — 소셜 전무 확정 시만 미등장(조용한 공백) · 잔류 전송분(socGhosts)만 남았어도 그룹은 선다(260821 — 수집 전멸 회차에 전송 카드까지 통째 미등장 차단) · 소분류 '커뮤니티 공론'(sec kcomm-l) 헤더 폐지 = 대분류 직속 장착·삭제분만큼 위로 당김(운영자 260720 — 대분류=소분류 동의어 이중 라벨 해소 · 직속 본체 = brief .tbrief 선례)
  const gETC = (gHN && gMV) ? '<div class="rt2col">' + gHN + gMV + '</div>' : (gHN + gMV);   // ⑫⑮ 기타 = 해커뉴스|문화 좌우 2열(운영자 Q240 "동일 가로선·첨부2처럼" — 구 독립 대분류 2개 → '기타' 대분류 1개 · rt2col = 구글|시그널 실검 문법 계승 · 한쪽 결측 = 단독 스택 · 모바일 1열 = rt2col 미디어)
  const GRPS = [['gg', '실시간 검색어', gGG], ['kcomm', '국내 커뮤니티', gKC], ['pop', '인기 게시물', gYT + gTK + gRD], ['cur', '큐레이션 게시물', gCUR], ['fin', '금융', gFI], ['etc', '기타', gETC], ['sf', '안전', gSF]].filter(g => g[2]);   // ③ 인기 게시물 = 유튜브·레딧 대분류 통합(운영자 260731 "3 인기 게시물 · 블릿으로 유튜브 · 그 다음 블릿으로 레딧 · 번호 다 위로") — 플랫폼별 대분류(구 ③유튜브·④레딧)를 성격축 1개로 묶고 플랫폼은 소분류 블릿으로 강등 = 대분류 2개 감소분만큼 뒤 순번이 자동으로 당겨진다(gno = 렌더 그룹 순차 증가) · 순서 = 유튜브 → (틱톡: 260727 큐레이션 이관으로 상시 공백) → 레딧 · gTK 자리 = 대분류 복귀 시 유튜브 뒤에 붙는 자리만 보존(현재 무출력) · 되돌림 = 이 배열 3원소 복원 + §691 소머리 숨김 복구   // 블루스카이 = X 대분류 우측 열 합류(260720)로 독립 행 폐지 · kcomm = 공론 직속 + 오늘의베스트 sec(Q311)   // 신규 5종(운영자 260713 "ㄱ") = X·SNS 뒤 · 데이터 구동 = 빈 그룹 자동 제외 · 레일 = 첫 글자 폴백 · 해커뉴스+문화 = '기타' 대분류로 통합(운영자 Q240)
  // ── 조립: 좌측 책갈피 레일(soc-item 밖 = backdrop-filter 조상 회피 → fixed가 뷰포트 기준 · §디자인 h) + 카드(헤드 → TOP 10 → 순번 플랫폼 그룹) ──
  let h = '';
  h += '<div class="trailwrap" id="trendRailWrap">' +
    // 지역 미니 세로바(한국/세계) = 구 헤더 지역 세그 이관(운영자 260713 "세로 내비 위에 하나 더" · 항상 표시 = 지역 전환 상시)
    '<nav class="trail trail-rg" role="group" aria-label="지역 범위">' +
    `<button type="button" class="trail-i${TRREG === 'kr' ? ' on' : ''}" data-reg="kr" aria-label="국내" title="국내">${TR_REG_SVG.kr}</button>` +
    '<i class="trail-div" aria-hidden="true"></i>' +
    `<button type="button" class="trail-i${TRREG === 'gl' ? ' on' : ''}" data-reg="gl" aria-label="월드" title="월드">${TR_REG_SVG.gl}</button>` +
    '</nav>' +
    // 플랫폼 레일(기존 · 그룹 2개+일 때만)
    (GRPS.length > 1 ? '<nav class="trail" id="trendRail" aria-label="플랫폼 바로가기"><button type="button" class="trail-i" data-tg="top" aria-label="맨 위"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg></button>' +
      GRPS.map(g => `<button type="button" class="trail-i" data-tg="${g[0]}" aria-label="${g[1]}">${TR_LOGO[g[0]] || g[1][0]}</button>`).join('') + '</nav>' : '') +
    '</div>';   // 래퍼 = 지역 미니바(항상) + 플랫폼 레일(GRPS>1) 세로 스택 · 라벨 = 플랫폼 로고 픽토(TR_LOGO 단색) · TOP = SVG 위화살(totop 계승)
  // 구 .soc-item.soc-trend 래퍼 = 삭제(운영자 260713 "블록이 너무 많아 — 맨 아래 블록 삭제") · trend-head·tgroup 카드가 #snsTrends 직속(투명 컨테이너 한 층 제거 = DOM·시각 동시 정리)
  // 지역 세그(한국/세계) = 좌측 세로 미니바(.trail-rg · 위 trailwrap)로 이관 · 계정 = 설정 메뉴(#linkpop)로 이관 → 구 trend-head(헤더 행) 폐지(운영자 260713 "세로 내비 위에 하나 더")
  // 최상위 단위(운영자 260712 "블릿 위 단위 = 접을 수 있게 + 글래스 + 도형 얹힘") = [AI 요약][실시간 TOP 10][각 플랫폼] 전부 details 접기 · 전역 순번 · 헤더 = 글래스 필(타이틀이 도형 위에 얹힘 · .sc-tg 값 계승) · 기억 = nm_trend_gfold
  let TGF = {}; try { TGF = JSON.parse(localStorage.getItem('nm_trend_gfold') || '{}') || {}; } catch { TGF = {}; }
  let gno = 0, gfirst = true;
  const GPIC = { brief: AISPARK_SVG, top: TRENDUP_SVG };   // AI 요약 = ✨ 스파크(운영자 260723 Q478 = Q477 솔빙 orb 시안 검토 후 "스파크가 나은듯" 복귀) · TOP 10 = 📈 우상향 · 숫자 대신 픽토그램("0" 의미 = 순번 밖) · 플랫폼 그룹부터 1,2,3

  const GFOLD_ALWAYS = new Set(['sf']);   // 항상 접힌 채로 그리는 대분류(운영자 260818 "sns 분석 맨 아래에 안전은 항상 닫힌걸 유지해줘") — 접힘 기억(TGF)보다 **위**에 서서 열어둔 상태도 다음 렌더에 도로 접는다. ⚠ 짝 = goDisSec(지진 경고 '안전 탭 열기'·알림 딥링크)이 소분류만 펴던 것을 대분류까지 펴도록 동반 보강 = '눌렀는데 아무것도 없음' 차단
  const gsec = (id, ttl, body, hstale, extra) => { const first = gfirst; gfirst = false; const core = `<details class="tgroup${first ? ' dash' : ''}" data-g="${id}" id="tg-${id}"${(TGF[id] || GFOLD_ALWAYS.has(id)) ? '' : ' open'}><summary class="tgroup-h${hstale ? ' hdr-stale' : ''}"><i${GPIC[id] ? ' class="gpic" aria-hidden="true"' : ''}>${GPIC[id] || ++gno}</i>${ttl}</summary>${extra ? `<div class="chseg-row">${extra}</div>` : ''}${body}</details>`; return extra ? `<div class="chu">${core}</div>` : core; };   // hstale = 픽토 라이트 멎음(수집 죽음 국면 · 시각 텍스트 비노출 = 겉면 불변 · 운영자 260714 빛멎음) · extra = 헤더 우측 컨트롤(summary 밖 형제 = 인터랙티브 중첩 해소 — 메뉴4 .chu 문법 역이식 · 운영자 260716 TOP 플랫폼 칩)
  if (BRIEF && BRIEF.text && top.length) h += gsec('brief', 'AI 요약', `<div class="tbrief"><p class="tbrief-t"></p><div class="tbrief-led" hidden><button class="tbrief-led-h" type="button" aria-expanded="false" aria-controls="tbLedL" title="이전 브리핑에서 이미 다뤄 오늘 요약에서 뺐거나 줄인 이슈"><span>이미 다룬 이슈 <b class="tbrief-led-n"></b>건</span>${CHEVRON_SVG.replace('<svg ', '<svg aria-hidden="true" ')}</button><div class="tbrief-led-w" inert><ul class="tbrief-led-l" id="tbLedL"></ul></div></div></div>`, stale);   // 항상 전문 펼침(운영자 260713 "항상 펼쳐줘") — 구 리드 4줄 peek·더보기 폐지 · 접기는 상위 tgroup 헤더 체브론(촤르륵)이 담당 · 말미 접이 = 이슈 원장(재탕 감쇠로 뺀 이슈 가시화 · 운영자 260714 · issues 없으면 hidden 유지) · stale = TOP 공유 트렌드 수집 죽음 → 스파크 빛 대칭 멎음(#2286 합류)
  // TOP 10 플랫폼 책갈피(운영자 260716 "우측 상단 세부 nav에 유튜브 NN · 선택하면 플랫폼별 TOP 10") — 칩 = 헤더 우측 extra(.chu · 기간 칩과 동일 구조) · 라벨 = 플랫폼명+표시 건수 · 전체 = 종전 종합(플랫폼캡 4·총 10) · 플랫폼 = 풀 정렬 그대로 상위 10
  const tfl = []; pool.forEach(p2 => { let z = tfl.find(z2 => z2.k === p2.mono); if (!z) { z = { k: p2.mono, lb: p2.plat, n: 0 }; tfl.push(z); } z.n++; });
  if (TR_TOPF !== 'all' && !tfl.some(z => z.k === TR_TOPF)) TR_TOPF = 'all';   // 결측 방어(수집 변동으로 플랫폼 소실 = 종합 폴백)
  const topShow = TR_TOPF === 'all' ? top : pool.filter(p2 => p2.mono === TR_TOPF).slice(0, 10);
  const topSeg = tfl.length > 1 ? `<span class="ch-rangeseg tb-seg"><button type="button" data-tf="all"${TR_TOPF === 'all' ? ' class="on"' : ''}>전체</button>${tfl.map(z => `<button type="button" data-tf="${esc(z.k)}"${TR_TOPF === z.k ? ' class="on"' : ''}>${esc(z.lb)} ${Math.min(z.n, 10)}</button>`).join('')}</span>` : null;
  if (top.length) h += gsec('top', '실시간 TOP 10',
    '<div class="tlist">' + topShow.map((it, i) =>
      `<a class="tlr" data-si="${i}"${it.pt ? ' data-pt="1"' : ''} href="${escUrl(it.url)}" target="_blank" rel="noopener"><span class="trend-rank">${i + 1}</span><span class="tlr-t"></span><span class="tlr-p" style="color:${TR_PCOL[it.mono] || 'var(--mut)'}">${it.plat}</span><span class="tlr-v">${esc(it.rv || '')}</span><span class="tlr-tm${it._fresh ? '' : ' old'}">${esc(it.ago || '')}</span></a>`).join('') + '</div>' +
    '<div class="tstk-wrap" id="tstk"></div>', stale, topSeg);   // 스택(순위 흐름) = 전체·플랫폼 필터 공통 노출(운영자 260717 "플랫폼별 순위도 쭉") — 플랫폼 = 그 mono 순위 시퀀스(topShow 축 = TOP 리스트와 동일 데이터 = 정직) · stale = 종전 hstale 유지
  // (X 정렬칩 = 대분류 헤더 xSeg → sx 소분류 인라인 sortbar 이관 · 운영자 260723 큐레이션 통합 — 스레드 sth 인라인 정렬 문법과 통일)
  const _finUt = d.updated ? new Date(d.updated).getTime() : 0;   // d.updated = +09:00 오프셋 ISO → epoch(오프셋 내장 = 기기 TZ 무관 · naive now 아님 [12])
  const finUpdHtml = () => !_finUt ? '' : esc(qAgo(_finUt)) + (Date.now() - _finUt >= 65 * 60000 ? ' <span class="fin-chk">(점검 필요)</span>' : '');   // 금융 갱신 시각 = "nn분 전" 상대 표기(운영자 260723-2 "날짜 빼고 nn분 전 흰색" — 사다리 = qAgo 정본 재사용 · 무효 = '' fail-soft) + 수집 65분↑ = "(점검 필요)" 부착(운영자 260723-4 "65분 동일하게 · 괄호 점검 필요" — 임계 = .tdash-time.stale 65분 동률 · 시간 본문 표출 그대로 · 보라 = .fin-chk CSS) · 초기 렌더·라이브 틱 공용 빌더 · 소스 = 전체 수집 시각 d.updated(#vhTime 동일 정본 · finance._ts는 소스별 개별 dict라 단일값 부적격) · (구 GPEN·penSeg 펜 칩 = main 260723 설정 이관 삭제 유지)
  const FIN_UPD = finUpdHtml();
  const finHotAny = /fin-hot/.test(gFI);   // ⑬ 임계 초과 행 존재 신호(운영자 260723 hot 배지) — 행 판정(finHot 클래스 마커) 재사용 = 이중 임계 로직 0
  const _phH = d.health && d.health.phone; const phoneStale = !!(_phH && !(_isoMs(_phH.updated) > Date.now() - 180 * 60000));   // 폰 하트비트(평의회 260723 #5 · health.phone) — 폰 수집기(스레드 유일 공급원)가 180분+ 멈춤 = 죽음(워치독 check_phone 임계 동률 · updated 무효/노후 판정) · updated = KST 오프셋 ISO라 기기 TZ 무관 · **health.phone 필드 부재(구 스키마·러너 미실행) = 판정보류 no-dim**(_phH undefined → false = 롤아웃 오탐 방지) · 시각 파싱 = _isoMs(마이크로초 6자리 사파리 NaN = 낡음으로 · 평의회260929 #4)
  h += GRPS.map(g => { const ttl = g[0] === 'fin' ? g[1] + (finHotAny ? '<span class="fin-hotdot" title="전일 대비 임계 초과 급변 있음"></span>' : '') + (FIN_UPD ? `<span class="tdash-time fin-upd">${FIN_UPD}</span>` : '') : (g[0] === 'cur' && phoneStale) ? g[1] + '<span class="tdash-time stale" title="폰 수집기가 3시간+ 멈춤 — 스레드 최신 글이 지연 중(재가동 = phone_subs)">폰 점검 필요</span>' : g[1]; return gsec(g[0], ttl, g[2]); }).join('');   // 대분류 = 제목만(시각 = 좌상단 #vhTime) · 예외: 금융 갱신시각+hot배지(운영자 260723) · 큐레이션 게시물 폰stale 배지(스레드 공급원 = 폰 · sth→cur 이관 260723) · X 정렬칩 = sx 소분류 인라인(xSeg 헤더칩 폐지)
  const _sv2 = $('#snsview'); if (_sv2 && box.contains(_sv2)) $('#trendview').appendChild(_sv2);   // 재구축 전 대피(innerHTML 소실 방지)
  // ── 실검 키워드 티커(운영자 260729 · MengTo marquee-loop 역이식) — 전 탭(feed·scrap·trend·chan) 공통 헤더 직하 한 줄 무한 루프.
  //    소스 = d.gtrends(이미 든 데이터 · 추가 fetch 0) 상위 10 검색어 · 트랙 2벌 복제 → 0→-50% 이동이 이음매 없이 순환.
  //    장식성(aria-hidden · 링크 아님 = 열람 경로는 아래 실검 레인 카드가 정본) · 데이터 없으면 미출력(빈 띠 0).
  //    ⚠ 주입 대상 = 뷰 밖 전역 호스트 #tkrHost(운영자 260730 "4개 메뉴 전부") — 구 `h = _tkr + h`(트렌드 레인 맨앞 삽입)는
  //       #snsTrends 안이라 트렌드 탭에서만 보였다. loadTrends가 탭 무관 1회 호출하므로 어느 탭에서 시작해도 채워진다.
  //    esc() 경유 조립만(XSS) · 재구축 때마다 함께 갱신(시그니처 가드 안) · 되돌림 = 이 블록 + CSS .tkr*/.tkrhost + #tkrHost 삭제.
  const _tkQ = (Array.isArray(d.gtrends) ? d.gtrends : []).map(x => (x && x.query) || '').filter(Boolean).slice(0, 10);
  const _tkr = !_tkQ.length ? '' : '<div class="tkr" aria-hidden="true"><div class="tkr-track">' +
    [..._tkQ, ..._tkQ].map(q2 => '<span class="tkr-i">' + esc(q2) + '</span>').join('') + '</div></div>';
  { const _tkH = __byId('tkrHost'); if (_tkH && _tkH.innerHTML !== _tkr) _tkH.innerHTML = _tkr; }   // 동일 마크업이면 무접촉 = 재렌더마다 애니 리셋(키워드 튐) 차단
  box.innerHTML = h;
  const _kh = box.querySelector('#snsHost'); if (_kh && _sv2) { _kh.appendChild(_sv2); _sv2.hidden = false; } else if (_sv2) _sv2.hidden = true;   // 국내 커뮤니티 그룹① 본체 장착 + 해금(운영자 260716 "이전 버전이 안뜨게" — 장착 = 노출·미장착(그룹① 부재 재구축) = 재숨김 · showTab 게이트와 짝 = 구버전 맨몸 노출 불가침)
  box._trSig = _trSig;   // 시그니처 커밋(렌더 완료 시점 — 실패·조기 return엔 미커밋 = 다음 호출 재시도)
  // 텍스트 주입(XSS 안전) — 전부 섹션 스코프(구 전역 카운터 qs[k] 체인 폐지 = 순서 결합 버그 축 제거)
  const fillT = (key, sel, vals) => box.querySelectorAll(`[data-sec=${key}] ${sel}`).forEach((el2, i) => { el2.textContent = vals[i] || ''; });
  const fillH = (key, sel, vals) => box.querySelectorAll(`[data-sec=${key}] ${sel}`).forEach((el2, i) => { el2.innerHTML = vals[i] || ''; });   // 신뢰 HTML 주입(링크 래핑 xlink 등) — 값은 반드시 esc 경유 조립분만(xlink) · 원시 텍스트 = fillT(textContent) 유지
  const xlink = s => String(s ?? '').split(/(https?:\/\/[^\s]+)/g).map((p, i) => i % 2 ? `<span class="xcard-lk">${esc(p)}</span>` : esc(p)).join('');   // X·스레드 본문 링크 = mut 저채도 래핑(운영자 260717 "블루스카이처럼 링크 mut") · split 캡처 홀수=URL만 래핑 · 전 조각 esc(전역 6691) 경유 = XSS 안전(신뢰 HTML은 span뿐)
  const xtco = s => String(s ?? '').replace(/\s*https?:\/\/t\.co\/\w+/g, '').replace(/\n{3,}/g, '\n\n').trim();   // X 본문 t.co 단축 URL 제거(운영자 260727 "url 줄임 있는데 저거 없애주셈") — 난수 문자열이 한 줄을 통째 먹고 정보값 0(그림 = thumb · 이동 = 카드 전체 링크) · 표시단 필터라 구데이터도 즉시 적용(수집단 정본 = sns_trends.py _x_body 동일 처방) · t.co만 = 외부 도메인 링크는 보존
  const mdb = s => s.replace(/\*\*([^*]+?)\*\*/g, '<b>$1</b>').replace(/\*\*/g, '');   // ⑦ 블스 번역 속 **키워드** → <b> 볼드(운영자 260718 "핵심 키워드 볼드") — xlink(esc) 이후 적용 = XSS 안전(b 태그만 추가 조립) · 잔여 홀수 마커 제거(320자 컷 파손 방어)
  box.querySelectorAll('#tg-top .tlr-t').forEach((el2, i) => { el2.innerHTML = topShow[i] ? dimTags(topShow[i].t) : ''; });   // dimTags = 끝쪽 영문 해시태그 mut 회색(esc 경유 XSS 안전 · 운영자 260719)
  box.querySelectorAll('[data-tf]').forEach(b2 => b2.addEventListener('click', () => { TR_TOPF = b2.dataset.tf; const y2 = __scrollY(); renderSnsTrends(); __scrollTo(0, y2); }));   // TOP 플랫폼 책갈피(운영자 260716) — 재렌더·스크롤 보존 = 메뉴4 data-bs 문법 미러 · _trSig에 TR_TOPF 동승이라 시그니처 가드 통과
  chuFit(box);   // 헤더 우측 칩 실폭 예약(시각 텍스트 겹침 차단 · 운영자 260717)
  const bt = box.querySelector('.tbrief-t');   // 단위 헤더 'AI 요약'이 라벨 겸함(판 내부 중복 라벨 제거 · §디자인 e)
  if (bt && BRIEF) {   // **별표2**→볼드만 · *별표1*→강조색볼드 · [텍스트](url)·URL→<a> (텍스트노드/href검증만 = XSS 안전) · 줄바꿈은 white-space:pre-line · 채널 브리프(renderChan parseInto)와 강조 2층 통일(운영자 260714 "모두 통일")
    bt.textContent = '';
    const txt = BRIEF.text || '', TOK = /(\*\*[^*\n]+\*\*)|(\*{2,})|(\*[^*\n]+\*(?!\*))|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s)]+)/g;   // 2층(**..**) 먼저 → 안 닫힌 **런 = 리터럴(strip) → 1층(*..*·닫기 (?!\*) = **의 첫 별표 안 삼킴) → 링크/URL · 운영자 260720 과흡수 봉합: 안 닫힌 단일 *가 ** 앞에 오면 **첫 별표와 짝지어 중간 흡수하던 것 차단(룩어헤드만 = 사파리 호환)
    const addText = z => {   // 짝 없는 경계 단일 * = 오탈자 플래그(tb-starwarn) · 숫자/글자 사이 *(수식 3*4)는 리터럴(오탐 방지) · 운영자 260720
      if (!z) return;
      if (z.indexOf('*') < 0) { bt.appendChild(document.createTextNode(z)); return; }
      const A = z.split(/(\*)/), aln = c => c && /[0-9A-Za-z가-힣]/.test(c);
      A.forEach((p, i) => {
        if (p === '*') {
          if (aln((A[i - 1] || '').slice(-1)) && aln((A[i + 1] || '')[0])) bt.appendChild(document.createTextNode('*'));
          else { const w = document.createElement('span'); w.className = 'tb-starwarn'; w.textContent = '*'; w.title = '짝 없는 별표 — 오탈자 확인'; bt.appendChild(w); }
        } else if (p) bt.appendChild(document.createTextNode(p));
      });
    };
    const refKey = u => String(u || '').replace(/[)\].,!?"']+$/, '').replace(/\/+$/, '');   // URL 매칭 정규화(꼬리 구두점·슬래시 관용 — LLM 출력 편차 흡수)
    const REFM = {}; (BRIEF.refs || []).forEach((r, i) => { if (r && r.url) REFM[refKey(r.url)] = i; });   // 스크랩 카드 짝(url → refs 인덱스 · 운영자 260712 "참고 기사 = 인앱 팝업")
    const addLink = (label, url) => { try { const u = new URL(url); if (u.protocol !== 'http:' && u.protocol !== 'https:') return addText(label); const a = document.createElement('a'); a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = label; const ri2 = REFM[refKey(u.href)]; if (ri2 !== undefined) { a.classList.add('tbrief-ref'); a.dataset.tref = ri2; }; bt.appendChild(a); } catch { addText(label); } };
    let last = 0, m;
    while ((m = TOK.exec(txt))) {
      addText(txt.slice(last, m.index)); last = TOK.lastIndex;
      if (m[1]) { const b = document.createElement('b'); b.className = 'tb-em'; b.textContent = m[1].slice(2, -2); bt.appendChild(b); }   // **2층** = 강조색 없이 볼드만
      else if (m[2]) { /* 안 닫힌 **런(짝 없는 더블스타) = 리터럴 제거(과흡수·별표 누출 차단) */ }
      else if (m[3]) { const b = document.createElement('b'); b.textContent = m[3].slice(1, -1); bt.appendChild(b); }   // *1층* = 강조색 볼드
      else if (m[4]) { const mm = m[4].match(/^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/); addLink(mm[1], mm[2]); }
      else if (m[5]) { addLink(m[5], m[5]); }
    }
    addText(txt.slice(last));
  }
  // 이슈 원장 접이 주입(운영자 260714) — issues = 브리프 감쇠 기억장치(장기 투숙 이슈 1·2·3회 규칙)의 가시화. textContent만 = XSS 안전 · 없으면 hidden 유지(빈 접이 노이즈 0) · 접기 상태 = 렌더마다 접힘 초기화(마이크로 접이 = 비영속·tgroup localStorage 축과 별개)
  const led = box.querySelector('.tbrief-led');
  if (led && BRIEF) {
    const lx = (Array.isArray(BRIEF.issues) ? BRIEF.issues : []).filter(x => x && x.key).slice(0, 24);
    if (lx.length) {
      led.hidden = false;
      led.querySelector('.tbrief-led-n').textContent = lx.length;
      const lu = led.querySelector('.tbrief-led-l');
      lx.forEach(x => {
        const li = document.createElement('li'), k = document.createElement('span'), m2 = document.createElement('span');
        k.textContent = String(x.key).slice(0, 80); m2.className = 'tbl-m';   // 길이 캡 = 모델 산출 방어(평의회 보안 — DOM 비대 차단)
        m2.textContent = `${Math.max(1, x.n | 0)}회` + (x.last ? ` · ${String(x.last).slice(5, 10).replace('-', '/')}` : '');
        li.append(k, m2); lu.appendChild(li);
      });
      const lh = led.querySelector('.tbrief-led-h'), lw = led.querySelector('.tbrief-led-w');
      lh.addEventListener('click', () => { const op = lh.getAttribute('aria-expanded') === 'true'; lh.setAttribute('aria-expanded', String(!op)); lw.toggleAttribute('inert', op); });   // 개폐 = grid-rows CSS 전이 · inert = 접힘 시 SR/tab 제거(.geni-camsub 계승) · ⚠ 채널 브리프로 이식 시 id=tbLedL 파생 필수(tbLedL-chan 등 — 평의회 호환성)
    }
  }
  fillT('gt', '.trend-q', gtR.map(z => z[0].ko || z[0].query || ''));   // 구글 실시간 검색어 = ko(번역) 우선(운영자 260719 "검색어도 번역" · facebook→페이스북) · .trend-q textContent = XSS 안전 · 클릭 URL은 원문 query(ggUrl)
  fillT('sig', '.trend-q', sig.slice(0, 10).map(g => g.ko || g.query || ''));   // ⑨ 시그널 실검 · ko 우선
  fillT('nmu', '.trend-q', nmuL.map(g => g.query || ''));   // 나무위키 실시간 검색어(운영자 260929) · textContent 주입 = XSS 안전
  fillT('xsp', '.trend-q', _xRows.map(it => String(it.keyword || '')));   // X 급상승 · textContent = XSS 안전 · 모드와 무관 · 상한 10
  fillT('btr', '.trend-q', (d.bsky_trends || []).slice(0, 10).map(g => g.ko || g.query || ''));   // ⑦-b 블스 실시간 트렌드(운영자 260721 반갈 · textContent 주입 = XSS 안전 · ko = 미래 번역축 대비 동일 폴백)
  fillT('yt', '.tcard-t', ytGrid.map(v => v.title || ''));   // 유튜브 인기 그리드 제목 = ytGrid 동일 원본(260721 채움 리스트와 1:1 — 별도 slice면 채움분 제목 밀림)
  fillT('ytn', '.tcard-t', ytnL.map(v => v.title || ''));   // 뉴스 = 쇼츠 카드 통일 동승(운영자 260717 — zig 폐지·자연 순서) · 260731부터 youtube_cats 폴백 경로 전용(정상 국면은 아래 주제 루프가 담당)
  ytcL.forEach(z => fillT('ytc-' + z[0], '.tcard-t', z[2].map(v => v.title || '')));   // 주제별 인기 제목(운영자 260731) — 섹션 키 = ytc-<videoCategoryId> · textContent 주입 = XSS 안전(형제 fillT 관용구)
  // (구 ytn·syt 전용 oardefault 사다리 = 260804 제거 — **정본을 덮어써서 죽이던 코드**였다.
  //  경위 = 260803에 covImg가 커버 1순위를 oardefault→**oar2**로 바꾸면서 정본 사다리(tcOarDown +
  //  inline onload naturalWidth 가드)를 새로 세웠는데, 이 구 블록만 그대로 남아
  //  ⓐ `im.src.replace('oardefault',…)` 가 **한 글자도 안 맞아** steps 두 칸이 전부 oar2 자기 자신(무동작)
  //  ⓑ `im.onerror = down` · `im.onload = …` 재대입이 covImg가 심어둔 **인라인 tcOarDown 핸들러를 클로버**
  //  → 두 섹션(유튜브-뉴스 ytn · 유튜브-구독 syt)만 강등이 통째로 죽어 oar2 404의
  //  1097B·120×90 회색 「···」 판이 카드에 그대로 박혔다(260804 실측 = 구독 10칸 중 7칸 회색).
  //  ⚠ 404인데 본문이 정상 JPEG라 브라우저는 error가 아니라 **load로 그린다** = onerror만으론 영원히 못 잡는다.
  //  현재 경로 = covImg 인라인(oar2 → data-fb 수집 커버 → tcCovFail 워드마크)이 전 유튜브 블록 공통 =
  //  인기·쇼츠·AI·주제별과 **같은 사다리**로 통일(구 블록의 hq720 단은 oardefault 시절 축 = 승계 대상 아님).
  if (tkv.length && !tkCov) fillT('tk', '.trend-q', tkv.slice(0, 8).map(t => t.ko || t.title || ('@' + (t.account || ''))));   // 행 폴백일 때만(그리드는 아래 fillT) · ko = 한글 번역 우선
  fillT('syt', '.tcard-t', sytAll.map(v => v.title || ''));   // 구독 유튜브 그리드 제목(운영자 260719 카드화 · 260724 지역 무관 단일 리스트)
  if (tkL.length) { fillH('tk', '.tcard-t', tkL.map(t => dimTags(t.ko || t.title || ('@' + (t.account || ''))))); }   // 틱톡 인기 그리드 제목 = ko 한글 우선 + dimTags(끝쪽 영문 해시태그 회색 · esc 경유 XSS 안전 · 운영자 260719)
  // 구독 큐레이션 주입 = 지역 무관 단일 리스트(운영자 260724 — 구 한국/세계 2군 ['kr','gl'].forEach 폐지)
  fillT('sx', '.xcard-h b', sxAll.map(t => t.name || '@' + (t.account || '')));   // 표시 = 닉네임(운영자 260726 "@ 아이디 말고 닉네임으로" — "64비트사령부⚡️") · name = x_enrich 수집분 · 미보강·구데이터 = 종전 @핸들 폴백
  // (구 KEYWORD 1줄차 fillT = 운영자 260727 "엑스에 키워드는 빼줘"로 X 표면 소멸 — 스팬 자체를 안 그리니 주입 대상 0 · 데이터 축 kw·sum은 보존[스레드·검색이 계속 쓴다] · 스레드 주입은 #11199 유지)
  fillH('sx', '.xcard-tx', sxAll.map(t => t.text ? xlink(xtco(t.text)) : esc(t.sum || '')));   // 본문 = 원문 그대로(운영자 260726 "그가 적은 정확한 글") — 구 = AI 한줄요약 우선이라 트윗 문구가 화면에 없었다 · 원문 = x_enrich full_text(끝의 미디어 t.co는 수집이 절단 = 썸네일로 대체) · 링크 mut 래핑 유지 · 원문 결측(구데이터) = 요약 폴백   // (구 주석) 2줄차 = 한줄요약(sum · S+V+O · sns_sum.sh 생성) · 미생성 = 원문 폴백(링크 mut 래핑 · 블스 표현법 · 운영자 260717)
  fillT('stk', '.tcard-t', stkAll.map(t => t.ko || t.title || ('@' + (t.account || ''))));   // 틱톡 구독 그리드 = ko 한글 번역 우선
  fillT('sre', '.tcard-t', sreAll.map(t => t.ko || t.title || ('@' + (t.account || ''))));   // 인스타 구독 그리드 = ko 한글 번역 우선(260801 — 형제 stk와 같은 문법. sns_tr.py `_targets`가 subs.insta를 진작 번역해 ko를 달고 있었는데 **이 줄만 안 읽어** 해외 계정 캡션이 원어로 노출되던 사각 = 수집은 됐고 표시만 빠진 축)
  fillT('sth', '.xcard-h b', sthAll.map(t => '@' + (t.account || '')));   // ⑧ 스레드 구독(260713)
  // (구 fillT('sth','.xcard-kw',…) KEYWORD 줄 = 운영자 260831 "스레드 수집때 키워드 안가져오게"로 회수 — X 260727과 동형 · 카드 쪽 nokw=1 과 한 몸{한쪽만 남으면 fillT 인덱스 어긋남} · 데이터 kw는 잔존 = 재도입 시 이 줄+nokw 복원이면 끝)
  fillH('sth', '.xcard-tx', sthAll.map(t => t.text ? xlink(t.text) : esc(t.sum || '')));   // 본문 = 작성자 원문 그대로(운영자 260728 "그 사람의 텍스트를 문단 구분 포함해서 그대로" — X 원문 전환(11266 · 260726) 문법 미러 · 구 = 요약 우선이라 "작성자가 ~했다"만 보였다) · 문단 = .xcard-tx white-space:pre-line이 \n 보존 · 3줄+… 중략 = .xcard-tx.s2 클램프 정본 그대로(260801 4→3 고정 예약) · 원문 결측(구데이터) = 요약 폴백 · xtco(t.co 컷)는 X 전용 = 스레드 비적용
  fillT('rdd', '.tcard-t', rddL.map(p2 => p2.title || ''));   // ⑥ 레딧 — 카드 제목 슬롯(.tcard-t = 유튜브·틱톡 카드 계승 · 구 .trend-q 행 슬롯에서 이관) · textContent 주입 = XSS 안전   // 서브레딧 접두 `[r/sub] ` 폐지(운영자 260727 "항상 제목이 일정하게 들어오는데 저 일정한 부분 삭제") — 수집이 r/popular 단일 피드라 전 카드가 같은 접두를 달아 정보량 0 · 한글 번역(ko) 앞에 영문 토큰이 박혀 "영어로 나온다"는 인상까지 만들던 자리 · 되돌림 = 이 줄에 접두 map 복원(형제 hn·박스오피스도 접두 없는 문법 = 통일)
  // (구 fillT/fillH 'bsk' 게시물 주입 = 운영자 260721 "블루스카이는 실검만 사용" 섹션 소멸로 동반 제거 — 재도입 = git 이력)
  fillT('hn', '.trend-q', hnL.map(t => t.title || ''));   // ⑫ 해커뉴스(textContent 주입 = XSS 안전)
  fillT('dis', '.trend-q', dsl.slice(0, 10).map(t => t.title || ''));   // ⑭ 재난문자
  fillT('exw', '.trend-q', exw.slice(0, 10).map(t => t.title || ''));   // ⑯ 고속도로 돌발
  fillT('kob', '.trend-q', kobL.map(t => t.title || ''));   // ⑮ 박스오피스 — 제목만(운영자 260719 "10. 9. 제목에 중복") · 리스트 = kobL(1만 필터 동일 원본 — 별도 slice 재계산이면 행수 어긋나 제목 밀림) · 순위 = row .trend-rank 배지가 이미 표시라 접두 제거(형제 hn/reddit과 동일 문법)
  { const nm = box.querySelectorAll('[data-sec=fin-fx] .fin-nm'); finR.forEach((x, i) => { if (nm[i]) nm[i].textContent = (x.name || x.code) + (x.code === 'JPY' ? '(100)' : ''); }); }   // ⑬ 환율 통화명(XSS 안전) · 엔화만 100엔 기준 표시라 '(100)' 부착(값 = fxKrw ×100 · 다른 통화는 1통화 기준 무접미)
  { const nm = box.querySelectorAll('[data-sec=fin-cc] .fin-nm'); finC.forEach((c, i) => { if (nm[i]) nm[i].textContent = c.code; }); }   // ⑬ 코인 심볼
  { const nm = box.querySelectorAll('[data-sec=fin-idx] .fin-nm'); finI.forEach((x, i) => { if (nm[i]) nm[i].textContent = x.name || x.code; }); }   // ⑬ 지수명(코스피·코스닥 · XSS 안전)
  { const nm = box.querySelectorAll('[data-sec=fin-stk] .fin-nm'); finS.forEach((x, i) => { if (nm[i]) nm[i].textContent = x.name || x.code; }); }   // ⑬ 종목명(XSS 안전)
  // ⑬ 종목 3상태 촤르륵 회전(운영자 260719 · 260723 분할 재편 = 한화 환산→시가총액→달러 환산 · 5s · 위→아래 스태거 크로스페이드) — 재렌더마다 타이머 정리·재장전(누수 방지) · box 이탈 시 자가 해제 · fail-soft
  try {
    (window._finRot || (window._finRot = [])).forEach(clearInterval); window._finRot = [];
    const _stkRows = box.querySelectorAll('[data-sec=fin-stk] .fin-row'), _rotSt = box.querySelector('[data-sec=fin-stk] .fin-rot-st');
    if (_stkRows.length && finS.length > 1) {
      const _stName = ['가격 (원)', '시가총액', '가격 ($)'];   // 구 '가격'(통화 혼재) = 한화 통일로 대체 · 문구 = 운영자 260723 확정("달러환산 → 가격 ($) · 원화환산 → 가격(원)") · 환율 = finUsd(초기 렌더와 공용)
      const _capKrw = x => {   // 시총 = 원화 일괄(운영자 260721 · 환율 = 이 유닛 finR USD 시세) · "N조 M억( USD)?" 파싱 → 억 단위 수치 → USD면 ×환율 → 0.1조 단위 반올림 "0,000.0조"(운영자 260723 "0000.0조로 통일 · .0조 아래 반올림" — 구 십억 절삭 폐지) · ≥1경 = "N경 0000.0조"(조부 4자리 0패딩 = 경 자리 확보·간격 유지 · 운영자 260723) · 파싱 실패 = null(원문 폴백 fail-soft) · 뷰어 환산 = 스크래퍼 무접촉([15] 우회 · 기존 수집분 즉시 발효)
        const s = String(x.cap || ''), usd = /USD\s*$/.test(s) || x.cur === 'USD';
        const jo = +(((s.match(/([\d,.]+)\s*조/) || [])[1] || '0').replace(/,/g, '')), eok = +(((s.match(/([\d,.]+)\s*억/) || [])[1] || '0').replace(/,/g, ''));
        if (!jo && !eok) return null;
        let e = jo * 10000 + eok;
        if (usd) e *= finUsd;
        const t = Math.round(e / 1000) / 10;   // 억 → 0.1조 단위 반올림(절삭 아님)
        const g = Math.floor(t / 10000);
        return g ? g.toLocaleString() + '경 ' + (t - g * 10000).toFixed(1).padStart(6, '0') + '조' : t.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '조';
      };
      const _stCell = (x, st) => {
        if (st === 1) { const k = x.cap ? _capKrw(x) : null; return k ? esc(k) + '<i>원</i>' : (x.cap ? (x.cur === 'USD' ? esc(String(x.cap).replace(/\s*USD$/, '')) + '<i>$</i>' : esc(x.cap) + '<i>원</i>') : finStkVal(x)); }   // 시총 = 원화 일괄(파싱 실패 = 구 표기 · 결측 = 한화 폴백)
        if (st === 2) { const u = x.cur === 'USD' ? x.val : (x.val || 0) / finUsd; return esc(u.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })) + '<i>$</i>'; }   // 달러 통일 = 전 종목 소수1 반올림(운영자 260723 "0.n까지만 · 절삭 아닌 반올림" — 구 국내 정수/해외 소수2 혼재 통일)
        return finStkVal(x);
      };
      let _si = 0;
      const _t = __never(() => {
        try {
          if (!document.body.contains(_stkRows[0])) { clearInterval(_t); return; }   // box 이탈(재렌더로 교체·타 메뉴) = 자가 해제
          if (!_stkRows[0].offsetParent) return;   // 그 줄이 지금 **화면에 그려지기는 하는가**(260811 평의회2 실측 봉합) — 아래 가드는 「브라우저 탭이 뒤로 갔나」와 「모달이 떴나」만 보고 **자기가 숨겨졌는지는 안 봤다**. 실측 = 4탭 전부에서 이 줄이 0×0px(조상 `#trendview` 가 display:none)인데 12초에 38~69회 갈아끼우고 있었다 · 이것만 멈추자 같은 유휴에서 화면 그리기 요청이 61→91 로 **늘었다**(안 보이는 것에 뺏기던 프레임을 진짜 화면이 되찾음 = 「버벅임」의 실체). 트렌드 탭으로 가면 다음 틱에 그대로 따라잡는다(값은 `finS` 에 이미 있고 표시만 미룬다 · `_si` 미증가 = 회전 순서 무손실)
          if (document.visibilityState !== 'visible' || isComposingModalOpen()) return;   // 게이트 = 아래 형제(_tu 갱신시각) 정본 동값 계승(260807) — #13447 유지보수 규칙 「모달 뒤 DOM 접촉 타이머 필수 가드」를 이 타이머만 안 지키고 있었다(260727 시계 봉합에 미동반). 스킵분은 다음 틱 따라잡음(_si는 스킵 시 미증가 = 회전 순서 무손실). 실측 = 스튜디오 열어둔 유휴 CPU −72%(평의회 260807 6번 조)
          const _ns = (_si + 1) % 3;
          _stkRows.forEach((r, i) => setTimeout(() => { r.classList.add('fin-swap'); setTimeout(() => { const v = r.querySelector('.fin-v'); if (v && finS[i]) v.innerHTML = _stCell(finS[i], _ns); r.classList.remove('fin-swap'); }, 210); }, i * 60));
          _si = _ns;
          if (_rotSt) setTimeout(() => { _rotSt.textContent = _stName[_ns]; }, 210);   // 라벨 = 첫 행 전광판 콘텐츠 스왑(210ms)과 동시 교체(운영자 260723 "바뀔때 동시에 글자도" — 구 전 행 완료 후 rows×60+210 지연 폐지)
        } catch (e) { clearInterval(_t); }
      }, 5000);
      window._finRot.push(_t);
    }
    const _finUpdEl = box.querySelector('.tgroup-h .fin-upd');   // ⑬ 갱신시각 "nn분 전" 라이브(운영자 260723-3 "금융 시간 라이브로") — 1분마다 qAgo 재계산(재렌더 0 · textContent만) · 게이트 = 가시성(livePoll 문법) + 작성 모달(깜빡임 게이트 #13447 유지보수 규칙 — 모달 뒤 DOM 접촉 타이머 필수 가드 · 스킵분은 다음 틱 따라잡음) · 소멸 = _finRot 일괄 해제(재렌더) + box 이탈 자가 해제(회전 타이머 동일 문법)
    if (_finUpdEl && _finUt) {
      const _tu = setInterval(() => {
        try {
          if (!document.body.contains(_finUpdEl)) { clearInterval(_tu); return; }
          if (document.visibilityState !== 'visible' || isComposingModalOpen()) return;
          _finUpdEl.innerHTML = finUpdHtml();   // 공용 빌더 = 65분 경과 시 "(점검 필요)" 부착도 틱마다 동반 갱신(내용 = qAgo+정적 라벨 = XSS 무해)
        } catch (e) { clearInterval(_tu); }
      }, 60000);
      window._finRot.push(_tu);
    }
  } catch (e) {}
  fillH('sh', '.tcard-t', shL.map(t => dimTags(t.title || '')));   // 쇼츠 제목 = ko(정규화 패스) + dimTags(끝쪽 영문 해시태그 회색 · esc 경유 XSS 안전)
  fillT('ai', '.tcard-t', aiL.map(t => t.title || ''));   // 업로더(.tcard-acc) 전 섹션 제거(운영자 260712 #6) — 제목만
  box.querySelectorAll('.trend-tag').forEach((el2, i) => { el2.textContent = '#' + ((tk[i] || {}).tag || ''); });
  // 지역 전환(국내↔월드) = 위임 핸들러(.trail-rg [data-reg])로 이관 — 구 .trend-regseg 헤더 세그 핸들러 폐지(운영자 260713 세로 미니바)
  if (!box._trBound) {   // 위임 1핸들러 = box 유지·innerHTML만 교체라 1회 바인딩(중복 누적 방지)
    box._trBound = true;
    box.addEventListener('click', e => {
      const rf = e.target.closest('a.tbrief-ref');   // 브리프 스크랩 토픽 = 인앱 팝업(운영자 260712 "창 이동 없이 지금 창 위에") — 새탭 이동 대신 #trefdlg · 롱프레스/새탭 = href 보존 폴백
      if (rf && rf.dataset.tref !== undefined) { e.preventDefault(); openTref(+rf.dataset.tref); return; }   // data-tref 가드(260809) = 채널 요약이 같은 골드·이탤릭 부품(.tbrief-ref)을 게시물 참조로 재사용하는데 그쪽은 스크랩 원장이 없다 → 짝 인덱스 없는 링크는 여기서 가로채지 않고 href(인스타 게시물) 새 탭으로 흘린다(openTref(NaN) 차단)
      const rgb = e.target.closest('.trail-rg [data-reg]');   // 지역 미니바(한국/세계) = 지역 전환(운영자 260713 헤더 세그 → 세로바 이관 · nm_trend_region 기억 + 즉시 재렌더 · .trail-i 점프보다 선처리 = data-tg 없어 오탐 차단)
      if (rgb) { if (!rgb.classList.contains('on')) { try { localStorage.setItem('nm_trend_region', rgb.dataset.reg); } catch {} renderSnsTrends(); } return; }
      const ri = e.target.closest('.trail-i');   // 책갈피 레일 = 그룹 점프(TOP = 최상단 · scroll-margin-top 계승)
      if (ri) { const g2 = ri.dataset.tg; const sb = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; if (g2 === 'top') __scrollTo({ top: 0, behavior: sb }); else { const el2 = __byId('tg-' + g2); if (el2) { if (!el2.open) el2.open = true; el2.scrollIntoView({ behavior: sb, block: 'start' }); } } return; }   // 레일 점프 = 접힌 섹션이면 펼치며(촤르륵 애니 + toggle이 nm_trend_gfold 기억) 스크롤·IO 점등 = 좌측 네비 동시작동(운영자 260712 #2) · sb = 전정계 배려 rm 삼항(평의회7-⑤ 형제 통일)
      const nv = e.target.closest('.feednav[data-nav]');   // TOP 스택 좌우 넘김 화살표(운영자 260713) = 앵커·컨트롤보다 선처리 · adv(±1) 동작 인라인(box 스코프 = 스와이프 pointerup과 동일 상태 갱신)
      if (nv) { e.preventDefault(); box._tsLast = Date.now(); if (box._tsAdv) box._tsAdv(+(nv.dataset.nav || 0)); return; }   // 전진 = _tsAdv 단일 축(10위→11위 연속·꼬리 랩 · 운영자 260716)
      const mb = e.target.closest('.tstk-rst');   // 스택 컨트롤(↻ 처음부터) = 앵커보다 선처리 — 구 더보기·[처음|중간] 세그·처음 pill 폐지(운영자 260716·260717)
      if (mb) { e.preventDefault(); box._tsO = +(mb.dataset.go || 0); box._tsMore = false; box._tsLast = Date.now(); if (box._tsDraw) box._tsDraw(); return; }   // ↻·처음 = 모드 리셋(1~10 순환으로 복귀 — 재진입은 > 연속으로)
      if (box._tsSw) { const _swT = box._tsSw; box._tsSw = 0; if (Date.now() - _swT < 500 && e.target.closest('#tstk')) { e.preventDefault(); return; } }   // 스와이프 직후 클릭 = 항행 오탭 억제 — **스택(#tstk) 안 + 500ms 이내만**(운영자 260731 "TOP 10 내역 클릭 무반응" 봉합): 구 무조건 억제는 스와이프가 _tsDraw로 손가락 밑 앵커를 갈아치워 합성 click이 아예 안 오면 플래그가 잔류 → 그 다음 무관 클릭(TOP 10 행·카드)을 통째로 삼켰다(실측 260731 — 스와이프 후 1번째 탭 무반응·2번째만 열림). 스코프+TTL 이중 가드 = 잔류해도 무해(다음 클릭에서 소거만)
      const a = e.target.closest('a.tcard, a.xcard, a.trend-row, a.tlr, a.tsk');   // 인앱 임베드(운영자 260711 "웹앱 내 팝업 모달") — TOP 리스트(.tlr)·스택(.tsk) 포함 · 임베드 불가(실검 뉴스 등) = 종전 새 탭 · a.tpc 가지 제거(tpc 렌더 삭제 260720 평의회)
      if (!a) return;
      const _hrf = a.getAttribute('href') || '';
      if (!_hrf || _hrf === '#') { e.preventDefault(); return; }   // url 결측 카드(href="#") = 네이티브 새탭이 앱 복제본을 열던 실버그 차단(260720 평의회 F1 재현 — preventDefault가 trEmbed null 조기 return보다 뒤라 발화하던 순서 결함)
      const emb = trEmbed(a.dataset.emb || _hrf);   // data-emb = 게시물 본문이 공유한 영상(운영자 260727 "링크가 아니라 영상") — 있으면 글 임베드 대신 그 영상을 연다 · 없으면 종전 그대로(href)
      if (!emb) return;
      if (a.dataset.pt === '1' || a.closest('[data-sec=sh]')) emb.k = 'pt';   // 쇼츠 = 유튜브 임베드지만 세로 프레임(대시보드 행 = data-pt 마커)
      e.preventDefault();
      const si = a.dataset.si !== undefined ? +a.dataset.si : -1;   // 대시보드 항목 = 시퀀스 컨텍스트(모달 위로 넘김 = 다음 순위 인라인 · 운영자 260712)
      let seq = si >= 0 ? { arr: box._tsSeqX || box._tsSeq || [], i: si } : null;   // 스택/리스트 = _tsSeqX 절대 인덱스(첫N = topShow 동일참조라 정규/확장 공통 · data-si 절대화와 짝 · 운영자 260717 랩 봉합)
      if (!seq) {   // 쇼츠 루프 보편화(운영자 260712 "보기 편한 형식 다른 것들도" · 평의회④ 베스트픽) — 섹션 그리드/행도 같은 섹션 내 항목을 즉석 시퀀스로(임베드 불가 항목 = tvNav가 스킵)
        const secEl = a.closest('details.trend-sec, details.tgroup');
        const sibs = secEl ? [...secEl.querySelectorAll('a.tcard, a.trend-row, a.xcard')] : [];
        const k2 = sibs.indexOf(a);
        if (k2 >= 0 && sibs.length > 1) seq = { arr: sibs.map(x3 => ({ url: x3.dataset.emb || x3.getAttribute('href') || '', t: ((x3.querySelector('.tcard-t, .trend-q, .xcard-h b') || {}).textContent || ''), pt: x3.dataset.pt === '1' || !!x3.closest('[data-sec=sh]') })), i: k2 };
      }
      openTrView(emb, a, seq);
    });
  }
  // (구 [data-tsort] 정렬 전환 클릭 채널 = 운영자 260726 정렬바 폐지로 동반 제거 — 유일 사용처 sx·sth 소멸 · 재도입 = git 이력)
  box.querySelectorAll('.trend-sec').forEach(dt => dt.addEventListener('toggle', () => {   // 접힘 기억(toggle = 사용자 탭에만 발화 · 초기 파싱 open은 미발화)
    let st = {}; try { st = JSON.parse(localStorage.getItem('nm_trend_fold') || '{}') || {}; } catch { st = {}; }
    if (dt.open) delete st[dt.dataset.sec]; else st[dt.dataset.sec] = 1;
    try { localStorage.setItem('nm_trend_fold', JSON.stringify(st)); } catch {}
  }));
  box.querySelectorAll('details.tgroup').forEach(dt => dt.addEventListener('toggle', () => {   // 최상위 단위 접힘 기억(nm_trend_gfold · 운영자 260712)
    let st = {}; try { st = JSON.parse(localStorage.getItem('nm_trend_gfold') || '{}') || {}; } catch { st = {}; }
    if (dt.open) delete st[dt.dataset.g]; else st[dt.dataset.g] = 1;
    try { localStorage.setItem('nm_trend_gfold', JSON.stringify(st)); } catch {}
    const rail0 = box.querySelector('#trendRail');   // 접을/펼칠 때 좌측 레일도 그 섹션 점등 = 네비 싱크(운영자 260712 #2 "접을 때 동시작동" 방향)
    if (rail0) { const gid = dt.dataset.g === 'brief' ? 'top' : dt.dataset.g; rail0.querySelectorAll('.trail-i').forEach(b2 => b2.classList.toggle('on', b2.dataset.tg === gid)); }
  }));
  // 레일 스크롤스파이 = IntersectionObserver(현재 그룹 점등 · 상단 12~42% 밴드) — 재렌더마다 구 관측 해제(누수 방지)
  if (box._trIO) { try { box._trIO.disconnect(); } catch {} box._trIO = null; }
  const rail = box.querySelector('#trendRail');
  if (rail && 'IntersectionObserver' in window) {
    const mark = id => rail.querySelectorAll('.trail-i').forEach(b2 => b2.classList.toggle('on', b2.dataset.tg === id));
    box._trIO = new IntersectionObserver(es => {
      const v2 = es.filter(x => x.isIntersecting).sort((a, b2) => b2.intersectionRatio - a.intersectionRatio)[0];
      if (v2) { const gid = (v2.target.id || '').replace('tg-', ''); mark(gid === 'brief' ? 'top' : gid); }   // AI 요약 = 레일 TOP과 동권(레일엔 플랫폼+TOP만)
    }, { rootMargin: '-12% 0px -58% 0px' });
    box.querySelectorAll('.tgroup').forEach(g => box._trIO.observe(g));
  }
  // ── 앨범 스택(운영자 260712 "TOP1 크게+2·3만 · 위로 촤르륵 · 앨범 중첩 느낌") — TOP1 = 좌측 대형(세로 2행 스팬) · 2·3 = 우측 미니 · 순환 = mod(TOP10 끝 = 처음 랩) · 더보기 = 11위+(풀 확장·안 누르면 1위 랩) · 복귀 = 넘김 화살표 순환·꼬리 끝 ↻·11위+ ↻ 미니(구 '처음' pill·'처음|중간' 세그 폐지 260716·260717) · 입력 = main 스와이프/호버 휠 + 6s 자동(인터랙션 12s 홀드·화면 밖/탭 숨김 정지·reduced-motion 무효) ──
  box._tsSeq = topShow;   // 상위 10 = TOP 리스트와 동일 축(전체=플랫폼캡 top · 플랫폼=pool.filter 상위10)
  const xRest = TR_TOPF === 'all' ? pool.filter(p2 => !top.includes(p2)).slice(0, 20) : pool.filter(p2 => p2.mono === TR_TOPF).slice(10, 30);   // 확장 원천 = 잔여 풀 순위순 최대 +20(전체 = 캡 밖 잔여 · 플랫폼 = 그 mono 11~30위 = 구 _tsF 축)
  box._tsSeqX = topShow.concat(xRest);   // 확장 시퀀스 = top+잔여20(최대 30) 복원(운영자 260728 "10 넘어가면 15, 20 계속 + 10 이상 5의 자릿수 ↻" — 260721 10 봉인 해제 · 260716 원설계) · 첫 10 = topShow 동일참조(data-si 절대 인덱스 계약 유지) · ↻ 노출 = 히어로 10·15·20·25(home5 260718 히어로 축 그대로)
  if (box._tsO === undefined || box._tsTopf !== TR_TOPF) { box._tsO = 0; box._tsMore = false; box._tsLast = 0; box._tsTopf = TR_TOPF; }   // 첫 진입·필터 전환 = 스택 1위로 리셋(다른 시퀀스라 오프셋 이월 금지)
  const stkEl = box.querySelector('#tstk');
  if (stkEl) {
    const sArr = () => (box._tsMore ? box._tsSeqX : box._tsSeq);
    const sN = () => Math.max(1, sArr().length);
    const sAt = k => sArr()[((k % sN()) + sN()) % sN()];
    const sIdx = k => ((k % sN()) + sN()) % sN();
    const skCard = (it, r, mode) => {   // mode: 'hero'(1위 = 매거진 오버레이·제스처 타깃 .main) / 'mini'(2·3·4위 = 하단 3열) — 운영자 260712 10안 · 구 '더보기' 버튼 폐지(운영자 260716 — 넘김 화살표가 11위+ 연속 흡수)
      const isHero = mode === 'hero';
      if (!it) return '<span class="tsk mini tsk-empty" aria-hidden="true"></span>';   // 확장 꼬리 끝 = 빈 셀 유지(랩 채움 금지 — 운영자 260716 "그 뒤에 셀들이 비어버릴 텐데" 수용 · 레이아웃 3열 보존)
      const bd = `<span class="tpc-cat" style="color:${TR_PCOL[it.mono] || 'var(--mut)'}">${it.plat}</span><span class="tsk-t tpc-t${isHero ? '' : ' one'}"></span>` +
        `<span class="tpc-m"><span>${esc(it.rv || '')}</span>${it.ago ? `<span class="tpc-tm${it._fresh ? '' : ' old'}">${esc(it.ago)}</span>` : ''}</span>`;
      return `<a class="tsk ${isHero ? 'main mag' : 'mini'}" data-si="${r}"${it.pt ? ' data-pt="1"' : ''} href="${escUrl(it.url)}" target="_blank" rel="noopener">` +
        `<span class="tsk-cov"><b>${TR_LOGO[it.mono] || ''}</b>${it.th ? `<img loading="lazy" referrerpolicy="no-referrer" src="${escUrl(it.th)}" onerror="this.style.display='none'" alt="">` : ''}` +
        `<span class="tpc-rank${r < 3 ? ' top' : ''}">${r + 1}</span>` +
        (isHero ? `<span class="mag-ov tpc-bd">${bd}</span>` : '') + `</span>` +   // 히어로 = 제목 커버 위 오버레이 / 미니 = 커버 아래
        (isHero ? '' : `<span class="tpc-bd">${bd}</span>`) + `</a>`;
    };
    box._tsDraw = () => {   // 부분 재렌더(스택만 — 페이지 스크롤 무간섭 §7-1-6 정신)
      const O = box._tsO, i0 = sIdx(O);
      const rk = i0 + 1;   // 히어로(큰 카드) 1-based 순위
      const home5 = rk % 5 === 0 && rk >= 10 && rk <= box._tsSeqX.length;   // '처음으로' ↻ = 히어로(현재 큰 카드)가 10·15·20·25위일 때(운영자 260718 "10위가 새로고침 버튼 기준이어야 하는데 12로 돼있다" — 구 선두(lead=히어로+3) 기준 260717 → 히어로(rk) 기준 전환 = ↻ 노출 순위 7·12·17·22 → 10·15·20·25) · 정규 top10 = hero10에서 ↻ 노출(→는 11+ 확장) · more모드 = 15·20·25 · top<10(수집실패) = rk<10이라 자동 미노출 · 상한 rk ≤ _tsSeqX.length(꼬리 넘어 헛발 차단)
      const hasX = box._tsSeqX.length > sN();   // 11+ 확장분 존재 = 정규 모드 미리보기 연속 게이트(없으면 N위 루프 = 종전 랩 유지)
      const mAt = off => {   // 미니 look-ahead 콘텐츠 — 정규 모드도 상위N 경계 너머는 확장(11,12,13)으로 이어봄(운영자 260717 "10 다음 1,2,3 랩" 봉합) · 확장 모드·무확장 = 종전
        if (box._tsMore) return (i0 + off >= sN()) ? null : sAt(O + off);   // 확장 = 꼬리 랩 채움 금지(빈 셀)
        if (hasX) { const p = i0 + off; return p < box._tsSeqX.length ? box._tsSeqX[p] : null; }   // 정규+확장 = 절대전진 연속(소진 = 빈 셀)
        return sAt(O + off);   // 무확장(≤N) = 종전 N위 루프 미리보기(랩)
      };
      const mRk = off => (!box._tsMore && hasX) ? (i0 + off) : sIdx(O + off);   // 미니 순위·data-si = 콘텐츠 정합(연속 = 절대 인덱스 · 그 외 = 종전 wrap) — 클릭 핸들러 _tsSeqX 절대참조와 짝
      stkEl.innerHTML =
        `<div class="tstk-g roll">${skCard(sAt(O), i0, 'hero')}<div class="tstk-mini">${skCard(mAt(1), mRk(1), 'mini')}${skCard(mAt(2), mRk(2), 'mini')}${skCard(mAt(3), mRk(3), 'mini')}</div>` +
        (i0 > 0 ? `<button class="feednav prev" type="button" data-nav="-1" aria-label="이전">${CHEV_L_SVG}</button>` : '') +   // 1위 = ◀ 숨김(뒤 없음 · 운영자 260717) · 2위+ = 종전 ◀
        (rk >= 10 ? `<span class="tstk-cnt">${rk}/${box._tsSeqX.length}</span>` : '') +   // 10위+ = 현재 순위/전체 초미니 카운터(운영자 260716 "카운터 ㄱ") — 숫자 = 문자 렌더 허용 축(3-1) · 꼬리 끝에도 유지(30/30) · 하한 11→10·분모 sN()→_tsSeqX.length(260729): 첫 ↻(히어로 10위)가 정규 모드라 카운터 미출력 → 화면 최대 숫자가 미니 13이라 "↻가 13에서 뜬다"로 읽히던 것(운영자 260729 지적) 봉합 · ↻ 노출 순위(home5)는 무접촉 = 10·15·20·25·30 불변
        (home5 ? `<button class="feednav tstk-rst tstk-rst-sm" type="button" data-go="0" aria-label="처음으로" title="처음으로">${Q_REFR}</button>` : '') +   // 10·15·20·25위 = > 위 '처음으로' ↻(운영자 260717) · ↻ = 새로고침 픽토 차용일 뿐 뜻 = 1위 복귀 · 같은 열 축·픽토 중심 CSS right 정합
        `<button class="feednav next" type="button" data-nav="1" aria-label="다음">${CHEV_R_SVG}</button>` + `</div>`;   // > = 항상 노출 · 꼬리 끝 = 전진 로직이 처음 랩(_tsAdv · 운영자 260717) · .feednav 정본 계승(운영자 260713)
      const ts2 = [sAt(O), mAt(1), mAt(2), mAt(3)].filter(Boolean);
      stkEl.querySelectorAll('.tsk-t').forEach((el2, k2) => { el2.innerHTML = ts2[k2] ? dimTags(ts2[k2].t) : ''; });   // dimTags = 끝쪽 영문 해시태그 mut 회색(esc 경유 XSS 안전 · 운영자 260719)
    };   // 촤르르 = .tstk-g에 roll 직접 부여(신규 노드라 부착 즉시 재생 · 구 rAF classList.add 폐지 = opacity 0 안 거침 = 번쩍 0 · 운영자 260717)
    box._tsDraw();
    box._tsAdv = d => {   // 전진 단일 축(운영자 260716 — 화살표·스와이프·휠·드래그·6s 자동 공통): ① 10위서 +1 = 11위 연속 진입(구 '더보기' 흡수) ② 확장 꼬리 끝 +1 = 자연스럽게 처음 복귀(모드 리셋) ③ 그 외 = 종전 mod 순환 · _tsLast는 호출부 책임(자동 6s가 스스로 12s 홀드 걸던 축 차단)
      const cur = sIdx(box._tsO);
      if (d > 0 && !box._tsMore && cur === sN() - 1 && box._tsSeqX.length > sN()) { box._tsMore = true; box._tsO = box._tsSeq.length; }
      else if (d > 0 && box._tsMore && cur === sN() - 1) { box._tsMore = false; box._tsO = 0; }
      else box._tsO = box._tsO + d;
      box._tsDraw();
    };
    const adv = d => { box._tsLast = Date.now(); box._tsAdv(d); };
    if (!stkEl._bound) {
      stkEl._bound = 1;
      const swBlock = t => t.closest('.tstk-rst, .feednav');   // 컨트롤·화살표 위 = 스와이프 제외(클릭 전용) · 그 외 스택 전역 드래그(운영자 260713 "이 영역 밀면") — 구 더보기·세그·처음 pill 폐지(운영자 260716·260717)
      let tx = 0, ty0 = 0, tm2 = 0;
      stkEl.addEventListener('touchstart', e2 => { if (swBlock(e2.target)) { tx = 0; return; } tx = e2.touches[0].clientX; ty0 = e2.touches[0].clientY; tm2 = Date.now(); }, { passive: true });
      stkEl.addEventListener('touchend', e2 => {   // main 위 가로 스와이프 = 한 칸(좌 = 다음 · 우 = 이전) — 운영자 260712 "좌우로 넘기면 메인 창" · 세로는 touch-action:pan-y가 페이지 스크롤로 반환("스크롤 안 먹음" 봉합)
        if (!tx) return; const dx = e2.changedTouches[0].clientX - tx, dy2 = e2.changedTouches[0].clientY - ty0; tx = 0;
        if (Math.abs(dx) < 28 || Math.abs(dx) <= Math.abs(dy2) * 1.2 || Date.now() - tm2 > 900) return;   // 세로 우세 = 스크롤 의도(전환 오발 차단)
        box._tsSw = Date.now(); adv(dx < 0 ? 1 : -1);   // 시각 도장(구 1) = 위임 핸들러 TTL 가드 짝
      }, { passive: true });
      let wl = 0;
      stkEl.addEventListener('wheel', e2 => {   // 데스크톱 = main 호버 트랙패드 가로 스와이프(deltaX 우세일 때만) — 세로휠 무간섭 통과 = 페이지 스크롤 보전(운영자 260712)
        if (swBlock(e2.target)) return;
        const ax = Math.abs(e2.deltaX), ay = Math.abs(e2.deltaY);
        if (ax <= ay || ax < 12) return;
        e2.preventDefault();
        const n2 = Date.now(); if (n2 - wl < 450) return; wl = n2;
        adv(e2.deltaX > 0 ? 1 : -1);
      }, { passive: false });
      stkEl.addEventListener('pointerdown', e2 => {   // PC 마우스 드래그 = 가로 슬라이드(운영자 260712 "PC에서도 좌우로 슬라이드") — 포인터 캡처 = up이 요소 밖/교차여도 stkEl로 정확 수신(네이티브 드래그·요소 교차 변수 제거) · 터치 = 기존 touch 핸들러 전담(중복 방지)
        if (e2.pointerType !== 'mouse' || e2.button !== 0) return;
        if (swBlock(e2.target)) { box._tsMx = 0; return; }
        box._tsMx = e2.clientX; box._tsMy = e2.clientY; box._tsMt = Date.now(); box._tsCap = 0;
        e2.preventDefault();   // 이미지 고스트 드래그·텍스트 선택 차단(클릭은 그대로 발화 · 28px 미만 = 링크 클릭 유지)
      });
      // 포인터 캡처 = **28px 임계를 넘은 '진짜 드래그'에서만** 늦게 건다(운영자 260801 "top 10 클릭해도 반응 없음" 봉합).
      //   ⚠ 구 배선 = pointerdown 즉시 캡처 → 크로미엄이 mousedown/mouseup 호환 이벤트를 캡처 요소로 재타깃하고
      //   click은 그 둘의 공통 조상(#tstk = DIV.tstk-wrap)에 떨어진다 → 위임 핸들러의 closest('a.tsk')가 null +
      //   앵커 네이티브 활성화도 불발 = **PC 마우스로 스택 카드(히어로·미니 3장)를 눌러도 완전 무반응**
      //   (실측 260801 헤드리스 1780×1100: click 타깃 "DIV.tstk-wrap" · setPointerCapture만 무력화하면 "SPAN.tsk-cov"로 정상 복귀).
      //   지연 캡처 = 드래그의 캡처 이득(up이 요소 밖에서 끝나도 stkEl 수신)은 그대로, 제자리 클릭은 캡처 0 = 앵커가 click을 받는다.
      stkEl.addEventListener('pointermove', e2 => {
        if (e2.pointerType !== 'mouse' || !box._tsMx || box._tsCap) return;
        if (Math.abs(e2.clientX - box._tsMx) < 28) return;   // 임계 = 아래 pointerup 판정과 동일 28(축 1곳)
        box._tsCap = 1; try { stkEl.setPointerCapture(e2.pointerId); } catch {}
      });
      stkEl.addEventListener('pointerup', e2 => {
        if (e2.pointerType !== 'mouse' || !box._tsMx) return;
        const dx = e2.clientX - box._tsMx, dy2 = e2.clientY - box._tsMy; box._tsMx = 0; box._tsCap = 0;
        if (Math.abs(dx) < 28 || Math.abs(dx) <= Math.abs(dy2) * 1.2 || Date.now() - box._tsMt > 900) return;   // 터치 스와이프와 동일 임계 계승(좌 = 다음 · 우 = 이전)
        box._tsSw = Date.now(); box._tsLast = Date.now(); if (box._tsAdv) box._tsAdv(dx < 0 ? 1 : -1);   // 시각 도장(구 1) = 위임 핸들러 TTL 가드 짝 · 상태 전부 box(재렌더 생존) = 구렌더 클로저 무의존 · 전진 = _tsAdv 단일 축(운영자 260716)
      });
    }
    if (box._trRot) { clearInterval(box._trRot); box._trRot = null; }
    if (box._trRotIO) { try { box._trRotIO.disconnect(); } catch {} box._trRotIO = null; }
    const dashEl = box.querySelector('#tg-top');
    if (dashEl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {   // 자동 순환 = 구글식 '가만두면 넘어감' 계승(구 글로우 로테이션 → 스택 상승으로 이관)
      box._trRotVis = true;
      if ('IntersectionObserver' in window) { box._trRotVis = false; box._trRotIO = new IntersectionObserver(es => { box._trRotVis = !!(es[0] && es[0].isIntersecting); }, { threshold: .05 }); box._trRotIO.observe(dashEl); }
      box._trRot = __never(() => { if (document.hidden || !box._trRotVis || !dashEl.open || box._tsMx || Date.now() - (box._tsLast || 0) < 12e3 || Date.now() - (window._trInputTs || 0) < 8e3) return; if (box._tsAdv) box._tsAdv(1); else { box._tsO++; box._tsDraw(); } }, 6000);   // 단위 접힘 = 정지 · _tsMx = 마우스 드래그 중 정지(자동 순환이 드래그 도중 재렌더로 제스처 절단하던 충돌 봉합 — 헤드리스 실측 260712) · _trInputTs = 입력·스크롤 8s 유휴 게이트(평의회⑥ "능동 독서 중 6s 재부양 정지" — AMB 유휴 문법 계승 · 방치 시에만 자동 넘김)
    }
  }
}
let _tvPostId = '';
function tvPostPaint() {
  const b = $('#tvPost'); if (!b) return; b.hidden = !_tvPostId || typeof gyPosted !== 'function'; if (b.hidden) return;
  const on = gyPosted().has(_tvPostId); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '✓ 올림' : '올림';
}
const YT_CATS = [[25, '뉴스·정치'], [24, '엔터'], [17, '스포츠'], [28, '과학기술'], [26, '노하우·스타일'], [1, '영화·애니'], [27, '교육'], [15, '반려동물']];
function socClampChips(box) {
  if (!box) return;
  const old = box.querySelector('.soc-more'); if (old) old.remove();   // 재렌더 잔여 정리
  // ⚠ 이 함수는 **멱등이 아니다**(260811 평의회5 실측 · 구 주석의 「멱등」 단언은 거짓이었다). 같은 상자에 두 번 부르면
  //   넘침 배지 '…'가 되살아나지 않고 **사라진다** — 위에서 배지를 떼고 다시 재는데, 이미 잘려서 다 들어가는 상태라
  //   아래 `every` 에서 그대로 반환하기 때문이다(실측 = 1회 배지 1개 → 2회 0개 → 3회 0개 · 칩 개수는 불변).
  //   결과 = 소스가 잘려 있는데 잘렸다는 표시가 없어진다(화면 멀쩡·오류 0 = 조용한 무효화).
  //   → 호출부는 **이번에 새로 만든 카드만** 대상으로 삼아야 한다(renderSns `_fresh` 참조). 목록 전체를 훑는 형태로 두면
  //     「직전에 목록을 비웠다」는 적히지 않은 전제에 결과가 걸리고, 더보기·무한 스크롤·부분 갱신이 생기는 날 조용히 터진다.
  const chips = [...box.querySelectorAll('.soc-chip')];
  if (chips.length < 2) return;   // 1개 = 항상 1줄
  const rows = matchMedia('(max-width:559px)').matches ? 1 : 2;   // 모바일 = 1줄(운영자 260729) · PC(≥560) = 2줄 완화
  const top0 = chips[0].offsetTop, rowH = chips[0].offsetHeight || 20, limit = top0 + rowH * (rows - 0.5);   // 허용 줄수 경계 초과 = 넘침
  if (chips.every(c => c.offsetTop <= limit)) return;   // 허용 줄수 안에 다 들어감
  chips.forEach(c => { if (c.offsetTop > limit) c.remove(); });   // 넘침 칩 제거
  const more = document.createElement('span'); more.className = 'soc-chip soc-more'; more.textContent = '…';
  box.appendChild(more);
  let guard = chips.length;   // '…'가 3줄로 밀리면 앞칩을 하나씩 빼 2줄 유지(무한루프 가드)
  while (more.offsetTop > limit && guard-- > 0) {
    const rem = [...box.querySelectorAll('.soc-chip:not(.soc-more)')].pop();
    if (!rem) break; rem.remove();
  }
}
const socSendHtml = r => {
  const v = SOC_SENT.get(socKey(r));
  if (!v) return `<span class="soc-send asksend" role="button" tabindex="0" aria-label="이 화제를 뉴스 요약으로 보내기" title="뉴스 요약으로 보내기"><span>전송</span></span>`;
  if (v.q) return `<span class="soc-send asksend picked" role="button" tabindex="0" data-q="${esc(v.q)}" aria-label="요약 완료 — 열기" title="뉴스 요약 완료 — 탭하면 열림"><span aria-hidden="true">전송</span><span class="pkg">${SOC_PKDONE}</span></span>`;
  return `<span class="soc-send asksend picking" role="button" aria-disabled="true" tabindex="-1" aria-label="분석 중" title="뉴스 요약 대기열에 올라감 — 분석 중"><span aria-hidden="true">전송</span><span class="pkg">${SOC_PKLABEL}</span></span>`;
};
function socPick(sb) {   // 전송 성공 종단 → Pk-ng 전환(제자리 · 재렌더 없이). 폭 앵커 '전송' 스팬은 그대로 두고 라벨만 오버레이로 얹는다 = 박스 크기 변화 0.
  if (!sb || sb.classList.contains('picking')) return;
  if (!sb.querySelector('.pkg')) { const d = document.createElement('span'); d.className = 'pkg'; d.textContent = SOC_PKLABEL; sb.appendChild(d); }
  const t = sb.querySelector(':scope > span:not(.pkg)'); if (t) t.setAttribute('aria-hidden', 'true');
  sb.classList.add('picking'); sb.setAttribute('aria-disabled', 'true'); sb.setAttribute('tabindex', '-1');
  sb.setAttribute('aria-label', '분석 중'); sb.title = '뉴스 요약 대기열에 올라감 — 분석 중';
}
function socBindSend(list) {
  list._sendBound = true;
  list.addEventListener('click', async e => {
    const sb = e.target.closest('.soc-send'); if (!sb) return;
    e.preventDefault(); e.stopPropagation();   // 카드(앵커) 새 탭 전파 차단 — firing 중 재탭도 여기 도달해 흡수(.soc-send.asksend.firing pointer-events:auto와 짝 · 구판 .sending pointer-events:none 통과 = '전송하면 새창' 사고 봉합 · 운영자 260803 3차)
    if (sb.classList.contains('picked')) {   // Pk-ed = 그 요약 열기(메뉴1 PICKED 탭 = 피드 이동 계승) — 피드에서 빠졌으면 조용히 알림(qGo는 매칭 보장 전제라 직접 못 부른다)
      const q = sb.dataset.q || '';
      if (q && qMatch(q)) qGo(q); else qFlash('그 요약이 지금 피드에 없어');
      return;
    }
    if (sb.classList.contains('firing') || sb.classList.contains('picking')) return;   // 전송 중·분석 중(Pk-ng) 재탭 = 중복 발사 가드(preventDefault 뒤라 앵커로 안 샌다 · picking은 pointer-events:none을 못 써서 여기가 유일한 차단선 = firing과 동축)
    const card = sb.closest('.soc-item');
    const title = ((card && card.querySelector('.soc-title')) || {}).textContent || '';
    const url = (card && card.getAttribute('href')) || '';
    const sum = (card && card.dataset.sum) || '';
    const text = [title, url, sum].filter(Boolean).join('\n').slice(0, 12000);
    if (!text) { qFlash('보낼 내용이 없어'); return; }
    askHideCheck(sb); gaugeStart(sb);   // 요약 요청(#askSend) 상태머신 그대로 계승 = 1탭 발사·게이지 응답까지 점근(운영자 260803 3차 "전송버튼·애니메이션 일괄 통일" — 구 체크→arm 2탭 폐지)
    try {
      const r = await fetch('api/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, srcUrl: url, preset: { h24: 1, fp: 0, mj: 1, og: 0, noai: 1 } }) });   // preset = openAsk 기본 수집 프리셋 계승 · srcUrl = 이 카드의 커뮤니티 글 주소(대기열 행 ↗ 목적지 · 운영자 260804) — ⚠ link 가 아니다(link 는 ask.sh 가 '원문'으로 삼아 커뮤니티 글타래를 기사로 요약해버린다)
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        socSentAdd(socKey({ url, title }), d.id, socSnap(url, title));   // 원장 적재 = 성공 즉시(1.6s 종단 전에 재렌더가 끼어도 Pk-ng로 다시 그려진다) · d.id = asks 베이스 = Pk-ed 전이 추적키(구 서버 응답이면 '' → Pk-ng 유지 = fail-soft) · socSnap = 전송 시점 카드 스냅샷(다음 스캔에서 글이 회전해 빠져도 카드가 24h 잔류 = 운영자 260821 "전송 후에도 그 자리에")
        sb.classList.remove('done'); void sb.offsetWidth; sb.classList.add('done'); gaugeDone(sb);   // 성공 = settle 펄스 + 게이지 현위치→100% 급속 마무리(askSend 성공 경로 그대로)
        setTimeout(() => askShowCheck(sb), 300);   // 채움완료(gdone .3s)와 물려 ✓ 팝(멈칫 제거·askSend 동일 리듬)
        setTimeout(loadPending, 1200); setTimeout(loadPending, 4000);   // 대기열 배지 즉시 갱신(askSend 계승)
        setTimeout(() => { gaugeClear(sb); askHideCheck(sb); sb.classList.remove('done'); socPick(sb); }, 1600);   // 종단 = '전송' 원복이 아니라 Pk-ng(분석 중) 잔류(운영자 260804) — 리듬 1.6s·앞 단계는 종전 그대로
      } else { gaugeClear(sb); qFlash(d.error || `서버 ${r.status}`); sb.classList.add('shake'); setTimeout(() => sb.classList.remove('shake'), 420); }   // 실패 = 게이지 원복 + 흔들림(askSend 실패 경로 그대로)
    } catch { gaugeClear(sb); qFlash('전송 실패 (백엔드 배선 전이면 예상된 동작)'); sb.classList.add('shake'); setTimeout(() => sb.classList.remove('shake'), 420); }
  });
  list.addEventListener('keydown', e => { const sb = e.target.closest('.soc-send'); if (sb && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sb.click(); } });   // role=button 키보드 활성
}
function renderSns() {
  const list = $('#snsList'); if (!list) return;
  if (!list._sendBound) socBindSend(list);   // 카드 우상단 전송 버튼(.asksend 계승) = 뉴스 요약 전송(위임 1핸들러 · list 유지라 1회 바인딩)
  let _ss = '';   // 이번 렌더 구성 시그니처(행 ID·순서+검색어 · 아래서 선계산 = 커밋 스킵 판정용)
  if (!SOCIAL_LOADED) { list.innerHTML = `<div class="empty">${window.nmLoader?nmLoader('loading','Now loading…'):'Now loading…'}</div>`; _snsSig = ''; return; }
  const q = ($('#q') ? $('#q').value : '').trim().toLowerCase();
  const pool0 = SOCIAL.filter(r => socPass(r) || socPinned(socKey(r))).concat(socGhosts());   // 🔥 하한 컷(운영자 260818 SOC_MIN) — 검색 필터보다 **앞** = 검색해도 미달 카드는 안 뜬다 · 전송분(24h 잔류 창 안)은 컷 면제 + 수집 목록에서 빠진 전송분은 스냅샷(socGhosts) 합류(운영자 260821 "전송 후에도 그 자리에" — 정렬은 아래 burst 축 공용 = 있던 자리 언저리 유지 · 목록에 살아있으면 live 행이 정본이라 중복 0)
  const rows = q ? pool0.filter(r => ((r.title || '') + ' ' + (r.sources || []).join(' ')).toLowerCase().includes(q)) : pool0;
  const merged = rows.slice().sort((a2, b2) => (+b2.burst || 0) - (+a2.burst || 0));   // 버스트 내림차순(기존 정렬축 유지)
  if (!merged.length) { list.innerHTML = q ? '<div class="empty">검색 결과 없음</div>' : ''; _snsSig = ''; return; }   // 빈 메뉴 = 조용한 공백(§디자인 e) · 검색 중일 때만 상태 1줄
  _ss = merged.map(r => (r.url || r.title || '') + ',').join('') + '|' + q;   // 시그니처 선계산(행 ID·순서+검색어)
  if (_ss === _snsSig && list.childElementCount) return;   // 구성 완전 동일 = DOM 무접촉 스킵(평의회6 260707)
  list.innerHTML = '';
  const _socEl = SOC_LM ? Math.max(0, (Date.now() - SOC_LM) / 3600000) : 0;   // 경과 보정(운영자 260721 승인 · Q359 ㉠) — age_h = 스캔 시점 스냅샷이라 json 나이만큼 젊게 표기되던 것을 실시간化(표시 나이 = 스냅샷 + 파일 경과) · 앵커 결측 = 0(종전 표기 fail-soft)
  const _fresh = [];   // 이번 렌더가 만든 카드만 담는다 = 아래 일괄 클램프의 대상 집합(평의회5 260811 · 사유는 그 자리 주석)
  merged.forEach((r, i) => {
    const el = document.createElement('a');
    el.className = 'soc-item';
    el.href = r.url || '#'; el.target = '_blank'; el.rel = 'noopener';
    if (r.desc) el.dataset.sum = r.desc;   // 수집 스니펫 = 전송 시 요약 재료(본문 못 긁는 커뮤니티 폴백 · 운영자 260729)
    el.style.animationDelay = Math.min(i, 14) * 32 + 'ms';
    const ago = relAge(r._pinAge != null ? +r._pinAge : (+r.age_h || 0) + _socEl);   // 잔류 카드(_pinAge) = 전송 시점 나이 + 전송 후 경과(자기 앵커 — _socEl은 현재 파일 기준이라 남의 자) · 일반 행 = 종전 보정 그대로
    const _b = +r.burst || 0, _bt = _b >= SOC_HOT10 ? ' hot10' : _b >= SOC_HOT30 ? ' hot30' : '';   // 🔥 색 티어(상위~10% 보라 / ~30% 강조 · 표시 전용)
    // 출처성향 무게중심 — 네이버 3서비스→1 접기 + 진영당 1표 균등평균(글수 무시=방향만·강도는 🔥burst/글N/소스칩이 담당). 성향값 불변·성향불명 제외. 통합 단일원칙(분신술 11인·볼륨가중/클램프 폐지 260704).
    const _plat = {};   // 성향 플랫폼(네이버 접기)별 성향값 — 진영당 1표(글수 무관)
    (r.sources || []).forEach(s => { const v = socVal(s); if (v == null) return; _plat[NAVER_CHIP[s] ? '네이버' : s] = v; });
    const _pv = Object.values(_plat);
    const _mid = _pv.length ? _pv.reduce((a, b) => a + b, 0) / _pv.length : null;
    const _zone = _mid == null ? '' : (_mid <= 2 ? '강진보' : _mid <= 4 ? '약진보' : _mid <= 6 ? '중립' : _mid <= 8 ? '약보수' : '강보수');
    const _gauge = _mid == null ? '' : `<div class="soc-gauge" role="img" aria-label="출처성향 ${_zone}" title="출처성향: ${_zone} (커뮤 통념근사)"><span class="soc-dot" style="left:${((_mid - 1) / 8 * 100).toFixed(1)}%"></span></div>`;   /* 동그라미=흰색 단일(편향은 위치로) · 위치=(_mid-1)/8[성향값 1~9축, 옛 /9는 강보수 우끝 미달·중립 좌편향 버그·검토6인 260704] · title/aria=툴팁·a11y(시각 라벨은 요구'라벨없이' 존중) */
    el.innerHTML = `<div class="soc-top"><span class="soc-burst${_bt}">${FIRE_SVG} ${_b.toFixed(1)}</span><span class="soc-src">${LINK_SVG} ${r.source_count || 0}소스</span><span class="soc-posts">${(r.posts > r.source_count) ? `글 ${r.posts}` : ''}</span><span class="soc-agez">${ago ? `<span class="soc-age">${esc(ago)}</span>` : ''}</span>${socSendHtml(r)}</div>
      <div class="soc-title"></div>
      <div class="soc-srcs">${(r.sources || []).map(s => '<span class="soc-chip ' + socLean(s) + ' ' + socSrc(s) + '"></span>').join('')}</div>
      ${_gauge}`;
    el.querySelector('.soc-title').textContent = r.title || '';
    const chips = el.querySelectorAll('.soc-chip');
    (r.sources || []).forEach((s, k) => {
      const c = chips[k]; if (!c) return;
      const nv = NAVER_CHIP[s];
      if (nv) { c.innerHTML = nv.icon; c.appendChild(document.createTextNode(nv.label)); }   // 픽토(신뢰상수) + 짧은 라벨(텍스트노드=XSS안전)
      else c.textContent = s;   // 커뮤니티 소스명
    });
    list.appendChild(el);
    _fresh.push(el);
  });
  _fresh.forEach(el => socClampChips(el.querySelector('.soc-srcs')));   // 전 카드 부착을 끝낸 뒤 일괄 클램프(260811 실측 봉합) — 구판은 카드마다 `appendChild → offsetTop` 을 번갈아 해서
  //   추가할 때마다 문서 레이아웃이 처음부터 다시 계산됐다(레이아웃 스래싱). 카드 수만큼 반복되니 SNS 탭 진입이 통째로 멈춘다
  //   (실측 = 탭 전환 1회에 socClampChips 자체 443~678ms · 레이아웃 재계산 29~41회 241~363ms · 롱태스크 822~1,028ms).
  //   클램프 결과는 각 카드의 `.soc-srcs` 안 칩 배치에만 달렸고 카드끼리는 서로 영향을 안 주므로 시점을 뒤로 미뤄도 결과는 같다(화면 무변경).
  list.classList.toggle('no-anim', _searchRender);   // 검색 타이핑 = 스태거 생략(동일 구성 케이스는 위 커밋 스킵이 흡수 · 분신술 A2 계승 · 평의회6 260707)
  _snsSig = _ss;
}
let CHAN = null, CHANB = null, CHANB_FB = null, CHAN_FB = null, CHAN_TH = null, CHAN_GY = null, CHAN_SRC = 'ig', CHAN_AT = 0, CHAN_LOADING = false, CHAN_MET = 'views', CHAN_RANGE = '30', CHAN_BSEC = 'd3', CHAN_TPR = '7', CHAN_PROF_R = '30';
const chSrcData = s => s === 'fb' ? CHAN_FB : s === 'th' ? CHAN_TH : s === 'gyeol' ? CHAN_GY : CHAN;
const chActive = () => chSrcData(CHAN_SRC);
const CH_MET = { views: ['조회수', '회'], reach: ['도달', '계정'], profile_views: ['방문', '회'], interactions: ['상호작용', '회'], follows: ['팔로우', '명'], posts: ['게시', '개'] };
const CH_MET_TH = { views: ['조회수', '회'], likes: ['좋아요', '회'], replies: ['답글', '회'], reposts: ['리포스트', '회'], quotes: ['인용', '회'], followers: ['팔로워', '명'] };
const chMet = () => CHAN_SRC === 'th' ? CH_MET_TH : CH_MET;
const chFmtK = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(0) + 'K' : Math.round(n).toLocaleString();
const chVf = n => n == null ? '—' : n >= 1e8 ? (n / 1e8).toFixed(1) + '억' : n >= 1e4 ? Math.round(n / 1e4) + '만' : String(n);
function chPath(pts, curve) {   // 직선 M/L · 곡선 = Catmull-Rom→베지어(시안 검증 로직 이식)
  if (!curve || pts.length < 3) return pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
       + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
       + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}
let CH_HIT = [], CH_EV = [], CH_RUG = [];
function chBarcode(rows, W, H, mL, mR, mT, mB) {
  const n = rows.length, pw = W - mL - mR, X = i => mL + pw * (n === 1 ? .5 : i / (n - 1)), base = H - mB;
  const vMax = Math.max(1, ...rows.map(r => r.posts || 0)), Y = v => base - (base - mT - 14) * v / vMax;   // 14 = 최다일 「N개」 라벨 자리(원본 y-10 + 글자 높이 · 상단 선반 문법)
  const pitch = n > 1 ? pw / (n - 1) : pw, r0 = Math.min(2.7, pitch * .32), rBig = Math.min(4.6, pitch * .54);   // raw-ok: lieflat L3 원본 점 반지름 2.7·4.6 ÷ 칸 8.53 비
  const vs = rows.map(r => r.posts || 0), gap = Math.max(1, Math.round(6 * n / 90)), top3 = [];   // 최다 3일 = 서로 원본 6칸(90일 기준) 이상 떨어진 것만(라벨 충돌 0 · 원본 규칙)
  for (const i of [...vs.keys()].sort((a, b) => vs[b] - vs[a])) { if (!vs[i]) break; if (top3.every(t => Math.abs(t - i) >= gap)) top3.push(i); if (top3.length === 3) break; }
  CH_HIT = []; CH_EV = []; CH_RUG = [];
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  rows.forEach((r, i) => { if (r.posts != null) s += `<line x1="${X(i).toFixed(1)}" y1="${mT}" x2="${X(i).toFixed(1)}" y2="${base}" stroke="var(--line)" stroke-width=".7"/>`; });   // 바코드(결측일 = 줄 없음 = 0 과 구분)
  const pv = rows.filter(r => r.posts != null).map(r => r.posts), mean = pv.length ? pv.reduce((p, v) => p + v, 0) / pv.length : 0, mY = Y(mean);   // 평균 기준선(운영자 261024 「평균선도 나오면 괜찮을듯」) = chChart 평균선 문법 그대로(무채 점선 4 3 · 라벨 골드레몬)
  if (pv.length) s += `<line x1="${mL}" y1="${mY.toFixed(1)}" x2="${(W - mR).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="var(--mut)" stroke-width="1" stroke-dasharray="4 3" opacity=".6" vector-effect="non-scaling-stroke"/>`;
  rows.forEach((r, i) => {
    if (r.posts == null) return;
    const x = X(i), v = r.posts;
    CH_HIT.push({ x, y: v ? Y(v) : base, v, day: r.date, pc: r.posts, refs: r.post_refs });
    if (!v) return;
    const y = Y(v), wd = new Date(r.date + 'T00:00:00Z').getUTCDay(), we = wd === 0 || wd === 6, big = top3.includes(i);
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${base}" stroke="var(--accent)" stroke-width="1.1"/>`;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(big ? rBig : r0).toFixed(2)}" fill="${we ? 'var(--bg)' : 'var(--accent)'}" stroke="var(--accent)" stroke-width="${we ? 1.2 : 0}"/>`;
    if (big) s += `<text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="var(--fg)">${v}개</text>`;
  });
  if (pv.length) s += `<text x="${(mL + 4).toFixed(1)}" y="${(mY - 4).toFixed(1)}" text-anchor="start" font-size="9" fill="var(--accent-4)" style="paint-order:stroke;stroke:var(--bg);stroke-width:3px">평균 ${mean < 10 ? (Math.round(mean * 10) / 10) : chFmtK(mean)}개</text>`;   // 라벨 = 막대 위에 얹되 바탕색 테(원본 lieflat 라벨 문법) · 10 미만 = 소수 1자리(일평균 1.4개 등 · 게시 타일 「개/일」 동축)
  let lastM = '', lastX = -1e9;   // 월 라벨 = 그달 첫 실측일 · 앞 라벨과 원본 판 4칸 이상 떨어질 때만(겹침 0)
  rows.forEach((r, i) => { const m = r.date.slice(5, 7); if (m === lastM) return; lastM = m; if (X(i) - lastX < 34) return; lastX = X(i); s += `<text x="${X(i).toFixed(1)}" y="${H - 7}" font-size="8" font-weight="600" fill="var(--mut)" letter-spacing=".12em">${+m}월</text>`; });
  return s + '</svg>';
}
function chChart(series, key, events) {   // 큰 라인차트 — 진짜 날짜축 · 결측 = 선 끊김 · 변곡 이벤트 마커 · 강조색 글래스 톤
  // 종료 앵커 = 이 지표의 마지막 실측일(후행 결측일 제외 · 운영자 260718 요청2·5) — 달력 마지막날 기준 창은 최근 결측(예: views 07-12 이후 수집 null)이면 7일 창에 실측점 1개뿐 → 빈 차트 + 라인 종료점(마지막 실측일)과 우측 축 라벨(달력 마지막날)·차트 길이 불일치. 마지막 실측일에 창을 앵커해 "직전 N일 실측"을 그림(시작·종료·축 길이 정합)
  let endI = -1;
  for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { endI = i; break; }
  if (endI < 0) return '';
  const end = endI + 1;
  const i0 = CHAN_RANGE === 'all' ? 0 : Math.max(0, end - parseInt(CHAN_RANGE, 10));
  const rows = series.slice(i0, end), n = rows.length;
  const W = 600, H = 150, mL = 46, mR = 16, mT = 14, mB = 26, pw = W - mL - mR, ph = H - mT - mB;
  const vals = rows.map(r => r[key]).filter(v => v != null);
  CH_HIT = []; CH_EV = [];
  if (vals.length < 2) return '';
  if (key === 'posts') return chBarcode(rows, W, H, mL, mR, mT, mB);   // 게시 수 = 바코드 막대사탕(운영자 261024 · 위 chBarcode)
  // 직전 동일길이 창(고스트 비교 · 운영자 260718 "바로 반영" + "90일 전문 프로그램같다 저런스타일 굿" = 밀도 리치룩 채택) — 유한 창(7/30/90) 전부 직전 N일 겹쳐 '전 대비'(90일 직전선 다발 = 운영자가 선호한 프로페셔널 룩) · 전체(all)만 제외(직전 창 없음) · 값들을 mx에 포함해 현재선 스케일 점프 방지
  const gRaw = (CHAN_RANGE !== 'all' && i0 > 0) ? series.slice(Math.max(0, i0 - n), i0).map(r => r[key]) : [];
  const mn = 0; let mx = Math.max(...vals, ...gRaw.filter(v => v != null)); mx += mx * .08 || 1;
  const X = i => mL + pw * (n === 1 ? 0 : i / (n - 1)), Y = v => mT + ph * (1 - (v - mn) / (mx - mn));
  const segs = []; let cur = [];
  rows.forEach((r, i) => { const v = r[key]; if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push([X(i), Y(v), v, r.date, r.posts, r.post_refs]); });
  if (cur.length) segs.push(cur);
  CH_HIT = segs.flat().map(p => ({ x: p[0], y: p[1], v: p[2], day: p[3], pc: p[4], refs: p[5] }));   // refs = 그날 게시물[{permalink,name,views,r}](운영자 260718 "ㄱㄱ 하" 링킹 · post_refs 소비)
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  for (let g = 0; g <= 3; g++) {   // hairline 격자 + Y라벨
    const v = mn + (mx - mn) * g / 3, y = Y(v);
    s += `<line x1="${mL}" y1="${y.toFixed(1)}" x2="${W - mR}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    s += `<text x="${mL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--mut)">${chFmtK(v)}</text>`;
  }
  s += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${(H - mB).toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;   // Y축 세로줄 = 대값·칩 좌측정렬 스파인(운영자 260715 "3.2/2.1/1.1 라인에 세로줄")
  // 직전기간 고스트선(운영자 260718 · 감독 P0#1) — 같은 x축에 겹쳐 '전 대비'(지난 N일) 비교 · 무채 점선 대시 2 4(평균선 4 3과 차별)·저알파·데이터 뒤 배경 레이어(draw order 최하단 = 겹침 참사 방지)
  if (gRaw.length >= 2) {
    const gpts = []; gRaw.forEach((v, j) => { if (v != null) gpts.push([X(j), Y(v)]); });
    if (gpts.length >= 2) {
      s += `<path d="${chPath(gpts, 1)}" fill="none" stroke="var(--mut)" stroke-width="1.4" stroke-dasharray="2 4" opacity=".42" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
      const gm = gpts[Math.max(0, Math.floor(gpts.length / 2) - 1)];
      s += `<text x="${gm[0].toFixed(1)}" y="${(gm[1] - 4).toFixed(1)}" font-size="8" fill="var(--accent-4)" opacity=".7">직전</text>`;   // 주석 라벨색 = 골드레몬(운영자 260723 "이런 부분들 다 노랑 팔레트" · 조회수 외 전 지표탭 공용) — 참조선 자체(무채 대시)는 맥락 크롬 유지, 라벨만 강조
    }
  }
  // 평균 기준선(운영자 260718 "각 부분[7/30/90]마다 평균선을 쭉") — 선택 기간(rows) 실측값 평균을 수평 점선으로 · 표준 dataviz 참조선(reference line) 관례: 무채 점선(데이터 accent 라인과 대비·변곡 리더 톤 계승) + 라인 끝 직접 라벨(별도 범례 대신 "평균 N")·데이터 아래(참조 배경) · 기간 바꾸면 vals 재산출 = 창별 평균 자동
  const mean = vals.reduce((p, v) => p + v, 0) / vals.length, mY = Y(mean);
  s += `<line x1="${mL}" y1="${mY.toFixed(1)}" x2="${(W - mR).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="var(--mut)" stroke-width="1" stroke-dasharray="4 3" opacity=".6" vector-effect="non-scaling-stroke"/>`;
  s += `<text x="${(mL + 4).toFixed(1)}" y="${(mY - 4).toFixed(1)}" text-anchor="start" font-size="9" fill="var(--accent-4)">평균 ${chFmtK(mean)}</text>`;   // 라벨 = 좌측 시작점 · 색 = 골드레몬(운영자 260723 · 참조선 무채 유지)(우측 끝 = 마지막 강조점·변곡 주석 상주 혼잡대 회피 · text-anchor start)
  (events || []).forEach(e => {   // 운영자 관측 변곡 마커(무채 점선 = 주석 크롬 · insta_events.json) · 호버 = 그 일자 값+요약(운영자 260715)
    const idx = rows.findIndex(r => r.date === e.date);
    if (idx < 0) return;
    const x = X(idx), ev = rows[idx][key];   // ev = 그 일자 현재 지표 값(없으면 null → 리더는 바닥 앵커·호버점 생략)
    const py = ev != null ? Y(ev) : (H - mB);   // 리더가 가리키는 데이터점(값 없으면 바닥선)
    CH_EV.push({ x, y: ev != null ? Y(ev) : mT + 12, date: e.date, label: e.label || '', note: e.note || '', v: ev });
    const eRt = x > W - mR - 70, dir = eRt ? -1 : 1;   // 우측단 = 좌향 꺾임(차트 밖 삐침·'글씨 튀는 것' 방지 · 260713 계승)
    const shelfY = Math.min(mT + 5, py - 9), hEnd = x + dir * 17;   // 라벨 선반(항상 점 위 9px+)·수평 꺾임 길이 17(---- 또렷)
    // 점선 리더 = 데이터점 → 위로(수직) → 팔꿈치 한 번 꺾임 → 라벨쪽(수평) : 세로선 대신 그 점을 정조준(운영자 260715 "---- 한번 꺾이는 점선")
    s += `<path d="M${x.toFixed(1)} ${py.toFixed(1)}L${x.toFixed(1)} ${shelfY.toFixed(1)}L${hEnd.toFixed(1)} ${shelfY.toFixed(1)}" fill="none" stroke="var(--mut)" stroke-width="1" stroke-dasharray="3 3" opacity=".6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    const eLab = esc(String(e.label || '').split('·')[0].slice(0, 12));
    s += `<text x="${(hEnd + dir * 3).toFixed(1)}" y="${(shelfY + 3).toFixed(1)}" font-size="8" fill="var(--accent-4)" text-anchor="${eRt ? 'end' : 'start'}">${eLab}</text>`;   // 변곡 주석 라벨 = 골드레몬(운영자 260723 "알고리즘 회복 조짐 등 노랑") · 리더 점선은 무채 크롬 유지
  });
  segs.forEach(seg => {
    const pts = seg.map(p => [p[0], p[1]]);
    if (pts.length === 1) { s += `<circle cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" r="2.5" fill="var(--accent)"/>`; return; }
    const line = chPath(pts, 1);
    s += `<path d="${line} L${pts[pts.length - 1][0].toFixed(1)} ${H - mB} L${pts[0][0].toFixed(1)} ${H - mB} Z" fill="rgba(var(--accent-rgb),.10)" stroke="none"/>`;
    s += `<path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  });
  CH_RUG = [];
  if (key !== 'posts') rows.forEach((r, i) => {   // 게시일 = x축 rug 눈금(운영자 260713 한 수·개수는 툴팁 병기)
    // 바닥선(H-mB)에 앵커된 짧은 세로 눈금 — 구 floating 점(cy=H-mB-4)은 선이 높이 오르면 곡선과 뚝 떨어져 '따로노는 점'으로 보였음(260713 수리)
    if (r.posts) { const _ab = r[key] != null && r[key] > mean;   // 평균 초과 게시일 = 러그 굵게·밝게·높게 강조(운영자 260718 "평균 뚫은 날 = 이 게시물" · 성과-콘텐츠 직결) · 이하 = 은은(성과 러그 위계)
      s += `<line x1="${X(i).toFixed(1)}" y1="${(H - mB).toFixed(1)}" x2="${X(i).toFixed(1)}" y2="${(H - mB - (_ab ? 7 : 5)).toFixed(1)}" stroke="var(--accent-bright)" stroke-width="${_ab ? 2.6 : 2}" stroke-linecap="round" opacity="${_ab ? '.95' : '.45'}" vector-effect="non-scaling-stroke"/>`;
      // 게시일 탭 히트밴드(운영자 260718 "각 부분에 어떤 게시물 올렸는지 링킹") — 러그 2px는 탭 부적격 → 밴드폭 확장(≥히트영역) · 하단 바닥 존(변곡주석 상단 밴드와 수직 분리 = 히트 경합 0) · CH_RUG로 팝오버 배선
      CH_RUG.push({ x: X(i), date: r.date, pc: r.posts, refs: r.post_refs || [] });
      s += `<rect class="ch-rug-hit" data-ri="${CH_RUG.length - 1}" x="${(X(i) - 11).toFixed(1)}" y="${(H - mB - 11).toFixed(1)}" width="22" height="16" fill="transparent" style="cursor:pointer"/>`; }
  });
  // 데이터점 마커(운영자 260718 요청2 "각 7일마다 수치 위 점") — 점이 성길 때(7일 등 ≤16점)만 각 실측점에 찍음 · 조밀 구간(90일·전체)은 크로스헤어 툴팁으로 대체(마커 난잡 방지 = 표준 라인차트 dataviz 관례) · 스타일 = 마지막 강조점 톤 계승(accent 필 + bg 링 = 라인과 분리)
  if (CH_HIT.length <= 16) CH_HIT.forEach(p => {
    s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="var(--accent)" stroke="var(--bg)" stroke-width="1.6"/>`;
  });
  // 극값(피크·트로프) 자동 콜아웃(운영자 260718 "바로 반영" · 감독 P0#2) — 데이터점 마커 문법 계승 · 피크=accent-bright 큰 점+라벨(위·clamp) / 트로프=무채 링+라벨(아래·clamp) · 값 라벨 = 헤더 대값(=최근일)과 다른 지점이라 260713 '끝점 값라벨 중복' 판례 비대상(끝점·평탄 = 생략) · x 라벨 clamp = 엣지 삐침 방지
  if (CH_HIT.length >= 3) {
    let pk = CH_HIT[0], tr = CH_HIT[0];
    CH_HIT.forEach(p => { if (p.v > pk.v) pk = p; if (p.v < tr.v) tr = p; });
    const lastP = CH_HIT[CH_HIT.length - 1], lx = v => Math.max(mL + 20, Math.min(W - mR - 20, v));
    const nearEv = x => CH_EV.some(e => Math.abs(e.x - x) < 42);   // 이벤트 주석과 상단 선반 공유 → 극값 라벨 억제(이벤트 우선 · 큐레이터 de-confliction) · 마커 점은 유지(값은 호버 툴팁)
    if (pk.v !== tr.v) {
      if (pk !== lastP) {
        s += `<circle cx="${pk.x.toFixed(1)}" cy="${pk.y.toFixed(1)}" r="4.2" fill="var(--accent-bright)" stroke="var(--bg)" stroke-width="2"/>`;
        if (!nearEv(pk.x)) s += `<text x="${lx(pk.x).toFixed(1)}" y="${Math.max(mT + 9, pk.y - 8).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="var(--accent-bright)" font-weight="700">피크 ${chFmtK(pk.v)}</text>`;
      }
      if (tr !== lastP) {
        s += `<circle cx="${tr.x.toFixed(1)}" cy="${tr.y.toFixed(1)}" r="3" fill="none" stroke="var(--mut)" stroke-width="1.5"/>`;
        if (!nearEv(tr.x)) s += `<text x="${lx(tr.x).toFixed(1)}" y="${Math.min(H - mB - 3, tr.y + 13).toFixed(1)}" text-anchor="middle" font-size="8" fill="var(--accent-4)">최저 ${chFmtK(tr.v)}</text>`;   // 최저 라벨 = 골드레몬(운영자 260723) · 트로프 링(무채)은 유지
      }
    }
  }
  if (CH_HIT.length) {
    const last = CH_HIT[CH_HIT.length - 1];
    s += `<circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="4" fill="var(--accent)" stroke="var(--bg)" stroke-width="2"/>`;
    // 값 텍스트 라벨 제거(260713) — 차트 위 헤더 .ct-v(대값·최근일)·툴팁과 중복이라 우측 이벤트 주석과 겹쳐 '따로노는 글씨'로 보였음(정보 손실 0)
  }
  s += `<text x="${mL}" y="${H - 7}" font-size="9" fill="var(--mut)">${esc(rows[0].date.slice(2).replace(/-/g, '/'))}</text>`;
  s += `<text x="${W - mR}" y="${H - 7}" text-anchor="end" font-size="9" fill="var(--mut)">${esc(rows[n - 1].date.slice(2).replace(/-/g, '/'))}</text>`;
  CH_EV.forEach((e, ei) => {   // 변곡 주석 호버 히트영역 = 라벨·팔꿈치 덮는 상단 밴드(리더 방향 따라 좌/우 · 최상단 투명 = 크로스헤어보다 우선 히트)
    const eRt = e.x > W - mR - 70;
    s += `<rect class="ch-ev" data-ei="${ei}" x="${(eRt ? e.x - 84 : e.x - 6).toFixed(1)}" y="${(mT - 2).toFixed(1)}" width="90" height="24" fill="transparent"/>`;
  });
  return s + '</svg>';
}
function chTileChart(series, key, mode, unit) {   // 타일 미니 차트(운영자 260721 — 팔로워·조회수 세로 2칸 도형 안) · 창 = 프로필 세그(CHAN_PROF_R) · 우측 끝 = 오늘(마지막 실측일 앵커 = chChart 문법) · 좌측 = N일 전 · mode zero = 0 기준선(팔로워 일일 증감) / avg = 창 평균 기준선(조회수 평균 대비 오르내림)
  let endI = -1;
  for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { endI = i; break; }
  if (endI < 0) return '';
  const end = endI + 1;
  const i0 = CHAN_PROF_R === 'all' ? 0 : Math.max(0, end - parseInt(CHAN_PROF_R, 10));
  let rows = series.slice(i0, end);
  const f0 = rows.findIndex(r => r[key] != null); if (f0 > 0) rows = rows.slice(f0);   // 창 앞머리 결측 트림(운영자 260722 "팔로워 차트 한쪽 쏠림 — 7일 빼고 다 문제") — follower_net 실측 9일 vs 30/90/전체 창 = 좌측 빈 대역이 실측점을 우측에 압착 → 첫 실측일을 좌변으로 당겨 전폭 사용 · 7일·조회수(전기간 실측) = f0=0 무변 · 창 내부 결측은 종전 segs 끊김 유지
  const n = rows.length;
  const vals = rows.map(r => r[key]).filter(v => v != null);
  if (vals.length < 2) return '';   // 실측 2점 미만 = 조용한 공백(§디자인 e-가)
  const W = 200, H = 96, mL = 6, mR = 8, mT = 16, mB = 6, pw = W - mL - mR, ph = H - mT - mB;
  const mean = vals.reduce((p, v) => p + v, 0) / vals.length;
  let mn = mode === 'zero' ? Math.min(0, ...vals) : Math.min(...vals), mx = Math.max(...vals);   // zero 하한 = min(0, 실측) — 순감소 음수 방출 시 하단 클립 방어(평의회2)
  if (mx === mn) mx = mn + 1;   // 평평 시리즈(신규 0 연속 등) 스케일 가드
  const pad = (mx - mn) * .12; if (mode !== 'zero' || mn < 0) mn -= pad; mx += pad;   // zero도 음수 실재 시 하단 pad — 0선 아래 감소 구간이 바닥변에 밀착해 안 보이던 것 방어(운영자 260722 1)
  const X = i => mL + pw * (n === 1 ? 0 : i / (n - 1)), Y = v => mT + ph * (1 - (v - mn) / (mx - mn));
  const pts = [], segs = []; let _cur = [];   // 결측 = 선 끊김(chChart segs 문법 정합 · 평의회2 — 구 단일 path = 공백을 직선 보간하던 것 교정)
  rows.forEach((r, i) => { if (r[key] == null) { if (_cur.length) segs.push(_cur); _cur = []; return; } const pt = [X(i), Y(r[key]), r[key]]; _cur.push(pt); pts.push(pt); });
  if (_cur.length) segs.push(_cur);
  let s = `<svg class="ch-tc" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  const HALO = ` paint-order="stroke" stroke="var(--bg)" stroke-width="3" stroke-linejoin="round"`;   // 텍스트 배경 헤일로(운영자 260722 "차트와 지표 겹치지 않게") — 라인·에어리어 위 라벨을 배경색 테로 절연(표준 콜아웃 처리 · 지오메트리 이동 없이 전 구간 안전) · 전 텍스트 공용
  // xy축 배경 격자(운영자 260722 D "정형화 · 아래 큰 차트처럼") — 옅은 수평 hairline 4선 + 좌 Y축 세로 스파인(Y라벨 없이 = 미니 공간 보존) · 데이터 뒤 배경(draw order 최하단 = 겹침 참사 방지)
  for (let g = 0; g <= 3; g++) { const gy = mT + ph * g / 3; s += `<line x1="${mL}" y1="${gy.toFixed(1)}" x2="${(W - mR).toFixed(1)}" y2="${gy.toFixed(1)}" stroke="var(--line)" stroke-width="1" opacity="${g === 3 ? '.75' : '.4'}" vector-effect="non-scaling-stroke"/>`; }
  s += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${(H - mB).toFixed(1)}" stroke="var(--line)" stroke-width="1" opacity=".55" vector-effect="non-scaling-stroke"/>`;   // Y축 세로 스파인(chChart 계승)
  const baseV = mode === 'zero' ? 0 : mean, bY = Y(baseV);   // 기준선: 팔로워 = 0(X축) · 조회수 = 창 평균(운영자 260721 — 평균선 점선 4 3 = chChart 정본 계승)
  s += `<line x1="${mL}" y1="${bY.toFixed(1)}" x2="${W - mR}" y2="${bY.toFixed(1)}" stroke="var(--mut)" stroke-width="1"${mode === 'zero' ? '' : ' stroke-dasharray="4 3"'} opacity=".55" vector-effect="non-scaling-stroke"/>`;
  if (mode !== 'zero') s += `<text x="${mL + 2}" y="${(bY - 3.5).toFixed(1)}" font-size="8" fill="var(--fg)"${HALO}>평균 ${chVf(Math.round(mean))}</text>`;   // 흰색(운영자 260722 "평균 72만 저 라인도 흰색") + 헤일로(라인 비겹침)
  const _uid = 'tc' + key;   // clip id = 지표당 1회 렌더라 key 유니크
  const hasDn = vals.some(v => v < baseV);   // 기준선 아래 실측 존재 여부 — 없으면(팔로워 전량 ≥0 등) 종전 단색 유지(0선 정착점 half-stroke 붉은 실틈 방지 · 클립 미발행)
  if (hasDn) s += `<defs><clipPath id="${_uid}U"><rect x="0" y="0" width="${W}" height="${bY.toFixed(1)}"/></clipPath><clipPath id="${_uid}D"><rect x="0" y="${bY.toFixed(1)}" width="${W}" height="${(H - bY).toFixed(1)}"/></clipPath></defs>`;
  segs.forEach(seg => {   // 세그별 라인+area(결측 경계 = 끊김)
    if (seg.length === 1) { s += `<circle cx="${seg[0][0].toFixed(1)}" cy="${seg[0][1].toFixed(1)}" r="2" fill="${seg[0][2] < baseV ? 'var(--danger)' : 'var(--accent)'}"/>`; return; }   // 고립점도 기준선 아래 = danger(하락 의미색 동조)
    const line = chPath(seg.map(p => [p[0], p[1]]), 1);
    const area = `${line} L${seg[seg.length - 1][0].toFixed(1)} ${(H - mB).toFixed(1)} L${seg[0][0].toFixed(1)} ${(H - mB).toFixed(1)} Z`;
    if (!hasDn) { s += `<path d="${area}" fill="rgba(var(--accent-rgb),.10)" stroke="none"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`; return; }   // 전량 기준선 위 = 종전 단색(area 글래스 필 = chChart 정본)
    s += `<path d="${area}" fill="rgba(var(--accent-rgb),.10)" stroke="none" clip-path="url(#${_uid}U)"/><path d="${area}" fill="rgba(var(--danger-rgb),.13)" stroke="none" clip-path="url(#${_uid}D)"/>`;   // 기준선 위 = 민트 유지 · 아래 = danger 저알파(운영자 260722 — 조회수 음영 정본 축을 팔로워 0선에도 동일 적용 · fd-dn 하락 의미색 · 신규 색 0)
    s += `<path d="${line}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" clip-path="url(#${_uid}U)"/><path d="${line}" fill="none" stroke="var(--danger)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" clip-path="url(#${_uid}D)"/>`;   // 선 자체도 기준선 아래 구간 = danger로 절환(운영자 260722 1·2 "아래로 갈때/아래 구간 = 선도 빨간색" — 동일 path 2회 + U/D 클립 = 교차점 정밀 절단)
  });
  // Y 최소·최대 마커 = 무채움 원 + 직선(꺾임 없음) 수직 점선 리더 + 흰색 값(운영자 260722 C "일자로·차트 비겹침·박스 내·흰색글씨") — 마지막 점(Today) 동일 인덱스 = 생략(Today가 대표)
  let iMx = 0, iMn = 0; pts.forEach((p, i) => { if (p[2] > pts[iMx][2]) iMx = i; if (p[2] < pts[iMn][2]) iMn = i; });
  const _anch = x => x > W - mR - 22 ? ['end', x - 1] : x < mL + 22 ? ['start', x + 1] : ['middle', x];   // 박스 밖 삐침 방지 = 텍스트 앵커로(ㄱ자 꺾임 대신 · 점 x에 부착 유지 = 직선 리더)
  (iMx === iMn ? [[iMx, 1]] : [[iMx, 1], [iMn, 0]]).filter(([mi]) => mi !== pts.length - 1).forEach(([mi, isMax]) => {
    const x = pts[mi][0], y = pts[mi][1], v = pts[mi][2], a = _anch(x);
    s += `<circle data-mk="1" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="none" stroke="var(--fg)" stroke-width="1.3" vector-effect="non-scaling-stroke"/>`;
    const ey = isMax ? Math.max(10, y - 12) : Math.min(H - 4, y + 13);   // max=위·min=아래 (직선 수직 · 박스 내 클램프 = 상하변 잘림 방지)
    s += `<path d="M${x.toFixed(1)} ${(isMax ? y - 4 : y + 4).toFixed(1)}L${x.toFixed(1)} ${(isMax ? ey + 2 : ey - 7).toFixed(1)}" fill="none" stroke="var(--mut)" stroke-width="1" stroke-dasharray="3 3" opacity=".65" vector-effect="non-scaling-stroke"/>`;
    s += `<text x="${a[1].toFixed(1)}" y="${ey.toFixed(1)}" font-size="8" fill="var(--fg)" text-anchor="${a[0]}"${HALO}>${chVf(v)}</text>`;   // 값 = 흰색(운영자 260722) + 헤일로
  });
  { const lp = pts[pts.length - 1], tx = lp[0], ty = lp[1];   // Today = 마지막 점(우측 끝 = 오늘) — 직선 수직 리더(꺾임 없음 · 운영자 260722 C "일자로 한 다음 Today") · 위쪽 점=아래 라벨 / 아래쪽 점=위 라벨(팔로워 하단 = 위로) · 값 흰색·Today 라임(--accent-2)
    const _hi = ty <= H / 2;   // 점이 상단 절반 = 라벨 아래 직선 / 하단 절반 = 라벨 위 직선(둘 다 꺾임 0 · 우측 끝이라 text-anchor end로 박스 내 유지)
    const ey = _hi ? Math.min(H - 10, ty + 14) : Math.max(15, ty - 16);
    s += `<circle data-mk="1" cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="2" fill="var(--accent-2)" stroke="none"/>`;
    s += `<path d="M${tx.toFixed(1)} ${(_hi ? ty + 3 : ty - 3).toFixed(1)}L${tx.toFixed(1)} ${(_hi ? ey - 8 : ey + 3).toFixed(1)}" fill="none" stroke="var(--accent-2)" stroke-width="1" stroke-dasharray="3 3" opacity=".75" vector-effect="non-scaling-stroke"/>`;   // 직선 수직(꺾임 0)
    s += `<text x="${(tx - 1).toFixed(1)}" y="${ey.toFixed(1)}" font-size="8" font-weight="700" fill="var(--accent-2)" text-anchor="end"${HALO}>Today</text>`;
    s += `<text x="${(tx - 1).toFixed(1)}" y="${(_hi ? ey + 8 : ey - 8).toFixed(1)}" font-size="8" fill="var(--fg)" text-anchor="end"${HALO}>${chVf(lp[2])}</text>`; }   // 값 = 흰색(운영자 260722 "흰색글씨") · Today와 붙여 표기 · 박스 내 · 헤일로 = 스파이크 라인과 절연(운영자 260722 겹침 지적)
  s += `<text x="${(mL + 1).toFixed(1)}" y="7.5" text-anchor="start" font-size="7.5" fill="var(--fg)"${HALO}>(단위: ${esc(unit)})</text>`;   // 좌상단(운영자 260722) · 표기 = "(단위: 명)" 괄호·콜론(운영자 260722) · 흰색 --fg(운영자 260722 "좌상단에 (단위: 명) 흰색으로" — 구 mut·opacity .8 폐지) + 헤일로
  return `<div class="ch-tchart">${s}</svg></div>`;
}
const SIG_ORD = { hour_band: ['새벽0-6', '오전6-11', '점심11-14', '오후14-18', '저녁18-22', '밤22-24'], dow: ['월', '화', '수', '목', '금', '토', '일'] };
const SIG_CAP = { hour_band: '시간대별 공유 수', dow: '요일별 공유 수' };
const SIG_CAP_FB = { hour_band: '시간대별 반응 강도', dow: '요일별 반응 강도' };
const SIG_GEN = {
  hour_band: { '새벽0-6': 22, '오전6-11': 60, '점심11-14': 74, '오후14-18': 82, '저녁18-22': 100, '밤22-24': 78 },
  dow: { '월': 84, '화': 86, '수': 88, '목': 90, '금': 94, '토': 100, '일': 96 }
};
const CORE_TH = .85;
let SIG_HIT = {};
const SIG_ARG = {};
function chLiftChart(buckets, ax, x2) {   // x2 = 오버레이 재료(운영자 260719 "ㄱ 고도화 뭐든") — {peaks: 접속 피크 시각[], now: KST 시각, today: KST 요일} · 전부 선택(없으면 조용히 생략 = fail-soft)
  x2 = x2 || {};
  SIG_ARG[ax] = [buckets, x2];
  const ord = SIG_ORD[ax] || [];
  const bs = (buckets || []).slice().sort((a, b) => { const ia = ord.indexOf(a.bucket), ib = ord.indexOf(b.bucket); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  if (bs.length < 2) return '';
  const val = (b, k) => (b.lift || {})[k] ?? null;
  const vals = [], valsAll = [];
  bs.forEach(b => { const s2 = val(b, 'share_pm'); if (s2 != null) { valsAll.push(s2); if (!b.low_sample) vals.push(s2); } });   // Y범위 = 공유 단독(운영자 260723 "저장 삭제·공유로 통일") — 저장 축 제거로 공유 곡선이 세로폭 최대 활용
  if (valsAll.length < 2) return '';
  if (vals.length < 2) vals.splice(0, vals.length, ...valsAll);   // ⚠ 표본부족 칸(low_sample · n<5)은 자를 안 잡는다(운영자 261025 「이상한 점은 판단」 — 90일 창 실측 = 밤22-24 n=4 ×3.08 한 칸이 자를 3배로 늘려 나머지 곡선을 납작하게 눌렀다) · 믿을 칸 둘 미만 = 종전(전부로)
  const W = x2.w || 600, H = 154, mL = 46, mR = 16, mT = 16, mB = 26, pw = W - mL - mR, ph = H - mT - mB;   // W = x2.w(폰 = 실폭 재렌더 · 좌표 1 = CSS 1px라 라벨 8~9·충돌 임계 70/10이 설계 그대로 실제 px — 운영자 261024 폰 4~5px 판독불가 수리 · 새 값 0) · 없으면 600 고정(PC 불변) · mB·H = 일일 추이(chChart) 단일줄 라벨 규격 계승 — n= 병기 줄 제거(운영자 260722)로 2줄 예약 해제 · 플롯 높이 ph=112 불변
  const cH = [];   // 버킷 중심 좌표(h 단위) — hour: "새벽0-6" 범위 파싱 중심시각 · dow: 요일 인덱스×24+12(주간 168h 타임라인 · 운영자 260724 "요일별 0-8/8-16/16-24 3개씩") · 실패 밴드 있으면 선형축·시각 오버레이 전체 스킵 = fail-soft·창작 0
  if (ax === 'hour_band') bs.forEach(b => { const m = /(\d+)\s*-\s*(\d+)/.exec(b.bucket); cH.push(m ? (+m[1] + +m[2]) / 2 : null); });
  if (ax === 'dow') bs.forEach(b => { const di = ord.indexOf(b.bucket); cH.push(di < 0 ? null : di * 24 + 12); });
  const SPAN = ax === 'dow' ? 168 : 24;   // 선형축 전장 = 하루 24h / 한 주 168h
  const hlin = cH.length === bs.length && cH.length > 1 && !cH.some(c => c == null);   // 선형 시간축(운영자 260723 "24분할 해서 숫자만" · 260724 요일 3분할 동조) — X = 실제 시각 비례 배치 = 눈금·핵심 구간 경계 세로변·지금/오늘 마커가 같은 자 위에 정렬
  const X = i => hlin ? mL + pw * cH[i] / SPAN : mL + pw * i / (bs.length - 1);   // Y·lo·hi = 아래 GEN_EFF 뒤로 이관(260809 6차 = 노란선이 같은 자를 쓰므로 Y범위 산출에 참여한다)
  // 실측 우선 게이트(운영자 260803 "내 팔로워 접속 실측이 있어? 그러면 그걸 붙이면 매우 좋을듯 · 그에 따라서 보라색 강조점도 맞춰") — x2.curve = online_curve_kst(내 팔로워 online_followers API 실측 · KST 24슬롯 · 피크=100 · insta_signals 산출). 시간대 축 한정: 24슬롯을 밴드 평균으로 내려 SIG_GEN(공개 벤치 실루엣) '값만' 대체 → 노란선·툴팁·핵심구간·접속피크가 한 실측 원천(시각 문법 전부 불변 = 260801 "표현방법은 기존과 동일" 동축). 6밴드 전원 산출일 때만 채택(부분 결측 = 벤치 폴백) · dow = 260804 실측 승격 배선(x2.curve = online_dow_kst 요일 7키 — 원장 7요일×24시 커버부터 산출기가 동봉 = 자동 전환 · 그전 = 종전 벤치) · FB = 종전 null 경로 · 곡선 부재 = 종전 100% 불변(fail-soft·창작 0)
  // ⚠ 260809 3차(운영자 "팔로워 접속이 아니구 · 팔로워 접속은 강조색1번이잖아 · 앱 사용자 접속인데") — 260803·260804 실측 승격 **철회**.
  //   이 노란선의 역할은 원래 「내 채널(터콰이즈 = 강조색1 = 팔로워) 위에 겹치는 **바깥 레퍼런스**」(운영자 260723 "일반적인 사용자들 기준으로 그 차트 위에 오버레이 · 어찌보면 이 평균이 더 중요")인데,
  //   그 자리를 내 팔로워 접속 실측(online_followers)이 덮으면서 두 선이 **둘 다 내 계정 축**이 됐다 = 비교 대상이 사라진다(라벨도 「팔로워」/「팔로워 접속」으로 이름이 겹쳤다).
  //   게다가 실측 = 요일 편차 2.7%p · 시간대 후반 고원 = 신호가 거의 없다(팔로워 풀 65,501에 피크대 47% 포화 = 구조적) → 레퍼런스로도 못 쓴다.
  //   벤치(SIG_GEN)는 **국내 기준**이고 편차 = 시간대 78%p · 요일 16%p로 실제로 크다(운영자 "전세계로 지정되어서 그런게 아닌지" 검증 결과 = 아니다).
  //   → 노란선 = 항상 SIG_GEN(앱 사용자 접속). 팔로워 접속 실측은 폐기하지 않고 **접속 피크 밴드**(아래 bandLabs = 내가 올릴 시각 결정)로 계속 산다 = 역할 분리.
  const GEN_MEAS = null;   // 승격 철회 = 항상 벤치 경로(아래 전 소비처가 이 값으로 분기 · 실측 재승격 시 여기만 되살린다)
  const GEN_EFF = CHAN_SRC === 'fb' ? null : (GEN_MEAS || SIG_GEN[ax] || null);   // 단일 유효 소스(아래 전 소비처 공용 — 실측 우선·벤치 폴백·FB null)
  // ⚠ 자 통일(운영자 260809 6차 "그렇게 아이디어 2) 보완해주고") — 두 곡선이 **서로 다른 자**를 쓰던 걸 하나로 합친다.
  //   구판 = 터콰이즈는 데이터 산포(lo~hi) 자동 스케일 / 노랑은 0~100을 ph×.82에 **고정 매핑** → 두 선의 상하 관계에 물리적
  //   의미가 없었다(260801 주석이 이미 인정한 사실 · 그래서 핵심 구간은 픽셀 교차를 버리고 곱셈[도달 기대값]으로 옮겼다).
  //   그런데 260809 4차 「보완 필요」는 다시 그 픽셀 관계를 쓴다 = 눈에 보이는 그림과는 맞지만 자가 둘인 채였다.
  //   → 노랑을 **자기 평균으로 나눠 ×배율**로 환산(시간대 22·60·74·82·100·78[평균 69.3] → ×0.32·0.87·1.07·1.18·1.44·1.13)하면
  //   공유 lift와 **같은 단위**가 되어 같은 Y축에서 읽힌다("저녁엔 사람이 ×1.44 몰리는데 내 공유는 ×1.05" = 숫자로 확정).
  //   새 상수·새 데이터 0 = 이미 그리는 값을 자기 평균으로 나누기 한 번. ⚠ 핵심 구간(sc = 공유 × gen/100)은 **완전 불변** —
  //   전 버킷에 같은 상수가 곱해지므로 피크·임계 T·교차 보간이 모두 같은 배수로 스케일돼 산술적으로 약분된다(gpts[2] = 원 0~100 유지).
  //   ⚠ 비용 = Y범위가 노랑 진폭까지 담아 넓어지므로 **터콰이즈 곡선이 그만큼 납작해진다**(시간대 실측 = 플롯 높이 점유 100%→38%).
  //   요일 축은 노랑 ×0.93~1.11이 공유 산포(0.75~1.20) 안쪽이라 범위·모양 **변화 0**.
  const genR = {};   // 버킷 → ×배율(gen ÷ 그 축 gen 평균)
  if (GEN_EFF) {
    const _gv = Object.values(GEN_EFF).filter(v => typeof v === 'number');
    const _gm = _gv.length ? _gv.reduce((a, c) => a + c, 0) / _gv.length : 0;
    if (_gm > 0) Object.keys(GEN_EFF).forEach(k => { if (typeof GEN_EFF[k] === 'number') genR[k] = GEN_EFF[k] / _gm; });
  }
  bs.forEach(b => { const r = genR[b.bucket]; if (r != null) vals.push(r); });   // Y범위 참여 = 같은 자 계약(구판은 공유 단독 · 노랑이 고정 매핑이라 범위 밖이었다)
  const lo = Math.max(0, Math.min(...vals, 1) - .1), hi = Math.max(...vals, 1) + .1;
  const Y = v => mT + ph * (1 - (v - lo) / (hi - lo));
  const Yc = v => Math.max(mT, Math.min(mT + ph, Y(v)));   // 자 밖 표본부족 칸 = 플롯 끝에 붙여 그린다(속빈 점 · 실제 값·n·「표본부족」 = 툴팁) · 자 안 값 = Y 그대로(전 기간 = 변화 0)
  SIG_HIT[ax] = bs.map((b, i) => { const sv = val(b, 'share_pm'); return { x: X(i), y: sv != null ? Yc(sv) : Y(1), bucket: b.bucket, share: sv, n: b.n, low: !!b.low_sample, gm: GEN_MEAS ? 1 : 0, gen: genR[b.bucket] != null ? Math.round(genR[b.bucket] * 100) / 100 : null }; });   // gen = ×배율(구 0~100 % 표기 → 공유와 같은 자 · 툴팁 문법 동조)   // FB 소스분기(평의회 260724 must-fix) — GEN_EFF가 FB=null → 툴팁 % 자동 생략(곡선·범례 제거와 단일 정합) · gm = 실측 채택 플래그(툴팁 라벨 분기)
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  for (let g = 0; g <= 3; g++) {   // hairline 격자 + ×배율 Y라벨(chChart 문법)
    const v = lo + (hi - lo) * g / 3, y = Y(v);
    s += `<line x1="${mL}" y1="${y.toFixed(1)}" x2="${W - mR}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
    s += `<text x="${mL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--mut)">×${v.toFixed(2)}</text>`;
  }
  s += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${(H - mB).toFixed(1)}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;   // Y축 스파인(일일 추이 세로줄 계승)
  const hourX = hh => hlin && ax === 'hour_band' ? mL + pw * Math.max(0, Math.min(24, hh)) / 24 : null;   // 시각(0~24h) → x = 선형 시간축 그대로(hour 전용 — 접속 피크·지금 마커 · 파싱 실패 = null = 시각 오버레이 생략 fail-soft)
  // 표본 볼륨 언더레이(무채 저알파 바) — 게시 몰림 편향(스크래퍼 flags)을 숨기지 않고 시각화 · n 라벨과 동축(운영자 260719 고도화)
  const maxN = Math.max(...bs.map(b => b.n || 0), 1), bw = Math.min(26, pw / bs.length * .42);
  bs.forEach((b, i) => { const bh = (b.n || 0) / maxN * ph * .26; if (bh > 0) s += `<rect x="${(X(i) - bw / 2).toFixed(1)}" y="${(H - mB - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="var(--mut)" opacity=".13"/>`; });
  // 일반 인스타 이용자 평균선(운영자 260723 요청 → 260723 교정: 노랑 실선·저장 삭제 후 공유와 2선 비교) — 전체 IG 이용자 평균 이용 강도(SIG_GEN · 자체 정규화 피크=100 → 플롯 .82 높이 · 상단 콜아웃 선반 여유) · 볼륨 뒤 배경층(공유 곡선은 위 = 채널 실데이터 우선) · 실선 노랑(--accent-4 · 팔레트 정본 · 운영자 "노란색·실선") · 점·area 없음 = 공유(터콰이즈 선+점+area)와 형태 분리 · 결측 버킷 = 조용히 생략(fail-soft·창작 0)
  const shoulder = pts => { if (!hlin) return pts; const a = pts[0], b = pts[pts.length - 1], dl = a[0] - mL, dr = W - mR - b[0], D = dl + dr, yW = D > 0 ? b[1] + (a[1] - b[1]) * dr / D : (a[1] + b[1]) / 2; return [[mL, yW], ...pts, [W - mR, yW]]; };   // 선형 시간축 벽 종점 = 주기(순환) 보간 한 값(운영자 260810 "아이디어 ㄱ") — 구 「첫/끝 밴드 값 수평 연장」은 좌·우 벽이 같은 순간(자정 24=24 · 일24시=월0시)인데 서로 다른 밴드 값을 그려 이음매 절벽(실측 = 시간대 터콰이즈 ×1.00↔×0.68 · 노랑 ×0.32↔×1.12) → 끝 밴드 중심↔(한 바퀴 너머) 첫 밴드 중심을 벽 시각에서 선형 보간 = 곡선이 밴드 사이를 잇는 기존 문법을 자정 이음매에 동일 적용(새 데이터·상수 0 · 보간값은 항상 두 밴드 사이 = Y범위 이탈 0) · 좌·우 벽 동일값 = 순환 폐합 · 곡선·area가 스파인·우변에 붙는 실루엣·교차 산출 원본 좌표 사용 = 불변
  const gen = GEN_EFF;   // 단일 유효 소스(260803 실측 GEN_MEAS 우선 · 벤치 SIG_GEN 폴백 · FB = null 종전 경로 — 위 실측 우선 게이트) → 곡선·핵심구간·범례 자동 제거(gen null = fail-soft 그대로)
  let gpts = null, gl = '';
  if (gen) {
    const _g = bs.map((b, i) => { const gv = gen[b.bucket], gr = genR[b.bucket]; return (gv == null || gr == null) ? null : [X(i), Y(gr), gv]; });   // y = 공유와 **같은 자**(Y · 260809 6차 자 통일) — 구 `(H-mB) − gv/100 × ph×.82` 고정 매핑 폐기 · [2] = 원 0~100 유지(핵심구간 sc 불변)
    if (_g.length >= 2 && _g.every(Boolean)) { gpts = _g; gl = chPath(shoulder(_g).map(p => [p[0], p[1]]), 1); }
  }
  const spts = []; bs.forEach((b, i) => { const v = val(b, 'share_pm'); if (v != null) spts.push([X(i), Yc(v), !!b.low_sample]); });   // 팔로워(공유) 곡선 좌표 = 핵심 구간 산출·시리즈 렌더 공용(단일 산출)
  const sx0 = spts.length && !hlin ? spts[0][0] : mL, sx1 = spts.length && !hlin ? spts[spts.length - 1][0] : W - mR;   // area 폐합 x = 숄더 반영 양끝(비선형축 = 기존 첫/끝 점 그대로)
  const sline = spts.length >= 2 ? chPath(shoulder(spts).map(p => [p[0], p[1]]), 1) : '';
  // 핵심 구간 = 팔로워 파도 아래 세로 커튼(운영자 260723 재개정: 음영 바닥 = X축 정지 — 눈금·요일 라벨 행 침범 금지 · 축 살짝 관통 = 양옆 세로변 선분만 · "인덱싱까지 이어짐"은 선분 +4 관통 + 해당 눈금 보라 틴트가 대체) — 팔로워 area(파도→X축)를 [x0,x1] 컬럼으로 하드 클립 · 세로 그라데이션(위 파도 .34 → 바닥 .06 잔광) · 색 = --cat-tech(팔레트 유일 형광 보라) · 불투명 금지(아래 무채 볼륨 바 비침). ⚠️ 표현 문법(음영·세로변·라벨·눈금 틴트) = 260723 확립본 그대로 — 아래는 *어디를 칠할지 고르는 산출식*만 교체(운영자 260801 "표현방법은 기존과 동일").
  // 코어 산출 = 도달 기대값(운영자 260801 판정 "동그라미 친 18~19시가 제일 핵심 아닌지 · 앱 사용자가 주로 쓰는 시간대로 늘려야 · 좌측 − 우측 +") — score = 공유 lift × 앱 사용자 이용 강도(반응률 × 볼 사람 수) · 피크 중심 연속 런 { score ≥ 피크 × CORE_TH }.
  //   구식(팔로워 곡선이 앱 사용자 곡선 '위'인 런) 폐기 사유 3점(실측 insta 1,005건): ① 단위 불일치 — 팔로워는 lift를 데이터 산포 lo~hi로 자동 스케일 / 앱 사용자는 0~100을 ph×.82로 고정 매핑 = 두 곡선의 픽셀 교차에 물리적 의미 없음(밤22-24 ×0.68 하나가 lo를 끌어내리면 코어가 통째로 이동). ② 상대 우위 판정이라 *앱 사용자가 적은 한산한 시간대*가 유리 — 오전6-11은 공유 ×0.93으로 통과(여유 +0.9px)·저녁18-22는 ×1.01인데 탈락(표본은 저녁이 최다 n=225). ③ 같은 차트의 접속 피크 1위 18시를 코어가 17:54에서 배제 = 두 오버레이가 반대를 지시.
  //   전후(현 데이터 실렌더 실측): 시간대 08:30~17:54 → 14:08~20:57(좌 −5.6h·우 +3.1h · 접속 피크 1·2위 15·18시 포섭 — 구식은 18시를 17:54로 잘랐다 · 3위 21시는 경계 3분 밖 = 저녁 밴드 대표값이 20시라 곱이 21시부터 꺾임 = 데이터 그대로) · 요일 목 → 금22시~일12시(주말 = 260724 "주말이 이용 훨 높은데" 판정과 동방향). 시안·전후 = docs/reports/260801_핵심구간_산출식_플레이그라운드.html
  const coreLabs = [];   // 코어 라벨 앵커(밴드마다 1개 · 복수 밴드 = 운영자 260801 "빨간색 덧칠한 부분도 핵심 구간이야 · 동일하게 표기")
  let coreXRs = [];      // 코어 x범위 목록(눈금 보라 틴트 판정 = 어느 밴드에든 들면 틴트)
  const fixLabs = [];    // 보완 필요 라벨 앵커(운영자 260805 첨부 판정 "이용자 핫한 시간대를 내가 못 따라감 = 보완 필요")
  let fixXRs = [];       // 보완 필요 x범위 목록(범례 칩 노출 판정)
  if (gpts && gpts.length === bs.length && spts.length === bs.length && sline) {
    const sc = spts.map((p, i) => (bs[i].low_sample ? 1 : val(bs[i], 'share_pm')) * (gpts[i][2] / 100));   // 표본부족 칸 = ×1.0(채널 중앙 = 결론 없음)로 셈 — n=4 한 칸이 핵심 구간을 독차지하지 않게(261025)   // 도달 기대값 = 공유 lift × 앱 사용자 지수/100(둘 다 이 차트가 이미 그리는 정본 — 새 데이터·새 상수 0)
    let pk = 0; sc.forEach((v, i) => { if (v > sc[pk]) pk = i; });   // 임계 기준점 = 도달 기대값 최대(구식 '팔로워 y 최소' = lift 최대와 다름 — 볼 사람 수를 곱한 뒤의 최대)
    if (sc[pk] > 0) {
      const T = sc[pk] * CORE_TH, aB = H - mB;   // aB = X축(하단 눈금선) = 음영 바닥(운영자 260723 "음영이 눈금/요일 라벨 영역 넘지 않게" — 구 +11 라벨행 연장 폐지 · 축 관통은 아래 세로변 선분만)
      const runs = [];   // 임계 이상인 *모든* 연속 런(구 단일 밴드 = 피크 런만 그려 2등 구간[요일 수~목 = 도달 .950·1.062]을 통째로 숨겼다 · 운영자 260801 실기 지적)
      for (let i = 0; i < sc.length; i++) { if (sc[i] >= T) { const r = runs[runs.length - 1]; if (r && r[1] === i - 1) r[1] = i; else runs.push([i, i]); } }
      const cross = (a, b) => { const t = (sc[a] - T) / (sc[a] - sc[b]); return { x: X(a) + (X(b) - X(a)) * t, y: spts[a][1] + (spts[b][1] - spts[a][1]) * t }; };   // 경계 = 임계 교차점 선형 보간(x·팔로워 파도 y) — 버킷 스냅 금지 = 구 edge() 문법 계승 · a는 항상 임계 이상·b는 미만이라 t∈(0,1) 보장(구식 '두 점 다 dfs≤0 음수 t' 오이동 구조적 소멸)
      const at = i => ({ x: X(i), y: spts[i][1] });   // 축 끝(확장 벽)에서 멈춤 = 그 버킷 중심(교차 아님 = 보간 불요)
      const yWave = xq => { const q = Math.max(spts[0][0], Math.min(spts[spts.length - 1][0], xq)); for (let i = 1; i < spts.length; i++) { if (spts[i][0] >= q) { const [xa, ya] = spts[i - 1], [xb, yb] = spts[i]; return xb === xa ? ya : ya + (yb - ya) * (q - xa) / (xb - xa); } } return spts[spts.length - 1][1]; };   // 음영 상단(팔로워 파도) y = 중앙 x에서 선형 보간(곡선 chPath와 미세차 있으나 라벨 배치용 = 육안 무차)
      s += `<defs><linearGradient id="sigCore-${ax}" gradientUnits="userSpaceOnUse" x1="0" y1="${mT}" x2="0" y2="${aB.toFixed(1)}"><stop offset="0" stop-color="var(--cat-tech)" stop-opacity=".34"/><stop offset="1" stop-color="var(--cat-tech)" stop-opacity=".06"/></linearGradient>${runs.map(([i0, i1], k) => { const a = i0 > 0 ? cross(i0, i0 - 1) : at(i0), b = i1 < sc.length - 1 ? cross(i1, i1 + 1) : at(i1); return `<clipPath id="sigCoreClip-${ax}-${k}"><rect x="${a.x.toFixed(1)}" y="${mT}" width="${(b.x - a.x).toFixed(1)}" height="${ph}"/></clipPath>`; }).join('')}</defs>`;   // 그라데이션 = 밴드 공용 1개(userSpaceOnUse 세로축 = 위치 무관) · 클립만 밴드별
      runs.forEach(([i0, i1], k) => {
        const e0 = i0 > 0 ? cross(i0, i0 - 1) : at(i0), e1 = i1 < sc.length - 1 ? cross(i1, i1 + 1) : at(i1);
        s += `<path d="${sline} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="url(#sigCore-${ax})" stroke="none" clip-path="url(#sigCoreClip-${ax}-${k})"/>`;   // 팔로워 area(파도→X축)를 코어 컬럼으로 하드 클립 = 세로 커튼(라벨 행 무접촉)
        [[e0.x, e0.y], [e1.x, e1.y]].forEach(([xe, ye]) => { s += `<line x1="${xe.toFixed(1)}" y1="${(aB + 4).toFixed(1)}" x2="${xe.toFixed(1)}" y2="${ye.toFixed(1)}" stroke="var(--cat-tech)" stroke-width="1.2" opacity=".72" vector-effect="non-scaling-stroke"/>`; });   // 양 옆 세로변(파도 곡선 y → X축 +4) = 선분만 아주 살짝 축 관통(운영자 260723 "선분 쫙 이어서 · 음영을 넘기란 게 아니야") — 아래 해당 눈금 숫자와 연결감
        coreXRs.push([e0.x, e1.x]);
        const cx = (e0.x + e1.x) / 2;
        if (e1.x - e0.x >= 46) coreLabs.push({ x: cx, y: (yWave(cx) + aB) / 2 });   // 라벨 = 음영 중앙 각인(운영자 260730) · 폭 46 미만 밴드는 라벨 생략(글리프가 음영 밖으로 삐져나가는 오표기 차단 — 라벨 실측 폭 41 + 여유 · 밴드 자체는 그대로 표기)
      });
      // 보완 필요 존 3차 확정(운영자 260805 3차 "앱 사용자의 이용 선은 높은데 팔로워의 이용선이 낮을 때 — 그때 게시물을 안 올리거나
      //   해서 제대로 활용을 못 하고 있다는 뜻 · 핵심 보라와는 거의 겹칠 일 없을 것[핵심 = 이미 공략 중 = 보완의 60~70% 반대 개념]") —
      //   판정 = 이용 강도 핫존(gen ≥ 피크 85 · CORE_TH 동값 재사용 = 새 상수 0) ∧ 내 공유 lift < 1.0(채널 중앙 기준선 = 화면의
      //   ×1.0 점선 아래 = "평소보다 약함"). 2차(파란선<노란선 픽셀 비교)는 벤치 노랑이 평평·상단이라 주중 대부분+핵심(토·일)까지
      //   물들어 폐기 — 운영자 재판정으로 "이용률 높은데 못 쓰는 자리"만 남김(실측 = 요일 화·금 / 시간대 밤22-24 = 운영자 동그라미
      //   [금 골짜기] 정합 · 핵심과는 구조상 거의 배타[핵심 = 고공유 = ×1.0 위]). 드문 동시 성립 시 렌더 순서상 빨강이 뒤 = 우위 레이어(2차 지시 유지).
      //   경계 = 공유↔×1.0 교차(= 터콰이즈가 점선을 뚫는 그 점 · y = 기준선) 또는 gen↔85 교차 선형 보간(버킷 스냅 금지) · 색·그라데 스톱 = 핵심 커튼 정본값.
      //   음영 기하 4차(운영자 260805 4차 "파란색 선 위 > 공간 < 노란색 선 아래 · 파란 아래에 이미 확보되는 점유율은 필요 없음") —
      //   칠하는 곳 = **터콰이즈 위 ~ 노랑 아래 밴드**(= 끌어올려야 할 여백) · 구현 = 마스크(노랑 아래 흰 − 터콰이즈 아래 검)
      //   = 화면에 실제 그려진 두 베지어 그대로의 사이 공간(다각형 근사 0) · 터콰이즈가 노랑 위로 솟은 곳은 마스크가 자연 소거.
      //   범위·톤 5차(운영자 260805 5차) = 기둥 클립·세로변 폐지 → 갭 주머니 전체 렌즈(아래 fruns 확장) + 불투명도 감쇠(.26/.05).
      const shv = bs.map(b => val(b, 'share_pm'));
      const dfs = spts.map((p, i) => p[1] - gpts[i][1]);   // 파란y − 노랑y(>0 = 파란이 노랑 아래 = 갭 열림) — 렌즈 범위·경계 축
      // 범위 5차(운영자 260805 5차 "이 부분 전체에 음영 · 꼭 기둥 모양일 필요 없음") — 트리거(위 3차 판정)가 든 **갭 주머니 전체**로
      // 확장: 트리거 런에서 양옆으로 dfs>0인 동안 넓혀 파란·노랑이 실제로 만나는 교차점(또는 안 닫히면 플롯 가장자리)까지.
      // 한 주머니에 트리거 2개 = 병합 1렌즈 · 트리거 없는 주머니(예: 오전~점심 = 이용 강도 낮음)는 종전대로 무음영.
      // ⚠ 판정 6차(운영자 260809 4차 첨부 «이렇게 앱 사용자 이용률이 더 높은 구간에는, 전에와 마찬가지로 보완 필요가 있어야함» = 밤22-24 동그라미) —
      //   구 게이트 `gpts[i][2] >= 85`(이용 강도 **절대** 임계) 폐기. 사유 = 그 85는 260805 3차 당시 노란선이 **실측**(GEN_MEAS = online_curve_kst)
      //   이던 시절의 값인데, 260809 3차에 노란선이 벤치(SIG_GEN)로 되돌아가면서 같은 밴드의 값이 통째로 내려앉아 게이트만 홀로 낡았다
      //   (실측 밴드평균 vs 벤치: 밤22-24 **95.0 → 78** · 점심 90.4→74 · 오후 93.3→82) → 밤22-24가 85에 잘려 **시간대 축 보완 필요가 0개**가 됐다
      //   = 운영자가 260805에 "여기"라고 지목했던 바로 그 자리가 조용히 사라진 것(전 축 실측 = 이 커밋 근거).
      //   → 판정을 화면에 **실제로 그려진 두 선의 관계**로 되돌린다 = 「노랑이 터콰이즈 위(dfs>0) ∧ 내 공유 < ×1.0」 = 운영자 문장 그대로
      //   (「앱 사용자 이용률이 더 높은 구간」 + 260805 3차 「팔로워의 이용선이 낮을 때」). 새 상수·새 데이터 0 — 오히려 낡을 수 있는 절대 상수 하나를 **제거**한다.
      //   ⚠ 260805 2차 폐기(픽셀 비교 → "주중 대부분+핵심[토·일]까지 물들어") 재발 없음 = 그때 없던 `shv < 1`(3차 신설)이 핵심을 구조적으로 배타한다
      //   — 현 데이터 실측으로 확인: 토(dfs +19.5)·일(+10.6)은 노랑이 위지만 공유 ×1.07·×1.10이라 **전건 배제**(핵심 보라와 겹침 0 유지).
      //   전후(현 데이터 실렌더) = 시간대 **0개 → 밤22-24 1개**(저녁18-22 교차점~우변 = 동그라미 정합) · 요일 = 화·금 → 월·화·금(월은 종전에도 화 렌즈 확장이 덮던 자리 = 화면 변화 실질 0).
      const trig = [];
      for (let i = 0; i < shv.length; i++) { if (shv[i] != null && shv[i] < 1 && dfs[i] > 0 && !bs[i].low_sample) { const r = trig[trig.length - 1]; if (r && r[1] === i - 1) r[1] = i; else trig.push([i, i]); } }
      let fruns = [];
      trig.forEach(([a, b]) => { while (a > 0 && dfs[a - 1] > 0) a--; while (b < dfs.length - 1 && dfs[b + 1] > 0) b++; const m = fruns[fruns.length - 1]; if (m && a <= m[1] + 1) m[1] = Math.max(m[1], b); else fruns.push([a, b]); });
      if (fruns.length) {
        const fedge = (a, b) => {   // a = 렌즈 안(dfs>0) · b = 밖(dfs≤0) = 두 선 교차점 보간 · b가 차트 밖 = 렌즈가 안 닫힘 = 숄더 끝(플롯 가장자리)까지 = "전체"
          if (b < 0) return { x: sx0, y: spts[a][1] };
          if (b >= dfs.length) return { x: sx1, y: spts[a][1] };
          const t = dfs[a] / (dfs[a] - dfs[b]); return { x: X(a) + (X(b) - X(a)) * t, y: spts[a][1] + (spts[b][1] - spts[a][1]) * t };
        };
        const yGen = xq => { const q = Math.max(gpts[0][0], Math.min(gpts[gpts.length - 1][0], xq)); for (let i = 1; i < gpts.length; i++) { if (gpts[i][0] >= q) { const [xa, ya] = gpts[i - 1], [xb, yb] = gpts[i]; return xb === xa ? ya : ya + (yb - ya) * (q - xa) / (xb - xa); } } return gpts[gpts.length - 1][1]; };   // 노랑 선 y 보간 = yWave 문법 미러(gpts 축) — 밴드 상단·세로변·라벨 배치용
        s += `<defs><mask id="sigFixM-${ax}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path d="${gl} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="#fff"/><path d="${sline} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="#000"/></mask>${fruns.map(([i0, i1], k) => { const a = fedge(i0, i0 - 1), b = fedge(i1, i1 + 1); const g1 = Math.min(...gpts.slice(i0, i1 + 1).map(p => p[1])), g2 = Math.max(a.y, b.y, ...spts.slice(i0, i1 + 1).map(p => p[1])); return `<linearGradient id="sigFixG-${ax}-${k}" gradientUnits="userSpaceOnUse" x1="0" y1="${g1.toFixed(1)}" x2="0" y2="${(g2 > g1 ? g2 : aB).toFixed(1)}"><stop offset="0" stop-color="var(--danger)" stop-opacity=".26"/><stop offset="1" stop-color="var(--danger)" stop-opacity=".05"/></linearGradient><clipPath id="sigFixClip-${ax}-${k}"><rect x="${a.x.toFixed(1)}" y="${mT}" width="${(b.x - a.x).toFixed(1)}" height="${ph}"/></clipPath>`; }).join('')}</defs>`;   // 마스크 = 축당 1개(노랑 아래 − 터콰이즈 아래 = 두 선 사이 렌즈) · 그라데 y축 = 렌즈 실범위(상단 노랑 최고점 → 하단 터콰이즈 최저점 = 「위 진하고 아래 잔광」 정본 의도) · raw-ok: 스톱 .26/.05 = 핵심 정본 .34/.06의 감쇠 사본(운영자 260805 5차 "빨간색 불투명도 좀만 낮춰줘" — 색상 자체는 --danger 토큰 유지)
        fruns.forEach(([i0, i1], k) => {
          const e0 = fedge(i0, i0 - 1), e1 = fedge(i1, i1 + 1);
          s += `<path d="${gl} L${sx1.toFixed(1)} ${aB.toFixed(1)} L${sx0.toFixed(1)} ${aB.toFixed(1)} Z" fill="url(#sigFixG-${ax}-${k})" stroke="none" mask="url(#sigFixM-${ax})" clip-path="url(#sigFixClip-${ax}-${k})"/>`;   // 노랑 아래 area를 마스크로 깎아 = 터콰이즈 위~노랑 아래 렌즈만 잔존 · 세로변 없음(운영자 260805 5차 "꼭 기둥 모양일 필요 없음" — 렌즈 양끝 = 두 선의 실제 교차점이라 형상이 스스로 닫힌다 · 핵심 커튼 세로변 문법은 코어 전용 잔류)
          fixXRs.push([e0.x, e1.x]);
          let li = i0; for (let i2 = i0; i2 <= i1; i2++) { if (dfs[i2] > dfs[li]) li = i2; }   // 라벨 앵커 = 렌즈에서 갭이 가장 깊은 버킷(확장된 얇은 꼬리가 아니라 주머니 배에 각인)
          const fcx = Math.max(mL + 24, Math.min(W - mR - 24, X(li)));
          if (e1.x - e0.x >= 46) fixLabs.push({ x: fcx, y: (yGen(fcx) + yWave(fcx)) / 2 });   // 라벨 = 그 지점 밴드(노랑~터콰이즈) 정중앙 · 폭 게이트 46 = 핵심 정본 사본 · x 클램프 = 피크 콜아웃 lx 문법 사본
        });
      }
    }
  }
  if (gl) s += `<path d="${gl}" fill="none" stroke="var(--accent-4)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  // 팔로워 접속 피크 밴드(운영자 260719 승인 한 수) — online_peak_kst 상위 3시각 · 연속 시각 = 한 밴드 병합 · 앰버 저알파 = 게시 예약 필과 동일 데이터 축
  const bandLabs = [];
  if (ax === 'hour_band' && Array.isArray(x2.peaks) && x2.peaks.length) {
    const phs = [...new Set(x2.peaks)].sort((a, b) => a - b), runs = [];
    phs.forEach(hh => { const r = runs[runs.length - 1]; if (r && hh - r[r.length - 1] <= 1) r.push(hh); else runs.push([hh]); });
    runs.forEach(r => {
      const x0 = hourX(r[0]), x1 = hourX(r[r.length - 1]);
      if (x0 == null || x1 == null) return;
      const top1 = r.indexOf(x2.peaks[0]) >= 0;   // 1위 시각 포함 런 = 진하게+라벨 · 나머지 = 은은
      s += `<rect x="${(x0 - 7).toFixed(1)}" y="${mT}" width="${(x1 - x0 + 14).toFixed(1)}" height="${ph}" rx="2" fill="var(--mut)" fill-opacity="${top1 ? '.14' : '.08'}"/>`;   // 무채 워시(운영자 260723 한 수) — 일반 평균 노랑선과 색 충돌 회피 · 색=데이터(공유·일반평균)/무채=맥락(접속피크·볼륨·마커) 위계
      if (top1) bandLabs.push({ x: (x0 + x1) / 2, txt: `접속 피크 ${r.length > 1 ? r[0] + '~' + r[r.length - 1] : r[0]}시` });
    });
  }
  let mkX = null, mkTxt = '';   // 지금(시간대)·오늘(요일) 마커 — 무채 은은 hairline(변곡 리더 톤 계승 · KST [12])
  if (ax === 'hour_band' && x2.now != null) { mkX = hourX(x2.now); mkTxt = '지금'; }
  if (ax === 'dow' && x2.today) { const ti = bs.findIndex(b => b.bucket === x2.today); if (ti >= 0) { mkX = X(ti); mkTxt = '오늘'; } }
  if (mkX != null) s += `<line x1="${mkX.toFixed(1)}" y1="${mT + 2}" x2="${mkX.toFixed(1)}" y2="${(H - mB).toFixed(1)}" stroke="var(--mut)" stroke-width="1" stroke-dasharray="2 3" opacity=".55" vector-effect="non-scaling-stroke"/>`;
  const bY = Y(1);   // ×1.0 = 채널 중앙값 기준선 — 위 = 평소보다 호응↑ · 아래 = ↓
  s += `<line x1="${mL}" y1="${bY.toFixed(1)}" x2="${W - mR}" y2="${bY.toFixed(1)}" stroke="var(--mut)" stroke-width="1" stroke-dasharray="4 3" opacity=".6" vector-effect="non-scaling-stroke"/>`;
  s += `<text x="${mL + 4}" y="${(bY - 4).toFixed(1)}" text-anchor="start" font-size="9" fill="var(--mut)">채널 중앙 ×1.0</text>`;
  if (sline) {   // 팔로워(구 라벨 '공유' · 운영자 260723 리네임) 단독(운영자 260723 "저장 삭제·공유로 통일") — area 글래스+선+점 · 저장(구 --accent-2 시리즈) 폐지 · 좌표 = 위 spts 단일 산출 재사용
    s += `<path d="${sline} L${sx1.toFixed(1)} ${H - mB} L${sx0.toFixed(1)} ${H - mB} Z" fill="rgba(var(--accent-rgb),.10)" stroke="none"/>`;
    s += `<path d="${sline}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    spts.forEach(p => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${p[2] ? 'var(--bg)' : 'var(--accent)'}" stroke="${p[2] ? 'var(--accent)' : 'var(--bg)'}" stroke-width="1.6"/>`; });   // low_sample = 속빈 점
  }
  const hs = SIG_HIT[ax].filter(p => p.share != null && !p.low), topLabs = [];   // 피크·최저 콜아웃·캡션 피크 = 믿을 칸만(표본부족 = 결론 금지 플래그 · 261025)   // topLabs = 상단 선반 라벨 점유 기록(소프트 충돌 회피)
  let trLab = null;   // 최저 콜아웃 잉크 앵커 — 보완 라벨 충돌 회피 재료(보완 존은 정의상 공유 저점과 자주 겹친다 · 260805 실렌더 실측 = 화·밤 트로프 정면 충돌)
  if (hs.length >= 3) {   // 피크·최저 콜아웃(공유 기준 · chChart 극값 문법 계승)
    let pk = hs[0], tr = hs[0];
    hs.forEach(p => { if (p.share > pk.share) pk = p; if (p.share < tr.share) tr = p; });
    const lx = v => Math.max(mL + 24, Math.min(W - mR - 24, v));
    if (pk.share !== tr.share) {
      const pky = Math.max(mT + 9, pk.y - 8);
      s += `<circle cx="${pk.x.toFixed(1)}" cy="${pk.y.toFixed(1)}" r="4.2" fill="var(--accent-bright)" stroke="var(--bg)" stroke-width="2"/>`;
      s += `<text x="${lx(pk.x).toFixed(1)}" y="${pky.toFixed(1)}" text-anchor="middle" font-size="8.5" fill="var(--accent-bright)" font-weight="700">피크 ×${pk.share}</text>`;
      topLabs.push({ x: lx(pk.x), y: pky });
      s += `<circle cx="${tr.x.toFixed(1)}" cy="${tr.y.toFixed(1)}" r="4.5" fill="none" stroke="var(--mut)" stroke-width="1.5"/>`;   // 최저 = 속빈 무채 링(점 위 겹침 시인 위해 r 확대 · chChart 트로프 문법)
      trLab = { x: lx(tr.x), y: Math.min(H - mB - 4, tr.y + 13) };
      s += `<text x="${trLab.x.toFixed(1)}" y="${trLab.y.toFixed(1)}" text-anchor="middle" font-size="8" fill="var(--mut)">최저 ×${tr.share}</text>`;
    }
  }
  const putTop = (x, txt, fill) => {   // 상단 선반 라벨 배치(가로 70·세로 10px 근접 = 한 칸 아래 · 엣지 클램프) — 접속 피크·지금·오늘 공용
    const cx = Math.max(mL + 16, Math.min(W - mR - 16, x));
    let y = mT + 8;
    for (let t = 0; t < 3 && topLabs.some(l => Math.abs(l.x - cx) < 70 && Math.abs(l.y - y) < 10); t++) y += 10;
    topLabs.push({ x: cx, y });
    s += `<text x="${cx.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="8" fill="${fill}" font-weight="700">${txt}</text>`;
  };
  coreLabs.forEach(l => { s += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="8" fill="var(--cat-tech)" font-weight="700" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">${ax === 'hour_band' ? '핵심 시간대' : '핵심 요일'}</text>`; });   // 핵심 구간 라벨 = 상단 선반(putTop) 이탈 → 음영 블록 정중앙 각인(운영자 260730 "양옆 중앙·위아래 중앙") · 색 = 음영 동색 네온바이올렛(260723 계승) · 그림자 = 레포 텍스트 가독 정본값 drop-shadow(0 1px 2px rgba(0,0,0,.45)) 계승(.ch-th .rl·.dlbtn) = 파도·볼륨바 위 판독
  fixLabs.forEach(l => { if ((trLab && Math.abs(trLab.x - l.x) < 60 && Math.abs(trLab.y - l.y) < 16) || coreLabs.some(c => Math.abs(c.x - l.x) < 60 && Math.abs(c.y - l.y) < 16)) { putTop(l.x, '보완 필요', 'var(--danger)'); return; } s += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="8" fill="var(--danger)" font-weight="700" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">보완 필요</text>`; });   // 보완 필요 라벨 = 핵심 라벨 문법 100% 미러(중앙 각인·8px·그림자 동값) · 색 = 존 동색 --danger(운영자 260805 "빨간색으로 보완 필요 적어줘야"). 최저 콜아웃 충돌 = 상단 선반 putTop 이관 — 보완 존은 정의상 공유 저점과 상습 동거인데 트로프 커튼(파도~축 ~17px)엔 '한 칸 아래'가 물리적으로 없다(260805 실렌더 실측 = 화·밤 정면 충돌 · 바닥 클램프 무효). 창 60×16 = 라벨 실폭 41+여유·잉크 8px 스택 감안(10px 창은 화 케이스가 0.3px 차로 빠져나가는 걸 실측)
  bandLabs.forEach(l => putTop(l.x, esc(l.txt), 'var(--mut)'));   // 접속 피크 라벨 = 무채(운영자 260723 한 수 · 밴드 무채 워시와 동색 · 일반 평균 노랑과 분리)
  if (mkX != null) putTop(mkX, mkTxt, 'var(--mut)');
  const inCore = x => coreXRs.some(r => x >= r[0] - 1 && x <= r[1] + 1);   // 핵심 구간에 드는 눈금/라벨 = 음영 동색 보라 틴트(운영자 260723 "해당하는 숫자를 보라색 음영" · ±1px = 경계 부동소수 여유) — 구 경계시각 별도 라벨("9시/18시" 행) 대체
  const tick = x => { s += `<line x1="${x.toFixed(1)}" y1="${H - mB}" x2="${x.toFixed(1)}" y2="${(H - mB + 3).toFixed(1)}" stroke="var(--mut)" stroke-width="1" opacity=".55" vector-effect="non-scaling-stroke"/>`; };   // X축 미니 눈금선(운영자 260724 "보라 튀어나온 것처럼 각각 다 mut으로") — 문법 = 핵심 구간 세로변 축 관통 미러(관통 3 = 보라 4보다 반 계단 아래 위계) · 톤 = 지금/오늘 무채 마커(--mut·1px·op .55) 계승 · 전 인덱싱 위치(숫자 눈금 + 요일명 중심선)
  const DAY_MARKS = [6, 14, 22];   // 하루 3구간 표기 정본(운영자 260801 "6 14 22 이렇게 세구간을 하루에 표기") = 22–6 야간 / 6–14 오전 / 14–22 오후 8h 3분할 · 자정 표기는 0 금지 = 24로만(운영자 260801 "0을 24로 표기") — 시간대 축·요일 서브행 공용 SSOT(두 축 표기 문법 동조)
  if (hlin && ax === 'hour_band') {   // X축 = 시각 눈금(운영자 260723 "밴드명 말고 그냥 숫자만" → 260801 표기 솎음: 눈금선은 24분할 전량 유지[미세 자] · *숫자는* 3구간 마크 + 양끝 자정 24만) — 크기·굵기·베이스라인(9·700·H-7) = 구 버킷 라벨 규격 계승 · 밴드명은 호버 툴팁에 유지 = 정보 손실 0
    for (let hh = 0; hh <= 24; hh++) tick(mL + pw * hh / 24);   // 미세 자 = 전 시각 눈금선(보라 세로변이 임의 x에 서므로 위치 판독용 · 260724 톤 그대로)
    [0, ...DAY_MARKS, 24].forEach(hh => {
      const xh = mL + pw * hh / 24, lab = hh === 0 ? 24 : hh;   // 좌끝 0 = "24"(자정 = 전날 24시 · 우끝과 같은 순간이라 표기 통일)
      s += `<text x="${xh.toFixed(1)}" y="${H - 7}" text-anchor="middle" font-size="9" fill="${inCore(xh) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${lab}</text>`;
    });
  } else if (hlin) {   // 요일 = 주간 선형축 2단 눈금(운영자 260724 "요일별로 3개씩 — 지금 너무 모호" · 260801 위상 교체: 0·8·16 → 6·14·22 = 시간대 축과 동일 3구간) — 서브행 y = 구 경계시각 행 +1(눈금선 3px과 글리프 캡 간섭 회피) · font 8 = putTop 선반 티어 = 요일명 아래 위계 · 요일명 행 = H-7·9·700 계승 · 핵심 구간 = 두 행 다 보라 틴트 · 눈금선 = 요일 경계(자정) + 3구간 마크 + 요일 중심선
    for (let d = 0; d <= ord.length; d++) tick(mL + pw * (d * 24) / SPAN);   // 요일 경계(자정) 눈금선 = 숫자 없이 선만(0 표기 금지 · 날 구분은 위 요일명 행이 담당)
    ord.forEach((_, d) => DAY_MARKS.forEach(hh => {
      const xt = mL + pw * (d * 24 + hh) / SPAN;
      tick(xt);
      s += `<text class="sig-sub" x="${xt.toFixed(1)}" y="${(H - mB + 9).toFixed(1)}" text-anchor="middle" font-size="8" fill="${inCore(xt) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${hh}</text>`;   // +10 → +9(260801): 6·14·22 위상에선 14가 요일명 중심(12시)과 2h차 = x 잉크 1.98px 겹침 → 세로 여백 확보가 유일한 해(실측 = 눈금선 하단 131 ↔ 숫자 잉크 상단 132 · 숫자 잉크 하단 137 ↔ 요일명 잉크 상단 139 = 양쪽 1·2px 클린)
    }));
    bs.forEach((b, i) => { tick(X(i)); s += `<text x="${X(i).toFixed(1)}" y="${H - 7}" text-anchor="middle" font-size="9" fill="${inCore(X(i)) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${esc(b.bucket)}</text>`; });
  } else bs.forEach((b, i) => {   // 축 파싱 실패 폴백 = 구 버킷 라벨(첫/끝 = 엣지 앵커 = 삐침 방지 · y = 일일 추이 베이스라인 H-7 계승) · 핵심 구간 안 라벨 = 동일 보라 틴트(형제 동조[4]) · n 병기 줄 = 운영자 260722 제거(툴팁 n= 유지)
    const anc = i === 0 ? 'start' : i === bs.length - 1 ? 'end' : 'middle', xa = i === 0 ? mL : i === bs.length - 1 ? W - mR : X(i);
    tick(xa);
    s += `<text x="${xa.toFixed(1)}" y="${H - 7}" text-anchor="${anc}" font-size="9" fill="${inCore(xa) ? 'var(--cat-tech)' : 'var(--mut)'}" font-weight="700">${esc(b.bucket)}</text>`;
  });
  s += '</svg>';
  let pk2 = null; hs.forEach(p => { if (!pk2 || p.share > pk2.share) pk2 = p; });   // 캡션 우측 피크 요약(헤더 .ct-v 대값 문법의 축약 계승)
  return `<div class="sig-cap"${W !== 600 ? ` style="--sig-pl:${(mL / W * 100).toFixed(3)}%"` : ''}><span class="sig-t">${(CHAN_SRC === 'fb' ? SIG_CAP_FB : SIG_CAP)[ax] || esc(ax)}</span>${pk2 ? `<span class="sig-pk">피크 ${esc(pk2.bucket)} · ${CHAN_SRC === 'fb' ? '반응' : '공유'} ×${pk2.share}</span>` : ''}<span class="sig-lgd"><i class="lg-sh">팔로워</i>${GEN_MEAS ? `<i class="lg-gen" title="팔로워 접속 = 내 팔로워의 ${ax === 'dow' ? '요일별 접속 강도 — 하루 총량이 아니라 접속 피크대(위 차트 상위 3시각)만 집계한다. 총량은 팔로워 수와 거의 같아 요일차가 상쇄되지만, 피크대는 「올릴 시간에 그 요일 사람이 얼마나 붙어 있나」를 남긴다(260809)' : '시간대별 접속 강도'}(Meta online_followers API 실측 · 피크=100 상대 · 시간대 260803·요일 260804 실측 편입 — 구 벤치 실루엣 대체)">팔로워 접속</i>` :(CHAN_SRC !== 'fb' && SIG_GEN[ax]) ? '<i class="lg-gen" title="앱 사용자 이용 = 전체 인스타 이용자의 평균 이용 강도(원천 = 이용시간 통계 · 상대값 · 측정치 아님). ⚠ 「접속」과 다른 축이다 — 이 차트의 무채 밴드 「접속 피크」·하단 「접속 실측」은 내 팔로워가 실제로 앱을 켜고 있는 수(Meta online_followers 실측)이고, 이 노란선은 전체 이용자가 얼마나 오래 쓰는가(바깥 벤치 실루엣)다. 내 팔로워가 아니라 바깥 레퍼런스(내 채널 축 = 터콰이즈 「팔로워」) — 시간대: 국내 이용시간(오픈애즈·소셜비즈 2025 3Q) · 요일: 이용시간 종합(와이즈앱·App Ape·글로벌 스크린타임 2025~26 — 주말 확산·소폭↑)">앱 사용자 이용</i>' : ''}${coreXRs.length ? `<i class="lg-core" title="핵심 구간 = 도달 기대값(공유 lift × ${GEN_MEAS ? '팔로워 접속 강도' : '앱 사용자 이용 강도'})이 피크의 85% 이상인 구간 전부(복수 가능) — 반응률만이 아니라 볼 사람 수까지 곱한 값(운영자 260801)">핵심 구간</i>` : ''}${fixXRs.length ? '<i class="lg-fix" title="보완 필요 = 이용자 선(노랑)이 내 공유 선 위에 있는데 그 공유가 채널 중앙(×1.0 점선) 아래로 처진 자리 — 그때 안 올리거나 활용을 못 해 이용자 흐름을 놓치는 것(운영자 260805·260809). 음영 = 그 자리가 든 갭 주머니 전체(내 곡선 위~이용자 선 아래 = 끌어올릴 여백 · 파란 아래 확보 점유율 제외) · 핵심 구간과 반대 개념 · 게시 실험 우선 후보">보완 필요</i>' : ''}${bandLabs.length ? '<i class="lg-pk">접속 피크</i>' : ''}</span>${x2.curve && x2.led ? `<span class="sig-live" title="팔로워 접속 실측(Meta online_followers)을 워크플로가 상시 자동 수집 — 원장 ${x2.led.days || '?'}일 축적${x2.led.last ? ' · 마지막 적재 ' + esc(x2.led.last) : ''} · 3일 이상 끊기면 메시지함 경보(매월 말~초 지연 경향 = 운영자 260805 관측)">${x2.led.stall != null && x2.led.stall >= 3 ? '실측 수신 지연 ' + x2.led.stall + '일' : '접속 실측 수집 중' + (x2.led.days ? ' · ' + x2.led.days + '일' : '')}</span>` : ''}</div>` +
    `<div class="ch-chartwrap sig-chartwrap" data-ax="${esc(ax)}">${s}<div class="ch-tip"></div><div class="ch-dot"></div></div>`;
}
let COND_CARDS = [];
function condCards(d) {
  const out = [], r1 = (b, a) => Math.round(b / a * 10) / 10;
  const T = d.timing || {}, F = d.fmt || {}, E = d.eras || {}, fpe = T.follows_per_post_by_era || {};
  if (T.rest_day_med && T.post_day_med) { const r = r1(T.post_day_med, T.rest_day_med);
    out.push({ t: '올린 날 vs 쉰 날', a: '쉰 날', b: '올린 날', bead: 10, unit: '명', rows: [['새 팔로우/일', T.rest_day_med, T.post_day_med]],
      foot: r >= 1 ? `올린 날이 쉰 날보다 새 팔로우가 ${r}배 많아서, 쉬면 손해인 상황이다.` : `쉰 날이 올린 날보다 새 팔로우가 많아서, 올리는 효과가 안 보이는 상황이다.` }); }
  const fd = F['피드'], rl = F['릴스'];
  if (fd && rl && fd.share_pm_med && rl.share_pm_med) { const r = r1(rl.share_pm_med, fd.share_pm_med);
    out.push({ t: '피드 → 릴스', a: '피드', b: '릴스', bead: .5, unit: '‰', rows: [['공유', fd.share_pm_med, rl.share_pm_med], ['좋아요', fd.like_pm_med, rl.like_pm_med], ['저장', fd.save_pm_med, rl.save_pm_med], ['댓글', fd.cmt_pm_med, rl.cmt_pm_med]].filter(x => x[1] != null && x[2] != null),
      foot: r >= 1 ? `릴스가 공유를 피드의 ${r}배 받아서, 퍼지는 건 릴스인 상황이다.` : `피드가 공유를 릴스의 ${r1(fd.share_pm_med, rl.share_pm_med)}배 받아서, 퍼지는 건 피드인 상황이다.` }); }
  const ek = Object.keys(E), kb = ek.find(k => /부흥/.test(k)), ks = ek.find(k => /침체/.test(k)), kr = ek.find(k => /회복/.test(k)), nm = k => k.replace(/\(.*\)/, '');
  if (ks && kr && fpe[ks] && fpe[kr]) { const r = r1(fpe[kr], fpe[ks]);
    out.push({ t: `${nm(ks)} → ${nm(kr)}`, a: nm(ks), b: nm(kr), bead: null, rows: [['게시당 팔로우', fpe[ks], fpe[kr], kb ? fpe[kb] : null, '명'], ['공유', E[ks].share_pm_med, E[kr].share_pm_med, kb ? E[kb].share_pm_med : null, '‰']].filter(x => x[1] != null && x[2] != null),
      foot: r >= 1 ? `${nm(kr)} 게시물이 팔로우를 ${nm(ks)}의 ${r}배 데려와서, 침체를 벗어난 상황이다(게시물 ${E[kr].n}개).` : `${nm(kr)} 게시물이 팔로우를 ${nm(ks)}보다 적게 데려와서, 아직 침체인 상황이다(게시물 ${E[kr].n}개).` }); }
  return out;
}
function condDraw(W, c) {
  const NS = 'http://www.w3.org/2000/svg', mk = (p, t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
  const tx = (p, a, str) => { const n = mk(p, 'text', a); n.textContent = str; return n; }, tip = (n, str) => { mk(n, 'title', {}).textContent = str; };
  const rnd = (i, k) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;   // 원본 결정적 흔들림(구슬 높낮이)
  const fm = v => v >= 100 ? Math.round(v) : Math.round(v * 100) / 100;
  const rowH = 62, top = 34, H = top + c.rows.length * rowH - 10, X0 = 14, X1 = W - 14;   // raw-ok: 시안 v2 승인 배치(운영자 261024) — 행 62 · 행 이름 자리 34 · 좌우 여백 14
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${W} ${H}`); s.setAttribute('width', W); s.setAttribute('height', H);
  c.rows.forEach((r, i) => {
    const [name, a, b, ref, u] = r, y = top + i * rowH + 14, unit = u || c.unit, up = b >= a, col = up ? 'var(--accent)' : 'var(--modern-neon-orange)';
    const lo = Math.min(0, a, b, ref ?? a), hi = Math.max(a, b, ref ?? a) * 1.08, mx = v => X0 + (v - lo) / (hi - lo) * (X1 - X0), xa = mx(a), xb = mx(b);
    tx(s, { x: X0 - 6, y: y - 26, fill: 'var(--fg)', style: 'font-size:var(--fs-xs);font-weight:var(--fw-b)' }, name);
    mk(s, 'line', { x1: X0 - 6, y1: y, x2: X1 + 6, y2: y, stroke: 'var(--line)', 'stroke-width': .7 });
    if (ref != null) { const xr = mx(ref); mk(s, 'line', { x1: xr, y1: y - 7, x2: xr, y2: y + 7, stroke: 'var(--mut)', 'stroke-width': 1, opacity: .7 }); tip(mk(s, 'rect', { x: xr - 5, y: y - 9, width: 10, height: 18, fill: 'transparent' }), '기준(부흥기) ' + fm(ref) + unit); }
    if (c.bead) { const n = Math.round(Math.abs(b - a) / c.bead); for (let k = 0; k < n; k++) { const t = (k + .5) / n; mk(s, 'circle', { cx: xa + t * (xb - xa), cy: y + (rnd(k + 1, i + 3) - .5) * 2.6, r: 1.5 + rnd(k + 2, i + 4) * .9, fill: col, opacity: .55 }); } }
    else mk(s, 'line', { x1: xa, y1: y, x2: xb, y2: y, stroke: col, 'stroke-width': 2, opacity: .55 });
    mk(s, 'circle', { cx: xa, cy: y, r: 4.2, fill: 'var(--bg)', stroke: 'var(--fg)', 'stroke-width': 1.3 });
    tip(mk(s, 'circle', { cx: xb, cy: y, r: 4.6, fill: col }), `${name} — ${c.a} ${fm(a)} → ${c.b} ${fm(b)}${unit}`);
    tx(s, { x: xa, y: y + 18, 'text-anchor': 'middle', fill: 'var(--mut)', style: 'font-size:var(--fs-xs);font-variant-numeric:tabular-nums' }, fm(a));   // 기준 값 = 궤도 아래(흐림)
    const roomR = W - xb > 96, lt = tx(s, { x: roomR ? xb - 4 : xb + 4, y: y - 9, 'text-anchor': roomR ? 'start' : 'end', fill: col, style: 'font-size:var(--fs-sm);font-weight:var(--fw-x);font-variant-numeric:tabular-nums' }, fm(b) + unit);   // 비교 값 = 궤도 위(굵게) · 오른쪽 끝이면 점 왼쪽으로(잘림 0)
    const rt = mk(lt, 'tspan', { dx: 5, style: 'font-size:var(--fs-xs);font-weight:var(--fw-b);fill:var(--accent-4)' }); rt.textContent = '×' + (a ? (b / a).toFixed(1) : '—');   // 배율 = 한 단계 작게 + 골드레몬(운영자 261024)
  });
  return s;
}
const _condRO = window.ResizeObserver ? new ResizeObserver(es => es.forEach(e => { const card = e.target.closest('.cond-card'); if (card && Math.floor(e.contentRect.width) && +e.target.dataset.w !== Math.floor(e.contentRect.width)) requestAnimationFrame(() => condFillOne(card)); })) : null;
let _condObs = [];
function condFillOne(card) {
  const c = COND_CARDS[+card.dataset.ci], v = card.querySelector('.cond-viz'); if (!c || !v) return;
  if (_condRO && !v._ro) { v._ro = 1; _condRO.observe(v); _condObs.push(v); }
  const w = Math.floor(v.clientWidth);
  if (v.firstChild && v.dataset.w === String(w)) return;
  v.dataset.w = w; const svg = condDraw(w || 340, c);   // raw-ok: 340 = 폰 판 폭 근사(임시 그림 · 실폭이 오면 다시 그림)
  if (!w) { svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = 'auto'; }
  v.replaceChildren(svg);
}
function condFill(root) { _condObs = _condObs.filter(v => v.isConnected || (_condRO.unobserve(v), false)); root.querySelectorAll('.cond-card').forEach(condFillOne); }
let _condRz = 0;
__on(window, 'resize', () => { clearTimeout(_condRz); _condRz = setTimeout(() => condFill(document), 150); });
function sigFit(wrap) {   // 폰 = 실폭 재렌더(운영자 261024 — 600 고정 viewBox가 폰 ~330에서 0.55배 = 라벨 유효 4.4~4.9px 판독불가). 06-document 15px 규칙은 콜아웃 y간격이 8 기준이라 못 씀 → 좌표계를 실폭으로 바꿔 8~9를 실제 px로(평의회 261024 7/7 · 새 값 0 · 브레이크포인트 640 = 그 규칙 계승) · 반환 = 새 wrap(바뀐 게 없으면 null)
  const ax = wrap.dataset.ax, a = SIG_ARG[ax], cap = wrap.previousElementSibling, svg = wrap.querySelector('svg');
  if (!a || !svg || !cap || !cap.classList.contains('sig-cap')) return null;
  const cw = Math.round(wrap.clientWidth), w = matchMedia('(max-width:640px)').matches && cw && cw < 600 ? cw : 600;   // PC·600 이상 = 종전 600 고정
  if (w === (svg.viewBox.baseVal.width || 600)) return null;
  const t = document.createElement('div'); t.innerHTML = chLiftChart(a[0], ax, { ...a[1], w: w === 600 ? 0 : w });
  if (t.children.length !== 2) return null;
  const nw = t.children[1];
  cap.replaceWith(t.children[0]); wrap.replaceWith(nw);
  return nw;
}
const sigRefit = root => root.querySelectorAll('.sig-chartwrap').forEach(wr => { const nw = sigFit(wr); if (nw) sigWire(nw); });
let _sigRz = 0;
__on(window, 'resize', () => { clearTimeout(_sigRz); _sigRz = setTimeout(() => sigRefit(document), 150); });
{ const cb = $('#chanBox'); let w0 = -1, raf = 0;
  if (cb && window.ResizeObserver) new ResizeObserver(es => { const w = Math.round(es[0].contentRect.width); if (w === w0) return; w0 = w; if (w && !raf) raf = requestAnimationFrame(() => { raf = 0; condFill(cb); sigRefit(cb); }); }).observe(cb); }
function wireSigCharts(box) {   // 최근접 포인트 툴팁+호버점 = 일일 추이 크로스헤어 배선 대칭(호버·탭 공용 · 재렌더마다 새 노드라 중복 배선 없음)
  box.querySelectorAll('.sig-chartwrap').forEach(sigFit);
  box.querySelectorAll('.sig-chartwrap').forEach(sigWire);
  new Set([...box.querySelectorAll('.sig-chartwrap')].map(wr => wr.closest('details')).filter(Boolean)).forEach(dt => dt.addEventListener('toggle', () => { if (dt.open) sigRefit(dt); }));   // 접힌 채 렌더 = 실폭 0이라 600 유지 → 펼칠 때 맞춤
}
function sigWire(wrap) {
  const subs = [...wrap.querySelectorAll('text.sig-sub')];   // 요일 축 서브 숫자(6·14·22) — 실제 그려진 상자가 서로 겹치면(폰 실폭 ~300 미만) 그 줄만 걷는다(운영자 261024 「위험은 해결」 · 새 임계값 0 = 실측 겹침 판정 · 눈금선·요일명·툴팁 시각은 유지)
  for (let i = 1; i < subs.length; i++) { const a = subs[i - 1].getBBox(), b = subs[i].getBBox(); if (a.width && b.x < a.x + a.width) { subs.forEach(t => t.remove()); break; } }
  const hits = SIG_HIT[wrap.dataset.ax] || [], tip = wrap.querySelector('.ch-tip'), dot = wrap.querySelector('.ch-dot');
  if (!hits.length || !tip) return;
  const vb = wrap.querySelector('svg').viewBox.baseVal, VW = vb.width || 600, VH = vb.height || 154;   // 좌표계 = 렌더된 viewBox 실측(폰 실폭 재렌더 동조 · 구 600/154 하드코딩)
  const place = (x, y) => { const r = wrap.getBoundingClientRect(); return [x / VW * r.width, y / VH * r.height]; };   // 154 = chLiftChart viewBox H(260722 170→154 축소 동조 누락 정정 — 구 170 잔존 = 호버점·툴팁 ~9% 상방 이탈)
  const hide = () => { tip.style.opacity = '0'; if (dot) dot.style.opacity = '0'; };
  const move = ev => {
    const r = wrap.getBoundingClientRect();
    const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const px = (cx - r.left) / r.width * VW;
    let best = hits[0], bd = 1e9;
    hits.forEach(pt => { const dd = Math.abs(pt.x - px); if (dd < bd) { bd = dd; best = pt; } });
    const [tx, ty] = place(best.x, best.y);
    tip.innerHTML = `<b>${esc(best.bucket)}</b><br><span style="color:var(--mut);font-size:10px">${CHAN_SRC === 'fb' ? '반응' : '공유'} ×${best.share ?? '—'}${best.gen != null ? ' · ' + (best.gm ? '접속 ' : '앱 사용자 이용 ') + '×' + best.gen : ''} · n=${best.n}${best.low ? ' · 표본부족' : ''}</span>`;   // FB 소스분기(평의회 260724 must-fix) — eng lift를 '공유'로 오표기 방지 · gen(앱사용자%)은 11245 gen 게이트가 FB=null이라 자동 생략(곡선·범례 제거와 정합)
    const _hw = (tip.offsetWidth || 110) / 2; tip.style.left = Math.max(_hw + 2, Math.min(r.width - _hw - 2, tx)) + 'px'; tip.style.top = ty + 'px';   // 좌우 클램프(260720 평의회 F5 — translate(-50%)라 엣지 포인트서 화면 밖 잘림 실측 · innerHTML 후 실폭 측정)
    tip.style.opacity = '1';
    if (dot) { dot.style.left = tx + 'px'; dot.style.top = ty + 'px'; dot.style.opacity = '1'; }
  };
  wrap.addEventListener('pointermove', move);
  wrap.addEventListener('pointerleave', hide);
  wrap.addEventListener('touchmove', move, { passive: true });
}
const SEG_AT = new Map();
const segKey = (sg, on) => [sg.id, sg.className, ...Object.keys(on.dataset)].join('|');
const segTf = (sg, at) => 'translateX(' + at[0] + 'px) scaleX(' + (at[1] / (sg.clientWidth || at[1])) + ')';
const segX = (sg, on) => { const r = on.getBoundingClientRect(), q = sg.getBoundingClientRect(); return [r.left - q.left - sg.clientLeft + sg.scrollLeft, r.width]; };
function segPill(sg) {
  const on = sg.querySelector(':scope > button.on');
  if (!on || !on.offsetWidth) return;
  const k = segKey(sg, on), from = SEG_AT.get(k);
  if (!from) return;   // 아직 안 누른 세그 = 종전 칸 배경
  let p = sg.querySelector(':scope > .seg-pill');
  if (!p) {
    p = document.createElement('span'); p.className = 'seg-pill'; p.setAttribute('aria-hidden', 'true'); sg.prepend(p);
    p.style.transition = 'none'; p.style.transform = segTf(sg, from);
    void sg.offsetWidth; p.style.transition = '';
  }
  const to = segX(sg, on);
  p.style.transform = segTf(sg, to);
  SEG_AT.set(k, to);
}
__on(document, 'click', e => {
  const b = e.target.closest('.ch-rangeseg > button'); if (!b || b.disabled) return;
  const sg = b.parentElement, on = sg.querySelector(':scope > button.on');
  if (on && on.offsetWidth) SEG_AT.set(segKey(sg, on), segX(sg, on));
  requestAnimationFrame(() => document.querySelectorAll('.ch-rangeseg').forEach(segPill));
}, true);
async function chanGet(k, file, ok, force) {   // ok = 유효 응답 판별 키(부재 = 서빙 실패 → 다음 소스) · force = api 캐시버스터(수동 감시 폴 전용)
  for (const u of ['api/chan?f=' + k + (force ? '&_=' + Date.now() : ''), file + '?ts=' + Date.now()]) {
    try {
      const sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(12000) : null;   // ⚠️ 시도마다 새 시그널 = loadCandidates·loadTrends 관용구(260803 평의회 지적: 여기만 빠져 있었다). 없으면 **매달린 소켓이 CHAN_LOADING을 영구 점유** → 채널 탭이 통째로 정지(자매 로더 주석이 명시한 그 사고 경로)
      const r = await fetch(u, sig ? { signal: sig } : undefined); if (!r.ok) continue;
      const t = await r.text(); if (/^\s*</.test(t)) continue;   // SPA 폴백(HTML 200) 가드
      const j = JSON.parse(t); if (!j || !j[ok]) continue;
      return j;
    } catch { /* 다음 소스 */ }
  }
  return null;
}
let CHAN_INFLIGHT = null;
async function loadChan(force) {
  // ⚠️ 재진입 가드가 force보다 앞이면 **수동 재수집의 강제 재fetch가 진행 중 로드에 삼켜져 조용히 무효**가 된다(260803 평의회 지적) —
  //   그러면 클릭 직후 base 재앵커가 화면의 묵은 generated_kst를 집어 첫 틱이 '완료'로 오판정한다(가짜 완료). force는 대기 후 재실행.
  if (CHAN_LOADING) { if (!force) return; try { await CHAN_INFLIGHT; } catch {} if (CHAN_LOADING) return; }
  if (!force && CHAN && Date.now() - CHAN_AT < 300e3) { renderChan(); return; }   // force = 수동 재수집 감시(TTL 우회)
  CHAN_LOADING = true;
  const _prevG = (CHAN && CHAN.generated_kst) || '';   // 변화 판정용 스냅(아래 재조립 억제)
  try {
    CHAN_INFLIGHT = Promise.all([chanGet('ig', 'insta_data.json', 'generated_kst', force), chanGet('brief', 'chan_brief.json', 'updated', force), chanGet('fb', 'fb_data.json', 'generated_kst', force), chanGet('brieffb', 'chan_brief_fb.json', 'updated', force), chanGet('th', 'threads_data.json', 'generated_kst', force), chanGet('gyeol', 'gyeol_data.json', 'generated_kst', force)]);   // 브리프·페이스북(1-2 · Q155)·FB브리프(운영자 260724) = 병행 fetch·실패 무해(파일 없음 = 유닛/소스 미표시 = 조용한 공백)
    const [d, b, f, bf, t, gy] = await CHAN_INFLIGHT;   // t = 스레드(1-3 · threads_data.json · 운영자 261022) — 실패·부재 = 소스 미표시(조용한 공백 · fb 관례)
    if (d) { CHAN = d; CHAN_AT = Date.now(); }
    if (b) CHANB = b;
    if (f) CHAN_FB = f;
    if (bf) CHANB_FB = bf;
    if (t) CHAN_TH = t;
    if (gy) CHAN_GY = gy;   // 「결과 함께」(#981 · gyeol-fetch 30분) — 실패·부재 = 소스 비어 조용한 공백
  } catch {}
  finally {
    CHAN_LOADING = false; CHAN_INFLIGHT = null;
    // force 폴(수동 재수집 감시 = 30초 주기)은 **변화가 있을 때만** 재조립 — 무가드면 폴마다 채널 화면 전체가 innerHTML로 재부양해
    //   스크롤·접힘·토글이 튄다(renderSnsTrends가 _trSig 시그니처 가드로 막아둔 바로 그 축 · 260803 평의회 지적).
    if (CURTAB === 'chan' && (!force || ((CHAN && CHAN.generated_kst) || '') !== _prevG)) renderChan();
    try { renderMsgBadge(); } catch {}
  }   // 채널 데이터 도착 = 인구통계 기준일 판정 재계산(demoStaleMsgs) → 배지·기어 상태 동기(운영자 260726 · 데이터 없을 땐 조용 = 오탐 0)
}
function chThFail(img) {
  const a = img && img.parentNode; if (!a) return;
  // 1회 재시도 = 인스타 **공개** 커버 경로(운영자 260803 "빈칸을 최대한 없애는 방향") — 서버가 구운 CDN URL은
  // oe= 만료·CDN 교체로 죽지만 permalink는 안 죽는다 → 화면에서 그 자리에 살아있는 커버를 다시 집어온다.
  // 커버 자산이 없으면 IG가 null.jpg로 302 → 그건 400 응답이라 onerror가 재발동하고, 그땐 dataset.rt가
  // 막아 아래 캡션 강등으로 떨어진다(무한 루프 0 · 서버측 동일 소스 = insta_fetch._public_cover).
  if (!a.dataset.rt) {
    const mo = /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/.exec(a.getAttribute('href') || '');
    if (mo) { a.dataset.rt = '1'; img.src = 'https://www.instagram.com/p/' + mo[1] + '/media/?size=l'; return; }
  }
  img.remove();
  a.classList.add('txt');
  const s = document.createElement('span'); s.className = 'cap'; s.textContent = a.dataset.cap || '';
  a.appendChild(s);
}
const CH_REELGLYPH = '<svg class="rl" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.42)"/><path d="M10 8.5v7l6-3.5z" fill="rgba(255,255,255,.96)"/></svg>';
const CHAN_FOLD = new Set();
const chanFoldWire = box => box.querySelectorAll('details.tgroup').forEach(dt => dt.addEventListener('toggle', () => { if (dt.open) CHAN_FOLD.delete(dt.dataset.g); else CHAN_FOLD.add(dt.dataset.g); }));
let _gySig = '';
let _gyMvList = [];
const GY_FIRST = 8;
let GY_SORT = 'new', GY_MORE = false;
try { GY_SORT = localStorage.getItem('nm_gy_sort') || 'new'; } catch (_) { /* 기억 못 해도 최신순 */ }
if (!['new', 'score', 'star', 'todo'].includes(GY_SORT)) GY_SORT = 'new';
function gyLedger(g) {
  const room = ((g.room || {}).songs) || [], tr = (room.length ? room : (g.flow || []).filter(x => x.kind === 'song')).map(x => ({ at: x.at, hypo: !!x.hypo }));
  const seen = new Set(), mv = [];
  (g.songs || []).forEach(s => { if (s.hypo) return; (s.mv || []).forEach(m => { if (!m || !m.url || seen.has(m.url)) return; seen.add(m.url); mv.push(Object.assign({ s }, m)); }); });
  return { tr, mv };
}
function gyTrend(L) {
  const D = 864e5, now = Date.now(), KST = 9 * 3600e3, ts = L.tr.filter(x => !x.hypo).concat(L.mv).map(x => Date.parse(x.at || '')).filter(t => isFinite(t) && t <= now);   // raw-ok: 864e5 = 하루(ms) · KST +9h
  const r30 = ts.filter(t => now - t < 30 * D); if (!r30.length) return '';
  const w0 = ts.filter(t => now - t < 7 * D).length, w1 = ts.filter(t => now - t >= 7 * D && now - t < 14 * D).length, dw = w0 - w1;
  const span = Math.min(30, Math.max(1, Math.ceil((now - Math.min(...ts)) / D))), days = new Set(r30.map(t => new Date(t + KST).toISOString().slice(0, 10))).size;
  let when = '';
  if (r30.length >= 4) {
    const wd = Array(7).fill(0), bd = [0, 0, 0, 0]; r30.forEach(t => { const d = new Date(t + KST); wd[d.getUTCDay()]++; bd[Math.floor(d.getUTCHours() / 6)]++; });
    when = `<span><b>${'일월화수목금토'[wd.indexOf(Math.max(...wd))]}·${['새벽', '오전', '오후', '저녁'][bd.indexOf(Math.max(...bd))]}</b>자주 올리는 때 · ${r30.length}건</span>`;
  }
  return '<div class="gy-trend">' +
    `<span><b class="gy-num">${w0}</b>최근 7일 올림${dw ? `<em class="${dw > 0 ? 'up' : 'dn'}">${dw > 0 ? '+' : ''}${dw}</em>` : ''}</span>` +
    `<span><b class="gy-num">${days}</b>올린 날 · ${span}일 중</span>` + when + '</div>';
}
function gyRhythm(L) {
  const KST = 9 * 3600e3, D = 864e5, N = 30, day = t => new Date(t + KST).toISOString().slice(0, 10);   // raw-ok: KST +9h = 벽시계 시프트(기기 TZ 무관) · 864e5 = 하루(ms)
  const today = day(Date.now()), t0 = Date.parse(today + 'T00:00:00+09:00') - (N - 1) * D;
  const tr = new Map(), hy = new Map(), mv = new Map(), add = (m, at) => { const t = Date.parse(at || ''); if (!isFinite(t) || t < t0) return; const d = day(t); m.set(d, (m.get(d) || 0) + 1); };
  L.tr.forEach(x => add(x.hypo ? hy : tr, x.at)); L.mv.forEach(x => add(mv, x.at));
  if (!tr.size && !mv.size && !hy.size) return '';
  const W = 400, H = 160, LP = 12, RP = 12, base = 124, lane = 16, step = (W - LP - RP) / (N - 1), CAP = 10, gap = 7.4;   // raw-ok: Lupi B2 좌표계(400 폭 · 점 r 2.1 · 간격 = 점 지름 + 3) · 뮤비 줄 = 맨 위 고정
  const cs = Array.from({ length: N }, (_, i) => tr.get(day(t0 + i * D)) || 0), pk = [];
  cs.map((c, i) => [c, i]).filter(([c]) => c > 1).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (pk.length < 2 && pk.every(j => Math.abs(j - i) >= 5)) pk.push(i); });
  let s = `<svg class="gy-rhy" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="최근 30일 제작 리듬 — 점 하나가 트랙 하나, 맨 위 고리가 뮤비">`;
  s += `<line x1="${LP - 4}" y1="${base}" x2="${W - RP + 4}" y2="${base}" stroke="var(--modern-line)" stroke-width=".8"/>`;
  s += `<line x1="${LP - 4}" y1="${lane}" x2="${W - RP + 4}" y2="${lane}" stroke="var(--modern-line)" stroke-width=".6" stroke-dasharray="1 3"/>`;
  let hyN = 0;
  for (let i = 0; i < N; i++) {
    const t = t0 + i * D, d = day(t), x = (LP + i * step).toFixed(1), c = cs[i], h2 = hy.get(d) || 0, m = mv.get(d) || 0, wk = new Date(t + KST).getUTCDay(), we = wk === 0 || wk === 6, now = d === today;
    const tip = `${d.slice(5).replace('-', '/')}${now ? ' 오늘' : ''} · ${c || m || h2 ? ['트랙 ' + c, m ? '뮤비 ' + m : '', h2 ? '실험 ' + h2 : ''].filter(Boolean).join(' · ') : '기록 없음'}`;
    hyN += h2;
    s += `<g><title>${tip}</title>`;
    s += `<line x1="${x}" y1="${base}" x2="${x}" y2="${base + 6}" stroke="${now ? 'var(--modern-accent)' : 'var(--modern-line)'}" stroke-width="${now ? 1.4 : .8}"/>`;
    const k = Math.min(c, CAP);
    for (let j = 0; j < k; j++) s += `<circle cx="${x}" cy="${(base - 6 - j * gap).toFixed(1)}" r="2.1" fill="${we ? 'none' : 'var(--modern-accent)'}" stroke="var(--modern-accent)" stroke-width="${we ? 1 : 0}"/>`;
    if (c > CAP || pk.includes(i)) s += `<text x="${x}" y="${(base - 16 - Math.max(0, k - 1) * gap).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--modern-fg)" paint-order="stroke" stroke="var(--modern-space-bg)" stroke-width="3">${c}</text>`;
    if (m) s += `<circle cx="${x}" cy="${lane}" r="3.2" fill="var(--modern-space-bg)" stroke="var(--accent-6)" stroke-width="1.4"/>` + (m > 1 ? `<circle cx="${x}" cy="${lane}" r="5.4" fill="none" stroke="var(--accent-6)" stroke-width="1"/>` : '');
    if (h2) s += `<path d="M${x} ${base + 9}l2.6 2.6-2.6 2.6-2.6-2.6z" fill="var(--accent-4)"/>`;
    s += `<rect class="hit" x="${(LP + i * step - step / 2).toFixed(1)}" y="0" width="${step.toFixed(1)}" height="${base + 16}" data-tip="${tip}"/></g>`;
  }
  [[0, ''], [Math.floor(N / 2), ''], [N - 1, '오늘']].forEach(([i, lb]) => { const d = day(t0 + i * D); s += `<text x="${(LP + i * step).toFixed(1)}" y="${base + 30}" text-anchor="${i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle'}" font-size="12" font-weight="700" fill="var(--modern-mut)">${lb || d.slice(5).replace('-', '/')}</text>`; });
  return s + '</svg>' + `<span class="gy-eyebrow gy-rhy-lg">최근 30일 · 점 = 트랙 · <i class="gy-ring" aria-hidden="true"></i> = 뮤비${hyN ? ` · <i class="gy-dia" aria-hidden="true"></i> = 실험 ${hyN}` : ''}</span><span class="gy-eyebrow gy-rhy-read" aria-live="polite"></span>`;
}
function gyRead(wrap, hit) {   // 리듬 한 날 읽기(누름·PC 올림) — 범례 자리에 「M/D · 트랙 N · 뮤비 N」 · hit 없음 = 범례로 복귀
  if (!wrap) return; const out = wrap.querySelector('.gy-rhy-read'); if (!out) return;
  wrap.querySelectorAll('.gy-rhy .hit.on').forEach(r => r.classList.remove('on'));
  if (hit) { hit.classList.add('on'); out.textContent = hit.getAttribute('data-tip') || ''; }
  wrap.classList.toggle('rd', !!hit);
}
function gyMile(n) {
  const M = [10, 25, 50, 100, 200, 500], nx = M.find(v => v > n); if (!nx) return '';
  const pv = [0, ...M].filter(v => v <= n).pop();
  return `<div class="gy-mile" role="img" aria-label="${nx}곡까지 ${nx - n}곡 남음"><i style="--p:${((n - pv) / (nx - pv)).toFixed(3)}"></i><span>${nx}곡까지 <b class="gy-num">${nx - n}</b></span></div>`;
}
function gyHook(ly) {
  const ls = String(ly || '').split('\n'), ci = ls.findIndex(l => /^\s*\[\s*(chorus|hook|후렴)[^\]]*\]\s*$/i.test(l)), out = [];
  for (const l of ci >= 0 ? ls.slice(ci + 1) : ls) {
    if (/^\s*\[[^\]]*\]\s*$/.test(l) || !l.trim()) { if (out.length) break; continue; }
    out.push(l.trim()); if (out.length === 4) break;
  }
  return { t: out.join('\n'), chorus: ci >= 0 && out.length > 0 };
}
let _gyPv = { t: 0, b: null };
function gyPvOff(b) { clearTimeout(_gyPv.t); _gyPv.t = 0; const el = b || _gyPv.b; _gyPv.b = null; const v = el && el.querySelector('.gy-mvt-pv'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); } }
function gyPostKey(m) { let p = ''; try { p = new URL(m.url).pathname; } catch (_) { p = String(m.url || '').split('?')[0]; } return (String(m.song || '') + '|' + p).slice(0, 200); }
function gyPosted() { return new Set(((typeof NM_SET !== 'undefined' && NM_SET && NM_SET.gyPost) || []).map(x => x.id)); }
function gyPostRepaint() {   // 표시가 바뀜(이 기기 누름 · 다른 기기 값 로드) = 보드·히어로·보기 창 단추 다시 그림
  const b = __byId('chanBox'); if (b && CHAN_SRC === 'gyeol' && CHAN_GY) renderChanGyeol(b);
  try { tvPostPaint(); } catch (_) {}
}
function gyMvOpen(i) { gyPvOff(); const it = _gyMvList[i]; if (!it || typeof openTrView !== 'function') return; openTrView({ src: it.url, k: 'pt', media: true }, null, { arr: _gyMvList, i }, it); }
function renderChanGyeol(box) {
  const g = CHAN_GY;
  { const vt = __byId('vhTimeTxt') || __byId('vhTime'); if (vt) vt.textContent = (g && g.generated_kst) ? (fmtK12(g.generated_kst) || '') : ''; try { CHANF.paint(); } catch (_) {} const rb = __byId('chanFreshBtn'); if (rb) rb.hidden = true; }   // 재수집 픽토 = 인스타 축 전용 → 소등(결과 함께는 30분 러너가 늘 받음)
  if (!g || !g.generated_kst) { box.innerHTML = ''; return; }   // 빈 상태 = 조용한 공백(renderChan 관례)
  const RLAB = { gsum: '한눈에', gmv: '뮤비', grev: '결의 평', gflow: '흐름', gsongs: '곡 목록', gseed: '오늘 재료', gpost: '게시 현황', gact: '최근 활동' };
  const RAIL = []; let gno = 0, gfirst = true;
  const gl = (g.sources || {}).gl || {};
  const stale = gl.ok === false || (Date.now() - new Date(g.generated_kst).getTime()) / 3600e3 > 6;   // 러너 3시간마다는 반드시 다시 씀(내용 같아도) → 6시간+ = 멎음 · gl 못 읽음 = 직전 값 + 빛 멎음
  const gsec = (id, ttl, body, sub) => { const first = gfirst; gfirst = false; RAIL.push({ id, n: ++gno, lab: RLAB[id] || id }); return `<details class="tgroup${first ? ' dash' : ''}" data-g="${id}" id="cg-${id}"${CHAN_FOLD.has(id) ? '' : ' open'}><summary class="tgroup-h${first && stale ? ' hdr-stale' : ''}"><i>${gno}</i>${ttl}</summary>${sub ? `<div class="chseg-row">${sub}</div>` : ''}${body}</details>`; };   // sub = 단위 서브행(.chseg-row = renderChan 세그 서브행 문법)
  const md = s => (fmtK12(s) || '').split(' ')[0];   // M/D
  const ago = s => { const t = Date.parse(s || ''); return isFinite(t) ? relAge((Date.now() - t) / 3600e3) : ''; };   // 상대 시각(공용 relAge 사다리 · 오른쪽 고정폭 값 칸에 들어가는 길이)
  const dur = x => { const s2 = Math.round(+x || 0); return s2 > 0 ? Math.floor(s2 / 60) + ':' + String(s2 % 60).padStart(2, '0') : ''; };
  const row = (href, i, chip, cls, ttl, meta) => { const in1 = `<span class="trend-rank">${i}</span>${chip ? `<span class="ch-fmt ${cls}">${chip}</span>` : ''}<span class="ch-pt">${esc(ttl)}</span><span class="ch-vw">${esc(meta || '')}</span>`; return href ? `<a class="ch-post" href="${escUrl(href)}" target="_blank" rel="noopener">${in1}</a>` : `<div class="ch-post">${in1}</div>`; };   // 행 = TOP 게시물 .ch-post 문법(순번·종류 칩·제목·오른쪽 값) · 링크 없으면 div
  const sm = g.summary || {}, fAll = g.flow || [];
  // 결의 평(#1000 · 곡·뮤비 완성 회차에 결이 쓴 1인칭 한 덩이) — 곡마다 새 평이 앞 · 점수(#1047 · 1~10) · 뮤비 타일 배지는 평의 song(= 그 뮤비 흐름 id)로 잇는다
  const revs = (g.songs || []).flatMap(x => (x.reviews || []).map(r => ({ r, title: x.title, song: x }))).sort((a, b) => String(b.r.date || '').localeCompare(String(a.r.date || '')));
  const why = x => { const it = (x && x.intent) || {}; return it.purpose || it.label || ''; };   // 의도 한 줄 = 목적(없으면 라벨) · intent = 수집기 gyeol_fetch intent_of 가 의뢰 원장 그대로 실음(형 261026 「어떤 의도로 만들었는지」·「장르도」)
  const scoreBy = new Map(revs.filter(v => v.r.score && v.r.song).map(v => [v.r.song, v.r.score]));
  let h = '';
  const tierOf = n => !(n > 0) ? 'neutral' : n >= 10 ? 'peak' : n >= 8 ? 'high' : n >= 6 ? 'above' : n >= 4 ? 'below' : 'low';   // 10점 척도 → modern-score 단계 색(낮음 → 매우 높음 · 차가운 색 → 따뜻한 색)
  const score = n => `<span class="gy-score" data-score-tier="${tierOf(n)}"><b class="gy-num">${n}</b><span>/10</span></span>`;
  const list = rows => `<div class="gy-card gy-list">${rows}</div>`;   // 목록 = 글래스 판 안 .ch-post 행
  // ── 한눈에 = 히어로 판(왼쪽 = 곡 큰 숫자 + 다음 고비 막대 + 트랙·뮤비·안 올린 곡·뮤비 없는 곡 · 오른쪽 = 제작 리듬 달력 + 올린 날 경향) ──
  //   큰 숫자 = 곡(평의회 261026 — 구 「트랙 54」는 10/10 실험 36트랙이 3분의 2라 부풀었다) · 실험곡 = 머리 줄에 「따로」 · 안 올린 곡·뮤비 없는 곡 = 올리는 사람의 남은 일 · 수집 멎음 = 판 안 한 줄(빛 멎음만으론 안 읽힌다)
  const L = gyLedger(g), real = (g.songs || []).filter(x => !x.hypo), nSong = real.length || +sm.songs || 0, nHy = (g.songs || []).length - real.length, PS = gyPosted();
  const upSongs = new Set(L.mv.filter(m => PS.has(gyPostKey(m))).map(m => m.s.req_id)), mvSongs = new Set(L.mv.map(m => m.s.req_id));
  const kpi = (v, lb) => `<div class="gy-kpi"><b class="gy-num">${v}</b><span>${lb}</span></div>`;
  const chart = gyRhythm(L);   // 제작 리듬(위 gyRhythm · 누적 곡선 chTileChart 대체 = 숫자는 왼쪽 큰 글자가 이미 말한다)
  h += gsec('gsum', '한눈에', `<div class="gy-card gy-hero"><div class="gy-hero-main"><span class="gy-eyebrow">결 · 지금까지 만든 곡${nHy ? ` · 실험 ${chVf(nHy)}곡 따로` : ''}</span>` +
    `<div class="gy-big"><b class="gy-num">${chVf(nSong)}</b><span>곡</span></div>${gyMile(nSong)}` +
    `<div class="gy-kpis">${kpi(chVf(L.tr.filter(x => !x.hypo).length), '트랙')}${kpi(chVf(L.mv.length), '뮤비')}${kpi(chVf([...mvSongs].filter(k => !upSongs.has(k)).length), '안 올린 곡')}${kpi(chVf(real.filter(x => !(x.mv || []).length).length), '뮤비 없는 곡')}</div>` +
    (sm.last_song_at ? `<span class="gy-eyebrow">마지막 곡 ${esc(md(sm.last_song_at))} · ${esc(ago(sm.last_song_at))}</span>` : '') +
    (stale ? `<span class="gy-eyebrow gy-stale">수집 멎음 · ${esc(fmtK12(g.generated_kst) || '')} 기준${gl.err ? ' · ' + esc(String(gl.err).slice(0, 60)) : ''}</span>` : '') + '</div>' +
    (chart ? `<div class="gy-hero-chart">${chart}${gyTrend(L)}</div>` : '') + '</div>');
  // ── 뮤비 = 9:16 썸네일 보드(운영자 261026 「9대16으로 항상 만들어질건데, 어떻게해야 보기 편할지, 썸네일식 게시판이여야할지 · ux디자인」) ──
  //   판단: 뮤비는 늘 세로 9:16 → 커버를 자르지 않는 9:16 칸 · 글(제목·점수·시각) = 커버 위가 아니라 아래(포스터 글씨·얼굴을 가리지 않고 폰에서도 읽힌다) ·
  //   PC 4칸 · 폰 2칸(쇼츠 선반 관례 · 한 화면 4~8편 훑기) · 최신순 + 24시간 안 = NEW · 누르면 앱 안 9:16 보기 창(#trviewdlg — SNS 쇼츠 보기와 같은 창)에서 바로 재생,
  //   위로 넘기면 다음 뮤비(▲▼) · 결의 평 한 줄·점수 = 같은 창 아래 칸 · 다운로드 = 곧바로 저장 · 편집기 = 영상 편집으로. 새 탭으로 나가지 않는다.
  // 곡 묶음(운영자 261026 「앞으로 계속 쌓인다고 하면」) — 같은 곡(의뢰 id)의 뮤비(버전) = 한 칸 · 표지 = 포스터 있는 가장 새 버전 · 버전 2편+ = 뒤에 겹친 장(홈 deck .886·.826 문법) + 「N편」 · ★ = 곡 별표
  const roomBy = new Map((((g.room || {}).songs) || []).map(x => [x.id, x])), mvAll = L.mv;
  const gmap = new Map(); mvAll.forEach(m => { const k = m.s.req_id || m.s.title; if (!gmap.has(k)) gmap.set(k, []); gmap.get(k).push(m); });
  let grps = [...gmap.values()].map(items => { items.sort((a2, b2) => String(b2.at || '').localeCompare(String(a2.at || ''))); return { s: items[0].s, items, top: items.find(x => x.poster) || items[0], at: items[0].at, best: Math.max(0, ...items.map(x => +scoreBy.get(x.song) || 0)), star: !!items[0].s.starred, up: items.filter(x => PS.has(gyPostKey(x))).length }; });
  grps.sort((a2, b2) => String(b2.at || '').localeCompare(String(a2.at || '')));
  if (GY_SORT === 'score') grps.sort((a2, b2) => b2.best - a2.best || String(b2.at || '').localeCompare(String(a2.at || '')));
  else if (GY_SORT === 'star') grps.sort((a2, b2) => (b2.star - a2.star) || String(b2.at || '').localeCompare(String(a2.at || '')));
  else if (GY_SORT === 'todo') grps.sort((a2, b2) => (!!a2.up - !!b2.up) || String(b2.at || '').localeCompare(String(a2.at || '')));   // 안 올린 곡 먼저(한 편이라도 올렸으면 올린 곡)
  // 재생 목록 = 보드 순서 그대로(곡 → 그 곡의 버전 새 것부터) · 보기 창 제목 = 곡 + 테이크 이름(결의 방 원장) · 아래 칸 = 의도·장르 → 결의 평 → 아쉬움 → 좋음 → 다음(평의회 261026 「다음 판을 고를 근거가 먼저」) ·
  //   글 복사 = 제목 + 후렴 첫 덩이(gyHook) · 받는 파일 이름 = 곡_테이크.mp4
  _gyMvList = []; const firstVi = new Map();
  const bl = a2 => (a2 || []).length > 1 ? a2.map(t => '· ' + t).join('\n') : (a2 || []).join('');
  grps.forEach(gp => gp.items.forEach((m, k) => {
    const s2 = gp.s, it0 = s2.intent || {}, rv = (revs.find(v => v.r.song === m.song) || {}).r || null, n = gp.items.length, rm = roomBy.get(m.song) || {};
    const rt = String(rm.title || ''), tk = s2.title && rt.startsWith(s2.title) ? rt.slice(s2.title.length).replace(/^\s*·\s*/, '').trim() : '', hk = gyHook(rm.lyrics);   // 테이크 이름 = 트랙 제목에서 곡 제목 뒤 꼬리(「그냥 좋아서 · take1」 → take1)
    if (!firstVi.has(gp)) firstVi.set(gp, _gyMvList.length);
    _gyMvList.push({ postId: gyPostKey(m), t: (s2.title || '') + (tk ? ' · ' + tk : n > 1 ? ' · ' + (n - k) + '번째 버전' : ''), url: m.url, page: s2.link || '', poster: m.poster || '', media: true, pt: true, id: m.song,
      fn: [s2.title || 'mv', tk].filter(Boolean).join('_').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').slice(0, 60) + '.mp4',
      notes: [{ h: '만든 의도' + (it0.genre ? ' · ' + it0.genre : ''), t: why(s2) }, { h: '결의 평' + (rv && rv.score ? ' · ' + rv.score + '/10' : ''), t: (rv && rv.one) || '' },
        { h: '아쉬움', t: bl(rv && rv.bad) }, { h: '좋음', t: bl(rv && rv.good) }, { h: '다음', t: bl(rv && rv.next) }],
      copy: [s2.title || '', hk.t].filter(Boolean).join('\n\n'), copyLab: hk.t ? (hk.chorus ? '제목·후렴' : '제목·첫 소절') : '제목' });
  }));
  if (grps.length) {
    const shown = GY_MORE ? grps : grps.slice(0, GY_FIRST), mo = s2 => { const t = Date.parse(s2 || ''); if (!isFinite(t)) return ''; const d = new Date(t + 9 * 3600e3), y = d.getUTCFullYear(); return (y !== new Date().getFullYear() ? y + '년 ' : '') + (d.getUTCMonth() + 1) + '월'; };   // raw-ok: KST +9h
    const moN = new Map(); grps.forEach(gp => { const k = mo(gp.at); moN.set(k, (moN.get(k) || 0) + 1); });
    let cur = null, html = '';
    shown.forEach((gp, i) => {
      if (GY_SORT === 'new') { const m = mo(gp.at); if (m !== cur) { cur = m; html += `<div class="gy-mo"><b>${esc(m)}</b><span>${moN.get(m)}곡</span></div>`; } }   // 월 구획 = 최신순일 때만(점수·★ 순은 시간축이 아니다)
      const x = gp.top, n = gp.items.length, at = Date.parse(gp.at || ''), fresh = isFinite(at) && Date.now() - at < 24 * 3600e3, vi = firstVi.has(gp) ? firstVi.get(gp) : -1, gn = (gp.s.intent || {}).genre;
      const cv = `<span class="gy-mvt-cv">${x.poster ? `<img loading="lazy" referrerpolicy="no-referrer" src="${escUrl(x.poster)}" onerror="this.remove()" alt="">` : ''}${CH_REELGLYPH}${fresh ? '<span class="gy-mvt-new">NEW</span>' : ''}${n > 1 ? `<span class="gy-mvt-n">${n}편</span>` : ''}${gp.up ? `<span class="gy-mvt-up">올림${n > 1 ? ' ' + gp.up + '/' + n : ''}</span>` : ''}</span>`;   // 포스터 깨짐·없음 = 그림만 빠지고 9:16 액자·▶ 는 남는다
      const inner = (n > 2 ? '<span class="gy-mvt-st s2" aria-hidden="true"></span>' : '') + (n > 1 ? '<span class="gy-mvt-st" aria-hidden="true"></span>' : '') + cv + `<span class="gy-mvt-t">${esc(gp.s.title || '')}${gp.star ? ' ★' : ''}</span>${gn ? `<span class="gy-mvt-g">${esc(gn)}</span>` : ''}<span class="gy-mvt-m">${gp.best ? score(gp.best) : ''}<span>${esc(ago(gp.at))}</span></span>`;
      const dl = ` style="animation-delay:${Math.min(i, 14) * 32}ms"`;   // 스태거 = 4223 산식(i×32ms · 14 상한) · 접근명 = 칸 글 그대로(제목·장르·점수·시각 — 덮어쓰는 aria-label 없음)
      html += vi >= 0 ? `<button type="button" class="gy-mvt${n > 1 ? ' stk' : ''}" data-vi="${vi}"${dl}>${inner}</button>`   // 바로 재생 = 앱 안 보기 창
        : `<a class="gy-mvt${n > 1 ? ' stk' : ''}"${gp.s.link ? ` href="${escUrl(gp.s.link)}" target="_blank" rel="noopener"` : ''}${dl}>${inner}</a>`;   // 재생 목록에 못 든 칸(방어) = 결의 방 페이지로
    });
    const seg = `<span class="ch-rangeseg gy-sortseg" role="group" aria-label="뮤비 정렬">${[['new', '최신'], ['score', '점수'], ['star', '★', '별표 먼저'], ['todo', '안 올림', '안 올린 곡 먼저']].map(([k, lb, al]) => `<button type="button" data-gs="${k}"${GY_SORT === k ? ' class="on"' : ''} aria-pressed="${GY_SORT === k}"${al ? ` aria-label="${al}" title="${al}"` : ''}>${lb}</button>`).join('')}</span>`;
    h += gsec('gmv', `뮤비 <span class="ch-vs">${grps.length}곡 · ${mvAll.length}편</span>`, `<div class="gy-board">${html}</div>` +
      (grps.length > shown.length ? `<button type="button" class="ch-morelink gy-more">${grps.length - shown.length}곡 더 보기</button>` : ''), grps.length > 1 ? seg : '');
  }
  // ── 결의 평 = 평 판(머리 = 곡 제목·큰 점수 · 한 줄 느낌 · 좋음·아쉬움·다음 세 칸) · 새 평 3개까지 ──
  if (revs.length) h += gsec('grev', `결의 평 <span class="ch-vs">${revs.length}개</span>`, revs.slice(0, 3).map(({ r, title, song }) => {
    const grp = (lb, a) => (a || []).length ? `<div class="tbrief-prop"><span class="tbrief-lbl">${lb}</span><ul>${a.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '';
    const sc = r.score ? score(r.score) : `<span class="gy-eyebrow">${String(r.score_why || '').startsWith('잘못') ? '점수 ' + esc(r.score_why.replace('잘못된 값', '잘못됨')) : '점수 없음'}</span>`;   // 없음·잘못된 값 = 갈라 보임(조용히 비우지 않음 · #1047)
    return `<article class="gy-card gy-rev"><div class="gy-rev-h"><div><span class="gy-eyebrow">${esc(['결의 평', r.mv ? '뮤비' : '곡', (r.date || '').slice(5).replace('-', '/')].filter(Boolean).join(' · '))}</span><b class="gy-rev-t">${esc(title || '')}</b></div>${sc}</div>` +
      (why(song) ? `<p class="gy-rev-why"><span class="gy-eyebrow">만든 의도</span>${esc(why(song))}</p>` : '') + `<p class="gy-rev-q">${esc(r.one || '—')}</p><div class="gy-rev-cols">${grp('좋음', r.good)}${grp('아쉬움', r.bad)}${grp('다음', r.next)}</div></article>`;
  }).join(''));
  const fl = fAll.filter(x => !x.hypo).slice(0, 10);   // 흐름 = 실험곡 뺀 최근 10(전체 = gl 페이지)
  if (fl.length) h += gsec('gflow', '흐름', list(fl.map((x, i) => row(x.kind === 'mv' ? (x.link || x.video_url) : x.link, i + 1, x.kind === 'mv' ? '뮤비' : '곡', x.kind === 'mv' ? 'reels' : 'post', x.title + (x.starred ? ' ★' : ''), ago(x.at))).join('')));
  const sg = (g.songs || []).filter(x => !x.hypo);
  // 곡 목록 = 곡 카드 행(형 261026 「노래당 뮤비가 있고 없고가 표시되면 좋고 장르도 표현되면 좋아」 · 「어떤 의도로 만들었는지」):
  //   1줄 = 제목 + 장르 꼬리표 · 2줄 = 만든 의도(목적 한 줄 · 2줄 말줄임) · 3줄 = 뮤비 있음(영상 역할색 핑크 · 편수) / 없음(점선) · 점수 · 길이 · 테이크 · 날짜
  if (sg.length) h += gsec('gsongs', `곡 목록 <span class="ch-vs">${sg.length}곡 · 뮤비 ${sg.filter(x => (x.mv || []).length).length}곡</span>`, list(sg.map(x => {
    const it = x.intent || {}, mvN = (x.mv || []).length, sc = ((x.reviews || [])[0] || {}).score;
    const body = `<span class="gy-song-h"><b>${esc(x.title || '')}${x.starred ? ' ★' : ''}</b>${it.genre ? `<span class="gy-tag">${esc(it.genre)}</span>` : ''}</span>` +
      (why(x) ? `<span class="gy-song-why">${esc(why(x))}</span>` : '') +
      `<span class="gy-song-m"><span class="gy-mvpill${mvN ? ' on' : ''}">${mvN ? '뮤비 ' + mvN + '편' : '뮤비 없음'}</span>${sc ? score(sc) : ''}<span>${esc([dur(x.duration_s), '테이크 ' + x.takes, md(x.at)].filter(Boolean).join(' · '))}</span></span>`;
    return x.link ? `<a class="gy-song" href="${escUrl(x.link)}" target="_blank" rel="noopener"${it.ask ? ` title="${esc('의뢰 원문 — ' + it.ask)}"` : ''}>${body}</a>` : `<div class="gy-song">${body}</div>`;   // 의뢰 원문 = 툴팁(긴 글 · 화면은 목적 한 줄)
  }).join('')));
  const sd = g.seeds_today;
  if (sd && (sd.top || []).length) h += gsec('gseed', `오늘 재료 <span class="ch-vs">깨움 ${+sd.woke || 0} · 곡 ${+sd.songs || 0}${sd.confirmed ? '' : ' · 미확정 기준'}</span>`,
    list(sd.top.map(x => row(x.url, x.rank || '', x.over ? '넘음' : '', 'reels', x.title, (x.terms || []).slice(0, 2).join(' · '))).join('')));
  // ── 게시 현황 = 결의 공개 계정(유튜브·인스타·틱톡) + 공개 기록(생기면) ──
  const ACC = [['yt', 'YT'], ['ig', 'IG'], ['tt', 'TT']], acc = g.accounts || {};
  const accRows = ACC.filter(([k]) => acc[k]).map(([k, lb]) => row(acc[k], '', lb, 'post', '@' + (String(acc[k]).replace(/\/+$/, '').split('/').pop() || '').replace(/^@/, ''), ''));
  const yt = ((g.posts || {}).yt || {});
  if (accRows.length || (yt.items || []).length) h += gsec('gpost', '게시 현황', list(accRows.join('') + (yt.items || []).map((x, i) => row(x.url, i + 1, 'YT', 'post', x.title, ago(x.at))).join('')));
  const ACT = { song: ['곡', 'post'], mv: ['뮤비', 'reels'], mv_fail: ['실패', 'reels'], seed_wake: ['재료', 'post'], review: ['평', 'reels'] };
  if ((g.activity || []).length) h += gsec('gact', '최근 활동', list(g.activity.map((x, i) => row(x.link, i + 1, (ACT[x.type] || [])[0] || '', (ACT[x.type] || [])[1] || 'post', x.text, ago(x.at))).join('')));
  box.innerHTML = (RAIL.length > 1 ? '<div class="trailwrap" id="chanRailWrap"><nav class="trail" id="chanRail" aria-label="단위 바로가기"><button type="button" class="trail-i" data-tg="top" aria-label="맨 위"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg></button>' +
    RAIL.map(r => `<button type="button" class="trail-i" data-tg="${r.id}" aria-label="${r.lab}">${r.n}</button>`).join('') + '</nav></div>' : '') + h;   // 레일 = renderChan 마크업 그대로
  { const sg = JSON.stringify([sm, fAll.slice(0, 3).map(x => x.id + (x.poster_url || '')), revs.length, (g.seeds_today || {}).woke]); box.classList.toggle('gy-in', sg !== _gySig); _gySig = sg; }   // 내용이 바뀐 렌더만 등장 연출(06 #chanBox.gy-in)
  if (!box._gyWired) { box._gyWired = 1;   // 위임 1벌(다시 그려도 중복 배선 0) — 정렬 세그 · 더 보기 · 보드 누름 = 보기 창 · 리듬 한 날 읽기
    box.addEventListener('click', e => {
      if (CHAN_SRC !== 'gyeol') return;
      const sb = e.target.closest('.gy-sortseg > button');
      if (sb && box.contains(sb)) {   // 다시 그린 뒤 포커스 = 새 세그의 같은 칸(키보드 사용자가 맨 위로 튕기지 않게)
        if (sb.dataset.gs !== GY_SORT) { GY_SORT = sb.dataset.gs; try { localStorage.setItem('nm_gy_sort', GY_SORT); } catch (_) {} renderChanGyeol(box); const nb = box.querySelector(`.gy-sortseg > button[data-gs="${GY_SORT}"]`); if (nb) nb.focus({ preventScroll: true }); }
        return;
      }
      if (e.target.closest('.gy-more') && box.contains(e.target)) { GY_MORE = true; renderChanGyeol(box); const nt = box.querySelectorAll('.gy-board .gy-mvt')[GY_FIRST]; if (nt) nt.focus({ preventScroll: true }); return; }   // 포커스 = 새로 펼친 첫 칸
      const rh = e.target.closest('.gy-rhy .hit'); if (rh && box.contains(rh)) { gyRead(rh.closest('.gy-hero-chart'), rh.classList.contains('on') ? null : rh); return; }   // 같은 날 다시 누름 = 범례로
      const b = e.target.closest('.gy-mvt[data-vi]'); if (b && box.contains(b)) gyMvOpen(+b.dataset.vi);
    });
    // PC 미리보기(운영자 261026 「더 매력적으로」) = 포스터에 250ms 머물면 그 칸에서 무음 반복 재생(쇼츠 선반 관례) · 스쳐 지나감·떠남·누름 = 취소·정지·해제 ·
    //   손가락 화면·움직임 줄이기·데이터 절약 = 없음(데이터·배터리·전정계) · 리듬 = 올림만으로 한 날 읽기
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      const pvOk = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && !(navigator.connection && navigator.connection.saveData);
      box.addEventListener('pointerover', e => {
        if (CHAN_SRC !== 'gyeol') return;
        const rh = e.target.closest('.gy-rhy .hit'); if (rh) { gyRead(rh.closest('.gy-hero-chart'), rh); return; }
        const b = e.target.closest('.gy-mvt[data-vi]'); if (!b || b === _gyPv.b || !pvOk()) return;
        gyPvOff(); _gyPv.b = b;
        _gyPv.t = setTimeout(() => {
          _gyPv.t = 0; const it = _gyMvList[+b.dataset.vi], cv = b.querySelector('.gy-mvt-cv'); if (!it || !cv || !b.isConnected) return;
          const v = document.createElement('video'); v.className = 'gy-mvt-pv'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.src = it.url;
          v.addEventListener('playing', () => v.classList.add('on'), { once: true });
          cv.appendChild(v); const p = v.play(); if (p && p.catch) p.catch(() => {});
        }, 250);
      });
      box.addEventListener('pointerout', e => {
        const rg = e.target.closest('.gy-rhy'); if (rg && !rg.contains(e.relatedTarget)) gyRead(rg.closest('.gy-hero-chart'), null);
        const b = e.target.closest('.gy-mvt[data-vi]'); if (!b || b.contains(e.relatedTarget)) return;
        if (b === _gyPv.b) gyPvOff();
      });
    }
  }
  chanFoldWire(box);   // 접힘 = 이번 접속 동안만(위 CHAN_FOLD)
  const rl = box.querySelector('#chanRail');
  if (rl) rl.addEventListener('click', e => {   // 레일 점프 = renderChan 동작 그대로(접힌 단위면 펼치며 스크롤)
    const ri = e.target.closest('.trail-i'); if (!ri) return;
    const sb = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (ri.dataset.tg === 'top') { __scrollTo({ top: 0, behavior: sb }); return; }
    const el2 = __byId('cg-' + ri.dataset.tg);
    if (el2) { if (!el2.open) el2.open = true; el2.scrollIntoView({ behavior: sb, block: 'start' }); }
  });
}
const CHAN_BRIEF_ON = false;
let CHAN_RR = '90';
function renderChan() {
  const box = $('#chanBox'); if (!box) return;
  // 채널 소스 세그(1-1/1-2) = 헤더 .vh-acts 정적 요소로 이주(Q157 · 운영자 260718 "우상단 픽토그램과 같은 라인") — 여기선 on 상태 동기만(콘텐츠부 인라인 주입 폐지 · 배선 = 하단 전역 1회)
  { const tgl = __byId('chanSrcTgl'); if (tgl) { tgl.dataset.cs = CHAN_SRC; tgl.classList.add('on'); tgl.setAttribute('aria-label', '채널 소스: 현재 ' + ({ fb: '페이스북 — 탭하면 스레드', th: '스레드 — 탭하면 결과 함께', gyeol: '결과 함께 — 탭하면 인스타' }[CHAN_SRC] || '인스타 — 탭하면 페이스북')); } }   // 단일 IG⇄FB 아이콘 토글 활성 동기(운영자 260720 · data-cs = .cs-rail 촤르륵 슬라이드 구동[아이콘은 마크업 고정·JS는 상태만] · 항상 on = 활성 소스만 · 구 텍스트뮤테이션[Q273] 대체)
  if (CHAN_SRC === 'gyeol') { renderChanGyeol(box); return; }   // 「결과 함께」(#981) = 자체 스키마 → 전용 렌더(아래 · ig/fb/th 렌더 무접촉)
  const d = chActive();   // 활성 소스(1-1 인스타 / 1-2 페이스북 / 1-3 스레드)
  const CB = CHAN_SRC === 'fb' ? CHANB_FB : CHAN_SRC === 'th' ? null : CHANB;   // 스레드 = AI 브리프 축 없음 → 블록 미표시(조용한 공백)   // 활성 소스 AI 브리프(운영자 260724 "페이스북도 요약 동일 조건") — IG=chan_brief.json · FB=chan_brief_fb.json · 결측 = 블록 미표시(조용한 공백)
  { const vt = __byId('vhTimeTxt') || __byId('vhTime'); if (vt) vt.textContent = (d && d.generated_kst) ? (fmtK12(d.generated_kst) || '') : ''; const rb = __byId('chanFreshBtn'); if (rb) rb.hidden = !(d && d.generated_kst); try { CHANF.paint(); } catch (_) {} }   // 시각 있을 때만 재수집 픽토 점등 · paint 재호출 = IG/FB 토글 시 문맥 불일치 점등 즉시 소등(평의회 260803)(빈 헤더에 글리프 단독 방지 · SNS 축 동문법) · 수집 시각 = 최상단 채널 헤더 좌상단 1회(운영자 260720 Q290 "받아오는 시간 같으니 대칭 정반대에 1회 · 라임 강조") — 구 대분류별 반복(prof·_ctm) 폐지 대체 · vh-acts(우) 대칭 좌측 · 라임 = --accent-2 · 260803 픽토 동거 = #vhTimeTxt 이관(재수집 픽토는 trend 전용이라 chan에선 CSS 소등)
  if (!d || !d.profile) { box.innerHTML = ''; return; }   // 빈 상태 = 조용한 공백(§디자인 e-가 · 전환 복귀 경로 = 헤더 세그 상시)
  const q = ($('#q') ? $('#q').value : '').trim().toLowerCase();
  const vf = chVf;
  const p = d.profile, a = d.account_day || {}, avg = d.avg || {};
  // follows 말미 0-fill 방어(평의회4 P1 · 260721) — 수집기가 follows 미수집일을 0으로 메움(views = 키 생략과 비대칭): 수집 종료일(daily_meta.history.follows.to) 이후의 0 = 결측으로 간주(null) · 진짜 실측(>0) 보존 · 메타 부재 = 무변화 fail-soft · 🔒[15] 원천 json 무접촉(뷰어 사본 우회) · 근본 수정 = 스크래퍼 gap화(후속 축)
  const _fTo = ((((d.daily_meta || {}).history || {}).follows || {}).to) || null;
  const series = _fTo ? (d.daily_series || []).map(r => (r.date > _fTo && r.follows === 0) ? Object.assign({}, r, { follows: null }) : r) : (d.daily_series || []);
  const MET = chMet(); if (!MET[CHAN_MET]) CHAN_MET = 'views';   // 활성 소스 지표 사전(스레드 = CH_MET_TH) · 소스 전환으로 없는 지표가 남으면 조회수로
  const stUnit = k => (MET[k] ? MET[k][1] : '회');   // 지표 단위 = 일일추이 차트(CH_MET)와 동일 어휘 계승(조회=회·도달=계정)
  const vu = (n, u) => n == null ? '—' : vf(n) + ' ' + u;   // 값 없으면 단위도 생략('— 회' 방지 · fb 결측 지표 대비 Q155)
  // 델타(▲▼N%) 폐지(운영자 260718 "팔로워 옆 88% 하락 = 팔로워가 88% 빠진 걸로 오해") — '평소 대비 %'는 하락처럼 읽혀 → 전기간 평균값 병기로 대체(수치 = avg.avg_all 실측 · 창작 0)
  const rnd = x => x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;   // 소수 지표(게시 3.8개/일) 정수 반올림 시 0/4로 뭉개짐 → 100 미만만 1자리 보존
  const winAvg = (key) => {   // 프로필 공통 세그(CHAN_PROF_R) 창 일평균 = series 실측(구 avg_7d 고정 대체 · 운영자 260720 Q290 "다 같이 움직") · 앵커 = 마지막 실측일 · 결측 제외 카운트
    let end = -1; for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { end = i; break; }
    if (end < 0) return null;
    const cnt = CHAN_PROF_R === 'all' ? series.length : parseInt(CHAN_PROF_R, 10);
    let sum = 0, n = 0;
    for (let i = end; i > end - cnt && i >= 0; i--) { const v = series[i][key]; if (v != null) { sum += v; n++; } }
    return n ? { a: sum / n, n, all: CHAN_PROF_R === 'all' } : null;
  };
  const st = (lb, v, sub2, lgd) => `<div class="ch-st"><span class="ch-k">${lb}</span><div class="ch-strow"><b>${v}</b></div>${sub2 || ''}${lgd || ''}</div>`;   // 타일 = 라벨 우상단 → 값 중앙 → 하단 증감 행(운영자 260721 목업) — 구 타일 스파크·우상단 배지 폐지(추이 = 일일추이 차트 단일 담당)
  const stTall = (lb, v, sub2, chart) => `<div class="ch-st ch-st-tall"><span class="ch-k">${lb}</span><div class="ch-strow"><b>${v}</b></div>${sub2 || ''}${chart || ''}</div>`;   // 세로 2칸 타일(운영자 260721 — 팔로워·조회수 = 빈 칸 합침 + 도형 안 미니 차트)
  const winSum = (key) => {   // 창 합계 + 동일 길이 직전 창(운영자 260720 "오늘~7일 vs 8~14일 — 현재 포함 창과 동일 범위 직전 창 비교") — 앵커 = 마지막 실측일·결측 제외 = winAvg 문법 동일
    let end = -1; for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { end = i; break; }
    if (end < 0) return null;
    const cnt = CHAN_PROF_R === 'all' ? end + 1 : parseInt(CHAN_PROF_R, 10);
    const sumIn = (hi, n2) => { let t = 0, has = false; for (let i = hi; i > hi - n2 && i >= 0; i--) { const v = series[i][key]; if (v != null) { t += v; has = true; } } return has ? t : null; };
    return { cur: sumIn(end, cnt), prev: CHAN_PROF_R === 'all' ? null : sumIn(end - cnt, cnt) };   // 전체 창 = 직전 창 부재(괄호 자동 생략)
  };
  const dl = (df, unit) => df == null ? '' : `<span class="ch-dl ${df > 0 ? 'fd-up' : df < 0 ? 'fd-dn' : 'fd-zero'}">${df > 0 ? '+' + (df >= 1e4 ? vf(df) : df.toLocaleString()) : df < 0 ? '−' + (Math.abs(df) >= 1e4 ? vf(Math.abs(df)) : Math.abs(df).toLocaleString()) : '±0'}${unit || ''}</span>`;   // 증감 = 하단 행 볼드(운영자 260721 목업 — fd-* 의미색·만 축약 계승 · 1만 미만 = 콤마) · unit = 팔로워 '명'(운영자 260721 "7일 대비 +1,100명" 예시 그대로)
  const rt = key => { const w = winAvg(key); return w ? `<span class="ch-rt">${vf(rnd(w.a))}/일</span>` : ''; };   // 일평균 = 'N/일' 축약(목업 "38.6/일" — 구 우상단 'X / 일 평균' 배지 대체 · 값 = winAvg 그대로)
  const winAvgPair = (key) => {   // 현재 창 vs 직전 동창 '일평균' 짝(운영자 260722 "조회수·도달·게시 = N일 대비 ±X만/일" — 창 합계 증감 → 일평균 증감으로 교체) · 앵커 = 마지막 실측일 · 결측 제외 = winAvg 문법 동일 · 전체 = 직전 창 부재(종전 관례 = 접두·증감 생략)
    if (CHAN_PROF_R === 'all') return null;
    let end = -1; for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { end = i; break; }
    if (end < 0) return null;
    const cnt = parseInt(CHAN_PROF_R, 10);
    const avgIn = (hi) => { let t = 0, n2 = 0; for (let i = hi; i > hi - cnt && i >= 0; i--) { const v = series[i][key]; if (v != null) { t += v; n2++; } } return n2 ? t / n2 : null; };
    const c = avgIn(end), p2 = avgIn(end - cnt);
    return (c != null && p2 != null) ? { d: c - p2 } : null;
  };
  const dlRate = (key, unit) => { const w = winAvgPair(key); return w ? dl(w.d < 0 ? -rnd(-w.d) : rnd(w.d), unit) : ''; };   // 일평균 증감 = '±N만/일'·'±N.N개/일'(dl 의미색·만 축약 계승 · rnd = 크기 기준 부호 분리 — 음수 −503.3 소수 잔존/양수 503 정수 비대칭 방지 · 소수 지표 1자리 보존)
  const rateSub = (key, unit, fb) => { const r = dlRate(key, unit); return sub(r, r ? '' : (fb !== undefined ? fb : rt(key))); };   // 증감 불가(전체·직전 창 결측) = 종전 일평균(또는 지정 폴백) 단독 fail-soft
  const sub = (dh, rh) => { const vs = dh && CHAN_PROF_R !== 'all' ? `<span class="ch-vs">${CHAN_PROF_R}일 대비</span>` : ''; const rte = rh ? `<span class="ch-rte">${dh ? '<i class="ch-sep" aria-hidden="true"></i>' : ''}${rh}</span>` : ''; return (dh || rh) ? `<div class="ch-sub">${vs}${dh}${rte}</div>` : ''; };   // 'N일 대비' 접두 = 프로필 세그(CHAN_PROF_R) 연동(운영자 260721 "7일 대비 +1,100명 | 37.3/일" — 전체 = 접두 생략 "전체는 어쩔수없는거고") · 구분 세로선+일평균 = 한 덩어리(.ch-rte — 협폭 개행 시 선이 줄 끝에 홀로 안 남게 동반 이동)
  const PER_D = ' <span class="ch-per">/일</span>';   // '/일' 접미(70% 축소·앞 띄어쓰기) = 게시 postsTile PER 문법 계승 — 개수 단위('개')가 없는 지표(조회·도달·상호작용)용
  const avgTile = (lb, key, fbv, tf, chart) => {   // 주값 = 창 일평균 'N /일'(운영자 260729 "조회수랑 도달 일평균 수로") — 구 창 합계 주값(sumTile) 대체 · 구성 = 게시 postsTile 100% 계승(주값 일평균 + 하단 'N일 대비 ±X만/일' 증감 + 증감 불가 시 누적 합계 폴백) · 결측 = 당일값(fbv) fail-soft
    const wa = winAvg(key), ws = winSum(key);
    const big = wa ? vf(rnd(wa.a)) + PER_D : fbv;   // 주값 = 창 일평균(토글 연동 · 앵커·결측 처리 = winAvg 문법 그대로)
    const cumul = (ws && ws.cur != null) ? `<span class="ch-rt">${vf(ws.cur)}</span>` : '';   // 누적 합계 = 증감 불가(전체 창·직전 창 결측)일 때만 하단 폴백 = postsTile cumul 동일 문법(구 주값 강등)
    return (tf || st)(lb, big, rateSub(key, '/일', cumul), chart);
  };
  const postsTile = () => {   // 게시(운영자 260722 자리·폰트 스왑) — 주값 = 일평균 '개/일'(토글 연동 · 그 기간 꾸준함이 핵심) · 하단 보조 = 누적량 'N개'(구 주값 51개 강등 = 그냥 누적) + 직전창 대비 증감 · 구 sumTile(누적 주값) 대체
    const w = winSum('posts'), a = winAvg('posts');
    const PER = '개 <span class="ch-per">/일</span>';   // '/일' = 70% 축소 + 앞 띄어쓰기(운영자 260722 "강조될만한 내용 아님") · '개'는 주값 크기 유지
    const big = a ? vf(rnd(a.a)) + PER : (avg.posts && avg.posts.avg_7d != null ? vf(rnd(avg.posts.avg_7d)) + PER : '—');   // 주값 = 창 일평균(토글별) · 폴백 = avg_7d
    const cumul = (w && w.cur != null) ? `<span class="ch-rt">${vf(w.cur)}개</span>` : '';   // 누적량 = 증감 불가(전체) 시에만 폴백 노출(운영자 260722 하단 행 단일화)
    return st('게시', big, rateSub('posts', '개/일', cumul));   // 하단 행 = 'N일 대비 ±X.X개/일' 일평균 증감(운영자 260722 "게시 도 7일 대비 +-0.0개/일" — 구 누적 증감+누적량 병기 대체)
  };
  // 팔로워 = 카운트 본값 + 하단 행 '+신규합 N/일'(운영자 260721 목업 · CHAN_PROF_R 창 연동 · 신규 팔로워 합 = winSum('follows') — 언팔 미수집이라 순증감 아님 · 🔒[15]) — 구 flwSt 증감 카드(chSpark2)·괄호 병기(Q290) 폐지 대체
  const flwVal = () => p.followers_count == null ? '—' : p.followers_count.toLocaleString();
  const flwSub = () => { const w = winSum(d.src === 'threads' ? 'follower_net' : 'follows'); return sub(w && w.cur != null ? dl(w.cur, '명') : '', ''); };   // 스레드 = 신규 유입 칸이 없어 그날 값 차분(follower_net · 순증감) · 팔로워 = '명' 접미(운영자 260721 "7일 대비 +1,100명" 예시 그대로 · 타 지표 = 만 축약이 단위 담당이라 무접미) · 일평균 'N/일' 병기 = 삭제(운영자 260722 "팔로워에 70.3/일 삭제")
  // 팔로워 구성(성별 = 세로 100% 누적 막대 · 연령 = 가로 막대 top4 · 운영자 260722) — 원천 = audience_sample.gender(전 셀 3분할 남/여/미 100%)·age_full(전 버킷 내림차순) · 구 age_gender_top(TOP5 도넛) 과소집계 폐지 · lifetime 지표라 기간 토글 비연동 · 데이터 부재(fb 등) = 빈 칸(조용한 공백)
  const demoTile = (ax) => {
    const AUD = d.audience_sample || {};
    const manual = !!(AUD.pinned || /^manual/.test(String(AUD.src || '')));   // 수기 고정 소스(FB 성별·연령 = 스샷 폴백 · demoStaleMsgs 억제축과 동일 판정) = 도넛 중앙에 「수동」 각인(운영자 260726 "그 도형 안에 수동이라고 조그맣게") · 자동(IG · src=api·무src) = 미표기 → IG 자동값과 육안 구분
    const mAsOf = /^\d{4}-\d{2}-\d{2}$/.test(String(AUD.as_of || '')) ? (+String(AUD.as_of).slice(5, 7)) + '/' + (+String(AUD.as_of).slice(8, 10)) : '';   // 기준일 = M/D 축약(단위 헤더 fmtK12 표기 문법 계승 — 연도 생략 = 도넛 중앙 폭 한계) · 없으면 빈 문자 = 1행만
    // 이어 쓴 인구통계(PM 10-22 결정 ② · 수집기가 Meta 빈손 회차에 직전 값을 이음) = 원래 받은 시각을 타일 하단 행에 「M/D hh:mmAM 기준」 —
    //   하단 행(.ch-sub)·'N일 대비' 접두(.ch-vs) 문법 그대로 · 시각 표기 = 단위 헤더 fmtK12 · 갓 받은 값(carried_kst 없음) = 행 미생성(종전 그대로)
    const cw = AUD.carried_kst ? `<div class="ch-sub"><span class="ch-vs">${esc((fmtK12(AUD.carried_kst) || String(AUD.as_of || '')) + ' 기준')}</span></div>` : '';
    // 성별 = 전 셀 3분할 남/여/미(100% 누적 · 운영자 260722 세로 막대) — 구 데이터(gender 부재) = age_gender_top 폴백 합산
    let G = AUD.gender;
    if (!G) { const gm = {}; ((AUD.age_gender_top) || []).forEach(x => { const m = /·([MFU])$/.exec(String(x.k || '')); if (m) gm[m[1]] = (gm[m[1]] || 0) + (+x.pct || 0); }); const t = (gm.M || 0) + (gm.F || 0) + (gm.U || 0); if (t) G = { M: gm.M / t * 100, F: gm.F / t * 100, U: gm.U / t * 100 }; }
    const GCOL = { M: 'var(--accent)', F: 'var(--accent-2)', U: 'rgba(255,255,255,.28)' };   // 남=터콰이즈(--accent)·여=네온레몬(--accent-2 = 릴스 '레몬' 정본 어휘)·미지정=무채(운영자 260722 "남 더콰이즈 · 여 네온레몬" — 구 파랑/빨강 폐지 · 팔레트 정본만)
    const GLAB = { M: '남', F: '여', U: '미' };   // 미 = 미지정 축약(운영자 260722)
    // 성별 = 남:여 정규화(미지정 제외 = IG 앱 표기 정합 · 운영자 260722 IG 스샷 참고 "남 64.3 / 여 35.7" 모든 기간 동일) — 구 3분할(미 포함) 폐지 · M_norm 우선, 폴백 = M/F 정규화
    const gN = G ? { M: G.M_norm != null ? +G.M_norm : ((G.M + G.F) ? G.M / (G.M + G.F) * 100 : 0), F: G.F_norm != null ? +G.F_norm : ((G.M + G.F) ? G.F / (G.M + G.F) * 100 : 0) } : null;
    const gseg = gN ? ['M', 'F'].filter(k => gN[k] > 0).map(k => ({ k, lb: GLAB[k], pct: +gN[k], col: GCOL[k] })) : [];
    // 연령 = 전 버킷 상위 4(운영자 260722 가로 막대 · 블릿X) — age_full 우선, 폴백 = age_gender_top 연령 합산
    let aseg = [];
    if (Array.isArray(AUD.age_full) && AUD.age_full.length) aseg = AUD.age_full.slice(0, 4).map(x => ({ lb: x.k, pct: +x.pct }));
    else { const am = {}; ((AUD.age_gender_top) || []).forEach(x => { const m = /^(.+?)·[MFU]$/.exec(String(x.k || '')); if (m) am[m[1]] = (am[m[1]] || 0) + (+x.pct || 0); }); aseg = Object.keys(am).sort((a, b) => am[b] - am[a]).slice(0, 4).map(k => ({ lb: k, pct: am[k] })); }
    // 지역 = 상위 도시·국가 top4(운영자 260726 Meta 인구통계 스샷 "이거 반영" — 수집은 260713부터 살아 있었고 화면에만 없던 축) — 원천 = audience_sample.city_top/country_top(퍼센트 분모 = 팔로워 총수 = Meta 화면 정합) · 막대 문법 = 아래 연령 abars 100% 계승 · 부재(fb·구 데이터) = 빈 칸(조용한 공백)
    const KCITY = { Seoul: '서울', Busan: '부산', Incheon: '인천', Daegu: '대구', Daejeon: '대전', Gwangju: '광주', Ulsan: '울산', Sejong: '세종', Suwon: '수원', Yongin: '용인', Hwaseong: '화성', Goyang: '고양', Changwon: '창원', Seongnam: '성남', Cheongju: '청주', Cheonan: '천안', Pyeongtaek: '평택', Namyangju: '남양주', Bucheon: '부천', Paju: '파주', Ansan: '안산', Anyang: '안양', Gimhae: '김해', Pohang: '포항', Jeonju: '전주', Jeju: '제주', Gimpo: '김포', Siheung: '시흥' };   // 도시 = IG API가 영문만 준다(Meta 화면도 화성은 영문 노출) → 한글 표기 대조표 · 미등재 도시 = 영문 원문 폴백(지어내기 0)
    const cityLab = k => { const c = String(k || '').split(',')[0].trim(); return KCITY[c] || c; };
    const ctryLab = k => { const c = String(k || '').trim(); try { return (new Intl.DisplayNames(['ko'], { type: 'region' })).of(c) || c; } catch { return c; } };   // 국가 = ISO 코드 → 한글(브라우저 네이티브 Intl · 대조표 창작 0) · 미지원·비정상 코드 = 코드 그대로
    const cseg = (Array.isArray(AUD.city_top) ? AUD.city_top : []).slice(0, 4).map(x => ({ lb: cityLab(x.k), pct: +x.pct }));
    const nseg = (Array.isArray(AUD.country_top) ? AUD.country_top : []).slice(0, 4).map(x => ({ lb: ctryLab(x.k), pct: +x.pct }));
    if (!gseg.length && !aseg.length && !cseg.length && !nseg.length) return '';
    // 성별 = 100% 누적 원형(도넛) 복원(운영자 260722 "누적 원형 차트로 다시 · 100% 원형차트" — 세로 막대·목표/마지노선 틱·각주 폐지) · 남+여 = 정규화 100%라 링 완전 충전 · 렌더 = 앱 인라인 SVG 문법(REELGLYPH 계승) · 여(전체 링) 밑층 + 남(호) 상층 = 이음새 0
    const gdonut = (segs, manual, asOf) => { const R = 15.5, C = 2 * Math.PI * R; let off = 0; const rot = segs.length === 2 ? -90 + 225 - (segs[0].pct * 3.6 + segs[1].pct * 1.8) : -90; const two = manual && asOf; return `<span class="demo-donut" aria-hidden="true"><svg viewBox="0 0 46 46"><g transform="rotate(${rot.toFixed(1)} 23 23)">` + (segs.length === 2 ? `<circle cx="23" cy="23" r="${R}" fill="none" stroke="${segs[1].col}" stroke-width="7"/>` : '') + segs.slice(0, segs.length === 2 ? 1 : segs.length).map(s2 => { const len = C * s2.pct / 100, o = off; off += len; return `<circle cx="23" cy="23" r="${R}" fill="none" stroke="${s2.col}" stroke-width="7" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-o).toFixed(2)}"/>`; }).join('') + `</g>` + (manual ? `<text class="demo-manual" x="23" y="${two ? 20.8 : 23}" text-anchor="middle" dominant-baseline="central">수동</text>` + (two ? `<text class="demo-manual demo-manual-d" x="23" y="27.6" text-anchor="middle" dominant-baseline="central">${esc(asOf)}</text>` : '') : '') + `</svg></span>`; };   // manual = 도넛 빈 중앙(회전 g 밖 = 미회전)에 「수동」 + 기준일 2행 각인(운영자 260726 · 한 수 채택 "기준일까지 · 투박하지 않게 기틀 따라") — 2행 = 중앙 23 기준 위 −2.2/아래 +4.6u(광학 = 아래 행이 작아 시각 무게 중심 보정 · 260726 실캡처 튜닝) · 링 안쪽 반경 12u 안 여백 확보 = 세그 미간섭 · 기준일 없으면 1행(중앙 23) 종전 그대로   // rot = 여(레몬) 세그 중심을 좌하단 225°(시계방향 · 12시 기준)에 고정(운영자 260722 "차트 좌하단에 라임레몬") — 남 시작각 = 225 − (남×3.6 + 여×1.8) 데이터 연동이라 비율 변해도 좌하단 유지 · 2세그 외 = 종전 12시 시작
    const glist = segs => `<span class="demo-glist">` + segs.map(s2 => `<b style="color:${s2.col}">${esc(s2.lb)} ${Math.round(s2.pct * 10) / 10}%</b>`).join('') + '</span>';   // 목표·마지노선 각주 = 삭제(운영자 260722 "목표라는 말은 삭제")
    // 연령 가로 막대(.ch-bar 부품 계승 · 막대 좌·글자 우 · 높이 중앙정렬 · 운영자 260722) — 막대 길이 = 최댓값 대비 스케일(주제 막대 문법)
    const abars = (segs, dec) => { const amx = Math.max(1, ...segs.map(s => s.pct)), pf = v => dec ? Math.round(v * 10) / 10 : Math.round(v); return `<span class="demo-bars">` + segs.map((s2, i) => `<span class="demo-brow"><span class="ch-bar demo-bar"><i style="width:${Math.max(6, Math.round(s2.pct / amx * 100))}%${i < 2 ? '' : ';background:var(--fg)'}"></i></span><span class="demo-blab demo-bage${i < 2 ? ' hi' : ''}">${esc(s2.lb)}</span><span class="demo-blab demo-bpct${i < 2 ? ' hi' : ''}">${pf(s2.pct)}%</span></span>`).join('') + '</span>'; };   // dec = 소수 1자리(도시·국가 = 0.8%가 정수 반올림에 뭉개짐 · Meta 화면도 19.5/5.4/5 표기 = 트레일링 0 자동 탈락) · 연령 = 종전 정수 그대로   // top2 = 강조색 터쿼이즈 그라데(운영자 260722 "TOP 2 강조색") · 3·4위 = 흰색 --fg 막대+글자("아래 그냥 흰색") · 나이/% = 분리 2열 우측정렬(운영자 260722 "개별 배치 표문법" — 한자리 % 정렬 깨짐 해소 · 그리드 열 공유)
    const gT = `<div class="ch-st ch-demo ch-demo-g"${manual ? ` role="group" aria-label="성별 구성 — 수동 입력${mAsOf ? ' · ' + esc(String(AUD.as_of)) + ' 기준' : ''}"` : ''}><span class="ch-k">성별</span><div class="demo-gwrap">${gdonut(gseg, manual, mAsOf)}${glist(gseg)}</div>${cw}</div>`;   // manual = 타일에 접근성 라벨(도넛 svg는 aria-hidden 장식 = 낭독기서 「수동」이 안 읽히던 사각 · 한 수 채택 260726) · 라벨엔 연도 포함 전체 기준일(시각 각인은 폭 한계로 M/D 축약)
    const aT = `<div class="ch-st ch-demo ch-demo-a"><span class="ch-k">연령</span>${abars(aseg)}${cw}</div>`;
    const cT = `<div class="ch-st ch-demo ch-demo-c ch-st-wide"><span class="ch-k">도시</span>${abars(cseg, 1)}${cw}</div>`;   // 도시·국가 = 가로 2칸 타일(3행 · 운영자 260726) · 셸·라벨·막대 = 연령 타일 그대로
    const nT = `<div class="ch-st ch-demo ch-demo-n ch-st-wide"><span class="ch-k">국가</span>${abars(nseg, 1)}${cw}</div>`;
    return ax === 'g' ? (gseg.length ? gT : '') : ax === 'a' ? (aseg.length ? aT : '')
      : ax === 'c' ? (cseg.length ? cT : '') : ax === 'n' ? (nseg.length ? nT : '') : gT + aT;   // ax 분리 호출(운영자 260721 재배치 · 무인자 = 성별+연령 양쪽 = fb 분기 무접촉)
  };
  // ── 최상위 단위 = 메뉴3(SNS) tgroup 원문 계승(운영자 260713 "AI 요약 디자인 계승해 메뉴4 재구성 · 내용은 그대로") : 접이 글래스 카드 + 글래스 필 헤더(순번 원형 배지·라임 체브론 촤르륵) · 접힘 기억 = nm_chan_gfold(nm_trend_gfold 미러) · 구 ch-card 3장+맨몸 섹션 → 단위 승격(구 소머리 .ch-lbl = 단위 헤더로 · 타일·차트·행 내용 = 종전 그대로) ──
  const RLAB = { prof: '프로필', daily: '일일 추이', cond: '잘 되는 조건', topic: '주제별 반응', sig: '시간대별 반응', tpost: 'TOP 게시물', recent: '최근 게시물' };   // 책갈피 레일 aria 라벨(운영자 260713 "레일 여기도 · 일치할수록 좋아") · 릴스·피드/알고리즘 3기 유닛 = 폐지 · 호응 신호 → 시간대별 반응(운영자 260719)
  const RAIL = [];   // 렌더된 단위 수집(순번 = 헤더 배지와 자동 동기 · 데이터 결측 유닛 = 레일서도 자동 제외) → 좌측 책갈피 레일
  const GPIC = { brief: AISPARK_SVG };   // AI 요약 = ✨ 스파크(운영자 260723 Q478 복귀 · 메뉴4 채널도 메뉴3과 동일 ✨ — 같은 작업 다른 메뉴 · 순번 밖·레일 제외)
  let gno = 0, gfirst = true;
  const gsec = (id, ttl, body, extra, hstale) => { const first = gfirst; gfirst = false; if (!GPIC[id]) RAIL.push({ id, n: ++gno, lab: RLAB[id] || id }); const op = !CHAN_FOLD.has(id); const core = `<details class="tgroup${first ? ' dash' : ''}" data-g="${id}" id="cg-${id}"${op ? ' open' : ''}><summary class="tgroup-h${hstale ? ' hdr-stale' : ''}"><i${GPIC[id] ? ' class="gpic" aria-hidden="true"' : ''}>${GPIC[id] || gno}</i>${ttl}</summary>${extra ? `<div class="chseg-row">${extra}</div>` : ''}${body}</details>`; return extra ? `<div class="chu">${core}</div>` : core; };   // hstale = 픽토 라이트 멎음(수집 죽음 · 메뉴3 .hdr-stale CSS 공유 = 추가 0 · 운영자 260714 빛멎음)   // extra = 헤더 우측 심층 필(summary 밖 형제 = 인터랙티브 중첩 해소 · 평의회7-①) — 시각 위치는 .chu absolute가 담당
  let h = '';
  let chanStale = false;   // insta 수집(하루 1회 · generated_kst ISO+09:00) 26h+ 밀림 = 하루치 통째 거름 → AI 요약 빛 멎음(정상이면 계속 돎 = 운영자 260714 "자주 돌수록 좋지") · 메뉴3 트렌드 65분과 다른 기준 = 수집 주기 차이(트렌드 30분×N vs insta 1일)
  if (d.generated_kst) { const _ah = (Date.now() - new Date(d.generated_kst).getTime()) / 3600000; chanStale = _ah > 26; }
  // 채널 브리프(성장 서사+현황+전략 · 운영자 260714 "이래야겠네 전략이 뿅뿅") — 셸·라벨·항상 전문 펼침 = 메뉴3 AI 요약 원문 계승 · 접기 = tgroup 체브론
  // + 기간 구분 탭(운영자 260714 "7일·14일·28일·3개월·전체 총론 구분해서 요약") — sections 있으면 칩 세그(.ch-mchip 정본 계승·data-bs 축) · 구 단일 text JSON = 칩 없이 종전 렌더(하위호환 fail-soft)
  const bsecs = (CB && Array.isArray(CB.sections) && CB.sections.length >= 2) ? CB.sections : null;
  const bov = bsecs ? bsecs.find(s => s.k === 'overview') : null;   // 총론(비전·방향성·미션 큰 그림 · 운영자 260714) = (3) 고정 판 · 세그에선 제외 · 없으면(구 데이터) all 폴백
  const bsegs = bsecs ? bsecs.filter(s => s.k !== 'overview') : null;   // 세그 = 기간 5창(3일~전체 · overview 제외)
  if (bsegs && !bsegs.some(s => s.k === CHAN_BSEC)) CHAN_BSEC = bsegs[0].k;   // 결측·overview 방어(생성분 일부만 와도 첫 탭으로 · CHAN_BSEC이 세그 밖 값 차단)
  const bhasAll = bsegs && bsegs.some(s => s.k === 'all');   // (3) 폴백(overview 부재 시 all) 노출 근거
  // (분석시각 btm 폐지 260720 — 운영자 "일시 삭제" · 대분류 헤더 자리를 기간 탭에 양보 · 수집 죽음 신호는 픽토 빛멎음 hdr-stale로 유지)
  const _g12 = fmtK12(d.generated_kst);
  const _ctm = _g12 ? `<span class="tdash-time${chanStale ? ' stale' : ''}">${esc(_g12)}</span>` : '';   // 수집 시각 필 = 데이터 단위 헤더 우측 공통(운영자 260720 "받아온 시간 대분류 우측에 · sns 메뉴 표기 계승") — btm(AI 요약)·prof·메뉴3 top .tdash-time 정본 그대로 · 소스 = d.generated_kst(insta 산출 · prof와 동일) · stale = 26h+ 밀림 warn · 무효 = '' fail-soft
  const BSEG_LAB = { d28: '30일', m3: '90일' };   // 기간 탭 용어 통일(운영자 260720 "맨 위 AI만 다른 곳에 맞춰") — AI 요약 탭을 나머지 IG 지표 세그(7일/30일/90일/전체) 어휘와 일치 · 표시 라벨만 우회([15] 뷰어 코드), data-bs 키(d28/m3)·분석 창·본문 프로즈는 불변 · 3일·7일·전체는 원본 유지
  const bseg = bsegs ? `<span class="ch-rangeseg tb-seg">${bsegs.map(s => `<button type="button" data-bs="${esc(s.k)}"${s.k === CHAN_BSEC ? ' class="on"' : ''}>${esc(BSEG_LAB[s.k] || (s.label === '전체 총론' ? '전체' : s.label))}</button>`).join('')}</span>` : null;   // 기간 책갈피(3일~전체) = 헤더 우측 extra(운영자 260716 "옵션 선택지를 세부 NAV(우측 상단)에") — .chu 심층 필 앵커 계승(summary 밖 = 접기 오클릭 0 · 접힘에도 노출) · 세그 = .ch-rangeseg 정본
  if (CHAN_BRIEF_ON && CB && (CB.text || bsecs)) h += gsec('brief', `AI 요약`, `<div class="tbrief">` +   // AI 요약 = 활성 소스 브리프(운영자 260724 — IG chan_brief · FB chan_brief_fb 동일 조건 · CB 소스분기 · 결측 소스 = 미표시 조용한 공백)
    // 구 ① 분석시각+세그 행(.tb-segrow) 폐지(운영자 260716 "가장 위로 + 옵션 선택지는 세부 NAV로") — 시각 = 헤더 좌(타이틀 옆) · 기간 세그 = 헤더 우측 칩(extra) · 본문 = 분석 텍스트부터 즉시 시작(상단 구분선도 동반 제거)
    `<p class="tbrief-t"></p><div class="tbrief-prop" hidden><span class="tbrief-lbl">클로신의 제안</span><ul></ul></div>` +
    `</div>` +
    // ⑤ (3) 총론 = 항상 고정 노출(운영자 260714 "채널 전체 아우르는 비전·방향성·미션 큰 그림 · 마인드셋 · 기간 무관") — 총론(overview)은 세그 '전체'(기간 분석)와 별개 글이라 어느 탭에서도 안 숨김 · 구 데이터(overview 부재) = all 폴백 + '전체' 선택 시 중복 숨김(하위호환)
    // ⑥ 판 분리(운영자 260729 "기간 요약과 총론은 엄연히 두 div → 도형을 둘로") — 구 = 한 .tbrief 안에서 .tb-div 헤어라인으로만 구획 → 신 = 총론이 자기 .tbrief 판을 가짐(셸·톤·패딩·라운드 = 위 판 100% 계승 · 판 간격 = .tbrief margin-bottom 14 그대로) · 클래스·id·JS 훅(.tb-allwrap/.tb-allt/hidden 토글) 전부 불변
    (bov ? `<div class="tbrief tb-allwrap"><span class="tbrief-lbl">총론</span><p class="tbrief-t tb-allt"></p></div>`
         : (bhasAll ? `<div class="tbrief tb-allwrap"${CHAN_BSEC === 'all' ? ' hidden' : ''}><span class="tbrief-lbl">전체 총론</span><p class="tbrief-t tb-allt"></p></div>` : '')),
    // ⑦ 판단 이력 판 = 화면에서 걷음(운영자 260809 "내가 볼 필요는 없음 · 프로그램이 체킹하면 됨") — 라이브러리는 프롬프트 축으로 계속 산다.
    bseg, chanStale);   // bseg = 헤더 우측 기간 칩(extra · 운영자 260716) · chanStale = insta 수집 26h+ 죽음 → 스파크 빛 멎음(메뉴3 대칭)
  const pfSeg = `<span class="ch-rangeseg ch-hdrseg pf-seg">` + [['7', '7일'], ['30', '30일'], ['90', '90일'], ['all', '전체']].map(r => `<button type="button" data-pr="${r[0]}"${CHAN_PROF_R === r[0] ? ' class="on"' : ''}>${r[1]}</button>`).join('') + '</span>';   // 프로필 공통 기간 세그(운영자 260720 Q290 · 일일추이 .ch-rangeseg.ch-hdrseg 디자인 계승 · data-pr 별축 · CHAN_PROF_R 연동) — 헤더 우측 extra
  h += gsec('prof', `<b class="ch-nm"></b>`, '<div class="ch-stats">' +   // 헤더 수집시각 제거(운영자 260720 Q290 "1번 대분류에도 시각 없애 · 최상단 헤더에 1회로 갈음") — 시각 = #vhTime(좌상단 라임)로 이관
    // 배치(운영자 260721 재편) = 4열 2행: [팔로워↕2][조회수↕2][도달][성별] / [게시][연령] — 상호작용·프로필 방문 삭제 · 팔로워·조회수 = 아래 빈 칸 합침(세로 2칸) + 도형 안 미니 차트(chTileChart · 토글 창 연동)
    (d.src === 'threads'
      // 스레드 6칸(운영자 261022 「응 일단 넣어줘」) = 인스타 배치 그대로 [팔로워↕2][조회수↕2][좋아요][답글] / [리포스트][인용] — 도달·성별·게시 자리 = API 에 없는 축이라 반응 4칸으로 · 부품 = stTall·avgTile·chTileChart 원본 재사용(분기 = 라벨·키만)
      //   팔로워 미니 차트 = 그날 값 차분(follower_net) — 하루 한 칸씩 쌓여 2일째부터 그려짐(1점 = 조용한 공백 · chTileChart 계약)
      ? stTall('팔로워', flwVal(), flwSub(), chTileChart(series, 'follower_net', 'zero', '명')) +
        avgTile('조회수', 'views', vu(a.views, '회'), stTall, chTileChart(series, 'views', 'avg', '회')) +
        avgTile('좋아요', 'likes', vu(a.likes, '회')) + avgTile('답글', 'replies', vu(a.replies, '회')) +
        avgTile('리포스트', 'reposts', vu(a.reposts, '회')) + avgTile('인용', 'quotes', vu(a.quotes, '회'))
      : d.src === 'facebook'
      // fb 6칸(운영자 260719 "인스타 페이지에서 보여준 그대로 · 죽은 지표만 제일 유의미한 걸로 대체") — 메타 페이지 인사이트 폐지로 조회·도달·팔로우증감·방문 = 수집 불가 실측 → 생존 축 대체: 반응·댓글·공유(최근 10게시물 합 · fb_totals) + 상호작용(일별 시리즈 = 스파크·평균) · 골격·컴포넌트 = 인스타 st() 그대로(분기 = 라벨·키만)
      ? st('팔로워', flwVal(), flwSub()) +
        st('반응 (최근 10게시물)', (d.fb_totals && d.fb_totals.reactions != null) ? vf(d.fb_totals.reactions) + ' 회' : '—') +
        st('댓글 (최근 10게시물)', (d.fb_totals && d.fb_totals.comments != null) ? vf(d.fb_totals.comments) + ' 회' : '—') +
        st('공유 (최근 10게시물)', (d.fb_totals && d.fb_totals.shares != null) ? vf(d.fb_totals.shares) + ' 회' : '—') +
        postsTile() +
        avgTile('상호작용', 'interactions', vu(a.interactions, '회')) + demoTile()
      : (() => { const _dg = demoTile('g'), _da = demoTile('a'), _tall = !!(_dg || _da);   // 인구통계 결측 = 6타일→4타일 · tall 해제(2행 우측 구멍 방어 · 평의회2/5 — 라이브 = 데이터 상존이라 통상 미발동 fail-soft)
        const _fT = _tall ? stTall : st, _fC = k2 => _tall ? chTileChart(series, k2 === 'f' ? 'follower_net' : 'views', k2 === 'f' ? 'zero' : 'avg', k2 === 'f' ? '명' : '회') : '';
        return _fT('팔로워', flwVal(), flwSub(), _fC('f')) +   // 팔로워 차트 = 일일 순증감(총수 차이 = 언팔 반영 · 0 기준선 아래 = 감소일 danger · 운영자 260722 · 구 follows[신규유입 항상≥0] 대체 — IG follows_and_unfollows 빈반환이라 총수 diff만이 감소원)
        avgTile('조회수', 'views', vu(a.views, '회'), _fT, _fC('v')) +   // 주값 = 창 일평균(운영자 260729 · 구 창 합계 대체 — 차트 평균 기준선과 같은 수치 = 도형·숫자 정합) · 차트 = 창 평균 기준선 대비 오르내림(운영자 260721 11) · 하단 행 = 'N일 대비 ±X만/일' 일평균 증감(운영자 260722 "조회수 7일 대비 +-00만/일")
        avgTile('도달', 'reach', vu(a.reach, '계정')) + _dg +
        postsTile() + _da + demoTile('c') + demoTile('n'); })()) + '</div>', pfSeg);   // 3행 = 도시·국가(가로 2칸씩 = 행 꽉 참 · 데이터 부재 = 행 자체 미생성 조용한 공백 · 운영자 260726)   // 공통 기간 세그(pfSeg) = 헤더 우측 extra · fb = 종전 6칸+성별·연령(무접촉)
  // ── 일일 추이 단위(지표 칩 + 기간 세그 + SVG 차트 + 변곡 마커) — 전체(일별 상세) 필 = 단위 헤더 우측 ──
  if (series.length >= 2) {
    const events = (d.daily_meta || {}).events || [];
    const lastV = (() => { for (let i = series.length - 1; i >= 0; i--) if (series[i][CHAN_MET] != null) return series[i][CHAN_MET]; return null; })();
    h += gsec('daily', `일일 추이`, '<div class="ch-seg">' +
      '<div class="geni-railwrap"><span class="geni-opts geni-rail" id="chMetRail">' +   // 지표 선택 = 화풍 레일 계승(운영자 260715 "동그란 칩 → +동영상 화풍처럼") · | 구분·활성 강조색·‹›/드래그·끝선 페이드
      Object.keys(MET).map((k, i) => `<span class="geni-subit">${i ? '<span class="geni-sep" aria-hidden="true">|</span>' : ''}<button class="geni-opt${k === CHAN_MET ? ' on' : ''}" type="button" data-m="${k}">${MET[k][0]}</button></span>`).join('') +
      '</span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div>' +
      '</div>' +
      `<div class="ch-charttop"><span class="ct-v">${lastV != null ? lastV.toLocaleString() : '—'}</span><span class="ct-u">${MET[CHAN_MET][1]} · 최근일</span></div>` +
      `<div class="ch-chartwrap" id="chChartWrap">${chChart(series, CHAN_MET, events)}<div class="ch-tip" id="chTip"></div><div class="ch-dot" id="chDot"></div><div class="ch-postpop" id="chPostPop"></div></div>` +
      '<button class="ch-morelink ch-hdrmore" type="button" id="chDayMore" aria-label="일별 상세">내역<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 5l11 7-11 7z"/></svg></button>',
      `<span class="ch-rangeseg ch-hdrseg">` + [['7', '7일'], ['30', '30일'], ['90', '90일'], ['all', '전체']].map(r => `<button type="button" data-r="${r[0]}"${CHAN_RANGE === r[0] ? ' class="on"' : ''}>${r[1]}</button>`).join('') + '</span>');   // 기간 세그 = 헤더 우측 이관(운영자 260719) · 지표 레일은 본문 유지 · 내역 = tpost chPostMore 그대로 계승(운영자 260723 "타이틀 옆으로 · TOP게시물 코드 그대로") — .ch-hdrmore 오버레이(--tpm-l = 타이틀 잉크 우변+16 · top35·translateY-50% = 4분할 중심 세로정렬) + ▶ SVG(문자 금지 [3-1]) · id·핸들러·aria 불변
  }
  COND_CARDS = CHAN_SRC === 'ig' ? condCards(d) : [];   // 잘 되는 조건(운영자 261024 · 위 condCards) — IG 원장 지표라 FB·스레드 = 없음
  if (COND_CARDS.length) h += gsec('cond', `잘 되는 조건`, '<div class="cond-grid">' + COND_CARDS.map((c, i) => `<div class="cond-card" data-ci="${i}"><div class="cond-h"><span class="cond-t">${esc(c.t)}</span><span class="sig-lgd"><i class="lg-ring">${esc(c.a)}</i><i class="lg-sh">${esc(c.b)}</i>${c.bead ? `<i class="lg-bead">구슬 = ${c.bead}${esc(c.unit)}</i>` : ''}</span></div><div class="cond-viz"></div><div class="cond-c">${esc(c.foot)}</div></div>`).join('') + '</div>');
  // ── 반응 분석 단위(주제별 게이지 — 신호 모듈 절대 요약 소비) · 릴스·피드/알고리즘 3기 유닛 = 표시 폐지(운영자 260719 "호응 신호 말고 다른거 날려" — 산출 데이터 fmt·eras는 보존 = 🔒 [15] 뷰어 코드 우회 원칙) ──
  const sigD = d.signals || {}, rw = sigD.win_90d || {};
  const rrOk = !!(d.topics_90d && sigD.axes_90d && rw.n);   // 창 산출분(insta_signals 261025) 도착 전·FB·스레드 = 세그 없이 전 기간(종전 그대로)
  const rr90 = rrOk && CHAN_RR === '90';
  const rrSeg = rrOk ? `<span class="ch-rangeseg ch-hdrseg rr-seg">` + [['90', '90일', `최근 90일 = ${fmtK12(rw.from + 'T12:00').split(' ')[0]}~${fmtK12(rw.to + 'T12:00').split(' ')[0]} 게시물 ${rw.n}개 — 이 창 안에서 비교`], ['all', '전체', '전 기간(표본 ' + (sigD.n_posts || '—') + '개)']].map(r => `<button type="button" data-rr="${r[0]}" title="${esc(r[2])}"${CHAN_RR === r[0] ? ' class="on"' : ''}>${r[1]}</button>`).join('') + '</span>' : '';   // 반응 기간 세그(운영자 261025) = pf-seg 문법 그대로 · 창 범위·표본 수 = 칩 title(새 표시 요소 0)
  const topics = (rr90 ? d.topics_90d : d.topics) || {};
  // 「기타」 = 주제가 아니라 미분류(캡션 없는 글이 대부분 · 261025 실측 최근 90일 8개 중 6개 무캡션) → 순위에서 뺀다(FB 축 fb_classify 「기타 = 뷰어 표시 제외」와 같은 규칙)
  // 표본부족(n<5 = insta_signals MIN_N) = 조용히 숨기지 않고 맨 뒤에 「표본부족」 딱지로(시간대별 툴팁 딱지와 같은 말) · 평균·상위 2 강조·막대 자 = 믿을 칸만
  const tok = k => topics[k].n >= 5;
  const tkeys = Object.keys(topics).filter(k => k !== '기타' && topics[k].n > 0).sort((x, y) => (tok(y) - tok(x)) || topics[y].views_med - topics[x].views_med);
  const tsure = tkeys.filter(tok);
  if (tsure.length) {
    const tmax = topics[tsure[0]].views_med || 1;
    const tavg = tsure.reduce((s, k) => s + (topics[k].views_med || 0), 0) / tsure.length;   // 주제 평균치(운영자 260722 "각 차트의 평균치 대비 ±%")
    h += gsec('topic', `주제별 반응`, '<div class="ch-tgrid">' + tkeys.map((k, ti) => {
      const v = topics[k], ok = tok(k);
      const devStr = !ok ? '표본부족' : tavg ? '×' + (v.views_med / tavg).toFixed(1) : '—';   // 평균 대비 ×배수(운영자 260722 "±% 말고 1.9배식으로" — TOP 게시물 dev 정본 문법 '×'+toFixed(1) 계승 · 구 ±% 표기 대체)
      return `<div class="ch-trow${ok && ti < 2 ? ' top2' : ''}"><span class="tl">${esc(k)}</span><span class="ch-bar"><i style="width:${Math.max(4, Math.min(100, Math.round(v.views_med / tmax * 100)))}%"></i></span><span class="tv">${vf(v.views_med).replace(/^(.+?)([만억])$/, '<i>$1</i>$2')} <b class="tdev">(${devStr})</b></span></div>`;
    }).join('') + '</div>', rrSeg);   // ch-tgrid 표문법 래퍼(운영자 260722 — 수치 열 전 행 통일·우측정렬 = 트랙 길이도 자동 통일) · 'n=' 병기 삭제(운영자 "n 이거는 그냥 없애고") · 수치 색·타이포 = .tv 정본 · 단위(만/억) = <i> 분리(운영자 260722 "만 분리·정렬" ★프리셋 채택 = 수치↔만 간격 열)
  }
  // 시간대별 반응(구 호응 신호 · 운영자 260719 "시간대별 반응으로 변경 + 시간대·요일 호응정도 = 일일추이처럼 차트로 고도화" + "ㄱ 고도화 뭐든") — 축 = 시간대·요일 2종(구 포맷·네이밍 lift 행 = 동반 폐지) · 차트 = chLiftChart(일일 추이 시각 문법 계승 프로필 곡선) + 오버레이{접속 피크 밴드·볼륨 바·지금/오늘 마커}
  const axes = (rr90 ? sigD.axes_90d : sigD.axes) || {};   // 반응 기간 세그(위 rrSeg · 운영자 261025) — 90일 = 창 안 중앙값 기준 lift(insta_signals axes_90d)
  const nowK3 = new Date(Date.now() + (540 + new Date().getTimezoneOffset()) * 60000);   // KST 벽시계(기기 TZ 무관 · [12] · 예약 필 idiom 계승)
  const sigPk = (d.online_peak_kst || []).map(p => parseInt(p, 10)).filter(n2 => Number.isInteger(n2) && n2 >= 0 && n2 <= 23);   // "21시(KST)" → 21 · 결측 = 밴드 자동 생략(창작 0)
  // 실측 수신 상태(운영자 260805 "항시 받아온다는 느낌 · 동그라미 디밍 + mut 설명") — days = online_src 'api-ledger(N일)' 파싱 · stall = 마지막 적재일(online_led_last · insta_signals 동봉) 대비 KST 경과일(필드 미도착 구본 데이터 = null = 수집 중 문구만 = fail-soft) · 실측 채택(GEN_MEAS) 차트에만 노출
  const _ledSt = d.online_src ? { days: +((String(d.online_src).match(/(\d+)일/) || [])[1] || 0) || null, last: d.online_led_last || null, stall: d.online_led_last ? Math.max(0, Math.round((nowK3 - new Date(d.online_led_last + 'T00:00:00Z')) / 864e5)) : null } : null;
  const sg = chLiftChart(axes.hour_band, 'hour_band', { peaks: sigPk, now: nowK3.getHours() + nowK3.getMinutes() / 60, curve: d.online_curve_kst || null, led: _ledSt }) +   // curve = 팔로워 접속 실측(insta_signals online_curve_kst · 260803) — 부재 = 벤치 폴백(fail-soft)
    chLiftChart(axes.dow, 'dow', { today: ['일', '월', '화', '수', '목', '금', '토'][nowK3.getDay()], curve: d.online_dow_kst || null, led: _ledSt });   // curve = 요일별 팔로워 접속 실측(insta_signals online_dow_kst · 260804) — 원장 7요일×24시 커버 전 = 필드 부재 = 벤치 폴백(fail-soft)
  if (sg) h += gsec('sig', `시간대별 반응`, sg, rrSeg);   // 편향 각주(.sig-note) = 운영자 260722 제거 · rrSeg = 주제별 반응과 같은 기간 값(261025)
  // TOP 게시물(운영자 260719 재설계 · 병합 = main 시간대별 반응 + 내 새 행 결합) — 순위·포스트/릴스·제목·조회수·포맷별 편차. 정렬 = ×배수 내림차순(운영자 260723 "xn.m 순서로 배치 — 기준선이 릴스냐 포스터냐, 공평하게 x로 순위" · 구 순수 조회수순 대체 · 동률 = 조회수) · 포맷색 = thumb.html .ovfmt 계승(릴스 레몬/포스트 시안) · 제목 이모지 제거는 아래 .ch-pt 채움에서(기존 관용구)
  // 편차 기준 = 포맷별 중앙값(운영자 260720 "포스트는 포스트 기준 · 릴스는 릴스끼리") — 고조회 릴스·저조회 포스트를 한 평균(posts_view_avg)에 섞으면 포스트가 늘 ×0.x로 눌려 왜곡 → 릴스는 릴스끼리·포스트는 포스트끼리 그 포맷 중앙값 대비 ×배수(같은 종류끼리 성과 비교). 중앙값 = 앱 공통 "×1.0 = 채널 중앙값 기준선"(sig ×배율·차트 bY·모달 views_med) 관례 계승 + 릴스 mega-hit 꼬리에 강건(평균은 꼬리 오염 · 강건성 철학 §OUT) · 표본 = 표시 창(_pf 아래) · 포맷 표본 0 = 혼합평균(_avgV) 폴백
  const _pAll = (d.posts || []).filter(x => !q || String(x.name || '').toLowerCase().includes(q));
  const _mv = x => x.views != null ? x.views : (x.eng != null ? x.eng : null);   // TOP게시물 표시 지표 = views(IG) 우선·부재 시 eng(FB 반응 = 게시물별 조회 대체 · 평의회 260724 승인 — 구 x.views 하드코딩이 FB 전 행 '—'이던 것 점등 · IG는 views 그대로 = 무회귀)
  const _avgV = d.posts_view_avg || (_pAll.length ? _pAll.reduce((s, x) => s + (_mv(x) || 0), 0) / _pAll.length : 0);   // 혼합평균 = 포맷 표본 0일 때만 쓰는 폴백
  // 기간 필터(운영자 260719 "일일 추이처럼 일자별 · 기본 7일") — 최신 게시일 앵커 기준 직전 N일 창(일일추이 종료앵커 관례 계승 · 앵커 게시물은 어느 창에도 포함이라 공란 없음) · 전체 = 무필터
  const _tpAnc = _pAll.reduce((m, x) => { const i = String(x.iso || '').slice(0, 10); return i > m ? i : m; }, '');   // 앵커 = 날짜부 10자리만(운영자 260722 fb 공백 교정 — fb iso = 풀 타임스탬프 "…T02:07:49+0000"이라 구현부 `new Date(anc+'T00:00:00Z')` = Invalid Date → toISOString 예외로 renderChan 전체 사망 = fb 전환 공백의 원인 · IG 날짜만 iso = slice 무해)
  const _tpCut = (() => { if (CHAN_TPR === 'all' || !_tpAnc) return ''; const dt = new Date(_tpAnc + 'T00:00:00Z'); dt.setUTCDate(dt.getUTCDate() - (parseInt(CHAN_TPR, 10) - 1)); return dt.toISOString().slice(0, 10); })();
  const _pf = CHAN_TPR === 'all' ? _pAll : _pAll.filter(x => String(x.iso || '') >= _tpCut);
  const _fmtMed = f => { const v = _pf.filter(x => (x.format === '릴스') === f).map(x => _mv(x) || 0).sort((m, n) => m - n); if (!v.length) return 0; const h = v.length >> 1; return v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2; };   // 포맷별 중앙값(표시 창 _pf 안 · 릴스끼리·포스트끼리) — 정렬키(×배수)보다 먼저 산출(구 조회수 정렬 뒤 → 260723 앞으로 이동) · _mv = views/eng(FB) 소스분기
  const _medReels = _fmtMed(true), _medPost = _fmtMed(false);   // ×1.0 = 그 포맷 중앙값(전형) 기준선
  const _devR = x => { const b = ((x.format === '릴스') ? _medReels : _medPost) || _avgV; return b > 0 && _mv(x) ? _mv(x) / b : 0; };   // 포맷별 ×배수(릴스↔릴스·포스트↔포스트 중앙값 대비 · 표본0 = 혼합평균 _avgV 폴백 · 결측 = 0) — 정렬키 겸 편차 표시 공용(DRY) · _mv = views/eng(FB) 소스분기
  const posts = _pf.slice().sort((a, b) => _devR(b) - _devR(a) || (_mv(b) || 0) - (_mv(a) || 0)).slice(0, 5);   // 순위 = ×배수 내림차순(운영자 260723 "x로 공평하게 순위") · 동률 = 지표 내림차순(안정 타이브레이크) · 구 순수 조회수순 대체
  const chVwR = n => n == null ? '—' : n >= 1e8 ? (n / 1e8).toFixed(1).replace(/\.0$/, '') + '억' : n >= 1e4 ? Math.round(n / 1e4) + '만' : String(Math.round(n || 0));   // 조회수 = 반올림 정수 만(운영자 260719 "소수 빼고 6만회 식") · null = '—'(운영자 260722 ㄱ — fb views 미수집이 0으로 위장되던 것 결측 표기로 · chVf 정본 문법 계승)
  const tpSeg = `<span class="ch-rangeseg ch-hdrseg tp-seg tb-seg">` + [['7', '7일'], ['30', '30일'], ['90', '90일'], ['all', '전체']].map(r => `<button type="button" data-tpr="${r[0]}"${CHAN_TPR === r[0] ? ' class="on"' : ''}>${r[1]}</button>`).join('') + '</span>';   // TOP 게시물 기간 세그 = 헤더 우측(운영자 260719 "토글 항목 옆에·90일 포함") · data-tpr = CHAN_TPR 축(daily data-r과 분리) · 켜진 것 강조색 · tb-seg = 협폭 칩 창 가로 스크롤(top 플랫폼 칩 문법 계승 — 260722 내역 링크 헤더 이관분 예약 확대를 스크롤이 흡수)
  if (posts.length) h += gsec('tpost', `TOP 게시물`, posts.map((x, i) => {
    const rl = x.format === '릴스';
    const _r = _devR(x);   // ×배수 = 정렬키와 동일 함수(DRY · 0 = 결측)
    const dev = _r ? '×' + _r.toFixed(1) : '—';   // 편차 = ×배수만(운영자 260719 "평균 빼고") · 기준 = 같은 포맷끼리(운영자 260720) · 0 = '—'
    return `<a class="ch-post" href="${escUrl(x.permalink || '#')}" target="_blank" rel="noopener"><span class="trend-rank">${i + 1}</span><span class="ch-fmt ${rl ? 'reels' : 'post'}">${rl ? '릴스' : '포스트'}</span><span class="ch-pt"></span><span class="ch-dev ${rl ? 'reels' : 'post'}">${dev}</span><span class="ch-vw">${chVwR(_mv(x))}</span></a>`;   // 열 순서 = ×편차 먼저·조회수 나중(운영자 260723 "x11이 먼저" — 구 vw먼저·dev나중 반전 · 각 열 정렬 기준선 유지·서로 교환: ×편차=좌측 ×열·조회수=우측 만열[토글선]) · ×편차 = 전 행 포맷색(릴스 레몬·포스트 시안 · 운영자 260722) · chVwR(_mv) = FB는 eng(반응) 수 표시(평의회 260724 · 구 x.views '—' 대체)
  }).join('') + '<button class="ch-morelink ch-hdrmore" type="button" id="chPostMore" aria-label="게시물 탐색">내역<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 5l11 7-11 7z"/></svg></button>',
    tpSeg);   // 내역 ▶ = 헤더 타이틀 옆 이관(운영자 260722 "내역 ▶로 용어 변경해 타이틀 옆으로" — 구 '내역 확인 ›' 본문 하단 폐지) · ▶ = SVG 삼각(FIN_ARROW 문법 회전 · 문자 ▶ 금지 [3-1]) · id·핸들러·aria 불변 · 배치 = .ch-hdrmore 오버레이(daily #chDayMore 하단 잔류 = 무접촉)
  const th = (d.thumbs || []).slice(0, 12);   // 커버 없는 릴스도 보존(th='' → 캡션 텍스트 타일 · 운영자 260718)
  const _embDead = new Set(th.filter(x => x.e === 0).map(x => (String(x.u || '').match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/) || [])[1]).filter(Boolean));   // 임베드 사망 숏코드 판(수집기 프로브 도장 e:0 재사용 · 운영자 260810 "이렇게 에러가 될 경우는 아예 링크를 하지마") — 타일과 같은 게시물을 브리프 골드 참조가 걸 때 링크를 떼는 조인 키
  const _lnAttr = x => x.e === 0 ? '' : ` href="${escUrl(x.u || '#')}" target="_blank" rel="noopener"`;   // 사망 도장 타일 = href 자체를 안 단다 — 인앱 팝업 위임(인스타 URL 검사)·새탭 어느 쪽도 안 걸린다 · 무도장 = 종전 링크(fail-open · 260810 실측 = 임베드 사망 게시물은 팝업이 인스타 「Instagram 방문」 에러 카드만 그린다)
  const REELGLYPH = CH_REELGLYPH;   // 릴스 표식 ▶ — 커버 릴스·텍스트 타일 공용(운영자 260718 통일)
  const POSTGLYPH = '<svg class="rl" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.42)"/><rect x="9.2" y="6.6" width="8.2" height="8.2" rx="1.8" fill="rgba(255,255,255,.55)"/><rect x="6.6" y="9.2" width="8.2" height="8.2" rx="1.8" fill="rgba(255,255,255,.96)"/></svg>';   // 포스트 표식 = 카드 스택(운영자 260722 "릴스 재생버튼처럼 포스트도 카드스택으로 동일하게") — 원판·크기·좌상단 앵커(.rl)·fill 문법 = REELGLYPH 100% 계승 · 뒤장 .55/앞장 .96 = 겹침 위계
  // 호버 지표 오버레이 재료(운영자 260805 "오 그렇게해줘") — 커버 타일 ↔ posts 조인 키 = permalink 한 개(수집기 무접촉 = 다음 수집 회차 기다림 0 · 미매칭·결측 = 칩 생략 fail-soft)
  const _thP = new Map((d.posts || []).filter(p => p.permalink).map(p => [String(p.permalink), p]));
  const _thAgeH = p => {   // 경과 h — iso(날짜부) + date_kst 시각으로 KST 벽시계 앵커([12] · 기기 TZ 무관) · FB iso = 풀 타임스탬프라 그대로 파싱
    const s = String(p.iso || ''); if (!s) return NaN;
    const hh = (String(p.date_kst || '').match(/(\d{1,2})\s*시/) || [])[1];   // "08/05 14시" = 시각 정밀도(날짜부만 쓰면 자정 앵커라 최대 24h 과대표기)
    const t = new Date(/T/.test(s) ? s : s.slice(0, 10) + 'T' + String(hh == null ? 12 : hh).padStart(2, '0') + ':00:00+09:00').getTime();   // 시각 결측 = 정오 앵커(오차 ±12h 대칭 = 한쪽으로 안 쏠린다)
    return isFinite(t) ? (Date.now() - t) / 3600e3 : NaN;
  };
  const thMeta = x => {   // ×배수(_devR 정본 재사용) + 조회수(EYE_SVG+vfmt 지표 정본 짝) + 경과(relAge 공통 사다리 · 24h 이내 = fresh 골드)
    const p = _thP.get(String(x.u || '')); if (!p) return '';
    const _r = _devR(p);   // 같은 포맷 중앙값 대비 ×배수 = TOP 게시물과 **동일 함수·동일 기준선**(대조 가능 · 0 = 결측)
    const dv = _r ? `<span class="dev ${p.format === '릴스' ? 'reels' : 'post'}">×${_r.toFixed(1)}</span>` : '';   // 순서 = ×배수 먼저(운영자 260723 "x11이 먼저" 열 순서 계승) · 색 = 포맷색(.ch-dev.reels/.post 토큰 동일)
    const v = p.views > 0 ? `<i>${EYE_SVG}<span>${vfmt(p.views)}</span></i>` : '';   // 0·결측 = 미표기(met() 0지표 규약 계승)
    const ah = _thAgeH(p), ag = relAge(ah);
    const a = ag ? `<span class="${isFinite(ah) && ah < 24 ? 'fresh' : ''}">${ag}</span>` : '';   // 시간 = 항상 끝(.tcard-ago ml:auto 관례)
    return (dv || v || a) ? `<span class="ch-thm">${dv}${v}${a}</span>` : '';
  };
  if (th.length) h += gsec('recent', `최근 게시물`, '<div class="ch-grid">' + th.map(x => x.th
    ? `<a class="ch-th"${_lnAttr(x)} data-cap="${esc(x.t || '')}">${x.r ? REELGLYPH : POSTGLYPH}<img loading="lazy" referrerpolicy="no-referrer" src="${escUrl(x.th)}" onerror="chThFail(this)" alt="">${thMeta(x)}</a>`
    : `<a class="ch-th txt"${_lnAttr(x)}>${x.r ? REELGLYPH : POSTGLYPH}<span class="cap">${esc(x.t || '')}</span></a>`).join('') + '</div>');   // 포스트 = 스택 배지(구 무표식 → 명시 표식 · 텍스트 타일도 동일 분기)
  // 세로 책갈피 레일 = 메뉴3 .trailwrap/.trail 원문 계승(운영자 260713 "일치할수록 좋아" — CSS 클래스 공유 = 신규 스타일 0 · fixed는 chanview[hidden] 조상 연동 자동 소거 = trendview 동일 메커니즘 · 우측 배치 = #chanRailWrap → #trendRailWrap 동일 공식 합류 = 운영자 260720 "SNS 메뉴처럼 우측") · 버튼 = TOP 위화살(정본 SVG path 동일) + 단위 순번 숫자(헤더 배지 정체성 · 숫자 = 문자 렌더 허용 축)
  box.innerHTML = (RAIL.length > 1 ? '<div class="trailwrap" id="chanRailWrap"><nav class="trail" id="chanRail" aria-label="단위 바로가기"><button type="button" class="trail-i" data-tg="top" aria-label="맨 위"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg></button>' +
    RAIL.map(r => `<button type="button" class="trail-i" data-tg="${r.id}" aria-label="${r.lab}">${r.n}</button>`).join('') + '</nav></div>' : '') + h;   // 소스 세그 = 헤더 이주(Q157)로 콘텐츠부 주입 폐지
  box.querySelector('.ch-nm').textContent = p.username ? '@' + p.username : (p.name || '');   // fb 페이지 = username 없을 수 있음 → 페이지명 폴백(Q155)
  const bt = box.querySelector('.tbrief-t');   // 브리프 본문 주입 = *별표*→<b> + [텍스트](url)·URL→<a> (텍스트노드/href 검증만 = XSS 안전 · 메뉴3 파서 미러 — 스크랩 refs 축만 제외 · 줄바꿈 = .tbrief-t pre-line)
  if (bt && CB) {
    bt.textContent = '';
    const bcur = bsecs ? bsecs.find(s => s.k === CHAN_BSEC) : null;   // 기간 탭 선택분(운영자 260714) — sections 없으면 종전 전문(text)
    const parseInto = (el, s) => {   // 인라인 파서(**별표2**→볼드만 · *별표1*→강조색볼드 · [텍스트](url)·URL→<a>) — 본문·제안 블릿 공용(텍스트노드/href 검증 = XSS 안전 · 메뉴3 파서 미러) · ⚠ 더블스타를 싱글 앞에 = 같은 위치서 먼저 매칭(운영자 260714 2층 강조)
      const TOK = /(\*\*[^*\n]+\*\*)|(\*{2,})|(\*[^*\n]+\*(?!\*))|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s)]+)/g;   // 2층(**..**) 먼저 → 안 닫힌 **런 = 리터럴(strip) → 1층(*..*·닫기 (?!\*) = **의 첫 별표 안 삼킴) → 링크/URL · 운영자 260720 과흡수 봉합(SNS 미러와 통일 · 룩어헤드만 = 사파리 호환)
      const addText = z => {   // 짝 없는 경계 단일 * = 오탈자 플래그(tb-starwarn) · 숫자/글자 사이 *(수식 3*4)는 리터럴(오탐 방지) · SNS 미러와 통일 · 운영자 260720
        if (!z) return;
        if (z.indexOf('*') < 0) { el.appendChild(document.createTextNode(z)); return; }
        const A = z.split(/(\*)/), aln = c => c && /[0-9A-Za-z가-힣]/.test(c);
        A.forEach((p, i) => {
          if (p === '*') {
            if (aln((A[i - 1] || '').slice(-1)) && aln((A[i + 1] || '')[0])) el.appendChild(document.createTextNode('*'));
            else { const w = document.createElement('span'); w.className = 'tb-starwarn'; w.textContent = '*'; w.title = '짝 없는 별표 — 오탈자 확인'; el.appendChild(w); }
          } else if (p) el.appendChild(document.createTextNode(p));
        });
      };
      const addLink = (label, url) => { try { const u = new URL(url); if (u.protocol !== 'http:' && u.protocol !== 'https:') return addText(label); const igc = /(?:^|\.)instagram\.com$/.test(u.hostname) ? (u.pathname.match(/^\/(?:p|reel|reels|tv)\/([\w-]+)/) || [])[1] : '';
        if (igc && _embDead.has(igc)) return addText(label);   // 임베드 사망 게시물 = 링크 자체를 안 건다(운영자 260810 "이렇게 에러가 될 경우는 아예 링크를 하지마") — 골드 참조로 걸면 인앱 팝업이 인스타 에러 카드만 그린다(260810 실측 = 임베드·공개커버 전 표면 결손 가족) · 도장 없는 URL = 종전 링크(fail-open)
        const a2 = document.createElement('a'); a2.href = u.href; a2.target = '_blank'; a2.rel = 'noopener noreferrer'; a2.textContent = label; if (igc) a2.classList.add('tbrief-ref'); el.appendChild(a2); } catch { addText(label); } };
      let last = 0, m;
      while ((m = TOK.exec(s))) {
        addText(s.slice(last, m.index)); last = TOK.lastIndex;
        if (m[1]) { const b2 = document.createElement('b'); b2.className = 'tb-em'; b2.textContent = m[1].slice(2, -2); el.appendChild(b2); }   // **2층** = 강조색 없이 볼드만
        else if (m[2]) { /* 안 닫힌 **런 = 리터럴 제거(과흡수·별표 누출 차단) */ }
        else if (m[3]) { const b2 = document.createElement('b'); b2.textContent = m[3].slice(1, -1); el.appendChild(b2); }   // *1층* = 강조색 볼드
        else if (m[4]) { const mm = m[4].match(/^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/); addLink(mm[1], mm[2]); }
        else if (m[5]) { addLink(m[5], m[5]); }
      }
      addText(s.slice(last));
    };
    // 클로신의 제안(운영자 260714 "위 = 분석·브리핑 / 아래 = 왓투두 블릿") — '→ ' 전략 줄을 본문에서 떼어 분리 판으로 · 전략 줄 없는 기간 탭 = 판 hidden 유지
    const rawTxt = (bcur ? bcur.text : CB.text) || '', props = [], bodyLn = [];
    rawTxt.split('\n').forEach(ln => { const t2 = ln.trim(); if (/^→/.test(t2)) props.push(t2.replace(/^→\s*/, '')); else bodyLn.push(ln); });
    parseInto(bt, bodyLn.join('\n').replace(/\n{3,}/g, '\n\n').trim());
    const pb = box.querySelector('.tbrief-prop'), pu = pb ? pb.querySelector('ul') : null;
    if (pu && props.length) {
      pb.hidden = false;
      // 행동 필(운영자 260714 승인 "한수 진행") = 전략 줄마다 게시 예약 — 팔로워 접속 피크(KST · insta_data online_peak_kst 1위) 시각으로 구글 캘린더 템플릿 · 피크 데이터 없으면 다음 정시(시각 날조 금지 = 라벨서 '피크' 문구 제외)
      const peakH = (() => { const pk = (d.online_peak_kst || [])[0]; const n2 = parseInt(pk, 10); return Number.isInteger(n2) && n2 >= 0 && n2 <= 23 ? n2 : null; })();
      const nowK = new Date(Date.now() + (540 + new Date().getTimezoneOffset()) * 60000);   // KST 벽시계(기기 TZ 무관 · 캘린더 ctz=Asia/Seoul와 정합)
      const st = new Date(nowK); st.setMinutes(0, 0, 0);
      if (peakH != null) { st.setHours(peakH); if (st <= nowK) st.setDate(st.getDate() + 1); } else st.setHours(st.getHours() + 1);
      const fmtG = d2 => `${d2.getFullYear()}${String(d2.getMonth() + 1).padStart(2, '0')}${String(d2.getDate()).padStart(2, '0')}T${String(d2.getHours()).padStart(2, '0')}0000`;
      const en2 = new Date(st.getTime() + 30 * 60000);
      const dayLb = st.getDate() === nowK.getDate() ? '오늘' : '내일';
      props.forEach(tx => {
        const li = document.createElement('li'); parseInto(li, tx);
        const act = document.createElement('a'); act.className = 'ch-mchip tbrief-act';
        act.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('[노뮤트] ' + tx.replace(/\*/g, '').split('—')[0].trim().slice(0, 60)) +
          '&dates=' + fmtG(st) + '/' + fmtG(en2) + '&ctz=Asia/Seoul&details=' + encodeURIComponent(tx.replace(/\*/g, '') + (peakH != null ? '\n(팔로워 접속 피크 ' + peakH + '시 KST — 노뮤트 채널 요약)' : '\n(노뮤트 채널 요약)'));
        act.target = '_blank'; act.rel = 'noopener noreferrer';
        act.textContent = `${dayLb} ${st.getHours()}시 예약`;
        li.appendChild(act); pu.appendChild(li);
      });
    }
    // (3) 총론 고정 판(운영자 260714 "비전·방향성·미션 큰 그림 · 마인드셋") — 총론(overview) 우선, 없으면 all 폴백(하위호환) · 본문 통째 주입(→ 줄 포함) · '전체' 탭 폴백이면 HTML서 tb-allwrap hidden = tb-allt 부재(주입 스킵)
    const ballt = box.querySelector('.tb-allt');
    if (ballt && bsecs) { const bsrc = bov || bsecs.find(s => s.k === 'all'); if (bsrc) parseInto(ballt, (bsrc.text || '').replace(/\n{3,}/g, '\n\n').trim()); }
  }
  const pts = box.querySelectorAll('.ch-pt'); posts.forEach((x, i) => { if (pts[i]) { const nm = String(x.name || '').replace(/^\s*\p{Extended_Pictographic}️?\s*/u, '').trim(); pts[i].textContent = nm || x.name || '(무캡션)'; } });   // 제목 이모지 앞자름 = 소머리 관용구 계승(운영자 260719 "이모지 빼")
  condFill(box); { const cd = box.querySelector('details[data-g="cond"]'); if (cd) cd.addEventListener('toggle', () => { if (cd.open) condFill(cd); }); }   // 잘 되는 조건 = 실폭 그리기(접힌 채 렌더 = 폭 0 → 펼칠 때)
  wireSigCharts(box);   // 시간대별 반응 차트 툴팁·호버점 배선(최근접 포인트 = 일일 추이 크로스헤어 문법 대칭)
  // 타일 미니차트 왜곡 보정(평의회2 P1 · 260721) — preserveAspectRatio none 채움(운영자 '도형 안에' 유지)에서 원·글자만 실측비 역보정 = 화면 정비율 복원(선·리더 = ㄱ자 직교+non-scaling-stroke라 무왜곡 · 리사이즈 미추적 = 재렌더 시 재보정 한계 명기)
  box.querySelectorAll('.ch-tchart .ch-tc').forEach(sv => { try {
    const r = sv.getBoundingClientRect(), vb = sv.viewBox.baseVal;
    if (!(r.width > 10 && r.height > 10)) return;
    const sx = vb.width / r.width, sy = vb.height / r.height;   // svg단위/화면px
    sv.querySelectorAll('circle[data-mk]').forEach(c => { c.setAttribute('transform', `translate(${c.getAttribute('cx')} ${c.getAttribute('cy')}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`); c.setAttribute('cx', 0); c.setAttribute('cy', 0); });
    sv.querySelectorAll('text').forEach(t => { const x = t.getAttribute('x'), y = t.getAttribute('y'); t.setAttribute('transform', `translate(${x} ${y}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`); t.setAttribute('x', 0); t.setAttribute('y', 0); });
  } catch (e) {} });
  // 추이 차트 배선(지표 칩·기간 세그·crosshair 툴팁 — 재렌더 = 스크롤 보존)
  box.querySelectorAll('#chMetRail [data-m]').forEach(b => b.addEventListener('click', () => { CHAN_MET = b.dataset.m; const y = __scrollY(); renderChan(); __scrollTo(0, y); }));   // 지표 레일(#chMetRail) 옵션 = 화풍 .geni-opt 계승 · [data-m] 한정(브리프 data-bs 오염 방지 260714)
  try { (window._chDemoRot || []).forEach(clearInterval); window._chDemoRot = []; } catch (e) {}   // (구) 도넛 축 교대 회전 잔여 타이머 정리 — 성별·연령 = 독립 타일 분리로 회전 폐지(운영자 260721 4×2 · 캡처마다 다른 축 혼선 해소) · 기동 세션 잔존 인터벌 청소만 유지
  geniRailSetup('#chMetRail'); geniRailUpd($('#chMetRail'));   // 지표 레일 = 화풍 레일 배선 계승(드래그·‹›·끝선 페이드 · geniRailSetup 범용 재사용 · 재렌더마다 새 노드라 _railSet 가드 자동 통과)
  box.querySelectorAll('[data-bs]').forEach(b => b.addEventListener('click', () => { CHAN_BSEC = b.dataset.bs; const y = __scrollY(); renderChan(); __scrollTo(0, y); }));   // 브리프 기간 책갈피(3일~전체) — [data-bs] 통합 셀렉터(우상단 세그→세로 내비 미니바 이관(260716)에도 불변) · 재렌더·스크롤 보존
  box.querySelectorAll('.ch-rangeseg:not(.tb-seg):not(.cs-seg):not(.tp-seg):not(.pf-seg):not(.rr-seg) button').forEach(b => b.addEventListener('click', () => { CHAN_RANGE = b.dataset.r; const y = __scrollY(); renderChan(); __scrollTo(0, y); }));   // :not(.tb-seg) = 브리프 기간 세그 · :not(.cs-seg) = 채널 소스 세그(Q155) · :not(.tp-seg) = TOP 게시물 세그 · :not(.pf-seg) = 프로필 공통 세그(CHAN_PROF_R 별축 Q290) — data-r 없는 세그가 CHAN_RANGE 오염 차단(일일추이 기간 세그만)
  box.querySelectorAll('.tp-seg button').forEach(b => b.addEventListener('click', () => { CHAN_TPR = b.dataset.tpr; const y = __scrollY(); renderChan(); __scrollTo(0, y); }));   // TOP 게시물 기간 필터(7/30/90/all · 운영자 260719) — data-tpr 별축 · 스크롤 보존
  box.querySelectorAll('.pf-seg button').forEach(b => b.addEventListener('click', () => { CHAN_PROF_R = b.dataset.pr; const y = __scrollY(); renderChan(); __scrollTo(0, y); }));   // 프로필 공통 기간 세그(7/30/90/all · 운영자 260720 Q290) — data-pr 별축 · 팔로워 증감·조회·도달·방문 평균/스파크 전부 연동 · 스크롤 보존
  box.querySelectorAll('.rr-seg button').forEach(b => b.addEventListener('click', () => { CHAN_RR = b.dataset.rr; const y = __scrollY(); renderChan(); __scrollTo(0, y); }));   // 반응 기간(90일/전체 · 운영자 261025) — 주제별·시간대별 두 세그가 한 값 · data-rr 별축(:not(.rr-seg) = 일일 추이 세그 오배선 차단) · 스크롤 보존
  chuFit(box);   // 헤더 우측 칩 실폭 예약(시각 텍스트 겹침 차단 · 운영자 260717 — 메뉴3과 동일 배선)
  const wrap = $('#chChartWrap'), tip = $('#chTip'), dot = $('#chDot');
  if (wrap && tip) {
    const place = (x, y) => { const r = wrap.getBoundingClientRect(); return [x / 600 * r.width, y / 150 * r.height]; };   // SVG좌표(600×150)→픽셀(툴팁·호버점 공용)
    const showDot = (x, y) => { if (!dot) return; const [px, py] = place(x, y); dot.style.left = px + 'px'; dot.style.top = py + 'px'; dot.style.opacity = '1'; };
    const hide = () => { tip.style.opacity = '0'; tip.classList.remove('ev'); if (dot) dot.style.opacity = '0'; };
    const move = ev => {   // 크로스헤어 = 최근접 데이터점 툴팁 + 흰 호버점(운영자 260715)
      if (!CH_HIT.length) return;
      const r = wrap.getBoundingClientRect();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const px = (cx - r.left) / r.width * 600;
      let best = CH_HIT[0], bd = 1e9;
      CH_HIT.forEach(pt => { const dd = Math.abs(pt.x - px); if (dd < bd) { bd = dd; best = pt; } });
      const [tx, ty] = place(best.x, best.y);
      tip.classList.remove('ev');
      const bref = best.refs && best.refs.length ? ` · ${esc(best.refs[0].name || '(무캡션)')}${best.refs.length > 1 ? ` 외 ${best.refs.length - 1}` : ''}` : '';   // 그날 게시물 제목 미리보기(운영자 260718 "어떤 게시물 올렸는지 확인" · 링크는 러그 탭 팝오버가 담당)
      tip.innerHTML = `<b>${best.v.toLocaleString()}</b> ${esc(chMet()[CHAN_MET][1])}${best.pc ? ` · 게시 ${best.pc}개` : ''}<br><span style="color:var(--mut);font-size:10px">${esc(best.day)}${bref}</span>`;
      const _hw = (tip.offsetWidth || 110) / 2; tip.style.left = Math.max(_hw + 2, Math.min(r.width - _hw - 2, tx)) + 'px'; tip.style.top = ty + 'px';   // 좌우 클램프(260720 평의회 F5 — 좌단 -73px 화면 밖 실측 봉합 · innerHTML 후 실폭 측정)
      tip.style.opacity = '1';
      showDot(best.x, best.y);
    };
    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerleave', hide);
    wrap.addEventListener('touchmove', move, { passive: true });
    // 변곡 주석(그 문구) 호버 = 그 일자 값 + 요약(라벨·note)으로 전환(운영자 260715 "그 문구 호버하면 그 일자 추이·요약으로")
    wrap.querySelectorAll('.ch-ev').forEach(g => {
      const showEv = ev => {
        ev.stopPropagation();   // 크로스헤어와 툴팁 다툼 차단(밴드 위에선 주석 우선)
        const e = CH_EV[+g.getAttribute('data-ei')]; if (!e) return;
        const [tx, ty] = place(e.x, e.y);
        tip.classList.add('ev');
        const _wr = wrap.getBoundingClientRect();
        tip.style.top = ty + 'px';
        tip.innerHTML = `<b>${esc(e.label)}</b><br><span style="color:var(--mut);font-size:10px">${esc(e.date)}${e.v != null ? ` · <span style="color:var(--accent)">${e.v.toLocaleString()} ${esc(chMet()[CHAN_MET][1])}</span>` : ''}</span>${e.note ? `<br><span style="color:var(--mut);font-size:10px;opacity:.85">${esc(e.note)}</span>` : ''}`;
        const _hw = (tip.offsetWidth || 110) / 2; tip.style.left = Math.max(_hw + 2, Math.min(_wr.width - _hw - 2, tx)) + 'px';   // 좌우 클램프(260720 평의회 F5 · 크로스헤어 툴팁 동일 문법)
        tip.style.opacity = '1';
        if (e.v != null) showDot(e.x, e.y); else if (dot) dot.style.opacity = '0';
      };
      g.addEventListener('pointerenter', showEv);
      g.addEventListener('pointermove', showEv);
      g.addEventListener('pointerleave', hide);
    });
    // 게시일 러그 탭 → 그날 게시물 팝오버(운영자 260718 "각 부분에 어떤 게시물 올렸는지 링킹" · 추천안 = 페이블) — .chp-row 문법·글래스·z-float 계승 · 탭 밖 클릭 = 닫힘 · 제목 = textContent 주입(XSS 안전)
    const pop = $('#chPostPop');
    if (pop) {
      const hidePop = () => pop.classList.remove('on');
      wrap.querySelectorAll('.ch-rug-hit').forEach(hb => hb.addEventListener('click', ev => {
        ev.stopPropagation();
        const r0 = CH_RUG[+hb.getAttribute('data-ri')]; if (!r0) return;
        const refs = r0.refs || [];
        let h = `<div class="pph">${esc(r0.date)} · 게시 ${r0.pc}개${refs.length !== r0.pc ? ` · 수집분 ${refs.length}건` : ''}</div>`;
        if (refs.length) h += refs.map((x, i) => `<a class="pprow" href="${escUrl(x.permalink || '#')}" target="_blank" rel="noopener"><span class="ppr">${i + 1}</span><span class="ppt"></span>${x.views != null ? `<span class="ppv">${chVf(x.views)}</span>` : ''}</a>`).join('');
        else h += `<div class="ppnone">수집분 0 — 다음 수집 때 채워짐(fail-soft)</div>`;
        pop.innerHTML = h;
        const tts = pop.querySelectorAll('.ppt'); refs.forEach((x, i) => { if (tts[i]) tts[i].textContent = x.name || '(무캡션)'; });   // textContent = XSS 안전 관용구
        const wr = wrap.getBoundingClientRect(), hbr = hb.getBoundingClientRect();
        let lx = hbr.left - wr.left + hbr.width / 2 - 100; lx = Math.max(4, Math.min(wr.width - 210, lx));
        pop.style.left = lx.toFixed(0) + 'px';
        pop.style.top = Math.max(4, (hbr.top - wr.top) - 8 - (refs.length ? 62 : 48)).toFixed(0) + 'px';
        pop.classList.add('on');
      }));
      wrap.addEventListener('pointerdown', e => { if (!e.target.closest('.ch-rug-hit') && !e.target.closest('.ch-postpop')) hidePop(); });
      __on(document, 'click', e => { if (!e.target.closest('#chChartWrap')) hidePop(); }, { passive: true });
    }
  }
  const dm = $('#chDayMore'), pm2 = $('#chPostMore');   // 심층 진입(운영자 260713 "앱 내에서 볼 경로") — 필 = summary 밖 형제(.chu 앵커·평의회7-①)라 접기 토글과 무간섭 = preventDefault 불요
  if (dm) dm.addEventListener('click', openChDay);
  if (pm2) pm2.addEventListener('click', openChPost);
  chanFoldWire(box);   // 접힘 = 이번 접속 동안만(위 CHAN_FOLD · 운영자 261026 「항상 펼쳐있게 기본값」)
  box.querySelectorAll('details.tgroup').forEach(dt => dt.addEventListener('toggle', () => {   // 접기/펼치기 = 레일 그 단위 점등
    const g = dt.dataset.g;
    const rail0 = box.querySelector('#chanRail');   // 접기/펼치기 시 레일 그 단위 점등 = 네비 싱크(메뉴3 미러 · 브리프 = 레일 제외 → 1 프로필 매핑)
    if (rail0) { const gm = g === 'brief' ? 'prof' : g; rail0.querySelectorAll('.trail-i').forEach(b2 => b2.classList.toggle('on', b2.dataset.tg === gm)); }
  }));
  const rl = box.querySelector('#chanRail');   // 레일 점프 = 접힌 단위면 펼치며 스크롤 · TOP = 최상단 · scroll-margin-top = .tgroup 계승(메뉴3 동작 그대로)
  if (rl) rl.addEventListener('click', e => {
    const ri = e.target.closest('.trail-i'); if (!ri) return;
    const g2 = ri.dataset.tg;
    const sb = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';   // 전정계 배려 = 기존 rm 삼항 정본 계승(평의회7-⑤ — 레일만 미가드였던 패턴 불일치 봉합)
    if (g2 === 'top') { __scrollTo({ top: 0, behavior: sb }); return; }
    const el2 = __byId('cg-' + g2);
    if (el2) { if (!el2.open) el2.open = true; el2.scrollIntoView({ behavior: sb, block: 'start' }); }
  });
  if (box._chIO) { try { box._chIO.disconnect(); } catch {} box._chIO = null; }   // 레일 스크롤스파이 = IO(상단 -12%~-58% 밴드 · 메뉴3 미러) — 재렌더마다 구 관측 해제(누수 방지)
  if (rl && 'IntersectionObserver' in window) {
    const mark = id => rl.querySelectorAll('.trail-i').forEach(b2 => b2.classList.toggle('on', b2.dataset.tg === id));
    box._chIO = new IntersectionObserver(es => {
      const v2 = es.filter(x => x.isIntersecting).sort((a2, b2) => b2.intersectionRatio - a2.intersectionRatio)[0];
      if (v2) { const gid = (v2.target.id || '').replace('cg-', ''); mark(gid === 'brief' ? 'prof' : gid); }   // 브리프 = 레일 제외 → 최상단 구간 = 1(프로필) 점등(메뉴3 brief→top 매핑 미러)
    }, { rootMargin: '-12% 0px -58% 0px' });
    box.querySelectorAll('details.tgroup').forEach(g3 => box._chIO.observe(g3));
  }
}
let _chPop = false, _chClosing = false;
function chDlgOpen(dg) { if (!dg.open) { dg.showModal(); try { history.pushState({ chdlg: true }, ''); } catch {} } }
__on(window, 'popstate', () => {
  if (_chClosing) { _chClosing = false; return; }
  ['#chdaydlg', '#chpostdlg'].forEach(sl => { const dg = $(sl); if (dg && dg.open) { _chPop = true; dg.close(); } });
});
['#chdaydlg', '#chpostdlg'].forEach(sl => { const dg = $(sl); if (!dg) return;
  dg.addEventListener('close', () => { if (_chPop) { _chPop = false; } else if (history.state && history.state.chdlg) { _chClosing = true; try { history.back(); } catch {} } });
  dg.querySelector('.dlg-x').addEventListener('click', () => dg.close());
});
function openChDay() {   // 일별 상세 = 전 기간 표(최신 위 · 게시>0 = 강조)
  const rows = ((chActive() || {}).daily_series || []).slice().reverse();   // 활성 소스(1-1/1-2) 상세 — 전역 CHAN 하드코딩 정정(Q155 후속 · 페이블 검증단)
  if (!rows.length) return;
  const isTh = CHAN_SRC === 'th';   // 스레드(1-3) = 게시 칸 없음(일별 게시수 미수집) · 열 = 원장 칸(조회·좋아요·답글·리포스트·인용·팔로워) — 표 부품(.chd-t) 그대로
  const cols = isTh ? [['views', '조회'], ['likes', '좋아요'], ['replies', '답글'], ['reposts', '리포스트'], ['quotes', '인용'], ['followers', '팔로워']]
    : [['views', '조회'], ['reach', '도달'], ['profile_views', '방문'], ['follows', '팔로우']];
  let h = `<table class="chd-t"><thead><tr><th>날짜</th>${isTh ? '' : '<th>게시</th>'}${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>`;
  rows.forEach(r => {
    h += `<tr><td>${esc(String(r.date).slice(2))}</td>${isTh ? '' : `<td class="${r.posts ? 'pp' : 'pz'}">${r.posts != null ? r.posts : '—'}</td>`}` +
      cols.map(c => `<td>${r[c[0]] != null ? chFmtK(r[c[0]]) : '—'}</td>`).join('') + '</tr>';
  });
  $('#chdBody').innerHTML = h + '</tbody></table>';
  $('#chdN').textContent = rows.length + '일';
  chDlgOpen($('#chdaydlg'));
}
let CHP = { sort: 'views', fmt: '전체', cat: '전체' };
function renderChPost() {
  const all = (chActive() || {}).posts || [];   // 활성 소스 게시물(1-1/1-2)
  const cats = ['전체', ...new Set(all.map(x => x.cat).filter(Boolean))];
  $('#chpFmt').innerHTML = ['전체', '릴스', '피드'].map(f => `<button class="ch-mchip${CHP.fmt === f ? ' on' : ''}" type="button" data-f="${f}">${f}</button>`).join('');
  $('#chpCat').innerHTML = cats.map(c => `<button class="ch-mchip${CHP.cat === c ? ' on' : ''}" type="button" data-c="${c}">${c}</button>`).join('');
  const hasV = k => k === 'new' || all.some(x => x[k] != null);   // 정렬축 데이터 존부(활성 소스 게시물 기준 · 최신 = iso 상존)
  if (!hasV(CHP.sort)) CHP.sort = hasV('views') ? 'views' : hasV('eng') ? 'eng' : 'new';   // 활성 소스에 값 없는 축 선택 잔존 시 폴백(조회수→반응→최신)
  $('#chpSort').innerHTML = [['views', '조회수'], ['eng', '반응'], ['share_pm', '공유율'], ['save_pm', '저장률'], ['new', '최신']].filter(s0 => s0[0] !== 'eng' || hasV('eng')).map(s0 => `<button type="button" data-s="${s0[0]}"${CHP.sort === s0[0] ? ' class="on"' : ''}${hasV(s0[0]) ? '' : ' disabled'}>${s0[1]}</button>`).join('');   // 값 전무 축 = disabled 흐림(운영자 260723 "ㄱ 아니면 다른 값이 있으면 대체" — fb views·share_pm 미수집 축 눌러도 무변화 혼란 차단) · '반응'(eng = 반응+댓글+공유 합 · fb_fetch 산출) = 값 있을 때만 노출되는 대체 축(disabled 버튼 = 클릭 이벤트 자체 미발화라 기존 위임 배선 무접촉)
  let list = all.filter(x => (CHP.fmt === '전체' || x.format === CHP.fmt) && (CHP.cat === '전체' || x.cat === CHP.cat));
  list = list.slice().sort((a, b) => CHP.sort === 'new' ? String(b.iso || '').localeCompare(String(a.iso || '')) : (b[CHP.sort] || 0) - (a[CHP.sort] || 0));
  const tmed = (chActive() || {}).topics || {};   // 활성 소스 주제 중앙값(fb = topics 방출 시 eng 중앙값 · 미방출이면 배지 자동 미표시)
  $('#chpList').innerHTML = list.map((x, i) => {
    const _mv = x.views != null ? x.views : x.eng, tm = tmed[x.cat], ratio = tm && tm.views_med && _mv != null ? _mv / tm.views_med : null;   // 주제 중앙값 대비 배율(운영자 260713 한 수 ㄱㄱ) — 같은 주제 안 특출도 · FB 소스분기(평의회 260724 must-fix): views 부재 시 eng로 비교(topics.views_med = fb는 eng 중앙값) + null 방어(구: null/med = ×0.0 유령 배지 전 행 부착 회귀 차단 · IG는 x.views 그대로 = 무회귀)
    const rt = ratio != null ? ` <i class="${ratio >= 10 ? 'hot' : ''}">×${ratio.toFixed(1)}</i>` : '';   // hot = ×10+(TOP100 분포 실측 p90 17.4·중앙 2.3 — 상위 20%만 점등)
    return `<a class="chp-row" href="${escUrl(x.permalink || '#')}" target="_blank" rel="noopener"><span class="trend-rank">${i + 1}</span><span class="chp-tt" data-nm></span><span class="chp-ct">${esc(x.cat || '—')}${rt}</span><span class="chp-mt">${x.views == null && x.eng != null ? '반응 ' + chVf(x.eng) : chVf(x.views) + ' · 공유 ' + (CHAN_SRC === 'th' ? (x.shares != null ? chVf(x.shares) : '—') : (x.share_pm != null ? (+x.share_pm).toFixed(1) : '—'))}</span></a>`;
  }).join('');
  const nms = $('#chpList').querySelectorAll('[data-nm]'); list.forEach((x, i) => { if (nms[i]) nms[i].textContent = x.name || '(무캡션)'; });   // 캡션 = textContent 주입(XSS 안전 관용구)
  $('#chpN').textContent = list.length + '/' + all.length;
}
function openChPost() { if (!((chActive() || {}).posts || []).length) return; renderChPost(); chDlgOpen($('#chpostdlg')); }
{ const _cst = __byId('chanSrcTgl'); if (_cst) _cst.addEventListener('click', () => {
  CHAN_SRC = { ig: 'fb', fb: 'th', th: 'gyeol' }[CHAN_SRC] || 'ig'; const y = __scrollY(); renderChan(); __scrollTo(0, y);   // 단일 아이콘 토글 = 소스 순환 인스타 → 페이스북 → 스레드(1-3 · 운영자 261022) → 인스타(운영자 260720 — 구 2버튼 명시 선택[Q233] 대체 · 항상 점등 · 활성/라벨은 renderChan 갱신)
  if (CHAN_SRC !== 'ig' && !chActive() && !CHAN_LOADING) { CHAN_AT = 0; loadChan(); }   // fb·스레드·결과 함께(#981) 최초 탭 lazy 로드 유지
}); }
(() => { const w = $('#chpostdlg'); if (!w) return;   // 칩·세그 = 위임 1회 배선(재렌더 무관)
  w.addEventListener('click', e => {
    const f = e.target.closest('[data-f]'), c = e.target.closest('[data-c]'), s0 = e.target.closest('[data-s]');
    if (f) CHP.fmt = f.dataset.f; else if (c) CHP.cat = c.dataset.c; else if (s0) CHP.sort = s0.dataset.s; else return;
    renderChPost();
  });
})();
function askShowCheck(btn){ if (!btn || btn.querySelector('.ack')) return; btn.classList.add('checked');
  const d = document.createElement('span'); d.className = 'ack';
  d.innerHTML = '<svg viewBox="0 0 24 24" role="img" aria-label="완료"><path d="M5 13l4 4L19 7"/></svg>'; btn.appendChild(d); }
function askHideCheck(btn){ if (!btn) return; btn.classList.remove('checked'); const d = btn.querySelector('.ack'); if (d) d.remove(); }
function gaugeStart(btn){ if (!btn) return; btn.classList.add('glive', 'firing'); requestAnimationFrame(() => requestAnimationFrame(() => { if (btn.classList.contains('glive')) btn.classList.add('grun'); })); }
function gaugeDone(btn){ if (btn) btn.classList.add('gdone'); }
function gaugeClear(btn){ if (btn) btn.classList.remove('glive', 'firing', 'grun', 'gdone'); }
// ───────── 원본 줄 끝 ─────────
  window.chThFail = chThFail;   // 판 안 onerror="…" 가 부르는 이름(원본은 창 전역)
  if (which === "chan") { loadChan(); __loadSet(); } else { loadTrends(); loadSocial(); }
  return () => { __stop(); };
}
