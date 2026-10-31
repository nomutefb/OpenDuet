// 스크롤 날짜 = 글을 올려 보는 동안 오른쪽에 지금 보는 날짜가 스멀 떴다 사라짐(형 11-01 「스크롤 올리면 디테일인데 날짜가 스멀 투멍하게 우측에 나옴」 · 사진 = 카톡 「2026. 10. 24. 토」 · 스크롤 손잡이 높이를 따라감)
//   날짜 = 화면 위 끝을 지난 마지막 날짜 줄(.ydate data-ts · ./office-chat.tsx) · 맨 아래 근처 = 안 뜸 · 움직임이 멈추고 HOLD 뒤 사라짐 · 글자·자리는 DOM 에 바로(스크롤마다 다시 그리지 않음)
import { type RefObject, useEffect, useRef } from "react";

const HOLD = 900, TOP = 56, BOTTOM = 12, NEAR = 120;   // 위 = 떠 있는 방 이름 밑 · 아래 = 입력칸 위 · 맨 아래 이 안 = 안 뜸(새 글 올 때 안 깜빡임 · 뎅)
const label = (ts: number) => { const d = new Date(ts + 9 * 3600e3); return `${d.getUTCFullYear()}. ${d.getUTCMonth() + 1}. ${d.getUTCDate()}. ${"일월화수목금토"[d.getUTCDay()]}`; };

export function ScrollDate({ box }: { box: RefObject<HTMLDivElement | null> }) {
  const pill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const b = box.current, el = pill.current;
    if (!b || !el) return;
    let t = 0, raf = 0;
    const draw = () => {
      raf = 0;
      const max = b.scrollHeight - b.clientHeight, edge = b.getBoundingClientRect().top + TOP;
      let ts = 0;
      for (const d of b.querySelectorAll<HTMLElement>(".ydate[data-ts]")) {
        if (d.getBoundingClientRect().top > edge && ts) break;
        ts = Number(d.dataset.ts) || 0;
      }
      if (!ts || max - b.scrollTop < NEAR) { el.classList.remove("on"); return; }
      const text = label(ts);
      if (el.textContent !== text) el.textContent = text;
      const room = b.clientHeight - TOP - BOTTOM - el.offsetHeight;
      el.style.transform = `translateY(${Math.round(b.offsetTop + TOP + room * (b.scrollTop / max))}px)`;
      el.classList.add("on");
      clearTimeout(t);
      t = window.setTimeout(() => el.classList.remove("on"), HOLD);
    };
    const on = () => { raf ||= requestAnimationFrame(draw); };
    b.addEventListener("scroll", on, { passive: true });
    return () => { b.removeEventListener("scroll", on); clearTimeout(t); cancelAnimationFrame(raf); };
  }, [box]);
  return <div ref={pill} aria-hidden className="nm-sdate" />;
}
