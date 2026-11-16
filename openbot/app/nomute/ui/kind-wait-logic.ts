// 스케줄 화면 「모아 깨우기」의 셈(순수 · 시험 tests/kind-wait.test.ts) — 화면 = ./sched-extra.tsx KindWaits
//   용건(kind)마다 「이만큼 모았다가 깨움」(delay_max · 분) · 서버 = editor functions/api/office/_schedset.js(2 ~ 240 정수 · 기한 ttl 을 못 넘음)
//   설정 「스케줄러 바꾸기」의 숫자 칸에서 옮김(형 11-17 03:24 구름 맥 창 「너가 말한거 반영하고 너 의견 따를테니 묻지말고 진행해」) — 숫자 칸 대신 낱말 줄(지금 값 = 라임)
export const WAIT_LO = 2, WAIT_HI = 240, WAIT_OPTS = [2, 5, 10, 30, 60, 120, 240];

/** 분 → 한 마디(2분 이하 = 「바로」 · 「30분」 · 「1시간」 · 「1시간 30분」 · 「1일」). */
export function waitKo(m: number): string {
  if (!(m > WAIT_LO)) return "바로";
  if (m % 1440 === 0) return `${m / 1440}일`;
  const h = Math.floor(m / 60), r = m % 60;
  return h && r ? `${h}시간 ${r}분` : h ? `${h}시간` : `${r}분`;
}
/** 고를 수 있는 값인가 — 서버와 같은 잣대(2 ~ 240 · 기한 안). */
export const waitOk = (v: number, ttl?: number): boolean => Number.isInteger(v) && v >= WAIT_LO && v <= WAIT_HI && !(Number.isFinite(ttl) && v > (ttl as number));
/** 낱말 줄 — 고를 수 있는 기본 값 + 지금 값(그 밖이면 끼움 · 작은 것부터) · 지금 값이 서버 범위 밖(예 720분)이어도 줄에 보임. */
export function waitOpts(cur: number | undefined, ttl?: number): number[] {
  const base = WAIT_OPTS.filter((v) => waitOk(v, ttl));
  return Number.isFinite(cur) && !base.includes(cur as number) ? [...base, cur as number].sort((a, b) => a - b) : base;
}
