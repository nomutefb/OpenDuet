// 서랍 「뉴스 전체」(형 11-01 「그치 이거지. 이 느낌으로 살리면돼.」 · 「이런식으로 다 가져와주라」) — 에디터 피드 탭(/?tab=feed = 「뉴스 요약」 · viewer/index.html load() 4796 · render() 4905)을 앱 네이티브로
//   전엔 에디터 화면을 통째로 품었음(shell FRAME.feed) → 읽기는 앱 안: 검색(제목·원제·매체) · 칩(전체·이슈·분류 6 · 원본 renderChips) · 맨 위 진행 카드(원본 renderQPrev 두 장) · 카드(분류·보도/스크랩 시각·긴급/이슈·제목·요약·매체·편향·민감·진행 세 칸 + 썸네일)
//   데이터 = /articles.json(뉴스 요약과 같은 캐시 ./news-data.ts) + /api/feedlive(빌드 전 새 요약 · 원본은 4초 상한 병합 → 여기선 따로 받아 오면 덧붙임) · /api/pending + /toast-seen.json(qf = 확인한 실패) · 60초(진행 중이면 20초)
//   누르면 = 앱 안 기사 한 장(#/news?a=<file>) · 빌드 전 새 요약(_live)은 정적 상세가 아직 없어 에디터 그 기사 창 · 매체 = 원문(앱 안 한 겹)
//   쓰기 = 앱 안(team-4 4′ · 형 11-10 12:40 「에디터도 정원에 완벽하게 녹여」 · 전엔 맨 아래 「에디터에서」 한 겹이 유일한 길):
//     · 진행 판 실패 카드 「재시도」 · 「없애기」 = 그 건만(옛 qp-redo · qp-dismiss · ./q-acts.ts) · 판 「대기열 열기」 = 앱 대기열(./queue.tsx · 취소 · 재시도)
//     · 줄 진행 칸 「프롬프트」 실패 = 그 자리에서 프롬프트 다시(옛 retryPromptSeg · make-cards text · 돈 0 · 카드(그림) 실패는 기사 한 장 「다시 만들기」 = 돈 → 두 번)
//     · 카드 만들기 · 고치기 = 기사 한 장(./feed-acts.tsx) · 「에디터에서」 = 비상구로 남김(스위치 때 형 문)
//     · 긴급 배지 길게(0.48초 · 우클릭) = 「긴급 아님」 신고(옛 brkClaimBadge · api/rate reason brkno → scraper/brk_misfire.py 가 제목으로 묶음 · 수집함 ./scrap.tsx 와 같은 글) · 짧게 = 기사 열기 그대로
//   10개씩(원본 FEED_CAP · 바닥 닿으면 +10) · 원본과 다른 점: 검색·칩 중에도 10개씩(스크롤하면 다 나옴) · 분류 = category 칸만(원본 articleCat 제목 규칙 폴백 없음 · 짐작)
import "./yeta-settings.css";
import "./chan.css";
import { qEff } from "./task-state";
import { brkNo, qfSeenOne, qRetry } from "./q-acts";
import { type QCardT, TaskPanel } from "./task-panel";
import "./news.css";
import "./feed.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { type MouseEvent as RME, type PointerEvent as RPE, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { type Art, biasOf, catOf, getJson, inAppClick, newsListQuery, outletName, progOf, sensOf, thumbOf, useGo } from "./news-data";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

export type FArt = Art & { grade?: number | null; lvt?: number; _live?: number; _hidden?: number };
type QItem = { id?: string; t?: number; title?: string; via?: string; key?: string; alt1?: string; status?: string; tries?: number; why?: string | { cause?: string; text?: string } };
type Eta = Partial<Record<"url" | "ask", { p50?: number; p90?: number }>>;

const CAP = 10;
export const CATS = ["정치", "사회", "경제", "문화", "국제", "테크"];   // 원본 CHIP_CATS 차례
const ED_FEED = "/web?u=" + encodeURIComponent("/?tab=feed&inapp=1");
const ED_QUEUE = "/edq";   // 대기열 = 앱 안(./queue.tsx · 봄 11-01 · 전엔 에디터 대기열 한 겹)
const HR = 36e5;
/** 길게 누름(옛 claimLongPress 480 · ./scrap.tsx useHold 꼴) — 짧은 탭 = tap · 길게 = fn · 손가락 10px 넘게 움직이면 취소 */
function useHold(ms: number, fn: () => void, tap: () => void) {
  const t = useRef(0), xy = useRef([0, 0]), fired = useRef(false), f = useRef(fn), g = useRef(tap);
  f.current = fn; g.current = tap;
  useEffect(() => () => clearTimeout(t.current), []);
  const cancel = () => { clearTimeout(t.current); t.current = 0; };
  return {
    onPointerDown: (e: RPE) => { fired.current = false; if (e.button) return; e.stopPropagation(); xy.current = [e.clientX, e.clientY]; cancel(); t.current = window.setTimeout(() => { t.current = 0; fired.current = true; f.current(); }, ms); },
    onPointerUp: cancel, onPointerCancel: cancel, onPointerLeave: cancel,
    onPointerMove: (e: RPE) => { if (t.current && Math.abs(e.clientX - xy.current[0]) + Math.abs(e.clientY - xy.current[1]) > 10) cancel(); },
    onContextMenu: (e: RME) => { e.preventDefault(); e.stopPropagation(); const was = fired.current; cancel(); fired.current = true; if (!was) f.current(); },
    onClick: (e: RME) => { e.stopPropagation(); if (fired.current) { fired.current = false; return; } g.current(); },   // 길게 누른 뒤 손 뗀 탭 = 삼킴(옛 _lpFired)
  };
}
function BrkBadge({ a, onOpen, onNote }: { a: FArt; onOpen: (a: FArt) => void; onNote: (m: string) => void }) {
  const [st, setSt] = useState<"" | "busy" | "ok">("");
  const hold = useHold(480, () => {
    if (st) return;
    setSt("busy");
    void brkNo(a).then((why) => { if (why) { setSt(""); onNote(`긴급 아님 신고 못 보냄 — ${why}`); return; } setSt("ok"); window.setTimeout(() => setSt(""), 1200); });   // 「신고됨 ✓」 1.2초(옛 그대로)
  }, () => onOpen(a));
  return <b className="urg brk hold" title="길게 누르면 「긴급 아님」 신고" aria-label={st === "ok" ? "신고됨" : "긴급 — 길게 누르면 긴급 아님 신고"} {...hold}>{st === "ok" ? "신고됨 ✓" : "긴급"}</b>;
}
const RT_HOLD = 3 * 60e3;   // 프롬프트 다시 누른 뒤 서버 상태가 올 때까지 「진행 중」으로 버팀(옛 RETRY_HOLD_MS 3분 · 서버 갱신이 더 새면 진짜 상태가 이김)
export const byFile = (a: FArt, b: FArt) => (a.file < b.file ? 1 : a.file > b.file ? -1 : 0);

/* ── 시각(원본과 같은 셈 · KST 고정) ── */
const fileMs = (f?: string) => { const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(f || ""); return m ? Date.UTC(2000 + +m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5]) : NaN; };
const ymd = (s?: string) => /^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/.exec(String(s || ""));
/** 발행 나이(원본 articleAgeH) — date(+time) = KST · 못 읽으면 1e7 */
const pubAgeH = (a: FArt) => { const d = ymd(a.date); if (!d) return 1e7; const t0 = /^(\d{1,2}):(\d{2})/.exec(String(a.time || "").trim()); const t = Date.UTC(+d[1], +d[2] - 1, +d[3], (t0 ? +t0[1] : 0) - 9, t0 ? +t0[2] : 0); return Number.isNaN(t) ? 1e7 : Math.max(0, (Date.now() - t) / HR); };
/** 수집 나이(원본 feedAgeH) — 파일명 YYMMDD-HHMM · 없으면 발행 나이 */
const inAgeH = (a: FArt) => { const t = fileMs(a.file); return Number.isNaN(t) ? pubAgeH(a) : Math.max(0, (Date.now() - t) / HR); };
/** 표기 발행 나이(원본 articleAgeDispH) — time 빈칸이면 자정 대신 수집 시각 · 발행일과 이틀 넘게 벌어진 옛 글은 발행일 그대로 */
const dispAgeH = (a: FArt) => {
  if (/^\d{1,2}:\d{2}/.test(String(a.time || "").trim())) return pubAgeH(a);
  const t = fileMs(a.file); if (Number.isNaN(t)) return pubAgeH(a);
  const d = ymd(a.date); if (d && t - Date.UTC(+d[1], +d[2] - 1, +d[3], -9, 0) > 48 * HR) return pubAgeH(a);
  return Math.max(0, (Date.now() - t) / HR);
};
/** 상대 시각(원본 relAge 사다리) */
const rel = (h: number) => { if (!Number.isFinite(h) || h < 0 || h >= 9000) return ""; if (h * 60 < 30) return "방금"; if (h < 1) return "30분 전"; if (h < 24) return `${Math.floor(h)}시간 전`; const d = Math.floor(h / 24); return d < 7 ? `${d}일 전` : d < 30 ? `${Math.floor(d / 7)}주일 전` : `${Math.floor(d / 30)}개월 전`; };
const repDate = (s?: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? `${+m[2]}/${+m[3]} (${"일월화수목금토"[new Date(+m[1], +m[2] - 1, +m[3]).getDay()]})` : s || ""; };
const today6 = () => { const d = new Date(Date.now() + 9 * HR), p = (x: number) => String(x).padStart(2, "0"); return `${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`; };
const ago = (t?: number) => { if (!t) return ""; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : rel(m / 60); };

/* ── 긴급/이슈(원본 feedBrk · brkIssueKind) — 긴급 = 확정 breaking ∧ 경중(grade 0·1 컷 · 미채점 통과) ∧ 수집·발행 둘 다 4시간 안 · 이슈 = 4~24시간 ∧ (a.issue ∨ 지난 긴급) ── */
export const isBrk = (a: FArt) => !!a.breaking && (a.grade == null || a.grade >= 2 || (a.grade >= 1 && (a.lvt || 0) >= 3));
export const kindOf = (a: FArt) => { const brk = isBrk(a), p = pubAgeH(a), h = Math.max(inAgeH(a), p < 9e6 ? p : 0); return brk && h < 4 ? "brk" : h >= 4 && h < 24 && (a.issue || brk) ? "iss" : ""; };
/** 매체 = 대표 하나(원본 primaryMedia · outletShort 7자) */
const outlet = (m?: string) => { const s = outletName((m || "").split("·")[0].trim().replace(/\s*등\s*$/, "").trim());   // 공식 이름(news-data outletName · 형 11-06)
  return s.length > 7 ? s.slice(0, 6) + "…" : s; };

/** 빌드 전 새 요약(원본 fetchFeedLive) — 못 받으면 빈 목록 = 정적만(원본도 같은 동작) */
export const feedLiveQuery = queryOptions({
  queryKey: ["nomute", "feed-live"], staleTime: 60_000, refetchInterval: 60_000,
  queryFn: () => getJson<{ rows?: FArt[] }>(`/api/feedlive?_=${Date.now()}`).then((d) => (d.rows || []).filter((x) => x && x.file && !x._hidden).map((x) => ({ ...x, _live: 1 })), () => [] as FArt[]),
});
/** 대기열(원본 loadPending) + 확인한 실패(계정 qf · /toast-seen.json) — 이 기기 확인(localStorage)은 그릴 때 더함 */
export const pendQuery = queryOptions({
  queryKey: ["nomute", "feed-pending"], staleTime: 15_000,
  refetchInterval: (q) => ((q.state.data?.items || []).some((it) => it.status === "processing" || it.status === "retry") ? 20_000 : 60_000),
  queryFn: async () => {
    const [d, s] = await Promise.all([getJson<{ items?: QItem[]; eta?: Eta }>(`/api/pending?_=${Date.now()}`), getJson<{ qf?: string[] }>(`/toast-seen.json?_=${Date.now()}`).catch(() => ({ qf: [] as string[] }))]);
    return { items: (d.items || []).filter(Boolean), eta: d.eta || null, qf: s.qf || [] };
  },
});
const lsJson = <T,>(k: string, v: T): T => { try { return (JSON.parse(localStorage.getItem(k) || "null") as T) ?? v; } catch { return v; } };

/* ── 진행 카드(원본 renderQPrev · qPrevHtml) — 고르기: 시스템 경보·지운 것 빼고 · 실패는 확인 안 한 것만 · 완료가 피드에 올라왔으면 뺌 · 진행 중 먼저 · 같은 건 한 장 · 두 장 ── */

const Q_SKIP = new Set(["워크플로", "러너"]), Q_N = 8;   // 판 = 대기열 다(시아 06:44 ④ · 앞 진행 카드 두 장 → 판)   // 20분 반영 대기 = ./task-state.ts Q_LAG_MIN
const normU = (u?: string) => String(u || "").trim().replace(/\/+$/, "");
export function pickQ(items: QItem[], feed: Map<string, FArt>, qf: string[]): QCardT[] {
  const seen = new Set([...lsJson<string[]>("nomute_qfail_seen", []), ...qf].map(String)), cut = +(lsJson<number | string>("nomute_q_cleared", 0) || 0) || 0, keys = new Set<string>();
  const hit = (id?: string) => (id ? feed.get(id) || feed.get(id + ".md") : undefined);
  return items.map((it) => {
    const f = it.status === "succ" ? hit(it.id) : undefined;
    const e = qEff(it.status, !!f, it.t);   // 원본 qEff — 끝났는데 피드에 아직 없음 = 반영 중 · 20분 넘으면 반영 대기(lag) · ./task-state.ts
    return { it, e, title: (f && f.title) || it.title || (it.status === "succ" ? "분석 완료" : "(내용 없음)") };
  }).filter(({ it, e }) => !(it.t && it.t <= cut) && !Q_SKIP.has(it.via || "") && (e === "fail" ? !!it.id && !seen.has(String(it.id)) : e !== "succ"))
    .sort((a, b) => (a.e === "processing" || a.e === "retry" ? 0 : 1) - (b.e === "processing" || b.e === "retry" ? 0 : 1) || (b.it.t || 0) - (a.it.t || 0))
    .filter(({ it }) => { const k = it.via === "요약요청" ? "a:" + it.id : it.key ? "k:" + normU(it.key) : "i:" + (it.id || it.t); if (keys.has(k)) return false; keys.add(k); return true; })
    .slice(0, Q_N);
}
/* ── 요약 대기열 = 「Tasks」 판(형 11-09 05:17 「뉴스요약 진행상황은 이런식으로 표시」 · 05:18 「뉴스 요약 형태 이덧도 있음」 · 시아 05:20 합친 한 장 · 봄 22) · 깃)
   A = 판 하나(꺽쇠 · 「요약 대기열」 · 지난 분 · 시도 · 끝 a/b 건 · 다 끝나면 「완료」 · 접으면 한 줄) · B = 기사 한 건 카드(상태 고리 · 제목 · 끝 n/3 · 단계 셋 요약·프롬프트·카드)
   1단 = 서버 칸(status · tries · t)이 「요약」만 알려 줘서 요약만 진짜 · 프롬프트·카드 = 기다림(서버 step 칸 오면 2단) · 토큰 = 자료 0 → 뺌 · 고르기(pickQ)는 옛 진행 카드 그대로 */
function Row({ a, go, onOpen, rt, onRetry, onNote }: { a: FArt; go: (p: string) => void; onOpen: (a: FArt) => void; rt?: boolean; onRetry?: (a: FArt) => void; onNote?: (m: string) => void }) {
  const cat = catOf(a), kind = kindOf(a), th = thumbOf(a), bias = biasOf(a), sens = sensOf(a).slice(0, 2), pr = rt ? { done: 1, busy: true, fail: false } : progOf(a);   // rt = 방금 다시 누름(옛 isCardRetrying = 프롬프트 칸 진행 중)   // 민감 = 두 개(원본 sensChips)
  const dh = dispAgeH(a), rep = rel(dh), ih = inAgeH(a), scrap = ih * 60 < 30 ? "NEW" : rel(ih) && rel(ih) !== rep ? rel(ih) : "";   // 보도 = 표기 나이 · 스크랩 = 수집 나이(30분 안 NEW · 같은 값이면 한 번만)
  const title = a.title || "(제목 없음)", src = /^https?:\/\//i.test(a.url || "") ? a.url! : "", med = outlet(a.media);
  return (
    <li className={`nm-feed-it${kind ? " k-" + kind : ""}`}>
      <button type="button" className="nm-feed-hit" aria-label={`${title} 열기`} onClick={() => onOpen(a)} />
      <div className="nm-feed-body">
        <span className="nm-news-txt">
          <span className="nm-news-top">
            {cat ? <b className={`cat ${cat[1]}`}>{cat[0]}</b> : null}
            {/* 보도·스크랩 몇 시간 전 뺌(형 11-01 17:5x 「스크랩 00 분 전의 스크랩도 없고 웅! 보도 00시간 전 이것도 없어도 됑.」) */}
            {kind === "brk" && onNote ? <BrkBadge a={a} onOpen={onOpen} onNote={onNote} /> : kind ? <b className={`urg ${kind}`}>{kind === "brk" ? "긴급" : "이슈"}</b> : null}
            {a._live ? <b className="urg iss">방금 요약</b> : null}
          </span>
          <span className="nm-news-t">{title}</span>
          {a.summary ? <span className="nm-news-s">{a.summary}</span> : null}
          <span className="nm-feed-kv">
            <span><i>매체</i>{med ? (src ? <a className="nm-feed-src" href={src} target="_blank" rel="noopener" onClick={inAppClick(go)}>{med}</a> : <b>{med}</b>) : <b>—</b>}</span>
            <span><i>편향</i>{bias ? <b className={`bias ${bias.cls}`}>{bias.text}</b> : <b>—</b>}</span>
            {sens.length ? <span className="sens"><i>민감</i>{sens.map((s) => <em key={s.t} className={s.warn ? "warn" : undefined}>{s.t}</em>)}</span> : null}
          </span>
          <span className="nm-feed-prog" aria-label={`진행 ${pr.done}/3`}>
            {["요약", "프롬프트", "카드"].map((lb, i) => i === 1 && i === pr.done && pr.fail && onRetry   // 프롬프트 칸 실패 = 그 자리 다시(옛 data-retry="text" · i===done 필수 = 카드 칸 실패 기사에서 끝난 프롬프트 칸이 단추로 안 뜨게)
              ? <button key={lb} type="button" className="fail rt" onClick={(e) => { e.stopPropagation(); onRetry(a); }} aria-label={`프롬프트 다시 생성 — ${title}`} title="눌러서 프롬프트 다시 생성">{lb}</button>
              : <i key={lb} className={i < pr.done ? "done" : i === pr.done && pr.busy ? "cur" : i === pr.done && pr.fail ? "fail" : undefined}>{lb}</i>)}
          </span>
        </span>
        {th ? <img className="nm-news-th" src={th} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.hidden = true; }} /> : null}
      </div>
    </li>
  );
}

/** 기사 한 장(#/news)에 갔다 돌아오면 보던 그대로(검색·칩·개수·스크롤) — 열 때 남기고 다음 그림에서 한 번 씀 */
let keep: { q: string; cats: string[]; issue: boolean; n: number; top: number } | null = null;

export function FeedModal({ search = false }: { search?: boolean }) {   // search = 서랍 「검색」으로 열림 → 검색 칸에 바로 커서(에디터 검색 창 /?pop=search 대신 · 봄 11-01)
  const go = useGo();
  const [init] = useState(() => keep || { q: "", cats: [], issue: false, n: CAP, top: 0 });
  useEffect(() => { keep = null; }, []);
  const list = useQuery(newsListQuery), live = useQuery(feedLiveQuery), pend = useQuery(pendQuery);
  const [q, setQ] = useState(init.q), [cats, setCats] = useState<Set<string>>(() => new Set(init.cats)), [issue, setIssue] = useState(init.issue), [n, setN] = useState(init.n);
  const dq = useDeferredValue(q.trim().toLowerCase());
  const all = useMemo(() => {   // 정적 + 빌드 전 새 요약(정적에 없는 것만 · 최신 파일명 순)
    const st = (list.data?.arts || []) as FArt[], have = new Set(st.map((a) => a.file)), add = (live.data || []).filter((x) => !have.has(x.file));
    return add.length ? [...add, ...st].sort(byFile) : st;
  }, [list.data, live.data]);
  const byId = useMemo(() => new Map(all.map((a) => [a.file, a])), [all]);
  const filtered = !!(dq || cats.size || issue);
  const rows = useMemo(() => all.filter((a) =>
    (!dq || `${a.title || ""} ${a.title_orig || ""} ${a.media || ""}`.toLowerCase().includes(dq)) &&   // 원본 = 번역 제목·원제·매체
    (!cats.size || cats.has(catOf(a)?.[0] || "")) &&
    (!issue || isBrk(a) || !!a.issue)), [all, dq, cats, issue]);   // 이슈 칩 = 긴급 ∨ 이슈(원본 FILTERS.issue)
  const shown = rows.slice(0, n);
  const [seenN, setSeenN] = useState(0);   // 「없애기」 · 「재시도」 뒤 다시 고름(확인한 실패 = 이 기기 기록이라 쿼리 밖)
  const qs = useMemo(() => (pend.data ? pickQ(pend.data.items, byId, pend.data.qf) : []), [pend.data, byId, seenN]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [rt, setRt] = useState<Record<string, number>>({}), [note, setNote] = useState("");
  const rtOn = (a: FArt) => { const t = rt[a.file]; if (!t || Date.now() - t > RT_HOLD) return false; const up = a.cards?.updated ? Date.parse(a.cards.updated) : 0; return !(up && up > t); };
  const retryPrompt = async (a: FArt) => {   // 옛 retryPromptSeg — make-cards text(프롬프트만 · 그림 0 = 돈 0 → 한 번) · 실패면 다시 빗금 + 까닭 한 줄
    if (rtOn(a)) return;
    setRt((m) => ({ ...m, [a.file]: Date.now() })); setNote("");
    try {
      const r = await fetch("/api/make-cards", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ article: a.file, mode: "text" }) });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) throw new Error(d.error || `서버 ${r.status}`);
      window.setTimeout(() => { void list.refetch(); void live.refetch(); }, 4000);   // 옛 setTimeout(load, 4000) = 60초 폴 기다림 줄임
    } catch (e) {
      setRt((m) => { const x = { ...m }; delete x[a.file]; return x; });
      setNote(`프롬프트 다시 못 보냄 — ${(e as Error).message || "연결 끊김"}`);
    }
  };
  const qRedo = (it: Parameters<typeof qRetry>[0]) => qRetry(it, go).then((why) => { if (!why) { setSeenN((n) => n + 1); void pend.refetch(); } return why; });
  const qDrop = (it: { id?: string }) => { qfSeenOne(it.id); setSeenN((n) => n + 1); };
  const busy = (pend.data?.items || []).filter((it) => it.status === "processing" || it.status === "retry").length;   // 원본 qbadge = 처리 중 + 재시도 대기
  const t6 = today6(), todayN = useMemo(() => all.filter((a) => a.file.slice(0, 6) === t6).length, [all, t6]);

  const root = useRef<HTMLDivElement>(null), sent = useRef<HTMLDivElement>(null), restored = useRef(false);
  const scroller = () => root.current?.closest(".nm-scroll") as HTMLElement | null | undefined;
  useLayoutEffect(() => { if (restored.current || !list.data) return; restored.current = true; const sc = scroller(); if (sc && init.top) sc.scrollTop = init.top; }, [list.data]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 바닥 닿기 300px 전 = +10(원본 _feedIO) · 아직 보이면 다시 붙일 때 또 옴
    const el = sent.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) setN((v) => v + CAP); }, { root: scroller() || null, rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown.length, rows.length]);
  const reset = () => { setN(CAP); const sc = scroller(); if (sc && sc.scrollTop > 0) sc.scrollTop = 0; };
  const tog = (c: string) => { setCats((s) => { const x = new Set(s); if (x.has(c)) x.delete(c); else x.add(c); return x; }); reset(); };
  const open = (a: FArt) => {
    keep = { q, cats: [...cats], issue, n, top: scroller()?.scrollTop || 0 };
    go(`/newsed?a=${encodeURIComponent(a.file)}`);   // 4번 뉴스 에디터 그 기사(k-4 U2) · 빌드 전 새 요약(_live)도 앱 안(본문 동봉 · 형 11-10 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」 · 전엔 옛 에디터 창)
  };
  return (
    <Pane title={search ? "검색" : "뉴스 요약"}>
      <div ref={root} />
      <div className="yeta-set mt-2">
        <div className="nm-chan nm-news nm-feed nm-feed-bare">   {/* 박스 한 겹 뺌 · 머리(오늘/대기열)·검색 뺌 = 제목 바로 밑부터 기사(형 11-01 18:0x 「바로 제목에서 검색도 사실 필요없어. 그냥 바로 요약한 애들 쭉쭉쭉 나오자.」) · 진행 중 카드는 그대로(누르면 대기열) */}
          {search ? (   /* 검색 칸 = 서랍 「검색」으로 열 때만(뉴스 요약 화면은 형 18:0x 대로 칸 없음 · 서랍 「검색」이 칸 없는 목록만 열던 것 · 봄 11-01) */
            <label className="nm-feed-find">
              <DuetIcon name="search" size={16} />
              <input type="search" autoFocus value={q} onChange={(e) => { setQ(e.target.value); reset(); }} placeholder="제목·매체 검색" aria-label="뉴스 검색" enterKeyHint="search" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
              {q ? <button type="button" aria-label="검색어 지우기" onClick={() => { setQ(""); reset(); }}><DuetIcon name="x" size={14} /></button> : null}
            </label>
          ) : null}
          {/* 분류 칩 뺌(형 11-01 17:5x 「필터는 없어도될것같아!」) */}
          {note ? <p className="nm-chan-msg" role="alert">{note}</p> : null}
          {pend.isError ? <p className="nm-chan-msg" role="status">대기열을 못 읽었어</p> : qs.length ? <TaskPanel qs={qs} eta={pend.data?.eta || null} onOpen={() => go(ED_QUEUE)} onRetry={qRedo} onDismiss={qDrop} /> : null}
          {list.isPending ? <p className="nm-chan-msg">기사 읽는 중…</p> : list.isError ? <p className="nm-chan-msg" role="alert">{(list.error as Error).message || "뉴스 요약을 못 읽었어"}</p> : !rows.length ? <p className="nm-chan-msg">{filtered ? "결과 없음" : "기사가 없어"}</p> : (
            <ul className="nm-feed-list">{shown.map((a) => <Row key={a.file} a={a} go={go} onOpen={open} rt={rtOn(a)} onRetry={(x) => void retryPrompt(x)} onNote={setNote} />)}</ul>
          )}
          {rows.length > shown.length ? <><div ref={sent} aria-hidden className="nm-feed-sent" /><button type="button" className="yset-chip nm-news-more" onClick={() => setN((v) => v + CAP)}>더 보기 +{Math.min(CAP, rows.length - shown.length)} · 남은 {rows.length - shown.length}건</button></> : null}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={() => go(ED_FEED)}>에디터에서 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button></div>
        </div>
      </div>
    </Pane>
  );
}
