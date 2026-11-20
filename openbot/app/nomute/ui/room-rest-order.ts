// 고정 밖 방 차례(순수 · ./room-list.tsx useRoomOrder 가 씀 · 폰 목록 · PC 얼굴 띠 한 벌)
//   예비(손님 · guest) 늘 맨 아래(형 11-20 07:17 dm-gik 깃 옮김 「웅 예비창은 항상 제일 아래로 가게 해주라」)
//   → 안 읽은 방 먼저(형 11-19 21:42 dm-sia 시아 옮김 「시아 항상 고정 빼고는 단톡 포함 안 읽은 창이 가장 위에 올라오게해줘」)
//   → 형과 마지막 대화 새 것부터(talk · 형 11-19 13:27 · 16:49 dm-bom 봄 옮김)
//   단톡끼리는 정한 차례 그대로 — 안 읽음 · 새 글로 안 뒤집힘(형 11-21 05:13 dm-sia 시아 옮김
//   「글구 회의실이나 이런 단톡이 봄바람이나 이런 단톡 나열 순위에 밀리면 안됨 단톡방끼리는 우성순위 유지. 한싹이 같은것만 별도」 「개인방이랑」)
//   = 위 차례로 줄 세운 뒤 단톡이 앉은 자리만 단톡 차례로 다시 채움(1:1 · 예비 자리는 그대로)
export type RestRoom = { id: string; name: string; with?: string; guest?: boolean };

const MEET = "all";   // 회의실 방 id(./room-menu.tsx MEET)
const OLD_BAP = "guide";   // 옛 밥상 방 id(./room-glyph.tsx · 밥상 아이콘 박음)

const isGuest = (r: RestRoom) => !!r.guest;
/** 단톡 = 1:1 상대(with) 없는 방 · 예비는 1:1 이라 빠짐 */
export const isGroup = (r: RestRoom) => !r.with && !isGuest(r);
/** 밥상 = 지금은 지정방 tmp-… 이라 id 로 못 박음 → 이름이 「밥상」으로 시작(형 11-21 05:11 「제목에 밥상만 유지하자」) · 옛 id 도 */
export const isBap = (r: RestRoom) => r.id === OLD_BAP || /^\s*밥상/.test(r.name || "");
/** 단톡 차례 칸 = 회의실 → 밥상 → 나머지 단톡 */
export const groupRank = (r: RestRoom) => (r.id === MEET ? 0 : isBap(r) ? 1 : 2);

export function restOrder<T extends RestRoom>(rooms: T[], unread: (r: T) => boolean, talk: (r: T) => number): T[] {
  const base = [...rooms].sort((a, b) => Number(isGuest(a)) - Number(isGuest(b)) || Number(unread(b)) - Number(unread(a)) || talk(b) - talk(a));
  const groups = base.filter(isGroup).sort((a, b) => groupRank(a) - groupRank(b) || talk(b) - talk(a));   // 같은 칸(나머지 단톡) 안 = 새 대화 순
  let i = 0;
  return base.map((r) => (isGroup(r) ? groups[i++] : r));
}
