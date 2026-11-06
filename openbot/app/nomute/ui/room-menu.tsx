// 방 안 햄버거 메뉴(형 11-01 08:46 「그 우측이 햄버거 모양 메뉴 픽토그램까지 두자」 · 「메뉴 열리면 거기에 톡방 길게 눌럿을때 나오는 메뉴들이 포함되면 될거같아」
//   「방 설정 같은 것들. 대화방 프로필 설정 · 대화방 알림 · 대화방 질문 이력 · 파일 기록」)
//   = 방 목록 줄 메뉴(./room-list.tsx)의 방 설정 칸을 방 안에서 · 표지 색·이름 = ./room-color.tsx 판 그대로 · 알림 = 봄 서버(../data/notify.ts) 같은 열쇠
//   질문 이력 = 봄 서버 GET decisions?room=&all=1(못 받으면 칸 안 보임) · 파일 기록 = 이 기기 방 글(최근 300 + 지금 받은 판)의 첨부 · 사진은 폰 사본 7일(../data/file-cache.ts)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeMsg, type OfficeRoom, office, people } from "../data/office";
import { loadRoom } from "../data/room-cache";
import { cachedFile, fileUrl, filesHeld, pruneFiles } from "../data/file-cache";
import { type NotifyState, notifyOn, notifyState } from "../data/notify";
import { setUnfold, useUnfold } from "./unfold";
import { RainbowOrb, RoomColorPick, RoomNamePick } from "./room-color";
import { RoomMembersDialog, TempRoomDialog } from "./temp-room";   // 방 멤버 = 방 안 메뉴에서도(형 11-05 09:37 봄 1:1 「톡방 지금 인원을 내가 톡방 설정에서 배분하고 내보내고 그걸 맘대로 하고 싶거든?」)
import { whoName } from "./who-name";
import { RoomLookDialog } from "./room-look";

export function RoomHeadMenu({ room, right }: { room: string; right: number }) {
  const qc = useQueryClient(), btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false), [tinting, setTinting] = useState<OfficeRoom | null>(null), [naming, setNaming] = useState<OfficeRoom | null>(null), [err, setErr] = useState("");
  const notify = useQuery({ queryKey: ["nomute", "notify"], queryFn: () => office<Partial<NotifyState>>("notify").then(notifyState), staleTime: 60_000, retry: false });
  const [hist, setHist] = useState(false), [files, setFiles] = useState(false), [kick, setKick] = useState(false), [crew, setCrew] = useState(false), [look, setLook] = useState(false);
  const asks = useQuery({ queryKey: ["nomute", "decisions-hist", room], queryFn: () => office<{ ok?: boolean; items?: Ask[] }>(`decisions?room=${encodeURIComponent(room)}&all=1`).then((j) => (Array.isArray(j.items) ? j.items : null)), enabled: open || hist, staleTime: 30_000, retry: false });   // 질문 이력(봄 서버 ?room=&all=1 · 형 고른 것 choice 칸째) · 못 받으면 칸 안 보임
  const bell = useQuery({ queryKey: ["nomute", "bell6", room], queryFn: () => office<{ on?: boolean; n?: number; cnt?: number }>(`bell6?room=${encodeURIComponent(room)}`).then((j) => (typeof j.on === "boolean" ? j : null)), enabled: open, staleTime: 15_000, retry: false });   // 6마디 종(봄 서버 #2005 · 단톡방만 · 못 받으면 칸 안 보임)
  const setBell = async (on: boolean) => {
    setOpen(false); setErr("");
    try { const j = await office<{ on?: boolean }>("bell6", { method: "POST", body: JSON.stringify({ room, on }) }); qc.setQueryData(["nomute", "bell6", room], { ...(bell.data || {}), on: typeof j.on === "boolean" ? j.on : on }); }
    catch (e) { setErr(`종을 못 바꿨어 · ${(e as Error).message}`); }
  };
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
  const nOn = notifyOn(notify.data, room, !!r?.with), unfold = useUnfold(room);
  const b = btn.current?.getBoundingClientRect();
  return (
    <>
      <button ref={btn} type="button" className="nm-room-menu" style={{ right }} aria-label="방 메뉴" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}><DuetIcon name="menu" size={20} /></button>
      {open && r ? (
        <div role="menu" aria-label={`${r.name} 메뉴`} className="nm-room-menu-list" style={{ right: right + 4, top: (b ? b.bottom : 44) + 4 }}>
          {r.temp ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setCrew(true); }}>방 설정<small>이름 · 목적 · 멤버 · 기한</small></button> : null}
          {!r.with ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setLook(true); }}>방 꾸미기<small>아이콘 · 색</small></button> : null}   {/* 단톡방·회의실 다(형 11-06 20:00 「단톡방은 내가 아이콘도 고를수잇으면」 · 20:33 「회의실도 가능해야해.」) */}   {/* 임시방 = 한 창에서 다(형 11-06 10:37 「그 방설정이 이 안에서 되야할듯. 방설정이 한 모달안에 보이면좋겠네」 · 창은 원래 있었고 「멤버 넣고 빼기」 이름에 숨어 있었음) */}
          {!r.with ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setTinting(r); }}><span className="flex items-center gap-2"><RainbowOrb />대화방 프로필 · 표지 색</span></button> : null}
          {!r.with && !r.temp ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setNaming(r); }}>대화방 이름 바꾸기</button> : null}
          {!r.with && r.id !== MEET && r.designated && !r.temp ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setCrew(true); }}>멤버 넣고 빼기<small>{r.members?.length || ""}</small></button> : null}   {/* 지정방 = roomset(형만) · 임시방 = 수정 창(멤버 칸) · 회의실 = 아래 「잠시 내보내기」 · 1:1 = 없음 */}
          {asks.data ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setHist(true); }}>대화방 질문 이력<small>{asks.data.length}</small></button> : null}
          <button type="button" role="menuitem" onClick={() => { setOpen(false); setFiles(true); }}>파일 기록</button>
          {r.id === MEET && (r.members?.length || 0) > 0 ? <button type="button" role="menuitem" onClick={() => { setOpen(false); setKick(true); }}>잠시 내보내기<small>{r.members!.length}</small></button> : null}   {/* 회의실만(형 11-02 11:56 「대화 내보내기 단톡에서 그거가 잇으면 좋겠음 회의실만.」 · 11:57 「우상단 메뉴 버튼에서 잠시 내보내기」) */}
          {bell.data ? <button type="button" role="menuitemcheckbox" aria-checked={!!bell.data.on} onClick={() => void setBell(!bell.data?.on)}>5마디 알림<small>{bell.data.on ? "켬" : "멈춤"}</small></button> : null}   {/* 마디 연장 알림(형 11-01 13:5x · 시아 13:54 D) · 이름 = 형 11-02 23:21 「그리고 톡방 6마디 알림 5마디 알림으로 변경해줘. 그리고 대화방 종이 그걸 의미하면 용어 통일해줘.」(셈 6 → 5 는 서버 bell6) */}
          {notify.data ? <button type="button" role="menuitemcheckbox" aria-checked={nOn} onClick={() => void setNotify(!nOn)}>대화방 알림<small>{nOn ? "켬" : "끔"}</small></button> : null}
          <button type="button" role="menuitemcheckbox" aria-checked={unfold} onClick={() => setUnfold(room, !unfold)}>긴 글 다 펼쳐 보기<small>{unfold ? "켬" : "끔"}</small></button>   {/* 켬 = 17줄 접기 풂(./unfold.ts · 형 11-04 08:08 · 기본 끔 = 접힘) */}
        </div>
      ) : null}
      {err ? <div role="alert" className="nm-room-menu-list" style={{ right: right + 4, top: (b ? b.bottom : 44) + 4 }} onClick={() => setErr("")}>{err}</div> : null}
      {tinting ? <RoomColorPick room={tinting} onPeek={() => {}} onClose={() => setTinting(null)} /> : null}
      {naming ? <RoomNamePick room={naming} onClose={() => setNaming(null)} /> : null}
      {files && r ? <FileLog room={room} name={r.name} onClose={() => setFiles(false)} /> : null}
      {hist && r ? <AskHistory name={r.name} items={asks.data || []} onClose={() => setHist(false)} /> : null}
      {kick && r ? <MeetOut room={r} onClose={() => setKick(false)} /> : null}
      {look && r ? <RoomLookDialog r={r} onClose={() => setLook(false)} /> : null}
      {crew && r ? (r.temp ? <TempRoomDialog edit={r} onClose={() => setCrew(false)} /> : <RoomMembersDialog r={r} onClose={() => setCrew(false)} />) : null}
    </>
  );
}

const MEET = "all";   // 회의실 방 id

/** 회의실 잠시 내보내기(형 11-02 11:56 「회의실에서 내가 쓸때마다 다깨서」 · 11:57 「복수 선택 가능하게. 그리고 자율적으로 다시 들어올수잇어 제약없이」)
 *  = 지금 들어와 있는 이를 여럿 골라(또는 모두) 내보냄 · 내보낸 이는 다시 쓰거나 불리면 그냥 들어옴 · 서버 길 = 봄(형 자리만) */
function MeetOut({ room, onClose }: { room: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const members = room.members || [];
  const [pick, setPick] = useState<Set<string>>(() => new Set()), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  const all = members.length > 0 && members.every((w) => pick.has(w));
  const flip = (w: string) => setPick((s) => { const n = new Set(s); if (n.has(w)) n.delete(w); else n.add(w); return n; });
  const go = async () => {
    if (!pick.size || busy) return;
    setBusy(true); setErr("");
    try {
      await office(MEET_OUT, { method: "POST", body: JSON.stringify({ who: all ? "all" : [...pick] }) });   // 봄 11:58 꼴 = {who: [...] | "all"} → {ok, out, members} · 멤버 표만 지움(글·기록 그대로 = 다시 들어와도 앞 대화 읽음)
      void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onClose();
    } catch (e) { setErr(`못 내보냈어 · ${(e as Error).message}`); setBusy(false); }
  };
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" onClick={onClose}>
      <div className="nrc" role="dialog" aria-label="회의실 잠시 내보내기" onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><b>잠시 내보내기</b><small>{pick.size ? `${pick.size}명` : ""}</small></div>
        <div className="nm-meet-out">
          <button type="button" className="row all" aria-pressed={all} onClick={() => setPick(all ? new Set() : new Set(members))}>모두</button>
          {members.map((w) => <button key={w} type="button" className="row" aria-pressed={pick.has(w)} onClick={() => flip(w)}>{list.find((p) => p.who === w)?.name || w}</button>)}
        </div>
        {err ? <p role="alert" className="nm-meet-err">{err}</p> : null}
        <div className="nrc-acts"><button type="button" className="nrc-x" onClick={onClose}>닫기</button><button type="button" className="nrc-ok" disabled={!pick.size || busy} onClick={() => void go()}>내보내기</button></div>
      </div>
    </div>,
    document.body,
  );
}
const MEET_OUT = "meet/kick";   // 봄 서버 길(형 자리만 · 봇·우리 열쇠 = 403)

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

type Got = { path: string; name: string; ts: number; who: string };
const IMG = /\.(png|jpe?g|webp|gif)$/i;
const bare = (p: string) => (p.split("/").pop() || p).replace(/^\d{8}_\d{4}_/, "");   // 「20261101_0902_」 머리 뗌

/** 파일 기록(형 11-01 08:46 「파일 기록은 대화 안에 잇는덜 폰 내부 캐시로 7일 보관」 · 10:4x 「7」) = 그 방 글에 붙은 첨부 · 새것부터 · 사진은 폰 사본 */
function FileLog({ room, name, onClose }: { room: string; name: string; onClose: () => void }) {
  const qc = useQueryClient(), [list, setList] = useState<Got[] | null>(null);
  useEffect(() => {
    const off = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", off);
    return () => window.removeEventListener("keydown", off);
  }, [onClose]);
  useEffect(() => {
    let live = true;
    void pruneFiles();
    void loadRoom<OfficeMsg>(room).then((page) => {
      const now = qc.getQueryData<{ messages: OfficeMsg[] }>(["nomute", "msgs", room])?.messages || [], seen = new Map<string, Got>();
      for (const m of [...(page?.messages || []), ...now]) for (const p of Array.isArray(m.files) ? m.files : []) if (typeof p === "string" && !seen.has(p)) seen.set(p, { path: p, name: bare(p), ts: m.ts, who: m.who });
      if (live) setList([...seen.values()].sort((a, b) => b.ts - a.ts));
    });
    return () => { live = false; };
  }, [room, qc]);
  const held = filesHeld();
  return createPortal(
    <div className="nrc-veil nm-yeta" role="presentation" onClick={onClose}>
      <div className="nrc" role="dialog" aria-label={`${name} 파일 기록`} onClick={(e) => e.stopPropagation()}>
        <div className="nrc-head"><b>파일 기록</b><small>{list ? `${list.length}개` : "찾는 중"} · 폰 사본 7일 · {Math.round(held.bytes / 1048576)}MB</small></div>
        {list && !list.length ? <p className="nm-file-empty">이 기기에 받아 둔 이 방 글(최근 300개)엔 파일이 없어.</p> : null}
        <ul className="nm-file-log">
          {(list || []).map((f) => <FileRow key={f.path} f={f} />)}
        </ul>
        <div className="nrc-acts"><button type="button" className="nrc-x" onClick={onClose}>닫기</button></div>
      </div>
    </div>,
    document.body,
  );
}

function FileRow({ f }: { f: Got }) {
  const img = IMG.test(f.path), [src, setSrc] = useState("");
  useEffect(() => {
    if (!img) return undefined;
    let url = "", live = true;
    void cachedFile(f.path).then((u) => { url = u; if (live) setSrc(u); });
    return () => { live = false; if (url.startsWith("blob:")) URL.revokeObjectURL(url); };
  }, [f.path, img]);
  const at = new Date(f.ts), two = (n: number) => String(n).padStart(2, "0"), when = `${two(at.getMonth() + 1)}-${two(at.getDate())} ${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  return (
    <li>
      <a href={src || fileUrl(f.path)} target="_blank" rel="noreferrer" className={img ? "pic" : "doc"}>
        {img ? (src ? <img src={src} alt={f.name} /> : <span className="ph" />) : <span className="nm">{f.name}</span>}
      </a>
      <small>{whoName(f.who)} · {when}</small>
    </li>
  );
}
