// 봇 현황 「보드」(./bot-inbox.tsx)의 카드 셈 — 일감마다 한 장 · 세 칸(형 차례 · 도는 중 · 끝남)
//   형 11-16 03:0x(영상 = 「Agent inbox」: NEEDS YOU · RUNNING · DONE 세 칸 · 카드마다 무슨 일 · 흐른 시간 · 펼치면 단계 줄)
//   「혹시 작업 상황 스케줄러가 자동으로 이런식으로.진행.상황이 구체화 될 수 있는지 그리고 표현이 이렇게 영상처럼 고퀄리티면.좋겠음 최대한 살려줘」
//   재료 = 이미 있는 것만(새로 적는 것 0 · 봇이 더 하는 일 0): 서버 도표 status/bots(봇 상태 · 까닭 · 마지막 손 · 대기 신호 · 오늘 오더 줄 = 받음 · 태움 · 끝 · 늦은 오더) + 형 결정 목록(./decide-pop)
//   단계 줄 = 서버가 실제로 아는 때만(받음 → 태움 → 끝 · 마지막 손 · 대기 신호) — 지어낸 단계 0.
//   「지금 무엇을 읽고 쓰는 중」 = 작업 줄(row.trail · 형 03:2x 「응」) — 몸 보고(5분)가 제 창 원문 끝에서 뽑아 실으면 그 손이 지금 도는 카드에 단계로 끼움(안 오면 앞 꼴 그대로).
import { type BotRow, type BotTable, agoKo, hmKo, jobsOf, sumMin } from "./bot-desk-logic.ts";
import { timeWarnOff, turnMin, turnWarn } from "./turn-warn.ts";

export type Col = "need" | "run" | "done";
export type Tone = "wait" | "fail" | "run" | "done";
export type Step = { text: string; at?: number; live?: boolean; bad?: boolean };
export type Chip = { k: "code" | "ctx" | "min"; text: string; title: string };
export type Card = {
  key: string; col: Col; tone: Tone; title: string; who: string; desc: string;
  since?: number;   // 흐른 시간의 시작(도는 중 · 기다림 = 초가 차오름)
  took?: number;    // 끝난 일 = 걸린 시간
  label?: string;   // 상태 글(시간 대신 또는 앞에)
  chips: Chip[]; steps: Step[]; head?: string; act?: "decide" | "room"; order: number;
};
export type Dec = { id: string; room: string; room_name?: string; who: string; q: string; choices?: string[]; ts?: number; pick?: unknown };

/** 흐른 시간 글 — 「41초」 · 「3분 41초」 · 「1시간 12분」(영상 「3m 41s」 꼴). */
export function spanKo(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}초`;
  if (s < 3600) return `${Math.floor(s / 60)}분 ${s % 60}초`;
  return `${Math.floor(s / 3600)}시간 ${Math.floor((s % 3600) / 60)}분`;
}
const chipsOf = (r: BotRow, code: string | undefined, skills: Record<string, string>): Chip[] => [
  ...(code ? [{ k: "code" as const, text: code, title: `분류 ${skills[code] || code}` }] : []),
  ...(typeof r.ctx_pct === "number" ? [{ k: "ctx" as const, text: `${Math.round(r.ctx_pct)}%`, title: `${r.who} 맥락 ${Math.round(r.ctx_pct)}%` }] : []),
  ...(typeof r.work_min === "number" && r.work_min > 0 ? [{ k: "min" as const, text: `${Math.round(r.work_min)}분`, title: `${r.who} 오늘 일한 시간` }] : []),
];
const headOf = (r: BotRow) => [r.who, r.brain, r.acct].filter(Boolean).join(" · ");
/** 작업 줄 → 단계(그 일을 받은 뒤 것만 · 마지막 여섯 줄 · 글 없는 줄 뺌). */
export const trailSteps = (r: BotRow, after = 0): Step[] => (r.trail || []).filter((s) => s && s.text && (!s.at || s.at >= after)).slice(-6).map((s) => ({ text: s.text, ...(s.at ? { at: s.at } : {}) }));

/** 도표 + 형 결정 목록 → 카드들(칸 · 차례까지). now = 지금(ms). */
export function inboxOf(t: BotTable | undefined, decs: Dec[], now: number, skills: Record<string, string> = {}): Card[] {
  const out: Card[] = [], rows = t?.rows || [];
  for (const d of decs) {   // 형 결정 = 형 차례
    if (d.pick) continue;
    out.push({ key: `dec:${d.id}`, col: "need", tone: "wait", title: d.q, who: d.who, desc: `${d.who} 물음 · ${d.room_name || d.room}`, since: d.ts, label: "형 답 기다림", chips: [], act: "decide", order: 1e13 + (d.ts || 0),   // 멈춘 손 다음 · 오래 기다린 물음이 위
      steps: [{ text: `${d.who} 물음`, at: d.ts }, ...(d.choices && d.choices.length ? [{ text: `고를 것 ${d.choices.length} — ${d.choices.join(" · ")}` }] : []), { text: "형이 고르기를 기다림", live: true }] });
  }
  for (const r of rows) {
    if (r.lane === "lost") {   // 멈춘 손 = 형 차례(맨 위)
      out.push({ key: `lost:${r.who}`, col: "need", tone: "fail", title: `${r.who} 연결 끊김`, who: r.who, desc: [r.cause, r.why].filter(Boolean).join(" · ") || r.state, since: r.last_at, label: "연결 끊김", chips: chipsOf(r, undefined, skills), head: headOf(r), act: "room", order: 0,
        steps: [...(r.last_at ? [{ text: "마지막 손", at: r.last_at }] : []), ...(r.beat_at ? [{ text: "마지막 대기 신호", at: r.beat_at }] : []), ...(r.door_at ? [{ text: "문 확인", at: r.door_at }] : []), { text: [r.cause || "멈춤", r.why].filter(Boolean).join(" — "), live: true, bad: true }] });
    }
    const jobs = jobsOf(r), working = r.lane === "work";
    const lastOpen = jobs.filter((j) => !j.done && !j.ride).sort((a, b) => (b.recv || 0) - (a.recv || 0))[0];
    for (const j of jobs) {
      const title = `${j.no}${j.title ? " " + j.title : ""}`, base = { who: r.who, title, chips: chipsOf(r, j.code, skills), head: headOf(r) };
      const steps: Step[] = [...(j.recv ? [{ text: `${r.who} 받음`, at: j.recv }] : []), ...(j.ride ? [{ text: `태움${j.sha ? " " + j.sha.slice(0, 7) : ""} — 만들기 끝 · 기차에 올림`, at: j.ride }] : [])];
      if (j.done) {
        out.push({ ...base, key: `job:${r.who}:${j.no}`, col: "done", tone: "done", desc: `${r.who} · ${hmKo(j.done)} 끝`, took: j.recv && j.done >= j.recv ? j.done - j.recv : undefined, label: j.recv ? undefined : "끝", order: -j.done, steps: [...steps, { text: "끝", at: j.done }] });
        continue;
      }
      const late = (t?.late || []).find((l) => l.no === j.no && l.who === r.who);
      const doing = j.ride ? "만들기 끝 · 기차(라이브) 기다림" : working ? `${r.who} 작업 중${r.last_at ? ` · 손 ${agoKo(now - r.last_at)}` : ""}` : `${r.who} 받아 둠 · ${r.state}`;
      const liveStep: Step = { text: j.ride ? "라이브 기다림" : working ? "만드는 중" : `아직 손 안 댐(${r.state})`, live: true };
      if (late) out.push({ ...base, key: `job:${r.who}:${j.no}`, col: "need", tone: "wait", desc: `늦음 ${late.min}분 · ${doing}`, since: j.recv, label: `늦음 ${late.min}분`, act: "room", order: 3e13 - late.min, steps: [...steps, liveStep] });   // 형 결정 다음 · 많이 늦은 것이 위
      else out.push({ ...base, key: `job:${r.who}:${j.no}`, col: "run", tone: "run", desc: doing, since: j.recv, order: j.recv || now, steps: [...steps, ...(working && !j.ride && j === lastOpen ? trailSteps(r, j.recv) : []), liveStep] });   // 작업 줄 = 지금 손이 붙은 오더(가장 늦게 받은 안 끝낸 것) 하나에만
    }
    // 오더 밖 일 카드(「○○ · 오더 밖 일 · 턴이 도는 중」) = 걷음(형 11-21 07:44 dm-sia 시아 옮김 「글구 애들 먼일하는지 보이지도 않는데 없애도 될듯. 그냥」) · 도는 손은 손 판 고리 · 손 시각에 그대로
  }
  const rank: Record<Col, number> = { need: 0, run: 1, done: 2 };
  return out.sort((a, b) => rank[a.col] - rank[b.col] || a.order - b.order);
}
/** 칸마다 몇 장. */
export const colCount = (cards: Card[]): Record<Col, number> => ({ need: cards.filter((c) => c.col === "need").length, run: cards.filter((c) => c.col === "run").length, done: cards.filter((c) => c.col === "done").length });

/** 애들 시간 줄(걷은 「오더 밖 일」 카드 자리 · 형 11-21 07:45 dm-sia 시아 옮김 「누적 몇분 지금 몇분째 일중 이거는 가로로 해서 나오게해줘 그게 오히려 그 자리에 애들마다 일하는 애들 먼저 잗업 창작 쉬는 중 그 순서에맞춰서」)
 *  차례 = 누적 많은 순 · 순위 1 · 2 · 3 …(형 07:56 「이거 누적 전 24시간 기준 순위 나오게 하고. 주요 직무는 우측에」 · 앞 판 = PM → 작업 → 창작 → 쉬는 중) · 값 없는 애 = 맨 아래 · 순위 없음
 *  누적 = sumMin(./bot-desk-logic.ts · 24시간 칸 오기 전 = work_min) · 지금 = turn_at(이번 턴 시작 · 쉬면 없음)
 *  경고 = 누적 > 250분 · 지금 > 80분(형 07:46 「누적 250 넘어가면 경고색 지속 80 넘어가면 경고색」) */
export type TimeRow = { who: string; rank?: number; sum?: number; cur?: number; warnSum: boolean; warnCur: boolean };
export const SUM_WARN = 250;   // 지속 80 = ./turn-warn.ts 한 곳(대화창 종 옆 경고등과 같은 판정)
export function timeRows(t: BotTable | undefined, now: number): TimeRow[] {
  const xs = (t?.rows || []).map((r, i) => ({ r, i, sum: sumMin(r) }));
  xs.sort((a, b) => (a.sum == null ? 1 : 0) - (b.sum == null ? 1 : 0) || (b.sum ?? 0) - (a.sum ?? 0) || a.i - b.i);
  return xs.map(({ r, sum }, k) => {
    const cur = r.lane === "work" ? turnMin(r.turn_at, now) : undefined, off = timeWarnOff(r);   // PM 셋 = 경고 0(형 08:30 「응 글구 PM은 시간 겅고 안뜨게」)
    return { who: r.who, rank: sum != null ? k + 1 : undefined, sum, cur, warnSum: !off && (sum ?? 0) > SUM_WARN, warnCur: !off && r.lane === "work" && turnWarn(r.turn_at, now) };
  });
}
