// 뉴스 요약·썸네일 데이터(형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일, 그리고 뉴스 요약 보는 것들. 그런것들 완전히 내재화 부탁해.」)
//   원천 = 에디터 정적 파일 그대로(같은 출처 · build-viewer.mjs 산출 · 서버 고침 0): /articles.json · /detail/<file>.json · /thumb-hist.json · cards/<stem>/thumbs/prompts.json
//   쓰기 = 화풍 투표(/api/rate action=thumb · 비용 0)·저장(/api/dl) · 피드 고치기 · 다시 만들기(./feed-acts.tsx = /api/revise-cards · /api/revise · /api/make-cards) — 그 밖 만들기는 에디터 한 겹(#/web)
import { queryOptions } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { inAppHref } from "./inapp";

/** 앱 안 길로 한 칸 — 라우터 기록(순번 붙음)이라 「<」·#/web 닫기 = 뒤로(location.hash 로 옮기면 순번이 없어 닫을 때 앞 화면을 잃음) */
export const useGo = () => { const r = useRouter(); return (path: string) => r.history.push(path); };
/** 원문·출처 링크 누름 = 앱 안 한 겹(./inapp.ts 규칙 · 품기 막는 사이트는 원래대로 새 창) */
export const inAppClick = (go: (p: string) => void) => (e: { preventDefault: () => void; currentTarget: HTMLAnchorElement }) => { const h = inAppHref(e.currentTarget.href); if (h) { e.preventDefault(); go(h); } };
/** 에디터 그 기사 창(딥링크 /?a=<file> · 카드 한 장 고치기 · AI 생성 · 썸네일 다시는 거기서 · 빌드 전 새 요약 · 요약 고치기 = ./news-detail.tsx · ./summary-fix.tsx · 피드 고치기 · 다시 만들기 = ./feed-acts.tsx 앱 안) */
export const editorPath = (file: string) => "/web?u=" + encodeURIComponent(`/?a=${encodeURIComponent(file)}`);

export type Thumb = { img?: string; url?: string; link?: string; label?: string; sid?: string };
export type Cards = { state?: string; thumb_search?: Thumb[]; thumb_gen?: Thumb[]; thumb_prompts_url?: string; images?: string[]; updated?: string; rev?: number; has_md?: boolean };
export type Art = {
  file: string; title?: string; title_orig?: string; summary?: string; media?: string; reporter?: string; url?: string; date?: string; time?: string; time_est?: string;
  category?: string; cat?: string; bias?: string; bias_src?: string; tags?: string; tags_why?: string; breaking?: boolean | number | string; issue?: boolean | number; rev?: number; has_body?: boolean; cards?: Cards;
  /** 빌드 전 새 요약(/api/feedlive · ./feed.tsx feedLiveQuery) = 본문(body) 동봉 · 정적 /detail 아직 없음 */
  _live?: number; body?: string;
};
type Feed = { articles?: Art[]; count?: number; generated?: string };

/** 파일 없음 — 404 또는 HTML(200 · Pages 가 없는 길을 index.html 로 돌림 = 아직 배포 전) */
export class Miss extends Error {}
/** 같은 출처 JSON(쿠키 그대로) · 끊김 = Access 만료(302 → 다른 출처)거나 회선 */
export async function getJson<T>(url: string): Promise<T> {
  let r: Response;
  try { r = await fetch(url, { credentials: "same-origin" }); } catch { throw new Error("연결이 끊겼거나 로그인이 끝났어 — 새로 고쳐 다시"); }
  if (r.status === 404) throw new Miss("404");
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const t = await r.text();
  if (/^\s*</.test(t)) throw new Miss("html");
  try { return JSON.parse(t) as T; } catch { throw new Error("받은 글이 JSON 이 아니야"); }
}

/** 목록 = /articles.json 전부(최신 파일명 순) · 60초 다시 읽기(원본 폴) — 상세도 같은 캐시에서 그 기사 줄을 찾음 */
export const newsListQuery = queryOptions({
  queryKey: ["nomute", "news-list"], staleTime: 60_000, refetchInterval: 60_000,
  queryFn: async () => {
    const j = await getJson<Feed>(`/articles.json?_=${Date.now()}`).catch((e) => { throw e instanceof Miss ? new Error("로그인이 끝났어 — 새로 고쳐 다시 로그인") : e; });
    const arts = (j.articles || []).filter((a) => a && a.file).sort((a, b) => (a.file < b.file ? 1 : a.file > b.file ? -1 : 0));
    return { arts, count: j.count || arts.length, generated: j.generated || "" };
  },
});
/** 상세 본문 = /detail/<file>.json?v=<판>(file 이 .md 로 끝나 「….md.json」) · 판 = 에디터 ensureDetail 과 같은 셈(요약 rev · 카드 rev · 카드 updated) */
export const detailQuery = (a: Art) => {
  // 빌드 전 새 요약 = 받은 본문 그대로(옛 에디터 renderChips 「_live && body != null」 과 같은 길 · 형 11-10 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
  if (a._live && a.body != null) return queryOptions({ queryKey: ["nomute", "news-detail", a.file, `live.${a.rev || 0}`], staleTime: Infinity, queryFn: async (): Promise<{ body?: string; cards_md?: string }> => ({ body: a.body }) });
  const v = `${a.rev || 0}.${a.cards?.rev || 0}.${a.cards?.updated || ""}`;
  return queryOptions({
    queryKey: ["nomute", "news-detail", a.file, v], staleTime: 5 * 60_000,
    queryFn: () => getJson<{ body?: string; cards_md?: string }>(`/detail/${encodeURIComponent(a.file)}.json?v=${encodeURIComponent(v)}`),
    retry: (n, e) => !(e instanceof Miss) && n < 2,
  });
};

/** 상대 경로(cards/… · thumb_out/…) = 앞에 / (앱은 /office-app/ 아래라 그대로 두면 엉뚱한 길) */
export const abs = (u?: string) => { const s = String(u || "").trim(); return !s ? "" : /^(https?:|data:|blob:|\/)/i.test(s) ? s : "/" + s; };
export const imgOf = (t?: Thumb) => abs(t?.img || t?.url);
/** 목록 썸네일 = AI 첫 장 · 없으면 검색 첫 장 */
export const thumbOf = (a: Art) => { const c = a.cards || {}; return imgOf((c.thumb_gen || []).find((x) => imgOf(x))) || imgOf((c.thumb_search || []).find((x) => imgOf(x))); };

/** 공식 매체명(형 11-06 「yna 이런거 다 매체명으로 정확히 바꿔줘 더쿠, 연합뉴스. 뭐 이런식으로 공식 매체명 다 변환되게 구조상으로.」 · 「yna 는 연합일거고, asiae 이건 아시아경제 같고, 좀 더 다듬어줄수잇어? sns.youtube는 유튜브 같고.」)
 *  출처 키(yna · editor:asiae · sns.youtube · www.hani.co.kr · https://news.kbs.co.kr/…) → 공식 이름 · 이미 한글이면 그대로 · 표에 없으면 받은 그대로 · 매체 칸·SNS 칩이 다 이걸 거침 */
const OUTLET: Record<string, string> = {
  // 통신·종합·경제
  yna: "연합뉴스", yonhapnews: "연합뉴스", yonhapnewstv: "연합뉴스TV", newsis: "뉴시스", news1: "뉴스1",
  chosun: "조선일보", "biz.chosun": "조선비즈", "sports.chosun": "스포츠조선", tvchosun: "TV조선", joongang: "중앙일보", joins: "중앙일보", donga: "동아일보", ichannela: "채널A",
  hani: "한겨레", khan: "경향신문", "sports.khan": "스포츠경향", hankookilbo: "한국일보", seoul: "서울신문", segye: "세계일보", kmib: "국민일보", munhwa: "문화일보",
  mk: "매일경제", hankyung: "한국경제", wowtv: "한국경제TV", asiae: "아시아경제", mt: "머니투데이", "star.mt": "스타뉴스", edaily: "이데일리", fnnews: "파이낸셜뉴스",
  heraldcorp: "헤럴드경제", sedaily: "서울경제", etoday: "이투데이", ajunews: "아주경제", newspim: "뉴스핌", dt: "디지털타임스", etnews: "전자신문", zdnet: "지디넷코리아",
  inews24: "아이뉴스24", bloter: "블로터", ddaily: "디지털데일리", aitimes: "AI타임스", thebell: "더벨", dealsite: "딜사이트", bizwatch: "비즈워치",
  ohmynews: "오마이뉴스", pressian: "프레시안", nocutnews: "노컷뉴스", newstapa: "뉴스타파", sisain: "시사IN", mediatoday: "미디어오늘", dailian: "데일리안",
  mydaily: "마이데일리", isplus: "일간스포츠", osen: "OSEN", tvreport: "TV리포트", imaeil: "매일신문", busan: "부산일보", kookje: "국제신문", kyeongin: "경인일보",
  kbs: "KBS", mbc: "MBC", imbc: "MBC", sbs: "SBS", jtbc: "JTBC", ytn: "YTN", mbn: "MBN",
  kukinews: "쿠키뉴스", newdaily: "뉴데일리", "biz.newdaily": "뉴데일리경제", koreaherald: "코리아헤럴드", koreatimes: "코리아타임스", electimes: "전기신문", xportsnews: "엑스포츠뉴스",
  getnews: "겟뉴스", incheonilbo: "인천일보", kyunghyang: "경향신문", kobis: "영화진흥위원회",   // 형 11-07 11:18 「kukinews.com 같은거 아직 분류안된거잇는거 가은데 > 쿠키뉴스」 · 뎅이 라이브 픽·순위·트렌드에서 안 붙은 것 훑어 넣음
  // 포털
  naver: "네이버", "news.naver": "네이버뉴스", "cafe.naver": "네이버카페", "blog.naver": "네이버블로그", daum: "다음", "v.daum": "다음", nate: "네이트", "pann.nate": "네이트판", natepann: "네이트판",
  gnews: "구글뉴스", "news.google": "구글뉴스", google: "구글", gtrends: "구글 트렌드", x_top10: "X", issuelink: "이슈링크",
  // 커뮤니티
  theqoo: "더쿠", dcinside: "디시", "gall.dcinside": "디시", fmkorea: "에펨", instiz: "인스티즈", clien: "클리앙", ruliweb: "루리웹", ppomppu: "뽐뿌",
  mlbpark: "엠엘비파크", bobaedream: "보배드림", todayhumor: "오늘의유머", etoland: "이토랜드", inven: "인벤", ygosu: "와이고수", humoruniv: "웃긴대학", "82cook": "82쿡",
  teamblind: "블라인드", blind: "블라인드", arca: "아카라이브", "arca.live": "아카라이브", slrclub: "SLR클럽", damoang: "다모앙",
  ddanzi: "딴지일보", dogdrip: "개드립", "sns.namu": "나무위키", namu: "나무위키", "namu.wiki": "나무위키", "sns.youtube_news": "유튜브 뉴스", "sns.signal": "시그널",
  // SNS
  "sns.youtube": "유튜브", youtube: "유튜브", "youtu.be": "유튜브", "sns.shorts": "유튜브 쇼츠", "sns.x": "X", x: "X", twitter: "X", "sns.twitter": "X",
  "sns.instagram": "인스타그램", instagram: "인스타그램", "sns.threads": "스레드", threads: "스레드", "sns.tiktok": "틱톡", tiktok: "틱톡",
  "sns.facebook": "페이스북", facebook: "페이스북", reddit: "레딧", "sns.reddit": "레딧",
  // 외신
  nytimes: "뉴욕타임스", washingtonpost: "워싱턴포스트", wsj: "월스트리트저널", bloomberg: "블룸버그", reuters: "로이터", apnews: "AP통신", cnn: "CNN", bbc: "BBC",
  theguardian: "가디언", ft: "파이낸셜타임스", nhk: "NHK", "nhk.or": "NHK", asahi: "아사히신문", yomiuri: "요미우리신문", nikkei: "니혼게이자이신문", aljazeera: "알자지라",
  cnbc: "CNBC", foxnews: "폭스뉴스", nbcnews: "NBC뉴스", scmp: "사우스차이나모닝포스트", axios: "악시오스", politico: "폴리티코",
  // 외신 더(형 11-07 13:22 「그리고 매체명도 자동 번역(중어나 일어 뭐 등등 프랑스어일수도잇겟지)」 · 뎅이 라이브 출처 219개 훑어 넣음)
  hollywoodreporter: "할리우드 리포터", variety: "버라이어티", deadline: "데드라인", billboard: "빌보드", people: "피플", imdb: "IMDb", tmz: "TMZ",
  espn: "ESPN", "espn.co": "ESPN", nba: "NBA", nbcsports: "NBC스포츠", cbssports: "CBS스포츠", "sports.yahoo": "야후 스포츠", si: "스포츠 일러스트레이티드",
  yahoo: "야후", "news.yahoo": "야후 재팬", economist: "이코노미스트", "news.com": "뉴스닷컴", ocregister: "오렌지카운티 레지스터", "timesofindia.indiatimes": "타임스 오브 인디아",
  smithsonianmag: "스미소니언", rotowire: "로토와이어", theplayerstribune: "플레이어스 트리뷴", thesportingtribune: "스포팅 트리뷴", vavel: "바벨",
  bostonglobe: "보스턴글로브", independent: "인디펜던트", bild: "빌트", france24: "프랑스24", ilmessaggero: "일 메사제로", corriereadriatico: "코리에레 아드리아티코",
  famitsu: "파미통", "umatoku.hochi": "우마토쿠", hochi: "호치신문", livedoor: "라이브도어", "news.livedoor": "라이브도어 뉴스", ubisoft: "유비소프트", "blog.playstation": "플레이스테이션 블로그",
  "9to5google": "9to5구글", theverge: "더버지", techcrunch: "테크크런치", engadget: "인가젯", wired: "와이어드", reutersconnect: "로이터", bsky: "블루스카이", "bsky.app": "블루스카이",
  invenglobal: "인벤 글로벌", koreadaily: "미주중앙일보", spotvnews: "스포티비뉴스", knewsla: "케이뉴스LA", tennis: "테니스코리아",
};
/** 짧은 이름(형 11-07 11:18 「디시인사이드 이런거 풀네임하지말고 > 디시 로 하면됨 에펨도 에펨」) — 서버가 한글 긴 이름으로 줘도 화면엔 이것 */
const SHORT: Record<string, string> = { 디시인사이드: "디시", 디씨인사이드: "디시", 에펨코리아: "에펨", 펨코: "에펨" };
/** 매체 이름이 글자째로 올 때(외신 영문 · 일어 · 중어) → 한글 이름 · 소문자 · 「&apos;」 풀어서 비교 */
const NAME: Record<string, string> = {
  "the hollywood reporter": "할리우드 리포터", "the new york times": "뉴욕타임스", "the guardian": "가디언", "the economist": "이코노미스트", "the times of india": "타임스 오브 인디아",
  "the hill": "더힐", "ap news": "AP통신", "reuters connect": "로이터", "yahoo sports": "야후 스포츠", "sports illustrated": "스포츠 일러스트레이티드", "cbs sports": "CBS스포츠", "nbc sports": "NBC스포츠",
  "orange county register": "오렌지카운티 레지스터", "people.com": "피플", "nba.com": "NBA", "news.com.au": "뉴스닷컴", "9to5google": "9to5구글", "inven global": "인벤 글로벌",
  "the players' tribune": "플레이어스 트리뷴", "the sporting tribune": "스포팅 트리뷴", "spotv news": "스포티비뉴스", "zdnet korea": "지디넷코리아", "mbcnews": "MBC뉴스", "playstation.blog": "플레이스테이션 블로그",
  "yahoo!ニュース": "야후 재팬", "ライブドアニュース": "라이브도어 뉴스", "ファミ通": "파미통", "日本経済新聞": "니혼게이자이신문", "朝日新聞": "아사히신문", "読売新聞": "요미우리신문", "毎日新聞": "마이니치신문",
  "産経新聞": "산케이신문", "千葉テレビ放送": "지바TV", "ｄメニューニュース": "d메뉴 뉴스", "高校サッカードットコム": "고교축구닷컴", "新华社": "신화통신", "新華社": "신화통신", "人民日报": "인민일보", "环球时报": "환구시보",
  "le monde": "르몽드", "le figaro": "르피가로", "sky news": "스카이뉴스", "sky tg24": "스카이 TG24", "il messaggero": "일 메사제로", "france 24": "프랑스24", "al jazeera": "알자지라", "bild": "빌트",
  "corriere adriatico": "코리에레 아드리아티코", centropagina: "센트로파지나", umatoku: "우마토쿠",
  "candidates(rss)": "RSS 후보", social_candidates: "커뮤 후보",
};
const unent = (s: string) => s.replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
export const outletName = (raw?: string) => {
  const s0 = unent(String(raw || "").trim()).replace(/^(?:tbs|editor):/i, "");   // tbs: · editor: = 우리 안쪽 접두어(화면엔 안 보임)
  if (!s0 || /[가-힣]/.test(s0)) return SHORT[s0] || s0;   // 비었거나 이미 한글 이름(긴 이름은 짧게)
  const low = s0.toLowerCase();
  if (NAME[low]) return NAME[low];   // 글자째 온 외신·일어·중어 이름
  const k = low.replace(/^https?:\/\//, "").replace(/^(?:www|m|mobile)\./, "").replace(/[/?#].*$/, "");
  if (OUTLET[k]) return OUTLET[k];
  const stem = k.replace(/\.(?:co\.kr|or\.kr|com\.au|co\.jp|co\.uk|com|net|kr|org|jp|tv|live|it|de|fr|cn|io|ai|app)$/, "");
  const hit = OUTLET[stem] || OUTLET[stem.split(".").pop() || ""];
  if (hit) return hit;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(k)) { const parts = stem.split("."); if (stem === k) parts.pop(); return parts.pop() || s0; }   // 표에 없는 외국 주소 = 「.com」 떼고 줄기만(형 13:22 사진 「HOLLYWOODREPORTER.COM」이 제목 자리를 먹던 것)
  return s0;
};
/** 매체 = 첫 매체 + 「외 N」 · 공식 이름으로(outletName) */
export const mediaOf = (m?: string) => { const xs = String(m || "").split(/[,·|]/).map((s) => s.trim()).filter(Boolean); return xs.length ? outletName(xs[0]).replace(/\s*\(.*?\)\s*/g, "").replace(/\s*등\s*$/, "") + (xs.length > 1 ? ` 외 ${xs.length - 1}` : "") : ""; };
/** 시각 = a.date(YYYY-MM-DD) + a.time(HH:MM) · 없으면 file(YYMMDD-HHMM)에서 */
export const whenOf = (a: Art) => {
  const d = String(a.date || "").trim(), t = String(a.time || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${+d.slice(5, 7)}/${+d.slice(8, 10)}${/^\d{1,2}:\d{2}$/.test(t) ? " " + t : ""}`;   // 「(추정)」 뺌(형 11-06 「추정 이런말들도 필요없으니 없애고」)
  const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || ""); return m ? `${+m[2]}/${+m[3]} ${m[4]}:${m[5]}` : "";
};
/** 분류 = 에디터 CAT_MAP 6칸(정치·사회·경제·국제·문화·테크) · 밖이면 원래 글자 */
const CAT: Record<string, [string, string]> = { 정치: ["정치", "pol"], 사회: ["사회", "soc"], 시사: ["사회", "soc"], 경제: ["경제", "eco"], 국제: ["국제", "intl"], 외교: ["국제", "intl"], 문화: ["문화", "cul"], 스포츠: ["문화", "cul"], 연예: ["문화", "cul"], 테크: ["테크", "tech"], 과학: ["테크", "tech"], IT: ["테크", "tech"], AI: ["테크", "tech"] };
export const catOf = (a: Art): [string, string] | null => { const c = String(a.cat || a.category || "").trim(); return c ? CAT[c] || [c, ""] : null; };   // cat = 빌드가 뷰어 articleCat 으로 구운 대분류(정본 = viewer/index.html CAT_RULES · 에디터 화면과 같은 셈 · 빠르 11-04) · 없으면 옛 category

/** 편향 = 에디터 biasLabel 카드 꼴(「중립 5」 · 보정 있으면 「좌 보정(4+1)」) · 색 칸 = 원문 방향 */
const biasNum = (s?: string) => { const m = /(\d+)\s*[/／]\s*10/.exec(s || ""); return m ? +m[1] : null; };
const zone = (v: number): [string, string] => { v = Math.min(10, Math.max(1, v)); return v <= 2 ? ["강좌", "l2"] : v <= 4 ? ["좌", "l1"] : v <= 6 ? ["중립", "mid"] : v <= 8 ? ["우", "r1"] : ["강우", "r2"]; };
export const biasOf = (a: Art): { text: string; cls: string } | null => {
  if (!a.bias) return null;
  const M = biasNum(a.bias);
  if (M == null || /무관|N\s*\/?\s*A/i.test(a.bias)) return { text: "무관", cls: "na" };
  const N = biasNum(a.bias_src), [zn, zc] = zone(N ?? M);
  if (N == null || N === M) return { text: `${zn} ${N ?? M}`, cls: zc };
  return { text: `${zn} 보정(${N}${M > N ? "+" : "−"}${Math.abs(M - N)})`, cls: zc };
};
/** 민감 = tags 「#성범죄 #마약」 · 「해당 없음」 = 없음 · 보호 일곱 = 경고색(에디터 SENS_PROTECT) */
const SENS_PROTECT = ["#성범죄", "#자살자해", "#아동피해", "#재난참사", "#추모", "#북·중외교", "#마약"];
export const sensOf = (a: Art) => (!a.tags || a.tags === "해당 없음" ? [] : a.tags.split(/\s+/).filter(Boolean).slice(0, 4).map((t) => ({ t, warn: SENS_PROTECT.includes(t) })));

/** 진행 = 요약·프롬프트·카드 세 칸(에디터 progGauge · cards.state) · 멈춤 = 렌더 10분 · 프롬프팅 26분 넘김 */
export const progOf = (a: Art) => {
  const c = a.cards || {}, st = c.state || "", age = c.updated ? (Date.now() - Date.parse(c.updated)) / 60000 : 0;
  let done = 1, busy = false, fail = false;
  if (st === "done") done = 3;
  else if (st === "fired_partial") { done = 2; if (age > 10) fail = true; else busy = true; }
  else if (st === "text_done") done = 2;
  else if (st === "generating") { if (age > 26) fail = true; else busy = true; }
  else if (st === "failed") { fail = true; if (c.has_md) done = 2; }
  return { done, busy, fail };
};

/** 저장 = 다른 출처(R2·매체 CDN) http(s)면 같은 출처 프록시 /api/dl(attachment) · 같은 출처는 그대로(에디터 dlSrc) */
export const dlHref = (u: string, name: string) => {
  try { const x = new URL(u, location.href); if (/^https?:$/.test(x.protocol) && x.origin !== location.origin) return `/api/dl?u=${encodeURIComponent(u)}&n=${encodeURIComponent(name)}`; } catch { /* 이상한 주소 = 그대로 */ }
  return u;
};
/** 파일 이름 = 기사 시각(yymmdd_hhmm) _ 이름 _ 번호 . 확장자(에디터 thumbDlName) */
const stamp = (file?: string) => { const m = /^(\d{6})-(\d{4})/.exec(file || ""); if (m) return `${m[1]}_${m[2]}`; const n = new Date(), p = (x: number) => String(x).padStart(2, "0"); return `${String(n.getFullYear()).slice(2)}${p(n.getMonth() + 1)}${p(n.getDate())}_${p(n.getHours())}${p(n.getMinutes())}`; };
const slug = (s?: string) => String(s ?? "").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").replace(/^[._]+|[._]+$/g, "").slice(0, 40) || "thumb";
export const dlName = (file: string | undefined, label: string, u: string, i: number) => `${stamp(file)}_${slug(label)}_${i + 1}.${((/\.(png|jpe?g|webp)(?:\?|$)/i.exec(u) || [])[1] || "png").toLowerCase().replace("jpeg", "jpg")}`;

/** 화풍 투표 = 에디터와 같은 열쇠 nm_thvote(같은 출처 = 같은 기기 기록 · 카드 투표 nomute_fb 와 다른 키) · 값 = { "<file>#<sid>": "up"|"down" } */
export type Vote = "up" | "down";
const THV = "nm_thvote";
const votes = (): Record<string, Vote> => { try { return JSON.parse(localStorage.getItem(THV) || "{}") || {}; } catch { return {}; } };
export const voteGet = (file: string, sid: string) => votes()[`${file}#${sid}`] || null;
export const voteSet = (file: string, sid: string, v: Vote | null) => { const m = votes(); if (v) m[`${file}#${sid}`] = v; else delete m[`${file}#${sid}`]; try { localStorage.setItem(THV, JSON.stringify(m)); } catch { /* 못 쓰면 이번만 */ } };
/** 보냄 = 에디터 thVoteSend 와 같은 몸(rate.yml 입력 칸 그대로 · reason = up|down|clear:<sid> → 러너가 thumb_votes.jsonl 로 가름) */
export const voteSend = (a: Art, sid: string, v: Vote | "") =>
  fetch("/api/rate", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: a.file, url: a.url || "", title: (a.title || "").slice(0, 300), action: "thumb", reason: `${v || "clear"}:${sid}` }) }).then((r) => r.ok, () => false);
