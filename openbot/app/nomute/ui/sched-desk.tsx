// 스케줄(형 10-31 「포크로 꼽아지고 그걸 차단기로 내리고 키는 개념」 · 「꼬챙이 하나하나에 루틴을 담고 시간을 설계」 · 「포크가 공통의 내용을 담을 수 있는거고」 · 「각각의 끝에는 ! 훅 이거 단 하나야」)
//   트리 = 맨 위 봇 얼굴 줄(봇 큰 차단기 · 고르면 그 봇 꼬챙이만) → 포크 차단기 → 꼬챙이 차단기 → 끝 ! 얼굴 · 내린 위 칸 아래는 다 멈춘 것으로 보임
//   서버 = GET schedule · POST schedule/set(형만 · dry = 미리 보기 · at routine·fork·bot) · 저장 흐름 = 설정 NomuteSchedule 과 같음 · 서버 판이 안 올라온 동안은 forks 없음 → 「아직 안 나눔」 한 포크
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { idOf, office, people } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";
import { CF_KO, type Routine, ST_KO, type SchedFork, type SchedQ, type SchedSetRes, cfVal, cronShow, nextShort, useSched } from "./settings-extra";

const CRON_H = "CRON_TZ=Asia/Seoul ";
const hoursKo = (h: string) => {
  if (h === "*") return "매시";
  const m = h.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
  if (m) return `${m[1]}~${m[2]}시${m[3] ? ` ${m[3]}시간마다` : ""}`;
  return `${h.split(",").join("·")}시`;
};
const oneCron = (c: string) => {   // 「0 11,15,19 * * *」 → 「매일 11·15·19시」 · 못 풀면 글자 그대로
  const p = c.replace(CRON_H, "").trim().split(/\s+/);
  if (p.length !== 5) return c;
  const [mi, h, dom, mon, dow] = p;
  const day = dom !== "*" && mon !== "*" ? `${mon}월 ${dom}일` : dow === "1-5" ? "평일" : dow === "0,6" || dow === "6,0" ? "주말" : dow === "*" ? "매일" : `요일 ${dow}`;
  if (/^\*\/\d+$/.test(mi)) return `${day} ${mi.slice(2)}분마다`;
  return `${day} ${hoursKo(h)}${mi === "0" ? "" : ` ${mi}분`}`;
};
const cronKo = (l?: string[]) => (l || []).map(oneCron).join(" · ");
type TimePick = { day: "*" | "1-5" | "0,6"; hours: number[]; min: number };
const readPick = (l?: string[]): TimePick | null => {   // 고르기로 다 그릴 수 있는 줄만(시간표 한 줄 · 분 숫자 · 날짜 없음)
  if (l?.length !== 1) return null;
  const p = l[0].replace(CRON_H, "").trim().split(/\s+/);
  if (p.length !== 5 || !/^\d+$/.test(p[0]) || p[2] !== "*" || p[3] !== "*" || !["*", "1-5", "0,6"].includes(p[4])) return null;
  const hours: number[] = [];
  for (const t of p[1].split(",")) {
    const m = t.match(/^(\d+)(?:-(\d+)(?:\/(\d+))?)?$/);
    if (!m) return null;
    for (let i = +m[1], e = m[2] ? +m[2] : i, st = m[3] ? +m[3] : 1; i <= e; i += st) hours.push(i);
  }
  return { day: p[4] as TimePick["day"], hours, min: +p[0] };
};
const pickCron = (k: TimePick) => [`${CRON_H}${k.min} ${[...k.hours].sort((a, b) => a - b).join(",")} * * ${k.day}`];
const DAYS: [TimePick["day"], string][] = [["*", "매일"], ["1-5", "평일"], ["0,6", "주말"]];

// 차단기(형 「차단기로 내리고 키는」) = 위로 올림 켬 · 아래로 내림 끊김 · 위 칸이 내려가면 흐리게
function Breaker({ on, big, dim, label, disabled, onFlip }: { on: boolean; big?: boolean; dim?: boolean; label: string; disabled?: boolean; onFlip: () => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`nm-brk${big ? " big" : ""}${dim ? " dim" : ""}`} disabled={disabled} onClick={(e) => { e.stopPropagation(); onFlip(); }}><i /></button>;
}

function WhenPick({ r, can, busy, send }: { r: Routine; can: boolean; busy: boolean; send: (v: string[]) => void }) {
  const first = useMemo(() => readPick(r.cron), [r.cron]);
  const [k, setK] = useState<TimePick | null>(first), [raw, setRaw] = useState(cronShow(r.cron));
  useEffect(() => { setK(first); setRaw(cronShow(r.cron)); }, [first, r.cron]);
  if (!r.cron?.length) return <small>부를 때만 깨어나</small>;
  const dated = r.cron.some((c) => { const p = c.replace(CRON_H, "").trim().split(/\s+/); return p[2] !== "*" && p[3] !== "*"; });
  if (dated) return <small>{cronKo(r.cron)} 한 번 · 시간은 못 고쳐</small>;
  if (!k) return (
    <label className="nm-sched-when">직접
      <input disabled={!can} value={raw} aria-label={`${r.name} 언제`} onChange={(e) => setRaw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(raw.split(";").map((x) => x.trim()).filter(Boolean).map((x) => CRON_H + x)); }} />
    </label>
  );
  const changed = JSON.stringify(pickCron(k)) !== JSON.stringify(pickCron(first || k));
  return (
    <div className="nm-sched-pick">
      <div className="flex flex-wrap gap-1" role="group" aria-label={`${r.name} 날`}>{DAYS.map(([v, t]) => <button key={v} type="button" className="nm-sched-chip" aria-pressed={k.day === v} disabled={!can} onClick={() => setK({ ...k, day: v })}>{t}</button>)}</div>
      <div className="nm-sched-hours" role="group" aria-label={`${r.name} 시`}>
        {Array.from({ length: 24 }, (_, h) => <button key={h} type="button" aria-pressed={k.hours.includes(h)} disabled={!can} onClick={() => setK({ ...k, hours: k.hours.includes(h) ? k.hours.filter((x) => x !== h) : [...k.hours, h] })}>{h}</button>)}
      </div>
      <label className="nm-sched-when">분<input type="number" min={0} max={59} disabled={!can} value={k.min} aria-label={`${r.name} 분`} onChange={(e) => setK({ ...k, min: Math.min(59, Math.max(0, Number(e.target.value) || 0)) })} />
        {changed ? <button type="button" className="nm-sched-go" disabled={busy || !k.hours.length} onClick={() => send(pickCron(k))}>미리 보기</button> : null}
      </label>
    </div>
  );
}

export function SchedDesk() {
  const qc = useQueryClient(), s = useSched(), d = s.data, can = !!d?.can_set;
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [who, setWho] = useState(""), [openF, setOpenF] = useState(""), [openR, setOpenR] = useState("");
  const [ask, setAsk] = useState<{ q: SchedQ; r: SchedSetRes } | null>(null), [msg, setMsg] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => { setVals({}); }, [d?.sha]);
  const go = useMutation({
    mutationFn: ({ q, dry }: { q: SchedQ; dry: boolean }) => office<SchedSetRes>("schedule/set", { method: "POST", body: JSON.stringify({ at: q.at, key: q.key, field: q.field, value: q.value, sha: d?.sha, dry }) }),
    onSuccess: (r, { q, dry }) => {
      if (r.same) { setAsk(null); setMsg(`이미 ${cfVal(q.field, q.value)}이야`); return; }
      if (dry) { setAsk({ q, r }); setMsg(""); return; }
      setAsk(null);
      setMsg(`바뀜 · ${q.label} ${cfVal(q.field, r.from)} → ${cfVal(q.field, r.to)} · 시계가 받으면 여기 뜰게`);
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
  const hasForks = !!d.forks?.length;
  const forks: SchedFork[] = hasForks ? d.forks! : [{ id: "", name: "아직 안 나눔", on: true }];
  const rsOf = (f: SchedFork) => d.routines.filter((r) => (hasForks ? r.fork === f.id : true) && (!who || r.bot === who));
  const botOf = (id: string) => d.bots.find((b) => b.bot === id);
  const sel = botOf(who);
  const face = (b?: { who: string }, size = 28) => { const p = list.find((x) => x.who === b?.who); return <MicOrb size={size} id={idOf(b?.who || "", list)} tint={ringOf(p)} />; };
  const nameOf = (b?: { who: string }) => list.find((x) => x.who === b?.who)?.name || b?.who || "";
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
      {msg ? <p className="text-sm" role="status">{msg}{d.clock_got?.got ? " · 시계 받음" : ""}</p> : null}
      <div className="nm-sched-faces" role="group" aria-label="봇 고르기">
        {d.bots.map((b) => (
          <button key={b.bot} type="button" aria-pressed={who === b.bot} data-off={b.on === false || undefined} onClick={() => setWho(who === b.bot ? "" : b.bot)}>
            {face(b, 44)}<span>{nameOf(b)}</span>
          </button>
        ))}
      </div>
      {sel ? (
        <div className="nm-sched-bot">
          <Breaker big on={sel.on !== false} label={`${nameOf(sel)} 차단기`} disabled={!can || !hasForks || go.isPending} onFlip={() => prep({ at: "bot", key: sel.bot, field: "on", value: sel.on === false, label: nameOf(sel) })} />
          <span className="min-w-0 flex-1"><b>{nameOf(sel)}</b><small>{sel.next_ts ? `다음 ${nextShort(sel.next_ts)}` : "다음 깸 없음"} · 하루 {sel.wakes.length}번</small></span>
          <div className="nm-sched-cap">
            {(["daily_cap", "urgent_reserve"] as const).map((f) => (
              <label key={f}>{CF_KO[f]}
                <input type="number" disabled={!can} value={vals[`${sel.bot}|${f}`] ?? String(sel[f] ?? "")} aria-label={`${sel.who} ${CF_KO[f]}`} onChange={(e) => setVals((v) => ({ ...v, [`${sel.bot}|${f}`]: e.target.value }))}
                  onBlur={() => { const v = vals[`${sel.bot}|${f}`]; if (v !== undefined && Number(v) !== sel[f]) prep({ at: "bot", key: sel.bot, field: f, value: Number(v), label: sel.who }); }} />
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <ul className="nm-sched-tree">
        {forks.map((f) => {
          const rs = rsOf(f);
          if (who && !rs.length) return null;
          const fOn = f.on !== false, live = rs.filter((r) => r.state === "live").length, on = openF === f.id || !hasForks;
          return (
            <li key={f.id || "none"} className="nm-sched-fork" data-off={!fOn || undefined}>
              <div className="nm-sched-forkhead">
                <Breaker big on={fOn} label={`${f.name} 차단기`} disabled={!can || !hasForks || go.isPending} onFlip={() => prep({ at: "fork", key: f.id, field: "on", value: !fOn, label: f.name })} />
                <button type="button" aria-expanded={on} onClick={() => setOpenF(on ? "" : f.id)}>
                  <b>{f.name}</b><small>꼬챙이 {rs.length} · 켠 것 {live}</small>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d={on ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>
                </button>
              </div>
              {on ? (
                <ul className="nm-sched-tines">
                  {f.common || (hasForks && can) ? (
                    <li className="nm-sched-common">
                      <label>공통 내용 · 이 포크 꼬챙이 모두에 붙어
                        <textarea rows={2} disabled={!can} value={vals[`fork|${f.id}`] ?? f.common ?? ""} onChange={(e) => setVals((v) => ({ ...v, [`fork|${f.id}`]: e.target.value }))}
                          onBlur={() => { const v = vals[`fork|${f.id}`]; if (v !== undefined && v !== (f.common ?? "")) prep({ at: "fork", key: f.id, field: "common", value: v, label: f.name }); }} />
                      </label>
                    </li>
                  ) : null}
                  {rs.map((r) => {
                    const b = botOf(r.bot), live2 = r.state === "live", wide = openR === r.id, blocked = !fOn || b?.on === false;
                    return (
                      <li key={r.id} className="nm-sched-tine" data-off={!live2 || blocked || undefined}>
                        <div className="nm-sched-tinehead">
                          <Breaker on={live2} dim={blocked} label={`${r.name} 차단기`} disabled={!can || go.isPending || r.state === "grok-stay"} onFlip={() => prep({ at: "routine", key: r.id, field: "state", value: live2 ? "off" : "live", label: `${b?.who} ${r.name}` })} />
                          <button type="button" aria-expanded={wide} onClick={() => setOpenR(wide ? "" : r.id)}>
                            <b>{r.name}</b><small>{r.cron?.length ? cronKo(r.cron) : "부를 때만"}{blocked ? " · 위 차단기 내려감" : ""}</small>
                          </button>
                          <span className="nm-sched-end" title={`끝 = ${nameOf(b)} ! 훅 하나`}>{face(b)}<i>!</i></span>
                        </div>
                        {wide ? (
                          <div className="nm-sched-rt">
                            <WhenPick r={r} can={can} busy={go.isPending} send={(v) => prep({ at: "routine", key: r.id, field: "when", value: v, label: `${b?.who} ${r.name}` })} />
                            {r.task !== undefined ? (
                              <label className="nm-sched-text">할 일
                                <textarea rows={5} disabled={!can} value={vals[`task|${r.id}`] ?? r.task} onChange={(e) => setVals((v) => ({ ...v, [`task|${r.id}`]: e.target.value }))}
                                  onBlur={() => { const v = vals[`task|${r.id}`]; if (v !== undefined && v !== r.task) prep({ at: "routine", key: r.id, field: "task", value: v, label: `${b?.who} ${r.name}` }); }} />
                              </label>
                            ) : <small>할 일 글은 아직 그록 앱에 있어. 표로 옮기면 여기서 고쳐.</small>}
                            {hasForks ? (
                              <div className="nm-sched-sel">
                                <label>어떤 봇<select disabled={!can} value={r.bot} onChange={(e) => prep({ at: "routine", key: r.id, field: "bot", value: e.target.value, label: r.name })}>{d.bots.map((x) => <option key={x.bot} value={x.bot}>{nameOf(x)}</option>)}</select></label>
                                <label>포크<select disabled={!can} value={r.fork} onChange={(e) => prep({ at: "routine", key: r.id, field: "fork", value: e.target.value, label: r.name })}>{d.forks!.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                              </div>
                            ) : null}
                            <div className="flex flex-wrap gap-1" role="group" aria-label={`${r.name} 상태`}>
                              {Object.keys(ST_KO).filter((k) => k !== "grok-stay" || r.state === k).map((k) => <button key={k} type="button" className="nm-sched-chip" aria-pressed={r.state === k} disabled={!can || go.isPending} onClick={() => prep({ at: "routine", key: r.id, field: "state", value: k, label: `${b?.who} ${r.name}` })}>{ST_KO[k]}</button>)}
                            </div>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      {can ? null : <p className="text-xs text-muted-foreground">바꾸기는 형 자리에서만 돼.</p>}
    </div>
  );
}
