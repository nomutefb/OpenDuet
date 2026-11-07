// 고른 멤버 거르기(순수) — 없어진 봇(명부 gone) · 서버 후보 밖 이름을 뺌(빠르 11-08 · 모루 #2861 · #2864 검토 「명부 도착 전 창이 열리면 최초 필터가 별을 놓칠 수 있어」)
//   그릴 때마다 부름 = 명부나 서버 후보가 늦게 와도 그다음 그림에서 빠짐 · 후보가 아직 없으면(빈 목록) 명부 gone 만 봄
export const livePicked = (raw: string[], cand: string[], gone: (n: string) => boolean): string[] =>
  raw.filter((n) => !gone(n) && (!cand.length || cand.includes(n)));
