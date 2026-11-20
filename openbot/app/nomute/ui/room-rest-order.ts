// 고정 밖 방 차례(순수 · ./room-list.tsx useRoomOrder 가 씀 · 폰 목록 · PC 얼굴 띠 한 벌)
//   칸 = 개인방(1:1) → 단톡 → 예비(손님 · guest) 맨 아래
//   개인방 = 안 읽은 방 먼저(형 11-19 21:42 dm-sia 시아 옮김 「시아 항상 고정 빼고는 단톡 포함 안 읽은 창이 가장 위에 올라오게해줘」)
//     → 형과 마지막 대화 새 것부터(talk · 형 11-19 13:27 · 16:49 dm-bom 봄 옮김)
//   단톡 = 개인방 아래 · 시간 순(마지막 글 새 것 위 · 안 읽음으로 안 뜀)(형 11-21 05:13 dm-sia 시아 옮김
//     「글구 회의실이나 이런 단톡이 봄바람이나 이런 단톡 나열 순위에 밀리면 안됨 단톡방끼리는 우성순위 유지. 한싹이 같은것만 별도」 「개인방이랑」
//     · 05:33 [결정] 답 「✓ 기타: 개인방 아래로 가는데 단톡도 시간 순」)
//   예비 = 늘 맨 아래(형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」) · 그 안 차례는 개인방과 같음
export type RestRoom = { id: string; with?: string; guest?: boolean };

const isGuest = (r: RestRoom) => !!r.guest;
/** 단톡 = 1:1 상대(with) 없는 방 · 예비는 1:1 이라 빠짐 */
export const isGroup = (r: RestRoom) => !r.with && !isGuest(r);
/** 칸 = 개인방 0 · 단톡 1 · 예비 2 */
export const restRank = (r: RestRoom) => (isGuest(r) ? 2 : isGroup(r) ? 1 : 0);

export function restOrder<T extends RestRoom>(rooms: T[], unread: (r: T) => boolean, talk: (r: T) => number, when: (r: T) => number): T[] {
  return [...rooms].sort((a, b) => restRank(a) - restRank(b) || (isGroup(a) ? when(b) - when(a) : Number(unread(b)) - Number(unread(a)) || talk(b) - talk(a)));
}
