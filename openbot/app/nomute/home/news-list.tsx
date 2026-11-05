// PC 반갈 오른쪽 아래 = 실시간 뉴스 「제목만」 목록(형 11-05 14:39 「웅 pc판은 아예 뉴스에 아예 그림안뜨게 컴팩트하게 타이틀만 보이게 가보자.」 · 「사무실에서 쓰니까.」 · 「모던한 느낌으로다가.」 · 「쟂빛블랙 반투명에 살짝 글래스모피즘」)
//   재료·거름 = 홈 카드 덱과 같음(./news-feed.tsx 의 firstJson · modernData · pickUrl · homeMeta · ./home-pool.ts homePool = 에디터 홈과 같은 후보 · 사본 0) · 사진 받기(linkcard) 0
//   줄 = 순위 · 제목 · 출처 · 몇 분 전 · 점수 · 끝에 작은 「전송」(= 그 기사로 요약 요청 폼 · send-button.tsx 와 같은 열쇠 nm_ask_prefill → #/ask)
//   제목 누름 = 원문 새 창(형 11-05 12:27 「링크같은거는 항상 클릭하면 새 창에서」) · 1분마다 다시 받음(보일 때만)
import "./news-list.css";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ALPHA_EVERY, ALPHA_KEY, type Cand, firstJson, homeMeta, modernData, pickUrl } from "./news-feed";
import { homePool } from "./home-pool";

type Row = { key?: string; title?: string; score?: number | null; rank?: number | null; urls?: string[]; meta?: { published?: { at?: string; sourceUrl?: string; sourceName?: string } } };
const PREFILL_KEY = "nm_ask_prefill", EVERY = 60_000, MAX = 40;

const ago = (at?: string) => {
  const t = at ? Date.parse(at) : NaN;
  if (!Number.isFinite(t)) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 48 * 60 ? `${Math.round(m / 60)}시간 전` : `${Math.round(m / 1440)}일 전`;
};

export function NewsList() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [st, setSt] = useState<"loading" | "ready" | "empty" | "error">("loading");
  useEffect(() => {
    let live = true, overlap: unknown = null, cands: Cand[] = [], articles: unknown[] = [], triage: unknown = null, merges: unknown = null, alpha: unknown = null, picks: unknown[] = [], picksAt = 0;
    const load = async () => {
      const md = await modernData();
      if (!md) { if (live) setSt("error"); return; }
      const [o, c, ar, tr, mg] = await Promise.all([
        firstJson<unknown>(["/api/trends?f=overlap", "/overlap_latest.json"], (v) => md.validOverlap(v)),
        firstJson<Cand[]>(["/api/candidates", "/candidates.json"], Array.isArray),
        articles.length ? Promise.resolve(articles) : firstJson<unknown[]>(["/articles.json"], Array.isArray),
        firstJson<unknown[]>(["/triage-state.json"], Array.isArray),
        firstJson<unknown>(["/merges.json"], (v) => !!v && typeof v === "object" && !Array.isArray(v)),
      ]);
      if (o) overlap = o; if (c) cands = c; if (ar) articles = ar; if (tr) triage = tr; if (mg) merges = mg;
      if (alpha == null) alpha = (await firstJson(["/feed_alpha.json"])) || {};
      if (!picksAt || Date.now() - picksAt > 2 * 60_000) {
        const pk = await firstJson<{ picks?: unknown[] }>(["/api/trends?f=picks"], (v) => !!v && Array.isArray(v.picks));
        if (pk) { picks = pk.picks || []; picksAt = Date.now(); }
      }
      let a = 0; try { a = Math.max(0, Math.min(ALPHA_EVERY.length - 1, Math.floor(+(localStorage.getItem(ALPHA_KEY) || 0)))); } catch { /* 기본 0 */ }
      const { rows: r } = md.project(overlap, cands, articles, () => null, { mixNews: ALPHA_EVERY[a], alphaProfile: alpha, visibleCandidates: homePool(cands, triage, merges), urls: (x: Cand) => [pickUrl(x)], metadata: homeMeta, images: null, picks });
      if (!live) return;
      const list = (r as Row[]).filter((x) => x && x.title).slice(0, MAX);
      setRows(list);
      setSt(list.length ? "ready" : overlap ? "empty" : "error");
    };
    void load();
    const t = setInterval(() => { if (!document.hidden) void load(); }, EVERY);
    return () => { live = false; clearInterval(t); };
  }, []);
  const send = (row: Row) => {
    const url = row.meta?.published?.sourceUrl || row.urls?.[0] || "";
    try { sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ text: [row.title, url].filter(Boolean).join("\n"), link: url, media: row.meta?.published?.sourceName || "" })); } catch { /* 빈 폼 */ }
    void nav({ to: "/ask" });
  };
  const open = (row: Row) => {
    const url = row.meta?.published?.sourceUrl || row.urls?.[0];
    if (url) window.open(url, "_blank", "noopener");
  };
  return (
    <section className="nm-nlist" aria-label="실시간 뉴스">
      <div className="nm-nlist-h"><b>실시간 뉴스</b><span>{st === "ready" ? `${rows.length}건` : ""}</span></div>
      {st !== "ready" ? (
        <p className="nm-nlist-empty">{st === "loading" ? "받는 중…" : st === "empty" ? "지금 보여 줄 기사가 없어." : "기사 순위를 못 받았어."}</p>
      ) : (
        <ol className="nm-nlist-ol">
          {rows.map((row, i) => (
            <li key={row.key || row.urls?.[0] || i}>
              <span className="rk">{row.rank ?? i + 1}</span>
              <button type="button" className="tt" title={row.title} onClick={() => open(row)}>{row.title}</button>
              <span className="mt">{[row.meta?.published?.sourceName, ago(row.meta?.published?.at)].filter(Boolean).join(" · ")}</span>
              {Number.isFinite(row.score as number) ? <span className="sc">{Math.round(row.score as number)}</span> : null}
              <button type="button" className="sd" aria-label="이 기사로 요약 요청" title="이 기사로 요약 요청" onClick={() => send(row)}>전송</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
