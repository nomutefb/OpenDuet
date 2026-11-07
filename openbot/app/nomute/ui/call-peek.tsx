// 형 결정 알약 누름 = 그 글 창(뜸 11-07)
//   형 11-07 12:02 (봄 옮김 ↩ 위) 「아예 이거 누르면 화면이 올라가지 않고 그 전체 보기 누르면 창 뜨는거 처럼 나오고 아래에 답변쓰면 답글처럼 달리고 그 봇만 개별 호출이 강조호출되도록 가능해?」
//   형 12:03 「오히려 올라가는 액션이 정신 산만해서 그냥 확 창이 뜨고 깔끔하게 답변하는게 나은듯 답 하면 창 자동 으로 닫히고」 · 「그리고 버튼은 누르고 나면 없어져야해」
//   = 화면은 안 움직임 · 창 = 얼굴 · 이름 · 몇 분 · 글 전문 · 아래 답칸 · 보내면 ↩ 답글(reply_to) + 「!그 봇」 하나만 부름 → 창 닫힘 · 알약 빠짐
//   답 안 하고 닫으면 알약은 남음(형이 나중에 다시 누를 수 있게) · 쓰던 답은 이 기기에 남음(형 11-07 10:56 「휘발안되고」 · ./draft.ts)
//   바탕 닫힘 = 누름·뗌 둘 다 바탕일 때만(./backdrop.ts) · Esc = 닫힘 · 엔터 = 보내기(한글 조합 중 아님) · Shift+엔터 = 줄바꿈
//   형 13:19 「뜨고 없어지는 모션 부드럽게 해주고, 그리고 전송 누르면 순간 멎는 느낌이야. 그냥 바로 창 자연스럽게 닫히」 · 「전송 버튼이 조금 어색해 화살표 방향이 우측이여야 할듯.」
//   = 뜰 때·닫힐 때 같은 부드러운 결(.ypk-in · .ypk-out 0.2초) · 보내기 = 서버 답 안 기다리고 바로 닫힘(못 보내면 대화창 위 빨간 줄 + 쓰던 답 남음 · 부른 쪽) · 단추 = 오른쪽 화살표
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { backdrop } from "./backdrop";
import { draftDrop, draftGet, draftSet } from "./draft";
import { FaceImg } from "./faces";
import { agoOf } from "./hyung-pills";

export type Peek = { id: string; face: string; name: string; ts?: number; body: ReactNode };

export function CallPeek({ p, onClose, onSend }: { p: Peek; onClose: () => void; onSend: (text: string) => void }) {
  const key = `peek:${p.id}`;
  const [text, setText] = useState(() => draftGet<string>(key) || "");
  const [out, setOut] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const close = () => { if (out) return; setOut(true); window.setTimeout(onClose, 190); };   // 닫힘 = 0.2초 스며 사라짐 뒤 내림
  useEffect(() => { box.current?.focus(); }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  const grow = () => { const t = box.current; if (!t) return; t.style.height = "auto"; t.style.height = `${Math.min(t.scrollHeight, 160)}px`; };
  useEffect(grow, []);
  const send = () => {
    const raw = text.trim();
    if (!raw || out) return;
    draftDrop(key); onSend(raw); close();   // 서버 답 안 기다림(형 「순간 멎는 느낌」) · 못 보내면 부른 쪽이 쓰던 답을 다시 남김
  };
  return createPortal(
    <div className={`nm-msgm ypk-veil${out ? " out" : ""}`} role="presentation" {...backdrop(close)}>
      <div className={`ypk${out ? " out" : ""}`} role="dialog" aria-modal="true" aria-label={`${p.name} 글에 답하기`}>
        <div className="ypk-h">
          <FaceImg id={p.face} size={34} />
          <b>{p.name}</b>
          {p.ts ? <i>{agoOf(p.ts)}</i> : null}
          <button type="button" className="ypk-x" aria-label="닫기" onClick={close}>×</button>
        </div>
        <div className="ypk-b">{p.body}</div>
        <div className="ypk-f">
          <textarea ref={box} rows={1} value={text} placeholder={`${p.name}에게 답하기`}
            onChange={(e) => { setText(e.target.value); if (e.target.value.trim()) draftSet(key, e.target.value); else draftDrop(key); grow(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
          <button type="button" className="ypk-s" disabled={!text.trim()} aria-label="보내기" onClick={send}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
