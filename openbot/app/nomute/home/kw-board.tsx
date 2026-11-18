// 홈 「Hot Issue」 자리에서 번갈아 뜨는 키워드 순위판(형 11-14 클라우드 세션 창)
//   「sns 키워드들 수집되는거 … 3분할해서 한 7위까지만」 · 「x급상승도 들어가게해놔 총 4개로」 = 구글 트렌드 · 시그널 · 나무위키 · X 급상승 · 줄기마다 7위
//   「중복되는 키워드는 … 라임색으로 그대로 표기」 = 두 줄기 넘게 뜬 말 = 라임(셋 넘으면 작은 숫자) · 잣대 = ./kw-board-core.ts kwHits
//   「핫이슈 나오다가 10초뒤에 그거 나오고, (부드럽게 촤르륵) 그리고 1분정도 내비쳣다가 다시 전환되고 1분마다」 = HotSwap(처음 10초 · 그 뒤 1분마다 · 줄이 차례로 들어옴)
//   「폰에서는 … 넘길때마다 차트가 나오게」 = 좁은 칸에선 옆으로 넘김 · 형 11-17 01:25 「키워드 2플랫폼씩 보여줘 / 단 그러면 지속시간은 2배 / … 정방향으로 / 반 가르고 … 플랫폼 명만 가운데 정렬」 = 한 장에 두 줄기(반 가름 · 점 둘) · 장마다 10초 · 다음 장 = 오른쪽에서 들어옴
//   말 누름 = 그 말 찾기 새 창(형 11-05 「링크같은거는 항상 클릭하면 새 창에서」) · 재료 = 30분마다 모이는 파일이라 10분에 한 번만 받음
import { notGot } from "../ui/srv-note";
import "./kw-board.css";
import { agoMin } from "../ui/ago-min";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { firstJson } from "./news-feed";
import { KW_EVERY_MS, KW_FIRST_MS, KW_N, KW_PAGE_MS, KW_STEP_MS, kwCols, kwFit, kwHits, kwPages, kwShowNew, type TrendsIn, type XtopIn } from "./kw-board-core";

const ago = (iso: string, now: number) => { const t = Date.parse(iso); return Number.isFinite(t) ? agoMin(now - t) : ""; };   // 칸 시각도 늘 「N분 전」(형 11-15 08:54)

export function KwBoard({ on, run, onDone }: { on: boolean; run: number; onDone?: () => void }) {
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
  const pages = kwPages(cols), box = useRef<HTMLDivElement>(null), [page, setPage] = useState(0);
  // 폰 = 정방향(다음 장이 오른쪽에서 들어와 왼쪽으로 · 점 차례와 같은 쪽 · 형 11-17 01:25 「지금 역방향으로 전환되어서 어색하니 정방향으로」 · 앞 판 = 거꾸로 놓음)
  const onScroll = () => { const el = box.current; if (el && el.clientWidth) setPage(Math.max(0, Math.min(pages.length - 1, Math.round(Math.abs(el.scrollLeft) / el.clientWidth)))); };
  const jump = (i: number) => { const el = box.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };
  const none = cols.every((c) => !c.items.length);
  // 넓은 칸(461 넘음) = 판 높이에 들어가는 줄만(형 11-18 14:37 구름 1:1 「키워드 부분 해결해줘 겹치게 안보여야해, 스크롤 이 잇길 원하진 않아」 · 앞 판 = 10줄이 판 높이를 나눠 줄 키가 글자보다 작아져 겹침 · 안드로이드 탭 두 칸)
  //   재는 때 = 칸 크기가 바뀔 때만(ResizeObserver) · 폰(460 아래) = 7줄 그대로(css)
  const [fit, setFit] = useState(KW_N);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => { const ol = el.querySelector("ol"); setFit(kwFit(el.clientWidth, ol ? ol.clientHeight : 0)); };
    const ro = new ResizeObserver(measure);
    ro.observe(el); measure();
    return () => ro.disconnect();
  }, [run, none]);
  // 장 넘김(깃 #-037) — 뜨면 첫 장부터 10초마다 다음 장(한 장 = 두 줄기 · 형 11-17 「지속시간은 2배」) · 마지막 장 10초 뒤 = Hot Issue 로(onDone) · 넓은 칸(넷 다 보임) = 줄기 수 × 5초 보고 돌아감
  //   만지는 중(마우스 올림 · 방금 누름 20초) · 숨은 탭 = 그 자리에서 기다림(보던 걸 뺏지 않음) · 타이머 하나 · 움직임 = 원래 스크롤(smooth) 그대로
  const over = useRef(false), hold = useRef(0), done = useRef(onDone);
  done.current = onDone;
  const n = cols.length, np = pages.length;
  useEffect(() => {
    if (!on) return undefined;
    let i = 0, t = 0, live = true;
    const el = box.current;
    if (el) el.scrollTo({ left: 0 });
    const narrow = () => { const b = box.current; return !!b && b.scrollWidth > b.clientWidth + 4; };
    const step = () => {
      if (!live) return;
      if (document.hidden || over.current || Date.now() < hold.current) { t = window.setTimeout(step, 3000); return; }
      i += 1;
      if (none || i >= (narrow() ? np : 1)) { done.current?.(); return; }
      jump(i);
      t = window.setTimeout(step, KW_PAGE_MS);
    };
    t = window.setTimeout(step, none ? KW_STEP_MS : narrow() ? KW_PAGE_MS : KW_STEP_MS * Math.max(1, n));
    return () => { live = false; window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, run, n, np, none]);
  return (
    <section className="nm-kwb" aria-label="키워드 순위" aria-hidden={on ? undefined : true} inert={on ? undefined : true}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") over.current = true; }} onPointerLeave={() => { over.current = false; }}
      onPointerDown={() => { hold.current = Date.now() + 20_000; }}>
      <div className="nm-nlist-h nm-kwb-h"><i className="live" aria-hidden /><b>Keyword</b><span>{newest ? agoMin(now - Date.parse(newest)) : ""}</span></div>
      {none ? (
        <p className={`nm-kwb-none${q.isError ? " srv" : ""}`}><b>{q.isPending ? "읽는 중…" : q.isError ? notGot("키워드 순위") : "지금 모인 키워드가 없어"}</b>{q.isPending || q.isError ? null : <span>10분 뒤 다시 받아</span>}</p>
      ) : (
        <>
          <div className="nm-kwb-cols" ref={box} onScroll={onScroll} key={run}>   {/* key = 뜰 때마다 줄이 차례로 다시 들어옴 */}
            {pages.map((pg, pi) => (
            <div key={pg.map((c) => c.id).join("+")} className="nm-kwb-pg" data-one={pg.length === 1 || undefined}>   {/* 폰 = 한 장 · 반 가름 · 넓은 칸 = display:contents(네 줄기 한 단 그대로) */}
            {pg.map((c, k) => { const ci = pi * 2 + k, showNew = kwShowNew(c); return (
              <div key={c.id} className="nm-kwb-col" data-stale={(c.stale && c.id !== "x") || undefined} aria-label={c.name}>   {/* X 급상승 = 밤에 수집이 쉬어 낡아도 흐림 0 · 글자 0(형 11-17 09:55 dm-bom 봄 옮김 「아, 그러면 밤에만 돌아도 x는 흰색으로 나오게 해줘 어색하네.」) · 겹침 셈(라임)에서 낡은 줄기 빼는 건 그대로(kwHits) */}
                <div className="nm-kwb-ch" style={{ animationDelay: `${ci * 70}ms` }}><b>{c.name}</b><span>{c.stale && c.id !== "x" ? (c.at ? `${ago(c.at, now)} · 낡음` : "못 받음") : ""}</span></div>
                {c.items.length ? (
                  <ol>
                    {c.items.slice(0, fit).map((it, i) => {
                      const n = hits.get(`${c.id}:${i}`) || 0;
                      return (
                        <li key={it.q + i} className={n >= 2 ? "dup" : undefined} style={{ animationDelay: `${ci * 70 + 60 + i * 36}ms` }}>
                          <span className="rk">{i + 1}</span>
                          <button type="button" className="q" title={n >= 2 ? `${it.q} — ${n}곳에 같이 뜸` : it.q} onClick={() => window.open(it.href, "_blank", "noopener")}>{it.q}</button>
                          <span className={it.fresh && showNew && !it.sub ? "sub new" : "sub"}>{it.sub || (it.fresh && showNew ? "NEW" : "")}</span>
                        </li>
                      );
                    })}
                  </ol>
                ) : <p className="nm-kwb-empty">지금 모인 말이 없어</p>}
              </div>
            ); })}
            </div>
            ))}
          </div>
          <div className="nm-kwb-dots" role="tablist" aria-label="장 고르기">
            {pages.map((pg, i) => <button key={pg.map((c) => c.id).join("+")} type="button" role="tab" aria-selected={i === page} aria-label={pg.map((c) => c.name).join(" · ")} onClick={() => jump(i)} />)}
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
      setView("kw");   // Hot Issue → 키워드 만 · 키워드 → Hot Issue 는 판이 줄기를 다 넘긴 뒤(onDone · 깃 #-037)
      t = window.setTimeout(tick, KW_EVERY_MS);
    };
    arm.current = (ms) => { window.clearTimeout(t); t = window.setTimeout(tick, ms); };
    t = window.setTimeout(tick, KW_FIRST_MS);
    return () => { live = false; window.clearTimeout(t); };
  }, []);
  useEffect(() => { if (view === "kw") setRun((n) => n + 1); }, [view]);
  // 뉴스 카드 = 품은 화면(iframe)이라 손가락 · 마우스 누름이 여기까지 안 올라옴 → 카드를 넘기는 중에도 때가 되면 키워드 판으로 바꿔 버렸음
  //   (형 11-15 「이거 키워드 상기면서 우로 넘기는게 안먹혀지게됨」) → 품은 화면 안 누름 · 휠도 「방금 만짐」으로 쳐서 20초 미룸(보던 걸 뺏지 않음)
  const slot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = slot.current;
    if (!host) return;
    const touch = () => { hold.current = Date.now() + 20_000; };
    const offs: (() => void)[] = [];
    const bind = (f: HTMLIFrameElement) => {
      const arm = () => { try { const w = f.contentWindow; if (!w) return; w.addEventListener("pointerdown", touch, { capture: true, passive: true }); w.addEventListener("wheel", touch, { capture: true, passive: true }); } catch { /* 남의 사이트 = 못 들음 */ } };
      f.addEventListener("load", arm); arm();
      offs.push(() => f.removeEventListener("load", arm));
    };
    host.querySelectorAll("iframe").forEach(bind);
    return () => offs.forEach((f) => f());
  }, []);
  const flip = () => { setView((v) => (v === "hot" ? "kw" : "hot")); arm.current(KW_EVERY_MS); };
  return (
    <section className="nm-hotswap" data-view={view} aria-label="Hot Issue · 키워드"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") over.current = true; }} onPointerLeave={() => { over.current = false; }}
      onPointerDown={(e) => { if (e.pointerType !== "mouse") hold.current = Date.now() + 20_000; }}>
      <div ref={slot} className="nm-hot-slot" aria-hidden={view === "hot" ? undefined : true} inert={view === "hot" ? undefined : true}>{children}</div>
      <KwBoard on={view === "kw"} run={run} onDone={() => { setView("hot"); arm.current(KW_EVERY_MS); }} />
      <button type="button" className="nm-hotswap-t" aria-pressed={view === "kw"} aria-label={view === "hot" ? "키워드 순위 보기" : `${label} 보기`} title="1분마다 저절로 바뀜 · 누르면 바로" onClick={flip}>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></svg>
        <span>{view === "hot" ? "키워드" : label}</span>
      </button>
    </section>
  );
}
