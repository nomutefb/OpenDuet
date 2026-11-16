// 애들 화면 얼굴 펼침 = 그 애 관리 칸 — 다음 창 모델 · 노력도 / 계정 / 임시 멈춤을 그 자리에서 보고 바꿈(셈 = ./bot-manage-logic.ts)
//   형 11-16 19:36 dm-bom(봄 옮김) 「그 봇 내용이 거기에 표시되는 곳에 모델명 지정까지 붙여서 거기서 일괄 관리 페이지가 되길 바라는거임 노력도랑. … 한쪽에 몰아버리고 싳은거임.」
//   꼴(형 20:5x 구름 맥 창 「알약으로 선택하면 비효율 이니 그 영상에디터에 이미 css가 잇거든? 이거 참고해서 구현해줘」 · 「기간 설정은 이것도 참고해보고.」):
//     · 고르는 줄 = 옛 에디터 영상 편집 「자막 스타일 | 가라오케 | 강조」 줄 그대로(edit.html .srow · .plbl · .sopts · .pc · .ssep = 이름표 왼쪽 굵게 · 값은 오른쪽 낱말 · 사이 흐린 | · 고른 낱말만 강조색) — 값은 ./bot-desk.css 에 옮김
//     · 기간 = 형 영상(24시간 길 위 막대의 오른쪽 손잡이를 끌어 늘림 · 막대 안에 걸리는 시간 · 저장하면 잠김) + 앱에 있던 유지 시간 막대(./day-slide.tsx)와 같은 결
//   서버 = 이미 있는 길만: 모델 · 노력도 = profile/nextwin(./next-win.tsx) · 임시 멈춤 = bots/rest(빠르 #4053) · 계정 = 도표 줄 acct(읽기)
//   움직임 = 끄는 동안 리액트를 안 거치고 그 막대의 transform 만 바꿈(합성 단계 · 60프레임) · 놓으면 30분 칸에 붙음
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Children, type CSSProperties, Fragment, type ReactNode, Suspense, lazy, useRef, useState } from "react";
import { office, people } from "../data/office";
import { MorphAsk } from "./morph-ask";   // 그 자리 재확인(모달 0 · 누른 낱말이 [아니오(라임)] [예] 로 번지며 바뀜) — 형 11-16 21:4x 구름 맥 창 영상(Mark as Done → Done | Undo) 「항상 그냥 re 토글로만」 · 앱 하네스 그대로
import { sameOf } from "./model-set-logic";
import { pmCandidates } from "./pm-set-logic";
import { type BotRow, roleOf } from "./bot-desk-logic";
import { HOLD_MAX, HOLD_STEP, type Rest, type RestMap, durKo, endKo, minsAt, posOf, restBody, restKo, restOn, restPos, ticksOf, untilOf } from "./bot-manage-logic";
import { NW_EFFORTS, NW_MODELS, type NextWin, nwDefault, useNextWin } from "./next-win";
import { useMe } from "./pins";

const NW_KEY = ["nomute", "nextwin"], REST_KEY = ["nomute", "bots-rest"], WAKE_KEY = ["nomute", "wakeset"] as const, PM_KEY = ["nomute", "pm"] as const;
const AcctPrio = lazy(() => import("./acct-prio").then((m) => ({ default: m.AcctPrio })));   // 계정 우선순위 카드 다발(설정에서 옮김 · 펼칠 때만 받음)
const GrokNote = lazy(() => import("./grok-note").then((m) => ({ default: m.GrokNote })));   // 그록봇 지침 메모(설정에서 옮김 · 펼칠 때만 받음)
const WAKE_STEPS = [5, 10, 20, 30, 50];   // 호출 맥락 = 깰 때 같이 받는 최근 글 수(./wake-depth.tsx 와 같은 값 · 서버 wakeset)
const why = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** 고르는 줄 하나 — 이름표 + 오른쪽 낱말들(사이 |). */
function Row({ label, children, note }: { label: string; children: ReactNode; note?: ReactNode }) {
  const kids = Children.toArray(children).filter((c) => typeof c !== "string" || c.trim());   // 납작하게 편 낱말들(빈칸 글 뺌) → 사이마다 |
  return (
    <div className="srow">
      <span className="plbl">{label}</span>
      <span className="sopts">{kids.map((c, i) => <Fragment key={i}>{i ? <span className="ssep" aria-hidden>|</span> : null}{c}</Fragment>)}{note}</span>
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
      <p className="foot"><span className="sum" />{err}<button type="button" className="go" disabled={send.isPending} onClick={() => send.mutate(false)}>풀기</button></p>
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

/** PM 바꾸기 — 후보 이름을 낱말로 · 고르면 한 번 되묻고 저장(서버 POST pm · 설정 「PM」에서 옮김 · 형 11-15 「PM을 설정에서 지정할 수 있게」 → 11-16 19:36 「한쪽에 몰아버리고」). */
function PmRow({ who }: { who: string }) {
  const qc = useQueryClient(), me = useMe();
  const q = useQuery({ queryKey: PM_KEY, queryFn: () => office<{ who?: string; can_edit?: boolean }>("pm"), staleTime: 60_000 });
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const can = q.data ? q.data.can_edit !== false : me?.kind === "human", cur = q.data?.who || who;
  const [open, setOpen] = useState(false);
  const go = useMutation({
    mutationFn: (next: string) => office<{ who?: string }>("pm", { method: "POST", body: JSON.stringify({ who: next }) }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: PM_KEY }); const fresh = await people(true).catch(() => null); if (fresh) { qc.setQueryData(["nomute", "people"], fresh); qc.setQueryData(["nomute", "people-tabs"], fresh); } void qc.invalidateQueries({ queryKey: ["nomute", "bots-sheet"] }); setOpen(false); },
  });
  return (
    <>
      <Row label="PM" note={go.error ? <em className="err" role="alert">안 됨 · {why(go.error)}</em> : null}>{open
        ? pmCandidates(list).map((p) => p.who === cur ? <button key={p.who} type="button" className="pc on" aria-pressed>{p.name || p.who}</button> : <MorphAsk key={p.who} className="pc" disabled={!can || go.isPending} label={`PM 을 ${p.name || p.who}(으)로`} onYes={() => go.mutate(p.who)}>{p.name || p.who}</MorphAsk>)   /* 낱말을 누르면 그 자리에서 [아니오] [예] */
        : [<b key="cur" className="sval on">{cur}</b>, <button key="chg" type="button" className="pc" disabled={!can} onClick={() => setOpen(true)}>바꾸기</button>]}</Row>
    </>
  );
}

/** 그록 쪽 애한테만 — 호출 맥락(깰 때 같이 받는 최근 글 수 · 그록 깸 공통) · 그록봇 지침 메모(공통 · 반영 0). 설정에서 옮김(형 11-16 19:36 「그록봇도 따로 설정에 나오는거로 아는데 한쪽에 몰아버리고 싳은거임」). */
function GrokRows() {
  const qc = useQueryClient(), me = useMe(), can = me?.kind === "human" && me.can_write !== false;
  const q = useQuery({ queryKey: WAKE_KEY, queryFn: () => office<{ set: { recent: number } }>("wakeset").then((j) => j.set), staleTime: 60_000, retry: false });
  const go = useMutation({ mutationFn: (recent: number) => office<{ set: { recent: number } }>("wakeset", { method: "POST", body: JSON.stringify({ recent }) }).then((j) => j.set), onSuccess: (set) => qc.setQueryData(WAKE_KEY, set) });
  const now = q.data?.recent, [note, setNote] = useState(false);
  return (
    <>
      <Row label="호출 맥락" note={go.error ? <em className="err" role="alert">안 됨 · {why(go.error)}</em> : null}>{WAKE_STEPS.map((n) => <button key={n} type="button" className={`pc${now === n ? " on" : ""}`} aria-pressed={now === n} disabled={!can || now === undefined || go.isPending} onClick={() => { if (now !== n) go.mutate(n); }}>{n}개</button>)}</Row>
      <Row label="그록봇 지침">{[<button key="o" type="button" className={`pc${note ? " on" : ""}`} aria-expanded={note} onClick={() => setNote((v) => !v)}>{note ? "접기" : "메모 열기"}</button>]}</Row>
      {note ? <div className="sub"><Suspense fallback={null}><GrokNote /></Suspense></div> : null}
    </>
  );
}

/** 「모두」 일괄 — 클로드 몸 전부의 다음 창 모델 · 노력도를 한 번에(누른 낱말이 그 자리에서 [아니오(라임)] [예] 로 바뀜 = 모달 0 · 봄 11-16 21:30 「누르기 전에 한 번 되묻는 칸」 · 형 21:4x 「항상 그냥 re 토글로만」) + 계정 우선순위. 설정 「모델 · 노력도」 봇 상자 「모두」 줄 · 「계정 우선순위」에서 옮김. */
export function BotManageAll() {
  const q = useNextWin(), me = useMe(), qc = useQueryClient(), can = me?.kind === "human" && me.can_write !== false;
  const rows = Object.values(q.data || {}), n = rows.length;
  const [prio, setPrio] = useState(false);
  const save = useMutation({
    mutationFn: (v: { model?: string; effort?: string }) => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin", { method: "POST", body: JSON.stringify({ all: true, ...v }) }),
    onSuccess: (j) => { if (j.nextwin) qc.setQueryData(NW_KEY, j.nextwin); else void qc.invalidateQueries({ queryKey: NW_KEY }); },
  });
  const model = sameOf(rows, "model"), effort = sameOf(rows, "effort"), off = !can || save.isPending || !n;
  return (
    <div className="nm-bm all" aria-label="모두 한 번에">
      <Row label="모델">{NW_MODELS.map(([id, ko]) => model === id ? <button key={id} type="button" className="pc on" aria-pressed>{ko}</button> : <MorphAsk key={id} className="pc" disabled={off} label={`모두 모델 ${ko}`} onYes={() => save.mutate({ model: id })}>{ko}</MorphAsk>)}</Row>
      <Row label="노력도" note={save.error ? <em className="err" role="alert">저장 안 됨 · {why(save.error)}</em> : null}>{NW_EFFORTS.map((x) => effort === x ? <button key={x} type="button" className="pc on" aria-pressed>{x}</button> : <MorphAsk key={x} className="pc" disabled={off} label={`모두 노력도 ${x}`} onYes={() => save.mutate({ effort: x })}>{x}</MorphAsk>)}</Row>
      <Row label="계정 우선순위">{[<button key="o" type="button" className={`pc${prio ? " on" : ""}`} aria-expanded={prio} onClick={() => setPrio((v) => !v)}>{prio ? "접기" : "차례 보기"}</button>]}</Row>
      {prio ? <div className="sub"><Suspense fallback={null}><AcctPrio /></Suspense></div> : null}
    </div>
  );
}

export function BotManage({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  const acct = (r as { acct?: string }).acct, left = (r as { acct_left?: string | number }).acct_left;
  return (
    <div className="nm-bm" aria-label={`${r.who} 관리`}>
      {r.brain === "클로드" ? <NextWinRows who={r.who} /> : null}
      {acct ? <div className="srow"><span className="plbl">계정</span><span className="sopts"><b className="sval">{acct}</b>{left != null && left !== "" ? <em>{typeof left === "number" ? `남은 ${left}` : String(left)}</em> : null}</span></div> : null}
      {r.brain === "그록" ? <GrokRows /> : null}
      {r.pm ? <PmRow who={r.who} /> : <RestRows r={r} skills={skills} />}
    </div>
  );
}
