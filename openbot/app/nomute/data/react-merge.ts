// 글 반응 표 맞추기 — 서버 POST /api/office/rooms/<방>/reactions 답의 reactions 는 그 글 하나의 {이모지: [누가]}(functions/api/office/_react.js)
//   방 전체 표({글 id: {이모지: [누가]}})로 통째로 바꿔 끼우면 방 반응이 다 지워졌다가 60초 뒤 다시 받을 때 돌아옴 = 수리 No.22(형 11-01 「사무실 에서 한거는 생겻다사 사라져」) → 그 글 칸만 바꿈
export type RoomReacts = Record<string, Record<string, string[]>>;

export function mergeReact<T extends { reactions?: RoomReacts }>(old: T | undefined, id: string, one: Record<string, string[]> | undefined): T & { reactions: RoomReacts } {
  return { ...(old || ({} as T)), reactions: { ...(old?.reactions || {}), [id]: one || {} } };
}

// 내 반응 바꾸기(형 11-08 09:23 · ui/office-chat.tsx swapRx) = 옛 것 빼기 → 새 것 담기 두 번 부름
//   첫 부름이 되면 그 답을 바로 apply — 둘째가 실패해도 표 = 서버(옛 판은 첫 답을 버려서 화면 A · 서버 없음 → 60초 안 다시 바꾸면 A 가 되살아 A+B · 모루 #2910 ①)
//   같은 글은 한 번에 하나(busy · 겹친 누름은 버림 = false)
type Rx = { reactions?: Record<string, string[]> };
export async function swapReact(post: (emoji: string) => Promise<Rx>, apply: (one: Record<string, string[]> | undefined) => void, v: { from: string; to: string; hasTo: boolean }): Promise<Rx> {
  const j = await post(v.from);
  apply(j.reactions);
  if (v.hasTo) return j;
  const k = await post(v.to);
  apply(k.reactions);
  return k;
}
export function swapLock(busy: Set<string>, id: string, run: () => Promise<unknown>): boolean {
  if (busy.has(id)) return false;
  busy.add(id);
  run().finally(() => busy.delete(id)).catch(() => {});
  return true;
}
