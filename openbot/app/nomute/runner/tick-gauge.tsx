// 틱 게이지 = 윈A·맥에 깔린 러너 대시보드 위젯의 게이지를 그대로(형 11-01 17:4x 「러너 대시보드도 윈a나 맥에 깔린 모양이 들어와야해」)
//   원본 = editor scripts/win/check-runner/dashboard/RowViews.cs GaugeView(lieflat-charts C7) · 맥판 scripts/mac/dashboard 같은 값 ·
//   210° · 1틱 = 1% · 먹 묻은 틱은 길게(흔들림 = 틱 번호로 고정) · 캐시 틱 = 짧고 옅게(28%) · 안 묻은 틱 = 짧게 · 25/50/75/100 점 · 끝 구슬 · 가운데 큰 수 + % · 쓴 양 · 아래 이름(그 단계 색)
//   글 자리 = 위젯은 글 윗변 기준(WPF) → 여기선 밑줄 기준으로 옮김(수 CY+2 윗변 ≈ 밑줄 CY+15.5 · 쓴 양 CY+17 ≈ 23.5 · 이름 CY+38 ≈ 45.5)
//   색 = 위젯 Theme(단계 = 빨강 90 · 주황 80 · 노랑 70 · 그 외 기본색 · 문제 = 회색)
import { type Level } from "./runner-data";

export const LV: Record<Level, string> = { green: "#71C5E8", yellow: "#FFD23F", orange: "#FF9F43", red: "#FF5A5F", off: "#5C5C5C" };
const UNINKED = "#333333", MILE = "#555555", TEXT = "#F2F2F2", GRAY = "#8A8A8A";
const CX = 66, CY = 62, R0 = 38, A0 = -195, SW = 210;
const rnd = (i: number, k: number) => Math.abs((Math.imul(i, 73856093) ^ Math.imul(k, 19349663)) % 1000) / 1000;
const pol = (r: number, deg: number): [number, number] => { const a = (deg * Math.PI) / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
const TICKS = Array.from({ length: 100 }, (_, k) => {
  const a = A0 + (k / 100) * SW;
  return { a: pol(R0, a), ink: pol(R0 + 8 + rnd(k + 1, 3) * 4, a), un: pol(R0 + 3 + rnd(k + 1, 7) * 1.6, a), cache: pol(R0 + 6 + rnd(k + 1, 3) * 3, a) };
});
const MILES = [25, 50, 75, 100].map((m) => pol(R0 - 4, A0 + (m / 100) * SW));
const path = (from: number, to: number, end: "ink" | "un" | "cache") => {
  let d = "";
  for (let k = from; k < to; k++) { const t = TICKS[k]; d += `M${t.a[0].toFixed(2)} ${t.a[1].toFixed(2)}L${t[end][0].toFixed(2)} ${t[end][1].toFixed(2)}`; }
  return d;
};

export function TickGauge({ label, pct, used, lv, cache, off }: { label: string; pct: number | null; used: string; lv: Level; cache?: number | null; off?: boolean }) {
  const v = Math.max(0, Math.min(100, pct ?? 0)), n = Math.max(0, Math.min(100, Math.ceil(v - 1e-9)));
  const ce = Math.max(n, Math.min(100, Math.ceil(v + Math.max(0, cache ?? 0) - 1e-9)));
  const ink = pct == null ? LV.off : LV[lv], bead = pol(R0 + 13, A0 + (v / 100) * SW);
  return (
    <svg viewBox="0 8 132 104" className="nm-rg-gauge" role="img" aria-label={`${label} ${pct == null ? "-" : Math.round(v)}% · ${used}`}>
      <path d={path(ce, 100, "un")} stroke={UNINKED} strokeWidth={0.6} />
      {ce > n ? <path d={path(n, ce, "cache")} stroke={ink} strokeOpacity={0.28} strokeWidth={1} /> : null}
      {n > 0 ? <path d={path(0, n, "ink")} stroke={ink} strokeWidth={1} /> : null}
      {MILES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={0.8} fill={MILE} />)}
      {v > 0 ? <circle cx={bead[0]} cy={bead[1]} r={1.8} fill={ink} /> : null}
      {off ? <text x={CX} y={CY + 15.5} textAnchor="middle" className="nm-rg-num" fontSize={13} fill={GRAY}>off</text> : (
        <>
          <text x={CX} y={CY + 15.5} textAnchor="middle" className="nm-rg-num"><tspan fontSize={17} fill={TEXT}>{pct == null ? "-" : Math.round(v)}</tspan><tspan fontSize={9} fill={GRAY} dx={1}>%</tspan></text>
          <text x={CX} y={CY + 23.5} textAnchor="middle" className="nm-rg-num" fontSize={7.5} fill={GRAY} letterSpacing={0.45}>{used}</text>
        </>
      )}
      <text x={CX} y={CY + 45.5} textAnchor="middle" className="nm-rg-lab" fontSize={9.5} fill={ink} letterSpacing={1.1}>{label}</text>
    </svg>
  );
}
