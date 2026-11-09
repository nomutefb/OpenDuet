// Hot Issue 차례 = RSS 가 바탕 · 커뮤 묶음은 그 사이에 섞기(형 11-09 09:34 「핫이슈 기준이 항상 rss가 기준이 되어야 하는데, 82쿡, 에펨 이런게기준이 되어버리네 … 그거 기준으로 한 다음에 거기에 커뮤를 섞는방식으로 재조립해」 · 09:35 「왜곡된 정보가 메인으로 갔을때 그걸 누가 책임질거냐는거임 기사는 책임질ㄱ사람이있지만」 · 봄 42) · 깃)
//   옛 섞기(editor viewer/modern-data.js project mixNews) = 순위 묶음 N개마다 RSS 1장 · 기기 토글(nm_home_alpha) 기본 0 = RSS 안 낌 → 새 기기에선 커뮤만 몰림
//   이 판 = 토글 기본(0)일 때만 거꾸로: RSS(가장 많이 보도한 매체 순 · project mixNews 1 이 이미 그 차례로 깔아 줌)를 먼저 · RSS EVERY 장마다 순위 묶음 1개 · 남는 묶음은 끝에
//   화면 차례만 · 봇 점수 · overlap 손 0 · 빠지는 줄 0
export const RSS_EVERY = 2, RSS_TOP = 3;   // 맨 위 셋 = 늘 RSS(책임질 사람 있는 기사 · 형 09:35 「왜곡된 정보가 메인으로 갔을때 그걸 누가 책임질거냐는거임 기사는 책임질ㄱ사람이있지만」)

/** rows = project 결과(type "ranked" = 순위 묶음 · 그 밖 = RSS) → RSS 바탕 차례 */
/** 긴급보도 = 제목 머리 [속보] · [단독] · [긴급](형 09:35 「순간 배포의 기울기 긴급보도의 그런거로 … 해놓은게 있는데」 · 서버 event_score brk_tag 와 같은 머리표 · 앱 줄엔 서버 점수 칸이 안 와서 제목으로) */
export const isBreaking = (r: { title?: string }) => /^\s*[[(]\s*(속보|단독|긴급)\s*[\])]/.test(String(r?.title || ""));

/** RSS 줄 신선도 = 8시간(형 11-05 15:49 「35시간전 뭐여. 8시간 전은 다 쳐내셈..」 · news-list FRESH_MS 와 같은 값) — 형 11-09 12:01 「메인 화면에 옛날 기사 뜨는데 확인 좀」:
 *  project 의 RSS 차례(alphaOrder)는 신선도를 일부러 뺀 매체 수 순이라, RSS 를 맨 위로 올리자 며칠 된 큰 기사(매체 30 · 136시간)가 맨 위로 옴 → RSS 줄만 8시간 넘은 것 뺌 · 시각 모르는 줄 = 둠(news-list 와 같음) · 순위 묶음 손 0 */
export const RSS_FRESH_MS = 8 * 3600_000;
type RowLike = { type?: string; title?: string; meta?: { published?: { at?: string } } };
export const rssFresh = (r: RowLike, now = Date.now()) => { const t = Date.parse(String(r?.meta?.published?.at || "")); return !Number.isFinite(t) || now - t <= RSS_FRESH_MS; };

export function rssFirst<T extends RowLike>(rows: T[], every = RSS_EVERY, top = RSS_TOP, now = Date.now()): T[] {
  const ranked = rows.filter((r) => r.type === "ranked"), news0 = rows.filter((r) => r.type !== "ranked" && rssFresh(r, now));
  const news = news0;   // 머리표([속보]·[단독]) 먼저 세우기 뺌 — 형 11-09 13:5x 「속보라는 타이틀 언론사에서 자체적으로 붙인거는 아무 의미없음. 실제 로는 퍼진정도가 유ㅜ의미」 · 차례 = 뉴스 알고리즘 점수(event-score.ts)
  if (!news.length || every < 1) return rows;
  const out: T[] = news.slice(0, top);   // 맨 위 top 장 = RSS 만
  news.slice(top).forEach((n, i) => {
    if (i % every === 0) { const r = ranked.shift(); if (r) out.push(r); }   // 그 뒤 = 묶음 1 · RSS every 장
    out.push(n);
  });
  return [...out, ...ranked];
}
