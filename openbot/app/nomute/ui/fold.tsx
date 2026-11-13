// 긴 글 접기 · 전체 보기(형 11-02 07:19 「긴 텍스트는 더 보기 / 전체 보기 라는 말로 축약해서 별도의 창에서 확인하고 돌아오게 해서 한 텍스트가 채팅창을 점령하는걸 막자는거임」 · 카톡 사진 97115·97117)
//   말풍선 = 17줄까지(11-02 21:34 14 → 17) · 넘치면 끝을 흐리고 아래 구분선 + 「전체 보기 ›」 · 누르면 글만 보는 창(위 꺽쇠 · 보낸 이·시각 · 가가 · 복사)
//   닫는 길 = 꺽쇠 · Esc · 폰 뒤로 = 하나(기록 한 칸 · 사진 크게 보기 zoomImage 와 같은 길 · .nm-zoom 이라 ui/shell.tsx 가 판을 안 옮김)
import { type ReactNode, type SyntheticEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./fold.css";
import { selfBack } from "./self-back";

// 말풍선 수백 개 = 지켜보는 눈 하나(글 칸 크기가 바뀌면 그 칸의 잼만 다시)
const looks = new WeakMap<Element, () => void>();
let ro: ResizeObserver | null = null;
const watch = (el: Element, look: () => void) => {
  ro ??= new ResizeObserver((es) => es.forEach((e) => looks.get(e.target)?.()));
  looks.set(el, look); ro.observe(el);
  return () => { looks.delete(el); ro?.unobserve(el); };
};

/** 긴 글이면 접고 「전체 보기」 · md = 봇 글(마크다운 · 줄바꿈은 꾸밈이 맡음) */
export function Folded({ children, text, who, when, md = false }: { children: ReactNode; text: string; who: string; when: string; md?: boolean }) {
  const box = useRef<HTMLDivElement | null>(null), inner = useRef<HTMLDivElement | null>(null);
  const [long, setLong] = useState(false), [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const b = box.current, i = inner.current;
    if (!b || !i) return;
    const look = () => setLong(i.offsetHeight > b.clientHeight + 4);
    look();
    return watch(i, look);
  }, []);
  return (
    <>
      <div ref={box} className={`yfold${long ? " long" : ""}`}><div ref={inner}>{children}</div></div>
      {long ? (
        <button type="button" className="yfold-more" onPointerDown={stop} onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
          <span>전체 보기</span><Chev />
        </button>
      ) : null}
      {open ? createPortal(<FullText text={text} who={who} when={when} md={md} onClose={() => setOpen(false)}>{children}</FullText>, document.body) : null}
    </>
  );
}

const stop = (e: SyntheticEvent) => e.stopPropagation();   // 창 안 누름이 말풍선(길게 누르기 · 고르기)까지 안 감(포털도 리액트 나무로는 말풍선 아래)
const SIZES = [15, 17, 20], SZ_KEY = "nm_full_sz";
const readSz = () => { try { const n = Number(localStorage.getItem(SZ_KEY)); return SIZES.includes(n) ? n : 17; } catch { return 17; } };

function FullText({ children, text, who, when, md, onClose }: { children: ReactNode; text: string; who: string; when: string; md: boolean; onClose: () => void }) {
  const [sz, setSz] = useState(readSz), [copied, setCopied] = useState(false);
  const pushed = useRef(false), closing = useRef(false);
  const back = () => { if (closing.current) return; closing.current = true; selfBack(); };
  useEffect(() => {
    if (!pushed.current) { pushed.current = true; history.pushState({ ...history.state, nmZoom: 1 }, ""); }
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") back(); };
    const pop = () => { window.setTimeout(onClose, 0); };   // 한 박자 늦게 닫음 = 같은 뒤로 신호를 받는 ui/shell.tsx 가 .nm-zoom 을 보고 판을 안 옮기게(먼저 닫으면 #/rooms 로 튕김 · 라이브 9222 11-02 07:4x)
    window.addEventListener("popstate", pop); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const bigger = () => { const n = SIZES[(SIZES.indexOf(sz) + 1) % SIZES.length]; setSz(n); try { localStorage.setItem(SZ_KEY, String(n)); } catch { /* 못 적어도 이번만 */ } };
  const copy = () => { void navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }); };
  return (
    <div className="nm-zoom nm-full" role="dialog" aria-modal="true" aria-label="전체 보기"
      onClick={stop} onPointerDown={stop} onPointerUp={stop} onPointerMove={stop} onContextMenu={stop}>
      <div className="nm-zoom-bar">
        <button type="button" aria-label="뒤로" onClick={back}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
        {who ? <b>{who}</b> : null}
        {when ? <small>{when}</small> : null}
        <span className="nm-full-sp" />
        <button type="button" className="nm-full-act" aria-label={`글자 크기 ${sz}`} onClick={bigger}>가<span>가</span></button>
        <button type="button" className="nm-full-act" aria-label="전체 복사" onClick={copy}>{copied ? "복사함" : <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></svg>}</button>
      </div>
      <div className={`nm-full-body ychat${md ? " md" : ""}`} style={{ fontSize: sz }}>{children}</div>
    </div>
  );
}

const Chev = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;
