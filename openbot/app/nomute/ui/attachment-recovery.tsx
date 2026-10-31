import { useEffect, useState, useSyncExternalStore } from "react";
import type {
  createAttachmentSender,
  OriginalAttachment,
} from "../data/attachment-send";

function Original({ original }: { original: OriginalAttachment }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(original.file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [original.file]);
  return (
    <li className="min-w-0">
      {url && original.file.type.startsWith("image/") ? (
        <img
          src={url}
          alt={original.file.name}
          className="mb-1 size-16 rounded-lg object-cover"
        />
      ) : null}
      <a
        href={url || undefined}
        download={original.file.name}
        className="break-all underline"
      >
        {original.file.name} · 원본 저장
      </a>
    </li>
  );
}

/** 입력칸에서 넘겨받은 전송 기록. 새로 쓰는 글/첨부와 별개로 원본과 결과를 보관한다. */
export function AttachmentRecovery({
  state,
  room,
}: {
  state: ReturnType<typeof createAttachmentSender>;
  room: string;
}) {
  useSyncExternalStore(state.subscribe, state.getSnapshot, state.getSnapshot);
  return (
    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
      {state.forRoom(room).map((attempt) => (
        <section
          key={attempt.id}
          aria-label="첨부 전송 기록"
          className="mb-2 rounded-xl border border-border bg-muted p-3 text-xs"
        >
          <p role="status" className="font-semibold">
            {attempt.phase === "needs-check"
              ? "전송 확인 필요"
              : attempt.phase === "body-retry"
                ? "본문 다시 보내기 가능"
                : "보내는 중"}
          </p>
          <p className="mt-1">{attempt.detail}</p>
          {attempt.text ? (
            <section
              className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words"
              aria-label="보관한 본문"
            >
              {attempt.text}
            </section>
          ) : null}
          <ul
            className="mt-2 flex flex-wrap gap-3"
            aria-label="보관한 첨부 원본"
          >
            {attempt.originals.map((original) => (
              <Original key={original.id} original={original} />
            ))}
          </ul>
          {attempt.saved.length ? (
            <div className="mt-2">
              <p>저장 확인 · 복사본 {attempt.saved.length}개</p>
              <ul>
                {attempt.saved.map((copy) => (
                  <li key={copy.path}>
                    {copy.bot || "공용"} · {copy.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {attempt.failed.length ? (
            <div className="mt-2">
              <p>저장 실패 · 복사본 {attempt.failed.length}개</p>
              <ul>
                {attempt.failed.map((copy, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 서버는 실패 복사본 ID를 주지 않는다. 이 시도의 응답 행은 이후 정렬/편집하지 않는다.
                  <li key={`${copy.bot}:${copy.name}:${i}`}>
                    {copy.bot} · {copy.name} · {copy.why}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {attempt.saved.length ? (
            <p className="mt-1">
              첨부 알림 · {attempt.announcement ? "확인됨" : "확인 필요"}
            </p>
          ) : null}
          {attempt.phase === "body-retry" ? (
            <button
              type="button"
              className="mt-2 rounded-lg border border-border px-3 py-1.5"
              onClick={() => void state.retryBody(attempt.id)}
            >
              보관한 본문만 다시 보내기
            </button>
          ) : null}
          {attempt.phase === "needs-check" ? (
            <p className="mt-2 text-muted-foreground">
              대화와 받는 곳에서 확인해 줘. 이 기록은 현재 탭에서 보관돼. 창을
              닫기 전에 원본을 저장해 줘.
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
