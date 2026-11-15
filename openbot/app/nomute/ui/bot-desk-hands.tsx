// 봇 현황 맨 위 카드의 손 판 — 작동 표 「활동」 신호 판(./activity-board)의 얼굴 · 고리를 「누구한테 맡길까」 차례로 다시 놓음
//   형 11-15 클라우드 세션 「첨부1의 부분을, 첨부2로 옮기고싶어 … PM은 제외해서 좀더 ux관점에서」 · 「저 내용이, 주요 주특기가 나오게」
//   · 묶음 = 봇 현황 것 하나(멈춤 · 노는 손 · 일하는 중 · 차례 밖/조용) → 큰 숫자 · 막대 · 얼굴 수가 같은 셈 · PM 은 뺌(일 나누는 자리 = 맡길 손이 아님)
//   · 노는 손이 맨 위 · 얼굴 밑 = 1특기(맡길 때 보는 것) · 라임 고리 = 대기 신호로 「바로 받음」이 확인된 손 · 회색 고리 = 쉬는 손(깨워야 함)
//   · 판정 · 특기는 서버 것(GET status/bots)만 읽음 · 그림 · 움직임은 ./activity-board.css 그대로
import { useEffect, useState } from "react";
import { idOf } from "../data/office";
import { FaceImg, type usePeople } from "./faces";
import { ringDeg, ringFrac } from "./activity-view";
import { type BotRow, type Group, GROUP_KO, groupOf } from "./bot-desk-logic";
import "./activity-board.css";

type HLane = "lost" | "idle" | "work" | "out";
const H_LANES: HLane[] = ["lost", "idle", "work", "out"];
const H_KO: Record<HLane, string> = { lost: GROUP_KO.lost, idle: GROUP_KO.idle, work: GROUP_KO.work, out: `${GROUP_KO.held} · ${GROUP_KO.quiet}` };
const LOOK: Record<HLane, "lost" | "ready" | "work" | "rest"> = { lost: "lost", idle: "ready", work: "work", out: "rest" };   // 그림 꼴 = 활동 판 칸(./activity-board.css data-k)
const hLane = (g: Group): HLane => (g === "held" || g === "quiet" ? "out" : g);
/** 특기 이름 짧게(얼굴 폭에 한두 줄) — 「개발 및 검수」 → 「개발·검수」. */
export const skillShort = (name: string) => name.replace(/\s*및\s*/g, "·");
/** 차례 밖 · 조용 얼굴 밑 한 마디 = 까닭. */
const outWhy = (r: BotRow) => (r.rest ? "쉼 지정" : r.lane === "none" ? "줄 없음" : r.lane === "off" ? "조용" : "");

export function HandBoard({ rows, skills, people }: { rows: BotRow[]; skills: Record<string, string>; people: ReturnType<typeof usePeople> }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 5000); return () => clearInterval(id); }, []);
  // 일하는 중 = 폰 폭에선 접어 둠(카드의 주인공 = 노는 손 · 9명이 세 줄을 차지해 밑의 탭이 밀림) · 누르면 폄 · 넓은 화면은 펴 둠
  const [openWork, setOpenWork] = useState(() => !(typeof matchMedia === "function" && matchMedia("(max-width:520px)").matches));
  const lanes = H_LANES.map((k) => ({ k, rs: rows.filter((r) => hLane(groupOf(r)) === k).sort((a, b) => Number(b.lane === "ready") - Number(a.lane === "ready")) })).filter((g) => g.rs.length);
  return (
    <div className="nsb-ab nm-bd-ab first">
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
              const sure = r.lane === "ready", deg = k === "idle" && sure ? ringDeg(ringFrac(r, now)) : 180;
              const sk = r.skills?.[0], skName = sk && skills[sk] ? skillShort(skills[sk]) : "";
              const sub = k === "lost" ? r.why || r.cause || "멈춤" : k === "out" ? outWhy(r) : skName;
              return (
                <li key={r.who} data-sure={k === "idle" ? (sure ? "1" : "0") : undefined} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="cell" title={[r.state, skName ? `1특기 ${skName}` : ""].filter(Boolean).join(" · ")}>
                    <span className="nsb-ab-av">
                      <span className="halo" /><span className="trk" /><span className="dash" />
                      <span className="ring"><i className="r"><u style={{ transform: `rotate(${deg}deg)` }} /></i><i className="l"><u style={{ transform: `rotate(${-deg}deg)` }} /></i></span>
                      <span className="orb"><i /><u /></span>
                      <span className="pic"><FaceImg id={idOf(r.who, people)} size={k === "out" ? 34 : 42} /></span>
                    </span>
                    <b>{r.who}</b>
                    {sub ? <small className={k === "idle" && skName ? "sk" : undefined}>{sub}</small> : null}
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
