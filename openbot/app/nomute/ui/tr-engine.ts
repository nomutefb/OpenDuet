// 번역카드 합성 엔진 = 옛 에디터 viewer/tr.html 의 캔버스 함수들을 그대로 옮김(번개 11-10 · ./trcard.tsx 가 씀)
//   같은 것 = 색 · 서체 · 자간 상수 · OCR(tesseract.js@5 · eng · 누를 때만 로드) · 발췌 리프트(팝아웃 배율) · 형광펜(multiply 50%) · 검정 칩 · 밴드(dark/light · *초록* · [박스]) · 비율 · JPG q90
//   다른 것 = 전역 대신 인자(img · lines · plan · 옵션)로 받음
/* eslint-disable @typescript-eslint/no-explicit-any */
import { arRatio } from "./tr-logic";
export type OcrLine = { i: number; t: string; b: { x: number; y: number; w: number; h: number } };
export type Plan = { hl?: number[]; chips?: { a: number; t: string }[]; band?: string; fail?: boolean; msg?: string };
export type TrOpt = { style: "dark" | "light"; fs: number; ar: string };   // ar = 프리셋(4:5 · 9:16 · 16:9) 또는 직접 「W:H」(./tr-logic arRatio)

const TR_BLACK = "#000", TR_WHITE = "#fff", TR_GREEN = "#2ee65c";
export const TR_JPGQ = 0.9;
export const TR_W = 1080;
const PADX = 64, TRACK = "-0.01em";
const FONT_KO = "'Noto Sans KR', 'Noto Sans', -apple-system, sans-serif";
const OV_MARK = "rgba(120,240,90,.5)", OV_CHIP = "rgba(18,18,18,.85)", OV_LINE = "rgba(255,255,255,.13)", OV_TEXT = "#f4f7f4", OV_EMPH = "#8dff6a";

const withCap = <T,>(p: Promise<T>, ms: number, msg: string): Promise<T> => { let t: ReturnType<typeof setTimeout>; return Promise.race([Promise.resolve(p).finally(() => clearTimeout(t)), new Promise<T>((_, rj) => { t = setTimeout(() => rj(new Error(msg)), ms); })]); };
function loadTess(): Promise<void> {   // 원본 = 누를 때만 지연 로드(평시 무게 0)
  if ((window as any).Tesseract) return Promise.resolve();
  return withCap(new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload = () => res(); s.onerror = () => rej(new Error("OCR 라이브러리 로드 실패 — 네트워크 확인"));
    document.head.appendChild(s);
  }), 25000, "OCR 라이브러리 로드 지연 — 네트워크 확인 후 다시 눌러줘");
}
export async function runOcr(img: HTMLImageElement): Promise<OcrLine[]> {
  await loadTess();
  const T = (window as any).Tesseract;
  const w = await withCap<any>(T.createWorker("eng"), 60000, "글자 인식 준비 지연(언어 데이터 내려받기) — 재시도");
  let data: any;
  try { ({ data } = await withCap<any>(w.recognize(img), 120000, "글자 읽기가 너무 오래 걸려 — 더 작은/선명한 이미지로 다시")); }
  finally { try { await w.terminate(); } catch { /* 회수 */ } }
  return ((data && data.lines) || [])
    .map((l: any, i: number) => ({ i, t: String(l.text || "").trim(), b: { x: l.bbox.x0, y: l.bbox.y0, w: l.bbox.x1 - l.bbox.x0, h: l.bbox.y1 - l.bbox.y0 } }))
    .filter((l: OcrLine) => l.t.length > 1 && l.b.w > 8 && l.b.h > 6);
}
let cardFontsReady = false;
export async function ensureCardFonts() {   // 원본 = 노토산스 400 · 700 를 합성 때만
  if (cardFontsReady) return;
  if (!document.querySelector("link[data-nm-noto]")) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.dataset.nmNoto = "1";
    l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap";
    document.head.appendChild(l);
  }
  try { await withCap(Promise.all([document.fonts.load("400 40px 'Noto Sans KR'"), document.fonts.load("700 40px 'Noto Sans KR'")]), 8000, "font"); } catch { /* 폴백 서체 */ }
  cardFontsReady = true;
}

type Run = { tx: string; m: "n" | "g" | "b" };
function parseRuns(line: string): Run[] {
  const runs: Run[] = []; let m: Run["m"] = "n", buf = "";
  const flush = () => { if (buf) { runs.push({ tx: buf, m }); buf = ""; } };
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "*") { flush(); m = m === "g" ? "n" : "g"; }
    else if (ch === "[" && m === "n") { flush(); m = "b"; }
    else if (ch === "]" && m === "b") { flush(); m = "n"; }
    else buf += ch;
  }
  flush(); return runs;
}
function tokens(runs: Run[]): Run[] {
  const out: Run[] = [];
  runs.forEach((r) => {
    if (r.m !== "n") { out.push({ tx: r.tx, m: r.m }); return; }
    let cur = "";
    const flush = () => { if (cur) { out.push({ tx: cur, m: r.m }); cur = ""; } };
    for (const ch of r.tx) {
      if (ch === " ") { flush(); out.push({ tx: " ", m: r.m }); }
      else if (ch.charCodeAt(0) > 0x2e7f) { flush(); out.push({ tx: ch, m: r.m }); }
      else cur += ch;
    }
    flush();
  });
  return out;
}
const bandFont = (fs: number) => `700 ${fs}px ${FONT_KO}`;
type Tk = Run & { w: number };
function setLS(ctx: CanvasRenderingContext2D, v: string) { (ctx as any).letterSpacing = v; }
function layoutBand(b: { tx: string; style: string; fs: number }) {
  const mx = TR_W - PADX * 2, lh = Math.round(b.fs * 1.55);
  const mc = document.createElement("canvas").getContext("2d")!;
  mc.font = bandFont(b.fs); setLS(mc, TRACK);
  const lines: Tk[][] = [];
  b.tx.split("\n").forEach((raw) => {
    let line: Tk[] = [], w = 0;
    const put = (tk: Run): void => {
      const tw = mc.measureText(tk.tx).width;
      if (w + tw > mx && line.length) { lines.push(line); line = []; w = 0; if (tk.tx === " ") return; }
      if (tw > mx && tk.tx.length > 1) { [...tk.tx].forEach((ch) => put({ tx: ch, m: tk.m })); return; }
      line.push({ ...tk, w: tw }); w += tw;
    };
    tokens(parseRuns(raw)).forEach(put);
    lines.push(line);
  });
  const padY = Math.round(b.fs * 1.05);
  return { lines, lh, padY, h: padY * 2 + lines.length * lh };
}
function drawBand(ctx: CanvasRenderingContext2D, b: { tx: string; style: string; fs: number }, y: number) {
  const L = layoutBand(b), dark = b.style === "dark";
  ctx.fillStyle = dark ? TR_BLACK : TR_WHITE; ctx.fillRect(0, y, TR_W, L.h);
  ctx.font = bandFont(b.fs); setLS(ctx, TRACK); ctx.textBaseline = "alphabetic";
  let ly = y + L.padY + Math.round(b.fs * 0.92);
  L.lines.forEach((line) => {
    let x = PADX;
    line.forEach((tk) => {
      if (tk.m === "b") { ctx.fillStyle = dark ? TR_WHITE : TR_BLACK; ctx.fillRect(x - 2, ly - b.fs * 0.92, tk.w + 4, b.fs * 1.22); }
      else if (tk.m === "g" && !dark) { ctx.fillStyle = TR_GREEN; ctx.fillRect(x - 2, ly - b.fs * 0.92, tk.w + 4, b.fs * 1.22); }
      x += tk.w;
    });
    x = PADX;
    line.forEach((tk) => {
      ctx.fillStyle = tk.m === "b" ? (dark ? TR_BLACK : TR_WHITE) : tk.m === "g" ? (dark ? TR_GREEN : TR_BLACK) : dark ? TR_WHITE : TR_BLACK;
      ctx.fillText(tk.tx, x, ly); x += tk.w;
    });
    ly += L.lh;
  });
  return L.h;
}
function chipLayout(ctx: CanvasRenderingContext2D, t: string, fs: number, maxW: number) {
  const toks: { tx: string; m: "g" | "n" }[] = [];
  parseRuns(t).forEach((r) => { r.tx.split(/(\s+)/).forEach((p) => { if (p) toks.push({ tx: p, m: r.m === "g" ? "g" : "n" }); }); });
  const lines: { tx: string; m: "g" | "n"; w: number }[][] = [[]]; let w = 0;
  toks.forEach((tk) => {
    const tw = ctx.measureText(tk.tx).width;
    if (w + tw > maxW && lines[lines.length - 1].length) { lines.push([]); w = 0; if (/^\s+$/.test(tk.tx)) return; }
    lines[lines.length - 1].push({ ...tk, w: tw }); w += tw;
  });
  const lw = Math.max(...lines.map((l) => l.reduce((a, x) => a + x.w, 0)), 1);
  return { lines, w: lw, lh: Math.round(fs * 1.38) };
}
function hlRuns(hl?: number[]) {
  const arr = [...new Set((hl || []).filter((i) => Number.isInteger(i)))].sort((a, b) => a - b);
  const runs: { s: number; e: number }[] = []; let cur: { s: number; e: number } | null = null;
  arr.forEach((i) => { if (cur && i === cur.e + 1) cur.e = i; else { cur = { s: i, e: i }; runs.push(cur); } });
  return runs;
}
const popScale = (run: { s: number; e: number }) => Math.max(1.16, Math.min(1.36, 1.4 - (run.e - run.s) * 0.05));
function runNatRect(run: { s: number; e: number }, bmap: Map<number, OcrLine["b"]>) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = run.s; i <= run.e; i++) { const b = bmap.get(i); if (!b) continue; x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
  return x0 > x1 ? null : { x0, y0, x1, y1 };
}
function drawExcerpts(ctx: CanvasRenderingContext2D, img: HTMLImageElement, lines: OcrLine[], plan: Plan, ox: number, oy: number, g: number) {
  const bmap = new Map(lines.map((l) => [l.i, l.b]));
  const runs = hlRuns(plan.hl), ex = new Map<number, { left: number; right: number; top: number; bottom: number }>();
  runs.forEach((run, ri) => {
    const R = runNatRect(run, bmap); if (!R) return;
    const pad = 8 / g, sx = R.x0 - pad, sy = R.y0 - pad, sw = R.x1 - R.x0 + pad * 2, sh = R.y1 - R.y0 + pad * 2;
    const fw = sw * g, fh = sh * g, cx = ox + ((R.x0 + R.x1) / 2) * g, cy = oy + ((R.y0 + R.y1) / 2) * g;
    const P = popScale(run), dwp = fw * P, dhp = fh * P;
    let dx = cx - dwp / 2; const dy = cy - dhp / 2;
    dx = Math.max(10, Math.min(dx, TR_W - dwp - 10));
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 7;
    ctx.fillStyle = TR_WHITE; ctx.fillRect(dx - 6, dy - 4, dwp + 12, dhp + 8); ctx.restore();
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dwp, dhp);
    ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = OV_MARK;
    for (let i = run.s; i <= run.e; i++) { const b = bmap.get(i); if (!b) continue; const lx = dx + (b.x - sx) * g * P, ly = dy + (b.y - sy) * g * P; ctx.fillRect(lx - 3, ly - 2, b.w * g * P + 6, b.h * g * P + 4); }
    ctx.restore();
    ex.set(ri, { left: dx, right: dx + dwp, top: dy, bottom: dy + dhp });
  });
  return { runs, ex };
}
function drawChips(ctx: CanvasRenderingContext2D, plan: Plan, regionH: number, exData: ReturnType<typeof drawExcerpts>) {
  const { runs, ex } = exData, CHIP_FS = 30, padX = 12, padY = 9, maxW = 900;
  ctx.font = `700 ${CHIP_FS}px ${FONT_KO}`; setLS(ctx, TRACK); ctx.textBaseline = "middle";
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  (plan.chips || []).forEach((c) => {
    let ri = runs.findIndex((r) => c.a >= r.s && c.a <= r.e);
    if (ri < 0 && runs.length) ri = runs.reduce((bi, r, i) => (Math.abs((r.s + r.e) / 2 - c.a) < Math.abs((runs[bi].s + runs[bi].e) / 2 - c.a) ? i : bi), 0);
    const e = ex.get(ri), L = chipLayout(ctx, String(c.t || ""), CHIP_FS, maxW);
    const bw = Math.min(L.w, maxW) + padX * 2, bh = L.lines.length * L.lh + padY * 2;
    const x = e ? Math.max(16, Math.min(Math.round(e.left), TR_W - bw - 16)) : 20;
    let y = e ? Math.round(e.bottom) + 10 : 24;
    placed.forEach((r) => { if (x < r.x + r.w && x + bw > r.x && y < r.y + r.h && y + bh > r.y) y = r.y + r.h + 7; });
    if (y + bh > regionH - 6) y = Math.max(6, (e ? Math.round(e.top) : regionH) - bh - 10);
    placed.push({ x, y, w: bw, h: bh });
    ctx.fillStyle = OV_CHIP; ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = OV_LINE; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
    L.lines.forEach((ln, k) => { let tx2 = x + padX; const cy = y + padY + L.lh * (k + 0.5); ln.forEach((tk) => { ctx.fillStyle = tk.m === "g" ? OV_EMPH : OV_TEXT; ctx.fillText(tk.tx, tx2, cy); tx2 += ctx.measureText(tk.tx).width; }); });
  });
  setLS(ctx, "0px");
}
/** 원본 compose = 결과 전엔 원본 사진 · 결과 뒤엔 비율 카드(문서 contain + 딤 + 발췌 · 칩 + 밴드) */
export function compose(cv: HTMLCanvasElement, img: HTMLImageElement, lines: OcrLine[] | null, plan: Plan | null, o: TrOpt) {
  const ctx = cv.getContext("2d")!;
  if (!plan || !lines) { const h = Math.round((TR_W * img.naturalHeight) / img.naturalWidth); cv.width = TR_W; cv.height = h; ctx.drawImage(img, 0, 0, TR_W, h); return; }
  const cut = document.createElement("canvas"); const s = TR_W / img.naturalWidth; cut.width = TR_W; cut.height = Math.round(img.naturalHeight * s); cut.getContext("2d")!.drawImage(img, 0, 0, TR_W, cut.height);
  const band = String(plan.band || "").trim(), bandIt = band ? { tx: band, style: o.style, fs: o.fs } : null;
  const bH = bandIt ? layoutBand(bandIt).h : 0, RH = Math.round(TR_W * arRatio(o.ar)), regionH = RH - bH;
  cv.width = TR_W; cv.height = RH;
  ctx.fillStyle = TR_WHITE; ctx.fillRect(0, 0, TR_W, RH);
  const sf = Math.min(TR_W / cut.width, regionH / cut.height), dw = Math.round(cut.width * sf), dh = Math.round(cut.height * sf);
  const ox = Math.round((TR_W - dw) / 2), oy = Math.round((regionH - dh) / 2);
  ctx.drawImage(cut, ox, oy, dw, dh);
  ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(ox, oy, dw, dh);
  const g = (TR_W / img.naturalWidth) * sf;
  drawChips(ctx, plan, regionH, drawExcerpts(ctx, img, lines, plan, ox, oy, g));
  if (bandIt) drawBand(ctx, bandIt, regionH);
}
export const trFailReason = (txt: string) => { const m = /^TRAUTO_FAILED:\s*(.+)$/m.exec(String(txt || "")); return m ? m[1].trim() : ""; };
