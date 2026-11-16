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

// 칸 차례 = 연결 끊김 → 작업 중(개발 중 · 창작 중) → 쉬는 중 → 차례 밖
//   형 11-16 19:5x 구름 맥 창 「노는 손 은 용어 변경 / 쉬는 중」 · 「특수도 일하는 중으로」 · 「그리고 일하는 중 용어 변경 작업 중」 · 「작업 중에 카테고리 두개로 / 개발 중 / 창작 중」 · 「일하면 특수에ㅡ잇는 이들도 위로 올라가는거고 / 쉬면 특수도 쉬는데 위로올라가는거 구분 안함」 · 「그리고 연결 끊김은 별개로 표기되어야 함」
//   앞 판(17:5x) = 특수 직군을 따로 한 칸에 → 걷음: 특수 직군은 일하면 「창작 중」 · 쉬면 「쉬는 중」에 다른 손과 섞임
type HLane = "lost" | "work" | "idle" | "out";
const H_LANES: HLane[] = ["lost", "work", "idle", "out"];
const H_KO: Record<HLane, string> = { lost: GROUP_KO.lost, idle: GROUP_KO.idle, work: GROUP_KO.work, out: `${GROUP_KO.held} · ${GROUP_KO.quiet}` };
const LOOK: Record<HLane, "lost" | "ready" | "work" | "rest"> = { lost: "lost", idle: "ready", work: "work", out: "rest" };   // 그림 꼴 = 활동 판 칸(./activity-board.css data-k)
/** 작업 중 칸의 두 갈래 — 개발 중(특수 직군이 아닌 손) · 창작 중(1특기가 특수 갈래인 손 = 사진·영상 · 작곡 · 글짓기 · 정보 수집) */
const WORK_SUB: [string, string, (r: BotRow) => boolean][] = [["dev", "개발 중", (r) => !isSpecial(r)], ["make", "창작 중", isSpecial]];
const hLane = (g: Group): HLane => (g === "held" || g === "quiet" ? "out" : g);
/** 손 하나가 들어갈 칸 — 연결 끊김이 먼저 · 나머지는 흐름 묶음 그대로(특수 직군도 일하면 작업 중 · 쉬면 쉬는 중 = 따로 안 둠). */
export const handLane = (r: BotRow): HLane => hLane(groupOf(r));
/** 특기 이름 짧게(얼굴 폭에 한두 줄) — 「개발 및 검수」 → 「개발·검수」. */
export const skillShort = (name: string) => name.replace(/\s*및\s*/g, "·");
/** 차례 밖 · 조용 얼굴 밑 한 마디 = 까닭. */
const outWhy = (r: BotRow) => (r.rest ? "쉼 지정" : r.lane === "none" ? "줄 없음" : r.lane === "off" ? "조용" : "");

/** 얼굴 + 상태 고리 한 벌(도는 구슬 · 차오르는 고리 · 점선) — 손 판 칸과 조직 그림 맨 위 PM 이 같이 씀 · 어느 그림이 켜지나는 바깥 꼴(칸 data-k · li / PM data-st)이 정함 */
export function HandFace({ id, deg = 180, size = 42 }: { id: string; deg?: number; size?: number }) {
  return (
    <span className="nsb-ab-av">
      <span className="halo" /><span className="trk" /><span className="dash" />
      <span className="ring"><i className="r"><u style={{ transform: `rotate(${deg}deg)` }} /></i><i className="l"><u style={{ transform: `rotate(${-deg}deg)` }} /></i></span>
      <span className="orb"><i /><u /></span>
      <span className="pic"><FaceImg id={id} size={size} /></span>
    </span>
  );
}

/** 지금 맡은 일을 작은 표로 — 「#-072」 · 여럿이면 「#-072 +2」 · 맡은 오더가 없으면 "" (형 11-16 19:2x 「그리고 어떤 일 하고잇는지 ?」 · 「화면이 복잡해지면 최대한 상징적인 요소나 클릭햇을때 나오는 요소로」) */
export const jobChip = (r: BotRow): string => { const o = r.open || []; return o.length ? `${o[0].no}${o.length > 1 ? ` +${o.length - 1}` : ""}` : ""; };

export function HandBoard({ rows, skills, people, sel = "", onPick }: { rows: BotRow[]; skills: Record<string, string>; people: ReturnType<typeof usePeople>; sel?: string; onPick?: (who: string) => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 5000); return () => clearInterval(id); }, []);
  // 일하는 중 = 맨 위 · 펴 둠(형 11-16 17:5x 「일하는 중이 더 우선적으로 보여야 함」 · 앞 판 = 폰에서 접어 둠) · 머리를 누르면 접힘(얼굴만 한 줄)
  const [openWork, setOpenWork] = useState(true);
  const lanes = H_LANES.map((k) => ({ k, rs: rows.filter((r) => handLane(r) === k).sort((a, b) => Number(b.lane === "ready") - Number(a.lane === "ready")) })).filter((g) => g.rs.length);
  // 손 하나(얼굴 · 이름 · 직함 · 맡은 일 표) — 칸마다 같은 그림(작업 중 = 도는 구슬 · 쉬는 중 = 고리 · 연결 끊김 = 점선)
  const cell = (k: HLane) => (r: BotRow, i: number) => {
    const sure = r.lane === "ready", deg = k === "idle" && sure ? ringDeg(ringFrac(r, now)) : 180;
    const sk = r.skills?.[0], skKo = sk && skills[sk] ? skillShort(skills[sk]) : "", skName = roleLabel(r.skills, r.who) || skKo;   // 얼굴 밑 = 영문 직함(형 11-16 18:4x 「Developer … UX Design … PM · Dev. … PM · UXD.」) · 모르는 코드면 서버 한글 이름 · 한글 이름은 풍선에
    const sub = k === "lost" ? r.why || r.cause || GROUP_KO.lost : k === "out" ? outWhy(r) : skName;
    return (
      <li key={r.who} data-sure={k === "idle" ? (sure ? "1" : "0") : undefined} data-sel={sel === r.who || undefined} style={{ animationDelay: `${i * 40}ms` }}>
        <div className="cell" role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined} aria-pressed={onPick ? sel === r.who : undefined} onClick={onPick ? () => onPick(r.who) : undefined} onKeyDown={onPick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(r.who); } } : undefined} title={[r.state, skKo ? `1특기 ${skKo}` : ""].filter(Boolean).join(" · ")}>
          <HandFace id={idOf(r.who, people)} deg={deg} size={k === "out" ? 34 : 42} />
          <b>{r.who}</b>
          {sub ? <small className={(k === "idle" || k === "work") && skName ? "sk" : undefined}>{sub}</small> : null}
          {k !== "lost" && jobChip(r) ? <em className="job" title={(r.open || []).map((o) => `${o.no}${o.title ? " " + o.title : ""}`).join(" · ")}>{jobChip(r)}</em> : null}   {/* 지금 맡은 일 = 번호 한 표(누르면 아래에 다 펼쳐짐) */}
        </div>
      </li>
    );
  };
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
          ) : k === "work" ? (
          <div className="subs">   {/* 작업 중 = 개발 중 · 창작 중 둘로(형 11-16 19:5x 「작업 중에 카테고리 두개로 / 개발 중 / 창작 중」) · 빈 갈래는 안 그림 */}
            {WORK_SUB.map(([id, name, pick]) => { const xs = rs.filter(pick); return xs.length ? <div key={id} className="sub" data-sub={id}><h5><b>{xs.length}</b>{name}</h5><ul>{xs.map(cell(k))}</ul></div> : null; })}
          </div>
          ) : (
          <ul>{rs.map(cell(k))}</ul>
          )}
        </section>
      ))}
    </div>
  );
}
