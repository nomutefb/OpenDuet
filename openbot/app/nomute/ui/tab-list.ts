// 위쪽 탭 줄 자료(순수 · 시험 tests/tab-list.test.ts) — 빠르 11-09 · 형 05:16 「위쪽에 탭 열리게 … 안에서 인터넷 가능하게」 · 시아 05:23 자리·차례
//   탭 = 「대시보드」(고정 · 늘 맨 앞 · × 없음) + 방 탭 + 화면 탭(몸 브레이브·VM 화면 · 명부 screen) · 기기마다 기억(localStorage nm-tabs-v1)
export type Tab = { k: "dash" } | { k: "room"; id: string } | { k: "screen"; who: string; url: string };
export type TabState = { tabs: Tab[]; active: string };
export const TABS_KEY = "nm-tabs-v1", TABS_MAX = 14, DASH: Tab = { k: "dash" };
export const tabKey = (t: Tab) => (t.k === "dash" ? "dash" : t.k === "room" ? "r:" + t.id : "s:" + t.who);
const ok = (t: unknown): t is Tab => {
  const x = t as Record<string, unknown>;
  if (!x || typeof x !== "object") return false;
  if (x.k === "room") return typeof x.id === "string" && !!x.id && x.id.length < 120;
  if (x.k === "screen") return typeof x.who === "string" && !!x.who && typeof x.url === "string" && /^https?:\/\//.test(x.url);
  return false;
};
/** 저장 글 → 판(깨지면 대시보드 하나) · 대시보드는 늘 맨 앞 하나 · 같은 탭 두 번 = 하나 · 화면 탭 순서는 방 탭 뒤 */
export function tabsLoad(raw: string | null | undefined): TabState {
  let j: { tabs?: unknown[]; active?: unknown } = {};
  try { j = raw ? JSON.parse(raw) : {}; } catch { j = {}; }
  const seen = new Set<string>(["dash"]), rest: Tab[] = [];
  for (const t of Array.isArray(j.tabs) ? j.tabs : []) if (ok(t) && !seen.has(tabKey(t))) { seen.add(tabKey(t)); rest.push(t); }
  const tabs = [DASH, ...order(rest)].slice(0, TABS_MAX);
  const active = typeof j.active === "string" && tabs.some((t) => tabKey(t) === j.active) ? j.active : "dash";
  return { tabs, active };
}
const order = (ts: Tab[]) => [...ts.filter((t) => t.k === "room"), ...ts.filter((t) => t.k === "screen")];
export const tabsSave = (s: TabState) => JSON.stringify(s);
/** 붙이기(이미 있으면 고르기만) · 넘치면 안 고른 가장 앞 방·화면 탭부터 뺌 · 방 탭은 방 탭 끝 · 화면 탭은 맨 끝 */
export function tabsAdd(s: TabState, t: Tab, activate = true): TabState {
  const key = tabKey(t);
  if (s.tabs.some((x) => tabKey(x) === key)) return activate ? { ...s, active: key } : s;
  let rest = s.tabs.filter((x) => x.k !== "dash");
  rest = t.k === "room" ? [...rest.filter((x) => x.k === "room"), t, ...rest.filter((x) => x.k === "screen")] : [...rest, t];
  while (rest.length + 1 > TABS_MAX) { const i = rest.findIndex((x) => tabKey(x) !== s.active && tabKey(x) !== key); if (i < 0) break; rest.splice(i, 1); }
  return { tabs: [DASH, ...rest], active: activate ? key : s.active };
}
/** 닫기 — 대시보드는 못 닫음 · 고른 탭을 닫으면 오른쪽 → 왼쪽 이웃(없으면 대시보드) */
export function tabsClose(s: TabState, key: string): TabState {
  if (key === "dash") return s;
  const i = s.tabs.findIndex((x) => tabKey(x) === key);
  if (i < 0) return s;
  const tabs = s.tabs.filter((_, j) => j !== i);
  const active = s.active !== key ? s.active : tabKey(tabs[i] || tabs[i - 1] || DASH);
  return { tabs, active };
}
/** 끌어서 순서 — 대시보드 자리(0)는 고정 · 방·화면 갈래를 넘어가지 않음 */
export function tabsMove(s: TabState, key: string, to: number): TabState {
  const i = s.tabs.findIndex((x) => tabKey(x) === key);
  if (i <= 0) return s;
  const t = s.tabs[i], same = s.tabs.map((x, j) => [x, j] as const).filter(([x]) => x.k === t.k).map(([, j]) => j);
  const lo = Math.min(...same), hi = Math.max(...same), at = Math.max(lo, Math.min(hi, to));
  if (at === i) return s;
  const tabs = [...s.tabs]; tabs.splice(i, 1); tabs.splice(at, 0, t);
  return { ...s, tabs };
}
