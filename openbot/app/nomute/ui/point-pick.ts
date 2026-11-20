// 가리키기 — ⌥(Alt)를 누른 채 화면 요소를 누르면 그 요소가 글 한 덩어리로 입력칸에 붙음(셈 = ./point-pick-core.ts)
//   형 11-12 「내가 마우스로 가리키는 부분도 잇으니까」 · 형 11-21 「바로 개선점을 적용해줄 수 있어?」
//   화면에 얹는 것 0(단추 · 글 없음 · 형 11-20 「설명글이 있을필요는 없어」) — ⌥를 누르고 움직이는 동안만 테 하나가 요소를 따라감
//   누름 = 그 요소의 원래 동작은 안 함(단추가 눌리지 않음) → 입력칸이 떠 있으면 거기 끝에 붙이고, 늘 클립보드에도 넣음
//   가만히 둔 화면 = 도는 것 0(키 · 누름이 있을 때만 한 줄 판정) · 움직임 듣기는 ⌥ 누른 동안만 · 폰 = ⌥ 없음 = 아무 일도 안 함
import { appendToComposer } from "./call-sheet";
import { flash } from "./flash";
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

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("keydown", (e) => { if (e.key === "Alt" && !e.repeat && !e.metaKey && !e.ctrlKey) start(); else if (on && e.key !== "Alt") stop(); }, true);   // ⌥ + 다른 키(⌥L 가림 · 특수 글자) = 가리키기 아님
  window.addEventListener("keyup", (e) => { if (e.key === "Alt") stop(); }, true);
  // 누름 = 늘 들음(누를 때만 도는 값싼 듣기 · ⌥를 다른 창에서부터 누르고 들어와도 먹게) — ⌥ 아닌 누름은 그대로 지나감
  window.addEventListener("pointerdown", hold, true); window.addEventListener("mousedown", hold, true); window.addEventListener("mouseup", hold, true);
  window.addEventListener("click", pick, true);
  window.addEventListener("blur", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
}
