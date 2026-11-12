import { queryClient } from "@/query-client";
import { type OfficeRoom, office } from "./office";
import { createReadState, type SeenMarker } from "./read-local";

/** 찍기 탭(봇이 형 자리 브라우저로 화면을 볼 때 · 주소에 ?look=1) = 형 「읽음」을 서버에 안 보냄 — 형 안 읽음 점이 우리 손으로 꺼지던 것(봄 11-12 11:04 · 뎅) · 탭 하나에만(sessionStorage) · 형이 직접 열면 지금대로 */
export const LOOK_ONLY = (() => {
  try {
    if (new URLSearchParams(location.search).has("look")) sessionStorage.setItem("nm-look", "1");
    return sessionStorage.getItem("nm-look") === "1";
  } catch {
    return false;
  }
})();

export const roomReadState = createReadState({
  write: async (room, marker) => {
    if (LOOK_ONLY) return marker;   // 이 탭 안에서만 읽음(서버 · 다른 기기 0)
    const result = await office<{ seen: Record<string, SeenMarker> }>("seen", {
      method: "POST",
      body: JSON.stringify({ seen: { [room]: marker } }),
    });
    return result.seen?.[room];
  },
  seenAt: (room) =>
    queryClient.getQueryData<Record<string, SeenMarker>>(["nomute", "seen"])?.[
      room
    ]?.at || 0,
  refresh: () => {
    for (const queryKey of [
      ["nomute", "seen"],
      ["nomute", "rooms"],
      ["duet-channels"],
    ])
      void queryClient.invalidateQueries({ queryKey });
  },
});

/** 명시한 방 선택. 같은 방을 다시 눌러도 「안 읽음」이 풀린다. 모달을 닫는 것은 선택이 아니다. */
export function enterRoom(room: string) {
  const latest = queryClient
    .getQueryData<OfficeRoom[]>(["nomute", "rooms"])
    ?.find((r) => r.id === room)?.last_ts;
  roomReadState.enter(room, latest);
}
