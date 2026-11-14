// 값 바뀜(State Diff) — 옛 값은 흐려지며 왼쪽으로 물러나고 새 값이 제자리로 들어와 빛남(형 11-15 「state diff 적용 가능한 인앱 부분을 다 확인해서 모피즘하고 톤온톤 투명도 적용해서 반영」)
//   본 = kinetics.colorion.co/effects/state-diff · 셈 = ./state-diff-core.ts · 옷 = ./state-diff.css(유리 판 · 바탕과 같은 계열 투명도 · 새 값 = 앱 라임)
//   세 꼴: <StateDiff> 두 줄 판(− 옛 값 / + 새 값) · <DiffPair> 한 줄(옛 값 › 새 값) · <DiffValue> 줄 안에서 값만 갈아 끼움
//   움직임 = transform · opacity 만 · 한 번 재생하고 끝(되풀이 0) · 움직임 줄이기 = 바로
import "./state-diff.css";
import { type ReactNode, useState } from "react";
import { diffDone, diffInit, diffNext } from "./state-diff-core";

/** 두 줄 판 — 뜨는 순간(그리고 from · to 가 바뀔 때) 한 번 재생 · still = 가만히 */
export function StateDiff({ label, from, to, still, className }: { label?: ReactNode; from: ReactNode; to: ReactNode; still?: boolean; className?: string }) {
  return (
    <span className={`nm-sd${className ? " " + className : ""}`} data-play={still ? undefined : ""}>
      {label ? <span className="nm-sd-k">{label}</span> : null}
      <span key={`o${String(from)}>${String(to)}`} className="nm-sd-l old"><b aria-hidden>−</b><span>{from}</span></span>
      <span key={`n${String(from)}>${String(to)}`} className="nm-sd-l new"><b aria-hidden>+</b><span>{to}</span></span>
    </span>
  );
}

/** 한 줄 — 옛 값 › 새 값 · play 일 때만 한 번 재생(목록에서 방금 생긴 줄) */
export function DiffPair({ from, to, play, sep }: { from: ReactNode; to: ReactNode; play?: boolean; sep?: ReactNode }) {
  return (
    <span className="nm-dp" data-play={play ? "" : undefined}>
      <span className="nm-dp-old">{from}</span>{sep ?? " › "}<span className="nm-dp-new">{to}</span>
    </span>
  );
}

/** 줄 안 값 — 값이 바뀌면 옛 값이 왼쪽으로 흐려지며 빠지고 새 값이 들어옴(처음 뜰 때 · 읽는 중 → 값 = 가만히) */
export function DiffValue({ value, className }: { value: string; className?: string }) {
  const [s, setS] = useState(() => diffInit(value));
  const now = diffNext(s, value);
  if (now !== s) setS(now);   // 그리는 중 맞춤(리액트가 바로 다시 그림 · 효과 한 박자 안 늦음)
  return (
    <span className={`nm-dv${className ? " " + className : ""}`} data-play={now.old ? "" : undefined}>
      {now.old ? <span key={`o${now.n}`} className="nm-dv-old" aria-hidden onAnimationEnd={() => setS(diffDone)}>{now.old}</span> : null}
      <span key={`n${now.n}`} className="nm-dv-new">{value}</span>
    </span>
  );
}
