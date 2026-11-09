// Hot Issue 점수 = 뉴스 알고리즘 점수(서버 scraper/event_score.py 사건 묶음 score100 · GET /api/trends?f=event) —
//   형 11-09 12:3x 빠르 창 「핫 이슈에 지금 점수대로 속보가 안올라오는데, 점수대로 제대로 구현좀 되게 해주셈」 · 「점수가 , 그 뉴스 알고리즘이랑 연관이 되어잇는지도 좀 봐주고. 점수가 근본이없네 순위가」
//   앞 판: 줄 점수 = 커뮤 묶음(overlap) 점수만 · RSS 기사 줄 = 점수 0칸 · 차례 = 매체 수 순(rssFirst) → 화면 숫자와 차례가 따로 놂 · 뉴스 알고리즘 점수는 아예 안 읽음
//   이 판: 줄 주소(기사 · 묶음 기사 · 발행 주소)를 사건 묶음 열쇠(rss:<주소> · naver:<oid>:<aid> · natenews:<id>)로 맞춰 그 점수를 달고 · 점수 큰 것부터 · 못 맞춘 줄 = 끝(앞 차례 그대로) · 빠지는 줄 0
export type NewsEvent = { title?: string; s: number; why?: string; at?: string; brk?: boolean; keys: string[] };
export type EventHit = { s: number; why: string; brk: boolean };

const bare = (u: string) => u.trim().replace(/^https?:\/\/(?:www\.|m\.)?/i, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();

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
  out.push("rss:" + b, "rss:" + b.replace(/\?.*$/, ""));
  return [...new Set(out)];
}

/** 순수 — 사건 목록 → 열쇠 지도(같은 열쇠가 둘이면 점수 큰 쪽) */
export function eventIndex(events: NewsEvent[] | null | undefined): Map<string, EventHit> {
  const m = new Map<string, EventHit>();
  for (const e of Array.isArray(events) ? events : []) {
    if (!e || !Number.isFinite(e.s) || !Array.isArray(e.keys)) continue;
    const hit = { s: e.s, why: String(e.why || ""), brk: !!e.brk };
    for (const k0 of e.keys) {
      const k = typeof k0 === "string" && k0.startsWith("rss:") ? "rss:" + bare(k0.slice(4)) : String(k0 || "");
      for (const kk of k.startsWith("rss:") ? [k, k.replace(/\?.*$/, "")] : [k]) { const cur = m.get(kk); if (!cur || cur.s < hit.s) m.set(kk, hit); }
    }
  }
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

/** 순수 — 점수 단 줄 = 점수 큰 것부터(같으면 앞 차례) · 못 맞춘 줄 = 끝에 앞 차례 그대로 · 빠지는 줄 0 */
export function byEvent<T>(rows: T[], hitOf: (r: T) => EventHit | null): T[] {
  const scored: [T, number, number][] = [], rest: T[] = [];
  rows.forEach((r, i) => { const h = hitOf(r); if (h) scored.push([r, h.s, i]); else rest.push(r); });
  scored.sort((a, b) => b[1] - a[1] || a[2] - b[2]);
  return [...scored.map((x) => x[0]), ...rest];
}
