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
