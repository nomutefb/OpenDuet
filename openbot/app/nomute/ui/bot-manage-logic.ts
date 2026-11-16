// 애들 화면 얼굴 펼침 = 그 애 관리 칸의 셈(순수 · 시험 있음) — 화면 = ./bot-manage.tsx
//   형 11-16 19:35 dm-bom(봄 옮김) 「그 러너활동 보는 창 있잖아. 거기에 봇 관련된 설정은 통합시키려고해.」 · 19:36 「그 봇 내용이 거기에 표시되는 곳에 모델명 지정까지 붙여서 거기서 일괄 관리 페이지가 되길 바라는거임 노력도랑.」
//   · 19:35 「내가 특정 봇에 개발을 임시로 언제까지 멈추게 지시하면 너에게 말을 안하더라도 그렇게 배분이 돌아가도록 하고싶음」
//   임시 멈춤 서버 = 이미 있는 쉼 지정(빠르 #4053 · GET · POST bots/rest {who, on, codes?, until?} · 한 손에 칸 하나 · 기한 지나면 셈에서 저절로 빠짐)
export type Rest = { at?: number; by?: string; codes?: string[]; until?: number };
export type RestMap = Record<string, Rest>;

// ── 끄는 막대(형 11-16 20:5x 구름 맥 창 「기간 설정은 이것도 참고해보고.」 · 본보기 영상 = 24시간 길 위 막대의 오른쪽 손잡이를 끌어 늘림 · 막대 안에 걸리는 시간 · 저장하면 잠김) ──
//   길 = 지금부터 24시간 · 한 칸 = 30분 · 0분 = 풀 때까지
export const HOLD_STEP = 30, HOLD_MAX = 24 * 60;
/** 길 위 자리(0~1) → 분(30분 칸에 붙음 · 30분 ~ 24시간). */
export const minsAt = (p: number): number => Math.max(HOLD_STEP, Math.min(HOLD_MAX, Math.round((p * HOLD_MAX) / HOLD_STEP) * HOLD_STEP));
/** 분 → 길 위 자리(0~1). */
export const posOf = (mins: number): number => Math.max(0, Math.min(1, mins / HOLD_MAX));
/** 걸리는 시간 한 마디 — 「30분」 · 「3시간」 · 「3시간 30분」. */
export const durKo = (mins: number): string => { const h = Math.floor(mins / 60), m = mins % 60; return h && m ? `${h}시간 ${m}분` : h ? `${h}시간` : `${m}분`; };
/** 고른 분 → 끝나는 때(ms) · 0 = 풀 때까지(undefined). */
export const untilOf = (mins: number, now: number): number | undefined => (mins > 0 ? now + mins * 60e3 : undefined);

const KST = 9 * 3600e3, DAY = 864e5;
/** 한국 시각의 그날 0시(ms). */
const day0 = (ms: number) => Math.floor((ms + KST) / DAY) * DAY - KST;
const p2 = (n: number) => String(n).padStart(2, "0");

/** 길 밑 눈금 — 지금부터 24시간 안의 6시간 금(00 · 06 · 12 · 18시) → [{x: 0~1, label}]. */
export function ticksOf(now: number): { x: number; label: string }[] {
  const out: { x: number; label: string }[] = [];
  for (let t = day0(now); t <= now + DAY; t += 6 * 3600e3) if (t > now) out.push({ x: (t - now) / DAY, label: `${p2(new Date(t + KST).getUTCHours())}:00` });
  return out;
}

/** 지금 걸려 있나 — 칸이 있고 기한이 안 지남. */
export const restOn = (r: Rest | undefined, now: number): r is Rest => !!r && (!r.until || r.until > now);

/** 끝나는 때 한 마디 — 오늘이면 「21:40」 · 내일이면 「내일 09:00」 · 그 뒤면 「11-18 09:00」 · 없으면 「풀 때까지」. */
export function endKo(until: number | undefined, now: number): string {
  if (!until) return "풀 때까지";
  const d = new Date(until + KST), hm = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`, gap = Math.round((day0(until) - day0(now)) / DAY);
  return gap <= 0 ? hm : gap === 1 ? `내일 ${hm}` : `${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())} ${hm}`;
}

/** 걸린 멈춤 한 줄 — 「Dev. · 내일 09:00 까지」 · 갈래 없으면 「전부」 · 기한 없으면 「전부 · 풀 때까지」. name = 특기 코드 → 보이는 이름. */
export const restKo = (r: Rest, now: number, name: (code: string) => string): string => `${r.codes?.length ? r.codes.map(name).join(" · ") : "전부"} · ${endKo(r.until, now)}${r.until ? " 까지" : ""}`;

/** 걸린 멈춤의 길 위 자리(0~1) — 남은 시간 / 24시간 · 기한 없음 = 길 끝까지. */
export const restPos = (r: Rest, now: number): number => (r.until ? Math.max(0.02, Math.min(1, (r.until - now) / DAY)) : 1);

/** 서버로 보낼 몸 — 켜기 = {who, on:true, codes?, until?}(전부 · 풀 때까지면 그 칸을 안 보냄) · 풀기 = {who, on:false}. */
export function restBody(who: string, on: boolean, codes: string[], until: number | undefined): { who: string; on: boolean; codes?: string[]; until?: number } {
  if (!on) return { who, on: false };
  return { who, on: true, ...(codes.length ? { codes } : {}), ...(until ? { until } : {}) };
}
