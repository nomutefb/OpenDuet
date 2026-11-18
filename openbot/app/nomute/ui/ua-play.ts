// 아이콘 누름 재생 — 줄을 누르면 그 줄 아이콘이 같은 자리에서 한 번 움직이고(강조색) 원 아이콘으로 돌아옴
//   원본 = nomutefb/editor viewer/nm-ua.js(형 10-24 「재생 좋은데? 가능한 재생 모두 적용 · 누를 때 색이 변하면서」) · 엔진 · 자료 = nomutefb/react-useanimations(MIT · ../vendor/useanimations/)
//   그대로 옮긴 것: 겹칠 자리 = 원 아이콘 상자를 Lottie 판 배율(32 ÷ 24)만큼 넓힌 같은 중심 · 재생 동안만 원 아이콘 숨김 · 연타 = 처음부터 다시 · 제 길이의 2배 안전판 · 색 = currentColor 로 바꿔 --accent
//   정원 판에서 다른 것: 짝 = 설정 줄 아이콘(예타 픽토 이름 → useAnimations 이름 · 아래 MAP) · 엔진 + 자료(75KB)는 설정을 처음 열고 한가할 때 받음(안 열면 0) · 못 받으면 조용히 안 움직임
//   쉼: 움직임 줄이기(기기 설정 · 앱 스위치 ./less-move.ts) = 재생 0
import { still } from "./less-move";
import { type Anim, uaGuardMs } from "./ua-map";
export { UA_MAP } from "./ua-map";

type Player = { play(): void; goToAndStop(f: number): void; setDirection(d: number): void; addEventListener(t: string, f: () => void): void; destroy(): void };
type Lib = { loadAnimation(o: { container: Element; animationData: unknown }): Player; icons: Record<string, Anim> };
let lib: Lib | null = null, libP: Promise<Lib | null> | null = null;
const CSS_ID = "nm-ua-css";
function css() {
  if (document.getElementById(CSS_ID)) return;
  const st = document.createElement("style"); st.id = CSS_ID;
  // Lottie 잉크(진한 획 · 검정 채움) = currentColor · 흰 녹아웃 = 바탕(원본 nm-ua.js 문법 그대로)
  st.textContent = ".nm-uaplay{position:absolute;pointer-events:none;color:var(--accent,#CFFF40);line-height:0}"
    + ".nm-uaplay svg{display:block;width:100%;height:100%;overflow:visible}"
    + '.nm-uaplay path[stroke^="rgb"]:not([stroke="rgb(255,255,255)"]){stroke:currentColor}'
    + '.nm-uaplay path[fill="rgb(0,0,0)"]{fill:currentColor}'
    + '.nm-uaplay path[stroke="rgb(255,255,255)"]{stroke:var(--bg,Canvas)}'
    + '.nm-uaplay path[fill="rgb(255,255,255)"]{fill:var(--bg,Canvas)}';
  document.head.appendChild(st);
}
/** 엔진 + 자료를 미리 받아 둠(한가할 때 한 번) */
export function uaWarm(): Promise<Lib | null> {
  return (libP ||= Promise.all([import("../vendor/useanimations/player.js"), import("../vendor/useanimations/icons.js")])
    .then(([p, i]) => { lib = { loadAnimation: (p as unknown as Lib).loadAnimation, icons: (i as unknown as { default: Record<string, Anim> }).default }; css(); return lib; })
    .catch(() => { libP = null; return null; }));
}
const live = new WeakMap<Element, () => void>();   // svg → 진행 중 재생(같은 아이콘 연타 = 처음부터 다시)
function place(box: HTMLElement, svg: Element, k: number) {
  const r = svg.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  const cb = box.offsetParent as HTMLElement | null;
  let ox: number, oy: number;
  if (!cb || (cb === document.body && getComputedStyle(cb).position === "static")) { ox = -scrollX; oy = -scrollY; }
  else { const c = cb.getBoundingClientRect(); ox = c.left + cb.clientLeft - cb.scrollLeft; oy = c.top + cb.clientTop - cb.scrollTop; }
  const w = r.width * k, h = r.height * k;
  box.style.width = `${w}px`; box.style.height = `${h}px`;
  box.style.left = `${r.left - ox - (w - r.width) / 2}px`; box.style.top = `${r.top - oy - (h - r.height) / 2}px`;
  return true;
}
/** 그 아이콘(svg) 자리에 name 판을 한 번 재생 — 받은 게 없거나 · 줄이기 · 짝 없음 = false(아무 일 없음) */
export function uaPlay(svg: SVGElement | null, name: string | undefined): boolean {
  if (!lib || !svg || !name || still() || !svg.parentElement) return false;
  const A = lib.icons[name]; if (!A) return false;
  live.get(svg)?.();
  const box = document.createElement("span"); box.className = "nm-uaplay"; box.setAttribute("aria-hidden", "true");
  svg.parentElement.appendChild(box);
  const k = (A.w || 24) / 24;
  if (!place(box, svg, k)) { box.remove(); return false; }
  let p: Player;
  try { p = lib.loadAnimation({ container: box, animationData: A }); } catch { box.remove(); return false; }
  const vis = svg.style.visibility; svg.style.visibility = "hidden";
  let raf = 0, done = false, guard = 0;
  const end = () => { if (done) return; done = true; cancelAnimationFrame(raf); window.clearTimeout(guard); try { p.destroy(); } catch { /* 이미 걷힘 */ } box.remove(); if (svg.isConnected) svg.style.visibility = vis; live.delete(svg); };
  const watch = () => { if (!svg.isConnected || !box.isConnected || !place(box, svg, k)) { end(); return; } raf = requestAnimationFrame(watch); };
  live.set(svg, end);
  p.addEventListener("complete", end);
  p.goToAndStop(0); p.setDirection(1); p.play();
  raf = requestAnimationFrame(watch);
  guard = window.setTimeout(end, uaGuardMs(A));
  return true;
}
