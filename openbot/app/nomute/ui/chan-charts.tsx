// 채널 전체 그림 둘 — 잘 되는 조건 · 시간대별 반응(빠르 11-01 18:04 「그림 두 칸을 네가 맡아 줘」 · 형 「다른 애들 작업하고있는데 그거 좀 도와줘 ㅋㅋ 그래픽 구현작업이 좀 있을수있어서」)
//   붙일 자리 = chan.tsx ChanModal full 블록(최근 게시물 아래) · <ChanCharts d={d} src={src} /> 한 줄 · 섹션 꼴 = .nm-chan-sec + .yset-sec 머리(빠르 판과 같음)
//   그리는 몸 = ./chan-charts-draw(에디터 원본 줄 그대로) · 여기는 원본 renderChan 883~913 의 부르는 줄 · condFill(실폭 그리기) · sigFit(폰 실폭) · sigWire(툴팁) 만 React 로
//   반응 기간 = 원본 CHAN_RR(기본 90일 · 창 산출분 없으면 세그 없이 전 기간) · 잘 되는 조건 = 인스타만(원본 그대로)
import "./chan-charts.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { chLiftChart, condCards, condDraw } from "./chan-charts-draw";

type Src = "ig" | "fb" | "th";
type Hit = { x: number; y: number; bucket: string; share: number | null; n: number; low: boolean; gm: number; gen: number | null };
type Cond = { t: string; a: string; b: string; bead: number | null; unit?: string; rows: unknown[]; foot: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Chan = any;

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] as string);
const md = (ymd?: string) => { const m = /^\d{4}-(\d{2})-(\d{2})/.exec(ymd || ""); return m ? `${+m[1]}/${+m[2]}` : ""; };   // 원본 fmtK12(…).split(' ')[0] = 월/일

/** 칸 실폭(원본 condFill·sigFit 의 실폭 다시 그리기 = ResizeObserver) */
function useWidth() {
  const [el, setEl] = useState<HTMLDivElement | null>(null), [w, setW] = useState(0);   // 콜백 ref = 칸이 늦게 생겨도(자료 도착 뒤) 감시가 붙음
  useLayoutEffect(() => {
    if (!el) return;
    const set = () => setW(Math.floor(el.clientWidth)); set();
    const ro = new ResizeObserver(set); ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, w, el] as const;
}

/** 잘 되는 조건 카드 하나 = 원본 cond-card 마크업 + condFillOne(실폭 · 폭 0 이면 임시 340 비율 그림) */
function CondCard({ c }: { c: Cond }) {
  const [ref, w, v] = useWidth();
  useLayoutEffect(() => {
    if (!v) return;
    const svg = condDraw(w || 340, c) as SVGSVGElement;
    if (!w) { svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.width = "100%"; svg.style.height = "auto"; }
    v.replaceChildren(svg);
  }, [w, c, v]);
  return (
    <div className="cond-card">
      <div className="cond-h"><span className="cond-t">{c.t}</span><span className="sig-lgd"><i className="lg-ring">{c.a}</i><i className="lg-sh">{c.b}</i>{c.bead ? <i className="lg-bead">구슬 = {c.bead}{c.unit}</i> : null}</span></div>
      <div className="cond-viz" ref={ref} />
      <div className="cond-c">{c.foot}</div>
    </div>
  );
}

/** 시간대·요일 그림 하나 = chLiftChart 문자열 + 원본 sigWire(겹친 요일 서브 숫자 걷기 · 최근접 점 툴팁·호버점) */
function SigChart({ buckets, ax, x2, src, w }: { buckets: unknown; ax: "hour_band" | "dow"; x2: Record<string, unknown>; src: Src; w: number }) {
  const box = useRef<HTMLDivElement>(null);
  const r = chLiftChart(buckets, ax, { ...x2, w: w === 600 ? 0 : w }, src) as { html: string; hits: Hit[]; w: number } | null;
  const html = r ? r.html : "";
  useEffect(() => {
    const wrap = box.current?.querySelector<HTMLElement>(".sig-chartwrap"); if (!wrap || !r) return;
    const subs = [...wrap.querySelectorAll<SVGTextElement>("text.sig-sub")];
    for (let i = 1; i < subs.length; i++) { const a = subs[i - 1].getBBox(), b = subs[i].getBBox(); if (a.width && b.x < a.x + a.width) { subs.forEach((t) => t.remove()); break; } }
    const hits = r.hits || [], tip = wrap.querySelector<HTMLElement>(".ch-tip"), dot = wrap.querySelector<HTMLElement>(".ch-dot"), svg = wrap.querySelector("svg");
    if (!hits.length || !tip || !svg) return;
    const vb = svg.viewBox.baseVal, VW = vb.width || 600, VH = vb.height || 154;
    const place = (x: number, y: number) => { const q = wrap.getBoundingClientRect(); return [x / VW * q.width, y / VH * q.height]; };
    const hide = () => { tip.style.opacity = "0"; if (dot) dot.style.opacity = "0"; };
    const move = (ev: PointerEvent | TouchEvent) => {
      const q = wrap.getBoundingClientRect(), cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX, px = (cx - q.left) / q.width * VW;
      let best = hits[0], bd = 1e9; hits.forEach((pt) => { const dd = Math.abs(pt.x - px); if (dd < bd) { bd = dd; best = pt; } });
      const [tx, ty] = place(best.x, best.y);
      tip.innerHTML = `<b>${esc(best.bucket)}</b><br><span style="color:var(--mut);font-size:10px">${src === "fb" ? "반응" : "공유"} ×${best.share ?? "—"}${best.gen != null ? " · " + (best.gm ? "접속 " : "앱 사용자 이용 ") + "×" + best.gen : ""} · n=${best.n}${best.low ? " · 표본부족" : ""}</span>`;
      const hw = (tip.offsetWidth || 110) / 2; tip.style.left = Math.max(hw + 2, Math.min(q.width - hw - 2, tx)) + "px"; tip.style.top = ty + "px"; tip.style.opacity = "1";
      if (dot) { dot.style.left = tx + "px"; dot.style.top = ty + "px"; dot.style.opacity = "1"; }
    };
    wrap.addEventListener("pointermove", move); wrap.addEventListener("pointerleave", hide); wrap.addEventListener("touchmove", move, { passive: true });
    return () => { wrap.removeEventListener("pointermove", move); wrap.removeEventListener("pointerleave", hide); wrap.removeEventListener("touchmove", move); };
  }, [html, r, src]);
  return r ? <div ref={box} dangerouslySetInnerHTML={{ __html: html }} /> : null;
}

export function ChanCharts({ d, src }: { d: Chan; src: Src }) {
  const [rr, setRr] = useState<"90" | "all">("90");   // 원본 CHAN_RR 기본 '90'(운영자 261025 「최근 90일만 보는 기준」)
  const [ref, cw] = useWidth();
  if (!d) return null;
  const cards: Cond[] = src === "ig" ? condCards(d) : [];   // IG 원장 지표라 FB·스레드 = 없음(원본 883)
  const sigD = d.signals || {}, rw = sigD.win_90d || {};
  const rrOk = !!(d.topics_90d && sigD.axes_90d && rw.n), rr90 = rrOk && rr === "90";   // 창 산출분 도착 전·FB·스레드 = 세그 없이 전 기간(원본 887)
  const axes = (rr90 ? sigD.axes_90d : sigD.axes) || {};
  const nowK3 = new Date(Date.now() + (540 + new Date().getTimezoneOffset()) * 60000);   // KST 벽시계(원본 907)
  const sigPk = ((d.online_peak_kst || []) as string[]).map((p) => parseInt(p, 10)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 23);
  const led = d.online_src ? { days: +((String(d.online_src).match(/(\d+)일/) || [])[1] || 0) || null, last: d.online_led_last || null, stall: d.online_led_last ? Math.max(0, Math.round((+nowK3 - +new Date(d.online_led_last + "T00:00:00Z")) / 864e5)) : null } : null;
  const w = typeof matchMedia === "function" && matchMedia("(max-width:640px)").matches && cw && cw < 600 ? cw : 600;   // 원본 sigFit = 폰은 실폭 · PC·600 이상 = 600 고정
  const hb = { peaks: sigPk, now: nowK3.getHours() + nowK3.getMinutes() / 60, curve: d.online_curve_kst || null, led };
  const dw = { today: ["일", "월", "화", "수", "목", "금", "토"][nowK3.getDay()], curve: d.online_dow_kst || null, led };
  const hasSig = !!(chLiftChart(axes.hour_band, "hour_band", hb, src) || chLiftChart(axes.dow, "dow", dw, src));
  return (
    <>
      {cards.length ? (
        <section className="nm-chan-sec nm-cc" aria-label="잘 되는 조건">
          <div className="yset-sec"><b>잘 되는 조건</b></div>
          <div className="cond-grid">{cards.map((c, i) => <CondCard key={c.t + i} c={c} />)}</div>
        </section>
      ) : null}
      <section className="nm-chan-sec nm-cc" aria-label="시간대별 반응" hidden={!hasSig}>
        <div className="yset-sec"><b>시간대별 반응</b>
          {rrOk ? <span className="nm-chan-seg" role="tablist">{([["90", "90일", `최근 90일 = ${md(rw.from)}~${md(rw.to)} 게시물 ${rw.n}개 — 이 창 안에서 비교`], ["all", "전체", `전 기간(표본 ${sigD.n_posts || "—"}개)`]] as const).map(([k, t, tt]) => <button key={k} type="button" role="tab" title={tt} aria-selected={rr === k} className={rr === k ? "on" : ""} onClick={() => setRr(k)}>{t}</button>)}</span> : null}
        </div>
        <div className="nm-cc-box" ref={ref}>
          {hasSig ? <><SigChart buckets={axes.hour_band} ax="hour_band" x2={hb} src={src} w={w} /><SigChart buckets={axes.dow} ax="dow" x2={dw} src={src} w={w} /></> : null}
        </div>
      </section>
    </>
  );
}
