// 네비 4번 「뉴스 에디터」(형 11-09 08:50 「뉴스 에디터가 4번 메뉴에 보이게 해주고 / 요약된 내용이 여기에 일제히 나오게 해줘 어떻게구성할지는 잘 싱각해봐」 · 시아 08:54 구성 안 · 봄 33) · 형 09:32 「뜸은 ui에 붙으면 돼」)
//   PC(넓음) = 두 칸: 왼쪽 58 목록 · 오른쪽 = 고른 기사 한 장(모달 대신 · ./news-detail.tsx 그대로) · 폰 = 한 줄 · 카드 누르면 기사 한 장이 화면 통째(「목록」 = 보던 자리로)
//   왼쪽 위→아래: ① 「지금 뜨는 말」 흐르는 띠(옛 에디터 실검 티커 = /api/trends gtrends 상위 10 · 장식) ② 넣는 줄 = 링크·글 + 「전송」(요약 요청 창 기본값 그대로) + 「픽」(외신이면 외신 포함 · ../home/quick-send.ts · 깃 29)
//     ③ 요약 대기열 판(./task-panel.tsx · 「뉴스 요약」과 같은 고르기) ④ 칩 = 전체 · 이슈 · 분야 여섯 · 찾기 ⑤ 요약 카드 = 옛 에디터 「뉴스 요약」 카드(./summary-desk.tsx SumCard) · 이슈·긴급 = 금빛 테 · 고른 카드 = 라임 테 · 내리면 10장씩 더
//   자료 = 「뉴스 요약」(./feed.tsx)과 같은 것(/articles.json + /api/feedlive + /api/pending) · 서랍 「뉴스 요약」 칸은 여기로 합침(서랍 목록에서만 뺌 · #/feed 주소는 그대로)
import "./yeta-settings.css";
import "./chan.css";
import "./sns.css";
import "./news.css";
import "./summary-desk.css";
import "./news-editor.css";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { isForeignUrl, presetFor, submitText } from "../home/quick-send";
import { CATS, type FArt, byFile, feedLiveQuery, isBrk, kindOf, pendQuery, pickQ } from "./feed";
import { catOf, editorPath, newsListQuery, useGo } from "./news-data";
import { NewsDetail } from "./news-detail";
import { newsFileOf } from "./news";   // #/newsed?a=<file> = 그 기사로 바로 열기(k-4 U2)
import { useSplit } from "./side";
import { SumCard } from "./summary-desk";
import { TaskPanel } from "./task-panel";

const CAP = 10;
const ASK_DEF = { h24: 1, fp: 0, mj: 1, og: 0, noai: 1, know: 0 } as const;   // 「전송」 = 요약 요청 창 기본(./ask.tsx DEF)과 같은 값

/** 「지금 뜨는 말」 = 옛 에디터 실검 키워드 티커(viewer/index.html #tkrHost · d.gtrends 상위 10) · 못 받으면 띠 0 */
const kwQuery = queryOptions({
  queryKey: ["nomute", "ned-kw"], staleTime: 300_000, refetchInterval: 300_000,
  queryFn: async () => {
    for (const u of ["/api/trends", `/sns_trends.json?t=${Date.now()}`]) {
      try {
        const r = await fetch(u, { credentials: "same-origin", cache: "no-store" });
        if (!r.ok) continue;
        const t = await r.text(); if (/^\s*</.test(t)) continue;   // HTML = 로그인 벽
        const j = JSON.parse(t) as { gtrends?: { query?: string }[] };
        if (j && Array.isArray(j.gtrends)) return j.gtrends.map((x) => String(x?.query || "").trim()).filter(Boolean).slice(0, 10);
      } catch { /* 다음 길 */ }
    }
    return [] as string[];
  },
});

function Ticker() {
  const kw = useQuery(kwQuery).data || [];
  if (!kw.length) return null;
  const words = (k: string) => kw.map((w, i) => <span key={k + i}>{w}</span>);
  return (
    <div className="nm-ned-tkr" role="note" aria-label={`지금 뜨는 말: ${kw.join(", ")}`}>
      <b>지금 뜨는 말</b>
      <div className="nm-ned-tkr-v" aria-hidden><div className="nm-ned-tkr-track">{words("a")}{words("b")}</div></div>   {/* 두 벌 = -50% 이동이 이음매 없이 돎(옛 .tkr-track) */}
    </div>
  );
}

function SendBar() {
  const qc = useQueryClient();
  const [v, setV] = useState(""), [busy, setBusy] = useState<"" | "send" | "pick">(""), [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  useEffect(() => { if (!msg?.ok) return; const t = window.setTimeout(() => setMsg(null), 4000); return () => clearTimeout(t); }, [msg]);
  const run = async (how: "send" | "pick") => {
    const text = v.trim();
    if (!text || busy) return;
    const url = (/https?:\/\/\S+/i.exec(text) || [""])[0];
    setBusy(how); setMsg(null);
    try {
      await submitText(text, url, how === "pick" ? presetFor(url) : ASK_DEF);
      setV("");
      setMsg({ ok: true, t: how === "pick" && isForeignUrl(url) ? "요약 요청 접수 · 외신 포함" : "요약 요청 접수" });
      void qc.invalidateQueries({ queryKey: ["nomute", "feed-pending"] }); void qc.invalidateQueries({ queryKey: ["nomute", "split-pending"] });
    } catch (e) { setMsg({ ok: false, t: (e as Error).message || "못 보냈어" }); }
    finally { setBusy(""); }
  };
  return (
    <div className="nm-ned-send">
      <form className="nm-ned-send-row" onSubmit={(e) => { e.preventDefault(); void run("send"); }}>
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder="링크 · 글 붙여 넣기 → 전송" aria-label="요약 요청할 링크나 글" enterKeyHint="send" autoComplete="off" spellCheck={false} />
        <button type="submit" className="nm-ned-btn" disabled={!v.trim() || !!busy}>{busy === "send" ? "보내는 중" : "전송"}</button>
        <button type="button" className="nm-ned-btn pick" disabled={!v.trim() || !!busy} title="알아서 주요 기사부터 · 외신이면 외신 포함" onClick={() => void run("pick")}>{busy === "pick" ? "…" : "픽"}</button>
      </form>
      {msg ? <p className={msg.ok ? "nm-ned-sent" : "nm-ned-sent bad"} role="status">{msg.t}</p> : null}
    </div>
  );
}

/** 기사 한 장에 갔다 돌아오면 보던 그대로(폰 · 칩·찾기·개수·스크롤) */
let keep: { q: string; cats: string[]; issue: boolean; n: number; top: number } | null = null;

export function NewsEditor() {
  const go = useGo(), wide = useSplit();
  const [init] = useState(() => keep || { q: "", cats: [] as string[], issue: false, n: CAP, top: 0 });
  const list = useQuery(newsListQuery), live = useQuery(feedLiveQuery), pend = useQuery(pendQuery);
  const [q, setQ] = useState(init.q), [find, setFind] = useState(!!init.q), [cats, setCats] = useState<Set<string>>(() => new Set(init.cats)), [issue, setIssue] = useState(init.issue), [n, setN] = useState(init.n);
  const qa = newsFileOf(useRouterState({ select: (st) => st.location.searchStr }));   // 홈 Digest · 대기열 「열기」 · 스크랩이 넘긴 기사(#/newsed?a=<file>)
  const [sel, setSel] = useState(qa);   // PC = 오른쪽 칸 · 폰 = 화면 통째 기사 한 장
  useEffect(() => { if (qa) setSel(qa); }, [qa]);   // 이미 4번에 있을 때 다른 기사를 넘겨받아도 그 기사로
  const dq = useDeferredValue(q.trim().toLowerCase());
  const all = useMemo(() => {   // 정적 + 빌드 전 새 요약(「뉴스 요약」과 같은 합침)
    const st = (list.data?.arts || []) as FArt[], have = new Set(st.map((a) => a.file)), add = (live.data || []).filter((x) => !have.has(x.file));
    return add.length ? [...add, ...st].sort(byFile) : st;
  }, [list.data, live.data]);
  const byId = useMemo(() => new Map(all.map((a) => [a.file, a])), [all]);
  const isIss = (a: FArt) => isBrk(a) || !!a.issue;
  const rows = useMemo(() => all.filter((a) =>
    (!dq || `${a.title || ""} ${a.title_orig || ""} ${a.media || ""}`.toLowerCase().includes(dq)) &&
    (!cats.size || cats.has(catOf(a)?.[0] || "")) &&
    (!issue || isIss(a))), [all, dq, cats, issue]);   // eslint-disable-line react-hooks/exhaustive-deps
  const issN = useMemo(() => all.filter(isIss).length, [all]);   // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.slice(0, n);
  const qs = useMemo(() => (pend.data ? pickQ(pend.data.items, byId, pend.data.qf) : []), [pend.data, byId]);
  const cur = wide ? (sel && byId.has(sel) ? sel : shown[0]?.file || "") : sel;   // PC 처음 = 맨 위 카드

  const left = useRef<HTMLDivElement>(null), sent = useRef<HTMLDivElement>(null), restored = useRef(false);
  useEffect(() => { keep = null; }, []);
  useEffect(() => {   // 폰: 기사 한 장에서 「목록」 = 보던 자리 · 처음 = 남긴 자리
    if (sel && !wide) return;
    const el = left.current; if (!el) return;
    if (!restored.current && list.data) { restored.current = true; if (init.top) el.scrollTop = init.top; }
  }, [sel, wide, list.data]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 바닥 300px 전 = +10(「뉴스 요약」과 같음)
    const el = sent.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) setN((v) => v + CAP); }, { root: left.current, rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown.length, rows.length, sel, wide]);
  const reset = () => { setN(CAP); if (left.current && left.current.scrollTop > 0) left.current.scrollTop = 0; };
  const tog = (c: string) => { setCats((s) => { const x = new Set(s); if (x.has(c)) x.delete(c); else x.add(c); return x; }); reset(); };
  const topOf = useRef(0);
  const open = (a: FArt) => {
    if (a._live) { keep = { q, cats: [...cats], issue, n, top: left.current?.scrollTop || 0 }; go(editorPath(a.file)); return; }   // 빌드 전 새 요약 = 정적 상세가 아직 없음 → 에디터 그 기사(「뉴스 요약」과 같음)
    if (!wide) topOf.current = left.current?.scrollTop || 0;
    setSel(a.file);
  };
  const back = () => { setSel(""); if (qa) go("/newsed"); requestAnimationFrame(() => { if (left.current) left.current.scrollTop = topOf.current; }); };   // 넘겨받은 기사에서 「목록」 = 주소의 ?a 도 뗌(다시 그 기사로 안 튐)

  const body = (
    <div ref={left} className="nm-ned-l" hidden={!wide && !!sel}>
      <Ticker />
      <SendBar />
      {pend.isError ? <p className="nm-chan-msg" role="status">대기열을 못 읽었어</p> : qs.length ? <TaskPanel qs={qs} eta={pend.data?.eta || null} onOpen={() => go("/edq")} /> : null}
      <div className="nm-ned-chips" role="toolbar" aria-label="기사 거르기">
        <button type="button" className={!cats.size && !issue ? "on" : undefined} onClick={() => { setCats(new Set()); setIssue(false); reset(); }}>전체 <i>{all.length}</i></button>
        <button type="button" className={issue ? "on" : undefined} aria-pressed={issue} onClick={() => { setIssue((v) => !v); reset(); }}>이슈 <i>{issN}</i></button>
        {CATS.map((c) => <button key={c} type="button" className={cats.has(c) ? "on" : undefined} aria-pressed={cats.has(c)} onClick={() => tog(c)}>{c}</button>)}
        <button type="button" className={find ? "on find" : "find"} aria-pressed={find} aria-label="찾기" onClick={() => { setFind((v) => !v); if (find) { setQ(""); reset(); } }}><DuetIcon name="search" size={14} />{wide ? <span>찾기</span> : null}</button>
      </div>
      {find ? (
        <label className="nm-feed-find nm-ned-find">
          <DuetIcon name="search" size={16} />
          <input type="search" autoFocus value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="제목·매체 찾기" aria-label="뉴스 찾기" enterKeyHint="search" autoComplete="off" spellCheck={false} />
          {q ? <button type="button" aria-label="찾는 말 지우기" onClick={() => { setQ(""); reset(); }}><DuetIcon name="x" size={14} /></button> : null}
        </label>
      ) : null}
      {list.isPending ? <p className="nm-chan-msg">기사 읽는 중…</p> : list.isError ? <p className="nm-chan-msg" role="alert">{(list.error as Error).message || "뉴스 요약을 못 읽었어"}</p> : !rows.length ? <p className="nm-chan-msg">{dq || cats.size || issue ? "결과 없음" : "기사가 없어"}</p> : (
        <ul className="nm-ned-list">{shown.map((a) => <li key={a.file}><SumCard a={a} sens={wide} short={!wide} kind={kindOf(a) || (a.issue ? "iss" : "")} on={wide && a.file === cur} onOpen={() => open(a)} /></li>)}</ul>
      )}
      {rows.length > shown.length ? <><div ref={sent} aria-hidden className="nm-feed-sent" /><button type="button" className="nm-ned-more" onClick={() => setN((v) => v + CAP)}>더 보기 +{Math.min(CAP, rows.length - shown.length)} · 남은 {rows.length - shown.length}건</button></> : null}
    </div>
  );
  if (wide) return (
    <div className="nm-ned wide">
      {body}
      <div className="nm-ned-r">{cur ? <NewsDetail key={cur} file={cur} /> : <p className="nm-chan-msg">왼쪽 카드를 누르면 여기 기사 한 장이 떠</p>}</div>
    </div>
  );
  return (
    <div className="nm-ned">
      {body}
      {sel ? (
        <div className="nm-ned-one">
          <button type="button" className="nm-ned-back" onClick={back}><DuetIcon name="chevronLeft" size={16} />목록</button>
          <NewsDetail key={sel} file={sel} />
        </div>
      ) : null}
    </div>
  );
}
