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
import { type BotRow, type BotTable, GROUP_KO, agoKo, countOf, flowOf, hmKo, jobCount, jobLine, jobsOf, markOf, orbOf, sigOf, turnList, wireTone } from "./bot-desk-logic";
import "./status-board.css";
import "./bot-desk.css";

type Sheet = { at?: number; stale?: boolean; table?: BotTable; skills?: Record<string, string> };
type Tab = "flow" | "turn" | "hands";
const TABS: [Tab, string][] = [["flow", "흐름"], ["turn", "차례"], ["hands", "손 표"]];
const delay = (i: number) => ({ "--i": Math.min(i, 24) } as CSSProperties);

const MARK = { color: "currentColor", doneColor: "var(--nsb-ok)", errorColor: "var(--nsb-red)" } as const;

/** 봇 카드 = 유리 판 · 머리(얼굴 · 이름 · 상태: 구슬 + 빛 글자) + 오늘 오더 줄(도는 표시 → 체크 + 취소선 · n/m) · 누르면 접고 폄. */
function BotCard({ r, now, i, list }: { r: BotRow; now: number; i: number; list: ReturnType<typeof usePeople> }) {
  const { resolved } = useTheme();
  const jobs = jobsOf(r), n = jobCount(jobs), orb = orbOf(r), working = r.lane === "work";
  const [open, setOpen] = useState(() => jobs.some((j) => !j.done));   // 안 끝낸 오더가 있으면 펴 둠 · 다 끝냈으면 접어 둠
  const bits = [r.last_at ? `마지막 손 ${agoKo(now - r.last_at)}` : "", sigOf(r, now) !== "–" ? sigOf(r, now) : ""].filter(Boolean);
  const head = (
    <>
      <span className="face"><FaceImg id={idOf(r.who, list)} size={32} /></span>
      <span className="who">
        <span className="name"><b>{r.who}</b>{r.pm ? <span className="tag">PM</span> : null}{r.rest ? <span className="tag">쉼 지정</span> : null}</span>
        <span className="st">
          {orb ? <ThinkingOrb state={orb} size={20} theme={resolved} /> : <StatusMark status={markOf(r) as StatusMarkStatus} size={15} strokeWidth={2.4} {...MARK} />}
          {working ? <LiveShine text={`${r.state}…`} /> : <span>{r.state}</span>}
        </span>
      </span>
      {n.total ? <span className={`cnt${n.all ? " all" : ""}`}>{n.all ? "다 끝냄" : `${n.done}/${n.total}`}</span> : null}
      {jobs.length ? <span className="chev" aria-hidden>{open ? "▴" : "▾"}</span> : null}
    </>
  );
  return (
    <li className={`nm-bd-bot${open && jobs.length ? " open" : ""}`} style={delay(i)}>
      {jobs.length ? <button type="button" className="head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{head}</button> : <div className="head">{head}</div>}
      {jobs.length ? (
        <div className="fold" aria-hidden={!open}>
          <ul className="jobs">
            {jobs.map((j) => { const l = jobLine(j, working, now); return (
              <li key={j.no} className={`nm-bd-job s-${l.status}`} title={l.text}>
                <StatusMark status={l.status} label={l.text} size={14} strokeWidth={2.4} fontSize={13} {...MARK} />
                {l.side ? <small>{l.side}</small> : null}
              </li>
            ); })}
          </ul>
        </div>
      ) : null}
      {r.lane === "lost" && r.why ? <p className="why">{r.why}</p> : null}
      {bits.length ? <p className="meta">{bits.join(" · ")}</p> : null}
    </li>
  );
}

function Flow({ t, now, pmName }: { t: BotTable; now: number; pmName: string }) {
  const list = usePeople(), groups = flowOf(t.rows), orders = t.rows.reduce((n, r) => n + (r.open?.length || 0), 0), { resolved } = useTheme();
  let i = 0;
  return (
    <div className="nm-bd-flow">
      <div className="nm-bd-pm" style={delay(i++)}>
        <span className="face">{pmName ? <FaceImg id={idOf(pmName, list)} size={34} /> : null}</span>
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
  const [open, setOpen] = useState("");
  return (
    <div className="nm-bd-turns">
      {t.codes.map((c, i) => {
        const f = t.first?.[c], l = open === c ? turnList(t.rows, c) : null;
        return (
          <section key={c} className={`nm-bd-turn${open === c ? " open" : ""}`} style={delay(i)}>
            <button type="button" aria-expanded={open === c} onClick={() => setOpen((o) => (o === c ? "" : c))}>
              <span className="code">{c}</span><span className="nm">{skills[c] || ""}</span>
              <span className={`who ${!f ? "t-dim" : f.busy || !f.rank ? "t-dim" : "t-ok"}`}>{f ? `${f.who}${f.rank ? "" : " · 특기 밖"}${f.busy ? " · 일하는 중" : ""}` : "맡길 손 없음"}</span>
              <span className="chev" aria-hidden>{open === c ? "▴" : "▾"}</span>
            </button>
            {l ? (
              <ol>
                {l.order.map((o) => <li key={o.who} className={o.busy || !o.rank ? "t-dim" : o.n === 1 ? "t-ok" : ""}><span className="n">{o.n}</span><b>{o.who}</b><small>{o.rank ? `${o.rank}특기` : "특기 밖"}{o.busy ? " · 일하는 중" : ""}</small></li>)}
                {l.out.length ? <li className="out t-dim">못 맡김 — {l.out.map((o) => `${o.who}(${o.why})`).join(" · ")}</li> : null}
              </ol>
            ) : null}
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
            <span className="face"><FaceImg id={idOf(r.who, list)} size={30} /></span>
            <div className="body">
              <p className="name"><b>{r.who}</b>{(r.skills || []).map((c, k) => <span key={c} className={`sk${k === 0 ? " first" : ""}`} title={skills[c] || c}>{c}</span>)}</p>
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
  const [tab, setTab] = useState<Tab>(() => { try { const v = localStorage.getItem("nm-botdesk-tab"); return v === "turn" || v === "hands" ? v : "flow"; } catch { return "flow"; } });
  const pick = (v: Tab) => { setTab(v); try { localStorage.setItem("nm-botdesk-tab", v); } catch { /* 이번만 */ } };
  const t = q.data?.table, skills = q.data?.skills || {}, rows = t?.rows || [], now = Date.now(), n = countOf(rows);
  const live = rows.some((r) => r.lane !== "none"), idle = flowOf(rows).find((g) => g.group === "idle")?.rows || [], pmName = rows.find((r) => r.pm)?.who || "";
  return (
    <div className="nsb nm-botdesk mx-auto w-full max-w-3xl px-4 pb-12 pt-3">
      <h1 className="sr-only">봇 현황</h1>
      <div className="nm-bd-head" role="status">
        <p className="big">{q.isPending ? <span className="t-dim">불러오는 중</span> : q.isError ? <span className="t-lost">못 읽음</span> : !live ? <span className="t-dim">지금 세는 중</span> : <>노는 손 <b>{idle.length}</b></>}{n.lost ? <span className="badge">멈춤 {n.lost}</span> : null}</p>
        {idle.length ? <p className="names">{idle.map((r) => r.who).join(" · ")}</p> : q.data && live ? <p className="names t-dim">다 일하는 중이거나 차례 밖</p> : null}
        {q.data && live ? <p className="meta">일하는 중 {n.work} · 받을 수 있음 {n.ready} · 쉼 {n.rest}{q.data.at ? ` · ${hmKo(q.data.at)} 기준` : ""}{q.data.stale ? " · 묵은 것(곧 새로)" : ""}</p> : null}
      </div>
      {q.isError ? <p className="nsb-why">봇 현황을 못 읽었어 — {(q.error as Error)?.message || "서버 답 없음"} <button type="button" className="nm-sched-chip" onClick={() => void q.refetch()}>다시</button></p> : null}
      {q.data && !t ? <p className="nsb-empty">서버가 아직 도표를 안 줘(옛 판) — 잠깐 뒤 다시 열어 줘</p> : null}

      {t ? (
        <>
          <div className="nm-bd-tabs" aria-label="봇 현황 보기">
            <RubberSegment items={TABS.map(([value, label]) => ({ value, label }))} value={tab} onChange={(v) => pick(v as Tab)} size="lg" radius={14} trackColor="rgba(18,18,18,.55)" thumbColor="rgba(207,255,64,.16)" textColor="#E7ECE7" activeTextColor="#CFFF40" />
          </div>
          {tab === "flow" ? (live ? <Flow t={t} now={now} pmName={pmName} /> : <p className="nsb-empty">활동 줄을 지금 못 읽었어 — 곧 다시 읽어</p>) : tab === "turn" ? (live && t.codes.length ? <Turns t={t} skills={skills} /> : <p className="nsb-empty">차례를 지금 못 셌어 — 곧 다시 읽어</p>) : <Hands t={t} skills={skills} />}
        </>
      ) : null}

      <div className="nsb-links" aria-label="관련 화면">
        <a className="nm-sched-chip" href="#/runner">작동 표</a>
        <a className="nm-sched-chip" href="#/sched">스케줄</a>
      </div>
    </div>
  );
}
