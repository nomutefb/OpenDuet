// 썸네일 후보·카드뉴스 넘기기 + 크게 보기(형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일 … 완전히 내재화 부탁해.」)
//   원본 = 에디터 viewer/index.html thumbSec·thumbStatic(검색·AI 두 줄 4:5 넘기기 · 번호 · 저장 · AI 만 좋음/아쉬움) · thumbPromptPanel(프롬프트 4종) · feedSec(카드 이미지) · openLightbox(넘기며 크게 · 저장 · 출처)
//   뺀 것 = 에디터 몫(+AI 생성·수정·사진 더·프롬프트만 뽑기 = 돈·쓰기) → 상세 맨 아래 「에디터에서 고치기」 한 단추
//   크게 보기 = 대화창 사진 크게 보기(.nm-zoom · ui/office-chat.tsx zoomImage)와 같은 겉·같은 닫는 길(기록 한 칸 · 폰 뒤로 · Esc · 아무 데나 누름) + 좌우 넘김
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { inAppHref } from "./inapp";
import { type Art, type Thumb, type Vote, abs, dlHref, dlName, getJson, imgOf, useGo, voteGet, voteSend, voteSet } from "./news-data";

export type Pic = { src: string; name: string; label?: string; link?: string };
const SV = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const IcDown = () => <svg {...SV}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;
const IcUp = () => <svg {...SV}><path d="M7 10v10H4V10h3Zm0 0 4-7c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7" /></svg>;
const IcDn = () => <svg {...SV}><path d="M17 14V4h3v10h-3Zm0 0-4 7c-1.5 0-2.5-1-2.5-2.5V15h-5a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6.7 4H17" /></svg>;
const IcCopy = () => <svg {...SV}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>;

/** 크게 보기(넘김) — 열 때 기록 한 칸 얹고 닫으면 되돌림 · 출처 = 닫은 뒤 앱 안 한 겹 */
export function Zoom({ pics, at, onClose }: { pics: Pic[]; at: number; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null), pushed = useRef(false), backing = useRef(false), then = useRef("");
  const [i, setI] = useState(at);
  const go = useGo();
  const close = () => { if (backing.current) return; backing.current = true; history.back(); };
  const step = (d: number) => { const t = track.current; if (t) t.scrollTo({ left: (Math.round(t.scrollLeft / (t.clientWidth || 1)) + d) * t.clientWidth, behavior: "smooth" }); };
  useLayoutEffect(() => { const t = track.current; if (t) t.scrollLeft = at * t.clientWidth; }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pushed.current) { pushed.current = true; history.pushState({ ...history.state, nmZoom: 1 }, ""); }
    const pop = () => { onClose(); const h = then.current; if (h) setTimeout(() => go(h), 0); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("popstate", pop); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const cur = pics[i] || pics[0];
  if (!cur) return null;
  return createPortal(
    <div className="nm-zoom nm-zoom-g" role="dialog" aria-modal="true" aria-label="사진 크게 보기" onClick={close}>
      <div className="nm-zoom-bar" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="뒤로" onClick={close}><svg {...SV} width={24} height={24}><path d="m15 5-7 7 7 7" /></svg></button>
        {cur.label ? <b>{cur.label}</b> : null}
        {pics.length > 1 ? <small>{i + 1} / {pics.length}</small> : null}
        <span className="nm-zoom-sp" />
        {cur.link ? <a className="nm-zoom-act txt" href={cur.link} target="_blank" rel="noopener" onClick={(e) => { const h = inAppHref(e.currentTarget.href); if (h) { e.preventDefault(); then.current = h; close(); } }}>출처</a> : null}
        <a className="nm-zoom-act" href={dlHref(cur.src, cur.name)} download={cur.name} aria-label="이 사진 저장"><IcDown /></a>
      </div>
      <div className="nm-zoom-track" ref={track} onScroll={(e) => { const t = e.currentTarget; setI(Math.max(0, Math.min(pics.length - 1, Math.round(t.scrollLeft / (t.clientWidth || 1))))); }}>
        {pics.map((p, k) => <div key={`${k}:${p.src}`} className="nm-zoom-slide"><img src={p.src} alt="" referrerPolicy="no-referrer" loading={Math.abs(k - at) <= 1 ? "eager" : "lazy"} decoding="async" /></div>)}
      </div>
    </div>,
    document.body,
  );
}

/** 좋음/아쉬움(AI 만 · 에디터 thVoteWire) — 한 번 = 기록 · 반대쪽 잠김 · 같은 쪽 또 누르면 「취소」 → 한 번 더 = 지움 · 보내기 실패해도 이 기기엔 남김 */
function Votes({ a, sid, onFail }: { a: Art; sid: string; onFail: () => void }) {
  const [v, setV] = useState<Vote | null>(() => voteGet(a.file, sid)), [arm, setArm] = useState<Vote | null>(null);
  useEffect(() => { if (!arm) return; const t = setTimeout(() => setArm(null), 2600); return () => clearTimeout(t); }, [arm]);
  const hit = (k: Vote) => {
    if (v === k) {
      if (arm !== k) return setArm(k);
      setArm(null); voteSet(a.file, sid, null); setV(null); void voteSend(a, sid, "").then((ok) => { if (!ok) onFail(); });
      return;
    }
    if (v) return;
    voteSet(a.file, sid, k); setV(k); void voteSend(a, sid, k).then((ok) => { if (!ok) onFail(); });
  };
  return (
    <>
      {(["up", "down"] as const).map((k) => (
        <button key={k} type="button" className={`nm-th-act${v === k ? " on" : ""}${arm === k ? " arm" : ""}`} disabled={!!v && v !== k} aria-label={k === "up" ? "좋은 썸네일" : "아쉬운 썸네일"} aria-pressed={v === k} onClick={(e) => { e.stopPropagation(); hit(k); }}>
          {arm === k ? "취소" : k === "up" ? <IcUp /> : <IcDn />}
        </button>
      ))}
    </>
  );
}

/** 한 줄 넘기기(검색 · AI · 카드) — 칸 = 4:5 · 좌상단 번호 · 우상단 저장 · (AI) 아래 화풍 이름·투표 · 누르면 크게 · 못 읽는 사진 = 칸째 숨김 */
function Row({ a, kind, title, items, onZoom, onFail }: { a: Art; kind: "search" | "gen" | "card"; title: string; items: Thumb[]; onZoom: (pics: Pic[], i: number) => void; onFail: () => void }) {
  const [gone, setGone] = useState<Set<number>>(() => new Set());
  const pics: Pic[] = items.map((t, i) => { const src = imgOf(t); return { src, name: dlName(a.file, t.label || title, src, i), label: kind === "card" ? `${title} ${i + 1}` : t.label || title, link: kind === "search" && t.link && t.link !== t.img ? t.link : undefined }; });
  const live = pics.map((p, i) => ({ p, i })).filter((x) => !gone.has(x.i));
  if (!live.length) return null;
  return (
    <div className={`nm-th-row ${kind}`}>
      <div className="nm-th-h"><b>{title}</b><i>{live.length}장</i></div>
      <div className="nm-th-track" role="list">
        {live.map(({ p, i }, k) => (
          <div key={`${i}:${p.src}`} role="listitem" className="nm-th-slot">
            <button type="button" className="nm-th-img" aria-label={`${p.label || title} 크게`} onClick={() => onZoom(live.map((x) => x.p), k)}>
              <img src={p.src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setGone((s) => new Set(s).add(i))} />
            </button>
            <span className="nm-th-no"><b>{k + 1}</b>/{live.length}</span>
            <a className="nm-th-act nm-th-save" href={dlHref(p.src, p.name)} download={p.name} aria-label="이 사진 저장" onClick={(e) => e.stopPropagation()}><IcDown /></a>
            {kind === "gen" ? (   // 아래 띠 = 화풍 이름(왼) · 좋음/아쉬움(오른) — 폰 폭(칸 ≈150px)에서 위 번호·저장과 안 겹치게
              <span className="nm-th-foot">
                {items[i].label ? <span className="nm-th-cap">{items[i].label}</span> : null}
                {items[i].sid ? <span className="nm-th-votes"><Votes a={a} sid={items[i].sid!} onFail={onFail} /></span> : null}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 프롬프트 4종(접힘 기본) — 열 때만 thumb_prompts_url 을 읽음 · 줄마다 복사 + 전체 복사 · 없으면 에디터에서 뽑음(드라이런 발사 = 쓰기라 앱엔 안 둠) */
const PR_KO: Record<string, string> = { photo: "포토 에디토리얼", webtoon: "웹툰 극화", watercolor: "수채화", cartoon: "시사만평" };
const PR_ORDER = ["photo", "webtoon", "watercolor", "cartoon"];
const prLabel = (sid: string, gen: Thumb[]) => { const g = gen.find((x) => x?.sid === sid); if (g?.label) return g.label; const b = sid.replace(/_r\d+$/, ""), n = (/_r(\d+)$/.exec(sid) || [])[1]; return (PR_KO[b] || b) + (n ? ` 수정 ${n}` : ""); };
function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState<"" | "y" | "n">("");
  const copy = () => {
    const p: Promise<void> = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject(new Error("복사 못 씀"));   // 앱 밖 http 판 등 = 클립보드 없음
    void p.then(() => setOk("y"), () => setOk("n")).finally(() => setTimeout(() => setOk(""), 1400));
  };
  return <button type="button" className="nm-th-act txt" aria-label={`${label} 복사`} onClick={copy}>{ok === "y" ? "복사함" : ok === "n" ? "못 함" : <IcCopy />}</button>;
}
function Prompts({ url, gen }: { url: string; gen: Thumb[] }) {
  const [open, setOpen] = useState(false), [wide, setWide] = useState<Set<string>>(() => new Set());
  const q = useQuery({ queryKey: ["nomute", "thumb-prompts", url], enabled: open, staleTime: Infinity, queryFn: () => getJson<Record<string, unknown>>(abs(url)) });
  const pm = q.data && typeof q.data === "object" ? q.data : {};
  const sids = Object.keys(pm).filter((s) => typeof pm[s] === "string" && (pm[s] as string).trim());
  const order = PR_ORDER.filter((s) => sids.includes(s)).concat(sids.filter((s) => !PR_ORDER.includes(s)).sort());
  const all = order.map((s) => `=== ${prLabel(s, gen)} (${s}) ===\n${pm[s]}`).join("\n\n");
  return (
    <div className="nm-th-pr">
      <button type="button" className="yset-chip" aria-expanded={open} onClick={() => setOpen((o) => !o)}>프롬프트 4종 {open ? "접기" : "보기"}</button>
      {!open ? null : q.isPending ? <p className="nm-news-msg">프롬프트 읽는 중…</p> : q.isError ? <p className="nm-news-msg" role="alert">프롬프트를 못 읽었어{q.error instanceof Error && !(q.error.message === "404" || q.error.message === "html") ? ` — ${q.error.message}` : ""}</p> : !order.length ? <p className="nm-news-msg">아직 프롬프트가 없어 — 에디터에서 뽑을 수 있어</p> : (
        <div className="nm-th-pr-list">
          <div className="nm-th-pr-h"><b>{order.length}개</b><CopyBtn text={all} label="프롬프트 전체" /></div>
          {order.map((s) => { const t = pm[s] as string, lb = prLabel(s, gen); return (
            <div key={s} className="nm-th-pr-row">
              <div className="nm-th-pr-h"><b>{lb}</b><small>{t.length.toLocaleString("ko-KR")}자</small><CopyBtn text={t} label={lb} /></div>
              <pre className={wide.has(s) ? "open" : ""} onClick={() => setWide((w) => { const n = new Set(w); if (n.has(s)) n.delete(s); else n.add(s); return n; })}>{t}</pre>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}

/** 썸네일 후보 칸(상세 안 · 제목 아래) — 사진도 프롬프트도 없으면 안 그림 */
export function ThumbStrip({ a }: { a: Art }) {
  const c = a.cards || {};
  const search = (c.thumb_search || []).filter((t) => imgOf(t)).slice(0, 60), gen = (c.thumb_gen || []).filter((t) => imgOf(t)).slice(0, 40);
  const [zoom, setZoom] = useState<{ pics: Pic[]; at: number } | null>(null), [fail, setFail] = useState(false);
  if (!search.length && !gen.length && !c.thumb_prompts_url) return null;
  const onZoom = (pics: Pic[], at: number) => setZoom({ pics, at });
  return (
    <section className="ycd-card card-left nm-th" aria-label="썸네일 후보">
      <span className="nm-th-ttl">썸네일 후보</span>
      {search.length ? <Row a={a} kind="search" title="검색" items={search} onZoom={onZoom} onFail={() => setFail(true)} /> : null}
      {gen.length ? <Row a={a} kind="gen" title="AI 생성" items={gen} onZoom={onZoom} onFail={() => setFail(true)} /> : null}
      {fail ? <p className="nm-news-msg" role="status">투표를 못 보냈어 — 이 기기엔 남겨 뒀어</p> : null}
      {c.thumb_prompts_url ? <Prompts url={c.thumb_prompts_url} gen={c.thumb_gen || []} /> : null}
      {zoom ? <Zoom pics={zoom.pics} at={zoom.at} onClose={() => setZoom(null)} /> : null}
    </section>
  );
}

/** 카드뉴스 이미지(cards.images · 렌더 끝난 장만) */
/** 카드뉴스 칸 = 그림 줄 + 피드 단추(children · ./feed-acts.tsx) — 그림이 아직 없어도 단추가 있으면 칸을 그림(team-3 U1) */
export function CardStrip({ a, children }: { a: Art; children?: ReactNode }) {
  const imgs = (a.cards?.images || []).map((u) => ({ img: u })).filter((t) => imgOf(t));
  const [zoom, setZoom] = useState<{ pics: Pic[]; at: number } | null>(null);
  if (!imgs.length && !children) return null;
  return (
    <section className="ycd-card card-left nm-th" aria-label="카드뉴스">
      {imgs.length ? <Row a={a} kind="card" title="카드뉴스" items={imgs} onZoom={(pics, at) => setZoom({ pics, at })} onFail={() => {}} />
        : <div className="nm-th-h"><b>카드뉴스</b><i>아직 그림 없음</i></div>}
      {children}
      {zoom ? <Zoom pics={zoom.pics} at={zoom.at} onClose={() => setZoom(null)} /> : null}
    </section>
  );
}
