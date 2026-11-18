// 알림에서 수집함으로 온 것(형 11-19 08:3x 「응 1합쳐」 = 에디터 알림을 정원 앱 알림으로) — 화면 없는 셈만(시험 tests/scrap-push.test.ts)
//   옛 에디터 viewer/index.html findPushCand · pickFromPush 의 사유 고르기 그대로 · 화면 쪽 = ./scrap.tsx · 맡아 두는 쪽 = ../sw.js(nm-pickreq)
export type PushCand = { url?: string; event_key?: string; breaking_pick?: { url?: string } };
export type PickReq = { brk: string; bl?: string; kind?: string; ts?: number };

/** 알림 열쇠 → 후보 한 건. 주소가 꼭 하나 맞는 것 먼저 → 사건 열쇠 → 여럿이면 대표 원문(bl)으로 좁힘 → 그래도 여럿 = "ambig"(엉뚱한 기사에 돈 드는 요약을 걸지 않게) · 없음 = null */
export function findPushCand<T extends PushCand>(cands: T[], key: string, bl: string, norm: (u: string) => string, link: (c: T) => string): T | "ambig" | null {
  const nk = norm(key);
  const byUrl = cands.filter((x) => x && (x.url === key || (!!x.url && norm(x.url) === nk)));
  const pool = byUrl.length ? byUrl : cands.filter((x) => x && (x.event_key === key || (!!x.event_key && norm(x.event_key) === nk)));
  if (pool.length === 1) return pool[0];
  if (pool.length > 1 && bl) { const b = pool.filter((x) => link(x) === bl || (x.breaking_pick && x.breaking_pick.url === bl)); if (b.length === 1) return b[0]; }
  return pool.length ? "ambig" : null;
}
/** 주소 # 뒤 꼬리표(#/legacy?brk=…&bl=…) — bl 은 http(s) 만(javascript: · data: 막음) */
export function brkOfHash(hash: string): { key: string; bl: string } | null {
  const i = hash.indexOf("?"); if (i < 0) return null;
  const q = new URLSearchParams(hash.slice(i + 1)), key = q.get("brk") || "", bl = q.get("bl") || "";
  return key ? { key, bl: /^https?:\/\//i.test(bl) ? bl : "" } : null;
}
/** PICK 사유 = 알림 종류(긴급 = 속보/사건 · 이슈 = 토픽/논란 · 급상승 = 대세픽) — 수집함 PICK 사유 표(TRIAGE)의 낱말 그대로 */
export const pickReasonOf = (kind?: string): string => (kind === "iss" ? "토픽/논란" : kind === "trend" ? "대세픽" : "속보/사건");
