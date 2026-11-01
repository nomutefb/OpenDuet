// 활동 빛 한 벌(형 11-01 11:36 「반투명한 연검은색이 지나가는 느낌이면 되구 좌상단에서 우하단으로 … 활성화된 방 제목 빛 지나감 … 외 2 생각중 ... 여기 이 생각중에도 적용해버리자」)
//   쓰는 곳 = 방 목록 활발한 방 이름(room-list.tsx) · 대화 칸 「생각중…」(office-chat.tsx) · 빛 = 형 react-bits ShinyText(shiny-text.tsx)
//   color = 글자 바탕(어두운 판 글자색 잰 값 · 원본은 색값을 캔버스로 읽어서 변수 못 씀) · shineColor = 반투명 연검정 · 135° + 오른쪽 = 좌상단 → 우하단
export const LIVE_SHINE = { color: "#f4f4f5", shineColor: "rgba(18, 18, 20, 0.55)", angle: 135, direction: "right" as const, speed: 2.2, delay: 1.2, shineWidth: 60, glow: 0 };
