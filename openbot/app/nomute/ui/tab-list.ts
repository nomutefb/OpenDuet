// 위쪽 탭 줄 자료(순수 · 시험 tests/tab-list.test.ts) — 빠르 11-09 · 형 05:16 「위쪽에 탭 열리게 … 안에서 인터넷 가능하게」 · 시아 05:23 자리·차례
//   탭 = 「대시보드」(고정 · 늘 맨 앞 · × 없음) + 방 탭 + 화면 탭(몸 브레이브·VM 화면 · 명부 screen) · 기기마다 기억(localStorage nm-tabs-v1)
export type Tab = { k: "dash" } | { k: "room"; id: string } | { k: "screen"; who: string; url: string } | { k: "web"; id: string; url: string };   // web = 「+」 빈 탭 · 주소 넣으면 그 탭 안(빠르 11-11 · 형 22:10 「+ 누르면 … 인앱안에서 그냥 빈 화면 페이지가 나와서」 · 「좌상단은 탭처럼」)
export type TabState = { tabs: Tab[]; active: string };
export const TABS_KEY = "nm-tabs-v1", TABS_MAX = 14, DASH: Tab = { k: "dash" };
export const tabKey = (t: Tab) => (t.k === "dash" ? "dash" : t.k === "room" ? "r:" + t.id : t.k === "web" ? "w:" + t.id : "s:" + t.who);
const ok = (t: unknown): t is Tab => {
  const x = t as Record<string, unknown>;
  if (!x || typeof x !== "object") return false;
  if (x.k === "room") return typeof x.id === "string" && !!x.id && x.id.length < 120;
  if (x.k === "screen") return typeof x.who === "string" && !!x.who && typeof x.url === "string" && /^https?:\/\//.test(x.url);
  if (x.k === "web") return typeof x.id === "string" && /^[a-z0-9]{1,24}$/.test(x.id) && typeof x.url === "string" && (x.url === "" || /^https?:\/\//.test(x.url) || x.url.startsWith("/"));
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
const order = (ts: Tab[]) => [...ts.filter((t) => t.k === "room"), ...ts.filter((t) => t.k !== "room")];   // 방 → 웹 갈래(화면 · 웹 탭 = 연 차례 그대로)
const lane = (t: Tab) => (t.k === "room" ? "room" : t.k === "dash" ? "dash" : "web");   // 끌기 갈래 = 방 / 웹(화면 · 웹 탭 섞어 옮김)
export const tabsSave = (s: TabState) => JSON.stringify(s);
/** 붙이기(이미 있으면 고르기만) · 넘치면 안 고른 가장 앞 방·화면 탭부터 뺌 · 방 탭은 방 탭 끝 · 화면 탭은 맨 끝 */
export function tabsAdd(s: TabState, t: Tab, activate = true): TabState {
  const key = tabKey(t);
  if (s.tabs.some((x) => tabKey(x) === key)) return activate ? { ...s, active: key } : s;
  let rest = s.tabs.filter((x) => x.k !== "dash");
  rest = t.k === "room" ? [...rest.filter((x) => x.k === "room"), t, ...rest.filter((x) => x.k !== "room")] : [...rest, t];
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
  const t = s.tabs[i], same = s.tabs.map((x, j) => [x, j] as const).filter(([x]) => lane(x) === lane(t)).map(([, j]) => j);
  const lo = Math.min(...same), hi = Math.max(...same), at = Math.max(lo, Math.min(hi, to));
  if (at === i) return s;
  const tabs = [...s.tabs]; tabs.splice(i, 1); tabs.splice(at, 0, t);
  return { ...s, tabs };
}
/** 웹 탭 새로(「+」) — id = 시각 36진 · 빈 주소 */
export const webTabNew = (now = Date.now()): Tab => ({ k: "web", id: now.toString(36), url: "" });
/** 웹 탭 주소 바꿈(그 탭 안에서 이동 · 다시 켜도 그 주소) · 다른 탭 = 그대로 */
export function tabsSetUrl(s: TabState, key: string, url: string): TabState {
  let hit = false;
  const tabs = s.tabs.map((t) => (t.k === "web" && tabKey(t) === key && t.url !== url ? ((hit = true), { ...t, url }) : t));
  return hit ? { ...s, tabs } : s;
}
/** 탭 이름 — 웹 탭 = 주소 호스트(www. 뺌) · 빈 탭 = 「새 탭」 */
export function webTabName(url: string): string {
  if (!url) return "새 탭";
  try { const u = new URL(url, "https://edit.nomute.kr"); return u.hostname.replace(/^www\./, "") || "새 탭"; } catch { return "새 탭"; }
}
/** 순수 — 판 바탕색 글(rgb/rgba) → 고른 탭 바탕·글자색 · 투명·못 읽음 = 테마 따라(다크 #121314/#e8eae8 · 라이트 #f6f6f8/#161716) · 밝기(상대 휘도) .45 밑 = 어두움 */
export function tabColors(css: string, dark: boolean): { bg: string; fg: string } {
  const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(String(css || ""));
  if (!m || (m[4] !== undefined && +m[4] < 0.5)) return dark ? { bg: "#121314", fg: "#e8eae8" } : { bg: "#f6f6f8", fg: "#161716" };
  const [r, g, b] = [+m[1], +m[2], +m[3]].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { bg: `rgb(${m[1]}, ${m[2]}, ${m[3]})`, fg: lum < 0.45 ? "#e8eae8" : "#161716" };
}
