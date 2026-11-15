// 폴더 탭 줄(./teams.css .nm-tswitch.fold = 대화 판 · 뉴스 에디터 · 서랍 위 탭) — 탭을 바꾸면 고른 탭 바탕이 옆으로 미끄러짐
//   형 11-16 02:2x(영상 = 폴더 탭이 August → September → October 로 미끄러짐 · 뉴스 에디터 위 탭 사진)
//   「상단에 탭들 이 부분도 전환할때 부드럽게 스위칭 되게해주라 옮기는 형태가 아닐시에는 첨부2처럼 고프레임으루 부드럽게」
//   앞 판 = 고른 탭만 넓어지는데(flex 1) 그 넓이 바뀜이 뚝 끊기고 바탕색만 흐려졌다 켜짐.
//   지금 = ① 바탕(어깨 곡선까지) 한 장(.nm-fold-ink)이 고른 자리로 미끄러짐 — 고른 탭 넓이는 어느 탭이든 같아서(나머지 = 44 고정) 옮기기만 하면 됨
//          ② 아이콘은 앞 자리에서 새 자리로 따라 옮김(FLIP) ③ 이름 = 옮기는 것이 아니라 번지며 나타남(재확인 단추와 같은 결 · ./go-button.css)
//   움직임 = transform · opacity · filter 만(Web Animations · 합성 층 = 60fps · 배치는 탭을 누른 그 한 번만 셈) · 「움직임 줄이기」 = 바로
//   탭 줄이 화면마다 새로 뜨는 자리(서랍 · 뉴스 에디터 = 길이 바뀌면 다시 그림)도 이어지게 = 마지막 자리(줄 이름마다)를 잠깐(0.6초) 기억
import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

type Snap = { on: number; x: number; ic: number[]; t: number };
const last = new Map<string, Snap>();
const EASE = "cubic-bezier(.22,1,.36,1)", MS = 440, KEEP = 600;

/** name = 줄 이름(기억 열쇠) · cur = 지금 고른 탭(바뀌면 움직임) → 탭 줄 div 에 걸 ref. 줄 안 첫 자식으로 <i className="nm-fold-ink" aria-hidden /> 를 둠. */
export function useFoldInk(name: string, cur: string): RefObject<HTMLDivElement | null> {
  const bar = useRef<HTMLDivElement | null>(null), mine = useRef<Snap | null>(null);
  const read = (): { el: HTMLDivElement; ink: HTMLElement; tabs: HTMLElement[]; snap: Snap } | null => {
    const el = bar.current, ink = el?.querySelector<HTMLElement>(":scope > .nm-fold-ink");
    if (!el || !ink) return null;
    const tabs = [...el.querySelectorAll<HTMLElement>(":scope > .nm-ftab")], on = tabs.findIndex((t) => t.classList.contains("on"));
    const box = el.getBoundingClientRect().left;
    const ic = tabs.map((t) => (t.firstElementChild ? t.firstElementChild.getBoundingClientRect().left - box : 0));   // 아이콘 왼쪽 끝(줄 기준)
    const o = on >= 0 ? tabs[on] : null;
    if (o) { ink.style.width = `${o.offsetWidth}px`; ink.style.transform = `translateX(${o.offsetLeft}px)`; ink.style.opacity = "1"; } else ink.style.opacity = "0";
    el.dataset.ink = "";   // 바탕 = 이 한 장이 맡음(탭 제 바탕 · 어깨 곡선은 CSS 가 끔)
    return { el, ink, tabs, snap: { on, x: o ? o.offsetLeft : 0, ic, t: Date.now() } };
  };
  useLayoutEffect(() => {
    const now = read();
    if (!now) return;
    const kept = last.get(name), was = mine.current || (kept && Date.now() - kept.t < KEEP ? kept : null);
    mine.current = now.snap; last.set(name, now.snap);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!was || was.on === now.snap.on || was.on < 0 || now.snap.on < 0 || still || typeof now.ink.animate !== "function") return;
    const opt = { duration: MS, easing: EASE };
    now.ink.animate([{ transform: `translateX(${was.x}px)` }, { transform: `translateX(${now.snap.x}px)` }], opt);
    now.tabs.forEach((t, i) => {
      const dx = (was.ic[i] ?? now.snap.ic[i]) - now.snap.ic[i];
      const kids = [...t.children] as HTMLElement[];
      if (dx) for (const k of kids) if (!k.classList.contains("nm-ftab-nm")) k.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], opt);
      if (i === now.snap.on) for (const k of kids) if (k.classList.contains("nm-ftab-nm")) k.animate([{ opacity: 0, filter: "blur(6px)", transform: `translateX(${dx}px) scale(.94)` }, { opacity: 0, filter: "blur(6px)", offset: 0.3 }, { opacity: 1, filter: "blur(0)", transform: "none" }], opt);
    });
  });   // 그릴 때마다(값싼 재기 · 고른 탭이 바뀐 때만 움직임)
  useEffect(() => {   // 창 폭 · 글꼴이 바뀌면 바탕 자리 다시(움직임 없이)
    const el = bar.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => { const now = read(); if (now) { mine.current = now.snap; last.set(name, now.snap); } });
    ro.observe(el);
    return () => { ro.disconnect(); const m = mine.current; if (m) last.set(name, { ...m, t: Date.now() }); };   // 떠날 때 시각 = 곧 새로 뜨는 줄이 이어받음
  }, [name]);   // eslint-disable-line react-hooks/exhaustive-deps
  void cur;
  return bar;
}
