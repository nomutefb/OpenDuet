// 사진 묶음 계산 줄(./pic-grid.tsx · 시험 = tests/pic-grid-logic.test.ts) — 화면 없이 도는 것만
//   형 11-11 08:45 봄 1:1(봄 옮김) 「글구 너네가 사진 여러장 첨부하명」 · 「2장 이상일땐 이런식으로 크키가 줄어서 나오게 할 수 있어? 누르면 커지고」 · 참고 = 카톡 사진 묶음

/** 한 줄 묶음(형 11-11 12:52 봄 1:1 · 봄 옮김 「1개는 크게 / 2개는 작게 가로로 / 3개는 작게 가로로 단 +n이 3번째 거에 썸네일로 들어가구 누르면 카톡 줫던 예시화면처럼」)
 *  2장 = 둘 · 3장부터 = 셋만 보이고 넷째부터 숨김 → 셋째 칸에 「+n」(n = 가려진 장 수 · 카톡 버릇) · 1장 = 묶음 아님(옛 꼴 그대로) · 앞 판 = 셋 · 둘 · 둘 여러 줄(11-11 10:02 · 걷음) */
export function rowOf(n: number): { show: number; more: number } {
  if (n < 2) return { show: 0, more: 0 };
  const show = Math.min(n, 3);
  return { show, more: n - show };
}

/** 크게 보기 숫자 = 카톡 말(「17장 중 13번」) */
export const pvCount = (i: number, n: number) => `${n}장 중 ${i + 1}번`;

/** 넘김 칸 번호 = 스크롤 위치에서(양끝 막음) */
export const pvIndex = (scrollLeft: number, width: number, n: number) => (width > 0 ? Math.max(0, Math.min(n - 1, Math.round(scrollLeft / width))) : 0);   // 폭 0 = 아직 안 그려짐 → 첫 장
