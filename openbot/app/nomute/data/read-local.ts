// 서버 셈은 그대로 두고, 이 탭에서 가장 최근에 고른 읽음 상태만 먼저 보여 준다.
export type SeenMarker = { ts: number; at: number };
type Intent = { read: boolean; ts: number; staged?: boolean };
type ReadTransport = {
  write: (room: string, marker: SeenMarker) => Promise<SeenMarker | undefined>;
  refresh: () => void;
  seenAt?: (room: string) => number;
  now?: () => number;
};

export function createReadState(transport: ReadTransport) {
  const current = new Map<string, Intent>();
  const confirmed = new Map<string, Intent>();
  const listeners = new Set<() => void>();
  const activeRooms = new Map<string, number>();
  let version = 0,
    entryVersion = 0,
    clock = 0,
    error = "";
  // seen은 서버에서 방 전체 표를 저장한다. 같은 탭의 다른 방 쓰기도 겹치지 않게 한다.
  let tail: Promise<unknown> = Promise.resolve();
  const emit = () => {
    version++;
    for (const listener of listeners) listener();
  };

  const change = (room: string, intent: Intent): Promise<boolean> => {
    error = "";
    current.set(room, intent);
    emit();
    const task = tail.then(async () => {
      // 아직 보내지 않은 옛 의도는 건너뛴다. 이미 보낸 요청은 끝난 뒤 새 의도를 보낸다.
      if (current.get(room) !== intent) return false;
      clock = Math.max(
        (transport.now || Date.now)(),
        clock + 1,
        (transport.seenAt?.(room) || 0) + 1,
      );
      const marker = { ts: intent.ts, at: clock };
      try {
        const accepted = await transport.write(room, marker);
        clock = Math.max(clock, accepted?.at || 0);
        // HTTP 200이어도 더 최신인 서버 표가 이 쓰기를 거절할 수 있다.
        if (accepted?.at !== marker.at || accepted?.ts !== marker.ts) {
          confirmed.delete(room);
          throw new Error("읽음 상태를 저장하지 못했어. 다시 눌러 줘.");
        }
        confirmed.set(room, intent);
        return true;
      } catch (cause) {
        if (current.get(room) !== intent) return false;
        const previous = confirmed.get(room);
        if (previous) current.set(room, previous);
        else current.delete(room);
        error = "읽음 상태를 저장하지 못했어. 다시 눌러 줘.";
        emit();
        throw cause;
      } finally {
        transport.refresh();
      }
    });
    tail = task.catch(() => {});
    return task;
  };

  const cancelEntry = (room: string) => {
    if (!current.get(room)?.staged) return;
    const previous = confirmed.get(room);
    if (previous) current.set(room, previous);
    else current.delete(room);
    emit();
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => version,
    getEntrySnapshot: () => entryVersion,
    error: () => error,
    enter(room: string, ts: number | null | undefined) {
      // 먼저 배지와 수동 안 읽음만 푼다. 대화창이 이전 seen을 잡기 전에는 POST하지 않는다.
      const local = current.get(room);
      const through = Math.max(ts || 0, local?.read ? local.ts : 0);
      if (!local?.read || local.ts < through)
        current.set(room, { read: true, ts: through, staged: true });
      entryVersion++;
      emit();
    },
    cancelEntry,
    activate(room: string) {
      activeRooms.set(room, (activeRooms.get(room) || 0) + 1);
      return () => {
        activeRooms.set(room, (activeRooms.get(room) || 1) - 1);
        // StrictMode의 즉시 재설치/같은 방 재마운트는 떠남이 아니다.
        queueMicrotask(() => {
          if (!activeRooms.get(room)) cancelEntry(room);
        });
      };
    },
    count(room: string, lastTs: number | undefined, serverCount: number) {
      const local = current.get(room);
      if (!local) return serverCount;
      // 마지막 글이 형/시스템 글이면 서버 unread가 0이어도 명시한 안 읽음은 점으로 보인다.
      if (!local.read) return serverCount > 0 ? serverCount : -1;
      return local.ts >= (lastTs || 0) ? 0 : serverCount;
    },
    read(room: string, ts: number | null | undefined, explicit = false) {
      const local = current.get(room);
      if (explicit && ts == null) ts = 0;
      if (
        ts == null ||
        !Number.isFinite(ts) ||
        ts < 0 ||
        (!explicit && !ts && !local?.staged)
      )
        return Promise.resolve(false);
      // 열린 방의 새 글/늦은 조회는 사용자가 누른 「안 읽음」을 지우지 않는다.
      if (
        local &&
        ((!local.read && !explicit) ||
          (local.read && !local.staged && local.ts >= ts))
      )
        return Promise.resolve(false);
      if (local?.staged) ts = Math.max(ts, local.ts);
      return change(room, { read: true, ts });
    },
    unread(room: string, lastTs: number | null | undefined) {
      return change(room, { read: false, ts: Math.max(0, (lastTs || 1) - 1) });
    },
  };
}
