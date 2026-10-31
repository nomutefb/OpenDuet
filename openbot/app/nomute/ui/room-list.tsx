// 대화 목록 — PC 왼쪽 늘 열림(형 10-28 09:48 「그록.컴 처럼 대화창 목록이 처음에 들어가자마자 딱 나와야해」 · 10:17 「좌측이 좀 더 좁아져도」) · 폰 = 아래 네비 「목록」 칸이 여는 서랍(10:22)
//   차례(형 10-31 「대화 목록창에 최신 메세지 도착한 순으로 떠야되고」 · 「그 거보다 우선 기준은 고정핀 순」 · 앞 판 = 안 읽은 방 맨 위) = 고정한 방(회의실 = 늘 고정·맨 위 · 이 기기) → 나머지(최신 글 순) → 숨긴 방(접힘)
//   같은 차례를 PC 얼굴 띠(ui/shell.tsx)가 씀 = useRoomOrder
//   안 읽은 수 = 서버 rooms[].unread(형 기준 · 짝 표) · 그 칸이 아직 없으면 점(seen < last_ts)
//   방 줄 = 얼굴 · 이름 · 꼬리표 · 마지막 글(러너 깸 줄 뺌 · 서버 last_talk) · 시각 · 줄 메뉴(⋯ · 오른쪽 클릭) = 고정/풀기 · 안 읽음으로/읽음으로 · 숨기기/보이기
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { type CSSProperties, Fragment, type ReactNode, useState, useSyncExternalStore } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { FaceImg } from "./faces";
import { TempDeleteDialog, TempRoomButton, TempRoomDialog, TempSwipe } from "./temp-room";
import { listWhen } from "./when";

export const EVERYTHING_LINE = "필요한 이들이 드나드는 방";
const PINS = "nm-office-pins", HIDE = "nm-office-hidden";
const readSet = (k: string): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } };
const writeSet = (k: string, s: Set<string>) => { try { localStorage.setItem(k, JSON.stringify([...s])); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } };


import { enterRoom, roomReadState } from "../data/read-state";

export type Room = OfficeRoom & { unread?: number };

/** 미리보기 한 줄 = 글꼴 기호·부름·파일 경로 뺌(형 사진 10-31 09:12 「**[정치]」 · 「파일: … → 윈터 PM (cl…」) · 원문은 대화창에 그대로 */
export function previewLine(text: string) {
  const line = (text || "").split("\n")[0];
  const file = line.match(/^파일: (.+?) → /);
  if (file) return /\.(png|jpe?g|webp|gif|heic)$/i.test(file[1]) ? "사진" : `파일 · ${file[1]}`;
  return line.replace(/^(?:[!@]\S+\s+)+/, "").replace(/\*\*|__|`/g, "").trim();
}

/** 목록 시각 = 오늘은 24시간 「23:05」 · 다른 날은 listWhen 그대로(형 10-31 「11:34 am 목록에선 am빼서 우측 정렬으로 해서 24시간 표시로」) · 대화창 시각은 그대로 */
export function listTime(ts?: number) {
  const w = listWhen(ts), m = w.match(/^(\d{1,2}):(\d{2})\s*([AP])M$/i);
  return m ? `${String((Number(m[1]) % 12) + (m[3].toUpperCase() === "P" ? 12 : 0)).padStart(2, "0")}:${m[2]}` : w;
}

/** 방 차례 하나(목록 화면 · PC 얼굴 띠) — 안 읽은 수 = 서버 rooms[].unread(없으면 점 = -1) */
export function useRoomOrder() {
  useSyncExternalStore(roomReadState.subscribe, roomReadState.getSnapshot, roomReadState.getSnapshot);
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: Room[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const seen = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 }).data || {};
  const [pins, setPins] = useState(() => readSet(PINS)), [hidden, setHidden] = useState(() => readSet(HIDE));
  const all = ((rooms.data || []) as Room[]).filter((r) => r.id !== "notice" && r.with !== "형");
  const lastOf = (r: Room) => (r.last_talk !== undefined ? r.last_talk : r.last);
  const count = (r: Room) => {
    const l = lastOf(r);
    const serverCount = typeof r.unread === "number" ? r.unread : l && l.kind !== "human" && (seen[r.id]?.ts || 0) < (r.last_ts || 0) ? -1 : 0;
    return roomReadState.count(r.id, r.last_ts, serverCount);
  };
  const pinned = (id: string) => id === "all" || pins.has(id);
  const recent = (a: Room, b: Room) => (b.last_ts || 0) - (a.last_ts || 0);
  const shown = all.filter((r) => !hidden.has(r.id));
  const pin = shown.filter((r) => pinned(r.id)).sort((a, b) => (a.id === "all" ? -1 : b.id === "all" ? 1 : recent(a, b)));
  const rest = shown.filter((r) => !pinned(r.id)).sort(recent);
  const hid = all.filter((r) => hidden.has(r.id)).sort(recent);
  return { rooms, list, ordered: [...pin, ...rest], hid, count, lastOf, pinned, pins, setPins, hidden, setHidden };
}

export function RoomList({ onOpen, big = false, slim = false, current }: { onOpen?: () => void; big?: boolean; slim?: boolean; current?: string }) {   // slim = PC 왼쪽 좁은 칸(꼬리표 뺌 · 이름·표시·시각만)
  const { rooms, list, ordered, hid, count, lastOf, pinned, pins, setPins, hidden, setHidden } = useRoomOrder();
  const notice = useQuery({ queryKey: ["nomute", "notice"], queryFn: () => office<{ notice?: { text: string; at?: string } }>("noticeset").then((j) => j.notice), staleTime: 60_000 }).data;
  const [menu, setMenu] = useState(""), [noticeOpen, setNoticeOpen] = useState(false), [hiddenOpen, setHiddenOpen] = useState(false);
  const nav = useNavigate(), [swiped, setSwiped] = useState(""), [editing, setEditing] = useState<Room | null>(null), [deleting, setDeleting] = useState<Room | null>(null);   // 임시방 줄 왼쪽 끌기 = 수정·삭제

  const toggle = (k: string, s: Set<string>, set: (s: Set<string>) => void, id: string) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); writeSet(k, n); set(n); setMenu(""); };
  const markRead = async (r: Room, read: boolean) => {
    setMenu("");
    try { await (read ? roomReadState.read(r.id, r.last_ts, true) : roomReadState.unread(r.id, r.last_ts)); } catch { /* 표는 되돌리고 아래 오류를 보인다. */ }
  };

  const wrapTemp = (r: Room, row: ReactNode) => (r.temp ? <TempSwipe open={swiped === r.id} onOpen={() => setSwiped(r.id)} onClose={() => setSwiped("")} onEdit={() => { setSwiped(""); setEditing(r); }} onDelete={() => { setSwiped(""); setDeleting(r); }}>{row}</TempSwipe> : row);
  const Row = ({ r }: { r: Room }) => {
    const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined;
    const sender = l && !r.with && l.kind !== "human" ? list.find((x) => x.who === l.who) : undefined;   // 단톡 미리보기 보낸 이 = 제 색(형 10-31 「모루: 는 색이 다르게 표기되게」)
    const senderName = l && !r.with && l.kind !== "human" ? sender?.name || l.who : "";
    const preview = l ? previewLine(l.text || "") : r.id === "all" ? EVERYTHING_LINE : "아직 글 없음";
    const n = count(r), u = n !== 0, on = current === r.id, tall = big, size = big ? 44 : 36;
    // 단톡 = YETA 꼴(YETA-목록 · 운영자 260725 「단톡환경에서도 프로필이 겹치게」) · 얼굴 둘 겹침 · 마지막에 말한 이가 앞 · 인원 숫자만 · 누구인지 = 방 상단(형 10-31 「인원이 저기 누군지 나올 필욘 없는듯 들가면 확인할 수 잇으면 됨 방 상단에서」)
    const lastId = l ? idOf(l.who, list) : "", front = ids.includes(lastId) ? [lastId, ...ids.filter((x) => x !== lastId)] : ids;
    const crew = ids.map((id) => { const x = list.find((y) => idOf(y.who, list) === id); return x?.name || x?.who || ""; }).filter(Boolean);
    return (
      <li className={`nm-rrow group/row relative${r.with ? "" : " grp"}`} onContextMenu={(e) => { e.preventDefault(); setMenu(menu === r.id ? "" : r.id); }}>
        {wrapTemp(r, <>
        <Link to={r.id === "all" ? "/group/$channelId" : "/channels/$channelId"} params={{ channelId: r.id }} onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) { enterRoom(r.id); onOpen?.(); } }}   // 회의실 = #/group/all(첫 화면 "/" = 홈)
          className={`flex items-center gap-3 px-3 ${tall ? "py-3" : "py-2"} hover:bg-duet-tile ${on ? "bg-duet-tile" : ""}`}>
          {r.with ? <span className="nm-rorb" style={{ margin: -Math.round(size / 8) }}><MicOrb size={Math.round(size * 1.25)} id={idOf(r.with, list)} tint={ringOf(p)} /></span>
            : ids.length ? <span className="nm-rstk">{front.slice(0, 2).map((id, i) => <span key={id} style={{ marginLeft: i ? -Math.round(size * 0.35) : 0 }}><FaceImg id={id} size={size} /></span>)}</span>
            : <span className="grid size-9 place-items-center"><DuetIcon name="chat" size={20} /></span>}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <b className={`min-w-[1.2em] shrink truncate text-[15px] ${u ? "font-bold" : "font-semibold"}`}>{p?.name || r.name}</b>
              {p?.mark ? <span aria-hidden className="shrink-0">{p.mark}</span> : null}
              {slim ? null : p?.role ? <span data-content className="min-w-0 shrink-[99] truncate rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{p.role}</span> : !r.with && crew.length ? <span aria-label={`${crew.length}명`} className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{crew.length}</span> : null}
              {pinned(r.id) && r.id !== "all" ? <span aria-label="고정함" className="text-[11px]">📌</span> : null}
              <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{listTime(r.last_ts)}</span>
            </span>
            <span className="flex items-center gap-2 pr-6">   {/* ⋯ 자리 = 둘째 줄 · 첫 줄은 제목이 끝까지 */}
              <span data-content className={`block min-w-0 flex-1 truncate text-xs ${u ? "text-foreground" : "text-muted-foreground"}`}>{senderName ? <span className="nm-rsend" style={{ "--rs": ringOf(sender) } as CSSProperties}>{senderName}: </span> : null}{preview}</span>
              {n > 0 ? <b aria-label={`안 읽은 글 ${n}개`} className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums" style={{ background: "var(--accent, var(--primary))", color: "var(--bg, var(--primary-foreground))" }}>{n > 99 ? "99+" : n}</b>
                : n < 0 ? <span aria-label="안 읽음" className="size-2 shrink-0 rounded-full" style={{ background: "var(--accent, var(--primary))" }} /> : null}
            </span>
          </span>
        </Link>
        <button type="button" aria-label={`${p?.name || r.name} 줄 메뉴`} aria-expanded={menu === r.id} className={`absolute bottom-1 right-1 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 ${menu === r.id ? "" : "md:opacity-0 md:group-hover/row:opacity-100 md:focus-visible:opacity-100"}`} onClick={() => setMenu(menu === r.id ? "" : r.id)}>⋯</button>
        </>)}
        {menu === r.id ? (
          <div role="menu" className="absolute right-2 top-full z-10 flex min-w-36 flex-col rounded-xl border border-border bg-popover p-1 text-sm shadow-lg">
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(PINS, pins, setPins, r.id)}>{pins.has(r.id) ? "고정 풀기" : "고정"}</button> : null}
            <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void markRead(r, u)}>{u ? "읽음으로" : "안 읽음으로"}</button>
            {r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setEditing(r); }}>수정</button> : null}
            {r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left text-destructive hover:bg-foreground/5" onClick={() => { setMenu(""); setDeleting(r); }}>삭제</button> : null}
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(HIDE, hidden, setHidden, r.id)}>{hidden.has(r.id) ? "보이기" : "숨기기"}</button> : null}
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <nav aria-label="대화 목록" className="nm-yeta nm-rooms flex flex-col">
      <TempRoomButton />
      {editing ? <TempRoomDialog edit={editing} onClose={() => setEditing(null)} /> : null}
      {deleting ? <TempDeleteDialog r={deleting} onClose={() => setDeleting(null)} onGone={() => { if (current === deleting.id) void nav({ to: "/group/$channelId", params: { channelId: "all" } }); }} /> : null}
      {notice?.text ? (
        <button type="button" className="mb-1 flex items-start gap-2 rounded-2xl bg-amber-500/10 px-3 py-2 text-left text-sm" aria-expanded={noticeOpen} onClick={() => setNoticeOpen((v) => !v)}>
          <span aria-hidden>📌</span>
          <span data-content className={`min-w-0 flex-1 ${noticeOpen ? "whitespace-pre-wrap" : "truncate"}`}><b>공지</b> · {noticeOpen ? notice.text : notice.text.split("\n")[0].replace(/^공지\s*[—·:-]\s*/, "")}</span>
        </button>
      ) : null}
      <ul className="nm-rgroup flex flex-col">
        {ordered.map((r) => <Fragment key={r.id}>{Row({ r })}</Fragment>)}
      </ul>
      {rooms.isError ? <p className="px-3 py-2 text-sm text-destructive" role="alert">방 목록을 못 받았어. 새로 고쳐 줘.</p> : null}
      {roomReadState.error() ? <p className="px-3 py-2 text-sm text-destructive" role="alert">{roomReadState.error()}</p> : null}
      {hid.length ? (
        <>
          <button type="button" className="mt-2 flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground" aria-expanded={hiddenOpen} onClick={() => setHiddenOpen((v) => !v)}>
            <DuetIcon name="chevronRight" size={18} className={hiddenOpen ? "rotate-90" : ""} />숨긴 방 {hid.length}
          </button>
          {hiddenOpen ? <ul className="nm-rgroup flex flex-col opacity-80">{hid.map((r) => <Fragment key={r.id}>{Row({ r })}</Fragment>)}</ul> : null}
        </>
      ) : null}
    </nav>
  );
}
