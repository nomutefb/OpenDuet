// 서랍 「프롬프팅」 판 2 산수 — 원본 viewer/k.html(K_LEN · segTotal · segLast · segValid · lenFit · kPayload)과 functions/api/k.js 검증을 한 곳에
//   서버 계약: 길이 = `<n>s`(3 ~ 모델 상한 · kling 15 · kling4 30) · 분막 = 2~5구간 · 구간마다 정수 3 ~ 상한 · 합 ≤ 상한 · 서술 ≤ 500 · 어기면 서버가 조용히 버림
export type KModel = "kling4" | "kling";
export type Seg = { s: number; txt: string };
export const K_MODELS: { id: KModel; nm: string; pre: number[]; max: number }[] = [   // 기본 = 4.0(운영자 261021)
  { id: "kling4", nm: "Kling 4.0", pre: [10, 15, 20, 30], max: 30 },
  { id: "kling", nm: "Kling 3.0 Omni", pre: [8, 10, 15], max: 15 },
];
export const LEN_MIN = 3, SEG_MIN = 3, SEG_N_MAX = 5, SEG_TXT = 500;
export const kSpec = (m: KModel) => K_MODELS.find((x) => x.id === m) ?? K_MODELS[0];

/** 모델을 바꿨을 때 길이 맞춤 — 0(자동)은 그대로 · 상한을 넘으면 상한으로(원본 lenFit · kling4 30s → kling 15s) */
export const lenFit = (len: number, m: KModel) => (len ? Math.max(LEN_MIN, Math.min(Math.round(len), kSpec(m).max)) : 0);
/** 프리셋이 아닌 값 = 「직접」(원본 = 골드레몬 값) */
export const isDirect = (len: number, m: KModel) => !!len && !kSpec(m).pre.includes(len);

export const segFixed = (segs: Seg[]) => segs.slice(0, -1).reduce((a, g) => a + g.s, 0);
/** 마지막 구간 = 나머지 자동 */
export const segLast = (segs: Seg[], total: number) => total - segFixed(segs);
export const segOk = (total: number) => total >= SEG_MIN * 2;   // 6초 미만 = 분막 못 함(구간 최소 3초 × 2)
/** 길이가 줄었을 때 구간 맞춤 — 뒤 고정 구간부터 걷어 마지막(나머지) ≥ 3 · 그래도 안 되면 두 구간으로(원본 segValid) */
export function segFit(segs: Seg[], total: number): Seg[] {
  let a = segs.filter((g) => g && Number.isInteger(g.s) && typeof g.txt === "string").slice(0, SEG_N_MAX).map((g, i, all) => ({ s: i === all.length - 1 ? 0 : Math.max(SEG_MIN, g.s), txt: g.txt.slice(0, SEG_TXT) }));
  if (a.length < 2) a = [{ s: SEG_MIN, txt: a[0]?.txt ?? "" }, { s: 0, txt: "" }];
  while (a.length > 2 && segLast(a, total) < SEG_MIN) a.splice(a.length - 2, 1);
  if (segLast(a, total) < SEG_MIN) a = [{ s: SEG_MIN, txt: a[0].txt }, { s: 0, txt: a[a.length - 1].txt }];
  return a;
}
export const segCanAdd = (segs: Seg[], total: number) => segLast(segs, total) >= SEG_MIN * 2 && segs.length < SEG_N_MAX;   // 나머지에서 3초 떼고도 3초 남아야
export const segCanGrow = (segs: Seg[], total: number) => segLast(segs, total) > SEG_MIN;
/** 서버로 가는 꼴 — 마지막 구간 s = 나머지 */
export const segPayload = (segs: Seg[], total: number) => segs.map((g, i) => ({ s: i === segs.length - 1 ? segLast(segs, total) : g.s, txt: g.txt.slice(0, SEG_TXT) }));
/** 서버(api/k.js)가 받아 줄 꼴인지 — 아니면 서버가 분막을 통째로 버리므로 보내기 전에 화면에서 막는다 */
export function segValid(segs: Seg[], total: number, m: KModel): boolean {
  const p = segPayload(segs, total), max = kSpec(m).max;
  return p.length >= 2 && p.length <= SEG_N_MAX && p.every((g) => Number.isInteger(g.s) && g.s >= SEG_MIN && g.s <= max) && p.reduce((a, g) => a + g.s, 0) <= max;
}
/** 구간 머리 배지 「0~3초」 줄 */
export function segSpans(segs: Seg[], total: number): { from: number; to: number }[] {
  let acc = 0;
  return segs.map((g, i) => { const n = i === segs.length - 1 ? segLast(segs, total) : g.s, from = acc; acc += n; return { from, to: acc }; });
}

// ── 진행 중 여러 줄(판 3 · 원본 = nm-jobs 슬롯 · 운영자 260810 「동시에 병렬로 진행」) — 저장 칸 nm_k_pend = 옛 꼴(한 개 객체)도 읽음
export type KPend = { out: string; ref: string; t0: number; lbl: string };
export const K_PAR_MAX = 4;   // 한 창에서 같이 기다리는 줄(원본엔 상한 없음 · 5초마다 줄마다 두 번 읽으니 넷에서 막음)
const okPend = (p: unknown): p is KPend => { const o = p as KPend | null; return !!o && typeof o.out === "string" && o.out.startsWith("/") && !o.out.includes("..") && !o.out.includes("//") && o.out.length <= 200 && Number.isFinite(o.t0); };
/** 저장된 진행 줄 읽기 — 옛 꼴(객체 하나) · 배열 둘 다 · 같은 out 한 번 · 30분(잡 상한) 넘긴 줄은 버림 · 새것이 뒤 */
export function pendLoad(raw: unknown, now: number, budgetMs: number): KPend[] {
  const a = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : [], seen = new Set<string>(), out: KPend[] = [];
  for (const p of a) { if (!okPend(p) || seen.has(p.out) || now - p.t0 >= budgetMs) continue; seen.add(p.out); out.push({ out: p.out, ref: typeof p.ref === "string" ? p.ref : "", t0: p.t0, lbl: typeof p.lbl === "string" ? p.lbl.slice(0, 24) : "프롬프트" }); }
  return out.sort((x, y) => x.t0 - y.t0).slice(-K_PAR_MAX);
}
export const pendAdd = (a: KPend[], p: KPend) => [...a.filter((x) => x.out !== p.out), p].slice(-K_PAR_MAX);
export const pendDrop = (a: KPend[], out: string) => a.filter((x) => x.out !== out);
