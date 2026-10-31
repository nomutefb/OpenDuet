// 임시 단톡방 만들기·고치기(형 10-31 「내가 + 눌러서 임시 단톡방 만들수있게해주라. 시간 지나면 파기되고 자동으로」 · 「누구 초대할지 고를 수 있고. 목적 쓸수있게」)
//   서버 = functions/api/office/_temproom.js · 목록 위 + → 창 하나 · 만들면 그 방으로 들어감 · 줄을 왼쪽으로 끌면 수정·삭제(TempSwipe)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useRef, useState } from "react";
import { type OfficeRoom, idOf, office, peopleSync } from "../data/office";
import { FaceImg } from "./faces";

const HOURS: [number, string][] = [[1, "1시간"], [24, "하루"], [72, "사흘"], [168, "일주일"], [0, "영구"]];
// 묶음(형 10-31 「클로드 눌러서 선택 그록 눌러서 선택 지피티 눌러서 선택」) = 서버 clsOf 분류 · 명부에 없는 이 = 클로드 칸
const FAMS: { key: string; label: string; cls: string[] }[] = [{ key: "cl", label: "클로드", cls: ["클로드", ""] }, { key: "gk", label: "그록", cls: ["그록봇"] }, { key: "gp", label: "지피티", cls: ["닷", "부름"] }];

/** 남은 시간 한 마디(목록 줄 꼬리표). */
export function tempLeft(exp: number, now = Date.now()) {
  const h = Math.ceil((exp - now) / 3600e3);
  return h >= 24 ? `${Math.ceil(h / 24)}일 남음` : `${Math.max(1, h)}시간 남음`;
}

const short = (n: string) => n.replace(" PM", "");

/** 방 맨 위 = 목적 · 남은 시간 · 목적을 받아 간 이(형 10-31 「목적을 듣고 온건지 확인 되어야하고」). */
export function TempRoomHead({ r }: { r: OfficeRoom }) {
  const members = r.members || [], heard = members.filter((n) => (r.heard || []).includes(n)), wait = members.filter((n) => !heard.includes(n));
  return (
    <div className="mb-2 rounded-2xl border border-border px-3 py-2 text-sm">
      <p className="whitespace-pre-wrap">{r.purpose}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {r.exp ? tempLeft(r.exp) : "영구"} · 목적 받음 {heard.map(short).join("·") || "아직 없음"}{wait.length ? ` · 안 온 이 ${wait.map(short).join("·")}` : ""}
      </p>
    </div>
  );
}

export function TempRoomButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-label="임시 단톡방 만들기" className="mb-1 flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-muted-foreground hover:bg-duet-tile" onClick={() => setOpen(true)}>
        <span aria-hidden className="grid size-5 place-items-center text-base">+</span>임시 단톡방
      </button>
      {open ? <TempRoomDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function TempRoomDialog({ edit, onClose }: { edit?: OfficeRoom; onClose: () => void }) {
  const qc = useQueryClient(), nav = useNavigate();
  const cand = useQuery({ queryKey: ["nomute", "temprooms"], queryFn: () => office<{ candidates: string[] }>("temprooms").then((j) => j.candidates || []), staleTime: 60_000 }).data || [];
  const list = peopleSync(), who = (n: string) => list.find((p) => p.who === n);
  const [name, setName] = useState(edit?.name || ""), [purpose, setPurpose] = useState(edit?.purpose || ""), [picked, setPicked] = useState<string[]>(edit?.members || []);
  const [hours, setHours] = useState<number | null>(edit ? null : 24), [fam, setFam] = useState("cl");   // 고치기 = 안 누르면 기한 그대로
  const [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
  const namesOf = (cls: string[]) => cand.filter((n) => cls.includes(who(n)?.cls || ""));
  const shown = namesOf(FAMS.find((f) => f.key === fam)?.cls || []);
  const allOn = shown.length > 0 && shown.every((n) => picked.includes(n));
  const toggleAll = () => setPicked(allOn ? picked.filter((n) => !shown.includes(n)) : [...new Set([...picked, ...shown])]);
  const ready = !!purpose.trim() && picked.length > 0 && !busy;
  const make = async () => {
    setBusy(true); setWhy("");
    try {
      const body = JSON.stringify({ name, purpose, members: picked, ...(hours === null ? {} : { hours }) });
      const j = await office<{ room: { id: string } }>(edit ? `temprooms/${encodeURIComponent(edit.id)}` : "temprooms", { method: "POST", body });
      await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onClose();
      if (!edit) void nav({ to: "/channels/$channelId", params: { channelId: j.room.id } });
    } catch (e) { setWhy(e instanceof Error ? e.message : "못 만들었어"); setBusy(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={edit ? "단톡방 고치기" : "임시 단톡방 만들기"} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-auto rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <b className="text-base">{edit ? "단톡방 고치기" : "임시 단톡방"}</b>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">방 이름(비우면 목적 앞부분)</span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-border bg-transparent px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">목적 · 초대된 이에게 지침으로 들어가</span>
          <textarea value={purpose} maxLength={500} rows={3} onChange={(e) => setPurpose(e.target.value)} className="resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-muted-foreground">초대할 사람 · {picked.length}명{edit ? " · 빠진 이는 방에서 나가고 1:1 에 정중히 알려" : ""}</legend>
          <div role="tablist" className="nm-fam">
            {FAMS.map((f) => { const n = namesOf(f.cls).filter((x) => picked.includes(x)).length; return <button key={f.key} type="button" role="tab" aria-selected={fam === f.key} className="nm-fam-tab" onClick={() => setFam(f.key)}>{f.label}{n ? ` ${n}` : ""}</button>; })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" aria-pressed={allOn} className="nm-pick" onClick={toggleAll}>이 묶음 다</button>
            {shown.map((n) => { const p = who(n); return <button key={n} type="button" aria-pressed={picked.includes(n)} className="nm-pick" onClick={() => toggle(n)}><FaceImg id={idOf(n, list)} size={26} />{p?.mark ? <span aria-hidden>{p.mark}</span> : null}{p?.name || short(n)}</button>; })}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-muted-foreground">유지 시간{edit ? " · 안 누르면 그대로" : " · 지나면 글까지 지워져"}</legend>
          <div className="flex gap-1.5">
            {HOURS.map(([h, label]) => <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)} className="nm-pick flex-1 justify-center">{label}</button>)}
          </div>
        </fieldset>
        {why ? <p role="alert" className="text-destructive">{why}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-full px-4 py-2 hover:bg-foreground/5" onClick={onClose}>닫기</button>
          <button type="button" disabled={!ready} className="rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" onClick={() => void make()}>{busy ? "보내는 중" : edit ? "고치기" : "만들기"}</button>
        </div>
      </div>
    </div>
  );
}

/** 지우기 되묻기(형 10-31 「삭제는 되묻기 있어야하고 이제 디비에도 잘 반영」 · 예타 yConfirm 예 왼쪽·아니오 오른쪽). */
export function TempDeleteDialog({ r, onClose, onGone }: { r: OfficeRoom; onClose: () => void; onGone: () => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const drop = async () => {
    setBusy(true); setWhy("");
    try {
      await office(`temprooms/${encodeURIComponent(r.id)}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onClose(); onGone();
    } catch (e) { setWhy(e instanceof Error ? e.message : "못 지웠어"); setBusy(false); }
  };
  return (
    <div role="alertdialog" aria-modal="true" aria-label="단톡방 지우기" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <b className="text-base">정말 지울까?</b>
        <p className="text-muted-foreground">「{r.name}」 방의 글이 모두 지워지고 되돌릴 수 없어. 첨부 파일은 저장소에 남아.</p>
        {why ? <p role="alert" className="text-destructive">{why}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" disabled={busy} className="rounded-full bg-destructive px-4 py-2 font-semibold text-white disabled:opacity-40" onClick={() => void drop()}>{busy ? "지우는 중" : "예"}</button>
          <button type="button" className="rounded-full px-4 py-2 hover:bg-foreground/5" onClick={onClose}>아니오</button>
        </div>
      </div>
    </div>
  );
}

const TRAY = 132, THRESH = 44, RUB = 0.55;   // 예타 목록 끌기(viewer/index.html yLrBind · 임계·고무줄 그대로 · 칸이 둘이라 폭만 두 배)

/** 줄을 왼쪽으로 끌면 수정·삭제(형 10-31 「단체방은 방 좌측으로 끌면 이름 수정 이나 삭제 있어야 하고」) = 손가락 1:1 · 놓으면 이징 복귀 · 세로 = 스크롤 양보. */
export function TempSwipe({ open, onOpen, onClose, onEdit, onDelete, children }: { open: boolean; onOpen: () => void; onClose: () => void; onEdit: () => void; onDelete: () => void; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null), row = useRef<HTMLDivElement>(null), tray = useRef<HTMLDivElement>(null);
  const d = useRef({ on: false, decided: false, horiz: false, x0: 0, y0: 0, start: 0 }), just = useRef(false);
  const place = (x: number | null) => {
    if (row.current) row.current.style.transform = x === null ? "" : `translateX(${x}px)`;
    if (tray.current) tray.current.style.transform = x === null ? "" : `translateX(${(1 - Math.min(1, -x / TRAY)) * 100}%)`;
  };
  const cancel = () => { d.current.on = false; wrap.current?.classList.remove("drag"); place(null); };
  return (
    <div ref={wrap} className={`nm-sw${open ? " open" : ""}`}>
      <div ref={row} className="nm-sw-row" onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => { if (e.isPrimary) d.current = { on: true, decided: false, horiz: false, x0: e.clientX, y0: e.clientY, start: open ? -TRAY : 0 }; }}
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
          if (x < -TRAY) x = -TRAY - (-TRAY - x) * (1 - RUB * 0.86);
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
        <button type="button" tabIndex={open ? 0 : -1} className="nm-sw-act edit" onClick={onEdit}>수정</button>
        <button type="button" tabIndex={open ? 0 : -1} className="nm-sw-act del" onClick={onDelete}>삭제</button>
      </div>
    </div>
  );
}
