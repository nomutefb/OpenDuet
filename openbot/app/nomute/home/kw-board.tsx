// 홈 「Hot Issue」 자리에서 번갈아 뜨는 키워드 순위판(형 11-14 클라우드 세션 창)
//   「sns 키워드들 수집되는거 … 3분할해서 한 7위까지만」 · 「x급상승도 들어가게해놔 총 4개로」 = 구글 트렌드 · 시그널 · 나무위키 · X 급상승 · 줄기마다 7위
//   「중복되는 키워드는 … 라임색으로 그대로 표기」 = 두 줄기 넘게 뜬 말 = 라임(셋 넘으면 작은 숫자) · 잣대 = ./kw-board-core.ts kwHits
//   「핫이슈 나오다가 10초뒤에 그거 나오고, (부드럽게 촤르륵) 그리고 1분정도 내비쳣다가 다시 전환되고 1분마다」 = HotSwap(처음 10초 · 그 뒤 1분마다 · 줄이 차례로 들어옴)
//   「폰에서는 … 넘길때마다 차트가 나오게」 = 좁은 칸에선 한 화면에 줄기 하나 · 옆으로 넘김(점 넷)
//   말 누름 = 그 말 찾기 새 창(형 11-05 「링크같은거는 항상 클릭하면 새 창에서」) · 재료 = 30분마다 모이는 파일이라 10분에 한 번만 받음
import "./kw-board.css";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { firstJson } from "./news-feed";
import { KW_EVERY_MS, KW_FIRST_MS, kwCols, kwHits, kwShowNew, type TrendsIn, type XtopIn } from "./kw-board-core";

const ago = (iso: string, now: number) => { const t = Date.parse(iso); if (!Number.isFinite(t)) return ""; const m = Math.max(0, Math.floor((now - t) / 6e4)); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };

export function KwBoard({ on, run }: { on: boolean; run: number }) {
  const q = useQuery({
    queryKey: ["nomute", "kw-board"], staleTime: 300_000, refetchInterval: 600_000,
    queryFn: async () => {
      const [tr, xt] = await Promise.all([
        firstJson<NonNullable<TrendsIn>>(["/api/trends", "/sns_trends.json"], (v) => !!v && !!v.updated),
        firstJson<NonNullable<XtopIn>>(["/api/trends?f=xtop"], (v) => !!v && Array.isArray(v.items)),
      ]);
      return { tr, xt };
    },
  });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (on) setNow(Date.now()); }, [on, run]);
  const cols = kwCols(q.data?.tr, q.data?.xt, now), hits = kwHits(cols);
  const newest = cols.map((c) => c.at).filter((a) => Number.isFinite(Date.parse(a))).sort().at(-1) || "";
  const box = useRef<HTMLDivElement>(null), [page, setPage] = useState(0);
  const onScroll = () => { const el = box.current; if (el && el.clientWidth) setPage(Math.max(0, Math.min(cols.length - 1, Math.round(el.scrollLeft / el.clientWidth)))); };
  const jump = (i: number) => { const el = box.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };
  const none = cols.every((c) => !c.items.length);
  return (
    <section className="nm-kwb" aria-label="키워드 순위" aria-hidden={on ? undefined : true} inert={on ? undefined : true}>
      <div className="nm-nlist-h nm-kwb-h"><i className="live" aria-hidden /><b>Keyword</b><span>{newest ? ago(newest, now) : ""}</span></div>
      {none ? (
        <p className="nm-kwb-none"><b>{q.isPending ? "받는 중…" : q.isError ? "키워드 순위를 못 받았어" : "지금 모인 키워드가 없어"}</b>{q.isPending ? null : <span>10분 뒤 다시 받아</span>}</p>
      ) : (
        <>
          <div className="nm-kwb-cols" ref={box} onScroll={onScroll} key={run}>   {/* key = 뜰 때마다 줄이 차례로 다시 들어옴 */}
            {cols.map((c, ci) => { const showNew = kwShowNew(c); return (
              <div key={c.id} className="nm-kwb-col" data-stale={c.stale || undefined} aria-label={c.name}>
                <div className="nm-kwb-ch" style={{ animationDelay: `${ci * 70}ms` }}><b>{c.name}</b><span>{c.stale ? (c.at ? `${ago(c.at, now)} · 낡음` : "못 받음") : ""}</span></div>
                {c.items.length ? (
                  <ol>
                    {c.items.map((it, i) => {
                      const n = hits.get(`${c.id}:${i}`) || 0;
                      return (
                        <li key={it.q + i} className={n >= 2 ? "dup" : undefined} style={{ animationDelay: `${ci * 70 + 60 + i * 36}ms` }}>
                          <span className="rk">{i + 1}</span>
                          <button type="button" className="q" title={n >= 2 ? `${it.q} — ${n}곳에 같이 뜸` : it.q} onClick={() => window.open(it.href, "_blank", "noopener")}>{it.q}</button>
                          {n >= 3 ? <i className="n" aria-label={`${n}곳`}>{n}</i> : null}
                          <span className={it.fresh && showNew && !it.sub ? "sub new" : "sub"}>{it.sub || (it.fresh && showNew ? "NEW" : "")}</span>
                        </li>
                      );
                    })}
                  </ol>
                ) : <p className="nm-kwb-empty">지금 모인 말이 없어</p>}
              </div>
            ); })}
          </div>
          <div className="nm-kwb-dots" role="tablist" aria-label="줄기 고르기">
            {cols.map((c, i) => <button key={c.id} type="button" role="tab" aria-selected={i === page} aria-label={c.name} onClick={() => jump(i)} />)}
          </div>
        </>
      )}
    </section>
  );
}

/** Hot Issue ↔ 키워드 번갈이 — 처음 10초 Hot Issue · 그 뒤 1분마다 · 마우스가 올라가 있거나 방금 만졌으면 미룸(보던 걸 뺏지 않음) · 숨은 탭 = 쉼 · 오른쪽 위 단추 = 손으로 바꿈 */
export function HotSwap({ children, label = "이슈" }: { children: ReactNode; label?: string }) {
  const [view, setView] = useState<"hot" | "kw">("hot"), [run, setRun] = useState(0);
  const over = useRef(false), hold = useRef(0), arm = useRef<(ms: number) => void>(() => {});
  useEffect(() => {
    let t = 0, live = true;
    const tick = () => {
      if (!live) return;
      if (document.hidden || over.current || Date.now() < hold.current) { t = window.setTimeout(tick, 3000); return; }
      setView((v) => (v === "hot" ? "kw" : "hot"));
      t = window.setTimeout(tick, KW_EVERY_MS);
    };
    arm.current = (ms) => { window.clearTimeout(t); t = window.setTimeout(tick, ms); };
    t = window.setTimeout(tick, KW_FIRST_MS);
    return () => { live = false; window.clearTimeout(t); };
  }, []);
  useEffect(() => { if (view === "kw") setRun((n) => n + 1); }, [view]);
  const flip = () => { setView((v) => (v === "hot" ? "kw" : "hot")); arm.current(KW_EVERY_MS); };
  return (
    <section className="nm-hotswap" data-view={view} aria-label="Hot Issue · 키워드"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") over.current = true; }} onPointerLeave={() => { over.current = false; }}
      onPointerDown={(e) => { if (e.pointerType !== "mouse") hold.current = Date.now() + 20_000; }}>
      <div className="nm-hot-slot" aria-hidden={view === "hot" ? undefined : true} inert={view === "hot" ? undefined : true}>{children}</div>
      <KwBoard on={view === "kw"} run={run} />
      <button type="button" className="nm-hotswap-t" aria-pressed={view === "kw"} aria-label={view === "hot" ? "키워드 순위 보기" : `${label} 보기`} title="1분마다 저절로 바뀜 · 누르면 바로" onClick={flip}>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></svg>
        <span>{view === "hot" ? "키워드" : label}</span>
      </button>
    </section>
  );
}
