// 대화 목록 — PC 왼쪽 늘 열림(형 10-28 09:48 「그록.컴 처럼 대화창 목록이 처음에 들어가자마자 딱 나와야해」 · 10:17 「좌측이 좀 더 좁아져도」) · 폰 = 아래 네비 「목록」 칸이 여는 서랍(10:22)
//   차례(형 09:49 「안 읽은게 가장 위에부터」 · 11:21 「안 읽은 방 맨 위 → 고정 → 나머지」) = 안 읽은 방(최근 순) → 고정한 방(회의실 = 늘 고정 · 이 기기) → 나머지(최근 순) → 숨긴 방(접힘)
//   같은 차례를 PC 얼굴 띠(ui/shell.tsx)가 씀 = useRoomOrder
//   안 읽은 수 = 서버 rooms[].unread(형 기준 · 짝 표) · 그 칸이 아직 없으면 점(seen < last_ts)
//   방 줄 = 얼굴 · 이름 · 꼬리표 · 마지막 글(러너 깸 줄 뺌 · 서버 last_talk) · 시각 · 줄 메뉴(⋯ · 오른쪽 클릭) = 고정/풀기 · 안 읽음으로/읽음으로 · 숨기기/보이기
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg, FaceStack } from "./faces";
import { listWhen } from "./when";

export const EVERYTHING_LINE = "형 · 윈터 · 봇 다 같이";
const PINS = "nm-office-pins", HIDE = "nm-office-hidden";
const readSet = (k: string): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } };
const writeSet = (k: string, s: Set<string>) => { try { localStorage.setItem(k, JSON.stringify([...s])); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } };


export type Room = OfficeRoom & { unread?: number };

/** 방 차례 하나(목록 화면 · PC 얼굴 띠) — 안 읽은 수 = 서버 rooms[].unread(없으면 점 = -1) */
export function useRoomOrder() {
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: Room[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const seen = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 }).data || {};
  const [pins, setPins] = useState(() => readSet(PINS)), [hidden, setHidden] = useState(() => readSet(HIDE));
  const all = ((rooms.data || []) as Room[]).filter((r) => r.id !== "notice" && r.with !== "형");
  const lastOf = (r: Room) => (r.last_talk !== undefined ? r.last_talk : r.last);
  const count = (r: Room) => {
    if (typeof r.unread === "number") return r.unread;
    const l = lastOf(r);
    return l && l.kind !== "human" && (seen[r.id]?.ts || 0) < (r.last_ts || 0) ? -1 : 0;
  };
  const pinned = (id: string) => id === "all" || pins.has(id);
  const recent = (a: Room, b: Room) => (b.last_ts || 0) - (a.last_ts || 0);
  const shown = all.filter((r) => !hidden.has(r.id));
  const unread = shown.filter((r) => count(r) !== 0).sort(recent);
  const pin = shown.filter((r) => count(r) === 0 && pinned(r.id)).sort((a, b) => (a.id === "all" ? -1 : b.id === "all" ? 1 : recent(a, b)));
  const rest = shown.filter((r) => count(r) === 0 && !pinned(r.id)).sort(recent);
  const hid = all.filter((r) => hidden.has(r.id)).sort(recent);
  return { rooms, list, ordered: [...unread, ...pin, ...rest], hid, count, lastOf, pinned, pins, setPins, hidden, setHidden };
}

export function RoomList({ onOpen, big = false, slim = false, current }: { onOpen?: () => void; big?: boolean; slim?: boolean; current?: string }) {   // slim = PC 왼쪽 좁은 칸(꼬리표 뺌 · 이름·표시·시각만)
  const qc = useQueryClient();
  const { rooms, list, ordered, hid, count, lastOf, pinned, pins, setPins, hidden, setHidden } = useRoomOrder();
  const notice = useQuery({ queryKey: ["nomute", "notice"], queryFn: () => office<{ notice?: { text: string; at?: string } }>("noticeset").then((j) => j.notice), staleTime: 60_000 }).data;
  const [menu, setMenu] = useState(""), [noticeOpen, setNoticeOpen] = useState(false), [hiddenOpen, setHiddenOpen] = useState(false);

  const toggle = (k: string, s: Set<string>, set: (s: Set<string>) => void, id: string) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); writeSet(k, n); set(n); setMenu(""); };
  const markRead = async (r: Room, read: boolean) => {
    setMenu("");
    const ts = read ? r.last_ts || Date.now() : Math.max(0, (r.last_ts || 1) - 1);
    try { await office("seen", { method: "POST", body: JSON.stringify({ seen: { [r.id]: { ts, at: Date.now() } } }) }); } catch { /* 다음 pulse 가 맞춤 */ }
    void qc.invalidateQueries({ queryKey: ["nomute", "seen"] });
    void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
  };

  const Row = ({ r }: { r: Room }) => {
    const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined;
    const preview = l ? `${r.with || l.kind === "human" ? "" : `${list.find((x) => x.who === l.who)?.name || l.who}: `}${(l.text || "").split("\n")[0]}` : r.id === "all" ? EVERYTHING_LINE : "아직 글 없음";
    const n = count(r), u = n !== 0, on = current === r.id, tall = big;
    return (
      <li className="group/row relative" onContextMenu={(e) => { e.preventDefault(); setMenu(menu === r.id ? "" : r.id); }}>
        <Link to={r.id === "all" ? "/" : "/channels/$channelId"} params={r.id === "all" ? undefined : { channelId: r.id }} onClick={onOpen}   // 회의실 = 첫 화면("/")
          className={`flex items-center gap-3 rounded-2xl px-3 ${tall ? "py-3" : "py-2"} pr-10 hover:bg-duet-tile ${on ? "bg-duet-tile" : ""}`}>
          {r.with ? <FaceImg id={idOf(r.with, list)} size={big ? 44 : 36} /> : ids.length ? <span className={`grid place-items-center ${big ? "size-11" : "size-9"}`}><FaceStack ids={ids.slice(0, 3)} size={big ? 24 : 20} /></span> : <span className="grid size-9 place-items-center"><DuetIcon name="chat" size={20} /></span>}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <b className={`min-w-[1.2em] shrink truncate text-[15px] ${u ? "font-bold" : "font-semibold"}`}>{p?.name || r.name}</b>
              {p?.mark ? <span aria-hidden className="shrink-0">{p.mark}</span> : null}
              {slim ? null : p?.role ? <span data-content className="min-w-0 shrink-[99] truncate rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{p.role}</span> : r.designated ? <span className="min-w-0 shrink-[99] truncate rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">@모두 {(r.members || []).length}</span> : null}
              {pinned(r.id) && r.id !== "all" ? <span aria-label="고정함" className="text-[11px]">📌</span> : null}
              <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{listWhen(r.last_ts)}</span>
            </span>
            <span className="flex items-center gap-2">
              <span data-content className={`block min-w-0 flex-1 truncate text-xs ${u ? "text-foreground" : "text-muted-foreground"}`}>{preview}</span>
              {n > 0 ? <b aria-label={`안 읽은 글 ${n}개`} className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums" style={{ background: "var(--accent, var(--primary))", color: "var(--bg, var(--primary-foreground))" }}>{n > 99 ? "99+" : n}</b>
                : n < 0 ? <span aria-label="안 읽음" className="size-2 shrink-0 rounded-full" style={{ background: "var(--accent, var(--primary))" }} /> : null}
            </span>
          </span>
        </Link>
        <button type="button" aria-label={`${p?.name || r.name} 줄 메뉴`} aria-expanded={menu === r.id} className={`absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 ${menu === r.id ? "" : "md:opacity-0 md:group-hover/row:opacity-100 md:focus-visible:opacity-100"}`} onClick={() => setMenu(menu === r.id ? "" : r.id)}>⋯</button>
        {menu === r.id ? (
          <div role="menu" className="absolute right-2 top-full z-10 flex min-w-36 flex-col rounded-xl border border-border bg-popover p-1 text-sm shadow-lg">
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(PINS, pins, setPins, r.id)}>{pins.has(r.id) ? "고정 풀기" : "고정"}</button> : null}
            <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void markRead(r, u)}>{u ? "읽음으로" : "안 읽음으로"}</button>
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(HIDE, hidden, setHidden, r.id)}>{hidden.has(r.id) ? "보이기" : "숨기기"}</button> : null}
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <nav aria-label="대화 목록" className="flex flex-col">
      {notice?.text ? (
        <button type="button" className="mb-1 flex items-start gap-2 rounded-2xl bg-amber-500/10 px-3 py-2 text-left text-sm" aria-expanded={noticeOpen} onClick={() => setNoticeOpen((v) => !v)}>
          <span aria-hidden>📌</span>
          <span data-content className={`min-w-0 flex-1 ${noticeOpen ? "whitespace-pre-wrap" : "truncate"}`}><b>공지</b> · {noticeOpen ? notice.text : notice.text.split("\n")[0]}</span>
        </button>
      ) : null}
      <ul className="flex flex-col">
        {ordered.map((r) => <Row key={r.id} r={r} />)}
      </ul>
      {rooms.isError ? <p className="px-3 py-2 text-sm text-destructive" role="alert">방 목록을 못 받았어. 새로 고쳐 줘.</p> : null}
      {hid.length ? (
        <>
          <button type="button" className="mt-2 flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground" aria-expanded={hiddenOpen} onClick={() => setHiddenOpen((v) => !v)}>
            <DuetIcon name="chevronRight" size={18} className={hiddenOpen ? "rotate-90" : ""} />숨긴 방 {hid.length}
          </button>
          {hiddenOpen ? <ul className="flex flex-col opacity-80">{hid.map((r) => <Row key={r.id} r={r} />)}</ul> : null}
        </>
      ) : null}
    </nav>
  );
}
