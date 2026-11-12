// 요약 대기열 판(시아 05:20 · 06:44 · 깃) — 「뉴스 요약」(./feed.tsx) · Digest(../home/news-summary.tsx) 두 곳 같은 꼴 · 상태 가르기 = ./task-state.ts
import "./task-panel.css";   // 판 css = 판 파일에(대시보드만 열 때 feed 조각이 안 와서 꾸밈 0 · 시아 08:21)
import { useEffect, useRef, useState } from "react";
import { qCanRetry } from "./q-acts";
import { panelOf, stageDur, stageTimes, taskOf } from "./task-state";
export type QItem = { id?: string; t?: number; title?: string; via?: string; key?: string; alt1?: string; status?: string; tries?: number; why?: string | { cause?: string; text?: string } };
export type Eta = Partial<Record<"url" | "ask", { p50?: number; p90?: number }>>;
export type QCardT = { it: QItem; e: string; title: string };
const Q_CAUSE: Record<string, string> = { input: "원문 문제", external: "외부 장애", system: "시스템 문제" };
const tkSecs = (ms: number) => (ms < 60e3 ? `${Math.max(1, Math.round(ms / 1000))}초` : `${Math.round(ms / 60e3)}분`);
/** 실패 카드 손 = 「재시도」 · 「없애기」(옛 피드 맨 위 qp-redo · qp-dismiss · ./q-acts.ts) — 없으면 안 그림(Digest 판 그대로) */
export type QActs = { onRetry?: (it: QItem) => Promise<string>; onDismiss?: (it: QItem) => void };
// 요약 중 카드(형 11-12 06:17 「… 요약 대기열 이라고 검정색으로 블록을 씌워버렷는데 블록씌우지말고 기존 형태를 유지할게 … 요청은 이미 애초에 들어온거니까 요청이 들어갈필요는 없고 … 링크가 저렇게 보일 필요는 없고, 요약중일때는 클릭하면 링크가 나오게하면됨」 ·
//   06:18 「응 그리고, 이 형태를 저기에 녹여주면됨, 요약중인거는 조금 크게 보여도 되니까 … 세분화해서 진행중인과정이 잘 보이면 더 좋음」(본보기 = 「Thinking Ns」 세로 진행 줄) · 07:55 「글구 이런거 실패하면.취소할수잇게해줘.」 · 07:56 「… 폰에사도 목업 동일 적용」)
//   = 검은 판 0 · 다른 요약 카드와 같은 테 한 장(조금 크게) · 머리 「요약 중 N초」 · 그 아래 세로 줄 = 실제로 아는 단계만(접수 시각 → 차례 → 요약 쓰는 중 N초 · 예상 % → 피드에 올리는 중) · 지금 단계 = 도는 고리 + 글자 빛 훑기 · 지난 단계 = 흐림
//   서버는 단계 · 시각을 안 남김(번개 11-12 07:53 「없음」 · functions/api/pending.js) → 지어낸 단계 0 · 막대 = 요약 · 프롬프트 · 카드(「요청」 뺌) · 제목의 주소 글자 0 · 누르면 원문 링크 · 실패 = 「다시」 · 「취소」(묻는 창 = 아침 삭제 창 꼴)
const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const linkOf = (it: QItem) => [it.key, it.alt1].map((x) => String(x || "")).find((x) => /^https?:\/\//i.test(x)) || "";
const hhmm = (t?: number) => (t ? new Date(t).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }) : "");
function TaskCard({ c, eta, pos, onRetry, onDismiss }: { c: QCardT; eta: Eta | null; pos?: number; onOpen?: () => void } & QActs) {
  const { it, e, title } = c, { fail, fed, wait, run, label } = taskOf(it.status, e);
  const [arm, setArm] = useState(false), [sending, setSending] = useState(false), [err, setErr] = useState(""), [ask, setAsk] = useState(false), armT = useRef(0);
  const [, tick] = useState(0);
  useEffect(() => { if (fail) return undefined; const t = window.setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, [fail]);   // 초가 차오름(본보기 「Thinking Ns」)
  useEffect(() => () => clearTimeout(armT.current), []);
  const canRe = fail && !!onRetry && qCanRetry(it);
  const redo = async () => {
    if (sending || !onRetry) return;
    if (it.via !== "요약요청" && !arm) { setArm(true); clearTimeout(armT.current); armT.current = window.setTimeout(() => setArm(false), 3000); return; }
    clearTimeout(armT.current); setArm(false); setSending(true); setErr("");
    const why = await onRetry(it).catch((x) => String((x as Error)?.message || x));
    setSending(false);
    if (why) setErr(why);
  };
  const p = eta?.[it.via === "요약요청" ? "ask" : "url"], el = it.t ? Math.max(0, Date.now() - it.t) : 0;
  const pct = run && e === "processing" && p?.p50 ? Math.min(95, Math.floor((el / p.p50) * 100)) : 0;
  const url = linkOf(it), name = String(title || "").replace(/https?:\/\/\S+/gi, "").replace(/\s+/g, " ").trim() || hostOf(url) || "요약 요청";
  const w: { cause?: string; text?: string } = typeof it.why === "string" ? { text: it.why } : it.why || {};
  const head = fail ? "요약 멈춤" : fed ? `피드에 올리는 중 · ${tkSecs(el)}` : wait ? `차례 기다림${pos ? ` · ${pos}번째` : ""}` : `요약 중 ${tkSecs(el)}`;
  const now = Date.now(), cur = fail ? "fail" : fed ? "fed" : wait ? "wait" : "run";
  const dur = stageDur(it.t, stageTimes(String(it.id || it.t || name), now, cur), cur, now), dm = (ms: number | null) => (ms == null ? "" : tkSecs(ms));
  const log: [string, "done" | "cur" | "fail" | "next", string?][] = [
    [`접수${it.t ? ` · ${hhmm(it.t)}` : ""}`, "done"],
    [wait ? `차례${pos ? ` · ${pos}번째` : ""}` : "차례 받음", wait ? "cur" : "done", dm(dur.wait)],
    [fail ? "요약 멈춤" : e === "retry" ? `다시 요약 · 시도 ${it.tries || 2}` : "요약", fail ? "fail" : run ? "cur" : wait ? "next" : "done", [dm(dur.run), run && pct ? `보통의 ${pct}%` : ""].filter(Boolean).join(" · ")],
    ["피드에 올림", fed ? "cur" : "next", dm(dur.fed)],
  ];
  const open = () => { if (!fail && url) window.open(url, "_blank", "noopener"); };
  const bars: [string, string][] = [["요약", fail ? "fail" : fed ? "done" : run ? "cur" : ""], ["프롬프트", ""], ["카드", ""]];
  return (
    <div className={`nm-tk2${fail ? " fail" : ""}${run || fed ? " live" : ""}`} role="article" aria-label={`${name} · ${label}`} onClick={open} title={url && !fail ? "누르면 원문" : undefined}>
      <div className="nm-tk2-top"><i className="nm-tk2-ring" aria-hidden /><b className="nm-tk2-h">{head}</b>{url ? <span className="nm-tk2-src">{hostOf(url)}</span> : null}</div>
      <p className="nm-tk2-t">{name}</p>
      <ol className="nm-tk2-log h">{log.map(([t, k, sub]) => <li key={t} className={k}><i aria-hidden /><span>{t}</span>{sub ? <em>{sub}</em> : null}</li>)}</ol>   {/* 가로 = 선 하나에 점 넷 · 사이 › · 단계 밑 걸린 분(형 11-13 02:26) · 앞 판 = 세로 · 다음 단계 숨김 */}
      {fail ? <p className="nm-tk2-why">{w.cause && Q_CAUSE[w.cause] ? <b>{Q_CAUSE[w.cause]}</b> : null}{w.text || "사유 기록 없음"}</p> : null}
      <div className="nm-sumc-prog">{bars.map(([b, k]) => <span key={b} className={k}><i>{b}</i><em /></span>)}</div>
      {fail && (canRe || onDismiss) ? (
        <div className="nm-tk2-acts" onClick={(ev) => ev.stopPropagation()}>
          {ask ? (
            <><span className="ask">취소 하시겠습니까?</span><button type="button" className="no" onClick={() => setAsk(false)}>아니오</button><button type="button" onClick={() => { setAsk(false); onDismiss?.(it); }}>예</button></>
          ) : (
            <>{canRe ? <button type="button" className={`re${arm ? " arm" : ""}`} disabled={sending} onClick={() => void redo()}>{sending ? "보내는 중…" : arm ? "한 번 더" : "다시"}</button> : null}{onDismiss ? <button type="button" disabled={sending} onClick={() => setAsk(true)}>취소</button> : null}{err ? <span className="nm-tk-err" role="alert">{err}</span> : null}</>
          )}
        </div>
      ) : null}
    </div>
  );
}
export function TaskPanel({ qs, eta, onOpen, onRetry, onDismiss }: { qs: QCardT[]; eta: Eta | null; onOpen?: () => void } & QActs) {
  const rows = [...qs].sort((a, b) => (a.it.t || 0) - (b.it.t || 0));   // 요청한 차례대로
  const waitPos = new Map<QCardT, number>(); let wn = 0;
  for (const c of rows) { const t = taskOf(c.it.status, c.e); if (!t.fail && !t.fed) waitPos.set(c, ++wn); }
  const { total, done } = panelOf(qs.map((c) => ({ status: c.it.status, e: c.e })));
  return (
    <section className="nm-tasks2" aria-label={`요약 중 ${total - done}건 · 끝 ${done}건`}>
      {rows.map((c) => <TaskCard key={`${c.it.id || c.it.t}`} c={c} eta={eta} pos={waitPos.get(c)} onOpen={onOpen} onRetry={onRetry} onDismiss={onDismiss} />)}
    </section>
  );
}
