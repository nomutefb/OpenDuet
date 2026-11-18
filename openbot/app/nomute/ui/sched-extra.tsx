// 스케줄 화면의 접는 칸 셋 — 설정에 흩어져 있던 것을 일이 도는 자리로 옮김 · 셈 = ./kind-wait-logic.ts
//   형 11-17 03:0x 구름 맥 창 「웅 설정에서 더 여기에 붙일게 없는지 봐봐줘」 → 03:24 「응 그리고 너가 말한거 반영하고 너 의견 따를테니 묻지말고 진행해」
//   · 점검 = 설정 「점검표」(GET health · 다시 확인 = POST health/recheck · ./health.tsx 와 같은 길 · 같은 열쇠)
//   · 모아 깨우기 = 설정 「스케줄러 바꾸기」에서 여기만 있던 것(용건마다 모으는 시간 · POST schedule/set at kind · 숫자 칸 → 낱말 줄 · 지금 값 = 라임 · 바꾸기 = 그 자리 재확인)
//       나머지(루틴 상태 · 언제 · 봇)는 이미 이 화면 나무 · 일 판 · 봇 차단기 판에 같은 길로 있음 → 설정 줄은 걷음
//   · 그림 = 설정 「AI 썸네일 옵션」(러너가 읽는 그림 설정 · ./genopt.tsx 그대로)
//   꼴 = 「최근 바뀜」 카드(.nm-org-log) 한 벌 · 머리 줄을 누르면 펼침(닫힌 채로는 한 줄 · 고칠 것이 있으면 점검은 열려서 뜸)
import "./sched-extra.css";
import { Fragment, Suspense, lazy, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { Chev } from "./chev";
import { GoButton } from "./go-button";
import { MorphAsk } from "./morph-ask";
import { waitKo, waitOk, waitOpts } from "./kind-wait-logic";
const GenOptModal = lazy(() => import("./genopt").then((m) => ({ default: m.GenOptModal })));

export function Fold({ title, sub, tone, auto, children }: { title: string; sub?: string; tone?: "bad" | "wait"; auto?: boolean; children: ReactNode }) {
  const [o, setO] = useState<boolean | null>(null), open = o ?? !!auto;   // 손댄 적 없으면 auto(고칠 것 있음)를 따름
  return (
    <section className="nm-org-log nm-sx" aria-label={title}>
      <h3><button type="button" aria-expanded={open} onClick={() => setO(!open)}><b>{title}</b>{sub ? <small data-tone={tone}>{sub}</small> : null}<Chev dir={open ? "up" : "down"} size={14} /></button></h3>
      {open ? children : null}
    </section>
  );
}

type HRow = { id: string; name: string; state: "ready" | "unchecked" | "fix"; label: string; why: string; fix?: string };
type Health = { at: number; rows?: HRow[]; counts: { ready: number; unchecked: number; fix: number } };
const H_K: Record<HRow["state"], string> = { ready: "ok", unchecked: "wait", fix: "bad" };
/** 점검 — 다섯 줄(그록 웹훅 · 스케줄러 시계 · 수리 감시 · 거울 일꾼 · 직접 올리기) · 머리 줄 = 제일 나쁜 것 하나 */
export function HealthLog() {
  const qc = useQueryClient();
  const h = useQuery({ queryKey: ["nomute", "health"], queryFn: () => office<Health>("health"), refetchInterval: 60_000 });
  const re = useMutation({ mutationFn: () => office<Health>("health/recheck", { method: "POST" }), onSuccess: (j) => qc.setQueryData(["nomute", "health"], j) });
  const c = h.data?.counts, sub = h.isError ? "못 읽음" : !c ? "" : c.fix ? `고칠 것 ${c.fix}` : c.unchecked ? `확인 안 됨 ${c.unchecked}` : "다 준비됨";
  return (
    <Fold title="점검" sub={sub} tone={h.isError || c?.fix ? "bad" : c?.unchecked ? "wait" : undefined} auto={!!c?.fix}>
      <ol>
        {(h.data?.rows || []).map((r) => (
          <li key={r.id}><span className="min-w-0 flex-1"><b>{r.name}</b><small>{r.why}{r.fix ? ` · 고치는 법: ${r.fix}` : ""}</small></span><em data-k={H_K[r.state]}>{r.label}</em></li>
        ))}
      </ol>
      <GoButton className="nm-sched-chip nm-sx-go" disabled={re.isPending} go={() => re.mutateAsync()} busy="다시 보는 중">다시 확인</GoButton>
      {re.isError ? <p className="nm-sx-msg" role="alert">다시 확인 못 했어 — {re.error.message}</p> : null}
    </Fold>
  );
}

type Kind = { kind: string; ko?: string; delay_max?: number; ttl?: number };
/** 모아 깨우기 — 용건마다 한 줄(이름 · 기한 · 지금 값) · 누르면 그 밑에 낱말 줄(지금 값 = 라임 · 다른 낱말 = [아니오] [바꾸기]) */
export function KindWaits({ kinds, sha, can }: { kinds: Kind[]; sha: string; can: boolean }) {
  const qc = useQueryClient();
  const [openK, setOpenK] = useState(""), [msg, setMsg] = useState("");
  const set = useMutation({
    mutationFn: (v: { key: string; value: number }) => office("schedule/set", { method: "POST", body: JSON.stringify({ at: "kind", key: v.key, field: "delay_max", value: v.value, sha, dry: false }) }),
    onSuccess: () => { setMsg(""); void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] }); },
    onError: (e) => { const m = e instanceof Error ? e.message : String(e), moved = /changed/.test(m); setMsg(moved ? "다른 데서 바뀌었어. 새 표를 읽었으니 다시 골라 줘" : m); if (moved) void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] }); },
  });
  if (!kinds.length) return null;
  return (
    <Fold title="모아 깨우기" sub={`용건 ${kinds.length}`}>
      {msg ? <p className="nm-sx-msg" role="alert">{msg}</p> : null}
      <ol className="nm-sx-kinds" data-busy={set.isPending || undefined}>
        {kinds.map((k) => {
          const name = k.ko || k.kind, cur = k.delay_max, open = openK === k.kind;
          return (
            <li key={k.kind}>
              <button type="button" className="k" aria-expanded={open} onClick={() => setOpenK(open ? "" : k.kind)}>
                <b>{name}</b>{Number.isFinite(k.ttl) ? <small>기한 {waitKo(k.ttl as number)}</small> : null}<span className="v">{Number.isFinite(cur) ? waitKo(cur as number) : ""}</span>
              </button>
              {open ? (
                <span className="ws" role="group" aria-label={`${name} 모으는 시간`}>
                  {waitOpts(cur, k.ttl).map((v, i) => (
                    <Fragment key={v}>
                      {i ? <i aria-hidden>|</i> : null}
                      {v === cur || !can || !waitOk(v, k.ttl) ? <span className={v === cur ? "w on" : "w"} aria-current={v === cur || undefined}>{waitKo(v)}</span>
                        : <MorphAsk className="w" disabled={set.isPending} yesText="바꾸기" label={`${name} ${waitKo(v)}`} onYes={() => set.mutate({ key: k.kind, value: v })}>{waitKo(v)}</MorphAsk>}
                    </Fragment>
                  ))}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Fold>
  );
}

/** 그림 — AI 썸네일 옵션(켬끔 · 이미지 엔진 · 화풍 · 자세히) */
export function ThumbOptLog() {
  return <Fold title="그림" sub="AI 썸네일 옵션"><div className="nm-sx-gopt"><Suspense fallback={null}><GenOptModal /></Suspense></div></Fold>;
}
