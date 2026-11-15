// 자리 옮김을 부드럽게(FLIP) — 줄이 바뀌면(칸 옮김 · 차례 바뀜 · 보드 ↔ 목록) 카드가 앞 자리에서 새 자리로 미끄러짐
//   형 11-16 03:0x 영상(「Agent inbox」 = 카드가 칸 사이를 날아 옮김 · 보드 ↔ 목록도 같은 카드가 제자리로)
//   배치는 한 번에 끝난 뒤(뒤 값), 앞 자리와의 차이만큼 transform 으로 되돌렸다가 0 으로 — 움직임 = transform · opacity · filter 만(Web Animations · 합성 층)
//   sig = 배치가 달라지는 때만 바뀌는 글자(카드 차례 · 칸 · 보기) — 초가 차오르는 다시 그림에는 안 돎 · 「움직임 줄이기」 = 0
import { type RefObject, useLayoutEffect, useRef } from "react";

const EASE = "cubic-bezier(.22,1,.36,1)", MS = 480;

/** 감싼 칸 ref — 그 안 [data-flip="<열쇠>"] 들을 따라 옮김. */
export function useFlip(sig: string): RefObject<HTMLDivElement | null> {
  const box = useRef<HTMLDivElement | null>(null), was = useRef<Map<string, { x: number; y: number }> | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-flip]")];
    for (const it of items) for (const a of it.getAnimations()) if (a.id === "flip") a.cancel();   // 도는 중이던 옮김을 걷고 진짜 자리를 잼
    const now = new Map<string, { x: number; y: number }>();
    for (const it of items) { const r = it.getBoundingClientRect(); now.set(it.dataset.flip || "", { x: r.left, y: r.top + el.scrollTop }); }
    const old = was.current;
    was.current = now;
    if (!old || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    for (const it of items) {
      if (typeof it.animate !== "function") return;
      const k = it.dataset.flip || "", a = old.get(k), b = now.get(k)!;
      if (!a) { it.animate([{ opacity: 0, transform: "scale(.96)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: MS, easing: EASE }).id = "flip"; continue; }   // 새 카드 = 번지며 나타남
      const dx = a.x - b.x, dy = a.y - b.y;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      it.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: MS, easing: EASE }).id = "flip";
    }
  }, [sig]);
  return box;
}
