// 웹 칸 다리 — 껍데기 앱(맥 「봄의 정원.app」 · 윈도우 GardenShell)의 진짜 웹뷰를 웹 탭 내용 자리에 겹쳐 띄움
//   (형 11-21 「웹엡에서 인스타 웹뷰붙여서 열기로 했는데 안되더라 되게해줘 마무리까지」 「거기사 인터넷도 다 열리게 하고싶음 뉴스등 클릭하면」 「쿠키가 저장되고 일정 로컬 공간 또는 일정 클라우드 저장소 쿠키쓸수잇으면 제일 베스트임」)
//   끼움(iframe)은 사이트가 막으면 못 엶(뉴스 · 네이버 · 인스타 · 깃허브 …) · 진짜 웹뷰 = 다 열리고 로그인 쿠키가 그 앱 저장소 한 곳에 남음(SNS 칸 ./sns-side.ts 와 같은 길을 웹 탭으로 넓힘)
//   웹 → 껍데기: { t:"nm-web", id, on:true, url, rect, vw, vh, holes } 자리 · { t:"nm-web", id, on:false } 숨김 · { t:"nm-web-go", id, url } 그 주소로
//                { t:"nm-web-cmd", id, cmd, url? }(back · fwd · reload · stop · focus · close · out) · { t:"nm-web-hello" | "nm-web-bye" } 탭 줄이 이 다리를 씀/안 씀
//     맥 = window.webkit.messageHandlers.nmWeb.postMessage(o)(처리기가 있으면 = 됨) · 윈도우(WebView2) = window.chrome.webview.postMessage(o)(window.__nmWeb 가 있을 때만)
//   껍데기 → 웹: 창 이벤트 「nm-web」 detail { id, url, title, loading, back, fwd } 상태 · { id, state:"error", why } · { state:"open", id, url } 칸 안 새 창 = 웹 탭 하나 더
//                { id, state:"closed" } 그 창이 스스로 닫힘 · { state:"key", key:"t"|"w"|"l" } 앱 단축키(새 탭 · 탭 닫기 · 주소칸)
//   구멍(holes) = 이 칸 위로 떠야 하는 우리 화면 조각(메뉴 판 · 알림 · 창)의 자리 — 진짜 웹뷰는 웹 화면 위에 겹쳐 그려져서 안 뚫으면 그 조각이 가려짐 · 껍데기가 그 자리만 그림 · 누름을 아래로 뚫음
//   veil = 화면만 한 안 보이는 겹이 누름을 받는 중(바깥을 누르면 닫히는 창) → 웹뷰는 보이는 채 누름만 통째로 아래 우리 화면으로
//   가만히 둔 화면 = 0(자리 · 구멍은 화면이 바뀔 때만 다시 잼 · 묻는 간격 없음) · 순수 부분 시험 = tests/native-web.test.ts

export type Box = { x: number; y: number; w: number; h: number; r?: number };
export type Spot = { rect: Box; vw: number; vh: number; holes: Box[]; veil?: boolean };   // veil = 누름은 통째로 아래 우리 화면이 받음(웹뷰는 보이는 채)
export type WebCmd = "back" | "fwd" | "reload" | "stop" | "focus" | "close" | "out";
export type WebMsg =
  | ({ t: "nm-web"; id: string; on: true; url: string } & Spot)
  | { t: "nm-web"; id: string; on: false }
  | { t: "nm-web-go"; id: string; url: string }
  | { t: "nm-web-cmd"; id: string; cmd: WebCmd; url?: string }
  | { t: "nm-web-hello" } | { t: "nm-web-bye" };
export type WebEvt = { id?: string; url?: string; title?: string; loading?: boolean; back?: boolean; fwd?: boolean; state?: "error" | "open" | "closed" | "key"; why?: string; key?: string };
export const WEB_EVENT = "nm-web";

type W = { webkit?: { messageHandlers?: { nmWeb?: { postMessage: (o: unknown) => void } } }; chrome?: { webview?: { postMessage: (o: unknown) => void } }; __nmWeb?: unknown };
/** 껍데기 다리(맥 · 윈도우) — 없으면 null(그냥 브라우저 · 폰 · 옛 판 앱 = 끼움 그대로) */
export function webBridge(w: unknown = typeof window !== "undefined" ? window : undefined): ((o: WebMsg) => void) | null {
  const x = w as W | undefined;
  const mac = x?.webkit?.messageHandlers?.nmWeb;
  if (mac) return (o) => mac.postMessage(o);
  const win = x?.chrome?.webview;
  if (win && x?.__nmWeb) return (o) => win.postMessage(o);
  return null;
}
let cached: ((o: WebMsg) => void) | null | undefined;
/** 이 창의 다리(한 번만 찾음) */
export const nativeWeb = (): ((o: WebMsg) => void) | null => (cached === undefined ? (cached = webBridge()) : cached);

const adopted = new Set<string>();   // 껍데기가 먼저 만든 칸(칸 안 새 창 = 주소가 아직 비어 있어도 그 웹 탭이 자리를 보내야 뜸)
export const adopt = (id: string) => { adopted.add(id); };
export const isAdopted = (id: string) => adopted.has(id);

/** 순수 — 화면 자리 → 다리에 실을 상자(정수 · 화면 밖으로 넘친 쪽은 잘라 냄) */
export function boxOf(r: { left: number; top: number; width: number; height: number }, vw: number, vh: number): Box {
  const x = Math.max(0, Math.round(r.left)), y = Math.max(0, Math.round(r.top));
  return { x, y, w: Math.max(0, Math.min(Math.round(r.left + r.width), Math.round(vw)) - x), h: Math.max(0, Math.min(Math.round(r.top + r.height), Math.round(vh)) - y) };
}
const cut = (R: Box, b: Box): Box | null => {
  const x = Math.max(R.x, Math.floor(b.x)), y = Math.max(R.y, Math.floor(b.y)), x2 = Math.min(R.x + R.w, Math.ceil(b.x + b.w)), y2 = Math.min(R.y + R.h, Math.ceil(b.y + b.h));
  return x2 - x >= 2 && y2 - y >= 2 ? { x, y, w: x2 - x, h: y2 - y, ...(b.r ? { r: Math.round(b.r) } : {}) } : null;
};
const inside = (a: Box, b: Box) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
/** 순수 — 칸(R)과 겹치는 조각만 · 칸 안으로 잘라 · 다른 구멍 안에 쏙 든 것 버림 · 큰 것부터 최대 max 개 · 차례 = 자리순(같은 화면이면 늘 같은 글 = 다시 안 보냄) */
export function clipHoles(R: Box, boxes: readonly Box[], max = 12): Box[] {
  const cutAll = boxes.map((b) => cut(R, b)).filter((b): b is Box => !!b).sort((a, b) => b.w * b.h - a.w * a.h);
  const out: Box[] = [];
  for (const b of cutAll) { if (out.length >= max) break; if (!out.some((o) => inside(b, o))) out.push(b); }
  return out.sort((a, b) => a.y - b.y || a.x - b.x || a.w - b.w || a.h - b.h);
}
/** 순수 — 찍어 볼 점(화면 좌표): 가장자리 띠(위 둘 · 아래 셋 · 왼쪽 둘 · 오른쪽 셋 줄)는 step 마다 · 가운데는 5 × 4
 *  까닭 = 우리 화면 조각은 가장자리에서 들어옴(메뉴 판 = 위 · 알림 · 둥근 단추 = 아래/오른쪽 · 얼굴 카드 = 왼쪽) · 가운데 큰 것(창 · 덮개)은 성긴 점으로도 걸림 */
export function probePoints(R: Box, step = 40): [number, number][] {
  const pts: [number, number][] = [];
  if (R.w < 24 || R.h < 24) return pts;
  const xs: number[] = [], ys: number[] = [];
  for (let x = R.x + 10; x < R.x + R.w - 4; x += step) xs.push(x);
  for (let y = R.y + 10; y < R.y + R.h - 4; y += step) ys.push(y);
  for (const dy of [10, 50]) if (dy < R.h) for (const x of xs) pts.push([x, R.y + dy]);
  for (const dy of [12, 52, 96]) if (dy < R.h) for (const x of xs) pts.push([x, R.y + R.h - dy]);
  for (const dx of [10, 50]) if (dx < R.w) for (const y of ys) pts.push([R.x + dx, y]);
  for (const dx of [12, 52, 96]) if (dx < R.w) for (const y of ys) pts.push([R.x + R.w - dx, y]);
  for (let i = 1; i <= 5; i++) for (let j = 1; j <= 4; j++) pts.push([Math.round(R.x + (R.w * i) / 6), Math.round(R.y + (R.h * j) / 5)]);
  return pts;
}

const alpha = (css: string): number => {   // rgb(…) = 1 · rgba(…, a) · transparent = 0
  const m = /rgba?\(([^)]+)\)/.exec(css || "");
  if (!m) return css && css !== "transparent" ? 1 : 0;
  const p = m[1].split(/[,/\s]+/).filter(Boolean);
  return p.length >= 4 ? Math.max(0, Math.min(1, parseFloat(p[3]) || 0)) : 1;
};
const radius = (el: Element): number => { const r = parseFloat(getComputedStyle(el).borderTopLeftRadius || "0"); return Number.isFinite(r) ? r : 0; };
const boxEl = (el: Element): Box => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: radius(el) }; };
const hit = (b: Box, R: Box) => b.x < R.x + R.w && b.x + b.w > R.x && b.y < R.y + R.h && b.y + b.h > R.y;

/** 이 칸(el) 위에 떠 있는 우리 화면 조각 — boxes = 뚫을 상자들(화면 좌표 · 잘라 내기 전) · veil = 화면만 한 안 보이는(또는 옅은) 겹이 누름을 받는 중(바깥을 누르면 닫히는 창 · 판)
 *  ① body 바로 아래 겹(창 · 알림 · 판 = body 로 뺀 것 · 누름이 안 먹는 알림도 여기서 잡힘) ② 점 찍어 보기(화면 안쪽에 그대로 있는 메뉴 판 등)
 *  veil 이면 웹뷰는 그대로 보이고(뜬 조각만 뚫림) 누름만 통째로 아래 우리 화면이 받음 = 바깥 누름으로 닫힘이 그대로 됨 · 짙은 덮개(전체 화면 보기 등)는 칸 전체가 뚫림 */
export function findCovers(el: HTMLElement, R: Box, doc: Document = document): { boxes: Box[]; veil: boolean } {
  const out: Box[] = [], seen = new Set<Element>(), area = R.w * R.h;
  let veil = false;
  const add = (n: Element) => { if (!seen.has(n)) { seen.add(n); out.push(boxEl(n)); } };
  const zNum = (cs: CSSStyleDeclaration) => { const z = parseInt(cs.zIndex, 10); return Number.isFinite(z) ? z : NaN; };
  const big = (b: Box) => { const c = cut(R, b); return !!c && c.w * c.h > area * 0.6; };
  const thin = (cs: CSSStyleDeclaration) => alpha(cs.backgroundColor) < 0.6 && (cs.backdropFilter || "none") === "none";   // 안 칠하거나 옅게만 칠함(뒤가 비침)
  let base: Element | null = el;   // 이 칸이 달린 body 바로 아래 겹(그 겹의 쌓임 값 = 이 칸의 높이 · 값이 없으면 30 = 화면 안쪽 판들보다 위)
  while (base && base.parentElement && base.parentElement !== doc.body) base = base.parentElement;
  const bz = base ? zNum(getComputedStyle(base)) : NaN, paneZ = Number.isFinite(bz) ? bz : 30;
  const walk = (n: Element, depth: number, z0: number) => {
    if (n === el || n.contains(el) || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(n.tagName)) return;
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden" || (+cs.opacity < 0.02 && cs.pointerEvents === "none")) return;   // 안 보이는데 누름은 받는 것 = 막 뜨는 중(옅음 0 에서 시작) → 처음부터 뚫어 둠(끝나고 뚫으면 뜨는 움직임이 가려짐)
    const zi = zNum(cs), z = Number.isFinite(zi) ? Math.max(z0, zi) : z0;
    const b = boxEl(n), kids = () => { if (depth < 3) for (const c of Array.from(n.children)) walk(c, depth + 1, z); };
    if (b.w < 2 || b.h < 2) { kids(); return; }   // 크기 없는 겹 = 안에서 화면 기준으로 뜬 것
    if (!hit(b, R)) return;
    const c = cut(R, b);
    if (!c) return;
    const noHit = cs.pointerEvents === "none", wide = c.w * c.h > area * 0.6;
    if (noHit) {   // 누름이 안 먹는 조각(알림 등) = 점 찍기로는 안 잡힘 → 쌓임 값이 이 칸보다 높을 때만(낮은 것 = 이 칸 아래 깔린 것 · 뚫으면 빈 구멍만 남)
      if (wide && thin(cs)) kids(); else if (z > paneZ) add(n); else kids();
      return;
    }
    const top = doc.elementFromPoint(c.x + c.w / 2, c.y + c.h / 2);   // 누름을 받는 조각 = 그 가운데에서 실제로 맨 위일 때만
    if (!top || !(top === n || n.contains(top))) { kids(); return; }
    if (wide && thin(cs)) { veil = true; kids(); return; }   // 화면만 한 비치는 겹 = 누름만 넘김 · 그 안에 뜬 것만 뚫음
    add(n);
  };
  for (const h of Array.from(doc.body.children)) walk(h, 0, 0);
  for (const [x, y] of probePoints(R)) {
    const top = doc.elementFromPoint(x, y);
    if (!top || top === el || el.contains(top) || top.contains(el)) continue;
    // 그 점을 덮은 조각의 상자 = 위로 올라가며 처음 만나는 「떠 있는 상자」(position absolute · fixed · 그 점을 품음) · 그 바로 위 떠 있는 상자가 4배 안쪽이면 그것까지(창 안쪽 칸 → 창)
    //   끝까지 올라가지 않음 — 창 전체를 쓰는 판은 body 에 달려서, 끝까지 가면 앱 화면 전체가 조각으로 잡힘(11-21 실물 = 메뉴 판을 열면 칸 전체가 뚫렸음)
    let a: Element | null = null, sa = 0;
    for (let p: Element | null = top; p && p !== doc.body && !p.contains(el); p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.position !== "absolute" && cs.position !== "fixed") continue;
      const r = p.getBoundingClientRect();
      if (!(r.width && r.height && r.left <= x && x < r.right && r.top <= y && y < r.bottom)) continue;
      if (!a) { a = p; sa = r.width * r.height; continue; }
      if (cs.pointerEvents !== "none" && r.width * r.height <= sa * 4) { a = p; sa = r.width * r.height; } else break;
    }
    const n = a ?? top;
    if (seen.has(n)) continue;
    if (big(boxEl(n)) && thin(getComputedStyle(n))) { veil = true; seen.add(n); continue; }
    add(n);
  }
  return { boxes: out, veil };
}

/** 칸 자리(el)를 지켜봄 — 자리 · 구멍이 바뀔 때만 on(같은 값 = 안 부름) · 안 보이면(숨김 · 크기 없음) null
 *  다시 재는 때 = 칸 크기 · 창 크기 · 화면이 바뀜(요소가 붙고 떨어짐 · 열림/닫힘 표식) · 손짓 뒤 · 움직임 끝 — 잦아도 0.12초에 한 번 · 가만히 둔 화면 = 0 */
export function trackSpot(el: HTMLElement, on: (s: Spot | null) => void): () => void {
  let timer = 0, ran = 0, last = "", dead = false;
  const run = () => {
    timer = 0;
    if (dead) return;
    ran = performance.now();
    const vw = window.innerWidth, vh = window.innerHeight, rect = boxOf(el.getBoundingClientRect(), vw, vh);
    let s: Spot | null = null;
    if (rect.w > 20 && rect.h > 20) { const c = findCovers(el, rect); s = { rect, vw: Math.round(vw), vh: Math.round(vh), holes: clipHoles(rect, c.boxes), ...(c.veil ? { veil: true } : {}) }; }
    const k = JSON.stringify(s);
    if (k !== last) { last = k; on(s); }
  };
  // 타이머로 잼(화면 그리기 박자 rAF 는 창이 가려지면 멈춰서, 다시 보일 때까지 자리 · 구멍이 옛 값으로 남음 · 11-21 시험 창 실물)
  const soon = () => { if (!dead && !timer) timer = window.setTimeout(run, Math.max(0, 120 - (performance.now() - ran))); };
  const ro = new ResizeObserver(soon); ro.observe(el);
  const mo = new MutationObserver(soon);
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden", "open", "inert", "data-open", "data-state", "aria-expanded", "aria-hidden"] });
  const evs = ["pointerdown", "pointerup", "keydown", "keyup", "transitionend", "animationend", "focusin"] as const;
  for (const e of evs) document.addEventListener(e, soon, true);
  window.addEventListener("resize", soon);
  window.addEventListener("hashchange", soon);
  run();
  return () => {
    dead = true;
    window.clearTimeout(timer); ro.disconnect(); mo.disconnect();
    for (const e of evs) document.removeEventListener(e, soon, true);
    window.removeEventListener("resize", soon); window.removeEventListener("hashchange", soon);
  };
}
