// 원본 components/shell/menu-sheet.tsx 자리 — 서랍 = 원본 틀(Sheet · 왼쪽 · 340px) 그대로, 안은 우리 사무실 목록(옛 화면 2차 B 규칙)
//   맨 위 공지 핀 한 줄(누르면 펼침) · 회의실 · 고정한 방 · 그 밖 방(최근 글 순) · 숨긴 방(접힘) · 아래 설정
//   방 줄 = 얼굴 · 이름 · 꼬리표 · 둘째 줄 마지막 글(러너 깸 줄 뺌 · 서버 last_talk) · 시각 · 안 읽음 점(서버 seen = 기기끼리)
//   줄 메뉴(⋯ · 오른쪽 클릭) = 고정/풀기 · 안 읽음으로/읽음으로 · 숨기기/보이기 — 고정·숨기기 = 이 기기(localStorage · 옛 화면과 같음)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { appConfig } from "@/lib/generated/application-config";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg, FaceStack } from "./faces";

export const MANAGE_STORAGE_KEY = "openbot.menu-manage";
export const ARCHIVED_STORAGE_KEY = "openduet.menu-archived";
export const EVERYTHING_LINE = "형 · 윈터 · 봇 다 같이";

const PINS = "nm-office-pins", HIDE = "nm-office-hidden";
const readSet = (k: string): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } };
const writeSet = (k: string, s: Set<string>) => { try { localStorage.setItem(k, JSON.stringify([...s])); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } };

const kst = (ts: number) => new Date(ts + 9 * 3600e3);
function when(ts?: number) {
  if (!ts) return "";
  const d = kst(ts), n = kst(Date.now());
  if (d.toISOString().slice(0, 10) === n.toISOString().slice(0, 10)) return d.toISOString().slice(11, 16);
  const days = Math.round((Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()) - Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())) / 864e5);
  return days === 1 ? "어제" : `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export function MenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; onNewChannel?: () => void }) {
  const qc = useQueryClient();
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const seen = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 }).data || {};
  const notice = useQuery({ queryKey: ["nomute", "notice"], queryFn: () => office<{ notice?: { text: string; at?: string } }>("noticeset").then((j) => j.notice), staleTime: 60_000 }).data;
  const me = useQuery({ queryKey: ["nomute", "me"], queryFn: () => office<{ me: { name?: string; who: string } }>("me").then((j) => j.me), staleTime: Infinity }).data;
  const [pins, setPins] = useState(() => readSet(PINS)), [hidden, setHidden] = useState(() => readSet(HIDE));
  const [menu, setMenu] = useState(""), [noticeOpen, setNoticeOpen] = useState(false), [hiddenOpen, setHiddenOpen] = useState(false);
  const close = () => onOpenChange(false);
  const all = (rooms.data || []).filter((r) => r.id !== "notice" && r.with !== "형");
  const lastOf = (r: OfficeRoom) => (r.last_talk !== undefined ? r.last_talk : r.last);
  const unread = (r: OfficeRoom) => { const l = lastOf(r); return !!l && l.kind !== "human" && (seen[r.id]?.ts || 0) < (r.last_ts || 0); };
  const order = (a: OfficeRoom, b: OfficeRoom) => (b.last_ts || 0) - (a.last_ts || 0);
  const shown = all.filter((r) => r.id !== "all" && !hidden.has(r.id));
  const pinned = shown.filter((r) => pins.has(r.id)).sort(order), rest = shown.filter((r) => !pins.has(r.id)).sort(order);
  const hid = all.filter((r) => hidden.has(r.id)).sort(order);
  const meeting = all.find((r) => r.id === "all");

  const toggle = (k: string, s: Set<string>, set: (s: Set<string>) => void, id: string) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); writeSet(k, n); set(n); setMenu(""); };
  const markRead = async (r: OfficeRoom, read: boolean) => {
    setMenu("");
    const ts = read ? r.last_ts || Date.now() : Math.max(0, (r.last_ts || 1) - 1);
    try { await office("seen", { method: "POST", body: JSON.stringify({ seen: { [r.id]: { ts, at: Date.now() } } }) }); } catch { /* 다음 pulse 가 맞춤 */ }
    void qc.invalidateQueries({ queryKey: ["nomute", "seen"] });
  };

  const Row = ({ r, big = false }: { r: OfficeRoom; big?: boolean }) => {
    const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined;
    const preview = l ? `${r.with || l.kind === "human" ? "" : `${list.find((x) => x.who === l.who)?.name || l.who}: `}${(l.text || "").split("\n")[0]}` : "아직 글 없음";
    const u = unread(r);
    return (
      <li className="relative" onContextMenu={(e) => { e.preventDefault(); setMenu(menu === r.id ? "" : r.id); }}>
        <Link to={r.id === "all" ? "/" : "/channels/$channelId"} params={r.id === "all" ? undefined : { channelId: r.id }} onClick={close}
          activeOptions={{ exact: true }} activeProps={{ className: "bg-duet-tile" }}
          className={`flex items-center gap-3 rounded-2xl px-3 ${big ? "py-3" : "py-2"} pr-10 hover:bg-duet-tile`}>
          {r.with ? <FaceImg id={idOf(r.with, list)} size={36} /> : ids.length ? <span className="grid size-9 place-items-center"><FaceStack ids={ids.slice(0, 3)} size={20} /></span> : <span className="grid size-9 place-items-center"><DuetIcon name="chat" size={20} /></span>}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <b className={`truncate text-[15px] ${u ? "font-bold" : "font-semibold"}`}>{p?.name || r.name}</b>
              {p?.mark ? <span aria-hidden>{p.mark}</span> : null}
              {p?.role ? <span data-content className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{p.role}</span> : r.designated ? <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">@모두 {(r.members || []).length}</span> : null}
              {pins.has(r.id) ? <span aria-label="고정함" className="text-[11px]">📌</span> : null}
              <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">{when(r.last_ts)}</span>
            </span>
            <span data-content className={`block truncate text-xs ${u ? "text-foreground" : "text-muted-foreground"}`}>{r.id === "all" && !l ? EVERYTHING_LINE : preview}</span>
          </span>
          {u ? <span aria-label="안 읽음" className="absolute right-9 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary" /> : null}
        </Link>
        <button type="button" aria-label={`${p?.name || r.name} 줄 메뉴`} aria-expanded={menu === r.id} className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5" onClick={() => setMenu(menu === r.id ? "" : r.id)}>⋯</button>
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="duet-face w-[340px] gap-0 bg-duet-surface p-0 sm:max-w-[340px]" showCloseButton={false} side="left">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="type-display font-semibold text-duet-ink">{appConfig.brand.productName}</SheetTitle>
          <SheetDescription className="type-sub truncate text-duet-ink-2">{me?.name || me?.who || "형"}</SheetDescription>
        </SheetHeader>
        <nav aria-label="방 목록" className="flex min-h-0 flex-1 flex-col px-3 pb-4">
          {notice?.text ? (
            <button type="button" className="mb-1 flex items-start gap-2 rounded-2xl bg-amber-500/10 px-3 py-2 text-left text-sm" aria-expanded={noticeOpen} onClick={() => setNoticeOpen((v) => !v)}>
              <span aria-hidden>📌</span>
              <span data-content className={`min-w-0 flex-1 ${noticeOpen ? "whitespace-pre-wrap" : "truncate"}`}><b>공지</b> · {noticeOpen ? notice.text : notice.text.split("\n")[0]}</span>
            </button>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ul className="flex flex-col">
              {meeting ? <Row r={meeting} big /> : null}
              {pinned.map((r) => <Row key={r.id} r={r} />)}
              {pinned.length ? <li aria-hidden className="mx-3 my-1 border-t border-border" /> : null}
              {rest.map((r) => <Row key={r.id} r={r} />)}
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
          </div>
          <div className="mt-2 flex shrink-0 flex-col border-duet-hair border-t pt-2">
            <Link to="/settings" onClick={close} activeProps={{ className: "bg-duet-tile" }} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] hover:bg-duet-tile">
              <DuetIcon name="settings" size={22} />설정
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
