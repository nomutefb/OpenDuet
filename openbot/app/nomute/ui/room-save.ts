// 저장 답 → 방 목록 캐시에 넣을 칸(빠르 11-08 · 모루 #2987 23:52 「서버 답은 {room, members} 인데 room 안엔 members 가 없음」)
//   임시방 저장 답 = { ok, room: {id, name, kind, temp, purpose, exp}, members: [...] } (editor [[path]].js temprooms POST)
//   room 이 그 방이 아니거나 없으면 = 보낸 값(fallback) · 명단 = 답 최상위 members 먼저 → room.members → 보낸 명단
export type SavedReply = { room?: { id?: string; [k: string]: unknown } | null; members?: unknown };
export function savedRoomPart(j: SavedReply | null | undefined, id: string, fallback: { members: string[]; [k: string]: unknown }): Record<string, unknown> {
  const room = j && j.room && j.room.id === id ? j.room : null;
  const top = j && Array.isArray(j.members) ? (j.members as unknown[]).filter((x): x is string => typeof x === "string") : null;
  const inner = room && Array.isArray(room.members) ? (room.members as string[]) : null;
  return { ...(room ? room : fallback), members: top ?? inner ?? fallback.members };
}
