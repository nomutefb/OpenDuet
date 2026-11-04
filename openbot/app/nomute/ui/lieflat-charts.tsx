// lieflat-charts 그림 다섯 — 라이브러리(nomutefb/lieflat-charts) 그리는 줄을 그대로 옮겨 React 부품으로 감쌈
//   원본 = templates/glance-gallery.html G20 · lupi-gallery.html L16·L3 · basics-gallery.html F10(C6)·F11(C7)·F2(B2)
//   도구 = ../vendor/lieflat/mono-tokens.js(MONO.el·txt·tip·pol·rnd·DARK) · color-presets.js(WIRE.HERODK) · lieflat.css(.pop·.fade·.draw)
//   바꾼 곳 = 연습 자료(rnd) → props · id 찾기 → ref · obsReveal → 처음 한 번만 움직임(useLieflat) · 밝은 판 색 → MONO.DARK · 글자 ≥11 · 폭 = 실폭(px)
import "../vendor/lieflat/mono-tokens.js";
import "../vendor/lieflat/color-presets.js";
import "../vendor/lieflat/lieflat.css";
import { useEffect, useLayoutEffect, useRef } from "react";

// ── MONO 꼴(mono-tokens.js 가 window/globalThis 에 붙임) ──
type Attrs = Record<string, string | number>;
interface Mono {
  L: string[];
  DARK: { bg: string; ink: string; muted: string; faint: string; grid: string; gridSoft: string; ladder: string[] };
  rnd: (i: number, k: number) => number;
  pol: (cx: number, cy: number, r: number, deg: number) => [number, number];
  el: (p: Element, t: string, a: Attrs) => SVGElement;
  txt: (p: Element, a: Attrs, s: string | number) => SVGTextElement;
  tip: (n: Element, s: string) => void;
}
type G = { MONO: Mono; PRESETS: { WIRE: { HERODK: string } } };
// 붙는 자리 = mono-tokens.js 끝 줄과 같은 식(브라우저 = window · 그 밖 = globalThis)
const host = () => (typeof window !== "undefined" ? window : globalThis) as unknown as G;
const mono = () => host().MONO;

export const LF_FONT = 'Inter, "Pretendard", "Noto Sans KR", system-ui, sans-serif';
const FS = 11;   // 폰 360 에서 10px 아래로 안 내려가는 글자 크기(폭 = 실폭이라 1단위 = 1px)

/** 어두운 판 색 — 밝은 판 회색 MONO.L[i] ↔ MONO.DARK.ladder[i](같은 칸) · L 밖의 옅은 회색 = ladder 맨 끝 */
function pal() {
  const m = mono(), D = m.DARK;
  const dk = (hex: string) => { const i = m.L.indexOf(hex); return i < 0 ? D.ladder[D.ladder.length - 1] : D.ladder[i]; };
  return { INK: D.ink, PAPER: D.bg, MUTED: D.muted, GRID: D.grid, HERO: host().PRESETS.WIRE.HERODK, dk };
}

// 글자 폭 어림(한글 ≈ 1em · 대문자·숫자 ≈ .66em)
const tw = (s: string, fs: number, ls = 0) =>
  [...s].reduce((a, ch) => a + fs * ((/[ᄀ-ᇿ㄰-㆏가-힯一-鿿]/.test(ch) ? .95 : /[A-Z0-9]/.test(ch) ? .66 : ch === " " ? .28 : .55) + ls), 0);
const fit = (s: string, fs: number, max: number) => {
  if (tw(s, fs) <= max) return s;
  const t = [...s];
  while (t.length > 1 && tw(t.join("") + "…", fs) > max) t.pop();
  return t.join("") + "…";
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lsOf = (s: string, ls: string) => (/[가-힯]/.test(s) ? "0" : ls);   // 한글엔 자간 안 벌림

/** 누르는 칸(폰엔 hover 없음) — 투명 사각형 · 클릭·Enter·Space */
function hit(s: SVGSVGElement, a: Attrs, label: string, go: () => void) {
  const { el, tip } = mono();
  const n = el(s, "rect", { ...a, fill: "transparent", class: "lf-hit", tabindex: 0, role: "button", "aria-label": label });
  tip(n, label);
  n.addEventListener("click", go);
  n.addEventListener("keydown", (e) => { const k = (e as KeyboardEvent).key; if (k === "Enter" || k === " ") { e.preventDefault(); go(); } });
}

/**
 * obsReveal(mono-tokens.js §9) 의 React 판 — 보이면(문턱 .3) 그리고 감시 끊음 · 내릴 때도 끊음
 * 처음 한 번만 .pop/.fade/.draw 움직임 · 자료·폭이 바뀌면 lf-still 로 움직임 없이 다시 그림 · 클릭 다시 보기는 뺌(칸 누르기와 겹침)
 */
function useLieflat(key: string, draw: (s: SVGSVGElement, w: number) => void, measure: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const live = useRef({ draw, key, shown: false, drawn: "" });
  const paint = (still: boolean) => {
    const s = svg.current, b = box.current;
    if (!s || !b) return;
    const w = measure ? Math.round(b.clientWidth) || 360 : 360;
    const sig = live.current.key + "|" + w;
    if (still && sig === live.current.drawn) return;
    live.current.drawn = sig;
    s.innerHTML = "";
    s.classList.toggle("lf-still", still);
    live.current.draw(s, w);
  };
  useLayoutEffect(() => {
    live.current.draw = draw;
    live.current.key = key;
    if (live.current.shown) paint(true);
  });
  useEffect(() => {
    const s = svg.current, b = box.current;
    if (!s) return;
    let io: IntersectionObserver | undefined, ro: ResizeObserver | undefined;
    const first = () => { live.current.shown = true; paint(false); };
    if (typeof IntersectionObserver === "undefined") first();
    else {
      // 문턱 .3 · 화면보다 큰 그림은 화면 절반이 차면(원본은 이 경우 안 켜짐)
      const ok = (e: IntersectionObserverEntry) => e.isIntersecting && (e.intersectionRatio >= .3 || e.intersectionRect.height >= (e.rootBounds?.height ?? Infinity) * .5);
      io = new IntersectionObserver((es) => { if (es.some(ok)) { io?.disconnect(); first(); } }, { threshold: [0, .05, .1, .2, .3] });
      io.observe(s);
    }
    if (measure && b && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => { if (live.current.shown) paint(true); });
      ro.observe(b);
    }
    return () => { io?.disconnect(); ro?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure]);
  return { box, svg };
}

// ═══════════════════════════════════════════════════════════════
// MatrixHeat — G20(통짜 칸 · 칸 안 글자) + L16(자기 칸 = 짧은 선 · 빈 칸 = 작은 점 · 고른 칸 = 점선 틀)
// ═══════════════════════════════════════════════════════════════
export type HeatStatus = "ok" | "late" | "miss" | "unknown" | "off";
export type HeatCell = { st: HeatStatus; label?: string };
const ST_KO: Record<HeatStatus, string> = { ok: "됨", late: "늦음", miss: "놓침", unknown: "모름", off: "꺼짐" };

export type MatrixHeatProps = {
  rows: string[];
  cols: string[];
  /** r·c = 줄·칸 번호(0부터) */
  cells: (r: number, c: number) => HeatCell;
  onCell?: (r: number, c: number) => void;
  /** 고른 칸 = L16 점선 틀 */
  mark?: { r: number; c: number } | null;
  className?: string;
  "aria-label"?: string;
};

function drawMatrix(s: SVGSVGElement, W: number, rows: string[], cols: string[], grid: HeatCell[][], mark: MatrixHeatProps["mark"], tap: (r: number, c: number) => void) {
  const { el, txt } = mono(), C = pal();
  const nR = rows.length, nC = Math.max(1, cols.length);
  // 줄 이름 칸(G20 = 글 끝 X0-10)
  const rowW = Math.min(W * .34, Math.max(0, ...rows.map((r) => tw(r, FS))));
  const X0 = 4 + rowW + 10;
  const colW = Math.max(0, ...cols.map((c) => tw(c, FS, .06)));
  // G20 간격 48 · 칸 42 · 줄 42 · 칸 36 — 넓으면 그 크기에서 멈춤
  let PX = Math.min(48, (W - X0 - 4) / nC);
  const rot = colW > PX - 4;   // 칸 이름이 칸보다 길면 L16 처럼 -55° 눕힘
  if (rot) PX = Math.min(PX, (W - X0 - 4 - colW * .574) / Math.max(.5, nC - .5));
  PX = Math.max(PX, 3);
  const gap = PX * 6 / 48, Wc = PX - gap;
  const PY = Math.max(PX * 42 / 48, FS + 6), H = PY - gap;
  const Y0 = rot ? 14 + colW * .82 : FS + 14;
  const rx = Math.min(9, Wc * 9 / 42, H * 9 / 36);
  const k = clamp(Math.min(Wc, H) / 22, .6, 2);   // L16 칸 22 기준
  const every = rot ? Math.max(1, Math.ceil((FS + 1) / (PX * .82))) : 1;
  const step = Math.min(.02, 1 / (nR + nC));
  s.setAttribute("viewBox", `0 0 ${W} ${Y0 + nR * PY + 4}`);

  cols.forEach((f, c) => {
    if (c % every) return;
    const cx = X0 + c * PX + Wc / 2;
    if (rot) txt(s, { x: cx, y: Y0 - 10, "font-size": FS, "font-weight": 700, fill: C.MUTED, "letter-spacing": lsOf(f, ".06em"),
      transform: `rotate(-55 ${cx} ${Y0 - 10})`, class: "fade", style: `animation-delay:${c * .04}s` }, f);
    else txt(s, { x: cx, y: Y0 - 12, "font-size": FS, "font-weight": 700, fill: C.MUTED, "text-anchor": "middle",
      "letter-spacing": lsOf(f, ".04em"), class: "fade", style: `animation-delay:${c * .04}s` }, f);
  });
  rows.forEach((name, r) => {
    txt(s, { x: X0 - 10, y: Y0 + r * PY + H / 2 + 4, "font-size": FS, "font-weight": 700, fill: C.dk("#6A6963"), "text-anchor": "end",
      class: "fade", style: `animation-delay:${r * .05}s` }, fit(name, FS, rowW));
  });

  const hits: [number, number, number, number, string][] = [];
  grid.forEach((row, r) => row.forEach((cell, c) => {
    const x = X0 + c * PX, y = Y0 + r * PY, d = (r + c) * step;
    const say = `${rows[r]} · ${cols[c]} — ${ST_KO[cell.st]}${cell.label ? " " + cell.label : ""}`;
    hits.push([r, c, x, y, say]);
    if (cell.st === "off") {   // L16 자기 칸 = 짧은 선
      el(s, "rect", { x: x + Wc / 2 - 3 * k, y: y + H / 2 - .6, width: 6 * k, height: 1.2, fill: C.dk("#D8D6CE"),
        class: "fade", style: `animation-delay:${d}s` });
      return;
    }
    if (cell.st === "unknown") {   // L16 빈 칸 = 작은 점(침묵도 보이게)
      el(s, "circle", { cx: x + Wc / 2, cy: y + H / 2, r: .9 * k, fill: C.dk("#D8D6CE"), class: "pop", style: `animation-delay:${d}s` });
      return;
    }
    const fill = cell.st === "ok" ? C.INK : cell.st === "miss" ? C.HERO : C.MUTED;
    el(s, "rect", { x, y, width: Wc, height: H, rx, fill, class: "pop", style: `animation-delay:${d}s` });
    if (cell.st === "late") {   // 늦음 = 점선 고리(L16 틀 꼴 · 칸 틈 안쪽)
      const o = Math.max(1, Math.min(3.5, gap / 2 - .3));
      el(s, "rect", { x: x - o, y: y - o, width: Wc + 2 * o, height: H + 2 * o, rx: rx + o, fill: "none",
        stroke: C.dk("#4A4944"), "stroke-width": 1, "stroke-dasharray": "2 3", class: "fade", style: `animation-delay:${.5 + d}s` });
    }
    if (cell.label && Wc >= tw(cell.label, FS) + 4 && H >= FS + 2)   // G20 칸 안 글자
      txt(s, { x: x + Wc / 2, y: y + H / 2 + 4, "font-size": FS, "font-weight": 800, fill: C.PAPER, "text-anchor": "middle",
        class: "fade", style: `animation-delay:${.15 + d}s` }, cell.label);
  }));
  if (mark && mark.r >= 0 && mark.r < nR && mark.c >= 0 && mark.c < cols.length) {   // L16 고른 칸 점선 틀
    const x = X0 + mark.c * PX, y = Y0 + mark.r * PY;
    el(s, "rect", { x: x - 3.5, y: y - 3.5, width: Wc + 7, height: H + 7, rx: Math.min(6, rx + 3.5), fill: "none",
      stroke: C.INK, "stroke-width": 1, "stroke-dasharray": "2 3", class: "fade", style: "animation-delay:.9s" });
  }
  hits.forEach(([r, c, x, y, say]) => hit(s, { x: x - gap / 2, y: y - gap / 2, width: PX, height: PY }, say, () => tap(r, c)));
}

export function MatrixHeat({ rows, cols, cells, onCell, mark, className, "aria-label": aria }: MatrixHeatProps) {
  const grid = rows.map((_, r) => cols.map((_, c) => cells(r, c)));
  const tap = useRef(onCell);
  useLayoutEffect(() => { tap.current = onCell; });
  const key = JSON.stringify([rows, cols, grid, mark ?? null]);
  const { box, svg } = useLieflat(key, (s, w) => drawMatrix(s, w, rows, cols, grid, mark, (r, c) => tap.current?.(r, c)), true);
  return (
    <div ref={box} className={`lf lf-matrix ${className ?? ""}`}>
      <svg ref={svg} className="lf-fit" viewBox={`0 0 360 ${25 + rows.length * 42}`} role="group" aria-label={aria} style={{ fontFamily: LF_FONT }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DotHeat — F10(C6 dot heat · 점 넓이 = 건수 · 0 = 작은 점 · 점선 고리) + 지금 세로선
// ═══════════════════════════════════════════════════════════════
export type DotHeatProps = {
  rows: string[];
  hours?: number;
  /** row = 줄 번호(0부터) · hour = 0..hours-1 */
  value: (row: number, hour: number) => number;
  /** 점선 고리 = 실패한 칸 */
  ring?: (row: number, hour: number) => boolean;
  /** 지금 시각(소수 = 그 시간 안) · 없으면 선 없음 */
  nowHour?: number;
  onCell?: (row: number, hour: number) => void;
  className?: string;
  "aria-label"?: string;
};

function drawDots(s: SVGSVGElement, W: number, rows: string[], hours: number, vals: number[][], rings: boolean[][], nowHour: number | undefined, tap: (r: number, h: number) => void) {
  const { el, txt } = mono(), C = pal();
  const nR = rows.length;
  const rowW = Math.min(W * .3, Math.max(0, ...rows.map((r) => tw(r, FS, .08))));
  const X0 = 4 + rowW + 10;   // F10 = 글 끝 50 · 첫 점 64
  const PX = Math.max(3, (W - X0 - 4) / hours);
  const PY = Math.max(PX * 30 / 27, FS + 7);   // F10 간격 27 × 30
  const y0 = (i: number) => 6 + PY / 2 + i * PY, x0 = (j: number) => X0 + j * PX + PX / 2;
  let max = 0;
  vals.forEach((row) => row.forEach((t) => { if (t > max) max = t; }));
  const rMax = Math.min(PX, PY) * .45, k = rMax / (1.2 + Math.sqrt(Math.max(1, max)) * 2.1);   // F10 r = 1.2+√t·2.1 를 칸에 맞춤
  const rOf = (t: number) => (1.2 + Math.sqrt(t) * 2.1) * k;
  const yEnd = y0(nR - 1) + PY / 2;
  const step = Math.min(.015, .9 / Math.max(1, hours));
  s.setAttribute("viewBox", `0 0 ${W} ${yEnd + FS + 10}`);

  if (nowHour != null && nowHour >= 0 && nowHour <= hours) {   // 지금 = F10 점선 꼴 세로선
    const x = X0 + nowHour * PX;
    el(s, "line", { x1: x, y1: 4, x2: x, y2: yEnd, stroke: C.MUTED, "stroke-width": 1, "stroke-dasharray": "2 3", class: "fade", style: "animation-delay:1s" });
  }
  const hits: [number, number, string][] = [];
  for (let i = 0; i < nR; i++) {
    txt(s, { x: X0 - 10, y: y0(i) + 4, "font-size": FS, "font-weight": 700, fill: C.dk("#6A6963"), "text-anchor": "end",
      "letter-spacing": lsOf(rows[i], ".08em"), class: "fade", style: `animation-delay:${i * .05}s` }, fit(rows[i], FS, rowW));
    for (let j = 0; j < hours; j++) {
      const t = vals[i][j], x = x0(j), y = y0(i), d = i * .05 + j * step;
      hits.push([i, j, `${rows[i]} ${j}:00 — ${t}${rings[i][j] ? " · 실패" : ""}`]);
      let r: number;
      if (!t) {
        r = Math.max(1, .8 * k);
        el(s, "circle", { cx: x, cy: y, r, fill: C.dk("#D8D6CE"), class: "pop", style: `animation-delay:${d}s` });
      } else {
        r = rOf(t);
        el(s, "circle", { cx: x, cy: y, r, fill: t > max * .66 ? C.INK : t > max * .33 ? C.dk("#6A6963") : C.dk("#B0AFA9"),
          class: "pop", style: `animation-delay:${d}s` });
      }
      if (rings[i][j])   // F10 점선 고리(봉우리 → 실패 칸 · 색 = HERO)
        el(s, "circle", { cx: x, cy: y, r: clamp(r + Math.max(1.6, 3.4 * k), Math.min(PX, PY) * .4, Math.min(PX, PY) * .62), fill: "none",
          stroke: C.HERO, "stroke-width": 1.2, "stroke-dasharray": "2 3", class: "fade", style: "animation-delay:1s" });
    }
  }
  const every = Math.max(1, Math.ceil(tw("00:00", FS) / PX / 2) * 2, hours >= 24 ? 6 : 2);
  for (let j = 0; j < hours; j += every)
    txt(s, { x: x0(j), y: yEnd + FS + 6, "font-size": FS, "font-weight": 600, fill: C.MUTED, "text-anchor": "middle",
      class: "fade", style: `animation-delay:${j * .02}s` }, j + ":00");
  hits.forEach(([i, j, say]) => hit(s, { x: X0 + j * PX, y: y0(i) - PY / 2, width: PX, height: PY }, say, () => tap(i, j)));
}

export function DotHeat({ rows, hours = 24, value, ring, nowHour, onCell, className, "aria-label": aria }: DotHeatProps) {
  const vals = rows.map((_, i) => Array.from({ length: hours }, (_, j) => Math.max(0, Math.round(value(i, j) || 0))));
  const rings = rows.map((_, i) => Array.from({ length: hours }, (_, j) => !!ring?.(i, j)));
  const tap = useRef(onCell);
  useLayoutEffect(() => { tap.current = onCell; });
  const key = JSON.stringify([rows, hours, vals, rings, nowHour ?? null]);
  const { box, svg } = useLieflat(key, (s, w) => drawDots(s, w, rows, hours, vals, rings, nowHour, (r, h) => tap.current?.(r, h)), true);
  return (
    <div ref={box} className={`lf lf-dotheat ${className ?? ""}`}>
      <svg ref={svg} className="lf-fit" viewBox={`0 0 360 ${30 + rows.length * 18}`} role="group" aria-label={aria} style={{ fontFamily: LF_FONT }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TickGauge — F11(C7 tick gauge · 210° 표 · 1 tick = 1%)
// ═══════════════════════════════════════════════════════════════
export type TickGaugeProps = { value: number; label: string; sub: string; className?: string };

function drawGauge(s: SVGSVGElement, value: number, label: string, sub: string) {
  const { el, txt, tip, pol, rnd } = mono(), C = pal();
  const GOAL = Math.round(clamp(value || 0, 0, 100));
  const cx = 180, cy = 136, R0 = 104, A0 = -195, SW = 210;   // 원본 cx 200 cy 190 → 360 폭
  for (let k = 0; k < 100; k++) {
    const a = A0 + k / 100 * SW, inked = k < GOAL;
    const len = inked ? 13 + rnd(k + 1, 3) * 6 : 5 + rnd(k + 1, 7) * 2.5;
    const [x1, y1] = pol(cx, cy, R0, a), [x2, y2] = pol(cx, cy, R0 + len, a);
    el(s, "line", { x1, y1, x2, y2, stroke: inked ? C.INK : C.dk("#CFCEC7"), "stroke-width": inked ? 1 : .6,
      class: "fade", style: `animation-delay:${k * .012}s` });
  }
  [25, 50, 75, 100].forEach((m) => {
    const a = A0 + m / 100 * SW, [dx, dy] = pol(cx, cy, R0 - 7, a), [tx2, ty2] = pol(cx, cy, R0 - 27, a);   // 글자 12 라 원본 R0-19 보다 안쪽
    el(s, "circle", { cx: dx, cy: dy, r: 1, fill: C.dk("#B0AFA9"), class: "fade", style: "animation-delay:.8s" });
    txt(s, { x: tx2, y: ty2 + 4, "font-size": 12, "font-weight": 600, fill: C.MUTED, "text-anchor": "middle",
      class: "fade", style: "animation-delay:.85s" }, m);
  });
  const aT = A0 + GOAL / 100 * SW, [ex, ey] = pol(cx, cy, R0 + 20, aT);   // 끝 구슬
  el(s, "circle", { cx: ex, cy: ey, r: 2.4, fill: C.INK, class: "pop", style: "animation-delay:1.1s" });
  const num = txt(s, { x: cx, y: cy - 4, "font-size": 34, "font-weight": 800, fill: C.INK, "text-anchor": "middle",
    class: "fade", style: "animation-delay:1s" }, GOAL + "%");
  tip(num, `${GOAL}%${label ? " · " + label : ""}`);
  if (label) txt(s, { x: cx, y: cy + 20, "font-size": 12, "font-weight": 600, fill: C.MUTED, "text-anchor": "middle",
    "letter-spacing": lsOf(label, ".1em"), class: "fade", style: "animation-delay:1.05s" }, label);
  if (sub) txt(s, { x: 180, y: 188, "font-size": 12, "font-weight": 600, fill: C.dk("#B0AFA9"), "text-anchor": "middle",
    "letter-spacing": lsOf(sub, ".12em"), class: "fade", style: "animation-delay:1.2s" }, sub);
}

export function TickGauge({ value, label, sub, className }: TickGaugeProps) {
  const key = JSON.stringify([Math.round(clamp(value || 0, 0, 100)), label, sub]);
  const { box, svg } = useLieflat(key, (s) => drawGauge(s, value, label, sub), false);
  return (
    <div ref={box} className={`lf lf-gauge ${className ?? ""}`}>
      <svg ref={svg} viewBox="0 0 360 196" role="img" aria-label={`${Math.round(clamp(value || 0, 0, 100))}% ${label}`}
        style={{ fontFamily: LF_FONT, maxWidth: 420 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Hairline — F2(B2 hairline line · 날짜 바닥 + 발 선 + 점 · 속 빈 점) 을 높이 28 줄그림으로
// ═══════════════════════════════════════════════════════════════
export type HairlineProps = {
  points: { t: number; v: number }[];
  /** i = points 의 번호 · 참 = 속 빈 점 */
  hollow?: (i: number) => boolean;
  /** 점 설명(없으면 값) */
  tip?: (i: number) => string;
  height?: number;
  className?: string;
  "aria-label"?: string;
};

function drawLine(s: SVGSVGElement, W: number, H: number, pts: { t: number; v: number; i: number; h: boolean; say: string }[]) {
  const { el, tip } = mono(), C = pal();
  s.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const N = pts.length, base = H - 1.5;
  el(s, "line", { x1: 0, y1: base, x2: W, y2: base, stroke: C.GRID, "stroke-width": .8, class: "fade" });
  if (!N) return;
  const t0 = pts[0].t, t1 = pts[N - 1].t;
  const pitch = N > 1 ? (W - 12) / (N - 1) : W;
  const r0 = clamp(pitch * .35, .9, 2.1), rBig = r0 * 2;   // F2 = 2.1 · 봉우리 4.2
  const pad = rBig + 1.5, top = rBig + 1, lo = base - 5;
  const x = (t: number) => (t1 === t0 ? W / 2 : pad + (t - t0) / (t1 - t0) * (W - 2 * pad));
  const vs = pts.map((p) => p.v), vmin = Math.min(...vs), vmax = Math.max(...vs);
  const map = (v: number) => (vmax === vmin ? (lo + top) / 2 : lo - (v - vmin) / (vmax - vmin) * (lo - top));
  const step = Math.min(.008, .5 / N);
  // 날짜 바닥
  pts.forEach((p, d) => el(s, "line", { x1: x(p.t), y1: base, x2: x(p.t), y2: base - 3, stroke: C.dk("#CFCEC7"), "stroke-width": .6,
    class: "fade", style: `animation-delay:${d * step}s` }));
  // 봉우리 둘(떨어져 있게)
  const top2: number[] = [], gapN = Math.max(1, Math.round(N / 6));
  for (const d of [...vs.keys()].sort((a, b) => vs[b] - vs[a])) {
    if (top2.every((t) => Math.abs(t - d) >= gapN)) top2.push(d);
    if (top2.length === 2) break;
  }
  if (N > 1) el(s, "path", { d: "M" + pts.map((p) => `${x(p.t)} ${map(p.v)}`).join(" L "), fill: "none", stroke: C.INK, "stroke-width": 1,
    pathLength: 1, class: "draw", style: "animation-duration:1.2s" });
  pts.forEach((p, d) => {
    const big = top2.includes(d);
    const dot = el(s, "circle", { cx: x(p.t), cy: map(p.v), r: big ? rBig : r0, fill: p.h ? C.PAPER : C.INK, stroke: C.INK,
      "stroke-width": p.h ? 1 : 0, class: "pop", style: `animation-delay:${.2 + d * Math.min(.03, 1 / N)}s` });
    tip(dot, p.say);
  });
}

export function Hairline({ points, hollow, tip, height = 28, className, "aria-label": aria }: HairlineProps) {
  const pts = points.map((p, i) => ({ t: p.t, v: p.v, i, h: !!hollow?.(i), say: tip ? tip(i) : String(p.v) })).sort((a, b) => a.t - b.t);
  const key = JSON.stringify([pts, height]);
  const { box, svg } = useLieflat(key, (s, w) => drawLine(s, w, height, pts), true);
  return (
    <div ref={box} className={`lf lf-hairline ${className ?? ""}`}>
      <svg ref={svg} className="lf-fit" viewBox={`0 0 360 ${height}`} role="img" aria-label={aria} style={{ fontFamily: LF_FONT }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Barcode — L3(barcode lollipop · 하루 = 발 선 하나 · 머리 점 · 줄기 길이 rnd) · 돌린 한 번 = 하나 · 속 빈 = 실패
// ═══════════════════════════════════════════════════════════════
export type BarcodeProps = {
  runs: { t: number; ok: boolean }[];
  tip?: (i: number) => string;
  height?: number;
  className?: string;
  "aria-label"?: string;
};

function drawBarcode(s: SVGSVGElement, W: number, H: number, runs: { t: number; ok: boolean; say: string }[]) {
  const { el, tip, rnd } = mono(), C = pal();
  s.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const N = runs.length;
  if (!N) return;
  const t0 = runs[0].t, t1 = runs[N - 1].t;
  const pitch = N > 1 ? (W - 8) / (N - 1) : W;
  const r = clamp(pitch * .4, 1.2, 2.7);   // L3 = 2.7
  const pad = r + 2, cy = r + 6, yB = H - 2;
  const x = (t: number) => (t1 === t0 ? W / 2 : pad + (t - t0) / (t1 - t0) * (W - 2 * pad));
  const step = Math.min(.008, .8 / N);
  // 발 선 = 한 번에 하나, 끝까지
  runs.forEach((p, d) => el(s, "line", { x1: x(p.t), y1: 2, x2: x(p.t), y2: yB, stroke: C.GRID, "stroke-width": .7,
    class: "fade", style: `animation-delay:${d * step * .5}s` }));
  runs.forEach((p, d) => {
    const xx = x(p.t);
    const stemEnd = Math.min(yB, cy + 6 + rnd(d + 1, 9) * (yB - cy - 6));
    el(s, "line", { x1: xx, y1: cy, x2: xx, y2: stemEnd, stroke: C.INK, "stroke-width": 1.1,
      class: "fade", style: `animation-delay:${.3 + d * step}s` });
    const dot = el(s, "circle", { cx: xx, cy, r, fill: p.ok ? C.INK : C.PAPER, stroke: C.INK, "stroke-width": p.ok ? 0 : 1.2,
      class: "pop", style: `animation-delay:${.3 + d * step}s` });
    tip(dot, p.say);
  });
}

export function Barcode({ runs, tip, height = 40, className, "aria-label": aria }: BarcodeProps) {
  const rs = runs.map((p, i) => ({ t: p.t, ok: !!p.ok, say: tip ? tip(i) : p.ok ? "됨" : "실패" })).sort((a, b) => a.t - b.t);
  const key = JSON.stringify([rs, height]);
  const { box, svg } = useLieflat(key, (s, w) => drawBarcode(s, w, height, rs), true);
  return (
    <div ref={box} className={`lf lf-barcode ${className ?? ""}`}>
      <svg ref={svg} className="lf-fit" viewBox={`0 0 360 ${height}`} role="img" aria-label={aria} style={{ fontFamily: LF_FONT }} />
    </div>
  );
}
