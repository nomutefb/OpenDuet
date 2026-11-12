// Hot Issue 점수 = 뉴스 알고리즘 점수(서버 scraper/event_score.py 사건 묶음 score100 · GET /api/trends?f=event) —
//   형 11-09 12:3x 빠르 창 「핫 이슈에 지금 점수대로 속보가 안올라오는데, 점수대로 제대로 구현좀 되게 해주셈」 · 「점수가 , 그 뉴스 알고리즘이랑 연관이 되어잇는지도 좀 봐주고. 점수가 근본이없네 순위가」
//   앞 판: 줄 점수 = 커뮤 묶음(overlap) 점수만 · RSS 기사 줄 = 점수 0칸 · 차례 = 매체 수 순(rssFirst) → 화면 숫자와 차례가 따로 놂 · 뉴스 알고리즘 점수는 아예 안 읽음
//   이 판: 줄 주소(기사 · 묶음 기사 · 발행 주소)를 사건 묶음 열쇠(rss:<주소> · naver:<oid>:<aid> · natenews:<id>)로 맞춰 그 점수를 달고 · 점수 큰 것부터 · 못 맞춘 줄 = 끝(앞 차례 그대로) · 빠지는 줄 0
export type NewsEvent = { title?: string; s: number; why?: string; at?: string; brk?: boolean; keys: string[]; m?: string };   // m = 같은 사건 열쇠(event_merge merge_id · 서버 ?f=event)
export type EventHit = { id: string; s: number; why: string; brk: boolean };   // id = 같은 사건 열쇠(merge_id · 없으면 묶음 차례) — 쪼개진 묶음도 같은 사건이면 같은 id(평의회 11-09 「젠슨황 두 묶음」)

// 주소 꼴 맞추기 = 앞(https://www.) · 끝 / · # · 추적 꼬리(utm_* · fbclid 등)만 뗌 — 쿼리 통째로 떼면 「articleView.html?idxno=…」 꼴 기사들이 다 같은 주소로 뭉침
//   (형 11-09 14:0x 화면 = 다른 기사 9줄이 다 84점 · 빠르 실물: sisajournal articleView.html 하나로 17줄이 젠슨황 묶음에 붙음)
const TRACK = /^(?:utm_[a-z]+|fbclid|gclid|ref|from|sid|mid|section|cmpid|ocid|rssid|outlink)$/i;
const bare = (u: string) => {
  const t = u.trim().replace(/#.*$/, "");
  const q = t.indexOf("?");
  const head = (q < 0 ? t : t.slice(0, q)).replace(/^https?:\/\/(?:www\.|m\.)?/i, "").replace(/\/+$/, "");
  const keep = q < 0 ? [] : t.slice(q + 1).split("&").filter((kv) => kv && !TRACK.test(kv.split("=")[0]));
  return (head + (keep.length ? "?" + keep.sort().join("&") : "")).toLowerCase();
};

/** 순수 — 기사 주소 → 사건 묶음 열쇠들(네이버 = oid:aid · 네이트 = 기사 id · 그 밖 = rss:주소(쿼리 뗀 꼴도)) */
export function eventKeysOfUrl(u0?: string): string[] {
  const u = String(u0 || "").trim();
  if (!/^https?:\/\//i.test(u)) return [];
  const out: string[] = [];
  const nv = /naver\.com\/(?:mnews\/)?article\/(?:comment\/)?(\d{3})\/(\d{6,})/i.exec(u) || /naver\.com\/.*[?&]oid=(\d{3}).*[&?]aid=(\d{6,})/i.exec(u);
  if (nv) out.push(`naver:${nv[1]}:${nv[2]}`);
  const nt = /news\.nate\.com\/view\/(\d{8}n\d+)/i.exec(u);
  if (nt) out.push(`natenews:${nt[1]}`);
  const b = bare(u);
  out.push("rss:" + b);
  return [...new Set(out)];
}

/** 순수 — 사건 목록 → 열쇠 지도(같은 열쇠가 둘이면 점수 큰 쪽) */
export function eventIndex(events: NewsEvent[] | null | undefined): Map<string, EventHit> {
  const m = new Map<string, EventHit>();
  (Array.isArray(events) ? events : []).forEach((e, id) => {
    if (!e || !Number.isFinite(e.s) || !Array.isArray(e.keys)) return;
    const hit = { id: e.m ? "m:" + e.m : "#" + id, s: e.s, why: String(e.why || ""), brk: !!e.brk };
    for (const k0 of e.keys) {
      const k = typeof k0 === "string" && k0.startsWith("rss:") ? "rss:" + bare(k0.slice(4)) : String(k0 || "");
      const cur = m.get(k); if (!cur || cur.s < hit.s) m.set(k, hit);
    }
  });
  return m;
}

type RowLike = { urls?: string[]; items?: { url?: string }[]; meta?: { published?: { sourceUrl?: string } } };
/** 순수 — 줄 하나의 뉴스 알고리즘 점수(줄의 모든 주소 중 가장 높은 사건) · 못 맞추면 null */
export function eventOf(row: RowLike, idx: Map<string, EventHit>): EventHit | null {
  if (!row || !idx.size) return null;
  let best: EventHit | null = null;
  for (const u of [...(row.urls || []), row.meta?.published?.sourceUrl || "", ...(row.items || []).map((i) => i?.url || "")])
    for (const k of eventKeysOfUrl(u)) { const h = idx.get(k); if (h && (!best || h.s > best.s)) best = h; }
  return best;
}

/** 순수 — 점수 단 줄 = 점수 큰 것부터(같으면 앞 차례) · 같은 사건 = 한 줄만(맨 앞 줄 · 형 11-09 12:5x 「핫 이슈에 중복되는거는 하나씩만 나오게하고」) · 못 맞춘 줄 = 끝에 앞 차례 그대로 */
export function byEvent<T>(rows: T[], hitOf: (r: T) => EventHit | null): T[] {
  const scored: [T, EventHit, number][] = [], rest: T[] = [];
  rows.forEach((r, i) => { const h = hitOf(r); if (h) scored.push([r, h, i]); else rest.push(r); });
  scored.sort((a, b) => b[1].s - a[1].s || a[2] - b[2]);
  const seen = new Set<string>();
  return [...scored.filter(([, h]) => (seen.has(h.id) ? false : (seen.add(h.id), true))).map((x) => x[0]), ...rest];
}

/** 화면에 보일 점수 = 로그 눈금(봄 11-12 18:10 고름 · 빠르 식 · 형 12:36 「전쟁나면 그게 저거랑 동급일순없잖아」 「이 점수간의 간격도 어느정도 수학적이엿으면해서」)
 *  원점 = −60 × ln(1 − s/100)(서버 score100 을 되푼 값 · 빠르 12:38 봄 연구소) → 화면 = 15 × log2(원점 ÷ 1.8) · 0 ~ 100 자름 = 「15점 차이 = 2배 큰 이슈」
 *  앞 판 = min(100, s × 100 / scale)(지난 3일 상위 5% · 기준이 회차마다 움직여 같은 사건이 100 → 85 → 70 으로 흘러내림 · 빠르 18:08) · 줄 세우는 차례는 s 그대로(이 값은 보이는 데만) */
export const SCORE_LOG = { step: 15, floor: 1.8, raw: 60 };   // 숫자 한 곳(15 = 2배마다 오르는 점 · 1.8 = 0점 원점 · 60 = 서버 score100 되풀이)
export const shownScore = (s: number): number => {
  if (!Number.isFinite(s)) return s;
  if (s >= 100) return 100;
  const raw = -SCORE_LOG.raw * Math.log(1 - Math.max(0, s) / 100);
  if (!(raw > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round(SCORE_LOG.step * Math.log2(raw / SCORE_LOG.floor))));
};
