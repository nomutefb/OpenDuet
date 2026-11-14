// 「수리 접수」 숫자 한 곳 — 서랍 칸 · 아래 막대 「서랍」 · 대화방 ＋ 단추가 같이 씀(형 11-14 「연관된 배선들도 다 여기로 엮어야해」)
//   = 형 결정 대기(./decide-count.ts) + 접수 방 안 읽은 글(대화방 목록과 같은 잣대 · ./room-list.tsx count)
import { useDecideWaiting } from "./decide-count";
import { REPAIR_ROOM } from "./repair-desk";
import { useRoomOrder } from "./room-list";

/** 접수 방 안 읽은 글 수(방이 없으면 0) */
export function useRepairUnread(): number {
  const { rooms, count } = useRoomOrder();
  const rp = (rooms.data || []).find((x) => x.id === REPAIR_ROOM);
  return rp ? Math.max(0, count(rp)) : 0;
}
export function useRepairWaiting(): number {
  return useDecideWaiting() + useRepairUnread();
}
