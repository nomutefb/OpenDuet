// 요약 대기열 판(시아 05:20 · 06:44 · 깃) — 「뉴스 요약」(./feed.tsx) · Digest(../home/news-summary.tsx) 두 곳 같은 꼴 · 상태 가르기 = ./task-state.ts
import "./task-panel.css";   // 판 css = 판 파일에(대시보드만 열 때 feed 조각이 안 와서 꾸밈 0 · 시아 08:21)
import { useEffect, useRef, useState } from "react";
import { qCanRetry } from "./q-acts";
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
/** 실패 카드 손 = 「재시도」 · 「없애기」(옛 피드 맨 위 qp-redo · qp-dismiss · ./q-acts.ts) — 없으면 안 그림(Digest 판 그대로) */
export type QActs = { onRetry?: (it: QItem) => Promise<string>; onDismiss?: (it: QItem) => void };
function TaskCard({ c, eta, pos, onOpen, onRetry, onDismiss }: { c: QCardT; eta: Eta | null; pos?: number; onOpen?: () => void } & QActs) {
  const { it, e, title } = c, { fail, fed, wait, run, ring, label } = taskOf(it.status, e);
  const [arm, setArm] = useState(false), [sending, setSending] = useState(false), [err, setErr] = useState(""), armT = useRef(0);
  useEffect(() => () => clearTimeout(armT.current), []);
  const canRe = fail && !!onRetry && qCanRetry(it);
  const redo = async () => {   // 링크 = 바로 나가는 쓰기라 두 번(3초 · ./queue.tsx 와 같은 꼴) · 요약요청 = 「요약 요청」 창으로 가서 형이 보냄 = 한 번
    if (sending || !onRetry) return;
    if (it.via !== "요약요청" && !arm) { setArm(true); clearTimeout(armT.current); armT.current = window.setTimeout(() => setArm(false), 3000); return; }
    clearTimeout(armT.current); setArm(false); setSending(true); setErr("");
    const why = await onRetry(it).catch((x) => String((x as Error)?.message || x));
    setSending(false);
    if (why) setErr(why);
  };   // 요약 끝 · 피드 없음 = 반영 중/대기(「완료」 아님 · 봄 06:20 2))
  const [open, setOpen] = useState(true);
  const p = eta?.[it.via === "요약요청" ? "ask" : "url"], el = it.t ? Math.max(0, Date.now() - it.t) : 0;
  const est = run && e === "processing" && p?.p50 && it.t ? { pct: Math.min(95, Math.floor((el / p.p50) * 100)), late: el > (p.p90 || Infinity) } : null;
  const pill = run ? (e === "retry" ? `시도 ${it.tries || 2}` : est && !est.late ? `${est.pct}%` : el ? tkSecs(el) : "") : "";
  // 단계 = 요청 → 요약 → 프롬프트 → 카드 가로 네 칸(형 11-11 18:55 봄 1:1 「그 지금 요약 들어오는거잇지 그 형태를 한번 잘 정렬해봐 순서대로 진행상황」) · 끝 = 라임 · 도는 중 = 라임 줄무늬가 흐름 · 아직 = 회색 · 멈춤 = 빨강 · 기다리는 건 「n번째」(요청한 차례)
  const steps: [string, string, string][] = [["요청", "done", ""], ["요약", fail ? "fail" : fed ? "done" : run ? "run" : "wait", run ? pill : wait && pos ? `${pos}번째` : ""], ["프롬프트", "wait", ""], ["카드", "wait", ""]];
  const done = steps.filter((s) => s[1] === "done").length;
  const w: { cause?: string; text?: string } = typeof it.why === "string" ? { text: it.why } : it.why || {};
  return (
    <div className={`nm-tk ${ring}`}>
      <button type="button" className="nm-tk-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <i className="nm-tk-ring" aria-hidden />
        <span className="nm-tk-t">{title}</span>
        <em title={label}>{fed || fail || wait ? label : `${done}/4`}</em><Chev open={open} />
      </button>
      {open ? <ol className="nm-tk-prog" aria-label={`진행 ${steps.map(([lb, k]) => `${lb} ${k === "done" ? "끝" : k === "run" ? "도는 중" : k === "fail" ? "멈춤" : "아직"}`).join(" · ")}`}>{steps.map(([lb, k, pl]) => <li key={lb} className={k}><i>{lb}{pl ? <b>{pl}</b> : null}</i><em aria-hidden /></li>)}</ol> : null}
      {fail && onOpen ? <button type="button" className="nm-tk-why" onClick={onOpen} title={w.text || ""}>{w.cause && Q_CAUSE[w.cause] ? <b>{Q_CAUSE[w.cause]}</b> : null}{w.text || "사유 기록 없음 — 대기열에서 확인"}</button> : fail ? <p className="nm-tk-why">{w.cause && Q_CAUSE[w.cause] ? <b>{Q_CAUSE[w.cause]}</b> : null}{w.text || "사유 기록 없음"}</p> : null}
      {fail && (canRe || onDismiss) ? (
        <div className="nm-tk-acts">
          {canRe ? <button type="button" className={`nm-tk-act re${arm ? " arm" : ""}`} disabled={sending} onClick={() => void redo()} aria-label={arm ? "한 번 더 누르면 다시 분석" : `다시 요약 — ${title}`}>{sending ? "보내는 중…" : arm ? "한 번 더 = 다시 분석" : "재시도"}</button> : null}
          {onDismiss ? <button type="button" className="nm-tk-act" disabled={sending} onClick={() => onDismiss(it)} aria-label={`이 실패 없애기(확인) — ${title}`}>없애기</button> : null}
          {err ? <span className="nm-tk-err" role="alert">{err}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
export function TaskPanel({ qs, eta, onOpen, onRetry, onDismiss }: { qs: QCardT[]; eta: Eta | null; onOpen?: () => void } & QActs) {
  const [open, setOpen] = useState(true);
  const { total, done, allFed, tail } = panelOf(qs.map((c) => ({ status: c.it.status, e: c.e })));
  const rows = [...qs].sort((a, b) => (a.it.t || 0) - (b.it.t || 0));   // 요청한 차례대로(먼저 요청한 것이 위 · 형 18:55 「순서대로」)
  const waitPos = new Map<QCardT, number>(); let wn = 0;
  for (const c of rows) { const t = taskOf(c.it.status, c.e); if (!t.fail && !t.fed) waitPos.set(c, ++wn); }   // 아직 요약 안 끝난 것 중 몇 번째
  const t0 = Math.min(...qs.map((c) => c.it.t || Date.now())), mins = Math.max(0, Math.round((Date.now() - t0) / 60e3)), tries = Math.max(0, ...qs.map((c) => c.it.tries || 0));
  return (
    <section className={`nm-tasks${open ? "" : " shut"}`} aria-label={`요약 대기열 ${done}/${total} 건`}>
      <button type="button" className="nm-tasks-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Chev open={open} /><b>요약 대기열</b>
        <span className="nm-tasks-meta">{mins}분{tries ? ` · 시도 ${tries}` : ""}</span>
        <em className={allFed ? "lag" : ""}>{tail}</em>
      </button>
      {open ? <div className="nm-tasks-list">{rows.map((c) => <TaskCard key={`${c.it.id || c.it.t}`} c={c} eta={eta} pos={waitPos.get(c)} onOpen={onOpen} onRetry={onRetry} onDismiss={onDismiss} />)}{onOpen ? <button type="button" className="nm-tasks-more" onClick={onOpen}>대기열 열기</button> : null}</div> : null}
    </section>
  );
}
