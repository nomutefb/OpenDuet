// 고정 줄 바탕 = 그 프로필 고유색(말풍선 색) · 단체방 · 고유색 없는 줄 = 라임 · 진하기 = 설정(기본 20% · 이 기기)
// 형 11-14 23:39 dm-gik 「그리고 그 고정 좌측 라인. 고정하면 그냥 그 프로필 고유색 20% 가 라인에 칠해지능거로 대신할게. 단체방들은 라임색20이 고정인거고. 좌측 라인은 삭제. 프로필 고유색이 없으면 라임색20이 기본 이거를 그냥 설정에서 변경하게 만들어도 돼 값을 투명도」 · 깃 #-016 덧 · 뜸
import { useSyncExternalStore } from "react";
import { RbsGauge } from "./rbs-gauge";   // 설정 게이지 하네스(에디터 nm-gauge.js 러버밴드 게이지)

const KEY = "nm-pin-alpha", LIME = "#CFFF40", DEF = 20;
const subs = new Set<() => void>();
const read = (): number => { try { const v = Number(localStorage.getItem(KEY)); return v >= 5 && v <= 100 ? Math.round(v) : DEF; } catch { return DEF; } };
let cur = read();
export const setPinAlpha = (v: number) => { cur = Math.max(5, Math.min(100, Math.round(v))); try { localStorage.setItem(KEY, String(cur)); } catch { /* 이번만 */ } subs.forEach((f) => f()); };
export const usePinAlpha = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => cur, () => DEF);
/** 채도(HSL · 0~1) — 죽은 회색 가름 · 순수(시험) */
export const satOf = (hex: string): number => {
  const n = parseInt(hex.slice(1, 7), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx === mn ? 0 : (mx - mn) / (mx + mn > 255 ? 510 - mx - mn : mx + mn);
};
const DULL = 0.18;   // 이 아래 = 칠하면 죽은 회색(시아 #685466 = 0.11 · 다른 애들 0.4 넘음)
/** 은빛 결(멈춘 금속 그라데이션 · 도는 반짝임 0 = 가만히 둔 화면 0) · 진하기 = 같은 설정 값 */
export const silverOf = (pct: number) => {
  const a = Math.min(1, pct / 100), A = (k: number) => +(Math.min(1, a * k)).toFixed(3);
  return `linear-gradient(105deg, rgba(214,220,228,${A(1.5)}) 0%, rgba(250,252,255,${A(2.2)}) 11%, rgba(150,158,170,${A(0.8)}) 34%, rgba(120,128,140,${A(0.7)}) 62%, rgba(246,249,253,${A(2)}) 89%, rgba(190,198,208,${A(1.3)}) 100%)`;   // 양 끝 빛 띠 + 가운데(글자 자리) 어둡게 = 붓질 은 · 글자 읽힘 그대로(셋 견줌 = 사진/pm-silver-견줌.png · 로그인 없는 창)
};
/** 고정 줄 바탕(#RRGGBBAA 또는 은빛 결) · hex = 그 줄 고유색(없으면 라임) · 채도 낮은 색 = 은빛(형 11-21 06:05 dm-sia 시아 옮김 「시아 고정 색이 너무 죽은 회색인데.좀 멋쟁이 은색일 수 없나」) */
export const pinTint = (hex: string | undefined, pct: number) => {
  const h = /^#[0-9a-f]{6}/i.test(hex || "") ? (hex as string).slice(0, 7) : LIME;
  if (satOf(h) < DULL) return silverOf(pct);
  return h + Math.round((pct / 100) * 255).toString(16).padStart(2, "0");
};

export function PinTintSetting() {
  const a = usePinAlpha();
  return (
    <div className="nm-pintint">   {/* 슬라이더 = 설정 게이지 하네스(./rbs-gauge.tsx · 값 = 강조색 굵게 · 두 번 누르기 = 기본값) · 알약 = .yset-chip — 전 = 브라우저 기본 파랑 슬라이더 + 밑줄 글자(봄 11-18) */}
      <div className="row">
        <RbsGauge min={5} max={100} step={5} value={a} def={DEF} label="고정 줄 색 진하기" valueText={`${a}%`} onInput={setPinAlpha} />
        <b>{a}%</b>
      </div>
      <div className="sw" aria-hidden>
        <i style={{ background: pinTint("#4812BD", a) }} />
        <i style={{ background: pinTint("", a) }} />
      </div>
      {a !== DEF ? <button type="button" className="yset-chip" onClick={() => setPinAlpha(DEF)}>기본 {DEF}%</button> : null}
    </div>
  );
}
