// 값 바뀜(State Diff) 셈 — 언제 재생하나만(그림 = ./state-diff.tsx · 시험 = tests/state-diff.test.ts)
//   본 = kinetics.colorion.co/effects/state-diff(옛 값 = 흐려지며 왼쪽 8px · 새 값 = 오른쪽 8px 흐림(.35)에서 제자리 · .42s 스프링 cubic-bezier(.34,1.56,.64,1))
//   우리 앱 = hover 말고 값이 실제로 바뀐 순간 한 번(형 11-15 「state diff 적용 가능한 인앱 부분을 다 확인해서 … 반영」)
export const SD_MS = 420, SD_SHIFT = 8, SD_OLD = 0.4, SD_NEW = 0.35;   // 본 값 그대로 · 옛 값 끝 투명도만 본 .2 → .4(확인 띠에서 옛 값도 읽혀야 함)

const EMPTY = new Set(["", "…", "...", "–", "—", "-"]);   // 아직 못 읽은 자리 표시 = 값이 아님
const norm = (v: unknown) => (v == null ? "" : String(v).trim());

/** 옛 값 → 새 값으로 넘어갈 때 재생할까 — 처음 뜸 · 읽는 중(…) → 값 · 같은 값 = 안 함 */
export function shouldPlay(prev: unknown, next: unknown): boolean {
  const a = norm(prev), b = norm(next);
  return !EMPTY.has(a) && !EMPTY.has(b) && a !== b;
}

export type DiffState = { cur: string; old: string; n: number };   // old = 지금 물러나는 옛 값("" = 재생 안 함) · n = 바뀐 횟수(같은 자리 다시 재생용 열쇠)
export const diffInit = (value: string): DiffState => ({ cur: value, old: "", n: 0 });
/** 새 값이 오면 다음 상태 — 같으면 그대로(같은 객체) */
export function diffNext(s: DiffState, value: string): DiffState {
  if (s.cur === value) return s;
  return { cur: value, old: shouldPlay(s.cur, value) ? s.cur : "", n: s.n + 1 };
}
/** 재생이 끝나면 옛 값 치움 */
export const diffDone = (s: DiffState): DiffState => (s.old ? { ...s, old: "" } : s);

/** 목록 줄(최근 바뀜) = 화면을 연 뒤에 생긴 줄만 재생 — 열 때 이미 있던 줄은 가만히 */
export const isFresh = (at: number | undefined, since: number) => typeof at === "number" && Number.isFinite(at) && at > since;
