// 홈 「Hot Issue」 자리에서 번갈아 뜨는 키워드 순위판 계산 줄(화면 = ./kw-board.tsx · 시험 = tests/kw-board.test.ts)
//   형 11-14 클라우드 세션 창 「메인에 hot issue에 … sns 키워드들 수집되는거, 그거 핵심 top … 3분할해서 한 7위까지만」 · 「x급상승도 들어가게해놔 총 4개로」
//   「예전거 보면 중복되는 키워드는 표기해슨ㄴ데 라임색으로 그대로 표기할게」 · 「핫이슈 나오다가 10초뒤에 그거 나오고 … 1분정도 내비쳣다가 다시 전환되고 1분마다 바뀌면되겟다」
//   재료 = 이미 30분마다 모이는 것: /api/trends(sns_trends.json · gtrends · signal · namu) + /api/trends?f=xtop(촉 X 급상승 · data/x_top10/latest.json)
//   겹침 = 옛 에디터 「교차합의」(viewer/index.html _cnNorm · _cnCls)와 같은 잣대(띄어쓰기 · 대소문자 무시) + 긴 말이 짧은 말(3자 넘게)을 품으면 같은 말(「박재현」 ↔ 「박재현 홈런」)

export const KW_N = 7;
export const KW_FIRST_MS = 10_000, KW_EVERY_MS = 60_000;   // 처음 10초 = Hot Issue · 그 뒤 1분마다 번갈아
export const KW_STALE_MIN = 180;   // 이보다 낡은 줄기 = 흐리게 · 겹침 셈에서 뺌(옛 나무위키 잣대 180분)

export type KwId = "gt" | "sig" | "namu" | "x";
export type KwItem = { q: string; sub: string; fresh: boolean; href: string; keys: string[] };
export type KwCol = { id: KwId; name: string; items: KwItem[]; stale: boolean; at: string };

type GT = { query?: string; traffic?: string | number; isNew?: boolean };
type SG = { query?: string; isNew?: boolean };
type NM = { query?: string; rank?: number };
type XT = { keyword?: string; rank?: number; why_ko?: string; aliases?: string[] };
export type TrendsIn = { updated?: string; gtrends?: GT[]; signal?: SG[]; namu?: NM[]; namu_updated?: string } | null | undefined;
export type XtopIn = { generated_at?: string; items?: XT[] } | null | undefined;

/** 견줄 열쇠 — 소문자 · 해시(#) · 밑줄 · 띄어쓰기 뺌 */
export const kwNorm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[#_]/g, "").replace(/\s+/g, "");
/** 같은 말인가 — 똑같거나, 긴 말이 3자 넘는 짧은 말을 품음(두 글자는 똑같을 때만 = 「이재」 ↔ 「이재명」 같은 헛짚기 막기) */
export function kwSame(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  return s.length >= 3 && l.includes(s);
}
/** 번갈아 뜨는 차례 — 연 지 ms 뒤에 보일 판 */
export const kwPhase = (ms: number): "hot" | "kw" => (ms < KW_FIRST_MS ? "hot" : Math.floor((ms - KW_FIRST_MS) / KW_EVERY_MS) % 2 === 0 ? "kw" : "hot");
/** X 급상승 까닭 글 → 짧은 표(「8계단 상승」 = ▲8 · 「4계단 하락」 = ▼4 · 「새로 진입」 = NEW) */
export function xMove(why: unknown): string {
  const t = String(why ?? "");
  const m = t.match(/(\d+)\s*계단\s*(상승|하락)/);
  if (m) return (m[2] === "상승" ? "▲" : "▼") + m[1];
  return /새로\s*진입/.test(t) ? "NEW" : "";
}
const ageMin = (iso: unknown, now: number) => { const t = Date.parse(String(iso || "")); return Number.isFinite(t) ? (now - t) / 60000 : Infinity; };
const enc = encodeURIComponent;

/** 네 줄기(구글 트렌드 · 시그널 · 나무위키 · X 급상승) — 줄기마다 7위까지 · 빈 말 뺌 */
export function kwCols(tr: TrendsIn, xt: XtopIn, now: number): KwCol[] {
  const cut = <T,>(arr: T[] | undefined, q: (x: T) => string, mk: (x: T, q: string) => KwItem) => (arr || []).map((x) => [x, String(q(x) || "").trim()] as const).filter(([, s]) => !!s).slice(0, KW_N).map(([x, s]) => mk(x, s));
  const at = String(tr?.updated || ""), trStale = ageMin(at, now) > KW_STALE_MIN;
  const nmAt = String(tr?.namu_updated || at), xAt = String(xt?.generated_at || "");
  return [
    { id: "gt", name: "구글 트렌드", at, stale: trStale, items: cut(tr?.gtrends, (g) => g.query || "", (g, q) => ({ q, sub: g.traffic != null && g.traffic !== "" ? String(g.traffic) : "", fresh: !!g.isNew, href: `https://www.google.com/search?q=${enc(q)}`, keys: [kwNorm(q)] })) },
    { id: "sig", name: "시그널", at, stale: trStale, items: cut(tr?.signal, (g) => g.query || "", (g, q) => ({ q, sub: "", fresh: !!g.isNew, href: `https://search.naver.com/search.naver?query=${enc(q)}`, keys: [kwNorm(q)] })) },
    { id: "namu", name: "나무위키", at: nmAt, stale: ageMin(nmAt, now) > KW_STALE_MIN, items: cut(tr?.namu, (g) => g.query || "", (_g, q) => ({ q, sub: "", fresh: false, href: `https://namu.wiki/Search?q=${enc(q)}`, keys: [kwNorm(q)] })) },
    { id: "x", name: "X 급상승", at: xAt, stale: ageMin(xAt, now) > KW_STALE_MIN, items: cut([...(xt?.items || [])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)), (g) => g.keyword || "", (g, q) => { const mv = xMove(g.why_ko); return { q: q.replace(/[#_]/g, " ").replace(/\s+/g, " ").trim(), sub: mv === "NEW" ? "" : mv, fresh: mv === "NEW", href: `https://x.com/search?q=${enc(q)}`, keys: [...new Set([q, ...(g.aliases || [])].map(kwNorm).filter(Boolean))] }; }) },
  ];
}

/** 「NEW」 표 = 그 줄기에서 새 말이 절반 밑일 때만(다 새 말이면 표가 뜻이 없음 — 구글 트렌드는 회차마다 거의 다 새 말) */
export const kwShowNew = (c: KwCol) => { const n = c.items.filter((x) => x.fresh).length; return n > 0 && n * 2 < c.items.length; };

/** 겹침 수 — 그 말이 몇 줄기에 떴나(제 줄기 포함 · 낡은 줄기는 안 셈 · 낡은 줄기의 말은 0) · 열쇠 = 「줄기:차례」 */
export function kwHits(cols: KwCol[]): Map<string, number> {
  const out = new Map<string, number>();
  const live = cols.filter((c) => !c.stale);
  for (const c of cols) c.items.forEach((it, i) => {
    if (c.stale) { out.set(`${c.id}:${i}`, 0); return; }
    let n = 1;
    for (const o of live) if (o.id !== c.id && o.items.some((x) => x.keys.some((a) => it.keys.some((b) => kwSame(a, b))))) n++;
    out.set(`${c.id}:${i}`, n);
  });
  return out;
}
