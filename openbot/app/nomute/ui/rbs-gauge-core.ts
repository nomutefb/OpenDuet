// 러버밴드 게이지 셈(./rbs-gauge.tsx · 원본 = nomutefb/editor viewer/nm-gauge.js at() · frac()) — 화면 없이 시험되게 따로 둠
export const K = 0.32;   // 넘친 거리 추종 비율 = kinetics «Rubber-band Slider» 원본 동값
/** 자리(0~1 밖 포함) → [값(칸에 맞춤), 그릴 자리(넘친 만큼 ×K)] */
export function rbsAt(raw: number, min: number, max: number, step: number): [number, number] {
  const c = Math.min(1, Math.max(0, raw)), st = step || 1;
  const v = Math.min(max, Math.max(min, min + Math.round((c * (max - min)) / st) * st));
  return [+v.toFixed(6), c + (raw - c) * K];
}
/** 값 → 자리(0~1) */
export const rbsFrac = (v: number, min: number, max: number) => (max > min ? Math.min(1, Math.max(0, (v - min) / (max - min))) : 0);
