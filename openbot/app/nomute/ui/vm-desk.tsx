// 애 펼침 카드 안의 몸 한 칸 — 그 애 사양 · 몸 비고 · 숫자 줄(RAM 평균 % / 평균 가용 % / 최대 %) · 하루 그래프(램 + 스레드)
//   처음 = 서랍 「몸 상태」 한 화면(형 11-16 16:4x 구름 맥 창 「정원에 각 vm 쓰는 애들 한테 이 자료받아서 vm 상태 그리게 할거야 공간 하나 만들어줘」 · 「이거 github nomutefb 에 보면 life 어쩌고 차트 도구있어」 · 「그거로 만들면돼.」)
//   → 애마다 제 카드 안으로(형 11-17 07:53 dm-bom 「이거 그래프를 첨부2 안에다가 넣자」 · 「그렇게 다 각자로 넣을게.」) · 「몸」 탭은 걷음(형 「그렇게해서 저 탭을 없애려고 함」 · 「중첩을 최소화 하려는거」)
//   자료 = GET vm-mem 에 그 이름으로 온 몸(없으면 사양 글만) · 그림 = lieflat-charts F3 Hairline Area(./vm-mem-logic.ts 머리말) · 눈금 · 숫자 줄 규칙도 거기
//   가로 = 마지막으로 잰 때에서 거꾸로 24시간(형 11-19 「가장 최근거가 맨 우측으로 되가지고 지금으로부터 24시간이 보이면된다는뜻이야」) · 지금 값은 그림 밖 범례 줄
//   그래프 = 낮은 띠(132px)로 훑고 누르면 키움(280px) · 움직임 = 처음 한 번(원본 박자) 뒤 멈춤
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { type VmMem, type VmMemRes, dayStart, gb, hm, mdhm, pctKo, vmClean, vmFacts, vmGeom, vmLimit, vmOf, vmPct, vmStats } from "./vm-mem-logic";
import type { BotRow } from "./bot-desk-logic";
import { vmMemOpts } from "../data/crew-warm";   // 지난 램 기록을 먼저 그리고 · 앱이 켜질 때 미리 받아 둔 답을 그대로 씀
import { bodyNote } from "./bot-manage-logic";   // 비고 글에서 몸 이야기만(루틴 · 맡은 일 조각은 겹침 · 형 11-17 07:53)
import { BodyChips } from "./body-chips";
import { statusOpts } from "./status-q";   // 몸 표(bodies) = 몸 줄(BodyChips)과 같은 조회 · 같은 열쇠(한 번만 부름)
import { bodiesOf } from "../data/bodies";   // 살아 있는 몸 줄(옛 러너 층 「몸 지도」를 애마다 제 카드로 · 형 11-19 「거기에 녹이면됨」)
import "./vm-desk.css";

const hwLine = (r?: BotRow) => (r ? [r.hw?.ram && r.hw.ram !== "-" ? `램 ${r.hw.ram}` : "", r.hw?.cpu && r.hw.cpu !== "-" ? r.hw.cpu : "", r.hw?.gpu && r.hw.gpu !== "없음" ? `GPU ${r.hw.gpu}` : "", r.hw?.os].filter(Boolean).join(" · ") : "");

/** 애 펼침 카드 안의 몸 한 칸 — 그 애 사양 · 몸 비고 · 램 24시간 그래프(「몸」 탭 줄과 같은 자료 · 같은 그림) · 형 11-17 07:53 「이거 그래프를 첨부2 안에다가 넣자」 · 「그렇게 다 각자로 넣을게.」 */
export function VmCard({ r }: { r: BotRow }) {
  const q = useQuery({ ...vmMemOpts<VmMemRes>(), refetchInterval: 5 * 60_000, retry: false });
  const st = useQuery(statusOpts()).data?.bodies;
  const v = useMemo(() => vmOf(vmClean(q.data?.vms), r.who, bodiesOf(st)), [q.data, r.who, st]);   // 제 이름 줄 없으면 같은 몸 줄(윈터 = Lx B = 뎅 몸 · R0104)
  const [ref, w] = useWidth(), [tall, setTall] = useState(false);
  const s = useMemo(() => (v ? vmStats(v) : null), [v]), h = tall ? 280 : 132;
  const limit = v ? vmLimit(v, r.hw?.ram) : 0;   // % 의 분모 · 세로 눈금 끝(서버 한도 → VM 최대 → 사양 글)
  const g = useMemo(() => (v && w ? vmGeom(v, w, h, limit) : null), [v, w, h, limit]);
  const hw = hwLine(r), note = bodyNote(r.note);
  return (
    <section className="nm-vmdesk nm-vm-row in-card" aria-label={`${r.who} 몸`}>
      <div className="hw">
        {hw ? <p>{hw}</p> : null}
        {note ? <small>{note}</small> : null}
        {s && v ? <p className="facts" aria-label={pctKo(vmPct(v, limit))}>{vmFacts(v, limit).map((f) => <span key={f.k}><i>{f.k}</i><b>{f.v}</b></span>)}</p> : null}   {/* 숫자 줄 셋 = 한도 대비 %(형 11-17 07:59 「RAM 평균(%) / 평균 가용(%) / 최대(%)」 · 가용 칸이 아직 없으면 「–」) */}
        <BodyChips who={r.who} />
      </div>
      {v && g ? (   /* 지금 값 = 그림 밖 범례 줄(선 꼴 + 낱말 + 값 · 형 11-19 「쥔램 이런식으로 말고 좀 정확한 단어로 표기하고 잘보이게」 → 사용 · 할당 · 스레드) */
        <p className="lg">
          {g.last.used !== null ? <span><i className="k used" />사용 <b>{gb(g.last.used)}GB</b></span> : null}
          {g.last.held !== null ? <span><i className="k held" />할당 <b>{gb(g.last.held)}GB</b></span> : null}
          {g.last.busy !== null && v.threads ? <span><i className="k thr" />스레드 <b>{Math.round(g.last.busy * 10) / 10}</b> / {v.threads}</span> : null}
          <em>{(dayStart(g.t1) === dayStart(Date.now()) ? hm : mdhm)(g.t1)} 기준</em>   {/* 어제 것이면 날짜까지(몸이 오래 안 올린 것을 지금 값으로 읽지 않게) */}
        </p>
      ) : null}
      {v || q.isPending ? (
        <div className="plot" ref={ref} style={{ height: h }}>
          {v && g && s ? (
            <button type="button" className="grow" aria-expanded={tall} aria-label={`${r.who} 램 24시간 그래프 ${tall ? "줄이기" : "키우기"}`} onClick={() => setTall((t) => !t)}>
              <VmPlot who={r.who} v={v} g={g} s={s} tall={tall} />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
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

type Geom = ReturnType<typeof vmGeom>;
/** 그래프 한 장(가는 선 면 = 사용 · 계단 = 할당 · 최고점) — 낮은 띠에선 VM 최소 · 최대 글은 뺌(선만 · 키우면 글도) */
function VmPlot({ who, v, g, s, tall }: { who: string; v: VmMem; g: Geom; s: ReturnType<typeof vmStats>; tall: boolean }) {
  return (
          <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} role="img" aria-label={`${who} · ${mdhm(g.t1)} 까지 24시간 · 램${g.busy ? " · 스레드" : ""}`}>
            {g.ticksY.map((t) => <g key={t.label}><line className="grid" x1={g.l} x2={g.w - g.r} y1={t.y} y2={t.y} /><text className="tick" x={g.l - 6} y={t.y + 3} textAnchor="end">{t.label}</text></g>)}
            {g.ticksR.map((t) => <text key={`r${t.label}`} className="tick thr" x={g.w - g.r + 5} y={t.y + 3}>{t.label}</text>)}   {/* 오른쪽 눈금 = 스레드(값이 올 때만) */}
            {g.refs.map((r) => <g key={r.label}><line className="ref" x1={g.l} x2={g.w - g.r} y1={r.y} y2={r.y} />{tall ? <text className="note" x={g.l + 6} y={r.y - 5}>{r.label}</text> : null}</g>)}
            {g.marks.map((m) => <g key={m.x + m.label}><line className="mark" x1={m.x} x2={m.x} y1={g.top - 8} y2={g.base} /><text className="note" x={m.x + 4} y={g.top - 1} textAnchor={m.x > g.w - g.r - 110 ? "end" : "start"} dx={m.x > g.w - g.r - 110 ? -8 : 0}>{m.label}</text></g>)}
            <g className="vm-fade">
              <path className="hair a" d={g.hair[0]} /><path className="hair b" d={g.hair[1]} /><path className="hair c" d={g.hair[2]} />
              {g.peakHair ? <path className="hair peak" d={g.peakHair} /> : null}
            </g>
            {g.held ? <path className="held vm-draw" d={g.held} pathLength={1} /> : null}
            {g.outline ? <path className="line vm-draw" d={g.outline} pathLength={1} /> : null}
            {g.busy ? <path className="busy vm-draw" d={g.busy} pathLength={1} /> : null}   {/* 둘째 선 = 바쁜 스레드 수(라임 가는 선) */}
            {g.peak ? <g><circle className="dot vm-pop" cx={g.peak.x} cy={g.peak.y} r={4.2} /><text className="peak vm-fade late" x={g.peak.lx} y={g.peak.ly} textAnchor="middle">{g.peak.label}</text></g> : null}
            {g.ticksX.map((t) => <text key={t.x} className={t.end ? "hour end" : "hour"} x={t.x} y={g.base + 18} textAnchor={t.anchor}>{t.label}</text>)}   {/* 0 · 6 · 12 · 18시 자리 + 오른쪽 끝 = 마지막으로 잰 시각 */}
          </svg>
  );
}
