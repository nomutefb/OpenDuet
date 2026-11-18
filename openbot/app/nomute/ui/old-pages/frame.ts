// 옛 에디터 화면 한 장을 앱 안에서 직접 돌리는 틀(형 11-19 00:45 「그거 다 지금 정원으로 제대로 이식해서 가져와」) — 전엔 /edit.html · /sb.html · /ys.html · /song.html 을 iframe 으로 품었음
//   판 · 옷 · 엔진 = public/old-pages/<화면>.<지문>.js(./tools/gen.mjs 가 옛 에디터 viewer 에서 만듦 · 원본 코드를 자동으로만 바꿈 · 받는 손 ./load.ts) · 홈 뉴스 덱(home/deck)과 같은 길
//   틀 = 그림자 뿌리 한 장. 원본은 제 문서 · 제 창을 통째로 쓰던 화면 → 그 문서 · 창처럼 보이는 것을 만들어 엔진에 준다:
//     문서: <nd-html class="nd-root"> = 원본 html(화면이 굴러가는 자리 = 옛 창) · <nd-head> · <nd-body> — 꼬리표 이름이라 옷의 세기(고르개 점수)가 원본과 같다
//     창:   폭 · 높이 = 틀 크기 · 스크롤 = nd-html · 주소(location) · 뒤로 가기 기록(history) = 이 화면 것만(앱 주소를 안 건드림) · parent · top = 앱 자리(글 주고받기 · 넘기기)
//           창에 다는 이름(window.x = …) · 맨 위에 정한 이름(function · var) = 이 틀의 서랍에만(앱 창 · 다른 화면과 안 섞임)
//     자리: 옛 iframe 은 제 창 왼쪽 위가 (0,0) → 엔진이 읽는 자리(getBoundingClientRect · clientX)를 틀 왼쪽 위 기준으로 바꿔 줌(gen.mjs 가 그 읽기를 __nm 으로 돌림) ·
//           붙박이(position:fixed)는 틀 안에 갇힘(contain:layout) = 옛 iframe 창에 붙던 것과 같은 자리
//     주소: 원본 문서는 사이트 뿌리(/)에 있었다 → 상대 주소(fetch · src · href · 글자로 짠 HTML)는 뿌리 기준으로
//     듣기: 화면에서 나는 일은 틀 안에서만 · 창 크기 바뀜 = 틀 크기 지켜봄 · DOMContentLoaded · load = 엔진을 다 돌린 뒤 차례로 한 번
//     끝:   타이머 · 지켜보기 · 듣기를 다 적어 두었다가 dispose 에서 걷음(pagehide 손은 그때 한 번 부름 = 옛 iframe 이 닫힐 때와 같음)
//   크기: 틀(:host)이 크기 그릇 → 원본의 화면 높이 단위(vh → cqh) · 화면 폭 조건(@media → @container nd)이 틀 크기를 따름(gen.mjs 가 바꿈 · 실행 때 끼우는 옷은 ./scope-css.ts)
import { rootHtml, rootUrl, scopeCss } from "./scope-css";
export { rootHtml, rootUrl };

export type PageScript = { src?: string; defer?: boolean; run: (window: Window, document: Document, nm: unknown) => void };
export type PageDef = {
  /** 원본 문서 길(/edit.html) */
  path: string;
  /** 옷 = 원본 차례 그대로(이미 틀 것으로 바뀐 글) */
  css: string[];
  /** 원본 머리말의 색 틀(<meta name="color-scheme">) — 기본 글자색 · 단추 · 스크롤바의 바탕 색이 이걸 따름 */
  scheme: string;
  /** 문서에 한 번만 올리는 글꼴 규칙(@font-face 는 그림자 뿌리 안에서 안 먹음) */
  fonts: string;
  html: string;
  /** 머리에 있던 스크립트 꼬리표(안 도는 표지 · 원본이 제 꼬리표 속성을 읽음) */
  headTags: string;
  htmlAttrs: Record<string, string>;
  bodyAttrs: Record<string, string>;
  scripts: PageScript[];
};
export type FrameMsg = Record<string, unknown>;
export type FrameHost = {
  /** 화면이 부모에게 보낸 글(옛 parent.postMessage) */
  onUp?: (m: FrameMsg) => void;
  /** 화면이 다른 주소로 가려 함(top.location = … · location.href = …) */
  onNav?: (url: string) => void;
  /** 화면이 저를 다시 읽으려 함(location.reload) */
  onReload?: () => void;
  /** 주소 뒤 물음표(?u=…) — 원본이 location.search 로 읽던 것 */
  search?: string;
};
export type Frame = {
  root: ShadowRoot; html: HTMLElement; body: HTMLElement; head: HTMLElement; host: HTMLElement;
  /** 엔진이 보는 창 · 문서(앱이 엔진 함수를 부를 때 = 옛 iframe.contentWindow 자리) */
  win: Window & Record<string, unknown>; doc: Document;
  /** 앱 → 화면(옛 postMessage) */
  post: (data: FrameMsg) => void;
  /** 덧씌우는 옷(앱 톤) — 원본 문서 꼴(html · body · @media)로 써도 틀 것으로 바꿔 넣음 · 늘 맨 끝 */
  tone: (css: string) => void;
  dispose: () => void;
};

const BASE = `:host{all:initial;display:block;position:relative;min-width:0;min-height:0;overflow:hidden;contain:layout style;container-type:size;container-name:nd}
:where(nd-html){display:block;position:relative;width:100%;height:100%;overflow:auto;outline:none}
:where(nd-body){display:block;margin:8px}
:where(nd-head){display:none}`;

/** 화면에서 나는 일(틀 안에서만 듣는 종류) — 여기 없고 아래 표에도 없는 종류 = 화면이 지어 쓰는 일(틀 안 + 이 틀의 창 버스) */
const WIN_REAL = new Set(["focus", "blur", "online", "offline", "storage", "languagechange", "devicemotion", "deviceorientation", "afterprint", "beforeprint", "appinstalled", "beforeinstallprompt"]);
const DOC_REAL = new Set(["visibilitychange", "fullscreenchange", "fullscreenerror", "selectionchange", "pointerlockchange", "pointerlockerror"]);
const DROP = new Set(["popstate", "hashchange", "error", "unhandledrejection", "rejectionhandled", "readystatechange"]);
const BYE = new Set(["pagehide", "beforeunload", "unload"]);
let fontsUp = "";
function fontsOnce(css: string) {   // 글꼴 규칙은 문서에(여러 화면이 같은 글을 올려도 한 번)
  if (!css || fontsUp.includes(css)) return;
  fontsUp += css;
  const s = document.createElement("style"); s.setAttribute("data-nm-old-fonts", ""); s.textContent = css; document.head.appendChild(s);
}

export function mountPage(mountAt: HTMLElement, page: PageDef, hostApi: FrameHost = {}): Frame {
  const RW = window, RD = document;
  fontsOnce(page.fonts);
  const el = RD.createElement("div");
  el.className = "nm-oldpage";
  el.style.cssText = "width:100%;height:100%";
  mountAt.appendChild(el);
  const root = el.attachShadow({ mode: "open" });
  const html = RD.createElement("nd-html"), head = RD.createElement("nd-head"), body = RD.createElement("nd-body");
  html.className = "nd-root"; html.tabIndex = -1;
  for (const [k, v] of Object.entries(page.htmlAttrs)) { if (k === "class") html.className = "nd-root " + v; else html.setAttribute(k, v); }
  for (const [k, v] of Object.entries(page.bodyAttrs)) body.setAttribute(k, v);
  const base = RD.createElement("style"); base.textContent = BASE + `\n:host{color-scheme:${page.scheme || "normal"}}\n:where(nd-html){color:CanvasText}`; root.appendChild(base);
  for (const css of page.css) { const s = RD.createElement("style"); s.textContent = css; s.setAttribute("data-nm-own", ""); head.appendChild(s); }
  const toneEl = RD.createElement("style"); toneEl.id = "nm-ved-see"; toneEl.setAttribute("data-nm-own", "");
  body.innerHTML = page.html;
  head.insertAdjacentHTML("beforeend", page.headTags);
  html.append(head, body); root.appendChild(html);

  let dead = false, ready: "loading" | "interactive" | "complete" = "loading", curScript: unknown = null;
  const timers = new Set<number>(), ivs = new Set<number>(), rafs = new Set<number>(), idles = new Set<number>(), obs = new Set<{ disconnect: () => void }>();
  const offs: (() => void)[] = [];
  type L = EventListenerOrEventListenerObject;
  const call = (fn: L, self: unknown, e: unknown) => { try { if (typeof fn === "function") fn.call(self as never, e as Event); else fn?.handleEvent?.(e as Event); } catch (x) { console.error("[옛 화면 " + page.path + "]", x); } };
  const down = new Set<L>(), resize = new Set<L>(), dcl: [L, unknown][] = [], onload: [L, unknown][] = [], shows: [L, unknown][] = [], byes = new Set<L>();
  const winBus = new EventTarget();
  const origin = () => { const r = el.getBoundingClientRect(); return r; };

  const fakeTopDoc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], documentElement: { classList: { contains: () => false } }, defaultView: { location: { search: "" } } };
  const nav = (u: unknown) => { const s = String(rootUrl(u) ?? ""); if (s && !dead) hostApi.onNav?.(s); };
  const topLoc = { get href() { return RW.location.origin + "/"; }, set href(u: string) { nav(u); }, assign: nav, replace: nav, reload: () => hostApi.onReload?.(), origin: RW.location.origin, search: "", hash: "", pathname: "/" };
  const fakeParent = { postMessage: (data: FrameMsg) => { queueMicrotask(() => { if (!dead) hostApi.onUp?.(data); }); }, document: fakeTopDoc, location: topLoc };
  const fakeFrame = { getAttribute: (k: string) => (k === "data-nm-scene" ? "off" : null), dataset: { nmScene: "off" }, ownerDocument: fakeTopDoc, getBoundingClientRect: () => el.getBoundingClientRect() };

  // 이 화면의 주소(앱 주소와 따로) — 원본이 읽던 꼴 그대로
  let search = hostApi.search || "", hash = "";
  const hrefNow = () => RW.location.origin + page.path + search + hash;
  const setUrl = (u: unknown) => { try { const n = new URL(String(u), hrefNow()); if (n.origin === RW.location.origin && n.pathname === page.path) { search = n.search; hash = n.hash; return true; } } catch { /* 못 읽는 주소 */ } return false; };
  const go = (u: unknown) => { if (!setUrl(u)) nav(u); };
  const loc = {
    get href() { return hrefNow(); }, set href(u: string) { go(u); },
    get search() { return search; }, set search(v: string) { search = v ? (v.startsWith("?") ? v : "?" + v) : ""; },
    get hash() { return hash; }, set hash(v: string) { hash = v ? (v.startsWith("#") ? v : "#" + v) : ""; },
    get pathname() { return page.path; }, origin: RW.location.origin, host: RW.location.host, hostname: RW.location.hostname, protocol: RW.location.protocol, port: RW.location.port,
    assign: go, replace: go, reload: () => { if (!dead) hostApi.onReload?.(); }, toString: () => hrefNow(),
  };
  const hist = { state: null as unknown, length: 1, scrollRestoration: "auto", replaceState: (s: unknown, _t: string, u?: string | null) => { hist.state = s; if (u != null) setUrl(u); }, pushState: (s: unknown, _t: string, u?: string | null) => { hist.state = s; if (u != null) setUrl(u); }, back: () => {}, forward: () => {}, go: () => {} };

  const hook = (target: EventTarget, type: string, fn: L, opt?: boolean | AddEventListenerOptions) => { target.addEventListener(type, fn, opt); offs.push(() => target.removeEventListener(type, fn, opt)); };
  const listen = (isWin: boolean) => (type: string, fn: L, opt?: boolean | AddEventListenerOptions) => {
    if (!fn || dead) return;
    if (type === "message") { if (isWin) down.add(fn); return; }
    if (type === "resize" || type === "orientationchange") { resize.add(fn); return; }
    if (type === "DOMContentLoaded") { if (ready === "loading") dcl.push([fn, isWin ? win : doc]); return; }
    if (type === "load" && !(opt === true || (typeof opt === "object" && opt?.capture))) { if (isWin && ready !== "complete") onload.push([fn, win]); return; }
    if (type === "pageshow") { if (isWin) shows.push([fn, win]); return; }
    if (DROP.has(type) && !(type === "error" && !isWin)) return;
    if (BYE.has(type)) { if (type === "pagehide") byes.add(fn); hook(RW, type, fn, opt); return; }
    if (isWin) { if (WIN_REAL.has(type)) hook(RW, type, fn, opt); else hook(html, type, fn, opt); hook(winBus, type, fn, opt); return; }
    if (DOC_REAL.has(type)) hook(RD, type, fn, opt); else hook(html, type, fn, opt);
  };
  const unlisten = (isWin: boolean) => (type: string, fn: L, opt?: boolean | EventListenerOptions) => {
    if (!fn) return;
    if (type === "message") { down.delete(fn); return; }
    if (type === "resize" || type === "orientationchange") { resize.delete(fn); return; }
    byes.delete(fn);
    for (const t of [RW, RD, html, winBus] as EventTarget[]) t.removeEventListener(type, fn, opt);
    void isWin;
  };
  const isClass = (v: unknown) => /^class\s|^\s*function\s+[A-Z]/.test(Function.prototype.toString.call(v).slice(0, 40));
  const bound = new Map<unknown, unknown>();
  const bindOf = (t: object, v: unknown) => { if (typeof v !== "function" || isClass(v)) return v; let b = bound.get(v); if (!b) { b = (v as (...a: unknown[]) => unknown).bind(t); bound.set(v, b); } return b; };

  const docStore: Record<string, unknown> = {};
  const docOver: Record<string, unknown> = {
    getElementById: (id: string) => root.getElementById(id),
    querySelector: (s: string) => (s === "html" || s === ":root" ? html : s === "body" ? body : s === "head" ? head : root.querySelector(s)),
    querySelectorAll: (s: string) => root.querySelectorAll(s),
    getElementsByClassName: (c: string) => html.getElementsByClassName(c),
    getElementsByTagName: (t: string) => { const k = String(t).toLowerCase(); return k === "head" ? [head] : k === "body" ? [body] : k === "html" ? [html] : html.getElementsByTagName(t); },
    getElementsByName: (n: string) => root.querySelectorAll(`[name="${CSS.escape(n)}"]`),
    elementFromPoint: (x: number, y: number) => { const o = origin(); return root.elementFromPoint(x + o.left, y + o.top); },
    elementsFromPoint: (x: number, y: number) => { const o = origin(); return root.elementsFromPoint(x + o.left, y + o.top).filter((n) => html.contains(n)); },
    contains: (n: Node | null) => !!n && (n === (doc as unknown) || root.contains(n)),
    addEventListener: listen(false), removeEventListener: unlisten(false),
    dispatchEvent: (e: Event) => html.dispatchEvent(e),
    hasFocus: () => RD.hasFocus() && !!root.activeElement,
  };
  const doc: Document = new Proxy(RD, {
    get(t, k) {
      if (k === "documentElement" || k === "scrollingElement") return html;
      if (k === "body") return body;
      if (k === "head") return head;
      if (k === "activeElement") return root.activeElement || body;
      if (k === "currentScript") return curScript;
      if (k === "readyState") return ready;
      if (k === "defaultView") return win;
      if (k === "location") return loc;
      if (k === "URL" || k === "documentURI" || k === "baseURI") return hrefNow();
      if (k === "title") return "";
      if (typeof k === "string") { if (k in docStore) return docStore[k]; if (k in docOver) return docOver[k]; }
      return bindOf(t, Reflect.get(t, k, t));
    },
    set(_t, k, v) { if (k === "location") { go(v); return true; } if (typeof k === "string" && k !== "title") docStore[k] = v; return true; },   // 문서 제목 = 앱 것(화면이 못 바꿈)
  }) as unknown as Document;

  // 서버 부름 = 앱의 가로채기(shim/install.ts) 전 fetch 로 — 원본은 제 문서에서 서버를 바로 불렀다(앱 통과 목록에 없는 /api/track · /api/voice … 도 그대로 감)
  const serverFetch: typeof fetch = (RW as unknown as { __nmServerFetch?: typeof fetch }).__nmServerFetch || RW.fetch.bind(RW);
  const abs = (u: unknown) => { const s = rootUrl(u); return typeof s === "string" ? new URL(s, RW.location.origin + "/").href : s; };
  const store: Record<string, unknown> = {};   // 이 화면이 창에 단 이름 · 맨 위에 정한 이름
  const G: Record<string, unknown> = {
    setTimeout: (fn: (...a: unknown[]) => void, ms?: number, ...a: unknown[]) => { if (dead) return 0; const id = RW.setTimeout(() => { timers.delete(id); if (!dead) fn(...a); }, ms); timers.add(id); return id; },
    clearTimeout: (id: number) => { RW.clearTimeout(id); timers.delete(id); },
    setInterval: (fn: (...a: unknown[]) => void, ms?: number, ...a: unknown[]) => { if (dead) return 0; const id = RW.setInterval(() => { if (!dead) fn(...a); }, ms); ivs.add(id); return id; },
    clearInterval: (id: number) => { RW.clearInterval(id); ivs.delete(id); },
    requestAnimationFrame: (fn: FrameRequestCallback) => { if (dead) return 0; const id = RW.requestAnimationFrame((t) => { rafs.delete(id); if (!dead) fn(t); }); rafs.add(id); return id; },
    cancelAnimationFrame: (id: number) => { RW.cancelAnimationFrame(id); rafs.delete(id); },
    requestIdleCallback: (fn: IdleRequestCallback, o?: IdleRequestOptions) => { if (dead) return 0; if (!RW.requestIdleCallback) return (G.setTimeout as (f: () => void, ms: number) => number)(() => fn({ didTimeout: true, timeRemaining: () => 0 }), 1); const id = RW.requestIdleCallback((d) => { idles.delete(id); if (!dead) fn(d); }, o); idles.add(id); return id; },
    cancelIdleCallback: (id: number) => { RW.cancelIdleCallback?.(id); idles.delete(id); },
    addEventListener: listen(true), removeEventListener: unlisten(true),
    dispatchEvent: (e: Event) => winBus.dispatchEvent(e),
    ResizeObserver: class extends RW.ResizeObserver { constructor(cb: ResizeObserverCallback) { super(cb); obs.add(this); } },
    MutationObserver: class extends RW.MutationObserver { constructor(cb: MutationCallback) { super(cb); obs.add(this); } },
    IntersectionObserver: class extends RW.IntersectionObserver { constructor(cb: IntersectionObserverCallback, o?: IntersectionObserverInit) { super(cb, o); obs.add(this); } },
    XMLHttpRequest: class extends RW.XMLHttpRequest { open(m: string, u: string | URL, ...r: unknown[]) { return (super.open as (...a: unknown[]) => void)(m, abs(u), ...r); } },
    fetch: (u: RequestInfo | URL, o?: RequestInit) => serverFetch(typeof u === "string" ? (abs(u) as string) : u, o),
    open: (u?: string | URL, t?: string, f?: string) => RW.open(u == null ? u : (abs(u) as string), t ?? "_blank", f),
    scrollTo: (x?: number | ScrollToOptions, y?: number) => (typeof x === "object" ? html.scrollTo(x) : html.scrollTo(x ?? 0, y ?? 0)),
    scrollBy: (x?: number | ScrollToOptions, y?: number) => (typeof x === "object" ? html.scrollBy(x) : html.scrollBy(x ?? 0, y ?? 0)),
    scroll: (x?: number | ScrollToOptions, y?: number) => (typeof x === "object" ? html.scrollTo(x) : html.scrollTo(x ?? 0, y ?? 0)),
    parent: fakeParent, top: fakeParent, frameElement: fakeFrame, opener: null, location: loc, history: hist, document: doc, name: "",
  };
  const win = new Proxy(RW, {
    get(t, k) {
      if (k === "innerWidth") return el.clientWidth;
      if (k === "innerHeight") return el.clientHeight;
      if (k === "scrollY" || k === "pageYOffset") return html.scrollTop;
      if (k === "scrollX" || k === "pageXOffset") return html.scrollLeft;
      if (k === "window" || k === "self" || k === "globalThis" || k === "frames") return win;
      if (typeof k === "string") { if (k in store) return store[k]; if (k in G) return G[k]; }
      return bindOf(t, Reflect.get(t, k, t));
    },
    set(_t, k, v) { if (k === "location") { go(v); return true; } if (typeof k === "string") { const d = Object.getOwnPropertyDescriptor(store, k); if (d && !d.set && d.get) return true; store[k] = v; } return true; },
    has(t, k) { return (typeof k === "string" && (k in store || k in G)) || Reflect.has(t, k); },
    deleteProperty(_t, k) { if (typeof k === "string") delete store[k]; return true; },
  }) as unknown as Window & Record<string, unknown>;

  const leaked: [string, unknown][] = [];
  const isPtr = (o: unknown) => o instanceof MouseEvent || (typeof Touch !== "undefined" && o instanceof Touch);
  const fixRect = (r: DOMRect | undefined | null) => { if (!r) return r; const o = origin(); return new DOMRect(r.x - o.left, r.y - o.top, r.width, r.height); };
  const nm = {
    rect: (o: { getBoundingClientRect?: () => DOMRect } | null | undefined) => (o == null ? undefined : fixRect(o.getBoundingClientRect!())),
    rects: (o: { getClientRects?: () => DOMRectList } | null | undefined) => (o == null ? undefined : Array.from(o.getClientRects!(), (r) => fixRect(r)!)),
    cx: (o: { clientX?: number } | null | undefined) => (o == null ? undefined : isPtr(o) ? (o.clientX as number) - origin().left : o.clientX),
    cy: (o: { clientY?: number } | null | undefined) => (o == null ? undefined : isPtr(o) ? (o.clientY as number) - origin().top : o.clientY),
    px: (o: { pageX?: number; clientX?: number } | null | undefined) => (o == null ? undefined : isPtr(o) ? (o.clientX as number) - origin().left + html.scrollLeft : o.pageX),
    py: (o: { pageY?: number; clientY?: number } | null | undefined) => (o == null ? undefined : isPtr(o) ? (o.clientY as number) - origin().top + html.scrollTop : o.pageY),
    u: rootUrl, h: rootHtml,
    /** 글자로 짠 HTML 의 on…="함수(…)" 가 부르는 함수 = 앱 창에도(그런 속성은 창에서 이름을 찾는다 · 받은 칸만 만지는 함수라 화면끼리 겹쳐도 같음) */
    leak: (map: Record<string, unknown>) => { for (const k of Object.keys(map)) { (RW as unknown as Record<string, unknown>)[k] = map[k]; leaked.push([k, map[k]]); } },
    /** 맨 위에 정한 이름을 이 틀의 창 서랍에(다른 스크립트 · 앱이 window.이름 으로 읽고 쓰게) */
    ex: (map: Record<string, [() => unknown, ((v: unknown) => void)?]>) => { for (const k of Object.keys(map)) Object.defineProperty(store, k, { get: map[k][0], set: map[k][1], configurable: true, enumerable: true }); },
  };

  // 실행 때 끼우는 옷(cscroll · nm-loader 가 만드는 <style>) = 원본 문서 꼴로 쓰여 있음 → 틀 것으로 · 글꼴 링크 · 미리 잇기 = 문서 머리로(그림자 뿌리 안에선 글꼴 규칙이 안 먹음)
  const fixStyle = (s: HTMLStyleElement) => { if (s.hasAttribute("data-nm-own")) return; const src = s.textContent || "", out = scopeCss(src); if (out !== src) s.textContent = out; s.setAttribute("data-nm-own", ""); };
  const moved: Element[] = [];
  const sweep = (nodes: Iterable<Node>) => { for (const n of nodes) { if (!(n instanceof Element)) continue; if (n instanceof HTMLStyleElement) fixStyle(n); else if (n instanceof HTMLLinkElement && /stylesheet|preconnect|preload/.test(n.rel)) { RD.head.appendChild(n); moved.push(n); } else n.querySelectorAll?.("style:not([data-nm-own])").forEach((x) => fixStyle(x as HTMLStyleElement)); } };
  const styleMo = new RW.MutationObserver((ms) => { for (const m of ms) sweep(m.addedNodes); });
  styleMo.observe(html, { childList: true, subtree: true });
  const headAppend = head.appendChild.bind(head);
  head.appendChild = ((n: Node) => { sweep([n]); if (n.parentNode === RD.head) return n; const r = headAppend(n); if (n !== toneEl && toneEl.isConnected) headAppend(toneEl); return r; }) as typeof head.appendChild;   // 붙는 그 순간에 바꿈(한 프레임도 원본 꼴로 안 먹게) · 덧씌운 옷은 늘 맨 끝

  let first = true;
  const ro = new RW.ResizeObserver(() => { if (first) { first = false; return; } if (dead) return; const e = new Event("resize"); for (const f of [...resize]) call(f, win, e); });
  ro.observe(el);
  // 글쇠 · 붙여넣기 · 끌어다 놓기 = 틀 밖(앱)으로 안 올라감 — 옛 iframe 안의 일은 앱이 못 들었다(화면 입력칸에 치는 글쇠가 앱 단축키로 · 영상 끌어다 놓기가 앱의 파일 받기로 새지 않게)
  for (const type of ["keydown", "keyup", "keypress", "paste", "copy", "cut", "dragenter", "dragover", "dragleave", "drop"]) hook(el, type, (e) => e.stopPropagation());
  // 틀 안 빈 데를 눌러도 글쇠가 이 화면으로 오게(옛 iframe 은 눌린 창이 글쇠를 받았다)
  hook(html, "pointerdown", () => { if (!root.activeElement) html.focus({ preventScroll: true }); }, { passive: true });

  const tags = new Map<number, Element>();
  root.querySelectorAll("script[data-nm-i]").forEach((x) => tags.set(Number(x.getAttribute("data-nm-i")), x));
  const runOne = (s: PageScript) => {
    curScript = tags.get(page.scripts.indexOf(s)) || null;
    try { s.run.call(win, win, doc, nm); } catch (e) { console.error("[옛 화면 " + page.path + "] " + (s.src || "안 스크립트"), e); }
    curScript = null;
  };
  for (const s of page.scripts) if (!s.defer) runOne(s);
  for (const s of page.scripts) if (s.defer) runOne(s);
  ready = "interactive";
  { const e = new Event("DOMContentLoaded", { bubbles: true }); for (const [f, self] of dcl.splice(0)) call(f, self, e); }
  const tLoad = RW.setTimeout(() => {
    if (dead) return;
    ready = "complete";
    { const e = new Event("load"); for (const [f, self] of onload.splice(0)) call(f, self, e); }
    { const e = Object.assign(new Event("pageshow"), { persisted: false }); for (const [f, self] of shows.splice(0)) call(f, self, e); }
  }, 0);

  return {
    root, html, body, head, host: el, win, doc,
    post: (data) => { if (dead) return; const ev = { origin: RW.location.origin, source: fakeParent, data }; for (const f of [...down]) call(f, win, ev); },
    tone: (css) => { const out = scopeCss(css); if (toneEl.textContent !== out) toneEl.textContent = out; if (head.lastElementChild !== toneEl) headAppend(toneEl); },
    dispose: () => {
      if (dead) return;
      { const e = Object.assign(new Event("pagehide"), { persisted: false }); for (const f of [...byes]) call(f, win, e); }
      dead = true;
      RW.clearTimeout(tLoad); ro.disconnect(); styleMo.disconnect();
      for (const id of timers) RW.clearTimeout(id);
      for (const id of ivs) RW.clearInterval(id);
      for (const id of rafs) RW.cancelAnimationFrame(id);
      for (const id of idles) RW.cancelIdleCallback?.(id);
      for (const o of obs) { try { o.disconnect(); } catch { /* 이미 끊김 */ } }
      for (const f of offs) { try { f(); } catch { /* 이미 걷음 */ } }
      for (const n of moved) n.remove();
      for (const [k, v] of leaked) { const w = RW as unknown as Record<string, unknown>; if (w[k] === v) delete w[k]; }
      root.querySelectorAll("video,audio").forEach((m) => { try { (m as HTMLMediaElement).pause(); (m as HTMLMediaElement).removeAttribute("src"); (m as HTMLMediaElement).load(); } catch { /* 이미 멈춤 */ } });
      down.clear(); resize.clear(); byes.clear();
      el.remove();
    },
  };
}
