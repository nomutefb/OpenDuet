// 대화방 우하단 스피드 다이얼 = 「+ 단톡방」·「수리 접수」(형 11-01 「저거를 네비 기능으로 우하단으로」 · 「버튼 2개만 나와도 지금은 좋아」 · 「살짝 투명해도 돼 글케 안크고」)
//   움직임 = kinetics.colorion.co speed-dial-fab 그대로(스프링 곡선 · 0.4배에서 튀어나옴 · 순차 지연 · 아이콘 135도) · 각도 = 9시 수리 접수 · 12시 + 단톡방(형 「9시 부터 12시 방향으로」) · 꼴 = 우리 유리 · 눌러도 네모 안 보임
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { enterRoom } from "../data/read-state";
import { REPAIR_ROOM } from "./repair-desk";
import { useRoomOrder } from "./room-list";
import { TempRoomDialog } from "./temp-room";

export function RoomFab() {
  const nav = useNavigate(), { rooms, count } = useRoomOrder();
  const [open, setOpen] = useState(false), [making, setMaking] = useState(false), box = useRef<HTMLDivElement>(null);
  const rp = (rooms.data || []).find((x) => x.id === REPAIR_ROOM), n = rp ? Math.max(0, count(rp)) : 0, badge = n > 0 ? <b className="nm-rcount">{n > 99 ? "99+" : n}</b> : null;
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  return (
    <>
      <div ref={box} className={`nm-fab${open ? " on" : ""}`}>
        {rp ? (
          <button type="button" className="nm-fab-i at9" tabIndex={open ? 0 : -1} aria-label={n ? `수리 접수 · 안 읽은 글 ${n}개` : "수리 접수"}
            onClick={() => { setOpen(false); enterRoom(REPAIR_ROOM); void nav({ to: "/channels/$channelId", params: { channelId: REPAIR_ROOM } }); }}>
            수리 접수{badge}
          </button>
        ) : null}
        <button type="button" className="nm-fab-i at12" tabIndex={open ? 0 : -1} aria-label="임시 단톡방 만들기" onClick={() => { setOpen(false); setMaking(true); }}>+ 단톡방</button>
        <button type="button" className="nm-fab-main" aria-expanded={open} aria-label={open ? "닫기" : n ? `단톡방·수리 접수 · 안 읽은 글 ${n}개` : "단톡방·수리 접수"} onClick={() => setOpen((v) => !v)}>
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {open ? null : badge}
        </button>
      </div>
      {making ? <TempRoomDialog onClose={() => setMaking(false)} /> : null}
    </>
  );
}
