// 설정 판 — 옛 화면(viewer/office.html) 설정 판과 같은 서버 길 · 같은 규칙
//   지금 봇(GET bots · 다음 깸 = GET schedule) · 지정방 멤버(GET/POST roomset · 형) · 공지 설정 한 장(GET/POST noticeset · 형)
//   스케줄러 연결(GET schedule/link) · 바꾸기(루틴 상태·언제·할 일 없어도 깨움 · 사건 모아서 기다림 = POST schedule/set · 먼저 dry 미리 보기 → 확인)
//   옛 그록 대화(GET old · 봇 → 날 → 글 · 읽기만) · 맨 아래 「지금 판」(형이 새 판인지 눈으로 · 10-28 10:51 「웹앱이 자동으로 버전업이 안되네」)
import { SrvNote } from "./srv-note";
import { readFail, reading } from "./wait-text";   // 읽는 중 · 못 읽음 글 한 벌
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { PageSection } from "@/components/layout/page-shell";
import { idOf, type Meter, type MeterRow, office, people } from "../data/office";
import { schedOpts } from "../data/crew-warm";
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
import { canGone } from "./temp-room";   // 못 없애는 방 잣대(형 11-05)
import { MorphAsk } from "./morph-ask";   // 방 없애기 = 그 자리 재확인(모달 0 · 형 11-16 03:0x)
import { dropRoomAway } from "./room-drop";   // 예 = 바로 목록에서 빼고 뒤에서

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
export type Routine = { id: string; bot: string; who: string; name: string; when: string[]; cron?: string[]; state: string; fire_empty?: boolean; fork?: string; task?: string; marks?: string[]; events?: { kind: string; mode?: string; via?: string; from?: string }[]; hook?: string; hook_at?: string; hook_ok?: boolean;   /* hook = 이 일을 깨우는 호출 열쇠의 이름(값 아님 · 예 BOT_WEBHOOK_URL_ON) · hook_at = 그 열쇠가 있는 자리(예 「깃허브 시크릿 → Pages 환경」) — hook_ok = 서버 환경에 그 주소가 있나(거짓 = 「열쇠 없음」) — 서버가 실어 주면 일 카드에 줄(형 11-16 22:0x · 칸 = 빠르 #4074) */
  room?: string; health?: Health; bell6?: { n: number; of: number; today: number; cap: number; ring: string[]; stop?: { who: string; ts: number }; mirror?: boolean } };   // bell6 = 6마디 종 줄(뎅 11-01 · 서버 bell6.<방>)
export type SchedFork = { id: string; name: string; on?: boolean; common?: string };
type Kind = { kind: string; delay_max?: number; ttl?: number; ko?: string };   // ko = 용건의 읽는 이름(서버 표가 주면 · 없으면 앱 표 ./sched-wake.ts KIND_KO)
export type RunnerJob = { llm?: string | string[]; llm_group?: string | string[];   /* 이 일이 읽는 서브 LLM 갈래(파이프라인 갈래 id · 「ms:<서버 일 id>」 · 서버 표가 주면 · ./llm-head-logic.ts) */ id: string; name: string; file: string; host?: string; src?: string; kind: string; fork: string; on?: boolean; when?: string; cron_kst?: string[]; clock?: string[]; starts?: string[]; providers?: string[]; model?: string[]; owner?: string; checked?: boolean; res?: { at: string; gpu?: boolean }[]; gpu?: string[]; in?: { paths?: string[]; after?: string[] }; out?: { calls?: string[]; to?: string }; notify?: string[]; health?: Health };   // out.to = 잡이 내놓는 곳(저장소·화면 · 뜸 11-02 「out.to 6줄이 안 그려지고」)
export type SchedRunners = { groups: { id: string; name: string }[]; forks: { id: string; name: string; group: string; on?: boolean; note?: string }[]; jobs: RunnerJob[] };
export type SchedChange = { at: number; who: string; id: string; scope?: string; field?: string; from?: unknown; to?: unknown; commit?: string; sha?: string; live?: boolean; review?: string; note?: string };   // 최근 바뀜(서버 R2 · 최근 20 · live = 방 루틴·6마디 종 = 표 커밋 없이 바로 먹음)
type Sched = { bots: SchedBot[]; routines: Routine[]; kinds: Kind[]; sha: string; can_set: boolean; forks?: SchedFork[]; clock_got?: { got?: boolean; sha?: string }; runners?: SchedRunners; gpu?: SchedGpu; changes?: SchedChange[]; review?: Record<string, Review>; health_sum?: HealthSum; at?: number };   // review = 폐기 → 검토 칸(봄 #2092 · ./sched-review.tsx)

const usePeople = () => useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
export const useSched = () => useQuery({ ...schedOpts<Sched>(), refetchInterval: 120_000 });   // 지난 표를 먼저 그리고 뒤에서 새로 받음 · 앱이 켜질 때 미리 받아 둔 답을 그대로 씀(../data/crew-warm.ts · 표가 그 사이 바뀌었으면 바꾸기는 서버가 「다른 데서 바뀜」으로 막고 새 표를 읽음)

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
      {q.isError ? <SrvNote what="계기판" detail={q.error instanceof Error ? q.error.message : String(q.error)} />
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
  const [edit, setEdit] = useState<Record<string, string[]>>({});   // 방 없애기(형 11-05 「설정에서도 반영되어야해」 · 방 목록 🗑️ 와 같은 되묻기)
  const save = useMutation({
    mutationFn: ({ room, members }: { room: string; members: string[] }) => office("roomset", { method: "POST", body: JSON.stringify({ room, members, base: q.data?.roomset.ver }) }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["nomute", "roomset"] }); void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] }); },   // 고친 칸 접기 = ✓ 뒤(GoButton done)
  });
  const d = q.data;
  return (
    <PageSection title="지정방 멤버">
      <p className="mt-1 text-sm text-muted-foreground">{d ? `판 ${d.roomset.ver} · ${d.roomset.by || ""}` : q.isError ? readFail(q.error) : reading()}</p>
      {d ? d.designated.map((rid) => {
        const cur = edit[rid] || d.roomset.rooms[rid] || [];
        const changed = !!edit[rid];
        return (
          <Card key={rid}>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 text-sm font-semibold">{rooms.data?.find((r) => r.id === rid)?.name || rid} <span className="text-xs font-normal text-muted-foreground">{cur.length}명</span></p>
                {d.can_edit && canGone({ id: rid, temp: /^tmp-/.test(rid) }) ? <MorphAsk label={`${rooms.data?.find((r) => r.id === rid)?.name || rid} 없애기`} title="방 없애기" className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" yesText="없애기" onYes={() => { qc.setQueryData<typeof d>(["nomute", "roomset"], (old) => (old ? { ...old, designated: old.designated.filter((x) => x !== rid) } : old)); dropRoomAway(qc, { id: rid, name: rooms.data?.find((r) => r.id === rid)?.name || rid }); }}><DuetIcon name="trash" size={16} /></MorphAsk> : null}
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

// 「공지 설정」 칸(NomuteNotice)은 ./notice-box.tsx 로 갈음 — 그록봇 공지와 같은 부품(판 · 날짜는 줄 오른쪽 · 위 「수정」 · 아래 「닫기」 · 「저장」 · 형 11-17 06:56 dm-bom)

// 「스케줄러 연결」 칸(NomuteLink · GET schedule/link)은 뺌 — 형 11-16 02:51 dm-bom [결정] 「✓ ① 빼기 — 스케줄 탭 하나로」(같은 정보 = 스케줄 탭 · 서버 셈 · 시계 박동은 그대로)
export const ST_KO: Record<string, string> = { shadow: "기록만", dry: "시험", live: "켬", off: "꺼짐", "grok-stay": "그록에 둠" };
export const CF_KO: Record<string, string> = { state: "상태", when: "언제", fire_empty: "할 일 없어도 깨움", delay_max: "모아서 기다림", on: "차단기", task: "할 일", common: "공통 내용", fork: "묶음", bot: "어떤 봇", add: "새로 만듦", remove: "지움" };
const CRON_H = "CRON_TZ=Asia/Seoul ";
export const cronShow = (l?: string[]) => (l || []).map((c) => String(c).replace(CRON_H, "")).join(" ; ");
export const cfVal = (f: string, v: unknown) => (f === "when" ? cronShow(v as string[]) || "—" : f === "fire_empty" ? (v === true ? "켬" : v === false ? "끔" : "—") : f === "state" ? ST_KO[String(v)] || String(v) : f === "on" ? (v === false ? "내림" : "올림") : f === "task" || f === "common" ? `${String(v ?? "").slice(0, 24)}…` : v == null ? "—" : String(v));
export type SchedQ = Q;
export type SchedSetRes = SetRes;
type Q = { at: "routine" | "bot" | "kind" | "fork"; key: string; field: string; value: unknown; label: string };
type SetRes = { same?: boolean; from?: unknown; to?: unknown; commit?: string; checked?: boolean; preview?: { next_at?: number; day_max: number } };

// 「스케줄러 바꾸기」 칸(NomuteSchedule)은 뺌 — 루틴 상태 · 언제 · 봇은 스케줄 화면 나무 · 일 판 · 봇 차단기 판에 같은 길(schedule/set)로 있고, 여기만 있던 「사건 모아 깨우기」는 스케줄 화면 「모아 깨우기」 칸(./sched-extra.tsx KindWaits)으로 옮김(형 11-17 03:24 구름 맥 창 「너가 말한거 반영하고 너 의견 따를테니 묻지말고 진행해」)

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
type VaultSeat = { seat: string; set: boolean; at: number | null; match: boolean | null; hint?: string | null; who?: string | null; id?: string | null; memo?: string };   // memo = 예비 자리 이름표(계정 · 비밀값 아님 · 서버가 칸을 주는 자리만 · 빠르 editor fast/vault-memo · 형 11-18 13:32 dm-gik 「예비 02, 03에 예비 자리에는 아래에 기입해서 저장가능한 텍스트 박스 넣어주고」)   // who · id = 지금 그 자리를 쓰는 이름 · 자리 id(서버 editor #3964 · 형 11-16 07:5x)   // hint = 서버가 가려서 준 꼴(앞 몇 글자 + *** + 끝 두 글자 · editor _seatvault.js maskOf) — 값 자체는 「복사」 때만
/** 서랍 실패 까닭 = 입력 · 회선 · 앱 셋을 섞지 않음(하네스 §오류 3분류 · 서버 why 는 그대로) */
const vaultWhy = (e: unknown, fall: string) => {
  const m = e instanceof Error ? e.message : "";
  if (/failed to fetch|network|load failed/i.test(m)) return "네트워크 오류 — 다시 눌러 줘";
  return m || fall;
};
export function NomuteVault() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["nomute", "seatvault"], queryFn: () => office<{ seats: VaultSeat[] }>("seatvault").then((j) => j.seats || []), staleTime: 60_000 });
  const [draft, setDraft] = useState<Record<string, string>>({}), [note, setNote] = useState<Record<string, string>>({}), [done, setDone] = useState("");
  const [memo, setMemo] = useState<Record<string, string>>({});   // 이름표 글칸(고치는 중) · 없으면 서버 값
  const saveMemo = (seat: string, v: string) => office<{ ok?: boolean; memo?: string }>("seatvault/memo", { method: "POST", body: JSON.stringify({ seat, memo: v }) });
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
      {q.isPending ? <p className="yset-wait">{reading("보안 서랍")}</p> : null}   {/* 받는 2~3초 동안 빈 줄만 보이던 자리(봄 11-18 실물) · isPending = 다시 받기를 기다리는 동안도 「읽는 중」 */}
      <Card>
        <ul className="nm-vault divide-y divide-border">
          {(q.data || []).map((s) => (
            <li key={s.seat} className="flex flex-col gap-2 px-4 py-3">
              <p className="flex items-center justify-between gap-2 text-sm">   {/* 좁은 폭 = 이름 · 열쇠 앞부분이 줄고 오른쪽 상태는 한 줄(전 = 「넣음 · 12:38 AM」이 두 줄로 꺾이거나 열쇠 글자에 붙음 · 봄 11-18) */}
                <span className="flex min-w-0 flex-1 items-baseline gap-2"><b className="shrink-0">{s.seat.replace(/^자리(\d)$/, "자리 0$1").replace(/^예비(\d+)$/, "예비 $1")}</b>
                  {s.who || s.id ? <span className="min-w-0 shrink truncate text-xs normal-case text-muted-foreground" aria-label="지금 쓰는 이름 · 자리 id">{[s.who && s.who !== s.seat ? s.who : null, s.id].filter(Boolean).join(" · ")}</span> : null}   {/* 형 11-16 07:5x 「자리 02 - 이런거 다 옆에 현재 사용중인 이름을 써줄래? cloud 이런식으로. 구름 cloud 각각 키명, 자리 명」 */}
                  {s.set && s.hint ? <code className="min-w-0 shrink-[3] truncate font-mono text-xs text-muted-foreground" aria-label="열쇠 앞부분만 보임">{s.hint}</code> : null}</span>   {/* 형 11-15 「암호 있는 곳 노출 가능한 부분은 보이고 나머지늠 ***로 표기」 */}
                <span className={`shrink-0 whitespace-nowrap text-xs tabular-nums ${s.set && s.match === false ? "text-destructive" : "text-muted-foreground"}`}>{!s.set ? "비어 있음" : s.match === false ? "넣음 · 열쇠 안 맞음" : `넣음${s.at ? ` · ${t12(s.at)}` : ""}`}</span>
              </p>
              <div className="flex items-center gap-2">
                <input id={`vault-${s.seat}`} type="password" autoComplete="off" spellCheck={false} placeholder={s.set ? "바꿀 때만 붙여 넣기" : "열쇠 붙여 넣기"} value={draft[s.seat] || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.seat]: e.target.value }))} className="nm-vault-in" />
                <GoButton disabled={!draft[s.seat]?.trim() || put.isPending} go={() => put.mutateAsync({ seat: s.seat, value: draft[s.seat].trim() })} className="nm-nb-btn nm-vault-b" busy="넣는 중">넣기</GoButton>
                <button type="button" disabled={!s.set} aria-label={done === s.seat ? "복사됨" : "복사"} onClick={() => void copy(s.seat)} className={`nm-nb-btn nm-vault-b nm-vault-copy${done === s.seat ? " ok" : ""}`}>
                  {/* 복사 → 체크 모션 = 옛 에디터 뉴스 요약 복사 단추(modern-copy · 그림 줄며 사라짐 133ms → 체크 133ms 뒤 142ms 로 나타남 · transform · opacity 만) */}
                  <span className={`col-start-1 row-start-1 transition-[opacity,transform] ${done === s.seat ? "scale-50 opacity-0 duration-[133ms] ease-[cubic-bezier(.25,1,.5,1)]" : "scale-100 opacity-100 duration-[138ms] delay-[125ms] ease-[cubic-bezier(.42,0,.58,1)]"}`}>복사</span>
                  <span aria-hidden className={`col-start-1 row-start-1 grid place-items-center transition-[opacity,transform] ${done === s.seat ? "scale-100 opacity-100 duration-[142ms] delay-[133ms] ease-[cubic-bezier(.42,0,.58,1)]" : "scale-50 opacity-0 duration-[121ms] ease-[cubic-bezier(.22,1,.36,1)]"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                </button>
              </div>
              {s.memo !== undefined ? (() => {   /* 이름표 = 한 줄 글칸 + 저장(형 11-18 13:32 「아래에 기입해서 저장가능한 텍스트 박스」) · 저장 → ✓(GoButton) → 다시 받기 */
                const v = memo[s.seat] ?? s.memo ?? "", changed = v.trim() !== (s.memo || "").trim(), long = v.length > 200;
                return (
                  <div className="flex items-center gap-2">
                    <input id={`vault-memo-${s.seat}`} type="text" autoComplete="off" spellCheck={false} maxLength={200} placeholder="이 자리 이름표(계정 등)" aria-label={`${s.seat} 이름표`} value={v}
                      onChange={(e) => setMemo((m) => ({ ...m, [s.seat]: e.target.value }))} className="nm-vault-in normal-case" />
                    <GoButton disabled={!changed || long} go={() => saveMemo(s.seat, v.trim())} done={() => { setMemo((m) => { const n = { ...m }; delete n[s.seat]; return n; }); void qc.invalidateQueries({ queryKey: ["nomute", "seatvault"] }); }} className="nm-nb-btn nm-vault-b" busy="저장 중">저장</GoButton>
                  </div>
                );
              })() : null}
              {!s.set ? (   /* 새 열쇠 = 되묻는 창(모달) 대신 그 자리 재확인(형 「항상 그냥 re 토글로만」 · ./morph-ask.tsx) */
                <MorphAsk className="-my-2 self-start py-3 text-xs text-muted-foreground underline underline-offset-2 disabled:opacity-40" disabled={mint.isPending} yesText="만들기" note="앞 열쇠는 꺼져" label={`${s.seat} 새 열쇠 만들기`} onYes={() => mint.mutate(s.seat)}>새 열쇠 만들기</MorphAsk>
              ) : null}
              {note[s.seat] ? <p role="status" className="text-xs text-muted-foreground">{note[s.seat]}</p> : null}
            </li>
          ))}
        </ul>
      </Card>
      {q.isError ? <SrvNote what="보안 서랍" detail={q.error instanceof Error ? q.error.message : undefined} className="tight" /> : null}
    </PageSection>
  );
}
