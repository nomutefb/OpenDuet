// 글 반응 표 맞추기 — 서버 POST /api/office/rooms/<방>/reactions 답의 reactions 는 그 글 하나의 {이모지: [누가]}(functions/api/office/_react.js)
//   방 전체 표({글 id: {이모지: [누가]}})로 통째로 바꿔 끼우면 방 반응이 다 지워졌다가 60초 뒤 다시 받을 때 돌아옴 = 수리 No.22(형 11-01 「사무실 에서 한거는 생겻다사 사라져」) → 그 글 칸만 바꿈
export type RoomReacts = Record<string, Record<string, string[]>>;

export function mergeReact<T extends { reactions?: RoomReacts }>(old: T | undefined, id: string, one: Record<string, string[]> | undefined): T & { reactions: RoomReacts } {
  return { ...(old || ({} as T)), reactions: { ...(old?.reactions || {}), [id]: one || {} } };
}
