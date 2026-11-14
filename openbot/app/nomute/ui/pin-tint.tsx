// 고정 줄 바탕 = 그 프로필 고유색(말풍선 색) · 단체방 · 고유색 없는 줄 = 라임 · 진하기 = 설정(기본 20% · 이 기기)
// 형 11-14 23:39 dm-gik 「그리고 그 고정 좌측 라인. 고정하면 그냥 그 프로필 고유색 20% 가 라인에 칠해지능거로 대신할게. 단체방들은 라임색20이 고정인거고. 좌측 라인은 삭제. 프로필 고유색이 없으면 라임색20이 기본 이거를 그냥 설정에서 변경하게 만들어도 돼 값을 투명도」 · 깃 #-016 덧 · 뜸
import { useSyncExternalStore } from "react";

const KEY = "nm-pin-alpha", LIME = "#CFFF40", DEF = 20;
const subs = new Set<() => void>();
const read = (): number => { try { const v = Number(localStorage.getItem(KEY)); return v >= 5 && v <= 100 ? Math.round(v) : DEF; } catch { return DEF; } };
let cur = read();
export const setPinAlpha = (v: number) => { cur = Math.max(5, Math.min(100, Math.round(v))); try { localStorage.setItem(KEY, String(cur)); } catch { /* 이번만 */ } subs.forEach((f) => f()); };
export const usePinAlpha = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => cur, () => DEF);
/** 고정 줄 바탕 색(#RRGGBBAA) · hex = 그 줄 고유색(없으면 라임) */
export const pinTint = (hex: string | undefined, pct: number) => {
  const h = /^#[0-9a-f]{6}/i.test(hex || "") ? (hex as string).slice(0, 7) : LIME;
  return h + Math.round((pct / 100) * 255).toString(16).padStart(2, "0");
};

export function PinTintSetting() {
  const a = usePinAlpha();
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex items-center gap-3">
        <input type="range" min={5} max={100} step={5} value={a} aria-label="고정 줄 색 진하기" className="flex-1" onChange={(e) => setPinAlpha(+e.target.value)} />
        <b className="w-12 text-right tabular-nums">{a}%</b>
      </div>
      <div className="flex gap-2">
        <span className="h-8 flex-1 rounded-lg" style={{ background: pinTint("#4812BD", a) }} />
        <span className="h-8 flex-1 rounded-lg" style={{ background: pinTint("", a) }} />
      </div>
      {a !== DEF ? <button type="button" className="self-start text-sm text-muted-foreground underline" onClick={() => setPinAlpha(DEF)}>기본 20%로</button> : null}
    </div>
  );
}
