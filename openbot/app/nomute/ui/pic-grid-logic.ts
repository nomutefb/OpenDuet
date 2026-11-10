// 사진 묶음 계산 줄(./pic-grid.tsx · 시험 = tests/pic-grid-logic.test.ts) — 화면 없이 도는 것만
//   형 11-11 08:45 봄 1:1(봄 옮김) 「글구 너네가 사진 여러장 첨부하명」 · 「2장 이상일땐 이런식으로 크키가 줄어서 나오게 할 수 있어? 누르면 커지고」 · 참고 = 카톡 사진 묶음

/** 한 줄에 몇 장씩 — 카톡 꼴: 셋씩 채우고, 남는 한 장은 마지막 두 줄을 둘 · 둘로(외톨이 한 칸 없음) · 1장 = 묶음 아님(지금 그대로) */
export function gridRows(n: number): number[] {
  if (n < 2) return n === 1 ? [1] : [];
  if (n === 2) return [2];
  if (n === 4) return [2, 2];
  const r = n % 3, threes = Math.floor(n / 3);
  if (r === 0) return Array(threes).fill(3);
  if (r === 2) return [...Array(threes).fill(3), 2];
  return [...Array(threes - 1).fill(3), 2, 2];   // r = 1 → 3…3 + 2 + 2
}

/** 칸마다 6칸 판에서 차지하는 폭(셋 줄 = 2 · 둘 줄 = 3 · 한 장 = 6) — CSS grid-column span */
export function gridSpans(n: number): number[] {
  return gridRows(n).flatMap((k) => Array(k).fill(6 / k));
}

/** 크게 보기 숫자 = 카톡 말(「17장 중 13번」) */
export const pvCount = (i: number, n: number) => `${n}장 중 ${i + 1}번`;

/** 넘김 칸 번호 = 스크롤 위치에서(양끝 막음) */
export const pvIndex = (scrollLeft: number, width: number, n: number) => (width > 0 ? Math.max(0, Math.min(n - 1, Math.round(scrollLeft / width))) : 0);   // 폭 0 = 아직 안 그려짐 → 첫 장
