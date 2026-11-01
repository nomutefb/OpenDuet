// 방 안 햄버거 메뉴(형 11-01 08:46 「그 우측이 햄버거 모양 메뉴 픽토그램까지 두자」 · 「메뉴 열리면 거기에 톡방 길게 눌럿을때 나오는 메뉴들이 포함되면 될거같아」
//   「방 설정 같은 것들. 대화방 프로필 설정 · 대화방 알림 · 대화방 질문 이력 · 파일 기록」)
//   = 방 목록 줄 메뉴(./room-list.tsx)의 방 설정 칸을 방 안에서 · 표지 색·이름 = ./room-color.tsx 판 그대로 · 알림 = 봄 서버(../data/notify.ts) 같은 열쇠
//   질문 이력 = 봄 서버 GET decisions?room=&all=1(못 받으면 칸 안 보임) · 파일 기록은 속이 생기면 칸을 더함(누르면 깨지는 칸 0 · 알림 칸과 같은 규칙)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, office } from "../data/office";
import { type NotifyState, notifyOn, notifyState } from "../data/notify";
import { RainbowOrb, RoomColorPick, RoomNamePick } from "./room-color";

export function RoomHeadMenu({ room, right }: { room: string; right: number }) {
  const qc = useQueryClient(), btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false), [tinting, setTinting] = useState<OfficeRoom | null>(null), [naming, setNaming] = useState<OfficeRoom | null>(null), [err, setErr] = useState("");
  const notify = useQuery({ queryKey: ["nomute", "notify"], queryFn: () => office<Partial<NotifyState>>("notify").then(notifyState), staleTime: 60_000, retry: false });
  const [hist, setHist] = useState(false);
  const asks = useQuery({ queryKey: ["nomute", "decisions-hist", room], queryFn: () => office<{ ok?: boolean; items?: Ask[] }>(`decisions?room=${encodeURIComponent(room)}&all=1`).then((j) => (Array.isArray(j.items) ? j.items : null)), enabled: open || hist, staleTime: 30_000, retry: false });   // 질문 이력(봄 서버 ?room=&all=1 · 형 고른 것 choice 칸째) · 못 받으면 칸 안 보임
  const r = (qc.getQueryData<OfficeRoom[]>(["nomute", "rooms"]) || []).find((x) => x.id === room);
  useEffect(() => { setOpen(false); }, [room]);
  useEffect(() => {   // 밖을 누르면 닫힘(줄 메뉴와 같음)
    if (!open) return undefined;
    const close = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.(".nm-room-menu-list, .nm-room-menu")) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const setNotify = async (on: boolean) => {
    setOpen(false); setErr("");
    try { qc.setQueryData(["nomute", "notify"], notifyState(await office<Partial<NotifyState>>("notify", { method: "POST", body: JSON.stringify({ room, on }) }))); }
    catch (e) { setErr(`알림 설정을 못 바꿨어 · ${(e as Error).message}`); }
  };
  const nOn = notifyOn(notify.data, room, !!r?.with);
  const b = btn.current?.getBoundingClientRect();
  return (
    <>
      <button ref={btn} type="button" className="nm-room-menu" style={{ right }} aria-label="방 메뉴" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}><DuetIcon name="menu" size={20} /></button>
      {open && r ? (
        <div role="menu" aria-label={`${r.name} 메뉴`} className="nm-room-menu-list" style={{ right: right + 4, top: (b ? b.bottom : 44) + 4 }}>
          {!r.with ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setTinting(r); }}><span className="flex items-center gap-2"><RainbowOrb />대화방 프로필 · 표지 색</span></button> : null}
          {!r.with && !r.temp ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setNaming(r); }}>대화방 이름 바꾸기</button> : null}
          {asks.data ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setHist(true); }}>대화방 질문 이력<small>{asks.data.length}</small></button> : null}
          {notify.data ? <button type="button" role="menuitemcheckbox" aria-checked={nOn} onClick={() => void setNotify(!nOn)}>대화방 알림<small>{nOn ? "켬" : "끔"}</small></button> : null}
        </div>
      ) : null}
      {err ? <div role="alert" className="nm-room-menu-list" style={{ right: right + 4, top: (b ? b.bottom : 44) + 4 }} onClick={() => setErr("")}>{err}</div> : null}
      {tinting ? <RoomColorPick room={tinting} onPeek={() => {}} onClose={() => setTinting(null)} /> : null}
      {naming ? <RoomNamePick room={naming} onClose={() => setNaming(null)} /> : null}
      {hist && r ? <AskHistory name={r.name} items={asks.data || []} onClose={() => setHist(false)} /> : null}
    </>
  );
}

type Ask = { id: string; who?: string; q?: string; choices?: string[]; at?: string; ts?: number; choice?: { i?: number; label?: string; pass?: boolean; text?: string; at?: string } };

/** 대화방 질문 이력(형 11-01 08:46 「대화방 질문 이력」) = 그 방 [결정] 물음 · 발제자 · 형이 고른 것(안 고른 건 「기다림」) · 새것부터 */
function AskHistory({ name, items, onClose }: { name: string; items: Ask[]; onClose: () => void }) {
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  const picked = (c: Ask["choice"]) => (!c ? "" : c.pass ? "pass" : c.text ? `기타 · ${c.text}` : c.label || (typeof c.i === "number" ? `${c.i + 1}번` : "고름"));
  const list = [...items].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" onClick={onClose}>
      <div className="nrc" role="dialog" aria-label={`${name} 질문 이력`} onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><b>질문 이력</b><small>{list.length ? `${list.length}개` : "아직 없음"}</small></div>
        <ol className="nm-ask-hist">
          {list.map((a) => (
            <li key={a.id}>
              <p className="q">{a.q || "(물음 글 없음)"}</p>
              <p className="m"><span>{a.who || ""}{a.at ? ` · ${a.at.slice(5, 16).replace("T", " ")}` : ""}</span><b className={a.choice ? "on" : ""}>{a.choice ? `✓ ${picked(a.choice)}` : "기다림"}</b></p>
            </li>
          ))}
        </ol>
        <div className="nrc-acts"><button type="button" className="nrc-x" onClick={onClose}>닫기</button></div>
      </div>
    </div>,
    document.body,
  );
}
