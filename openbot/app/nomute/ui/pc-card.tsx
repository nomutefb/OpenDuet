// 대화창 「컴퓨터 · 조치 필요」 카드 + 앱 안 VM 화면(뜸 11-08) — 형 11-08 09:07 밥상 「그리고 예전에 말했던건데, 채팅창에 ㅈ너네 vmㄸ?ㅢ며면 로그인 가능하게 해야함」 ·
//   「무슨 형태인지 모르면 예전에 내가 말한 대화중에 … vm 그록봇에서는 이렇게 표현한다고 말해준적잇을거야 그거 반영하고 모습은」
//   = 형 11-06 17:00 뜸 창 그록 카드 그림 그대로: 「컴퓨터」 머리 · 「조치 필요」 · 할 일 한 줄 · [건너뛰기] [완료] [제어권 가져오기]
//     「저기서 미리보기가 솔직히 나올 필요는없어 공간낭비고.」 = 화면 미리보기 없음 · 「제어권 가져오기」 = 이 앱 안에 그 몸 화면(noVNC)이 뜸
//   화면 안 한글·붙여넣기·포인터 = 그 몸 noVNC 위 한 장(뜸 novnc-tteum/app/mom-screen.js · 형 09:07 「vm에서 상호간에 클립보드, 한영전환 다 되어야하고」 · 「마우스 포인터 잘 나와야하고」)
//   완료 · 건너뛰기 = 결정 창과 같은 길(POST decisions · send = 그 몸만 깸) · 서버 목록에서 빠진 카드 = 끝난 것(단추 대신 「끝남」 · 화면은 그대로 열 수 있음)
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { office } from "../data/office";
import { useDecisions } from "./decide-pop";
import { screenUrl } from "./pc-url";
import "./pc-card.css";

type St = "" | "보내는 중" | "완료" | "건너뜀" | "못 보냄";
const Laptop = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2.5 19h19" /></svg>
);

export function PcCard({ id, task, url, who }: { id: string; task: string; url: string; who: string }) {
  const qc = useQueryClient();
  const dec = useDecisions();
  const d = (dec.data || []).find((x) => x.id === id || (x._dups || []).includes(id));
  const [st, setSt] = useState<St>(""), [open, setOpen] = useState(false);
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
        <button type="button" className="nm-pc-btn go" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>제어권 가져오기</button>
      </div>
      {open ? <PcScreen url={screenUrl(url)} title={`${who} 컴퓨터`} task={task} canDone={!!d && !st} onDone={() => void answer("완료")} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

/** 앱 안 화면 — 그 몸 noVNC 를 꽉 차게 · 뒤로가기 = 닫기 · Esc 는 VM 으로 가야 해서 닫기에 안 씀 · 새 창 = 같은 주소 */
function PcScreen({ url, title, task, canDone, onDone, onClose }: { url: string; title: string; task: string; canDone: boolean; onDone: () => void; onClose: () => void }) {
  useEffect(() => {
    history.pushState({ ...history.state, nmPc: 1 }, "");
    const pop = () => onClose();
    window.addEventListener("popstate", pop);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("popstate", pop); document.body.style.overflow = prev; };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => history.back();
  return createPortal(
    <div className="nm-pcs" role="dialog" aria-modal="true" aria-label={`${title} 화면`}>
      <div className="nm-pcs-bar">
        <span className="nm-pcs-t"><Laptop />{title}{task ? <em> · {task}</em> : null}</span>
        <a className="nm-pc-btn" href={url} target="_blank" rel="noopener noreferrer">새 창</a>
        {canDone ? <button type="button" className="nm-pc-btn" onClick={() => { onDone(); close(); }}>완료</button> : null}
        <button type="button" className="nm-pc-btn go" onClick={close}>닫기</button>
      </div>
      <iframe className="nm-pcs-f" src={url} title={`${title} 화면`} allow="clipboard-read; clipboard-write; fullscreen; keyboard-map" />
    </div>,
    document.body,
  );
}
