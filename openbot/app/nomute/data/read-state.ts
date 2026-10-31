import { queryClient } from "@/query-client";
import { type OfficeRoom, office } from "./office";
import { createReadState, type SeenMarker } from "./read-local";

export const roomReadState = createReadState({
  write: async (room, marker) => {
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
