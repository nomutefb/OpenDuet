// 봇 현황 맨 위 카드의 손 판 — 작동 표 「활동」 신호 판(./activity-board)의 얼굴 · 고리를 「누구한테 맡길까」 차례로 다시 놓음
//   형 11-15 클라우드 세션 「첨부1의 부분을, 첨부2로 옮기고싶어 … PM은 제외해서 좀더 ux관점에서」 · 「저 내용이, 주요 주특기가 나오게」
//   · 묶음 = 봇 현황 것 하나(멈춤 · 노는 손 · 일하는 중 · 차례 밖/조용) → 큰 숫자 · 막대 · 얼굴 수가 같은 셈 · PM 은 뺌(일 나누는 자리 = 맡길 손이 아님)
//   · 노는 손이 맨 위 · 얼굴 밑 = 1특기(맡길 때 보는 것) · 라임 고리 = 대기 신호로 「바로 받음」이 확인된 손 · 회색 고리 = 쉬는 손(깨워야 함)
//   · 판정 · 특기는 서버 것(GET status/bots)만 읽음 · 그림 · 움직임은 ./activity-board.css 그대로
import { useEffect, useState } from "react";
import { idOf } from "../data/office";
import { FaceImg, type usePeople } from "./faces";
import { ringDeg, ringFrac } from "./activity-view";
import { type BotRow, GROUP_KO, groupOf, isSpecial, roleLabel } from "./bot-desk-logic";
import "./activity-board.css";

// 칸 = 작업 중(개발 중 · 창작 중) → 쉬는 중 · 둘뿐
//   형 11-16 19:5x 구름 맥 창 「노는 손 은 용어 변경 / 쉬는 중」 · 「특수도 일하는 중으로」 · 「그리고 일하는 중 용어 변경 작업 중」 · 「작업 중에 카테고리 두개로 / 개발 중 / 창작 중」 · 「일하면 특수에ㅡ잇는 이들도 위로 올라가는거고 / 쉬면 특수도 쉬는데 위로올라가는거 구분 안함」
//   형 20:0x 「아예 일 배제 한 경우도 그냥 쉼에 두면 됨 역할군이 안나오는건 아냐.」 · 「근데 쉼에 고리만 빠지면 됨.」 · 「아니다 연결 끊김은 쉼에 가서 고리에 빨간불로 할게」 · 「줄 하나 더 생기는게 아니라」
//   → 일 안 하는 손은 다 「쉬는 중」 한 줄 · 구분은 고리뿐: 바로 받음 = 흰 고리 · 쉬는 손 = 회색 고리 · 업무 배제(쉼 지정) · 신호 없는 자리(조용 · 줄 없음) = 고리 없음 · 연결 끊김 = 빨간 고리 · 직함 알약은 누구나
type HLane = "work" | "idle";
const H_LANES: HLane[] = ["work", "idle"];
const H_KO: Record<HLane, string> = { work: GROUP_KO.work, idle: GROUP_KO.idle };
const LOOK: Record<HLane, "ready" | "work"> = { work: "work", idle: "ready" };   // 그림 꼴 = 활동 판 칸(./activity-board.css data-k)
/** 작업 중 칸의 두 갈래 — 개발 중(특수 직군이 아닌 손) · 창작 중(1특기가 특수 갈래인 손 = 사진·영상 · 작곡 · 글짓기 · 정보 수집) */
const WORK_SUB: [string, string, (r: BotRow) => boolean][] = [["dev", "개발 중", (r) => !isSpecial(r)], ["make", "창작 중", isSpecial]];
/** 손 하나가 들어갈 칸 — 맡은 일이 돌면 작업 중 · 그 밖은 다 쉬는 중(업무 배제 · 연결 끊김 · 신호 없는 자리도). */
export const handLane = (r: BotRow): HLane => (groupOf(r) === "work" ? "work" : "idle");
/** 쉬는 중 칸 안 고리 갈래 — lost = 연결 끊김(빨간 고리) · hold = 업무 배제(쉼 지정 · 고리 없음) · quiet = 신호 없는 자리(조용 · 줄 없음 · 고리 없음) · "" = 보통(흰 · 회색 고리) */
export const handOff = (r: BotRow): "lost" | "hold" | "quiet" | "" => { const g = groupOf(r); return g === "lost" ? "lost" : g === "held" ? "hold" : g === "quiet" ? "quiet" : ""; };
const OFF_ORDER = ["lost", "", "hold", "quiet"];   // 쉬는 중 안 차례 = 연결 끊김 먼저(놓치면 안 됨) → 쉬는 손(바로 받음 먼저) → 배제 → 신호 없음
/** 특기 이름 짧게(얼굴 폭에 한두 줄) — 「개발 및 검수」 → 「개발·검수」. */
export const skillShort = (name: string) => name.replace(/\s*및\s*/g, "·");
/** 풍선에 적는 까닭 한 마디(얼굴 밑은 누구나 직함). */
const offWhy = (r: BotRow) => (r.lane === "lost" ? `${GROUP_KO.lost}${r.why || r.cause ? ` — ${r.why || r.cause}` : ""}` : r.rest ? "쉼 지정" : r.lane === "none" ? "줄 없음(활동 신호가 온 적 없음)" : r.lane === "off" ? "조용(하루 넘게 신호 없음)" : "");

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

/** 값이 아직 없는 첫 순간의 손 판 — 사람표의 애들 얼굴 · 이름을 한 칸에(상태 고리는 비움) · 사람표도 아직이면 빈 동그라미 열 개
 *  형 11-17 07:1x 구름 맥 창 「처음브터 제대로 나오게」 — 「읽는 중…」 한 줄로 화면이 쪼그라들어 아래 층이 첫 화면에 올라오던 것 */
export function HandGhost({ people }: { people: ReturnType<typeof usePeople> }) {
  const bots = people.filter((p) => (p.kind as string) !== "human" && !p.pm && !p.empty && !!(p as { cls?: string }).cls);   // 형만 빼고 다(종류 = winter · being · bot) · 갈래(cls)가 있는 진짜 애들만(「뉴스 알림」 같은 알림용 이름 뺌) · PM 은 손 판에서도 따로 서니 뺌
  return (
    <div className="nsb-ab nm-bd-ab first ghost" aria-hidden>
      <section className="nsb-ab-lane" data-k="ready" data-h="idle">
        <ul>{bots.length
          ? bots.map((p) => <li key={p.who} data-sure="0"><div className="cell"><HandFace id={idOf(p.who, people)} size={42} /><b>{p.name || p.who}</b></div></li>)
          : Array.from({ length: 10 }, (_, i) => <li key={i}><div className="cell"><span className="nm-bd-dot" /><b>&nbsp;</b></div></li>)}</ul>
      </section>
    </div>
  );
}

export function HandBoard({ rows, skills, people, sel = "", onPick }: { rows: BotRow[]; skills: Record<string, string>; people: ReturnType<typeof usePeople>; sel?: string; onPick?: (who: string) => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 5000); return () => clearInterval(id); }, []);
  // 일하는 중 = 맨 위 · 펴 둠(형 11-16 17:5x 「일하는 중이 더 우선적으로 보여야 함」 · 앞 판 = 폰에서 접어 둠) · 머리를 누르면 접힘(얼굴만 한 줄)
  const [openWork, setOpenWork] = useState(true);
  const lanes = H_LANES.map((k) => ({ k, rs: rows.filter((r) => handLane(r) === k).sort((a, b) => OFF_ORDER.indexOf(handOff(a)) - OFF_ORDER.indexOf(handOff(b)) || Number(b.lane === "ready") - Number(a.lane === "ready")) })).filter((g) => g.rs.length);
  // 손 하나(얼굴 · 이름 · 직함 · 맡은 일 표) — 칸마다 같은 그림(작업 중 = 도는 구슬 · 쉬는 중 = 고리 · 연결 끊김 = 점선)
  const cell = (k: HLane) => (r: BotRow, i: number) => {
    const off = k === "idle" ? handOff(r) : "", sure = r.lane === "ready", deg = off === "lost" ? 0 : k === "idle" && sure ? ringDeg(ringFrac(r, now)) : 180;   // 0 = 꽉 찬 고리(연결 끊김 = 빨간 고리 한 바퀴) · 180 = 빈 고리
    const sk = r.skills?.[0], skKo = sk && skills[sk] ? skillShort(skills[sk]) : "", skName = roleLabel(r.skills, r.who) || skKo;   // 얼굴 밑 = 영문 직함(형 11-16 18:4x 「Developer … UX Design … PM · Dev. … PM · UXD.」) · 모르는 코드면 서버 한글 이름 · 한글 이름은 풍선에
    const sub = skName;   // 얼굴 밑 = 누구나 직함(형 20:0x 「역할군이 안나오는건 아냐.」) · 까닭은 풍선과 누른 펼침에
    return (
      <li key={r.who} data-sure={k === "idle" && !off ? (sure ? "1" : "0") : undefined} data-off={off || undefined} data-sel={sel === r.who || undefined} style={{ animationDelay: `${i * 40}ms` }}>
        <div className="cell" role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined} aria-pressed={onPick ? sel === r.who : undefined} onClick={onPick ? () => onPick(r.who) : undefined} onKeyDown={onPick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(r.who); } } : undefined} title={[offWhy(r) || r.state, skKo ? `1특기 ${skKo}` : ""].filter(Boolean).join(" · ")}>
          <HandFace id={idOf(r.who, people)} deg={deg} size={42} />
          <b>{r.who}</b>
          {sub ? <small className="sk">{sub}</small> : null}
          {jobChip(r) ? <em className="job" title={(r.open || []).map((o) => `${o.no}${o.title ? " " + o.title : ""}`).join(" · ")}>{jobChip(r)}</em> : null}   {/* 지금 맡은 일 = 번호 한 표(누르면 아래에 다 펼쳐짐) */}
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
