// 서랍 「몸 상태」(#/vm · 앞 이름 「VM 상태」) — 애들 전부를 한 줄씩: 상태 · 특기 · 하드웨어 · 램 24시간
//   형 11-16 16:4x 구름 맥 창 「정원에 각 vm 쓰는 애들 한테 이 자료받아서 vm 상태 그리게 할거야 공간 하나 만들어줘」 · 「이거 github nomutefb 에 보면 life 어쩌고 차트 도구있어」 · 「그거로 만들면돼.」
//   형 11-16 17:5x 「그리고 지금 vm들 보이는거 하드웨어애들도 다 보이게할거니까 쭈르륵 애들 다 보이게해줘. 그니까 애들 상태,하드웨어 상태, 특성 이런게 다 일목요연하게 사실 보이게 하려는거야.」
//   줄 = 봇 현황 표(GET status/bots · 손 표 차례 그대로)의 손 하나 = 얼굴 · 이름 · 상태(멈춤 · 일하는 중 · 노는 손 · 차례 밖 · 조용) · 특기(1특기 먼저) · 하드웨어(램 · CPU · GPU · OS · 비고) · 램 24시간
//   램 = GET vm-mem 에 그 이름으로 온 몸만(없는 손 = 「램 기록 아직 없음」 · 오면 저절로 그려짐) · 표에 없는 이름으로 온 몸(하드웨어 몸 이름 등)은 맨 아래 줄로 · 그림 = lieflat-charts F3 Hairline Area(./vm-mem-logic.ts 머리말)
//   그래프 = 낮은 띠(132px)로 훑고 누르면 그 줄만 키움(280px) · 움직임 = 처음 한 번(원본 박자) 뒤 멈춤 · 줄이기 설정 = 없음
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { idOf, office } from "../data/office";
import { FaceImg, usePeople } from "./faces";
import { type VmMem, type VmMemRes, everyKo, gb, mdhm, vmClean, vmDemo, vmGeom, vmStats } from "./vm-mem-logic";
import { type BotRow, type BotTable, type Group, GROUP_KO, groupOf, roleLabel, roleOf } from "./bot-desk-logic";
import { skillShort } from "./bot-desk-hands";
import "./vm-desk.css";

const isDemo = () => typeof location !== "undefined" && /[?&]vmdemo(?:[=&]|$)/.test(location.search);

type Sheet = { at?: number; table?: BotTable; skills?: Record<string, string> };
/** 줄 목록 — 봇 현황 표의 손(차례 그대로) + 그 이름의 램 기록 · 표에 없는 이름으로 온 몸은 맨 아래. */
export function rosterOf(rows: BotRow[], vms: VmMem[]): { who: string; r?: BotRow; v?: VmMem }[] {
  const by = new Map(vms.map((v) => [v.who, v])), seen = new Set(rows.map((r) => r.who));
  return [...rows.map((r) => ({ who: r.who, r, v: by.get(r.who) })), ...vms.filter((v) => !seen.has(v.who)).map((v) => ({ who: v.who, v }))];
}

export function VmDesk() {
  const demo = useMemo(isDemo, []);
  const q = useQuery({ queryKey: ["nomute", "vm-mem"], queryFn: () => office<VmMemRes>("vm-mem"), staleTime: 60_000, refetchInterval: 5 * 60_000, retry: false, enabled: !demo });
  const sheet = useQuery({ queryKey: ["nomute", "bots-sheet"], queryFn: () => office<Sheet>("status/bots"), staleTime: 5_000, refetchInterval: 60_000, retry: false });   // 봇 현황(./bot-desk.tsx)과 같은 열쇠 = 받아 둔 표를 같이 씀
  const vms = useMemo(() => (demo ? vmDemo(Date.now()) : vmClean(q.data?.vms)), [demo, q.data]);
  const rows = sheet.data?.table?.rows || [], skills = sheet.data?.skills || {};
  const list = useMemo(() => rosterOf(rows, vms), [rows, vms]);
  const at = !demo && typeof q.data?.at === "number" ? q.data.at : 0, people = usePeople();
  return (
    <div className="nm-vmdesk">
      {demo || at ? <p className="nm-vm-at">{at ? `램 ${mdhm(at)}` : ""}{demo ? " 견본" : ""}</p> : null}   {/* 머리 글 걷음(형 11-16 19:2x 「설명글은 가능한 없애고」) — 남긴 것 = 자료 시각 하나 */}
      {list.length ? <div className="nm-vm-rows">{list.map((x) => <BodyRow key={x.who} who={x.who} r={x.r} v={x.v} skills={skills} people={people} />)}</div>
        : <p className="nm-vm-empty" role="status">{q.isLoading || sheet.isLoading ? "읽는 중…" : "아직 올라온 자료가 없어요. 봇 현황 표나 몸마다 잰 램 기록이 오면 여기에 그려져요."}</p>}
    </div>
  );
}

const TONE: Record<Group, string> = { lost: "lost", work: "work", idle: "idle", held: "dim", quiet: "dim" };
const hwLine = (r?: BotRow) => (r ? [r.hw?.ram && r.hw.ram !== "-" ? `램 ${r.hw.ram}` : "", r.hw?.cpu && r.hw.cpu !== "-" ? r.hw.cpu : "", r.hw?.gpu && r.hw.gpu !== "없음" ? `GPU ${r.hw.gpu}` : "", r.hw?.os].filter(Boolean).join(" · ") : "");

function BodyRow({ who, r, v, skills, people }: { who: string; r?: BotRow; v?: VmMem; skills: Record<string, string>; people: ReturnType<typeof usePeople> }) {
  const [ref, w] = useWidth(), [tall, setTall] = useState(false);
  const s = useMemo(() => (v ? vmStats(v) : null), [v]), h = tall ? 280 : 132;
  const g = useMemo(() => (v && w ? vmGeom(v, w, h) : null), [v, w, h]);
  const face = idOf(who, people), grp = r ? groupOf(r) : null, hw = hwLine(r);
  return (
    <section className="nm-vm-row" aria-label={`${who} 몸 상태`}>
      <div className="who">
        <h3>{face ? <FaceImg id={face} size={30} className="nm-vm-face" /> : <i className="nm-vm-face none" aria-hidden />}<b>{who}</b>{r?.pm ? <em>PM</em> : null}{grp ? <span className={`st ${TONE[grp]}`}>{GROUP_KO[grp]}</span> : <span className="st dim">몸</span>}</h3>
        {r?.skills?.length ? <p className="sk">{r.skills.map((c, i) => <span key={c} className={i ? undefined : "first"} title={skills[c] ? skillShort(skills[c]) : undefined}>{(i ? roleOf(c, true) : roleLabel([c], who)) || skillShort(skills[c] || c)}</span>)}</p> : null}
      </div>
      <div className="hw">
        <p>{hw || (v?.host ? v.host : "하드웨어 표 없음")}</p>
        {r?.note ? <small>{r.note}</small> : null}
        {s && v ? <small className="num">램 평균 {gb(s.avg)}GB · 최고 {gb(s.max)}GB{s.heldLast !== null ? ` · 쥔 램 ${gb(s.heldLast)}GB` : ""} · {everyKo(v.step_s)}</small> : null}
      </div>
      <div className={`plot${v ? "" : " none"}`} ref={ref} style={v ? { height: h } : undefined}>
        {v && g && s ? (
          <button type="button" className="grow" aria-expanded={tall} aria-label={`${who} 램 24시간 그래프 ${tall ? "줄이기" : "키우기"}`} onClick={() => setTall((t) => !t)}>
            <VmPlot who={who} v={v} g={g} s={s} tall={tall} />
          </button>
        ) : v ? null : <span>램 기록 아직 없음</span>}
      </div>
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
/** 그래프 한 장(가는 선 면 · 쥔 램 계단 · 최고점) — 낮은 띠에선 VM 최소 · 최대 글은 뺌(선만 · 키우면 글도) */
function VmPlot({ who, v, g, s, tall }: { who: string; v: VmMem; g: Geom; s: ReturnType<typeof vmStats>; tall: boolean }) {
  return (
          <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} role="img" aria-label={`${who} · ${mdhm(v.t0)} ~ ${mdhm(s.t1)} · 쓴 램 평균 ${gb(s.avg)}GB · 최고 ${gb(s.max)}GB`}>
            {g.ticksY.map((t) => <g key={t.label}><line className="grid" x1={g.l} x2={g.w - g.r} y1={t.y} y2={t.y} /><text className="tick" x={g.l - 6} y={t.y + 3} textAnchor="end">{t.label}</text></g>)}
            {g.refs.map((r) => <g key={r.label}><line className="ref" x1={g.l} x2={g.w - g.r} y1={r.y} y2={r.y} />{tall ? <text className="note" x={g.l + 6} y={r.y - 5}>{r.label}</text> : null}</g>)}
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
  );
}
