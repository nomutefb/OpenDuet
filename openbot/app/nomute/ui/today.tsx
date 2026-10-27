// 할 일 맨 위 — 결정 카드(밤 요약 brief 「결정 필요」 · 답 = POST /api/office/brief/answer {key, v}) · 밤 요약 · 수리 접수 표(GET/POST /api/office/repair)
// 원본 OpenDuet 아침 카드·승인 카드 자리를 우리 서버 자료로(옛 화면 = viewer/office.html 밤 요약 판·수리 접수 판과 같은 규칙)
//   결정 카드 = 거절 · 이번만 허락 · (조용히) 나중에 → 「이번만 허락함 · 형 · 02:52」 확인 줄 · 1분 안 = 바꾸기 · 「늘 허락」 = 서버 can_always 가 올 때만(형 결정 대기 · 지금 0)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { office, peopleSync } from "../data/office";

type Answer = { v: string; by?: string; at?: string };
type BriefItem = { id: string; key: string; col: string; what: string; impact?: string; next?: string; at?: string; room?: string; refs?: { label?: string; id?: string; room?: string }[]; runs?: number; raw?: string[]; answer?: Answer | null };
type Brief = { label: string; counts: { decide: number; unchecked: number; resolved: number }; cols: { decide: BriefItem[]; unchecked: BriefItem[]; resolved: BriefItem[] }; can_answer?: boolean; can_always?: boolean };
type RepairItem = { no: number; id?: string; room?: string; from?: string; at?: string; kind?: string; title?: string; state: string; urgent?: boolean; issue?: number | null; url?: string; history?: { state: string; by?: string; at?: string; why?: string }[] };

const ANS: Record<string, string> = { yes: "이번만 허락함", no: "거절함", later: "나중에", always: "늘 허락함" };
const hmOf = (s?: string) => (s ? String(s).replace(/^\d{4}-(\d\d)-(\d\d)T(\d\d:\d\d).*$/, "$3") : "");
const atOf = (s?: string) => (s ? String(s).replace(/^\d{4}-(\d\d)-(\d\d)T(\d\d:\d\d).*$/, "$1-$2 $3") : "");
const nm = (w?: string) => { const p = peopleSync().find((x) => x.who === w); return p?.name || w || ""; };

export function useBrief() {
  return useQuery({ queryKey: ["nomute", "brief"], queryFn: () => office<{ brief: Brief; can_answer?: boolean; can_always?: boolean }>("brief?all=1").then((j) => ({ ...j.brief, can_answer: !!(j.can_answer || j.brief.can_answer), can_always: !!(j.can_always || j.brief.can_always) })), refetchInterval: 60_000 });
}

function DecisionCard({ x, can, always }: { x: BriefItem; can: boolean; always: boolean }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false), [open, setOpen] = useState(false);
  const ans = useMutation({
    mutationFn: (v: string) => office<{ brief?: Brief }>("brief/answer", { method: "POST", body: JSON.stringify({ key: x.key, v }) }),
    onSuccess: () => { setEdit(false); void qc.invalidateQueries({ queryKey: ["nomute", "brief"] }); },
  });
  const a = x.answer;
  const fresh = a?.at ? Date.now() - Date.parse(a.at) < 60e3 : false;
  const raw = (x.raw || []).join("\n"), long = raw.length > 600 || raw.split("\n").length > 10;
  return (
    <li className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-3">
      <p data-content className="text-sm font-semibold">{x.what}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {[x.room ? `어디: ${x.room}` : "", x.runs ? `${x.runs}번째` : "", x.at ? `언제: ${atOf(x.at)}` : "", x.next ? `누가: ${x.next}` : ""].filter(Boolean).join(" · ")}
      </p>
      {x.impact && x.impact !== "-" ? <p className="mt-1 text-sm">{x.impact}</p> : null}
      {raw ? (
        <>
          <pre className={`mt-2 whitespace-pre-wrap rounded-xl bg-muted p-2 text-xs ${long && !open ? "line-clamp-6" : ""}`}>{raw}</pre>
          {long ? <button type="button" className="mt-1 text-xs text-muted-foreground underline" onClick={() => setOpen((v) => !v)}>{open ? "접기" : `전부 보기 ${raw.length}자`}</button> : null}
        </>
      ) : null}
      {(x.refs || []).length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {(x.refs || []).map((r, i) => (
            <button key={`${r.label}-${i}`} type="button" className="rounded-full border border-border px-2 py-0.5 text-xs" disabled={!r.room && !x.room}
              onClick={() => void nav({ to: (r.room || x.room) === "all" ? "/" : "/channels/$channelId", params: { channelId: r.room || x.room || "all" } })}>
              {r.label || "근거"}
            </button>
          ))}
        </div>
      ) : null}
      {a && !edit ? (
        <p className="mt-2 text-xs text-muted-foreground">
          <b className="font-semibold text-foreground">{ANS[a.v] || a.v}</b> · {nm(a.by) || "형"} · {hmOf(a.at)}
          {fresh && can ? <button type="button" className="ml-2 underline" onClick={() => setEdit(true)}>바꾸기</button> : null}
        </p>
      ) : can ? (
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button type="button" disabled={ans.isPending} className="flex-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5" onClick={() => ans.mutate("no")}>거절</button>
            <button type="button" disabled={ans.isPending} className="flex-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background" onClick={() => ans.mutate("yes")}>이번만 허락</button>
          </div>
          {always ? <button type="button" disabled={ans.isPending} className="rounded-full border border-border px-4 py-2 text-sm" onClick={() => ans.mutate("always")}>늘 허락</button> : null}
          <button type="button" disabled={ans.isPending} className="self-center text-xs text-muted-foreground underline" onClick={() => ans.mutate("later")}>나중에</button>
        </div>
      ) : <p className="mt-2 text-xs text-muted-foreground">답은 형만 할 수 있어</p>}
      {ans.isError ? <p className="mt-1 text-xs text-destructive" role="alert">{/locked/.test(ans.error.message) ? "1분 지나 못 바꿈 — 바꾸려면 회의실에 새 글로" : /no_item/.test(ans.error.message) ? "그 항목이 이제 결정 필요에 없음 — 요약이 바뀜" : `답 못 남김 — ${ans.error.message}`}</p> : null}
    </li>
  );
}

const COLS: [keyof Brief["cols"], string, string][] = [
  ["unchecked", "확인 안 된 것", "text-foreground"],
  ["resolved", "해결됨", "text-muted-foreground"],
];

const RP_ST = ["확인", "진행", "해결", "반려", "재요청", "완료"];
const rpName = (v: string) => (v === "완료" ? "종료" : v);
const RP_G: [string, string, (s: string) => boolean][] = [
  ["볼 것", "신청자가 「종료」 누를 차례", (s) => s === "해결"],
  ["진행", "", (s) => s === "진행" || s === "재요청"],
  ["접수", "", (s) => s === "접수" || s === "확인"],
  ["반려", "까닭 보고 고쳐서 다시", (s) => s === "반려"],
];

function RepairRow({ x, arc }: { x: RepairItem; arc?: boolean }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [open, setOpen] = useState(false), [why, setWhy] = useState<string | null>(null);
  const set = useMutation({
    mutationFn: ({ state, w }: { state: string; w?: string }) => office(`repair/${x.no}`, { method: "POST", body: JSON.stringify({ state, ...(w ? { why: w } : {}) }) }),
    onSuccess: () => { setWhy(null); void qc.invalidateQueries({ queryKey: ["nomute", "repair"] }); },
  });
  return (
    <li className="py-2">
      <button type="button" className="flex w-full items-center gap-3 text-left text-sm" aria-expanded={open} disabled={arc} onClick={() => setOpen((v) => !v)}>
        <span className="shrink-0 tabular-nums text-muted-foreground">No.{x.no}</span>
        <span data-content className="min-w-0 flex-1 truncate">{x.urgent ? "🔥 " : ""}{x.title || x.kind}<span className="text-xs text-muted-foreground"> · {nm(x.from)} · {atOf(x.at)}</span></span>
        <span className={`shrink-0 text-xs font-medium ${x.state === "진행" ? "animate-pulse" : ""}`}>{rpName(x.state)}</span>
      </button>
      {open && !arc ? (
        <div className="mt-2 flex flex-col gap-2 rounded-xl bg-muted/60 p-2">
          {x.kind ? <p className="text-xs text-muted-foreground">구분: {x.kind}</p> : null}
          {(x.history || []).length ? (
            <ol className="flex flex-col gap-0.5 text-xs">
              {(x.history || []).map((h, i) => <li key={`${h.at}-${i}`}><span className="tabular-nums">{atOf(h.at)}</span> · {nm(h.by)} · <b>{rpName(h.state)}</b>{h.why ? ` — ${h.why}` : ""}</li>)}
            </ol>
          ) : null}
          <div className="flex flex-wrap gap-1" role="group" aria-label="처리상태 바꾸기">
            {RP_ST.filter((v) => v !== x.state).map((v) => (
              <button key={v} type="button" disabled={set.isPending} className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-foreground/5" onClick={() => (v === "반려" ? setWhy("") : set.mutate({ state: v }))}>{rpName(v)}</button>
            ))}
            {x.id ? <button type="button" className="rounded-full border border-border px-2.5 py-1 text-xs" onClick={() => void nav({ to: "/channels/$channelId", params: { channelId: x.room || "repair" } })}>그 글로 가기</button> : null}
            {x.url ? <a className="rounded-full border border-border px-2.5 py-1 text-xs" href={x.url} target="_blank" rel="noopener">이슈 {x.issue}</a> : null}
          </div>
          {why !== null ? (
            <div className="flex gap-2">
              <input className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm" placeholder="반려 까닭(명세 규정 어디가 안 맞나)" aria-label="반려 까닭" value={why} onChange={(e) => setWhy(e.target.value)} />
              <button type="button" className="rounded-full bg-foreground px-3 text-xs text-background" disabled={!why.trim() || set.isPending} onClick={() => set.mutate({ state: "반려", w: why.trim() })}>반려</button>
              <button type="button" className="text-xs" onClick={() => setWhy(null)}>취소</button>
            </div>
          ) : null}
          {set.isError ? <p className="text-xs text-destructive" role="alert">못 바꿈 — {set.error.message}</p> : null}
        </div>
      ) : null}
    </li>
  );
}

export function NomuteToday() {
  const brief = useBrief();
  const repair = useQuery({ queryKey: ["nomute", "repair"], queryFn: () => office<{ items: RepairItem[] }>("repair").then((j) => j.items || []), refetchInterval: 60_000 });
  const [arcOn, setArcOn] = useState(false);
  const ym = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 7).replace("-", "");
  const archive = useQuery({ queryKey: ["nomute", "repair", "archive", ym], queryFn: () => office<{ items: RepairItem[] }>(`repair?archive=${ym}`).then((j) => j.items || []), enabled: arcOn });
  const [open, setOpen] = useState<string | null>(null);
  const b = brief.data;
  const decide = b?.cols.decide || [];
  const reps = repair.data || [];
  const groups = RP_G.map(([t, sub, f]) => [t, sub, reps.filter((x) => f(x.state))] as const).concat([["그 밖", "", reps.filter((x) => !RP_G.some((g) => g[2](x.state)))] as const]);
  return (
    <section aria-label="오늘" className="mb-6 flex flex-col gap-3">
      {decide.length ? (
        <div className="rounded-3xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold">형 결정 필요 <span className="tabular-nums text-amber-600">{decide.length}</span></h2>
          <ul className="mt-2 flex flex-col gap-2">{decide.map((x) => <DecisionCard key={x.key} x={x} can={!!b?.can_answer} always={!!b?.can_always} />)}</ul>
        </div>
      ) : null}
      <div className="rounded-3xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="shrink-0 text-base font-semibold">밤 요약</h2>
          <span data-content className="truncate text-xs text-muted-foreground">{brief.isError ? "못 받았어" : b?.label || "받는 중…"}</span>
        </div>
        {b ? (
          <ul className="mt-2 flex flex-col">
            <li className="flex items-center justify-between border-b border-border py-2.5 text-sm"><span className="font-medium text-amber-700 dark:text-amber-300">형 결정 필요</span><span className="tabular-nums text-muted-foreground">{b.counts.decide ?? decide.length}</span></li>
            {COLS.map(([k, name, tone]) => {
              const items = b.cols[k] || [];
              const isOpen = open === k;
              return (
                <li key={k} className="border-b border-border last:border-b-0">
                  <button type="button" className="flex w-full items-center justify-between py-2.5 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : k)}>
                    <span className={`text-sm font-medium ${tone}`}>{name}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">{b.counts[k] ?? items.length}</span>
                  </button>
                  {isOpen && items.length ? (
                    <ul className="flex flex-col gap-2 pb-3">
                      {items.slice(0, 20).map((x) => (
                        <li key={x.id} className="text-sm">
                          <p className="line-clamp-2">{x.what}</p>
                          {x.impact && x.impact !== "-" ? <p className="line-clamp-2 text-xs text-muted-foreground">{x.impact}</p> : null}
                          {x.answer ? <p className="text-xs text-muted-foreground">{ANS[x.answer.v] || x.answer.v} · {nm(x.answer.by)} · {hmOf(x.answer.at)}</p> : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div className="rounded-3xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="shrink-0 text-base font-semibold">수리 접수</h2>
          <span className="text-xs text-muted-foreground">{repair.isError ? "못 받았어" : repair.isPending ? "받는 중…" : groups.filter((g, i) => i < 3 || g[2].length).map((g) => `${g[0]} ${g[2].length}`).join(" · ")}</span>
        </div>
        {reps.length ? groups.filter((g) => g[2].length).map(([t, sub, l]) => (
          <div key={t} className="mt-2">
            <p className="text-xs font-semibold">{t} <span className="tabular-nums">{l.length}</span>{sub ? <span className="font-normal text-muted-foreground"> · {sub}</span> : null}</p>
            <ul className="flex flex-col divide-y divide-border">{l.map((x) => <RepairRow key={x.no} x={x} />)}</ul>
          </div>
        )) : repair.isPending ? null : <p className="mt-2 text-sm text-muted-foreground">지금 걸린 요청 없음 — 종료된 건 「보관 보기」</p>}
        <button type="button" className="mt-3 rounded-full border border-border px-3 py-1 text-xs" aria-pressed={arcOn} onClick={() => setArcOn((v) => !v)}>보관 보기</button>
        {arcOn ? (
          archive.isPending ? <p className="mt-2 text-xs text-muted-foreground">받는 중…</p> : archive.isError ? <p className="mt-2 text-xs text-destructive">{archive.error.message}</p> : (
            <div className="mt-2"><p className="text-xs font-semibold">보관 {ym} · {(archive.data || []).length}건</p><ul className="flex flex-col divide-y divide-border">{(archive.data || []).map((x) => <RepairRow key={x.no} x={x} arc />)}</ul></div>
          )
        ) : null}
      </div>
    </section>
  );
}
