// 일 추가 판(형 11-14 클라우드 세션 창 「추가 수정 삭제도 다 러너에 반영되게」 · 「최대한 카테고라이징해서」 — 노드 영상의 「Add block」 목록 꼴)
//   한 판에 갈래 셋: 누구에게 · 언제(매일 한 번 / 하루 여러 번 / 직접) · 무슨 일(이름 · 할 일) → 미리 보기(다음 깸 · 하루 몇 번) → 만들기
//   서버 = POST schedule/routine {op: add}(editor _schedadd.js · 표 한 줄 한 커밋 · 시계가 1분마다 읽음) · 미리 보기는 쓰기 0
import { type ReactNode, useState } from "react";
import { office } from "../data/office";
import { nextShort } from "./settings-extra";
import "./sched-add.css";

export type AddBot = { bot: string; name: string; face: ReactNode; on: boolean };
type Res = { ok?: boolean; dry?: boolean; error?: string; why?: string; id?: string; name?: string; commit?: string; checked?: boolean; sha?: string; preview?: { next_at?: number; day_max?: number } };
const KST = "CRON_TZ=Asia/Seoul ";
/** 언제 = 고르는 꼴(갈래 · 이름 · cron) — 직접은 다섯 칸을 손으로 */
export const WHEN: { grp: string; items: { id: string; name: string; cron: string }[] }[] = [
  { grp: "매일 한 번", items: [{ id: "d8", name: "아침 8시", cron: "0 8 * * *" }, { id: "d12", name: "낮 12시", cron: "0 12 * * *" }, { id: "d18", name: "저녁 6시", cron: "0 18 * * *" }, { id: "d22", name: "밤 10시", cron: "0 22 * * *" }] },
  { grp: "하루 여러 번(아침 7시 ~ 밤 11시)", items: [{ id: "h2", name: "2시간마다", cron: "0 7-23/2 * * *" }, { id: "h1", name: "1시간마다", cron: "0 7-23 * * *" }, { id: "m30", name: "30분마다", cron: "0,30 7-23 * * *" }] },
];
export const cronOf = (id: string, own: string) => KST + (WHEN.flatMap((g) => g.items).find((x) => x.id === id)?.cron || own.trim());

export function AddRoutine({ bots, bot0 = "", fork, sha, phone, onClose, onDone }: { bots: AddBot[]; bot0?: string; fork: string; sha: string; phone: boolean; onClose: () => void; onDone: (msg: string) => void }) {   // fork = 새 일이 들어갈 묶음(화면엔 안 보임 · 묶음을 고르게 하지 않음 — 형 11-14 「묶음 자체도 애초에 많다」)
  const [bot, setBot] = useState(bot0), [when, setWhen] = useState("d8"), [own, setOwn] = useState("0 9 * * *");
  const [name, setName] = useState(""), [task, setTask] = useState("");
  const [stage, setStage] = useState<"edit" | "dry" | "ask" | "send" | "done">("edit"), [pre, setPre] = useState<Res | null>(null), [msg, setMsg] = useState("");
  const value = () => ({ bot, fork, name: name.trim(), when: [cronOf(when, own)], task });
  const ready = !!bot && !!fork && !!name.trim() && !!task.trim();
  const call = async (dry: boolean) => {
    setMsg(""); setStage(dry ? "dry" : "send");
    try {
      const r = await office<Res>("schedule/routine", { method: "POST", body: JSON.stringify({ op: "add", sha, dry, value: value() }) });
      if (dry) { setPre(r); setStage("ask"); return; }
      setStage("done"); setTimeout(() => onDone(`「${r.name || name}」 만들었어${r.checked ? " · 표에 들어감" : ""}`), 1100);
    } catch (e) { setStage(dry ? "edit" : "ask"); setMsg(/changed/.test(String(e)) ? "다른 데서 표가 바뀌었어 — 닫고 다시 열어 줘" : e instanceof Error ? e.message : String(e)); }
  };
  const lock = stage !== "edit";
  return (
    <div className="nm-rsheet-back nm-yeta" role="presentation" onClick={onClose}>
      <section className="nm-rsheet nm-add" data-phone={phone || undefined} role="dialog" aria-modal="true" aria-label="일 추가" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
        <header className="nm-rsheet-h"><b>일 추가</b><small>봇에게 정해진 때마다 시킬 일을 하나 만들어</small><button type="button" className="nm-rsheet-x" aria-label="닫기" onClick={onClose}>×</button></header>
        <div className="nm-add-body" inert={lock && stage !== "ask" ? true : undefined}>
          <h4>누구에게</h4>
          <div className="nm-add-row" role="radiogroup" aria-label="누구에게">
            {bots.map((b) => <button key={b.bot} type="button" role="radio" aria-checked={bot === b.bot} disabled={lock} className="nm-add-who" data-off={!b.on || undefined} title={b.on ? b.name : `${b.name} · 차단기 내려감`} onClick={() => setBot(b.bot)}>{b.face}<span>{b.name}</span></button>)}
          </div>
          <h4>언제</h4>
          {WHEN.map((g) => (
            <div key={g.grp} className="nm-add-grp">
              <small>{g.grp}</small>
              <div className="nm-add-row" role="radiogroup" aria-label={g.grp}>{g.items.map((x) => <button key={x.id} type="button" role="radio" aria-checked={when === x.id} disabled={lock} className="nm-add-chip" onClick={() => setWhen(x.id)}>{x.name}</button>)}</div>
            </div>
          ))}
          <div className="nm-add-grp">
            <small>직접</small>
            <div className="nm-add-row"><button type="button" role="radio" aria-checked={when === "own"} disabled={lock} className="nm-add-chip" onClick={() => setWhen("own")}>직접 적기</button>
              {when === "own" ? <input className="nm-add-in" value={own} disabled={lock} onChange={(e) => setOwn(e.target.value)} aria-label="분 시 일 월 요일" placeholder="분 시 일 월 요일" /> : null}</div>
          </div>
          <h4>무슨 일</h4>
          <input className="nm-add-in wide" value={name} disabled={lock} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="이름 (예: 아침 점검)" aria-label="이름" />
          <textarea className="nm-add-in wide" rows={4} value={task} disabled={lock} maxLength={4000} onChange={(e) => setTask(e.target.value)} placeholder="봇이 깨어나면 읽을 할 일을 적어 줘" aria-label="할 일" />
        </div>
        {msg ? <p className="nm-add-msg" role="status">{msg}</p> : null}
        <footer className="nm-add-foot">
          {stage === "ask" && pre ? <span className="min-w-0 flex-1">다음 깸 <b>{pre.preview?.next_at ? nextShort(pre.preview.next_at) : "없음"}</b> · 하루 <b>{pre.preview?.day_max ?? "?"}</b>번</span> : <span className="min-w-0 flex-1">{ready ? "" : "누구에게 · 이름 · 할 일을 채워 줘"}</span>}
          {stage === "ask" ? <button type="button" className="nm-sched-chip" onClick={() => { setStage("edit"); setPre(null); }}>고치기</button> : null}
          {stage === "edit" || stage === "dry" ? <button type="button" className="nm-sched-go" disabled={!ready || stage === "dry"} onClick={() => void call(true)}>{stage === "dry" ? "보는 중" : "미리 보기"}</button> : null}
          {stage === "ask" ? <button type="button" className="nm-sched-go" onClick={() => void call(false)}>만들기</button> : null}
          {stage === "send" ? <span className="nm-sched-go firing">보내는 중</span> : null}
          {stage === "done" ? <span className="nm-sched-go okdone" aria-label="만들었어"><svg className="gck" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4 10-10" /></svg></span> : null}
        </footer>
      </section>
    </div>
  );
}
