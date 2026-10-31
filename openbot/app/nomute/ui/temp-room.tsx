// 임시 단톡방 만들기(형 10-31 「내가 + 눌러서 임시 단톡방 만들수있게해주라. 시간 지나면 파기되고 자동으로」 · 「누구 초대할지 고를 수 있고. 목적 쓸수있게」)
//   서버 = functions/api/office/_temproom.js · 목록 위 + → 창 하나 · 만들면 그 방으로 들어감
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { office } from "../data/office";

const HOURS: [number, string][] = [[1, "1시간"], [24, "하루"], [72, "사흘"], [168, "일주일"]];

/** 남은 시간 한 마디(목록 줄 꼬리표). */
export function tempLeft(exp: number, now = Date.now()) {
  const h = Math.ceil((exp - now) / 3600e3);
  return h >= 24 ? `${Math.ceil(h / 24)}일 남음` : `${Math.max(1, h)}시간 남음`;
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

function TempRoomDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient(), nav = useNavigate();
  const cand = useQuery({ queryKey: ["nomute", "temprooms"], queryFn: () => office<{ candidates: string[] }>("temprooms").then((j) => j.candidates || []), staleTime: 60_000 }).data || [];
  const [name, setName] = useState(""), [purpose, setPurpose] = useState(""), [picked, setPicked] = useState<string[]>([]), [hours, setHours] = useState(24);
  const [busy, setBusy] = useState(false), [why, setWhy] = useState("");
  const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
  const ready = !!purpose.trim() && picked.length > 0 && !busy;
  const make = async () => {
    setBusy(true); setWhy("");
    try {
      const j = await office<{ room: { id: string } }>("temprooms", { method: "POST", body: JSON.stringify({ name, purpose, members: picked, hours }) });
      await qc.invalidateQueries({ queryKey: ["nomute", "rooms"] });
      onClose();
      void nav({ to: "/channels/$channelId", params: { channelId: j.room.id } });
    } catch (e) { setWhy(e instanceof Error ? e.message : "못 만들었어"); setBusy(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="임시 단톡방 만들기" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex max-h-full w-full max-w-md flex-col gap-3 overflow-auto rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <b className="text-base">임시 단톡방</b>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">이름(비우면 목적 앞부분)</span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-border bg-transparent px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">목적 · 초대된 이에게 지침으로 들어가</span>
          <textarea value={purpose} maxLength={500} rows={3} onChange={(e) => setPurpose(e.target.value)} className="resize-none rounded-xl border border-border bg-transparent px-3 py-2" />
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-muted-foreground">초대할 사람</legend>
          <div className="flex flex-wrap gap-1.5">
            {cand.map((n) => <button key={n} type="button" aria-pressed={picked.includes(n)} onClick={() => toggle(n)} className={`rounded-full border px-3 py-1 ${picked.includes(n) ? "border-transparent bg-foreground text-background" : "border-border"}`}>{n.replace(" PM", "")}</button>)}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-muted-foreground">유지 시간 · 지나면 글까지 지워져</legend>
          <div className="flex gap-1.5">
            {HOURS.map(([h, label]) => <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)} className={`flex-1 rounded-full border px-2 py-1 ${hours === h ? "border-transparent bg-foreground text-background" : "border-border"}`}>{label}</button>)}
          </div>
        </fieldset>
        {why ? <p role="alert" className="text-destructive">{why}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-full px-4 py-2 hover:bg-foreground/5" onClick={onClose}>닫기</button>
          <button type="button" disabled={!ready} className="rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" onClick={() => void make()}>{busy ? "만드는 중" : "만들기"}</button>
        </div>
      </div>
    </div>
  );
}
