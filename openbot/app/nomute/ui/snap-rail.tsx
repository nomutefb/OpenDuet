// 하나 고르기 레일(N택1) — 값이 다 보이고 고른 알약이 그 칸으로 미끄러짐
//   원본 = nomutefb/editor viewer/nm-snap.js + viewer/nm-shared.css 「.nm-snap」(kinetics «Snap Rail» · 형 9-29 «선택 요소를 snap rail 로 통일» → «편집탭 통일» · 디자인기틀 CII)
//   그대로 옮긴 것: 라디오 문법(radiogroup · radio · aria-checked · roving tabindex · ←→↑↓ = 다음 칸 고름) · 같은 이름(id)의 레일이 다시 그려지면 지난 칸에서 새 칸으로 미끄러짐
//   설정에 물린 까닭 = 형 11-18 「좋아, 다 반영해주라」(앞 = 누를 때마다 다음 값으로만 넘어가 무엇이 있는지 안 보임)
import { type KeyboardEvent as RKeyboardEvent, useEffect, useRef, useState } from "react";
import "./snap-rail.css";
import { sfx } from "./feel";
import { railStep } from "./snap-rail-core";

const last = new Map<string, number>();   // 이름 → 마지막 고른 칸(다시 그린 레일의 알약 출발점)
export type RailOpt<T extends string> = { v: T; t: string; off?: boolean };
export function SnapRail<T extends string>({ id, label, options, value, onPick, className = "" }: { id: string; label: string; options: RailOpt<T>[]; value: T; onPick: (v: T) => void; className?: string }) {
  const i = options.findIndex((o) => o.v === value), box = useRef<HTMLDivElement | null>(null);
  const was = last.get(id);
  const [from, setFrom] = useState<number | null>(was !== undefined && was >= 0 && i >= 0 && was !== i ? was : null);   // 다시 그려짐 = 지난 칸에서 출발(첫 틀만)
  useEffect(() => { if (i >= 0) last.set(id, i); }, [i, id]);
  useEffect(() => {
    if (from === null) return undefined;
    const f = requestAnimationFrame(() => setFrom(null));   // 출발점이 그려진 다음 틀에 목적지 = 미끄럼이 돎
    const t = window.setTimeout(() => setFrom(null), 120);   // 틀이 안 도는 때(뒤에 가 있는 창)에도 제자리로
    return () => { cancelAnimationFrame(f); window.clearTimeout(t); };
  }, [from]);
  const at = from ?? i, jump = from !== null;
  const pick = (j: number) => { const o = options[j]; if (!o || o.off || j === i) return; sfx("tick"); onPick(o.v); };
  const key = (e: RKeyboardEvent<HTMLDivElement>) => {
    const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, 1 | -1>)[e.key]; if (!d) return;
    const j = railStep(Math.max(0, i), d, options.map((o) => !!o.off)); if (j < 0) return;
    e.preventDefault(); pick(j);
    (box.current?.children[j] as HTMLElement | undefined)?.focus();
  };
  return (
    <div ref={box} role="radiogroup" aria-label={label} className={`nm-srail ${className}`} data-jump={jump ? "" : undefined} data-n={options.length} style={{ ["--n" as string]: String(Math.max(1, options.length)), ["--i" as string]: String(Math.max(0, at)) }} onKeyDown={key}>
      {options.map((o, j) => (
        <button key={o.v} type="button" role="radio" aria-checked={j === i} tabIndex={j === i || (i < 0 && j === 0) ? 0 : -1} disabled={o.off} onClick={() => pick(j)}>{o.t}</button>
      ))}
    </div>
  );
}
