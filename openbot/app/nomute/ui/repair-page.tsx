// 서랍 「수리 접수」 화면 = 옛 「할 일」 자리(형 11-14 「할일 안에 수리접수를 할일로 빼내고 할일을 없애줘, 대신 연관된 배선들도 다 여기로 엮어야해」)
//   옛 할 일 = 결정 카드 · 밤 요약 · 수리 접수 줄임표 + 늘 빈 「진행 · 다음」 목록(원본 할 일 = 우리 서버엔 없는 길이라 늘 0)
//   지금 = 접수 창구(./repair-desk.tsx · 넣는 칸 + 목록 + 보관) 통째 · 위 = 형 결정 카드(있을 때만 · 서랍 숫자가 세는 그것) · 아래 = 밤 요약
//   길 = 그대로 #/tasks(옛 알림 · 링크가 안 끊기게) · 숫자 = ./repair-count.ts(결정 대기 + 접수 방 안 읽은 글)
import { RepairDesk } from "./repair-desk";
import { NomuteToday } from "./today";

export function RepairPage() {
  return <RepairDesk page lead={<NomuteToday part="decide" />} tail={<NomuteToday part="brief" />} />;
}
export default RepairPage;
