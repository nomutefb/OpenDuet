// 임시방 「방 설정」 한 곳 모으기의 셈(순수 · 시험 tests/room-set.test.ts) — 화면 = ./temp-room.tsx TempRoomDialog
//   형 11-17 00:46 ~ 00:47 dm-bom(봄 옮김) 「글구 구름이 낄꺼면 여기도 끼게 그냥 해버려 여긴 없으니 수가 안맞네」
//   · 「그리고 방 설정에 멤버 최대 수랑 멤버 인원 누군지도 조정 가능해야할 듯 그니까 멤버 인원 이랑 내보내기가 아래에 따로잇는데 방 설정에 통합」 · 「메뉴가 분산되어잇능거 생각해서 좀 모아좌」
//   · 00:49 「지금 일 저 부분을 따로 두던지 여튼 저거는 우선적으로 해결 얼마나 적용시켜서 방에 머물게 할건지도」
//   서버 칸 = 깃 `max`(정수 · 없거나 0 = 제한 없음 · 형은 안 셈) · 빠르 `task` · `task_idle_min` · `task_exp`

/** 고르개에 보일 이름 = 서버 후보 + 지금 멤버(후보에 없는 멤버도 칩으로 보임 → 저장할 때 말없이 빠지지 않음 · 실물 = 봄바람에서 구름이 후보에 없어 저장과 함께 빠졌음). */
export const memberCand = (cand: string[], members: string[]): string[] => [...cand, ...members.filter((n) => !cand.includes(n))];

// ── 최대 인원 — 화면 숫자는 형을 더해 보임(머리 숫자 · 고르개 숫자와 같은 셈) · 서버 max 는 형을 안 셈 ──
export const MAX_HI = 50;
/** 서버 max → 화면 숫자(형 포함) · 0 = 제한 없음. */
export const maxShow = (max: number): number => (max > 0 ? max + 1 : 0);
/** 한 칸 올리고 내리기 — 제한 없음(0)에서 누르면 지금 멤버 수부터 · 1 ~ 50 안. */
export const maxStep = (max: number, by: number, picked: number): number => Math.max(1, Math.min(MAX_HI, (max > 0 ? max : Math.max(picked, 1)) + (max > 0 ? by : 0)));
/** 저장 막는 까닭 — 고른 멤버가 최대 인원을 넘음(서버도 같은 까닭으로 거절) · 빈 글 = 됨. */
export const maxBlock = (picked: number, max: number): string => (max > 0 && picked > max ? `최대 ${max + 1}명인데 지금 ${picked + 1}명이야` : "");

// ── 지금 일 · 머무는 시간(조용하면 비워지는 분) ──
export const IDLE_DEFAULT = 60, IDLE_OPTS = [30, 60, 120, 180];
/** 분 → 한 마디(「30분」 · 「1시간」 · 「1시간 30분」). */
export const idleKo = (m: number): string => { const h = Math.floor(m / 60), r = m % 60; return h && r ? `${h}시간 ${r}분` : h ? `${h}시간` : `${r}분`; };
/** 고를 낱말 — 기본 넷 + 지금 값이 그 밖이면 끼워 넣음(작은 것부터). */
export const idleOpts = (cur: number): number[] => (IDLE_OPTS.includes(cur) || !(cur > 0) ? IDLE_OPTS : [...IDLE_OPTS, cur].sort((a, b) => a - b));
/** 서버가 「지금 일」 칸을 주는 방인가 — 칸이 하나라도 오면 방 설정에 그 줄을 띄움(서버가 아직 없으면 안 뜸). */
export const hasTask = (r: { task?: unknown; task_idle_min?: unknown; task_exp?: unknown } | null | undefined): boolean => !!r && (r.task !== undefined || r.task_idle_min !== undefined || r.task_exp !== undefined);

type Set0 = { max: number; task: string; idle: number };
/** 서버로 보낼 몸 — 이름 · 지침 · 멤버는 늘 · 기한은 골랐을 때만 · max · task · task_idle_min 은 바뀐 것만(안 보내면 서버가 그대로 둠). */
export function setBody(v: { name: string; purpose: string; members: string[]; hours: number | null } & Set0, base: Set0 | null): Record<string, unknown> {
  return {
    name: v.name, purpose: v.purpose, members: v.members, ...(v.hours === null ? {} : { hours: v.hours }),
    ...(base && v.max !== base.max ? { max: v.max } : {}),
    ...(base && v.task.trim() !== base.task ? { task: v.task.trim() } : {}),
    ...(base && v.idle !== base.idle ? { task_idle_min: v.idle } : {}),
  };
}
