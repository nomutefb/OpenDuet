// PC 대화 | 오른쪽 경계 끌기 = 자석 · 눈금 띠(형 11-14 05:07 dm-sia 참고 영상 98716.mp4 「우리 웹앱 좌우 너비 조정패널에 반영할 부분있나」 · 05:15 「숫자만 빼고」 · 05:16 「차트도 나오게하자는건아님 저 느낌만」 = 자석 느낌만)
//   오른쪽 넓이(%) 기준 · 순수 = node 시험
export const SPLIT_MIN = 30, SPLIT_MAX = 65;
export const SNAPS = [100 / 3, 40, 50, 60];   // 셋에 하나 · 4:6 · 반반 · 6:4
export const SNAP_PULL = 1.4;   // 이만큼(%) 안이면 착 붙음
export const clampW = (v: number) => Math.max(SPLIT_MIN, Math.min(SPLIT_MAX, v));
/** 끈 자리 → 붙은 넓이 · 붙은 눈금(없으면 -1) */
export function snapW(raw: number): { w: number; hit: number } {
  const v = clampW(raw);
  let hit = -1, best = SNAP_PULL;
  SNAPS.forEach((s, i) => { const d = Math.abs(v - s); if (d <= best) { best = d; hit = i; } });
  return { w: hit >= 0 ? SNAPS[hit] : v, hit };
}
