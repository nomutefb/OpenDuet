// 스케줄(형 10-31 「각 봇에 연결된 스케줄만 조정할 수 있는 인터페이스가 우리 사무실과 동일한 형태로 구성되어야 하고 사무실 안에 들어가야되는데, 일단은 메뉴 4번」)
//   꼴 = 대화방 목록(얼굴 줄 · 누르면 펼침) · 서버 = GET schedule · POST schedule/set(형만 · dry = 미리 보기) · 저장 흐름 = 설정 NomuteSchedule 과 같음 · 사건 모아 깨우기는 설정에만
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { idOf, office, people } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { CF_KO, ST_KO, type SchedQ, type SchedSetRes, cfVal, cronShow, nextShort, useSched } from "./settings-extra";

export function SchedDesk() {
  const qc = useQueryClient(), s = useSched(), d = s.data, can = !!d?.can_set;
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [open, setOpen] = useState(""), [ask, setAsk] = useState<{ q: SchedQ; r: SchedSetRes } | null>(null), [msg, setMsg] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => { setVals({}); }, [d?.sha]);
  const go = useMutation({
    mutationFn: ({ q, dry }: { q: SchedQ; dry: boolean }) => office<SchedSetRes>("schedule/set", { method: "POST", body: JSON.stringify({ at: q.at, key: q.key, field: q.field, value: q.value, sha: d?.sha, dry }) }),
    onSuccess: (r, { q, dry }) => {
      if (r.same) { setAsk(null); setMsg(`이미 ${cfVal(q.field, q.value)}이야`); return; }
      if (dry) { setAsk({ q, r }); setMsg(""); return; }
      setAsk(null);
      setMsg(`바뀜 · ${q.label} ${cfVal(q.field, r.from)} → ${cfVal(q.field, r.to)}`);
      void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
    onError: (e) => {
      setAsk(null);
      const m = e instanceof Error ? e.message : String(e);
      setMsg(/changed/.test(m) ? "다른 데서 바뀌었어. 새 표를 읽었으니 다시 골라 줘" : m);
      if (/changed/.test(m)) void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
  });
  const prep = (q: SchedQ) => go.mutate({ q, dry: true });
  if (!d) return <p className="p-6 text-sm text-muted-foreground">{s.isError ? s.error.message : "표 읽는 중"}</p>;
  return (
    <div className="nm-sched nm-yeta mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 pb-28 pt-4">
      <h1 className="text-lg font-bold">스케줄</h1>
      {ask ? (
        <div className="nm-sched-ask" role="alertdialog" aria-label="바꾸기 전 확인">
          <span className="min-w-0 flex-1">{ask.q.label} {CF_KO[ask.q.field]}: {cfVal(ask.q.field, ask.r.from)} → <b>{cfVal(ask.q.field, ask.r.to)}</b>
            {ask.r.preview ? <small>다음 깸 {ask.r.preview.next_at ? nextShort(ask.r.preview.next_at) : "없음"} · 하루 {ask.r.preview.day_max}번</small> : null}
          </span>
          <button type="button" className="nm-sched-go" disabled={go.isPending} onClick={() => go.mutate({ q: ask.q, dry: false })}>바꾸기</button>
          <button type="button" className="nm-sched-chip" onClick={() => setAsk(null)}>취소</button>
        </div>
      ) : null}
      {msg ? <p className="text-sm" role="status">{msg}</p> : null}
      <ul className="nm-rgroup flex flex-col">
        {d.bots.map((b) => {
          const p = list.find((x) => x.who === b.who), on = open === b.bot, rs = d.routines.filter((r) => r.bot === b.bot), live = rs.filter((r) => r.state === "live" && r.cron?.length).length;
          return (
            <li key={b.bot} className="nm-rrow">
              <button type="button" className="nm-sched-row" aria-expanded={on} onClick={() => setOpen(on ? "" : b.bot)}>
                <MicOrb size={44} id={idOf(b.who, list)} tint={ringOf(p)} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5"><b className="truncate text-[15px]">{p?.name || b.who}</b>{p?.mark ? <span aria-hidden>{p.mark}</span> : null}{p?.role ? <span className="truncate rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{p.role}</span> : null}</span>
                  <span className="block truncate text-xs text-muted-foreground">{b.next_ts ? `다음 ${nextShort(b.next_ts)}` : "다음 깸 없음"} · 하루 {b.wakes.length}번 · 켠 일정 {live}개</span>
                </span>
              </button>
              {on ? (
                <div className="nm-sched-open">
                  {rs.map((r) => (
                    <div key={r.id} className="nm-sched-rt">
                      <b>{r.name}</b>
                      <small>{r.when.length ? r.when.join(" · ") : "부를 때만"}</small>
                      <div className="flex flex-wrap gap-1" role="group" aria-label={`${r.name} 상태`}>
                        {Object.keys(ST_KO).filter((k) => k !== "grok-stay" || r.state === k).map((k) => <button key={k} type="button" className="nm-sched-chip" aria-pressed={r.state === k} disabled={!can || go.isPending} onClick={() => prep({ at: "routine", key: r.id, field: "state", value: k, label: `${b.who} ${r.name}` })}>{ST_KO[k]}</button>)}
                      </div>
                      {r.cron?.length ? (
                        <label className="nm-sched-when">언제
                          <input disabled={!can} value={vals[r.id] ?? cronShow(r.cron)} aria-label={`${r.name} 언제`} onChange={(e) => setVals((v) => ({ ...v, [r.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter" && vals[r.id] !== undefined) prep({ at: "routine", key: r.id, field: "when", value: vals[r.id].split(";").map((x) => x.trim()).filter(Boolean).map((x) => `CRON_TZ=Asia/Seoul ${x}`), label: `${b.who} ${r.name}` }); }} />
                        </label>
                      ) : null}
                    </div>
                  ))}
                  <div className="nm-sched-cap">
                    {(["daily_cap", "urgent_reserve"] as const).map((f) => (
                      <label key={f}>{CF_KO[f]}
                        <input type="number" disabled={!can} value={vals[`${b.bot}|${f}`] ?? String(b[f] ?? "")} aria-label={`${b.who} ${CF_KO[f]}`} onChange={(e) => setVals((v) => ({ ...v, [`${b.bot}|${f}`]: e.target.value }))}
                          onBlur={() => { const v = vals[`${b.bot}|${f}`]; if (v !== undefined && Number(v) !== b[f]) prep({ at: "bot", key: b.bot, field: f, value: Number(v), label: b.who }); }} />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {can ? null : <p className="text-xs text-muted-foreground">바꾸기는 형 자리에서만 돼.</p>}
    </div>
  );
}
