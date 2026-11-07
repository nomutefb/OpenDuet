// 방 머리 띠 = 작업 맡음 칩 + 열린 제안(형 11-07 09:10 「윈터랑 번개는 조율해서 반영해야될 부분 코드 수정 및 러너 반영 완료해줘!」 · 깃 회의실 1794010245399 ①② · 봄 「지금 쥔 손 띠」 · 결 제안)
//   서버 = GET rooms/<방>/board(editor#2744 · _hands.js) · 칩 = 「[손 들어감]」 글(누가 · 무엇 · 경과 분 · 방 링크 없음) · 제안 = 안 닫힌 💡(제목 · 상태 · 올린이)
//   봄 11-07 09:13 「① 칩도 제안도 0개면 줄 자체를 안 그리기 ② 둘 다 있으면 한 줄로 이어 붙이고 넘치면 접힘」(형 11-06 「시선이 분산되」) → 셋 넘으면 「+N」 누르면 펼침
import "./room-board.css";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { office } from "../data/office";

type Hand = { id: string; who: string; what: string; at: number };
type Open = { id: string; who: string; text: string; pstat: "new" | "spec" | "hold"; ts: number };
type Board = { hands: Hand[]; open: Open[] };
const PSTAT: Record<Open["pstat"], string> = { new: "새", spec: "명세로 넘김", hold: "보류" };
const SHOW = 3;

const took = (ms: number) => { const m = Math.max(0, Math.round(ms / 60_000)); return m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}`; };

export function RoomBoard({ room }: { room: string }) {
  const pair = room.startsWith("pair-");   // 둘의 방(읽기만) = 띠 0
  const q = useQuery({ queryKey: ["nomute", "board", room], queryFn: () => office<Board>(`rooms/${encodeURIComponent(room)}/board`), refetchInterval: 30_000, staleTime: 15_000, retry: false, enabled: !pair });
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  useEffect(() => { const t = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 60_000); return () => clearInterval(t); }, []);
  useEffect(() => setOpen(false), [room]);
  const hands = q.data?.hands || [], sugs = q.data?.open || [];
  if (pair || (!hands.length && !sugs.length)) return null;   // 둘 다 0 = 줄 0(봄 ①)
  const items = [
    ...hands.map((h) => <span key={`h${h.id}`} className="bd-chip bd-hand" title={`${h.who} · ${h.what} · ${new Date(h.at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 시작`}>🖐 <b>{h.who}</b><span className="bd-what">{h.what}</span><i>{took(now - h.at)}</i></span>),
    ...sugs.map((s) => <span key={`s${s.id}`} className={`bd-chip bd-sug${s.pstat !== "new" ? ` is-${s.pstat}` : ""}`} title={`[제안] ${s.text} · ${PSTAT[s.pstat]} · ${s.who}`}>💡 <span className="bd-what">{s.text}</span><i>{PSTAT[s.pstat]} · {s.who}</i></span>),
  ];
  const more = items.length - SHOW;
  return (
    <div className={`nm-board${open ? " open" : ""}`} role="status" aria-label={`맡은 일 ${hands.length} · 열린 제안 ${sugs.length}`}>
      {open || more <= 0 ? items : items.slice(0, SHOW)}
      {more > 0 ? <button type="button" className="bd-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "접기" : `+${more}`}</button> : null}
    </div>
  );
}
