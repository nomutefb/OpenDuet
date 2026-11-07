// 고른 멤버 거르기(순수) — 없어진 봇(명부 gone) · 서버 후보 밖 이름을 뺌(빠르 11-08 · 모루 #2861 · #2864 검토 「명부 도착 전 창이 열리면 최초 필터가 별을 놓칠 수 있어」)
//   그릴 때마다 부름 = 명부나 서버 후보가 늦게 와도 그다음 그림에서 빠짐 · 후보가 아직 없으면(빈 목록) 명부 gone 만 봄
export const livePicked = (raw: string[], cand: string[], gone: (n: string) => boolean): string[] =>
  raw.filter((n) => !gone(n) && (!cand.length || cand.includes(n)));

/** 저장 막는 까닭(순수) — 빈 글 = 저장해도 됨 · 단추 · 닫기 「저장하시겠습니까? 예」 두 입구가 같은 조건을 씀(모루 #2865 검토 「make 입구에도 준비 조건」 · 빠르 11-08) */
export const saveBlock = (purpose: string, picked: string[], busy: boolean): string =>
  busy ? "저장 중" : !purpose.trim() ? "목적을 적어 줘" : !picked.length ? "초대할 사람을 한 명 이상 골라 줘" : "";
