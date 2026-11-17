// 「저 요소가 있으면」 표시 — 뿌리(html · body)와 대화 기둥(.nm-col)에 다는 속성(구름 11-17 · 봄 배분 09:45 「뿌리에 건 :has 조건을 html 클래스로 바꾸는 한 판」)
//   앞 = CSS 가 `:root:has(.nm-split-root) …` · `body:not(:has(.nm-split-root)) …` · `.nm-col:has(> .nm-chat-h) …` 로 물음
//     → 뿌리 · 기둥이 :has 의 닻이라, 그 밑 어디에 요소 하나가 꽂히거나 클래스 하나가 바뀌어도 그 밑 꼴을 통째로 다시 셈
//     실물(11-17 · 내 탭 PC 1440 · 요소 1.1만): 요소 하나 꽂기 55ms · 클래스 하나 61ms · 탭 고르기 58ms → 이 38줄을 빼면 0.1 ~ 1ms(도구/has-cost.mjs)
//   뒤 = 그 요소를 그리는 쪽이 표시를 닮: `:root[data-nm-split]` · `body:not([data-nm-split])` · `.nm-col[data-chat-h]`(속성 하나 = :has(.클래스) 하나와 무게가 같아 규칙 차례 그대로)
//   때 = 그리는 판 안(useInsertionEffect · 요소가 꽂히는 그 판 · 자리 재는 효과들보다 먼저) → 「표시 없이 한 번 그려졌다 바뀜」 0
import { type RefObject, useInsertionEffect, useLayoutEffect } from "react";

export const ROOT_FLAGS = ["split", "chat-h", "menubar", "see", "pinsheet"] as const;   // split = PC 두 칸(.nm-split-root) · chat-h = 대화 머리줄(.nm-chat-h) · menubar = 위 메뉴 줄 · see = 바탕 비치는 판(.nm-modal.see) · pinsheet = 공지 이력 판
export type RootFlag = (typeof ROOT_FLAGS)[number];
export const flagAttr = (name: RootFlag) => `data-nm-${name}`;
/** 순수 — 같은 표시를 여럿이 달 수 있음(대화 머리줄은 방마다 하나씩 살아 있음) → 센 값 · 속성을 달 때(0 → 1) · 뗄 때(1 → 0)만 손댐 */
export function flagStep(n: number, by: 1 | -1): { n: number; touch: "on" | "off" | null } {
  const next = Math.max(0, n + by);
  return { n: next, touch: n === 0 && next === 1 ? "on" : n === 1 && next === 0 ? "off" : null };
}
const count = new Map<RootFlag, number>();
const roots = () => [document.documentElement, document.body];
/** 이 컴포넌트가 그 요소를 그리는 동안(on) 뿌리에 표시 */
export function useRootFlag(name: RootFlag, on = true) {
  useInsertionEffect(() => {
    if (!on) return undefined;
    const a = flagStep(count.get(name) || 0, 1); count.set(name, a.n);
    if (a.touch === "on") for (const el of roots()) el.setAttribute(flagAttr(name), "");
    return () => {
      const b = flagStep(count.get(name) || 0, -1); count.set(name, b.n);
      if (b.touch === "off") for (const el of roots()) el.removeAttribute(flagAttr(name));
    };
  }, [name, on]);
}
/** 이 요소가 그려져 있는 동안 그 윗단 기둥(.nm-col)에 표시 · child = 기둥 바로 밑일 때만(`:has(> x)` 자리) */
export function useColFlag(ref: RefObject<HTMLElement | null>, attr: "data-pinsheet" | "data-room-mark", on = true, child = false) {
  useLayoutEffect(() => {
    const el = on ? ref.current : null, col = !el ? null : child ? (el.parentElement?.matches(".nm-col") ? el.parentElement : null) : el.closest<HTMLElement>(".nm-col");
    if (!col) return undefined;
    col.setAttribute(attr, "");
    return () => col.removeAttribute(attr);
  }, [ref, attr, on, child]);
}
