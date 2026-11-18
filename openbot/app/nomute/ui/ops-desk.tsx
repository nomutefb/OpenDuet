// 5번 「애들」 위 탭 「살림」 — 러너 · 빌드 단계 · R2 · 판독 값 · 한도를 날마다 쌓인 줄로 한 화면에
//   형 11-18 · 11-19: 「돈 나가는 목전까지왓을때도 몰랐을정도니까」 · 「애초에 이게 안보이니까 내가 뭐가 돌아가는지를 몰러」 ·
//     「누적되는 것들 … 차트화해서 항시 보고형태러」 · 「누수되는 지점 이나 개선 부분이 내 잣대 4개를 보고 되새김질이 가능하면」
//   자료 = /ops.json 하나(에디터 watchdog 가 하루 한 줄 쌓고 굽기가 구움 · 칸 뜻 = nomutefb/editor docs/ops-daily.md) — 열 때 한 번만 받고 다시 안 물음(매시 한 번만 바뀜)
//   그림 = 「몸 상태」(./vm-desk.css)의 카드 · 눈금 · 선 옷 그대로 + 막대(./ops-desk.css) · 움직임 없음(가만히 있는 화면 값 0)
//   막대를 누르면 그날로(아래 단계 띠 · 잣대 넷이 그날 것으로) · 잣대 넷의 머리 글 = 형 비유 원문 그대로
import "./vm-desk.css";
import "./ops-desk.css";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Chev } from "./chev";
import { opsOpts } from "./ops-data";
import { type Delta, type LensRow, type OpsRow, avgBefore, barGeom, hm, lensDelta, lineOver, man, md, stepRows, KINDS } from "./ops-logic";
import { SrvNote } from "./srv-note";
import { reading, whyOf } from "./wait-text";

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

/** 날짜별 막대(+ 둘째 값은 라임 가는 선) — 막대를 누르면 그날을 고름 */
function Bars({ name, days, vals, line, fmt, sel, onPick }: { name: string; days: string[]; vals: (number | null | undefined)[]; line?: (number | null | undefined)[]; fmt: (v: number) => string; sel: number; onPick: (i: number) => void }) {
  const [ref, w] = useWidth(), h = 168;
  const g = w ? barGeom(vals, w, h) : null, lo = g && line ? lineOver(line, g) : null;
  const on = g?.bars[sel];
  return (
    <div className="plot" ref={ref} style={{ height: h }}>
      {g ? (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${name} · ${days.length}일`}>
          {g.ticks.map((t) => <g key={t.v}><line className="grid" x1={g.l} x2={w - g.r} y1={t.y} y2={t.y} /><text className="tick" x={g.l - 6} y={t.y + 3} textAnchor="end">{fmt(t.v)}</text></g>)}
          {g.bars.map((b) => (
            <g key={b.i} className="ops-hit" onClick={() => onPick(b.i)}>
              <rect className="ops-pad" x={b.cx - Math.max(b.w, 14) / 2 - 2} y={g.top} width={Math.max(b.w, 14) + 4} height={g.base - g.top} />
              {b.v == null ? <text className="tick" x={b.cx} y={g.base - 5} textAnchor="middle">–</text> : <rect className={`ops-bar${b.i === sel ? " on" : ""}`} x={b.x} y={b.y} width={b.w} height={b.h} rx={2} />}
            </g>
          ))}
          {lo?.d ? <path className="busy" d={lo.d} /> : null}
          {on && on.v != null ? <text className="peak" x={on.cx} y={on.y - 5} textAnchor={on.cx < g.l + 30 ? "start" : on.cx > w - g.r - 30 ? "end" : "middle"}>{fmt(on.v)}</text> : null}
          {g.bars.filter((b) => b.i % g.step === (days.length - 1) % g.step).map((b) => <text key={`d${b.i}`} className={`hour${b.i === sel ? " on" : ""}`} x={b.cx} y={g.base + 15} textAnchor="middle">{md(days[b.i])}</text>)}
        </svg>
      ) : null}
    </div>
  );
}

function Card({ title, note, sub, children, legend }: { title: string; note?: string; sub?: ReactNode; children: ReactNode; legend?: ReactNode }) {
  return (
    <section className="nm-vm-card">
      <h3>{title}{note ? <span>{note}</span> : null}</h3>
      {sub ? <p className="sub">{sub}</p> : null}
      {children}
      {legend ? <div className="legend">{legend}</div> : null}
    </section>
  );
}

/** 한도 칸 하나 — 값 · 띠(100% 에서 멈추고 넘으면 빨강) · 아래 한 줄 */
function Gauge({ label, value, pct, sub }: { label: string; value: string; pct?: number | null; sub?: string }) {
  const over = typeof pct === "number" && pct > 100, warn = typeof pct === "number" && pct >= 80 && !over;
  return (
    <div className={`nm-ops-g${over ? " over" : warn ? " warn" : ""}`}>
      <span className="l">{label}</span>
      <b>{value}</b>
      {typeof pct === "number" ? <i className="track"><i style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} /></i> : <i className="track none" />}
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

const DeltaChip = ({ d }: { d: Delta }) => (d.kind === "none" ? null : d.kind === "new" ? <em className="nm-ops-d new">새로</em> : d.kind === "same" ? <em className="nm-ops-d">그대로</em> : <em className={`nm-ops-d ${d.kind}`}>{d.kind === "up" ? "+" : "−"}{Math.round(d.by)}분</em>);

/** 형 잣대 하나 — 머리 = 형 말 원문 · 줄 = 기계가 올린 후보(하루 분 큰 순 · 7일 전과 견줌) */
function Lens({ name, said, counts, rows, i, k, list, extra }: { name: string; said: string; counts: string; rows: OpsRow[]; i: number; k: "cart" | "post" | "door" | "bulb"; list: LensRow[]; extra?: ReactNode }) {
  return (
    <section className="nm-vm-card nm-ops-lens">
      <h3>{name}</h3>
      <p className="sub said">{said}</p>
      <p className="sub">센 것: {counts}</p>
      {list.length ? (
        <ul>
          {list.map((x) => (
            <li key={x.wf}>
              <span className="wf">{x.wf}</span>
              {k === "bulb"
                ? <><span className="how">건너뜀 {x.skipped} · 빈 회차 {x.empty} / {x.n}번</span><b>{x.miss_pct}%</b></>
                : <><span className="how">{k === "door" ? `기다림 ${Math.round(x.wait_s || 0)}초 · 줄 ${Math.round(x.queue_s || 0)}초` : `${Math.round(x.per_s || 0)}초`} × {x.n}번{k === "post" && x.miss_pct ? ` · 헛걸음 ${x.miss_pct}%` : ""}</span><b>{Math.round(x.min || 0)}분</b><DeltaChip d={lensDelta(rows, i, k, x.wf)} /></>}
            </li>
          ))}
        </ul>
      ) : <p className="sub none">이 날은 걸린 것 없음</p>}
      {extra}
    </section>
  );
}

export function OpsDesk() {
  const q = useQuery(opsOpts);
  const [pick, setPick] = useState<number | null>(null);
  if (q.isPending) return <p className="nm-vmdesk nm-vm-empty">{reading("살림 장부")}</p>;
  const rows = (q.data?.rows || []).filter((r) => r && r.day), now = q.data?.now || null;
  if (q.isError || !rows.length) return <div className="nm-vmdesk"><SrvNote what="살림 장부" detail={q.isError ? whyOf(q.error) : "아직 쌓인 줄이 없음"} className="nm-vm-empty" /></div>;
  const i = pick == null ? rows.length - 1 : Math.min(pick, rows.length - 1), row = rows[i], last = rows[rows.length - 1];
  const days = rows.map((r) => r.day);
  const r2b = rows.map((r) => r.r2?.b), r2a = rows.map((r) => r.r2?.a);
  const runHr = rows.map((r) => (r.run ? Math.round(r.run.total.runner_min_est / 6) / 10 : null)), runN = rows.map((r) => r.run?.total.runs);
  const usd = rows.map((r) => r.judge?.usd);
  const t = row.run?.total, usdAvg = avgBefore(usd, rows.length - 1), r2 = now?.r2, gh = now?.gh;
  const steps = stepRows(row), lens = row.lens;
  const src = Object.entries(row.judge?.by_src || {}).slice(0, 3).map(([k, v]) => `${k} $${v.toFixed(2)}`).join(" · ");
  return (
    <div className="nm-vmdesk nm-opsdesk mx-auto w-full max-w-5xl">
      <div className="nm-ops-gauges">
        <Gauge label="R2 읽기 · 이번 달" value={r2?.b_pct != null ? `${Math.round(r2.b_pct)}%` : "—"} pct={r2?.b_pct} sub={r2?.b != null ? `${man(r2.b)}번 / 무료 1,000만` : "Cloudflare 토큰이 없어 못 읽음"} />
        <Gauge label="R2 목록·쓰기 · 이번 달" value={r2?.a_pct != null ? `${Math.round(r2.a_pct)}%` : "—"} pct={r2?.a_pct} sub={r2?.a != null ? `${man(r2.a)}번 / 무료 100만` : "Cloudflare 토큰이 없어 못 읽음"} />
        <Gauge label="R2 용량" value={r2?.gb != null ? `${r2.gb}GB` : "—"} pct={r2?.gb_pct} sub={r2?.gb != null ? "무료 10GB" : "Cloudflare 토큰이 없어 못 읽음"} />
        {(now?.r2_more || []).flatMap((m) => (m.a_pct == null ? [<Gauge key={`${m.name}x`} label={`${m.name} R2`} value="—" sub={`못 읽음${m.err ? ` · ${m.err.slice(0, 40)}` : ""}`} />] : [
          <Gauge key={`${m.name}b`} label={`${m.name} R2 읽기 · 이번 달`} value={`${m.b_pct}%`} pct={m.b_pct} sub={`${man(m.b || 0)}번 / 무료 1,000만`} />,
          <Gauge key={`${m.name}a`} label={`${m.name} R2 목록·쓰기`} value={`${m.a_pct}%`} pct={m.a_pct} sub={`${man(m.a || 0)}번 / 무료 100만${m.gb != null ? ` · ${m.gb}GB` : ""}`} />,
        ]))}
        <Gauge label="GitHub 호출 · 오늘 최대" value={gh ? `${Math.round(gh.used_max_pct)}%` : "—"} pct={gh?.used_max_pct} sub={gh ? `방금 ${gh.last_pct ?? "–"}% · 시간당 ${gh.limit.toLocaleString()}번` : "아직 본 값 없음"} />
        <Gauge label={`판독 값 · ${md(last.day)}`} value={last.judge ? `$${last.judge.usd.toFixed(2)}` : "—"} sub={last.judge && usdAvg ? `앞 7일 평균 $${usdAvg.toFixed(2)} · ${last.judge.calls}콜` : undefined} />
        <Gauge label={`러너 · ${md(last.day)}`} value={last.run ? hm(last.run.total.runner_min_est) : "—"} sub={last.run ? `회차 ${last.run.total.runs.toLocaleString()} · 건너뜀 ${last.run.total.skipped} · 실패 ${last.run.total.failed}` : undefined} />
      </div>
      {now?.at ? <p className="nm-vm-at">한도 값 {now.at.slice(5, 16).replace("T", " ")} · 하루 줄은 새벽 2시 뒤에 붙음</p> : null}

      <div className="nm-vm-grid">
        <Card title="R2 호출" note="하루" sub="막대 = 읽기 · 선 = 목록·쓰기. 한 달 무료 몫은 읽기 1,000만 · 목록·쓰기 100만."
          legend={<><span><i className="k bar" />읽기</span><span><i className="k line" />목록·쓰기</span></>}>
          <Bars name="R2 하루 호출" days={days} vals={r2b} line={r2a} fmt={man} sel={i} onPick={setPick} />
        </Card>
        <Card title="러너가 돈 시간" note="하루 · 어림" sub="막대 = 돈 시간(회차 수 × 표본 잡 시간) · 선 = 회차 수."
          legend={<><span><i className="k bar" />돈 시간</span><span><i className="k line" />회차 수</span></>}>
          <Bars name="러너가 돈 시간" days={days} vals={runHr} line={runN} fmt={(v) => `${+v.toFixed(1)}시간`} sel={i} onPick={setPick} />
        </Card>
        <Card title="판독 값" note="하루 · 달러" sub={src ? `${md(row.day)}: ${src}` : "갈래: gate 경중 · breaking 속보 · group 묶기"}>
          <Bars name="판독 값" days={days} vals={usd} fmt={(v) => `$${v >= 10 ? Math.round(v) : v.toFixed(1)}`} sel={i} onPick={setPick} />
        </Card>
        <Card title="빌드 단계" note={`${md(row.day)} · 한 회차 속`} sub="띠 길이 = 한 회차 잡 시간(그날 성공 회차 5개의 가운데값). 단계 갈래는 이름으로 가른 어림."
          legend={KINDS.map((k) => <span key={k.k}><i className={`k seg ${k.cls}`} />{k.label}</span>)}>
          <ul className="nm-ops-steps">
            {steps.map((s) => (
              <li key={s.wf}>
                <div className="h"><span className="wf">{s.wf}</span><span className="v">{Math.round(s.job)}초 × {s.n}번</span></div>
                <div className="bar">{s.segs.map((g) => <i key={g.cls} className={g.cls} style={{ width: `${g.pct}%` }} title={`${g.label} ${Math.round(g.s)}초`} />)}</div>
                {s.top ? <small>가장 긴 단계: {s.top}</small> : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="nm-ops-day">
        <button type="button" aria-label="앞 날" disabled={i <= 0} onClick={() => setPick(i - 1)}><Chev dir="left" size={18} /></button>
        <b>{row.day}</b>
        <button type="button" aria-label="다음 날" disabled={i >= rows.length - 1} onClick={() => setPick(i + 1)}><Chev dir="right" size={18} /></button>
        {t ? <span>회차 {t.runs.toLocaleString()} · 건너뜀 {t.skipped} · 빈 회차 {t.empty} · 실패 {t.failed} · 돈 시간 {hm(t.runner_min_est)}</span> : null}
      </div>

      {lens ? (
        <div className="nm-vm-grid">
          <Lens name="카트" k="cart" rows={rows} i={i} list={lens.cart}
            said="「카트가 한번에 더 실어서 한번에 가도 같은 기능을 할 수 있는데, 2개가 가서, 2명이 끌게 된다던지」" counts="회차마다 커밋에 드는 초 × 회차 수"
            extra={lens.cart_together.length ? <p className="sub pairs">같은 박자에 따로 뜬 짝: {lens.cart_together.slice(0, 4).map(([a, b, n]) => `${a} + ${b} ${n}번`).join(" · ")}</p> : null} />
          <Lens name="전구" k="bulb" rows={rows} i={i} list={lens.bulb}
            said="「전구를 2개 달아놨어 … 1개를 뗐어. 근데 뗐더니? 진짜로 한달 동안 아~무 일도 벌어지지 않았어」" counts="건너뛴 회차 + 빈 회차(성공인데 20초 안). 읽는 이가 있는지는 기계가 못 잼" />
          <Lens name="우체통" k="post" rows={rows} i={i} list={lens.post}
            said="「매번 옷 챙겨입고 … 나가서 편지를 가지고 들어왔다」" counts="(받기 + 채비) 초 × 회차 수" />
          <Lens name="문틈" k="door" rows={rows} i={i} list={lens.door}
            said="「문틈으로 편지를 넣어주는 서비스가있네. 와 ... 나 왜 그동안 이런 헛짓거리했지?」" counts="(기다림 + 줄 선 시간) 초 × 회차 수. 더 나은 길이 있는지는 기계가 못 잼" />
        </div>
      ) : null}

      {row.new_wf?.length ? (
        <section className="nm-vm-card nm-ops-new">
          <h3>새로 생긴 곁가지<span>앞 7일에 없던 것</span></h3>
          <p className="sub">{row.new_wf.join(" · ")}</p>
          <p className="sub">묻는 넷: 누가 이 결과를 읽나 · 하루 몇 번 × 한 번 얼마 · 이미 도는 회차에 실을 수 있나 · 물어보러 가는 대신 알려 주는 길이 있나</p>
        </section>
      ) : null}
      <p className="nm-ops-src">에디터 watchdog 가 하루 한 줄 쌓음 · 러너 시간과 잣대 넷의 분은 어림 · 「새로」 · 「+분」은 7일 전 같은 줄과 견준 것</p>
    </div>
  );
}
