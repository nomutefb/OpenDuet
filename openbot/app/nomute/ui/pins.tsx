// 방마다 글 고정 띠 + 고정 이력 판(카톡 채팅방 공지 꼴 · 형 10-28 16:46 「대화창마다, 대화 고정할 수 있게 해주고, 그 고정된 대화 누르면 고정 이력 나오게해줘. 이거 카톡 유아이랑 동일해.」 ·
//   16:47 「링크 헷갈릴때 임시로 고정해놓고 … 너랑 필요할때 다른거 고정해놓을때」) — 자료 = 서버 한 장(GET·POST·DELETE /api/office/pins/<방> · editor _pins.js · 형·윈터 PM 만 고정)
//   띠 = 방 맨 위 유리 알약(📌 글 앞줄 · 누가·언제) · 누름 = 고정 이력 판(지금 고정 + 앞서 고정된 것 · 최신 위 · 누르면 그 글로) · 오른쪽 ▾ = 접기(이 기기 · 방마다 · 새로 고정되면 다시 펼침)
//   자리 = 껍데기 대화 판(./shell.tsx) 머리 구슬 바로 아래에 겹쳐 띄움(대화창 파일 손 0) · 대화창(02 ui/office-chat.tsx) 몫 = 글 동작 줄 「고정」 = usePinActions(room).pin(m) 한 칸
//   + (있으면) 「그 글로」 = PinBar onJump · 띠·판 안 링크 = 앱 안(./inapp.ts 공용 받기)
import "./yeta-settings.css";
import "./pins.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { DuetIcon } from "@/components/duet/icons";
import { markdownComponents } from "@/lib/markdown";
import { office } from "../data/office";
import { t12 } from "./when";

export type Pin = { id: string; ts: number; who: string; at: string; text: string; files?: number; by: string; pinned_at: string; unpinned_at?: string; unpinned_by?: string };
type Pins = { cur: Pin | null; history: Pin[] };

const key = (room: string) => ["nomute", "pins", room] as const;
const when = (iso?: string) => { const t = iso ? Date.parse(iso) : NaN; if (!Number.isFinite(t)) return ""; const d = new Date(t + 9 * 3600e3).toISOString().slice(5, 10), today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(5, 10); return d === today ? t12(t) : `${d} ${t12(t)}`; };
const firstLine = (s: string) => s.replace(/[*_`>#~]|\[([^\]]*)\]\([^)]*\)/g, "$1").split("\n").map((x) => x.trim()).find(Boolean) || "";
const FOLD = (room: string) => `nm_pin_fold:${room}`;
const loadFold = (room: string) => { try { return localStorage.getItem(FOLD(room)) || ""; } catch { return ""; } };
const saveFold = (room: string, id: string) => { try { if (id) localStorage.setItem(FOLD(room), id); else localStorage.removeItem(FOLD(room)); } catch { /* 이 기기만 */ } };

/** 이 방 고정 한 장(30초마다 · 화면 돌아오면 다시) */
export function usePins(room: string) {
  return useQuery({ queryKey: key(room), queryFn: () => office<Pins>(`pins/${encodeURIComponent(room)}`), refetchInterval: 30_000, refetchOnWindowFocus: true, staleTime: 10_000, enabled: !!room });
}

/** 고정·풀기(형 화면만 · 서버도 형·윈터 PM 자리만 받음) — 대화창 글 동작 줄 「고정」 = pin(글) */
export function usePinActions(room: string) {
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["nomute", "me"], queryFn: () => office<{ me: { who: string; kind?: string; can_write?: boolean } }>("me").then((j) => j.me), staleTime: Infinity }).data;
  const done = (p: Pins) => qc.setQueryData(key(room), p);
  const pin = useMutation({ mutationFn: (m: { id: string; ts?: number }) => office<Pins>(`pins/${encodeURIComponent(room)}`, { method: "POST", body: JSON.stringify({ id: m.id, ts: m.ts }) }), onSuccess: done });
  const unpin = useMutation({ mutationFn: () => office<Pins>(`pins/${encodeURIComponent(room)}`, { method: "DELETE" }), onSuccess: done });
  return { can: me?.kind === "human" && me.can_write !== false, pin: (m: { id: string; ts?: number }) => pin.mutate(m), unpin: () => unpin.mutate(), busy: pin.isPending || unpin.isPending, error: (pin.error || unpin.error)?.message || "" };
}

/** 방 맨 위 고정 띠 — 고정 없으면 0 · onJump = 그 글로(대화창 몫 · 없으면 화면에 있는 글로 굴림) */
export function PinBar({ room, onJump }: { room: string; onJump?: (id: string, ts: number) => void }) {
  const q = usePins(room), cur = q.data?.cur || null;
  const [fold, setFold] = useState(() => loadFold(room));
  const [open, setOpen] = useState(false);
  const jump = (p: Pin) => { setOpen(false); if (onJump) onJump(p.id, p.ts); else document.querySelector(`[data-id="${CSS.escape(p.id)}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }); };
  if (!cur && !open) return null;
  const folded = !!cur && fold === cur.id;
  const toggle = () => { const v = folded ? "" : cur?.id || ""; setFold(v); saveFold(room, v); };
  return (
    <>
      {cur ? <div className="nm-pin-slot">{
        folded ? (
          <button type="button" className="nm-pin-mini" aria-label={`고정된 글 펼치기 — ${firstLine(cur.text)}`} onClick={toggle}><DuetIcon name="pin" size={16} /></button>
        ) : (
          <div className="nm-pinbar" role="region" aria-label="고정된 글">
            <button type="button" className="nm-pinbar-main" onClick={() => setOpen(true)} aria-label="고정 이력 보기">
              <DuetIcon name="pin" size={16} />
              <span className="nm-pinbar-t">
                <b>{firstLine(cur.text) || (cur.files ? `파일 ${cur.files}개` : "(빈 글)")}</b>
                <small>{cur.who} · {when(cur.at)} · {cur.by} 고정</small>
              </span>
            </button>
            <button type="button" className="nm-pinbar-fold" aria-label="고정 띠 접기" onClick={toggle}><DuetIcon name="chevronRight" size={16} /></button>
          </div>
        )
      }</div> : null}
      {open ? <PinHistory room={room} pins={q.data || { cur: null, history: [] }} onClose={() => setOpen(false)} onJump={jump} /> : null}
    </>
  );
}

/** 고정 이력 판(띠 누름) — 지금 고정 + 앞서 고정된 것(최신 위) · 누르면 그 글로 · 형 화면 = 풀기·다시 고정 */
function PinHistory({ room, pins, onClose, onJump }: { room: string; pins: Pins; onClose: () => void; onJump: (p: Pin) => void }) {
  const act = usePinActions(room);
  const row = (p: Pin, now: boolean) => (
    <div key={`${p.id}-${p.pinned_at}`} className="ycd-card card-left nm-pin-card">
      <span className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--mut)" }}>
        {now ? <b className="nm-pin-now">지금 고정</b> : null}
        <span>{p.who} · {when(p.at)}</span>
        <span>· {p.by} 고정 {when(p.pinned_at)}{p.unpinned_at ? ` · 풀림 ${when(p.unpinned_at)}` : ""}</span>
      </span>
      <div className="nm-pin-body" role="button" tabIndex={0} aria-label="그 글로 가기" onClick={(e) => { if (!(e.target as Element).closest("a")) onJump(p); }} onKeyDown={(e) => { if (e.key === "Enter") onJump(p); }}>
        {p.text.trim() ? <Streamdown components={markdownComponents}>{p.text}</Streamdown> : <span style={{ color: "var(--mut)" }}>{p.files ? `파일 ${p.files}개` : "(빈 글)"}</span>}
      </div>
      {act.can ? (
        <span className="flex gap-2">
          {now ? <button type="button" className="nm-pin-act" disabled={act.busy} onClick={act.unpin}>풀기</button>
            : <button type="button" className="nm-pin-act" disabled={act.busy} onClick={() => act.pin(p)}>다시 고정</button>}
        </span>
      ) : null}
    </div>
  );
  return (
    <div className="nm-pinsheet yeta-set" role="dialog" aria-modal="true" aria-label="고정 이력">
      <div className="nm-modal-h">
        <button type="button" className="nm-modal-back" aria-label="닫기" onClick={onClose}><DuetIcon name="chevronLeft" size={20} /></button>
        <b>고정 이력</b>
      </div>
      <div className="nm-pinsheet-b">
        {pins.cur ? row(pins.cur, true) : <p className="px-2 text-sm" style={{ color: "var(--mut)" }}>지금 고정된 글 없음</p>}
        {pins.history.length ? <h2 className="yset-sec">앞서 고정 {pins.history.length}</h2> : null}
        {pins.history.map((p) => row(p, false))}
        {act.error ? <p className="px-2 text-xs" role="alert" style={{ color: "var(--mut)" }}>못 바꿈 — {act.error}</p> : null}
      </div>
    </div>
  );
}
