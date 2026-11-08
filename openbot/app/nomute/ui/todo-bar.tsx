// 밥상 할 일 띠(형 11-04 11:51 「이 밥상에 해야될일을 정립해서 공지랑은 별도로 할일이 체크리스트로 담당자. 해야될일이 시작된 시각. 경과된 이후 몇분 경과했는지가 다 나오게 해줄 수 있어? 담당자도 나오게」 · 11:52 「마치 공지사항 처럼」)
//   자리 = 방 고정 띠 칸(./pins.tsx nm-pin-slot · 공지 띠 꼴) · 접힘 = 「할 일 N · 첫 일」 한 줄 · 누름 = 펼침 = 줄마다 ○/✓ · 일 · 담당(얼굴·이름) · 시작 HH:MM · N분 지남
//   자료 = 뜸 서버 GET /api/office/todo(editor#2381 · items[{id, room, text, who[], start, done_at, done_by}]) · 형 손 = 줄 앞 동그라미 = 끝/되돌림(POST {done|undo}) · 30초마다 다시 셈
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type OfficePerson, idOf, office, people } from "../data/office";
import { FaceStack } from "./faces";
import { whoName } from "./who-name";
import "./todo-bar.css";

type Todo = { id: string; room?: string; text: string; who?: string[]; start?: string | number; done_at?: string | number | null; done_by?: string; by?: string };
const KEY = ["nomute", "todo"];
const ms = (v?: string | number | null) => (v == null || v === "" ? NaN : typeof v === "number" ? (v < 1e12 ? v * 1000 : v) : Date.parse(v));
const hm = (t: number) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const ago = (t: number, now: number) => { const m = Math.max(0, Math.floor((now - t) / 60000)); return m < 60 ? `${m}분 지남` : `${Math.floor(m / 60)}시간 ${m % 60}분 지남`; };

/** 이 방 할 일(안 끝난 것) · 30초마다 · 줄 앞 동그라미 = 끝(형 손) — 띠(TodoBar)와 PC 대화창 머리 접는 칸(./chat-head.tsx)이 같이 씀 */
export function useTodos(room: string) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: () => office<{ items?: Todo[] }>("todo").then((j) => j.items || []), staleTime: 20_000, refetchInterval: 30_000, retry: 1 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data as OfficePerson[] | undefined;
  const [now, setNow] = useState(() => Date.now()), [busy, setBusy] = useState("");
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(t); }, []);
  const items = (q.data || []).filter((x) => (x.room || "guide") === room && !x.done_at);
  const nm = (w: string) => list?.find((p) => p.who === w)?.name || whoName(w);
  const mark = async (it: Todo) => {
    setBusy(it.id);
    try { await office("todo", { method: "POST", body: JSON.stringify({ done: it.id }) }); await qc.invalidateQueries({ queryKey: KEY }); } finally { setBusy(""); }
  };
  return { items, list, now, busy, nm, mark };
}

/** 할 일 줄 목록(펼친 꼴) */
export function TodoRows({ t }: { t: ReturnType<typeof useTodos> }) {
  const { items, list, now, busy, nm, mark } = t;
  return (
    <ul className="nm-todo-l">
      {items.map((it) => {
        const st = ms(it.start), who = (it.who || []).filter(Boolean);
        return (
          <li key={it.id}>
            <button type="button" className="ck" aria-label={`「${it.text}」 끝으로`} disabled={busy === it.id} onClick={() => void mark(it)} />
            <span className="b">
              <span className="t">{it.text}</span>
              <span className="m">
                {who.length && list ? <><FaceStack ids={who.slice(0, 3).map((w) => idOf(w, list))} size={16} /><b>{who.map(nm).join(" · ")}</b></> : null}
                {Number.isFinite(st) ? <><span>{hm(st)} 시작</span><span className="ago">{ago(st, now)}</span></> : null}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function TodoBar({ room }: { room: string }) {
  const t = useTodos(room);
  const [open, setOpen] = useState(false);
  const items = t.items;
  if (!items.length) return null;
  const first = items[0];
  return (
    <div className={`nm-todo${open ? " open" : ""}`}>
      <button type="button" className="nm-todo-h" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l2 2 4-4" /><rect x="4" y="4" width="16" height="16" rx="3" /></svg>
        <b>할 일 {items.length}</b>
        {open ? null : <span className="t">{first.text}</span>}
        <svg aria-hidden className="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open ? <TodoRows t={t} /> : null}
    </div>
  );
}
