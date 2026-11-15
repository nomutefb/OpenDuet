// 설정 판 — 옛 화면(viewer/office.html) 설정 판과 같은 서버 길 · 같은 규칙
//   지금 봇(GET bots · 다음 깸 = GET schedule) · 지정방 멤버(GET/POST roomset · 형) · 공지 설정 한 장(GET/POST noticeset · 형)
//   스케줄러 연결(GET schedule/link) · 바꾸기(루틴 상태·언제·할 일 없어도 깨움 · 사건 모아서 기다림 = POST schedule/set · 먼저 dry 미리 보기 → 확인)
//   옛 그록 대화(GET old · 봇 → 날 → 글 · 읽기만) · 맨 아래 「지금 판」(형이 새 판인지 눈으로 · 10-28 10:51 「웹앱이 자동으로 버전업이 안되네」)
import { readFail, reading } from "./wait-text";   // 읽는 중 · 못 읽음 글 한 벌
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StateDiff } from "./state-diff";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PageSection } from "@/components/layout/page-shell";
import { idOf, type Meter, type MeterRow, office, people } from "../data/office";
import type { SchedGpu } from "./sched-gpu";   // GPU 칸(형 11-05 09:43 · 뜸)
import { FaceImg } from "./faces";
import { t12 } from "./when";
import { Chev } from "./chev";   // 꺽쇠 하나(형 11-01)
import { GoButton } from "./go-button";
import type { Review } from "./sched-review";
import type { Health, HealthSum } from "./sched-bits";   // 상태 점 칸(뜸 서버 healthOf · 없으면 ○ 확인 안 됨)
import { whoName } from "./who-name";
import { ACT_QUERY_KEY, actCount, botLine, type MiniRow } from "./activity-line";   // 「지금 봇」 = 서버 활동 판정 그대로(형 11-14 「더 확대해서 유지보수해줘」)
import { DuetIcon } from "@/components/duet/icons";
import { RoomGoneDialog, canGone } from "./temp-room";   // 방 없애기(형 11-05 · 방 목록 🗑️ 와 같은 되묻기)

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

export type SchedBot = { bot: string; who: string; wakes: number[]; next_ts?: number; on?: boolean };
export type Routine = { id: string; bot: string; who: string; name: string; when: string[]; cron?: string[]; state: string; fire_empty?: boolean; fork?: string; task?: string; marks?: string[];
  room?: string; health?: Health; bell6?: { n: number; of: number; today: number; cap: number; ring: string[]; stop?: { who: string; ts: number }; mirror?: boolean } };   // bell6 = 6마디 종 줄(뎅 11-01 · 서버 bell6.<방>)
export type SchedFork = { id: string; name: string; on?: boolean; common?: string };
type Kind = { kind: string; delay_max?: number; ttl?: number };
export type RunnerJob = { id: string; name: string; file: string; host?: string; src?: string; kind: string; fork: string; on?: boolean; when?: string; cron_kst?: string[]; clock?: string[]; starts?: string[]; providers?: string[]; model?: string[]; owner?: string; checked?: boolean; res?: { at: string; gpu?: boolean }[]; gpu?: string[]; in?: { paths?: string[]; after?: string[] }; out?: { calls?: string[]; to?: string }; notify?: string[]; health?: Health };   // out.to = 잡이 내놓는 곳(저장소·화면 · 뜸 11-02 「out.to 6줄이 안 그려지고」)
export type SchedRunners = { groups: { id: string; name: string }[]; forks: { id: string; name: string; group: string; on?: boolean; note?: string }[]; jobs: RunnerJob[] };
export type SchedChange = { at: number; who: string; id: string; scope?: string; field?: string; from?: unknown; to?: unknown; commit?: string; sha?: string; live?: boolean; review?: string; note?: string };   // 최근 바뀜(서버 R2 · 최근 20 · live = 방 루틴·6마디 종 = 표 커밋 없이 바로 먹음)
type Sched = { bots: SchedBot[]; routines: Routine[]; kinds: Kind[]; sha: string; can_set: boolean; forks?: SchedFork[]; clock_got?: { got?: boolean; sha?: string }; runners?: SchedRunners; gpu?: SchedGpu; changes?: SchedChange[]; review?: Record<string, Review>; health_sum?: HealthSum; at?: number };   // review = 폐기 → 검토 칸(봄 #2092 · ./sched-review.tsx)

const usePeople = () => useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
export const useSched = () => useQuery({ queryKey: ["nomute", "schedule"], queryFn: () => office<Sched>("schedule"), staleTime: 30_000, refetchInterval: 120_000 });

export function NomuteBots() {
  const list = usePeople();
  // 봇 현황 한 장 · 러너맵과 같은 활동 줄(GET status/activity) — 옛 bots 자료(지금 턴이 도는가)는 일하는 손을 「N분 전」으로, 쉬는 손을 꺼진 것처럼 냈음
  const act = useQuery({ queryKey: ACT_QUERY_KEY, queryFn: () => office<{ rows?: MiniRow[] }>("status/activity").then((j) => j.rows || []), refetchInterval: 60_000, staleTime: 30_000 });
  const sched = useSched();
  const rows = list.filter((p) => p.kind === "bot");   // 윈터(클로드) 따로 온라인 줄 0 = 윈터 상태는 머리 등불 구슬(형 10-28 09:24)
  const n = actCount(act.data || []);
  return (
    <PageSection title="지금 봇">
      <p className="mt-1 text-sm text-muted-foreground">일하는 중 {n.work} · 받을 수 있음 {n.ready} / {rows.length}</p>
      <Card>
        <ul className="divide-y divide-border">
          {rows.map((p) => {
            const l = botLine((act.data || []).find((x) => x.name === p.who), ago), s = sched.data?.bots.find((x) => x.who === p.who);
            const work = l.kind === "work", on = work || l.kind === "ready";   // 초록 점 = 일하는 중 · 받을 수 있음(서버가 확인한 손)
            return (
              <li key={p.who} className="flex items-center gap-3 px-4 py-2.5">
                <span className="relative"><FaceImg id={idOf(p.who, list)} size={32} />{on ? <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" /> : null}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.name || p.who} {p.mark || ""}{p.role ? <span data-content className="ml-1 text-xs font-normal text-muted-foreground">{p.role}</span> : null}
                    {p.memory ? <span className="ml-1.5 rounded-full border border-border px-1.5 py-px text-[10px] font-normal text-muted-foreground" title={MEMORY_T[p.memory]}>기억 {p.memory}</span> : null}</p>
                  <p className={`text-xs ${work ? "animate-pulse text-foreground" : "text-muted-foreground"}`}>{l.text || "활동 줄 없음"}</p>
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
        <button type="button" className={btn} onClick={() => setBack((b) => b + 1)} aria-label="하루 앞"><Chev dir="left" size={16} /></button>
        <span className="tabular-nums">{`${+day.slice(4, 6)}/${+day.slice(6)}`}{back ? "" : " 오늘"}</span>
        <button type="button" className={btn} disabled={!back} onClick={() => setBack((b) => Math.max(0, b - 1))} aria-label="하루 뒤"><Chev dir="right" size={16} /></button>
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
  const [edit, setEdit] = useState<Record<string, string[]>>({}), [gone, setGone] = useState<{ id: string; name: string } | null>(null);   // 방 없애기(형 11-05 「설정에서도 반영되어야해」 · 방 목록 🗑️ 와 같은 되묻기)
  const save = useMutation({
    mutationFn: ({ room, members }: { room: string; members: string[] }) => office("roomset", { method: "POST", body: JSON.stringify({ room, members, base: q.data?.roomset.ver }) }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["nomute", "roomset"] }); void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] }); },   // 고친 칸 접기 = ✓ 뒤(GoButton done)
  });
  const d = q.data;
  return (
    <PageSection title="지정방 멤버">
      {gone ? <RoomGoneDialog r={gone} onClose={() => setGone(null)} /> : null}
      <p className="mt-1 text-sm text-muted-foreground">{d ? `판 ${d.roomset.ver} · ${d.roomset.by || ""}` : q.isError ? readFail(q.error) : reading()}</p>
      {d ? d.designated.map((rid) => {
        const cur = edit[rid] || d.roomset.rooms[rid] || [];
        const changed = !!edit[rid];
        return (
          <Card key={rid}>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 text-sm font-semibold">{rooms.data?.find((r) => r.id === rid)?.name || rid} <span className="text-xs font-normal text-muted-foreground">{cur.length}명</span></p>
                {d.can_edit && canGone({ id: rid, temp: /^tmp-/.test(rid) }) ? <button type="button" aria-label={`${rooms.data?.find((r) => r.id === rid)?.name || rid} 없애기`} title="방 없애기" className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setGone({ id: rid, name: rooms.data?.find((r) => r.id === rid)?.name || rid })}><DuetIcon name="trash" size={16} /></button> : null}
              </div>
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
                  <GoButton className={btn} disabled={save.isPending || !cur.length} go={() => save.mutateAsync({ room: rid, members: cur })} done={() => setEdit((e) => { const n = { ...e }; delete n[rid]; return n; })}>저장</GoButton>
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
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["nomute", "notice"] }); },   // 글 칸 접기 = ✓ 뒤(GoButton done)
  });
  const n = q.data?.notice;
  return (
    <PageSection title="공지 설정">
      <p data-content className="mt-1 text-sm text-muted-foreground">{n ? `판 ${n.ver} · ${n.by || ""} · ${String(n.at || "").slice(5, 16).replace("T", " ")}` : q.isError ? readFail(q.error) : reading()}</p>
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
                  <GoButton className={btn} disabled={save.isPending || !text.trim() || text === n.text} go={() => save.mutateAsync(text)} done={() => setText(null)}>저장(새 판)</GoButton>
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

type LinkBot = { name: string; hook01?: { enabled: boolean; last_run?: string }; hook01_why?: string; routines: { id: string; state: string; result?: string | null; ran_at?: string | null; alert?: string | null }[]; today?: { planned?: number; wakes: number; clock: number; manual: number; cap: number; lost?: number } };
export function NomuteLink() {
  const q = useQuery({ queryKey: ["nomute", "link"], queryFn: () => office<{ at: number; by?: string; link?: { clock?: { beat_at?: string }; bots?: Record<string, LinkBot> } }>("schedule/link"), refetchInterval: 60_000 });
  const k = q.data?.link, beat = k?.clock?.beat_at ? Math.round((Date.now() - Date.parse(k.clock.beat_at)) / 1000) : null;
  return (
    <PageSection title="스케줄러 연결">
      <p className={`mt-1 text-sm ${beat == null || beat > 130 ? "text-destructive" : "text-muted-foreground"}`}>{!q.data ? (q.isError ? readFail(q.error) : reading()) : !k ? "아직 한 장 없음 — 윈A 지킴이가 올리면 보임" : `시계 마지막 신호 ${beat == null ? "모름" : `${beat}초 전`} · 읽은 때 ${hm(q.data.at)}`}</p>
      {k?.bots ? (
        <Card>
          <ul className="divide-y divide-border">
            {Object.entries(k.bots).map(([id, x]) => {
              const on = x.routines.filter((r) => r.state === "live" || r.state === "dry").length, ran = x.routines.filter((r) => r.result === "ran").length;
              return (
                <li key={id} className="px-4 py-2.5">
                  <p className="flex items-center justify-between text-sm"><b>{x.name}</b><span className={`text-xs ${x.hook01?.enabled === false || x.hook01_why ? "text-destructive" : "text-muted-foreground"}`}>{x.hook01_why || (x.hook01?.enabled ? "호출 연결 켜짐" : "호출 연결 꺼짐")}</span></p>
                  <p className="text-xs text-muted-foreground">
                    {x.today ? `오늘 자동 ${x.today.clock}${x.today.planned ? `/${x.today.planned}` : ""} · 직접 ${x.today.manual}${x.today.lost ? ` · 놓침 ${x.today.lost}` : ""} · ` : ""}켠 루틴 {on} · 돎 {ran}{x.hook01?.last_run ? ` · 마지막 ${hm(x.hook01.last_run)}` : ""}
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
export const CF_KO: Record<string, string> = { state: "상태", when: "언제", fire_empty: "할 일 없어도 깨움", delay_max: "모아서 기다림", on: "차단기", task: "할 일", common: "공통 내용", fork: "묶음", bot: "어떤 봇", add: "새로 만듦", remove: "지움" };
const CRON_H = "CRON_TZ=Asia/Seoul ";
export const cronShow = (l?: string[]) => (l || []).map((c) => String(c).replace(CRON_H, "")).join(" ; ");
export const cfVal = (f: string, v: unknown) => (f === "when" ? cronShow(v as string[]) || "—" : f === "fire_empty" ? (v === true ? "켬" : v === false ? "끔" : "—") : f === "state" ? ST_KO[String(v)] || String(v) : f === "on" ? (v === false ? "내림" : "올림") : f === "task" || f === "common" ? `${String(v ?? "").slice(0, 24)}…` : v == null ? "—" : String(v));
export type SchedQ = Q;
export type SchedSetRes = SetRes;
type Q = { at: "routine" | "bot" | "kind" | "fork"; key: string; field: string; value: unknown; label: string };
type SetRes = { same?: boolean; from?: unknown; to?: unknown; commit?: string; checked?: boolean; preview?: { next_at?: number; day_max: number } };

export function NomuteSchedule() {
  const qc = useQueryClient();
  const s = useSched();
  const [ask, setAsk] = useState<{ q: Q; r: SetRes } | null>(null), [msg, setMsg] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => { setVals({}); }, [s.data?.sha]);
  const setReq = (q: Q, dry: boolean) => office<SetRes>("schedule/set", { method: "POST", body: JSON.stringify({ at: q.at, key: q.key, field: q.field, value: q.value, sha: s.data?.sha, dry }) });
  const changed = (q: Q, r: SetRes) => {
    setAsk(null);
    setMsg(`바뀜 · ${q.label} ${cfVal(q.field, r.from)} → ${cfVal(q.field, r.to)} · 커밋 ${String(r.commit || "").slice(0, 7)}${r.checked ? " · 다시 읽어 그대로 확인" : ""}`);
    void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
  };
  const go = useMutation({
    mutationFn: ({ q, dry }: { q: Q; dry: boolean }) => setReq(q, dry),
    onSuccess: (r, { q, dry }) => {
      if (r.same) { setAsk(null); setMsg(`이미 ${cfVal(q.field, q.value)}이야 — 바꿀 것 없음`); return; }
      if (dry) { setAsk({ q, r }); setMsg(""); return; }
      changed(q, r);
    },
    onError: (e) => {
      setAsk(null);
      const m = e instanceof Error ? e.message : String(e);
      setMsg(/changed/.test(m) ? "다른 데서 바뀜 — 새 판을 다시 읽었어 · 다시 골라 줘" : m);
      if (/changed/.test(m)) void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    },
  });
  const prep = (q: Q) => go.mutate({ q, dry: true });
  // 「바꾸기」 = 게이지 → ✓ 단추(형 11-15 「전송이나 저장 버튼들 … 하네스 전반 통일」 · 빠르 02:12 「스케줄러 바꾸기 하나만 아직 맨 단추」) — 확인 띠는 ✓ 를 보여 준 뒤 접음(done) · 실패 = 띠를 남기고 빨강
  const apply = async (q: Q) => {
    try { return await setReq(q, false); }
    catch (e) { const m = e instanceof Error ? e.message : String(e); setMsg(/changed/.test(m) ? "다른 데서 바뀜 — 새 판을 다시 읽었어 · 다시 골라 줘" : m); if (/changed/.test(m)) void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] }); throw e; }
  };
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
      {d && !can ? <p className="mt-1 text-xs text-muted-foreground">바꾸기 = 형 자리만</p> : null}   {/* 상태 설명 줄 뺌 · 권한 줄만(형 11-02 08:1x 「옆에 설명글은 빼줘」) */}
      {ask ? (
        <div className="nm-sd-band sticky top-2 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-2xl p-3 text-sm">   {/* 확인 띠 = 유리 판 + 값 바뀜 두 줄(− 옛 값 / + 새 값 · ./state-diff.tsx · 형 11-15) */}
          <span className="min-w-0 flex-1"><StateDiff label={<>{ask.q.label} · {CF_KO[ask.q.field]}</>} from={cfVal(ask.q.field, ask.r.from)} to={cfVal(ask.q.field, ask.r.to)} />
            {ask.r.preview ? <small className="block text-xs text-muted-foreground">다음 깸 {ask.r.preview.next_at ? nextShort(ask.r.preview.next_at) : "없음"} · 하루 정해진 {ask.r.preview.day_max}번</small> : null}
          </span>
          <GoButton className={btn} disabled={go.isPending} busy="바꾸는 중" go={() => apply(ask.q)} done={(r) => { if (r.same) { setAsk(null); setMsg(`이미 ${cfVal(ask.q.field, ask.q.value)}이야 — 바꿀 것 없음`); } else changed(ask.q, r); }}>바꾸기</GoButton>
          <button type="button" className={btn} onClick={() => setAsk(null)}>취소</button>
        </div>
      ) : null}
      {msg ? <p className="mt-2 text-sm" role="status">{msg}</p> : null}
      {!d ? <p className="mt-2 text-sm text-muted-foreground">{s.isError ? readFail(s.error, "스케줄 표") : reading("표")}</p> : (
        <>
          <h3 className="mt-4 text-sm font-semibold">루틴 <span className="text-xs font-normal text-muted-foreground">{d.routines.length}줄</span></h3>
          <Card>
            <ul className="divide-y divide-border">
              {d.routines.map((r) => (
                <li key={r.id} data-content className="flex flex-col gap-2 px-4 py-2.5">
                  <p data-content className="text-sm"><b>{whoName(r.who)}</b> · {r.name}<small className="block text-xs text-muted-foreground">{r.id} · {r.when.length ? r.when.join(" + ") : "부를 때만"}</small></p>
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
          <h3 className="mt-4 text-sm font-semibold">봇</h3>
          <Card>
            <ul className="divide-y divide-border">
              {d.bots.map((b) => (
                <li key={b.bot} data-content className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                  <b className="min-w-12">{whoName(b.who)}</b>
                  <span className="flex-1 text-xs text-muted-foreground">하루 정해진 깸 {b.wakes.length}번{b.next_ts ? ` · 다음 ${nextShort(b.next_ts)}` : ""}</span>
                </li>
              ))}
            </ul>
          </Card>
          {d.kinds.length ? (
            <>
              <h3 className="mt-4 text-sm font-semibold">사건 모아 깨우기</h3>
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
      <div className="mt-1 flex flex-wrap gap-1.5">   {/* 머리 밑 설명 줄 뺀 자리 = 첫 줄(형 11-02 08:1x 「옆에 설명글은 빼줘」) */}
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
            {from > 0 ? <button type="button" className={`${btn} mt-2`} disabled={busy} onClick={() => void load(who, day, from)}>{busy ? "읽는 중…" : "앞 글 더 보기"}</button> : null}
            <ol className="mt-2 flex flex-col gap-2">
              {msgs.map((m) => (
                <li key={m.id} className="text-sm">
                  <span className="text-xs text-muted-foreground"><b className="text-foreground">{whoName(m.who)}</b>{m.to ? <> <Chev dir="right" size={11} /> {whoName(m.to)}</> : ""} · <span className="tabular-nums">{hm(m.ts)}</span>{m.tag ? ` · ${m.tag}` : ""}</span>
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
  const live = useQuery({ queryKey: ["nomute", "build"], queryFn: () => fetch(`/garden-app/version.json?t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json() as Promise<{ build?: string }>), staleTime: 30_000 }).data?.build;
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

/** 보안 서랍(빠르 11-15 · 깃 #-020 · 형 11-14 23:42 「자리 1 2 3을 토큰 키 처럼 각각 클립보드 복사 가능하게 설정에 만들어놓으셈」 · 23:56 ✓ ① 처음 한 번 붙여 넣기 → 그 뒤 복사만)
 *  값은 화면에 안 그림 · 넣기 = 서버가 암호화해 둠 + 그 자리 열쇠가 맞는지 「맞음 · 틀림」 · 복사 = 누를 때만 서버에서 받아 클립보드 · 형 문만(봇 열쇠 = 403) */
type VaultSeat = { seat: string; set: boolean; at: number | null; match: boolean | null; hint?: string | null };   // hint = 서버가 가려서 준 꼴(앞 몇 글자 + *** + 끝 두 글자 · editor _seatvault.js maskOf) — 값 자체는 「복사」 때만
/** 서랍 실패 까닭 = 입력 · 회선 · 앱 셋을 섞지 않음(하네스 §오류 3분류 · 서버 why 는 그대로) */
const vaultWhy = (e: unknown, fall: string) => {
  const m = e instanceof Error ? e.message : "";
  if (/failed to fetch|network|load failed/i.test(m)) return "네트워크 오류 — 다시 눌러 줘";
  return m || fall;
};
export function NomuteVault() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["nomute", "seatvault"], queryFn: () => office<{ seats: VaultSeat[] }>("seatvault").then((j) => j.seats || []), staleTime: 60_000 });
  const [draft, setDraft] = useState<Record<string, string>>({}), [note, setNote] = useState<Record<string, string>>({}), [ask, setAsk] = useState(""), [done, setDone] = useState("");
  const put = useMutation({
    mutationFn: (v: { seat: string; value: string }) => office<{ match: boolean }>("seatvault", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: (j, v) => { setDraft((d) => ({ ...d, [v.seat]: "" })); setNote((n) => ({ ...n, [v.seat]: j.match ? "넣었어 · 열쇠 맞음" : "넣었어 · 이 자리 열쇠와 안 맞아(다시 확인)" })); void qc.invalidateQueries({ queryKey: ["nomute", "seatvault"] }); },
    onError: (e, v) => setNote((n) => ({ ...n, [v.seat]: vaultWhy(e, "못 넣었어") })),
  });
  const mint = useMutation({
    mutationFn: (seat: string) => office<{ match: boolean }>("seatvault/mint", { method: "POST", body: JSON.stringify({ seat }) }),
    onSuccess: (_j, seat) => { setNote((n) => ({ ...n, [seat]: "새 열쇠 만들어 넣었어 · 앞 열쇠는 꺼짐 · 이제 「복사」" })); void qc.invalidateQueries({ queryKey: ["nomute", "seatvault"] }); },
    onError: (e, seat) => setNote((n) => ({ ...n, [seat]: vaultWhy(e, "못 만들었어") })),
  });
  const copy = async (seat: string) => {
    try {
      const j = await office<{ value: string }>("seatvault/copy", { method: "POST", body: JSON.stringify({ seat }) });
      await navigator.clipboard.writeText(j.value);
      setDone(seat); window.setTimeout(() => setDone((d) => (d === seat ? "" : d)), 1800);   // 옛 에디터 modern-copy 체크 머무름(touchHold 1800)
    } catch (e) { setNote((n) => ({ ...n, [seat]: vaultWhy(e, "복사 못 했어") })); }
  };
  return (
    <PageSection title="보안 서랍">
      {/* 설명글 뺌(형 11-15 「설정에 설명글잇는것좀 없애주라」) */}
      <Card>
        <ul className="divide-y divide-border">
          {(q.data || []).map((s) => (
            <li key={s.seat} className="flex flex-col gap-2 px-4 py-3">
              <p className="flex items-center justify-between text-sm">
                <span className="flex min-w-0 items-baseline gap-2"><b className="shrink-0">{s.seat.replace("자리", "자리 ")}</b>
                  {s.set && s.hint ? <code className="min-w-0 truncate font-mono text-xs text-muted-foreground" aria-label="열쇠 앞부분만 보임">{s.hint}</code> : null}</span>   {/* 형 11-15 「암호 있는 곳 노출 가능한 부분은 보이고 나머지늠 ***로 표기」 */}
                <span className={`text-xs ${s.set && s.match === false ? "text-destructive" : "text-muted-foreground"}`}>{!s.set ? "비어 있음" : s.match === false ? "넣음 · 열쇠 안 맞음" : `넣음${s.at ? ` · ${t12(s.at)}` : ""}`}</span>
              </p>
              <div className="flex items-center gap-2">
                <input id={`vault-${s.seat}`} type="password" autoComplete="off" spellCheck={false} placeholder={s.set ? "바꿀 때만 붙여 넣기" : "열쇠 붙여 넣기"} value={draft[s.seat] || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.seat]: e.target.value }))} className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-transparent px-2.5 text-sm" />
                <GoButton disabled={!draft[s.seat]?.trim() || put.isPending} go={() => put.mutateAsync({ seat: s.seat, value: draft[s.seat].trim() })} className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-40">넣기</GoButton>
                <button type="button" disabled={!s.set} aria-label={done === s.seat ? "복사됨" : "복사"} onClick={() => void copy(s.seat)} className={`relative grid min-h-10 place-items-center rounded-lg border px-3 text-sm active:[transform:scale(var(--press-s,.85))] transition-[transform,background-color,border-color] duration-150 disabled:opacity-40 ${done === s.seat ? "border-[#CFFF40] bg-[#CFFF40]/15" : "border-border"}`}>
                  {/* 복사 → 체크 모션 = 옛 에디터 뉴스 요약 복사 단추(modern-copy · 그림 줄며 사라짐 133ms → 체크 133ms 뒤 142ms 로 나타남 · transform · opacity 만) */}
                  <span className={`col-start-1 row-start-1 transition-[opacity,transform] ${done === s.seat ? "scale-50 opacity-0 duration-[133ms] ease-[cubic-bezier(.25,1,.5,1)]" : "scale-100 opacity-100 duration-[138ms] delay-[125ms] ease-[cubic-bezier(.42,0,.58,1)]"}`}>복사</span>
                  <span aria-hidden className={`col-start-1 row-start-1 grid place-items-center transition-[opacity,transform] ${done === s.seat ? "scale-100 opacity-100 duration-[142ms] delay-[133ms] ease-[cubic-bezier(.42,0,.58,1)]" : "scale-50 opacity-0 duration-[121ms] ease-[cubic-bezier(.22,1,.36,1)]"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                </button>
              </div>
              {!s.set ? (
                <button type="button" disabled={mint.isPending} onClick={() => setAsk(s.seat)} className="-my-2 self-start py-3 text-xs text-muted-foreground underline underline-offset-2 disabled:opacity-40">새 열쇠 만들기</button>
              ) : null}
              {note[s.seat] ? <p role="status" className="text-xs text-muted-foreground">{note[s.seat]}</p> : null}
            </li>
          ))}
        </ul>
      </Card>
      {ask ? createPortal(
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAsk("")}>
          <div role="alertdialog" aria-label="새 열쇠 만들기" className="w-full max-w-xs rounded-2xl border border-border bg-background p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm">열쇠를 새로 만드시겠습니까?<br />앞 열쇠는 무효화됩니다.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={() => setAsk("")} className="min-h-10 rounded-lg border border-border px-4 text-sm active:[transform:scale(var(--press-s,.85))] transition-[transform,background-color,border-color] duration-150">취소</button>
              <GoButton disabled={mint.isPending} go={() => mint.mutateAsync(ask)} done={() => setAsk("")} className="min-h-10 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-40">만들기</GoButton>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
      {q.isError ? <p className="mt-2 text-xs text-destructive">{q.error instanceof Error ? q.error.message : "서랍을 못 열었어"}</p> : null}
    </PageSection>
  );
}
