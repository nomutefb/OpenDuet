// 우리 조약돌 = bloub 아바타(https://github.com/jeremy-prt/bloub · MIT © Jérémy · 형 포크 nomutefb/bloub) — 사본 0 · 에디터가 이미 올린 /vendor/bloub/*.js 를 그대로 불러 씀
//   (형 11-05 「카피하지말고 가져다가 써」 · 그리기 = editor viewer/runner.html 아래 module 스크립트 · 원본 BloubBot.vue 템플릿과 같은 꼴: 눈 = 몸 mask 구멍 · 몸 아래 바탕 판 · 뎅 = 테)
//   모양·색 = runner.html BEING_SHAPE · BOT_INK · BOT_RIM 그대로(형 10-31 「너네 각각의 색이 그냥 부여되면 될거같아 봄은 분홍, 시아는 노뮤트색, 윈터는 흰은색, 빠르는 로얄블루네온, 뎅은 갈색+네온」 · 「걔들이 고른 형태로 해줘야행!」)
import { useEffect, useRef } from "react";

export const BEING_SHAPE: Record<string, string> = { bom: "fleur", winter: "flocon", sia: "galet", deng: "galet", fast: "nuage", neo: "patate", eyes: "riz", lightning: "cercle", gik: "goutte", bit: "squircle" };   // 번개 = 배선 뒤 스스로 고를 때까지 동그라미(윈터 16:01 「모양은 번개한테 물어봐」)
export const BEING_INK: Record<string, string> = { bom: "#ff6fb5", winter: "#0ffd02", sia: "#dde3ea", deng: "#9c5a26", fast: "#2f6bff", neo: "#ffd60a", eyes: "#ffb07c", lightning: "#FFE606", gik: "#7EDFC3", bit: "#C8643B", chaeng: "#8FC45A" };   // 챙 = 떡잎 연두를 글자로 읽히게 한 단계 진하게(형 11-12 07:29 「시그니처 색 정해서 참고 연두색 좋을긋」 · 챙 「내 떡잎 색이야」 · 라임 #CFFF40 · 윈터 #0FFD02 와 갈림 · 뜸)   // 번개 = 명부 말풍선 색
export const BEING_RIM: Record<string, string> = { deng: "#ffb300" };
const ASLEEP = "#4f4f4f";   // 잠듦 = 회색 몸(형 10-31 「불꺼짅채로 잠들고 있으면 되는거임」 · runner.html BOT_ASLEEP)

type Frame = { bodyPath: string; bodyAlpha?: number; eyes: ({ d: string; matrix: string; alpha: number } | null)[] };
type Engine = { sample: (t: number) => Frame };
type Lib = { BotEngine: new (r: number, state: string, radii: unknown, expr: unknown) => Engine; SHAPE_BY_ID: Map<string, { radii: unknown }>; EXPRESSIONS: unknown[]; RAYON: number; VB: number };
let libP: Promise<Lib | null> | null = null;
const load = () => (libP ||= (async () => {
  try {
    const imp = (u: string) => import(/* @vite-ignore */ u);
    const [e, s, x, r] = await Promise.all([imp("/vendor/bloub/engine.js"), imp("/vendor/bloub/skins.js"), imp("/vendor/bloub/expressions.js"), imp("/vendor/bloub/repere.js")]);
    return { BotEngine: e.BotEngine, SHAPE_BY_ID: s.SHAPE_BY_ID, EXPRESSIONS: x.EXPRESSIONS, RAYON: r.RAYON, VB: r.DEMI_VIEWBOX };
  } catch { return null; }
})());

// 한 박자 돌림(30fps 상한 · 숨은 탭·움직임 줄이기 = 멈춤) — 조약돌 여럿이 rAF 하나를 같이 씀
type Live = { el: SVGSVGElement; eng: Engine; body: SVGPathElement; back: SVGPathElement; edge: SVGPathElement | null; eyes: SVGPathElement[]; g: SVGGElement; off: number };
const live = new Set<Live>();
let raf = 0, last = 0;
const t0 = typeof performance !== "undefined" ? performance.now() : 0;
function draw(b: Live, t: number) {
  const f = b.eng.sample(b.off + t);
  b.body.setAttribute("d", f.bodyPath); b.back.setAttribute("d", f.bodyPath); b.edge?.setAttribute("d", f.bodyPath);
  b.g.setAttribute("opacity", String(f.bodyAlpha ?? 1));
  b.eyes.forEach((e, i) => { const y = f.eyes[i]; if (!y) { e.removeAttribute("d"); return; } e.setAttribute("d", y.d); e.setAttribute("transform", y.matrix); e.setAttribute("opacity", String(y.alpha)); });
}
function run() {
  if (raf) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = (now: number) => {
    raf = 0;
    for (const b of live) if (!b.el.isConnected) live.delete(b);
    if (!live.size) return;
    if (now - last >= 33) { last = now; const t = still ? 0 : (now - t0) / 1000; live.forEach((b) => draw(b, t)); }
    if (!still && !document.hidden) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => { if (!document.hidden) run(); });

let uid = 0;
/** 조약돌 하나 — who = 열쇠(bom·winter·sia·deng·fast·neo·eyes) · asleep = 회색 몸(테 없음) · 바탕 = paper(몸 아래 판 · 눈 구멍으로 비침) */
export function Bloub({ who, asleep = false, size = 18, paper = "#0b0b0c", title }: { who: string; asleep?: boolean; size?: number; paper?: string; title?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current; if (!svg) return;
    let gone = false, mine: Live | null = null;
    void load().then((L) => {
      if (gone || !L || !svg.isConnected) return;
      const NS = "http://www.w3.org/2000/svg", VB = L.VB;
      const mk = <K extends keyof SVGElementTagNameMap>(n: K, a: Record<string, string | number>) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, String(a[k])); return e; };
      while (svg.lastChild && svg.lastChild.nodeName !== "title") svg.removeChild(svg.lastChild);
      const shape = L.SHAPE_BY_ID.get(BEING_SHAPE[who] || "cercle") || L.SHAPE_BY_ID.get("cercle")!;
      const ink = asleep ? ASLEEP : BEING_INK[who] || "#f1efe9", rim = asleep ? "" : BEING_RIM[who] || "";
      const expr = L.EXPRESSIONS[Math.floor(Math.random() * L.EXPRESSIONS.length)];   // 표정 = 그때그때(runner.html 과 같음)
      const eng = new L.BotEngine(L.RAYON, "idle", shape.radii, expr), id = `nmpeb${++uid}`;
      const mask = mk("mask", { id, maskUnits: "userSpaceOnUse", x: -VB, y: -VB, width: VB * 2, height: VB * 2 });
      const body = mk("path", { fill: "#fff" }), eyes = [mk("path", { fill: "#000" }), mk("path", { fill: "#000" })];
      mask.append(body, ...eyes);
      const defs = mk("defs", {}); defs.append(mask);
      const g = mk("g", {}), back = mk("path", { fill: paper }), m = mk("g", { mask: `url(#${id})` });
      m.append(mk("rect", { x: -VB, y: -VB, width: VB * 2, height: VB * 2, fill: ink }));
      const edge = rim ? mk("path", { fill: "none", stroke: rim, "stroke-width": 24 }) : null;
      g.append(back, m); if (edge) g.append(edge);
      svg.append(defs, g);
      mine = { el: svg, eng, body, back, edge, eyes, g, off: Math.random() * 30 };
      live.add(mine); draw(mine, 0); run();
    });
    return () => { gone = true; if (mine) live.delete(mine); };
  }, [who, asleep, paper]);
  return (
    <svg ref={ref} className="nm-bloub" viewBox="-158 -158 316 316" width={size} height={size} role="img" aria-label={title || who}>
      {title ? <title>{title}</title> : null}
    </svg>
  );
}
