// 애들 화면 얼굴 펼침 = 그 애 관리 칸의 셈(순수 · 시험 있음) — 화면 = ./bot-manage.tsx
//   형 11-16 19:35 dm-bom(봄 옮김) 「그 러너활동 보는 창 있잖아. 거기에 봇 관련된 설정은 통합시키려고해.」 · 19:36 「그 봇 내용이 거기에 표시되는 곳에 모델명 지정까지 붙여서 거기서 일괄 관리 페이지가 되길 바라는거임 노력도랑.」
//   · 19:35 「내가 특정 봇에 개발을 임시로 언제까지 멈추게 지시하면 너에게 말을 안하더라도 그렇게 배분이 돌아가도록 하고싶음」
//   임시 멈춤 서버 = 이미 있는 쉼 지정(빠르 #4053 · GET · POST bots/rest {who, on, codes?, until?} · 한 손에 칸 하나 · 기한 지나면 셈에서 저절로 빠짐)
export type Rest = { at?: number; by?: string; codes?: string[]; until?: number };
export type RestMap = Record<string, Rest>;
export type UntilKey = "1h" | "night" | "morning" | "open";
export const UNTIL_KO: [UntilKey, string][] = [["1h", "1시간"], ["night", "오늘 밤"], ["morning", "내일 아침"], ["open", "풀 때까지"]];

const KST = 9 * 3600e3, DAY = 864e5;
/** 한국 시각의 그날 0시(ms). */
const day0 = (ms: number) => Math.floor((ms + KST) / DAY) * DAY - KST;

/** 고른 기한 → 끝나는 때(ms) · 「풀 때까지」 = undefined. 오늘 밤 = 오늘 자정 · 내일 아침 = 다음 09:00(지금이 09시 전이어도 「내일」 = 다음 날). */
export function untilOf(k: UntilKey, now: number): number | undefined {
  if (k === "1h") return now + 3600e3;
  if (k === "night") return day0(now) + DAY;
  if (k === "morning") return day0(now) + DAY + 9 * 3600e3;
  return undefined;
}

/** 지금 걸려 있나 — 칸이 있고 기한이 안 지남. */
export const restOn = (r: Rest | undefined, now: number): r is Rest => !!r && (!r.until || r.until > now);

const p2 = (n: number) => String(n).padStart(2, "0");
/** 기한 한 마디 — 오늘이면 「~21:00」 · 다른 날이면 「~11-17 09:00」 · 없으면 「풀 때까지」(자정 = 「~24:00」). */
export function untilKo(until: number | undefined, now: number): string {
  if (!until) return "풀 때까지";
  if (until === day0(now) + DAY) return "~24:00";
  const d = new Date(until + KST), hm = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
  return day0(until) === day0(now) ? `~${hm}` : `~${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())} ${hm}`;
}

/** 걸린 멈춤 한 줄 — 「개발 · ~21:00」 · 갈래 없으면 「전부」. name = 특기 코드 → 보이는 이름. */
export const restKo = (r: Rest, now: number, name: (code: string) => string): string => `${r.codes?.length ? r.codes.map(name).join(" · ") : "전부"} · ${untilKo(r.until, now)}`;

/** 서버로 보낼 몸 — 켜기 = {who, on:true, codes?, until?}(전부 · 풀 때까지면 그 칸을 안 보냄) · 풀기 = {who, on:false}. */
export function restBody(who: string, on: boolean, codes: string[], until: number | undefined): { who: string; on: boolean; codes?: string[]; until?: number } {
  if (!on) return { who, on: false };
  return { who, on: true, ...(codes.length ? { codes } : {}), ...(until ? { until } : {}) };
}
