// 홈 뉴스 덱의 「보이는 후보」 = 에디터 scHomeCandidates() 와 같은 거름(PM 10-28 11:57 「형이 이미 넘긴 카드가 홈에 다시 뜨면 안 됨」) —
//   원본 = 에디터 viewer-src 34-checkFreshLane(srvTriage · ratingsAll · scDedup · scDedupPick · scTitleKey · scMoreDom · _normU · scMembers) ·
//   35-applyAutoGroups(scCandidatePool · scUntriaged · applyMerges · applyAutoGroups · JUNK_HEAD) 의 줄을 그대로 옮김(뜻·수치 같음).
//   거름 원천 = 서버 트리아지 장부 /triage-state.json(전 기기 PASS·👎·확인) + 이 기기 nm_ratings(같은 주소 = 에디터와 같은 칸) ·
//   손 병합 = 서버 /merges.json + 이 기기 nm_merges · 같은 기사 접기(제목 같고 12시간 안 · 누적끼리 제목 기사 같음) · 자동 묶음(group_id).
//   묶음·병합 앵커 꾸밈 = 에디터 mergeDecorate 중 덱이 읽는 칸만(멤버 주소 합침 cluster_members · 최신 형제 제목 _disp · cross 합산) · 지문 가점(fpScore)은 0 으로 봄 ·
//   PICK 상태(pickState)는 모름 = 넘긴 카드는 PICK 했어도 뺌 · 처리한 앵커(scTouched) = 서버·기기 트리아지(확인·👎)로만 셈.
export type PoolCand = {
  id?: string; url?: string; title?: string; published?: string; first_seen?: string; report_count?: number; cross?: number;
  cluster_members?: string[]; group_id?: string; breaking_pick?: { url?: string; media?: string; title?: string }; hp?: string; px?: number;
  breaking?: boolean; grade?: number | null; lv?: { t?: number }; media?: string; title_ko?: string; title_ko_of?: string; cat?: string; gossip?: boolean;
  _disp?: PoolCand; _follow?: string; _mergeCount?: number;
};
type Tri = { action?: string; passed?: boolean; dismissed?: boolean; acked?: boolean; score?: number };

const FOLLOW_RC_MIN = 6, FAST_MAX_H = 4, SC_DUP_WINDOW = 12 * 3600000, FOLLOW_GAP_H = 12, CROSS_MIN = 8, POOL_W = 0.5, FOLLOW_CROSS_MIN = 4;
const JUNK_HEAD = /^(?!.*(?:서킷브레이커|사이드카|폭락|급락|폭등|급등|역대급|패닉|상한가|하한가|돌파|최고치|최저치|폭염특보|한파경보|호우경보|태풍특보|주의보|온열질환|침수|범람|산사태|대피|이재민))(?:\s*(?:[\[\(](알림|공고|부고|부음|동정|인사|프로필|단신|사진|[A-Z]{0,2}포토|표|그래픽|증시|특징주|마감시황|개장시황|시황|프로야구|프로농구|프로배구|게시판)(?:\s[^\]\)]*)?[\]\)]|[\[\(][^\]\)]*(운세|날씨|데이터랩|증시|마켓뷰)[^\]\)]*[\]\)]|오늘의\s*(?:부고|운세|날씨|증시|주요뉴스))|.*원.?달러\s*환율.*마감)/;   // 머리표 잡음([알림]·[사진]·[부고] 등 = 뉴스 아님) — 35-applyAutoGroups 그대로
const _normU = (u?: string) => String(u || "").trim().replace(/\/+$/, "");   // build-viewer normUrl 과 동일(끝슬래시만)
const candId = (c: PoolCand) => c.id || c.url || c.title || "";
const scMembers = (c: PoolCand) => { const own = _normU(c.url); return (c.cluster_members || []).map(_normU).filter((u) => u === own || !!u); };
const scTs = (c: PoolCand) => {
  const p = Date.parse(c.published || ""), f = Date.parse(c.first_seen || "");
  if (!isNaN(p) && p <= Date.now() + 60000 && (isNaN(f) || p <= f + 60000 || (c.report_count || 0) >= FOLLOW_RC_MIN)) return p;
  if (!isNaN(f)) return f;
  return isNaN(p) ? 0 : p;
};
const scHpOk = (c: PoolCand) => !!c.hp && Date.parse(c.hp) <= Date.now() + 60000;
const scHt = (c: PoolCand) => (scHpOk(c) ? Date.parse(c.hp!) : scTs(c));
const effCross = (c: PoolCand) => (c.cross || 0) + POOL_W * (c.px || 0);
const isBreaking = (c: PoolCand) => !!c.breaking && (c.grade == null || c.grade >= 2 || (c.grade >= 1 && ((c.lv && c.lv.t) || 0) >= 3));
const followEnters = (c: PoolCand) => effCross(c) >= FOLLOW_CROSS_MIN && (c.report_count || 0) >= FOLLOW_RC_MIN;   // 지문 완화 길(fpScore ≥ 2) 은 0 으로 봄
/** 에디터 mergeDecorate(34-checkFreshLane) 중 덱이 읽는 칸 — follow = 12시간 넘게 새 제목 형제를 얼굴로(_disp) · 멤버 주소 합침 · cross 합산. */
function mergeDecorate(anchor: PoolCand, mem: PoolCand[], follow?: boolean): PoolCand {
  const aRep = _normU(anchor.url);
  let disp: PoolCand | null = null;
  if (follow) { const ak = scTitleKey(anchor); let t = scHt(anchor) + FOLLOW_GAP_H * 3600000 - 1;
    for (const m of mem) { const mt = scHt(m); if (scHpOk(m) && scTitleKey(m) !== ak && (mt > t || (disp && mt === t && candId(m) < candId(disp))) && (effCross(m) >= CROSS_MIN || isBreaking(m) || followEnters(m))) { disp = m; t = mt; } } }
  const dv = disp ? { title: disp.title, title_ko: disp.title_ko, title_ko_of: disp.title_ko_of, media: disp.media, cat: disp.cat, gossip: disp.gossip, breaking_pick: disp.breaking_pick || { url: disp.url, media: disp.media, title: disp.title }, _follow: candId(disp), _disp: disp } : {};
  const cm: string[] = [], seen = new Set([aRep]);
  for (const u of [...mem.map((m) => m.url), ...(anchor.cluster_members || []), ...mem.flatMap((m) => m.cluster_members || [])]) { const k = _normU(u); if (k && !seen.has(k)) { seen.add(k); cm.push(String(u)); } }
  return { ...anchor, ...dv, cross: (anchor.cross || 0) + mem.reduce((n, m) => n + (m.cross || 0), 0), cluster_members: cm, _mergeCount: mem.length };
}
const scTitleKey = (c: PoolCand) => (c.title || "").replace(/\s+/g, "").toLowerCase();
const scMoreDom = (a: PoolCand, b: PoolCand) => (a.cross || 0) !== (b.cross || 0) ? (a.cross || 0) > (b.cross || 0)
  : (a.report_count || 0) !== (b.report_count || 0) ? (a.report_count || 0) > (b.report_count || 0) : scTs(a) > scTs(b);
const scOldCol = (c: PoolCand) => Date.now() - scTs(c) >= FAST_MAX_H * 3600000;
const scHeadUrl = (c: PoolCand) => (c.breaking_pick && /^https?:\/\//i.test(c.breaking_pick.url || "") ? c.breaking_pick.url : c.url);
function scDedupPick(arr: PoolCand[]) {
  const seen = new Map<string, number>(), out: PoolCand[] = [];
  for (const c of arr) {
    const k = scTitleKey(c), u = _normU(scHeadUrl(c));
    if (!k || !u || !scOldCol(c)) { out.push(c); continue; }
    const key = k + "\n" + u, i = seen.get(key);
    if (i != null) { if (scMoreDom(c, out[i])) out[i] = c; continue; }
    seen.set(key, out.length); out.push(c);
  }
  return out;
}
function scDedup(arr: PoolCand[]) {
  const rep = new Map<string, { c: PoolCand; idx: number }>(), out: PoolCand[] = [];
  for (const c of arr) {
    const k = scTitleKey(c);
    if (!k) { out.push(c); continue; }
    const prev = rep.get(k);
    if (prev && Math.abs(scTs(c) - scTs(prev.c)) < SC_DUP_WINDOW) {
      if (scMoreDom(c, prev.c)) { out[prev.idx] = c; rep.set(k, { c, idx: prev.idx }); }
      continue;
    }
    rep.set(k, { c, idx: out.length }); out.push(c);
  }
  return scDedupPick(out);
}
const readLocal = <T,>(k: string, d: T): T => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v && typeof v === "object" ? (v as T) : d; } catch { return d; } };

/** 서버 트리아지(배열 {url, action?, dismissed?, acked?}) + 서버 병합({앵커: {members}}) + 이 기기 기록 → 홈에 보일 후보(에디터 scHomeCandidates 차례 그대로). */
export function homePool(cands: PoolCand[], triage: unknown, merges: unknown): PoolCand[] {
  const srv = new Map<string, Tri>();
  if (Array.isArray(triage)) for (const x of triage) if (x && typeof x === "object" && (x as { url?: string }).url) srv.set(_normU((x as { url: string }).url), x as Tri);
  const srvTriage = (c: PoolCand) => { for (const u of [_normU(c.url), ...scMembers(c)].filter(Boolean)) { const s = srv.get(u); if (s) return s; } return null; };
  const loc = readLocal<Record<string, Tri>>("nm_ratings", {});
  const rt: Record<string, Tri> = {};
  for (const c of cands) { const s = srvTriage(c), id = candId(c); if (s || loc[id]) rt[id] = { ...(s || {}), ...(loc[id] || {}) }; }   // 서버 아래 · 이 기기 위(에디터와 같은 겹침)
  const base = cands.filter((c) => { const r = rt[candId(c)] || {}; return !r.dismissed && !((r.score || 0) >= 1) && !JUNK_HEAD.test(c.title || ""); });
  let pool = scDedup(base);
  const M = { ...(merges && typeof merges === "object" && !Array.isArray(merges) ? (merges as Record<string, { members?: string[] }>) : {}), ...readLocal<Record<string, { members?: string[] }>>("nm_merges", {}) };
  const ids = new Set(pool.map(candId)), anchors = new Set(Object.keys(M).filter((a) => ids.has(a)));
  const member = new Set<string>();
  for (const a of anchors) for (const m of (Array.isArray(M[a] && M[a].members) ? M[a].members! : [])) if (m !== a && !anchors.has(m)) member.add(m);   // 멤버 = 앵커에 접힘(앵커 = 그대로)
  if (member.size) {
    const byId = new Map(cands.map((c) => [candId(c), c]));
    pool = pool.filter((c) => !member.has(candId(c))).map((c) => { const id = candId(c); if (!anchors.has(id)) return c;
      const mem = (M[id].members || []).filter((m) => m !== id && member.has(m)).map((m) => byId.get(m)).filter(Boolean) as PoolCand[];
      return mem.length ? mergeDecorate(c, mem) : c; });
  }
  const by = new Map<string, PoolCand[]>();
  for (const c of pool) if (c.group_id) by.set(c.group_id, [...(by.get(c.group_id) || []), c]);
  const drop = new Set<string>(), deco = new Map<string, PoolCand>();
  const touched = (c: PoolCand) => { const r = rt[candId(c)] || {}; return !!(r.acked || r.dismissed); };   // 에디터 scTouched(PICK 상태 모름)
  for (const [gid, cs] of by) {
    if (cs.length < 2) continue;
    const anchor = cs.find((c) => c.url === gid) || cs.slice().sort((a, b) => (b.cross || 0) - (a.cross || 0))[0];
    const mem = cs.filter((c) => c !== anchor);
    let d = mergeDecorate(anchor, mem, !anchor._mergeCount);
    if (d._follow && touched(anchor) && !touched(d._disp!)) d = mergeDecorate(anchor, mem);
    deco.set(candId(anchor), d);
    mem.forEach((c) => drop.add(candId(c)));
  }
  if (deco.size) pool = pool.map((c) => deco.get(candId(c)) || c).filter((c) => !drop.has(candId(c)));
  return pool.filter((c) => { const r = rt[candId(c)] || {}; return !((r.action && r.action !== "pick") || r.passed); });   // scUntriaged(PICK 상태 모름 = 넘긴 것은 뺌)
}
