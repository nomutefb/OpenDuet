import { queryClient } from "@/query-client";
import { type OfficeRoom, office } from "./office";
import { createReadState, type SeenMarker } from "./read-local";
import { touchRooms } from "./sync";

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
  // 읽음을 올린 뒤 = 그 방 칸만 다시 받음 · 읽음 표는 서버가 받아 준 값을 그대로 넣음(다시 받기 0)
  //   앞 판 = 읽음 표 + 방 목록 통째 + 원본 틀 목록을 매번 다시 받음(읽은 방 하나의 안 읽은 수만 바뀌는데 · 형 11-19 「또 이런 비효율적인게 있나?」)
  refresh: (room, accepted) => {
    if (room && accepted && queryClient.getQueryData(["nomute", "seen"]))
      queryClient.setQueryData<Record<string, SeenMarker>>(["nomute", "seen"], (old) => (old ? { ...old, [room]: accepted } : old));
    else void queryClient.invalidateQueries({ queryKey: ["nomute", "seen"] });
    if (room) touchRooms([room]);   // 끝나면 원본 틀 목록(duet-channels)도 다시 그림(sync.ts)
    else for (const queryKey of [["nomute", "rooms"], ["duet-channels"]]) void queryClient.invalidateQueries({ queryKey });
  },
});

/** 명시한 방 선택. 같은 방을 다시 눌러도 「안 읽음」이 풀린다. 모달을 닫는 것은 선택이 아니다. */
export function enterRoom(room: string) {
  const latest = queryClient
    .getQueryData<OfficeRoom[]>(["nomute", "rooms"])
    ?.find((r) => r.id === room)?.last_ts;
  roomReadState.enter(room, latest);
}
