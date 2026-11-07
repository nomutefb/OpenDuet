// 계정 상태 표 시간 셈(형 11-07 17:18 윈터 1:1 「윈터야, 계정표, 디데이 몇일남았는지 뜨게해줘 2일 00시간 이런식으로. 긜고 하루 평균 소모량 뜨게해주고」)
//   순수 함수만 · 화면 = ../ui/status-board.tsx AcctTable · 시험 = ../tests/acct-time.test.ts
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const p2 = (n: number) => String(n).padStart(2, "0");

/** 그때까지 남은 시간 = 「2일 03시간」(하루 안 = 「5시간 20분」 · 한 시간 안 = 「12분」) · 지났거나 없으면 "" */
export function leftKo(to: number | undefined, now = Date.now()): string {
  if (!to || !Number.isFinite(to)) return "";
  const ms = to - now;
  if (ms <= 0) return "";
  const d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / HOUR), m = Math.floor((ms % HOUR) / MIN);
  if (d > 0) return `${d}일 ${p2(h)}시간`;
  if (h > 0) return `${h}시간 ${p2(m)}분`;
  return `${Math.max(1, m)}분`;
}

/** 「2026-11-10」 결제 끝 = 그날 00:00 한국 시각(ms) · 꼴이 아니면 undefined */
export function payEndAt(day: string | undefined): number | undefined {
  if (!day || !/^\d{4}-\d\d-\d\d$/.test(day)) return undefined;
  const t = Date.parse(`${day}T00:00:00+09:00`);
  return Number.isFinite(t) ? t : undefined;
}

export type Pace = { perDay: number; atReset: number; outAt?: number };

/** 주간 창 하루 평균 씀 = 이번 주 쓴 % ÷ 그 값을 잰 때까지 지난 날(다시 참 − 7일부터)
 *  · at = 남은 % 를 잰 때(그린 때 아님 · 모루 11-07 17:36 「평균·예측이 과거 관측값을 현재 시각으로 나눠」 = 같은 값을 다음 날 그리면 평균이 반으로 줄던 것)
 *  · atReset = 이대로 가면 다시 찰 때 남는 % · outAt = 그 전에 바닥나면 바닥나는 때(잰 때부터 셈)
 *  · 주 시작 6시간 안은 6시간으로 나눔(첫날 숫자가 튀지 않게) · 남은 %·다시 참이 없거나 잰 때가 다시 참 뒤면 null */
export function weekPace(left: number | undefined, reset: number | undefined, at = Date.now(), span = 7 * DAY): Pace | null {
  if (left === undefined || !Number.isFinite(left) || !reset || !Number.isFinite(at) || reset <= at) return null;
  const gone = Math.max(at - (reset - span), 6 * HOUR) / DAY;
  const used = Math.max(0, 100 - left), perDay = used / gone;
  const atReset = left - perDay * ((reset - at) / DAY);
  const outAt = perDay > 0 && atReset < 0 ? at + (left / perDay) * DAY : undefined;
  return { perDay: Math.round(perDay * 10) / 10, atReset: Math.max(0, Math.round(atReset)), outAt };
}

/** 잰 지 오래된 값 = 예측을 숨김(기본 1시간 · 몸 보고 5분 · 한도 읽기 15분 막음이라 넉넉히) */
export const STALE_OBS = 60 * MIN;
export function staleObs(at: number | undefined, now = Date.now(), max = STALE_OBS): boolean {
  return !at || !Number.isFinite(at) || now - at > max;
}

/** 칸 가운데 주간 창(「7일」·「주간」·week) · 없으면 undefined */
export function weekCell<C extends { left_pct?: number; reset_at?: number }>(cells: Record<string, C> | undefined): C | undefined {
  const hit = Object.entries(cells || {}).find(([k]) => /7일|주간|week/i.test(k));
  return hit ? hit[1] : undefined;
}
