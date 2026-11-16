// 봇 현황 맨 위 카드의 손 판 — 작동 표 「활동」 신호 판(./activity-board)의 얼굴 · 고리를 「누구한테 맡길까」 차례로 다시 놓음
//   형 11-15 클라우드 세션 「첨부1의 부분을, 첨부2로 옮기고싶어 … PM은 제외해서 좀더 ux관점에서」 · 「저 내용이, 주요 주특기가 나오게」
//   · 묶음 = 봇 현황 것 하나(멈춤 · 노는 손 · 일하는 중 · 차례 밖/조용) → 큰 숫자 · 막대 · 얼굴 수가 같은 셈 · PM 은 뺌(일 나누는 자리 = 맡길 손이 아님)
//   · 노는 손이 맨 위 · 얼굴 밑 = 1특기(맡길 때 보는 것) · 라임 고리 = 대기 신호로 「바로 받음」이 확인된 손 · 회색 고리 = 쉬는 손(깨워야 함)
//   · 판정 · 특기는 서버 것(GET status/bots)만 읽음 · 그림 · 움직임은 ./activity-board.css 그대로
import { useEffect, useState } from "react";
import { idOf } from "../data/office";
import { FaceImg, type usePeople } from "./faces";
import { ringDeg, ringFrac } from "./activity-view";
import { type BotRow, type Group, GROUP_KO, groupOf, isSpecial, roleLabel } from "./bot-desk-logic";
import "./activity-board.css";

// 칸 차례 = 멈춤 → 일하는 중 → 노는 손 → 특수 → 차례 밖(형 11-16 17:5x 구름 맥 창 「일하는 중이 더 우선적으로 보여야 함」 · 「아예 특수 직업군은 따로 분류되고」 · 앞 판 = 노는 손 먼저 · 일하는 중은 폰에서 접힘)
//   특수 = 1특기가 특수 갈래인 손(./bot-desk-logic.ts isSpecial) — 일하든 놀든 쉬든 이 칸에(멈춤만 맨 위 멈춤 칸 = 놓치면 안 되는 것) · 손마다 제 상태 그림(li data-st · ./bot-desk.css)
type HLane = "lost" | "work" | "idle" | "special" | "out";
const H_LANES: HLane[] = ["lost", "work", "idle", "special", "out"];
const H_KO: Record<HLane, string> = { lost: GROUP_KO.lost, idle: GROUP_KO.idle, work: GROUP_KO.work, special: "특수", out: `${GROUP_KO.held} · ${GROUP_KO.quiet}` };
const LOOK: Record<HLane, "lost" | "ready" | "work" | "rest" | "special"> = { lost: "lost", idle: "ready", work: "work", special: "special", out: "rest" };   // 그림 꼴 = 활동 판 칸(./activity-board.css data-k) · special = 칸 꼴 없음(손마다 data-st)
const hLane = (g: Group): HLane => (g === "held" || g === "quiet" ? "out" : g);
/** 손 하나가 들어갈 칸 — 멈춤이 먼저 · 그다음 특수 직군 · 나머지는 흐름 묶음 그대로. */
export const handLane = (r: BotRow): HLane => { const g = groupOf(r); return g === "lost" ? "lost" : isSpecial(r) ? "special" : hLane(g); };
type St = "work" | "ready" | "idle" | "rest";
/** 특수 칸 안 손의 상태 그림 — 일하는 중 · 바로 받음(대기 신호 확인) · 쉬는 손 · 차례 밖/조용. */
export const handSt = (r: BotRow): St => { const g = groupOf(r); return g === "work" ? "work" : g === "idle" ? (r.lane === "ready" ? "ready" : "idle") : "rest"; };
const ST_ORDER: St[] = ["work", "ready", "idle", "rest"], ST_KO: Record<St, string> = { work: "일하는 중", ready: "바로 받음", idle: "쉬는 손", rest: "차례 밖" };
/** 특기 이름 짧게(얼굴 폭에 한두 줄) — 「개발 및 검수」 → 「개발·검수」. */
export const skillShort = (name: string) => name.replace(/\s*및\s*/g, "·");
/** 차례 밖 · 조용 얼굴 밑 한 마디 = 까닭. */
const outWhy = (r: BotRow) => (r.rest ? "쉼 지정" : r.lane === "none" ? "줄 없음" : r.lane === "off" ? "조용" : "");

/** 지금 맡은 일을 작은 표로 — 「#-072」 · 여럿이면 「#-072 +2」 · 맡은 오더가 없으면 "" (형 11-16 19:2x 「그리고 어떤 일 하고잇는지 ?」 · 「화면이 복잡해지면 최대한 상징적인 요소나 클릭햇을때 나오는 요소로」) */
export const jobChip = (r: BotRow): string => { const o = r.open || []; return o.length ? `${o[0].no}${o.length > 1 ? ` +${o.length - 1}` : ""}` : ""; };

export function HandBoard({ rows, skills, people, sel = "", onPick }: { rows: BotRow[]; skills: Record<string, string>; people: ReturnType<typeof usePeople>; sel?: string; onPick?: (who: string) => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 5000); return () => clearInterval(id); }, []);
  // 일하는 중 = 맨 위 · 펴 둠(형 11-16 17:5x 「일하는 중이 더 우선적으로 보여야 함」 · 앞 판 = 폰에서 접어 둠) · 머리를 누르면 접힘(얼굴만 한 줄)
  const [openWork, setOpenWork] = useState(true);
  const lanes = H_LANES.map((k) => ({ k, rs: rows.filter((r) => handLane(r) === k).sort((a, b) => (k === "special" ? ST_ORDER.indexOf(handSt(a)) - ST_ORDER.indexOf(handSt(b)) : Number(b.lane === "ready") - Number(a.lane === "ready"))) })).filter((g) => g.rs.length);
  return (
    <div className="nsb-ab nm-bd-ab org first">   {/* org = 왼쪽 세로 줄기 + 칸마다 가지 선(조직 그림 느낌 · ./bot-desk.css) */}
      {lanes.map(({ k, rs }) => (
        <section key={k} className="nsb-ab-lane" data-k={LOOK[k]} data-h={k} aria-label={`${H_KO[k]} ${rs.length}`}>
          {k === "work" ? (
            <h4><button type="button" className="lane-fold" aria-expanded={openWork} onClick={() => setOpenWork((o) => !o)}><b>{rs.length}</b><span>{H_KO[k]}</span><svg className="chev" viewBox="0 0 16 16" width="14" height="14" aria-hidden><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button></h4>
          ) : <h4><b>{rs.length}</b>{H_KO[k]}</h4>}
          {k === "work" && !openWork ? (
            <ul className="mini" aria-label={rs.map((r) => r.who).join(" · ")} onClick={() => setOpenWork(true)}>
              {rs.map((r) => <li key={r.who} title={r.who}><FaceImg id={idOf(r.who, people)} size={26} /></li>)}
            </ul>
          ) : (
          <ul>
            {rs.map((r, i) => {
              const st = k === "special" ? handSt(r) : null;
              const sure = r.lane === "ready", deg = (k === "idle" && sure) || st === "ready" ? ringDeg(ringFrac(r, now)) : 180;
              const sk = r.skills?.[0], skKo = sk && skills[sk] ? skillShort(skills[sk]) : "", skName = roleLabel(r.skills, r.who) || skKo;   // 얼굴 밑 = 영문 직함(형 11-16 18:4x 「Developer … UX Design … PM · Dev. … PM · UXD.」) · 모르는 코드면 서버 한글 이름 · 한글 이름은 풍선에
              const sub = k === "lost" ? r.why || r.cause || "멈춤" : k === "out" ? outWhy(r) : skName;
              return (
                <li key={r.who} data-sure={k === "idle" ? (sure ? "1" : "0") : undefined} data-st={st || undefined} data-sel={sel === r.who || undefined} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="cell" role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined} aria-pressed={onPick ? sel === r.who : undefined} onClick={onPick ? () => onPick(r.who) : undefined} onKeyDown={onPick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(r.who); } } : undefined} title={[st ? ST_KO[st] : "", r.state, skKo ? `1특기 ${skKo}` : ""].filter(Boolean).join(" · ")}>
                    <span className="nsb-ab-av">
                      <span className="halo" /><span className="trk" /><span className="dash" />
                      <span className="ring"><i className="r"><u style={{ transform: `rotate(${deg}deg)` }} /></i><i className="l"><u style={{ transform: `rotate(${-deg}deg)` }} /></i></span>
                      <span className="orb"><i /><u /></span>
                      <span className="pic"><FaceImg id={idOf(r.who, people)} size={k === "out" ? 34 : 42} /></span>
                    </span>
                    <b>{r.who}</b>
                    {sub ? <small className={(k === "idle" || k === "special" || k === "work") && skName ? "sk" : undefined}>{sub}</small> : null}
                    {k !== "lost" && jobChip(r) ? <em className="job" title={(r.open || []).map((o) => `${o.no}${o.title ? " " + o.title : ""}`).join(" · ")}>{jobChip(r)}</em> : null}   {/* 지금 맡은 일 = 번호 한 표(누르면 아래에 다 펼쳐짐) */}
                  </div>
                </li>
              );
            })}
          </ul>
          )}
        </section>
      ))}
    </div>
  );
}
