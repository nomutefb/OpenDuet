// 애들 화면 얼굴 펼침 = 그 애 관리 칸 — 다음 창 모델 · 노력도 / 계정 / 임시 멈춤을 그 자리에서 보고 바꿈(셈 = ./bot-manage-logic.ts)
//   형 11-16 19:36 dm-bom(봄 옮김) 「그 봇 내용이 거기에 표시되는 곳에 모델명 지정까지 붙여서 거기서 일괄 관리 페이지가 되길 바라는거임 노력도랑. … 한쪽에 몰아버리고 싳은거임.」
//   꼴(형 20:5x 구름 맥 창 「알약으로 선택하면 비효율 이니 그 영상에디터에 이미 css가 잇거든? 이거 참고해서 구현해줘」 · 「기간 설정은 이것도 참고해보고.」):
//     · 고르는 줄 = 옛 에디터 영상 편집 「자막 스타일 | 가라오케 | 강조」 줄 그대로(edit.html .srow · .plbl · .sopts · .pc · .ssep = 이름표 왼쪽 굵게 · 값은 오른쪽 낱말 · 사이 흐린 | · 고른 낱말만 강조색) — 값은 ./bot-desk.css 에 옮김
//     · 기간 = 형 영상(24시간 길 위 막대의 오른쪽 손잡이를 끌어 늘림 · 막대 안에 걸리는 시간 · 저장하면 잠김) + 앱에 있던 유지 시간 막대(./day-slide.tsx)와 같은 결
//   서버 = 이미 있는 길만: 모델 · 노력도 = profile/nextwin(./next-win.tsx) · 임시 멈춤 = bots/rest(빠르 #4053) · 계정 = 도표 줄 acct(읽기)
//   움직임 = 끄는 동안 리액트를 안 거치고 그 막대의 transform 만 바꿈(합성 단계 · 60프레임) · 놓으면 30분 칸에 붙음
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Children, Fragment, type ReactNode, Suspense, lazy, useState } from "react";
import { office, people } from "../data/office";
import { MorphAsk } from "./morph-ask";   // 그 자리 재확인(모달 0 · 누른 낱말이 [아니오(라임)] [예] 로 번지며 바뀜) — 형 11-16 21:4x 구름 맥 창 영상(Mark as Done → Done | Undo) 「항상 그냥 re 토글로만」 · 앱 하네스 그대로
import { sameOf } from "./model-set-logic";
import { pmCandidates } from "./pm-set-logic";
import { type BotRow, roleOf } from "./bot-desk-logic";
import { acctTag } from "../data/acct-time";   // 계정 글자 = 러너 표와 같은 꼴(C·N · C·G · C·M · C·T · 형 11-18 「그렇게 해서 표기를 토잉ㄹ해줘」)
import { type GrokRt, type Rest, type RestMap, acctKo, restBody, restKo, restOn, rtCount, rtLine } from "./bot-manage-logic";
import { Chev } from "./chev";
import { NW_EFFORTS, NW_MODELS, type NextWin, nwDefault, useNextWin } from "./next-win";
import { BOT_EFFORTS, BOT_MODELS, PickRow } from "./model-set";
import { useMe } from "./pins";
import { HEALTH_KO, StatusDot, agoKo } from "./sched-bits";
import { catRows, statusOpts } from "./status-q";   // 그록 애 연결 줄(웹훅 · 토큰) = 러너 층과 같은 답

const NW_KEY = ["nomute", "nextwin"], REST_KEY = ["nomute", "bots-rest"], WAKE_KEY = ["nomute", "wakeset"] as const, PM_KEY = ["nomute", "pm"] as const;
const AcctPrio = lazy(() => import("./acct-prio").then((m) => ({ default: m.AcctPrio })));   // 계정 우선순위 카드 다발(설정에서 옮김 · 펼칠 때만 받음)
import { NoticeBox, useNoteMeta } from "./notice-box";   // 그록봇 공지 = 설정 「공지」와 같은 부품(형 11-17 06:56 · 앞 이름 「그록봇 지침」 메모 · 이제 그록 애들이 깰 때 받는 진짜 공지)
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
  // 모델 · 노력도 = 「일 모델」 판과 같은 줄 · 같은 고르기 칸(./model-set.tsx PickRow · 형 11-18 19:01 dm-gik 깃 옮김 「이 형탸로 아래 너희들 모델 선택 도 하네스가 맞아야함」 · 「눌럿을때 투박하게 고르지 않게해주고 높은거부터 나오게해줘 미토스 부터」 · 앞 판 = 알약 넷 + ‹ 낱말 › 넘김)
  return (
    <div className="nm-ms nm-bm-ms">
      <PickRow label="다음 창" sub={got ? undefined : "안 고름"} dimModel={!got} dimEffort={!got} pick={{ model: cur.model, effort: cur.effort }} models={BOT_MODELS} efforts={BOT_EFFORTS} can={can} busy={save.isPending} onPick={(p) => save.mutate({ ...cur, ...p })} />
      {save.error ? <p className="note err" role="alert">저장 안 됨 · {why(save.error)}</p> : null}
    </div>
  );
}


/** 계정 줄 + 쉼 토글 — 「계정 ems1130g (잔여 82%) …… 쉼 ◯」 · 이름과 잔여는 라임 · 토글 = 켜면 바로 쉼(전부 · 풀 때까지) · 끄면 풂(서버 bots/rest · 자동 배정이 그 애를 뺌)
 *  앞 꼴(「임시 멈춤 없음 | 걸기」 → 갈래 · 기간 막대 → 「멈춤」)은 걷음 — 형 11-17 07:53 「쉬게하는 버튼은 토글 형식으로해서 / 계정 라인으로 붙이고」 · 다른 데서 갈래 · 기한을 걸어 둔 쉼은 토글 옆에 그대로 적음 */
function AcctRestRow({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  const qc = useQueryClient(), me = useMe(), can = me?.kind === "human" && me.can_write !== false, now = Date.now();
  const a = acctKo((r as { acct?: string }).acct, (r as { acct_left?: string | number }).acct_left);
  const q = useQuery({ queryKey: REST_KEY, queryFn: () => office<{ rest?: RestMap }>("bots/rest").then((j) => j.rest || {}), staleTime: 30_000, refetchInterval: 60_000, retry: false, enabled: !r.pm });
  const cur: Rest | undefined = q.data?.[r.who], on = restOn(cur, now);
  const send = useMutation({
    mutationFn: (turnOn: boolean) => office<{ ok?: boolean; rest?: RestMap }>("bots/rest", { method: "POST", body: JSON.stringify(restBody(r.who, turnOn, [], undefined)) }),
    onSuccess: (j) => { if (j.rest) qc.setQueryData(REST_KEY, j.rest); else void qc.invalidateQueries({ queryKey: REST_KEY }); void qc.invalidateQueries({ queryKey: ["nomute", "bots-sheet"] }); },
  });
  const name = (c: string) => roleOf(c, true) || skills[c] || c, shown = send.isPending ? send.variables === true : on;   // 누른 쪽으로 먼저 움직임
  const detail = on && cur && (cur.until || cur.codes?.length) ? restKo(cur, now, name) : "";
  if (!a.name && r.pm) return null;
  return (
    <div className="srow acct">
      <span className="plbl">{a.name ? "계정" : "쉼"}</span>
      {a.name ? <span className="acctv" title={a.name}><b>{acctTag(a.name)}</b>{a.left ? <> (<b>{a.left}</b>)</> : null}</span> : null}
      {r.pm ? null : (
        <span className="rest">
          {send.error ? <em className="err" role="alert">안 됨 · {why(send.error)}</em> : q.isError ? <em className="err">못 읽음</em> : detail ? <em>{detail}</em> : null}
          {a.name ? <span className="rl">쉼</span> : null}
          <button type="button" role="switch" className="sw" aria-checked={shown} aria-label={`${r.who} 쉼`} disabled={!can || q.isPending || send.isPending} onClick={() => send.mutate(!on)}><i aria-hidden /></button>
        </span>
      )}
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

/** 그록 쪽 애한테만 — 호출 맥락(깰 때 같이 받는 최근 글 수 · 그록 깸 공통) · 그록봇 공지(공통 · 그록 애들이 깰 때 받음). 설정에서 옮김(형 11-16 19:36 「그록봇도 따로 설정에 나오는거로 아는데 한쪽에 몰아버리고 싳은거임」). */
function GrokRows() {
  const qc = useQueryClient(), me = useMe(), can = me?.kind === "human" && me.can_write !== false;
  const q = useQuery({ queryKey: WAKE_KEY, queryFn: () => office<{ set: { recent: number } }>("wakeset").then((j) => j.set), staleTime: 60_000, retry: false });
  const go = useMutation({ mutationFn: (recent: number) => office<{ set: { recent: number } }>("wakeset", { method: "POST", body: JSON.stringify({ recent }) }).then((j) => j.set), onSuccess: (set) => qc.setQueryData(WAKE_KEY, set) });
  const now = q.data?.recent, [note, setNote] = useState(false);
  const meta = useNoteMeta("grok");   // 「판 1 · 11-17」 = 칸 밖(줄 오른쪽)
  return (
    <>
      <Row label="호출 맥락" note={go.error ? <em className="err" role="alert">안 됨 · {why(go.error)}</em> : null}>{WAKE_STEPS.map((n) => <button key={n} type="button" className={`pc${now === n ? " on" : ""}`} aria-pressed={now === n} disabled={!can || now === undefined || go.isPending} onClick={() => { if (now !== n) go.mutate(n); }}>{n}개</button>)}</Row>
      <Row label="그록봇 공지">{[...(meta ? [<b key="m" className="sval off">{meta}</b>] : []), <button key="o" type="button" className={`pc${note ? " on" : ""}`} aria-expanded={note} onClick={() => setNote((v) => !v)}>{note ? "접기" : "열기"}</button>]}</Row>
      {note ? <div className="sub"><NoticeBox kind="grok" onClose={() => setNote(false)} /></div> : null}
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

/** 그록 애 연결 — 그 애 웹훅(깨우는 문) · 그 애 자동화(하나씩: 이름 · 계기 · 마지막 실행) · 토큰(그 목록을 읽은 그록 계정이 살아 있나 · 마지막 확인)
 *  옛 러너 층 「봇 연결」 · 「그록봇 토큰」 칸(그록 통째 한 줄 「자동화 13 · 웹훅 7」)을 그 애 카드로 쪼갬
 *  (형 11-19 「그록봇 토큰도 세분화해서 맨 위에 애들이랑 통합」 · 「봇 연결은 맨 위에 애들 작업중인 내역 눌러서 확인할 수 있는건데」) · 자동화 목록에 없는 애 = 그 말 한 줄(지어내지 않음) */
function GrokLink({ who }: { who: string }) {
  const d = useQuery(statusOpts()).data;
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: { who: string; routines?: GrokRt[] | null }[] }>("bots").then((j) => j.bots || []), staleTime: 60_000 }).data;
  const door = catRows(d, "bots").find((x) => x.name === who)?.cells?.["깨우는 문"];
  const tok = catRows(d, "tok_grok")[0], rts = bots?.find((b) => b.who === who)?.routines || null, cnt = rts ? rtCount(rts).n : 0;
  if (!door && !tok && !rts) return null;
  const tokKo = !tok ? "" : !cnt ? "자동화 목록에 없음" : tok.st === "ok" ? (tok.last_at ? `확인 ${agoKo(tok.last_at)}` : HEALTH_KO.ok) : tok.note || HEALTH_KO[tok.st];   // 수는 바로 윗줄(자동화)이 하나씩 보여 줌 → 여기선 목록을 읽은 계정이 살아 있나만(되풀이 0)
  return (
    <>
      {door ? <Row label="웹훅">{[<span key="d" className="sval lk" data-st={door.st}><StatusDot st={door.st} />{door.note || HEALTH_KO[door.st]}</span>]}</Row> : null}
      {rts?.length ? <Row label="자동화">{rts.map(rtLine).map((x, i) => <span key={i} className="sval lk" data-st={x.st}><StatusDot st={x.st} />{[x.name, x.how, x.at ? agoKo(x.at) : ""].filter(Boolean).join(" · ")}</span>)}</Row> : null}
      {tok ? <Row label="토큰">{[<span key="t" className="sval lk" data-st={cnt ? tok.st : "unknown"} title={tok.name}><StatusDot st={cnt ? tok.st : "unknown"} />{tokKo}</span>]}</Row> : null}
    </>
  );
}

export function BotManage({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  return (
    <div className="nm-bm" aria-label={`${r.who} 관리`}>
      {r.brain === "클로드" || r.who === "구름" ? <NextWinRows who={r.who} /> : null}   {/* 구름 = 클라우드 세션(자리 cloud · brain 칸이 비어 옴)도 다음 창 모델 · 노력도(형 11-17 09:49 dm-bom 봄 옮김 「구름도 여는 모델을 설정에서 조정가능하게 … 러너 설정인가 ?」 · 서버 표엔 11-16 부터 구름 줄 있음) */}
      <AcctRestRow r={r} skills={skills} />
      {r.brain === "그록" ? <><GrokLink who={r.who} /><GrokRows /></> : null}
      {r.pm ? <PmRow who={r.who} /> : null}
    </div>
  );
}
