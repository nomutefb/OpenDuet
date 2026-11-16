// 1:1 에서 여럿을 부르면 서버가 여는 임시방(형 11-16 20:09 dm-bom 「글구 개인대화에서 내가 누구 호출 가능하게 해줘 다수로 그러면 자동으로 1시간 유지방 생성 되게하고 … 그리고 나는 바로 그 방으로 이동해야하고」 · 봄 나눔 = 서버 깃 · 앱 구름)
//   서버 꼴(깃 20:22 회의실): 보내기 답 {message: {…, room: "tmp-…"}, spawned: {id, name, exp, from, members}} · 방 자료 temp · exp · from · spawned · 옮겨 온 글 fwd {room, id, ts}
//   여기 = 셈만(순수 · 시험 있음) · 화면 = ./office-chat.tsx(보낸 뒤 옮김 · 옮겨 온 글 끝 금) · ./temp-room.tsx(방 머리 남은 시간)
import type { OfficeRoom } from "../data/office";

export type Spawned = { id: string; name?: string; exp?: number; from?: string; members?: string[] };
export type Fwd = { room?: string; id?: string; ts?: number };

/** 보내기 답에서 새 방 칸 — 방 id 가 있을 때만(없으면 예전 그대로). */
export function spawnedOf(j: unknown): Spawned | null {
  const s = (j as { spawned?: Spawned } | null | undefined)?.spawned;
  return s && typeof s.id === "string" && s.id ? s : null;
}

/** 방 목록 캐시에 새 방을 먼저 넣음 — 서버 목록을 다시 읽기 전에도 그 방 화면이 바로 뜸(이미 있으면 그 줄에 덮어 씀). */
export function withSpawned(rooms: OfficeRoom[] | undefined, s: Spawned): OfficeRoom[] | undefined {
  if (!Array.isArray(rooms)) return rooms;
  const room = { id: s.id, name: s.name || s.id, kind: "group", temp: true, exp: s.exp, members: s.members || [], from: s.from, spawned: true } as OfficeRoom;
  return rooms.some((r) => r.id === s.id) ? rooms.map((r) => (r.id === s.id ? { ...r, ...room } : r)) : [...rooms, room];
}

/** 남은 시간 한 마디 — 1시간 안쪽 = 분(1시간짜리 방이라 「1시간 남음」만으론 모름) · 그 위 = 시간 · 하루 넘으면 일 · 지났으면 「곧 사라짐」. */
export function leftKo(exp: number, now = Date.now()): string {
  const ms = exp - now;
  if (ms <= 0) return "곧 사라짐";
  const m = Math.ceil(ms / 60e3);
  if (m < 60) return `${m}분 남음`;
  const h = Math.ceil(ms / 3600e3);
  return h >= 24 ? `${Math.ceil(h / 24)}일 남음` : `${h}시간 남음`;
}

/** 옮겨 온 글의 끝인가 — 이 글은 옮겨 온 글이고 다음 글은 아님(그 밑에 금 하나). */
export const fwdEnd = (cur: { fwd?: Fwd } | undefined, next: { fwd?: Fwd } | undefined) => !!cur?.fwd && !next?.fwd;
