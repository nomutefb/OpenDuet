// 서랍 「VM 상태」(#/vm) — 몸(VM)마다 램 24시간 한 장(형 11-16 16:4x 구름 맥 창 「정원에 각 vm 쓰는 애들 한테 이 자료받아서 vm 상태 그리게 할거야 공간 하나 만들어줘」 · 「이거 github nomutefb 에 보면 life 어쩌고 차트 도구있어」 · 「그거로 만들면돼.」 · 「빠르한테 물어보면돼 깃하고」)
//   그림 = nomutefb/lieflat-charts F3 Hairline Area 꼴(./vm-mem-logic.ts 머리말) · 색 = 그 도구의 Mono(어두운 카드 = 종이색 먹 · 밝은 테마 = 먹색) · 카드 바탕만 우리 유리
//   자료 = GET /api/office/vm-mem(몸들이 12시간마다 올린 것을 서버가 5분 칸으로) · 5분마다 다시 읽음 · 아직 없으면 「기다리는 중」
//   움직임 = 처음 뜰 때 한 번(가는 선 묶음 나타남 · 윤곽 한 획 · 최고점 톡) — 원본 박자(fade .9s · draw 1s · pop .5s) · 그 뒤 멈춤(가만한 화면 = 그릴 것 0) · 줄이기 설정 = 없음
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { idOf, office } from "../data/office";
import { FaceImg, usePeople } from "./faces";
import { type VmMem, type VmMemRes, everyKo, gb, mdhm, vmClean, vmDemo, vmGeom, vmStats } from "./vm-mem-logic";
import "./vm-desk.css";

const isDemo = () => typeof location !== "undefined" && /[?&]vmdemo(?:[=&]|$)/.test(location.search);

export function VmDesk() {
  const demo = useMemo(isDemo, []);
  const q = useQuery({ queryKey: ["nomute", "vm-mem"], queryFn: () => office<VmMemRes>("vm-mem"), staleTime: 60_000, refetchInterval: 5 * 60_000, retry: false, enabled: !demo });
  const vms = useMemo(() => (demo ? vmDemo(Date.now()) : vmClean(q.data?.vms)), [demo, q.data]);
  const at = !demo && typeof q.data?.at === "number" ? q.data.at : 0;
  return (
    <div className="nm-vmdesk">
      <header className="nm-vm-head">
        <h2>VM 상태</h2>
        <p>몸마다 램 24시간 · 가는 선 하나 = 한 번 잰 값{at ? ` · 자료 ${mdhm(at)} 기준` : ""}{demo ? " · 견본(진짜 자료 아님)" : ""}</p>
      </header>
      {vms.length ? <div className="nm-vm-grid">{vms.map((v) => <VmCard key={v.who} v={v} />)}</div>
        : <p className="nm-vm-empty" role="status">{q.isLoading ? "읽는 중…" : "아직 올라온 자료가 없어요. 몸마다 잰 램 기록이 올라오면 여기에 그려져요."}</p>}
    </div>
  );
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null), [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const set = () => setW((p) => { const n = Math.round(el.clientWidth); return Math.abs(n - p) < 2 ? p : n; });
    set();
    const ro = new ResizeObserver(set); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function VmCard({ v }: { v: VmMem }) {
  const list = usePeople(), [ref, w] = useWidth();
  const s = useMemo(() => vmStats(v), [v]), h = w && w < 560 ? 250 : 280;
  const g = useMemo(() => (w ? vmGeom(v, w, h) : null), [v, w, h]);
  const face = idOf(v.who, list);
  return (
    <section className="nm-vm-card" aria-label={`${v.who} VM 램`}>
      <h3>{face ? <FaceImg id={face} size={22} className="nm-vm-face" /> : null}<b>{v.who}</b><span>쓴 램 평균 {gb(s.avg)}GB{s.heldLast !== null ? ` · 쥔 램 ${gb(s.heldLast)}GB` : ""}</span></h3>
      <p className="sub">{mdhm(v.t0)} ~ {mdhm(s.t1)} · {everyKo(v.step_s)} · 평균 {gb(s.avg)}GB · 최저 {gb(s.min)}GB · 최고 {gb(s.max)}GB</p>
      <div className="plot" ref={ref} style={{ height: h }}>
        {g ? (
          <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} role="img" aria-label={`${v.who} 쓴 램 평균 ${gb(s.avg)}GB · 최고 ${gb(s.max)}GB`}>
            {g.ticksY.map((t) => <g key={t.label}><line className="grid" x1={g.l} x2={g.w - g.r} y1={t.y} y2={t.y} /><text className="tick" x={g.l - 6} y={t.y + 3} textAnchor="end">{t.label}</text></g>)}
            {g.refs.map((r) => <g key={r.label}><line className="ref" x1={g.l} x2={g.w - g.r} y1={r.y} y2={r.y} /><text className="note" x={g.l + 6} y={r.y - 5}>{r.label}</text></g>)}
            {g.marks.map((m) => <g key={m.x + m.label}><line className="mark" x1={m.x} x2={m.x} y1={g.top - 8} y2={g.base} /><text className="note" x={m.x + 4} y={g.top - 1} textAnchor={m.x > g.w - g.r - 110 ? "end" : "start"} dx={m.x > g.w - g.r - 110 ? -8 : 0}>{m.label}</text></g>)}
            <g className="vm-fade">
              <path className="hair a" d={g.hair[0]} /><path className="hair b" d={g.hair[1]} /><path className="hair c" d={g.hair[2]} />
              {g.peakHair ? <path className="hair peak" d={g.peakHair} /> : null}
            </g>
            {g.held ? <path className="held vm-draw" d={g.held} pathLength={1} /> : null}
            {g.outline ? <path className="line vm-draw" d={g.outline} pathLength={1} /> : null}
            {g.peak ? <g><circle className="dot vm-pop" cx={g.peak.x} cy={g.peak.y} r={4.2} /><text className="peak vm-fade late" x={g.peak.x} y={g.peak.y - 11} textAnchor={g.peak.x < g.l + 70 ? "start" : g.peak.x > g.w - g.r - 70 ? "end" : "middle"}>{g.peak.label}</text></g> : null}
            {g.ticksX.map((t) => <text key={t.x} className="hour" x={t.x} y={g.base + 18} textAnchor="middle">{t.label}</text>)}
            {g.end.held ? <text className="end held" x={g.w - g.r + 8} y={g.end.held.y + 4}>{g.end.held.label}</text> : null}
            {g.end.used ? <text className="end" x={g.w - g.r + 8} y={g.end.used.y + 4}>{g.end.used.label}</text> : null}
          </svg>
        ) : null}
      </div>
      <p className="legend"><span><i className="k held" />VM 이 쥔 램(동적){s.heldLast !== null ? ` ${gb(s.heldLast)}GB` : ""}</span><span><i className="k used" />실제 쓴 램{s.last !== null ? ` ${gb(s.last)}GB` : ""}</span></p>
      <p className="src">HAIRLINE AREA · MONO{v.host ? ` · ${v.host}` : ""}</p>
    </section>
  );
}
