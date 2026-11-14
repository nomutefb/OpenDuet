// 서랍 「봇 현황」(형 11-14 클라우드 세션 창 「아까 했던 봇들 상태 일 우선순위 이거는 서랍에 한 공간이 보여야함. 관련 잇는거랑.」 · 「누가 쉰다 이런개념이 아니라 도표 느낌으루」)
//   = PM 이 read room=bots 로 읽는 한 장과 같은 도표 셋 — 지금(손마다 한 줄) · 일 차례(분류마다 누구 먼저) · 손 표(특기 · 하드웨어 · 비고)
//   자료 = GET status/bots 의 table(서버 _botsheet.js sheetTable) 한 번 · 60초마다 · 판정 · 차례 셈은 서버 것(여기서 새로 안 셈 · ./bot-desk-logic.ts = 칸 글만)
//   줄 차례 = 손 표 그대로(상태가 바뀌어도 줄이 안 움직임) · 틀 · 표 = 작동 표 것(./status-board.css)
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";
import { type BotTable, agoKo, countOf, hmKo, laneTone, sigOf, turnCell } from "./bot-desk-logic";
import "./status-board.css";
import "./bot-desk.css";

type Sheet = { at?: number; stale?: boolean; table?: BotTable; skills?: Record<string, string> };

export function BotDesk() {
  const q = useQuery({ queryKey: ["nomute", "bots-sheet"], queryFn: () => office<Sheet>("status/bots"), refetchInterval: (x) => (x.state.data?.stale ? 8_000 : 60_000), staleTime: 5_000, retry: false });   // 묵은 답(서버가 뒤에서 새로 세는 중)이면 8초 뒤 다시 = 곧 새 표
  const t = q.data?.table, skills = q.data?.skills || {}, rows = t?.rows || [], codes = t?.codes || [], now = Date.now(), n = countOf(rows);
  const live = rows.some((r) => r.lane !== "none");   // 활동 줄을 못 읽은 답 = 손 표만
  const lost = rows.filter((r) => r.lane === "lost" && r.why);
  return (
    <div className="nsb nm-botdesk mx-auto w-full max-w-5xl px-4 pb-12 pt-3">
      <h1 className="sr-only">봇 현황</h1>
      <div className="nsb-top" role="status">
        <b data-st={q.isPending ? "unknown" : q.isError ? "miss" : n.lost ? "miss" : "ok"}>{q.isPending ? "불러오는 중" : q.isError ? "못 읽음" : `받을 수 있음 ${n.ready}`}</b>
        {q.data ? <span>일하는 중 {n.work} · 쉼 {n.rest} · 멈춤 {n.lost}</span> : null}
        {q.data?.at ? <small>{hmKo(q.data.at)} 기준{q.data.stale ? " · 묵은 것(곧 새로)" : ""}</small> : null}
      </div>
      {q.isError ? <p className="nsb-why">봇 현황을 못 읽었어 — {(q.error as Error)?.message || "서버 답 없음"} <button type="button" className="nm-sched-chip" onClick={() => void q.refetch()}>다시</button></p> : null}
      {q.data && !t ? <p className="nsb-empty">서버가 아직 도표를 안 줘(옛 판) — 잠깐 뒤 다시 열어 줘</p> : null}

      {t && live ? (
        <section className="nsb-cat" aria-label="지금">
          <div className="nsb-ch"><b>지금</b><small>손마다 한 줄 · 줄 차례 = 손 표</small></div>
          <div className="nsb-acct" role="region" aria-label="지금 표" tabIndex={0}>
            <table>
              <thead><tr><th>손</th><th>상태</th><th>마지막 손</th><th>신호</th><th>맥락</th><th>오늘 일</th><th>계정 남은</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.who}>
                    <th scope="row">{r.who}{r.brain ? <small>{r.brain}</small> : null}</th>
                    <td className={`t-${laneTone(r.lane)}`}>{r.state}</td>
                    <td>{r.last_at ? <>{agoKo(now - r.last_at)}<small>{hmKo(r.last_at)}</small></> : "–"}</td>
                    <td>{sigOf(r, now)}</td>
                    <td>{r.ctx_pct === undefined ? "–" : `${r.ctx_pct}%`}</td>
                    <td>{r.work_min === undefined ? "–" : `${r.work_min}분`}</td>
                    <td>{r.acct ? <>{r.acct_left}%<small>{r.acct}</small></> : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lost.map((r) => <p key={r.who} className="nsb-why">{r.who} — {r.why}</p>)}
        </section>
      ) : null}

      {t && live && codes.length ? (
        <section className="nsb-cat" aria-label="일 차례">
          <div className="nsb-ch"><b>일 차례</b><small>분류마다 누구 먼저 · 1 이 먼저</small></div>
          <div className="nsb-acct mx" role="region" aria-label="일 차례 표" tabIndex={0}>
            <table>
              <thead><tr><th>손</th>{codes.map((c) => <th key={c} title={skills[c] || c}>{c}<small>{skills[c] || ""}</small></th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.who}>
                    <th scope="row">{r.who}</th>
                    {codes.map((c) => { const x = turnCell(r.turn?.[c]); return <td key={c} className={`t-${x.tone}`} title={x.title}>{x.text}</td>; })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="legend">숫자 = 그 일감을 줄 차례 · 밖 = 특기 밖 · (괄호) = 일하는 중이라 뒤 · × = 못 맡김(개발 제외 · 멈춤) · D 는 개발 일감</p>
        </section>
      ) : null}

      {t && rows.some((r) => (r.skills || []).length || r.note) ? (
        <section className="nsb-cat" aria-label="손 표">
          <div className="nsb-ch"><b>손 표</b><small>특기 = 잘하는 차례 · 하드웨어 · 비고</small></div>
          <div className="nsb-acct" role="region" aria-label="손 표" tabIndex={0}>
            <table>
              <thead><tr><th>손</th><th>특기</th><th>RAM</th><th>CPU</th><th>GPU</th><th>OS</th><th>비고</th></tr></thead>
              <tbody>
                {rows.filter((r) => (r.skills || []).length || r.note || r.hw?.os).map((r) => (
                  <tr key={r.who}>
                    <th scope="row">{r.who}</th>
                    <td>{(r.skills || []).join(" > ") || "–"}</td>
                    <td>{r.hw?.ram || "–"}</td><td>{r.hw?.cpu || "–"}</td><td>{r.hw?.gpu || "–"}</td><td>{r.hw?.os || "–"}</td>
                    <td className="wrap">{r.note || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Object.keys(skills).length ? <p className="legend">특기 코드: {Object.entries(skills).map(([c, name]) => `${c} ${name}`).join(" · ")}</p> : null}
        </section>
      ) : null}

      <div className="nsb-links" aria-label="관련 화면">
        <a className="nm-sched-chip" href="#/runner">작동 표</a>
        <a className="nm-sched-chip" href="#/sched">스케줄</a>
      </div>
    </div>
  );
}
