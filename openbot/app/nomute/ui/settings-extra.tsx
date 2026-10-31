// 설정 판 — 옛 화면(viewer/office.html) 설정 판과 같은 서버 길 · 같은 규칙
//   지금 봇(GET bots · 다음 깸 = GET schedule) · 지정방 멤버(GET/POST roomset · 형) · 공지 설정 한 장(GET/POST noticeset · 형)
//   스케줄러 연결(GET schedule/link) · 바꾸기(루틴 상태·언제·할 일 없어도 깨움 · 봇 하루 최대·급한 일 몫 · 사건 모아서 기다림 = POST schedule/set · 먼저 dry 미리 보기 → 확인)
//   옛 그록 대화(GET old · 봇 → 날 → 글 · 읽기만) · 맨 아래 「지금 판」(형이 새 판인지 눈으로 · 10-28 10:51 「웹앱이 자동으로 버전업이 안되네」)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { PageSection } from "@/components/layout/page-shell";
import { idOf, type Meter, type MeterRow, office, people } from "../data/office";
import { FaceImg } from "./faces";
import { t12 } from "./when";

const kst = (ts: number) => new Date(ts + 9 * 3600e3);
const hm = (ts?: number | string) => (ts ? t12(typeof ts === "string" ? Date.parse(ts) : ts) : "");   // 「3:50 PM」(형 10-28 10:22 · ./when.ts)
export function nextShort(ts: number) {
  const d = kst(ts), n = kst(Date.now());
  const dd = Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())) / 864e5);
  return dd === 0 ? hm(ts) : dd === 1 ? `내일 ${hm(ts)}` : `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${hm(ts)}`;
}
const ago = (ts?: number) => { if (!ts) return "활동 모름"; const m = Math.round((Date.now() - ts) / 60e3); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };
const Card = ({ children }: { children: ReactNode }) => <div className="mt-3 rounded-2xl border border-border">{children}</div>;
const btn = "rounded-full border border-border px-3 py-1 text-xs hover:bg-foreground/5 disabled:opacity-50";

type Bot = { who: string; state: string; why?: string; last_turn_ts?: number };
export type SchedBot = { bot: string; who: string; wakes: number[]; next_ts?: number; daily_cap?: number; urgent_reserve?: number; on?: boolean };
export type Routine = { id: string; bot: string; who: string; name: string; when: string[]; cron?: string[]; state: string; fire_empty?: boolean; fork?: string; task?: string; marks?: string[] };
export type SchedFork = { id: string; name: string; on?: boolean; common?: string };
type Kind = { kind: string; delay_max?: number; ttl?: number };
export type RunnerJob = { id: string; name: string; file: string; host?: string; kind: string; fork: string; on?: boolean; when?: string; cron_kst?: string[]; clock?: string[]; starts?: string[]; providers?: string[]; model?: string[]; owner?: string; checked?: boolean; res?: { at: string; gpu?: boolean }[]; gpu?: string[]; in?: { paths?: string[]; after?: string[] }; out?: { calls?: string[] }; notify?: string[] };
export type SchedRunners = { groups: { id: string; name: string }[]; forks: { id: string; name: string; group: string; on?: boolean; note?: string }[]; jobs: RunnerJob[] };
type Sched = { bots: SchedBot[]; routines: Routine[]; kinds: Kind[]; sha: string; can_set: boolean; forks?: SchedFork[]; clock_got?: { got?: boolean }; runners?: SchedRunners };

const usePeople = () => useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
export const useSched = () => useQuery({ queryKey: ["nomute", "schedule"], queryFn: () => office<Sched>("schedule"), staleTime: 30_000, refetchInterval: 120_000 });

export function NomuteBots() {
  const list = usePeople();
  const bots = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: Bot[] }>("bots").then((j) => j.bots || []), refetchInterval: 60_000 });
  const sched = useSched();
  const rows = list.filter((p) => p.kind === "bot");   // 윈터(클로드) 따로 온라인 줄 0 = 윈터 상태는 머리 등불 구슬(형 10-28 09:24)
  const awake = (bots.data || []).filter((b) => b.state === "awake").length;
  return (
    <PageSection title="지금 봇">
      <p className="mt-1 text-sm text-muted-foreground">온라인 {awake} / {rows.length}</p>
      <Card>
        <ul className="divide-y divide-border">
          {rows.map((p) => {
            const b = (bots.data || []).find((x) => x.who === p.who), s = sched.data?.bots.find((x) => x.who === p.who);
            const on = b?.state === "awake", work = on && b?.why !== "read";
            return (
              <li key={p.who} className="flex items-center gap-3 px-4 py-2.5">
                <span className="relative"><FaceImg id={idOf(p.who, list)} size={32} />{on ? <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" /> : null}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.name || p.who} {p.mark || ""}{p.role ? <span data-content className="ml-1 text-xs font-normal text-muted-foreground">{p.role}</span> : null}
                    {p.memory ? <span className="ml-1.5 rounded-full border border-border px-1.5 py-px text-[10px] font-normal text-muted-foreground" title={MEMORY_T[p.memory]}>기억 {p.memory}</span> : null}</p>
                  <p className={`text-xs ${work ? "animate-pulse text-foreground" : "text-muted-foreground"}`}>{work ? "작업 중 · 고민하는 중…" : on ? "온라인" : ago(b?.last_turn_ts)}</p>
                </div>
                {s?.next_ts ? <span className="shrink-0 text-xs tabular-nums text-muted-foreground">다음 {nextShort(s.next_ts)}</span> : null}
              </li>
            );
          })}
        </ul>
      </Card>
    </PageSection>
  );
}

// 받는 이 기억 칸(평의회 2 ⑧ · 서버 _meetfix.js memoryOf) — 「지금 봇」 줄 꼬리 · 계기판 묶음 이름
const MEMORY_T: Record<string, string> = { 백지: "백지 — 깸마다 새 회차(앞 대화 기억 없음)", 이어짐: "이어짐 — 앞 깸 대화가 이어짐", nowake: "nowake — 바로 깨우는 길 없음(제 때 와서 읽음)", 모름: "모름 — 이어지는지 모름" };
const kday = (ts: number) => kst(ts).toISOString().slice(0, 10).replace(/-/g, "");
const pct = (v: number | null | undefined) => (v == null ? "–" : `${v}%`);
// 계기판 비율 넷(서버 metricsView) — [칸, 이름, 무슨 뜻]
const RATES: [keyof MeterRow, string, string][] = [
  ["헛깸률", "헛깸", "깼는데 부름에 답 안 한 비율(낮을수록 좋음)"],
  ["형말출처율", "형 말 출처", "형 말을 옮길 때 형 글 id(src)를 단 비율(높을수록 좋음)"],
  ["바꿔전하기율", "바꿔 전하기", "출처 없이 「형이 …래」로 옮긴 글 비율(낮을수록 좋음)"],
  ["되묻기율", "되묻기", "부름에 답한 글이 물음으로 끝난 비율"],
];

/** 회의실 계기판(평의회 2 ⑩ · GET metrics?day=) — 하루 한 장 · 받는 이 기억 종류별 · 3일·깸 50번 잰 뒤 꾸러미를 정하는 기준값(decision2.md) · LLM 0 */
export function NomuteMeter() {
  const [back, setBack] = useState(0);   // 0 = 오늘 · 1 = 어제 …
  const day = kday(Date.now() - back * 864e5);
  const q = useQuery({ queryKey: ["nomute", "metrics", day], queryFn: () => office<Meter>(`metrics?day=${day}`), staleTime: 30_000, refetchInterval: back ? false : 60_000 });
  const list = usePeople();
  const kinds = Object.entries(q.data?.by || {}).sort(([, a], [, b]) => (b.wakes || 0) + (b.posts || 0) - (a.wakes || 0) - (a.posts || 0));
  const over = Object.entries(q.data?.calls_over || {});
  const who = (k: string) => list.filter((p) => p.kind === "bot" && p.memory === k).map((p) => p.name || p.who).join("·");
  return (
    <PageSection title="회의실 계기판">
      <div className="mt-1 flex items-center gap-2 text-sm">
        <button type="button" className={btn} onClick={() => setBack((b) => b + 1)} aria-label="하루 앞">‹</button>
        <span className="tabular-nums">{`${+day.slice(4, 6)}/${+day.slice(6)}`}{back ? "" : " 오늘"}</span>
        <button type="button" className={btn} disabled={!back} onClick={() => setBack((b) => Math.max(0, b - 1))} aria-label="하루 뒤">›</button>
        <span className="ml-auto text-xs text-muted-foreground">받는 이 기억 종류별 · 하루 한 장</span>
      </div>
      {q.isError ? <p className="mt-3 text-sm text-destructive" role="alert">계기판을 못 받았어 — {q.error instanceof Error ? q.error.message : String(q.error)}</p>
        : q.isPending ? null
        : !kinds.length ? <p className="mt-3 text-sm text-muted-foreground">이날 셈 없음 — 봇 글·깸이 생기면 채워져</p>
        : kinds.map(([k, b]) => (
          <Card key={k}>
            <div className="px-4 pt-3">
              <p className="text-sm font-medium" title={MEMORY_T[k]}>{k}{who(k) ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">{who(k)}</span> : null}</p>
              <p className="text-xs tabular-nums text-muted-foreground">깸 {b.wakes || 0} · 답한 부름 {b.answered_calls || 0} · 글 {b.posts || 0} · 형 글 id {b.src || 0} · 출처 없이 옮김 {b.relay_nosrc || 0} · 되물음 {b.asks_back || 0}</p>
            </div>
            <div className="grid grid-cols-4 gap-1 px-2 pb-3 pt-2">
              {RATES.map(([f, t, d]) => (
                <div key={f} className="flex flex-col items-center rounded-xl px-1 py-1.5" title={d}>
                  <span className="text-base font-semibold tabular-nums">{pct(b[f] as number | null)}</span>
                  <span className="text-[11px] text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      <p className="mt-3 text-xs text-muted-foreground">부름 넘침(방마다 50 넘어 밀린 부름) {over.length ? over.map(([w, n]) => `${w} ${n}`).join(" · ") : "0"}</p>
    </PageSection>
  );
}

export function NomuteRoomset() {
  const qc = useQueryClient();
  const list = usePeople();
  const q = useQuery({ queryKey: ["nomute", "roomset"], queryFn: () => office<{ roomset: { ver: number; rooms: Record<string, string[]>; at?: string; by?: string }; candidates: string[]; designated: string[]; can_edit: boolean }>("roomset") });
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: { id: string; name: string }[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 });
  const [edit, setEdit] = useState<Record<string, string[]>>({});
  const save = useMutation({
    mutationFn: ({ room, members }: { room: string; members: string[] }) => office("roomset", { method: "POST", body: JSON.stringify({ room, members, base: q.data?.roomset.ver }) }),
    onSuccess: (_j, v) => { setEdit((e) => { const n = { ...e }; delete n[v.room]; return n; }); void qc.invalidateQueries({ queryKey: ["nomute", "roomset"] }); void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] }); },
  });
  const d = q.data;
  return (
    <PageSection title="지정방 멤버">
      <p className="mt-1 text-sm text-muted-foreground">{d ? `판 ${d.roomset.ver} · ${d.roomset.by || ""} · @모두 = 이 멤버만 받음` : q.isError ? q.error.message : "읽는 중…"}</p>
      {d ? d.designated.map((rid) => {
        const cur = edit[rid] || d.roomset.rooms[rid] || [];
        const changed = !!edit[rid];
        return (
          <Card key={rid}>
            <div className="p-4">
              <p className="text-sm font-semibold">{rooms.data?.find((r) => r.id === rid)?.name || rid} <span className="text-xs font-normal text-muted-foreground">{cur.length}명</span></p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.candidates.map((w) => {
                  const on = cur.includes(w);
                  return (
                    <button key={w} type="button" disabled={!d.can_edit} aria-pressed={on} onClick={() => setEdit((e) => ({ ...e, [rid]: on ? cur.filter((x) => x !== w) : [...cur, w] }))}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${on ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted-foreground"}`}>
                      <FaceImg id={idOf(w, list)} size={16} />{list.find((p) => p.who === w)?.name || w}
                    </button>
                  );
                })}
              </div>
              {changed ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" className={btn} disabled={save.isPending || !cur.length} onClick={() => save.mutate({ room: rid, members: cur })}>저장</button>
                  <button type="button" className={btn} onClick={() => setEdit((e) => { const n = { ...e }; delete n[rid]; return n; })}>취소</button>
                </div>
              ) : null}
            </div>
          </Card>
        );
      }) : null}
      {save.isError ? <p className="mt-2 text-sm text-destructive" role="alert">{/changed|base/.test(save.error.message) ? "다른 데서 바뀜 — 새 판을 다시 읽었어 · 다시 골라 줘" : save.error.message}</p> : null}
    </PageSection>
  );
}

export function NomuteNotice() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["nomute", "notice"], queryFn: () => office<{ notice: { ver: number; text: string; at?: string; by?: string }; history?: { ver: number; at: string; by: string; len: number }[]; can_edit: boolean }>("noticeset") });
  const [text, setText] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (t: string) => office("noticeset", { method: "POST", body: JSON.stringify({ text: t, base: q.data?.notice.ver }) }),
    onSuccess: () => { setText(null); void qc.invalidateQueries({ queryKey: ["nomute", "notice"] }); },
  });
  const n = q.data?.notice;
  return (
    <PageSection title="공지 설정">
      <p data-content className="mt-1 text-sm text-muted-foreground">{n ? `판 ${n.ver} · ${n.by || ""} · ${String(n.at || "").slice(5, 16).replace("T", " ")} · 봇이 깰 때마다 봄(안 깨움)` : q.isError ? q.error.message : "읽는 중…"}</p>
      {n ? (
        <Card>
          <div className="p-4">
            {text === null ? (
              <>
                <p data-content className="whitespace-pre-wrap text-sm">{n.text}</p>
                {q.data?.can_edit ? <button type="button" className={`${btn} mt-3`} onClick={() => setText(n.text)}>고치기</button> : null}
              </>
            ) : (
              <>
                <textarea className="min-h-48 w-full rounded-xl border border-border bg-background p-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} aria-label="공지 글" />
                <div className="mt-2 flex gap-2">
                  <button type="button" className={btn} disabled={save.isPending || !text.trim() || text === n.text} onClick={() => save.mutate(text)}>저장(새 판)</button>
                  <button type="button" className={btn} onClick={() => setText(null)}>취소</button>
                </div>
              </>
            )}
            {(q.data?.history || []).length ? <p data-content className="mt-3 text-xs text-muted-foreground">지난 판: {(q.data?.history || []).map((h) => `${h.ver}(${String(h.at).slice(5, 16).replace("T", " ")} · ${h.by})`).join(" · ")}</p> : null}
          </div>
        </Card>
      ) : null}
      {save.isError ? <p className="mt-2 text-sm text-destructive" role="alert">{/changed|base/.test(save.error.message) ? "다른 데서 바뀜 — 새 판을 다시 읽었어 · 다시 고쳐 줘" : save.error.message}</p> : null}
    </PageSection>
  );
}

type LinkBot = { name: string; hook01?: { enabled: boolean; last_run?: string }; hook01_why?: string; routines: { id: string; state: string; result?: string | null; ran_at?: string | null; alert?: string | null }[]; today?: { wakes: number; clock: number; manual: number; cap: number; lost?: number } };
export function NomuteLink() {
  const q = useQuery({ queryKey: ["nomute", "link"], queryFn: () => office<{ at: number; by?: string; link?: { clock?: { beat_at?: string }; bots?: Record<string, LinkBot> } }>("schedule/link"), refetchInterval: 60_000 });
  const k = q.data?.link, beat = k?.clock?.beat_at ? Math.round((Date.now() - Date.parse(k.clock.beat_at)) / 1000) : null;
  return (
    <PageSection title="스케줄러 연결">
      <p className={`mt-1 text-sm ${beat == null || beat > 130 ? "text-destructive" : "text-muted-foreground"}`}>{!q.data ? (q.isError ? q.error.message : "읽는 중…") : !k ? "아직 한 장 없음 — 윈A 지킴이가 올리면 보임" : `시계 마지막 신호 ${beat == null ? "모름" : `${beat}초 전`} · 읽은 때 ${hm(q.data.at)}`}</p>
      <p className="mt-1 text-xs text-muted-foreground">한 줄 = 일정 → 호출 연결 → 깨움 보냄 → 일 시작 · 자동 = 일정·사건으로 깨운 수(하루 최대에 셈) · 직접 = 형·윈터가 바로 깨운 수(하루 최대에 안 셈) · 밤 12시에 0부터</p>
      {k?.bots ? (
        <Card>
          <ul className="divide-y divide-border">
            {Object.entries(k.bots).map(([id, x]) => {
              const on = x.routines.filter((r) => r.state === "live" || r.state === "dry").length, ran = x.routines.filter((r) => r.result === "ran").length;
              return (
                <li key={id} className="px-4 py-2.5">
                  <p className="flex items-center justify-between text-sm"><b>{x.name}</b><span className={`text-xs ${x.hook01?.enabled === false || x.hook01_why ? "text-destructive" : "text-muted-foreground"}`}>{x.hook01_why || (x.hook01?.enabled ? "호출 연결 켜짐" : "호출 연결 꺼짐")}</span></p>
                  <p className="text-xs text-muted-foreground">
                    {x.today ? `오늘 자동 ${x.today.clock}/하루 최대 ${x.today.cap} · 직접 ${x.today.manual}${x.today.lost ? ` · 놓침 ${x.today.lost}` : ""} · ` : ""}켠 루틴 {on} · 돎 {ran}{x.hook01?.last_run ? ` · 마지막 ${hm(x.hook01.last_run)}` : ""}
                  </p>
                  {x.routines.some((r) => r.alert) ? <p data-content className="text-xs text-destructive">{x.routines.filter((r) => r.alert).map((r) => `${r.id}: ${r.alert}`).join(" · ")}</p> : null}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </PageSection>
  );
}

export const ST_KO: Record<string, string> = { shadow: "기록만", dry: "시험", live: "켬", off: "꺼짐", "grok-stay": "그록에 둠" };
export const CF_KO: Record<string, string> = { state: "상태", when: "언제", fire_empty: "할 일 없어도 깨움", delay_max: "모아서 기다림", daily_cap: "하루 최대", urgent_reserve: "급한 일 몫", on: "차단기", task: "할 일", common: "공통 내용", fork: "포크", bot: "어떤 봇" };
const CRON_H = "CRON_TZ=Asia/Seoul ";
export const cronShow = (l?: string[]) => (l || []).map((c) => String(c).replace(CRON_H, "")).join(" ; ");
export const cfVal = (f: string, v: unknown) => (f === "when" ? cronShow(v as string[]) || "—" : f === "fire_empty" ? (v === true ? "켬" : v === false ? "끔" : "—") : f === "state" ? ST_KO[String(v)] || String(v) : f === "on" ? (v === false ? "내림" : "올림") : f === "task" || f === "common" ? `${String(v ?? "").slice(0, 24)}…` : v == null ? "—" : String(v));
export type SchedQ = Q;
export type SchedSetRes = SetRes;
type Q = { at: "routine" | "bot" | "kind" | "fork"; key: string; field: string; value: unknown; label: string };
type SetRes = { same?: boolean; from?: unknown; to?: unknown; commit?: string; checked?: boolean; preview?: { next_at?: number; day_max: number; reserve: number; total: number; cap?: number } };

export function NomuteSchedule() {
  const qc = useQueryClient();
  const s = useSched();
  const [ask, setAsk] = useState<{ q: Q; r: SetRes } | null>(null), [msg, setMsg] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => { setVals({}); }, [s.data?.sha]);
  const go = useMutation({
    mutationFn: ({ q, dry }: { q: Q; dry: boolean }) => office<SetRes>("schedule/set", { method: "POST", body: JSON.stringify({ at: q.at, key: q.key, field: q.field, value: q.value, sha: s.data?.sha, dry }) }),
    onSuccess: (r, { q, dry }) => {
      if (r.same) { setAsk(null); setMsg(`이미 ${cfVal(q.field, q.value)}이야 — 바꿀 것 없음`); return; }
      if (dry) { setAsk({ q, r }); setMsg(""); return; }
      setAsk(null);
      setMsg(`바뀜 · ${q.label} ${cfVal(q.field, r.from)} → ${cfVal(q.field, r.to)} · 커밋 ${String(r.commit || "").slice(0, 7)}${r.checked ? " · 다시 읽어 그대로 확인" : ""}`);
      void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
    onError: (e) => {
      setAsk(null);
      const m = e instanceof Error ? e.message : String(e);
      setMsg(/changed/.test(m) ? "다른 데서 바뀜 — 새 판을 다시 읽었어 · 다시 골라 줘" : m);
      if (/changed/.test(m)) void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
  });
  const prep = (q: Q) => go.mutate({ q, dry: true });
  const d = s.data, can = !!d?.can_set;
  const num = (q: Omit<Q, "value">, cur: number | undefined, min: number, max: number) => {
    const k = `${q.at}|${q.key}|${q.field}`;
    return (
      <label className="flex items-center gap-1 text-xs">
        {CF_KO[q.field]}
        <input type="number" min={min} max={max} disabled={!can} className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs tabular-nums" value={vals[k] ?? String(cur ?? "")} aria-label={q.label + " " + CF_KO[q.field]}
          onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") prep({ ...q, value: Number(vals[k] ?? cur) }); }} onBlur={() => { if (vals[k] !== undefined && Number(vals[k]) !== cur) prep({ ...q, value: Number(vals[k]) }); }} />
      </label>
    );
  };
  return (
    <PageSection title="스케줄러 바꾸기">
      <p className="mt-1 text-xs text-muted-foreground">상태 = 기록만(언제 깰지 셈만 적고 안 보냄) · 시험(보낼 글까지 만들어 적고 안 보냄) · 켬(진짜로 깨움) · 꺼짐 · 고르면 먼저 미리 보기 → 확인하면 봇 일정 표 한 칸만 바꾸는 한 커밋(시계는 다음 분 회차부터){can ? "" : " · 바꾸기 = 형 자리만"}</p>
      {ask ? (
        <div className="sticky top-2 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/40 bg-background p-3 text-sm shadow">
          <span className="min-w-0 flex-1">{ask.q.label} {CF_KO[ask.q.field]}: {cfVal(ask.q.field, ask.r.from)} → <b>{cfVal(ask.q.field, ask.r.to)}</b>
            {ask.r.preview ? <small className="block text-xs text-muted-foreground">다음 깸 {ask.r.preview.next_at ? nextShort(ask.r.preview.next_at) : "없음"} · 하루 정해진 {ask.r.preview.day_max}번 + 급함 몫 {ask.r.preview.reserve} = {ask.r.preview.total}{Number.isFinite(ask.r.preview.cap) ? `/${ask.r.preview.cap}` : ""}</small> : null}
          </span>
          <button type="button" className={btn} disabled={go.isPending} onClick={() => go.mutate({ q: ask.q, dry: false })}>바꾸기</button>
          <button type="button" className={btn} onClick={() => setAsk(null)}>취소</button>
        </div>
      ) : null}
      {msg ? <p className="mt-2 text-sm" role="status">{msg}</p> : null}
      {!d ? <p className="mt-2 text-sm text-muted-foreground">{s.isError ? s.error.message : "표 읽는 중…"}</p> : (
        <>
          <h3 className="mt-4 text-sm font-semibold">루틴 <span className="text-xs font-normal text-muted-foreground">{d.routines.length}줄</span></h3>
          <Card>
            <ul className="divide-y divide-border">
              {d.routines.map((r) => (
                <li key={r.id} data-content className="flex flex-col gap-2 px-4 py-2.5">
                  <p data-content className="text-sm"><b>{r.who}</b> · {r.name}<small className="block text-xs text-muted-foreground">{r.id} · {r.when.length ? r.when.join(" + ") : "부를 때만"}</small></p>
                  <div className="flex flex-wrap items-center gap-1" role="group" aria-label={`${r.name} 상태`}>
                    {Object.keys(ST_KO).filter((k) => k !== "grok-stay" || r.state === k).map((k) => (
                      <button key={k} type="button" disabled={!can || go.isPending} aria-pressed={r.state === k} onClick={() => prep({ at: "routine", key: r.id, field: "state", value: k, label: `${r.who} ${r.name}` })}
                        className={`rounded-full border px-2.5 py-1 text-xs ${r.state === k ? "border-primary bg-primary/10 font-semibold" : "border-border text-muted-foreground"}`}>{ST_KO[k]}</button>
                    ))}
                    {typeof r.fire_empty === "boolean" && r.cron?.length ? (
                      <button type="button" disabled={!can || go.isPending} aria-pressed={r.fire_empty} className={btn} onClick={() => prep({ at: "routine", key: r.id, field: "fire_empty", value: !r.fire_empty, label: `${r.who} ${r.name}` })}>할 일 없어도 깨움 {r.fire_empty ? "켬" : "끔"}</button>
                    ) : null}
                  </div>
                  {r.cron?.length ? (
                    <label className="flex items-center gap-2 text-xs">언제
                      <input disabled={!can} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 font-mono text-xs" value={vals[`routine|${r.id}|when`] ?? cronShow(r.cron)} aria-label={`${r.name} 언제(시각 규칙 · ; 로 나눔)`}
                        onChange={(e) => setVals((v) => ({ ...v, [`routine|${r.id}|when`]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") prep({ at: "routine", key: r.id, field: "when", value: (vals[`routine|${r.id}|when`] ?? "").split(";").map((x) => x.trim()).filter(Boolean), label: `${r.who} ${r.name}` }); }} />
                    </label>
                  ) : <span className="text-xs text-muted-foreground">정한 시각 없음 · 부를 때만</span>}
                </li>
              ))}
            </ul>
          </Card>
          <h3 className="mt-4 text-sm font-semibold">봇 <span className="text-xs font-normal text-muted-foreground">하루 최대 1~60 · 급한 일 몫 0~5(하루 최대 안에서 급한 깸에 남겨 둠)</span></h3>
          <Card>
            <ul className="divide-y divide-border">
              {d.bots.map((b) => (
                <li key={b.bot} data-content className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                  <b className="min-w-12">{b.who}</b>
                  <span className="flex-1 text-xs text-muted-foreground">하루 정해진 깸 {b.wakes.length}번{b.next_ts ? ` · 다음 ${nextShort(b.next_ts)}` : ""}</span>
                  {num({ at: "bot", key: b.bot, field: "daily_cap", label: b.who }, b.daily_cap, 1, 60)}
                  {num({ at: "bot", key: b.bot, field: "urgent_reserve", label: b.who }, b.urgent_reserve, 0, 5)}
                </li>
              ))}
            </ul>
          </Card>
          {d.kinds.length ? (
            <>
              <h3 className="mt-4 text-sm font-semibold">사건 모아 깨우기 <span className="text-xs font-normal text-muted-foreground">모아서 기다림 2~240분(그동안 온 사건을 한 번에) · 5분 이하 = 바로</span></h3>
              <Card>
                <ul className="divide-y divide-border">
                  {d.kinds.map((x) => (
                    <li key={x.kind} data-content className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                      <b data-content className="min-w-32 font-mono text-xs">{x.kind}</b>
                      <span className="flex-1 text-xs text-muted-foreground">{Number.isInteger(x.delay_max) ? ((x.delay_max as number) <= 5 ? "바로" : "묶음") : ""}{Number.isFinite(x.ttl) ? ` · 기한 ${x.ttl}분` : ""}</span>
                      {num({ at: "kind", key: x.kind, field: "delay_max", label: x.kind }, x.delay_max, 2, 240)}
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          ) : null}
        </>
      )}
    </PageSection>
  );
}

type OldMsg = { id: string; who: string; to?: string; tag?: string; text: string; ts: number };
export function NomuteOld() {
  const list = usePeople();
  const idx = useQuery({ queryKey: ["nomute", "old"], queryFn: () => office<{ bots: { who: string; days: string[] }[] }>("old").then((j) => j.bots || []) });
  const [who, setWho] = useState(""), [day, setDay] = useState("");
  const [msgs, setMsgs] = useState<OldMsg[]>([]), [total, setTotal] = useState(0), [from, setFrom] = useState(0), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const load = async (w: string, d: string, before?: number) => {
    setBusy(true); setErr("");
    try {
      const j = await office<{ messages: OldMsg[]; total: number; from: number }>(`old?${new URLSearchParams({ who: w, day: d, ...(before !== undefined ? { before: String(before) } : {}) })}`);
      setTotal(j.total || 0); setFrom(j.from || 0);   // 앞 글 더 = before=from(서버 _old.js · 한 쪽 400)
      setMsgs((cur) => (before !== undefined ? [...(j.messages || []), ...cur] : j.messages || []));
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  const days = idx.data?.find((b) => b.who === who)?.days || [];
  return (
    <PageSection title="옛 그록 대화">
      <p className="mt-1 text-sm text-muted-foreground">그록 앱 시절 대화(읽기만) · 봇 → 날</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(idx.data || []).map((b) => (
          <button key={b.who} type="button" aria-pressed={who === b.who} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${who === b.who ? "border-primary bg-primary/10 font-semibold" : "border-border"}`}
            onClick={() => { setWho(b.who); setDay(""); setMsgs([]); }}>
            {list.some((p) => p.who === b.who) ? <FaceImg id={idOf(b.who, list)} size={16} /> : null}{b.who} <span className="tabular-nums text-muted-foreground">{b.days.length}일</span>
          </button>
        ))}
      </div>
      {who ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {days.map((d) => <button key={d} type="button" aria-pressed={day === d} className={`rounded-full border px-2 py-0.5 text-xs tabular-nums ${day === d ? "border-primary bg-primary/10" : "border-border"}`} onClick={() => { setDay(d); void load(who, d); }}>{d.slice(5)}</button>)}
        </div>
      ) : null}
      {err ? <p className="mt-2 text-sm text-destructive" role="alert">{err}</p> : null}
      {day && msgs.length ? (
        <Card>
          <div className="p-3">
            <p className="text-xs text-muted-foreground">{who} · {day} · {msgs.length}/{total}글</p>
            {from > 0 ? <button type="button" className={`${btn} mt-2`} disabled={busy} onClick={() => void load(who, day, from)}>{busy ? "받는 중…" : "앞 글 더 보기"}</button> : null}
            <ol className="mt-2 flex flex-col gap-2">
              {msgs.map((m) => (
                <li key={m.id} className="text-sm">
                  <span className="text-xs text-muted-foreground"><b className="text-foreground">{m.who}</b>{m.to ? ` → ${m.to}` : ""} · <span className="tabular-nums">{hm(m.ts)}</span>{m.tag ? ` · ${m.tag}` : ""}</span>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      ) : null}
    </PageSection>
  );
}

/** 지금 판 = 이 화면이 도는 빌드 · 올라간 판(version.json)과 다르면 「새 판 있음」(글칸이 비면 저절로 다시 읽음 · main.tsx) */
declare const __NM_BUILD__: string;
export function useBuildLine() {   // → {now: 지금 판 때, fresh: 새 판 때(없으면 "")} · 설정 「지금 판」 행(yeta-settings.tsx)도 같이 씀
  const live = useQuery({ queryKey: ["nomute", "build"], queryFn: () => fetch(`/office-app/version.json?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json() as Promise<{ build?: string }>), staleTime: 30_000 }).data?.build;
  const at = (b: string) => { const t = Date.parse(b); return Number.isFinite(t) ? `${kst(t).toISOString().slice(5, 10)} ${t12(t)}` : b; };
  return { now: at(__NM_BUILD__), fresh: live && live !== __NM_BUILD__ ? at(live) : "" };
}
export function NomuteBuild() {
  const b = useBuildLine();
  return (
    <p className="mt-6 text-center text-xs tabular-nums text-muted-foreground">
      지금 판 {b.now}{b.fresh ? ` · 새 판 있음(${b.fresh}) — 곧 저절로 바뀜` : ""}
    </p>
  );
}
