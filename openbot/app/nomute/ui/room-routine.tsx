// 단체방 루틴(형 10-31 「그 열쇠는 타이머로 단체방마다 타이머를 설정할 수 있게 해줘. 어떻게보면 단체방 루틴이겠네.」 · 「n일 몇회, 모든 주기를 효율적으로 커버가능하도록 uiux를 구성해줘.」)
//   멤버 일부 빼기 = 기본 모두(형 「구성멤버중에 일부는 제외할 수 있도록도 해줘. 기본값은 모두야.」) · 지침 = 울릴 때 글 뒤에 같이 나감(형 「단체방 루틴에는 그리고 별도의 지침을 심고」)
//   서버 = GET/POST /api/office/room-timers(#1861) · 들어가는 곳 = 방 상단 사람 목록(ui/top.tsx) · 1:1·공지·수리 접수엔 없음
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg } from "./faces";
import { t12 } from "./when";
import "./room-routine.css";

type Mode = "hours" | "days" | "week";
export type RoomTimer = { mode: Mode; every?: number; min?: number; days?: number; times?: string[]; wd?: number[]; text?: string; rule?: string; skip?: string[]; on?: boolean; next_ts?: number };
type Form = { mode: Mode; every: number; min: number; days: number; times: string[]; wd: number[]; text: string; rule: string; on: boolean };

const WD = ["일", "월", "화", "수", "목", "금", "토"];
const MODES: [Mode, string][] = [["hours", "몇 시간마다"], ["days", "며칠마다"], ["week", "요일마다"]];
const QUICK: { label: string; set: Partial<Form> }[] = [
  { label: "매일 아침", set: { mode: "days", days: 1, times: ["09:00"] } },
  { label: "평일 아침", set: { mode: "week", wd: [1, 2, 3, 4, 5], times: ["09:00"] } },
  { label: "3시간마다", set: { mode: "hours", every: 3, min: 0 } },
  { label: "월요일 아침", set: { mode: "week", wd: [1], times: ["09:00"] } },
];
const MAX_TIMES = 24;

/** 루틴을 걸 수 있는 방 — 1:1·공지·수리 접수는 안 됨. */
export const routineRoom = (r?: OfficeRoom) => !!r && !r.with && r.id !== "notice" && r.id !== "repair";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v) || lo));
const kst = (ts: number) => new Date(ts + 9 * 3600e3);

/** 다음 울림 한 마디(오늘 = 시각 · 내일 · 그 밖 = 월/일). */
function nextLine(ts?: number) {
  if (!ts) return "";
  const d = kst(ts), n = kst(Date.now());
  const dd = Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())) / 864e5);
  return dd === 0 ? t12(ts) : dd === 1 ? `내일 ${t12(ts)}` : `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${t12(ts)}`;
}

/** 지금 고른 주기를 말로 — 저장 전에 눈으로 맞는지 본다. */
function cycleLine(f: Form) {
  const times = f.times.join(" · ");
  if (f.mode === "hours") return `${f.every === 1 ? "매시간" : `${f.every}시간마다`} ${f.min}분에`;
  if (f.mode === "days") return `${f.days === 1 ? "매일" : `${f.days}일마다`} 하루 ${f.times.length}번${times ? ` · ${times}` : ""}`;
  return `매주 ${f.wd.map((d) => WD[d]).join("·") || "요일 없음"} · 하루 ${f.times.length}번${times ? ` · ${times}` : ""}`;
}

function formOf(t?: RoomTimer): Form {
  return { mode: t?.mode || "days", every: t?.every || 3, min: t?.min || 0, days: t?.days || 1, times: t?.times?.length ? t.times : ["09:00"], wd: t?.wd?.length ? t.wd : [1], text: t?.text || "", rule: t?.rule || "", on: t ? t.on !== false : true };
}

export function useRoomTimers(enabled = true) {
  return useQuery({ queryKey: ["nomute", "room-timers"], queryFn: () => office<{ timers: Record<string, RoomTimer> }>("room-timers").then((j) => j.timers || {}), staleTime: 15_000, enabled });
}

function Num({ value, lo, hi, onChange, label }: { value: number; lo: number; hi: number; onChange: (n: number) => void; label: string }) {
  return (
    <span className="nm-rr-num">
      <button type="button" aria-label={`${label} 줄이기`} disabled={value <= lo} onClick={() => onChange(value - 1)}>−</button>
      <input type="number" inputMode="numeric" aria-label={label} min={lo} max={hi} value={value} onChange={(e) => onChange(clamp(Number(e.target.value), lo, hi))} />
      <button type="button" aria-label={`${label} 늘리기`} disabled={value >= hi} onClick={() => onChange(value + 1)}>+</button>
    </span>
  );
}

function Times({ times, onChange }: { times: string[]; onChange: (t: string[]) => void }) {
  const [draft, setDraft] = useState("18:00");
  const add = () => { if (draft && !times.includes(draft) && times.length < MAX_TIMES) onChange([...times, draft].sort()); };
  return (
    <div className="nm-rr-times">
      {times.map((t) => (
        <button key={t} type="button" className="nm-rr-chip on" aria-label={`${t} 빼기`} disabled={times.length <= 1} onClick={() => onChange(times.filter((x) => x !== t))}>{t} <i aria-hidden>×</i></button>
      ))}
      <span className="nm-rr-add">
        <input type="time" aria-label="넣을 시각" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="button" disabled={times.length >= MAX_TIMES || times.includes(draft)} onClick={add}>넣기</button>
      </span>
    </div>
  );
}

function Sheet({ room, timer, onClose }: { room: OfficeRoom; timer?: RoomTimer; onClose: () => void }) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const crew = roomAgentIds(room, list).map((id) => { const p = list.find((y) => idOf(y.who, list) === id); return { id, who: p?.who || id, name: p?.name || p?.who || id }; });
  const [f, setF] = useState<Form>(() => formOf(timer)), [skip, setSkip] = useState<string[]>(timer?.skip || []);
  const [sure, setSure] = useState(false), [saved, setSaved] = useState(false);
  const set = (x: Partial<Form>) => { setF((v) => ({ ...v, ...x })); setSaved(false); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const left = crew.filter((c) => !skip.includes(c.who)).length;
  const ready = !!f.text.trim() && (f.mode !== "week" || f.wd.length > 0) && (!crew.length || left > 0);
  const go = useMutation({
    mutationFn: (body: Record<string, unknown>) => office("room-timers", { method: "POST", body: JSON.stringify({ room: room.id, ...body }) }),
    onSuccess: async (_r, body) => {
      await qc.invalidateQueries({ queryKey: ["nomute", "room-timers"] });
      if (body.off) onClose(); else setSaved(true);
    },
  });
  const save = () => {
    const cycle = f.mode === "hours" ? { every: f.every, min: f.min } : f.mode === "days" ? { days: f.days, times: f.times } : { wd: f.wd, times: f.times };
    go.mutate({ mode: f.mode, ...cycle, text: f.text.trim(), rule: f.rule.trim(), skip, on: f.on });
  };
  const next = saved ? nextLine(timer?.next_ts) : "";
  return (
    <div className="nm-rr yeta-set" role="dialog" aria-modal="true" aria-label={`${room.name} 루틴`} onClick={(e) => e.stopPropagation()}>
      <div className="nm-modal-h">
        <button type="button" className="nm-modal-back" aria-label="닫기" onClick={onClose}><DuetIcon name="chevronLeft" size={20} /></button>
        <b>루틴 · {room.name}</b>
      </div>
      <div className="nm-rr-b">
        <button type="button" role="switch" aria-checked={f.on} className={`yset-item${f.on ? " on" : ""}`} onClick={() => set({ on: !f.on })}>
          <span className="si-lbl"><span className="si-t">루틴 켜기</span><span className="si-d">{f.on ? cycleLine(f) : "꺼 두면 안 울려"}</span></span>
          <span className="si-sw" aria-hidden />
        </button>

        <h2 className="yset-sec">언제</h2>
        <div className="nm-rr-quick">
          {QUICK.map((q) => <button key={q.label} type="button" className="nm-rr-chip" onClick={() => set(q.set)}>{q.label}</button>)}
        </div>
        <div className="nm-rr-seg" role="group" aria-label="주기">
          {MODES.map(([m, label]) => <button key={m} type="button" aria-pressed={f.mode === m} onClick={() => set({ mode: m })}>{label}</button>)}
        </div>
        {f.mode === "hours" ? (
          <div className="nm-rr-row"><Num label="몇 시간마다" value={f.every} lo={1} hi={24} onChange={(every) => set({ every })} /><span>시간마다</span><Num label="몇 분에" value={f.min} lo={0} hi={59} onChange={(min) => set({ min })} /><span>분에</span></div>
        ) : null}
        {f.mode === "days" ? (
          <div className="nm-rr-row"><Num label="며칠마다" value={f.days} lo={1} hi={365} onChange={(days) => set({ days })} /><span>일마다 · 하루 {f.times.length}번</span></div>
        ) : null}
        {f.mode === "week" ? (
          <div className="nm-rr-wd" role="group" aria-label="요일">
            {WD.map((w, i) => <button key={w} type="button" aria-pressed={f.wd.includes(i)} className={`nm-rr-chip${f.wd.includes(i) ? " on" : ""}`} onClick={() => set({ wd: f.wd.includes(i) ? f.wd.filter((x) => x !== i) : [...f.wd, i].sort() })}>{w}</button>)}
          </div>
        ) : null}
        {f.mode !== "hours" ? <Times times={f.times} onChange={(times) => set({ times })} /> : null}

        <h2 className="yset-sec">뭐라고</h2>
        <label className="nm-rr-field"><span>글 · 방에 올라가는 말</span><textarea rows={3} maxLength={2000} value={f.text} onChange={(e) => set({ text: e.target.value })} /></label>
        <label className="nm-rr-field"><span>지침 · 울릴 때 글 뒤에 같이 나감</span><textarea rows={3} maxLength={2000} value={f.rule} onChange={(e) => set({ rule: e.target.value })} /></label>

        {crew.length ? (
          <>
            <h2 className="yset-sec">누구 · {left === crew.length ? "모두" : `${left}명`}</h2>
            <div className="nm-rr-crew">
              {crew.map((c) => { const on = !skip.includes(c.who); return (
                <button key={c.id} type="button" aria-pressed={on} className={`nm-rr-chip nm-rr-one${on ? " on" : ""}`} onClick={() => { setSkip(on ? [...skip, c.who] : skip.filter((x) => x !== c.who)); setSaved(false); }}><FaceImg id={c.id} size={22} />{c.name}</button>
              ); })}
            </div>
            {left === 0 ? <p className="nm-rr-note" role="alert">한 명은 남겨 줘</p> : null}
          </>
        ) : null}

        {go.error ? <p className="nm-rr-note" role="alert">못 바꿈 — {go.error instanceof Error ? go.error.message : "다시 해 줘"}</p> : null}
        {saved ? <p className="nm-rr-note" role="status">{!f.on ? "저장했어 · 꺼 둠" : next ? `저장했어 · 다음 울림 ${next}` : "저장했어"}</p> : null}
        <button type="button" className="nm-rr-save" disabled={!ready || go.isPending} onClick={save}>{go.isPending ? "저장하는 중" : "저장"}</button>
        {timer ? (
          sure ? (
            <div className="nm-rr-sure">
              <span>이 방 루틴을 지울까?</span>
              <button type="button" onClick={() => setSure(false)}>아니</button>
              <button type="button" disabled={go.isPending} onClick={() => go.mutate({ off: true })}>지우기</button>
            </div>
          ) : <button type="button" className="nm-rr-del" onClick={() => setSure(true)}>루틴 지우기</button>
        ) : null}
      </div>
    </div>
  );
}

/** 방 상단에서 여는 시트 — 표를 받은 뒤에 폼을 만든다(받기 전에 빈 폼으로 안 덮음). */
export function RoomRoutineSheet({ room, onClose }: { room: OfficeRoom; onClose: () => void }) {
  const q = useRoomTimers();
  return createPortal(q.isLoading ? null : <Sheet room={room} timer={q.data?.[room.id]} onClose={onClose} />, document.body);
}

/** 방 상단 목록 줄 — 지금 상태 한 마디. */
export function routineLabel(t?: RoomTimer) {
  if (!t) return "루틴 만들기";
  if (t.on === false) return "루틴 · 꺼 둠";
  const n = nextLine(t.next_ts);
  return n ? `루틴 · 다음 ${n}` : "루틴";
}
