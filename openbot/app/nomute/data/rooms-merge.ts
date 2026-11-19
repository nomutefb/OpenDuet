// 방 목록 = 바뀐 방만 받아 합침(빠르 11-14 · sync.ts roomsDelta 가 씀 · 순수라 시험이 바로 부름)
export type RoomRow = { id: string };

/** 순수 — 받은 답을 지금 목록에 합침 · null = 통째로 다시 받을 때(새 방 · 없어진 방). 옛 서버(partial 없음) = 받은 통째 그대로. */
export function mergeRooms<T extends RoomRow>(cur: T[], want: string[], j: { rooms?: T[]; partial?: boolean }): T[] | null {
  if (!j.partial) return j.rooms || [];
  const got = new Map((j.rooms || []).map((r) => [r.id, r]));
  const have = new Set(cur.map((r) => r.id));
  if (want.some((id) => got.has(id) !== have.has(id))) return null;
  return cur.map((r) => got.get(r.id) ?? r);
}

/** 순수 — 읽음 표(방 → {ts, at})에서 달라진 방 id(생김 · 사라짐 · ts · at 바뀜) · 읽음 표가 바뀌었을 때 그 방 칸만 다시 받으려고(sync.ts seenDelta) */
export function seenChanged(prev: Record<string, { ts?: number; at?: number } | undefined>, next: Record<string, { ts?: number; at?: number } | undefined>): string[] {
  const out: string[] = [];
  for (const id of new Set([...Object.keys(prev), ...Object.keys(next)])) {
    const a = prev[id], b = next[id];
    if ((Number(a?.ts) || 0) !== (Number(b?.ts) || 0) || (Number(a?.at) || 0) !== (Number(b?.at) || 0)) out.push(id);
  }
  return out;
}
