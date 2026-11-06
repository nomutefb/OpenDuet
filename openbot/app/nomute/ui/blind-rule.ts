// 화면 가림 셈(순수 · 시험 tests/blind.test.ts) — 형 11-06 17:31 「15분 미입력시 화면 가림 … 블라인드는 한 85퍼」
export const BLIND_IDLE_MS = 15 * 60_000;
export const BLIND_ALPHA = 0.85;

/** 지금 덮을 때인가 = 켬 · 아직 안 덮임 · 마지막 입력 뒤 기준 시간이 참 */
export const blindDue = (on: boolean, veiled: boolean, lastInput: number, now: number, idleMs = BLIND_IDLE_MS) =>
  on && !veiled && now - lastInput >= idleMs;
