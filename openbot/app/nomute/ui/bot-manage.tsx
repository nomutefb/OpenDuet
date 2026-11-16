// 애들 화면 얼굴 펼침 = 그 애 관리 칸 — 다음 창 모델 · 노력도 / 계정 / 임시 멈춤을 그 자리에서 보고 바꿈(셈 = ./bot-manage-logic.ts)
//   형 11-16 19:36 dm-bom(봄 옮김) 「그 봇 내용이 거기에 표시되는 곳에 모델명 지정까지 붙여서 거기서 일괄 관리 페이지가 되길 바라는거임 노력도랑. … 한쪽에 몰아버리고 싳은거임.」
//   꼴(형 20:5x 구름 맥 창 「알약으로 선택하면 비효율 이니 그 영상에디터에 이미 css가 잇거든? 이거 참고해서 구현해줘」 · 「기간 설정은 이것도 참고해보고.」):
//     · 고르는 줄 = 옛 에디터 영상 편집 「자막 스타일 | 가라오케 | 강조」 줄 그대로(edit.html .srow · .plbl · .sopts · .pc · .ssep = 이름표 왼쪽 굵게 · 값은 오른쪽 낱말 · 사이 흐린 | · 고른 낱말만 강조색) — 값은 ./bot-desk.css 에 옮김
//     · 기간 = 형 영상(24시간 길 위 막대의 오른쪽 손잡이를 끌어 늘림 · 막대 안에 걸리는 시간 · 저장하면 잠김) + 앱에 있던 유지 시간 막대(./day-slide.tsx)와 같은 결
//   서버 = 이미 있는 길만: 모델 · 노력도 = profile/nextwin(./next-win.tsx) · 임시 멈춤 = bots/rest(빠르 #4053) · 계정 = 도표 줄 acct(읽기)
//   움직임 = 끄는 동안 리액트를 안 거치고 그 막대의 transform 만 바꿈(합성 단계 · 60프레임) · 놓으면 30분 칸에 붙음
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CSSProperties, Fragment, type ReactNode, useRef, useState } from "react";
import { office } from "../data/office";
import { type BotRow, roleOf } from "./bot-desk-logic";
import { HOLD_MAX, HOLD_STEP, type Rest, type RestMap, durKo, endKo, minsAt, posOf, restBody, restKo, restOn, restPos, ticksOf, untilOf } from "./bot-manage-logic";
import { NW_EFFORTS, NW_MODELS, type NextWin, nwDefault, useNextWin } from "./next-win";
import { useMe } from "./pins";

const NW_KEY = ["nomute", "nextwin"], REST_KEY = ["nomute", "bots-rest"];
const why = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** 고르는 줄 하나 — 이름표 + 오른쪽 낱말들(사이 |). */
function Row({ label, children, note }: { label: string; children: ReactNode[]; note?: ReactNode }) {
  return (
    <div className="srow">
      <span className="plbl">{label}</span>
      <span className="sopts">{children.map((c, i) => <Fragment key={i}>{i ? <span className="ssep" aria-hidden>|</span> : null}{c}</Fragment>)}{note}</span>
    </div>
  );
}

/** 다음 새 창의 모델 · 노력도 — 형 = 누르면 바로 저장 · 그 밖 = 지금 값만. 클로드 몸(봇 상자)만. */
function NextWinRows({ who }: { who: string }) {
  const q = useNextWin(), me = useMe(), qc = useQueryClient();
  const got = q.data?.[who], cur = got || nwDefault(who), can = me?.kind === "human" && me.can_write !== false;
  const save = useMutation({
    mutationFn: (v: NextWin) => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin", { method: "POST", body: JSON.stringify({ who, model: v.model, effort: v.effort }) }),
    onSuccess: (j) => { if (j.nextwin) qc.setQueryData(NW_KEY, j.nextwin); else void qc.invalidateQueries({ queryKey: NW_KEY }); },
  });
  const off = !can || save.isPending;
  return (
    <>
      <Row label="모델">{NW_MODELS.map(([id, ko]) => <button key={id} type="button" className={`pc${cur.model === id ? " on" : ""}`} aria-pressed={cur.model === id} disabled={off && cur.model !== id} onClick={() => { if (can && cur.model !== id) save.mutate({ ...cur, model: id }); }}>{ko}</button>)}</Row>
      <Row label="노력도" note={save.error ? <em className="err" role="alert">저장 안 됨 · {why(save.error)}</em> : null}>{NW_EFFORTS.map((x) => <button key={x} type="button" className={`pc${cur.effort === x ? " on" : ""}`} aria-pressed={cur.effort === x} disabled={off && cur.effort !== x} onClick={() => { if (can && cur.effort !== x) save.mutate({ ...cur, effort: x }); }}>{x}</button>)}</Row>
    </>
  );
}

/** 기간 막대 — 길 = 지금부터 24시간 · 오른쪽 손잡이를 끌어 늘림 · 막대 안 = 걸리는 시간 · lock = 걸려 있는 멈춤(손잡이 없음). mins 0 = 풀 때까지(길 가득). */
function HoldBar({ mins, onChange, onLive, now, lock }: { mins: number; onChange: (m: number) => void; onLive?: (m: number) => void; now: number; lock?: { pos: number; text: string } }) {
  const track = useRef<HTMLDivElement>(null), dur = useRef<HTMLElement>(null), drag = useRef(false), last = useRef(mins || HOLD_MAX);
  const p = lock ? lock.pos : mins ? posOf(mins) : 1, text = lock ? lock.text : mins ? durKo(mins) : "풀 때까지";
  const paint = (x: number, t: string) => { const el = track.current; if (!el) return; el.style.setProperty("--p", String(x)); el.toggleAttribute("data-small", x < 0.26); if (dur.current) dur.current.textContent = t; };
  const live = (cx: number) => { const b = track.current!.getBoundingClientRect(), raw = (cx - b.left) / b.width, m = minsAt(raw); if (m !== last.current) onLive?.(m); last.current = m; paint(Math.max(posOf(HOLD_STEP), Math.min(1, raw)), durKo(m)); };   // 끄는 동안 = 손가락을 그대로 따라감(리액트 0) · 글자만 30분 칸으로
  const down = (e: React.PointerEvent) => { if (lock) return; drag.current = true; try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* 잡기 못 해도 */ } track.current?.setAttribute("data-drag", ""); live(e.clientX); };
  const move = (e: React.PointerEvent) => { if (drag.current) live(e.clientX); };
  const up = () => { if (!drag.current) return; drag.current = false; track.current?.removeAttribute("data-drag"); paint(posOf(last.current), durKo(last.current)); onChange(last.current); };   // 놓으면 30분 칸에 붙음
  const key = (e: React.KeyboardEvent) => {
    if (lock) return;
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? HOLD_STEP : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -HOLD_STEP : 0;
    if (d) { e.preventDefault(); onChange(Math.max(HOLD_STEP, Math.min(HOLD_MAX, (mins || HOLD_MAX) + d))); }
  };
  return (
    <div className="nm-hs" data-lock={lock ? "" : undefined}>
      <div ref={track} className="track" role="slider" tabIndex={lock ? -1 : 0} aria-label="멈출 시간" aria-disabled={lock ? true : undefined} aria-valuemin={HOLD_STEP} aria-valuemax={HOLD_MAX} aria-valuenow={mins || HOLD_MAX} aria-valuetext={text}
        style={{ "--p": p } as CSSProperties} data-small={p < 0.26 ? "" : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
        <span className="clip" aria-hidden><i className="fill" /></span>
        <span className="run" aria-hidden><i className="grip" /></span>
        <span className="mid" aria-hidden><b ref={dur}>{text}</b></span>
      </div>
      <div className="ticks" aria-hidden><span style={{ left: 0 }}>지금</span>{ticksOf(now).map((t) => <span key={t.label + t.x} style={{ left: `${t.x * 100}%` }}>{t.label}</span>)}</div>
    </div>
  );
}

/** 임시 멈춤 — 갈래(전부 · 그 애 특기) + 기간 막대 → 「멈춤」 · 걸려 있으면 잠긴 막대 + 「풀기」. 자동 배정이 그 기한까지 그 갈래에서 뺌(서버). */
function RestRows({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  const qc = useQueryClient(), now = Date.now();
  const q = useQuery({ queryKey: REST_KEY, queryFn: () => office<{ rest?: RestMap }>("bots/rest").then((j) => j.rest || {}), staleTime: 30_000, refetchInterval: 60_000, retry: false });
  const cur: Rest | undefined = q.data?.[r.who], on = restOn(cur, now);
  const [codes, setCodes] = useState<string[]>([]), [mins, setMins] = useState(60);   // mins 0 = 풀 때까지
  const name = (c: string) => roleOf(c, true) || skills[c] || c;
  const send = useMutation({
    mutationFn: (turnOn: boolean) => office<{ ok?: boolean; rest?: RestMap }>("bots/rest", { method: "POST", body: JSON.stringify(restBody(r.who, turnOn, codes, untilOf(mins, Date.now()))) }),
    onSuccess: (j) => { if (j.rest) qc.setQueryData(REST_KEY, j.rest); else void qc.invalidateQueries({ queryKey: REST_KEY }); void qc.invalidateQueries({ queryKey: ["nomute", "bots-sheet"] }); },
  });
  const mine = [...new Set(r.skills || [])], pick = codes.length ? codes.map(name).join(" · ") : "전부", sum = useRef<HTMLSpanElement>(null);
  const sumOf = (m: number) => `${pick} · ${m ? `${endKo(untilOf(m, Date.now()), Date.now())} 까지` : "풀 때까지"}`;
  const err = send.error ? <em className="err" role="alert">안 됨 · {why(send.error)}</em> : q.isError ? <em className="err">지금 값을 못 읽었어</em> : null;
  if (on) return (
    <div className="hold" data-busy={send.isPending ? "" : undefined}>
      <div className="srow"><span className="plbl">임시 멈춤</span><span className="sopts"><b className="sval on">{restKo(cur, now, name)}</b></span></div>
      <HoldBar mins={0} onChange={() => undefined} now={now} lock={{ pos: restPos(cur, now), text: cur.until ? durKo(Math.max(1, Math.round((cur.until - now) / 60e3))) : "풀 때까지" }} />
      <p className="foot"><span className="sum">{cur.by ? `${cur.by} 지정` : ""}</span>{err}<button type="button" className="go" disabled={send.isPending} onClick={() => send.mutate(false)}>풀기</button></p>
    </div>
  );
  return (
    <div className="hold" data-busy={send.isPending ? "" : undefined}>
      <Row label="임시 멈춤">{[
        <button key="all" type="button" className={`pc${codes.length ? "" : " on"}`} aria-pressed={!codes.length} onClick={() => setCodes([])}>전부</button>,
        ...mine.map((c) => <button key={c} type="button" className={`pc${codes.includes(c) ? " on" : ""}`} aria-pressed={codes.includes(c)} title={skills[c] || c} onClick={() => setCodes((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]))}>{name(c)}</button>),
      ]}</Row>
      <HoldBar mins={mins} onChange={setMins} onLive={(m) => { if (sum.current) sum.current.textContent = sumOf(m); }} now={now} />   {/* 끄는 동안 밑줄 글(끝나는 때)도 같이 따라감 · 리액트 0 */}
      <p className="foot">
        <span className="sum" ref={sum}>{sumOf(mins)}</span>{err}
        <button type="button" className={`pc${mins ? "" : " on"}`} aria-pressed={!mins} onClick={() => setMins((m) => (m ? 0 : 60))}>풀 때까지</button>
        <button type="button" className="go" disabled={send.isPending || q.isPending} onClick={() => send.mutate(true)}>멈춤</button>
      </p>
    </div>
  );
}

export function BotManage({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  const acct = (r as { acct?: string }).acct, left = (r as { acct_left?: string | number }).acct_left;
  return (
    <div className="nm-bm" aria-label={`${r.who} 관리`}>
      {r.brain === "클로드" ? <NextWinRows who={r.who} /> : null}
      {acct ? <div className="srow"><span className="plbl">계정</span><span className="sopts"><b className="sval">{acct}</b>{left != null && left !== "" ? <em>{typeof left === "number" ? `남은 ${left}` : String(left)}</em> : null}</span></div> : null}
      {r.pm ? null : <RestRows r={r} skills={skills} />}
    </div>
  );
}
