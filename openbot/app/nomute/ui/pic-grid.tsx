// 사진 묶음 + 크게 보기 넘김(형 11-11 08:45~08:47 봄 1:1 · 봄 옮김) — 뎅
//   「글구 너네가 사진 여러장 첨부하명」 · 「2장 이상일땐 이런식으로 크키가 줄어서 나오게 할 수 있어? 누르면 커지고」 · 「카톡은 이런식임」
//   묶음 = 한 글에 사진 2장 넘음 → 작게 가로 한 줄(2장 = 둘 · 3장부터 = 셋 + 셋째 칸 「+n」 · 형 12:52 · ./pic-grid-logic.ts rowOf) · 1장 = ui/office-chat.tsx 옛 꼴 그대로
//   누르면 = 크게 보기 · 좌우로 넘김 · 아래 썸네일 줄(지금 장 라임 테) · 「N장 중 M번」 · 위 = 보낸 이 · 시각 · 받기
//   겉 · 닫는 길 = 대화창 크게 보기(.nm-zoom · zoomImage)와 넘김(.nm-zoom-g · ./thumb-strip.tsx Zoom) 그대로 — 기록 한 칸 · 폰 뒤로 · Esc · 아무 데나 누름 · ui/shell.tsx 는 .nm-zoom 이 있으면 판을 안 옮김
//   남은 것(둘째 판) = 길게 누르면 다운로드 · 공유 · 봄의 정원 다른 대화방으로(형 08:46 「오래누르면 다운로드 공유 다른 봄의 정원 대화방 공유 등」)
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { justHeld } from "./msg-menu";
import { pvCount, pvIndex, rowOf } from "./pic-grid-logic";
import "./pic-grid.css";
import { DlSeqButton } from "./dl-seq";

export type GridPic = { p: string; src: string; name: string };
const SV = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function PicGrid({ pics, who, when, ring, dl, onBad }: { pics: GridPic[]; who: string; when: string; ring: (p: string) => string; dl: (src: string, name: string) => string; onBad: (p: string) => void }) {
  const [at, setAt] = useState(-1);
  const { show, more } = rowOf(pics.length);
  return (
    <>
      <div className={`nm-pg c${show}`} role="group" aria-label={`사진 ${pics.length}장`}>
        {pics.slice(0, show).map((f, k) => (
          <button key={f.p} type="button" className={`nm-pg-c${ring(f.p)}`} title={`${f.name} — 누르면 크게`} aria-label={more && k === show - 1 ? `${pics.length}장 중 ${k + 1}번 · ${more}장 더 · 크게` : `${pics.length}장 중 ${k + 1}번 크게`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (justHeld()) return; setAt(k); }}>
            <img src={f.src} alt={f.name} loading="lazy" decoding="async" onError={() => onBad(f.p)} />
            {more && k === show - 1 ? <span className="nm-pg-more" aria-hidden>+{more}</span> : null}
          </button>
        ))}
      </div>
      {at >= 0 ? <PicView pics={pics} at={at} who={who} when={when} dl={dl} onClose={() => setAt(-1)} /> : null}
    </>
  );
}

function PicView({ pics, at, who, when, dl, onClose }: { pics: GridPic[]; at: number; who: string; when: string; dl: (src: string, name: string) => string; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null), strip = useRef<HTMLDivElement>(null), pushed = useRef(false), backing = useRef(false);
  const [i, setI] = useState(at);
  const close = () => { if (backing.current) return; backing.current = true; history.back(); };
  const goTo = (k: number, smooth = true) => { const t = track.current; if (t) t.scrollTo({ left: k * t.clientWidth, behavior: smooth ? "smooth" : "auto" }); };
  useLayoutEffect(() => { goTo(at, false); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pushed.current) { pushed.current = true; history.pushState({ ...history.state, nmZoom: 1 }, ""); }
    const pop = () => onClose();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const t = track.current; if (t) goTo(pvIndex(t.scrollLeft, t.clientWidth, pics.length) + (e.key === "ArrowRight" ? 1 : -1)); }
    };
    window.addEventListener("popstate", pop); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { strip.current?.querySelector<HTMLElement>(`[data-k="${i}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }, [i]);   // 아래 줄도 지금 장 쪽으로
  const cur = pics[i] || pics[0];
  if (!cur) return null;
  return createPortal(
    <div className="nm-zoom nm-zoom-g nm-pv" role="dialog" aria-modal="true" aria-label="사진 크게 보기" onClick={close}>
      <div className="nm-zoom-bar" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="뒤로" onClick={close}><svg {...SV} width={24} height={24}><path d="m15 5-7 7 7 7" /></svg></button>
        {who ? <b>{who}</b> : null}
        {when ? <small>{when}</small> : null}
        <span className="nm-zoom-sp" />
        <DlSeqButton className="nm-zoom-act" hrefs={pics.map((p) => dl(p.src, p.name))} ariaLabel={pics.length > 1 ? `${pics.length}장 다 저장` : "이 사진 저장"} />   {/* 우상단 받기 = 이 묶음 다(1/N 세기 → 체크 → 돌아옴 · 에디터 「⬇ 전체」 움직임 · 형 11-13 02:28 · ui/dl-seq.tsx) */}
      </div>
      <div className="nm-zoom-track" ref={track} onScroll={(e) => { const t = e.currentTarget; setI(pvIndex(t.scrollLeft, t.clientWidth, pics.length)); }}>
        {pics.map((p, k) => <div key={p.p} className="nm-zoom-slide"><img src={p.src} alt={p.name} loading={Math.abs(k - at) <= 1 ? "eager" : "lazy"} decoding="async" /></div>)}
      </div>
      <div className="nm-pv-foot" onClick={(e) => e.stopPropagation()}>
        <p className="nm-pv-n" aria-live="polite">{pvCount(i, pics.length)}</p>
        <div className="nm-pv-strip" ref={strip}>
          {pics.map((p, k) => (
            <button key={p.p} type="button" data-k={k} className={`nm-pv-t${k === i ? " on" : ""}`} aria-label={pvCount(k, pics.length)} aria-current={k === i} onClick={() => goTo(k)}>
              <img src={p.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
