// 러버밴드 게이지 — 설정 슬라이더 하네스(형 9-29 에디터 «게이지 바 조정 … 하네스 통일» = 디자인기틀 CII 「러버밴드 게이지(설정 게이지)」)
//   원본 = nomutefb/editor viewer/nm-gauge.js mount()(스크럽 변형 말고 기본 꼴) + viewer/nm-shared.css 「.nm-rbs」 — 동작 · 수치 그대로 React 로 옮김(봄 11-18 · 형 「설정부분에서 하네스 어긋나는 부분을 하네스에서 최대한 채워주고」)
//   동작 = kinetics «Rubber-band Slider»: 끝을 넘겨 끌면 넘친 거리 ×.32 만 따라가고, 놓으면 .5s 스프링으로 제자리 · 이동 = transform 만(채움 scaleX · 손잡이 translateX)
//   밑 = 네이티브 <input type="range">(값 · 키보드 · 읽어 주기 그대로 · 눈에만 안 보임) · 터치 = 가로로 4px 넘게 움직여야 끌기(세로 = 화면 스크롤) · 그냥 떼면 그 자리로
//   Shift+방향키 = 10칸 · 두 번 누르기 = 기본값(def 를 준 때만) · onInput = 끄는 동안 값 · onCommit = 손을 뗀 뒤 한 번(바뀐 때만 · 서버 저장은 여기)
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, useEffect, useRef, useState } from "react";
import "./rbs-gauge.css";
import { rbsAt, rbsFrac } from "./rbs-gauge-core";

export function RbsGauge({ min = 0, max = 100, step = 1, value, onInput, onCommit, def, disabled, label, valueText, className = "" }: {
  min?: number; max?: number; step?: number; value: number; onInput: (v: number) => void; onCommit?: (v: number) => void; def?: number; disabled?: boolean; label: string; valueText?: string; className?: string;
}) {
  const box = useRef<HTMLSpanElement | null>(null), inp = useRef<HTMLInputElement | null>(null);
  const s = useRef({ on: false, wait: null as { x: number; y: number } | null, v0: value, cur: value, kb: false, t: 0 });
  const [over, setOver] = useState<number | null>(null), [drag, setDrag] = useState(false), [snap, setSnap] = useState(false), [ptr, setPtr] = useState(false);
  s.current.cur = s.current.on ? s.current.cur : value;
  useEffect(() => () => window.clearTimeout(s.current.t), []);
  const spring = () => { setSnap(true); window.clearTimeout(s.current.t); s.current.t = window.setTimeout(() => setSnap(false), 520); };
  const put = (v: number) => { if (v !== s.current.cur) { s.current.cur = v; onInput(v); } };
  const at = (x: number) => {
    const r = box.current!.getBoundingClientRect(), [v, p] = rbsAt((x - r.left) / (r.width || 1), min, max, step);
    setOver(p); put(v);
  };
  const start = (e: RPointerEvent) => {
    const c = s.current; c.on = true; c.wait = null; setPtr(true);   // 포인터 조작 = 포커스 링 숨김(키보드로 옮기면 다시 보임)
    try { box.current!.setPointerCapture(e.pointerId); } catch { /* 캡처 불가 = 창 밖 이탈만 못 따라감 */ }
    try { inp.current!.focus({ preventScroll: true }); } catch { /* 포커스 불가 무해 */ }
    setSnap(false); setDrag(true); at(e.clientX);
  };
  const end = () => {
    const c = s.current; if (!c.on) return;
    c.on = false; setDrag(false); setOver(null); spring();
    if (c.cur !== c.v0) onCommit?.(c.cur);
  };
  const down = (e: RPointerEvent) => {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    const c = s.current; c.v0 = c.cur = value;
    if (e.pointerType === "mouse") { e.preventDefault(); start(e); } else c.wait = { x: e.clientX, y: e.clientY };
  };
  const move = (e: RPointerEvent) => {
    const c = s.current;
    if (c.on) { at(e.clientX); return; }
    if (c.wait && Math.abs(e.clientX - c.wait.x) > 4 && Math.abs(e.clientX - c.wait.x) > Math.abs(e.clientY - c.wait.y)) start(e);   // 가로가 이겼다 = 끌기
  };
  const up = (e: RPointerEvent) => { const c = s.current; if (c.wait && !c.on) start(e); c.wait = null; end(); };   // 움직임 없이 뗐다 = 탭 → 그 자리로(스프링)
  const cancel = () => { s.current.wait = null; end(); };   // 브라우저가 세로 스크롤로 가져감 · 두 번째 손가락 · 창 밖 = 끌기 정리(하네스 §21)
  const key = (e: RKeyboardEvent<HTMLInputElement>) => {
    if (!/^(Arrow|Home|End|Page)/.test(e.key)) return;
    const c = s.current; setPtr(false); spring();
    if (!c.kb) { c.kb = true; c.v0 = value; }
    if (e.shiftKey && /^Arrow/.test(e.key)) { e.preventDefault(); put(Math.min(max, Math.max(min, value + (/Right|Up/.test(e.key) ? 1 : -1) * (step || 1) * 10))); }
  };
  const kbDone = () => { const c = s.current; if (!c.kb) return; c.kb = false; if (c.cur !== c.v0) onCommit?.(c.cur); };
  const reset = () => { if (def === undefined || disabled || def === value) return; spring(); s.current.cur = def; onInput(def); onCommit?.(def); };
  return (
    <span ref={box} className={`nm-rbg${drag ? " drag" : ""}${snap ? " snap" : ""} ${className}`} data-ptr={ptr ? "" : undefined} style={{ ["--p" as string]: String(over ?? rbsFrac(value, min, max)) }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel} onDoubleClick={reset}>
      <input ref={inp} type="range" className="nm-rbg-in" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={label} aria-valuetext={valueText}
        onChange={(e) => put(+e.target.value)} onKeyDown={key} onKeyUp={kbDone} onBlur={kbDone} />
      <span className="nm-rbg-track" aria-hidden><span className="nm-rbg-fill" /></span>
      <span className="nm-rbg-knob" aria-hidden />
    </span>
  );
}
