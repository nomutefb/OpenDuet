// PC 반갈 오른쪽 아래 = 실시간 뉴스 「제목만」 목록(형 11-05 14:39 「웅 pc판은 아예 뉴스에 아예 그림안뜨게 컴팩트하게 타이틀만 보이게 가보자.」 · 「사무실에서 쓰니까.」 · 「모던한 느낌으로다가.」 · 「쟂빛블랙 반투명에 살짝 글래스모피즘」)
//   재료·거름 = 홈 카드 덱과 같음(./news-feed.tsx 의 firstJson · modernData · pickUrl · homeMeta · ./home-pool.ts homePool = 에디터 홈과 같은 후보 · 사본 0) · 사진 받기(linkcard) 0
//   줄 = 순위 · 제목 · 출처 · 몇 분 전 · 점수 · 끝에 작은 「전송」(= 그 기사로 요약 요청 폼 · send-button.tsx 와 같은 열쇠 nm_ask_prefill → #/ask)
//   제목 누름 = 원문 새 창(형 11-05 12:27 「링크같은거는 항상 클릭하면 새 창에서」) · 1분마다 다시 받음(보일 때만)
import "./news-list.css";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ALPHA_EVERY, ALPHA_KEY, type Cand, firstJson, homeMeta, modernData, pickUrl } from "./news-feed";
import { homePool } from "./home-pool";
import { cleanTitle } from "./title-clean";   // 제목 다듬기 로직(형 11-05 16:14)

type Row = { key?: string; title?: string; title_clean?: string; items?: { src?: string; url?: string }[]; src?: string; at?: string; score?: number | null; rank?: number | null; urls?: string[]; meta?: { published?: { at?: string; sourceUrl?: string; sourceName?: string } } };
const PREFILL_KEY = "nm_ask_prefill", EVERY = 60_000, MAX = 40, FRESH_MS = 8 * 3600_000;   // 8시간 넘은 기사 = 뺌(형 11-05 15:49 「35시간전 뭐여. 8시간 전은 다 쳐내셈..」)

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
      const { rows: r, lookup } = md.project(overlap, cands, articles, () => null, { mixNews: ALPHA_EVERY[a], alphaProfile: alpha, visibleCandidates: homePool(cands, triage, merges), urls: (x: Cand) => [pickUrl(x)], metadata: homeMeta, images: null, picks });
      if (!live) return;
      const now = Date.now();
      const lk = lookup as Map<string, { published?: string; first_seen?: string; media?: string }> | undefined;
      // 묶음(overlap) 줄 = 기사 메타가 없음 → 그 묶음의 가장 새 신호 시각(signals.newest)으로(형 11-05 16:30 「4위도 싹다. 몇분전인지 몇시간전인지」)
      const gen = (overlap as { generated?: string } | null)?.generated || undefined;
      const newest = new Map<string, string>();
      for (const cl of ((overlap as { clusters?: { urls?: string[]; signals?: { newest?: string } }[] } | null)?.clusters || [])) for (const u of cl.urls || []) if (cl.signals?.newest && !newest.has(u)) newest.set(u, cl.signals.newest);
      const strip = (n?: string) => String(n || "").replace(/^(?:tbs_pop|tbs|editor|rss|sns)[:.]/i, "").trim();   // 「tbs:보배드림」 → 「보배드림」(실물 16:4x)
      const srcName = (x: Row) => { for (const it of x.items || []) { const n = String(it.src || "").replace(/^(?:tbs_pop|tbs|editor|rss|sns)[:.]/i, ""); if (n && !/^(?:candidates|social_candidates|x_top10|gtrends)/i.test(n) && !/\(/.test(n)) return n; } return ""; };
      const host = (u?: string) => { try { return u ? new URL(u).hostname.replace(/^www\./, "") : ""; } catch { return ""; } };
      // 출처 · 시각 = 모든 줄(형 11-05 16:30 「뉴스는 점수 좌측에 출처에 대한 내용이 있어야되고, 몇시간전인지 나와야됨. 4위도 싹다.」) — 메타 없으면 묶음 첫 기사 출처 · 후보 장부(lookup) 발행/처음 본 때
      const list = (r as Row[]).map((x) => { if (!x) return x; const c = x.key && lk?.get ? lk.get(x.key) : undefined; return { ...x, title: x.title_clean || cleanTitle(x.title), src: strip(x.meta?.published?.sourceName) || strip(c?.media) || srcName(x) || host(x.meta?.published?.sourceUrl || x.urls?.[0]), at: x.meta?.published?.at || c?.published || c?.first_seen || (x.urls || []).map((u) => newest.get(u)).find(Boolean) || gen };   // 끝 받침 = 순위 만든 때(overlap.generated) }).filter((x) => { if (!x || !x.title) return false; const t = Date.parse(x.at || ""); return !Number.isFinite(t) || now - t <= FRESH_MS; }).slice(0, MAX);
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
      <div className="nm-nlist-h"><i className="live" aria-hidden /><b>실시간 뉴스</b><span>{st === "ready" ? `${rows.length}건` : ""}</span></div>
      {st !== "ready" ? (
        <p className="nm-nlist-empty">{st === "loading" ? "받는 중…" : st === "empty" ? "지금 보여 줄 기사가 없어." : "기사 순위를 못 받았어."}</p>
      ) : (
        <ol className="nm-nlist-ol">
          {rows.map((row, i) => (
            <li key={row.key || row.urls?.[0] || i} className={i < 3 ? "top" : undefined}>   {/* 1~3위 = 번호·제목 라임(형 15:49) */}
              <span className="rk">{i + 1}</span>   {/* 차례 번호(순위 그대로면 1 · 6 · 7 띄엄 · 뎅 11-05 15:0x 실물) */}
              <button type="button" className="tt" title={row.title} onClick={() => open(row)}>{row.title}</button>
              <span className="mt">{row.src || ""}{row.at ? <em>{ago(row.at)}</em> : null}</span>
              {Number.isFinite(row.score as number) ? <span className="sc">{Math.round(row.score as number)}</span> : null}
              <button type="button" className="sd" aria-label="이 기사로 요약 요청" title="이 기사로 요약 요청" onClick={() => send(row)}>전송</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
