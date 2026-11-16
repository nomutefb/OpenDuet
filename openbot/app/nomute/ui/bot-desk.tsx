// 서랍 「봇 현황」(형 11-14 클라우드 세션 창 「아까 했던 봇들 상태 일 우선순위 이거는 서랍에 한 공간이 보여야함. 관련 잇는거랑.」 · 「누가 쉰다 이런개념이 아니라 도표 느낌으루」)
//   폰에서 보기 쉽게 다시 짬(형 11-15 05:3x 폰 사진 「이거 모바일에서 보기 쉽게 구현해줘」 + 본보기 영상 넷 = 카드와 이음선 · 차례로 그려지는 흐름도 · 알약 탭 · 세로 줄을 따라 단계가 나타나는 진행 표시):
//     · 옆으로 미는 표 0 — 한 화면 폭 안에서 위에서 아래로 읽음
//     · 흐름 = PM 카드 → 세로 줄 → 묶음(멈춤 · 일하는 중 · 노는 손 · 차례 밖 · 조용) → 봇 카드 + 맡은 일 · 멈춤 = 빨간 줄 · 일하는 중 = 라임 줄
//     · 차례 = 분류마다 한 줄(지금 1번) · 누르면 그 분류 차례가 펼쳐짐(9칸 표 대신)
//     · 손 표 = 봇마다 카드(특기 · 하드웨어 · 비고)
//   자료 = GET status/bots 의 table 한 번 · 60초마다(묵은 답이면 8초 뒤 다시) · 판정 · 차례 셈은 서버 것(./bot-desk-logic.ts = 묶음 · 칸 글만)
//   움직임 = 처음 뜰 때 한 번 차례로 떠오름(위치 · 투명도만 · 60프레임 · 줄이기 설정이면 0)
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { idOf, office } from "../data/office";
import { FaceImg, usePeople } from "./faces";
import StatusMark, { type StatusMarkStatus } from "../vendor/react-bits/StatusMark/StatusMark";   // 상태 표시 = react-bits 원본 그대로(형 「카피하지말고 가져다 써」 · 60프레임 · 줄이기 설정을 스스로 따름)
import RubberSegment from "../vendor/react-bits/RubberSegment/RubberSegment";   // 알약 탭 = react-bits 원본 그대로
import { ThinkingOrb } from "thinking-orbs";   // 점 구슬 = 앱이 이미 쓰는 원본 꾸러미 그대로(대화 「생각중」 · ./live-shine.tsx 와 같은 것 · 형 11-15 「에디터에 따로 들어잇는곳 … 코드카피해서 쓰셈」)
import { useTheme } from "@/components/theme-provider";
import { LiveShine } from "./live-shine";   // 빛 지나가는 글자 = 앱 것 그대로
import { type BotRow, type BotTable, countOf, flowOf, hmKo, isSpecial, jobCount, jobLine, jobsOf, markOf, mixOf, orbOf, roleLabel, roleOf, tailOf, turnList } from "./bot-desk-logic";
import { BotInbox } from "./bot-inbox";   // 「보드」 = 일감마다 카드 · 세 칸(형 11-16 영상 「Agent inbox」)
const StatusBoard = lazy(() => import("./status-board").then((m) => ({ default: m.StatusBoard })));   // ③ 러너 층 = 작동 표(겹치는 활동 판만 뺌 · 보일 때 받음)
const SchedDesk = lazy(() => import("./sched-desk").then((m) => ({ default: m.SchedDesk })));   // ② 스케줄 배선 층(보일 때 받음)
const VmDesk = lazy(() => import("./vm-desk").then((m) => ({ default: m.VmDesk })));   // ① 애들 층 「몸」 탭 = 애들 한 줄씩(상태 · 특기 · 하드웨어 · 램 · ./vm-desk.tsx)
import { HandBoard } from "./bot-desk-hands";   // 맨 위 카드 = 활동 신호 판을 맡길 차례로(노는 손 먼저 · 1특기 · PM 뺌)
import "./status-board.css";
import "./bot-desk.css";

type Sheet = { at?: number; stale?: boolean; table?: BotTable; skills?: Record<string, string> };
type Tab = "board" | "turn" | "body";
const TABS: [Tab, string][] = [["board", "일감"], ["turn", "차례"], ["body", "몸"]];   // 흐름 = 맨 위 손 판이 조직 그림이 되며 걷음 · 손 표 = 몸 줄에 같은 내용이 있어 걷음(형 11-16 19:2x 구름 맥 창 「손표를 몸 상태에 합치고 중첩되는건 없애자.」 · 「흐름의 조직 구성 느낌을 가장 메인에 좀 더 붙일 수 있나? 그럼 흐름으로 따로 안 만들어도 될거같은디」) · 몸 = 옛 「몸 상태」 화면 · 옛 「작동」 탭은 맨 아래 ③ 러너 층으로
// 5번 메뉴 「애들」 한 화면(형 18:2x 「5번이 애들 상태 관련」 · 「이렇게 쭉 유기적으로 연결된 느낌을 살리는게」) = 위에서 아래로 ① 애들 → ② 스케줄 배선 → ③ 러너 · 층 사이 = 왼쪽 세로 줄기 + 마디 점(가만한 그림)
//   아래 두 층은 첫 화면 뒤 한가할 때 받아 그림(첫 화면 무게 · 가만한 층은 그릴 것 0) · 옛 길 #/sched · #/runner = 그 층으로 내려감 · #/vm = 「몸」 탭
const SECS = [["crew", "애들"], ["sched", "스케줄 배선"], ["run", "러너"]] as const;
type Sec = (typeof SECS)[number][0];
const secOfHash = (h: string): Sec | "" => (/^#\/sched(?:[/?]|$)/.test(h) ? "sched" : /^#\/runner(?:[/?]|$)/.test(h) ? "run" : "");
/** 아래 층 자리 — 첫 화면(애들 층)이 그려진 뒤 한가할 때 받아 그림(wait ms 뒤) · 그 전에 화면에 들어오면 바로 · 켜진 뒤엔 그대로 둠
 *  (화면에 가까울 때만 켜는 길은 못 씀 = 처음엔 위 층이 아직 비어 있어 아래 층이 다 화면 안에 들어와 한꺼번에 켜졌음 · 실물 11-16) */
function Near({ children, min, wait }: { children: ReactNode; min: number; wait: number }) {
  const ref = useRef<HTMLDivElement>(null), [on, setOn] = useState(false);
  useEffect(() => {
    if (on) return undefined;
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const t = window.setTimeout(() => (idle ? idle(() => setOn(true), { timeout: 1500 }) : setOn(true)), wait);
    const el = ref.current, io = el && typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting && e.boundingClientRect.top > 200)) setOn(true); }) : null;   // 스크롤로 내려와 닿으면 바로(처음 비어 있을 때 맨 위에 붙어 있는 건 안 침)
    if (el && io) io.observe(el);
    return () => { window.clearTimeout(t); io?.disconnect(); };
  }, [on, wait]);
  return <div ref={ref} style={on ? undefined : { minHeight: min }}>{on ? <Suspense fallback={<p className="nsb-empty">읽는 중…</p>}>{children}</Suspense> : null}</div>;
}
const delay = (i: number) => ({ "--i": Math.min(i, 24) } as CSSProperties);

const MARK = { color: "currentColor", doneColor: "var(--nsb-ok)", errorColor: "var(--nsb-red)" } as const;

/** 접고 펴는 화살표 = 선 그림 하나(글자 ▾ 대신) · 펴면 반 바퀴(transform 만). */
const Chev = () => <svg className="chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
/** 끝낸 몫 고리 = 한 바퀴 가운데 끝낸 만큼(stroke-dashoffset 만 움직임). */
function Ring({ done, total }: { done: number; total: number }) {
  return (
    <svg className="ring" viewBox="0 0 20 20" width="18" height="18" aria-hidden>
      <circle cx="10" cy="10" r="7" className="bg" />
      <circle cx="10" cy="10" r="7" className="fg" pathLength={1} strokeDasharray="1" strokeDashoffset={total ? 1 - done / total : 1} transform="rotate(-90 10 10)" />
    </svg>
  );
}

/** 봇 카드 = 유리 판 · 머리(얼굴 · 이름 · 상태: 구슬 + 빛 글자 + 마지막 손) + 오늘 오더 줄(도는 표시 → 체크 + 취소선 · 끝낸 몫 고리 n/m) · 누르면 접고 폄. */
function BotCard({ r, now, i, list }: { r: BotRow; now: number; i: number; list: ReturnType<typeof usePeople> }) {
  const { resolved } = useTheme();
  const jobs = jobsOf(r), n = jobCount(jobs), orb = orbOf(r), working = r.lane === "work", tail = tailOf(r, now);
  const [open, setOpen] = useState(() => jobs.some((j) => !j.done));   // 안 끝낸 오더가 있으면 펴 둠 · 다 끝냈으면 접어 둠
  const head = (
    <>
      <span className="face"><FaceImg id={idOf(r.who, list)} size={36} /></span>
      <span className="who">
        <span className="name"><b>{r.who}</b>{r.pm ? <span className="tag">PM</span> : null}{r.rest ? <span className="tag">쉼 지정</span> : null}</span>
        <span className="st">
          <span className="ic">{orb ? <ThinkingOrb state={orb} size={20} theme={resolved} /> : <StatusMark status={markOf(r) as StatusMarkStatus} size={15} strokeWidth={2.4} {...MARK} />}</span>
          {working ? <LiveShine text={r.state} sig /> : <span className="word">{r.state}</span>}
          {tail ? <span className="tail">{tail}</span> : null}
        </span>
      </span>
      {n.total ? <span className={`cnt${n.all ? " all" : ""}`}><Ring done={n.done} total={n.total} /><span>{n.all ? "다 끝냄" : `${n.done}/${n.total}`}</span></span> : null}
      {jobs.length ? <Chev /> : null}
    </>
  );
  return (
    <li className={`nm-bd-bot l-${r.lane}${open && jobs.length ? " open" : ""}`} style={delay(i)}>
      {jobs.length ? <button type="button" className="head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{head}</button> : <div className="head">{head}</div>}
      {r.lane === "lost" && r.why ? <p className="why">{r.why}</p> : null}
      {jobs.length ? (
        <div className="fold" aria-hidden={!open}>
          <ul className="jobs">
            {jobs.map((j) => { const l = jobLine(j, working, now); return (
              <li key={j.no} className={`nm-bd-job s-${l.status}${l.ride ? " ride" : ""}`} title={l.text}>
                <StatusMark status={l.status} label={<><span className="no">{j.no}</span>{j.title ? ` ${j.title}` : ""}</>} size={14} strokeWidth={2.4} fontSize={13} {...MARK} />
                {j.code ? <span className="code">{j.code}</span> : null}
                {l.side ? <small>{l.side}</small> : null}
              </li>
            ); })}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function Turns({ t, skills }: { t: BotTable; skills: Record<string, string> }) {
  const [open, setOpen] = useState(""), list = usePeople();
  return (
    <div className="nm-bd-turns">
      {t.codes.map((c, i) => {
        const f = t.first?.[c], l = turnList(t.rows, c), on = open === c, good = !!f && !f.busy && !!f.rank;
        return (
          <section key={c} className={`nm-bd-turn${on ? " open" : ""}`} style={delay(i)}>
            <button type="button" aria-expanded={on} onClick={() => setOpen((o) => (o === c ? "" : c))}>
              <span className="code">{c}</span><span className="nm">{skills[c] || ""}</span>
              {f ? <span className={`first ${good ? "t-ok" : "t-dim"}`}><span className="face"><FaceImg id={idOf(f.who, list)} size={22} /></span><b>{f.who}</b>{!f.rank || f.busy ? <small>{[f.rank ? "" : "특기 밖", f.busy ? "일하는 중" : ""].filter(Boolean).join(" · ")}</small> : null}</span> : <span className="first t-dim">맡길 손 없음</span>}
              <Chev />
            </button>
            <div className="fold" aria-hidden={!on}>
              <ol>
                {l.order.map((o) => <li key={o.who} className={o.busy || !o.rank ? "t-dim" : o.n === 1 ? "t-ok" : ""}><span className="n">{o.n}</span><b>{o.who}</b><small>{o.rank ? `${o.rank}특기` : "특기 밖"}{o.busy ? " · 일하는 중" : ""}</small></li>)}
                {l.out.length ? <li className="out t-dim">못 맡김 — {l.out.map((o) => `${o.who}(${o.why})`).join(" · ")}</li> : null}
              </ol>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** 몸 한 줄(램 · CPU · GPU · OS) — 고른 애 펼침 밑 */
const hwOf = (r: BotRow) => [r.hw?.ram && r.hw.ram !== "-" ? `램 ${r.hw.ram}` : "", r.hw?.cpu && r.hw.cpu !== "-" ? r.hw.cpu : "", r.hw?.gpu && r.hw.gpu !== "없음" ? `GPU ${r.hw.gpu}` : "", r.hw?.os].filter(Boolean).join(" · ");

export function BotDesk() {
  const q = useQuery({ queryKey: ["nomute", "bots-sheet"], queryFn: () => office<Sheet>("status/bots"), refetchInterval: (x) => (x.state.data?.stale || !(x.state.data?.table?.rows || []).some((r) => r.lane !== "none") ? 8_000 : 60_000), staleTime: 5_000, retry: false });   // 묵은 답 · 활동 줄을 못 읽은 답(서버가 뒤에서 세는 중)이면 8초 뒤 다시 = 곧 새 표
  const [tab, setTab] = useState<Tab>(() => { if (typeof location !== "undefined" && /^#\/vm(?:[/?]|$)/.test(location.hash)) return "body";   // 옛 「몸 상태」 길로 왔으면 몸 탭부터(이번만 · 고른 탭 기억은 그대로)
    try { const v = localStorage.getItem("nm-botdesk-tab"); return v === "turn" || v === "body" ? v : "board"; } catch { return "board"; } });
  const secs = useRef<Partial<Record<Sec, HTMLElement | null>>>({});
  const goSec = (k: Sec, smooth = true) => { const el = secs.current[k]; if (el) el.scrollIntoView({ block: "start", behavior: smooth && !(typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) ? "smooth" : "auto" }); };
  useEffect(() => {   // 옛 길(#/sched · #/runner)로 들어오거나 메뉴 판에서 그 줄을 누르면 그 층으로 · #/vm = 몸 탭
    let touched = false, ts: number[] = [];
    const hand = () => { touched = true; }, evs = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    evs.forEach((e) => addEventListener(e, hand, { passive: true, capture: true }));
    const on = (first: boolean) => {
      const h = location.hash, k = secOfHash(h);
      if (k && first) ts = [350, 1300, 2800, 4800].map((ms) => window.setTimeout(() => { if (!touched) goSec(k, false); }, ms));   // 처음 = 위 층이 차면서 자리가 밀리니 손이 닿기 전까지 몇 번 다시 맞춤(바로 옮김 = 미끄러짐 없음)
      else if (k) goSec(k);
      else if (/^#\/vm(?:[/?]|$)/.test(h)) { setTab("body"); if (!first) goSec("crew"); }
    };
    on(true); const hc = () => on(false); addEventListener("hashchange", hc);
    return () => { removeEventListener("hashchange", hc); evs.forEach((e) => removeEventListener(e, hand, { capture: true })); ts.forEach((t) => window.clearTimeout(t)); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (v: Tab) => { setTab(v); try { localStorage.setItem("nm-botdesk-tab", v); } catch { /* 이번만 */ } };
  const t = q.data?.table, skills = q.data?.skills || {}, rows = t?.rows || [], now = Date.now();
  const crew = rows.filter((r) => !r.pm), n = countOf(crew);   // 맨 위 카드 = PM 뺀 손(형 11-15 「PM은 제외해서」 · PM 은 바로 밑 흐름 맨 위 카드에)
  const people = usePeople(), mix = mixOf(crew);
  const [sel, setSel] = useState(""), pm = rows.find((r) => r.pm), picked = sel ? rows.find((r) => r.who === sel) : undefined, orders = rows.reduce((n, r) => n + (r.open?.length || 0), 0);
  const gen = flowOf(crew.filter((r) => !isSpecial(r)));   // 머리 숫자 = 특수 직군 뺀 손(아래 손 판의 「일하는 중」 · 「노는 손」 칸과 같은 셈 · 특수는 제 칸에)
  const live = rows.some((r) => r.lane !== "none"), idle = gen.find((g) => g.group === "idle")?.rows || [], working = gen.find((g) => g.group === "work")?.rows || [];
  return (
    <div className="nm-crew">
    <nav className="nm-crew-jump mx-auto w-full max-w-3xl px-4" aria-label="이 화면의 층">{SECS.map(([k, name], i) => <button key={k} type="button" className="nm-sched-chip" onClick={() => goSec(k)}>{i + 1} {name}</button>)}</nav>
    <section className="nm-crew-sec first" ref={(el) => { secs.current.crew = el; }} aria-label="애들">
    <div className="nsb nm-botdesk mx-auto w-full max-w-3xl px-4 pt-3 pb-4">
      <h1 className="sr-only">애들</h1>
      <div className="nm-bd-head" role="status">
        <p className="big">{q.isPending ? <span className="t-dim">읽는 중…</span> : q.isError ? <span className="t-lost">못 읽음</span> : !live ? <span className="t-dim">지금 세는 중</span> : <>일하는 중 <b>{working.length}</b><span className="also">노는 손 <b>{idle.length}</b></span></>}   {/* 일하는 중이 먼저(형 11-16 17:5x 「일하는 중이 더 우선적으로 보여야 함」 · 앞 판 = 노는 손만) */}
          <span className="side">{n.lost ? <span className="badge">멈춤 {n.lost}</span> : null}{q.data?.at ? <span className="at">{hmKo(q.data.at)}{q.data.stale ? " · 묵은 것" : ""}</span> : null}</span>
        </p>
        {q.data && live ? (
          <>
            <div className="mix" aria-hidden>{mix.map((m) => <i key={m.group} className={`g-${m.group}`} style={{ flexGrow: m.n }} />)}</div>
            {pm ? (
              <button type="button" className="nm-bd-org-pm" aria-pressed={sel === pm.who} onClick={() => setSel((w) => (w === pm.who ? "" : pm.who))}>   {/* 조직 그림의 뿌리 = PM(누르면 PM 것 펼침) */}
                <span className="face"><FaceImg id={idOf(pm.who, people)} size={36} /></span>
                <b>{pm.who}</b><span className="sk">{roleLabel(pm.skills, pm.who) || "PM"}</span>{orders ? <em className="job">오더 {orders}</em> : null}
              </button>
            ) : null}
            {(t?.late || []).map((o) => <p key={o.no} className="nm-bd-late">{o.no} {o.who} — 부른 지 {o.min}분, 받음 없음</p>)}
            <HandBoard rows={crew} skills={skills} people={people} sel={sel} onPick={(w) => setSel((x) => (x === w ? "" : w))} />
            {picked ? (
              <div className="nm-bd-org-one" aria-label={`${picked.who} 자세히`}>   {/* 얼굴을 누르면 그 애 것만(상태 · 맡은 일 줄 = 옛 흐름 카드 · 특기 · 몸 한 줄) */}
                <ul><BotCard key={picked.who} r={picked} now={now} i={0} list={people} /></ul>
                <p className="more">{(picked.skills || []).map((c, k) => <span key={c} className={k ? undefined : "first"} title={skills[c] || c}>{roleOf(c, k > 0) || skills[c] || c}</span>)}{hwOf(picked) ? <small>{hwOf(picked)}</small> : null}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      {q.isError ? <p className="nsb-why">봇 현황을 못 읽었어 — {(q.error as Error)?.message || "서버 답 없음"} <button type="button" className="nm-sched-chip" onClick={() => void q.refetch()}>다시</button></p> : null}
      {q.data && !t ? <p className="nsb-empty">서버가 아직 도표를 안 줘(옛 판) — 잠깐 뒤 다시 열어 줘</p> : null}

      <div className="nm-bd-tabs" aria-label="봇 현황 보기">
        <RubberSegment items={TABS.map(([value, label]) => ({ value, label }))} value={tab} onChange={(v) => pick(v as Tab)} size="lg" radius={14} trackColor="rgba(18,18,18,.55)" thumbColor="rgba(207,255,64,.9)" textColor="#E7ECE7" activeTextColor="#141516" />
      </div>
      {tab === "body" || !t ? null : tab === "board" ? (live ? <BotInbox t={t} skills={skills} now={now} focus={sel} /> : <p className="nsb-empty">활동 줄을 지금 못 읽었어 — 곧 다시 읽어</p>) : tab === "turn" ? (live && t.codes.length ? <Turns t={t} skills={skills} /> : <p className="nsb-empty">차례를 지금 못 셌어 — 곧 다시 읽어</p>) : null}

    </div>
    {tab === "body" ? <div className="mx-auto w-full max-w-6xl"><Suspense fallback={<p className="nsb-empty">읽는 중…</p>}><VmDesk /></Suspense></div> : null}   {/* 몸 = 손 판 폭(좁음) 밖 · 제 폭(넓음)으로 — 램 띠가 넓은 화면을 다 씀 */}
    </section>
    <section className="nm-crew-sec" ref={(el) => { secs.current.sched = el; }} aria-label="스케줄 배선">
      <h2 className="nm-crew-h mx-auto w-full max-w-6xl px-4"><i aria-hidden />스케줄 배선</h2>
      <Near min={420} wait={900}><SchedDesk /></Near>
    </section>
    <section className="nm-crew-sec" ref={(el) => { secs.current.run = el; }} aria-label="러너">
      <h2 className="nm-crew-h mx-auto w-full max-w-6xl px-4"><i aria-hidden />러너</h2>
      <Near min={420} wait={1700}><StatusBoard bare /></Near>   {/* 작동 표 = 제 폭(넓음) · 겹치는 「활동」 판만 뺌(./status-board.tsx bare) */}
    </section>
    </div>
  );
}
