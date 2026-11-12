// 둘의 방 귀속(형 11-13 08:29 봄 1:1 「그리구 봄 챙 방은 채팅창 맨 아래에 순위로 두게해주라. 아니면 그냥 둘 대화로 귀속시켜주면 안돼? 둘 대화인데 따로 빠지는게 영 어색하네」 · 봄 08:30 · 시아)
//   = 형 목록 · PC 띠에 「봄 · 챙」 같은 둘의 방(pair-*)을 따로 안 세움 · 그 방 글은 이름이 든 1:1(dm-봄) 안에 시각 차례로 섞여 보임 · 형이 쓰는 곳 · 부름은 그대로
export type PairRoomLike = { id: string; name?: string; with?: string };
/** 1:1 방 → 그 이가 낀 둘의 방 id(없으면 "") — 이름 「봄 · 챙」 의 한쪽이 그 이 */
export function pairOf(r: PairRoomLike | undefined, rooms: PairRoomLike[]): string {
  if (!r?.with) return "";
  return rooms.find((x) => x.id.startsWith("pair-") && String(x.name || "").split(/\s*·\s*/).includes(r.with as string))?.id || "";
}
/** 두 방 글 = 시각 차례 · 같은 id 하나 */
export function mergeTs<T extends { id: string; ts: number }>(a: T[], b: T[]): T[] {
  const seen = new Set<string>(), out: T[] = [];
  for (const m of [...a, ...b].sort((x, y) => x.ts - y.ts)) if (!seen.has(m.id)) { seen.add(m.id); out.push(m); }
  return out;
}
export const isPairRoom = (id: string) => id.startsWith("pair-");
