// 스케줄(형 10-31 「포크로 꼽아지고 그걸 차단기로 내리고 키는 개념」 · 「꼬챙이 하나하나에 루틴을 담고 시간을 설계」 · 「포크가 공통의 내용을 담을 수 있는거고」 · 「각각의 끝에는 ! 훅 이거 단 하나야」)
//   트리 = 맨 위 봇 얼굴 줄(봇 큰 차단기 · 고르면 그 봇 꼬챙이만) → 포크 차단기 → 꼬챙이 차단기 → 끝 ! 얼굴 · 내린 위 칸 아래는 다 멈춘 것으로 보임
//   서버 = GET schedule · POST schedule/set(형만 · dry = 미리 보기 · at routine·fork·bot) · 저장 흐름 = 설정 NomuteSchedule 과 같음 · 서버 판이 안 올라온 동안은 forks 없음 → 「아직 안 나눔」 한 포크
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { idOf, office, people } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { Breaker, type HealthSt, ST_ORDER, HEALTH_KO, StatusDot, cronKo, lastKo, stOf, sumOf, worstOf } from "./sched-bits";
import { RunnerTree } from "./sched-runners";
import { SchedTree } from "./sched-tree";   // 러너 = 노드 트리 하나(형 11-14 「스케줄러를 … 트리구조로」 · 「중첩되는 내용들은 카테고라이징해서 없애」 — 갈래 칩 다섯 · 목록 · 흐름 보기는 이 나무 하나로 합침)
import { SchedFlow } from "./sched-flow";   // 러너 갈래 흐름 그림(1단 · PC · 보기만 · 형 11-09 05:14 「러너 스케줄러이런식으로 변경」 · 봄 배분 19)
import { useWide } from "./side";   // PC 인가(폰은 목록 그대로 · 시아 05:17 ⑦)
import { GpuPanel } from "./sched-gpu";   // GPU 쓰는 일 · GPU 우선 서버(형 11-05 09:43 · 뜸)
import { Chev } from "./chev";   // 꺽쇠 하나(형 11-01)
import { Num, Times } from "./room-routine";   // 시간 고르기 부품 = 방 「루틴 만들기」와 같은 것
import "./room-routine.css";
import { BotPick } from "./bot-pick";   // 「어떤 봇」 = 부름 목록 꼴(형 11-02 02:24)
import { ReviewBadge, ReviewBox } from "./sched-review";   // 폐기 → 검토(형 11-02 02:1x · 봄 #2092)
import { CF_KO, type Routine, ST_KO, type SchedChange, type SchedFork, type SchedQ, type SchedSetRes, cfVal, cronShow, nextShort, useSched } from "./settings-extra";

// 조직도(형 11-01 17:4x 「스케줄러 있지. 그 내용이 지금 좀 투박해. 버튼 눌러도 동작하는지도 잘 모르겠구 … 엔터프라이즈급으로 동작했으면 좋겠어. 트리구조 조직도로」 · 「각 대화방하고 연동도 잘 되어야하고」)
//   뿌리 칸(켠 것 · 다음 깸 · 시계) → 포크 칸(켠 비율 막대) → 꼬챙이(상태 점) → 끝 ! 얼굴 · 맨 아래 「최근 바뀜」 = 누른 단추가 실제로 먹었는지(표에 들어감 ✓ · 시계 받음 · 바로 먹음)
//   대화방 포크 둘(roomtimer 방 루틴 · bell6 6마디 종) = 서버가 붙이는 가짜 포크 → 꼬챙이를 옮겨 넣는 칸에서 뺌
const VIRTUAL = new Set(["roomtimer", "bell6"]);
const ROOMISH: Record<string, string> = { roomtimer: "대화방", bell6: "대화방" };
const agoKo = (ts: number) => { const m = Math.round((Date.now() - ts) / 60e3); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };

const CRON_H = "CRON_TZ=Asia/Seoul ";
// 시간 고르기(형 11-02 02:23 「시간고르는게 저게 최선인가? 주기랑 시간 고르는 방식이 조금 선택 방식이 비효율이야 인터페이스가」) =
//   방 「루틴 만들기」(./room-routine.tsx)와 같은 꼴 — 요일 칩 + 「시각 고르기(목록)」 | 「몇 시간마다(시작~끝 · 분)」 · 빠른 칩 · 보낼 땐 cron 줄로(분이 다른 시각은 줄을 나눔)
//   그림으로 못 그리는 줄(날짜 박힌 한 번짜리 · 분마다 등)은 예전처럼 글자로
type Pick = { wd: number[]; mode: "times" | "every"; times: string[]; every: number; from: number; to: number; min: number };
const WDK = ["일", "월", "화", "수", "목", "금", "토"];
const two = (n: number) => String(n).padStart(2, "0");
const dowOf = (wd: number[]) => { const w = [...new Set(wd)].sort((a, b) => a - b); return w.length === 7 || !w.length ? "*" : w.join(",") === "1,2,3,4,5" ? "1-5" : w.join(",") === "0,6" ? "0,6" : w.join(","); };
const wdOf = (d: string): number[] | null => {
  if (d === "*") return [0, 1, 2, 3, 4, 5, 6];
  const out: number[] = [];
  for (const t of d.split(",")) { const m = t.match(/^(\d)(?:-(\d))?$/); if (!m) return null; for (let i = +m[1]; i <= (m[2] ? +m[2] : +m[1]); i++) out.push(i % 7); }
  return [...new Set(out)];
};
const readPick = (l?: string[]): Pick | null => {   // 고르기로 다 그릴 수 있는 줄만(같은 요일 · 날짜 없음 · 분 숫자)
  if (!l?.length) return null;
  let wd: number[] | null = null; const times: string[] = []; let every: Pick | null = null;
  for (const c of l) {
    const p = c.replace(CRON_H, "").trim().split(/\s+/);
    if (p.length !== 5 || !/^\d+$/.test(p[0]) || p[2] !== "*" || p[3] !== "*") return null;
    const w = wdOf(p[4]); if (!w || (wd && dowOf(wd) !== dowOf(w))) return null; wd = w;
    const st = p[1].match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
    if (st && l.length === 1) { every = { wd: w, mode: "every", times: [], every: st[3] ? +st[3] : 1, from: +st[1], to: +st[2], min: +p[0] }; continue; }
    for (const h of p[1].split(",")) { if (!/^\d+$/.test(h)) return null; times.push(`${two(+h)}:${two(+p[0])}`); }
  }
  if (every) return every;
  return { wd: wd!, mode: "times", times: [...new Set(times)].sort(), every: 3, from: 9, to: 21, min: 0 };
};
const pickCron = (k: Pick): string[] => {
  const d = dowOf(k.wd);
  if (k.mode === "every") return [`${CRON_H}${k.min} ${k.from}-${k.to}${k.every > 1 ? "/" + k.every : ""} * * ${d}`];
  const byMin = new Map<number, number[]>();
  for (const t of k.times) { const [h, m] = t.split(":").map(Number); byMin.set(m, [...(byMin.get(m) || []), h]); }
  return [...byMin.entries()].sort((a, b) => a[0] - b[0]).map(([m, hs]) => `${CRON_H}${m} ${[...new Set(hs)].sort((a, b) => a - b).join(",")} * * ${d}`);
};
const QUICK: { label: string; set: Partial<Pick> }[] = [
  { label: "매일 9시", set: { wd: [0, 1, 2, 3, 4, 5, 6], mode: "times", times: ["09:00"] } },
  { label: "평일 9시", set: { wd: [1, 2, 3, 4, 5], mode: "times", times: ["09:00"] } },
  { label: "하루 세 번", set: { wd: [0, 1, 2, 3, 4, 5, 6], mode: "times", times: ["11:00", "15:00", "19:00"] } },
  { label: "낮 3시간마다", set: { wd: [0, 1, 2, 3, 4, 5, 6], mode: "every", every: 3, from: 9, to: 21, min: 0 } },
];

function WhenPick({ r, can, busy, send }: { r: Routine; can: boolean; busy: boolean; send: (v: string[]) => void }) {
  const first = useMemo(() => readPick(r.cron), [r.cron]);
  const [k, setK] = useState<Pick | null>(first), [raw, setRaw] = useState(cronShow(r.cron));
  useEffect(() => { setK(first); setRaw(cronShow(r.cron)); }, [first, r.cron]);
  if (!r.cron?.length) return <small>부를 때만</small>;
  const dated = r.cron.some((c) => { const p = c.replace(CRON_H, "").trim().split(/\s+/); return p[2] !== "*" && p[3] !== "*"; });
  if (dated) return <small>{cronKo(r.cron)} 한 번</small>;
  if (!k) return (
    <label className="nm-sched-when">직접
      <input disabled={!can} value={raw} aria-label={`${r.name} 언제`} onChange={(e) => setRaw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(raw.split(";").map((x) => x.trim()).filter(Boolean).map((x) => CRON_H + x)); }} />
    </label>
  );
  const set = (x: Partial<Pick>) => setK({ ...k, ...x });
  const next = pickCron(k), changed = JSON.stringify(next) !== JSON.stringify(first ? pickCron(first) : r.cron), ok = k.wd.length > 0 && (k.mode === "every" ? k.from <= k.to : k.times.length > 0);
  return (
    <div className="nm-sched-pick">
      <div className="nm-rr-quick">{QUICK.map((q) => <button key={q.label} type="button" className="nm-rr-chip" disabled={!can} onClick={() => set(q.set)}>{q.label}</button>)}</div>
      <div className="nm-rr-wd" role="group" aria-label={`${r.name} 요일`}>
        {WDK.map((w, i) => <button key={w} type="button" aria-pressed={k.wd.includes(i)} className={`nm-rr-chip${k.wd.includes(i) ? " on" : ""}`} disabled={!can} onClick={() => set({ wd: k.wd.includes(i) ? k.wd.filter((x) => x !== i) : [...k.wd, i] })}>{w}</button>)}
      </div>
      <div className="nm-rr-seg" role="group" aria-label="주기">
        <button type="button" aria-pressed={k.mode === "times"} disabled={!can} onClick={() => set({ mode: "times", times: k.times.length ? k.times : ["09:00"] })}>시각 고르기</button>
        <button type="button" aria-pressed={k.mode === "every"} disabled={!can} onClick={() => set({ mode: "every" })}>몇 시간마다</button>
      </div>
      {k.mode === "times" ? <Times times={k.times} onChange={(times) => set({ times })} />
        : <div className="nm-rr-row"><Num label="몇 시간마다" value={k.every} lo={1} hi={12} onChange={(every) => set({ every })} /><span>시간마다 ·</span><Num label="시작 시" value={k.from} lo={0} hi={23} onChange={(from) => set({ from })} /><span>~</span><Num label="끝 시" value={k.to} lo={0} hi={23} onChange={(to) => set({ to })} /><span>시 ·</span><Num label="분" value={k.min} lo={0} hi={59} onChange={(min) => set({ min })} /><span>분</span></div>}
      {changed ? <div><small>{cronKo(next)}</small> <button type="button" className="nm-sched-go" disabled={busy || !ok || !can} onClick={() => send(next)}>미리 보기</button></div> : null}
    </div>
  );
}

export function SchedDesk() {
  const qc = useQueryClient(), s = useSched(), d = s.data, can = !!d?.can_set;
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [who, setWho] = useState(""), [openF, setOpenF] = useState(""), [openR, setOpenR] = useState(""), [tab, setTab] = useState("bot");
  const wide = useWide();
  const [view, setView] = useState<"list" | "flow">(() => { try { return localStorage.getItem("nm-sched-view") === "flow" ? "flow" : "list"; } catch { return "list"; } });   // 러너 갈래 보기 = 목록 ↔ 흐름 그림(PC · 폰 · 기기마다 기억 · 기본 = 목록)
  const pickView = (v: "list" | "flow") => { setView(v); try { localStorage.setItem("nm-sched-view", v); } catch { /* 못 남겨도 됨 */ } };
  const [ask, setAsk] = useState<{ q: SchedQ; r: SchedSetRes } | null>(null), [msg, setMsg] = useState("");
  // 바꾸기 진행(형 10-31 「전송 게이지 차고 체크 된 다음 버튼이 있고, 그 다음에 빙글빙글 쭉 하다가 체크 뜨면」) = 옛 에디터 .go 상태 계승 — fill 전송 · ok ✓ · wait 시계 기다림 · done ✓ · late 2분 넘음
  const [save, setSave] = useState<{ q: SchedQ; stage: "fill" | "ok" | "wait" | "done" | "late"; sha: string; t0?: number } | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => { setVals({}); }, [d?.sha]);
  const go = useMutation({
    mutationFn: ({ q, dry }: { q: SchedQ; dry: boolean }) => office<SchedSetRes>("schedule/set", { method: "POST", body: JSON.stringify({ at: q.at, key: q.key, field: q.field, value: q.value, sha: d?.sha, dry }) }),
    onMutate: ({ q, dry }) => { if (!dry) setSave({ q, stage: "fill", sha: "", t0: Date.now() }); },
    onSuccess: (r, { q, dry }) => {
      if (r.same) { setAsk(null); setSave(null); setMsg(`이미 ${cfVal(q.field, q.value)}이야`); return; }
      if (dry) { setAsk({ q, r }); setMsg(""); return; }
      const sha = String((r as { sha?: string }).sha || ""), wait = Math.max(0, 900 - (Date.now() - (save?.t0 || 0)));   // 게이지는 응답이 빨라도 끝까지 참(옛 에디터 900ms 리듬)
      setTimeout(() => setSave((s) => s && s.q.key === q.key ? { ...s, stage: "ok", sha } : s), wait);
      setMsg("");
      void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
    onError: (e) => {
      setAsk(null);
      setSave(null);
      const m = e instanceof Error ? e.message : String(e);
      setMsg(/changed/.test(m) ? "다른 데서 바뀌었어. 새 표를 읽었으니 다시 골라 줘" : m);
      if (/changed/.test(m)) void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
  });
  const prep = (q: SchedQ) => { setSave(null); go.mutate({ q, dry: true }); };
  const got = d?.clock_got as { got?: boolean; sha?: string } | undefined;
  useEffect(() => {
    if (save?.stage === "ok") { const t = setTimeout(() => setSave((s) => s && { ...s, stage: "wait" }), 700); return () => clearTimeout(t); }
    if (save?.stage === "wait") {
      const poll = setInterval(() => void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] }), 3000), late = setTimeout(() => setSave((s) => s && { ...s, stage: "late" }), 120_000);
      return () => { clearInterval(poll); clearTimeout(late); };
    }
    if (save?.stage === "done") { const t = setTimeout(() => { setSave(null); setAsk(null); }, 2600); return () => clearTimeout(t); }
    return undefined;
  }, [save?.stage, qc]);
  useEffect(() => { if (save?.stage === "wait" && got?.got && (!save.sha || got.sha === save.sha)) setSave((s) => s && { ...s, stage: "done" }); }, [save?.stage, save?.sha, got?.got, got?.sha]);
  if (!d) return <p className="p-6 text-sm text-muted-foreground">{s.isError ? s.error.message : "표 읽는 중"}</p>;
  const hasForks = !!d.forks?.length;
  const forks: SchedFork[] = hasForks ? d.forks! : [{ id: "", name: "아직 안 나눔", on: true }];
  const rsOf = (f: SchedFork) => d.routines.filter((r) => (hasForks ? r.fork === f.id : true) && (!who || r.bot === who));
  const botOf = (id: string) => d.bots.find((b) => b.bot === id);
  const sel = botOf(who);
  const face = (b?: { who: string }, size = 28) => { const p = list.find((x) => x.who === b?.who); return <MicOrb size={size} id={idOf(b?.who || "", list)} tint={ringOf(p)} />; };
  const nameOf = (b?: { who: string }) => list.find((x) => x.who === b?.who)?.name || b?.who || "";
  const rv = d.review || {}, whoKo = (w: string) => nameOf(botOf(w) || { who: w });
  const runnerTab = tab !== "bot" && tab !== "gpu" && !!d.runners, flow = view === "flow" && runnerTab, wideFlow = wide && (flow || tab === "tree");   // 흐름 그림 = 러너 갈래(PC · 폰 다 · 형 11-09 08:12 「모바일에서도」) · PC 흐름이면 판을 넓힘
  // 상태 점 셈(뜸 11-02 · 서버 health 칸 · 없으면 ○) — 봇 꼬챙이 = 포크·봇 차단기가 내려가면 꺼짐 · 러너 = 포크·잡 on 칸
  const fOff = (id?: string) => d.forks?.find((f) => f.id === id)?.on === false;
  const rSt = (r: Routine): HealthSt => stOf(r.health, r.state === "off" || fOff(r.fork) || botOf(r.bot)?.on === false);
  const jSt = (j: NonNullable<typeof d.runners>["jobs"][number]) => stOf(j.health, d.runners!.forks.find((f) => f.id === j.fork)?.on === false || j.on === false);
  const groupSts = (g: string): HealthSt[] => (g === "bot" ? d.routines.map(rSt) : (d.runners?.jobs || []).filter((j) => d.runners!.forks.find((f) => f.id === j.fork)?.group === g).map(jSt));
  const allSum = d.health_sum || sumOf([...d.routines.map(rSt), ...(d.runners?.jobs || []).map(jSt)]);   // 검토 칸 · 요청·책임자 이름(봇 id·사람 이름 둘 다)
  const nextAll = d.bots.reduce((m, b) => (b.on !== false && b.next_ts && (!m || b.next_ts < m) ? b.next_ts : m), 0);
  const labelOf = (c: SchedChange) => { const r = d.routines.find((x) => x.id === c.id), f = d.forks?.find((x) => x.id === c.id), b = botOf(c.id); return r ? `${r.bot ? nameOf(botOf(r.bot)) + " · " : ""}${r.name}` : f ? `포크 ${f.name}` : b ? nameOf(b) : c.id; };
  const say = (f: SchedQ["field"], v: unknown) => (f === "when" && Array.isArray(v) ? cronKo(v.map(String)) : f === "bot" ? nameOf(botOf(String(v)) || { who: String(v) }) : cfVal(f, v as never));   // 어떤 봇 = 이름(「gik」 아니라 「깃」)   // 언제 = 사람 말(cron 글자 안 보임)
  /** 바꾸기 확인·진행 = 누른 그 줄 바로 아래(형 10-31 「바로 그 창 아래에 떠야 안헷갈려가까이에」) */
  const bar = (key: string) => {
    const a = ask && ask.q.key === key ? ask : null, sv = save && save.q.key === key ? save : null;
    if (!a && !sv) return null;
    const tick = <svg className="gck" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4 10-10" /></svg>;
    return (
      <div className="nm-sched-ask" role={sv ? "status" : "alertdialog"} aria-label="바꾸기 전 확인">
        {a ? (
          <span className="min-w-0 flex-1">{a.q.label} {CF_KO[a.q.field]}: {a.r.from !== undefined ? <>{say(a.q.field, a.r.from)} <Chev dir="right" size={12} /> </> : null}<b>{say(a.q.field, a.r.to ?? a.q.value)}</b>
            {a.r.preview ? <small>다음 깸 {a.r.preview.next_at ? nextShort(a.r.preview.next_at) : "없음"} · 하루 {a.r.preview.day_max}번</small> : null}
          </span>
        ) : <span className="min-w-0 flex-1">{sv?.q.label}</span>}
        {!sv ? <button type="button" className="nm-sched-go" disabled={go.isPending} onClick={() => go.mutate({ q: a!.q, dry: false })}>바꾸기</button> : null}
        {!sv ? <button type="button" className="nm-sched-chip" onClick={() => setAsk(null)}>취소</button> : null}
        {sv?.stage === "fill" ? <span className="nm-sched-go firing">보내는 중</span> : null}
        {sv?.stage === "ok" ? <span className="nm-sched-go okdone" aria-label="저장됨">{tick}</span> : null}
        {sv?.stage === "wait" ? <span className="nm-sched-wait"><i className="nm-sched-spin" aria-hidden />시계 기다리는 중</span> : null}
        {sv?.stage === "done" ? <span className="nm-sched-go okdone">{tick}시계 받음</span> : null}
        {sv?.stage === "late" ? <button type="button" className="nm-sched-chip" onClick={() => { setSave(null); setAsk(null); }}>시계가 아직 안 받았어 · 닫기</button> : null}
      </div>
    );
  };
  return (
    <div className={`nm-sched nm-yeta mx-auto flex w-full ${wideFlow ? "max-w-[1180px]" : "max-w-2xl"} flex-col gap-3 px-3 pb-28 pt-1`}>
      {msg ? <p className="text-sm" role="status">{msg}</p> : null}
      <div className="nm-sum" role="status" aria-label="스케줄 상태 요약">   {/* 요약 띠(뜸 11-02 와이어 「●131 ▲6 ✕1 ○13 · 시계=새 표 받음」) · 형 「원활하게 다 미러링되는지」를 맨 위 한 줄로 */}
        <div className="nm-sum-n">{ST_ORDER.map((k) => <span key={k} title={HEALTH_KO[k]} data-st={k} data-zero={!allSum[k] || undefined}><StatusDot st={k} />{allSum[k]}</span>)}</div>
        <small>{got ? (got.got ? "시계 = 새 표 받음" : "시계 = 새 표 기다리는 중") : "시계 = 바뀐 것 없음"}{d.health_sum?.at ? ` · ${new Date(d.health_sum.at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" })} 기준` : " · 실제 실행은 아직 안 셈"}</small>
      </div>
      {d.runners?.jobs.length ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label="갈래">
          {[{ id: "bot", name: "봇" }, { id: "tree", name: "러너" }].map((g) => {
            const gs = sumOf(g.id === "tree" ? (d.runners?.jobs || []).map(jSt) : groupSts(g.id)), w = worstOf(gs), n = ST_ORDER.reduce((a, k) => a + gs[k], 0);
            return <button key={g.id} type="button" className="nm-sched-chip nm-gchip" aria-pressed={tab === g.id} onClick={() => setTab(g.id)}>{g.name} {n}<span data-st={w}><StatusDot st={w} />{w === "miss" ? gs.miss : w === "late" ? gs.late : ""}</span></button>;   // 갈래 건강 = 제일 나쁜 것 하나 + 그 수
          })}
          {d.gpu ? <button type="button" className="nm-sched-chip nm-gchip" aria-pressed={tab === "gpu"} onClick={() => setTab("gpu")}>GPU {d.gpu.jobs.length}</button> : null}   {/* GPU 쓰는 일만 따로(형 11-05 09:43) */}
        </div>
      ) : null}
      {tab === "gpu" && d.gpu ? <GpuPanel gpu={d.gpu} open={(id) => { const j = d.runners?.jobs.find((x) => x.id === id); const g = j && d.runners?.forks.find((f) => f.id === j.fork)?.group; if (g) setTab("tree"); }} /> : null}
      {tab === "tree" && d.runners ? <SchedTree map={d.runners} review={rv} phone={!wide} can={can} who={whoKo} /> : null}
      {runnerTab && tab !== "tree" && d.runners ? (flow ? <SchedFlow map={d.runners} group={tab} go={setTab} review={rv} phone={!wide} can={can} /> : <RunnerTree map={d.runners} group={tab} go={setTab} review={rv} can={can} who={whoKo} />) : null}
      {tab === "bot" ? <>
      <div className="nm-sched-faces" role="group" aria-label="봇 고르기">
        {d.bots.map((b) => (
          <button key={b.bot} type="button" aria-pressed={who === b.bot} data-off={b.on === false || undefined} onClick={() => setWho(who === b.bot ? "" : b.bot)}>
            {face(b, 44)}<span>{nameOf(b)}</span>
          </button>
        ))}
      </div>
      {sel ? (
        <div className="nm-sched-bot">
          <Breaker big on={sel.on !== false} label={`${nameOf(sel)} 차단기`} disabled={!can || !hasForks || go.isPending} onFlip={() => prep({ at: "bot", key: sel.bot, field: "on", value: sel.on === false, label: nameOf(sel) })} />
          <span className="min-w-0 flex-1"><b>{nameOf(sel)}</b><small>{sel.next_ts ? `다음 ${nextShort(sel.next_ts)}` : "다음 깸 없음"} · 하루 {sel.wakes.length}번</small></span>
        </div>
      ) : null}
      {sel ? bar(sel.bot) : null}
      <div className="nm-org-root" role="status" aria-label="스케줄 요약">
        <b>스케줄</b>
        <span><i className="nm-dot on" />켠 꼬챙이 {d.routines.filter((r) => r.state === "live").length} / {d.routines.length}</span>
        <span>다음 깸 {nextAll ? nextShort(nextAll) : "없음"}</span>
      </div>
      <ul className="nm-sched-tree nm-org">
        {forks.map((f) => {
          const rs = rsOf(f);
          if (who && !rs.length) return null;
          const fOn = f.on !== false, live = rs.filter((r) => r.state === "live").length, on = openF === f.id || !hasForks;
          return (
            <li key={f.id || "none"} className="nm-sched-fork" data-off={!fOn || undefined}>
              <div className="nm-sched-forkhead">
                <Breaker big on={fOn} label={`${f.name} 차단기`} disabled={!can || !hasForks || go.isPending} onFlip={() => prep({ at: "fork", key: f.id, field: "on", value: !fOn, label: f.name })} />
                <button type="button" aria-expanded={on} onClick={() => setOpenF(on ? "" : f.id)}>
                  <b>{ROOMISH[f.id] ? <em className="nm-org-tag">{ROOMISH[f.id]}</em> : null}{f.name}</b><small>꼬챙이 {rs.length} · 켠 것 {live}{(() => { const fs = sumOf(rs.map(rSt)); return `${fs.miss ? ` · 놓침 ${fs.miss}` : ""}${fs.late ? ` · 지연 ${fs.late}` : ""}`; })()}<i className="nm-org-meter" aria-hidden><i style={{ width: `${rs.length ? Math.round((live / rs.length) * 100) : 0}%` }} /></i></small>
                  <Chev dir={on ? "up" : "down"} size={16} />
                </button>
              </div>
              {bar(f.id)}
              {on ? (
                <ul className="nm-sched-tines">
                  {hasForks && can && !f.common && vals[`fork|${f.id}`] === undefined ? (
                    <li className="nm-sched-common"><button type="button" className="nm-sched-chip" onClick={() => setVals((v) => ({ ...v, [`fork|${f.id}`]: "" }))}>공통 내용 넣기</button></li>
                  ) : f.common || vals[`fork|${f.id}`] !== undefined ? (
                    <li className="nm-sched-common">
                      <label>공통 내용
                        <textarea rows={2} disabled={!can} value={vals[`fork|${f.id}`] ?? f.common ?? ""} onChange={(e) => setVals((v) => ({ ...v, [`fork|${f.id}`]: e.target.value }))}
                          onBlur={() => { const v = vals[`fork|${f.id}`]; if (v !== undefined && v !== (f.common ?? "")) prep({ at: "fork", key: f.id, field: "common", value: v, label: f.name }); }} />
                      </label>
                    </li>
                  ) : null}
                  {rs.map((r) => {
                    const room = r.id.startsWith("room.");   // 방 루틴(뎅 11-01 08:46 · 봇 없음 · 「종」이 그 방에 씀 · 시각은 방 「루틴 만들기」에서만) · 포크 이름으로 안 봄 = 표 「방 열기」(room · 결) 줄이 방 루틴으로 잘못 그려져 시간 칸이 숨던 것(뎅 11-01 17:5x)
                    const bell = r.id.startsWith("bell6.");   // 6마디 종(뎅 11-01 · 봄 서버 #2005 · 글 6개마다 형 키 · 표에선 켜고 끄기만)
                    const b = botOf(r.bot) || (room || bell ? { who: r.who } as ReturnType<typeof botOf> : undefined), live2 = r.state === "live", wide = openR === r.id, blocked = !fOn || b?.on === false;
                    return (
                      <li key={r.id} className="nm-sched-tine" data-off={!live2 || blocked || undefined}>
                        <div className="nm-sched-tinehead nm-row1">
                          <Breaker on={live2} dim={blocked} label={`${r.name} 차단기`} disabled={!can || go.isPending || r.state === "grok-stay"} onFlip={() => prep({ at: "routine", key: r.id, field: "state", value: live2 ? "off" : "live", label: `${b?.who} ${r.name}` })} />
                          <button type="button" aria-expanded={wide} onClick={() => setOpenR(wide ? "" : r.id)}>
                            <b><StatusDot st={rSt(r)} /><ReviewBadge r={rv[r.id]} />{r.name}{r.state !== "live" ? <em className="nm-org-st">{ST_KO[r.state] || r.state}</em> : null}</b><small>{r.cron?.length ? cronKo(r.cron) : r.when?.length ? r.when.join(" · ") : "부를 때만"}{blocked ? " · 위 차단기 내려감" : ""}</small>
                          </button>
                          <small className="nm-row1-last">{lastKo(r.health)}</small>
                          <span className="nm-sched-end" title={`끝 = ${nameOf(b)}를 깨우는 훅 하나`}>{face(b, 24)}</span>   {/* 「!」 글자 뺌(형 11-02 02:23 「그리구 ! 로 스케줄러에 표시떠있는 애들있는데 다 그러거든. 안뜨게 하던지 조치해야랄듯.」 · 줄마다 경고처럼 보였음) · 뜻은 title 에만 */}
                        </div>
                        {bar(r.id)}
                        {wide ? (
                          <div className="nm-sched-rt">
                            {bell || room || !r.health ? null : <small className="nm-row1-h" data-st={rSt(r)}>{HEALTH_KO[rSt(r)]}{r.health?.last_at ? ` · 마지막 실제 ${nextShort(r.health.last_at)}` : ""}{r.health?.drift_min ? ` · 예정보다 ${r.health.drift_min}분 늦음` : ""}{r.health?.missed ? ` · 놓침 ${r.health.missed}` : ""}</small>}
                            {bell || room ? null
                              : <WhenPick r={r} can={can} busy={go.isPending} send={(v) => prep({ at: "routine", key: r.id, field: "when", value: v, label: `${b?.who} ${r.name}` })} />}
                            {r.marks?.includes("time_in_text") ? <small className="nm-sched-warn">할 일 글 안에도 시각이 적혀 있어. 시간을 바꾸면 글도 같이 봐 줘</small> : null}
                            {r.marks?.includes("date_in_text") ? <small className="nm-sched-warn">할 일 글 안에 날짜가 있어. 지침엔 날짜를 빼 줘</small> : null}
                            {bell ? null : r.task !== undefined ? (
                              <label className="nm-sched-text">할 일
                                <textarea rows={5} disabled={!can} value={vals[`task|${r.id}`] ?? r.task} onChange={(e) => setVals((v) => ({ ...v, [`task|${r.id}`]: e.target.value }))}
                                  onBlur={() => { const v = vals[`task|${r.id}`]; if (v !== undefined && v !== r.task) prep({ at: "routine", key: r.id, field: "task", value: v, label: `${b?.who} ${r.name}` }); }} />
                              </label>
                            ) : null}
                            {hasForks && !bell && !room ? (
                              <div className="nm-sched-sel">
                                {r.marks?.includes("bot_bound") ? <div className="nm-sched-lbl">어떤 봇<b>{nameOf(b)}</b></div> : r.cron?.length ? <div className="nm-sched-lbl">어떤 봇<BotPick label="어떤 봇" value={r.bot} disabled={!can} onPick={(v) => prep({ at: "routine", key: r.id, field: "bot", value: v, label: r.name })}
                                  opts={d.bots.map((x) => ({ id: x.bot, name: nameOf(x), mark: list.find((p) => p.who === x.who)?.mark, face: face(x, 24), note: x.on === false ? "차단기 내려감" : x.next_ts ? `다음 깸 ${nextShort(x.next_ts)}` : "깰 일 없음" }))} /></div> : <div className="nm-sched-lbl">어떤 봇<b>{nameOf(b)}</b></div>}
                                <label>포크<select disabled={!can} value={r.fork} onChange={(e) => prep({ at: "routine", key: r.id, field: "fork", value: e.target.value, label: r.name })}>{d.forks!.filter((x) => !VIRTUAL.has(x.id)).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                              </div>
                            ) : null}
                            {bell ? null : <div className="flex flex-wrap gap-1" role="group" aria-label={`${r.name} 상태`}>
                              {Object.keys(ST_KO).filter((k) => (room ? k === "live" || k === "off" : k !== "grok-stay" || r.state === k)).map((k) => <button key={k} type="button" className="nm-sched-chip" aria-pressed={r.state === k} disabled={!can || go.isPending} onClick={() => prep({ at: "routine", key: r.id, field: "state", value: k, label: `${b?.who} ${r.name}` })}>{ST_KO[k]}</button>)}
                            </div>}
                            <ReviewBox id={r.id} r={rv[r.id]} can={can} who={whoKo} />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Changes list={d.changes || []} got={got} labelOf={labelOf} />
      </> : null}
      {can ? null : <p className="text-xs text-muted-foreground">바꾸기는 형 자리에서만 돼.</p>}
    </div>
  );
}

const RV_KO: Record<string, string> = { "": "없음", review: "검토 중", remove: "없애기 확정", change: "바꾼 뒤 원복", restore: "원복", done: "끝냄" };   // 검토 걸음(봄 _schedreview.js change.from·to)
/** 최근 바뀜 = 누른 단추가 실제로 먹었는지(형 「버튼 눌러도 동작하는지도 잘 모르겠구」) — 표 커밋 ✓(서버가 쓴 뒤 다시 읽어 그 칸 확인) · 맨 위 표 바꿈은 시계 받음까지 · 방 루틴·6마디 종 = 바로 먹음 */
function Changes({ list, got, labelOf }: { list: SchedChange[]; got?: { got?: boolean; sha?: string }; labelOf: (c: SchedChange) => string }) {
  if (!list.length) return null;
  const head = list.find((c) => !c.live);
  const v = (x: unknown) => (Array.isArray(x) ? cronKo(x.map(String)) || "없음" : typeof x === "boolean" ? (x ? "켬" : "끔") : typeof x === "string" ? (ST_KO[x] || (x.length > 24 ? x.slice(0, 24) + "…" : x)) : x == null ? "없음" : String(x));
  return (
    <section className="nm-org-log" aria-label="최근 바뀜">
      <h3>최근 바뀜</h3>
      <ol>
        {list.slice(0, 8).map((c, i) => (
          <li key={`${c.at}-${i}`}>
            <span className="min-w-0 flex-1"><b>{labelOf(c)}</b><small>{c.review === "note" ? <>같이 멈추는 것 「{c.note}」</> : c.review ? <>검토 {RV_KO[String(c.from ?? "")] ?? String(c.from)} <Chev dir="right" size={11} /> {RV_KO[String(c.to ?? "")] ?? String(c.to)}</> : <>{CF_KO[c.field as SchedQ["field"]] || c.field || "상태"} {v(c.from)} <Chev dir="right" size={11} /> {v(c.to)}</>} · {c.who} · {agoKo(c.at)}</small></span>
            <em data-k={c.live ? "live" : c === head ? (got?.got ? "got" : "wait") : "ok"}>{c.live ? "바로 먹음" : c === head ? (got?.got ? "시계 받음" : "시계 기다림") : "표에 들어감"}</em>
          </li>
        ))}
      </ol>
    </section>
  );
}
