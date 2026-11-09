// 언론사 칸 이름 = 진짜 언론사만(빠르 11-09 15:2x) — 형 11-09 14:0x 「네이버 < 이거는 언론사가 아닌데 확인해봐야할듯 대체되게」
//   15:0x 형 화면 실물: 3위 「네이버」(틈 픽 n.news 654 = 표에 없는 번호) · 11위 「RSS 후보」(수집 길 이름 candidates(rss) 가 샘)
//   차례 = ① 서버·원천이 준 이름(길 이름 · 포털이면 버림) ② 네이버 기사 주소 언론사 번호 ③ 주소 이름(포털 주소는 건너뜀) ④ 묶음 안 다른 주소 ⑤ 빈 칸
//   이름 찾는 손(nameOf)은 밖에서 받음(= ui/news-data.ts outletName · 이 파일은 node --test 로 그대로 돎)

/** 네이버 뉴스 언론사 번호(n.news.naver.com/article/<번호>/…) · 11-09 더함 다섯 = 그 기사 og:article:author 실물(002 · 031 · 037 · 119 · 654) */
export const NAVER_OID: Record<string, string> = {
  "001": "연합뉴스", "002": "프레시안", "003": "뉴시스", "005": "국민일보", "008": "머니투데이", "009": "매일경제", "011": "서울경제", "014": "파이낸셜뉴스", "015": "한국경제", "016": "헤럴드경제",
  "018": "이데일리", "020": "동아일보", "021": "문화일보", "022": "세계일보", "023": "조선일보", "025": "중앙일보", "028": "한겨레", "031": "아이뉴스24", "032": "경향신문", "037": "주간동아",
  "052": "YTN", "055": "SBS", "056": "KBS", "057": "MBN", "079": "노컷뉴스", "081": "서울신문", "119": "데일리안", "214": "MBC", "215": "한국경제TV", "277": "아시아경제", "366": "조선비즈",
  "421": "뉴스1", "422": "연합뉴스TV", "437": "JTBC", "448": "TV조선", "449": "채널A", "469": "한국일보", "654": "강원도민일보",
};

/** 언론사가 아닌 이름 = 포털 · 우리 수집 길 이름(화면에 내면 안 됨) */
export const notOutlet = (n?: string) => /^(?:네이버|네이트|다음|구글|RSS 후보|커뮤 후보|candidates|social_candidates|x_top10|gtrends)/i.test(String(n || "").trim());

const PORTAL_HOST = /(?:^|\.)(?:naver\.com|nate\.com|daum\.net|google\.com)$/i;
export const hostOf = (u?: string) => { try { return u ? new URL(u).hostname.replace(/^(?:www|m|n|core)\./, "").toLowerCase() : ""; } catch { return ""; } };
export const naverOutlet = (u?: string) => { const m = /^https?:\/\/(?:n\.|m\.)?news\.naver\.com\/(?:mnews\/)?article\/(?:comment\/)?(\d{3})\//.exec(String(u || "")); return m ? NAVER_OID[m[1]] || "" : ""; };

/** 주소 하나 → 언론사 이름(네이버 번호 → 주소 이름 · 포털 주소 · 길 이름 = 빈 칸) */
export const outletOfUrl = (u: string | undefined, nameOf: (host: string) => string) => {
  const nv = naverOutlet(u); if (nv) return nv;
  const h = hostOf(u); if (!h || PORTAL_HOST.test(h)) return "";
  const n = String(nameOf(h) || "").trim();
  return n && !notOutlet(n) ? n : "";
};

/** 받은 이름(named) → 주소들 차례로 → 빈 칸 · named 가 포털·길 이름이면 버림 */
export const outletOf = (named: string | undefined, urls: (string | undefined)[], nameOf: (host: string) => string) => {
  const n = String(named || "").trim();
  if (n && !notOutlet(n)) return n;
  for (const u of urls) { const o = outletOfUrl(u, nameOf); if (o) return o; }
  return "";
};
