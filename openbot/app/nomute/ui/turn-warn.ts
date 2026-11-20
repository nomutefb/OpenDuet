// 지속(이번 턴 몇 분째) 판정 한 곳 — 애들 시간 줄(./bot-inbox-logic.ts timeRows · 하늘) · 대화창 종 옆 경고등(R0076 · 구름)이 같이 씀
//   형 11-21 07:46 dm-sia 시아 옮김 「누적 250 넘어가면 경고색 지속 80 넘어가면 경고색」 · 07:49 「응 지속 80분 넘으면 대화창 종 옆에 경고등 나오게 해줄래? 픽토그램만」
//   turnAt = 서버 turn_at(이번 턴 시작 ms · 쉬면 null · 번개 서버 칸 · 시아 11-21 07:47)
export const TURN_WARN_MIN = 80;
/** 지금 N분째(turnAt 이 없거나 앞날이면 undefined) */
export const turnMin = (turnAt: unknown, now: number): number | undefined => (typeof turnAt === "number" && turnAt > 0 && turnAt <= now ? Math.floor((now - turnAt) / 60_000) : undefined);
/** 지속 80분 넘음 */
export const turnWarn = (turnAt: unknown, now: number): boolean => (turnMin(turnAt, now) ?? 0) > TURN_WARN_MIN;

type StatRow = { name?: string; turn_at?: number | null };
/** 그 애 turn_at(서버 status 줄 · activity 묶음 먼저 · 이름 = 그 애) · 없으면 null — 대화방 목록 종 옆 경고등(R0076 · 구름) · 받아오기 = 같은 status 캐시 */
export function turnAtOf(st: { cats?: { id?: string; rows?: StatRow[] }[] } | undefined | null, who: string): number | null {
  if (!st?.cats || !who) return null;
  const cats = [...st.cats].sort((a, b) => Number(b.id === "activity") - Number(a.id === "activity"));
  for (const c of cats) for (const r of c.rows || []) if (r?.name === who && typeof r.turn_at === "number" && r.turn_at > 0) return r.turn_at;
  return null;
}
