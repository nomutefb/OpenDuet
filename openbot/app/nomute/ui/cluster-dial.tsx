// 계기판 한 덩이(형 11-05 13:54 임시방 「러너 대시보드. 잇지? 그 자동차 계기판아니? ^.^ 모양으로하면 333 으로 가능한데」 · 13:55 자동차 계기판 그림 「요 느낌으로 위에 배치해보는게 어때?」)
//   = 가운데 큰 원(CPU) + 양옆 작은 원(RAM · GPU)이 뒤로 겹침 · 원마다 270° 눈금(작은 2 · 큰 10) · 숫자 · 끝 90~100 빨간 띠 · 바늘(단계 색 · 빛) · 가운데 큰 수
//   단계 색 = 위젯 Theme(runner/tick-gauge LV · 빨강 90 · 주황 80 · 노랑 70) · 값 없음 = 바늘 없이 「-」
import { type Level } from "../runner/runner-data";
import { LV } from "../runner/tick-gauge";

// 돌기 = [시작 각, 쓸 각(+ 시계 · - 반시계)] · 가운데 = 왼쪽 아래에서 시계 방향 270°(자동차 속도계) ·
//   옆 원 = 가운데 원에 가리지 않는 바깥 반만(왼쪽 = 아래에서 왼쪽으로 올라감 · 오른쪽 = 아래에서 오른쪽으로 올라감 · 형 그림 오른쪽 둘 꼴)
type Sweep = [number, number];
export const SW_BIG: Sweep = [135, 270], SW_LEFT: Sweep = [75, 210], SW_RIGHT: Sweep = [105, -210];
const pol = (cx: number, cy: number, r: number, deg: number): [number, number] => { const a = (deg * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const angOf = (s: Sweep) => (v: number) => s[0] + (Math.max(0, Math.min(100, v)) / 100) * s[1];
const arcOf = (s: Sweep) => (cx: number, cy: number, r: number, from: number, to: number) => {
  const ang = angOf(s), [x0, y0] = pol(cx, cy, r, ang(from)), [x1, y1] = pol(cx, cy, r, ang(to)), d = ang(to) - ang(from);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${Math.abs(d) > 180 ? 1 : 0} ${d >= 0 ? 1 : 0} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

type DialProps = { cx: number; cy: number; r: number; v: number | null; lv: Level; label: string; sub?: string; nums: number[]; big?: boolean; sweep?: Sweep };

function Dial({ cx, cy, r, v, lv, label, sub, nums, big, sweep = SW_BIG }: DialProps) {
  const ang = angOf(sweep), arc = arcOf(sweep);
  const ink = v == null ? LV.off : lv === "green" ? "var(--accent, #D4FF3A)" : LV[lv];   // 괜찮음 = 앱 형광 라임(형 14:03 「톤만 라임맞추면되네」) · 70/80/90 = 노랑·주황·빨강 그대로
  const ticks: string[] = [];
  for (let k = 0; k <= 100; k += 2) {
    const major = k % 10 === 0, [x0, y0] = pol(cx, cy, r - (major ? (big ? 9 : 7) : big ? 4.5 : 3.5), ang(k)), [x1, y1] = pol(cx, cy, r - 1, ang(k));
    ticks.push(`M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`);
  }
  const [nx, ny] = pol(cx, cy, r - (big ? 11 : 8), ang(v ?? 0)), [tx, ty] = pol(cx, cy, r * (big ? 0.5 : 0.52), ang(v ?? 0));   // 바늘 = 바깥 테만(가운데 큰 수를 안 가림 · 요즘 계기판 꼴)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 3} fill="#0A0A0A" fillOpacity={0.92} style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }} />   {/* 계기판 얼굴(겹칠 때 뒤 원을 가림) · 선반 위 시계처럼 그림자 */}
      <circle cx={cx} cy={cy} r={r + 1.5} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth={big ? 1.6 : 1.2} />
      {big ? <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={10} /> : null}
      <path d={arc(cx, cy, r - 1, 90, 100)} stroke={LV.red} strokeWidth={big ? 3.2 : 2.6} fill="none" />
      <path d={ticks.join("")} stroke="rgba(242,242,242,.78)" strokeWidth={big ? 1 : 0.8} strokeLinecap="round" />
      {v != null && v > 0 ? <path d={arc(cx, cy, r - (big ? 5 : 4), 0, v)} style={{ stroke: ink }} strokeOpacity={0.35} strokeWidth={big ? 3 : 2.4} fill="none" strokeLinecap="round" /> : null}
      {nums.map((n) => { const [x, y] = pol(cx, cy, r - (big ? 19 : 15), ang(n)); return <text key={n} x={x} y={y + (big ? 3.4 : 2.8)} textAnchor="middle" fontSize={big ? 9.5 : 7.5} fill="#CFCFCF" className="nm-rg-num">{n}</text>; })}
      {v != null ? (
        <>
          <line x1={tx} y1={ty} x2={nx} y2={ny} strokeWidth={big ? 2.4 : 1.8} strokeLinecap="round" style={{ stroke: ink, filter: `drop-shadow(0 0 3px ${ink})` }} />
        </>
      ) : null}
      <text x={cx} y={cy + (big ? 28 : 7)} textAnchor="middle" className="nm-rg-num"><tspan fontSize={big ? 27 : 16} fill="#F2F2F2">{v == null ? "-" : Math.round(v)}</tspan><tspan fontSize={big ? 10 : 8} fill="#8A8A8A" dx={1}>%</tspan></text>
      <text x={cx} y={cy + (big ? 41 : 18)} textAnchor="middle" className="nm-rg-lab" fontSize={big ? 9 : 7.5} letterSpacing={1.1} style={{ fill: ink }}>{label}</text>
      {sub ? <text x={cx} y={cy - (big ? 17 : 14)} textAnchor="middle" className="nm-rg-num" fontSize={big ? 8 : 7} fill="#9A9A9A">{sub}</text> : null}
    </g>
  );
}

const lvOf = (p: number | null): Level => (p == null ? "off" : p >= 90 ? "red" : p >= 80 ? "orange" : p >= 70 ? "yellow" : "green");

/** 몸 하나 = 계기판 한 덩이(viewBox 300×150 · 옆 원 먼저 그리고 가운데 원이 위로 겹침). */
export function ClusterDial({ cpu, ram, gpu, cpuTemp, gpuTemp, title }: { cpu: number | null; ram: number | null; gpu: number | null; cpuTemp?: number; gpuTemp?: number; title: string }) {
  const t = (x?: number) => (x == null ? undefined : `${Math.round(x)}°C`);
  return (
    <svg viewBox="0 0 300 150" className="nm-cd" role="img" aria-label={`${title} CPU ${cpu ?? "-"}% · RAM ${ram ?? "-"}% · GPU ${gpu ?? "-"}%`}>
      <Dial cx={62} cy={84} r={46} v={ram} lv={lvOf(ram)} label="RAM" nums={[50, 100]} sweep={SW_LEFT} />
      <Dial cx={238} cy={84} r={46} v={gpu} lv={lvOf(gpu)} label="GPU" sub={t(gpuTemp)} nums={[50, 100]} sweep={SW_RIGHT} />
      <Dial cx={150} cy={76} r={66} v={cpu} lv={lvOf(cpu)} label="CPU" sub={t(cpuTemp)} nums={[0, 20, 40, 60, 80, 100]} big />
    </svg>
  );
}
