// 기간 막대 — 하루 눈금 위에서 시작~끝을 끌어서 정함(형 11-15 영상 「인앱 안에 스케줄 일정 조정을 기간을 이런식으로 조정 가응하게해줘 60프레임으로 보고」)
//   본 = 형이 준 영상(「Data export schedule」 · 60프레임 402장): 눈금 알약 24개 · 색 막대(양끝 손잡이 · 가운데 길이 글자) ·
//   몸통을 끌면 통째로 · 손잡이를 끌면 그 끝만 · 끄는 동안 글자 숫자가 굴러감 · 누른 자리에 고리 · 놓으면 단위에 착 붙음(스프링) · 잠기면 눈금이 한 덩이 + 자물쇠
//   움직임 = 한 번 재생하고 끝(계속 도는 것 0 · 형 맥 발열) · 바꾸는 것 = left · width · transform · opacity 만 · 끄는 중엔 전환을 끄고 프레임마다 한 번만 그림(rAF)
//   색 = 앱 시그니처 라임(본은 파랑) · 셈 = ./range-bar-core.ts
import { type KeyboardEvent as KE, type PointerEvent as PE, useEffect, useRef, useState } from "react";
import "./range-bar.css";
import { type Grab, type Lim, type Span, dragTo, hmOf, snapTo, spanKo } from "./range-bar-core";

/** 굴러가는 숫자 — 숫자 칸마다 0~9 기둥을 위아래로 옮김(자리 수가 바뀌어도 오른쪽 끝 기준으로 칸을 맞춤) */
function Roll({ text }: { text: string }) {
  const cs = [...text];
  return (
    <span className="nm-rb-roll" aria-hidden>
      {cs.map((c, i) => /\d/.test(c)
        ? <span key={`d${cs.length - i}`} className="d"><span style={{ transform: `translateY(${-Number(c)}em)` }}>{"0123456789".split("").map((n) => <i key={n}>{n}</i>)}</span></span>
        : <span key={`c${cs.length - i}`} className="c">{c}</span>)}
    </span>
  );
}
const LOCK = <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;

export function RangeBar({ from, to, onChange, disabled, lo = 0, hi = 24, end, min = 1, step = 1, name = "기간", sum }: {
  from: number; to: number; onChange: (v: { from: number; to: number }) => void; disabled?: boolean; lo?: number; hi?: number; /** 끝이 갈 수 있는 맨 끝(눈금은 hi 까지 그림 · 기본 = hi) */ end?: number; min?: number; step?: number; name?: string;
  /** 아래 한 줄 앞머리(요일 · 주기 등) — 뒤에 「09:00–21:00」 이 붙음 */ sum?: string;
}) {
  const lim: Lim = { lo, hi: end ?? hi, min, step };
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ grab: Grab; id: number; x: number; w: number; from: Span; cur: Span; raf: number } | null>(null);
  const [live, setLive] = useState<Span | null>(null), [grab, setGrab] = useState<Grab | "">(""), [px, setPx] = useState(0);
  useEffect(() => () => { if (drag.current?.raf) cancelAnimationFrame(drag.current.raf); }, []);
  const v: Span = live || { a: from, b: Math.max(to, from) };
  // 어디를 잡았나 = 누른 자리로 직접 가름(막대 양끝 1/3 · 많아야 22px = 그 끝만 · 가운데 = 통째로 · 끝에서 18px 밖까지는 그 끝으로 침)
  //   손잡이마다 따로 듣게 하면 짧은 막대(3시간 = 45px)에서 손가락이 가운데를 눌러도 브라우저가 가까운 손잡이로 붙여 버림(실측)
  const down = (e: PE<HTMLElement>) => {
    if (disabled || drag.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = track.current; if (!el) return;
    const box = el.getBoundingClientRect();   // 끄는 동안 유일한 재기(그 뒤는 쓰기만)
    const x = e.clientX - box.left, L = ((from - lo) / (hi - lo)) * box.width, bw = Math.max(((Math.max(to, from) - from) / (hi - lo)) * box.width, 34), edge = Math.min(22, bw / 3);
    if (x < L - 18 || x > L + bw + 18) return;   // 막대 밖 = 안 잡음
    const g: Grab = x <= L + edge ? "a" : x >= L + bw - edge ? "b" : "move";
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch { /* 잡기 못 해도 끌림은 됨 */ }
    const start = { a: from, b: Math.max(to, from) };
    drag.current = { grab: g, id: e.pointerId, x: e.clientX, w: box.width || 1, from: start, cur: start, raf: 0 };
    setGrab(g); setLive(start); setPx(e.clientX - box.left);
  };
  const move = (e: PE<HTMLElement>) => {
    const d = drag.current; if (!d || e.pointerId !== d.id) return;
    d.cur = dragTo(d.grab, d.from, ((e.clientX - d.x) / d.w) * (hi - lo), lim);
    const x = e.clientX - (track.current?.getBoundingClientRect().left || 0);
    if (!d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; if (drag.current === d) { setLive(d.cur); setPx(x); } });   // 프레임마다 한 번
  };
  const up = (e: PE<HTMLElement>) => {
    const d = drag.current; if (!d || e.pointerId !== d.id) return;
    drag.current = null; if (d.raf) cancelAnimationFrame(d.raf);
    try { track.current?.releasePointerCapture(e.pointerId); } catch { /* 이미 풀림 */ }
    const s = snapTo(d.grab, d.cur, lim);
    setGrab(""); setLive(null);   // 전환이 다시 켜진 채로 붙는 자리로 = 스프링 한 번
    if (s.a !== from || s.b !== to) onChange({ from: s.a, to: s.b });
  };
  const key = (g: Grab) => (e: KE<HTMLElement>) => {   // 손가락 없이도(← → = 한 단위)
    const dir = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : 0;
    if (!dir || disabled) return;
    e.preventDefault();
    const s = snapTo(g, dragTo(g, { a: from, b: to }, dir * step, lim), lim);
    if (s.a !== from || s.b !== to) onChange({ from: s.a, to: s.b });
  };
  const pct = (h: number) => `${((h - lo) / (hi - lo)) * 100}%`;
  return (
    <div className="nm-rb" data-drag={grab || undefined} data-lock={disabled || undefined} style={{ ["--px" as string]: `${px}px` }}>
      <div className="nm-rb-track" ref={track} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="nm-rb-ticks" aria-hidden>{Array.from({ length: hi - lo }, (_, i) => <i key={i} />)}</div>
        {disabled ? <><span className="nm-rb-lock" style={{ left: pct((lo + v.a) / 2) }} hidden={v.a - lo < 2}>{LOCK}</span><span className="nm-rb-lock" style={{ left: pct((v.b + hi) / 2) }} hidden={hi - v.b < 2}>{LOCK}</span></> : null}
        <div className="nm-rb-bar" style={{ left: pct(v.a), width: pct(lo + (v.b - v.a)) }} role="slider" tabIndex={disabled ? -1 : 0} aria-label={`${name} 옮기기`} aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={v.a} aria-valuetext={`${hmOf(v.a)}–${hmOf(v.b)}`} aria-disabled={disabled || undefined}
          onKeyDown={key("move")}>
          <span className="nm-rb-grip a" role="slider" tabIndex={disabled ? -1 : 0} aria-label={`${name} 시작`} aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={v.a} aria-valuetext={hmOf(v.a)} onKeyDown={(e) => { e.stopPropagation(); key("a")(e); }} />
          <Roll text={spanKo(v.b - v.a)} />
          <span className="nm-rb-grip b" role="slider" tabIndex={disabled ? -1 : 0} aria-label={`${name} 끝`} aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={v.b} aria-valuetext={hmOf(v.b)} onKeyDown={(e) => { e.stopPropagation(); key("b")(e); }} />
        </div>
        <i className="nm-rb-halo" aria-hidden />
      </div>
      <div className="nm-rb-axis" aria-hidden>{[0, 0.25, 0.5, 0.75, 1].map((t) => <span key={t}>{hmOf(lo + (hi - lo) * t)}</span>)}</div>
      <p className="nm-rb-sum" role="status">{sum ? <span className="p">{sum} · </span> : null}<Roll text={`${hmOf(v.a)}–${hmOf(v.b)}`} /><span className="nm-rb-sr">{hmOf(v.a)}–{hmOf(v.b)} · {spanKo(v.b - v.a)}</span></p>
    </div>
  );
}
