// 폰 「회의」 = PC 에서 연 그 회의를 이어 봄(형 11-13 22:05 「폰에서도 화상회의 가능하면 좋겠는데 이 탭을 동기화해서 쓸순없나?」)
//   회의 기억(meet.tsx nm_meet_v1)은 기기마다 따로라 폰은 PC 회의를 모름 → 서버 임시방 목록에서 열린 화상회의 방을 찾아 이어 받음
//   없으면 저절로 열지 않음(누를 때마다 새 방 · 챙 깸 막기) · 순수 = node 시험
export const MEET_KEY = "nm_meet_v1";   // = ui/meet.tsx KEY(뜸) · 바꾸면 같이
export const MEET_HOURS_MS = 2 * 3600_000;   // = meet.tsx startMeet hours: 2
export type TempRoom = { id: string; name?: string; purpose?: string; exp?: number | string; members?: string[] };
export type MeetLike = { id: string; members: string[]; t0: number };
const expMs = (e: TempRoom["exp"]) => (typeof e === "number" ? e : e ? Date.parse(e) : NaN);
export const isMeetRoom = (r: TempRoom) => /^화상회의 —/.test(String(r.purpose || "")) || /^화상회의 \d\d:\d\d$/.test(String(r.name || ""));
/** 열린 화상회의 중 가장 늦게 연 것 · 없으면 null */
export function openMeetOf(rooms: TempRoom[], now: number): MeetLike | null {
  const live = rooms.filter((r) => isMeetRoom(r) && expMs(r.exp) > now).sort((a, b) => expMs(b.exp) - expMs(a.exp));
  const r = live[0];
  return r ? { id: r.id, members: r.members || [], t0: expMs(r.exp) - MEET_HOURS_MS } : null;
}
/** 이 기기 기억이 아직 살아 있는 방인지(PC 에서 끝낸 회의 = 지움) */
export const stillOpen = (m: MeetLike | null, rooms: TempRoom[], now: number) => !!m && rooms.some((r) => r.id === m.id && expMs(r.exp) > now);
