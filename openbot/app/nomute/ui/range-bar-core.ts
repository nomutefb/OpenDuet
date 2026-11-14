// 기간 막대 셈(./range-bar.tsx) — 끄는 동안의 자리 · 놓을 때 붙는 자리 · 글자. 그림과 떼어 둠(시험 = tests/range-bar.test.ts)
export type Span = { a: number; b: number };   // 시(소수 = 끄는 중) · a = 시작 · b = 끝
export type Grab = "move" | "a" | "b";
export type Lim = { lo: number; hi: number; min: number; step: number };   // lo~hi = 눈금 끝 · min = 가장 짧은 길이 · step = 붙는 단위(시)
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** 끄는 중 = 잡은 곳에 따라 통째로 옮기거나 한쪽 끝만 · 눈금 밖 · 최소 길이 밑으로는 안 감 */
export function dragTo(grab: Grab, from: Span, dh: number, l: Lim): Span {
  if (grab === "move") { const len = from.b - from.a, a = clamp(from.a + dh, l.lo, l.hi - len); return { a, b: a + len }; }
  if (grab === "a") return { a: clamp(from.a + dh, l.lo, from.b - l.min), b: from.b };
  return { a: from.a, b: clamp(from.b + dh, from.a + l.min, l.hi) };
}
/** 놓을 때 = 단위에 붙음(통째로 옮길 땐 길이 그대로) */
export function snapTo(grab: Grab, s: Span, l: Lim): Span {
  const r = (v: number) => Math.round(v / l.step) * l.step;
  if (grab === "move") { const len = r(s.b - s.a) || l.min, a = clamp(r(s.a), l.lo, l.hi - len); return { a, b: a + len }; }
  if (grab === "a") return { a: clamp(r(s.a), l.lo, s.b - l.min), b: s.b };
  return { a: s.a, b: clamp(r(s.b), s.a + l.min, l.hi) };
}
const two = (n: number) => String(n).padStart(2, "0");
/** 09:30 꼴(끄는 중엔 분까지) */
export const hmOf = (v: number) => { const m = Math.round(v * 60); return `${two(Math.floor(m / 60))}:${two(m % 60)}`; };
/** 길이 글자 = 3시간 · 8시간 30분 · 45분 */
export const spanKo = (len: number) => { const m = Math.max(0, Math.round(len * 60)), h = Math.floor(m / 60), r = m % 60; return h && r ? `${h}시간 ${r}분` : h ? `${h}시간` : `${r}분`; };
/** 요일 묶음 글자 = 매일 · 평일 · 주말 · 월·수·금 */
export const wdKo = (wd: number[]) => { const w = [...new Set(wd)].sort((x, y) => x - y), k = w.join(","); return w.length === 7 || !w.length ? "매일" : k === "1,2,3,4,5" ? "평일" : k === "0,6" ? "주말" : w.map((d) => "일월화수목금토"[d]).join("·"); };
