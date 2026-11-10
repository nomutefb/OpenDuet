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
  phase: "uploading" | "sending-body" | "body-retry" | "needs-check" | "cancelled";   // cancelled = 다 올라가기 전에 게이지를 눌러 끊음(형 11-10 12:18 「그리고 파일 전송중에 게이지 클릭하면 전공 취소 가능하게」)
  saved: readonly SavedCopy[];
  failed: readonly FailedCopy[];
  announcement: boolean;
  detail: string;
  progress: number;
  at?: number;   // 시작 시각(이 기기 시계) · 방에 진짜 글이 먼저 뜨면 보내는 중 말풍선을 숨기는 데 씀(형 11-02 09:22 「이미지 업로드 직전에 이렇게 2개로 겹쳣다가 정상되는 이슈」)
};
/** 앞 첨부가 올라가는 동안 보낸 글 = 차례를 기다림 · failed = 차례가 와서 보냈는데 실패(글은 여기 남음). */
export type WaitingText = { id: number; room: string; text: string; failed: boolean; at: number };   // at = 줄에 든 때(방에 같은 글이 먼저 뜨면 숨김 · ui/office-chat.tsx landedText)
export type SendReply = { status: number; data: unknown };
type Transport = {
  /** signal = 게이지를 눌러 끊을 때 · 다 올라가기 전이면 요청을 끊고 throw · 이미 다 올라갔으면 무시하고 끝까지(서버가 받은 걸 반쯤 버리지 않게) */
  upload: (input: SendInput, onProgress?: (ratio: number) => void, signal?: AbortSignal) => Promise<SendReply>;
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
  const retrying = new Set<number>();
  const stops = new Map<number, AbortController>();   // 시도마다 끊는 손(게이지 누름)
  const started = new Set<number>();   // 줄에서 차례가 와 올리기를 시작한 시도(줄 서 있던 건 누르면 바로 「취소됨」)
  const waiting = new Map<number, WaitingText>();
  const textJobs = new Map<number, () => Promise<void>>();
  const tails = new Map<string, Promise<void>>();
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
  const cancelled = (id: number) => {
    stops.delete(id);
    started.delete(id);
    update(id, {
      phase: "cancelled",
      detail: "전송을 취소했어. 원본은 이 탭에 보관 중이야.",
    });
  };
  const complete = (attempt: SendAttempt) => {
    // 현재 입력칸이 아니라 이 시도의 원본만 해제한다. 시도한 id는 재전송 방지용으로 남긴다.
    stops.delete(attempt.id);
    started.delete(attempt.id);
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

  // 한 방 = 한 줄 · 보낸 차례대로 나감(형 11-01 「뒤에 보내는게 보냄 대기로 올라가있다가 앞에 메세지랑 쪼르륵 타고 같이 가야할듯」) · 줄에 서는 일은 reject 안 함(결과는 전송 기록이 맡음)
  const inLine = (room: string, job: () => Promise<void>) => {
    const next = (tails.get(room) ?? Promise.resolve()).then(job);
    tails.set(room, next);
    const leave = () => {
      if (tails.get(room) === next) tails.delete(room);
    };
    next.then(leave, leave);
    return next;
  };

  // 소유권을 옮기기 전의 오류만 throw한다. 그러면 Composer가 원래 입력을 복원한다.
  const begin = (input: SendInput) => {
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
      detail: "",
      progress: 0,
      at: Date.now(),
    };
    for (const id of ids) attemptedIds.add(id);
    attempts.set(attempt.id, attempt);
    stops.set(attempt.id, new AbortController());
    emit();
    return attempt;
  };

  const run = async (attempt: SendAttempt) => {
    const stop = stops.get(attempt.id);
    if (!stop || stop.signal.aborted) return;   // 줄 서 있다 취소됨 = 안 올림(취소 표시는 누른 때 이미 함)
    started.add(attempt.id);
    try {
      const reply = await transport.upload(attempt, (ratio) => update(attempt.id, { progress: ratio }), stop.signal);
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
      if (attempt.text && data?.together !== true) await sendBody(attempt);   // 서버가 글과 첨부를 한 글로 받았으면 끝(형 10-31 「말한거랑 한꺼번에 가자」)
      else complete(attempt);
    } catch {
      if (stop.signal.aborted) {
        cancelled(attempt.id);   // 다 올라가기 전에 끊김 = 서버엔 안 남음(조각 길은 upload/abort 까지)
        return;
      }
      update(attempt.id, {
        phase: "needs-check",
        detail:
          "첨부 응답을 받지 못했어. 일부가 이미 저장됐을 수 있어 확인이 필요해. 원본은 보관 중이야.",
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
      const attempt = begin(input);
      await inLine(attempt.room, () => run(attempt));
    },
    /** 소유권만 받고 바로 돌아옴 = 올리는 동안 입력칸이 안 묶임(형 11-01 「이미지가 업로드가 되는 도중에는 내가 다음 채팅을 못 써」 · 「그거랑 내 다음 채팅은 별건임」) · 뒤 결과는 전송 기록이 맡음 */
    start(input: SendInput) {
      const attempt = begin(input);
      void inLine(attempt.room, () => run(attempt));
    },
    /** 게이지 누름 = 이 전송 끊기 · 올리는 중이고 다 올라가기 전(progress < 1)만 · 줄 서 있던 건 바로 「취소됨」 · 올리던 건 요청이 끊긴 뒤 「취소됨」 */
    cancel(id: number) {
      const attempt = attempts.get(id), stop = stops.get(id);
      if (attempt?.phase !== "uploading" || !stop || stop.signal.aborted || attempt.progress >= 1) return false;
      stop.abort();
      if (!started.has(id)) cancelled(id);
      return true;
    },
    /** 이 방에 올라가는 중이거나 줄 선 것이 있나 */
    busy: (room: string) => tails.has(room),
    waitingFor: (room: string) =>
      [...waiting.values()].filter((item) => item.room === room),
    /** 줄 끝에 글 하나 · send = 그 글을 실제로 보내는 일 */
    later(room: string, text: string, send: () => Promise<void>) {
      const id = ++sequence, at = Date.now();
      const job = async () => {
        try {
          await send();
          waiting.delete(id);
          textJobs.delete(id);
        } catch {
          waiting.set(id, { id, room, text, failed: true, at });
        }
        emit();
      };
      waiting.set(id, { id, room, text, failed: false, at });
      textJobs.set(id, job);
      emit();
      void inLine(room, job);
    },
    retryText(id: number) {
      const item = waiting.get(id), job = textJobs.get(id);
      if (!item?.failed || !job) return;
      waiting.set(id, { ...item, failed: false });
      emit();
      void inLine(item.room, job);
    },
    async retryBody(id: number) {
      const attempt = attempts.get(id);
      if (attempt?.phase !== "body-retry" || retrying.has(id)) return;
      retrying.add(id);
      try {
        await sendBody(attempt);
      } finally {
        retrying.delete(id);
      }
    },
  };
}
