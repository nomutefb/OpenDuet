// 서랍 「봇 현황」(형 11-14 클라우드 세션 창 「아까 했던 봇들 상태 일 우선순위 이거는 서랍에 한 공간이 보여야함. 관련 잇는거랑.」 · 「누가 쉰다 이런개념이 아니라 도표 느낌으루」)
//   폰에서 보기 쉽게 다시 짬(형 11-15 05:3x 폰 사진 「이거 모바일에서 보기 쉽게 구현해줘」 + 본보기 영상 넷 = 카드와 이음선 · 차례로 그려지는 흐름도 · 알약 탭 · 세로 줄을 따라 단계가 나타나는 진행 표시):
//     · 옆으로 미는 표 0 — 한 화면 폭 안에서 위에서 아래로 읽음
//     · 흐름 = PM 카드 → 세로 줄 → 묶음(멈춤 · 일하는 중 · 노는 손 · 차례 밖 · 조용) → 봇 카드 + 맡은 일 · 멈춤 = 빨간 줄 · 일하는 중 = 라임 줄
//     · 차례 = 분류마다 한 줄(지금 1번) · 누르면 그 분류 차례가 펼쳐짐(9칸 표 대신)
//     · 손 표 = 봇마다 카드(특기 · 하드웨어 · 비고)
//   자료 = GET status/bots 의 table 한 번 · 60초마다(묵은 답이면 8초 뒤 다시) · 판정 · 차례 셈은 서버 것(./bot-desk-logic.ts = 묶음 · 칸 글만)
//   움직임 = 처음 뜰 때 한 번 차례로 떠오름(위치 · 투명도만 · 60프레임 · 줄이기 설정이면 0)
import { useQuery } from "@tanstack/react-query";
import { useState, type CSSProperties } from "react";
import { idOf, office } from "../data/office";
import { FaceImg, usePeople } from "./faces";
import StatusMark, { type StatusMarkStatus } from "../vendor/react-bits/StatusMark/StatusMark";   // 상태 표시 = react-bits 원본 그대로(형 「카피하지말고 가져다 써」 · 60프레임 · 줄이기 설정을 스스로 따름)
import RubberSegment from "../vendor/react-bits/RubberSegment/RubberSegment";   // 알약 탭 = react-bits 원본 그대로
import { ThinkingOrb } from "thinking-orbs";   // 점 구슬 = 앱이 이미 쓰는 원본 꾸러미 그대로(대화 「생각중」 · ./live-shine.tsx 와 같은 것 · 형 11-15 「에디터에 따로 들어잇는곳 … 코드카피해서 쓰셈」)
import { useTheme } from "@/components/theme-provider";
import { LiveShine } from "./live-shine";   // 빛 지나가는 글자 = 앱 것 그대로
import { type BotRow, type BotTable, GROUP_KO, countOf, flowOf, hmKo, jobCount, jobLine, jobsOf, markOf, mixOf, orbOf, tailOf, turnList, wireTone } from "./bot-desk-logic";
import { BotInbox } from "./bot-inbox";   // 「보드」 = 일감마다 카드 · 세 칸(형 11-16 영상 「Agent inbox」)
import { HandBoard } from "./bot-desk-hands";   // 맨 위 카드 = 활동 신호 판을 맡길 차례로(노는 손 먼저 · 1특기 · PM 뺌)
import "./status-board.css";
import "./bot-desk.css";

type Sheet = { at?: number; stale?: boolean; table?: BotTable; skills?: Record<string, string> };
type Tab = "board" | "flow" | "turn" | "hands";
const TABS: [Tab, string][] = [["board", "일감"], ["flow", "흐름"], ["turn", "차례"], ["hands", "손 표"]];   // 일감 = 카드 세 칸(./bot-inbox · 형 11-16 영상) · 처음 여는 손 = 일감 · 그 안에서 보드 ↔ 목록
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

function Flow({ t, now, pmName }: { t: BotTable; now: number; pmName: string }) {
  const list = usePeople(), groups = flowOf(t.rows), orders = t.rows.reduce((n, r) => n + (r.open?.length || 0), 0), { resolved } = useTheme();
  let i = 0;
  return (
    <div className="nm-bd-flow">
      <div className="nm-bd-pm" style={delay(i++)}>
        <span className="face">{pmName ? <FaceImg id={idOf(pmName, list)} size={36} /> : null}</span>
        <div className="who"><p className="name"><b>{pmName || "PM 없음"}</b><span className="tag">PM</span></p><p className="meta">일 나누는 자리 · 지금 맡겨 둔 오더 {orders}건</p></div>
        {pmName ? <ThinkingOrb state="composing" size={32} theme={resolved} /> : null}
      </div>
      {(t.late || []).map((o) => <p key={o.no} className="nm-bd-late" style={delay(i++)}>{o.no} {o.who} — 부른 지 {o.min}분, 받음 없음</p>)}
      <div className="nm-bd-tree">
        {groups.map((g) => (
          <section key={g.group} className={`nm-bd-grp w-${wireTone(g.group)}`} aria-label={GROUP_KO[g.group]}>
            <h3 style={delay(i++)}><i aria-hidden />{GROUP_KO[g.group]} <span>{g.rows.length}</span></h3>
            <ul>{g.rows.map((r) => <BotCard key={r.who} r={r} now={now} i={i++} list={list} />)}</ul>
          </section>
        ))}
      </div>
    </div>
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
      <p className="legend">차례 = 쉬는 손 먼저 · 그 가운데 잘하는 순 · 일하는 손은 맨 뒤 · D 는 개발 일감</p>
    </div>
  );
}

function Hands({ t, skills }: { t: BotTable; skills: Record<string, string> }) {
  const list = usePeople();
  return (
    <div className="nm-bd-hands">
      <ul>
        {t.rows.filter((r) => (r.skills || []).length || r.note || r.hw?.os).map((r, i) => (
          <li key={r.who} className="nm-bd-hand" style={delay(i)}>
            <span className="face"><FaceImg id={idOf(r.who, list)} size={36} /></span>
            <div className="body">
              <p className="name"><b>{r.who}</b>{(r.skills || []).map((c, k) => <span key={c} className={`sk${k === 0 ? " first" : ""}`} title={skills[c] || c}>{k === 0 && skills[c] ? `${c} ${skills[c]}` : c}</span>)}</p>
              <p className="meta">{[r.hw?.ram, r.hw?.cpu, r.hw?.gpu && r.hw.gpu !== "없음" ? `GPU ${r.hw.gpu}` : "", r.hw?.os].filter(Boolean).join(" · ") || "–"}</p>
              {r.note ? <p className="note">{r.note}</p> : null}
            </div>
          </li>
        ))}
      </ul>
      {Object.keys(skills).length ? <p className="legend">특기 = 잘하는 차례(왼쪽이 1특기) · {Object.entries(skills).map(([c, name]) => `${c} ${name}`).join(" · ")}</p> : null}
    </div>
  );
}

export function BotDesk() {
  const q = useQuery({ queryKey: ["nomute", "bots-sheet"], queryFn: () => office<Sheet>("status/bots"), refetchInterval: (x) => (x.state.data?.stale || !(x.state.data?.table?.rows || []).some((r) => r.lane !== "none") ? 8_000 : 60_000), staleTime: 5_000, retry: false });   // 묵은 답 · 활동 줄을 못 읽은 답(서버가 뒤에서 세는 중)이면 8초 뒤 다시 = 곧 새 표
  const [tab, setTab] = useState<Tab>(() => { try { const v = localStorage.getItem("nm-botdesk-tab"); return v === "flow" || v === "turn" || v === "hands" ? v : "board"; } catch { return "board"; } });
  const pick = (v: Tab) => { setTab(v); try { localStorage.setItem("nm-botdesk-tab", v); } catch { /* 이번만 */ } };
  const t = q.data?.table, skills = q.data?.skills || {}, rows = t?.rows || [], now = Date.now();
  const crew = rows.filter((r) => !r.pm), n = countOf(crew);   // 맨 위 카드 = PM 뺀 손(형 11-15 「PM은 제외해서」 · PM 은 바로 밑 흐름 맨 위 카드에)
  const people = usePeople(), mix = mixOf(crew);
  const live = rows.some((r) => r.lane !== "none"), idle = flowOf(crew).find((g) => g.group === "idle")?.rows || [], pmName = rows.find((r) => r.pm)?.who || "";
  return (
    <div className="nsb nm-botdesk mx-auto w-full max-w-3xl px-4 pb-12 pt-3">
      <h1 className="sr-only">봇 현황</h1>
      <div className="nm-bd-head" role="status">
        <p className="big">{q.isPending ? <span className="t-dim">읽는 중…</span> : q.isError ? <span className="t-lost">못 읽음</span> : !live ? <span className="t-dim">지금 세는 중</span> : <>노는 손 <b>{idle.length}</b></>}
          <span className="side">{n.lost ? <span className="badge">멈춤 {n.lost}</span> : null}{q.data?.at ? <span className="at">{hmKo(q.data.at)}{q.data.stale ? " · 묵은 것" : ""}</span> : null}</span>
        </p>
        {q.data && live ? (
          <>
            <div className="mix" aria-hidden>{mix.map((m) => <i key={m.group} className={`g-${m.group}`} style={{ flexGrow: m.n }} />)}</div>
            <HandBoard rows={crew} skills={skills} people={people} />
          </>
        ) : null}
      </div>
      {q.isError ? <p className="nsb-why">봇 현황을 못 읽었어 — {(q.error as Error)?.message || "서버 답 없음"} <button type="button" className="nm-sched-chip" onClick={() => void q.refetch()}>다시</button></p> : null}
      {q.data && !t ? <p className="nsb-empty">서버가 아직 도표를 안 줘(옛 판) — 잠깐 뒤 다시 열어 줘</p> : null}

      {t ? (
        <>
          <div className="nm-bd-tabs" aria-label="봇 현황 보기">
            <RubberSegment items={TABS.map(([value, label]) => ({ value, label }))} value={tab} onChange={(v) => pick(v as Tab)} size="lg" radius={14} trackColor="rgba(18,18,18,.55)" thumbColor="rgba(207,255,64,.9)" textColor="#E7ECE7" activeTextColor="#141516" />
          </div>
          {tab === "board" ? (live ? <BotInbox t={t} skills={skills} now={now} /> : <p className="nsb-empty">활동 줄을 지금 못 읽었어 — 곧 다시 읽어</p>) : tab === "flow" ? (live ? <Flow t={t} now={now} pmName={pmName} /> : <p className="nsb-empty">활동 줄을 지금 못 읽었어 — 곧 다시 읽어</p>) : tab === "turn" ? (live && t.codes.length ? <Turns t={t} skills={skills} /> : <p className="nsb-empty">차례를 지금 못 셌어 — 곧 다시 읽어</p>) : <Hands t={t} skills={skills} />}
        </>
      ) : null}

      <div className="nsb-links" aria-label="관련 화면">
        <a className="nm-sched-chip" href="#/runner">작동 표</a>
        <a className="nm-sched-chip" href="#/sched">스케줄</a>
      </div>
    </div>
  );
}
