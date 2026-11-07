// 대화 목록 — PC 왼쪽 늘 열림(형 10-28 09:48 「그록.컴 처럼 대화창 목록이 처음에 들어가자마자 딱 나와야해」 · 10:17 「좌측이 좀 더 좁아져도」) · 폰 = 아래 네비 「목록」 칸이 여는 서랍(10:22)
//   차례(형 10-31 「대화 목록창에 최신 메세지 도착한 순으로 떠야되고」 · 「그 거보다 우선 기준은 고정핀 순」 · 앞 판 = 안 읽은 방 맨 위) = 고정한 방(회의실 = 늘 고정·맨 위 · 이 기기) → 나머지(최신 글 순) → 숨긴 방(접힘)
//   같은 차례를 PC 얼굴 띠(ui/shell.tsx)가 씀 = useRoomOrder
//   안 읽은 수 = 서버 rooms[].unread(형 기준 · 짝 표) · 그 칸이 아직 없으면 점(seen < last_ts)
//   방 줄 = 얼굴 · 이름 · 꼬리표 · 마지막 글(러너 깸 줄 뺌 · 서버 last_talk) · 시각 · 줄 메뉴(⋯ · 오른쪽 클릭) = 고정/풀기 · 안 읽음으로/읽음으로 · 알림 켬/끔 · (단톡) 알림 그림 · 숨기기/보이기
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { backdrop } from "./backdrop";   // 바탕 닫힘 = 누름·뗌 둘 다 바탕(형 11-07 10:52)
import { Link, useNavigate } from "@tanstack/react-router";
import { type CSSProperties, Fragment, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SaveAsk, useCloseGuard } from "./save-ask";
import { createPortal } from "react-dom";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { FaceImg } from "./faces";
import { LiveShine } from "./live-shine";
import { RoomGoneDialog, RoomMembersDialog, TempDeleteDialog, TempRoomDialog, TempSwipe, canGone } from "./temp-room";
import { listWhen } from "./when";
import { NoticeDialog } from "./notice-edit";
import { TeamsList, TeamsSwitch, useTeamsMode } from "./teams";
import { RoomGlyph } from "./room-glyph";
import { RainbowOrb, RoomColorPick, RoomNamePick } from "./room-color";
import { GoButton } from "./go-button";
import { type NotifyState, notifyImage, notifyOn, notifyState } from "../data/notify";

export const EVERYTHING_LINE = "필요한 이들이 드나드는 방";
const PINS = "nm-office-pins", HIDE = "nm-office-hidden";
const readSet = (k: string): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } };
const writeSet = (k: string, s: Set<string>) => { try { localStorage.setItem(k, JSON.stringify([...s])); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } };


import { enterRoom, roomReadState } from "../data/read-state";
const SUMMARY = "summary";   // 요약실 = 목록엔 안 보임(형 11-04 13:00 「시아야 요약을 앞에 단톡 형태로 방으로 보일 필요는 없어」 · 같은 기사 요약 = 서랍 「뉴스 기사」 · 앞 판 = 회의실 바로 아래 · 형 07:5x) · 방 = 뜸 서버 id summary · 주소로 열면 ./summary-desk.tsx
const LIVE_MS = 3 * 60_000;   // 활발한 방 = 마지막 글(act_ts) 3분 안 · 빛 꼴 = live-shine.ts

export type Room = OfficeRoom & { unread?: number };

/** 단톡 알림 그림 = 고른 사진 가운데를 192px 네모로(봄 11-01 07:34 「앱이 192px 로 줄인 png/webp dataURL」) · 못 읽는 꼴(HEIC 등)은 img 로 한 번 더 */
async function shrink192(f: File): Promise<string> {
  const c = document.createElement("canvas"); c.width = c.height = 192;
  const draw = (src: CanvasImageSource, w: number, h: number) => { const s = Math.min(w, h); c.getContext("2d")?.drawImage(src, (w - s) / 2, (h - s) / 2, s, s, 0, 0, 192, 192); };
  try { const b = await createImageBitmap(f); draw(b, b.width, b.height); b.close(); }
  catch {
    const url = URL.createObjectURL(f);
    try { const im = new Image(); im.src = url; await im.decode(); draw(im, im.naturalWidth, im.naturalHeight); } finally { URL.revokeObjectURL(url); }
  }
  const webp = c.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/png");
}
// 수리 접수 = 단톡방이 아니라 접수처(형 10-31 「회의실 개념 이 아니니까, 따로 위에 뺴줄래?」) · 방은 그대로라 애들 접수는 같음 · 화면만 목록 밖 오른쪽 위 단추
const REPAIR = "repair";

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
  const pinned = (id: string) => id === "all" || id === SUMMARY || pins.has(id);
  const recent = (a: Room, b: Room) => (b.last_ts || 0) - (a.last_ts || 0);
  const shown = all.filter((r) => !hidden.has(r.id));
  const head = (id: string) => (id === "all" ? 0 : id === SUMMARY ? 1 : 2);   // 회의실 → 요약실 → 고정 방(최근 순)
  const pin = shown.filter((r) => pinned(r.id)).sort((a, b) => head(a.id) - head(b.id) || recent(a, b));
  const rest = shown.filter((r) => !pinned(r.id)).sort(recent);
  const hid = all.filter((r) => hidden.has(r.id)).sort(recent);
  return { rooms, list, ordered: [...pin, ...rest].filter((r) => r.id !== REPAIR && r.id !== "memo" && r.id !== SUMMARY), hid, count, lastOf, pinned, pins, setPins, hidden, setHidden };
}

/** 방 아이콘 = 둥근 네모(사람 = 동그라미라 한눈에 갈림) · 그림 /office/room-<방 id>.webp(뜸 그림 · 있으면 먼저) · 없으면 방 표지 색 바탕 + 방 이름의 이모지(밥상 🍚) 또는 첫 글자 */
function RoomIcon({ r, size, color }: { r: Room; size: number; color?: string }) {
  const [noPic, setNoPic] = useState(false);
  const emo = /\p{Extended_Pictographic}/u.exec(r.name)?.[0], ch = emo || [...r.name.replace(/\s+/g, "")][0] || "#";
  if (!r.with && (noPic || r.look?.icon)) return <RoomGlyph id={r.id} look={r.look} size={size} />;   // 단톡방 = 픽토그램 선만(형 11-06 20:15 · 그림 올린 방은 그림 · 형이 아이콘 고르면 아이콘)
  return (
    <span className="nm-ricon" style={{ width: size, height: size, ...(color ? { background: color } : {}) } as CSSProperties} aria-hidden>
      {noPic ? <span className={emo ? "emo" : "ch"} style={{ fontSize: Math.round(size * (emo ? 0.56 : 0.44)) }}>{ch}</span>
        : <img src={`/office/room-${encodeURIComponent(r.id)}.webp`} alt="" onError={() => setNoPic(true)} />}
    </span>
  );
}
export function RoomList({ onOpen, big = false, slim = false, current }: { onOpen?: () => void; big?: boolean; slim?: boolean; current?: string }) {   // slim = PC 왼쪽 좁은 칸(꼬리표 뺌 · 이름·표시·시각만)
  const { rooms, list, ordered, hid, count, lastOf, pinned, pins, setPins, hidden, setHidden } = useRoomOrder();
  const teamsOn = useTeamsMode() && !slim;   // 「사무실 | 팀즈」 바꿈(PC 왼쪽 좁은 칸 = 사무실 그대로)
  // 활발한 방 = 이름에 빛(형 11-01 「현재 활발한 방(누군가라도 활동중인 방개인포함)은 이름에 빚지나가게」) — 마지막 글이 3분 안 · 또는 1:1 에서 형 글 뒤 그 이가 일하는 중(대화 칸 점 셋과 같은 깸 표 · 같은 bots 캐시)
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: { who: string; state: string; why?: string }[] }>("bots").then((j) => j.bots || []), staleTime: 15_000, refetchInterval: 60_000 }).data || [];
  const live = (r: Room) => { const l = lastOf(r); return Date.now() - (r.act_ts || r.last_ts || 0) < LIVE_MS ||   /* act_ts = 1:1 방 우리끼리 글까지 든 진짜 마지막(미리보기는 형 낀 글 · 서버 #1990) */ (!!r.with && l?.kind === "human" && bots.some((b) => b.who === r.with && b.state === "awake" && b.why !== "read")); };
  const notice = useQuery({ queryKey: ["nomute", "notice"], queryFn: () => office<{ notice?: { text: string; at?: string } }>("noticeset").then((j) => j.notice), staleTime: 60_000 }).data;
  const [menu, setMenu] = useState(""), [noticeOpen, setNoticeOpen] = useState(false), [hiddenOpen, setHiddenOpen] = useState(false);
  const [tinting, setTinting] = useState<Room | null>(null), [peek, setPeek] = useState<{ id: string; hex: string } | null>(null);   // 표지 색 판(./room-color.tsx) · peek = 끄는 동안 줄에 먼저 보임
  const [naming, setNaming] = useState<Room | null>(null);   // 방 이름(./room-color.tsx) · 임시방 = 「수정」 길
  const press = useRef<{ t: number; x: number; y: number; hit: boolean; touch?: boolean; buzz?: number }>({ t: 0, x: 0, y: 0, hit: false });   // 길게 누르기(형 10-31 「길게 누르면 변경 하는 거기서 수정」) = 터치만 · 오른쪽 클릭은 onContextMenu
  useEffect(() => {   // 줄 메뉴 = 밖을 누르면 닫힘(형 10-31 「다른거 클릭하면 없어져야 되는데 안없어진더」)
    if (!menu) return undefined;
    const close = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.('[role="menu"], .nm-rmore')) setMenu(""); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);
  // 방 알림(./data/notify.ts · 서버 = 봄) — 서버 답이 없으면(아직 안 올라감 · 못 받음) 메뉴에 알림 칸을 안 보인다(누르면 깨지는 단추 0)
  const qc = useQueryClient(), notify = useQuery({ queryKey: ["nomute", "notify"], queryFn: () => office<Partial<NotifyState>>("notify").then(notifyState), staleTime: 60_000, retry: false });
  const [notifyErr, setNotifyErr] = useState(""), pick = useRef<HTMLInputElement>(null), [picking, setPicking] = useState(""), [pendPic, setPendPic] = useState<{ room: string; url: string } | null>(null);
  const setNotify = async (body: { room: string; on?: boolean | null; image?: string }) => {
    setMenu(""); setNotifyErr("");
    try { qc.setQueryData(["nomute", "notify"], notifyState(await office<Partial<NotifyState>>("notify", { method: "POST", body: JSON.stringify(body) }))); }
    catch (e) { setNotifyErr(`알림 설정을 못 바꿨어 · ${(e as Error).message}`); }
  };
  const onPick = async (f?: File) => {
    const room = picking; setPicking(""); if (pick.current) pick.current.value = "";
    if (!f || !room) return;
    try { setPendPic({ room, url: await shrink192(f) }); } catch (e) { setNotifyErr(`사진을 못 읽었어 · ${(e as Error).message}`); }   // 바로 안 올림 = 보여 주고 「저장」(NotifyPicPick)
  };
  const nav = useNavigate(), [swiped, setSwiped] = useState(""), [editing, setEditing] = useState<Room | null>(null), [deleting, setDeleting] = useState<Room | null>(null), [gone, setGone] = useState<Room | null>(null), [membering, setMembering] = useState<Room | null>(null);   // 임시방 줄 왼쪽 끌기 = 수정·삭제 · 단톡방 = 설정·🗑️(형 11-05)

  const toggle = (k: string, s: Set<string>, set: (s: Set<string>) => void, id: string) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); writeSet(k, n); set(n); setMenu(""); };
  const markRead = async (r: Room, read: boolean) => {
    setMenu("");
    try { await (read ? roomReadState.read(r.id, r.last_ts, true) : roomReadState.unread(r.id, r.last_ts)); } catch { /* 표는 되돌리고 아래 오류를 보인다. */ }
  };

  const wrapTemp = (r: Room, row: ReactNode) => (r.temp ? <TempSwipe open={swiped === r.id} onOpen={() => setSwiped(r.id)} onClose={() => setSwiped("")} onEdit={() => { setSwiped(""); setEditing(r); }} onDelete={() => { setSwiped(""); setDeleting(r); }}>{row}</TempSwipe>
    // 다른 방 = 왼쪽으로 밀면 설정 칸 하나(형 11-02 02:20 「여기 톡방 좌측으로 밀면 설정 버튼이 뜨게 해줘 그 액션은 예타 리포지토리에 있어」 · 예타 yLrBind 끌기 · 누르면 길게 누르기·⋯ 와 같은 줄 메뉴)
    // 단톡방 = 설정 옆 🗑️(형 11-05 「좌측으로 하면 휴지통 모양 하나 나와서 정말 없애겠냐고 뜨고」 · 못 없애는 방 = canGone)
    : <TempSwipe open={swiped === r.id} onOpen={() => setSwiped(r.id)} onClose={() => setSwiped("")} width={canGone(r) ? 128 : 64} acts={[{ key: "set", cls: "set", aria: "설정", label: <DuetIcon name="settings" size={20} />, on: () => { setSwiped(""); setMenu(r.id); } }, ...(canGone(r) ? [{ key: "del", cls: "del", aria: "방 없애기", label: <DuetIcon name="trash" size={20} />, on: () => { setSwiped(""); setGone(r); } }] : [])]}>{row}</TempSwipe>);
  const Row = ({ r }: { r: Room }) => {
    const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined;
    const preview = l ? previewLine(l.text || "") : r.id === "all" ? EVERYTHING_LINE : "아직 글 없음";   // 단톡 미리보기 = 글만(형 11-01 14:06 「대화만 나오면 되 문자열만 누가 나오는지 안보여도 됨」 · 옛 「깃:」 머리 뺌)
    const n = count(r), u = n !== 0, on = current === r.id, tall = big, size = big ? 44 : 36;
    // 단톡 = YETA 꼴(YETA-목록 · 운영자 260725 「단톡환경에서도 프로필이 겹치게」) · 얼굴 둘 겹침 · 마지막에 말한 이가 앞 · 인원 숫자만 · 누구인지 = 방 상단(형 10-31 「인원이 저기 누군지 나올 필욘 없는듯 들가면 확인할 수 잇으면 됨 방 상단에서」)
    const rc = r.with ? "" : peek?.id === r.id ? peek.hex : r.color || "";
    const sig = r.with ? ringOf(p) || "" : rc;   // 활발한 방 이름 빛 바탕 = 그 사람 테 색 · 단톡 = 방 표지 색 · 없으면 노뮤트 연두(live-shine.css .sig · 형 11-01 14:07 「개인방도 마찬가지야」)
    const nOn = notifyOn(notify.data, r.id, !!r.with), nImg = r.with ? "" : notifyImage(notify.data, r.id);
    const crew = r.id === SUMMARY ? [] : ids.map((id) => { const x = list.find((y) => idOf(y.who, list) === id); return x?.name || x?.who || ""; }).filter(Boolean);
    return (
      <li className={`nm-rrow group/row relative${r.with ? "" : " grp"}${r.id === "all" ? " meet" : ""}`} data-rc={rc ? "" : undefined} style={rc ? ({ "--rc": rc } as CSSProperties) : undefined} onContextMenu={(e) => { e.preventDefault(); clearTimeout(press.current.t); clearTimeout(press.current.buzz); if (press.current.hit) return; if (press.current.touch) press.current.hit = true; setMenu(menu === r.id ? "" : r.id); }}   // 폰은 길게 누르면 이 신호도 옴 · 타이머가 연 메뉴를 되닫지 않게(형 10-31 「드득 거리면서 휙 꺼져」) · 손 뗄 때 오는 클릭 삼키기(hit)는 터치만 = PC 오른쪽 클릭엔 뒤따르는 클릭이 없어 메뉴 첫 누름이 먹히던 것(빠르 11-01 15:5x)
        onPointerDown={(e) => { press.current.touch = e.pointerType === "touch"; if (e.pointerType !== "touch") return; clearTimeout(press.current.t); press.current = { x: e.clientX, y: e.clientY, hit: false, touch: true, t: window.setTimeout(() => { press.current.hit = true; press.current.buzz = window.setTimeout(() => navigator.vibrate?.(8), 220); setMenu(r.id); }, 480) }; }}   // 진동 1회(형 11-01 22:41 「오래 누르면 진동이 2회 오거든! 1회만」) = 폰이 길게 누르기를 알아채면 제 진동 + contextmenu 를 줌 → 그 신호가 220ms 안에 오면 내 진동은 거둠 · 안 오는 폰만 내 진동
        onPointerMove={(e) => { if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 8) clearTimeout(press.current.t); }}
        onPointerUp={() => clearTimeout(press.current.t)} onPointerCancel={() => clearTimeout(press.current.t)}
        onClickCapture={(e) => { if (press.current.hit) { press.current.hit = false; e.preventDefault(); e.stopPropagation(); } }}>
        {wrapTemp(r, <>
        <Link to={r.id === "all" ? "/group/$channelId" : "/channels/$channelId"} params={{ channelId: r.id }} onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) { enterRoom(r.id); onOpen?.(); } }}   // 회의실 = #/group/all(첫 화면 "/" = 홈)
          className={`flex items-center gap-3 px-3 ${tall ? "py-3" : "py-2"} hover:bg-duet-tile ${on ? "bg-duet-tile" : ""}`}>
          {r.with ? <span className="nm-rorb" style={{ margin: -Math.round(size / 8), marginRight: 4 - Math.round(size / 8) }}>   {/* 이름 4px 오른쪽(형 11-01 「이름을 조금만 우측으로 … 테두리가 두터워지면 좁아보여서」) */}
            <MicOrb size={Math.round(size * 1.25)} id={idOf(r.with, list)} tint={ringOf(p)} /></span>
            : !r.with ? <RoomIcon r={r} size={size} color={rc} />   /* 단톡 = 방 아이콘 하나(형 11-05 13:19 「이거 2개씩 보이게하지말구」 · 「구분이 안되넹 다른거랑」 · 「좀 튀어야됨..」 · 「항상위에잇을거니까;」) · 얼굴 둘 겹침(pair) 뺌 */
            : <span aria-hidden className="nm-rempty" style={{ width: size, height: size }} />}   {/* 형 10-31 「비어질때는 저 공간이 빈 테두리만」 */}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <b className={`${p?.mark ? "shrink-0" : "min-w-[1.2em] shrink truncate"} text-[15px] ${u ? "font-bold" : "font-semibold"}`} style={live(r) && sig ? ({ "--sig": sig } as CSSProperties) : undefined}>{live(r) ? <LiveShine text={p?.name || r.name} trunc sig /> : p?.name || r.name}</b>   {/* 이름 뒤 표지 = 한 글자 이름도 같은 간격(최소 폭이 틈을 벌렸음 · 형 10-31 「시아 모루 빠르 는 좀 너무 이모지가 붙어잇음.. ㅋㅋ」) */}
              {p?.mark ? <span aria-hidden className="nm-rmark shrink-0">{p.mark}</span> : null}
              {slim ? null : p?.role ? <span data-content className="min-w-0 shrink-[99] truncate rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{p.role}</span> : !r.with && crew.length ? <span aria-label={`${crew.length}명`} className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{crew.length}</span> : null}
              {pinned(r.id) && r.id !== "all" && r.id !== SUMMARY ? <span aria-label="고정함" className="text-[11px]">📌</span> : null}
            </span>
            <span className="flex items-center gap-2 pr-6">   {/* ⋯ 자리 = 둘째 줄 · 첫 줄은 제목이 끝까지 */}
              <span data-content className={`block min-w-0 flex-1 truncate text-xs ${u ? "text-foreground" : "text-muted-foreground"}`}>{r.id === "all" && !ids.length ? "사용자가 없습니다" : preview}</span>
            </span>
          </span>
          <span className="nm-rside">   {/* 시각 = 오른쪽 위 · 안 읽은 수 = 그 아래(형 10-31 「저게 시간 아래로 가게 해줘」) */}
            <span className="flex items-center gap-1 text-[11px] tabular-nums text-muted-foreground">{notify.data && nOn ? <svg aria-label="알림 켬" className="nm-rbell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg> : null}{listTime(r.last_ts)}</span>   {/* 알림 켠 방 = 시각 앞 작은 종(형 11-04 08:09 「이거 켬으로 하면 목록에서 우측에 종모양이 나오면 될거같아 작게 적정한 공간에」) */}
            {n > 0 ? <b aria-label={`안 읽은 글 ${n}개`} className="nm-rcount">{n > 99 ? "99+" : n}</b>
              : n < 0 ? <span aria-label="안 읽음" className="nm-rdot" /> : null}
          </span>
        </Link>
        <button type="button" aria-label={`${p?.name || r.name} 줄 메뉴`} aria-expanded={menu === r.id} className={`nm-rmore absolute bottom-1 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 ${menu === r.id ? "" : "md:opacity-0 md:group-hover/row:opacity-100 md:focus-visible:opacity-100"}`} onClick={() => setMenu(menu === r.id ? "" : r.id)}>⋯</button>
        </>)}
        {menu === r.id ? (
          <div role="menu" className="absolute right-2 top-full z-10 flex min-w-36 flex-col rounded-xl border border-border bg-popover p-1 text-sm shadow-lg">
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(PINS, pins, setPins, r.id)}>{pins.has(r.id) ? "고정 풀기" : "고정"}</button> : null}
            <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void markRead(r, u)}>{u ? "읽음으로" : "안 읽음으로"}</button>
            {!r.with ? <button type="button" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setTinting(r); }}><RainbowOrb />표지 색</button> : null}
            {!r.with && !r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setNaming(r); }}>이름 바꾸기</button> : null}
            {r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setEditing(r); }}>수정</button> : null}
            {r.id !== "all" && (r.designated || r.temp) ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); if (r.temp) setEditing(r); else setMembering(r); }}>멤버 넣고 빼기</button> : null}   {/* 형 11-05 「톡 목록에서 설정하게 일원화」 */}
            {canGone(r) ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left text-destructive hover:bg-foreground/5" onClick={() => { setMenu(""); setGone(r); }}>방 없애기</button> : null}
            {r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left text-destructive hover:bg-foreground/5" onClick={() => { setMenu(""); setDeleting(r); }}>삭제</button> : null}
            {notify.data ? <button type="button" role="menuitemcheckbox" aria-checked={nOn} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void setNotify({ room: r.id, on: !nOn })}>알림<span className="text-xs text-muted-foreground">{nOn ? "켬" : "끔"}</span></button> : null}   {/* 지금 상태 = 오른쪽 켬/끔 · 누르면 바뀜 */}
            {notify.data && !r.with ? <button type="button" role="menuitem" className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setPicking(r.id); pick.current?.click(); }}>알림 그림{nImg ? <img src={nImg} alt="" className="size-5 rounded" /> : null}</button> : null}
            {notify.data && nImg ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void setNotify({ room: r.id, image: "" })}>알림 그림 지우기</button> : null}
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(HIDE, hidden, setHidden, r.id)}>{hidden.has(r.id) ? "보이기" : "숨기기"}</button> : null}
          </div>
        ) : null}
      </li>
    );
  };

  if (teamsOn) return (   // 팀즈 모드 = 목록 자리에 팀즈 대화(./teams.tsx · 형 11-06 「팀즈 를 누르면 팀즈모드로 전환되는 느낌이랄까」)
    <nav aria-label="팀즈 대화 목록" className="nm-yeta nm-rooms flex flex-col">
      <TeamsSwitch />
      <TeamsList current={current} />
    </nav>
  );
  return (
    <nav aria-label="대화 목록" className="nm-yeta nm-rooms flex flex-col">
      {slim ? null : <TeamsSwitch />}
      {tinting ? <RoomColorPick room={tinting} onPeek={(hex) => setPeek({ id: tinting.id, hex })} onClose={() => { setTinting(null); setPeek(null); }} /> : null}
      {naming ? <RoomNamePick room={naming} onClose={() => setNaming(null)} /> : null}
      {pendPic ? <NotifyPicPick name={(rooms.data || []).find((x) => x.id === pendPic.room)?.name || pendPic.room} url={pendPic.url} onClose={() => setPendPic(null)}
        save={() => office<Partial<NotifyState>>("notify", { method: "POST", body: JSON.stringify({ room: pendPic.room, image: pendPic.url }) }).then((j) => qc.setQueryData(["nomute", "notify"], notifyState(j)))} /> : null}
      {editing ? <TempRoomDialog edit={editing} onClose={() => setEditing(null)} /> : null}
      {membering ? <RoomMembersDialog r={membering} onClose={() => setMembering(null)} /> : null}
      {gone ? <RoomGoneDialog r={gone} onClose={() => setGone(null)} onGone={() => { if (current === gone.id) void nav({ to: "/group/$channelId", params: { channelId: "all" } }); }} /> : null}
      {deleting ? <TempDeleteDialog r={deleting} onClose={() => setDeleting(null)} onGone={() => { if (current === deleting.id) void nav({ to: "/group/$channelId", params: { channelId: "all" } }); }} /> : null}
      <div className="nm-rtop">   {/* 맨 위 줄 = 공지(끝 둥글게 · 조금 짧게) + 오른쪽 기사 요약 동그라미(형 11-04 13:22 「요약실 우상단 우상단으로 보내주라 공지 라인 끝을 좀만 둘여서 동그랗게 처리하고 다시 원으로 저거 픽토그램」 · 앞 판 13:01 = 회의실 위 왼쪽) */}
        {notice?.text ? (
          <button type="button" className="nm-rnotice" aria-label="공지 보기·고치기" onClick={() => setNoticeOpen(true)}>
            <svg aria-hidden viewBox="0 0 24 24" width="16" height="16"><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" /></svg>
            <span data-content className="min-w-0 flex-1 truncate"><b>공지</b> · {notice.text.split("\n")[0].replace(/^공지\s*[—·:-]\s*/, "")}</span>
          </button>
        ) : null}
        <Link to="/channels/$channelId" params={{ channelId: SUMMARY }} className={`nm-rnews${current === SUMMARY ? " on" : ""}`} aria-label="기사 요약" title="기사 요약" onClick={() => onOpen?.()}>
          <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18h-5" /><path d="M18 14h-8" /><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2" /><rect width="8" height="4" x="10" y="6" rx="1" /></svg>
        </Link>
      </div>
      {noticeOpen ? <NoticeDialog onClose={() => setNoticeOpen(false)} /> : null}
      <ul className="nm-rgroup flex flex-col">
        {ordered.map((r) => <Fragment key={r.id}>{Row({ r })}</Fragment>)}
      </ul>
      {rooms.isError ? <p className="px-3 py-2 text-sm text-destructive" role="alert">방 목록을 못 받았어. 새로 고쳐 줘.</p> : null}
      {roomReadState.error() ? <p className="px-3 py-2 text-sm text-destructive" role="alert">{roomReadState.error()}</p> : null}
      {notifyErr ? <p className="px-3 py-2 text-sm text-destructive" role="alert">{notifyErr}</p> : null}
      <input ref={pick} type="file" accept="image/*" hidden onChange={(e) => void onPick(e.target.files?.[0])} />
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

/** 알림 그림 = 고른 그림을 먼저 보여 주고 「저장」 게이지 → ✓(형 11-01 14:12 「저장 눌러도 반응이 없다보니까 적용이 되엇는지 내가 안누른지를 몰라」 · 뎅 GoButton) · 못 올리면 단추가 「못 보냄」 */
function NotifyPicPick({ name, url, save, onClose }: { name: string; url: string; save: () => Promise<unknown>; onClose: () => void }) {
  const g = useCloseGuard(true, onClose);   // 고른 그림 = 아직 저장 전 → 닫으려 하면 「저장하시겠습니까?」(형 11-07 10:59) · Esc 도 이 길
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" {...backdrop(g.request)}>
      <div className="nrc" role="dialog" aria-label={`${name} 알림 그림`} onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><b>알림 그림</b></div>
        <img src={url} alt="" className="nm-npic" />
        <div className="nrc-acts">
          <button type="button" className="nrc-x" onClick={g.request}>닫기</button>
          <GoButton className="nrc-x" go={save} done={onClose} busy="저장 중">저장</GoButton>
        </div>
      </div>
      {g.ask ? <SaveAsk onKeep={() => g.setAsk(false)} onDiscard={onClose} onSave={() => { g.setAsk(false); void save().then(onClose).catch(() => {}); }} /> : null}
    </div>,
    document.body,
  );
}
