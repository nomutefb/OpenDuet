// 대화 목록 — PC 왼쪽 늘 열림(형 10-28 09:48 「그록.컴 처럼 대화창 목록이 처음에 들어가자마자 딱 나와야해」 · 10:17 「좌측이 좀 더 좁아져도」) · 폰 = 아래 네비 「목록」 칸이 여는 서랍(10:22)
//   차례(형 10-31 「대화 목록창에 최신 메세지 도착한 순으로 떠야되고」 · 「그 거보다 우선 기준은 고정핀 순」 · 앞 판 = 안 읽은 방 맨 위) = 고정한 방(회의실 = 늘 고정·맨 위 · 이 기기) → 나머지(최신 글 순) → 숨긴 방(접힘)
//   같은 차례를 PC 얼굴 띠(ui/shell.tsx)가 씀 = useRoomOrder
//   안 읽은 수 = 서버 rooms[].unread(형 기준 · 짝 표) · 그 칸이 아직 없으면 점(seen < last_ts)
//   방 줄 = 얼굴 · 이름 · 꼬리표 · 마지막 글(러너 깸 줄 뺌 · 서버 last_talk) · 시각 · 줄 메뉴(⋯ · 오른쪽 클릭) = 고정/풀기 · 안 읽음으로/읽음으로 · 알림 켬/끔 · (단톡) 알림 그림 · 숨기기/보이기
import { buzz } from "./feel";   // 진동 = 설정 스위치 하나로(./feel.ts)
import { SrvNote } from "./srv-note";
import { isPairRoom } from "./pair-fold";
import { useRoomArtSrc } from "./room-art";
import { useRoomPhoto } from "./room-photo";
import { ProfileCard } from "./profile-card";   // 1:1 줄 프사 누름 = 그 상대 프로필(형 11-14 05:49 「대화창 목록에서도 프사 쪽을 누르면 프로필이 떠야됨 대화쪽 누르면 대화로 진입하고」)   // 목록 방 사진 누름 = 바로 바꾸기(형 11-13 06:54)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { backdrop } from "./backdrop";   // 바탕 닫힘 = 누름·뗌 둘 다 바탕(형 11-07 10:52)
import { Link, useNavigate } from "@tanstack/react-router";
import { type CSSProperties, Fragment, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CloseAsk, useCloseGuard } from "./save-ask";   // 쓰던 중 닫기 = 한 문장 확인(#-042 · 형 11-15 07:55)
import { DialogX } from "./dialog-x";   // 창 X 하나(#-042 하네스)
import { createPortal } from "react-dom";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, idOf, office, people, roomAgentIds, roomHeadCount, roomLeftSet, hyungLeft } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { FaceImg } from "./faces";
import { LiveShine } from "./live-shine";
import { RoomMembersDialog, TempRoomDialog, TempSwipe, canGone, tempLeft } from "./temp-room";
import { MorphAsk } from "./morph-ask";   // 방 없애기 · 삭제 = 그 자리 재확인(모달 0 · 형 11-16 03:0x)
import { dropRoomAway } from "./room-drop";   // 예 = 바로 목록에서 빼고 뒤에서
import { RoomLookDialog } from "./room-look";   // 단톡 개요 「방 꾸미기」 = 방 안 메뉴와 같은 창
import { whoName } from "./who-name";
import { listWhen } from "./when";
import { NoticeDialog } from "./notice-edit";
import { pinTint, usePinAlpha } from "./pin-tint";
import { TeamsList, TeamsSwitch, setOfficeMode, setTeamsMode, useOfficeMode, useTeamsMode } from "./teams";
import { PhoneMeet } from "./phone-meet";   // 폰 「회의」 탭 = 열린 회의 이어 받기 + 뜸 화상회의 칸 그대로(형 11-13 22:05 · 22:14)
import { RoomGlyph } from "./room-glyph";
import { RainbowOrb, RoomColorPick, RoomNamePick } from "./room-color";
import { GroupRoomDialog, groupRuleRoom } from "./group-room";   // 회의실 · 고정 단톡방 방 설정(형 11-14 17:20 「다ㄴ톡방 모두 통일해주라」 · 번개)
import { GoButton } from "./go-button";
import { type NotifyState, notifyImage, notifyOn, notifyState } from "../data/notify";

export const EVERYTHING_LINE = "필요한 이들이 드나드는 방";
const NOTICE_SEEN = "nm_notice_seen_at";
const PINS = "nm-office-pins", HIDE = "nm-office-hidden";
const TRAIN_ROOM = "dm-chaeng";   // 기차봇 1:1(서버 _conf 방 dm-chaeng · 이름 「기차봇」)
const PIN_ORDER = "nm-office-pin-order";   // 고정 방끼리 끌어 바꾼 차례(이 기기 · 형 11-14 23:28 「고정된 애들끼리는 방을 끌어서 위에 배치하면 명단 순서를 고정 배치 할 수 있도록 해줘」 · 깃 #-016 덧 · 뜸)
const readArr = (k: string): string[] => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v.map(String) : []; } catch { return []; } };
const readSet = (k: string): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch { return new Set(); } };
const writeSet = (k: string, s: Set<string>) => { try { localStorage.setItem(k, JSON.stringify([...s])); } catch { /* 이 기기에만 · 못 쓰면 이번만 */ } };


import { enterRoom, roomReadState } from "../data/read-state";
import { roomMsgsOptions } from "./office-chat";   // 대화 미리 받기(방 화면과 같은 받기 꼴 · 윈터 11-07 15:50)
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
  const first = (text || "").split("\n")[0];
  const file = first.match(/^파일: (.+?) → /);
  if (file) return /\.(png|jpe?g|webp|gif|heic)$/i.test(file[1]) ? "사진" : `파일 · ${file[1]}`;
  // 여러 줄 글 = 줄바꿈을 넘어 한 줄로 이어 붙임 · 칸이 모자라면 목록 칸(truncate)이 「…」로 끝냄(형 11-13 02:48 봄 1:1 「말이 뒤에 긴데 대화목록에는 잘려서 나오는 경우가 있어. 이어지다가 ...로 끝나야랄듯」 · 앞 판 = 첫 줄만 → 「응.」 한 마디로 보임)
  const line = (text || "").split("\n").map((x) => x.trim()).filter(Boolean).join(" ");
  return line.replace(/^(?:[!@]\S+\s+)+/, "").replace(/\*\*|__|`/g, "").replace(/\s{2,}/g, " ").trim();
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
  const seen = useQuery({ queryKey: ["nomute", "seen"], queryFn: () => office<{ seen: Record<string, { ts: number; at?: number }> }>("seen").then((j) => j.seen || {}), staleTime: 15_000 }).data || {};
  const [pins, setPins] = useState(() => readSet(PINS)), [hidden, setHidden] = useState(() => readSet(HIDE));
  const [pinOrder, setPinOrder] = useState(() => readArr(PIN_ORDER));
  const savePinOrder = (ids: string[]) => { setPinOrder(ids); try { localStorage.setItem(PIN_ORDER, JSON.stringify(ids)); } catch { /* 이번만 */ } };
  const all = ((rooms.data || []) as Room[]).filter((r) => r.id !== "notice" && r.with !== "형" && !isPairRoom(r.id));   // 둘의 방(「봄 · 챙」) = 목록 · 띠에 따로 안 세움 · 1:1 안에서 보임(형 11-13 08:29 「둘 대화로 귀속」 · ./pair-fold.ts)
  const lastOf = (r: Room) => (r.last_talk !== undefined ? r.last_talk : r.last);
  const count = (r: Room) => {
    const l = lastOf(r);
    const serverCount = typeof r.unread === "number" ? r.unread : l && l.kind !== "human" && (seen[r.id]?.ts || 0) < (r.last_ts || 0) ? -1 : 0;
    return roomReadState.count(r.id, r.last_ts, serverCount);
  };
  // 늘 맨 위 = 지금 PM 과의 1:1 → 기차봇 1:1(형 11-14 22:42 dm-gik 「글,구 pm은 항상 채팅창 인앱이나 모바일 상단에 고정~ 기차봇도~」 · 「회의실 처럼~」 · 「오히려 회의실이 고정일 필요없ㄷ음~」 · 깃 #-010 · 뜸)
  //   PM = 명부 pm 칸(서버 office/pm.json · 바뀌면 따라감) · 회의실 = 이제 다른 방처럼 새 글 순(고정하려면 줄 메뉴 「고정」)
  const pmRoom = (() => { const w = list.find((p) => p.pm)?.who; return w ? all.find((r) => r.with === w)?.id || "" : ""; })();
  const fixed = (id: string) => (!!pmRoom && id === pmRoom) || id === TRAIN_ROOM;
  const pinned = (id: string) => fixed(id) || id === SUMMARY || pins.has(id);
  // 차례 = 마지막 대화 · 형이 마지막으로 읽은 때(서버 seen.at) 중 늦은 것 — 폰 목록 · PC 띠 한 벌(형 11-12 10:01 「가장 위에는 내가 가장 최근에 읽은 애가 있어야함」 · 16:17 「하자」 = 폰도 · 앞 판 = 폰 목록은 마지막 대화만 · 띠만 읽은 때 · 뎅)
  const keyOf = (r: Room) => Math.max(r.last_ts || 0, seen[r.id]?.at || 0);
  const recent = (a: Room, b: Room) => keyOf(b) - keyOf(a);
  const shown = all.filter((r) => !hidden.has(r.id));
  const head = (id: string) => (id === pmRoom ? 0 : id === TRAIN_ROOM ? 1 : id === SUMMARY ? 2 : 3);   // PM 1:1 → 기차봇 1:1 → 요약실 → 고정 방(최근 순) · 앞 판 = 회의실 → 요약실
  const rank = (id: string) => { const i = pinOrder.indexOf(id); return i < 0 ? 1e6 + head(id) : i; };   // 끌어 둔 차례 먼저 · 아직 안 끈 고정 방 = 앞 판 차례(PM → 작업 알림 → 고정 · 최근 순)
  const pin = shown.filter((r) => pinned(r.id)).sort((a, b) => rank(a.id) - rank(b.id) || head(a.id) - head(b.id) || recent(a, b));
  // 고정 밖 = 안 읽은 방 먼저(그 안에선 새 글 시각순) → 읽은 방(앞 판 그대로 · 마지막 대화 · 읽은 때 중 늦은 순)(형 11-16 09:17 dm-bom 「채팅 올라오면 위로 새로 올라온게 안읽은게 떠야되는데 새 채팅이 더 위로 올라와서 안읽은게 묻힌다 안읽은게 시간순으로 더 위러 가야함 우선순위정렬이」 · 봄 옮김 · 뎅) · 숫자 · 점 셈 = count 그대로
  const unread = (r: Room) => count(r) !== 0;
  const rest = shown.filter((r) => !pinned(r.id)).sort((a, b) => Number(unread(b)) - Number(unread(a)) || (unread(a) ? (b.last_ts || 0) - (a.last_ts || 0) : recent(a, b)));
  const hid = all.filter((r) => hidden.has(r.id)).sort(recent);
  return { rooms, list, ordered: [...pin, ...rest].filter((r) => r.id !== REPAIR && r.id !== "memo" && r.id !== SUMMARY && r.id !== TRAIN_ROOM)   /* 작업 알림(기차봇 1:1) = 목록에서 숨김 · 완료는 PM 방 접힌 카드 + 리모콘(형 11-14 23:34 「작업 알림은 대화방으로 취급 안하고」 · 깃 #-019) */, hid, count, lastOf, pinned, fixed, pmRoom, pins, setPins, hidden, setHidden, savePinOrder };
}

/** 방 아이콘 = 둥근 네모(사람 = 동그라미라 한눈에 갈림) · 그림 /office/room-<방 id>.webp(뜸 그림 · 있으면 먼저) · 없으면 방 표지 색 바탕 + 방 이름의 이모지(밥상 🍚) 또는 첫 글자 */
export function RoomIcon({ r, size, color }: { r: Room; size: number; color?: string }) {
  const [noPic, setNoPic] = useState(false), src = useRoomArtSrc(r.id);   // 형이 올린 방 사진 먼저 · 없으면 서버가 정적 그림으로(./room-art.ts · 형 11-11 12:49)
  useEffect(() => setNoPic(false), [src]);   // 새로 올리면 다시 그림
  const emo = /\p{Extended_Pictographic}/u.exec(r.name)?.[0], ch = emo || [...r.name.replace(/\s+/g, "")][0] || "#";
  if (!r.with && (noPic || r.look?.icon)) return <RoomGlyph id={r.id} look={r.look} size={size} />;   // 단톡방 = 픽토그램 선만(형 11-06 20:15 · 그림 올린 방은 그림 · 형이 아이콘 고르면 아이콘)
  return (
    <span className="nm-ricon" style={{ width: size, height: size, ...(color ? { background: color } : {}) } as CSSProperties} aria-hidden>
      {noPic ? <span className={emo ? "emo" : "ch"} style={{ fontSize: Math.round(size * (emo ? 0.56 : 0.44)) }}>{ch}</span>
        : <img src={src} alt="" onError={() => setNoPic(true)} />}
    </span>
  );
}
/** 1:1 줄 얼굴 누르기 = 방에 안 들어가고 그 상대 프로필 카드(이 앱엔 친구 목록이 따로 없어서 · 형 11-14 05:49) · 이름 · 마지막 글 쪽 = 지금처럼 대화로 */
function PeerFaceTap({ who, name, list, children }: { who: string; name: string; list: Parameters<typeof ProfileCard>[0]["list"]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const go = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); setOpen(true); };
  return (
    <span role="button" tabIndex={0} aria-label={`${name} 프로필`} className="nm-rface" onClick={go} onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go(e); }}>
      {children}
      {open ? createPortal(<span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}><ProfileCard who={who} list={list} onClose={() => setOpen(false)} /></span>, document.body) : null}
    </span>
  );
}
/** 방 목록 단톡 머리 그림 누르기 = 방에 안 들어가고 그 단톡 개요(이름 · 종류 · 목적 · 멤버) + 설정 단추 — 사진 바꾸기는 그 안 단추
 *  (형 11-14 11:52 봄 옮김 「단체톡 이미지 누르면 바로 사진 고르기가 떠서 어색해 단체톡 설정이나 개요 내용이 떠야 맞지않나」 · 앞 판 = 누르면 바로 사진 고르기 · 형 11-13 06:54)
 *  꼴 = 1:1 줄 얼굴 누름 프로필 카드(./profile-card.tsx)와 같은 유리 카드 · 단추 = 방 안 이름 목록(./room-menu.tsx)과 같은 창을 그대로 띄움 · 서버 손 0 */
function RoomPhotoTap({ r, children }: { r: Room; children: React.ReactNode }) {
  const photo = useRoomPhoto(r);
  const [view, setView] = useState<"" | "info" | "crew" | "look" | "temp" | "group">("");
  const go = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); setView("info"); };
  const stop = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
  const close = () => setView("");
  return (
    <span role="button" tabIndex={0} aria-label={`${r.name} 방 개요`} className="nm-rphoto" onClick={go} onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go(e); }}>
      {children}{photo.sheet}
      {view ? createPortal(<span onClick={stop}>
        {view === "info" ? <RoomInfo r={r} onClose={close} onPhoto={() => { close(); photo.pick(); }} onView={setView} /> : null}
        {view === "crew" ? <RoomMembersDialog r={r} onClose={close} /> : null}
        {view === "look" ? <RoomLookDialog r={r} onClose={close} /> : null}
        {view === "temp" ? <TempRoomDialog edit={r} onClose={close} /> : null}
        {view === "group" ? <GroupRoomDialog room={r} onClose={close} /> : null}
      </span>, document.body) : null}
    </span>
  );
}
function RoomInfo({ r, onClose, onPhoto, onView }: { r: Room; onClose: () => void; onPhoto: () => void; onView: (v: "crew" | "look" | "temp" | "group") => void }) {
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const nav = useNavigate();
  const gone = roomLeftSet(r), crew = roomHeadCount(r, list);   // 남은 사람만(형 11-18 20:12 dm-gik 「나 포함 남은 사람만 세야해」) · 숫자 = 방 머리 · 목록과 같은 셈 · 「!종료」로 나간 이 · 나간 형은 이름에서도 뺌
  const names = [...(hyungLeft(r) ? [] : ["형"]), ...(r.members || []).filter((w) => !gone.has(w)).map((w) => list.find((x) => x.who === w)?.name || whoName(w)).filter(Boolean)];
  const kind = r.id === "all" ? "회의실" : r.temp ? `임시방${r.exp ? " · " + tempLeft(r.exp) : ""}` : r.designated ? "지정방" : "단톡방";
  const crewOk = r.id !== "all" && !!r.designated && !r.temp;   // 멤버 설정 = 방 안 메뉴와 같은 조건(./room-menu.tsx crewItems)
  return (
    <div className="ypc-veil nm-yeta" role="presentation" {...backdrop(onClose)}>
      <div className="ypc nm-rinfo" role="dialog" aria-label={`${r.name} 개요`} onClick={(e) => e.stopPropagation()}>
        <div className="ypc-ava nm-rinfo-ava"><RoomIcon r={r} size={104} /></div>
        <span className="ycd-nm">{r.name}</span>
        <span className="ycd-tag">{kind}</span>
        {r.purpose ? <p className="ypp-desc">{r.purpose}</p> : null}
        {crew ? <p className="nm-rinfo-crew"><b>사람 {crew}</b> · {names.join(" · ")}</p> : null}
        <div className="ypc-acts nm-rinfo-acts">
          <button type="button" className="ypc-go" onClick={() => { onClose(); enterRoom(r.id); void nav({ to: r.id === "all" ? "/group/$channelId" : "/channels/$channelId", params: { channelId: r.id } }); }}>대화 열기</button>
          <button type="button" className="ypc-x" onClick={onPhoto}>사진 바꾸기</button>
          {crewOk ? <button type="button" className="ypc-x" onClick={() => onView("crew")}>멤버 설정</button> : null}
          <button type="button" className="ypc-x" onClick={() => onView("look")}>방 꾸미기</button>
          {r.temp ? <button type="button" className="ypc-x" onClick={() => onView("temp")}>방 설정</button> : groupRuleRoom(r) ? <button type="button" className="ypc-x" onClick={() => onView("group")}>방 설정</button> : null}
        </div>
      </div>
    </div>
  );
}
export function RoomList({ onOpen, big = false, slim = false, bar = false, current }: { onOpen?: () => void; big?: boolean; slim?: boolean; bar?: boolean; current?: string }) {   // bar = PC 반갈 대화 칸(맨 위 한 줄 아이콘 · 형 11-12 06:21 · 07:5x)   // slim = PC 왼쪽 좁은 칸(꼬리표 뺌 · 이름·표시·시각만)
  const { rooms, list, ordered, hid, count, lastOf, pinned, fixed, pins, setPins, hidden, setHidden, savePinOrder } = useRoomOrder();
  const pinA = usePinAlpha();
  // 고정 줄 끌기 = 왼쪽 라임 줄(.nm-rgrip)을 잡고 위아래로 · 놓은 자리 = 고정 방 사이 차례(PIN_ORDER) · 폰 · 마우스 같은 손 · 줄 밀기 · 길게 누르기와 안 겹침(잡는 칸이 따로)
  const drag = useRef<{ id: string; y0: number; el: HTMLElement } | null>(null);
  const startDrag = (id: string) => (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault(); e.stopPropagation();
    const el = e.currentTarget.closest("li") as HTMLElement | null; if (!el) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 그대로 */ }
    drag.current = { id, y0: e.clientY, el }; el.classList.add("nm-rdrag");
  };
  const moveDrag = (e: React.PointerEvent<HTMLSpanElement>) => { const d = drag.current; if (d) d.el.style.transform = `translateY(${e.clientY - d.y0}px)`; };
  const endDrag = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current; if (!d) return; drag.current = null;
    d.el.style.transform = ""; d.el.classList.remove("nm-rdrag");
    if (Math.abs(e.clientY - d.y0) < 6) return;   // 거의 안 움직임 = 차례 그대로
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".nm-rgroup li[data-pinid]")), ids = rows.map((x) => x.dataset.pinid || "");
    let to = ids.length;
    for (let i = 0; i < rows.length; i++) { const b = rows[i].getBoundingClientRect(); if (e.clientY < b.top + b.height / 2) { to = i; break; } }
    const from = ids.indexOf(d.id), next = ids.filter((x) => x !== d.id);
    next.splice(Math.max(0, Math.min(to > from ? to - 1 : to, next.length)), 0, d.id);
    savePinOrder(next);
  };
  const teamsOn = useTeamsMode() && !slim;   // 「사무실 | 팀즈」 바꿈(PC 왼쪽 좁은 칸 = 사무실 그대로)
  const meetOn = useOfficeMode() === "meet" && !slim && !bar;   // 폰 「회의」 = 목록 자리에 화상회의(PC 반갈 = 위 탭 줄 「화상회의」가 그 자리 · 형 11-13 22:05)
  // 활발한 방 = 이름에 빛(형 11-01 「현재 활발한 방(누군가라도 활동중인 방개인포함)은 이름에 빚지나가게」) — 마지막 글이 3분 안 · 또는 1:1 에서 형 글 뒤 그 이가 일하는 중(대화 칸 점 셋과 같은 깸 표 · 같은 bots 캐시)
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: { who: string; state: string; why?: string }[] }>("bots").then((j) => j.bots || []), staleTime: 15_000, refetchInterval: 60_000 }).data || [];
  const live = (r: Room) => { const l = lastOf(r); return Date.now() - (r.act_ts || r.last_ts || 0) < LIVE_MS ||   /* act_ts = 1:1 방 우리끼리 글까지 든 진짜 마지막(미리보기는 형 낀 글 · 서버 #1990) */ (!!r.with && l?.kind === "human" && bots.some((b) => b.who === r.with && b.state === "awake" && b.why !== "read")); };
  const notice = useQuery({ queryKey: ["nomute", "notice"], queryFn: () => office<{ notice?: { text: string; at?: string } }>("noticeset").then((j) => j.notice), staleTime: 60_000 }).data;
  const [menu, setMenu] = useState(""), [noticeOpen, setNoticeOpen] = useState(false), [hiddenOpen, setHiddenOpen] = useState(false);
  const [nSeen, setNSeen] = useState(() => { try { return localStorage.getItem(NOTICE_SEEN) || ""; } catch { return ""; } });   // PC 공지 아이콘 점 = 이 기기에서 본 공지 판과 다르면
  const [tinting, setTinting] = useState<Room | null>(null), [peek, setPeek] = useState<{ id: string; hex: string } | null>(null);   // 표지 색 판(./room-color.tsx) · peek = 끄는 동안 줄에 먼저 보임
  const [naming, setNaming] = useState<Room | null>(null);   // 방 이름(./room-color.tsx) · 임시방 = 「수정」 길
  const [grouping, setGrouping] = useState<Room | null>(null);   // 회의실 · 고정 단톡방 「방 설정」(./group-room.tsx)
  const press = useRef<{ t: number; x: number; y: number; hit: boolean; touch?: boolean; buzz?: number }>({ t: 0, x: 0, y: 0, hit: false });   // 길게 누르기(형 10-31 「길게 누르면 변경 하는 거기서 수정」) = 터치만 · 오른쪽 클릭은 onContextMenu
  useEffect(() => {   // 줄 메뉴 = 밖을 누르면 닫힘(형 10-31 「다른거 클릭하면 없어져야 되는데 안없어진더」)
    if (!menu) return undefined;
    const close = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.('[role="menu"], .nm-rmore')) setMenu(""); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);
  // 방 알림(./data/notify.ts · 서버 = 봄) — 서버 답이 없으면(아직 안 올라감 · 못 받음) 메뉴에 알림 칸을 안 보인다(누르면 깨지는 단추 0)
  const qc = useQueryClient(), notify = useQuery({ queryKey: ["nomute", "notify"], queryFn: () => office<Partial<NotifyState>>("notify").then(notifyState), staleTime: 60_000, retry: false });
  // 대화 미리 받기(형 「치면 바로 올라가기」 · 윈터 15:50 짚음) = 위 네 방은 목록이 뜨고 1.5초 뒤 하나씩 · 줄에 손 올림(PC)·누름(폰)·초점 = 그 방 · 30초 안에 받은 방은 안 읽음(staleTime) → 방에 들어가면 글이 이미 있음
  const pre = (id: string) => { if (id) void qc.prefetchQuery(roomMsgsOptions(qc, id)); };
  const top = ordered.slice(0, 4).map((r) => r.id).join(",");
  useEffect(() => {
    if (!top) return undefined;
    const ts: number[] = [];
    ts.push(window.setTimeout(() => top.split(",").forEach((id, k) => ts.push(window.setTimeout(() => pre(id), k * 400))), 1500));
    return () => ts.forEach((t) => clearTimeout(t));
  }, [top]);   // eslint-disable-line react-hooks/exhaustive-deps
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
  const nav = useNavigate(), [swiped, setSwiped] = useState(""), [editing, setEditing] = useState<Room | null>(null), [askDel, setAskDel] = useState(""), [membering, setMembering] = useState<Room | null>(null);   // 임시방 줄 왼쪽 끌기 = 수정·삭제 · 단톡방 = 설정·🗑️(형 11-05)

  const toggle = (k: string, s: Set<string>, set: (s: Set<string>) => void, id: string) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); writeSet(k, n); set(n); setMenu(""); };
  const markRead = async (r: Room, read: boolean) => {
    setMenu("");
    try { await (read ? roomReadState.read(r.id, r.last_ts, true) : roomReadState.unread(r.id, r.last_ts)); } catch { /* 표는 되돌리고 아래 오류를 보인다. */ }
  };

  useEffect(() => { if (!menu) setAskDel(""); }, [menu]);   // 메뉴가 닫히면 「묻는 꼴로 열기」 표시도 지움(다음에 ⋯ 로 열 땐 보통 꼴)
  const dropRow = (r: Room) => { setMenu(""); setAskDel(""); if (current === r.id) void nav({ to: "/group/$channelId", params: { channelId: "all" } }); dropRoomAway(qc, r); };   // 보던 방을 없앴으면 회의실로(앞 판과 같음)
  const wrapTemp = (r: Room, row: ReactNode) => (r.temp ? <TempSwipe open={swiped === r.id} onOpen={() => setSwiped(r.id)} onClose={() => setSwiped("")} onEdit={() => { setSwiped(""); setEditing(r); }} onDelete={() => { setSwiped(""); setAskDel(r.id); setMenu(r.id); }}>{row}</TempSwipe>
    // 다른 방 = 왼쪽으로 밀면 설정 칸 하나(형 11-02 02:20 「여기 톡방 좌측으로 밀면 설정 버튼이 뜨게 해줘 그 액션은 예타 리포지토리에 있어」 · 예타 yLrBind 끌기 · 누르면 길게 누르기·⋯ 와 같은 줄 메뉴)
    // 단톡방 = 설정 옆 🗑️(형 11-05 「좌측으로 하면 휴지통 모양 하나 나와서 정말 없애겠냐고 뜨고」 · 못 없애는 방 = canGone)
    : <TempSwipe open={swiped === r.id} onOpen={() => setSwiped(r.id)} onClose={() => setSwiped("")} width={canGone(r) ? 128 : 64} acts={[{ key: "set", cls: "set", aria: "설정", label: <DuetIcon name="settings" size={20} />, on: () => { setSwiped(""); setMenu(r.id); } }, ...(canGone(r) ? [{ key: "del", cls: "del", aria: "방 없애기", label: <DuetIcon name="trash" size={20} />, on: () => { setSwiped(""); setAskDel(r.id); setMenu(r.id); } }] : [])]}>{row}</TempSwipe>);
  const Row = ({ r }: { r: Room }) => {
    const l = lastOf(r), ids = roomAgentIds(r, list), p = r.with ? list.find((x) => x.who === r.with) : undefined;
    const preview = l ? previewLine(l.text || "") : r.id === "all" ? EVERYTHING_LINE : "아직 글 없음";   // 단톡 미리보기 = 글만(형 11-01 14:06 「대화만 나오면 되 문자열만 누가 나오는지 안보여도 됨」 · 옛 「깃:」 머리 뺌)
    const n = count(r), u = n !== 0, on = current === r.id, tall = big, size = big ? 44 : 36;
    // 단톡 = YETA 꼴(YETA-목록 · 운영자 260725 「단톡환경에서도 프로필이 겹치게」) · 얼굴 둘 겹침 · 마지막에 말한 이가 앞 · 인원 숫자만 · 누구인지 = 방 상단(형 10-31 「인원이 저기 누군지 나올 필욘 없는듯 들가면 확인할 수 잇으면 됨 방 상단에서」)
    const rc = r.with || r.id === "all" ? "" : peek?.id === r.id ? peek.hex : r.color || "";   // 회의실 = 방 색 강조 뺌(형 11-14 23:05 dm-gik 「회의실은 이제 강조 빼」 · 깃 #-013 · 뜸)
    const isPin = pinned(r.id) && r.id !== SUMMARY;
    const pinBg = isPin ? pinTint(r.with ? list.find((x) => x.who === r.with)?.bubble : "", pinA) : "";   // 고정 줄 = 고유색 진하기 바탕 · 단체방 · 색 없음 = 라임(형 11-14 23:39 · ./pin-tint · 앞 판 = 왼쪽 라임 줄 · PM 20% 는 이걸로 갈음)
    const sig = r.with ? ringOf(p) || "" : rc;   // 활발한 방 이름 빛 바탕 = 그 사람 테 색 · 단톡 = 방 표지 색 · 없으면 노뮤트 연두(live-shine.css .sig · 형 11-01 14:07 「개인방도 마찬가지야」)
    const nOn = notifyOn(notify.data, r.id, !!r.with), nImg = r.with ? "" : notifyImage(notify.data, r.id);
    return (
      <li data-pinid={pinned(r.id) && r.id !== SUMMARY ? r.id : undefined} className={`nm-rrow group/row relative${r.with ? "" : " grp"}${pinned(r.id) && r.id !== SUMMARY ? " pinned" : ""}`} data-rc={rc ? "" : undefined} style={rc || pinBg ? ({ ...(rc ? { "--rc": rc } : {}), ...(pinBg ? { background: pinBg } : {}) } as CSSProperties) : undefined} onContextMenu={(e) => { e.preventDefault(); clearTimeout(press.current.t); clearTimeout(press.current.buzz); if (press.current.hit) return; if (press.current.touch) press.current.hit = true; setMenu(menu === r.id ? "" : r.id); }}   // 폰은 길게 누르면 이 신호도 옴 · 타이머가 연 메뉴를 되닫지 않게(형 10-31 「드득 거리면서 휙 꺼져」) · 손 뗄 때 오는 클릭 삼키기(hit)는 터치만 = PC 오른쪽 클릭엔 뒤따르는 클릭이 없어 메뉴 첫 누름이 먹히던 것(빠르 11-01 15:5x)
        onPointerDown={(e) => { press.current.touch = e.pointerType === "touch"; if (e.pointerType !== "touch") return; clearTimeout(press.current.t); press.current = { x: e.clientX, y: e.clientY, hit: false, touch: true, t: window.setTimeout(() => { press.current.hit = true; press.current.buzz = window.setTimeout(() => buzz(8), 220); setMenu(r.id); }, 480) }; }}   // 진동 1회(형 11-01 22:41 「오래 누르면 진동이 2회 오거든! 1회만」) = 폰이 길게 누르기를 알아채면 제 진동 + contextmenu 를 줌 → 그 신호가 220ms 안에 오면 내 진동은 거둠 · 안 오는 폰만 내 진동
        onPointerMove={(e) => { if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 8) clearTimeout(press.current.t); }}
        onPointerUp={() => clearTimeout(press.current.t)} onPointerCancel={() => clearTimeout(press.current.t)}
        onClickCapture={(e) => { if (press.current.hit) { press.current.hit = false; e.preventDefault(); e.stopPropagation(); } }}>
        {wrapTemp(r, <>
        {pinned(r.id) && r.id !== SUMMARY ? <span className="nm-rgrip" role="button" aria-label={`${p?.name || r.name} 끌어서 차례 바꾸기`} onPointerDown={startDrag(r.id)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} /> : null}
        <Link to={r.id === "all" ? "/group/$channelId" : "/channels/$channelId"} params={{ channelId: r.id }} onPointerEnter={() => pre(r.id)} onPointerDown={() => pre(r.id)} onFocus={() => pre(r.id)} onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) { enterRoom(r.id); onOpen?.(); } }}   // 회의실 = #/group/all(첫 화면 "/" = 홈)
          className={`flex items-center gap-3 px-3 ${tall ? "py-3" : "py-2"} hover:bg-duet-tile ${on ? "bg-duet-tile" : ""}`}>
          {r.with && !p?.nocard ? <PeerFaceTap who={r.with} name={p?.name || r.name} list={list}><span className="nm-rorb" style={{ margin: -Math.round(size / 8), marginRight: 4 - Math.round(size / 8) }}>   {/* 이름 4px 오른쪽(형 11-01 「이름을 조금만 우측으로 … 테두리가 두터워지면 좁아보여서」) */}
            <MicOrb size={Math.round(size * 1.25)} id={idOf(r.with, list)} tint={ringOf(p)} /></span></PeerFaceTap>
            : !r.with ? <RoomPhotoTap r={r}><RoomIcon r={r} size={size} color={rc} /></RoomPhotoTap>   /* 단톡 = 방 아이콘 하나(형 11-05 13:19 「이거 2개씩 보이게하지말구」 · 「구분이 안되넹 다른거랑」 · 「좀 튀어야됨..」 · 「항상위에잇을거니까;」) · 얼굴 둘 겹침(pair) 뺌 */
            : p?.nocard ? null   /* 알림 자리(nocard · 작업 알림) = 동그라미 없이 이름 · 글만(형 11-14 23:30 dm-gik 「사무실 토큰 없이 써도 되는애들 … 그런애들은 대화방 목록에서 보일때. 프로필 동그라미 없이 나오게 해줘」 · 깃 #-016 덧 · 뜸) */
            : <span aria-hidden className="nm-rempty" style={{ width: size, height: size }} />}   {/* 형 10-31 「비어질때는 저 공간이 빈 테두리만」 */}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <b className={`${p?.mark ? "shrink-0" : "min-w-[1.2em] shrink truncate"} text-[15px] ${u ? "font-bold" : "font-semibold"}`} style={live(r) && sig ? ({ "--sig": sig } as CSSProperties) : undefined}>{live(r) ? <LiveShine text={p?.name || r.name} trunc sig /> : p?.name || r.name}</b>   {/* 이름 뒤 표지 = 한 글자 이름도 같은 간격(최소 폭이 틈을 벌렸음 · 형 10-31 「시아 모루 빠르 는 좀 너무 이모지가 붙어잇음.. ㅋㅋ」) */}
              {p?.mark ? <span aria-hidden className="nm-rmark shrink-0">{p.mark}</span> : null}
              {slim ? null : p?.role ? <span data-content className="min-w-0 shrink-[99] truncate rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{p.role}</span> : !r.with && roomHeadCount(r, list) ? <span aria-label={`${roomHeadCount(r, list)}명(형 포함)`} className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{roomHeadCount(r, list)}</span> : null}
              {null /* 고정 표시 = 줄 왼쪽 라임 세로줄로 갈음 · 압정 그림 뺌(형 11-14 23:07 dm-gik 「그리고 고정을 하면 좌측에 일자 라인 저거 라임색으로 들어가는거로 대체하고 고정 핀 보이는거는 뺄게.」) */}   {/* 고정 표시 = PC 띠와 한 벌 압정 그림(./pin-mark.tsx · 봄 11-12 16:17 A) */}
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
            {!fixed(r.id) ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(PINS, pins, setPins, r.id)}>{pins.has(r.id) ? "고정 풀기" : "고정"}</button> : null}
            <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void markRead(r, u)}>{u ? "읽음으로" : "안 읽음으로"}</button>
            {!r.with ? <button type="button" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setTinting(r); }}><RainbowOrb />표지 색</button> : null}
            {!r.with && !r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); if (groupRuleRoom(r)) setGrouping(r); else setNaming(r); }}>{groupRuleRoom(r) ? "방 설정" : "이름 바꾸기"}</button> : null}
            {r.temp ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setEditing(r); }}>수정</button> : null}
            {r.id !== "all" && (r.designated || r.temp) ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); if (r.temp) setEditing(r); else setMembering(r); }}>멤버 넣고 빼기</button> : null}   {/* 형 11-05 「톡 목록에서 설정하게 일원화」 */}
            {/* 방 없애기 · 삭제 = 그 줄이 [아니오][예]로 바뀜(모달 0) · 예 = 메뉴 바로 닫고 목록에서 먼저 뺌 · 서버는 뒤에서(./room-drop · 형 11-16 03:0x 「모달로 안뜨게하구 … 바로 부드럽게 닫히고 백단에서 처리하게」) · 줄을 밀어 휴지통 = 이 메뉴가 묻는 꼴로 열림 */}
            {canGone(r) ? <MorphAsk role="menuitem" startAsk={askDel === r.id} className="rounded-lg px-3 py-2 text-left text-destructive hover:bg-foreground/5" boxClass="px-3 py-2" yesText="없애기" note="목록 · 부름에서 빠져 · 글은 서버에 남아" onYes={() => dropRow(r)}>방 없애기</MorphAsk> : null}
            {r.temp ? <MorphAsk role="menuitem" startAsk={askDel === r.id} className="rounded-lg px-3 py-2 text-left text-destructive hover:bg-foreground/5" boxClass="px-3 py-2" yesText="지우기" note="글이 모두 지워져 · 되돌릴 수 없어" onYes={() => dropRow(r)}>삭제</MorphAsk> : null}
            {notify.data ? <button type="button" role="menuitemcheckbox" aria-checked={nOn} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void setNotify({ room: r.id, on: !nOn })}>알림<span className="text-xs text-muted-foreground">{nOn ? "켬" : "끔"}</span></button> : null}   {/* 지금 상태 = 오른쪽 켬/끔 · 누르면 바뀜 */}
            {notify.data && !r.with ? <button type="button" role="menuitem" className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => { setMenu(""); setPicking(r.id); pick.current?.click(); }}>알림 그림{nImg ? <img src={nImg} alt="" className="size-5 rounded" /> : null}</button> : null}
            {notify.data && nImg ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => void setNotify({ room: r.id, image: "" })}>알림 그림 지우기</button> : null}
            {r.id !== "all" ? <button type="button" role="menuitem" className="rounded-lg px-3 py-2 text-left hover:bg-foreground/5" onClick={() => toggle(HIDE, hidden, setHidden, r.id)}>{hidden.has(r.id) ? "보이기" : "숨기기"}</button> : null}
          </div>
        ) : null}
      </li>
    );
  };

  const noticeNew = !!notice?.at && notice.at !== nSeen;
  const openNotice = () => { setNoticeOpen(true); if (notice?.at) { try { localStorage.setItem(NOTICE_SEEN, notice.at); } catch { /* 이 화면만 */ } setNSeen(notice.at); } };
  const ico = { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  // PC 대화 칸 맨 위 한 줄(형 11-12 06:21 「팀즈는 전환아이콘으로 대체해서 좀 더 넓게쓰면될듯. 공지도 그냥 아이콘으로 하면 될거같애」 · 07:5x 「응 저거 맞아. 맨 위에만 색이 좀 다르면 될듯. 아무래도 메뉴 영역이니까 아주 조금?」 · 봄 07:19 · 깃) — 폰 꼴(알약 둘)은 그대로
  const topBar = bar ? (
    <div className="nm-rbar">
      <b>{teamsOn ? "팀즈" : "대화"}</b>
      <button type="button" className="nm-rbar-b" aria-label={teamsOn ? "대화방으로 바꾸기" : "팀즈로 바꾸기"} title={teamsOn ? "지금 팀즈 · 누르면 대화방" : "지금 대화방 · 누르면 팀즈"} onClick={() => setTeamsMode(!teamsOn)}>{teamsOn ? <b className="t">T</b> : <svg {...ico}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>}</button>
    </div>
  ) : null;

  if (meetOn) return (   // 폰 「회의」 = PC 에서 연 그 회의를 이어 봄(같이 보는 화면 · 사람 줄 · 회의 대화 = ./cobrowse-pane meet · 뜸 부품 · 다리 터치 = 깃 11-13 23:45)
    <nav aria-label="화상회의" className="nm-yeta nm-rooms nm-rooms-meet flex flex-col">
      <TeamsSwitch />
      <div className="nm-pmeet"><PhoneMeet onClose={() => setOfficeMode("office")} /></div>
    </nav>
  );
  if (teamsOn) return (   // 팀즈 모드 = 목록 자리에 팀즈 대화(./teams.tsx · 형 11-06 「팀즈 를 누르면 팀즈모드로 전환되는 느낌이랄까」)
    <nav aria-label="팀즈 대화 목록" className="nm-yeta nm-rooms flex flex-col">
      {topBar || <TeamsSwitch />}
      {noticeOpen ? <NoticeDialog onClose={() => setNoticeOpen(false)} /> : null}
      <TeamsList current={current} />
    </nav>
  );
  return (
    <nav aria-label="대화 목록" className="nm-yeta nm-rooms flex flex-col">
      {topBar || (slim ? null : <TeamsSwitch />)}
      {tinting ? <RoomColorPick room={tinting} onPeek={(hex) => setPeek({ id: tinting.id, hex })} onClose={() => { setTinting(null); setPeek(null); }} /> : null}
      {naming ? <RoomNamePick room={naming} onClose={() => setNaming(null)} /> : null}
      {grouping ? <GroupRoomDialog room={grouping} onClose={() => setGrouping(null)} /> : null}
      {pendPic ? <NotifyPicPick name={(rooms.data || []).find((x) => x.id === pendPic.room)?.name || pendPic.room} url={pendPic.url} onClose={() => setPendPic(null)}
        save={() => office<Partial<NotifyState>>("notify", { method: "POST", body: JSON.stringify({ room: pendPic.room, image: pendPic.url }) }).then((j) => qc.setQueryData(["nomute", "notify"], notifyState(j)))} /> : null}
      {editing ? <TempRoomDialog edit={editing} onClose={() => setEditing(null)} /> : null}
      {membering ? <RoomMembersDialog r={membering} onClose={() => setMembering(null)} /> : null}
      {/* 목록 머리 공지 띠 · 기사 요약(신문) 동그라미 뺌 = 그 자리를 목록 줄로(형 11-14 23:27 dm-gik 「깃 대화목록 우상단에 신문 버튼 누르면 윈터얼굴에 예전 메뉴나와 저거 삭제해주라 그리구 공지 저거 설정에서 지정해도 이제 될거같아. … 설정 안으로 옮겨줘. 그리고 그 만큼 여백 확보해서 대화 목록 라인으로 활용해」 · 깃 #-016 · 뜸) · 공지 보기 · 고치기 = 설정 「공지 설정」(같은 noticeset 길) · 봇 깸 공지(read room=notice) = 서버 그대로 */}
      {noticeOpen ? <NoticeDialog onClose={() => setNoticeOpen(false)} /> : null}
      <ul className="nm-rgroup flex flex-col">
        {ordered.map((r) => <Fragment key={r.id}>{Row({ r })}</Fragment>)}
      </ul>
      {rooms.isError ? <SrvNote what="방 목록" className="tight" /> : null}
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
        <DialogX onClose={g.request} />
        <div className="nrc-head"><b>알림 그림</b></div>
        <img src={url} alt="" className="nm-npic" />
        <div className="nrc-acts">
          <GoButton className="nrc-x" go={save} done={onClose} away={onClose} what="저장" busy="저장 중">저장</GoButton>
        </div>
      </div>
      {g.ask ? <CloseAsk onKeep={() => g.setAsk(false)} onClose={onClose} /> : null}
    </div>,
    document.body,
  );
}
