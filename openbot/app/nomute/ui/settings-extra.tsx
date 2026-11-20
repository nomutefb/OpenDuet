// 설정 판 — 옛 화면(viewer/office.html) 설정 판과 같은 서버 길 · 같은 규칙
//   지금 봇(GET bots · 다음 깸 = GET schedule) · 지정방 멤버(GET/POST roomset · 형) · 공지 설정 한 장(GET/POST noticeset · 형)
//   스케줄러 연결(GET schedule/link) · 바꾸기(루틴 상태·언제·할 일 없어도 깨움 · 사건 모아서 기다림 = POST schedule/set · 먼저 dry 미리 보기 → 확인)
//   옛 그록 대화(GET old · 봇 → 날 → 글 · 읽기만) · 맨 아래 「지금 판」(형이 새 판인지 눈으로 · 10-28 10:51 「웹앱이 자동으로 버전업이 안되네」)
import { SrvNote } from "./srv-note";
import { readFail, reading } from "./wait-text";   // 읽는 중 · 못 읽음 글 한 벌
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { PageSection } from "@/components/layout/page-shell";
import { idOf, type Meter, type MeterRow, office, people } from "../data/office";
import { schedOpts } from "../data/crew-warm";
import type { SchedGpu } from "./sched-gpu";   // GPU 칸(형 11-05 09:43 · 뜸)
import { FaceImg } from "./faces";
import { listWhen, t12 } from "./when";
import { agoMin } from "./ago-min";   // 연결 줄 마지막 쓴 때(한 시간 안 = N분 전)
import { Chev } from "./chev";   // 꺽쇠 하나(형 11-01)
import { GoButton } from "./go-button";
import type { Review } from "./sched-review";
import type { Health, HealthSum } from "./sched-bits";   // 상태 점 칸(뜸 서버 healthOf · 없으면 ○ 확인 안 됨)
import { whoName } from "./who-name";
import { ACT_QUERY_KEY, actCount, botLine, type MiniRow } from "./activity-line";   // 「지금 봇」 = 서버 활동 판정 그대로(형 11-14 「더 확대해서 유지보수해줘」)
import { DuetIcon } from "@/components/duet/icons";
import { canGone } from "./temp-room";   // 못 없애는 방 잣대(형 11-05)
import { MorphAsk } from "./morph-ask";   // 방 없애기 = 그 자리 재확인(모달 0 · 형 11-16 03:0x)
import { dropRoomAway } from "./room-drop";
import { YICO } from "./yeta-icons";   // 맨 위 칸 링크 그림(YETA link)   // 예 = 바로 목록에서 빼고 뒤에서

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
type VaultSeat = { seat: string; set: boolean; at: number | null; match: boolean | null; hint?: string | null; who?: string | null; id?: string | null; memo?: string; label?: string; on?: boolean | null;
  top?: boolean; title?: string; name?: string; transport?: string; url?: string; header?: string; link?: string };   // top = 맨 위 「봄의 정원 MCP server」 칸(서버 editor _seatvault.js GARDEN_SEAT · 형 11-19 08:07~08:16 dm-bom)   // memo = 예비 자리 이름표(계정 · 비밀값 아님 · 서버가 칸을 주는 자리만 · 빠르 editor fast/vault-memo · 형 11-18 13:32 dm-gik 「예비 02, 03에 예비 자리에는 아래에 기입해서 저장가능한 텍스트 박스 넣어주고」)   // who · id = 지금 그 자리를 쓰는 이름 · 자리 id(서버 editor #3964 · 형 11-16 07:5x)   // hint = 서버가 가려서 준 꼴(앞 몇 글자 + *** + 끝 두 글자 · editor _seatvault.js maskOf) — 값 자체는 「복사」 때만
/** 서랍 실패 까닭 = 입력 · 회선 · 앱 셋을 섞지 않음(하네스 §오류 3분류 · 서버 why 는 그대로) */
const vaultWhy = (e: unknown, fall: string) => {
  const m = e instanceof Error ? e.message : "";
  if (/failed to fetch|network|load failed/i.test(m)) return "네트워크 오류 — 다시 눌러 줘";
  return m || fall;
};
/** 복사 → 체크 단추 = 옛 에디터 뉴스 요약 복사 단추(modern-copy · 그림 줄며 사라짐 133ms → 체크 133ms 뒤 142ms 로 나타남 · transform · opacity 만) · 서랍 줄 · 맨 위 칸 같이 씀 */
function CopyBtn({ ok, off, label, go, text }: { ok: boolean; off?: boolean; label: string; go: () => void; text?: boolean }) {   // text = 글자 단추(테두리 0 · 예비 줄 · 형 11-20 11:02 「그냥 글자 버튼으로 해줘 복사도 마찬가지」) · 움직임은 그대로
  return (
    <button type="button" disabled={off} aria-label={ok ? "복사됨" : `${label} 복사`} onClick={go} className={`nm-nb-btn nm-vault-b nm-vault-copy${text ? " nm-mcp-tb" : ""}${ok ? " ok" : ""}`}>
      <span className={`col-start-1 row-start-1 transition-[opacity,transform] ${ok ? "scale-50 opacity-0 duration-[133ms] ease-[cubic-bezier(.25,1,.5,1)]" : "scale-100 opacity-100 duration-[138ms] delay-[125ms] ease-[cubic-bezier(.42,0,.58,1)]"}`}>복사</span>
      <span aria-hidden className={`col-start-1 row-start-1 grid place-items-center transition-[opacity,transform] ${ok ? "scale-100 opacity-100 duration-[142ms] delay-[133ms] ease-[cubic-bezier(.42,0,.58,1)]" : "scale-50 opacity-0 duration-[121ms] ease-[cubic-bezier(.22,1,.36,1)]"}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
      </span>
    </button>
  );
}
const seatName = (seat: string) => seat.replace(/^자리(\d)$/, "자리 0$1").replace(/^예비(\d+)$/, "예비 $1");
/** 예비 이름 = 서랍에 나온 차례(예비 1 · 2 · 3) — 서버 자리 id(예비01 · 06 …)는 화면에 안 나감(형 11-20 03:04 「예비 2 3 을 만들고」 · 03:42 「02 03은 이미 쓰고잇는 거는 배제」 = 쓰는 자리는 서버가 빼고 새 칸을 더함) */
const spareNames = (seats: VaultSeat[]) => { const m: Record<string, string> = {}; let i = 0; for (const s of seats) { if (!s.top) i++; m[s.seat] = s.label || (s.top ? seatName(s.seat) : `예비 ${i}`); } return (seat: string) => m[seat] || seatName(seat); };   // 서버 이름표(seats[].label · 빠르 #4398) 먼저 · 없으면 차례
const DOTS = "••••••••";   // 열쇠 칸 = 가린 꼴만(형 08:09 「*****로 가려져있고 복사만 가능」 · 그록 창과 같은 점)

/** 맨 위 「봄의 정원 MCP server」 칸 = 그록 「Edit MCP server」 꼴을 설명글 빼고 통째로(형 11-19 08:09 「이 형식을 거의 통째로 설명 빼고 옮겨」 「참고하기좀쉽게」 ·
 *    08:10 「애드 헤더는 필요없고」 「아래에 소트 어쩌고도 필요없고」(= OAuth 칸 뺌) 「edit 아니니까 그냥 봄의 정원 mcp server 라고하면됨」 · 봄 옮김 dm-bom)
 *  칸 = 다 고칠 수 없음 + 복사만(08:09 「보안칸도 비활성화값이고 *****로 가려져있고 복사만 가능」) · 넣기 · 바꾸기 · 새 열쇠는 아래 「지금 내용」 줄 그대로
 *  펼치면 Authentication 안에 예비 열쇠 줄(08:14 「그러면 아까 내가 준 그 양식을 펼치면」 「auth안에 예비가 여러개 나오게 해, 근데 그 중에 루미는 없는거야」 · 루미 = 서버가 안 줌)
 *  예비를 복사하면 그 줄 아래 사용처 글칸 → 치면 저절로 저장(08:16 「***로 표기해서 3개가 잇으면 되고 가져가면 그 아래에 내가 사용처를 적고 적으면 자동으로 저장되게하면대」 · 저장 단추 0)
 *  링크 그림 = 그록 플러그인 화면 새 탭(08:08 「링크는 항상 여기거든? url 픽토그램은 여기로」) · 펼침 = bot-desk .fold 꼴(grid 0fr → 1fr · 누를 때 한 번) */
function GardenMcp({ top, spares, done, saved, memoOf, copySeat, copyText, onUse, flush, remint, minting, focusUse, nameOf, flipOn }: {
  top: VaultSeat; spares: VaultSeat[]; done: string; saved: string; memoOf: (s: VaultSeat) => string;
  copySeat: (seat: string) => void; copyText: (key: string, text: string) => void; onUse: (seat: string, v: string) => void; flush: (seat: string) => void;
  remint: (seat: string) => Promise<unknown>; minting: boolean; focusUse: { seat: string; n: number } | null; nameOf: (seat: string) => string;
  flipOn: (seat: string, on: boolean) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false), [flipping, setFlipping] = useState("");
  // 복사 → 그 줄 사용처 칸에 바로 커서(형 11-20 03:04 dm-sia 「복사 시 자동으로 커서 아동 후 메모 한 줄 적게해줘」) · 칸이 막 그려진 뒤라 한 프레임 뒤
  useEffect(() => {
    if (!focusUse) return undefined;
    const id = requestAnimationFrame(() => { const el = document.getElementById(`mcp-use-${focusUse.seat}`) as HTMLInputElement | null; if (el) { el.focus(); const n = el.value.length; el.setSelectionRange(n, n); } });
    return () => cancelAnimationFrame(id);
  }, [focusUse]);
  const field = (label: string, text: string, key?: string) => (
    <div className="nm-mcp-row">
      <p className="nm-mcp-lb">{label}</p>
      <div className="flex items-center gap-2">
        <div className="nm-vault-in nm-mcp-f" aria-readonly="true">{text}</div>
        {key ? <CopyBtn ok={done === key} label={label} go={() => copyText(key, text)} /> : null}
      </div>
    </div>
  );
  return (
    <section className="nm-mcp" aria-label={top.title || "봄의 정원 MCP server"}>
      <div className="nm-mcp-hd">
        <h3>{top.title || "봄의 정원 MCP server"}</h3>
        {top.link ? <a className="nm-mcp-link" href={top.link} target="_blank" rel="noopener noreferrer" aria-label="그록 플러그인 화면 열기(새 탭)" dangerouslySetInnerHTML={{ __html: YICO.link }} /> : null}
      </div>
      <p className="nm-mcp-sec">Connection</p>
      {field("Name", top.name || "spring-garden", "mcp:name")}
      {field("Transport", top.transport || "HTTP")}
      {field("URL", top.url || "", "mcp:url")}
      <div className="nm-mcp-line" aria-hidden />
      <p className="nm-mcp-sec">Authentication</p>
      <div className="nm-mcp-row">
        <p className="nm-mcp-lb">HTTP headers</p>
        <div className="flex items-center gap-2">
          <div className="nm-vault-in nm-mcp-f nm-mcp-k" aria-readonly="true">{top.header || "Authorization"}</div>
          <div className={`nm-vault-in nm-mcp-f nm-mcp-v${top.set ? "" : " off"}`} aria-readonly="true" aria-label={top.set ? "열쇠 가림" : "비어 있음"}>{top.set ? DOTS : "비어 있음"}</div>
          <CopyBtn ok={done === top.seat} off={!top.set} label={top.header || "Authorization"} go={() => copySeat(top.seat)} />
        </div>
      </div>
      {spares.length ? (
        <>
          {/* 펼침 = 「예비 코드」 · 펼치면 라임(형 11-20 11:02 「이 펼침이 예비 3 이 아니라 예비 코드 라고 명칭이 되면 좋겠구, 누르면 라임색으로 들어오게 해주라」 · 색 = css aria-expanded) */}
          <button type="button" className="nm-nb-btn nm-mcp-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>예비 코드<Chev dir={open ? "up" : "down"} size={14} /></button>
          <div className="nm-mcp-fold" data-open={open || undefined} inert={open ? undefined : true}>
            <div>
              {/* 예비 줄 = 한 격자(이름 · 별 · 메모 · 복사 · 발행 칸이 줄마다 세로로 맞음) — 형 11:02 「우측에 복사 재발행은 아래 버튼하고 라인을 맞춰서」 · 「** 는, 길이에 따라 구역이 넓어지거나 할 필요는없어」 · 「지금 예비랑 * 별이랑 간격이 되게 떨어져잇는데 그럴 필요없고」
                  · 메모 = 복사 왼쪽 한 칸 · 늘 보임 · 50자 · 넘치면 칸 안에서 옆으로(「복사 좌측에 간단한 메모 적게끔해줘, 넘어가면 그냥 그 안에서 쭉 길어지게, 최대 50자」 · 저장 길 = 앞 판 사용처 그대로 seatvault/memo) */}
              <div className="nm-mcp-sp">
                {spares.map((s) => {
                  const v = memoOf(s);
                  return (
                    <div key={s.seat} className="nm-mcp-sr">
                      {/* 켜기 · 끄기 = 줄 맨 앞(형 13:23 「on 켜질때만 접속가능하게」) · 켜면 그 예비 얼굴 새싹 형광 · 끄면 어두운 판(./faces.tsx) · 서버 값 오기 전 = 빈 칸(격자 칸 수 그대로) */}
                      {s.on == null ? <span /> : <button type="button" role="switch" aria-checked={s.on} aria-label={`${nameOf(s.seat)} 켜기`} className="nm-sw nm-mcp-on" disabled={flipping === s.seat}
                        onClick={() => { setFlipping(s.seat); void flipOn(s.seat, !s.on).catch(() => undefined).finally(() => setFlipping("")); }}><span className="si-sw" aria-hidden /></button>}
                      <div className="nm-vault-in nm-mcp-f nm-mcp-sk" aria-readonly="true">{nameOf(s.seat)}</div>
                      <div className={`nm-vault-in nm-mcp-f nm-mcp-v nm-mcp-sv${s.set ? "" : " off"}`} aria-readonly="true" aria-label={s.set ? "열쇠 가림" : "비어 있음"}>{s.set ? DOTS : "비어 있음"}</div>
                      <div className="nm-mcp-use">
                        <input id={`mcp-use-${s.seat}`} type="text" autoComplete="off" spellCheck={false} maxLength={50} placeholder="메모" aria-label={`${nameOf(s.seat)} 메모`} value={v}
                          onChange={(e) => onUse(s.seat, e.target.value)} onBlur={() => flush(s.seat)} className="nm-vault-in normal-case" />
                        <svg aria-hidden className={`nm-mcp-ok${saved === s.seat ? " on" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <CopyBtn text ok={done === s.seat} off={!s.set} label={nameOf(s.seat)} go={() => copySeat(s.seat)} />
                      {/* 재발행 = 새 열쇠 + 앞 열쇠 파기(형 11-20 03:04 「내가 재발행 하면 키를 바꿀 수 있게 해줘 기존 건 파기」) · 그 자리 재확인(MorphAsk · 모달 0) · 빈 칸 = 발행(형 11:02 「새열쇠가 그냥 발행 으로」) · 둘 다 글자 단추 */}
                      {/* 예비 한 자리 = 이 줄 한 곳(형 11-20 07:18 dm-gik 「그리고 이거 따로 노니까 확인해주고」 · 깃 옮김 · 앞 판 = 빈 예비가 아래 카드에도 따로 나옴) */}
                      {s.set ? <MorphAsk className="nm-nb-btn nm-vault-b nm-mcp-tb shrink-0 disabled:opacity-40" disabled={minting} yesText="재발행" busy="재발행 중" label={`${nameOf(s.seat)} 재발행`} yesGo={() => remint(s.seat)}>재발행</MorphAsk>
                        : <MorphAsk className="nm-nb-btn nm-vault-b nm-mcp-tb shrink-0 disabled:opacity-40" disabled={minting} yesText="발행" busy="발행 중" label={`${nameOf(s.seat)} 발행`} yesGo={() => remint(s.seat)}>발행</MorphAsk>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

/** 봄의 정원 · 그록 열쇠로 붙은 연결 한 줄(서버 editor _keyconn.js connList · 번개 11-20) — last · first = ms */
type VaultConn = { id: string; seat: string; first: number | null; last: number | null; n: number; org: string; asn: number; country: string; client?: string; door?: string; names: { name: string; at: number }[]; blocked?: boolean; unknown?: boolean };   // door = 부른 도구(머리 x-office-door · 번개 11-20)
const DOOR_NAME: Record<string, string> = { "room-door": "거울 일꾼" };   // 이름 없이 도구로 부른 줄 = 도구 이름(번개 11:58 「「거울 일꾼」(room-door) 처럼」)
type VaultRaw = { seats?: VaultSeat[]; conns?: VaultConn[] };
const VAULT_Q = { queryKey: ["nomute", "seatvault"] as const, queryFn: () => office<VaultRaw>("seatvault"), staleTime: 60_000 };
const connWhen = (ms: number | null) => !ms ? "—" : Date.now() - ms < 3600e3 ? agoMin(Date.now() - ms) : listWhen(ms);   // 한 시간 안 = N분 전 · 오늘 = 3:50 PM · 그 앞 = 날짜
const X_SVG = <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>;

/** 열쇠 연결 줄(형 11-20 11:30 dm-bom 봄 옮김 「그럼 지금 혹시, 봄으 ㅣ정원 열쇠로 연결된 애들을 확인이 가능해?」 · 「계정단위로만 알아도되는데.」 · 11:32 「응 혹시 그걸 끊어낼수도있어? 내가 설정에서 x를 누르면」)
 *  = 봄의 정원 칸 바로 아래 · 연결마다 한 줄 = 마지막 쓴 때 · 부른 이름 · 망 주인(org · 없으면 AS번호) · 오른쪽 X = 그 자리 토글 → 게이지 → ✓(seatvault/conn) · 끊긴 줄 = 흐리게 + 「다시 잇기」 · 명부 밖 = 라임 테 · 설명글 0 */
function GardenConns({ conns, onBlock }: { conns: VaultConn[]; onBlock: (id: string, on: boolean) => Promise<unknown> }) {
  if (!conns.length) return null;
  return (
    <section className="nm-mcp nm-conn" aria-label="열쇠 연결">
      <p className="nm-mcp-sec">연결</p>
      <div className="nm-conn-l">
        {conns.map((c) => {
          const who = c.names.map((x) => x.name).join(" · ") || (c.door ? DOOR_NAME[c.door] || c.door : "이름 없음"), net = c.org || (c.asn ? `AS${c.asn}` : "—");
          return (
            <div key={c.id} className={`nm-conn-r${c.blocked ? " off" : ""}${c.unknown ? " unk" : ""}`}>
              <span className="nm-conn-t">{connWhen(c.last)}</span>
              <span className="nm-conn-n" title={who}>{who}</span>
              <span className="nm-conn-o" title={net}>{net}</span>
              {c.blocked ? <MorphAsk className="nm-nb-btn nm-vault-b nm-mcp-tb" yesText="잇기" busy="잇는 중" label={`${who} 다시 잇기`} yesGo={() => onBlock(c.id, false)}>다시 잇기</MorphAsk>
                : <MorphAsk className="nm-conn-x" yesText="끊기" busy="끊는 중" label={`${who} 끊기`} yesGo={() => onBlock(c.id, true)}>{X_SVG}</MorphAsk>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function NomuteVault() {
  const qc = useQueryClient();
  const q = useQuery({ ...VAULT_Q, select: (j: VaultRaw) => j.seats || [] });
  const conns = useQuery({ ...VAULT_Q, select: (j: VaultRaw) => j.conns || [] });   // 같은 한 번 받기(seatvault) · 연결 줄 = 형만 실림(서버 · 번개 11-20)
  const block = (id: string, on: boolean) => office<{ ok?: boolean; blocked?: boolean }>("seatvault/conn", { method: "POST", body: JSON.stringify({ id, block: on }) })
    .then((j) => { qc.setQueryData<VaultRaw>(VAULT_Q.queryKey, (old) => old && { ...old, conns: old.conns?.map((c) => (c.id === id ? { ...c, blocked: !!j.blocked } : c)) }); return j; });
  // 예비 켜기 · 끄기(형 11-20 13:23 dm-sia 시아 옮김 「저거 활성화를 온오프가능하면 좋겠다. on 켜질때만 접속가능하게」) = 서버 seatvault/on(천둥) · 답 값으로 서랍 · 방 목록(얼굴 불) 둘 다 맞춤
  const flipOn = (seat: string, on: boolean) => office<{ ok?: boolean; on?: boolean }>("seatvault/on", { method: "POST", body: JSON.stringify({ seat, on }) })
    .then((j) => { const v = j.on ?? on; qc.setQueryData<VaultRaw>(VAULT_Q.queryKey, (old) => old && { ...old, seats: old.seats?.map((x) => (x.seat === seat ? { ...x, on: v } : x)) }); void qc.invalidateQueries({ queryKey: ["nomute", "rooms"] }); return j; });
  const nameOf = spareNames(q.data || []);
  const [draft, setDraft] = useState<Record<string, string>>({}), [note, setNote] = useState<Record<string, string>>({}), [done, setDone] = useState("");
  const [memo, setMemo] = useState<Record<string, string>>({});   // 이름표 글칸(고치는 중) · 없으면 서버 값
  const saveMemo = (seat: string, v: string) => office<{ ok?: boolean; memo?: string }>("seatvault/memo", { method: "POST", body: JSON.stringify({ seat, memo: v }) });
  const [saved, setSaved] = useState("");
  const [focusUse, setFocusUse] = useState<{ seat: string; n: number } | null>(null);   // 복사한 자리 사용처 칸으로 커서(위 GardenMcp)   // saved = 방금 저절로 저장된 자리(✓ 잠깐)
  const waitRef = useRef<Record<string, { t: number; v: string }>>({});
  const saveUse = (seat: string, v: string) => {   // 사용처 저장 = 같은 서버 메모(seatvault/memo) · 글은 로컬에 두고 서버 값만 맞춤(치는 중 글자가 안 튐)
    const t = v.trim();
    if (t.length > 200) return;
    saveMemo(seat, t).then(() => {
      qc.setQueryData<VaultRaw>(VAULT_Q.queryKey, (old) => old && { ...old, seats: old.seats?.map((x) => (x.seat === seat ? { ...x, memo: t } : x)) });
      setSaved(seat); window.setTimeout(() => setSaved((d) => (d === seat ? "" : d)), 1800);
    }).catch((e) => setNote((n) => ({ ...n, [seat]: vaultWhy(e, "사용처 저장 못 했어") })));
  };
  const onUse = (seat: string, v: string) => {   // 치기 멈춘 뒤 0.7초 = 한 번 저장(글자마다 안 보냄)
    setMemo((m) => ({ ...m, [seat]: v }));
    const w = waitRef.current[seat];
    if (w) window.clearTimeout(w.t);
    waitRef.current[seat] = { v, t: window.setTimeout(() => { delete waitRef.current[seat]; saveUse(seat, v); }, 700) };
  };
  const flush = (seat: string) => {   // 칸을 떠나면 기다리지 않고 바로
    const w = waitRef.current[seat];
    if (!w) return;
    window.clearTimeout(w.t); delete waitRef.current[seat]; saveUse(seat, w.v);
  };
  const copyText = async (key: string, text: string) => {   // 이름 · 주소 = 화면 글 그대로(서버 안 감)
    try { await navigator.clipboard.writeText(text); setDone(key); window.setTimeout(() => setDone((d) => (d === key ? "" : d)), 1800); } catch { /* 클립보드 막힘 = 그대로 */ }
  };
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
      setFocusUse((f) => ({ seat, n: (f?.n || 0) + 1 }));
      setDone(seat); window.setTimeout(() => setDone((d) => (d === seat ? "" : d)), 1800);   // 옛 에디터 modern-copy 체크 머무름(touchHold 1800)
    } catch (e) { setNote((n) => ({ ...n, [seat]: vaultWhy(e, "복사 못 했어") })); }
  };
  return (
    <PageSection title="보안 서랍">
      {/* 설명글 뺌(형 11-15 「설정에 설명글잇는것좀 없애주라」) */}
      {q.isPending ? <p className="yset-wait">{reading("보안 서랍")}</p> : null}   {/* 받는 2~3초 동안 빈 줄만 보이던 자리(봄 11-18 실물) · isPending = 다시 받기를 기다리는 동안도 「읽는 중」 */}
      {(() => {   /* 맨 위 칸 → 구분선 → 아래 지금 내용(형 08:08 「그거 보안서랍 아래 내용이랑 구분선하고, 위에 봄의 정원 주소랑 key값으로 항상 열람가능하게 해줘」 「내가 이렇게 안묻게」) */
        const top = (q.data || []).find((s) => s.top);
        if (!top) return null;
        return (
          <>
            <GardenMcp top={top} spares={(q.data || []).filter((s) => !s.top)} done={done} saved={saved} memoOf={(s) => memo[s.seat] ?? s.memo ?? ""}
              copySeat={(seat) => void copy(seat)} copyText={(k, t) => void copyText(k, t)} onUse={onUse} flush={flush}
              remint={(seat) => mint.mutateAsync(seat)} minting={mint.isPending} focusUse={focusUse} nameOf={nameOf} flipOn={flipOn} />
            <GardenConns conns={conns.data || []} onBlock={block} />
            <div className="nm-mcp-cut" aria-hidden />
          </>
        );
      })()}
      {/* 아래 목록 = 손이 필요한 칸만(비었거나 열쇠 안 맞음) — 넣은 칸은 위 「봄의 정원 MCP」 칸과 겹쳐서 안 보임(형 11-20 02:55 dm-sia 「여기 겹치는 보안 서랍 내용은 지워줘」 · 값 · 메모는 그대로 · 화면만) */}
      {(q.data || []).some((s) => s.top && (!s.set || s.match === false)) ? <Card>   {/* 아래 카드 = 봄의 정원 칸(형이 붙여 넣는 칸)이 비었거나 안 맞을 때만 · 예비는 위 줄 한 곳(11-20 07:18) */}
        <ul className="nm-vault divide-y divide-border">
          {(q.data || []).filter((s) => s.top && (!s.set || s.match === false)).map((s) => (
            <li key={s.seat} className="flex flex-col gap-2 px-4 py-3">
              <p className="flex items-center justify-between gap-2 text-sm">   {/* 좁은 폭 = 이름 · 열쇠 앞부분이 줄고 오른쪽 상태는 한 줄(전 = 「넣음 · 12:38 AM」이 두 줄로 꺾이거나 열쇠 글자에 붙음 · 봄 11-18) */}
                <span className="flex min-w-0 flex-1 items-baseline gap-2"><b className="shrink-0">{nameOf(s.seat)}</b>
                  {s.set && s.hint ? <code className="min-w-0 shrink-[3] truncate font-mono text-xs text-muted-foreground" aria-label="열쇠 앞부분만 보임">{s.hint}</code> : null}</span>   {/* 형 11-15 「암호 있는 곳 노출 가능한 부분은 보이고 나머지늠 ***로 표기」 */}
                <span className={`shrink-0 whitespace-nowrap text-xs tabular-nums ${s.set && s.match === false ? "text-destructive" : "text-muted-foreground"}`}>{!s.set ? "비어 있음" : "열쇠 안 맞음"}</span>
              </p>
              <div className="flex items-center gap-2">
                <input id={`vault-${s.seat}`} type="password" autoComplete="off" spellCheck={false} placeholder={s.set ? "바꿀 때만 붙여 넣기" : "열쇠 붙여 넣기"} value={draft[s.seat] || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.seat]: e.target.value }))} className="nm-vault-in" />
                <GoButton disabled={!draft[s.seat]?.trim() || put.isPending} go={() => put.mutateAsync({ seat: s.seat, value: draft[s.seat].trim() })} className="nm-nb-btn nm-vault-b" busy="넣는 중">넣기</GoButton>
                <CopyBtn ok={done === s.seat} off={!s.set} label={nameOf(s.seat)} go={() => void copy(s.seat)} />
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
                <MorphAsk className="-my-2 self-start py-3 text-xs text-muted-foreground underline underline-offset-2 disabled:opacity-40" disabled={mint.isPending} yesText="만들기" label={`${s.seat} 새 열쇠 만들기`} onYes={() => mint.mutate(s.seat)}>새 열쇠 만들기</MorphAsk>
              ) : null}
              {note[s.seat] ? <p role="status" className="text-xs text-muted-foreground">{note[s.seat]}</p> : null}
            </li>
          ))}
        </ul>
      </Card> : null}
      {q.isError ? <SrvNote what="보안 서랍" detail={q.error instanceof Error ? q.error.message : undefined} className="tight" /> : null}
    </PageSection>
  );
}
