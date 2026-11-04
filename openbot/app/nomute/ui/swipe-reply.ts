// 글 줄 왼쪽으로 밀기 = 답장(형 11-04 08:22 「좌측으로 채팅을 살짝 밀면 항상 회신으로 뜨면 좋을듯」 · 카톡 영상 97389 「보통 모션은 이렇게 작동해」)
//   손가락 따라 줄이 왼쪽으로 · 오른쪽 끝에 답장 화살표가 커지며 나옴 · 60px 넘기면 톡(진동) · 놓으면 답장 + 제자리로 튕김
//   세로가 먼저면 스크롤 그대로 · 가로로 굴러가는 칸(코드·표) · 영상 · 입력칸 · 둘의 방 알약 펼침(.ysent-talk) 안에서 시작하면 안 함
//   대화 상자 하나에 손 하나(줄마다 듣지 않음) · touchmove 는 막아야 해서 passive 아님
import { type RefObject, useEffect, useRef } from "react";

const SLOP = 8, FIRE = 60, MAX = 84;
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';

const hScroll = (t: Element | null, stop: Element) => {
  for (let n = t; n && n !== stop; n = n.parentElement) if (n.scrollWidth > n.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(n).overflowX)) return true;
  return false;
};

/** live = 대화 상자가 그려진 방 이름(받는 중·둘의 방 = false) · 바뀌면 다시 붙음 */
export function useSwipeReply(box: RefObject<HTMLElement | null>, onReply: (id: string) => void, live: string | false) {
  const cb = useRef(onReply);
  cb.current = onReply;
  useEffect(() => {
    const el = box.current;
    if (!el || !live) return;
    let row: HTMLElement | null = null, ico: HTMLElement | null = null, x0 = 0, y0 = 0, dx = 0, lock: "" | "h" | "v" = "", armed = false;
    const reset = () => {
      const r = row, i = ico;
      if (r) { r.style.transition = "transform .22s cubic-bezier(.2,.9,.3,1.25)"; r.style.transform = ""; window.setTimeout(() => { r.style.transition = ""; r.style.willChange = ""; }, 240); }
      if (i) { i.style.opacity = "0"; window.setTimeout(() => i.remove(), 180); }
      row = null; ico = null; lock = ""; dx = 0; armed = false;
    };
    const start = (e: TouchEvent) => {
      if (row) reset();
      if (e.touches.length !== 1) return;
      const t = e.target as Element, r = t.closest<HTMLElement>("[data-id]");
      if (!r || !el.contains(r) || !r.querySelector(".yb") || r.closest(".ysent, .ysent-talk") || t.closest("video,input,textarea,.nm-msgm") || hScroll(t, r)) return;
      row = r; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    };
    const move = (e: TouchEvent) => {
      if (!row || lock === "v") return;
      const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
      if (!lock) {
        if (Math.abs(mx) < SLOP && Math.abs(my) < SLOP) return;
        if (mx < 0 && -mx > Math.abs(my) * 1.4) lock = "h";
        else { lock = "v"; row = null; return; }
        row.style.willChange = "transform";
        row.querySelector(".yb")?.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));   // 밀기 시작 = 길게 누르기 셈 멈춤(./msg-menu.tsx useLongPress · 밀다 멈춰 있어도 메뉴 안 뜸)
        const b = row.getBoundingClientRect(), box = el.getBoundingClientRect();
        ico = document.createElement("span");
        ico.className = "nm-swipe-ico"; ico.innerHTML = ARROW;
        ico.style.top = `${Math.round(b.top + Math.min(b.height, 120) / 2 - 16)}px`;
        ico.style.left = `${Math.round(box.right - 44)}px`;
        document.body.append(ico);
      }
      if (e.cancelable) e.preventDefault();
      const pull = -mx;
      dx = -(pull <= FIRE ? pull : Math.min(MAX, FIRE + (pull - FIRE) * 0.35));   // 넘어서면 묵직하게
      row.style.transform = `translateX(${dx}px)`;
      const k = Math.min(1, -dx / FIRE);
      if (ico) { ico.style.opacity = String(k); ico.style.transform = `scale(${0.55 + 0.45 * k})`; }
      const now = -dx >= FIRE;
      if (now !== armed) { armed = now; ico?.classList.toggle("on", now); if (now) navigator.vibrate?.(8); }
    };
    let calm = 0;
    const quiet = (e: Event) => { if (lock === "h" || Date.now() < calm) { e.preventDefault(); e.stopPropagation(); } };   // 미는 중·막 뗀 뒤 = 길게 누름 메뉴(contextmenu) 안 뜸
    const end = () => {
      if (lock === "h") calm = Date.now() + 400;
      if (lock === "h" && armed && row?.dataset.id) cb.current(row.dataset.id);
      if (row || ico) reset();
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end, { passive: true });
    el.addEventListener("touchcancel", reset, { passive: true });
    el.addEventListener("contextmenu", quiet, true);
    return () => {
      el.removeEventListener("contextmenu", quiet, true);
      el.removeEventListener("touchstart", start); el.removeEventListener("touchmove", move); el.removeEventListener("touchend", end); el.removeEventListener("touchcancel", reset);
      reset();
    };
  }, [box, live]);
}
