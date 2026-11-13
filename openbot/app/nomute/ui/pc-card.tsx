// 대화창 「컴퓨터 · 조치 필요」 카드 + 앱 안 VM 화면(뜸 11-08) — 형 11-08 09:07 밥상 「그리고 예전에 말했던건데, 채팅창에 ㅈ너네 vmㄸ?ㅢ며면 로그인 가능하게 해야함」 ·
//   「무슨 형태인지 모르면 예전에 내가 말한 대화중에 … vm 그록봇에서는 이렇게 표현한다고 말해준적잇을거야 그거 반영하고 모습은」
//   = 형 11-06 17:00 뜸 창 그록 카드 그림 그대로: 「컴퓨터」 머리 · 「조치 필요」 · 할 일 한 줄 · [건너뛰기] [완료] [제어권 가져오기]
//     「저기서 미리보기가 솔직히 나올 필요는없어 공간낭비고.」 = 화면 미리보기 없음 · 「제어권 가져오기」 = 이 앱 안에 그 몸 화면(noVNC)이 뜸
//   화면 안 한글·붙여넣기·포인터 = 그 몸 noVNC 위 한 장(뜸 novnc-tteum/app/mom-screen.js · 형 09:07 「vm에서 상호간에 클립보드, 한영전환 다 되어야하고」 · 「마우스 포인터 잘 나와야하고」)
//   완료 · 건너뛰기 = 결정 창과 같은 길(POST decisions · send = 그 몸만 깸) · 서버 목록에서 빠진 카드 = 끝난 것(단추 대신 「끝남」 · 화면은 그대로 열 수 있음)
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { office } from "../data/office";
import { useDecisions } from "./decide-pop";
import { screenUrl } from "./pc-url";
import { momOrigin, screenGoUrl, screenTicket } from "./screen-ticket";   // 표 붙여 앱 안(빠르 11-11)
import "./pc-card.css";
import { selfBack } from "./self-back";

type St = "" | "보내는 중" | "완료" | "건너뜀" | "못 보냄";
const Laptop = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2.5 19h19" /></svg>
);

export function PcCard({ id, task, url, who }: { id: string; task: string; url: string; who: string }) {
  const qc = useQueryClient();
  const dec = useDecisions();
  const d = (dec.data || []).find((x) => x.id === id || (x._dups || []).includes(id));
  const [st, setSt] = useState<St>(""), [open, setOpen] = useState("");   // open = 앱 안 화면 주소(표 붙음 · 테일넷 밖 폰에서도 · 형 11-11 19:18 「인앱에서 클립보드 컨트롤 제어권 고받고 완료신호」 · 빠르)
  const over = !!dec.data && !d && !st;   // 서버 목록에 없음 = 이미 답했거나 닫힘
  const answer = async (label: "완료" | "건너뛰기") => {
    if (!d || (st && st !== "못 보냄")) return;
    const i = Math.max(0, d.choices.indexOf(label));
    setSt("보내는 중");
    try {
      const picks = [{ id: d.id, room: d.room, i }, ...(d._dups || []).map((x) => ({ id: x, room: d.room, i }))];
      const j = await office<{ bad?: { id: string }[] }>("decisions", { method: "POST", body: JSON.stringify({ picks, send: true }) });
      if ((j.bad || []).some((x) => x.id === d.id)) throw new Error("bad");
      setSt(label === "완료" ? "완료" : "건너뜀");
      void qc.invalidateQueries({ queryKey: ["nomute", "decisions"] });
    } catch { setSt("못 보냄"); }
  };
  const said = st && st !== "못 보냄" ? (st === "보내는 중" ? "보내는 중…" : `${st} · ${who}한테 알림`) : over ? "끝남" : "";
  return (
    <div className="nm-pc" data-id={id}>
      <div className="nm-pc-h"><Laptop />컴퓨터</div>
      <div className="nm-pc-b">
        <b>조치 필요</b>
        {task ? <p>{task}</p> : null}
      </div>
      <div className="nm-pc-act">
        {said ? <span className="nm-pc-st">{said}</span> : (
          <>
            <button type="button" className="nm-pc-btn" disabled={!d} onClick={(e) => { e.stopPropagation(); void answer("건너뛰기"); }}>건너뛰기</button>
            <button type="button" className="nm-pc-btn" disabled={!d} onClick={(e) => { e.stopPropagation(); void answer("완료"); }}>완료</button>
          </>
        )}
        {st === "못 보냄" ? <span className="nm-pc-st err">못 보냄 · 다시 눌러 줘</span> : null}
        <button type="button" className="nm-pc-btn go" onClick={(e) => { e.stopPropagation(); const raw = screenUrl(url); void screenTicket(raw, (b) => office<{ url?: string }>("screen/ticket", { method: "POST", body: JSON.stringify(b) })).then((u) => setOpen(u || raw)); }}>제어권 가져오기</button>
      </div>
      {open ? <PcScreen url={open} out={screenGoUrl(screenUrl(url))} title={`${who} 컴퓨터`} task={task} canDone={!!d && !st} onDone={() => void answer("완료")} onClose={() => setOpen("")} /> : null}
    </div>
  );
}

/** 앱 안 화면 — 그 몸 noVNC 를 꽉 차게 · 뒤로가기 = 닫기 · Esc 는 VM 으로 가야 해서 닫기에 안 씀 · 새 창 = 같은 주소 */
export function PcScreen({ url, out, title, task, canDone, onDone, onClose }: { url: string; out?: string; title: string; task: string; canDone: boolean; onDone: () => void; onClose: () => void }) {   // out = 「새 창」 주소(표 한 번 쓴 주소 대신 · 프로필 「화면 보기」 빠르 11-11)
  useEffect(() => {
    history.pushState({ ...history.state, nmPc: 1 }, "");
    const pop = () => onClose();
    window.addEventListener("popstate", pop);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("popstate", pop); document.body.style.overflow = prev; };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => selfBack();
  const frame = useRef<HTMLIFrameElement>(null);
  const hands = useMomHands(frame, url);
  return createPortal(
    <div className="nm-pcs" role="dialog" aria-modal="true" aria-label={`${title} 화면`}>
      <div className="nm-pcs-bar">
        <span className="nm-pcs-t"><Laptop />{title}{task ? <em> · {task}</em> : null}</span>
        <a className="nm-pc-btn" href={out || url} target="_blank" rel="noopener noreferrer">새 창</a>
        <button type="button" className="nm-pc-btn go" onClick={close}>닫기</button>
      </div>
      <iframe ref={frame} className="nm-pcs-f" src={url} title={`${title} 화면`} allow="clipboard-read; clipboard-write; fullscreen; keyboard-map" />
      <PcHands hands={hands} canDone={canDone} onDone={() => { onDone(); close(); }} />
    </div>,
    document.body,
  );
}

/** 아래 단추 셋(그록 앱 컴퓨터 화면 꼴 · 형 11-11 19:48 「응 한번 해봐 이거로」) — 클립보드 · 완료 · 키보드
 *  iframe 안 noVNC 와는 postMessage(그 몸 mom-app.js · 받는 곳 = edit.nomute.kr 만) · 답 mom-ack 로 「보냄 / 연결 전」 */
type Hands = ReturnType<typeof useMomHands>;
function useMomHands(frame: RefObject<HTMLIFrameElement | null>, url: string) {
  const [say, setSay] = useState("");
  const origin = momOrigin(url);
  useEffect(() => {
    if (!origin) return;
    let t = 0;
    const on = (e: MessageEvent) => {
      if (e.origin !== origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data as { type?: string; ok?: boolean; why?: string } | null;
      if (!m || m.type !== "mom-ack") return;
      setSay(m.ok ? "보냄" : (m.why || "못 보냄"));
      window.clearTimeout(t); t = window.setTimeout(() => setSay(""), 1800);
    };
    window.addEventListener("message", on);
    return () => { window.removeEventListener("message", on); window.clearTimeout(t); };
  }, [origin, frame]);
  const post = (m: Record<string, unknown>) => {
    const w = frame.current?.contentWindow;
    if (!w || !origin) { setSay("화면 없음"); return false; }
    w.postMessage(m, origin);
    return true;
  };
  return { say, setSay, post, ok: !!origin };
}

function PcHands({ hands, canDone, onDone }: { hands: Hands; canDone: boolean; onDone: () => void }) {
  const [pad, setPad] = useState<"" | "clip" | "kbd">("");
  const [buf, setBuf] = useState("");
  const comp = useRef(false);
  const inp = useRef<HTMLTextAreaElement>(null);
  const open = (k: "clip" | "kbd") => { setPad(pad === k ? "" : k); setBuf(""); setTimeout(() => inp.current?.focus({ preventScroll: true }), 0); };
  const clip = async () => {   // 폰 클립보드 바로 읽기(허락 · 탭 안에서만) → 안 되면 붙여넣을 칸
    try {
      const t = await navigator.clipboard?.readText?.();
      if (t) { hands.post({ type: "mom-paste", text: t }); setPad(""); return; }
    } catch { /* 허락 없음 · iOS 는 칸에 길게 눌러 붙여넣기 */ }
    open("clip");
  };
  const send = () => {
    if (!buf) { if (pad === "kbd") hands.post({ type: "mom-key", key: "Enter" }); return; }
    hands.post({ type: pad === "clip" ? "mom-paste" : "mom-type", text: buf });
    setBuf("");
    if (pad === "clip") setPad("");
  };
  const key = (k: string) => hands.post({ type: "mom-key", key: k });
  return (
    <div className="nm-pch">
      {pad ? (
        <div className="nm-pch-pad">
          <textarea ref={inp} className="nm-pch-in" rows={1} value={buf} enterKeyHint="send"
            placeholder={pad === "clip" ? "여기 붙여넣고 보내기 → 그 컴퓨터에 붙여넣기" : "여기 쓰고 ⏎ → 그 컴퓨터에 입력 · 빈 칸 ⏎ = 엔터"}
            onChange={(e) => setBuf(e.target.value)}
            onCompositionStart={() => { comp.current = true; }} onCompositionEnd={() => { comp.current = false; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !comp.current && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
          <button type="button" className="nm-pc-btn go" onClick={send}>보내기</button>
          {pad === "kbd" ? (
            <div className="nm-pch-keys">
              {([["Escape", "Esc"], ["Tab", "Tab"], ["ArrowLeft", "←"], ["ArrowUp", "↑"], ["ArrowDown", "↓"], ["ArrowRight", "→"], ["Backspace", "⌫"], ["Enter", "⏎"]] as const).map(([k, l]) => (
                <button key={k} type="button" className="nm-pch-k" onPointerDown={(e) => e.preventDefault()} onClick={() => key(k)}>{l}</button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="nm-pch-bar">
        <button type="button" className={`nm-pch-b${pad === "clip" ? " on" : ""}`} disabled={!hands.ok} onClick={() => void clip()}>클립보드</button>
        {canDone ? <button type="button" className="nm-pch-b done" onClick={onDone}>완료</button> : <span className="nm-pch-say">{hands.say}</span>}
        <button type="button" className={`nm-pch-b${pad === "kbd" ? " on" : ""}`} disabled={!hands.ok} onClick={() => open("kbd")}>키보드</button>
      </div>
      {canDone && hands.say ? <span className="nm-pch-say float">{hands.say}</span> : null}
    </div>
  );
}
