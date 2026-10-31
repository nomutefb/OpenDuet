export type OriginalAttachment = { id: string; file: File };
export type SavedCopy = { bot: string | null; name: string; path: string };
export type FailedCopy = { bot: string; name: string; why: string };
export type SendInput = {
  room: string;
  text: string;
  originals: readonly OriginalAttachment[];
};
export type SendAttempt = SendInput & {
  id: number;
  phase: "uploading" | "sending-body" | "body-retry" | "needs-check";
  saved: readonly SavedCopy[];
  failed: readonly FailedCopy[];
  announcement: boolean;
  detail: string;
};
export type SendReply = { status: number; data: unknown };
type Transport = {
  upload: (input: SendInput) => Promise<SendReply>;
  body: (input: SendInput) => Promise<SendReply>;
  release: (ids: string[]) => void;
  refresh: (room: string) => void;
  message?: (room: string, message: unknown) => void;
};

const object = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const string = (value: unknown) =>
  typeof value === "string" && value.length > 0;
const messageFor = (value: unknown, room: string) => {
  const m = object(value);
  return (
    !!m &&
    string(m.id) &&
    m.room === room &&
    typeof m.ts === "number" &&
    Number.isFinite(m.ts) &&
    m.ts > 0 &&
    string(m.who) &&
    string(m.kind) &&
    typeof m.text === "string"
  );
};
const savedCopy = (value: unknown): value is SavedCopy => {
  const copy = object(value);
  return (
    !!copy &&
    (copy.bot === null || string(copy.bot)) &&
    string(copy.name) &&
    string(copy.path)
  );
};
const failedCopy = (value: unknown): value is FailedCopy => {
  const copy = object(value);
  return (
    !!copy &&
    string(copy.bot) &&
    string(copy.name) &&
    typeof copy.why === "string"
  );
};

/** 시작한 첨부 전송의 원본은 입력칸에서 이 저장소로 옮긴다. 방을 바꿔도 기록은 유지한다. */
export function createAttachmentSender(transport: Transport) {
  const attempts = new Map<number, SendAttempt>();
  const attemptedIds = new Set<string>();
  const busyRooms = new Set<string>();
  const listeners = new Set<() => void>();
  let sequence = 0,
    version = 0;
  const emit = () => {
    version++;
    for (const listener of listeners) listener();
  };
  const publish = (room: string, message: unknown) => {
    try {
      transport.message?.(room, message);
    } catch {
      /* 다음 조회로 확인 */
    }
  };
  const refresh = (room: string) => {
    try {
      transport.refresh(room);
    } catch {
      /* 로컬 조회 실패는 전송 결과가 아님 */
    }
  };
  const update = (id: number, patch: Partial<SendAttempt>) => {
    const old = attempts.get(id);
    if (old) {
      attempts.set(id, { ...old, ...patch });
      emit();
    }
  };
  const complete = (attempt: SendAttempt) => {
    // 현재 입력칸이 아니라 이 시도의 원본만 해제한다. 시도한 id는 재전송 방지용으로 남긴다.
    attempts.delete(attempt.id);
    emit();
    // 서버 확인과 로컬 캐시 정리는 별개다. 정리 실패를 재전송 가능한 실패로 바꾸지 않는다.
    try {
      transport.release(attempt.originals.map((original) => original.id));
    } catch {
      /* 미리보기 정리만 다음 탭 종료 때 */
    }
  };

  const sendBody = async (attempt: SendAttempt) => {
    update(attempt.id, {
      phase: "sending-body",
      detail: "첨부는 확인됐어. 본문을 보내는 중이야.",
    });
    try {
      const reply = await transport.body(attempt);
      const data = object(reply.data);
      if (
        reply.status === 200 &&
        data?.ok === true &&
        messageFor(data.message, attempt.room)
      ) {
        publish(attempt.room, data.message);
        complete(attempt);
      } else if (
        reply.status === 500 &&
        data?.ok === false &&
        data.error === "store"
      ) {
        // 서버가 저장 실패를 명시한 응답만 재시도한다. 일반 500은 저장 뒤 봇 호출 실패일 수도 있다.
        update(attempt.id, {
          phase: "body-retry",
          detail:
            "파일과 첨부 알림은 올라갔어. 서버가 본문 저장 실패를 알려줬어. 대화에 없는지 확인한 뒤 본문만 다시 보내 줘.",
        });
      } else {
        update(attempt.id, {
          phase: "needs-check",
          detail:
            "본문이 올라갔는지 확인이 필요해. 대화에서 확인해 줘. 다시 보내지 않았어.",
        });
      }
    } catch {
      update(attempt.id, {
        phase: "needs-check",
        detail:
          "본문 응답을 받지 못했어. 이미 올라갔을 수 있어 대화 확인이 필요해.",
      });
    } finally {
      refresh(attempt.room);
    }
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => version,
    forRoom: (room: string) =>
      [...attempts.values()].filter((attempt) => attempt.room === room),
    async submit(input: SendInput) {
      // 소유권을 옮기기 전의 오류만 throw한다. 그러면 Composer가 원래 입력을 복원한다.
      if (busyRooms.has(input.room))
        throw new Error("이 방의 첨부 전송이 아직 진행 중이야.");
      const ids = input.originals.map((original) => original.id);
      if (
        !ids.length ||
        ids.some((id) => !id) ||
        new Set(ids).size !== ids.length ||
        input.originals.some((original) => !original.file)
      ) {
        throw new Error("첨부 원본을 찾지 못했어. 파일을 다시 골라 줘.");
      }
      if (ids.some((id) => attemptedIds.has(id)))
        throw new Error(
          "이미 전송을 시도한 첨부야. 아래 전송 기록에서 결과를 확인해 줘.",
        );
      const attempt: SendAttempt = {
        id: ++sequence,
        room: input.room,
        text: input.text,
        originals: input.originals.map((original) => ({ ...original })),
        phase: "uploading",
        saved: [],
        failed: [],
        announcement: false,
        detail: "첨부를 보내는 중이야.",
      };
      busyRooms.add(attempt.room);
      for (const id of ids) attemptedIds.add(id);
      attempts.set(attempt.id, attempt);
      emit();
      try {
        const reply = await transport.upload(attempt);
        const data = object(reply.data);
        const saved = Array.isArray(data?.files)
          ? data.files.filter(savedCopy)
          : [];
        const failed = Array.isArray(data?.failed)
          ? data.failed.filter(failedCopy)
          : [];
        const announcement = messageFor(data?.message, attempt.room);
        if (announcement) publish(attempt.room, data?.message);
        update(attempt.id, { saved, failed, announcement });
        const allCopies =
          Array.isArray(data?.files) &&
          data.files.length >= attempt.originals.length &&
          data.files.every(savedCopy);
        const noFailures =
          data?.failed === undefined ||
          (Array.isArray(data.failed) && data.failed.length === 0);
        if (
          reply.status !== 200 ||
          data?.ok !== true ||
          !allCopies ||
          !noFailures ||
          !announcement
        ) {
          const detail =
            failed.length || reply.status === 207
              ? "일부 복사본만 저장됐어. 받는 곳별 결과를 확인해 줘. 원본은 보관 중이고 다시 올리지 않았어."
              : "첨부 저장이나 대화 알림을 모두 확인하지 못했어. 원본은 보관 중이고 다시 올리지 않았어.";
          update(attempt.id, {
            phase: "needs-check",
            detail:
              typeof data?.why === "string" ? `${detail} ${data.why}` : detail,
          });
          return;
        }
        if (attempt.text) await sendBody(attempt);
        else complete(attempt);
      } catch {
        update(attempt.id, {
          phase: "needs-check",
          detail:
            "첨부 응답을 받지 못했어. 일부가 이미 저장됐을 수 있어 확인이 필요해. 원본은 보관 중이야.",
        });
      } finally {
        busyRooms.delete(attempt.room);
        refresh(attempt.room);
      }
    },
    async retryBody(id: number) {
      const attempt = attempts.get(id);
      if (attempt?.phase !== "body-retry" || busyRooms.has(attempt.room))
        return;
      busyRooms.add(attempt.room);
      try {
        await sendBody(attempt);
      } finally {
        busyRooms.delete(attempt.room);
      }
    },
  };
}
