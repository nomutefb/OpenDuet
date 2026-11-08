// 요약 대기열 판(시아 05:20 · 06:44 · 깃) — 「뉴스 요약」(./feed.tsx) · Digest(../home/news-summary.tsx) 두 곳 같은 꼴 · 상태 가르기 = ./task-state.ts
import "./task-panel.css";   // 판 css = 판 파일에(대시보드만 열 때 feed 조각이 안 와서 꾸밈 0 · 시아 08:21)
import { useState } from "react";
import { panelOf, taskOf } from "./task-state";
export type QItem = { id?: string; t?: number; title?: string; via?: string; key?: string; alt1?: string; status?: string; tries?: number; why?: string | { cause?: string; text?: string } };
export type Eta = Partial<Record<"url" | "ask", { p50?: number; p90?: number }>>;
export type QCardT = { it: QItem; e: string; title: string };
const Q_CAUSE: Record<string, string> = { input: "원문 문제", external: "외부 장애", system: "시스템 문제" };
/** 접기 꺽쇠 = SVG(글자 ⌄›▾▸ 는 글꼴 따라 네모 · 시아 06:44 ②) */
function Chev({ open }: { open: boolean }) {
  return <svg className="nm-tk-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d={open ? "M3 4.5l3 3 3-3" : "M4.5 3l3 3-3 3"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const tkSecs = (ms: number) => (ms < 60e3 ? `${Math.max(1, Math.round(ms / 1000))}초` : `${Math.round(ms / 60e3)}분`);
function TaskCard({ c, eta, onOpen }: { c: QCardT; eta: Eta | null; onOpen: () => void }) {
  const { it, e, title } = c, { fail, fed, run, ring, label } = taskOf(it.status, e);   // 요약 끝 · 피드 없음 = 반영 중/대기(「완료」 아님 · 봄 06:20 2))
  const [open, setOpen] = useState(true);
  const p = eta?.[it.via === "요약요청" ? "ask" : "url"], el = it.t ? Math.max(0, Date.now() - it.t) : 0;
  const est = run && e === "processing" && p?.p50 && it.t ? { pct: Math.min(95, Math.floor((el / p.p50) * 100)), late: el > (p.p90 || Infinity) } : null;
  const pill = run ? (e === "retry" ? `시도 ${it.tries || 2}` : est && !est.late ? `${est.pct}%` : el ? tkSecs(el) : "") : "";
  const steps: [string, string, string][] = [["요약", fail ? "fail" : fed ? "done" : "run", pill], ["프롬프트", "wait", ""], ["카드", "wait", ""]];
  const done = steps.filter((s) => s[1] === "done").length;
  const w: { cause?: string; text?: string } = typeof it.why === "string" ? { text: it.why } : it.why || {};
  return (
    <div className={`nm-tk ${ring}`}>
      <button type="button" className="nm-tk-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <i className="nm-tk-ring" aria-hidden />
        <span className="nm-tk-t">{title}</span>
        <em title={label}>{fed || fail ? label : `${done}/3`}</em><Chev open={open} />
      </button>
      {open ? <ul className="nm-tk-steps">{steps.map(([lb, k, pl]) => <li key={lb} className={k}><i aria-hidden />{lb}{pl ? <em>{pl}</em> : null}</li>)}</ul> : null}
      {fail ? <button type="button" className="nm-tk-why" onClick={onOpen} title={w.text || ""}>{w.cause && Q_CAUSE[w.cause] ? <b>{Q_CAUSE[w.cause]}</b> : null}{w.text || "사유 기록 없음 — 대기열에서 확인"}</button> : null}
    </div>
  );
}
export function TaskPanel({ qs, eta, onOpen }: { qs: QCardT[]; eta: Eta | null; onOpen: () => void }) {
  const [open, setOpen] = useState(true);
  const { total, done, allFed, tail } = panelOf(qs.map((c) => ({ status: c.it.status, e: c.e })));
  const t0 = Math.min(...qs.map((c) => c.it.t || Date.now())), mins = Math.max(0, Math.round((Date.now() - t0) / 60e3)), tries = Math.max(0, ...qs.map((c) => c.it.tries || 0));
  return (
    <section className={`nm-tasks${open ? "" : " shut"}`} aria-label={`요약 대기열 ${done}/${total} 건`}>
      <button type="button" className="nm-tasks-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Chev open={open} /><b>요약 대기열</b>
        <span className="nm-tasks-meta">{mins}분{tries ? ` · 시도 ${tries}` : ""}</span>
        <em className={allFed ? "lag" : ""}>{tail}</em>
      </button>
      {open ? <div className="nm-tasks-list">{qs.map((c) => <TaskCard key={`${c.it.id || c.it.t}`} c={c} eta={eta} onOpen={onOpen} />)}<button type="button" className="nm-tasks-more" onClick={onOpen}>대기열 열기</button></div> : null}
    </section>
  );
}
