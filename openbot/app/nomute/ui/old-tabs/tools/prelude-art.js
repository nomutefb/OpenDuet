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
