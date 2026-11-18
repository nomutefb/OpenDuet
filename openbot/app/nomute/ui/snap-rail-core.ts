// 고르기 레일 셈(./snap-rail.tsx · 원본 = editor viewer/nm-snap.js 방향키 줄) — 화면 없이 시험되게 따로
/** 순수 — 방향키 한 번 = 다음 칸(끝에서 돌아감 · 못 고르는 칸은 건너뜀) · 갈 데 없으면 -1 */
export function railStep(i: number, d: 1 | -1, off: boolean[]): number {
  const n = off.length;
  for (let k = 1; k <= n; k++) { const j = (((i + d * k) % n) + n) % n; if (!off[j]) return j === i ? -1 : j; }
  return -1;
}

