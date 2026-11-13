// 방 유지 시간 = 「1시간 · 끌어서 1~7일 · 영구」 셋(형 11-14 04:56 dm-eyes 「지금 방 설정에 기한 정하는게 잇는데 1시간, 그리고 이렇게 기한, 영구 3개 설정으로 css 갔으면 함」 · 본보기 = 형 영상 98691 = 진한 알약이 끌려 늘고 · 끝에 손잡이 줄 · 숫자가 굴러 바뀜 · 오른쪽 끝에 최대 「7 days」)
//   값 = 시간(hours) 하나 · 1 = 1시간 · 24·48…168 = 1~7일 · 0 = 영구 · null = 고치기에서 안 누름(기한 그대로)
import { useRef } from "react";
import "./day-slide.css";

const MAX = 7;
export function DaySlide({ hours, onChange }: { hours: number | null; onChange: (h: number) => void }) {
  const track = useRef<HTMLDivElement>(null), drag = useRef(false);
  const days = hours && hours >= 24 ? Math.min(MAX, Math.round(hours / 24)) : 0, onDays = days > 0;
  const shown = onDays ? days : 3;   // 날 칸이 안 골라졌을 땐 3일 자리에 흐리게(누르면 그 자리부터)
  const at = (x: number) => { const b = track.current!.getBoundingClientRect(); return Math.max(1, Math.min(MAX, Math.round(((x - b.left) / b.width) * MAX + 0.35))); };
  const down = (e: React.PointerEvent) => { drag.current = true; try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* 잡기 못 해도 */ } onChange(at(e.clientX) * 24); };
  const move = (e: React.PointerEvent) => { if (drag.current) { const d = at(e.clientX); if (d !== days) onChange(d * 24); } };
  const up = () => { drag.current = false; };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(MAX, (days || 0) + 1) * 24); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(1, (days || 2) - 1) * 24); }
  };
  return (
    <div className="nm-dsl" role="radiogroup" aria-label="유지 시간">
      <button type="button" role="radio" aria-checked={hours === 1} className={`nm-dsl-chip${hours === 1 ? " on" : ""}`} onClick={() => onChange(1)}>1시간</button>
      <div ref={track} className={`nm-dsl-track${onDays ? " on" : ""}`} role="slider" tabIndex={0} aria-label="기한(일)" aria-valuemin={1} aria-valuemax={MAX} aria-valuenow={shown} aria-valuetext={`${shown}일`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
        <span className="nm-dsl-max" aria-hidden>{MAX}일</span>
        <span className="nm-dsl-fill" style={{ width: `calc(${(shown / MAX) * 100}% )` }}>
          <span className="nm-dsl-num" aria-hidden><span className="nm-dsl-roll" style={{ transform: `translateY(-${(shown - 1) * 1.25}em)` }}>{Array.from({ length: MAX }, (_, i) => <i key={i}>{i + 1}</i>)}</span></span>
          <span className="nm-dsl-unit">일</span>
          <span className="nm-dsl-grip" aria-hidden />
        </span>
      </div>
      <button type="button" role="radio" aria-checked={hours === 0} className={`nm-dsl-chip${hours === 0 ? " on" : ""}`} onClick={() => onChange(0)}>영구</button>
    </div>
  );
}
