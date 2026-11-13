// 쉴 때 화면 가림 셈(순수 · 시험 tests/idle-blind.test.ts · 화면 = ./idle-blind.tsx)
/** 다시 읽은 뒤 「마지막 손」 시각 = 이 창에 적힌 값(하루 안 · 미래 아님) · 없거나 이상하면 지금 */
export const idleLast0 = (stored: string, now: number) => { const t = +stored; return Number.isFinite(t) && t > 0 && t <= now && now - t < 24 * 3600_000 ? t : now; };
