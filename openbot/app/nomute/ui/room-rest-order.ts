// 고정 밖 방 차례(순수 · ./room-list.tsx useRoomOrder 가 씀 · 폰 목록 · PC 얼굴 띠 한 벌)
//   형 11-21 05:33 dm-sia 시아 옮김 「PM 고정 개인 단톡 예비 순 이려나」 「그다음 조건이 시간이고」(앞 [결정] 답 「✓ 기타: 개인방 아래로 가는데 단톡도 시간 순」)
//   = PM · 고정(./room-list.tsx pin) 다음 칸 = 개인방(1:1) → 단톡 → 예비(손님 · guest) · 칸 안 = 시간 새 것 위 · 안 읽음은 차례에 안 씀(줄 숫자 · 점만)
//   개인방 · 예비 시간 = talk(형과 마지막 대화 · 형 11-19 13:27 · 16:49 dm-bom 봄 옮김) · 단톡 시간 = when(목록 시각 = 마지막 글)
//   갈음: 11-19 21:42 「단톡 포함 안 읽은 창이 가장 위에」 → 05:13 「단톡방끼리는 우성순위 유지」 · 05:33 위 말(옛 안 읽은 임시방이 회의실 위로 뜬 게 형 불만)
//   예비 맨 아래 = 형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」
export type RestRoom = { id: string; with?: string; guest?: boolean };

const isGuest = (r: RestRoom) => !!r.guest;
/** 단톡 = 1:1 상대(with) 없는 방 · 예비는 1:1 이라 빠짐 */
export const isGroup = (r: RestRoom) => !r.with && !isGuest(r);
/** 칸 = 개인방 0 · 단톡 1 · 예비 2 */
export const restRank = (r: RestRoom) => (isGuest(r) ? 2 : isGroup(r) ? 1 : 0);

export function restOrder<T extends RestRoom>(rooms: T[], talk: (r: T) => number, when: (r: T) => number): T[] {
  const t = (r: T) => (isGroup(r) ? when(r) : talk(r));
  return [...rooms].sort((a, b) => restRank(a) - restRank(b) || t(b) - t(a));
}
