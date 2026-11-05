// PC 반갈 러너 칸(위 1.5/4) = 러너 기본정보 게이지 판(형 11-05 13:37 임시방 「1*4 1행 ~ 1.5 는 러너 기본정보(축약해야되는데, 정말 그냥 기본정보를 지금 게이지로 축약해서 보이면 될듯.)」 ·
//   「근데 갬성이 떨어지면안되.」 · 뎅 13:45 「RunnerScreen 통째 대신 네 몸 줄을 키운 게이지 줄」)
//   숫자 = 작동 표 hw 줄 metrics(몸-보고.py 5분 · editor#2562 · BodyBar 와 같은 조회 = 서버 한 번) · 그게 없거나 끊기면 러너 위젯 자료(/api/runner) 숫자로 메움
//   꼴 = 위젯 틱 게이지 그대로(runner/tick-gauge · 단계 색 빨강 90 · 주황 80 · 노랑 70) · 어두운 판 = runner-board.css nm-rg-panel · 머리 = 불 · 이름 · 온도 · 도는 잡/자리 · 받은 때
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { TickGauge } from "../runner/tick-gauge";
import { type Level, levelOf, lookOf, num, type RunnerRow, useRunner } from "../runner/runner-data";
import "../runner/runner-board.css";
import "./runner-gauges.css";

type Row = { key: string; st?: string; stale?: boolean; reported_at?: number; metrics?: Record<string, number> };
type Cat = { id: string; rows: Row[] };
type M = { cpu?: number; ram?: number; gpu?: number; cpu_temp?: number; gpu_temp?: number };

const HOSTS: { k: string; pc: string; label: string }[] = [{ k: "윈A", pc: "A", label: "WIN A" }, { k: "윈B", pc: "B", label: "WIN B" }, { k: "맥", pc: "M", label: "MAC" }];
const DOT: Record<Level, string> = { green: "#71C5E8", yellow: "#FFD23F", orange: "#FF9F43", red: "#FF5A5F", off: "#5C5C5C" };
const ago = (ms: number) => { const s = Math.max(0, ms / 1000); return s < 90 ? "방금" : s < 5400 ? `${Math.round(s / 60)}분 전` : `${Math.round(s / 3600)}시간 전`; };

/** 1분마다 지금 — 「N분 전」 글만 움직임. */
function useNow() {
  const [n, setN] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => { if (!document.hidden) setN(Date.now()); }, 60_000); return () => clearInterval(t); }, []);
  return n;
}

export function RunnerGauges() {
  const st = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: Cat[]; at?: number }>("status"), refetchInterval: 60_000, staleTime: 30_000 });
  const rq = useRunner();
  const now = useNow();
  const hw = st.data?.cats?.find((c) => c.id === "hw")?.rows || [];
  return (
    <div className="nm-rg nm-rgx flex h-full min-h-0 flex-col p-2" aria-label="러너 기본정보">
      <div className="nm-rg-panel nm-rgx-panel">
        {HOSTS.map((h) => {
          const a = hw.find((r) => r.key === h.k), b = hw.find((r) => r.key === `${h.k}-temp`);
          const live = (r?: Row) => (r && !r.stale ? r.metrics || {} : {});
          const m: M = { ...live(a), ...live(b) };
          const d: RunnerRow | null = rq.data?.rows?.[h.pc] ?? null;
          const lk = lookOf(d, rq.data?.why?.[h.pc] || "", now / 1000);
          const rd = lk.problem ? null : d;   // 위젯 자료는 살아 있을 때만 메움
          const cpu = m.cpu ?? num(rd?.cpu), ram = m.ram ?? num(rd?.ram), gpu = m.gpu ?? num(rd?.gpu);
          const none = cpu == null && ram == null && gpu == null;
          const load = [cpu, ram].reduce<number | null>((x, y) => (y != null && (x == null || y > x) ? y : x), null);
          const lv: Level = none ? "off" : (m.cpu_temp ?? 0) >= 85 || (m.gpu_temp ?? 0) >= 85 ? "red" : levelOf(load, false);
          const at = a && !a.stale ? a.reported_at || 0 : rd ? rd.at * 1000 : 0;
          const busy = rd && num(rd.busy) != null && rd.busy! >= 0 ? rd.busy : null, total = rd && num(rd.total) != null && rd.total! >= 0 ? rd.total : null;
          const temp = [m.cpu_temp != null ? `CPU ${Math.round(m.cpu_temp)}°` : "", m.gpu_temp != null ? `GPU ${Math.round(m.gpu_temp)}°` : ""].filter(Boolean).join(" · ");
          return (
            <section key={h.k} className="nm-rgx-host" aria-label={`${h.label} 상태`}>
              <header className="flex items-center gap-1.5 text-[11px] tabular-nums">
                <i aria-hidden className="nm-rgx-dot" style={{ background: DOT[lv], boxShadow: lv === "off" ? "none" : `0 0 8px ${DOT[lv]}` }} />
                <b className="nm-rg-name">{h.label}</b>
                {busy != null ? <span className="text-muted-foreground" title="도는 잡 / 자리">잡 {busy}/{total ?? "-"}</span> : null}
                <span className="ml-auto text-muted-foreground">{none ? (a?.stale ? "보고 끊김" : "숫자 없음") : at ? ago(now - at) : ""}</span>
              </header>
              <div className="nm-rg-gauges">
                <TickGauge label="CPU" pct={cpu} lv={levelOf(cpu, false)} used={m.cpu_temp != null ? `${Math.round(m.cpu_temp)}°C` : ""} off={none} />
                <TickGauge label="RAM" pct={ram} lv={levelOf(ram, false)} used="" off={none} />
                <TickGauge label="GPU" pct={gpu} lv={levelOf(gpu, false)} used={m.gpu_temp != null ? `${Math.round(m.gpu_temp)}°C` : ""} off={none} />
              </div>
              {temp ? <span className="sr-only">{temp}</span> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
