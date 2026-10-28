// 러너 화면 몸통(새 사무실 꼴 · 토큰·카드·점 = 이 앱 것 · 숫자·칸 = 웹판 runner.html 그대로) — 틀(PageShell)은 runner-screen.tsx.
//   PC 줄마다: 머리(단계 점 · 이름 · 받은 때 · 도는 Claude · 잡/자리 · 부하 %) → 계기 셋(CPU·RAM(+캐시)·GPU · 쓴 양/전체) → 60분 추세(CPU·RAM 선) →
//   도는 잡(제목 · 수신 → 발신 · 걸린 시간 · 예상 대비 진행 · 큰/작은 자리 · 자리 이름 · 시작) → 디버그 세션 줄 · 맥 = 머리 + 줄 글 · 아래 = 출력 신선도·자리 감시.
import { type ReactNode, useEffect, useState } from "react";
import { MicOrb } from "../swap/mic-orb";   // 생각 구슬 = 등불 구슬 그대로(새 얼굴 0 · PM 11:08)
import {
  agentsOf, type Agent, debugRows, type Level, levelOf, lookOf, num, type OutItem, type RunnerData, type RunnerJob, type RunnerRow, runningJobs, useOpen, useRunner,
} from "./runner-data";

const INK: Record<Level, string> = { green: "text-emerald-500", yellow: "text-amber-400", orange: "text-orange-500", red: "text-red-500", off: "text-muted-foreground/50" };
const BG: Record<Level, string> = { green: "bg-emerald-500", yellow: "bg-amber-400", orange: "bg-orange-500", red: "bg-red-500", off: "bg-muted-foreground/40" };
const PCS = [["A", "WIN A"], ["B", "WIN B"]] as const;
const f0 = (v: number | null) => (v == null ? "-" : String(Math.round(v)));
const f1 = (v: number | null) => (v == null ? "-" : v.toFixed(1));
const two = (n: number) => String(n).padStart(2, "0");
const hm = (s: number) => { const d = new Date(s * 1000); return `${two(d.getHours())}:${two(d.getMinutes())}`; };
const dur = (sec: number) => { const s = Math.max(0, sec); return s < 60 ? `${Math.floor(s)}초` : s < 3600 ? `${Math.floor(s / 60)}분 ${Math.floor(s % 60)}초` : `${Math.floor(s / 3600)}시간 ${Math.floor((s / 60) % 60)}분`; };

/** 1초마다 지금(초) — 받은 때·걸린 시간 글만 움직임(자료는 30초마다). */
function useNowS() {
  const [n, setN] = useState(() => Date.now() / 1000);
  useEffect(() => { const t = setInterval(() => { if (!document.hidden) setN(Date.now() / 1000); }, 1000); return () => clearInterval(t); }, []);
  return n;
}

export function RunnerBoard({ data: given }: { data?: RunnerData }) {
  const q = useRunner();
  const now = useNowS();
  const data = given ?? q.data;
  const [open, flip] = useOpen();
  if (!data) {
    return <p className="mt-6 text-sm text-muted-foreground" role={q.isError ? "alert" : undefined}>{q.isError ? `러너 소식을 못 받았어 — ${q.error.message}` : "러너 소식 받는 중…"}</p>;
  }
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {PCS.map(([pc, name]) => <PcCard key={pc} name={name} d={data.rows[pc] ?? null} why={data.why[pc] || ""} now={now} open={open[pc] !== false} onFlip={() => flip(pc)} />)}
      </div>
      <MacCard d={data.rows.M ?? null} why={data.why.M || ""} now={now} />
      <Footer data={data} now={now} open={open.O === true} onFlip={() => flip("O")} />
    </div>
  );
}

function PcCard({ name, d, why, now, open, onFlip }: { name: string; d: RunnerRow | null; why: string; now: number; open: boolean; onFlip: () => void }) {
  const lk = lookOf(d, why, now), lv = levelOf(lk.load, lk.problem), jobs = runningJobs(d), dbg = debugRows(d);
  const busy = d && num(d.busy) != null && d.busy! >= 0 ? d.busy : null, total = d && num(d.total) != null && d.total! >= 0 ? d.total : null;
  return (
    <section className="rounded-2xl border border-border bg-card p-4" aria-label={`${name} 러너`}>
      <Head name={name} lv={lv} when={lk.when} agents={agentsOf(d, lk.problem)} seats={d?.seats}
        right={<><span className="text-xs tabular-nums text-muted-foreground" title="도는 잡 / 자리">{lk.problem || busy == null ? "-" : busy}<span className="mx-0.5 opacity-50">/</span>{total ?? "-"}</span>
          <b className={`text-sm font-semibold tabular-nums ${INK[lv]}`} title="부하(자리·CPU·잡 램 중 큰 값)">{lk.load == null ? "-" : `${Math.round(lk.load)}%`}</b></>} />
      {why && !d ? <p className="mt-2 text-xs text-muted-foreground">{why}</p> : null}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Meter label="CPU" pct={d ? num(d.cpu) : null} used={`${f0(d ? num(d.cpuUsed) : null)}/${f0(d ? num(d.cpuTotal) : null)}`} problem={lk.problem} />
        <Meter label="RAM" pct={d ? num(d.ram) : null} used={`${f1(d ? num(d.ramUsed) : null)}/${f1(d ? num(d.ramTotal) : null)}`} problem={lk.problem}
          cache={!lk.problem && d && num(d.cacheGB) != null && (d.ramTotal ?? 0) > 0 ? (100 * d.cacheGB!) / d.ramTotal! : null} cacheGB={d ? num(d.cacheGB) : null} />
        <Meter label="GPU" pct={d ? num(d.gpu) : null} used={`${f1(d ? num(d.gpuUsed) : null)}/${f1(d ? num(d.gpuTotal) : null)}`} problem={lk.problem} />
      </div>
      <Trend d={d} problem={lk.problem} />
      {!jobs.length ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><span aria-hidden className={`size-1.5 rounded-full ${BG.off}`} />{lk.problem ? lk.note : "쉼 · 도는 잡 없음"}</p>
      ) : null}
      {jobs.length || dbg.length ? (   /* 접기 = 도는 잡 + 디버그 줄 같이(웹판 체브론 · 기억 = useOpen) */
        <button type="button" className="mt-3 flex w-full items-center gap-2 text-left text-xs text-muted-foreground" aria-expanded={open} onClick={onFlip}>
          {lk.running ? <MicOrb size={18} state="thinking" /> : null}   {/* 도는 잡이 있으면 = 일하는 중 구슬(웹판 Working 생각 구슬 자리) */}
          <span>{[jobs.length ? `도는 잡 ${jobs.length}` : "", dbg.length ? `디버그 ${dbg.length}` : ""].filter(Boolean).join(" · ")}</span>
          <svg viewBox="0 0 24 24" className={`ml-auto size-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </button>
      ) : null}
      {open && jobs.length ? (
        <>
          {lk.problem ? <p className="mt-3 text-xs text-muted-foreground">{lk.note} · 아래 = 마지막으로 받은 잡</p> : null}
          <ol className="mt-3 flex flex-col divide-y divide-border rounded-xl border border-border" aria-label="도는 잡">
            {jobs.map((j) => <JobRow key={j.id} j={j} now={now} problem={lk.problem} />)}
          </ol>
        </>
      ) : null}
      {open && dbg.length ? (
        <ul className="mt-3 flex flex-col gap-1" aria-label="디버그 브라우저">
          {dbg.map((x) => (
            <li key={x.name} className="flex items-center gap-2 text-xs">
              <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${x.st === "on" ? BG.green : x.st === "login" ? BG.yellow : BG.off}`} />
              <span className="font-medium">{x.name}</span>
              <span className="ml-auto truncate text-muted-foreground">{x.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function MacCard({ d, why, now }: { d: RunnerRow | null; why: string; now: number }) {
  const lk = lookOf(d, why, now);
  return (
    <section className="rounded-2xl border border-border bg-card px-4 py-3" aria-label="MAC PRO">
      <Head name="MAC PRO" lv={lk.problem ? "off" : "green"} when={lk.when} agents={agentsOf(d, lk.problem)}
        right={<span className="truncate text-xs text-muted-foreground">{d?.line || why || ""}</span>} />
    </section>
  );
}

function Head({ name, lv, when, agents, right, seats }: { name: string; lv: Level; when: string; agents: Agent[]; right: ReactNode; seats?: RunnerRow["seats"] }) {
  const ss = Array.isArray(seats) ? [...seats].sort((a, b) => (b.L || 0) - (a.L || 0)) : [];   // 자리 점 = 큰 자리 먼저 · 바쁨 진하게 · 멈춤 빨강(보조 03 초안 꼴)
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span aria-hidden className={`size-2 shrink-0 rounded-full ${BG[lv]}`} />
      <b className="shrink-0 text-sm font-semibold tracking-wide">{name}</b>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">· {when}</span>
      <Claudes list={agents} />
      {ss.length ? (
        <span className="hidden shrink-0 items-center gap-[3px] sm:flex" aria-label={`자리 ${ss.length} · 바쁨 ${ss.filter((s) => s.b).length}`} role="img">
          {ss.map((s) => <i key={s.n} className={`size-1.5 rounded-full ${s.b ? "bg-foreground" : s.d ? "bg-red-500" : "bg-foreground/20"} ${s.L ? "ring-1 ring-foreground/50" : ""}`} />)}
        </span>
      ) : null}
      <span className="ml-auto flex min-w-0 items-center gap-3">{right}</span>
    </div>
  );
}

/** 계기 하나 = 큰 % · 쓴 양/전체 · 막대(단계 색) · RAM = 막대 뒤에 캐시 몫(옅게). */
function Meter({ label, pct, used, problem, cache, cacheGB }: { label: string; pct: number | null; used: string; problem: boolean; cache?: number | null; cacheGB?: number | null }) {
  const lv = levelOf(pct, problem), v = Math.max(0, Math.min(100, pct ?? 0)), c = cache == null ? 0 : Math.max(0, Math.min(100 - v, cache));
  return (
    <div className="min-w-0" role="img" aria-label={`${label} ${pct == null ? "-" : Math.round(v)}% · ${used}`}>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`ml-auto text-lg font-semibold tabular-nums leading-none ${INK[lv]}`}>{pct == null ? "-" : Math.round(v)}<small className="text-xs">%</small></span>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <span className={`h-full ${BG[lv]}`} style={{ width: `${v}%` }} />
        {c > 0 ? <span className={`h-full ${BG[lv]} opacity-30`} style={{ width: `${c}%` }} title="캐시(비울 수 있는 램)" /> : null}
      </div>
      <p className="mt-1 truncate text-[11px] tabular-nums text-muted-foreground">{used}{c > 0 && cacheGB != null ? ` · 캐시 ${f1(cacheGB)}` : ""}</p>
    </div>
  );
}

/** 60분 추세 = CPU(단계 색 선) · RAM(옅은 선) · 오른쪽 끝 = 지금. 값 없는 분 = 끊음. */
function Trend({ d, problem }: { d: RunnerRow | null; problem: boolean }) {
  const W = 300, H = 40, tr = d?.trend;
  if (!d || !tr || !Array.isArray(tr.cpu)) return <div className="mt-3 h-10 rounded-lg bg-foreground/5" aria-hidden />;
  const end = tr.end || d.at, step = tr.step || 60, start = end - 3600;
  const X = (t: number) => Math.max(0, Math.min(W, ((t - start) / 3600) * W)), Y = (v: number) => H - 3 - (Math.max(0, Math.min(100, v)) / 100) * (H - 6);
  const path = (arr?: (number | null)[]) => {
    if (!arr) return "";
    let p = "", run = false;
    arr.forEach((raw, i) => { const t = end - (arr.length - 1 - i) * step, v = num(raw); if (t < start || v == null) { run = false; return; } p += `${run ? "L" : "M"}${X(t).toFixed(1)} ${Y(v).toFixed(1)}`; run = true; });
    return p;
  };
  return (
    <svg className="mt-3 h-10 w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="60분 추세 · CPU 진한 선 · RAM 옅은 선">
      <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <g className={`${INK[levelOf(num(d.ram), problem)]} opacity-30`}>{cacheDots(d, X).map((p, i) => (p.ring ? <circle key={i} cx={p.x} cy={H / 2} r={p.r} fill="none" stroke="currentColor" strokeWidth="0.8" /> : <circle key={i} cx={p.x} cy={H / 2} r={p.r} fill="currentColor" opacity={p.faint ? 0.45 : 1} />))}</g>
      <path d={path(tr.ram)} fill="none" className={`stroke-current ${INK[levelOf(num(d.ram), problem)]} opacity-40`} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d={path(tr.cpu)} fill="none" className={`stroke-current ${INK[levelOf(num(d.cpu), problem)]}`} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** 추세 뒤 캐시 점(웹판 TrendView.DrawCache 뜻 · 보조 03 초안) — 1분 한 칸 · 크기 = 캐시 GB / 용량 · 비운 분 = 빈 고리 · 0GB·쉼 = 아주 작은 점. */
function cacheDots(d: RunnerRow, X: (t: number) => number) {
  const ca = d.cache, out: { x: number; r: number; ring?: boolean; faint?: boolean }[] = [];
  if (!ca || !num(ca.end) || !Array.isArray(ca.gb)) return out;
  const cap = Math.max(1, num(ca.cap) ?? 8), clr = String(ca.clr || ""), rest = String(ca.rest || "");
  for (let i = 0; i < 60; i++) {
    const x = X((ca.end! - 59 + i) * 60 + 30), v = num(ca.gb[i]);
    if (clr[i] === "1") out.push({ x, r: 2.4, ring: true });
    else if (v != null && v >= 0.05) out.push({ x, r: 1.5 + Math.min(1, v / cap) * 1.4 });
    else if (v != null || rest[i] === "1") out.push({ x, r: 0.8, faint: true });
  }
  return out;
}

function JobRow({ j, now, problem }: { j: RunnerJob; now: number; problem: boolean }) {
  const el = now - (j.start ?? now), exp = num(j.expected) ?? 0, p = exp > 0 ? Math.max(0.04, Math.min(0.95, el / exp)) : null, L = j.kind === "L";
  return (
    <li className="flex items-start gap-3 px-3 py-2.5">
      <span className="mt-0.5 flex h-7 w-1.5 shrink-0 items-end overflow-hidden rounded-full bg-foreground/10" aria-hidden>
        <span className={`w-full rounded-full ${problem ? BG.off : BG.green} ${p == null ? "h-full" : ""} ${p == null && !problem ? "animate-pulse" : ""}`} style={p == null ? undefined : { height: `${(p * 100).toFixed(1)}%` }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2"><span className="truncate text-sm font-medium">{j.title || j.workflow || "이름 확인 중"}</span><span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">{dur(el)}</span></p>
        {j.rx || j.tx ? <p className="truncate text-xs text-muted-foreground"><Bots s={j.rx || "-"} /> → <Bots s={j.tx || "-"} /></p> : null}
        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className={`rounded px-1 font-semibold ${L ? "bg-orange-500/15 text-orange-500" : "bg-foreground/10"}`}>{L ? "큰 자리" : "작은 자리"}</span>
          <span className="tabular-nums">{String(j.seat || "-").toUpperCase()}</span>
          <span className="tabular-nums">{j.start ? `${hm(j.start)} 시작` : ""}</span>
        </p>
      </div>
    </li>
  );
}

/** 「수신 → 발신」 글 안 {봇} = 봇 이름 칸(웹판과 같은 뜻 · 앱 강조색). */
function Bots({ s }: { s: string }) {
  return <>{s.split(/(\{[^{}]{1,12}\})/).map((x, i) => (/^\{.*\}$/.test(x) ? <b key={i} className="font-medium text-emerald-500">{x.slice(1, -1)}</b> : x))}</>;
}

/** 도는 Claude 점(모양 = 모델 · 색 = 역할 · 운영자 261024 「PM 노뮤트색 · 사관 보라 · 대기 기본 · 조수 노랑 · 그 외 흰색」) · 폰 폭 = 6 + 「+N」. */
function Claudes({ list }: { list: Agent[] }) {
  if (!list.length) return null;
  const shown = list.slice(0, 6), more = list.length - shown.length;
  return (
    <span className="flex shrink-0 items-center gap-1" role="img" aria-label={`도는 Claude ${list.length}`}>
      {shown.map((a) => {
        const ink = a.role === "pm" ? "text-emerald-500" : a.role === "sagwan" ? "text-violet-500" : a.role === "jo" ? "text-amber-400" : a.role === "daegi" || a.role === "bojo" ? "text-foreground" : "text-muted-foreground";
        return (
          <svg key={a.key} viewBox="-6 -6 12 12" className={`size-3 ${ink} ${a.late ? "opacity-40" : ""}`} aria-hidden>
            <title>{a.tip}</title>
            {a.model === "f" ? <path d="M0 -5.2 4.5 -2.6 4.5 2.6 0 5.2 -4.5 2.6 -4.5 -2.6Z" fill="currentColor" />
              : a.model === "c" ? <path d="M-4.6 3.4h8.8a2.6 2.6 0 0 0 .2-5.2 3.4 3.4 0 0 0-6.4-1 2.6 2.6 0 0 0-2.6 6.2Z" fill="currentColor" />
              : a.model === "r" ? <rect x="-4.4" y="-4.4" width="8.8" height="8.8" rx="2.6" fill="currentColor" />
              : <circle r="4.6" fill="currentColor" />}
            {a.late ? <circle cx="4" cy="-4" r="1.6" className="fill-orange-500" /> : null}
          </svg>
        );
      })}
      {more > 0 ? <span className="text-[11px] tabular-nums text-muted-foreground">+{more}</span> : null}
    </span>
  );
}

/** 출력 신선도 단계(웹판 OST 그대로) — 이름 · 차례 · 색. */
const OST: Record<string, [string, number, Level]> = { alert: ["경보", 0, "red"], sus: ["의심", 1, "yellow"], up: ["윗단 멈춤", 2, "orange"], ok: ["정상", 3, "green"] };
const mins = (m: number | null | undefined) => (m == null || !Number.isFinite(m) ? "-" : m < 60 ? `${Math.round(m)}분` : m < 2880 ? `${Math.floor(m / 60)}시간 ${Math.round(m % 60)}분` : `${Math.floor(m / 1440)}일`);

/** 아래 = 출력 신선도(워치독 ⑪ · 문제 줄 늘 + 나이 = 상태 바뀐 때부터 · 체브론 = 정상 줄까지 펼침 · 기억 O) · 자리 감시(형 10-25 · 문제 줄만). */
function Footer({ data, now, open, onFlip }: { data: RunnerData; now: number; open: boolean; onFlip: () => void }) {
  const o = data.out, rank = (x: OutItem) => (OST[x.st || "ok"] || OST.ok)[1];
  const items = Object.entries(o?.items ?? {}).map(([id, x]) => ({ id, ...x })).sort((a, b) => rank(a) - rank(b) || String(a.ko || a.id).localeCompare(String(b.ko || b.id), "ko"));
  const cnt = (k: string) => items.filter((x) => x.st === k).length, bad = cnt("alert"), sus = cnt("sus"), up = cnt("up"), prob = bad + sus + up;
  const lv: Level = !o ? "off" : bad ? "red" : sus ? "yellow" : up ? "orange" : "green", shown = open ? items : items.filter((x) => x.st && x.st !== "ok");
  const label = !o ? data.outWhy || "못 받음" : prob ? [bad && `경보 ${bad}`, sus && `의심 ${sus}`, up && `윗단 멈춤 ${up}`].filter(Boolean).join(" · ") : "모두 정상";
  const seat = data.seat?.items ?? [];
  return (
    <section className="rounded-2xl border border-border bg-card px-4 py-3 text-sm" aria-label="출력 신선도·자리 감시">
      <button type="button" className="flex w-full items-center gap-2 text-left" aria-expanded={open} onClick={onFlip} disabled={!o}>
        <span aria-hidden className={`size-2 shrink-0 rounded-full ${BG[lv]}`} />
        <span className="font-medium">출력 신선도</span>
        <span className="truncate text-xs text-muted-foreground">· {label}</span>
        <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">{items.length - prob}<span className="mx-0.5 opacity-50">/</span>{items.length}</span>
        {o ? <svg viewBox="0 0 24 24" className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg> : null}
      </button>
      {shown.length ? (
        <ol className="mt-2 flex flex-col divide-y divide-border" aria-label="출력 줄">
          {shown.map((x) => {
            const st = OST[x.st || "ok"] || OST.ok, bad1 = !!x.st && x.st !== "ok", t = x.last ? Date.parse(x.last) : NaN;
            const tail = x.class || (bad1 && Array.isArray(x.why) ? x.why.join(" · ") : "");   // 꼴(경보) · 까닭(의심·윗단)
            return (
              <li key={x.id} className="flex items-start gap-2 py-2">
                <span aria-hidden className={`mt-1.5 size-1.5 shrink-0 rounded-full ${BG[st[2]]}`} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2"><span className="truncate text-sm">{x.ko || x.id}</span>{bad1 && !Number.isNaN(t) ? <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground" title="상태 바뀐 때부터">{mins((now * 1000 - t) / 60000)}</span> : null}</p>
                  <p className="truncate text-xs text-muted-foreground">{x.path || ""}{tail ? ` → ${tail}` : ""}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className={`rounded px-1 font-semibold ${bad1 ? `${INK[st[2]]} bg-foreground/10` : "bg-foreground/10"}`}>{st[0]}</span>
                    <span>임계 {mins(x.max)}{x.dup_of ? ` · 이슈는 손 감시 ${x.dup_of}` : ""}{x.issue ? ` · #${x.issue}` : ""}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
      {seat.length ? (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {seat.map((x) => <li key={x.code} className="flex gap-2 text-xs"><span aria-hidden className={`mt-1 size-1.5 shrink-0 rounded-full ${BG.orange}`} /><span>{x.text}</span><span className="ml-auto shrink-0 tabular-nums text-muted-foreground">{x.since?.slice(11, 16)}</span></li>)}
        </ul>
      ) : null}
    </section>
  );
}
