import { useEffect, useSyncExternalStore } from "react";
import type { createReadState } from "./read-local.ts";

/** 방 선택은 먼저 표시하고, 대화창의 이전 seen/글 조회가 준비된 뒤 저장한다. */
export function useRoomRead(
  state: ReturnType<typeof createReadState>,
  room: string,
  active: boolean,
  ready: boolean,
  failed: boolean,
  ts: number,
  setError: (message: string) => void,
) {
  const entryVersion = useSyncExternalStore(
    state.subscribe,
    state.getEntrySnapshot,
    state.getEntrySnapshot,
  );
  useEffect(
    () => (active ? state.activate(room) : undefined),
    [state, room, active],
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: 같은 방 재선택은 ts/active가 같아도 저장을 다시 시작해야 한다.
  useEffect(() => {
    // 숨은 방은 새로 선택한 entry를 취소하지 않는다. 실제 떠남은 activate 정리가 맡는다.
    if (!active) return;
    if (failed) {
      state.cancelEntry(room);
      return;
    }
    if (!ready) return;
    void state
      .read(room, ts)
      .catch(() => setError("읽음 상태를 저장하지 못했어. 다시 방을 열어 줘."));
  }, [state, room, active, ready, failed, ts, entryVersion, setError]);
}
