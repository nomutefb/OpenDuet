// 홈 뉴스 덱 = 앱 안에서 직접 돎(형 11-19 00:4x 「그거 다 지금 정원으로 제대로 이식해서 가져와」) — 전엔 옛 에디터 /modern-home.html 을 iframe 으로 품었음
//   판 · 옷 · 엔진 = ./deck.gen.ts(./tools/gen.mjs 가 옛 에디터 viewer 에서 만듦 · 원본 줄 그대로)
//   틀 = 그림자 뿌리 한 장: 원본은 제 문서 · 제 창을 통째로 썼다 → 그 문서 · 창처럼 보이는 것을 만들어 엔진에 준다
//     문서: 찾기(getElementById · querySelector)는 그림자 뿌리 안 · documentElement = .nd-html · body = .nd-body · head = .nd-head · 다 읽힘(readyState complete)
//     창:   폭 · 높이 = 틀 크기(옛 iframe 창 크기) · parent = 앱(글 주고받기 = 아래 post · onUp · 옛 postMessage 와 같은 글 꼴) · 크기 바뀜(resize) = 틀 크기 지켜봄
//     듣기: 누름 · 끌기 · 글쇠처럼 화면에서 나는 일은 틀 안에서만 들음(옛 iframe 문서가 제 안의 일만 듣던 것과 같음) · 보임 바뀜 · 창 잃음은 앱 것 그대로
//     타이머 · 지켜보기 · 듣기 = 다 적어 두었다가 dispose 에서 걷음(옛 iframe 이 닫히며 같이 사라지던 것과 같은 끝)
//   크기: 틀(:host)이 크기 그릇 → 원본의 화면 높이 단위 · 화면 폭 조건이 틀 크기를 따름(./tools/gen.mjs 머리말)
import { DECK_CSS, DECK_HTML, DECK_UNSET, runDeck } from "./deck.gen";
import { installModernData } from "./modern-data.gen";
import { scopeTone } from "./tone";
export { scopeTone };

export const DECK_CHANNEL = "nomute-modern-home";
export type DeckMsg = { channel?: string; type?: string; [k: string]: unknown };
export type Deck = {
  /** 앱 → 덱(옛 postMessage 와 같은 글: connect · snapshot · suspend · key · current) */
  post: (type: string, detail?: Record<string, unknown>) => void;
  /** 덧씌우는 옷(앱 톤 · 홈만의 덧줄) — `:root` · `html,body` · 화면 폭 조건 · svh 는 여기서 틀 것으로 바꿔 넣음 */
  tone: (css: string) => void;
  /** 덱에게 물어 같은 종류 답 하나를 기다림(1초 · 「current」) */
  ask: (type: string, ms?: number) => Promise<DeckMsg | null>;
  root: ShadowRoot; html: HTMLElement; host: HTMLElement;
  dispose: () => void;
};

// 틀 = 앱 옷이 안 새어 들게 막는 자리: 물려받는 속성(줄 높이 · 자간 · 글꼴 · 정렬 …)은 다 처음 값으로(all:initial = 원본의 제 문서와 같은 바탕) ·
//   덱이 쓰지만 스스로 안 정하는 변수(DECK_UNSET)는 비움(앱에 같은 이름이 있어도 원본처럼 「없음」) · 그 밖 변수는 덱이 .nd-html 에서 제 값으로 다시 정함
const BASE = `:host{all:initial;${DECK_UNSET.map((v: string) => v + ":initial").join(";")};display:block;position:relative;min-width:0;min-height:0;container-type:size;container-name:nd}
.nd-html{display:block;position:relative;width:100%;height:100%;overflow:hidden}
.nd-body{display:block;min-height:100%}
.nd-head{display:none}`;
/** 화면에서 나는 일 = 틀 안에서만 듣는 종류 */
const UI = new Set(["pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout", "pointerenter", "pointerleave", "click", "dblclick", "contextmenu", "mousedown", "mouseup", "mousemove", "keydown", "keyup", "keypress", "touchstart", "touchmove", "touchend", "touchcancel", "wheel", "scroll", "focusin", "focusout", "input", "change", "dragstart", "selectstart"]);
let mdP: unknown = null;
/** 카드 재료 셈(옛 에디터 modern-data.js 그대로) — 앱 묶음 안에 든 것을 한 번 붙임(전엔 /modern-data.js 를 실행 때 불러 옴) */
export function modernDataNow<T>(): T { return (mdP ||= installModernData(window)) as T; }

export function mountDeck(host: HTMLElement, onUp: (m: DeckMsg) => void): Deck {
  const RW = window, RD = document;
  const el = RD.createElement("div");
  el.className = "nm-deck";
  el.style.cssText = "flex:1 1 auto;width:100%;min-height:0";   // 붙는 자리 = 세로 flex 칸(home/news-feed.tsx) · 높이는 그 칸이 줌(틀은 크기 그릇이라 제 내용으로 안 큼)
  host.appendChild(el);
  const root = el.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${BASE}\n${DECK_CSS}</style><style id="nm-yeta-tone"></style><div class="nd-html"><div class="nd-head"></div><div class="nd-body">${DECK_HTML}</div></div>`;
  const html = root.querySelector(".nd-html") as HTMLElement, body = root.querySelector(".nd-body") as HTMLElement, head = root.querySelector(".nd-head") as HTMLElement, toneEl = root.getElementById("nm-yeta-tone") as HTMLStyleElement;

  let dead = false;
  const timers = new Set<number>(), ivs = new Set<number>(), rafs = new Set<number>(), idles = new Set<number>(), obs = new Set<{ disconnect: () => void }>();
  const offs: (() => void)[] = [];
  const down = new Set<(e: unknown) => void>();   // 덱이 「message」로 듣는 손
  const resize = new Set<EventListener>();
  const waits = new Set<(m: DeckMsg) => void>();
  const fakeParent = { postMessage: (data: DeckMsg) => { queueMicrotask(() => { if (dead) return; for (const w of [...waits]) w(data); onUp(data); }); }, document: RD };

  type L = EventListenerOrEventListenerObject;
  const listen = (real: EventTarget) => (type: string, fn: L, opt?: boolean | AddEventListenerOptions) => {
    if (!fn || dead) return;
    if (type === "message") { down.add(fn as (e: unknown) => void); return; }
    if (type === "resize") { resize.add(fn as EventListener); return; }
    if (type === "DOMContentLoaded" || type === "load" || type === "pageshow" || type === "pagehide" || type === "beforeunload") return;   // 이미 다 읽힌 판 · 창이 따로 없음
    const target: EventTarget = UI.has(type) ? html : real;
    target.addEventListener(type, fn, opt);
    offs.push(() => target.removeEventListener(type, fn, opt));
  };
  const unlisten = (real: EventTarget) => (type: string, fn: L, opt?: boolean | EventListenerOptions) => {
    if (type === "message") { down.delete(fn as (e: unknown) => void); return; }
    if (type === "resize") { resize.delete(fn as EventListener); return; }
    (UI.has(type) ? html : real).removeEventListener(type, fn, opt);
  };
  const bindOf = (t: object, v: unknown) => (typeof v === "function" && !/^class\s|^\s*function\s+[A-Z]/.test(Function.prototype.toString.call(v).slice(0, 40)) ? (v as (...a: unknown[]) => unknown).bind(t) : v);

  const docOver: Record<string, unknown> = {
    getElementById: (id: string) => root.getElementById(id),
    querySelector: (s: string) => root.querySelector(s),
    querySelectorAll: (s: string) => root.querySelectorAll(s),
    elementFromPoint: (x: number, y: number) => root.elementFromPoint(x, y),
    addEventListener: listen(RD), removeEventListener: unlisten(RD),
    hasFocus: () => RD.hasFocus() && !!root.activeElement,
    currentScript: null, readyState: "complete",
  };
  const doc = new Proxy(RD, {
    get(t, k) {
      if (k === "documentElement") return html;
      if (k === "body") return body;
      if (k === "head") return head;
      if (k === "activeElement") return root.activeElement;
      if (typeof k === "string" && k in docOver) return docOver[k];
      return bindOf(t, Reflect.get(t, k, t));
    },
    set(t, k, v) { return Reflect.set(t, k, v, t); },
  });

  const G = {
    setTimeout: (fn: (...a: unknown[]) => void, ms?: number, ...a: unknown[]) => { if (dead) return 0; const id = RW.setTimeout(() => { timers.delete(id); if (!dead) fn(...a); }, ms); timers.add(id); return id; },
    clearTimeout: (id: number) => { RW.clearTimeout(id); timers.delete(id); },
    setInterval: (fn: (...a: unknown[]) => void, ms?: number, ...a: unknown[]) => { if (dead) return 0; const id = RW.setInterval(() => { if (!dead) fn(...a); }, ms); ivs.add(id); return id; },
    clearInterval: (id: number) => { RW.clearInterval(id); ivs.delete(id); },
    requestAnimationFrame: (fn: FrameRequestCallback) => { if (dead) return 0; const id = RW.requestAnimationFrame((t) => { rafs.delete(id); if (!dead) fn(t); }); rafs.add(id); return id; },
    cancelAnimationFrame: (id: number) => { RW.cancelAnimationFrame(id); rafs.delete(id); },
    requestIdleCallback: (fn: IdleRequestCallback, o?: IdleRequestOptions) => { if (dead) return 0; if (!RW.requestIdleCallback) return G.setTimeout(() => fn({ didTimeout: true, timeRemaining: () => 0 }), 1); const id = RW.requestIdleCallback((d) => { idles.delete(id); if (!dead) fn(d); }, o); idles.add(id); return id; },
    addEventListener: listen(RW), removeEventListener: unlisten(RW),
    ResizeObserver: class extends RW.ResizeObserver { constructor(cb: ResizeObserverCallback) { super(cb); obs.add(this); } },
    MutationObserver: class extends RW.MutationObserver { constructor(cb: MutationCallback) { super(cb); obs.add(this); } },
    IntersectionObserver: class extends RW.IntersectionObserver { constructor(cb: IntersectionObserverCallback, o?: IntersectionObserverInit) { super(cb, o); obs.add(this); } },
    fetch: (u: RequestInfo | URL, o?: RequestInit) => RW.fetch(typeof u === "string" ? new URL(u, RW.location.origin + "/").href : u, o),   // 원본 문서는 에디터 뿌리(/)에 있었다 = 상대 주소는 뿌리 기준
    parent: fakeParent, scrollX: 0, scrollY: 0,
  };
  const winOver: Record<string, unknown> = { ...G, top: fakeParent, pageXOffset: 0, pageYOffset: 0, document: doc,
    open: (u?: string | URL, t?: string, f?: string) => RW.open(u, t ?? "_blank", f) };
  const win: Window = new Proxy(RW, {
    get(t, k) {
      if (k === "innerWidth") return el.clientWidth;
      if (k === "innerHeight") return el.clientHeight;
      if (k === "window" || k === "self" || k === "globalThis") return win;
      if (typeof k === "string" && k in winOver) return winOver[k];
      return bindOf(t, Reflect.get(t, k, t));
    },
    set(t, k, v) { return Reflect.set(t, k, v, t); },   // 원본이 창에 다는 이름(ModernGallery · NMUA …)은 앱 창에 그대로 — 엔진이 맨이름으로 다시 부름
    has(t, k) { return Reflect.has(t, k); },
  }) as unknown as Window;

  let first = true;
  const ro = new RW.ResizeObserver(() => { if (first) { first = false; return; } if (dead) return; const e = new Event("resize"); for (const f of [...resize]) { try { f.call(win, e); } catch (x) { console.error("[홈 덱] resize", x); } } });
  ro.observe(el);

  try { runDeck(win, doc, G); } catch (e) { console.error("[홈 덱] 시작 실패", e); }

  const post = (type: string, detail: Record<string, unknown> = {}) => {
    if (dead) return;
    const ev = { origin: RW.location.origin, source: fakeParent, data: { channel: DECK_CHANNEL, type, ...detail } };
    for (const f of [...down]) { try { f(ev); } catch (x) { console.error("[홈 덱] 글 받기", x); } }
  };
  return {
    post, root, html, host: el,
    tone: (css) => { toneEl.textContent = scopeTone(css); },
    ask: (type, ms = 1000) => new Promise((res) => {
      if (dead) return res(null);
      const t = RW.setTimeout(() => { waits.delete(on); res(null); }, ms);
      const on = (m: DeckMsg) => { if (!m || m.channel !== DECK_CHANNEL || m.type !== type) return; RW.clearTimeout(t); waits.delete(on); res(m); };
      waits.add(on);
      post(type);
    }),
    dispose: () => {
      if (dead) return; dead = true;
      try { (RW as unknown as { ModernGallery?: { cancel?: () => void } }).ModernGallery?.cancel?.(); } catch { /* 이미 멈춤 */ }
      ro.disconnect();
      for (const id of timers) RW.clearTimeout(id);
      for (const id of ivs) RW.clearInterval(id);
      for (const id of rafs) RW.cancelAnimationFrame(id);
      for (const id of idles) RW.cancelIdleCallback?.(id);
      for (const o of obs) { try { o.disconnect(); } catch { /* 이미 끊김 */ } }
      for (const f of offs) { try { f(); } catch { /* 이미 걷음 */ } }
      down.clear(); resize.clear(); waits.clear();
      el.remove();
    },
  };
}
