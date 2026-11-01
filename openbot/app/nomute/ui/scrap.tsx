// 서랍 「LEGACY」(형 11-01 「이런식으로 다 가져와주라」) — 에디터 수집함(/?tab=scrap · viewer-src/35-applyAutoGroups.part renderScrap·makeScItem · 36 enterScrap·askReason·askGrade·toggleAck · 34 pickState·srvTriage·scDedup·mergeDecorate·saveMerges · 33 loadCandidates·scrapAutoRefresh)을 앱 네이티브로
//   전엔 에디터 화면을 통째로 품었음(shell FRAME.legacy) → 목록·판단 다 앱 안 · 차례 = 원본 그대로: 실패 트레이(전폭) → 누적 | 신규 두 칸(폰도 두 칸 = 원본 .scrap-cols)
//   데이터 = 원본 길 그대로: /api/candidates → /candidates.json(정적은 든 것보다 새로울 때만) · /articles.json(픽 완료 판정 = 피드) · /api/pending · /picks-failed.json · /triage-state.json(전 기기 판단 원장)
//     · /toast-seen.json(계정 seen) · /merges.json(계정 묶음) · /api/trends → /sns_trends.json(대세 GX) · /fp_dict.json(지문) · 1분(원본 livePoll) · 픽 도는 중 25초(원본 pollPicking)
//   규칙 = 원본 값 그대로(신규 4h·scFast · 누적 cross 8·연속보도 보조진입 · fastScore·scScore 곡선 · 검증대기 접기 · 같은 제목 접기 · 손 묶음·AI 묶음 · 긴급/이슈 배지·점등 · 대세 GX · 실패 트레이)
//   판단 = 원본과 같은 길·같은 몸·같은 확인 — PASS/PICK = 이유 고르기(직접입력 포함) → api/rate(+PICK = api/pick) · 확인(−→✓) = api/rate acked · G 칩 = 경중 교정(api/rate action grade)
//     · 긴급 길게 = 긴급 아님 신고(api/rate brkno) · 카드 길게 = 묶기(api/mapsync merges) · 주황 숫자 = 묶음 풀기(GoButton) · Failed 탭 = 재시도(api/pick) · 길게 = 실패 사유 받기·내용 입력(api/pick body) · ✓ = 픽 취소(api/seen f)
//   이 기기 기록 = 에디터와 같은 열쇠(같은 사이트라 같이 감): nm_ratings · nomute_grade_fix · nm_merges(_ts·_pend) · nm_fail_retries · nm_fail_requeue · nomute_pickfail_seen·_resolved·_resub · nomute_q_cancelled(읽기만)
//   원본과 다른 점: 검색칸 없음(서랍 「검색」 = 뉴스 요약) · 폰 뒤로가기 = 묶기 취소 대신 창 닫힘 · PICKED·요약된 카드 = 앱 안 기사 한 장(#/news) · 원문 = 앱 안 한 겹
//     · AI 묶음(group_id) 숫자 풀기 = 원본은 아무것도 안 풀고 「해제했어」 → 여기선 풀 손 묶음이 없다고 말함 · 길게 누른 뒤 손 뗀 탭은 시간과 상관없이 삼킴(원본 350ms)
import "./yeta-settings.css";
import "./chan.css";
import "./scrap.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { type CSSProperties, type ReactNode, type PointerEvent as RPE, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GoButton } from "./go-button";
import { inAppHref } from "./inapp";
import { newsListQuery, useGo } from "./news-data";
import { Pane } from "./pane";
import { CAT_COLOR, articleCat, catBucket } from "./scrap-cat";
import { YICO } from "./yeta-icons";

type C = Record<string, any>;   // eslint-disable-line @typescript-eslint/no-explicit-any
const ED_SCRAP = "/web?u=" + encodeURIComponent("/?tab=scrap&inapp=1");
const HR = 36e5;
const AUTH_TXT = "로그인이 만료됐어 — 다시 로그인해줘";   // 원본 AUTH_EXPIRED_TXT

/* ── 이 기기 기록(원본 열쇠 그대로) — 그린 뒤 다음 쓰기 전까지는 한 번만 읽음(원본은 칸마다 통째 파싱 · 값은 같음 · 쓰면 바로 버림) ── */
let PASS: { ra?: Record<string, C>; gf?: Record<string, C>; mg?: Record<string, C> } | null = null;
const lsGet = <T,>(k: string, v: T): T => { try { const x = JSON.parse(localStorage.getItem(k) || "null"); return (x ?? v) as T; } catch { return v; } };
const lsSet = (k: string, v: unknown) => { PASS = null; try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); return true; } catch { return false; } };
const _normU = (u: unknown) => String(u || "").trim().replace(/\/+$/, "");   // build-viewer normUrl 과 같음(끝 슬래시만)
const candId = (c: C): string => c.id || c.url || c.title;
const RKEY = "nm_ratings";
const ratingsAll = (): Record<string, C> => { if (PASS) return (PASS.ra ??= lsGet(RKEY, {})); return lsGet(RKEY, {}); };
const FOLLOW_OF = new Map<string, { id: string; url: string }>();   // AI 묶음 follow = 판단을 따라간 형제 카드에도 같이(원본 FOLLOW_OF)
const saveRating = (id: string, patch: C) => { const r = lsGet<Record<string, C>>(RKEY, {}); r[id] = { ...(r[id] || {}), ...patch }; const f = FOLLOW_OF.get(id); if (f) r[f.id] = { ...(r[f.id] || {}), ...patch }; lsSet(RKEY, r); };
const GFIX_KEY = "nomute_grade_fix";
const gfixAll = (): Record<string, C> => { if (PASS) return (PASS.gf ??= lsGet(GFIX_KEY, {})); return lsGet(GFIX_KEY, {}); };
const gfixOf = (c: C) => { const f = gfixAll()[candId(c)]; return f && f.g != null ? f : null; };
const gEff = (c: C) => { const f = gfixOf(c); return f ? f.g : c.grade; };   // 실효 등급 = 교정 우선

/* ── 받은 것(원본 전역 이름 그대로 · 그리기 직전에 한 번 채움) ── */
let CANDS: C[] = [], CAND_LIVE = false, CAND_TS = 0, CAND_MISS = 0, DATA: C[] = [], DATA_LOADED = false;
let PEND = new Map<string, string>(), PFAIL = new Map<string, { reason: string; ts: string }>(), SRV_TRI = new Map<string, C>();
let TF_SRV = { f: new Set<string>(), pr: new Set<string>() };
let TRENDS: C | null = null, FPD: C | null = null;
let scRT: Record<string, C> = {};

/* ── 받기 ── */
const T12 = () => (typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined);
async function getRaw(u: string): Promise<[unknown, Response] | null> {
  try {
    const r = await fetch(u, { credentials: "same-origin", signal: T12() });
    if (!r.ok) return null;
    const t = await r.text(); if (/^\s*</.test(t)) return null;   // HTML 200 = SPA 폴백(아직 배포 전)
    return [JSON.parse(t), r];
  } catch { return null; }
}
/** 만료 판별(원본 nmAuthCheck probe) — 같은 출처 HEAD · 손 안 댄 302 = Access 만료 · 3초 상한 */
const authNote = (): Promise<"auth" | "net" | "srv" | "ok"> => new Promise((res) => {
  const t = setTimeout(() => res("net"), 3000);
  fetch(`/nm-sync.js?_=${Date.now()}`, { method: "HEAD", redirect: "manual", cache: "no-store", credentials: "same-origin" })
    .then((r) => { clearTimeout(t); res(r.type === "opaqueredirect" || r.status === 401 || r.status === 403 ? "auth" : r.ok ? "ok" : "srv"); }, () => { clearTimeout(t); res("net"); });
});
const isNetErr = (e: unknown) => e instanceof TypeError && /^(failed to fetch|load failed|networkerror when attempting to fetch resource)/i.test(String(e.message || ""));
const netMsg = async (e: unknown) => (!isNetErr(e) ? "" : (await authNote()) === "auth" ? AUTH_TXT : "네트워크 오류 — 다시 시도");   // 원본 netMsg

type CandD = { cands: C[]; live: boolean; ts: number; miss: number; err: "" | "auth" | "net" | "srv" };
let candPrev: CandD | null = null;   // 마지막으로 든 목록(원본 last-good — 못 받아도 비우지 않음)
const candNewest = (a: C[]) => { let m = 0; for (const c of a) { const t = Date.parse(c?.last_seen || "") || 0; if (t > m) m = t; } return m; };
/** 원본 loadCandidates — 라이브(api = GitHub main 직독 · r2 사본이면 나이만큼 뒤로) → 정적(빌드 때 사본 · 든 것보다 새로울 때만) */
const candQuery = queryOptions({
  queryKey: ["nomute", "scrap-cands"], staleTime: 30_000, retry: false,
  refetchInterval: (q) => (q.state.data?.miss === 1 ? 10_000 : 60_000),   // 첫 실패 = 10초 뒤 한 번 더(원본 CAND_RETRY_MS)
  queryFn: async (): Promise<CandD> => {
    const prev = candPrev; let netFail = false, miss = prev ? prev.miss : 0;
    for (const u of ["/api/candidates", `/candidates.json?_=${Date.now()}`]) {
      const api = u === "/api/candidates";
      try {
        const r = await fetch(u, { credentials: "same-origin", signal: T12() });
        if (r.ok) {
          const t = await r.text(), d = /^\s*</.test(t) ? null : JSON.parse(t);
          if (Array.isArray(d) && d.length) {
            let ts = Date.now();
            if (api) { miss = 0; const src = r.headers.get("x-nm-src") || "?", age = src === "r2" ? +(r.headers.get("x-nm-age-min") ?? -1) : -1; if (age > 0) ts -= age * 60000; }
            else if (prev && prev.cands.length && candNewest(d) <= candNewest(prev.cands)) return (candPrev = { ...prev, miss, err: "" });
            return (candPrev = { cands: d, live: api, ts, miss, err: "" });
          }
        }
      } catch (e) { if (isNetErr(e)) netFail = true; }
      if (api) miss++;
    }
    if (prev && prev.cands.length) return (candPrev = { ...prev, miss });
    const k = await authNote();
    return (candPrev = { cands: [], live: false, ts: 0, miss, err: k === "auth" ? "auth" : netFail || k === "net" ? "net" : "srv" });
  },
});

type Side = { pend: Map<string, string>; pfail: Map<string, { reason: string; ts: string }>; tri: Map<string, C>; tf: { f: Set<string>; pr: Set<string> }; mt: number };
let sidePrev: Side | null = null, PICKING_N = 0, mergeTick = 0;
/** 대기열(원본 loadPending · 취소분 빼고) · 픽 실패(loadPickFails) · 전 기기 판단(loadTriage) · 계정 seen(loadToastSeen) · 계정 묶음(loadMergesSrv) — 못 받은 칸은 앞 값 그대로(원본도 실패면 안 바꿈) */
const sideQuery = queryOptions({
  queryKey: ["nomute", "scrap-side"], staleTime: 20_000, retry: false,
  refetchInterval: () => (PICKING_N ? 25_000 : 60_000),
  queryFn: async (): Promise<Side> => {
    const t = Date.now(), P = sidePrev;
    const [pr, fr, tr, sr] = await Promise.all([getRaw(`/api/pending?_=${t}`), getRaw(`/picks-failed.json?_=${t}`), getRaw(`/triage-state.json?_=${t}`), getRaw(`/toast-seen.json?_=${t}`), loadMergesSrv()]);
    let pend = P?.pend || new Map<string, string>();
    const pi = (pr?.[0] as C | undefined)?.items;
    if (Array.isArray(pi)) {
      const cx = new Set(lsGet<string[]>("nomute_q_cancelled", []).map(String)), cxId = (it: C) => String((it && (it.id || it.key)) || (it && it.t) || "");
      pend = new Map(); pi.forEach((it: C) => { if (it && it.key && !it._opt && !cx.has(cxId(it))) pend.set(_normU(it.key), it.status); });
    }
    const pfail = Array.isArray(fr?.[0]) ? new Map((fr![0] as C[]).map((x) => [_normU(x.url), { reason: x.reason || "", ts: x.ts || "" }])) : P?.pfail || new Map();
    const tri = Array.isArray(tr?.[0]) ? new Map((tr![0] as C[]).map((x) => [_normU(x.url), x])) : P?.tri || new Map();
    const sj = sr?.[0] as C | undefined;
    const tf = sj && typeof sj === "object" ? { f: new Set<string>(sj.f || []), pr: new Set<string>(sj.pr || []) } : P?.tf || { f: new Set<string>(), pr: new Set<string>() };
    return (sidePrev = { pend, pfail, tri, tf, mt: mergeTick });
  },
});
/** 실검 키워드(대세 GX · 원본 loadTrends 5분 TTL) — 글자만 추림 */
const buzzQuery = queryOptions({
  queryKey: ["nomute", "scrap-buzz"], staleTime: 300_000, refetchInterval: 300_000, retry: false,
  queryFn: async () => {
    for (const u of ["/api/trends", `/sns_trends.json?t=${Date.now()}`]) { const x = await getRaw(u); const j = x?.[0] as C | undefined; if (j && j.updated) return { gtrends: j.gtrends || [], gtrends_pool: j.gtrends_pool || [], xspike: j.xspike || null } as C; }
    return null;
  },
});
const fpQuery = queryOptions({ queryKey: ["nomute", "scrap-fp"], staleTime: Infinity, retry: false, queryFn: async () => ((await getRaw("/fp_dict.json"))?.[0] as C) ?? null });

/* ── 쓰기(원본 길·몸 그대로 · 원본은 상대 주소 'api/…' = 에디터 첫 화면 기준 /api/…) ── */
const postJ = (u: string, body: unknown, keepalive = false) => fetch(u, { method: "POST", credentials: "same-origin", keepalive, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
type Note = { msg: string; fail?: boolean; retry?: (() => void) | null; login?: boolean };
let NOTE: (n: Note) => void = () => {};
let _rateFailT = 0;
const failWhy = async (r: Response) => { let raw = ""; try { raw = await r.text(); } catch { /* 빈 몸 */ } let why = ""; try { why = String((JSON.parse(raw) || {}).error || ""); } catch { why = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200); } return (why ? why + " " : "") + "(HTTP " + r.status + ")"; };
const pickHttpMsg = (status: number, why: string) => { const rest = String(why || "").replace(/\s*\(HTTP \d+\)$/, "").trim(); return "서버 거절(HTTP " + status + ")" + (rest ? " — " + rest : ""); };
function rateFail(m: string) { const now = Date.now(); if (now - _rateFailT < 3000) return; _rateFailT = now; NOTE({ msg: "판단 기록 실패 — " + m }); }
function rateSend(body: C) {
  postJ("/api/rate", body).then(async (r) => { if (!r.ok) rateFail(pickHttpMsg(r.status, await failWhy(r))); }, async (e) => rateFail((await netMsg(e)) || ("앱 오류 — " + ((e && e.message) || e))));
}
/** 판단 원장(rate.yml · ratings.jsonl) — AI 묶음 follow 형제에도 같은 몸 한 번 더(원본 postRate) */
function postRate(p: C) { rateSend(p); const f = FOLLOW_OF.get(p.id); if (f) rateSend({ ...p, id: f.id, url: f.url }); }
const pickFailNote = (message: string, retry: (() => void) | null) => NOTE({ msg: "PICK 실패 · " + message, fail: true, retry, login: message === AUTH_TXT });
/** 계정 seen(원본 postSeen · postSeenIds — 낙관 add · 실패 무시 · 서버 50건/축) */
function postSeen(axis: "f" | "pr", ids: string[]) { const fresh = ids.filter((id) => id && !TF_SRV[axis].has(id)); if (!fresh.length) return; fresh.forEach((id) => TF_SRV[axis].add(id)); postJ("/api/seen", { [axis]: fresh.slice(0, 50) }).catch(() => {}); }

/* ── 시각 두 축(원본 261011) — scTs = 묶음 나이(칼럼·신규 순위·핀) · scHt = 제목 기사 나이(화면 시각·누적 감쇠·배지) · 미래 발행 = 수집 시각 ── */
const FOLLOW_CROSS_MIN = 4, FOLLOW_RC_MIN = 6;   // 연속보도 보조진입(4매체+ ∧ 6회+ · grade 조건 없음 · 260720)
const scTs = (c: C) => {
  const p = Date.parse(c.published || ""), f = Date.parse(c.first_seen || "");
  if (!isNaN(p) && p <= Date.now() + 60000 && (isNaN(f) || p <= f + 60000 || (c.report_count || 0) >= FOLLOW_RC_MIN)) return p;   // 발행 정상 ∧ (수집보다 앞 ∨ 연속보도 묶음)
  if (!isNaN(f)) return f;
  return isNaN(p) ? 0 : p;
};
const scHpOk = (c: C) => !!c.hp && Date.parse(c.hp) <= Date.now() + 60000;
const scHt = (c: C) => (scHpOk(c) ? Date.parse(c.hp) : scTs(c));
const scPubIso = (c: C): string => (c._disp ? scPubIso(c._disp) : scHpOk(c) ? c.hp : c.published);
const scFsT = (c: C) => (scHpOk(c) ? NaN : Date.parse(c.first_seen || ""));
const scRelTime = (iso?: string) => {
  if (!iso) return ""; const t = new Date(iso); if (isNaN(+t)) return "";
  const s = Math.max(0, (Date.now() - t.getTime()) / 1000);
  if (s < 60) return "방금 전"; if (s < 3600) return Math.floor(s / 60) + "분 전"; if (s < 86400) return Math.floor(s / 3600) + "시간 전";
  const d = Math.floor(s / 86400); return d === 1 ? "1일 " + Math.floor((s % 86400) / 3600) + "시간 전" : d + "일 전";
};

/* ── 진입·순위(원본 값 · 까닭은 원본 주석) ── */
const BADGE_MAX_AGE_H = 24;   // 배지(이슈)·OUT 완화 공용 소멸선
const CROSS_MIN = 8;   // 누적 진입선 = 8매체(260617 5→8 엄선)
const POOL_W = 0.5;   // 연예 전문지 부착 풀 = 진입에만 반영(랭킹 가중 0 · 260929)
const effCross = (c: C) => (c.cross || 0) + POOL_W * (c.px || 0);
const rankCross = (c: C) => c._rankCross ?? (c.cross || 0);
const FRESH_UNFOLD_H = 1.5;   // 갓 뜬 기사(1.5h 안)는 검증대기 접기 면제(260710)
const FAST_MAX_H = 4, FAST_HALF_H = 2;   // 신규↔누적 경계 4h · 신규 하강 반감기 2h(260617)
const isBreaking = (c: C) => !!c.breaking && (c.grade == null || c.grade >= 2 || (c.grade >= 1 && ((c.lv && c.lv.t) || 0) >= 3));   // + 확산 강(lv.t≥3) = 경중 1도 긴급
const FB_HOLBO = /(업무협약|MOU|리브랜딩|품목허가|인증\s*획득|론칭|파트너십|특허\s*취득)/;
const FB_CHEONG = /(줍줍|무순위\s*청약|청약\s*경쟁률)/, FB_ANCHOR = /(아파트|분양|단지|푸르지오|자이|래미안|힐스테이트|국평|특별공급|1순위)/, FB_NOTFIN = /(코스피|코스닥|증시|개미|外人|외국인|순매수|순매도|투매|보험|약관|금감원|금융위|공정위|국토부|건보공단)/;
const FB_CELEB = /(레깅스|화보|열애|결별|이혼|장모상|하객|근황|몸매|애엄마|훈훈|핫몸|일상룩|순간포착|♥)/;
/** 홍보·청약·가십 잡음(채점 전 사각 보완 · 대형뉴스 veto = cross 8 ∨ rc 6 ∨ grade 1~3 · 260701 평의회) */
const fbJunk = (c: C) => {
  if ((c.cross || 0) >= CROSS_MIN || (c.report_count || 0) >= FOLLOW_RC_MIN || (c.grade != null && c.grade !== 0)) return false;
  const t = c.title || "";
  if ((c.cat === "경제" || c.cat === "테크") && FB_HOLBO.test(t) && !FB_NOTFIN.test(t)) return true;
  if (FB_CHEONG.test(t) && FB_ANCHOR.test(t) && !FB_NOTFIN.test(t)) return true;
  if (c.cat === "문화" && FB_CELEB.test(t)) return true;
  return false;
};
const soloTag = (c: C) => !!c.solo && !fbJunk(c) && (!!c.breaking_candidate || c.grade == null || c.grade >= 2);   // 속보 1보 단독(260923) · [단독]은 경중 0·1 이면 내림
const scFast = (c: C) => isBreaking(c) || ((c.cross || 0) >= 2 && !fbJunk(c)) || soloTag(c);   // 신규 진입 = 구조 신호만(grade 거부권 폐지 260720)
const FOLLOW_W = 0.5;   // 연속보도 가점(260628 0.2→0.5)
const scFollow = (c: C) => 1 + FOLLOW_W * Math.log2(1 + (c.report_count || 0));
const FP_W = 0.25, FP_STRONG = 2.0, FP_RC_RELAX = 3;   // 지문(SNS 발행 결) 소폭 가점 · 강지문이면 보조진입 rc 6→3(260720)
const FP_CROSS_RE = /논란|공분|역풍|고소|고발|소송|법원|재판|구속|입건|유출|폭로|사과|퇴출|하차|파문|청원|신상|악플|혐의|갑질|미투|표절|난입/;
const _fpCache = new Map<string, number>();
const fpScore = (c: C) => {
  if (!FPD) return 0;
  const id = candId(c); if (_fpCache.has(id)) return _fpCache.get(id)!;
  const t = c.title || "", ts = new Set<string>(t.match(/[가-힣A-Za-z0-9]{2,}/g) || []);
  let s = 0, p = 0;
  for (const x of ts) { s += (FPD.dict || {})[x] || 0; p += (FPD.persons && FPD.persons[x]) || 0; }
  s += Math.min(p / 10, 1); if (FP_CROSS_RE.test(t)) s += FPD.cross_bonus ?? 1;
  s = Math.min(s, 4); if (_fpCache.size > 4000) _fpCache.clear(); _fpCache.set(id, s); return s;
};
const fpW = (c: C) => 1 + FP_W * (fpScore(c) / 4);
const followEnters = (c: C) => effCross(c) >= FOLLOW_CROSS_MIN && ((c.report_count || 0) >= FOLLOW_RC_MIN || ((c.report_count || 0) >= FP_RC_RELAX && fpScore(c) >= FP_STRONG && !fbJunk(c)));
const GRADE_W: Record<number, number> = { 0: 0.5, 1: 0.7, 2: 1.0, 3: 1.7 };   // grade = 긴급 탐지 도구 · 3만 부상(260810 1.7)
const BUZZ_W = 1.2;   // S 레벨 = 대세(실검 매칭 · 260808) · 칩 GX
let _buzzKw: Set<string> | null = null, _buzzTs = 0, _buzzSrc: C | null = null;
const _buzzSet = () => {
  if (_buzzKw && _buzzSrc === TRENDS && Date.now() - _buzzTs < 300e3) return _buzzKw;
  const s = new Set<string>();
  try {
    if (TRENDS) {
      for (const t of TRENDS.gtrends || []) { const q = String(t.query || "").trim(); if (q.length >= 2) s.add(q); }
      for (const t of TRENDS.gtrends_pool || []) { const q = String(t.q || "").trim(); if (q.length >= 2) s.add(q); }
      const xs = TRENDS.xspike;   // X 급상승 = live ∧ 신선 ∧ feed 자격분만(261016)
      if (xs && xs.mode === "live" && xs.ok && Date.now() - Date.parse(xs.generated_at) <= (xs.max_age_min || 60) * 60e3)
        for (const t of Array.isArray(xs.items) ? xs.items : []) { const q = String((t && t.keyword) || "").replace(/[#_]/g, " ").replace(/\s+/g, " ").trim(); if (t && t.feed && q.length >= 2) s.add(q); }
    }
  } catch { /* 실검 못 읽음 = 보정 없음 */ }
  if (!TRENDS) return s;   // 미로드는 캐시 안 함(260810 — 빈 집합을 5분 굳히던 것)
  _buzzKw = s; _buzzTs = Date.now(); _buzzSrc = TRENDS; return s;
};
const JOSA = "이가은는을를의와과도만에서부터께랑님씨측";
/** 대세 매칭(260808) — 4자+·공백 구문 = 제목에 들어 있음 · 2~3자 = 토큰 정확일치 또는 조사 꼬리 2자 안 */
const snsBuzz = (c: C) => {
  const t = c.title || "", toks: string[] = t.match(/[가-힣A-Za-z0-9]+/g) || [];
  for (const k of _buzzSet()) {
    if (k.length >= 4 || k.includes(" ")) { if (t.includes(k)) return true; }
    else for (const w of toks) if (w === k || (w.length <= k.length + 2 && w.startsWith(k) && [...w.slice(k.length)].every((ch) => JOSA.includes(ch)))) return true;
  }
  return false;
};
const gradeBase = (c: C) => { const ge = gEff(c); return gfixOf(c) ? (ge == null ? 1 : GRADE_W[ge] ?? 1) : fbJunk(c) ? 0.5 : ge == null ? 1 : GRADE_W[ge] ?? 1; };
const isBuzzLv = (c: C) => gradeBase(c) < BUZZ_W && snsBuzz(c);   // 칩 GX = 승격이 실제로 일어난 카드만
const gradeW = (c: C) => (isBuzzLv(c) ? BUZZ_W : gradeBase(c));
const FRESH_CROSS_W = 0.4;   // 신규 칼럼에도 보도량(cross) 반영(260803 · cr13 대형이 9위로 묻히던 것)
const fastScore = (c: C) => ((c.burst || 0) + (c.breaking ? 5 : 0) + FRESH_CROSS_W * rankCross(c)) * Math.pow(0.5, Math.max(0, (Date.now() - scTs(c)) / HR) / FAST_HALF_H) * scFollow(c) * gradeW(c) * fpW(c);
/** 머리표 잡음([알림]·[부고]·[포토]·시황 등 = 뉴스 아님) — 사건어(폭락·특보·대피 …)가 있으면 면제 */
const JUNK_HEAD = /^(?!.*(?:서킷브레이커|사이드카|폭락|급락|폭등|급등|역대급|패닉|상한가|하한가|돌파|최고치|최저치|폭염특보|한파경보|호우경보|태풍특보|주의보|온열질환|침수|범람|산사태|대피|이재민))(?:\s*(?:[\[\(](알림|공고|부고|부음|동정|인사|프로필|단신|사진|[A-Z]{0,2}포토|표|그래픽|증시|특징주|마감시황|개장시황|시황|프로야구|프로농구|프로배구|게시판)(?:\s[^\]\)]*)?[\]\)]|[\[\(][^\]\)]*(운세|날씨|데이터랩|증시|마켓뷰)[^\]\)]*[\]\)]|오늘의\s*(?:부고|운세|날씨|증시|주요뉴스))|.*원.?달러\s*환율.*마감)/;
const CROSS_POW = 1.3;   // cross 볼록 가속(260628 1.6→1.3 · 연속보도와 균형)
const MERGE_DAMP_RATIO = 1.5, MERGE_DAMP_GAIN = 0.75;   // 손 묶음 cross 댐핑(기준 1.5배 넘는 몫만 75%)
const crossConvex = (c: C) => Math.pow(rankCross(c), CROSS_POW);
const ACC_T_HALF = 13, ACC_T_POW = 3.0;   // 시간 가속 감점(발행 기준 · ~12h 넘으면 가속 침몰)
const timeAcc = (c: C) => 1 / (1 + Math.pow(Math.max(0, (Date.now() - scHt(c)) / HR) / ACC_T_HALF, ACC_T_POW));
const OUT_Z0 = 2.5, OUT_Z1 = 3.5, OUT_AGE_CAP_H = 12, OUT_MAX_AGE_H = BADGE_MAX_AGE_H, OUT_POOL_N_MIN = 15, OUT_SD_MIN = 2;   // 아웃라이어 감쇠 하한(초대형 묶음은 12h 값에서 멈춤)
let _outMed = 0, _outSd = 0;
const _outMedian = (a: number[]) => { const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const outStatUpd = (pool: C[], min: number) => {
  const xs: number[] = []; for (const c of pool) { const x = c._rankCross ?? (c.cross || 0); if (x >= min) xs.push(x); }
  if (xs.length < OUT_POOL_N_MIN) { _outSd = 0; return; }
  _outMed = _outMedian(xs); _outSd = Math.max(1.4826 * _outMedian(xs.map((x) => Math.abs(x - _outMed))), OUT_SD_MIN);
};
const ISS_CROSS_MIN = 10;   // 이슈 배지 cross(260702 8→10)
const issGrade = (c: C) => c.grade == null || c.grade >= 2;
const BJ_CRASH = /(폭락|급락|폭등|급등|서킷브레이커|사이드카|붕괴|패닉|쇼크)/;
const BJ_MKT = /(증시|코스피|코스닥|환율|유가(?!족)|나스닥|다우|뉴욕증시).{0,20}(출발|개장|마감|장중)/;
const BJ_HEAD = /^\[(포토|사진|사설|기고|칼럼|만평|증시|시황|특징주)/;
const BJ_PR = /^(?!.*(대통령|방사청|국방부|방산|잠수함|전투기|호위함|군함)).*(수주|공급\s*계약|계약\s*체결|지분.{0,6}(취득|매각|확보|인수)|지분율|자사주|합작사|출자)/;
const badgeJunk = (c: C) => { const t = c.title || ""; return (BJ_MKT.test(t) && !BJ_CRASH.test(t)) || BJ_HEAD.test(t) || BJ_PR.test(t); };
const issCross = (c: C) => ((c.cross || 0) >= ISS_CROSS_MIN || (c.grade === 3 && (c.cross || 0) >= 8)) && issGrade(c) && !badgeJunk(c);
const ageHOf = (c: C) => { const fsT = scFsT(c), pubAge = Math.max(0, (Date.now() - scHt(c)) / HR); return isNaN(fsT) ? pubAge : Math.max(pubAge, (Date.now() - fsT) / HR); };   // max(발행, 수집) 나이
const timeAccOut = (c: C) => {
  const t = timeAcc(c);
  if (_outSd <= 0) return t;
  const ageH = ageHOf(c);
  if (ageH >= OUT_MAX_AGE_H) return t;
  if ((c.report_count || 0) < FOLLOW_RC_MIN || !issCross(c)) return t;
  const r = scRT[candId(c)] || {};
  if (r.picked || r.acked) return t;
  const s = Math.min(1, Math.max(0, (((c._rankCross ?? (c.cross || 0)) - _outMed) / _outSd - OUT_Z0) / (OUT_Z1 - OUT_Z0)));
  if (!s) return t;
  const fl0 = 1 / (1 + Math.pow(OUT_AGE_CAP_H / ACC_T_HALF, ACC_T_POW)), fl24 = 1 / (1 + Math.pow(OUT_MAX_AGE_H / ACC_T_HALF, ACC_T_POW)),
    fv = ageH <= OUT_AGE_CAP_H ? fl0 : fl0 + ((fl24 - fl0) * (ageH - OUT_AGE_CAP_H)) / (OUT_MAX_AGE_H - OUT_AGE_CAP_H);
  return t + s * Math.max(0, fv - t);
};
const BREAKING_RANK_BOOST = 3.0, BOOST_FLAT_H = 1, BOOST_RAMP_END_H = 6, BOOST_EASE_G = 12.0;   // 긴급 ×3 → 1h 평탄 → 6h 까지 S자로 1
const brkBoost = (c: C) => {
  if (!isBreaking(c)) return 1;
  const ageH = ageHOf(c);
  if (ageH < BOOST_FLAT_H) return BREAKING_RANK_BOOST;
  if (ageH >= BOOST_RAMP_END_H) return 1;
  const t = (ageH - BOOST_FLAT_H) / (BOOST_RAMP_END_H - BOOST_FLAT_H), g = BOOST_EASE_G, sg = (x: number) => 1 / (1 + Math.exp(-x)),
    f = g < 0.05 ? 1 - t : (sg(g * (0.5 - t)) - sg(-g / 2)) / (sg(g / 2) - sg(-g / 2));
  return 1 + (BREAKING_RANK_BOOST - 1) * f;
};
const AGE_MID_H = 13, AGE_STEEP = 3.8, AGE_FLOOR = 0.12;   // 나이 시그모이드(24h 하드 컷 대신 · 260713 v3)
const ageMul = (c: C) => AGE_FLOOR + (1 - AGE_FLOOR) / (1 + Math.exp((ageHOf(c) - AGE_MID_H) / AGE_STEEP));
const scScore0 = (c: C) => crossConvex(c) * timeAccOut(c) * scFollow(c) * gradeW(c) * brkBoost(c) * ageMul(c) * fpW(c);
const scScore = (c: C): number => (c._disp ? Math.max(scScore0(c), scScore0(c._disp)) : scScore0(c));
const pinB = (c: C) => { const r = scRT[candId(c)] || {}; return isBreaking(c) && !r.picked && !r.acked ? 1 : 0; };
const pinFresh = (c: C) => (pinB(c) && Date.now() - scTs(c) < FAST_MAX_H * HR ? 1 : 0);   // 신규 = 최신 속보 핀
const scBadgeType0 = (c: C) => { const ageH = ageHOf(c); if (isBreaking(c) && ageH < FAST_MAX_H) return "brk"; if (ageH >= FAST_MAX_H && ageH < BADGE_MAX_AGE_H && (issCross(c) || isBreaking(c))) return "iss"; return ""; };
const scBadgeType = (c: C) => { if (c._disp) { const a = scBadgeType0(c), b = scBadgeType0(c._disp); return a === "brk" || b === "brk" ? "brk" : a || b; } return scBadgeType0(c); };
const scLit0 = (c: C) => (Date.now() - scHt(c)) / HR < 12 && (c.cross || 0) >= 16 && issGrade(c) && !badgeJunk(c);   // 이슈 점등 = 12h 안 ∧ 16매체+
const scLit = (c: C) => (c._disp ? scLit0(c) || scLit0(c._disp) : scLit0(c));
const scKoTitle = (c: C) => (c && c.title_ko && c.title_ko_of === c.title ? c.title_ko : "");

/* ── 픽 상태(원본 B안 260620 — 전역 pending·피드·picks-failed 가 진실 · nm_ratings 는 발사 직후 낙관 겹) ── */
const scLinkUrl = (c: C) => { const bp = (c && c.breaking_pick && c.breaking_pick.url) || ""; if (/^https?:\/\//i.test(bp)) return bp; return /^https?:\/\//i.test((c && c.url) || "") ? c.url : ""; };
const scPickUrl = (c: C): string => (c._disp ? scPickUrl(c._disp) : scHpOk(c) && c.breaking_pick && /^https?:\/\//i.test(c.breaking_pick.url || "") ? c.breaking_pick.url : c.url);
let _soloU: Set<string> | null = null, _soloSrc: C[] | null = null;
const scSoloUrls = () => (_soloSrc === CANDS && _soloU ? _soloU : ((_soloSrc = CANDS), (_soloU = new Set(CANDS.filter((x) => x.solo).map((x) => _normU(x.url))))));
const scMembers = (c: C) => { const own = _normU(c.url), so = scSoloUrls(); return ((c.cluster_members || []) as string[]).map(_normU).filter((u) => u === own || !so.has(u)); };
const scUrlKeys = (c: C) => [_normU(c.url), _normU(scPickUrl(c)), ...scMembers(c)];
function pickAlt(c: C) {   // 같은 사건 다른 매체 = 대체 fetch 후보
  const pu = _normU(scPickUrl(c)), major = c && c.breaking_pick && c.breaking_pick.url ? _normU(c.breaking_pick.url) : "";
  return [...new Set([_normU(c.url), major, ...((c.cluster_members || []) as string[]).map(_normU)])].filter((u) => u && u !== pu);
}
function ratingFor(c: C) {   // 묶음 멤버가 픽됐으면 대표도 PICKED(단독 1보 url 은 승계 안 함)
  const rt = ratingsAll(), own = rt[candId(c)] || {};
  if (own.picked) return own;
  const own0 = _normU(c.url), so = scSoloUrls();
  for (const m of (c.cluster_members || []) as string[]) { const nm = _normU(m); if (nm !== own0 && so.has(nm)) continue; const rm = rt[m] || rt[nm]; if (rm && rm.picked) return { ...own, picked: true, pickCross: rm.pickCross }; }
  return own;
}
const PF_SKEY = "nomute_pickfail_seen", PF_RKEY = "nomute_pickfail_resolved", PF_USKEY = "nomute_pickfail_resub";
const pfSeen = () => new Set(lsGet<string[]>(PF_SKEY, []));
const pfResolved = () => { const s = new Set(lsGet<string[]>(PF_RKEY, [])); TF_SRV.pr.forEach((id) => s.add(id)); return s; };
const pfResub = () => lsGet<Record<string, number>>(PF_USKEY, {});
const pfAddResub = (id: string) => { const m = pfResub(); m[id] = Date.now(); lsSet(PF_USKEY, m); };
const pfRemoveResub = (id: string) => { const m = pfResub(); delete m[id]; lsSet(PF_USKEY, m); };
const PICK_TIMEOUT_MS = 10 * 60000, PICK_HARD_MS = 130 * 60000;   // 무응답 10분 = 실패 표시 · 서버가 처리 중이라 하면 130분까지 믿음
const pfResubActive = (id: string) => { const t = pfResub()[id]; return !!t && Date.now() - t < PICK_TIMEOUT_MS + 60000; };
const pfKeyOf = (c: C) => scUrlKeys(c).find((u) => u && PFAIL.has(u)) || "";
const pfReason = (c: C) => (PFAIL.get(pfKeyOf(c)) || { reason: "" }).reason || "";
const _feedTitleKey = (t: unknown) => String(t || "").replace(/\s+/g, "").toLowerCase();
const FEED_MATCH_WINDOW = 12 * HR;
let _feedIdxRef: C[] | null = null, _feedUrlAny = new Map<string, C>(), _feedUrlBody = new Map<string, C>(), _feedTitleMap = new Map<string, C[]>(), _feedEkMap = new Map<string, C>();
function _buildFeedIdx() {
  if (_feedIdxRef === DATA) return;
  _feedIdxRef = DATA; _feedUrlAny = new Map(); _feedUrlBody = new Map(); _feedTitleMap = new Map(); _feedEkMap = new Map();
  for (const x of DATA || []) {
    if (!x) continue;
    if (x.url) { const u = _normU(x.url); if (u) { if (!_feedUrlAny.has(u)) _feedUrlAny.set(u, x); if (x.has_body && !_feedUrlBody.has(u)) _feedUrlBody.set(u, x); } }
    if (!x.has_body) continue;
    for (const t of [x.title, x.title_orig]) { const k = _feedTitleKey(t); if (k) { const arr = _feedTitleMap.get(k); if (arr) arr.push(x); else _feedTitleMap.set(k, [x]); } }
    if (x.event_key) { const e = _normU(x.event_key); if (e && !_feedEkMap.has(e)) _feedEkMap.set(e, x); }
  }
}
function _feedStrict(c: C, needBody: boolean) {
  if (!c) return null;
  _buildFeedIdx();
  const um = needBody ? _feedUrlBody : _feedUrlAny;
  for (const u of scUrlKeys(c)) if (u && um.has(u)) return um.get(u)!;
  if (c.event_key) { const a = _feedEkMap.get(_normU(c.event_key)); if (a) return a; }
  return null;
}
const articleAgeH = (a: C) => { const dm = /^(\d{4})[.-](\d{1,2})[.-](\d{1,2})/.exec(String(a.date || "")); if (!dm) return 1e7; const tm = /^(\d{1,2}):(\d{2})/.exec(String(a.time || "").trim()); const t = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], (tm ? +tm[1] : 0) - 9, tm ? +tm[2] : 0); return isNaN(t) ? 1e7 : Math.max(0, (Date.now() - t) / HR); };
const pendStatus = (c: C) => { for (const u of scUrlKeys(c).filter(Boolean)) { const s = PEND.get(u); if (s) return s; } return null; };
/** 피드에 떴나 — url·event_key 정확 → (픽했거나 대기열에 있으면) 같은 제목 12h 안 */
function feedMatch(c: C, needBody: boolean) {
  const s = _feedStrict(c, needBody); if (s) return s;
  if (!c) return null;
  const tk = _feedTitleKey(c.title);
  if (tk && /[가-힣]/.test(c.title) && !JUNK_HEAD.test(c.title) && !pfKeyOf(c) && ((ratingsAll()[candId(c)] || {}).picked || pendStatus(c))) {
    const arr = _feedTitleMap.get(tk);
    if (arr) { const cts = scTs(c); let best: C | null = null, bestD = FEED_MATCH_WINDOW; for (const x of arr) { const d = Math.abs(Date.now() - articleAgeH(x) * HR - cts); if (d < bestD) { bestD = d; best = x; } } if (best) return best; }
  }
  return null;
}
const pickInFeedStrict = (c: C) => !!_feedStrict(c, false);
const pickInFeed = (c: C) => !!feedMatch(c, false);
const pickSettled = (c: C) => pickInFeed(c) || pfResolved().has(candId(c));
const pfailHas = (c: C) => !!pfKeyOf(c) && !pfResolved().has(candId(c)) && !pfResubActive(candId(c)) && !pickInFeedStrict(c);
const pickTimedOut = (c: C) => { if (!DATA_LOADED) return false; const r = ratingsAll()[candId(c)] || {}, ps = pendStatus(c), trust = ps === "retry" || (ps === "processing" && !!r.pickedAt && Date.now() - r.pickedAt < PICK_HARD_MS); if (!r.picked || trust || pickInFeed(c) || pfailHas(c) || pfResolved().has(candId(c)) || pfResubActive(candId(c))) return false; return !r.pickedAt || Date.now() - r.pickedAt > PICK_TIMEOUT_MS; };
const pickFailedShow = (c: C) => pfailHas(c) || pickTimedOut(c);
const FAILRETRY_KEY = "nm_fail_retries", FAILREQUEUE_KEY = "nm_fail_requeue";
const failRetriesGet = () => lsGet<Record<string, number>>(FAILRETRY_KEY, {});
const bumpFailRetry = (c: C) => { const m = failRetriesGet(), id = candId(c); m[id] = (m[id] || 0) + 1; lsSet(FAILRETRY_KEY, m); };
const failCount = (c: C) => 1 + (failRetriesGet()[candId(c)] || 0);
const failRequeuedSet = () => new Set(lsGet<string[]>(FAILREQUEUE_KEY, []));
const failRequeued = (c: C) => failRequeuedSet().has(candId(c));
/** 픽 상태 = null(판단 전) · picking · settled · failed */
function pickState(c: C): "" | "picking" | "settled" | "failed" {
  const r = ratingsAll()[candId(c)] || {}, ps = pendStatus(c);
  if (!r.picked && !ps && !pickInFeed(c)) return "";
  if (!r.picked && failRequeued(c) && !pickInFeed(c)) return "";
  if (pfResubActive(candId(c)) && !pickInFeed(c)) return "picking";
  if (ps === "retry") return "picking";
  if (pickFailedShow(c) || ps === "fail") return "failed";
  if (pickSettled(c) || ps === "succ") return "settled";
  return "picking";
}
const srvTriage = (c: C) => { for (const u of [_normU(c.url), ...scMembers(c)].filter(Boolean)) { const s = SRV_TRI.get(u); if (s) return s; } return null; };
const pickFailNow = () => { const RA = ratingsAll(); return CANDS.filter((c) => (RA[candId(c)] || {}).picked && pickFailedShow(c) && !failRequeued(c)); };
/** 탭 들어올 때 = 지금 실패 건을 본 것으로(원본 enterScrap → markPickFailSeen · 이 기기 + 계정 f 축) */
function markPickFailSeen() {
  const seen = pfSeen(), fresh: string[] = [];
  pickFailNow().forEach((c) => { seen.add(candId(c)); if (!TF_SRV.f.has(candId(c))) fresh.push(candId(c)); });
  lsSet(PF_SKEY, [...seen]);
  postSeen("f", fresh);
}
const markPickFailSeenOne = (c: C) => { const s = pfSeen(); s.add(candId(c)); lsSet(PF_SKEY, [...s]); postSeen("f", [candId(c)]); };

/* ── 같은 제목 접기(원본 scDedup · 12h 안 같은 제목 = 우세한 한 장 · 누적끼리 같은 제목+같은 대표 기사 = 한 장) ── */
const scTitleKey = (c: C) => (c.title || "").replace(/\s+/g, "").toLowerCase();
const SC_DUP_WINDOW = 12 * HR;
const scMoreDom = (a: C, b: C) => ((a.cross || 0) !== (b.cross || 0) ? (a.cross || 0) > (b.cross || 0) : (a.report_count || 0) !== (b.report_count || 0) ? (a.report_count || 0) > (b.report_count || 0) : scTs(a) > scTs(b));
const scOldCol = (c: C) => Date.now() - scTs(c) >= FAST_MAX_H * HR;
const scHeadUrl = (c: C) => (c.breaking_pick && /^https?:\/\//i.test(c.breaking_pick.url || "") ? c.breaking_pick.url : c.url);
function scDedupPick(arr: C[]) {
  const seen = new Map<string, number>(), out: C[] = [];
  for (const c of arr) {
    const k = scTitleKey(c), u = _normU(scHeadUrl(c));
    if (!k || !u || !scOldCol(c)) { out.push(c); continue; }
    const key = k + "\n" + u, i = seen.get(key);
    if (i != null) { if (scMoreDom(c, out[i])) out[i] = c; continue; }
    seen.set(key, out.length); out.push(c);
  }
  return out;
}
function scDedup(arr: C[]) {
  const rep = new Map<string, { c: C; idx: number }>(), out: C[] = [];
  for (const c of arr) {
    const k = scTitleKey(c);
    if (!k) { out.push(c); continue; }
    const prev = rep.get(k);
    if (prev && Math.abs(scTs(c) - scTs(prev.c)) < SC_DUP_WINDOW) { if (scMoreDom(c, prev.c)) { out[prev.idx] = c; rep.set(k, { c, idx: prev.idx }); } continue; }
    rep.set(k, { c, idx: out.length }); out.push(c);
  }
  return scDedupPick(out);
}

/* ── 묶음(원본 손 묶음 nm_merges + 계정 동기 api/mapsync · AI 묶음 group_id) ── */
const MERGE_KEY = "nm_merges", MERGE_TS_KEY = "nm_merges_ts", MERGE_PEND_KEY = "nm_merges_pend";
const mergesAll = (): Record<string, C> => { if (PASS) return (PASS.mg ??= lsGet(MERGE_KEY, {})); return lsGet(MERGE_KEY, {}); };
type MPend = { set: Record<string, C>; del: string[]; base: Record<string, C | null>; fails: number; retryAt: number };
const mergePend = (): MPend => {
  const p = lsGet<C>(MERGE_PEND_KEY, {}) || {}, obj = (o: unknown) => (o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, C>) : {});
  return { set: obj(p.set), del: Array.isArray(p.del) ? p.del.filter((k: unknown) => typeof k === "string" && k) : [], base: obj(p.base), fails: +p.fails || 0, retryAt: +p.retryAt || 0 };
};
const mergePendSave = (p: MPend) => {
  Object.keys(p.base).forEach((k) => { if (!(k in p.set) && !p.del.includes(k)) delete p.base[k]; });
  try { if (!Object.keys(p.set).length && !p.del.length) localStorage.removeItem(MERGE_PEND_KEY); else localStorage.setItem(MERGE_PEND_KEY, JSON.stringify(p)); return true; } catch { return false; }
};
const mergeOverlay = (base: Record<string, C>, p: MPend) => { const out = { ...base }; p.del.forEach((k) => delete out[k]); Object.entries(p.set).forEach(([k, v]) => { out[k] = v; }); return out; };
const _mergeSame = (a: unknown, b: unknown) => JSON.stringify(a == null ? null : a) === JSON.stringify(b == null ? null : b);
let _mergeFlushP: Promise<boolean> | null = null, _mergeFlushAgain = false;
/** 밀린 묶음 보냄(원본 flushMerges — base 동봉 = 다른 기기가 먼저 바꾼 칸은 서버가 conflicts 로 돌려줌 · 실패 = 지수 대기 뒤 다시) */
function flushMerges(force = false): Promise<boolean> {
  if (_mergeFlushP) { _mergeFlushAgain = true; return _mergeFlushP; }
  const p = mergePend();
  if (!force && Date.now() < p.retryAt) return Promise.resolve(false);
  const setE = Object.entries(p.set).slice(0, 50), del = p.del.slice(0, 50);
  if (!setE.length && !del.length) return Promise.resolve(true);
  const base: Record<string, C | null> = {}; [...setE.map(([k]) => k), ...del].forEach((k) => { if (k in p.base) base[k] = p.base[k]; });
  _mergeFlushP = fetch("/api/mapsync", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ file: "merges", set: Object.fromEntries(setE), del, base }), signal: T12() })
    .then(async (r) => { const j = await r.json().catch(() => null); return { res: r.ok && j && j.ok ? "ok" : r.status === 400 ? "drop" : "keep", srv: true, conflicts: j && Array.isArray(j.conflicts) ? (j.conflicts as string[]) : [] }; }, () => ({ res: "keep", srv: false, conflicts: [] as string[] }))
    .then(({ res, srv, conflicts }) => {
      if (res === "keep") { if (srv) { const c = mergePend(); c.fails = Math.min((c.fails || 0) + 1, 6); c.retryAt = Date.now() + 60e3 * 2 ** c.fails; mergePendSave(c); } return false; }
      const cur = mergePend(), lost = new Set(res === "ok" ? conflicts : []);
      cur.fails = 0; cur.retryAt = 0;
      setE.forEach(([k, v]) => { if (k in cur.set && _mergeSame(cur.set[k], v)) delete cur.set[k]; else if (res === "ok" && !lost.has(k) && (k in cur.set || cur.del.includes(k))) cur.base[k] = v; });
      del.forEach((k) => { if (cur.del.includes(k)) cur.del = cur.del.filter((x) => x !== k); else if (res === "ok" && !lost.has(k) && k in cur.set) cur.base[k] = null; });
      if (!mergePendSave(cur)) return false;
      if (res === "ok") lsSet(MERGE_TS_KEY, String(Date.now()));
      if (lost.size) NOTE({ msg: "다른 기기에서 먼저 바뀐 병합 " + lost.size + "건은 그쪽 기준으로 맞췄어." });
      if (Object.keys(cur.set).length || cur.del.length) _mergeFlushAgain = true;
      return true;
    })
    .finally(() => { _mergeFlushP = null; if (_mergeFlushAgain) { _mergeFlushAgain = false; flushMerges(); } });
  return _mergeFlushP;
}
const _mergePost = (delta: C) => { postJ("/api/mapsync", { file: "merges", ...delta }).catch(() => {}); };
/** 묶음 저장(원본 saveMerges) — 이 기기 먼저 · 바뀐 칸만 계정으로(once = 큐 밖 한 번 = GC) */
const saveMerges = (m: Record<string, C>, delta: { set?: Record<string, C>; del?: string[] }, once = false) => {
  const prev = once ? null : lsGet<Record<string, C>>(MERGE_KEY, {});
  const ok = lsSet(MERGE_KEY, m);
  if (ok && ((delta.set && Object.keys(delta.set).length) || (delta.del && delta.del.length))) {
    lsSet(MERGE_TS_KEY, String(Date.now()));
    const p = mergePend();
    if (once) { (delta.del || []).forEach((k) => { delete p.set[k]; p.del = p.del.filter((x) => x !== k); }); mergePendSave(p); _mergePost(delta); return ok; }
    const keep = (k: string) => { if (!(k in p.base)) p.base[k] = prev && k in prev ? prev[k] : null; };
    Object.entries(delta.set || {}).forEach(([k, v]) => { keep(k); p.set[k] = v; p.del = p.del.filter((x) => x !== k); });
    (delta.del || []).forEach((k) => { keep(k); delete p.set[k]; if (!p.del.includes(k)) p.del.push(k); });
    if (mergePendSave(p)) flushMerges(true); else _mergePost(delta);
  }
  return ok;
};
/** 계정 묶음 받기(원본 loadMergesSrv — 밀린 것 먼저 보냄 · 이 기기가 5분 안에 바꿨으면 안 덮음) */
async function loadMergesSrv() {
  try {
    const p0 = mergePend(); if (Object.keys(p0.set).length || p0.del.length) await flushMerges();
    const ts0 = +(localStorage.getItem(MERGE_TS_KEY) || 0) || 0;
    if (Date.now() - ts0 < 300e3) return;
    const x = await getRaw(`/merges.json?_=${Date.now()}`); const d = x?.[0] as Record<string, C> | undefined;
    if (!d || typeof d !== "object" || Array.isArray(d)) return;
    if (_mergeFlushP || (+(localStorage.getItem(MERGE_TS_KEY) || 0) || 0) !== ts0) return;
    const next = mergeOverlay(d, mergePend());
    if (JSON.stringify(next) === JSON.stringify(lsGet(MERGE_KEY, {}))) return;
    lsSet(MERGE_KEY, next); mergeTick++;
  } catch { /* 없으면 이 기기만 */ }
}
const kstNow = () => new Date(Date.now() + 9 * HR).toISOString();
const FOLLOW_GAP_H = 12;
/** 묶음 대표 카드(원본 mergeDecorate) — cross 합(랭킹은 댐핑) · 긴급·경중·연속보도는 최대 · follow = 12h 넘게 늦은 새 국면 형제 제목을 얼굴로 */
function mergeDecorate(anchor: C, memCands: C[], follow = false): C {
  const aRep = _normU(anchor.url);
  let disp: C | null = null;
  if (follow) {
    const ak = scTitleKey(anchor); let t = scHt(anchor) + FOLLOW_GAP_H * HR - 1;
    for (const m of memCands) { const mt = scHt(m); if (scHpOk(m) && scTitleKey(m) !== ak && (mt > t || (disp && mt === t && candId(m) < candId(disp))) && (effCross(m) >= CROSS_MIN || isBreaking(m) || followEnters(m))) { disp = m; t = mt; } }
  }
  const dv = disp ? { title: disp.title, title_ko: disp.title_ko, title_ko_of: disp.title_ko_of, media: disp.media, cat: disp.cat, gossip: disp.gossip, breaking_pick: disp.breaking_pick || { url: disp.url, media: disp.media, title: disp.title }, _follow: candId(disp), _disp: disp } : {};
  const cm: string[] = [], cmSeen = new Set([aRep]);
  for (const u of [...memCands.map((m) => m.url), ...(anchor.cluster_members || []), ...memCands.flatMap((m) => m.cluster_members || [])]) { const k = _normU(u); if (k && !cmSeen.has(k)) { cmSeen.add(k); cm.push(String(u)); } }
  const grades = [anchor.grade, ...memCands.map((m) => m.grade)].filter((g) => g != null);
  const _base = anchor.cross || 0, _summed = _base + memCands.reduce((s, m) => s + (m.cross || 0), 0);
  const _cap = _base * MERGE_DAMP_RATIO, _rankCross = _summed <= _cap ? _summed : _cap + (_summed - _cap) * MERGE_DAMP_GAIN;
  return { ...anchor, ...dv, cross: _summed, _rankCross, _baseCross: _base,
    px: Math.max(anchor.px || 0, ...memCands.map((m) => m.px || 0)),
    breaking: anchor.breaking || memCands.some((m) => m.breaking),
    grade: grades.length ? Math.max(...grades) : anchor.grade,
    lv: [anchor, ...memCands].filter((m) => m.breaking).map((m) => m.lv).filter((v) => v && typeof v === "object").sort((x, y) => (y.t || 0) - (x.t || 0))[0] || anchor.lv,
    report_count: Math.max(anchor.report_count || 0, ...memCands.map((m) => m.report_count || 0)),
    burst: Math.max(anchor.burst || 0, ...memCands.map((m) => m.burst || 0)),
    cluster_members: cm, _mergeCount: memCands.length, _mergeMembers: memCands.map(candId) };
}
const scTouched = (c: C) => { const r = { ...(srvTriage(c) || {}), ...(ratingsAll()[candId(c)] || {}) }; return !!(pickState(c) || r.acked || r.dismissed); };
function applyAutoGroups(pool: C[]) {   // AI 확정 사건 묶기(group_id · 260702 · 손 묶음 뒤 = 손 우선)
  FOLLOW_OF.clear();
  const by = new Map<string, C[]>();
  for (const c of pool) if (c.group_id) { const a = by.get(c.group_id) || []; a.push(c); by.set(c.group_id, a); }
  if (!by.size) return pool;
  const drop = new Set<string>(), deco = new Map<string, C>();
  for (const [gid, cards] of by) {
    if (cards.length < 2) continue;
    const anchor = cards.find((c) => c.url === gid) || cards.slice().sort((a, b) => (b.cross || 0) - (a.cross || 0))[0];
    const mem = cards.filter((c) => c !== anchor);
    let d = mergeDecorate(anchor, mem, !anchor._mergeCount);
    if (d._follow && scTouched(anchor) && !scTouched(d._disp)) d = mergeDecorate(anchor, mem);   // 대표만 이미 처리 = 얼굴 유지
    if (d._follow) FOLLOW_OF.set(candId(anchor), { id: d._follow, url: d._disp.url || "" });
    deco.set(candId(anchor), d);
    mem.forEach((c) => drop.add(candId(c)));
  }
  if (!deco.size) return pool;
  return pool.map((c) => deco.get(candId(c)) || c).filter((c) => !drop.has(candId(c)));
}
const candFresh = () => CAND_LIVE && Date.now() - CAND_TS < 20 * 60000;   // 라이브 20분 안(원본 CAND_STALE_MS)
/** 손 묶음 접기(원본 applyMerges) — GC 할 죽은 묶음(대표·멤버 다 후보에 없음)은 신선한 라이브에서만 고름 · 지우기는 그린 뒤(effect) */
function applyMerges(pool: C[], prune: boolean) {
  const M = { ...mergesAll() }, pruneKeys: string[] = [];
  if (!Object.keys(M).length) return { pool, pruneKeys };
  const _mems = (a: string): string[] => (Array.isArray(M[a] && M[a].members) ? M[a].members : []);
  const liveId = new Set(CANDS.map(candId));
  if (prune && candFresh() && CAND_MISS === 0 && CANDS.length) for (const a of Object.keys(M)) if (!liveId.has(a) && !_mems(a).some((m) => liveId.has(m))) { delete M[a]; pruneKeys.push(a); }
  const byId = new Map(pool.map((c) => [candId(c), c]));
  const anchorSet = new Set(Object.keys(M).filter((a) => byId.has(a)));
  const memberOf = new Map<string, string>();
  for (const a of anchorSet) for (const mid of _mems(a)) if (mid !== a && !anchorSet.has(mid)) memberOf.set(mid, a);
  const out: C[] = [];
  for (const c of pool) {
    const id = candId(c);
    if (memberOf.has(id)) continue;
    if (anchorSet.has(id) && _mems(id).length) {
      const mem = _mems(id).filter((mid) => mid !== id).map((mid) => byId.get(mid) || CANDS.find((x) => candId(x) === mid)).filter(Boolean) as C[];
      out.push(mem.length ? mergeDecorate(c, mem) : c);
    } else out.push(c);
  }
  return { pool: out, pruneKeys };
}
const scUntriaged = (c: C, rt: Record<string, C>) => { const r = rt[candId(c)] || {}; return pickState(c) || !((r.action && r.action !== "pick") || r.passed); };

/* ── 한 바퀴 그리기 자료(원본 scCandidatePool + renderScrap 칼럼 셈) ── */
type Built = { failed: C[]; cross: C[]; nw: C[]; foldN: number; pruneKeys: string[]; picking: number };
function build(fold: boolean): Built {
  const rt: Record<string, C> = { ...ratingsAll() };
  CANDS.forEach((c) => { const s = srvTriage(c); if (s) { const id = candId(c); rt[id] = { ...s, ...(rt[id] || {}) }; } });   // 전 기기 원장 아래 · 이 기기 위(260620)
  scRT = rt;
  const _mm = mergesAll(), merged = new Set<string>(), liveIds = new Set(CANDS.map(candId));
  for (const a of Object.keys(_mm)) { if (!liveIds.has(a)) continue; (Array.isArray(_mm[a] && _mm[a].members) ? (_mm[a].members as string[]) : []).forEach((m) => merged.add(m)); }
  const failed = CANDS.filter((c) => pickState(c) === "failed" && !JUNK_HEAD.test(c.title || "") && !failRequeued(c) && !merged.has(candId(c)));   // 실패 = 칼럼 밖 상단 트레이(260620 · 솎여도 안 사라지게)
  const failSet = new Set(failed.map(candId));
  failed.sort((a, b) => scTs(b) - scTs(a));
  const am = applyMerges(scDedup(CANDS.filter((c) => {
    const r = rt[candId(c)] || {};
    if (failSet.has(candId(c))) return false;
    if (r.dismissed && !pickState(c)) return false;   // PASS = 빠짐 · 다른 기기·파이프라인이 픽한 건 남아 PICKED
    if (r.score >= 1) return false;   // 별점 매긴 옛 카드(별점은 261021 뺌)
    if (JUNK_HEAD.test(c.title || "")) return false;
    return true;
  })), true);
  const pool = applyAutoGroups(am.pool);
  const untri = (c: C) => scUntriaged(c, rt);
  outStatUpd(pool, CROSS_MIN);
  // 신규 = scFast ∧ 4h 안 · 핀 → fastScore → 최신 · 실패 체크 복귀·픽 이력 = 자격 면제
  let nw = pool.filter((c) => untri(c) && (scFast(c) || failRequeued(c) || pickState(c)) && Date.now() - scTs(c) < FAST_MAX_H * HR);
  nw = nw.map((c) => ({ c, p: pinFresh(c), f: fastScore(c), t: scTs(c) })).sort((a, b) => b.p - a.p || b.f - a.f || b.t - a.t).map((x) => x.c);
  let foldN = 0;
  const held = new Set(nw.filter((c) => (c.grade == null || c.grade === 0) && (c.cross || 0) <= 3 && (c.burst || 0) < 3 && !c.breaking && !c.breaking_candidate && !failRequeued(c) && !pickState(c) && Date.now() - scTs(c) >= FRESH_UNFOLD_H * HR).map(candId));   // 검증대기 = 미채점·비뉴스 소규모(Q-1 260702)
  if (held.size >= 4 && nw.length - held.size >= 10) {   // 활성 10건 미만이면 안 접음(260705)
    if (fold) { nw = nw.filter((c) => !held.has(candId(c))).concat(nw.filter((c) => held.has(candId(c)))); foldN = -held.size; }
    else { nw = nw.filter((c) => !held.has(candId(c))); foldN = held.size; }
  }
  // 누적 = 4h 넘음 ∧ (실효 cross 8 ∨ 긴급 ∨ 연속보도 보조진입) · scScore 순
  let cross = pool.filter((c) => untri(c) && (effCross(c) >= CROSS_MIN || isBreaking(c) || followEnters(c) || failRequeued(c) || pickState(c)) && Date.now() - scTs(c) >= FAST_MAX_H * HR);
  cross = cross.map((c) => ({ c, s: scScore(c), t: scHt(c) })).sort((a, b) => b.s - a.s || b.t - a.t).map((x) => x.c);
  const picking = DATA_LOADED ? CANDS.filter((c) => pickState(c) === "picking").length : 0;
  return { failed: scDedup(failed), cross, nw, foldN, pruneKeys: am.pruneKeys, picking };
}

/* ── 판단 동작(원본 applyTriage · toggleAck · askGrade · brkNotUrgent · failRetry · cancelPickPrepick · doMerge · unmergeAnchor) ── */
const TRIAGE: Record<"pass" | "pick", { q: string; reasons: { k: string; d?: string; input?: boolean }[] }> = {
  pass: { q: "이유는?", reasons: [{ k: "스팸", d: "(0점) 기사로서 가치가 가장 없음 · 애초에 수집 필요 없는 기사" }, { k: "홍보성", d: "(1점) 지방·지자체·기업·주가 띄우기·산하 행정단체 홍보성 보도자료" }, { k: "가치없음", d: "(2점) 화제성은 있지만 콘텐츠화 시 다수 유의미한 반응 이끌기 어려움" }, { k: "직접입력", input: true }] },
  pick: { q: "이유는?", reasons: [{ k: "속보/사건", d: "빠르게 전달하면 모두가 감정적 격동을 느낄 것이라 판단" }, { k: "토픽/논란", d: "범국민적 토픽·주제라고 판단" }, { k: "대세픽", d: "국민적 인기 — 지금 다수가 주목하는 대세 흐름(트렌드·화제성)" }, { k: "지식", d: "효과적 콘텐츠면 팔로워가 유용하다고 느낄 것이라 판단" }, { k: "직접입력", input: true }] },
};
const pickBody = (c: C, body?: string) => ({ url: scPickUrl(c), title: c.title || "", alt: pickAlt(c).slice(0, 8), ...(body ? { body } : {}), event_key: c.event_key || "" });
/** PASS·PICK 확정 — 원장(api/rate) · PICK = 분석 파이프라인(api/pick · 거절이면 되돌림 + 실패 알림 + 다시 시도) */
function applyTriage(act: "pass" | "pick", c: C, reason: string, text: string, redraw: () => void) {
  const id = candId(c), memo = (text || "").trim();
  const patch: C = { action: act, reason }; if (memo) patch.memo = memo;
  if (act === "pass") patch.dismissed = true;
  if (act === "pick") { patch.picked = true; patch.pickedAt = Date.now(); }
  saveRating(id, patch);
  const cur = lsGet<Record<string, C>>(RKEY, {})[id] || {};
  postRate({ id, url: c.url || "", title: c.title || "", score: cur.score || 0, picked: !!cur.picked, memo: cur.memo || memo, dismissed: !!cur.dismissed, action: act, reason });
  if (act === "pick" && c.url) {
    postJ("/api/pick", pickBody(c), true)
      .then(async (r) => {
        if (r.ok) return;
        const why = await failWhy(r);
        saveRating(id, { picked: false }); postRate({ id, url: c.url || "", title: c.title || "", score: cur.score || 0, picked: false }); redraw();
        pickFailNote(pickHttpMsg(r.status, why), () => { applyTriage("pick", c, reason, memo, redraw); redraw(); });
      }, async (e) => {
        if ((await netMsg(e)) !== AUTH_TXT) return;   // 회선 끊김은 이미 갔을 수 있어 그대로(원본) · 만료만 되돌림
        saveRating(id, { picked: false }); redraw(); pickFailNote(AUTH_TXT, null);
      });
  }
}
function toggleAck(c: C) {
  const id = candId(c), acked = !(lsGet<Record<string, C>>(RKEY, {})[id] || {}).acked;
  saveRating(id, { acked });
  const cur = lsGet<Record<string, C>>(RKEY, {})[id] || {};
  postRate({ id, url: c.url || "", title: c.title || "", acked, score: cur.score || 0, picked: !!cur.picked, dismissed: !!cur.dismissed, action: cur.action || "", reason: cur.reason || "" });
}
function setGrade(c: C, v: string) {   // 교정 = 이 기기(nomute_grade_fix) + 원장(reason = 교정:AI)
  const id = candId(c), all = lsGet<Record<string, C>>(GFIX_KEY, {});
  if (v === "x") delete all[id]; else all[id] = { g: +v, ai: c.grade ?? null, ts: Date.now() };
  lsSet(GFIX_KEY, all);
  postRate({ id, url: c.url || "", title: c.title || "", score: 0, picked: false, action: "grade", reason: (v === "x" ? "x" : v) + ":" + (c.grade == null ? "x" : c.grade) });
}
function brkNotUrgent(c: C) {   // 긴급 배지 길게 = 「긴급 아님」(reason 예약키 brkno → scraper/brk_misfire.py)
  const id = candId(c) || "", cur = scRT[id] || {};
  postRate({ id, url: c.url || "", title: c.title || "", score: cur.score || 0, picked: !!cur.picked, dismissed: !!cur.dismissed, acked: !!cur.acked, action: cur.action || "", reason: "brkno" });
}
function failRetry(c: C, redraw: () => void) {   // Failed 탭 = 다시 분석(재시도 중 표시 = resub 11분)
  if (!c.url) return;
  const id = candId(c), _prev = lsGet<Record<string, C>>(RKEY, {})[id] || {};
  saveRating(id, { picked: true, pickedAt: Date.now() }); pfAddResub(id);
  postJ("/api/pick", pickBody(c))
    .then(async (r) => {
      if (r.ok) return;
      const j = (await r.json().catch(() => ({}))) as C;
      saveRating(id, { picked: false }); pfRemoveResub(id); redraw();
      pickFailNote(pickHttpMsg(r.status, j.error || ""), () => { failRetry(c, redraw); redraw(); });
    }, async (e) => {
      if ((await netMsg(e)) !== AUTH_TXT) return;
      saveRating(id, { picked: !!_prev.picked, pickedAt: _prev.pickedAt }); pfRemoveResub(id); redraw(); pickFailNote(AUTH_TXT, null);
    });
}
function cancelPickPrepick(c: C) {   // 실패 ✓ = 픽 하기 전으로(트레이에서 빠져 칼럼 제자리 · PASS/PICK 다시)
  const id = candId(c);
  saveRating(id, { picked: false });
  const s = failRequeuedSet(); s.add(id); lsSet(FAILREQUEUE_KEY, [...s]);
  markPickFailSeenOne(c);
}
function doMerge(anchor: string, sel: Set<string>): string {
  if (!CANDS.some((c) => candId(c) === anchor)) return "기준 기사가 사라져 병합 취소됐어.";
  const M = lsGet<Record<string, C>>(MERGE_KEY, {}), _ms = (x: string): string[] => (Array.isArray(M[x] && M[x].members) ? M[x].members : []);
  const set = new Set(_ms(anchor)), absorbed: string[] = [];
  for (const id of sel) { if (id === anchor) continue; set.add(id); if (M[id]) { _ms(id).forEach((x) => set.add(x)); delete M[id]; absorbed.push(id); } }   // 멤버가 다른 묶음 대표였으면 흡수
  M[anchor] = { members: [...set].filter((x) => x !== anchor), at: kstNow() };
  if (!saveMerges(M, { set: { [anchor]: M[anchor] }, del: absorbed })) return "저장 공간이 부족해 병합 실패.";
  return "";
}
function unmergeAnchor(c: C) { const M = lsGet<Record<string, C>>(MERGE_KEY, {}), id = candId(c); if (!M[id]) return false; delete M[id]; saveMerges(M, { del: [id] }); return true; }
/** 실패 사유 받기(원본 failDownload — 클로드에게 줄 5W1H 진단 .md) */
function failDownload(c: C) {
  const nowK = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }), rt = lsGet<Record<string, C>>(RKEY, {})[candId(c)] || {};
  const pickedK = rt.pickedAt ? new Date(rt.pickedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "?";
  const reason = pfReason(c) || (pickTimedOut(c) ? "무응답(10분+ 미반영) — 서버 실패기록 없음(analyze 미완/지연 추정)" : "fetch 차단(403 추정)");
  const onServer = PFAIL.has(_normU(c.url)), mems = [...new Set(((c.cluster_members || []) as string[]).map(_normU))].filter((u) => u && u !== _normU(c.url));
  const L = [`# 픽 분석 실패 진단 — ${c.title || "(제목 없음)"}`, "", "> 자동 생성(수집함 Failed 칩). 이 파일을 클로드에게 전달하면 원인 분석·복구에 사용합니다. 또는 같은 메뉴의 「내용 입력」으로 기사 전문을 붙여넣어 재분석할 수 있습니다.", "",
    "## 요약 (5W1H)", `- **언제(When)**: 픽 ${pickedK} (KST) · 진단 ${nowK}`, `- **무엇(What)**: ${c.title || "(제목 없음)"}${c.media ? " · 매체 " + c.media : ""}`,
    `- **어디서(Where)**: ${onServer ? "`pending/failed/`(분석 단계 실패로 격리) + `picks-failed.json` 등재" : "서버 실패기록 없음 — 클라이언트 무응답 타임아웃(10분 초과)"}`,
    "- **어떻게(How)**: 수집함 PICK → api/pick → pending → news-analyze. 원매체 fetch 가 데이터센터 IP 403 으로 막히면 본문 확보 실패.", "- **누가(Who)**: 운영자 픽", `- **왜(Why·추정)**: ${reason}`,
    "", "## 입력 (Input)", `- 원문 URL: ${c.url || "(없음)"}`, `- 식별자(candId): \`${candId(c)}\``, `- 교차보도(cross): ${c.cross != null ? c.cross : "?"} 매체`];
  if (mems.length) { L.push("- 같은 사건 다른 매체(cluster_members · 대체 fetch 후보):"); mems.slice(0, 12).forEach((u) => L.push("  - " + u)); }
  L.push("", "## 진단·복구 힌트 (클로드용)", "- 데이터센터 IP 403 = 매체 WAF(조선·동아·연합·중앙 등)가 러너 IP 차단. 헤더로 못 뚫음 → **기사 전문 직접 입력**이 정공법.",
    "- 복구 A(웹앱): 이 메뉴의 「내용 입력」 → 기사 본문 붙여넣기 → 전송. body 동봉 pending 으로 재분석(403 무관).", "- 복구 B(폰): Termux 공유로 전문 전달(가정용 IP=200).",
    "- 대체: 위 cluster_members 중 접근 가능한 매체를 alt 로 줘 본문 확보.", "- 확인: GitHub Actions `news-analyze` 최근 run → `Analyze pending articles` 스텝 로그(`pending/failed/*.log`).");
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([L.join("\n")], { type: "text/markdown;charset=utf-8" }));
    a.download = "픽실패_" + candId(c).replace(/[^\w.-]+/g, "_").slice(0, 40) + ".md";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => { try { URL.revokeObjectURL(a.href); } catch { /* 이미 풀림 */ } }, 1500);
  } catch { NOTE({ msg: "진단 파일을 못 만들었어" }); }
}

/* ── 그림 ── */
const Svg = ({ s, className }: { s: string; className?: string }) => <span aria-hidden className={className} dangerouslySetInnerHTML={{ __html: s }} />;
const CK = <svg className="sc-ck" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 13l4 4L19 7" /></svg>;
const XI = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 6 18 18M18 6 6 18" /></svg>;
const ACK = <svg className="ackm" viewBox="0 0 24 24" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path className="sc-dash" d="M6 12h12" /><path className="sc-chk" d="M5 13l4 4L19 7" /></svg>;
const SEND = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>;
const DOC = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>;
const PEN = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>;

/** 길게 누름(원본 claimLongPress — 10px 넘게 움직이면 취소 · 우클릭 = 바로 · 끝난 뒤 탭 = 삼킴 · stop = 카드 길게 누름(묶기) 안 겹치게) */
function useHold(ms: number, fn: () => void, stop = false, off = false) {
  const t = useRef(0), xy = useRef([0, 0]), fired = useRef(false), f = useRef(fn);
  f.current = fn;
  useEffect(() => () => clearTimeout(t.current), []);
  const cancel = () => { clearTimeout(t.current); t.current = 0; };
  return {
    onPointerDown: (e: RPE) => { fired.current = false; if (e.button || off) return; if (stop) e.stopPropagation(); xy.current = [e.clientX, e.clientY]; cancel(); t.current = window.setTimeout(() => { t.current = 0; fired.current = true; f.current(); }, ms); },
    onPointerUp: cancel, onPointerCancel: cancel, onPointerLeave: cancel,
    onPointerMove: (e: RPE) => { if (t.current && Math.abs(e.clientX - xy.current[0]) + Math.abs(e.clientY - xy.current[1]) > 10) cancel(); },
    onContextMenu: (e: { preventDefault: () => void; stopPropagation: () => void }) => { if (off) return; e.preventDefault(); if (stop) e.stopPropagation(); const was = fired.current; cancel(); fired.current = true; if (!was) f.current(); },   // 길게 누름 끝에 오는 contextmenu = 한 번만
    onClickCapture: (e: { preventDefault: () => void; stopPropagation: () => void }) => { if (fired.current) { fired.current = false; e.preventDefault(); e.stopPropagation(); } },   // 길게 누른 뒤 손 뗀 탭 = 삼킴(원본 _lpFired)
  };
}

type Pop =
  | { k: "pass" | "pick"; c: C; el: HTMLElement; owner: HTMLElement }
  | { k: "grade"; c: C; el: HTMLElement; owner: HTMLElement }
  | { k: "unmerge"; c: C; el: HTMLElement }
  | { k: "fail"; c: C; el: HTMLElement };
type Fx = "fill" | "ok" | "gone";

/** 떠 있는 창 자리 — 이유·교정 = 카드 위/아래(화면 가운데 기준 · 원본 placeRsn) · 풀기 = 숫자 바로 위 가운데 · 실패 메뉴 = 칩 아래(넘치면 위) · 아래 끝 = 네비 위 */
function Floating({ pop, onClose, children, className }: { pop: Pop; onClose: () => void; children: ReactNode; className: string }) {
  const box = useRef<HTMLDivElement>(null), [st, setSt] = useState<CSSProperties>({ visibility: "hidden" }), [dir, setDir] = useState("");
  const place = useCallback(() => {
    const p = box.current; if (!p || !pop.el.isConnected) return;
    const tab = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--duet-tab-space")) || 86;   // 아래 네비 자리는 비움(앱 = 네비가 판 위)
    const r = pop.el.getBoundingClientRect(), vw = window.innerWidth, vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight) - tab, w = p.offsetWidth, h = p.offsetHeight;
    if (pop.k === "unmerge") { setSt({ left: r.left + r.width / 2, top: r.top }); return; }
    if (pop.k === "fail") { let top = r.bottom + 6; if (top + h > vh - 8) top = r.top - h - 6; top = Math.max(8, top); setSt({ top, left: Math.max(8, Math.min(r.left + r.width / 2 - w / 2, vw - w - 8)) }); return; }
    const below = r.top + r.height / 2 < vh / 2;
    let top = below ? r.bottom + 6 : r.top - h - 6; top = Math.max(6, Math.min(top, vh - h - 6));
    setSt({ top, left: Math.max(6, Math.min(r.left, vw - w - 6)) }); setDir(below ? "down" : "up");
  }, [pop]);
  useLayoutEffect(() => { place(); }, [place]);
  useEffect(() => {
    let raf = 0;
    const re = () => { if (pop.k === "unmerge") { onClose(); return; } if (!raf) raf = requestAnimationFrame(() => { raf = 0; place(); }); };   // 풀기 = 스크롤하면 닫힘(원본) · 나머지 = 따라감
    const down = (e: PointerEvent) => { const t = e.target as Node; if (box.current?.contains(t) || ("owner" in pop && pop.owner.contains(t))) return; onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    const t0 = window.setTimeout(() => document.addEventListener("pointerdown", down), 0);   // 여는 누름이 바로 닫지 않게 한 틱 뒤
    window.addEventListener("scroll", re, { passive: true, capture: true }); window.addEventListener("resize", re); window.visualViewport?.addEventListener("resize", re);
    document.addEventListener("keydown", key);
    return () => { clearTimeout(t0); cancelAnimationFrame(raf); document.removeEventListener("pointerdown", down); window.removeEventListener("scroll", re, { capture: true }); window.removeEventListener("resize", re); window.visualViewport?.removeEventListener("resize", re); document.removeEventListener("keydown", key); };
  }, [pop, place, onClose]);
  return createPortal(<div className="yeta-set nm-scrap-layer"><div ref={box} className={`${className}${dir ? " " + dir : ""}`} style={st} role="dialog">{children}</div></div>, document.body);
}

/** PASS·PICK 이유(원본 askReason · TRIAGE) — 칩 하나 = 바로 확정 · 직접입력 = 한 줄 + 보내기(게이지) */
function ReasonPop({ pop, onClose, onApply }: { pop: Extract<Pop, { k: "pass" | "pick" }>; onClose: () => void; onApply: (reason: string, text: string, fromInput: boolean) => void }) {
  const A = TRIAGE[pop.k], [inp, setInp] = useState(false), [txt, setTxt] = useState(""), inRef = useRef<HTMLInputElement>(null), sendRef = useRef<HTMLSpanElement>(null);
  const inpK = (A.reasons.find((r) => r.input) || { k: "직접입력" }).k;
  useEffect(() => { if (inp) setTimeout(() => inRef.current?.focus({ preventScroll: true }), 20); }, [inp]);
  return (
    <Floating pop={pop} onClose={onClose} className={`sc-rsn rsn-${pop.k}`}>
      <div className="sc-rsn-q"><b>{A.q}</b><button type="button" className="sc-rsn-x" aria-label="취소" onClick={onClose}>{XI}</button></div>
      {inp ? (
        <div className="sc-rsn-chips inp-mode">
          <input ref={inRef} className="sc-rsn-in" type="text" maxLength={200} enterKeyHint="send" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} placeholder="이유 한 줄" value={txt} onChange={(e) => setTxt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); sendRef.current?.querySelector("button")?.click(); } else if (e.key === "Escape") { e.preventDefault(); onClose(); } }} />
          <span ref={sendRef}><GoButton className="sc-rsn-send" label="전송" busy="" go={async () => txt} done={(t) => onApply(inpK, t, true)}>{SEND}</GoButton></span>
        </div>
      ) : (
        <div className="sc-rsn-chips">{A.reasons.map((r) => <button key={r.k} type="button" className={`sc-rsn-c${r.input ? " inp" : ""}`} title={r.d} onClick={() => (r.input ? setInp(true) : onApply(r.k, "", false))}>{r.k}</button>)}</div>
      )}
    </Floating>
  );
}
function GradePop({ pop, onClose, onPick }: { pop: Extract<Pop, { k: "grade" }>; onClose: () => void; onPick: (v: string) => void }) {
  const c = pop.c, cur = gEff(c), fixed = !!gfixOf(c);
  return (
    <Floating pop={pop} onClose={onClose} className="sc-rsn rsn-grade">
      <div className="sc-rsn-q"><b>경중 교정 — AI {c.grade == null ? "미채점" : "G" + c.grade}{fixed ? " → 교정 G" + cur : ""}</b><button type="button" className="sc-rsn-x" aria-label="취소" onClick={onClose}>{XI}</button></div>
      <div className="sc-rsn-chips">
        {([[0, "0 비뉴스"], [1, "1 경미"], [2, "2 주목"], [3, "3 대형"]] as [number, string][]).map(([n, k]) => <button key={n} type="button" className="sc-rsn-c" onClick={() => onPick(String(n))}>{cur === n ? "✓ " : ""}{k}</button>)}
        {fixed ? <button type="button" className="sc-rsn-c" onClick={() => onPick("x")}>AI 원복</button> : null}
      </div>
    </Floating>
  );
}

/** 카드 한 장(원본 makeScItem) */
function Item({ c, st, col, ps, fx, mm, onAct }: {
  c: C; st: C; col: "cross" | "new" | "fail"; ps: string; fx?: Fx; mm: { on: boolean; anchor: boolean; sel: boolean; empty: boolean };
  onAct: (k: string, c: C, el?: HTMLElement, owner?: HTMLElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null), bot = useRef<HTMLDivElement>(null);
  const bt = scBadgeType(c), feedA = feedMatch(c, true), link = scLinkUrl(c);
  const catB = c.gossip ? "문화" : catBucket(articleCat({ category: c.cat, title: c.title, media: c.media }));
  const moreN = st.picked && st.pickCross != null ? Math.max(0, (c.cross || 0) - st.pickCross) : 0;
  const tm = scRelTime(scPubIso(c)) || c.time || "", gx = isBuzzLv(c), ge = gEff(c), gf = gfixOf(c);
  const hold = useHold(600, () => onAct("merge", c), false, mm.on || col === "fail");
  const [brkSent, setBrkSent] = useState(false);
  const brkHold = useHold(480, () => { if (brkSent) return; onAct("brkno", c); setBrkSent(true); setTimeout(() => setBrkSent(false), 1200); }, true);   // 「신고됨 ✓」 1.2초
  const failHold = useHold(480, () => onAct("failmenu", c, ref.current?.querySelector<HTMLElement>(".sc-fail") || undefined), true);
  useLayoutEffect(() => {   // PASS = 접혀 사라짐(원본 collapseCard)
    const el = ref.current; if (fx !== "gone" || !el) return;
    el.style.height = el.offsetHeight + "px"; el.style.overflow = "hidden"; void el.getBoundingClientRect();
    el.classList.add("removing"); Object.assign(el.style, { height: "0", marginTop: "0", marginBottom: "0", paddingTop: "0", paddingBottom: "0" });
  }, [fx]);
  const cls = ["sc-item", bt === "brk" ? "b-brk" : bt === "iss" ? "b-iss" : "", bt === "brk" ? "lit-brk" : scLit(c) ? "lit-iss" : "", st.score ? "rated" : "", ps ? "picked" : "", ps === "failed" ? "pickfail" : "", st.acked ? "acked" : "",
    feedA || link ? "sc-clickable" : "", mm.on ? (mm.anchor ? "sc-anchor" : "sc-mergeable") : "", mm.sel ? "sc-sel" : ""].filter(Boolean).join(" ");
  const open = (e: { target: EventTarget; preventDefault: () => void }) => {
    if (mm.on) return;
    if ((e.target as Element).closest("a, button, input, textarea, .sc-bot")) return;
    onAct("open", c);
  };
  const metal: ReactNode[] = [];
  if (catB) metal.push(<span key="cat" className="cat" style={{ color: CAT_COLOR[catB] }}>{catB}</span>);
  metal.push(<span key="x" className={`sc-cross${(c.cross || 0) < 2 ? " lo" : ""}${c._mergeCount ? " merged" : ""}`} title={c._mergeCount ? `병합된 기사 ${c._mergeCount}건 — 탭 = 해제` : undefined}
    onClick={c._mergeCount ? (e) => { e.stopPropagation(); if (!mm.on) onAct("unmerge", c, e.currentTarget); } : undefined}><span className="cn">{c.cross || 0}</span></span>);
  metal.push(<button key="g" type="button" className={`sc-grade${gf ? " fx" : ""}`} aria-label="경중 등급 교정" title={`AI 경중 ${c.grade == null ? "미채점" : "G" + c.grade}${gf ? " → 교정 G" + ge : ""}${gx ? " · 대세(실검 매칭) → 랭킹 GX(1.2배)" : ""} — 탭 = 교정`}
    onClick={(e) => { e.stopPropagation(); onAct("grade", c, ref.current?.querySelector<HTMLElement>(".sc-top") || undefined, ref.current || undefined); }}>G{gx ? "X" : ge == null ? "–" : ge}</button>);
  if (bt) metal.push(bt === "brk" ? <span key="b" className="sc-badge brk" title="길게 누르면 「긴급 아님」 신고" {...brkHold}>{brkSent ? "신고됨 ✓" : "긴급"}</span> : <span key="b" className="sc-badge iss">이슈</span>);
  let bottom: ReactNode;
  if (fx === "fill" || fx === "ok") bottom = <div className="sc-got nm-go" data-stage={fx} aria-label={fx === "ok" ? "보냄" : "보내는 중"}>{fx === "ok" ? <svg className="nm-go-ck" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg> : "전송"}</div>;
  else if (ps === "failed") bottom = <>
    <button type="button" className={`sc-fail${pfResubActive(candId(c)) ? " picking" : ""}`} title="탭 = 재시도(다시 분석) · 길게 = 실패 사유·내용 입력 · 제목 = 원문" {...failHold}
      onClick={(e) => { e.stopPropagation(); if (pfResubActive(candId(c))) return; onAct("retry", c); }}>{pfResubActive(candId(c)) ? <span>Picking…</span> : "Failed" + (failCount(c) >= 2 ? "(" + failCount(c) + ")" : "")}</button>
    <button type="button" className="sc-tg ack sc-failgo" aria-label="픽 취소 — 픽 하기 전으로" title="체크 = 픽 취소(픽 하기 전으로 되돌림 · PASS/PICK 다시 선택)" onClick={(e) => { e.stopPropagation(); onAct("unfail", c); }}>{CK}</button>
  </>;
  else if (ps === "settled" || (ps && !DATA_LOADED)) bottom = <button type="button" className="sc-got" aria-label="픽 완료" title="탭하면 피드에서 이 기사 열기" onClick={() => onAct("picked", c)}>PICKED</button>;
  else if (ps) bottom = <div className="sc-got picking" aria-label="분석 중"><span>Picking…</span></div>;
  else bottom = <>
    <button type="button" className="sc-tg pass" onClick={() => onAct("pass", c, bot.current || undefined, ref.current || undefined)}>PASS</button>
    <button type="button" className="sc-tg pick" onClick={() => onAct("pick", c, bot.current || undefined, ref.current || undefined)}>PICK</button>
    <button type="button" className={`sc-tg ack${st.acked ? " on" : ""}`} aria-label="확인 — 봤음 표시" title="확인 — 봤다고 표시(신규와 구분·흐려짐)" onClick={() => onAct("ack", c)}>{ACK}</button>
  </>;
  return (
    <div ref={ref} className={cls} data-cid={candId(c)} onClick={open} {...(col !== "fail" ? hold : {})}>
      <div className="sc-top"><span className="sc-metal">{metal}{moreN ? <span className="sc-plus" title="픽 후 추가 보도 매체">＋{moreN} 더</span> : null}</span><span className="sc-media">{tm}</span></div>
      <div className="sc-title"><a href={link || "#"} target="_blank" rel="noopener" onClick={(e) => { if (mm.on) { e.preventDefault(); return; } e.preventDefault(); onAct("title", c); }}>{scKoTitle(c) || c.title || "(제목 없음)"}</a></div>
      <div ref={bot} className="sc-bot triage">{bottom}</div>
      {mm.anchor ? (
        <div className="merge-tags">
          <span className="mtag mtag-base">기준</span>
          <button type="button" className={`mtag mtag-go${mm.empty ? " empty" : ""}`} aria-label="선택한 기사 병합" onClick={(e) => { e.stopPropagation(); onAct("domerge", c); }}>병합</button>
          <button type="button" className="mtag mtag-x" aria-label="병합 취소" onClick={(e) => { e.stopPropagation(); onAct("exitmerge", c); }}>{XI}</button>
        </div>
      ) : null}
    </div>
  );
}

/** 내용 직접 입력(원본 pastedlg — 막힌 매체 = 본문을 붙여 그 내용으로 재분석 · api/pick body) */
function PasteSheet({ c, onClose, onDone }: { c: C; onClose: () => void; onDone: () => void }) {
  const [t, setT] = useState(""), ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); setTimeout(() => ta.current?.focus(), 60); return () => document.removeEventListener("keydown", k); }, [onClose]);
  const send = async () => {
    if (!c || !c.url) { NOTE({ msg: "대상 정보 없음 — 메뉴를 다시 열어줘" }); throw new Error("대상 정보 없음"); }
    const text = t.trim();
    if (text.length < 30) { NOTE({ msg: "기사 전문을 붙여넣어줘 (너무 짧음)" }); throw new Error("너무 짧음"); }
    let r: Response;
    try { r = await postJ("/api/pick", pickBody(c, text)); } catch { NOTE({ msg: "전송 실패" }); throw new Error("전송 실패"); }
    const d = (await r.json().catch(() => ({}))) as C;
    if (!(r.ok && d.ok)) { const m = d.error || `서버 ${r.status}`; NOTE({ msg: m }); throw new Error(m); }
    NOTE({ msg: "재분석 시작 — 곧 Picking…으로, 완료되면 PICKED" });
    const id = candId(c); saveRating(id, { picked: true, pickedAt: Date.now() }); pfAddResub(id); markPickFailSeen();
  };
  return createPortal(
    <div className="yeta-set nm-scrap-layer nm-scrap-sheet" role="dialog" aria-label="내용 직접 입력">
      <button type="button" className="nm-scrap-veil" aria-label="닫기" onClick={onClose} />
      <div className="sc-paste">
        <div className="sc-rsn-q"><b>내용 직접 입력</b><button type="button" className="sc-rsn-x" aria-label="닫기" onClick={onClose}>{XI}</button></div>
        <div className="sc-paste-sub">{(c.title || "").slice(0, 80) || c.url || ""}</div>
        <textarea ref={ta} rows={7} value={t} onChange={(e) => setT(e.target.value)} placeholder="막힌 매체라 자동 수집이 안 됐어 — 기사 페이지에서 본문을 전체 선택·복사해 여기 붙여넣고 전송하면 그 내용으로 재분석해(403 우회)." autoCapitalize="off" autoCorrect="off" spellCheck={false} />
        <div className="sc-paste-bot"><GoButton className="ypc-go sc-paste-go" go={send} done={onDone}>재분석 보내기</GoButton></div>
      </div>
    </div>, document.body);
}

const SC_PAGE = 150;   // 칼럼마다 150장씩(바닥 600px 전 = 다음 150 · 원본 _scIO)
let foldOpen = false;   // 검증대기 펼침 = 이 접속 동안 기억(원본 scFoldOpen)

export function ScrapModal() {
  const go = useGo();
  const cq = useQuery(candQuery), nq = useQuery(newsListQuery), sq = useQuery(sideQuery), bq = useQuery(buzzQuery), fq = useQuery(fpQuery);
  const [ver, setVer] = useState(0), redraw = useCallback(() => { PASS = null; setVer((v) => v + 1); }, []);
  const [fold, setFold] = useState(foldOpen), [shown, setShown] = useState({ cross: SC_PAGE, new: SC_PAGE });
  const [merge, setMerge] = useState<{ a: string; sel: Set<string> } | null>(null), [pop, setPop] = useState<Pop | null>(null);
  const [note, setNote] = useState<Note | null>(null), [paste, setPaste] = useState<C | null>(null), [fx, setFx] = useState<Record<string, Fx>>({});
  const root = useRef<HTMLDivElement>(null), lastIn = useRef(0), anchorTop = useRef<{ cid: string; top: number } | null>(null), seenOnce = useRef(false), pruned = useRef("");
  const scroller = () => root.current?.closest(".nm-scroll") as HTMLElement | null | undefined;

  // 알림 한 줄(원본 qFlash 3초 · PICK 실패 8초 + 다시 시도/다시 로그인)
  useEffect(() => { let t = 0; NOTE = (n) => { clearTimeout(t); setNote(n); t = window.setTimeout(() => setNote(null), n.fail ? 8000 : 3200); }; return () => { clearTimeout(t); NOTE = () => {}; }; }, []);
  // 손 놓은 지 6초 + 창·입력·묶기 중 아님 = 새 목록 반영(원본 scrapAutoRefresh · 1분마다 화면이 손밑에서 바뀌지 않게) · 처음 채움은 바로
  useEffect(() => { const m = () => { lastIn.current = Date.now(); }; const evs = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"]; evs.forEach((e) => addEventListener(e, m, { passive: true, capture: true })); return () => evs.forEach((e) => removeEventListener(e, m, { capture: true })); }, []);
  const live = useMemo(() => ({ c: cq.data, n: nq.data, s: sq.data, b: bq.data, f: fq.data }), [cq.data, nq.data, sq.data, bq.data, fq.data]);
  const [rd, setRd] = useState(live);
  const busyRef = useRef(false);
  busyRef.current = !!(merge || pop || paste || (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)));
  useEffect(() => {
    if (rd === live) return;
    let t = 0;
    const take = () => {
      const incomplete = !rd.c || !rd.n || !rd.s || (!rd.c.cands.length && live.c?.cands.length);
      const wait = 6000 - (Date.now() - lastIn.current);
      if (!incomplete && (wait > 0 || busyRef.current)) { t = window.setTimeout(take, Math.max(wait, 3000)); return; }
      const sc = scroller(), top0 = sc ? sc.getBoundingClientRect().top : 0;
      const vis = [...(root.current?.querySelectorAll<HTMLElement>(".sc-cols .sc-item") || [])].find((x) => x.getBoundingClientRect().bottom > top0);
      anchorTop.current = vis ? { cid: vis.dataset.cid || "", top: vis.getBoundingClientRect().top } : null;
      PASS = null; setRd(live);
    };
    take();
    return () => clearTimeout(t);
  }, [live]);   // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {   // 보던 카드 제자리(원본 scrollBy 보정)
    const a = anchorTop.current; anchorTop.current = null; if (!a || !a.cid) return;
    const nv = [...(root.current?.querySelectorAll<HTMLElement>(".sc-cols .sc-item") || [])].find((x) => x.dataset.cid === a.cid), sc = scroller();
    if (nv && sc) { const d = nv.getBoundingClientRect().top - a.top; if (Math.abs(d) > 1) sc.scrollTop += d; }
  }, [rd]);

  const B = useMemo(() => {
    const cd = rd.c;
    CANDS = cd?.cands || []; CAND_LIVE = !!cd?.live; CAND_TS = cd?.ts || 0; CAND_MISS = cd?.miss || 0;
    DATA = (rd.n?.arts || []) as C[]; DATA_LOADED = !!rd.n;
    if (rd.s) { PEND = rd.s.pend; PFAIL = rd.s.pfail; SRV_TRI = rd.s.tri; TF_SRV = rd.s.tf; }
    TRENDS = rd.b || null; FPD = rd.f || null;
    PASS = {};
    return build(fold);
  }, [rd, ver, fold]);
  PICKING_N = B.picking;

  useEffect(() => {   // 탭 들어옴 = 지금 실패 건 본 것으로(원본 enterScrap · 한 번)
    if (seenOnce.current || !rd.c?.cands.length || !rd.n || !rd.s) return;
    seenOnce.current = true; markPickFailSeen();
  }, [rd]);
  useEffect(() => {   // 죽은 손 묶음 GC = 계정에도(원본 applyMerges prune · 어느 기기가 지워도 같은 결과)
    const k = B.pruneKeys.join("\n"); if (!k || pruned.current === k) return;
    pruned.current = k; const M = lsGet<Record<string, C>>(MERGE_KEY, {}); B.pruneKeys.forEach((a) => delete M[a]); saveMerges(M, { del: B.pruneKeys }, true); redraw();
  }, [B, redraw]);
  useEffect(() => {   // 픽 도는 중 = 25초마다 피드·실패·대기열(원본 pollPicking)
    if (!B.picking) return;
    const t = window.setInterval(() => { if (document.visibilityState !== "visible") return; nq.refetch(); sq.refetch(); }, 25_000);
    return () => clearInterval(t);
  }, [B.picking]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 묶기 = 카드 밖 탭·Esc 로 끝
    if (!merge) return;
    const click = (e: MouseEvent) => { const t = e.target as Element; if (t.closest?.(".nm-scrap .sc-item") || t.closest?.(".nm-scrap-layer")) return; setMerge(null); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMerge(null); };
    document.addEventListener("click", click); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("click", click); document.removeEventListener("keydown", key); };
  }, [merge]);
  useEffect(() => { if (merge && !CANDS.some((c) => candId(c) === merge.a)) setMerge(null); }, [B, merge]);   // 기준이 후보에서 사라짐 = 끝(원본 유령 박스 차단)

  const runFx = (id: string, after: () => void) => {   // 게이지 차오름 0.74초 → ✓ 0.44초 → 다음 그림(원본 sc-got firing → okdone)
    const red = matchMedia("(prefers-reduced-motion:reduce)").matches;
    setFx((m) => ({ ...m, [id]: "fill" }));
    setTimeout(() => { setFx((m) => (m[id] ? { ...m, [id]: "ok" } : m)); setTimeout(() => { setFx((m) => { const n = { ...m }; delete n[id]; return n; }); after(); }, red ? 60 : 440); }, red ? 90 : 740);
  };
  const openArt = (c: C) => { const a = feedMatch(c, true); if (a?.file) { go(`/news?a=${encodeURIComponent(a.file)}`); return true; } return false; };
  const openLink = (u: string) => { if (!u) return; const h = inAppHref(u); if (h) go(h); else window.open(u, "_blank", "noopener,noreferrer"); };
  const onAct = (k: string, c: C, el?: HTMLElement, owner?: HTMLElement) => {
    const id = candId(c), ps = pickState(c);
    switch (k) {
      case "merge": if (!merge) { setPop(null); setMerge({ a: id, sel: new Set() }); } return;
      case "open": if (feedMatch(c, true) || (!DATA_LOADED && ps !== "failed")) { openArt(c); return; } openLink(scLinkUrl(c)); return;
      case "title": if (feedMatch(c, true) || (!DATA_LOADED && ps !== "failed")) { if (openArt(c)) return; } openLink(scLinkUrl(c)); return;
      case "picked": openArt(c); return;
      case "pass": case "pick": case "grade":
        if (!el || !owner) return;
        if (pop && pop.k === k && candId(pop.c) === id) { setPop(null); return; }
        setPop({ k, c, el, owner } as Pop); return;
      case "ack": toggleAck(c); redraw(); return;
      case "brkno": brkNotUrgent(c); return;
      case "unmerge": if (el) setPop({ k: "unmerge", c, el }); return;
      case "retry": bumpFailRetry(c); failRetry(c, redraw); runFx(id, redraw); return;
      case "failmenu": if (el) setPop({ k: "fail", c, el }); return;
      case "unfail": cancelPickPrepick(c); redraw(); return;
      case "domerge": { if (!merge || !merge.sel.size) return; const m = doMerge(merge.a, merge.sel); setMerge(null); if (m) NOTE({ msg: m }); redraw(); return; }
      case "exitmerge": setMerge(null); return;
    }
  };
  const onCardClickCapture = (e: { target: EventTarget; preventDefault: () => void; stopPropagation: () => void }) => {   // 묶기 중 = 카드 탭이 고르기(원본 wireMerge capture)
    if (!merge) return;
    const t = e.target as Element;
    if (t.closest(".merge-tags")) return;
    const card = t.closest<HTMLElement>(".sc-item"); if (!card) return;
    e.stopPropagation(); e.preventDefault();
    const cid = card.dataset.cid || ""; if (cid === merge.a) return;
    setMerge((m) => { if (!m) return m; const sel = new Set(m.sel); if (sel.has(cid)) sel.delete(cid); else sel.add(cid); return { ...m, sel }; });
  };

  const sentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {   // 바닥 닿기 600px 전 = 다음 150장
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { for (const e of es) { if (!e.isIntersecting) continue; const key = (e.target as HTMLElement).dataset.col as "cross" | "new"; setShown((s) => ({ ...s, [key]: s[key] + SC_PAGE })); break; } }, { root: scroller() || null, rootMargin: "600px 0px" });
    Object.values(sentRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [B, shown]);

  const cd = rd.c, empty = !B.failed.length && !B.cross.length && !B.nw.length;
  const mmOf = (c: C) => ({ on: !!merge, anchor: !!merge && merge.a === candId(c), sel: !!merge && merge.sel.has(candId(c)), empty: !merge || !merge.sel.size });
  const item = (c: C, col: "cross" | "new" | "fail") => { const st = { ...(srvTriage(c) || {}), ...ratingFor(c) }; return <Item key={candId(c)} c={c} st={st} col={col} ps={pickState(c)} fx={fx[candId(c)]} mm={mmOf(c)} onAct={onAct} />; };
  const colOf = (key: "cross" | "new", arr: C[]) => {
    const lim = Math.min(shown[key], arr.length);
    return (
      <div className={`sc-col ${key === "cross" ? "green" : "black"}`}>
        <div className={`sc-coltitle ${key === "cross" ? "ct-cross" : "ct-new"}`}>{key === "cross" ? "누적" : "신규"}</div>
        <div className="sc-list" data-col={key}>
          {arr.slice(0, lim).map((c) => item(c, key))}
          {arr.length > lim ? (typeof IntersectionObserver !== "undefined" ? <div ref={(el) => { sentRefs.current[key] = el; }} data-col={key} className="sc-sentinel" aria-hidden /> : <button type="button" className="sc-more" onClick={() => setShown((s) => ({ ...s, [key]: s[key] + SC_PAGE }))}>{`더 보기 +${Math.min(SC_PAGE, arr.length - lim)}  ·  남은 ${arr.length - lim}건`}</button>) : null}
          {key === "new" && B.foldN !== 0 ? <button type="button" className="sc-more sc-fold" onClick={() => { foldOpen = !fold; setFold(!fold); }}>{B.foldN > 0 ? `검증대기 +${B.foldN}건 펼치기` : "검증대기 접기"}</button> : null}
        </div>
      </div>
    );
  };
  return (
    <Pane title="LEGACY">
      <div ref={root} className={`yeta-set mt-2 nm-scrap${merge ? " merge-mode" : ""}`} onClickCapture={onCardClickCapture}>
        {!cd ? <p className="nm-chan-msg">수집함 읽는 중…</p>
          : empty ? (cd.err && !cd.cands.length ? (
            <div className="sc-empty" role="alert">
              {cd.err === "auth" ? AUTH_TXT : cd.err === "net" ? "네트워크 오류로 수집함을 못 불러왔어" : "서버에서 수집함을 못 받아왔어"}
              <button type="button" className="ypc-go sc-retry" onClick={() => (cd.err === "auth" ? location.reload() : cq.refetch())}>{cd.err === "auth" ? "다시 로그인" : "다시 받아오기"}</button>
            </div>
          ) : null)   /* 받은 게 0건 = 조용한 공백(원본 260706) */
          : <>
            {B.failed.length ? <div className="sc-failtray"><div className="sc-failtray-list">{B.failed.map((c) => item(c, "fail"))}</div></div> : null}
            <div className="sc-cols">{colOf("cross", B.cross)}{colOf("new", B.nw)}</div>
          </>}
        <div className="ypc-acts nm-chan-acts nm-scrap-acts"><button type="button" className="ypc-go" onClick={() => go(ED_SCRAP)}>에디터에서 <Svg s={YICO.chev} /></button></div>
      </div>
      {pop && (pop.k === "pass" || pop.k === "pick") ? <ReasonPop key={candId(pop.c) + pop.k} pop={pop} onClose={() => setPop(null)} onApply={(reason, text, fromInput) => {
        const c = pop.c, act = pop.k, id = candId(c); setPop(null);
        if (fx[id]) return;   // 이미 보냄(원본 el.dataset.fired)
        applyTriage(act, c, reason, text, redraw);
        if (act === "pass") { setFx((m) => ({ ...m, [id]: "gone" })); setTimeout(() => { setFx((m) => { const n = { ...m }; delete n[id]; return n; }); redraw(); }, 440); }
        else if (fromInput) redraw(); else runFx(id, redraw);
      }} /> : null}
      {pop && pop.k === "grade" ? <GradePop key={candId(pop.c) + "g"} pop={pop} onClose={() => setPop(null)} onPick={(v) => { setPop(null); setGrade(pop.c, v); redraw(); }} /> : null}
      {pop && pop.k === "unmerge" ? (
        <Floating pop={pop} onClose={() => setPop(null)} className="unmerge-pop">
          <GoButton className="unmerge-go" busy="" label="병합 해제 실행" go={async () => true} done={() => { const c = pop.c; setPop(null); const ok = unmergeAnchor(c); redraw(); NOTE({ msg: ok ? "병합을 해제했어." : "AI가 묶은 사건이라 여기서 풀 손 묶음이 없어." }); }}>병합 해제 실행</GoButton>
        </Floating>
      ) : null}
      {pop && pop.k === "fail" ? (
        <Floating pop={pop} onClose={() => setPop(null)} className="sc-failmenu">
          <button type="button" className="sc-failmenu-it" role="menuitem" onClick={() => { const c = pop.c; setPop(null); failDownload(c); }}>{DOC}실패 사유</button>
          <button type="button" className="sc-failmenu-it" role="menuitem" onClick={() => { const c = pop.c; setPop(null); setPaste(c); }}>{PEN}내용 입력</button>
        </Floating>
      ) : null}
      {paste ? <PasteSheet c={paste} onClose={() => setPaste(null)} onDone={() => { setPaste(null); redraw(); }} /> : null}
      {note ? createPortal(
        <div className="yeta-set nm-scrap-layer"><div className={`sc-note${note.fail ? " fail" : ""}`} role="status" aria-live="polite" onClick={() => setNote(null)}>
          <span>{note.fail ? <><b>{note.msg.split(" · ")[0]}</b>{" · " + note.msg.split(" · ").slice(1).join(" · ")}</> : note.msg}</span>
          {note.login ? <button type="button" className="sc-note-act" onClick={(e) => { e.stopPropagation(); location.reload(); }}>다시 로그인</button>
            : note.retry ? <button type="button" className="sc-note-act" onClick={(e) => { e.stopPropagation(); const r = note.retry; setNote(null); r?.(); }}>다시 시도</button> : null}
        </div></div>, document.body) : null}
    </Pane>
  );
}
