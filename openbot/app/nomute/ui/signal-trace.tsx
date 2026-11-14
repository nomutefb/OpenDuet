// 그록봇 신호 자국(형 11-14 「꼭 저렇게 빨간색 촌스러운거로 안해도돼 … life 어쩌고부터 다살펴봐」) — 부름 → 받음 → 들어옴 세 구슬을 가는 선으로 이음
//   어디서 멈췄는지가 곧 끊긴 자리 · 서버(editor functions/api/office/_activity.js hookOf)가 준 step 만 그린다 — 여기서 새로 판정하지 않는다
//   문법 = Lieflat Charts(editor .claude/skills/lieflat-charts) Lupi 「가는 선 + 구슬」 · wire 색 논리(무채색 = 자료 · 강조색은 한 곳만)
//   → 빨강 없이 끊긴 선과 빈 구슬로 말한다 · 색은 작동 표 것 그대로(./status-board.css .nsb 토큰)
import { type SigStep, traceKo, traceOn, traceStop } from "./signal-step";
export type { SigStep } from "./signal-step";
const KO = ["부름", "받음", "들어옴"], X = [5, 23, 41];

export function SignalTrace({ step, lost }: { step: SigStep; lost?: boolean }) {
  const on = traceOn(step), stop = traceStop(step), ko = traceKo(step, !!lost);
  return (
    <svg className="nsb-tr" data-lost={lost || undefined} data-in={stop < 0 || undefined} viewBox="0 0 46 10" width="46" height="10" role="img" aria-label={ko}>
      <title>{ko}</title>
      {[0, 1].map((i) => <line key={i} className={on[i + 1] ? "on" : stop === i + 1 ? "cut" : "off"} x1={X[i] + 3.5} y1="5" x2={X[i + 1] - 3.5} y2="5" />)}
      {X.map((x, i) => <circle key={KO[i]} className={on[i] ? "on" : stop === i ? "stop" : "off"} cx={x} cy="5" r="3" />)}
    </svg>
  );
}
