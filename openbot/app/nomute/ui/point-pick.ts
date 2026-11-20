// 가리키기 — ⌥(Alt)를 누른 채 화면 요소를 누르면 그 요소가 글 한 덩어리로 입력칸에 붙음(셈 = ./point-pick-core.ts)
//   형 11-12 「내가 마우스로 가리키는 부분도 잇으니까」 · 형 11-21 「바로 개선점을 적용해줄 수 있어?」
//   화면에 얹는 것 0(단추 · 글 없음 · 형 11-20 「설명글이 있을필요는 없어」) — ⌥를 누르고 움직이는 동안만 테 하나가 요소를 따라감
//   누름 = 그 요소의 원래 동작은 안 함(단추가 눌리지 않음) → 입력칸이 떠 있으면 거기 끝에 붙이고, 늘 클립보드에도 넣음
//   가만히 둔 화면 = 도는 것 0(키 · 누름이 있을 때만 한 줄 판정) · 움직임 듣기는 ⌥ 누른 동안만 · 폰 = ⌥ 없음 = 아무 일도 안 함
import { appendToComposer } from "./call-sheet";
import { flash } from "./flash";
import { buzz } from "./feel";
import { type Facts, type Hop, pickText } from "./point-pick-core";
import "./point-pick.css";

declare const __NM_SHA__: string;
const SHA = (() => { try { return String(__NM_SHA__); } catch { return ""; } })();

let box: HTMLElement | null = null, cur: Element | null = null, on = false;

const deep = (e: Event): Element | null => { const t = (e.composedPath?.()[0] || e.target) as Node | null; return t instanceof Element ? t : t?.parentElement || null; };
const up = (el: Element): Element | null => el.parentElement || ((el.getRootNode() as ShadowRoot).host ?? null);   // 그림자 뿌리 = 주인으로 올라감

function hops(el: Element): Hop[] {
  const out: Hop[] = [];
  for (let n: Element | null = el; n && n !== document.documentElement && n !== document.body && out.length < 12; n = up(n)) {
    const tag = n.tagName.toLowerCase(), cls = typeof n.className === "string" ? n.className.split(/\s+/).filter(Boolean) : [...n.classList];
    out.unshift({ tag, ...(n.id && !/^(:|radix-|_r_)/.test(n.id) ? { id: n.id } : {}), cls, ...(!n.parentElement && n.getRootNode() instanceof ShadowRoot ? { shadow: true } : {}) });
  }
  return out;
}
const labelOf = (el: Element) => el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("alt") || el.getAttribute("placeholder") || (el as HTMLElement).innerText || el.textContent || "";

function facts(el: Element): Facts {
  const r = el.getBoundingClientRect(), cs = getComputedStyle(el), path = hops(el);
  const last = path[path.length - 1], same = el.parentElement ? [...el.parentElement.children].filter((s) => s.tagName === el.tagName) : [];
  if (last && same.length > 1) last.nth = same.indexOf(el) + 1;   // 같은 꼴 형제가 여럿일 때만 「몇째」(가리킨 요소 하나만)
  return { where: location.hash || location.pathname, sha: SHA, view: [innerWidth, innerHeight], path, label: labelOf(el), rect: [r.left, r.top, r.width, r.height],
    style: { fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, backgroundColor: cs.backgroundColor, borderTopWidth: cs.borderTopWidth, borderTopColor: cs.borderTopColor, borderRadius: cs.borderRadius, padding: cs.padding, gap: cs.gap } };
}

function show(el: Element | null) {
  if (el === cur) return;
  cur = el;
  if (!el) { box?.classList.remove("on"); return; }
  if (!box) { box = document.createElement("div"); box.className = "nm-point-box"; box.setAttribute("aria-hidden", "true"); document.body.appendChild(box); }
  const r = el.getBoundingClientRect();
  box.style.width = `${Math.max(1, r.width)}px`; box.style.height = `${Math.max(1, r.height)}px`;
  box.style.transform = `translate(${r.left}px, ${r.top}px)`;
  box.classList.add("on");
}
const move = (e: PointerEvent) => { if (!e.altKey) { stop(); return; } const el = deep(e); show(el && el !== box ? el : null); document.documentElement.classList.add("nm-pointing"); };
const eat = (e: Event) => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
const hold = (e: MouseEvent) => { if (e.altKey && e.button === 0) eat(e); };   // 누름 시작 · 끝 = 밑의 단추가 안 눌리게

function pick(e: MouseEvent) {
  if (!e.altKey || e.button !== 0) return;
  eat(e);
  const el = deep(e); if (!el || el === box) return;
  const text = pickText(facts(el));
  const put = appendToComposer(text);
  const copy: Promise<boolean> = navigator.clipboard?.writeText ? navigator.clipboard.writeText(text).then(() => true, () => false) : Promise.resolve(false);   // 클립보드 = 덤(권한 물음에 걸려도 알림은 안 기다림)
  if (put) flash("가리킴 → 입력칸", "ok", 1800);
  else void copy.then((ok) => flash(ok ? "가리킴 복사" : "가리킴 실패", ok ? "ok" : "bad", 1800));
  stop();
}

// 따라가는 테 = ⌥ 누른 동안만 움직임을 들음(가만히 둔 화면 = 움직임 듣기 0)
function start() {
  if (on) return;
  on = true;
  window.addEventListener("pointermove", move, true);
}
function stop() {
  if (!on) return;
  on = false;
  window.removeEventListener("pointermove", move, true);
  show(null); document.documentElement.classList.remove("nm-pointing");
}

// ── 폰(손가락) = 입력칸 ＋ 판 「가리키기」(./attach-sheet.tsx) → 켜진 동안 **길게 누르면** 그 요소가 잡힘 · 탭은 그대로(다른 화면으로 가서 눌러도 됨)
//   형은 폰으로 화면을 찍어 보내며 고칠 곳을 말함(11-21 「바로 개선점을 적용해줄 수 있어?」 · ⌥ 가 없는 폰에도 같은 손) · 켜진 표시 = 화면 둘레 라임 테 하나
//   길게 0.45초 = 잡힘 표시(테 + 진동) → 손을 뗄 때 글로 만듦(뗄 때라야 클립보드를 쓸 수 있음) · 입력칸이 없으면 맡아 뒀다가 대화창에 돌아오면 붙임
//   한 번 잡으면 꺼짐 · 90초 지나면 꺼짐 · 켜진 동안만 손가락 움직임을 들음(꺼져 있으면 도는 것 0)
const HOLD_MS = 450, ARM_MS = 90_000, KEEP_MS = 10 * 60_000;
let armed = false, armT = 0, pressT = 0, eatUntil = 0, frame: HTMLElement | null = null;
let press: { el: Element; x: number; y: number; ok: boolean } | null = null, pending: { text: string; at: number } | null = null;

const give = (text: string) => {   // 입력칸에 붙임 · 없으면 맡아 둠 · 클립보드는 덤
  const put = appendToComposer(text);
  const copy: Promise<boolean> = navigator.clipboard?.writeText ? navigator.clipboard.writeText(text).then(() => true, () => false) : Promise.resolve(false);
  if (put) flash("가리킴 → 입력칸", "ok", 1800);
  else { pending = { text, at: Date.now() }; void copy.then((ok) => flash(ok ? "가리킴 복사" : "가리킴 맡아 둠", "ok", 1800)); }
};
const dropPress = () => { window.clearTimeout(pressT); if (press?.ok) show(null); press = null; };
const tStart = (e: TouchEvent) => {
  dropPress();
  if (e.touches.length !== 1) return;
  const el = deep(e), t = e.touches[0]!; if (!el || el === box || el === frame) return;
  press = { el, x: t.clientX, y: t.clientY, ok: false };
  pressT = window.setTimeout(() => { if (!press) return; press.ok = true; show(press.el); buzz(12); }, HOLD_MS);
};
const tMove = (e: TouchEvent) => { const t = e.touches[0]; if (press && t && Math.hypot(t.clientX - press.x, t.clientY - press.y) > 10) dropPress(); };
const tEnd = (e: TouchEvent) => {
  const p = press; window.clearTimeout(pressT); press = null;
  if (!p?.ok) return;
  if (e.cancelable) e.preventDefault();   // 뗀 뒤 따라오는 누름(click)이 밑의 단추를 누르지 않게
  eatUntil = Date.now() + 800;
  give(pickText(facts(p.el)));
  disarm();
};
const noMenu = (e: Event) => { if (press) e.preventDefault(); };   // 길게 누름 메뉴(안드로이드) 대신 가리킴
const eatLate = (e: Event) => { if (Date.now() < eatUntil) eat(e); };

/** ＋ 판 「가리키기」 — 켜기(이미 켜져 있으면 끄기) */
export function armPointPick() {
  if (armed) { disarm(); return; }
  armed = true;
  if (!frame) { frame = document.createElement("div"); frame.className = "nm-point-frame"; frame.setAttribute("aria-hidden", "true"); document.body.appendChild(frame); }
  frame.classList.add("on"); document.documentElement.classList.add("nm-point-armed");
  window.addEventListener("touchstart", tStart, { capture: true, passive: true }); window.addEventListener("touchmove", tMove, { capture: true, passive: true });
  window.addEventListener("touchend", tEnd, { capture: true, passive: false }); window.addEventListener("touchcancel", dropPress, true);
  window.addEventListener("contextmenu", noMenu, true);
  flash("가리킬 곳을 길게 눌러", "ok", 2200);
  armT = window.setTimeout(disarm, ARM_MS);
}
function disarm() {
  if (!armed) return;
  armed = false; window.clearTimeout(armT); dropPress(); show(null);
  frame?.classList.remove("on"); document.documentElement.classList.remove("nm-point-armed");
  window.removeEventListener("touchstart", tStart, true); window.removeEventListener("touchmove", tMove, true);
  window.removeEventListener("touchend", tEnd, true); window.removeEventListener("touchcancel", dropPress, true);
  window.removeEventListener("contextmenu", noMenu, true);
}
/** 맡아 둔 가리킴 = 대화창에 돌아오면 입력칸에 붙임(10분 안 · 한 번) */
function handBack(tries = 6) {
  if (!pending) return;
  if (Date.now() - pending.at > KEEP_MS) { pending = null; return; }
  if (!/^#?\/(channels|group)\//.test(location.hash || "")) return;
  if (appendToComposer(pending.text)) { pending = null; flash("가리킴 → 입력칸", "ok", 1500); return; }
  if (tries > 0) window.setTimeout(() => handBack(tries - 1), 400);   // 입력칸이 뜰 때까지 조금 기다림(화면 넘어가는 동안)
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("keydown", (e) => { if (e.key === "Alt" && !e.repeat && !e.metaKey && !e.ctrlKey) start(); else if (on && e.key !== "Alt") stop(); }, true);   // ⌥ + 다른 키(⌥L 가림 · 특수 글자) = 가리키기 아님
  window.addEventListener("keyup", (e) => { if (e.key === "Alt") stop(); }, true);
  // 누름 = 늘 들음(누를 때만 도는 값싼 듣기 · ⌥를 다른 창에서부터 누르고 들어와도 먹게) — ⌥ 아닌 누름은 그대로 지나감
  window.addEventListener("pointerdown", hold, true); window.addEventListener("mousedown", hold, true); window.addEventListener("mouseup", hold, true);
  window.addEventListener("click", pick, true);
  window.addEventListener("click", eatLate, true);   // 손가락 길게 누름 뒤 따라오는 누름 하나 삼킴(그때만 · 그 밖엔 그대로 지나감)
  window.addEventListener("hashchange", () => handBack());
  window.addEventListener("blur", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
}
