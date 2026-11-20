// 임시 단톡방 만들기·고치기(형 10-31 「내가 + 눌러서 임시 단톡방 만들수있게해주라. 시간 지나면 파기되고 자동으로」 · 「누구 초대할지 고를 수 있고. 목적 쓸수있게」)
//   서버 = functions/api/office/_temproom.js · 목록 위 + → 창 하나 · 만들면 그 방으로 들어감 · 줄을 왼쪽으로 끌면 수정·삭제(TempSwipe)
import { readFail, reading } from "./wait-text";   // 읽는 중 · 못 읽음 글 한 벌
import { resetRoomArt, useRoomArtSrc } from "./room-art";
import { useRoomPhoto } from "./room-photo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { backdrop } from "./backdrop";   // 바탕 닫힘 = 누름·뗌 둘 다 바탕(형 11-07 10:52)
import { livePicked, saveBlock } from "./picked";
import { draftDrop, draftGet, draftSet } from "./draft";   // 쓰던 글 보관(형 11-07 10:56 「휘발안되고」)
import { CloseAsk, useCloseGuard } from "./save-ask";   // 쓰던 중 닫기 = 「작성 중인 내용이 사라집니다. 창을 닫으시겠습니까?」(#-042 · 앞 판 「저장할까?」 형 11-07 10:56)
import { DialogX } from "./dialog-x";   // 창 X 하나(#-042 하네스)
import { useNavigate } from "@tanstack/react-router";
import { DaySlide } from "./day-slide";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { leftKo } from "./spawn-room";
import { type OfficePerson, type OfficeRoom, idOf, office, peopleSync, seatOff } from "../data/office";
import { savedRoomPart } from "./room-save";   // 저장 답 꼴 = {room, members}(모루 #2987)
import { FaceImg, usePeople } from "./faces";
import { GoButton } from "./go-button";
import { MorphAsk } from "./morph-ask";   // 재확인 = 그 자리 토글(형 11-16 「항상 그냥 re 토글로만」)
import { TASK_MAX, idleFor, idleKo, idleOpts, maxBlock, maxShow, maxStep, memberCand, setBody, stayNow, taskEndNote } from "./room-set-logic";
import "./temp-room.css";

// 묶음(형 10-31 「클로드 눌러서 선택 그록 눌러서 선택 지피티 눌러서 선택」) = 서버 clsOf 분류 · 명부에 없는 이 = 클로드 칸
const FAMS: { key: string; label: string; cls: string[] }[] = [{ key: "cl", label: "클로드", cls: ["클로드", ""] }, { key: "gk", label: "그록", cls: ["그록봇"] }, { key: "gp", label: "지피티", cls: ["닷", "부름"] }];

/** 남은 시간 한 마디(목록 줄 꼬리표 · 방 머리) — 1시간 안쪽은 분(./spawn-room.ts leftKo). */
export const tempLeft = leftKo;

const short = (n: string) => n.replace(" PM", "");

/** 방 맨 위 = 목적 · 남은 시간 · 목적을 받아 간 이(형 10-31 「목적을 듣고 온건지 확인 되어야하고」). */
/** 저장 답을 방 목록 캐시(["nomute","rooms"] = 방 배열)에 먼저 넣음 — 저장 뒤 바로 닫고 다시 읽기는 뒤에서 할 때, 그 사이 다시 연 창이 옛 명단으로 덮어쓰지 않게(모루 #2985 23:43 「B 빼고 저장 → 다시 열어 C 더함 → B 되살아남」) */
function patchRoom(qc: ReturnType<typeof useQueryClient>, id: string, part: Partial<OfficeRoom>) {
  qc.setQueryData<OfficeRoom[]>(["nomute", "rooms"], (old) => (Array.isArray(old) ? old.map((x) => (x.id === id ? { ...x, ...part } : x)) : old));
}

/** 남은 시간을 다시 세는 시계 — 두 시간 안쪽(분이 보임)일 때만 20초마다 · 숨은 탭 = 멈춤 · 그 밖 = 시계 0. */
function useLeftClock(exp?: number) {
  const [now, setNow] = useState(() => Date.now());
  const soon = !!exp && exp - now < 2 * 3600e3;
  useEffect(() => { if (!soon) return undefined; const id = window.setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 20_000); return () => window.clearInterval(id); }, [soon]);
  return now;
}

/** 그 자리 기한 고치기 — 유지 시간 막대(1시간 · 끌어서 1~7일 · 영구) 하나 · 고르면 0.6초 뒤 바로 저장(창 0 · 저장 단추 0)
 *  형 11-16 21:5x 구름 맥 창 「모달 최소화」 · 앞 = 남은 시간을 누르면 방 설정 창(모달)이 떴음. 서버 = 방 설정 창과 같은 길(POST temprooms/<id> {name, purpose, members, hours}) */
function TempLeftEdit({ r }: { r: OfficeRoom }) {
  const qc = useQueryClient(), [hours, setHours] = useState<number | null>(null), [why, setWhy] = useState(""), t = useRef(0);
  const pick = (h: number) => {
    setHours(h); setWhy(""); window.clearTimeout(t.current);
    t.current = window.setTimeout(async () => {   // 끄는 동안 칸마다 보내지 않게 = 마지막 고름 뒤 한 번만
      try {
        const j = await office<{ room?: Partial<OfficeRoom> & { id: string } }>(`temprooms/${encodeURIComponent(r.id)}`, { method: "POST", body: JSON.stringify({ name: r.name || "", purpose: r.purpose || "", members: r.members || [], hours: h }) });
        if (j?.room) patchRoom(qc, r.id, { exp: j.room.exp });
        void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      } catch (e) { setWhy(e instanceof Error ? e.message : "못 바꿨어"); }
    }, 600);
  };
  return <div className="nm-temp-edit"><DaySlide hours={hours} now={stayNow(r.exp, Date.now())} onChange={pick} />{why ? <p role="alert" className="nm-temp-why">못 바꿨어 — {why}</p> : null}</div>;
}

/** 방 이름 옆 남은 시간 표 — 늘 보임(방 머리 카드는 글이 쌓이면 위로 밀림) · 누르면 표 밑에 유지 시간 막대가 그 자리에서 열림(창 0 · 바깥 누름 · Esc = 닫힘). 기한 있는 임시방만. */
export function TempLeftChip({ r }: { r: OfficeRoom }) {
  const [edit, setEdit] = useState(false), now = useLeftClock(r.exp), box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!edit) return undefined;
    const out = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setEdit(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setEdit(false); };
    window.addEventListener("pointerdown", out, true); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("pointerdown", out, true); window.removeEventListener("keydown", key); };
  }, [edit]);
  if (!r.temp || !r.exp) return null;
  const left = tempLeft(r.exp, now);
  return (
    <span ref={box} className="nm-temp-wrap">
      <button type="button" className="nm-temp-chip" data-soon={r.exp - now < 10 * 60e3 ? "" : undefined} aria-expanded={edit} aria-label={`${left} · 기한 바꾸기`} onClick={() => setEdit((v) => !v)}>{left.replace(" 남음", "")}</button>
      {edit ? <span className="nm-temp-pop" role="group" aria-label="유지 시간"><TempLeftEdit r={r} /></span> : null}
    </span>
  );
}

export function TempRoomHead({ r }: { r: OfficeRoom }) {
  const members = r.members || [], heard = members.filter((n) => (r.heard || []).includes(n)), wait = members.filter((n) => !heard.includes(n));
  const [edit, setEdit] = useState(false), now = useLeftClock(r.exp), taskNow = useLeftClock(r.task_exp);
  const from = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 }).data?.find((x) => x.id === r.from), fromName = from ? short(from.with || from.name || "") : "";   // 방 화면이 이미 받는 방 목록과 같은 열쇠 · 같은 길(./office-chat.tsx roomsQ) = 받아오기 0 더 · 목록이 늦게 와도 따라 그림
  return (
    <div className="mb-2 rounded-2xl border border-border px-3 py-2 text-sm">
      {r.task ? <p className="nm-temp-task"><span>지금 일</span><b>{r.task}</b>{r.task_exp ? <i>{tempLeft(r.task_exp, taskNow)}</i> : null}</p> : null}   {/* 지금 일 한 줄 + 조용하면 비워질 때까지 남은 시간(형 11-17 00:49 「지금 일 저 부분을 따로 두던지 … 얼마나 … 방에 머물게 할건지도」 · 서버 칸 = 빠르 task · task_exp) */}
      {r.purpose ? <p className="whitespace-pre-wrap">{r.purpose}</p> : null}
      <p className={`${r.purpose ? "mt-1 " : ""}text-xs text-muted-foreground`}>
        {/* 남은 시간 = 누르면 그 밑에 유지 시간 막대(형 11-16 20:09 「당연히 옵션래서 변경 가능하고」 · 21:5x 「모달 최소화」) */}
        <button type="button" className="nm-temp-left font-semibold tabular-nums text-foreground underline-offset-2 hover:underline" aria-expanded={edit} aria-label={`${r.exp ? tempLeft(r.exp, now) : "영구"} · 기한 바꾸기`} onClick={() => setEdit((v) => !v)}>{r.exp ? tempLeft(r.exp, now) : "영구"}</button>
        {r.spawned && fromName ? ` · ${fromName} 1:1 에서 옮겨 옴` : ""} · 지침 받음 {heard.map(short).join("·") || "아직 없음"}{wait.length ? ` · 안 온 이 ${wait.map(short).join("·")}` : ""}
      </p>
      {edit ? <TempLeftEdit r={r} /> : null}   {/* 그 자리에서 열림(창 0 · 형 11-16 「모달 최소화」) */}
    </div>
  );
}

/** 방 설정 「방 사진」 — 형이 사진을 골라 바꿈 · 기본으로 = 뜸 그림(정적)으로 돌아감(형 11-11 12:49 「내가 따로 첨부로도 방 사진 변경할 수 있게해줘」 · 서버가 형 문만 받음) */
export function RoomArtRow({ id, look, line }: { id: string; look?: OfficeRoom["look"]; line?: boolean }) {
  const src = useRoomArtSrc(id), [busy, setBusy] = useState(false), [note, setNote] = useState("");
  const [noPic, setNoPic] = useState(false);   // 올린 사진도 정적 그림도 없음 = 깨진 그림(엑박) 대신 빈 칸(형 11-13 06:54 「사진 설정 초기에 엑박이 떠있어」)
  useEffect(() => setNoPic(false), [src]);
  const photo = useRoomPhoto({ id, look });   // 사진 고르기 = 원형 틀 + 격자 자르기 판(./room-photo.tsx · 형 06:54 첨부3)
  const run = async (f: () => Promise<void>, ok: string) => { setBusy(true); setNote(""); try { await f(); setNote(ok); } catch (e) { setNote((e as Error).message); } finally { setBusy(false); } };
  if (line) return (   // 방 설정 창 = 다른 줄과 같은 꼴(왼쪽 • 이름 기둥 · 오른쪽 값 한 선 · 형 11-17 01:44 「각 라인 정렬해서 좀만 보기 좋게 이미지 에디터 같은거 참고하면 될듯」 · 본 = 옛 에디터 thumb.html .csec + .rsz-opts .ropt)
    <div className="nm-rs-row" role="group" aria-label="방 사진">
      <span className="lbl nm-rs-nm">방 사진</span>
      <span className="opts">
        <span className="one"><button type="button" disabled={busy} onClick={photo.pick}>사진 고르기</button></span>
        <span className="one"><i aria-hidden>|</i><button type="button" disabled={busy} onClick={() => void run(() => resetRoomArt(id), "기본 그림으로")}>기본으로</button></span>
        {noPic ? <span aria-label="방 사진 없음" className="nm-rs-thumb none" /> : <img src={src} alt="방 사진" onError={() => setNoPic(true)} className="nm-rs-thumb" />}
      </span>
      {note ? <small className="nm-rs-note" role="status">{note}</small> : null}
      {photo.sheet}
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      {noPic ? <span aria-label="방 사진 없음" className="h-14 w-14 rounded-2xl border border-dashed border-border" /> : <img src={src} alt="방 사진" onError={() => setNoPic(true)} className="h-14 w-14 rounded-2xl border border-border object-cover" />}
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">방 사진</span>
        <span className="flex gap-1.5">
          <button type="button" className="nm-pick" disabled={busy} onClick={photo.pick}>사진 고르기</button>
          <button type="button" className="nm-pick" disabled={busy} onClick={() => void run(() => resetRoomArt(id), "기본 그림으로")}>기본으로</button>
        </span>
        {note ? <small className="text-muted-foreground" role="status">{note}</small> : null}
      </div>
      {photo.sheet}
    </div>
  );
}

/** 임시 단톡방 만들기 · 「방 설정」 — 고치기(edit)는 방에 딸린 설정을 이 창 하나에 모음: 사진 · 이름 · 지침 · 지금 일 · 머무는 시간 · 멤버(넣기 · 빼기 · 최대 인원 · 모두 내보내기) · 기한
 *  (형 11-17 00:47 「멤버 인원 이랑 내보내기가 아래에 따로잇는데 방 설정에 통합」 · 「메뉴가 분산되어잇능거 생각해서 좀 모아좌」) · kickAll = 「모두 내보내기」(방 메뉴가 넘겨 줌 · 형만) */
export function TempRoomDialog({ edit, onClose, open = true, kickAll }: { edit?: OfficeRoom; onClose: () => void; open?: boolean; kickAll?: () => void }) {
  const qc = useQueryClient(), nav = useNavigate();
  const candRaw = useQuery({ queryKey: ["nomute", "temprooms"], queryFn: () => office<{ candidates: string[] }>("temprooms").then((j) => j.candidates || []), staleTime: 60_000 }).data || [];
  const list = usePeople(), who = (n: string) => list.find((p) => p.who === n);
  const cand = memberCand(candRaw, edit?.members || []).filter((n) => !seatOff(who(n)));   // 후보 + 지금 멤버(후보에 없는 멤버도 칩으로 · 저장할 때 말없이 안 빠지게 · ./room-set-logic.ts)   // 빈 자리 1 · 2 · 3(명부 empty · 작업 알림 포함) = 초대 칸 0(형 11-14 23:40 dm-gik 「그리구 llm 아니면 사무실 키 빼버려서 지금 클라우드세션이 쓰는거 포함 자리 1 2 3 은 모두 여기 목록에 안보여야 함」 · 깃 #-016 덧 · 뜸)
  const dk = `room-${edit?.id || "new"}`, base = { name: edit?.name || "", purpose: edit?.purpose || "", picked: edit?.members || [] };
  const [d0] = useState(() => edit ? draftGet<typeof base>(dk) || base : base);   // 새 방은 매번 빈 판, 기존 방 설정만 초안 복원
  const [name, setName] = useState(d0.name), [purpose, setPurpose] = useState(d0.purpose), [pickedRaw, setPicked] = useState<string[]>(d0.picked);
  const picked = livePicked(pickedRaw, candRaw.length ? cand : [], (n) => !!who(n)?.gone);   // 옛 초안에 남은 없어진 봇(별) = 그릴 때마다 뺌 · 서버 후보(별 없음)가 오면 그걸로 · 명부가 늦게 와도 놓치지 않게(모루 #2861 · #2864 검토 · 빠르 11-08)
  const set0 = { max: edit?.max && edit.max > 0 ? edit.max : 0, task: edit?.task || "", idle: edit?.idle_min && edit.idle_min > 0 ? edit.idle_min : 0 };   // 저장된 값(고치기만) · idle 0 = 꺼짐
  const [max, setMax] = useState(set0.max), [task, setTaskRaw] = useState(set0.task), [idle, setIdle] = useState(set0.idle);
  const setTask = (v: string) => { setTaskRaw(v); setIdle((m) => idleFor(v, m)); };   // 일을 적기 시작하면 꺼져 있던 머무는 시간 = 서버 기본(3시간)으로 보임
  const dirty = name !== base.name || purpose !== base.purpose || picked.join("|") !== base.picked.join("|") || max !== set0.max || task.trim() !== set0.task || idle !== set0.idle;
  useEffect(() => { if (edit && dirty) draftSet(dk, { name, purpose, picked }); else draftDrop(dk); }, [dk, !!edit, dirty, name, purpose, picked]);
  const [hours, setHours] = useState<number | null>(edit ? null : 24), [fam, setFam] = useState("cl");   // 고치기 = 안 누르면 기한 그대로
  const [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
  const famOf = (p?: OfficePerson) => p?.shelf || (p?.root === "claude" ? "클로드" : p?.cls) || "";   // 묶음 = 명부 shelf → 머리(root claude = 클로드 칸) → cls(형 11-18 18:34 「윈터 초대는 왜없어 또?」 · 윈터 = cls 「닷」(옛 지피티 자리)이라 지피티 탭에 숨어 있었음 · 머리는 claude)
  const namesOf = (cls: string[]) => cand.filter((n) => cls.includes(famOf(who(n))));   // 묶음 = 명부 shelf 가 먼저(구름 = cls 는 「닷」이지만 shelf 「클로드」 → 클로드 칸 · 깃 df3d402b · 형 11-17 00:46 「구름이 낄꺼면 여기도 끼게」)
  const shown = namesOf(FAMS.find((f) => f.key === fam)?.cls || []);
  const allOn = shown.length > 0 && shown.every((n) => picked.includes(n));
  const toggleAll = () => setPicked(allOn ? picked.filter((n) => !shown.includes(n)) : [...new Set([...picked, ...shown])]);
  const over = maxBlock(picked.length, max), ready = !saveBlock(purpose, picked, busy) && !over;
  type Reply = { room: { id: string } & Partial<OfficeRoom>; members?: string[] };
  const prepare = () => {
    const no = saveBlock(purpose, picked, busy) || over;   // 닫기 「예」 길도 단추와 같은 조건(0명 · 목적 빈 채로 서버에 안 보냄 · 모루 #2865)
    if (no) { setWhy(no); throw new Error(no); }
    setBusy(true); setWhy("");
    return { body: JSON.stringify(setBody({ name, purpose, members: picked, hours, max, task, idle }, edit ? set0 : null)), reply: null as Reply | null };
  };
  const save = async (job: ReturnType<typeof prepare>) => {
    try {
      const j = await office<Reply>(edit ? `temprooms/${encodeURIComponent(edit.id)}` : "temprooms", { method: "POST", body: job.body });
      if (!edit && !j?.room?.id) throw new Error("방 생성 응답을 확인하지 못했어");
      draftDrop(dk);   // 저장됨 = 보관 지움
      if (edit) patchRoom(qc, edit.id, { ...(max !== set0.max ? { max } : {}), ...(task.trim() !== set0.task ? { task: task.trim() } : {}), ...(idle !== set0.idle ? { idle_min: idle || undefined } : {}), ...savedRoomPart(j, edit.id, { name, purpose, members: picked }) } as Partial<OfficeRoom>);   // 서버 답이 있으면 그 값이 이김
      else {
        // 성공 응답으로 새 방을 먼저 넣어 목록 재조회가 느려도 바로 들어간다.
        await qc.cancelQueries({ queryKey: ["nomute", "rooms"] });
        const room = { name, purpose, kind: "group", temp: true, ...savedRoomPart(j, j.room.id, { name, purpose, members: picked }) } as OfficeRoom;
        qc.setQueryData<OfficeRoom[]>(["nomute", "rooms"], (old) => [...(old || []).filter((r) => r.id !== room.id), room]);
      }
      void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      job.reply = j;
      return j;
    } catch (e) { setWhy(e instanceof Error ? e.message : "못 만들었어"); setBusy(false); throw e; }
  };
  const make = async () => save(prepare());
  // 기존 GoButton의 fill → wait → ok를 그대로 사용한다. 요청은 게이지가 찬 뒤 시작한다.
  const begin = async () => prepare();
  const create = async (job: ReturnType<typeof prepare>) => { await save(job); return true; };
  const close = () => { if (!busy) onClose(); };
  const g = useCloseGuard(dirty && !busy, close, open);
  const made = (j: { room: { id: string } }) => { onClose(); if (!edit) void nav({ to: "/channels/$channelId", params: { channelId: j.room.id } }); };   // 닫고 옮기기 = ✓ 뒤(GoButton done)
  return (
    <div role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-hidden={!open || undefined} inert={!open} style={open ? undefined : { visibility: "hidden", pointerEvents: "none" }} aria-label={edit ? "방 설정" : "임시 단톡방 만들기"} className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" {...backdrop(g.request)}>   {/* z 70 = PC 위 탭 줄 · 메뉴 줄(58 ~ 61)보다 위 — 칸이 늘어 창이 길어지자 제목 · X 가 그 줄 밑에 깔렸음(실물 · 1440×900) */}
      <div className="nm-rs-card relative flex max-h-full w-full max-w-md flex-col overflow-auto rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">   {/* 줄 꼴 한 벌(.nm-rs-nm 이름 기둥 · .nm-rs-row 값 한 선 · 줄 사이 같은 틈) */}
        <DialogX onClose={g.request} disabled={busy} />
        <b className="pr-9 text-base">{edit ? "방 설정" : "임시 단톡방"}</b>
        {edit ? <RoomArtRow id={edit.id} look={edit.look} line /> : null}
        <fieldset disabled={busy} inert={busy} className="contents">
        <label className="flex flex-col">
          <span className="nm-rs-nm">방 이름</span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-border bg-transparent px-3 py-2" />
        </label>
        <label className="flex flex-col">
          <span className="nm-rs-nm">방 지침</span>   {/* 옛 「목적」 = 방 지침 하나(봄 11-12 00:39 「가」 · 형이 찾는 낱말) */}
          <textarea value={purpose} maxLength={500} rows={3} onChange={(e) => setPurpose(e.target.value)} className="resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
        </label>
        {edit ? <>   {/* 지금 일 = 방 지침과 따로 한 칸 · 머무는 시간 = 이만큼 조용하면 일이 끝남(형 11-17 00:49 · 서버 = 빠르 #4080) */}
          <label className="flex flex-col">
            <span className="nm-rs-nm">지금 일</span>
            <textarea value={task} maxLength={TASK_MAX} rows={2} onChange={(e) => setTask(e.target.value)} className="resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
            {taskEndNote(set0.task, task) ? <small className="nm-rs-note text-destructive" role="status">{taskEndNote(set0.task, task)}</small> : null}   {/* 빈 일 = 서버가 바로 끝냄(멤버 비움) → 그때만 한 줄 */}
          </label>
          <div className="nm-rs-row" role="group" aria-label="머무는 시간">
            <span className="lbl nm-rs-nm">머무는 시간</span>
            <span className="opts">{idleOpts(idle).map((m, i) => <span key={m} className="one">{i ? <i aria-hidden>|</i> : null}<button type="button" aria-pressed={idle === m} onClick={() => setIdle(m)}>{idleKo(m)}</button></span>)}</span>
          </div>
        </> : null}
        <fieldset className="flex flex-col gap-2">
          <legend className="nm-rs-head"><span className="nm-rs-nm">{edit ? "멤버" : "초대할 사람"}<em>{edit ? picked.length + 1 : picked.length}명</em></span>{edit && kickAll ? <MorphAsk className="nm-rs-kick" yesText="내보내기" onYes={() => { draftDrop(dk); onClose(); kickAll(); }}>모두 내보내기</MorphAsk> : null}</legend>   {/* 고치기 = 형을 더한 숫자(방 머리 숫자와 같은 셈 · 형 11-17 00:46 「수가 안맞네」) */}
          <div role="tablist" className="nm-fam">
            {FAMS.map((f) => { const n = namesOf(f.cls).filter((x) => picked.includes(x)).length; return <button key={f.key} type="button" role="tab" aria-selected={fam === f.key} className="nm-fam-tab" onClick={() => setFam(f.key)}>{f.label}{n ? ` ${n}` : ""}</button>; })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" aria-pressed={allOn} className="nm-pick" onClick={toggleAll}>이 묶음 다</button>
            {shown.map((n) => { const p = who(n); return <button key={n} type="button" aria-pressed={picked.includes(n)} className="nm-pick" onClick={() => toggle(n)}><FaceImg id={idOf(n, list)} size={26} />{p?.mark ? <span aria-hidden>{p.mark}</span> : null}{p?.name || short(n)}</button>; })}
          </div>
          {edit ? (   /* 최대 인원 · 모두 내보내기 = 멤버 칸 안으로(앞 = 방 메뉴에 「멤버 설정」 · 「모두 내보내기」 두 줄이 따로) */
            <div className="nm-rs-row" role="group" aria-label="최대 인원">
              <span className="lbl nm-rs-nm">최대 인원</span>
              <span className="opts">
                <span className="one"><button type="button" aria-pressed={!max} onClick={() => setMax(0)}>제한 없음</button></span>
                <span className="one"><i aria-hidden>|</i>
                  <button type="button" className="st" aria-label="최대 인원 줄이기" disabled={max <= 1 && max > 0} onClick={() => setMax(maxStep(max, -1, picked.length))}>−</button>
                  <button type="button" className="num" aria-pressed={!!max} aria-label={max ? `최대 ${maxShow(max)}명` : `지금 ${picked.length + 1}명으로 정하기`} onClick={() => setMax(maxStep(max, 0, picked.length))}>{max ? maxShow(max) : picked.length + 1}명</button>
                  <button type="button" className="st" aria-label="최대 인원 늘리기" onClick={() => setMax(maxStep(max, 1, picked.length))}>+</button>
                </span>
              </span>
            </div>
          ) : null}
        </fieldset>
        <fieldset className="flex flex-col">
          <legend className="nm-rs-nm">유지 시간</legend>   {/* 지금 값 = 글자(「· 지금 영구」) 대신 그 칸에 라임 · 가운데면 막대가 그만큼(형 11-17 01:16 · 앞 = 형 11-06 10:37 「이거 하루가 넘나? 유지기간이」 로 붙인 글자) */}
          <DaySlide hours={hours} now={edit ? stayNow(edit.exp, Date.now()) : undefined} onChange={setHours} />   {/* 1시간 · 끌어서 1~7일 · 영구(형 11-14 04:56) */}
        </fieldset>
        </fieldset>
        {why || over ? <p role="alert" className="text-destructive">{why || over}</p> : null}   {/* over = 고른 멤버가 최대 인원을 넘음(고치기 꺼짐의 까닭) */}
        <div className="flex justify-end gap-2">
          {/* 새 방 입장은 서버가 준 id가 필요하므로 생성은 체크까지 기다리고, 기존 방 고치기는 공통 away를 따른다. */}
          {edit ? <GoButton disabled={!ready} className="rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" go={make} done={made} away={onClose} what="방 고치기">고치기</GoButton>
            : <GoButton disabled={!ready} className="nm-room-create rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" go={begin} busy="방 생성 준비 중" wait={create} waiting="생성 중 …" done={(job) => { if (job.reply) made(job.reply); }}>방 생성</GoButton>}
        </div>
      </div>
      {g.ask ? <CloseAsk busy={busy} onKeep={() => g.setAsk(false)} onClose={() => { if (!busy) { draftDrop(dk); close(); } }} /> : null}
    </div>
  );
}

/** 단톡방 없애기(형 11-05 「단톡방이 지금 없애는게 없는데, 좌측으로 하면 휴지통 모양 하나 나와서 정말 없애겠냐고 뜨고 없앨수있게해줘」 · 「설정에서도 반영되어야해」)
 *  = 서버 DELETE rooms/<id>(뜸 · 형만) · 목록·설정·부름에서 빠지고 새 글 막힘 · 글은 서버에 남김(형 고름 「기록은 남김」 · 되살림 = 우리가 restore)
 *  못 없앰 = 1:1·둘의 방 · 회의실·요약실·수리 접수·메모·공지 · 밥상(형 고름 「밥상은 못 지우게」 · 「밥상을지우겟냐?」) · 임시방 = 파기(DELETE temprooms/<id>)
 *  되묻기 = 창(모달) 대신 그 자리 알약 둘(./morph-ask.tsx) · 서버 일은 뒤에서(./room-drop.ts · 형 11-16 03:0x 「모달로 안뜨게하구 … 백단에서 처리하게」) — 옛 되묻는 창 둘(TempDeleteDialog · RoomGoneDialog)은 걷음 */
const KEEP_ROOMS = new Set(["all", "summary", "repair", "memo", "notice", "guide"]);
export const canGone = (r: { id: string; with?: string; temp?: boolean }) => !r.with && !r.temp && !KEEP_ROOMS.has(r.id) && !/^(dm|pair)-/.test(r.id);

/** 방 멤버 고르기 = 대화 목록·방 메뉴 한 곳에서(형 11-05 08:35 「아예 저기서 설정할게 아니라 그냥 톡 목록에서 설정하게 일원화해야람」 · 형 11-07 13:38 「여기서도 방 멤버 설정 · 초대랑 별개」)
 *  지정방 = 서버 roomset(형만 · base 판 · 낡으면 409) · 임시방 = temprooms 후보·저장(이름·목적·기한은 「방 설정」) */
export function RoomMembersDialog({ r, onClose }: { r: OfficeRoom; onClose: () => void }) {
  return r.temp ? <TempRoomDialog edit={r} onClose={onClose} /> : <SetMembersDialog r={r} onClose={onClose} />;   // 임시방 = 멤버도 「방 설정」 한 창(형 11-17 00:47 「방 설정에 통합」 · 멤버만 고치던 창은 걷음)   // 갈림 = 부품 둘(훅 순서가 방마다 안 바뀌게 · 시아 11-07)
}

/** 지정방 멤버(roomset) */
function SetMembersDialog({ r, onClose }: { r: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["nomute", "roomset"], queryFn: () => office<{ roomset: { ver: number; rooms: Record<string, string[]> }; candidates: string[]; can_edit: boolean }>("roomset") });
  const [cur, setCur] = useState<string[] | null>(null), [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const list = peopleSync(), d = q.data, now = cur ?? d?.roomset.rooms[r.id] ?? r.members ?? [];
  const save = async () => {
    setBusy(true); setWhy("");
    try {
      const j = await office<{ roomset?: { ver: number; rooms: Record<string, string[]> } }>("roomset", { method: "POST", body: JSON.stringify({ room: r.id, members: now, base: d?.roomset.ver }) });
      if (j.roomset) qc.setQueryData(["nomute", "roomset"], (old: typeof d) => (old ? { ...old, roomset: j.roomset! } : old));   // 새 판 번호(ver)까지 = 다시 연 창이 옛 base 로 안 보냄
      patchRoom(qc, r.id, { members: j.roomset?.rooms?.[r.id] ?? now });
      void Promise.all([qc.invalidateQueries({ queryKey: ["nomute", "roomset"] }), qc.invalidateQueries({ queryKey: ["nomute", "rooms"] })]);   // 저장 = 서버 답(1.4초쯤)에서 바로 닫힘 · 방 목록 다시 읽기(2초~)는 뒤에서(형 11-08 23:16 「방 멤버 고치기 누르면 반응없어 해결해」 · 빠르 실물 = 「저장 중」 3~15초 · 봄 배분 12)
    } catch (e) { const m = e instanceof Error ? e.message : "저장 못 함"; setWhy(/changed|base/.test(m) ? "다른 데서 바뀜 — 새 판을 다시 읽었어 · 다시 골라 줘" : m); setCur(null); void q.refetch(); setBusy(false); throw e; }   // 창 닫기 = ✓ 뒤(GoButton done)
  };
  const changed = !!cur && cur.join("|") !== (d?.roomset.rooms[r.id] ?? r.members ?? []).join("|"), g = useCloseGuard(changed && !busy, onClose);   // 고른 멤버가 바뀐 채 닫기 = 한 문장 확인 · Esc · 바탕 · X 같은 길(#-042)
  return (
    <div role="dialog" aria-modal="true" aria-label={`${r.name} 멤버`} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" {...backdrop(g.request)}>
      <div className="relative flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <DialogX onClose={g.request} />
        <b className="pr-9 text-base">「{r.name}」 멤버 <span className="text-xs font-normal text-muted-foreground" title="형 포함">{now.length + 1}명</span></b>
        {!d ? <p className="text-muted-foreground">{q.isError ? readFail(q.error) : reading()}</p> : (
          <div className="flex flex-wrap gap-1.5">
            {d.candidates.filter((w) => !seatOff(list.find((p) => p.who === w))).map((w) => {
              const on = now.includes(w);
              return (
                <button key={w} type="button" disabled={!d.can_edit || busy} aria-pressed={on} onClick={() => setCur(on ? now.filter((x) => x !== w) : [...now, w])}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted-foreground"}`}>
                  <FaceImg id={idOf(w, list)} size={16} />{list.find((p) => p.who === w)?.name || w}
                </button>
              );
            })}
          </div>
        )}
        {why ? <p role="alert" className="text-destructive">{why}</p> : null}
        <div className="flex justify-end gap-2">
          <GoButton disabled={busy || !cur || !now.length || !d?.can_edit} className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-40" go={save} done={onClose} away={onClose} what="방 설정 저장" busy="저장 중">저장</GoButton>
        </div>
      </div>
      {g.ask ? <CloseAsk onKeep={() => g.setAsk(false)} onClose={onClose} /> : null}
    </div>
  );
}

const TRAY = 132, THRESH = 44, RUB = 0.55;   // 예타 목록 끌기(viewer/index.html yLrBind · 임계·고무줄 그대로 · 칸이 둘이라 폭만 두 배)

/** 줄을 왼쪽으로 끌면 수정·삭제(형 10-31 「단체방은 방 좌측으로 끌면 이름 수정 이나 삭제 있어야 하고」) = 손가락 1:1 · 놓으면 이징 복귀 · 세로 = 스크롤 양보. */
export type SwipeAct = { key: string; label: ReactNode; cls: string; aria: string; on: () => void };
/** 줄을 왼쪽으로 끌면 오른쪽 칸이 나옴(예타 yLrBind) · 임시방 = 수정·삭제(기본) · 다른 방 = acts 로 칸을 줌(빠르 11-02 · 형 02:20 「여기 톡방 좌측으로 밀면 설정 버튼이 뜨게 해줘」) */
export function TempSwipe({ open, onOpen, onClose, onEdit, onDelete, acts, width = TRAY, children }: { open: boolean; onOpen: () => void; onClose: () => void; onEdit?: () => void; onDelete?: () => void; acts?: SwipeAct[]; width?: number; children: ReactNode }) {
  const list: SwipeAct[] = acts || [{ key: "edit", label: "수정", cls: "edit", aria: "수정", on: () => onEdit?.() }, { key: "del", label: "삭제", cls: "del", aria: "삭제", on: () => onDelete?.() }];
  const wrap = useRef<HTMLDivElement>(null), row = useRef<HTMLDivElement>(null), tray = useRef<HTMLDivElement>(null);
  const d = useRef({ on: false, decided: false, horiz: false, x0: 0, y0: 0, start: 0 }), just = useRef(false);
  const place = (x: number | null) => {
    if (row.current) row.current.style.transform = x === null ? "" : `translateX(${x}px)`;
    if (tray.current) tray.current.style.transform = x === null ? "" : `translateX(${(1 - Math.min(1, -x / width)) * 100}%)`;
  };
  const cancel = () => { d.current.on = false; wrap.current?.classList.remove("drag"); place(null); };
  return (
    <div ref={wrap} className={`nm-sw${open ? " open" : ""}`} style={{ "--sw-w": `${width}px` } as CSSProperties}>
      <div ref={row} className="nm-sw-row" onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => { if (e.isPrimary) d.current = { on: true, decided: false, horiz: false, x0: e.clientX, y0: e.clientY, start: open ? -width : 0 }; }}
        onPointerMove={(e) => {
          const s = d.current;
          if (!s.on) return;
          const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
          if (!s.decided && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
            s.decided = true; s.horiz = Math.abs(dx) > Math.abs(dy) * 1.2;
            if (!s.horiz) { s.on = false; return; }
            wrap.current?.classList.add("drag");
            row.current?.setPointerCapture(e.pointerId);
          }
          if (!s.horiz) return;
          let x = Math.min(0, s.start + dx);
          if (x < -width) x = -width - (-width - x) * (1 - RUB * 0.86);
          place(x);
        }}
        onPointerUp={(e) => {
          const s = d.current;
          if (!s.on) return;
          s.on = false;
          if (!s.horiz) return;
          const x = s.start + (e.clientX - s.x0), w = wrap.current;
          if (w) void w.offsetWidth;   // 지금 자리를 이징 시작점으로
          w?.classList.remove("drag"); place(null);
          if (x <= -THRESH) onOpen(); else onClose();
          just.current = true; window.setTimeout(() => { just.current = false; }, 80);
        }}
        onPointerCancel={cancel}
        onClickCapture={(e) => { if (just.current || open) { e.preventDefault(); e.stopPropagation(); if (open && !just.current) onClose(); } }}>
        {children}
      </div>
      <div ref={tray} className="nm-sw-tray" aria-hidden={!open}>
        {list.map((a) => <button key={a.key} type="button" tabIndex={open ? 0 : -1} aria-label={a.aria} className={`nm-sw-act ${a.cls}`} onClick={a.on}>{a.label}</button>)}
      </div>
    </div>
  );
}
