// 위쪽 탭 줄 자료(순수 · 시험 tests/tab-list.test.ts) — 빠르 11-09 · 형 05:16 「위쪽에 탭 열리게 … 안에서 인터넷 가능하게」 · 시아 05:23 자리·차례
//   탭 = 「대시보드」(고정 · 늘 맨 앞 · × 없음) + 방 탭 + 화면 탭(몸 브레이브·VM 화면 · 명부 screen) · 기기마다 기억(localStorage nm-tabs-v1)
export type Tab = { k: "dash" } | { k: "room"; id: string } | { k: "screen"; who: string; url: string } | { k: "web"; id: string; url: string } | { k: "co" };   // co = 같이 보기(맥 72 다리 · 하나만 · 뜸 11-12)   // web = 「+」 빈 탭 · 주소 넣으면 그 탭 안(빠르 11-11 · 형 22:10 「+ 누르면 … 인앱안에서 그냥 빈 화면 페이지가 나와서」 · 「좌상단은 탭처럼」)
export type TabState = { tabs: Tab[]; active: string };
export const TABS_KEY = "nm-tabs-v1", TABS_MAX = 14, DASH: Tab = { k: "dash" };
export const tabKey = (t: Tab) => (t.k === "dash" ? "dash" : t.k === "co" ? "co" : t.k === "room" ? "r:" + t.id : t.k === "web" ? "w:" + t.id : "s:" + t.who);
const ok = (t: unknown): t is Tab => {
  const x = t as Record<string, unknown>;
  if (!x || typeof x !== "object") return false;
  if (x.k === "co") return true;
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
/** 탭 줄 차례(구름 11-17 · 형 09:2x 「그 상단에 탭, 끌어서 쓰면 순서를 전환할 수 있게 해줘」) — 고정 넷(봄의 정원 · 브라우저 · 화상 회의 · 팀즈)도 끌어 옮김 · 차례 = 키 줄(이 기기 · nm-tab-order-v1) */
export const ORDER_KEY = "nm-tab-order-v1", STRIP_FIXED: readonly string[] = ["dash", "co", "meet", "teams"];
/** 저장된 차례 → 지금 줄 — 없어진 탭은 빠짐 · 같은 키 두 번 = 하나 · 새 고정 탭 = 제 기본 앞 탭 바로 뒤(없으면 맨 앞) · 새 탭(「+」 · 몸 화면) = 맨 끝 · 깨진 값 = 기본 차례 */
export function stripOrder(saved: unknown, fixed: readonly string[], dyn: readonly string[]): string[] {
  const have = new Set<string>([...fixed, ...dyn]), out: string[] = [];
  for (const k of Array.isArray(saved) ? saved : []) if (typeof k === "string" && have.has(k) && !out.includes(k)) out.push(k);
  fixed.forEach((k, i) => {
    if (out.includes(k)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) { const p = out.indexOf(fixed[j]); if (p >= 0) { at = p + 1; break; } }
    out.splice(at, 0, k);
  });
  for (const k of dyn) if (!out.includes(k)) out.push(k);
  return out;
}
/** 끌어 옮김 — key 를 to 번째 자리로(밖이면 끝으로 맞춤) · 없는 키 · 같은 자리 = 그대로(같은 배열) */
export function stripMove(order: string[], key: string, to: number): string[] {
  const i = order.indexOf(key), at = Math.max(0, Math.min(order.length - 1, Math.round(to)));
  if (i < 0 || at === i) return order;
  const out = [...order]; out.splice(i, 1); out.splice(at, 0, key);
  return out;
}
/** 끄는 탭이 갈 자리 — 끄는 탭의 가운데(mid)가 옆 탭 가운데를 넘으면 그 자리 · boxes = 줄에 그려진 차례 그대로 [왼쪽, 폭] · me = 끄는 탭 */
export function dropIndex(boxes: readonly (readonly [number, number])[], me: number, mid: number): number {
  let to = boxes.length - 1;
  for (let i = 0; i < boxes.length; i++) { if (i === me) continue; if (mid < boxes[i][0] + boxes[i][1] / 2) { to = i > me ? i - 1 : i; break; } }
  return me >= 0 && me < boxes.length ? Math.max(0, to) : me;
}
/** 웹 탭 새로(「+」) — id = 시각 36진 · 빈 주소 */
export const webTabNew = (now = Date.now()): Tab => ({ k: "web", id: now.toString(36), url: "" });
/** 바깥 주소를 위 탭 줄의 웹 탭으로(구름 11-17 · 형 13:0x 구름 창 「앱 내에서 웹페이지를 열면, 앱 내에서 열리도록 해줘」 · 「내부에서 무조건 열려야해. 창 내부 탭(브라우저)」)
 *  들머리 = ./inapp.ts openInApp → 이 이름의 창 신호 → ./tab-bar.tsx 가 듣고 탭을 붙임 · 같은 주소 탭이 이미 있으면 그 탭을 고름(누를 때마다 쌓이지 않게) */
export const WEB_TAB_EVENT = "nm-web-tab";
export function webTabOpen(s: TabState, url: string, now = Date.now()): TabState {
  if (!/^https?:\/\//.test(url)) return s;
  const had = s.tabs.find((t) => t.k === "web" && t.url === url);
  if (had) return s.active === tabKey(had) ? s : { ...s, active: tabKey(had) };
  let n = now, id = n.toString(36);
  while (s.tabs.some((t) => t.k === "web" && t.id === id)) id = (++n).toString(36);
  return tabsAdd(s, { k: "web", id, url });
}
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
