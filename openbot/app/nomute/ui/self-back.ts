// 우리 손 뒤로(판을 닫으며 쌓아 둔 기록 한 칸을 걷음) — 대화 판 shell 뒤로 처리(「뒤로 = 대화방 목록」)가 이걸 형이 누른 뒤로로 읽지 않게 표시를 남김
//   까닭: 움짤 판 · 「@」 명부 · 결정 창 · 사진 크게 보기 · 공지 창은 열 때 한 칸 쌓고 닫을 때 history.back() 으로 걷는데, 그 판이 popstate 전에 먼저 사라지면 shell 이 방 밖(목록)으로 내보냄
//   (형 11-14 01:24 봄 옮김 「응 글구 폰에서 움짤쓰면 다시 밖으로 나가져 버리네」 · 「@」 명부 닫힘 = 다른 길로 닫히면 걷는 꼴 · 뎅)
const KEY = "__nmSelfBack";
export function selfBack() {
  (window as unknown as Record<string, number>)[KEY] = Date.now();
  history.back();
}
/** 방금(1.5초 안) 우리 손으로 걷은 뒤로인가 — shell 뒤로 처리가 넘김 */
export const selfBackNow = () => Date.now() - ((window as unknown as Record<string, number>)[KEY] || 0) < 1500;
