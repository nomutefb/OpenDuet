import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  createAttachmentSender,
  OriginalAttachment,
  SendAttempt,
  WaitingText,
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
          decoding="async"
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

/** 보내는 중 = 내 말풍선 자리에 먼저 올리고 그림 안 가운데 둥근 게이지(형 11-02 02:21 「이미지 안에서 로딩 동그랗게 차게헤줘 퍼센트로 다 차면 체크 뜨면서 뜨고 항상 채팅 보다 위」) · 그림 = 글 말풍선 위 · 글은 안 띄움
 *   차례 = 그림 흐리게 + 고리가 % 로 참 → 100% = ✓ 그려지고 그림이 또렷해짐(고리는 걷힘) → 서버 답이 오면 진짜 글로 바뀜 · 못 받으면 「전송 확인 필요」 칸 */
function Sending({ attempt }: { attempt: SendAttempt }) {
  return (
    <div className="nac-up" aria-label="첨부 보내는 중">
      <div className="nac-shots">
        {attempt.originals.map((original) => <Preview key={original.id} file={original.file} p={attempt.progress} />)}
      </div>
      {attempt.text ? <NacText text={attempt.text} /> : null}
    </div>
  );
}

/** 보내는 중 글 = 6줄 넘을 때만 아래를 흐리게 접음 · 짧은 글은 흐림 0(형 11-02 10:05 「사진 업로드할때 그라데이션 라인 아래에 박히는데, 그 위로 가야하고」 · 두 줄 글도 흐림 띠에 묻혔음) */
function NacText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null), [long, setLong] = useState(false);
  useEffect(() => { const el = ref.current; if (el) setLong(el.scrollHeight > el.clientHeight + 1); }, [text]);
  return <p ref={ref} className={`nac-text${long ? " long" : ""}`}>{text}</p>;
}

const RING_C = 2 * Math.PI * 18;
function Ring({ p }: { p: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(p * 100))), done = pct >= 100;
  return (
    <span className="nac-ring" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={done ? "다 올라감" : `올리는 중 ${pct}%`}>
      <svg className="nac-ring-o" viewBox="0 0 44 44" aria-hidden="true"><circle className="t" cx="22" cy="22" r="18" /><circle className="f" cx="22" cy="22" r="18" style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C * (1 - pct / 100) }} /></svg>
      {done ? <svg className="nac-ring-ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg> : <b>{pct}%</b>}
    </span>
  );
}

/** 앞 글·사진을 기다리는 글 = 보통 내 말풍선 그대로(자르지 않음) · 「보냄 대기」 = 말풍선 왼쪽 아래 꼭지점 옆(시각 자리처럼 · 겹침 0)
 *   (형 11-02 11:36 「이거 보냄 대기 뜰거면 위에 내가 보낸 채팅 일반 채팅 처럼 뜨게 똑같이 해. 그 다음에 채팅 좌측에 보냄 대기 라고 채팅이 직사각형이면 직사각형 좌하단 꼭지점을 기준으로 우측 정렬로 보냄 대기 라고 써지면 돼」 · 앞 판 = 6줄로 잘리고 흐려진 채 아래 오른쪽에 「보냄 대기」) */
function Waiting({ item, onRetry }: { item: WaitingText; onRetry: () => void }) {
  return (
    <div className="nac-wrow" aria-label="보냄 대기">
      {item.failed ? <button type="button" className="nac-again" onClick={onRetry}>못 보냈어 · 다시 보내기</button> : <span className="nac-wait">보냄 대기</span>}   {/* 「보냄 대기」 = 1.2초 넘게 걸릴 때만 보임(./attachment-up.css · 글마다 깜빡이지 않게) */}
      <div className="yb me nac-wb">{item.text}</div>
    </div>
  );
}

function Preview({ file, p }: { file: File; p: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  const img = !!url && file.type.startsWith("image/"), vid = !!url && file.type.startsWith("video/");
  return (
    <span className={`nac-shot${img || vid ? "" : " file"}${p >= 1 ? " ok" : ""}`}>
      {img ? <img src={url} alt={file.name} className="nac-img" decoding="async" />
        : vid ? <video src={url} className="nac-img" muted playsInline preload="metadata" aria-label={file.name} />   /* 영상 = 첫 장면만(소리 없음) */
        : <span className="nac-file">{file.name}</span>}
      <Ring p={p} />
    </span>
  );
}

/** 입력칸에서 넘겨받은 전송 기록. 새로 쓰는 글/첨부와 별개로 원본과 결과를 보관한다. */
export function AttachmentRecovery({
  state,
  room,
  landed,
}: {
  state: ReturnType<typeof createAttachmentSender>;
  room: string;
  /** 서버가 글을 방에 먼저 뿌리고 답은 나중에 줌(작은 사본까지 저장한 뒤) = 그 사이 진짜 글과 보내는 중 말풍선이 둘 다 보였음 → 진짜 글이 뜨면 보내는 중 말풍선만 숨김(올리기는 끝까지) */
  landed?: (attempt: SendAttempt) => boolean;
}) {
  const version = useSyncExternalStore(state.subscribe, state.getSnapshot, state.getSnapshot);
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [version]);   // 칸이 차면 마지막 대기 글이 보이게
  return (
    <div ref={box} className="nac-box flex flex-col gap-2 overflow-y-auto">
      {state.forRoom(room).filter((attempt) => !(attempt.phase === "uploading" && landed?.(attempt))).map((attempt) => attempt.phase === "uploading" ? <Sending key={attempt.id} attempt={attempt} /> : (
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
      {state.waitingFor(room).map((item) => <Waiting key={`w${item.id}`} item={item} onRetry={() => state.retryText(item.id)} />)}
    </div>
  );
}
