// PC 반갈 러너 칸(위 1.5/4) = 러너 기본정보 게이지 판(형 11-05 13:37 임시방 「1*4 1행 ~ 1.5 는 러너 기본정보(축약해야되는데, 정말 그냥 기본정보를 지금 게이지로 축약해서 보이면 될듯.)」 ·
//   「근데 갬성이 떨어지면안되.」 · 뎅 13:45 「RunnerScreen 통째 대신 네 몸 줄을 키운 게이지 줄」)
//   숫자 = 작동 표 hw 줄 metrics(몸-보고.py 5분 · editor#2562 · BodyBar 와 같은 조회 = 서버 한 번) · 그게 없거나 끊기면 러너 위젯 자료(/api/runner) 숫자로 메움
//   꼴 = 날씨 위젯 같은 잿빛 블랙 유리 카드 하나(형 14:40 「우측상단엔 그냥 시계 있는거 대신해서 날씨 위젯처럼 러너상태바.」 · 「쟂빛블랙 반투명에 살짝 글래스모피즘」) · 몸마다 F11 틱 게이지(CPU) + RAM·GPU·온도 한 줄 · 자동차 계기판 판(2e6f37b)은 형 14:40 「심플하게」로 내림 · 어두운 판 = runner-board.css nm-rg-panel · 머리 = 불 · 이름 · 온도 · 도는 잡/자리 · 받은 때
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { TickGauge } from "../runner/tick-gauge";   // 에디터 lieflat F11 Tick Gauge 옮긴 것(형 14:40 「심플하게 그 life 어쩌고 에디터에 잇는 것중에 하나로」)
import { type Level, levelOf, lookOf, num, type RunnerRow, useRunner } from "../runner/runner-data";
import "../runner/runner-board.css";
import "./runner-gauges.css";

type Row = { key: string; st?: string; stale?: boolean; reported_at?: number; metrics?: Record<string, number> };
type Cat = { id: string; rows: Row[] };
type M = { cpu?: number; ram?: number; gpu?: number; cpu_temp?: number; gpu_temp?: number };

const HOSTS: { k: string; pc: string; label: string }[] = [{ k: "윈A", pc: "A", label: "WIN A" }, { k: "윈B", pc: "B", label: "WIN B" }, { k: "맥", pc: "M", label: "MAC" }];
// 색(형 17:3x 「노란색, 주황색, 빨간색 그거는 그대로 유지할게, 평상시에는 흰색이면됨」) = 평소 흰 · 70/80/90 = 노랑·주황·빨강(위젯 단계 그대로) · 온도 80 주황 · 85 빨강
const WARN: Record<Level, string> = { green: "#E6E6E6", yellow: "#FFD23F", orange: "#FF9F43", red: "#FF5A5F", off: "#5C5C5C" };
const MONO = (lv: Level) => WARN[lv];
const tInk = (t?: number) => (t == null ? undefined : t >= 85 ? WARN.red : t >= 80 ? WARN.orange : undefined);
// 러너 불(형 17:3x 「러너 아래에 애들 아이콘 아래에 각각 좀 나오게 해줘, 꺼질때는 불 꺼져잇으면돼」) = 맥 몸 보고 hw 「러너」 줄 칸(gh api 그대로 · 5분) · 몸마다 이름 앞머리로 나눔
const RUNNERS: Record<string, (n: string) => boolean> = { 윈A: (n) => n.startsWith("nomute-win-"), 윈B: (n) => n.startsWith("nomute-b-") || n.startsWith("nomute-office"), 맥: (n) => n.startsWith("mac-") };
const short = (n: string) => n.replace(/^nomute-win-/, "").replace(/^nomute-b-/, "B").replace(/^nomute-office-?/, "O").replace(/^mac-/, "M");
const rnum = (n: string) => Number((n.match(/\d+$/) || ["0"])[0]);
// 차례 = 몸 안 러너 먼저(b-) · 회사 PC(office) 뒤 · 그 안은 번호(형 11-06 「b1, b2 , 01 이 순서로 배치해주고」 · 번호는 그대로 「손은 나중에보자」)
const rord = (n: string) => (/^nomute-office/.test(n) ? 1 : 0) * 1e6 + rnum(n);
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
  const rcells = ((hw.find((r) => r.key === "러너") as (Row & { cells?: Record<string, { st: string; note?: string }> }) | undefined)?.cells) || {};
  return (
    <div className="nm-rg nm-rgx flex flex-col px-2 pt-1" aria-label="러너 기본정보">   {/* 높이 = 제 키(뎅 3437416 · 칸이 40% 안에서 계기판 키만큼) */}
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
          // 불 = CPU 기준(형 15:27 「램은 과도해도 별 문제가 안된다고 생각?」 · 「cpu가 제일 문제지?」) · RAM 은 92% 넘어 디스크로 밀릴 때만 주황 · 온도 85 = 빨강
          const cl = levelOf(cpu, false);   // RAM 은 안 봄(형 15:28 「64gb인데 잠시 걸렷다가 말겟지」 · 「그럼 ram은 안보이게 하고 깔끔하게.」)
          const lv: Level = none ? "off" : (m.cpu_temp ?? 0) >= 80 || (m.gpu_temp ?? 0) >= 80 ? "orange" : cl;
          const at = a && !a.stale ? a.reported_at || 0 : rd ? rd.at * 1000 : 0;
          const busy = rd && num(rd.busy) != null && rd.busy! >= 0 ? rd.busy : null, total = rd && num(rd.total) != null && rd.total! >= 0 ? rd.total : null;
          const temp = [m.cpu_temp != null ? `CPU ${Math.round(m.cpu_temp)}°` : "", m.gpu_temp != null ? `GPU ${Math.round(m.gpu_temp)}°` : ""].filter(Boolean).join(" · ");
          const runners = Object.entries(rcells).filter(([n]) => RUNNERS[h.k]?.(n)).sort((x, y) => rord(x[0]) - rord(y[0]));
          return (
            <section key={h.k} className="nm-rgx-host" aria-label={`${h.label} 상태`}>   {/* 위에서부터 가운데로 = 이름 · G 온도 · (틈) · 게이지 · 러너 불(형 17:3x 「각각 게이지 바로 수직 위에다가 하드웨어 이름」 · 「블릿은 없어도」 · 「그래픽카드 온도도 그대로 수직위로」 · 「게이지랑딱붙으면 안이쁘니까」) */}
              <b className="nm-rg-name nm-rgx-name">{h.label}</b>
              <span className="nm-rgx-g" style={tInk(m.gpu_temp) ? { color: tInk(m.gpu_temp) } : undefined}>{m.gpu_temp != null ? `G ${Math.round(m.gpu_temp)}°C` : none && a?.stale ? "보고 끊김" : "\u00a0"}</span>
              <TickGauge label="" pct={cpu} lv={levelOf(cpu, false)} ink={MONO(levelOf(cpu, false))} used="" top={m.cpu_temp != null ? `${Math.round(m.cpu_temp)}°C` : undefined} topInk={tInk(m.cpu_temp)} off={none} />
              {runners.length ? (
                <ul className="nm-rgx-runs" aria-label={`${h.label} 러너`}>
                  {runners.map(([n, c]) => {
                    const on = c.st === "🟢", work = on && c.note === "일하는 중";
                    return <li key={n} className={`nm-rgx-run${on ? " on" : ""}${work ? " work" : ""}`} title={`${n} · ${on ? c.note || "켜짐" : c.note || "꺼짐"}`}>{short(n)}</li>;
                  })}
                </ul>
              ) : null}
              {temp ? <span className="sr-only">{temp}</span> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
