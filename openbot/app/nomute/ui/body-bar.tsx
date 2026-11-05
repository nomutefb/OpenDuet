// 맨 위 몸 줄(형 11-05 13:2x 뎅 1:1 「WIN A · WIN B · MAC CPU/RAM/GPU + 과부하 불」 · 「러너 위젯은 안 띄워도 되게」)
//   = 작동 표와 같은 조회(GET status · 같은 queryKey = 한 번만 부름) 의 hw 줄 metrics(몸-보고.py · 서버 editor#2562) · 「<몸>」 + 「<몸>-temp」 줄을 합침
//   불 = 🔴 CPU 90% · 램 92% · 온도 85°C 넘음 / 🟡 CPU 70% · 램 85% · GPU 90% 넘음 / 🟢 그 밖 / ⚪ 숫자 없음(보고 끊김·아직 옛 판)
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";

type Row = { key: string; st?: string; metrics?: Record<string, number> };
type Cat = { id: string; rows: Row[] };
type M = { cpu?: number; ram?: number; gpu?: number; cpu_temp?: number; gpu_temp?: number };

const HOSTS: [string, string][] = [["윈A", "WIN A"], ["윈B", "WIN B"], ["맥", "MAC"]];
const DOT = { red: "bg-red-500", yellow: "bg-amber-400", green: "bg-emerald-500", none: "bg-muted-foreground/40" } as const;

function level(x: M): keyof typeof DOT {
  if (x.cpu === undefined && x.ram === undefined && x.gpu === undefined) return "none";
  if ((x.cpu ?? 0) >= 90 || (x.ram ?? 0) >= 92 || (x.cpu_temp ?? 0) >= 85 || (x.gpu_temp ?? 0) >= 85) return "red";
  if ((x.cpu ?? 0) >= 70 || (x.ram ?? 0) >= 85 || (x.gpu ?? 0) >= 90) return "yellow";
  return "green";
}

const pct = (label: string, v?: number) => (v === undefined ? null : <span>{label} <b className="font-semibold text-foreground">{Math.round(v)}%</b></span>);

export function BodyBar({ className = "" }: { className?: string }) {
  const q = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: Cat[]; at?: number }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  const hw = q.data?.cats?.find((c) => c.id === "hw")?.rows || [];
  const of = (k: string): M => ({ ...(hw.find((r) => r.key === k)?.metrics || {}), ...(hw.find((r) => r.key === `${k}-temp`)?.metrics || {}) });
  return (
    <div role="status" aria-label="몸 상태" className={`nm-bodybar flex h-6 shrink-0 items-center gap-3 overflow-x-auto whitespace-nowrap border-b border-border px-2 text-[11px] tabular-nums text-muted-foreground ${className}`}>
      {HOSTS.map(([k, label]) => {
        const x = of(k), lv = level(x);
        return (
          <span key={k} className="inline-flex items-center gap-1.5" title={lv === "red" ? "과부하" : lv === "yellow" ? "바쁨" : lv === "none" ? "숫자 아직 없음" : "괜찮음"}>
            <i aria-hidden className={`inline-block size-2 rounded-full ${DOT[lv]}`} />
            <b className="font-semibold text-foreground">{label}</b>
            {pct("CPU", x.cpu)}{pct("RAM", x.ram)}{pct("GPU", x.gpu)}
            {x.gpu_temp !== undefined ? <span>{Math.round(x.gpu_temp)}°</span> : null}
          </span>
        );
      })}
    </div>
  );
}
