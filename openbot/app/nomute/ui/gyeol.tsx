// 채널 전체 › 「결과 함께」(결의 곡 · 뮤비) = 옛 에디터 renderChanGyeol(viewer/index.html · #981 · 형 261026 「9대16으로 항상 만들어질건데」 · 「올리는 사람도 편하게」)을 앱 안으로
//   (형 11-10 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · team-4 U3 뎅 · 앞 판 = 「나머지는 에디터에서」 한 겹)
//   이 판 = 한눈에(곡 큰 숫자 · 트랙 · 뮤비 · 안 올린 곡 · 뮤비 없는 곡) + 뮤비 보드(9:16 · 같은 곡 = 한 칸 · 최신/점수/★/안 올림) + 보기 창(재생 · ▲▼ · 받기 · 글 복사 · 올림 표시 · 의도 · 결의 평)
//   + 나머지 여섯 칸(결의 평 · 흐름 · 곡 목록 · 오늘 재료 · 게시 현황 · 최근 활동 · 아래 GyRest) → 채널 전체 맨 아래 「나머지는 에디터에서」 뺌(결과 함께가 에디터 몫의 전부였음)
//   데이터 = 원본 chanGet('gyeol') 차례: /api/chan?f=gyeol → /gyeol_data.json · 올림 표시 = 설정 서버 gyPost(원본 gyPostToggle · 키 = 곡 트랙 id + 영상 경로 · 모든 기기 같이)
import "./gyeol.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getJson } from "./news-data";
import { hookOf, postKey } from "./gyeol-data";

import type { Mv } from "./gyeol-data";
type Rev = { song?: string; score?: number; score_why?: string; mv?: boolean; one?: string; good?: string[]; bad?: string[]; next?: string[]; date?: string };
type Song = { req_id?: string; title?: string; at?: string; starred?: boolean; hypo?: boolean; link?: string; mv?: Mv[]; reviews?: Rev[]; intent?: { purpose?: string; label?: string; genre?: string } };
type RoomSong = { id: string; title?: string; lyrics?: string; hypo?: boolean };
type Flow = { kind?: string; hypo?: boolean; title?: string; starred?: boolean; at?: string; link?: string; video_url?: string };
type Seed = { url?: string; rank?: number | string; over?: boolean; title?: string; terms?: string[] };
type Act = { type?: string; link?: string; text?: string; at?: string };
export type Gy = { generated_kst?: string; summary?: { songs?: number; last_song_at?: string }; songs?: (Song & { takes?: number; duration_s?: number })[]; room?: { songs?: RoomSong[] }; flow?: Flow[]; sources?: { gl?: { ok?: boolean; err?: string } };
  seeds_today?: { top?: Seed[]; woke?: number; songs?: number; confirmed?: boolean }; accounts?: Record<string, string>; posts?: { yt?: { items?: { url?: string; title?: string; at?: string }[] } }; activity?: Act[] };
type Post = { id: string; ts: number };
type Settings = { gyPost?: Post[]; error?: string; code?: string; settings?: Settings };
const SKEY = ["nomute", "settings"] as const;   // 잠금 · 메모와 같은 설정 칸(./lock.tsx)
const FIRST = 8;

async function getGy(): Promise<Gy | null> {   // 원본 chanGet 차례 · HTML(SPA 폴백) = 건너뜀
  for (const u of ["/api/chan?f=gyeol", `/gyeol_data.json?ts=${Date.now()}`]) {
    try {
      const r = await fetch(u, { credentials: "same-origin", signal: AbortSignal.timeout(12000) });
      if (!r.ok) continue;
      const t = await r.text(); if (/^\s*</.test(t)) continue;
      const j = JSON.parse(t) as Gy; if (j?.generated_kst) return j;
    } catch { /* 다음 길 */ }
  }
  return null;
}
const md = (s?: string) => { const t = Date.parse(s || ""); if (!Number.isFinite(t)) return ""; const d = new Date(t + 9 * 3600e3); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };   // KST M/D
const ago = (s?: string) => { const t = Date.parse(s || ""); if (!Number.isFinite(t)) return ""; const m = (Date.now() - t) / 60000; return m < 60 ? `${Math.max(1, Math.round(m))}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };
const dur = (x?: number) => { const s2 = Math.round(+(x || 0)); return s2 > 0 ? `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}` : ""; };
const whyOf = (x?: Song) => x?.intent?.purpose || x?.intent?.label || "";
const bl = (a?: string[]) => ((a || []).length > 1 ? (a || []).map((t) => "· " + t).join("\n") : (a || []).join(""));
async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); return true; } catch { /* 폴백 */ }
  try { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch { return false; }
}

type Item = { key: string; t: string; url: string; poster: string; fn: string; copy: string; copyLab: string; notes: { h: string; t: string }[] };
type Grp = { s: Song; n: number; top: Mv; at: string; best: number; star: boolean; up: boolean; vi: number };

export function GyeolBoard() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["nomute", "chan-gyeol"], staleTime: 300_000, refetchInterval: 300_000, queryFn: getGy });
  const sq = useQuery({ queryKey: SKEY, staleTime: 15_000, queryFn: () => getJson<Settings>(`/api/settings?_=${Date.now()}`) });
  const [sort, setSort] = useState<"new" | "score" | "star" | "todo">("new"), [more, setMore] = useState(false), [open, setOpen] = useState(-1), [note, setNote] = useState("");
  const g = q.data, posts = sq.data?.gyPost || [], PS = useMemo(() => new Set(posts.map((x) => x.id)), [posts]);
  const V = useMemo(() => {
    if (!g) return null;
    const songs = g.songs || [], real = songs.filter((x) => !x.hypo), room = g.room?.songs || [];
    const roomBy = new Map(room.map((x) => [x.id, x]));
    const seen = new Set<string>(), mv: (Mv & { s: Song })[] = [];
    real.forEach((s) => (s.mv || []).forEach((m) => { if (!m?.url || seen.has(m.url)) return; seen.add(m.url); mv.push({ ...m, s }); }));   // 원본 gyLedger
    const revs = songs.flatMap((x) => (x.reviews || []).map((r) => ({ r, s: x }))).sort((a, b) => String(b.r.date || "").localeCompare(String(a.r.date || "")));
    const scoreBy = new Map(revs.filter((v) => v.r.score && v.r.song).map((v) => [v.r.song!, +(v.r.score || 0)]));
    const tracks = (room.length ? room : (g.flow || []).filter((x) => x.kind === "song")).filter((x) => !x.hypo).length;
    const upSongs = new Set(mv.filter((m) => PS.has(postKey(m))).map((m) => m.s.req_id)), mvSongs = new Set(mv.map((m) => m.s.req_id));
    const gm = new Map<string, (Mv & { s: Song })[]>(); mv.forEach((m) => { const k = m.s.req_id || m.s.title || m.url; gm.set(k, [...(gm.get(k) || []), m]); });
    let grps = [...gm.values()].map((items) => { items.sort((a, b) => String(b.at || "").localeCompare(String(a.at || ""))); return { s: items[0].s, items, top: items.find((x) => x.poster) || items[0], at: items[0].at || "", best: Math.max(0, ...items.map((x) => scoreBy.get(x.song || "") || 0)), star: !!items[0].s.starred, up: items.some((x) => PS.has(postKey(x))) }; });
    grps.sort((a, b) => b.at.localeCompare(a.at));
    if (sort === "score") grps.sort((a, b) => b.best - a.best || b.at.localeCompare(a.at));
    else if (sort === "star") grps.sort((a, b) => Number(b.star) - Number(a.star) || b.at.localeCompare(a.at));
    else if (sort === "todo") grps = [...grps].sort((a, b) => Number(a.up) - Number(b.up) || b.at.localeCompare(a.at));   // 안 올린 곡 먼저
    const list: Item[] = [], tiles: Grp[] = [];
    grps.forEach((gp) => {
      tiles.push({ s: gp.s, n: gp.items.length, top: gp.top, at: gp.at, best: gp.best, star: gp.star, up: gp.up, vi: list.length });
      gp.items.forEach((m, k) => {
        const s2 = gp.s, it0 = s2.intent || {}, rv = revs.find((v) => v.r.song === m.song)?.r || null, n = gp.items.length, rm = roomBy.get(m.song || "");
        const rt = String(rm?.title || ""), tk = s2.title && rt.startsWith(s2.title) ? rt.slice(s2.title.length).replace(/^\s*·\s*/, "").trim() : "", hk = hookOf(rm?.lyrics);
        list.push({
          key: postKey(m), t: (s2.title || "") + (tk ? " · " + tk : n > 1 ? ` · ${n - k}번째 버전` : ""), url: m.url, poster: m.poster || "",
          fn: [s2.title || "mv", tk].filter(Boolean).join("_").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").slice(0, 60) + ".mp4",
          copy: [s2.title || "", hk.t].filter(Boolean).join("\n\n"), copyLab: hk.t ? (hk.chorus ? "제목·후렴" : "제목·첫 소절") : "제목",
          notes: [{ h: "만든 의도" + (it0.genre ? " · " + it0.genre : ""), t: it0.purpose || it0.label || "" }, { h: "결의 평" + (rv?.score ? ` · ${rv.score}/10` : ""), t: rv?.one || "" }, { h: "아쉬움", t: bl(rv?.bad) }, { h: "좋음", t: bl(rv?.good) }, { h: "다음", t: bl(rv?.next) }].filter((x) => x.t),
        });
      });
    });
    const gl = g.sources?.gl || {}, stale = gl.ok === false || (Date.now() - new Date(g.generated_kst || 0).getTime()) / 3600e3 > 6;
    return { nSong: real.length || +(g.summary?.songs || 0), nHy: songs.length - real.length, tracks, nMv: mv.length, notUp: [...mvSongs].filter((k) => !upSongs.has(k)).length, noMv: real.filter((x) => !(x.mv || []).length).length, last: g.summary?.last_song_at || "", stale, glErr: gl.err || "", list, tiles };
  }, [g, PS, sort]);

  const toggle = async (key: string) => {   // 원본 gyPostToggle = 설정 서버 gyPost(패치 + 기준 = 3자 병합)
    const on = !PS.has(key), rest = posts.filter((x) => x.id !== key), next = on ? [...rest, { id: key, ts: Date.now() }] : rest;
    setNote(on ? "올림 표시 — 저장 중" : "올림 표시 뺌 — 저장 중");
    try {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch: { gyPost: next }, base: { gyPost: posts } }) });
      const j = (await r.json().catch(() => ({}))) as Settings;
      if (r.ok && j.settings) { qc.setQueryData(SKEY, j.settings); setNote(on ? "올림 표시 했어" : "올림 표시 뺐어"); }
      else if (j.code === "settings-conflict" || j.code === "refresh-required") { await qc.invalidateQueries({ queryKey: SKEY }); setNote("다른 기기에서 그새 바뀌어서 다시 불러왔어 — 한 번 더 눌러 줘"); }
      else setNote(j.error || "아직 저장 못 했어 — 잠시 뒤 다시");
    } catch { setNote("네트워크 오류 — 다시"); }
  };
  useEffect(() => { if (open < 0) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(-1); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open]);

  if (q.isLoading) return <p className="nm-chan-msg">결과 함께 읽는 중…</p>;
  if (!g || !V) return <p className="nm-chan-msg">{q.isError ? "결과 함께를 못 읽었어" : "결과 함께 데이터가 아직 없어"}</p>;
  const shown = more ? V.tiles : V.tiles.slice(0, FIRST), it = open >= 0 ? V.list[open] : null;
  return (
    <div className="nm-gy">
      <section className="gy-hero" aria-label="한눈에">
        <span className="gy-eyebrow">결 · 지금까지 만든 곡{V.nHy ? ` · 실험 ${V.nHy}곡 따로` : ""}</span>
        <div className="gy-big"><b>{V.nSong.toLocaleString("ko-KR")}</b><span>곡</span></div>
        <div className="gy-kpis">
          {([[V.tracks, "트랙"], [V.nMv, "뮤비"], [V.notUp, "안 올린 곡"], [V.noMv, "뮤비 없는 곡"]] as [number, string][]).map(([v, lb]) => <div key={lb} className="gy-kpi"><b>{v.toLocaleString("ko-KR")}</b><span>{lb}</span></div>)}
        </div>
        {V.last ? <span className="gy-eyebrow">마지막 곡 {md(V.last)}</span> : null}
        {V.stale ? <span className="gy-eyebrow gy-stale">수집 멎음{V.glErr ? " · " + String(V.glErr).slice(0, 60) : ""}</span> : null}
      </section>
      {V.tiles.length ? (
        <section className="gy-mv" aria-label="뮤비">
          <div className="gy-mv-h"><b>뮤비</b><span>{V.tiles.length}곡 · {V.nMv}편</span>
            {V.tiles.length > 1 ? <span className="yset-chips gy-sort" role="group" aria-label="뮤비 정렬">{([["new", "최신"], ["score", "점수"], ["star", "★"], ["todo", "안 올림"]] as const).map(([k, lb]) => <button key={k} type="button" className={`yset-chip${sort === k ? " on" : ""}`} aria-pressed={sort === k} onClick={() => setSort(k)}>{lb}</button>)}</span> : null}
          </div>
          <div className="gy-board">
            {shown.map((t) => {
              const at = Date.parse(t.at || ""), fresh = Number.isFinite(at) && Date.now() - at < 24 * 3600e3, gn = t.s.intent?.genre;
              return (
                <button key={t.vi} type="button" className={`gy-mvt${t.n > 1 ? " stk" : ""}`} onClick={() => { setNote(""); setOpen(t.vi); }}>
                  <span className="gy-mvt-cv">{t.top.poster ? <img loading="lazy" referrerPolicy="no-referrer" src={t.top.poster} alt="" onError={(e) => e.currentTarget.remove()} /> : null}{fresh ? <span className="gy-mvt-new">NEW</span> : null}{t.n > 1 ? <span className="gy-mvt-n">{t.n}편</span> : null}{t.up ? <span className="gy-mvt-up">올림</span> : null}</span>
                  <span className="gy-mvt-t">{t.s.title || ""}{t.star ? " ★" : ""}</span>
                  {gn ? <span className="gy-mvt-g">{gn}</span> : null}
                  <span className="gy-mvt-m">{t.best ? `${t.best}/10 · ` : ""}{md(t.at)}</span>
                </button>
              );
            })}
          </div>
          {V.tiles.length > shown.length ? <button type="button" className="yset-chip gy-more" onClick={() => setMore(true)}>{V.tiles.length - shown.length}곡 더 보기</button> : null}
        </section>
      ) : null}
      <GyRest g={g} />
      {it ? createPortal(
        <div className="yeta-set gy-view" role="dialog" aria-modal="true" aria-label={it.t} onClick={(e) => { if (e.target === e.currentTarget) setOpen(-1); }}>
          <div className="gy-view-in">
            <div className="gy-view-h"><b>{it.t}</b><button type="button" className="gy-x" aria-label="닫기" onClick={() => setOpen(-1)}>×</button></div>
            <video key={it.url} className="gy-view-v" src={it.url} poster={it.poster || undefined} controls playsInline autoPlay preload="metadata" />
            <div className="gy-view-acts">
              <button type="button" className="yset-chip" disabled={open <= 0} onClick={() => { setNote(""); setOpen((i) => Math.max(0, i - 1)); }} aria-label="앞 뮤비">▲</button>
              <button type="button" className="yset-chip" disabled={open >= V.list.length - 1} onClick={() => { setNote(""); setOpen((i) => Math.min(V.list.length - 1, i + 1)); }} aria-label="다음 뮤비">▼</button>
              <button type="button" className="yset-chip" onClick={() => window.open(`/api/dl?u=${encodeURIComponent(it.url)}&n=${encodeURIComponent(it.fn)}`, "_blank")}>받기</button>
              {it.copy ? <button type="button" className="yset-chip" onClick={async () => { const ok = await copyText(it.copy); setNote(ok ? `${it.copyLab} 복사했어 — 올릴 곳에 붙여넣기` : "복사 못 했어 — 브라우저가 클립보드를 막았어"); }}>{it.copyLab} 복사</button> : null}
              <button type="button" className={`yset-chip${PS.has(it.key) ? " on" : ""}`} aria-pressed={PS.has(it.key)} onClick={() => void toggle(it.key)}>{PS.has(it.key) ? "✓ 올림" : "올림"}</button>
            </div>
            {note ? <p className="gy-view-st" role="status">{note}</p> : null}
            {it.notes.length ? <dl className="gy-view-notes">{it.notes.map((n) => <div key={n.h}><dt>{n.h}</dt><dd>{n.t}</dd></div>)}</dl> : null}
          </div>
        </div>, document.body,   // 보기 창 = body 에 띄움(위 칸 transform 에 안 갇히게)
      ) : null}
    </div>
  );
}

/** 결과 함께 나머지 여섯 칸 = 원본 renderChanGyeol grev · gflow · gsongs · gseed · gpost · gact 그대로(차례 · 갯수 · 꼬리표) */
function Row({ href, i, chip, t, meta }: { href?: string; i?: number | string; chip?: string; t: string; meta?: string }) {
  const inner = <><span className="gy-r-i">{i ?? ""}</span>{chip ? <span className="gy-r-chip">{chip}</span> : null}<span className="gy-r-t">{t}</span><span className="gy-r-m">{meta || ""}</span></>;
  return href ? <a className="gy-r" href={href} target="_blank" rel="noopener">{inner}</a> : <div className="gy-r">{inner}</div>;
}
function Sec({ ttl, sub, children }: { ttl: string; sub?: string; children: ReactNode }) {
  return <section className="gy-sec"><div className="gy-mv-h"><b>{ttl}</b>{sub ? <span>{sub}</span> : null}</div>{children}</section>;
}
const ACT: Record<string, string> = { song: "곡", mv: "뮤비", mv_fail: "실패", seed_wake: "재료", review: "평" };
function GyRest({ g }: { g: Gy }) {
  const songs = g.songs || [], sg = songs.filter((x) => !x.hypo);
  const revs = songs.flatMap((x) => (x.reviews || []).map((r) => ({ r, s: x }))).sort((a, b) => String(b.r.date || "").localeCompare(String(a.r.date || "")));
  const fl = (g.flow || []).filter((x) => !x.hypo).slice(0, 10), sd = g.seeds_today, acc = g.accounts || {}, yt = g.posts?.yt?.items || [];
  const accRows = (["yt", "ig", "tt"] as const).filter((k) => acc[k]).map((k) => ({ k, url: acc[k], h: "@" + (String(acc[k]).replace(/\/+$/, "").split("/").pop() || "").replace(/^@/, "") }));
  const lst = (a?: string[]) => ((a || []).length ? <ul>{(a || []).map((t, i) => <li key={i}>{t}</li>)}</ul> : null);
  return (
    <>
      {revs.length ? (
        <Sec ttl="결의 평" sub={`${revs.length}개`}>
          {revs.slice(0, 3).map(({ r, s }, i) => (
            <article key={i} className="gy-rev">
              <div className="gy-rev-h"><div><span className="gy-eyebrow">{["결의 평", r.mv ? "뮤비" : "곡", (r.date || "").slice(5).replace("-", "/")].filter(Boolean).join(" · ")}</span><b>{s.title || ""}</b></div>
                {r.score ? <span className="gy-score"><b>{r.score}</b>/10</span> : <span className="gy-eyebrow">{String(r.score_why || "").startsWith("잘못") ? "점수 " + String(r.score_why).replace("잘못된 값", "잘못됨") : "점수 없음"}</span>}</div>
              {whyOf(s) ? <p className="gy-rev-why"><span className="gy-eyebrow">만든 의도</span> {whyOf(s)}</p> : null}
              <p className="gy-rev-q">{r.one || "—"}</p>
              <div className="gy-rev-cols">{r.good?.length ? <div><span className="gy-eyebrow">좋음</span>{lst(r.good)}</div> : null}{r.bad?.length ? <div><span className="gy-eyebrow">아쉬움</span>{lst(r.bad)}</div> : null}{r.next?.length ? <div><span className="gy-eyebrow">다음</span>{lst(r.next)}</div> : null}</div>
            </article>
          ))}
        </Sec>
      ) : null}
      {fl.length ? <Sec ttl="흐름"><div className="gy-list">{fl.map((x, i) => <Row key={i} href={x.kind === "mv" ? x.link || x.video_url : x.link} i={i + 1} chip={x.kind === "mv" ? "뮤비" : "곡"} t={(x.title || "") + (x.starred ? " ★" : "")} meta={ago(x.at)} />)}</div></Sec> : null}
      {sg.length ? (
        <Sec ttl="곡 목록" sub={`${sg.length}곡 · 뮤비 ${sg.filter((x) => (x.mv || []).length).length}곡`}>
          <div className="gy-list">{sg.map((x, i) => {
            const mvN = (x.mv || []).length, sc = (x.reviews || [])[0]?.score;
            const body = <><span className="gy-song-h"><b>{x.title || ""}{x.starred ? " ★" : ""}</b>{x.intent?.genre ? <span className="gy-tag">{x.intent.genre}</span> : null}</span>{whyOf(x) ? <span className="gy-song-why">{whyOf(x)}</span> : null}<span className="gy-song-m"><span className={`gy-mvpill${mvN ? " on" : ""}`}>{mvN ? `뮤비 ${mvN}편` : "뮤비 없음"}</span>{sc ? <span className="gy-score"><b>{sc}</b>/10</span> : null}<span>{[dur(x.duration_s), x.takes != null ? `테이크 ${x.takes}` : "", md(x.at)].filter(Boolean).join(" · ")}</span></span></>;
            return x.link ? <a key={i} className="gy-song" href={x.link} target="_blank" rel="noopener">{body}</a> : <div key={i} className="gy-song">{body}</div>;
          })}</div>
        </Sec>
      ) : null}
      {sd?.top?.length ? <Sec ttl="오늘 재료" sub={`깨움 ${+(sd.woke || 0)} · 곡 ${+(sd.songs || 0)}${sd.confirmed ? "" : " · 미확정 기준"}`}><div className="gy-list">{sd.top.map((x, i) => <Row key={i} href={x.url} i={x.rank ?? ""} chip={x.over ? "넘음" : ""} t={x.title || ""} meta={(x.terms || []).slice(0, 2).join(" · ")} />)}</div></Sec> : null}
      {accRows.length || yt.length ? <Sec ttl="게시 현황"><div className="gy-list">{accRows.map((a) => <Row key={a.k} href={a.url} chip={a.k.toUpperCase()} t={a.h} />)}{yt.map((x, i) => <Row key={"y" + i} href={x.url} i={i + 1} chip="YT" t={x.title || ""} meta={ago(x.at)} />)}</div></Sec> : null}
      {(g.activity || []).length ? <Sec ttl="최근 활동"><div className="gy-list">{(g.activity || []).map((x, i) => <Row key={i} href={x.link} i={i + 1} chip={ACT[x.type || ""] || ""} t={x.text || ""} meta={ago(x.at)} />)}</div></Sec> : null}
    </>
  );
}
