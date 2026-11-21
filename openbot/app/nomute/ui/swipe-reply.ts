// 글 줄 왼쪽으로 밀기 = 답장(형 11-04 08:22 「좌측으로 채팅을 살짝 밀면 항상 회신으로 뜨면 좋을듯」 · 카톡 영상 97389 「보통 모션은 이렇게 작동해」)
//   손가락 따라 줄이 왼쪽으로 · 오른쪽 끝에 답장 화살표가 커지며 나옴 · 60px 넘기면 톡(진동) · 놓으면 답장 + 제자리로 튕김
//   세로가 먼저면 스크롤 그대로 · 가로로 굴러가는 칸(코드·표) · 영상 · 입력칸 · 둘의 방 알약 펼침(.ysent-talk) · 끌어 고르는 중인 말풍선([data-pick] · ./part-copy.ts) 안에서 시작하면 안 함
//   대화 상자 하나에 손 하나(줄마다 듣지 않음) · touchmove 는 막아야 해서 passive 아님
//   오른쪽으로 밀기 = 공유(「보낼 방」 바로) = 왼쪽 답장의 거울 · 같은 문턱(60) · 같은 끝(84) · 같은 튕김 · 왼쪽 끝에 공유 그림(형 11-21 08:45 dm-sia 시아 옮김 「글구 말풍선 옆에 공유버튼 미안한데 없앨게 쏘리. 대신 말풍선 좌측 당기면 답글이잖아 우측 당기면.공유로」)
import { buzz } from "./feel";   // 진동 = 설정 스위치 하나로(./feel.ts)
import { type RefObject, useEffect, useRef } from "react";

const SLOP = 8, FIRE = 60, MAX = 84;
const SHARE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>';   // 걷은 말풍선 옆 공유 그림과 같은 꼴
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';

const hScroll = (t: Element | null, stop: Element) => {
  for (let n = t; n && n !== stop; n = n.parentElement) if (n.scrollWidth > n.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(n).overflowX)) return true;
  return false;
};

/** 왼쪽(-1) = 답장 · 오른쪽(1) = 공유 · 가로가 세로보다 1.4배 넘게 먼저일 때만 · 공유 손 없으면 오른쪽은 스크롤로 둠(순수) */
export function swipeSide(mx: number, my: number, canShare: boolean): -1 | 1 | 0 {
  if (Math.abs(mx) <= Math.abs(my) * 1.4) return 0;
  return mx < 0 ? -1 : canShare ? 1 : 0;
}

/** live = 대화 상자가 그려진 방 이름(받는 중·둘의 방 = false) · 바뀌면 다시 붙음 · onShare = 오른쪽 밀기(없으면 왼쪽만) */
export function useSwipeReply(box: RefObject<HTMLElement | null>, onReply: (id: string) => void, live: string | false, onShare?: (id: string) => void) {
  const cb = useRef(onReply), sh = useRef(onShare);
  cb.current = onReply; sh.current = onShare;
  useEffect(() => {
    const el = box.current;
    if (!el || !live) return;
    let row: HTMLElement | null = null, ico: HTMLElement | null = null, x0 = 0, y0 = 0, dx = 0, lock: "" | "h" | "v" = "", armed = false, side: -1 | 1 = -1;
    const reset = () => {
      const r = row, i = ico;
      if (r) { r.style.transition = "transform .22s cubic-bezier(.2,.9,.3,1.25)"; r.style.transform = ""; window.setTimeout(() => { r.style.transition = ""; r.style.willChange = ""; }, 240); }
      if (i) { i.style.opacity = "0"; window.setTimeout(() => i.remove(), 180); }
      row = null; ico = null; lock = ""; dx = 0; armed = false; side = -1;
    };
    const start = (e: TouchEvent) => {
      if (row) reset();
      if (e.touches.length !== 1) return;
      const t = e.target as Element, r = t.closest<HTMLElement>("[data-id]");
      if (!r || !el.contains(r) || !r.querySelector(".yb") || r.closest(".ysent, .ysent-talk") || t.closest("video,input,textarea,.nm-msgm,[data-pick]") || hScroll(t, r)) return;
      row = r; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    };
    const move = (e: TouchEvent) => {
      if (!row || lock === "v") return;
      const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
      if (!lock) {
        if (Math.abs(mx) < SLOP && Math.abs(my) < SLOP) return;
        const to = swipeSide(mx, my, !!sh.current);
        if (to) { lock = "h"; side = to; }
        else { lock = "v"; row = null; return; }
        row.style.willChange = "transform";
        row.querySelector(".yb")?.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));   // 밀기 시작 = 길게 누르기 셈 멈춤(./msg-menu.tsx useLongPress · 밀다 멈춰 있어도 메뉴 안 뜸)
        const b = row.getBoundingClientRect(), box = el.getBoundingClientRect();
        ico = document.createElement("span");
        ico.className = "nm-swipe-ico"; ico.innerHTML = side < 0 ? ARROW : SHARE;
        ico.style.top = `${Math.round(b.top + Math.min(b.height, 120) / 2 - 16)}px`;
        ico.style.left = `${Math.round(side < 0 ? box.right - 44 : box.left + 12)}px`;   // 답장 = 오른쪽 끝 · 공유 = 왼쪽 끝(줄이 비켜 간 자리)
        document.body.append(ico);
      }
      if (e.cancelable) e.preventDefault();
      const pull = mx * side;   // 고른 쪽으로 당긴 만큼(왼쪽 답장 = 옛 -mx 그대로)
      dx = side * (pull <= FIRE ? pull : Math.min(MAX, FIRE + (pull - FIRE) * 0.35));   // 넘어서면 묵직하게
      row.style.transform = `translateX(${dx}px)`;
      const k = Math.min(1, (dx * side) / FIRE);
      if (ico) { ico.style.opacity = String(k); ico.style.transform = `scale(${0.55 + 0.45 * k})`; }
      const now = dx * side >= FIRE;
      if (now !== armed) { armed = now; ico?.classList.toggle("on", now); if (now) buzz(8); }
    };
    let calm = 0;
    const quiet = (e: Event) => { if (lock === "h" || Date.now() < calm) { e.preventDefault(); e.stopPropagation(); } };   // 미는 중·막 뗀 뒤 = 길게 누름 메뉴(contextmenu) 안 뜸
    const end = () => {
      if (lock === "h") calm = Date.now() + 400;
      if (lock === "h" && armed && row?.dataset.id) (side < 0 ? cb.current : sh.current)?.(row.dataset.id);
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
