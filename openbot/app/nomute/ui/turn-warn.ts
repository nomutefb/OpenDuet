// 지속(이번 턴 몇 분째) 판정 한 곳 — 애들 시간 줄(./bot-inbox-logic.ts timeRows · 하늘) · 대화창 종 옆 경고등(R0076 · 구름)이 같이 씀
//   형 11-21 07:46 dm-sia 시아 옮김 「누적 250 넘어가면 경고색 지속 80 넘어가면 경고색」 · 07:49 「응 지속 80분 넘으면 대화창 종 옆에 경고등 나오게 해줄래? 픽토그램만」
//   turnAt = 서버 turn_at(이번 턴 시작 ms · 쉬면 null · 번개 서버 칸 · 시아 11-21 07:47)
export const TURN_WARN_MIN = 80;
/** 지금 N분째(turnAt 이 없거나 앞날이면 undefined) */
export const turnMin = (turnAt: unknown, now: number): number | undefined => (typeof turnAt === "number" && turnAt > 0 && turnAt <= now ? Math.floor((now - turnAt) / 60_000) : undefined);
/** 지속 80분 넘음 */
export const turnWarn = (turnAt: unknown, now: number): boolean => (turnMin(turnAt, now) ?? 0) > TURN_WARN_MIN;
