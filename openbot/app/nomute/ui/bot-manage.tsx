// 애들 화면 얼굴 펼침 = 그 애 관리 칸 — 다음 창 모델 · 노력도 / 계정 / 임시 멈춤을 그 자리에서 보고 바꿈(셈 = ./bot-manage-logic.ts)
//   형 11-16 19:36 dm-bom(봄 옮김) 「그 봇 내용이 거기에 표시되는 곳에 모델명 지정까지 붙여서 거기서 일괄 관리 페이지가 되길 바라는거임 노력도랑. … 한쪽에 몰아버리고 싳은거임.」
//   서버 = 이미 있는 길만: 모델 · 노력도 = profile/nextwin(설정 「모델 · 노력도」 · 러너 작동 표 끝 칸과 같은 값 · ./next-win.tsx) · 임시 멈춤 = bots/rest(빠르 #4053) · 계정 = 도표 줄 acct(읽기)
//   얼마를 먹나 = 펼친 애 하나일 때만 그림 · 받아오기 = nextwin(이미 60초 캐시) + rest 한 장(60초) · 움직임 = 누름 scale · 색뿐
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { type BotRow, roleOf } from "./bot-desk-logic";
import { type Rest, type RestMap, type UntilKey, UNTIL_KO, restBody, restKo, restOn, untilOf } from "./bot-manage-logic";
import { NW_EFFORTS, NW_MODELS, type NextWin, nwDefault, useNextWin } from "./next-win";
import { useMe } from "./pins";

const NW_KEY = ["nomute", "nextwin"], REST_KEY = ["nomute", "bots-rest"];
const why = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** 다음 새 창의 모델 · 노력도 — 형 = 누르면 바로 저장 · 그 밖 = 지금 값만. 클로드 몸(봇 상자)만. */
function NextWinRow({ who }: { who: string }) {
  const q = useNextWin(), me = useMe(), qc = useQueryClient();
  const got = q.data?.[who], cur = got || nwDefault(who), can = me?.kind === "human" && me.can_write !== false;
  const save = useMutation({
    mutationFn: (v: NextWin) => office<{ nextwin?: Record<string, NextWin> }>("profile/nextwin", { method: "POST", body: JSON.stringify({ who, model: v.model, effort: v.effort }) }),
    onSuccess: (j) => { if (j.nextwin) qc.setQueryData(NW_KEY, j.nextwin); else void qc.invalidateQueries({ queryKey: NW_KEY }); },
  });
  return (
    <div className="row" data-busy={save.isPending ? "" : undefined}>
      <span className="k">다음 창</span>
      <span className="v">
        <span className="seg" role="radiogroup" aria-label={`${who} 다음 창 모델`}>{NW_MODELS.map(([id, ko]) => <button key={id} type="button" role="radio" aria-checked={cur.model === id} disabled={!can || save.isPending} onClick={() => { if (cur.model !== id) save.mutate({ ...cur, model: id }); }}>{ko}</button>)}</span>
        <span className="seg" role="radiogroup" aria-label={`${who} 다음 창 노력도`}>{NW_EFFORTS.map((x) => <button key={x} type="button" role="radio" aria-checked={cur.effort === x} disabled={!can || save.isPending} onClick={() => { if (cur.effort !== x) save.mutate({ ...cur, effort: x }); }}>{x}</button>)}</span>
        {save.error ? <em className="err" role="alert">저장 안 됨 · {why(save.error)}</em> : !got || got.default ? <em>기본값</em> : null}
      </span>
    </div>
  );
}

/** 임시 멈춤 — 갈래(전부 · 그 애 특기) + 언제까지 → 「멈춤」 · 걸려 있으면 한 줄 + 「풀기」. 자동 배정이 그 기한까지 그 갈래에서 뺌(서버). */
function RestRow({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  const qc = useQueryClient(), now = Date.now();
  const q = useQuery({ queryKey: REST_KEY, queryFn: () => office<{ rest?: RestMap }>("bots/rest").then((j) => j.rest || {}), staleTime: 30_000, refetchInterval: 60_000, retry: false });
  const cur: Rest | undefined = q.data?.[r.who], on = restOn(cur, now);
  const [codes, setCodes] = useState<string[]>([]), [until, setUntil] = useState<UntilKey>("1h");
  const name = (c: string) => roleOf(c, true) || skills[c] || c;
  const send = useMutation({
    mutationFn: (turnOn: boolean) => office<{ ok?: boolean; rest?: RestMap }>("bots/rest", { method: "POST", body: JSON.stringify(restBody(r.who, turnOn, codes, untilOf(until, Date.now()))) }),
    onSuccess: (j) => { if (j.rest) qc.setQueryData(REST_KEY, j.rest); else void qc.invalidateQueries({ queryKey: REST_KEY }); void qc.invalidateQueries({ queryKey: ["nomute", "bots-sheet"] }); },
  });
  const mine = [...new Set(r.skills || [])];
  return (
    <div className="row" data-busy={send.isPending ? "" : undefined}>
      <span className="k">임시 멈춤</span>
      <span className="v">
        {on ? (
          <><b className="on">{restKo(cur, now, name)}</b><button type="button" className="go" disabled={send.isPending} onClick={() => send.mutate(false)}>풀기</button></>
        ) : (
          <>
            <span className="seg" role="group" aria-label={`${r.who} 멈출 갈래`}>
              <button type="button" aria-pressed={!codes.length} onClick={() => setCodes([])}>전부</button>
              {mine.map((c) => <button key={c} type="button" aria-pressed={codes.includes(c)} title={skills[c] || c} onClick={() => setCodes((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]))}>{name(c)}</button>)}
            </span>
            <span className="seg" role="radiogroup" aria-label={`${r.who} 언제까지`}>{UNTIL_KO.map(([k, ko]) => <button key={k} type="button" role="radio" aria-checked={until === k} onClick={() => setUntil(k)}>{ko}</button>)}</span>
            <button type="button" className="go" disabled={send.isPending || q.isPending} onClick={() => send.mutate(true)}>멈춤</button>
          </>
        )}
        {send.error ? <em className="err" role="alert">안 됨 · {why(send.error)}</em> : q.isError ? <em className="err">지금 값을 못 읽었어</em> : null}
      </span>
    </div>
  );
}

export function BotManage({ r, skills }: { r: BotRow; skills: Record<string, string> }) {
  const acct = (r as { acct?: string }).acct, left = (r as { acct_left?: string | number }).acct_left;
  return (
    <div className="nm-bm" aria-label={`${r.who} 관리`}>
      {r.brain === "클로드" ? <NextWinRow who={r.who} /> : null}
      {acct ? <div className="row"><span className="k">계정</span><span className="v"><b>{acct}</b>{left != null && left !== "" ? <em>{typeof left === "number" ? `남은 ${left}` : String(left)}</em> : null}</span></div> : null}
      {r.pm ? null : <RestRow r={r} skills={skills} />}
    </div>
  );
}
