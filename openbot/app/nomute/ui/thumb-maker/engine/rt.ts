// @ts-nocheck
// 썸네일 생성기 엔진 런타임 — 원본은 iframe 한 장(제 문서·제 창)을 통째로 썼다 → 앱 안에서는 「이 화면 틀」을 그 문서·창처럼 보이게 한다
//   document = 뿌리(.nm-tm) 안만 찾는 문서 · documentElement = .nm-tm · body = .nm-tm-body(원본 CSS 의 html·body 자리)
//   window = 스크롤·폭·높이·폭 미디어 질의가 틀(.tm-frame = 옛 iframe 자리) 기준 · parent·top·self = 자기(앱 안 = 품은 창 아님)
//   타이머·관찰자·문서/창 듣기 = 다 적어 두었다가 창 닫으면(dispose) 한 번에 걷음 — 원본 iframe 이 닫히며 같이 사라지던 것과 같은 끝
//   원본 엔진 조각(./p01-core …)은 이 이름들을 import 해서 전역 대신 씀(codemod 가 그렇게 바꿈)
const RD = globalThis.document, RW = globalThis.window;

let C = null;   // 지금 열린 화면 { root, body, frame, scroller, doc, win, dead, timers, ivs, rafs, idles, obs, offs, keys, mqs }

export let document = RD;
export let window = RW;
export let parent = RW, top = RW, self = RW;
export let innerHeight = RW.innerHeight, innerWidth = RW.innerWidth;
export let scrollY = 0, pageYOffset = 0;

/* ── 타이머(닫힌 뒤엔 안 걺 · 닫을 때 다 지움) ── */
export function setTimeout(fn, ms, ...a) {
  const c = C; if (!c || c.dead) return 0;
  const id = RW.setTimeout(() => { c.timers.delete(id); if (!c.dead) fn(...a); }, ms);
  c.timers.add(id); return id;
}
export function clearTimeout(id) { RW.clearTimeout(id); if (C) C.timers.delete(id); }
export function setInterval(fn, ms, ...a) {
  const c = C; if (!c || c.dead) return 0;
  const id = RW.setInterval(() => { if (!c.dead) fn(...a); }, ms);
  c.ivs.add(id); return id;
}
export function clearInterval(id) { RW.clearInterval(id); if (C) C.ivs.delete(id); }
export function requestAnimationFrame(fn) {
  const c = C; if (!c || c.dead) return 0;
  const id = RW.requestAnimationFrame((t) => { c.rafs.delete(id); if (!c.dead) fn(t); });
  c.rafs.add(id); return id;
}
export function cancelAnimationFrame(id) { RW.cancelAnimationFrame(id); if (C) C.rafs.delete(id); }
export function requestIdleCallback(fn, o) {
  const c = C; if (!c || c.dead) return 0;
  if (!RW.requestIdleCallback) return setTimeout(() => fn({ didTimeout: true, timeRemaining: () => 0 }), 1);
  const id = RW.requestIdleCallback((d) => { c.idles.delete(id); if (!c.dead) fn(d); }, o);
  c.idles.add(id); return id;
}
export function cancelIdleCallback(id) { if (RW.cancelIdleCallback) RW.cancelIdleCallback(id); if (C) C.idles.delete(id); }

/* ── 관찰자(닫을 때 다 끊음) ── */
const track = (o) => { if (C) C.obs.push(o); return o; };
export class MutationObserver extends RW.MutationObserver { constructor(cb) { super(cb); track(this); } }
export class ResizeObserver extends RW.ResizeObserver { constructor(cb) { super(cb); track(this); } }
export class IntersectionObserver extends RW.IntersectionObserver { constructor(cb, o) { super(cb, o); track(this); } }

/* ── 듣기(닫을 때 다 뗌) ── */
function on(c, t, ty, fn, o) { if (!fn) return; t.addEventListener(ty, fn, o); c.offs.push([t, ty, fn, o]); }
function off(c, t, ty, fn, o) {
  t.removeEventListener(ty, fn, o);
  const cap = !!(typeof o === "object" ? o && o.capture : o);
  const i = c.offs.findIndex(([t2, ty2, f2, o2]) => t2 === t && ty2 === ty && f2 === fn && !!(typeof o2 === "object" ? o2 && o2.capture : o2) === cap);
  if (i >= 0) c.offs.splice(i, 1);
}
export function addEventListener(ty, fn, o) { window.addEventListener(ty, fn, o); }
export function removeEventListener(ty, fn, o) { window.removeEventListener(ty, fn, o); }
export function scrollTo(a, b) { window.scrollTo(a, b); }
export function scrollBy(a, b) { window.scrollBy(a, b); }

/* ── 폭·높이 미디어 질의 = 틀 기준(원본 iframe 폭) · 나머지(hover·pointer·motion)는 진짜 창 ── */
const WQ = /\((?:min|max)-(?:width|height)\s*:/;
function evalQ(q, w, h) {
  return q.split(/\s*,\s*/).some((one) => {
    let neg = false, s = one.trim();
    if (/^not\s+/i.test(s)) { neg = true; s = s.replace(/^not\s+(all\s+and\s+)?/i, ""); }
    const ok = s.split(/\s+and\s+/i).every((part) => {
      const m = part.match(/\((min|max)-(width|height)\s*:\s*([\d.]+)px\)/i);
      if (!m) { const t = part.replace(/^(only\s+)?(screen|all)$/i, ""); return !t.trim() || RW.matchMedia(t).matches; }
      const v = m[2].toLowerCase() === "width" ? w : h, n = parseFloat(m[3]);
      return m[1].toLowerCase() === "min" ? v >= n : v <= n;
    });
    return neg ? !ok : ok;
  });
}
export function matchMedia(q) {
  const c = C;
  if (!c || !WQ.test(q)) return RW.matchMedia(q);
  const test = () => evalQ(q, c.frame.clientWidth, c.frame.clientHeight);
  const ls = new Set();
  const mq = {
    media: q, onchange: null, _last: test(), _ls: ls,
    get matches() { return test(); },
    addEventListener: (_t, f) => ls.add(f), removeEventListener: (_t, f) => ls.delete(f),
    addListener: (f) => ls.add(f), removeListener: (f) => ls.delete(f),
    _tick() { const now = test(); if (now !== mq._last) { mq._last = now; const ev = { matches: now, media: q }; ls.forEach((f) => { try { f(ev); } catch (_) {} }); if (mq.onchange) try { mq.onchange(ev); } catch (_) {} } },
  };
  c.mqs.push(mq);
  return mq;
}

/* ── 상대 주소 = 에디터 뿌리(/) 기준 — 원본 문서는 edit.nomute.kr/thumb 라 'thumb-hist.json'·'api/dl?u=…'·'comp_out/…' 가 /… 로 풀렸다 · 앱 문서(/office-app/)에선 그대로 두면 엉뚱한 곳으로 감 ── */
const ABS = /^([a-z][a-z0-9+.-]*:|\/|#|\?)/i;
export const rebase = (u) => { const s = u == null ? "" : String(u); return !s || ABS.test(s) ? s : "/" + s.replace(/^\.\//, ""); };
export function fetch(input, init) { return RW.fetch(typeof input === "string" ? rebase(input) : input, init); }
const URL_KEYS = ["src", "href", "poster"];
/** 그 요소 하나만 src·href·poster 넣을 때 상대 주소를 뿌리 기준으로(전역 프로토타입은 안 건드림) */
function guardUrls(el) {
  for (const k of URL_KEYS) {
    let p = Object.getPrototypeOf(el), d = null;
    while (p && !(d = Object.getOwnPropertyDescriptor(p, k))) p = Object.getPrototypeOf(p);
    if (!d || !d.set) continue;
    Object.defineProperty(el, k, { configurable: true, enumerable: true, get() { return d.get.call(el); }, set(v) { d.set.call(el, rebase(v)); } });
  }
  return el;
}
export function Image(w, h) { return guardUrls(new RW.Image(w, h)); }
/** innerHTML 로 들어온 상대 src·href(드묾 · 옛 이력 comp_out/… 등)는 붙자마자 고침 */
function fixTree(n) {
  if (!n || n.nodeType !== 1) return;
  const one = (el) => { for (const k of URL_KEYS) { const v = el.getAttribute && el.getAttribute(k); if (v && !ABS.test(v)) el.setAttribute(k, rebase(v)); } };
  one(n); n.querySelectorAll && n.querySelectorAll("[src],[href],[poster]").forEach(one);
}

/* ── 문서·창 대리 ── */
function makeDoc(c) {
  const own = {
    createElement: (tag, o) => { const el = RD.createElement(tag, o); return /^(img|a|video|audio|source|link|iframe)$/i.test(tag) ? guardUrls(el) : el; },
    getElementById: (id) => c.root.querySelector("#" + CSS.escape(id)) || RD.getElementById(id),
    querySelector: (s) => c.root.querySelector(s),
    querySelectorAll: (s) => c.root.querySelectorAll(s),
    getElementsByClassName: (n) => c.root.getElementsByClassName(n),
    getElementsByTagName: (n) => c.root.getElementsByTagName(n),
    addEventListener: (ty, fn, o) => on(c, RD, ty, fn, o),
    removeEventListener: (ty, fn, o) => off(c, RD, ty, fn, o),
  };
  return new Proxy(RD, {
    get(t, k) {
      if (k in own) return own[k];
      if (k === "body") return c.body;
      if (k === "documentElement") return c.root;
      if (k === "scrollingElement") return c.scroller;
      if (k === "defaultView") return c.win;
      if (k === "readyState") return "complete";
      const v = Reflect.get(t, k, t);
      return typeof v === "function" ? v.bind(t) : v;
    },
    set(t, k, v) { return Reflect.set(t, k, v, t); },
    has(t, k) { return Reflect.has(t, k); },
  });
}
function makeWin(c) {
  const fns = { setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame, requestIdleCallback, cancelIdleCallback, MutationObserver, ResizeObserver, IntersectionObserver, matchMedia, fetch, Image };
  const p = new Proxy(RW, {
    get(t, k) {
      switch (k) {
        case "window": case "self": case "parent": case "top": case "globalThis": case "frames": return p;
        case "frameElement": return null;
        case "document": return c.doc;
        case "addEventListener": return (ty, fn, o) => on(c, ty === "scroll" ? c.scroller : RW, ty, fn, o);
        case "removeEventListener": return (ty, fn, o) => off(c, ty === "scroll" ? c.scroller : RW, ty, fn, o);
        case "scrollTo": case "scroll": return (a, b) => (a && typeof a === "object" ? c.scroller.scrollTo(a) : c.scroller.scrollTo(a || 0, b || 0));
        case "scrollBy": return (a, b) => (a && typeof a === "object" ? c.scroller.scrollBy(a) : c.scroller.scrollBy(a || 0, b || 0));
        case "scrollY": case "pageYOffset": return c.scroller.scrollTop - c.frame.getBoundingClientRect().top;   // 「rect.top + pageYOffset」 = 틀 안 자리(원본 iframe 은 틀 꼭대기 = 0)
        case "scrollX": case "pageXOffset": return c.scroller.scrollLeft;
        case "innerHeight": return c.frame.clientHeight;
        case "innerWidth": return c.frame.clientWidth;
      }
      if (k in fns) return fns[k];
      const v = Reflect.get(t, k);
      return typeof v === "function" && typeof k === "string" && /^[a-z]/.test(k) ? v.bind(t) : v;
    },
    set(t, k, v) { if (!(k in t)) c.keys.add(k); t[k] = v; return true; },
    has(t, k) { return Reflect.has(t, k); },
  });
  return p;
}

/** 화면 열기 — 뿌리·몸·틀·스크롤을 받아 원본 전역을 그쪽으로 돌린다 · 돌려주는 함수 = 닫기(다 걷음) */
export function bindRuntime(root, body, frame, scroller) {
  if (C) disposeRuntime();
  const c = { root, body, frame, scroller, dead: false, timers: new Set(), ivs: new Set(), rafs: new Set(), idles: new Set(), obs: [], offs: [], keys: new Set(), mqs: [] };
  C = c;
  c.doc = makeDoc(c); c.win = makeWin(c);
  document = c.doc; window = c.win; parent = top = self = c.win;
  const size = () => {
    innerHeight = frame.clientHeight; innerWidth = frame.clientWidth;
    c.mqs.forEach((m) => m._tick());
  };
  size();
  const ro = new RW.ResizeObserver(size); ro.observe(frame); c.obs.push(ro);
  const sc = () => { scrollY = pageYOffset = scroller.scrollTop; };
  scroller.addEventListener("scroll", sc, { passive: true }); c.offs.push([scroller, "scroll", sc, { passive: true }]);
  const mo = new RW.MutationObserver((rs) => rs.forEach((r) => (r.type === "attributes" ? fixTree(r.target) : r.addedNodes.forEach(fixTree))));
  mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: URL_KEYS }); c.obs.push(mo);
  fixTree(root);
  return disposeRuntime;
}
export function disposeRuntime() {
  const c = C; if (!c) return;
  c.dead = true;
  c.timers.forEach((id) => RW.clearTimeout(id)); c.ivs.forEach((id) => RW.clearInterval(id));
  c.rafs.forEach((id) => RW.cancelAnimationFrame(id)); c.idles.forEach((id) => RW.cancelIdleCallback && RW.cancelIdleCallback(id));
  c.obs.forEach((o) => { try { o.disconnect(); } catch (_) {} });
  c.offs.forEach(([t, ty, fn, o]) => { try { t.removeEventListener(ty, fn, o); } catch (_) {} });
  c.keys.forEach((k) => { try { delete RW[k]; } catch (_) {} });
  C = null;
  document = RD; window = RW; parent = top = self = RW;
}
/** 지금 열린 화면 뿌리(엔진 밖 도우미용) */
export const rtRoot = () => (C ? C.root : null);
