import { QUOTE, ReplyStrip } from "./reply-strip";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
        className="nar-save break-all"
      >
        {original.file.name} <span className="nar-link">[원본 저장]</span>
      </a>
    </li>
  );
}

/** 보내는 중 = 내 말풍선 자리에 먼저 올리고 그림 안 가운데 둥근 게이지(형 11-02 02:21 「이미지 안에서 로딩 동그랗게 차게헤줘 퍼센트로 다 차면 체크 뜨면서 뜨고 항상 채팅 보다 위」) · 그림 = 글 말풍선 위 · 글은 안 띄움
 *   차례 = 그림 흐리게 + 고리가 % 로 참 → 100% = ✓ 그려지고 그림이 또렷해짐(고리는 걷힘) → 서버 답이 오면 진짜 글로 바뀜 · 못 받으면 「전송 확인 필요」 칸 */
/*   「전송 대기」 = 말풍선 왼쪽 아래(진짜 글이 되면 그 자리에 시각 · 형 11-04 08:05 「일단 대화가 위로 확 보내진다음에 전송 대기가 떳다가 시간으로 바뀔수있어?」) · 사진은 바로 보임(글만 보낼 땐 1.2초 뒤) */
/** 보내는 중 · 멈춘 첨부 말풍선 — 멈춤(형이 고리를 눌러 끊음) = 말풍선 그대로 · 고리 자리 ✕ · 옆에 「전송 실패」 · ✕ 다시 누름 = 0% 부터 다시(형 11-12 08:35 「% 가 x 뜨면서 중단만 되면돼 … 채팅엔 남아잇고 x 된 채로 잇으면 됨 … x 눌럿다가누르면 다시 가게 … 전송 실패가 낫겟다」 · 뎅) */
function Sending({ attempt, onCancel, onResume }: { attempt: SendAttempt; onCancel?: () => void; onResume?: () => void }) {
  const stopped = attempt.phase === "cancelled";
  return (
    <div className="nac-wrow nac-uprow">
      {stopped ? <span className="nac-wait now nac-fail" role="status">전송 실패</span> : <span className="nac-wait now">전송 대기</span>}
      <div className="nac-up" aria-label={stopped ? "첨부 전송 멈춤" : "첨부 보내는 중"}>
        <div className="nac-shots">
          {attempt.originals.map((original) => <Preview key={original.id} file={original.file} p={stopped ? 0 : attempt.progress} onCancel={stopped ? undefined : onCancel} onResume={stopped ? onResume : undefined} />)}
        </div>
        {attempt.text ? <NacText text={attempt.text} /> : null}
      </div>
    </div>
  );
}

/** 보내는 중 글 = 보내진 뒤처럼 다 보임(형 11-04 09:37 · 앞 판 = 6줄 넘으면 접고 끝 흐림) */
function NacText({ text }: { text: string }) {
  return <p className="nac-text">{text}</p>;
}

const RING_C = 2 * Math.PI * 18;
/** 고리 누름 = 이 전송 취소(형 11-10 12:18 「그리고 파일 전송중에 게이지 클릭하면 전공 취소 가능하게」) · 다 올라가기 전(✓ 전)만 눌림 */
function Ring({ p, onCancel, onResume }: { p: number; onCancel?: () => void; onResume?: () => void }) {
  const pct = Math.max(0, Math.min(100, Math.round(p * 100))), done = pct >= 100, can = !!onCancel && p < 1;
  if (onResume) return (   // 멈춘 전송 = ✕ · 누르면 처음부터 다시
    <span className="nac-ring can stop" role="button" tabIndex={0} aria-label="전송 실패 · 누르면 다시 보내기"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onResume(); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onResume(); } }}>
      {/* ✕ → 되돌리기 꼴 하나(형 11-12 18:09 봄 1:1 「다시보내기 뜨는거 좋은데. 픽토그램 한번만 나오면 될듯 그 되돌리기 비슷한 픽토그램으로」) */}
      <svg className="nac-redo" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
    </span>
  );
  return (
    <span
      className={`nac-ring${can ? " can" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={done ? "다 올라감" : can ? `올리는 중 ${pct}% · 누르면 취소` : `올리는 중 ${pct}%`}
      onClick={can ? (e) => { e.preventDefault(); e.stopPropagation(); onCancel?.(); } : undefined}
    >
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
      {item.failed ? <button type="button" className="nac-again" onClick={onRetry} aria-label="못 보냈어 · 다시 보내기" title="다시 보내기"><svg className="nac-redo" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg></button> : null}   {/* 글 = 「보냄 대기」 글자 뺌 · 서버가 받으면 진짜 말풍선 옆 숫자(안 본 봇 수)로 바뀜 · 못 보내면 다시 보내기만(형 11-13 18:12 봄 옮김 「이제는 글은 전송대기까진 필요없고, 전송이 완료되면 체크 대신 1로 할게」 · 뎅) */}
      <div className="ybw"><ReplyStrip text={item.text} /><div className="yb me nac-wb">{item.text.replace(QUOTE, "")}</div></div>   {/* 답장 글 = 띠 + 내 글만(형 11-11 20:08 사진 = 여기서 「↩ 빠르: …」 줄이 글 안에 보였음 · ./reply-strip.tsx) */}
    </div>
  );
}

function Preview({ file, p, onCancel, onResume }: { file: File; p: number; onCancel?: () => void; onResume?: () => void }) {
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
      <Ring p={p} onCancel={onCancel} onResume={onResume} />
    </span>
  );
}

/** 입력칸에서 넘겨받은 전송 기록. 새로 쓰는 글/첨부와 별개로 원본과 결과를 보관한다. */
// 기록 카드 닫기 = 이 탭에서만(보관한 원본·기록은 그대로 · 화면에서만 걷음)
const gone = new Set<number>(), goneSubs = new Set<() => void>();
const close = (id: number) => { gone.add(id); goneSubs.forEach((f) => f()); };
function AutoClose({ id }: { id: number }) {
  useEffect(() => { const t = setTimeout(() => close(id), 5_000); return () => clearTimeout(t); }, [id]);
  return <button type="button" className="nar-x" aria-label="닫기" onClick={() => close(id)}>×</button>;
}
/** 「비밀값 꼴(…) … 안 올림」 = 라임(형 11-06 20:31 「비밀값 꼴(api ~ ) 안 올림 < 이거 라임색」) */
function limeSecret(t?: string): ReactNode {
  const s = String(t || ""), m = s.match(/비밀값 꼴[^—·]*?안 올림/);
  if (!m || m.index == null) return s;
  return <>{s.slice(0, m.index)}<b className="nar-lime">{m[0]}</b>{s.slice(m.index + m[0].length)}</>;
}

/** 전송 알림 한 문장(공적인 말씨) — 첨부 원본이 있으면 「파일」 · 글만이면 「메시지」(형 11-12 07:27) */
export function noticeOf(a: { phase: string; originals: unknown[]; detail?: string; saved?: unknown[]; failed?: unknown[]; announcement?: unknown }): string {
  const what = a.originals.length ? "파일을" : "메시지를";
  if (a.phase === "cancelled") return "전송을 취소했습니다.";
  if (a.phase === "needs-check" || a.phase === "body-retry") {
    console.info("[첨부 전송]", a.phase, a.detail || "", { saved: a.saved, failed: a.failed, announcement: a.announcement });   // 까닭 · 받는 곳별 결과 = 기록에만
    return `${what} 전송하지 못했습니다. 다시 시도해 주세요.`;
  }
  return "보내는 중입니다.";
}

export function AttachmentRecovery({
  state,
  room,
  landed,
  landedText,
  part,
}: {
  state: ReturnType<typeof createAttachmentSender>;
  room: string;
  /** 서버가 글을 방에 먼저 뿌리고 답은 나중에 줌(작은 사본까지 저장한 뒤) = 그 사이 진짜 글과 보내는 중 말풍선이 둘 다 보였음 → 진짜 글이 뜨면 보내는 중 말풍선만 숨김(올리기는 끝까지) */
  landed?: (attempt: SendAttempt) => boolean;
  /** 글만 보낸 것도 같은 꼴 = 회의실처럼 서버 답이 늦으면 글은 새 글 기다림으로 먼저 뜨고 대기 말풍선이 남았음(형 11-02 11:58 「이거 아직 해결 되다가 말앗어 이렇게 아직 보임」) → 방에 내 같은 글이 뜨면 대기 말풍선 숨김(못 보냄 표시여도 · 실제로 갔으니) */
  landedText?: (item: WaitingText) => boolean;
  /** pending = 보내는 중·보냄 대기 말풍선만(대화 줄 맨 아래 · 형 11-02 12:02 「그냥 이 챗을 보내는 순간 채팅창으로 나가버리고 챗은 거기서 대기를 하던 뭐를 하던 하면 됨 내 대기줄에서 달라붙어서 대기하다가 나가지말고」) · records = 확인 필요·다시 보내기 기록만(입력칸 위) · 없음 = 둘 다(시험·옛 자리) */
  part?: "pending" | "records";
}) {
  const version = useSyncExternalStore(state.subscribe, state.getSnapshot, state.getSnapshot);
  const [, bump] = useState(0);
  useEffect(() => { const f = () => bump((n) => n + 1); goneSubs.add(f); return () => { goneSubs.delete(f); }; }, []);
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [version]);   // 칸이 차면 마지막 대기 글이 보이게
  const pend = part !== "records", recs = part !== "pending";
  const live = (a: SendAttempt) => a.phase === "uploading" || a.phase === "cancelled";   // 멈춘 전송도 말풍선 자리에 그대로(형 11-12 08:35)
  const shown = state.forRoom(room).filter((attempt) => (live(attempt) ? pend && !landed?.(attempt) : recs));
  const waits = pend ? state.waitingFor(room).filter((item) => !landedText?.(item)) : [];
  if (part && !shown.length && !waits.length) return null;
  return (
    <div ref={box} className={part === "pending" ? "nac-list flex flex-col gap-2" : "nac-box flex flex-col gap-2 overflow-y-auto"}>
      {shown.map((attempt) => live(attempt) ? <Sending key={attempt.id} attempt={attempt} onCancel={() => state.cancel(attempt.id)} onResume={() => state.resume(attempt.id)} /> : gone.has(attempt.id) ? null : (
        <section
          key={attempt.id}
          aria-label="첨부 전송 기록"
          className="nar-card relative mb-2 rounded-xl border border-border bg-muted p-3 text-xs"
        >
          <AutoClose id={attempt.id} />   {/* 끄기(×) · 5초 뒤 저절로 닫힘 · 원본은 이 탭 보관 그대로(형 11-06 20:31 「끄기버튼만잇으면될듯」 · 「5초는 자동.」) */}
          {/* 알림 = 공적인 한 문장(형 11-12 07:27 「메세지 좀 심플하게 공적으로 알림 한문장으로 뜨게해줘」 · 07:35 「이 메세지가 먼지 확안들어왕」 · 뎅) — 까닭(attempt.detail)은 화면에 안 쏟고 기록(콘솔 · 길게 보기 title)에만 */}
          <p role="status" className="nar-t font-semibold" title={attempt.phase === "cancelled" ? undefined : attempt.detail}>{noticeOf(attempt)}</p>
          {attempt.text ? (
            <section
              className="nar-body mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-words"
              aria-label="보관한 본문"
            >
              {attempt.text}
            </section>
          ) : null}
          {attempt.phase === "cancelled" ? null : (
          <ul
            className="mt-2 flex flex-wrap gap-3"
            aria-label="보관한 첨부 원본"
          >
            {attempt.originals.map((original) => (
              <Original key={original.id} original={original} />
            ))}
          </ul>
          )}
          {/* 받는 곳별 저장 · 실패 · 알림 확인 = 화면 0 · 기록에만(noticeOf 콘솔 · 형 11-12 07:27 「한문장으로」) */}
          {attempt.phase === "body-retry" ? (
            <button
              type="button"
              className="mt-2 rounded-lg border border-border px-3 py-1.5"
              onClick={() => void state.retryBody(attempt.id)}
            >
              보관한 본문만 다시 보내기
            </button>
          ) : null}
          {/* 아래 회색 설명 뺌(형 11-06 20:34 「하단부에 회색으로 나온 설명글은 삭제해도됨」) */}
        </section>
      ))}
      {waits.map((item) => <Waiting key={`w${item.id}`} item={item} onRetry={() => state.retryText(item.id)} />)}
    </div>
  );
}
