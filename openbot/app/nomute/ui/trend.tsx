// 서랍 「SNS 전체」(형 11-01 「이런식으로 다 가져와주라」) — 에디터 트렌드 탭(/?tab=trend · viewer-src/37-renderSnsTrends.part · 36 loadTrends · 38 renderSns)을 앱 네이티브로
//   전엔 에디터 화면을 통째로 품었음(shell FRAME.trend) → 읽기는 앱 안 · 차례 = 원본 그대로: 왼쪽 책갈피(국내/월드 · 맨 위 · 대분류) → AI 요약(+이미 다룬 이슈) → 실시간 TOP 10(전체/플랫폼 칩 · 목록 · 넘김 카드) → 1 실시간 검색어 … 안전
//   데이터 = 원본 차례: /api/trends → /sns_trends.json · /api/trends?f=brief → /sns_brief.json · /api/trends?f=xtop · /fire_watch.json · /social_candidates.json(+ /soc_lean.json) · 5분(원본 _trFetched TTL)
//   규칙 = 원본 값 그대로(번역 ko · 3일 컷 · TOP 24h 입장·12h 신선 우대 · 구글 가점 ×10·5천 강등 · 유튜브 환산 곡선 · 플랫폼 캡 4 · 게임 배제 · 교차합의 색 · 구독 빈칸 사유 · 금융 임계·회전 · 박스오피스 1만·재개봉 컷 · 커뮤니티 🔥10 하한·전송 잔류)
//   접힘·지역 기억 = 원본과 같은 열쇠(nm_trend_gfold · nm_trend_fold · nm_trend_region · 같은 사이트라 에디터와 같이 감) · 안전 = 늘 접힘(원본 GFOLD_ALWAYS)
//   쓰기도 앱 안(형 11-10 12:40 「봄 노는 작업실 있으면 에디터도 정원에 완벽하게 녹여」 · team-4 U3 뎅): 맨 아래 「새로 수집」(/api/snsretry · ./fresh-btn.tsx) · 커뮤니티 카드 「전송」(/api/submit · 원본 socSend · 원장 nm_soc_sent 에 적음 = 에디터와 같은 열쇠) · 전엔 맨 아래 「에디터에서」 · 영상 팝업·참고 기사 팝업 = 앱 안 한 겹(#/web)이 대신 · 실검 티커(에디터 전 탭 머리 장식) 뺌
//   원본과 다른 점: AI 요약 48시간 넘으면 숨김(앱 SNS 한눈 ./sns.tsx 와 같은 줄 · 윈터 10:34) · 커뮤니티 소스 칩 = 한 줄 넘침은 흐림으로 자름(원본 = 넘친 칩 지우고 「…」)
import "./yeta-settings.css";
import "./chan.css";
import "./trend.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { outletName, useGo } from "./news-data";   // 칩 글자 = 공식 매체명(형 11-06)
import { Pane } from "./pane";
import { FreshBtn } from "./fresh-btn";
import { YICO } from "./yeta-icons";

type J = Record<string, any>;   // eslint-disable-line @typescript-eslint/no-explicit-any
const ED_TREND = "/web?u=" + encodeURIComponent("/?tab=trend&inapp=1");   // 못 읽었을 때만 에디터 한 겹(쓰기는 앱 안)
const HR = 36e5;

/* ── 받기(원본 loadTrends · loadSocial · loadSocLean) — HTML 응답(SPA 폴백) = 건너뜀 · updated 없는 응답 = 다음 길 ── */
async function getJ(urls: string[], ok: string): Promise<J | null> {
  for (const u of urls) {
    try {
      const r = await fetch(u, { credentials: "same-origin", signal: AbortSignal.timeout(12000) });
      if (!r.ok) continue;
      const t = await r.text(); if (/^\s*</.test(t)) continue;
      const j = JSON.parse(t) as J; if (!j || !j[ok]) continue;
      return j;
    } catch { /* 다음 길 */ }
  }
  return null;
}
async function getRaw(u: string): Promise<[unknown, Response] | null> {
  try {
    const r = await fetch(u, { credentials: "same-origin", signal: AbortSignal.timeout(12000) });
    if (!r.ok) return null;
    const t = await r.text(); if (/^\s*</.test(t)) return null;
    return [JSON.parse(t), r];
  } catch { return null; }
}
/** 외국어 제목·본문 = 서버가 단 ko 로(원본 260719 · 검색어류 제외 · 몇 번 해도 같음) */
const koPass = (d: J) => {
  const sb = d.subs || {};
  ([[d.youtube, "title"], [d.youtube_gl, "title"], [(d.tiktok || {}).videos, "title"], [d.shorts, "title"], [d.aivid, "title"], [d.reddit, "title"], [d.hackernews, "title"], [sb.x, "text"], [sb.tiktok, "title"], [sb.youtube, "title"], [sb.insta, "title"], [sb.threads, "text"]] as [unknown, string][])
    .forEach(([a, f]) => { if (Array.isArray(a)) a.forEach((it: J) => { if (it && it.ko) it[f] = it.ko; }); });
};
const trendQuery = queryOptions({
  queryKey: ["nomute", "trend-full"], staleTime: 300_000, refetchInterval: 300_000,
  queryFn: async () => {
    const t = Date.now();
    const [tr, br, xr, fr] = await Promise.all([
      getJ(["/api/trends", `/sns_trends.json?t=${t}`], "updated"),
      getJ(["/api/trends?f=brief", `/sns_brief.json?t=${t}`], "updated"),
      getRaw("/api/trends?f=xtop"),   // X 급상승 원본(data/x_top10/latest.json) · 없으면 수집 블록 xspike
      getRaw(`/fire_watch.json?t=${t}`),   // 화재·지진 추적 상태(재난문자 칩)
    ]);
    if (tr) koPass(tr);
    const xj = (xr?.[0] ?? null) as J | null;
    const xtop = xj && (Array.isArray(xj) || Array.isArray(xj.items) || typeof xj.generated_at === "string") ? xj : null;
    return { tr, br, xtop, fw: Array.isArray(fr?.[0]) ? (fr![0] as J[]) : [] };
  },
});
const socQuery = queryOptions({
  queryKey: ["nomute", "trend-soc"], staleTime: 300_000, refetchInterval: 300_000,
  queryFn: async () => {
    const t = Date.now();
    const [lr, sr] = await Promise.all([getRaw(`/soc_lean.json?_=${t}`), getRaw(`/social_candidates.json?_=${t}`)]);
    const lean = lr && lr[0] && typeof lr[0] === "object" && !Array.isArray(lr[0]) ? (lr[0] as Record<string, string>) : null;
    return { lean, rows: sr && Array.isArray(sr[0]) ? (sr[0] as J[]) : [], lm: sr ? Date.parse(sr[1].headers.get("last-modified") || "") || 0 : 0 };   // lm = 스캔 산출 시각(age_h 경과 보정 앵커)
  },
});

/* ── 숫자·시각(원본 정본 그대로) ── */
const relAge = (h: number) => { if (!Number.isFinite(h) || h < 0 || h >= 9000) return ""; if (h * 60 < 30) return "방금"; if (h < 1) return "30분 전"; if (h < 24) return `${Math.floor(h)}시간 전`; const d = Math.floor(h / 24); return d < 7 ? `${d}일 전` : d < 30 ? `${Math.floor(d / 7)}주일 전` : `${Math.floor(d / 30)}개월 전`; };
const qAgo = (t: number) => { if (!t) return "?"; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : relAge(m / 60); };
const vfmt = (n: number) => (n >= 1e8 ? (n / 1e8).toFixed(1) + "억" : n >= 1e4 ? (n < 1e5 ? (n / 1e4).toFixed(1).replace(/\.0$/, "") : String(Math.round(n / 1e4))) + "만" : n > 0 ? (n / 1e4).toFixed(2).replace(/0$/, "").replace(/\.0$/, "") + "만" : "");   // 전 지표 만단위
const mag = (n: number) => (n > 0 ? (n >= 1e4 ? vfmt(n) : n.toLocaleString()) : "");   // 크기 숫자 = ≥1만 만단위 · <1만 콤마
const numOf = (s: unknown) => parseInt(String(s || "").replace(/[^0-9]/g, ""), 10) || 0;
const tfmt = (s: unknown) => { const n = numOf(s); return n > 0 ? vfmt(n) + "+" : ""; };   // 구글 검색량(TOP 행)
const gTraf = (s: unknown) => { const n = numOf(s); return n > 0 ? mag(n) + "+" : ""; };   // 구글 검색량(실검 행)
const fmtK12 = (s?: string) => { s = String(s || ""); const mo = +s.slice(5, 7), dd = +s.slice(8, 10), H = +s.slice(11, 13); return mo && dd && Number.isFinite(H) ? `${mo}/${dd} ${String(H % 12 || 12).padStart(2, "0")}:${s.slice(14, 16)}${H < 12 ? "AM" : "PM"}` : ""; };   // KST ISO 문자열 그대로 읽음
const isoMs = (s?: string) => Date.parse(String(s || "").replace(/(\.\d{3})\d+/, "$1"));   // 마이크로초 6자리 = 사파리 NaN → 밀리초로
/** 발행값 → 경과 h(원본 _ageOf) · 모름 = NaN(통과) */
const ageOf = (p: unknown) => {
  if (p == null || p === "") return NaN;
  const s = String(p).trim();
  if (typeof p === "number" || /^\d{9,13}$/.test(s)) { const n = +s; return (Date.now() - (n < 1e12 ? n * 1000 : n)) / HR; }
  const h2 = (Date.now() - new Date(s).getTime()) / HR; if (Number.isFinite(h2)) return h2;
  let m: RegExpMatchArray | null;
  if (/^방금/.test(s)) return 0;
  if ((m = s.match(/(\d+)\s*분/))) return +m[1] / 60;
  if ((m = s.match(/(\d+)\s*시간/))) return +m[1];
  if ((m = s.match(/(\d+)\s*일/))) return +m[1] * 24;
  if ((m = s.match(/(\d+)\s*주/))) return +m[1] * 168;
  if ((m = s.match(/(\d+)\s*개월/))) return +m[1] * 720;
  if ((m = s.match(/(\d+)\s*년/))) return +m[1] * 8760;
  return NaN;
};
const ageVerH = (x: J) => { for (const p of [x.published, x.time, x.started, x.create_time]) { const h = ageOf(p); if (Number.isFinite(h)) return h; } return NaN; };   // 실발행 나이(first_seen 제외)
const cutH = (arr: J[] | undefined, mx: number) => (arr || []).filter((t) => { const h = ageVerH(t); return !(Number.isFinite(h) && h >= mx); });
const cut3d = (arr?: J[]) => cutH(arr, 72);   // 3일 하드컷(운영자 260721)
const relP = (p: unknown) => {
  if (p == null || p === "") return "";
  const s = String(p).trim();
  if (typeof p === "number" || /^\d{9,13}$/.test(s)) { const n = +s; return relAge((Date.now() - (n < 1e12 ? n * 1000 : n)) / HR); }
  const h2 = (Date.now() - new Date(s).getTime()) / HR; if (Number.isFinite(h2)) return relAge(h2);
  return /전$|^방금$/.test(s) ? s : "";
};
const relT = (x: J) => relP(x.published) || relP(x.time) || relP(x.started) || relP(x.first_seen);   // 시간 표기 공통(발행 ∥ 글 시각 ∥ 급상승 시작 ∥ 첫 관측)
const isFresh = (t: J) => { const h = ageVerH(t); return !(Number.isFinite(h) && h >= 12); };   // 12h 신선 · 모름 = 신선
const freshFirst = (arr: J[]) => arr.filter(isFresh).concat(arr.filter((t) => !isFresh(t)));
const fill10 = (prim: J[], ...pools: (J[] | undefined)[]) => { const out = prim.slice(0, 10), seen = new Set(out); for (const pool of pools) for (const x of pool || []) { if (out.length >= 10) return out; if (!seen.has(x)) { seen.add(x); out.push(x); } } return out; };   // 썸네일 섹션 10개 보장(후순위 채움)
const bySort = (arr: J[], f: string) => arr.slice().sort((a, b) => (+b[f] || 0) - (+a[f] || 0));
const mrg = (a: J[], b: J[] | undefined, key: (x: J) => string) => { const s = new Set(a.map(key)), o = a.slice(); (b || []).forEach((x) => { const k = key(x); if (k && !s.has(k)) { s.add(k); o.push(x); } }); return o; };
/** 같은 계정 도배 감산(원본 divRank · 쿼터 안 = 제자리 · 초과분 = 뒤로) */
const divRank = (arr: J[], slots = 10, cap = 3) => { const uniq = new Set(arr.map((t) => String(t.account || "").toLowerCase())).size, quota = Math.max(1, Math.min(cap, Math.ceil(slots / Math.max(1, uniq)))), c: Record<string, number> = {}; return arr.map((t, i) => { const a = String(t.account || "").toLowerCase(), n = (c[a] = (c[a] || 0) + 1); return { t, i, tier: Math.max(0, n - quota) }; }).sort((a, b) => a.tier - b.tier || a.i - b.i).map((o) => o.t); };

/* ── 유튜브 조회수 → 구글 검색량 환산(원본 ytEq · 핀 두 끝 · 가속 2.2 · 단조 3차 에르미트) ── */
const lg = (v: number) => Math.log10(Math.max(1, v || 0));
const ytEq = (() => {
  const PINS = [[100000, 300], [5000000, 200000]], k = 2.2;
  const X = PINS.map((a) => lg(a[0])), Y = PINS.map((a) => lg(a[1])), n = X.length;
  const S = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(t, k));
  const span = X[n - 1] - X[0], ed = span > 0 ? (Y[n - 1] - Y[0]) / span : 0;
  const U = X.map((x) => (span > 0 ? S((x - X[0]) / span) : 0));
  const d: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) { const du = U[i + 1] - U[i]; d.push(du > 0 ? (Y[i + 1] - Y[i]) / du : 0); }
  for (let i = 0; i < n; i++) m.push(i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], sq = a * a + b * b; if (sq > 9) { const tau = 3 / Math.sqrt(sq); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i]; } }
  return (v: number) => {
    const x = lg(v);
    if (x <= X[0]) return 10 ** (Y[0] + ed * (x - X[0]));
    if (x >= X[n - 1]) return 10 ** (Y[n - 1] + ed * (x - X[n - 1]));
    const u = S((x - X[0]) / span); let i = 0; while (i < n - 2 && u > U[i + 1]) i++;
    const h = U[i + 1] - U[i]; if (h <= 0) return 10 ** Y[i];
    const t = (u - U[i]) / h, t2 = t * t, t3 = t2 * t;
    return 10 ** ((2 * t3 - 3 * t2 + 1) * Y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * Y[i + 1] + (t3 - t2) * h * m[i + 1]);
  };
})();
const GG_EQ_MUL = 10, GG_MIN_T = 5000, TOP_MAX_H = 24;   // 구글 가점 ×10 · 5천 미만 = 강등(배율 같이) · TOP 24h 입장

/* ── 표지·색(원본 상수) ── */
const YT_CATS: [number, string][] = [[25, "뉴스·정치"], [24, "엔터"], [17, "스포츠"], [28, "과학기술"], [26, "노하우·스타일"], [1, "영화·애니"], [27, "교육"], [15, "반려동물"]];
const TR_PCOL: Record<string, string> = { gg: "var(--cat-eco)", yt: "var(--cat-intl)", tk: "var(--cat-soc)", ig: "var(--cat-cul)", x: "var(--cat-pol)" };
const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
const TR_LOGO: Record<string, string> = {
  gg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.7v3h4.5c-.2 1.2-1.5 3.4-4.5 3.4a5.1 5.1 0 0 1 0-10.2c1.6 0 2.6.7 3.2 1.2l2.2-2.1A8 8 0 0 0 12 3.9a8.1 8.1 0 1 0 0 16.2c4.7 0 7.8-3.3 7.8-7.9 0-.5 0-.9-.1-1.5H12z"/></svg>',
  yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26.4 26.4 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8zM10 15.2V8.8L15.5 12z"/></svg>',
  kcomm: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="9.2" r="2.1"/><path d="M1.3 17.5c0-2.2 1.6-3.7 3.7-3.7s3.7 1.5 3.7 3.7z"/><circle cx="19" cy="9.2" r="2.1"/><path d="M15.3 17.5c0-2.2 1.6-3.7 3.7-3.7s3.7 1.5 3.7 3.7z"/><circle cx="12" cy="7" r="3"/><path d="M6 18.5c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6z"/></svg>',
  pop: HEART,
  fin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16l5-5 4 3 6-7"/><path d="M15 7h5v5"/></svg>',
};
const REG_SVG = {
  kr: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0 1 18 0a4.5 4.5 0 0 1-9 0a4.5 4.5 0 0 0-9 0Z" fill="#e23b2a"/><path d="M3 12a4.5 4.5 0 0 1 9 0a4.5 4.5 0 0 0 9 0a9 9 0 0 1-18 0Z" fill="#3a6ddb"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".3" stroke-width="1"/></svg>',
  gl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.2"/><ellipse cx="12" cy="12" rx="3.5" ry="8.2"/><path d="M4.4 9.3h15.2M4.4 14.7h15.2"/></svg>',
};
const SPARK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 4.2 1.9 5.6 6 6-4.1.4-5.5 1.8-6 6-.5-4.2-1.9-5.6-6-6 4.1-.4 5.5-1.8 6-6z"/><path d="M19 12.5c.25 2 .95 2.75 3 3-2.05.25-2.75.95-3 3-.25-2-.95-2.75-3-3 2.05-.25 2.75-.95 3-3z"/></svg>';
const TRENDUP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17.5 8.5 10.5l5 5L22 6.5"/><path d="M16 6.5h6v6"/></svg>';
const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg>';
const FIRE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 11 11 11c0-2-1-4 1-9z"/><path d="M8.5 13a5.5 5.5 0 1 0 7 0c0 2-1.5 3-1.5 3s.5-3-2-5c-1 2-3 3-3 7z"/></svg>';
const LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';
const CAFE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 11.3a2 2 0 0 1-2 1.7H9a2 2 0 0 1-2-1.7L6 8z"/><path d="M4.5 8h15"/><path d="M9.2 2.8c-.6 1 .6 1.8 0 2.8M14.2 2.8c-.6 1 .6 1.8 0 2.8"/></svg>';
const BLOG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
const ARROW = { up: '<svg viewBox="0 0 24 24"><path d="M12 7l7 11H5z" fill="currentColor"/></svg>', dn: '<svg viewBox="0 0 24 24"><path d="M12 17 5 6h14z" fill="currentColor"/></svg>' };
const FIN_ICO: Record<string, string> = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", CNY: "元", AUD: "A$", CAD: "C$", CHF: "Fr", BTC: "B", ETH: "E", XRP: "X", SOL: "S", KOSPI: "코", KOSDAQ: "닥", ".IXIC": "나", ".INX": "S", "005930": "삼", "000660": "SK", "034020": "두", "012450": "한", "TSLA.O": "T", "NVDA.O": "N", "PLTR.O": "P", "SPCX.O": "X" };
const SYS_PLAT_KO: Record<string, string> = { x: "X", tiktok: "틱톡", insta: "인스타그램", youtube: "유튜브", threads: "스레드" };
const Svg = ({ s, className }: { s: string; className?: string }) => <span aria-hidden className={className} dangerouslySetInnerHTML={{ __html: s }} />;

/** 끝쪽 영문 해시태그 흐림(원본 dimTags) */
const dimTags = (s: unknown): ReactNode => { const t = String(s ?? ""); const m = t.match(/((?:#[A-Za-z0-9_]+[  ]*)+)$/); return m && m[1].trim() ? <>{t.slice(0, m.index)}<span className="tag-dim">{m[1].replace(/[  ]+$/, "")}</span></> : t; };

/* ── 구독 상태(원본 subRunState · subFailKo) ── */
const subRunState = (c: J) => { c = c || {}; if (typeof c.run_ok !== "number") return ""; const f = c.run_fail && typeof c.run_fail === "object" ? Object.keys(c.run_fail).length : 0; return f ? "fail" : c.run_ok > 0 ? "quiet" : ""; };
const subFailKo = (plat: string, codes: unknown[]) => {
  const P = SYS_PLAT_KO[plat] || plat, cs = (codes || []).map(String), pick = (f: (s: string, n: number) => boolean) => cs.find((v) => f(v, Number(v) || 0));
  let v: string | undefined;
  if ((v = pick((_, n) => n >= 500))) return `${P} 서버가 응답을 거절했어요(HTTP ${v} — ${P} 쪽 일시 장애)`;
  if (pick((_, n) => n === 429)) return `요청이 몰려 ${P}이(가) 잠시 막았어요(HTTP 429)`;
  if ((v = pick((_, n) => n === 401 || n === 403))) return `${P}이(가) 수집 서버의 접근을 막았어요(HTTP ${v})`;
  if (pick((s) => s === "err")) return `${P} 응답을 못 받았어요(연결 오류·시간 초과)`;
  if (pick((s) => s === "gone")) return `등록한 계정이 ${P}에 없어요(삭제됐거나 아이디를 바꿨어요)`;
  if (pick((s) => s === "nolist")) return "계정은 살아있는데 영상 목록이 0건으로 와요(영상을 가져오는 창구 문제)";
  return null;
};

/* ── 재난(원본 fwOf · fwChip · disCrit) ── */
const fwWide = (s: unknown) => String(s || "").replace(/(특별자치도|특별자치시|특별시|광역시|자치도|자치시).*$/, "").split(/\s+/)[0] || "";
const DIS_CRIT_KIND = /지진|해일|화재|산불|폭발|붕괴|방사능|방사성|테러|민방공|화생방|공습|경계경보|핵/;
const disCrit = (d: J) => { if (d.crit != null) return !!d.crit; const sev = Number(d.sev); if (Number.isFinite(sev) && sev > 0) return Math.floor((sev % 1000) / 10) >= 77; return DIS_CRIT_KIND.test(String(d.kind || "") + " " + String(d.title || "")); };
const fwChip = (d: J, fw: J[]): ReactNode => {
  const t = Date.parse(d.time || "") || 0; if (!t || !fw.length) return null;
  const w = fwWide(d.area), k = d.kind || "", f = fw.find((x) => x && x.kind === k && fwWide(x.area) === w && Math.abs((x.t0 || 0) * 1000 - t) <= 45 * 60e3);
  if (!f) return null;
  if (f.picked) return <span className="fw-chip on">{f.sig === "scale" ? "대형화재 · 큐 넘김" : "사상자 확인 · 큐 넘김"}</span>;
  return <span className="fw-chip">추적 중 {Math.max(0, Math.round((Date.now() - (f.t0 || 0) * 1000) / 60000))}분</span>;
};

/* ── 커뮤니티(원본 SOC_LEAN_MAP 폴백 · socPass 🔥10 · 전송 잔류 원장 nm_soc_sent 읽기만) ── */
const SOC_LEAN0: Record<string, string> = { 클리앙: "ll", 보배드림: "ll", "82쿡": "ll", 더쿠: "ll", 오유: "ll", 인스티즈: "ll", 루리웹: "ll", 뽐뿌: "ll", SLR: "l", 이토랜드: "l", 웃대: "l", 인벤: "mid", 엠팍: "r", 와이고수: "r", 에펨코리아: "rr", 디시: "rr", 일베: "rr" };
const NAVER: Record<string, [string, string, string]> = { 네이버카페: ["ico", CAFE, "카페"], 네이버블로그: ["ico", BLOG, "블로그"], 지식iN: ["", "", "지식iN"] };
const LEAN_VAL: Record<string, number> = { ll: 1, l: 3, mid: 5, r: 7, rr: 9 };
const SOC_MIN = 10, SOC_HOT10 = 24, SOC_HOT30 = 12, SOC_PIN_MS = 24 * HR;
const socKey = (r: J) => (r && (r.url || r.title)) || "";
const socPass = (r: J) => Math.round((+(r && r.burst) || 0) * 10) / 10 >= SOC_MIN;
type Sent = { ask: string; q: string; snap?: J; at?: number };
const socSent = (): Map<string, Sent> => {
  try {
    const a = JSON.parse(localStorage.getItem("nm_soc_sent") || "[]");
    if (Array.isArray(a)) return new Map(a.map((x: J | string) => (x && typeof x === "object" ? [String(x.k || ""), { ask: String(x.ask || ""), q: String(x.q || ""), ...(x.snap && x.at ? { snap: x.snap, at: +x.at || 0 } : {}) }] : [String(x || ""), { ask: "", q: "" }]) as [string, Sent]).filter(([k]) => k));
  } catch { /* 못 읽으면 빈 원장 */ }
  return new Map();
};

/** 원본 socSentAdd · socSentSave(viewer/index.html) = 같은 열쇠 · 같은 꼴(k · ask · q · snap · at) · 상한 200 · 24시간 지난 스냅샷은 버림 */
const SOC_SENT_CAP = 200;
const socSentAdd = (k: string, ask: string, snap: J | null) => {
  if (!k) return;
  const m = socSent(); m.delete(k); m.set(k, { ask: String(ask || ""), q: "", ...(snap ? { snap, at: Date.now() } : {}) });
  const now = Date.now();
  try { localStorage.setItem("nm_soc_sent", JSON.stringify([...m].slice(-SOC_SENT_CAP).map(([kk, v]) => ({ k: kk, ask: v.ask || "", q: v.q || "", ...(v.snap && v.at && now - v.at <= SOC_PIN_MS ? { snap: v.snap, at: v.at } : {}) })))); } catch { /* 이번만 */ }
};
/** 커뮤니티 카드 「전송」 = 원본 soc-send(요약 요청 · 프리셋 그대로) · 답 d.id = asks 줄(대기열 추적) */
async function socSend(r: J, lm: number) {
  const url = String(r.url || ""), title = String(r.title || "");
  const text = [title, url, String(r.desc || "")].filter(Boolean).join("\n").slice(0, 12000);
  if (!text) throw new Error("보낼 내용이 없어");
  const res = await fetch("/api/submit", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, srcUrl: url, preset: { h24: 1, fp: 0, mj: 1, og: 0, noai: 1 } }) });
  const d = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
  if (!res.ok || !d.ok) throw new Error(d.error || `서버 ${res.status}`);
  const el = lm ? Math.max(0, (Date.now() - lm) / HR) : 0;
  socSentAdd(socKey(r), d.id || "", { url, title, desc: r.desc || "", burst: +r.burst || 0, source_count: +r.source_count || 0, posts: +r.posts || 0, sources: (r.sources || []).slice(0, 14), age0: Math.round(((+r.age_h || 0) + el) * 10) / 10 });
}

/* ── 접힘 기억(원본 열쇠 그대로 · 칸이 처음 그려질 때 한 번 읽음 = 사람이 연 상태를 다시 그림이 덮지 않음) ── */
const lsObj = (k: string): Record<string, number> => { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch { return {}; } };
const lsFlip = (k: string, id: string, open: boolean) => { const st = lsObj(k); if (open) delete st[id]; else st[id] = 1; try { localStorage.setItem(k, JSON.stringify(st)); } catch { /* 이번만 */ } };

/* ── 부품(원본 sec · gsec · row · brow · card · xcard) ── */
function Sec({ id, lbl, unit, n, children }: { id: string; lbl: string; unit?: ReactNode; n: number; children: ReactNode }) {
  const [open0] = useState(() => !lsObj("nm_trend_fold")[id]);
  return (
    <details className="ts" data-sec={id} open={open0} onToggle={(e) => lsFlip("nm_trend_fold", id, (e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="ts-h"><span className="ts-l">{lbl}</span>{unit ? <span className="ts-u">{unit}</span> : null}<span className="ts-n">{n}</span></summary>
      {children}
    </details>
  );
}
const Empty = ({ t, s }: { t: ReactNode; s?: ReactNode }) => <div className="qempty">{t}{s ? <small>{s}</small> : null}</div>;
const Badge = ({ t, title, warn = true }: { t: ReactNode; title?: string; warn?: boolean }) => <span className={`tdash-time${warn ? " stale" : ""}`} title={title}>{t}</span>;
/** 순위 · 제목 · 우측 값 · 시각(원본 row) */
function Row({ i, url, t, right, x, qcls }: { i: number; url: string; t: ReactNode; right?: ReactNode; x: J; qcls?: string }) {
  return <a className="tr-row" href={url || undefined} target="_blank" rel="noopener"><span className="rk">{i + 1}</span><span className={`q${qcls ? " " + qcls : ""}`}>{t}</span><span className="tf">{right}</span><span className="tm">{relT(x)}</span></a>;
}
/** 순위 · 제목(· 우측 값)만(원본 brow) */
function BRow({ i, url, t, right, cls, rcls }: { i: number; url: string; t: ReactNode; right?: ReactNode; cls?: string; rcls?: string }) {
  return <a className="tr-row" href={url || undefined} target="_blank" rel="noopener"><span className="rk">{i + 1}</span><span className={`q${cls ? " " + cls : ""}`}>{t}</span>{right ? <span className={`tf${rcls ? " " + rcls : ""}`}>{right}</span> : null}</a>;
}
/** 커버 — 유튜브는 세로 원본(oar2) 먼저 · 가로·실패면 원래 커버 · 또 실패면 플랫폼 글자 판(원본 covImg · tcOarDown · tcCovFail · 인스타 = 공개 커버 한 번 더) */
function Cover({ src, nocls, href, className }: { src: string; nocls?: string; href?: string; className: string }) {
  const steps = useMemo(() => {
    const out: { u: string; oar?: boolean }[] = [], m = String(src || "").match(/^https:\/\/i\.ytimg\.com\/vi\/([\w-]{11})\//);
    if (m) out.push({ u: `https://i.ytimg.com/vi/${m[1]}/oar2.jpg`, oar: true });
    if (src) out.push({ u: src });
    const ig = /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/.exec(href || "");
    if (ig) out.push({ u: `https://www.instagram.com/p/${ig[1]}/media/?size=l` });
    return out;
  }, [src, href]);
  const [k, setK] = useState(0);
  useEffect(() => setK(0), [steps]);   // 같은 자리에 다른 그림이 오면 처음 길부터
  const st = steps[k];
  if (!st) return <span className={`${className} noc${nocls ? " " + nocls : ""}`} />;
  return (
    <span className={className}>
      <img loading="lazy" decoding="async" referrerPolicy="no-referrer" src={st.u} alt="" onError={() => setK((v) => v + 1)} onLoad={(e) => { if (st.oar && e.currentTarget.naturalWidth >= e.currentTarget.naturalHeight) setK((v) => v + 1); }} />
    </span>
  );
}
/** 영상 카드(원본 card · 3/4 · wd = 16:9) */
function Card({ t, i, title, nocls, metric, wd = true }: { t: J; i: number; title: ReactNode; nocls: string; metric?: ReactNode; wd?: boolean }) {
  const ago = relT(t), v = +t.views || 0;
  return (
    <a className="tcard" href={t.url || undefined} target="_blank" rel="noopener">
      <span className="tcard-cw">
        {t.cover ? <Cover className={`tcard-cov${wd ? " wd" : ""}`} src={t.cover} nocls={nocls} href={t.url} /> : <span className={`tcard-cov${wd ? " wd" : ""} noc ${nocls}`} />}
        <span className={`tcard-rank${i < 3 ? " top" : ""}`}>{i + 1}위</span>
        {t.url ? <span role="button" tabIndex={0} className="tcard-dl" aria-label="이 영상 받기 — 변환 창으로" title="받기(변환 창)"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.hash = "#/edconv?u=" + encodeURIComponent(String(t.url)); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); window.location.hash = "#/edconv?u=" + encodeURIComponent(String(t.url)); } }}>받기</span> : null}   {/* SNS 영상 받기 = 앱 안 변환 창(./conv.tsx · 원본 tvView 다운로드 = conv 길 · team-4 U3 뎅) */}
      </span>
      <span className="tcard-t">{title}</span>
      <span className="tcard-m">{metric !== undefined ? metric : v > 0 ? <i><Svg s={EYE} /><span>{vfmt(v)}</span></i> : null}{ago ? <span className={`tcard-ago${t._fresh24 ? " fresh24" : ""}`}>{ago}</span> : null}</span>
    </a>
  );
}
/** X·스레드 글 카드(원본 xcard · 본문 3줄 · t.co 뺌 · 링크 흐림 · 본문 속 유튜브 = 그 커버) */
const VID_RE = /https?:\/\/(?:www\.|m\.|vm\.|vt\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)[\w-]{6,}|youtu\.be\/[\w-]{6,}|tiktok\.com\/\S+|instagram\.com\/reel\/[\w-]+)\S*/i;
const vidCov = (s: string) => { const m = s.match(VID_RE); if (!m) return ""; const u = m[0].replace(/[),.\]]+$/, ""), yb = u.match(/youtu\.be\/([\w-]{6,})/), w = yb ? "https://www.youtube.com/watch?v=" + yb[1] : u, y = w.match(/youtube\.com\/(?:watch\?v=|shorts\/)([\w-]{6,})/); return y ? `https://i.ytimg.com/vi/${y[1]}/hqdefault.jpg` : ""; };
const xlink = (s: string): ReactNode => s.split(/(https?:\/\/[^\s]+)/g).map((p, i) => (i % 2 ? <span key={i} className="xcard-lk">{p}</span> : p));
function XCard({ t, i, name, body, nocls }: { t: J; i: number; name: string; body: ReactNode; nocls: string }) {
  const cov = t.thumb || vidCov(String(t.text || "")), ago = relT(t), v = +t.views || 0;
  return (
    <a className={`xcard${i < 3 ? " r3" : ""}`} href={t.url || undefined} target="_blank" rel="noopener">
      <span className="xcard-h"><span className={`tcard-rank${i < 3 ? " top" : ""}`}>{i + 1}위</span><b>{name}</b></span>
      <span className="xcard-tx">{body}</span>
      {cov ? <Cover className="xcard-cv" src={cov} nocls={nocls} /> : null}
      <span className="tcard-m">{v > 0 ? <i className="xcard-vw"><Svg s={TRENDUP} /><span>{v >= 1e4 ? vfmt(v) : v.toLocaleString("ko")}</span></i> : null}{ago ? <span className="tcard-ago">{ago}</span> : null}</span>
    </a>
  );
}

/* ── AI 요약 본문(원본 TOK — **굵게** · *강조색* · [글](주소) · 주소 · 짝 없는 별표 = 오탈자 표시) ── */
function BriefText({ text, refs }: { text: string; refs: J[] }) {
  const refKey = (u: string) => String(u || "").replace(/[)\].,!?"']+$/, "").replace(/\/+$/, "");
  const REF = new Set(refs.filter((r) => r && r.url).map((r) => refKey(r.url)));
  const out: ReactNode[] = []; let k = 0;
  const addText = (z: string) => {
    if (!z) return;
    if (!z.includes("*")) { out.push(z); return; }
    const A = z.split(/(\*)/), aln = (c?: string) => !!c && /[0-9A-Za-z가-힣]/.test(c);
    A.forEach((p, i) => { if (p === "*") out.push(aln((A[i - 1] || "").slice(-1)) && aln((A[i + 1] || "")[0]) ? "*" : <span key={"w" + k++} className="tb-starwarn" title="짝 없는 별표 — 오탈자 확인">*</span>); else if (p) out.push(p); });
  };
  const addLink = (label: string, url: string) => { try { const u = new URL(url); if (u.protocol !== "http:" && u.protocol !== "https:") return addText(label); out.push(<a key={"a" + k++} href={u.href} target="_blank" rel="noopener noreferrer" className={REF.has(refKey(u.href)) ? "tb-ref" : undefined}>{label}</a>); } catch { addText(label); } };
  const TOK = /(\*\*[^*\n]+\*\*)|(\*{2,})|(\*[^*\n]+\*(?!\*))|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s)]+)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = TOK.exec(text))) {
    addText(text.slice(last, m.index)); last = TOK.lastIndex;
    if (m[1]) out.push(<b key={"b" + k++} className="tb-em">{m[1].slice(2, -2)}</b>);
    else if (m[2]) { /* 안 닫힌 ** = 지움 */ }
    else if (m[3]) out.push(<b key={"c" + k++}>{m[3].slice(1, -1)}</b>);
    else if (m[4]) { const mm = m[4].match(/^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/); if (mm) addLink(mm[1], mm[2]); }
    else if (m[5]) addLink(m[5], m[5]);
  }
  addText(text.slice(last));
  return <p className="tb-t">{out}</p>;
}
function Ledger({ issues }: { issues: J[] }) {   // 이미 다룬 이슈(원본 tbrief-led · 24개까지 · 열고 닫기는 그때만)
  const [open, setOpen] = useState(false);
  const lx = issues.filter((x) => x && x.key).slice(0, 24);
  if (!lx.length) return null;
  return (
    <div className="tb-led">
      <button type="button" className="tb-led-h" aria-expanded={open} onClick={() => setOpen((v) => !v)} title="이전 브리핑에서 이미 다뤄 오늘 요약에서 뺐거나 줄인 이슈"><span>이미 다룬 이슈 <b>{lx.length}</b>건</span><Svg s={YICO.chev} /></button>
      {open ? <ul className="tb-led-l">{lx.map((x, i) => <li key={i}><span>{String(x.key).slice(0, 80)}</span><span className="m">{Math.max(1, x.n | 0)}회{x.last ? ` · ${String(x.last).slice(5, 10).replace("-", "/")}` : ""}</span></li>)}</ul> : null}
    </div>
  );
}

/* ── TOP 10 넘김 카드(원본 tstk — 큰 카드 1 + 작은 카드 3 · 좌우 · 밀기 · 6초 자동(손 뗀 지 12초 · 화면에 보일 때) · 10·15·20위 = 처음으로) ── */
type P = J & { plat: string; mono: string; url: string; t: string; rv: string; th: string; ago: string; _fresh: boolean };
function Stack({ seq, n10 }: { seq: P[]; n10: number }) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLDivElement>(null), last = useRef(0), input = useRef(0), vis = useRef(false), sw = useRef(0), tx = useRef<[number, number, number] | null>(null);
  const N = seq.length, ext = N > n10;
  const at = (k: number) => seq[((k % N) + N) % N];
  const mAt = (off: number) => (ext ? (i + off < N ? seq[i + off] : null) : at(i + off));
  const mRk = (off: number) => (ext ? i + off : (((i + off) % N) + N) % N);
  const adv = (d: number) => { last.current = Date.now(); setI((v) => (v + d >= N ? 0 : Math.max(0, v + d))); };
  useEffect(() => {
    const el = box.current; if (!el || !N) return;
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((es) => { vis.current = !!es[0]?.isIntersecting; }, { threshold: 0.05 }) : null;
    if (io) io.observe(el); else vis.current = true;
    const mark = () => { input.current = Date.now(); };
    const evs = ["scroll", "wheel", "pointerdown", "touchstart", "keydown"];
    evs.forEach((ev) => addEventListener(ev, mark, { passive: true, capture: true }));
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = still ? 0 : window.setInterval(() => {
      const dt = el.closest("details");
      if (document.hidden || !vis.current || (dt && !dt.open) || Date.now() - last.current < 12e3 || Date.now() - input.current < 8e3) return;
      setI((v) => (v + 1 >= N ? 0 : v + 1));
    }, 6000);
    return () => { io?.disconnect(); evs.forEach((ev) => removeEventListener(ev, mark, { capture: true })); if (t) clearInterval(t); };
  }, [N]);
  if (!N) return null;
  const card = (it: P | null, r: number, hero: boolean) => {
    if (!it) return <span key={"e" + r} className="tsk mini tsk-empty" aria-hidden />;
    const bd = <><span className="tpc-cat" style={{ color: TR_PCOL[it.mono] || "var(--mut)" }}>{it.plat}</span><span className={`tsk-t${hero ? "" : " one"}`}>{dimTags(it.t)}</span><span className="tpc-m"><span>{it.rv}</span>{it.ago ? <span className={`tpc-tm${it._fresh ? "" : " old"}`}>{it.ago}</span> : null}</span></>;
    return (
      <a key={r + ":" + it.url} className={`tsk ${hero ? "main mag" : "mini"}`} href={it.url} target="_blank" rel="noopener">
        <span className="tsk-cov"><Svg className="lg" s={TR_LOGO[it.mono] || ""} />{it.th ? <img loading="lazy" referrerPolicy="no-referrer" src={it.th} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}<span className={`tpc-rank${r < 3 ? " top" : ""}`}>{r + 1}</span>{hero ? <span className="mag-ov">{bd}</span> : null}</span>
        {hero ? null : <span className="tpc-bd">{bd}</span>}
      </a>
    );
  };
  const rk = i + 1;
  return (
    <div ref={box} className="tstk"
      onTouchStart={(e) => { const t0 = e.touches[0]; tx.current = (e.target as Element).closest(".tstk-nav") ? null : [t0.clientX, t0.clientY, Date.now()]; }}
      onTouchEnd={(e) => { const s = tx.current; tx.current = null; if (!s) return; const t1 = e.changedTouches[0], dx = t1.clientX - s[0], dy = t1.clientY - s[1]; if (Math.abs(dx) < 28 || Math.abs(dx) <= Math.abs(dy) * 1.2 || Date.now() - s[2] > 900) return; sw.current = Date.now(); adv(dx < 0 ? 1 : -1); }}
      onClickCapture={(e) => { if (Date.now() - sw.current < 500) { e.preventDefault(); e.stopPropagation(); } }}>
      <div className="tstk-g" key={i}>
        {card(at(i), i, true)}
        <div className="tstk-mini">{card(mAt(1), mRk(1), false)}{card(mAt(2), mRk(2), false)}{card(mAt(3), mRk(3), false)}</div>
      </div>
      {i > 0 ? <button type="button" className="tstk-nav prev" aria-label="이전" onClick={() => adv(-1)}><Svg s={YICO.chev} /></button> : null}
      <button type="button" className="tstk-nav next" aria-label="다음" onClick={() => adv(1)}><Svg s={YICO.chev} /></button>
      {rk >= 10 ? <span className="tstk-cnt">{rk}/{N}</span> : null}
      {rk % 5 === 0 && rk >= 10 ? <button type="button" className="tstk-nav rst" aria-label="처음으로" title="처음으로" onClick={() => { last.current = Date.now(); setI(0); }}><Svg s={UP} /></button> : null}
    </div>
  );
}

/** 대분류 한 장(원본 gsec — 유리 카드 · 머리 = 그림(AI 요약·TOP) 또는 순번 · 접힘 기억 nm_trend_gfold · 안전 = 늘 접힘) */
function Group({ id, ttl, pic, no, extra, hstale, children }: { id: string; ttl: ReactNode; pic?: string; no?: number; extra?: ReactNode; hstale?: boolean; children: ReactNode }) {
  const [open0] = useState(() => !(lsObj("nm_trend_gfold")[id] || id === "sf"));
  return (
    <details className="tg" id={"nmtg-" + id} data-g={id} open={open0} onToggle={(e) => lsFlip("nm_trend_gfold", id, (e.currentTarget as HTMLDetailsElement).open)}>
      <summary className={`tg-h${hstale ? " hdr-stale" : ""}`}>{pic ? <Svg className="gpic" s={pic} /> : <i>{no}</i>}<span className="ttl">{ttl}</span></summary>
      {extra ? <div className="tg-x">{extra}</div> : null}
      {children}
    </details>
  );
}

/** 금융 종목 칸 회전(원본 5초 · 가격(원) → 시가총액 → 가격($) · 화면에 보일 때만) */
function useRot(n: number, ref: RefObject<HTMLElement | null>) {
  const [st, setSt] = useState(0);
  useEffect(() => {
    if (n < 2) return;
    const t = window.setInterval(() => { const el = ref.current; if (!el || !el.offsetParent || document.visibilityState !== "visible") return; setSt((v) => (v + 1) % 3); }, 5000);
    return () => clearInterval(t);
  }, [n, ref]);
  return st;
}
/** 1분마다 다시 그림(금융 「nn분 전」 라이브 · 원본 _tu) */
function useMinute() { const [, bump] = useState(0); useEffect(() => { const t = window.setInterval(() => { if (document.visibilityState === "visible") bump((v) => v + 1); }, 60000); return () => clearInterval(t); }, []); }

/* ── 본체 ── */
export function TrendModal() {
  const go = useGo();
  const q = useQuery(trendQuery), sq = useQuery(socQuery);
  const [reg, setReg] = useState<"kr" | "gl">(() => { try { return localStorage.getItem("nm_trend_region") === "gl" ? "gl" : "kr"; } catch { return "kr"; } });   // 지역 = 국내 기본(운영자 260712)
  const [topf, setTopf] = useState("all");   // TOP 10 플랫폼 칩(원본 TR_TOPF · 세션 한정)
  const [rail, setRail] = useState("top");
  const [sentV, setSentV] = useState(0), [sending, setSending] = useState<Record<string, "send" | "err">>({});   // 커뮤니티 「전송」 · 원장 다시 읽기
  const sendSoc = async (r: J) => {
    const k = socKey(r);
    if (!k || sending[k] === "send") return;   // 보내는 중 다시 누름 = 겹쳐 쏘기 0(원본 firing 가드)
    setSending((m) => ({ ...m, [k]: "send" }));
    try { await socSend(r, sq.data?.lm || 0); setSending((m) => { const n = { ...m }; delete n[k]; return n; }); setSentV((v) => v + 1); }
    catch { setSending((m) => ({ ...m, [k]: "err" })); }
  };
  const root = useRef<HTMLDivElement>(null), body = useRef<HTMLDivElement>(null);
  useMinute();
  const d = q.data?.tr ?? null, BRIEF = q.data?.br ?? null, XTOP = q.data?.xtop ?? null, FW = q.data?.fw ?? [];

  const V = useMemo(() => {
    if (!d) return null;
    const TRREG = reg;
    const health = d.health || {}, hs = health.subs || {};
    const gt: J[] = TRREG === "kr" ? d.gtrends || [] : mrg(d.gtrends || [], d.gtrends_gl, (g) => String(g.query || "").toLowerCase());
    // 유튜브 게임 배제(운영자 260818 · 판정 = categoryId 20 · cat 없을 때만 옛 회차 게임 목록 대조)
    const gameIds = new Set(((d.youtube_cats || {})["20"] || []).map((v: J) => v && v.id).filter(Boolean));
    const ytNoGame = (arr?: J[]) => (arr || []).filter((v) => { const c = String((v && v.cat) || ""); return c ? c !== "20" : !gameIds.has(v && v.id); });
    const ytRaw = ytNoGame(TRREG === "kr" ? d.youtube || [] : mrg(d.youtube || [], d.youtube_gl, (v) => v.id).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 15)), yt = cut3d(ytRaw);
    const ytr = cut3d(ytNoGame(d.youtube_reco)), ytnRaw = ytNoGame(d.youtube_news), ytn = cut3d(ytnRaw);
    // 틱톡 = 18h · 1만↑ · 해외 ×0.2(국내 모드) · 10개
    const tkScore = (t: J) => (t.views || 0) * (t.region === "KR" ? 1 : 0.2);
    const tkvA: J[] = (d.tiktok || {}).videos || [], tkv = cutH(tkvA, 18).filter((t) => (t.views || 0) >= 1e4).sort(TRREG === "kr" ? (a, b) => tkScore(b) - tkScore(a) : (a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10), tk: J[] = (d.tiktok || {}).hashtags || [];
    const sb = d.subs || {}, stkRaw: J[] = sb.tiktok || [], sreRaw: J[] = sb.insta || [], sytRaw: J[] = sb.youtube || [];
    const sx = cutH(sb.x, 18), stk = cut3d(stkRaw), sre = cut3d(sreRaw), syt = cut3d(sytRaw), sth = cut3d(sb.threads);   // X = 18h 창 · 나머지 구독 = 3일
    const sig: J[] = d.signal || [], nmuL: J[] = (d.namu || []).slice(0, 10);
    const hnl = cut3d(d.hackernews), finc = d.finance || {}, finR: J[] = finc.rates || [], finC: J[] = finc.coins || [], finI: J[] = finc.indices || [], finS: J[] = finc.stocks || [], dsl: J[] = d.disaster || [], kob: J[] = d.kobis || [], exw: J[] = d.expressway || [];
    const empty = !gt.length && !yt.length && !ytn.length && !tkv.length && !tk.length && !sx.length && !stk.length && !sre.length && !syt.length && !(d.shorts || []).length && !(d.aivid || []).length && !sig.length && !nmuL.length && !(d.reddit || []).length && !(d.bsky || []).length && !sth.length && !hnl.length && !finR.length && !finC.length && !dsl.length && !kob.length && !exw.length;
    const stale = d.updated ? (Date.now() - new Date(d.updated).getTime()) / 60000 > 65 : false;   // 수집 65분+ 밀림

    // ── 실시간 통합 TOP 10(구글 1~10 + 유튜브 공식 섹션 합본 · 24h 입장 · 등가 점수) ──
    const pool: P[] = [], seenU = new Set<string>();
    const ggUrl = (g: J) => "https://www.google.com/search?q=" + encodeURIComponent(g.query || "");
    const lane = (plat: string, mono: string, arr: J[], n: number, f: (x: J) => J, scN?: number) => {
      const el = arr.filter((x) => { const ah = ageVerH(x); return !(Number.isFinite(ah) && ah >= TOP_MAX_H); }), L = Math.min(scN || n, el.length);
      el.slice(0, n).forEach((x, r) => { const it = f(x); if (!it.url || seenU.has(it.url)) return; seenU.add(it.url); pool.push({ plat, mono, sc: 1 - r / L, eq: mono === "gg" ? Math.max(0, it.tn || 0) * GG_EQ_MUL : ytEq(it.v), ht: Math.log10(1 + (it.v || 0)), _fresh: isFresh(x), x, ...it } as P); });
    };
    lane("구글", "gg", gt, 10, (g) => ({ url: ggUrl(g), t: g.ko || g.query || "", rv: tfmt(g.traffic), th: g.picture || "", ago: relT(g), tn: numOf(g.traffic) }), 10);
    const ytAll = (() => {
      const seen = new Set<string>(), out: J[] = [];
      const ytSub = ytNoGame((sb.youtube || []).filter((z: J) => z && typeof z === "object"));
      for (const x of [...yt, ...ytn, ...ytr, ...ytSub, ...ytNoGame(Object.values(d.youtube_cats || {}).flat().filter((z) => z && typeof z === "object") as J[])]) {
        const k = (x && (x.id || x.url)) || ""; if (!k || seen.has(k)) continue;
        const h = ageVerH(x); if (Number.isFinite(h) && h >= TOP_MAX_H) continue;
        seen.add(k); out.push(x);
      }
      return out.sort((a, b) => (+b.views || 0) - (+a.views || 0));
    })();
    lane("유튜브", "yt", ytAll, 15, (v) => { const nv = +v.views || 0; return { url: v.url || "", t: v.title || "", rv: nv ? vfmt(nv) : "", th: v.thumb || "", v: nv, ago: relT(v) }; });
    pool.forEach((p) => { if (p.mono === "gg" && (p.tn || 0) * GG_EQ_MUL < GG_MIN_T) p._pen = 1; });
    const effF = (z: J) => (z._fresh && !z._pen ? 1 : 0);
    pool.sort((a, b) => effF(b) - effF(a) || (a._pen || 0) - (b._pen || 0) || (b.eq || 0) - (a.eq || 0) || b.sc - a.sc || b.ht - a.ht);
    const top: P[] = [], pcap: Record<string, number> = {}, topOk = pool.filter((p) => !p._pen);
    for (const it of topOk) { if ((pcap[it.plat] || 0) >= 4) continue; pcap[it.plat] = (pcap[it.plat] || 0) + 1; top.push(it); if (top.length >= 10) break; }
    if (top.length < 10) for (const it of topOk) { if (top.length >= 10) break; if (!top.includes(it)) top.push(it); }
    const tfl: { k: string; lb: string; n: number }[] = [];
    pool.forEach((p) => { let z = tfl.find((y) => y.k === p.mono); if (!z) { z = { k: p.mono, lb: p.plat, n: 0 }; tfl.push(z); } z.n++; });
    const TF = topf !== "all" && tfl.some((z) => z.k === topf) ? topf : "all";
    const topShow = TF === "all" ? top : pool.filter((p) => p.mono === TF).slice(0, 10);
    const seqX = topShow.concat(TF === "all" ? pool.filter((p) => !top.includes(p)).slice(0, 20) : pool.filter((p) => p.mono === TF).slice(10, 30));

    // ── 교차합의 색(구글·시그널·나무위키 중 2곳 = 골드 · 3곳 = 하늘) ──
    const norm = (s: unknown) => String(s || "").toLowerCase().replace(/\s+/g, "");
    const nmuStale = !!(nmuL.length && !(isoMs(d.namu_updated) > Date.now() - 180 * 60000));
    const cnSig = new Set(sig.map((s) => norm(s.query)).filter(Boolean)), cnGt = new Set(gt.map((g) => norm(g.query)).filter(Boolean)), cnNm = new Set(nmuStale ? [] : nmuL.map((g) => norm(g.query)).filter(Boolean));
    const cnCls = (t: unknown) => { const n = norm(t); if (!n) return undefined; const c = (cnGt.has(n) ? 1 : 0) + (cnSig.has(n) ? 1 : 0) + (cnNm.has(n) ? 1 : 0); return c >= 3 ? "cnhot cn3" : c >= 2 ? "cnhot" : undefined; };
    const gtR = freshFirst(gt).slice(0, 10);
    const ph = health.phone, phAlive = !!(ph && isoMs(ph.updated) > Date.now() - 180 * 60000), nmWhy = (health.namu || {}).why ? " · 최근 사유: " + String(health.namu.why).slice(0, 240) : "";
    const phoneStale = !!(ph && !(isoMs(ph.updated) > Date.now() - 180 * 60000));
    // X 급상승(결 원본 → 수집 블록 · 60분 안 = 정상 · 넘으면 끊김 배지 · 예제 = 라벨)
    const xRaw = XTOP, xBlk = d.xspike && typeof d.xspike === "object" ? d.xspike : null;
    const xList: J[] | null = xRaw ? (Array.isArray(xRaw) ? xRaw : Array.isArray(xRaw.items) ? xRaw.items : null) : null;
    const xEx = !!(xRaw && !Array.isArray(xRaw) && xRaw.example === true);
    const xGen = String((xRaw && !Array.isArray(xRaw) && xRaw.generated_at) || (xList && xList[0] && xList[0].generated_at) || (xBlk && xBlk.generated_at) || "");
    const xAge = xGen ? Date.now() - Date.parse(xGen) : Infinity, xFresh = Number.isFinite(xAge) && xAge >= -10 * 60e3 && xAge <= 60 * 60e3;
    const xNorm = (arr?: J[] | null) => (arr || []).filter((it) => it && typeof it.keyword === "string" && it.keyword.trim()).slice().sort((a, b) => (+a.rank || 99) - (+b.rank || 99)).slice(0, 10);
    let xState = "empty", xRows: J[] = [];
    if (xList && !xEx && xFresh) { xState = "ok"; xRows = xNorm(xList); }
    else if (xBlk && Array.isArray(xBlk.items) && xBlk.items.length && xFresh && !xEx) { xState = "ok"; xRows = xNorm(xBlk.items); }
    else if (xList && xEx && xList.length) { xState = "example"; xRows = xNorm(xList); }
    else if (xGen) { xState = "stale"; xRows = xNorm(xList || (xBlk && xBlk.items)); }
    const xK = (() => { const t = Date.parse(xGen); return Number.isFinite(t) ? fmtK12(new Date(t + 9 * HR).toISOString()) : ""; })();

    // ── 카드 목록들 ──
    const ytGrid = bySort(cutH(ytRaw, 24), "views").slice(0, 10).map((v) => ({ ...v, cover: v.thumb }));   // 유튜브 인기 = 24h · 조회수순
    const ytcL = YT_CATS.map(([id, nm]) => [id, nm, bySort(cutH((d.youtube_cats || {})[String(id)] || [], 72), "views").slice(0, 10).map((v) => ({ ...v, cover: v.thumb }))] as [number, string, J[]]).filter((z) => z[2].length);   // 주제별 = 72h · 10개
    const ytnL = fill10(freshFirst(ytn), ytnRaw).map((v) => ({ ...v, cover: String(v.thumb || "") }));
    const all10 = (cutA: J[], rawA: J[], sf: string) => fill10(bySort(cutA, sf), bySort(rawA, sf));
    const stkAll = all10(stk, stkRaw, "views"), sreAll = all10(sre, sreRaw, "views"), sytAll = all10(syt, sytRaw, "views").map((v) => ({ ...v, cover: String(v.thumb || "") }));
    const tkCov = tkvA.some((t) => t.cover), tkL = tkCov ? tkv.map((t) => { const h = ageVerH(t); return { ...t, _fresh24: Number.isFinite(h) && h < 24 }; }) : [];
    const sxAll = bySort(sx, "views").slice(0, 10), sthAll = divRank(bySort(sth, "likes")).slice(0, 10);
    const hnL = hnl.slice(0, 8);
    const boOld = (p: J) => { const t = Date.parse(p.open || ""); return t > 0 && Date.now() - t > 365 * 864e5; };   // 재개봉 컷
    const kobL = kob.filter((p) => (p.audi || 0) >= 1e4 && !boOld(p)).sort((a, b) => (b.audi || 0) - (a.audi || 0)).slice(0, 8);
    const subStale = new Set<string>(hs.stale || []), subOff = new Set<string>(hs.off || []), subPaused = new Set<string>(hs.paused || []);
    return { gt, gtR, ggUrl, cnCls, sig, nmuL, nmuStale, phAlive, nmWhy, phoneStale, xState, xRows, xK, ytGrid, ytcL, ytnL, sytAll, tkL, tkv, tk, stkAll, sreAll, sxAll, sthAll, hnL, kobL, finR, finC, finI, finS, dsl, exw, top, pool, tfl, TF, topShow, seqX, stale, empty, hs, subStale, subOff, subPaused, health };
  }, [d, XTOP, reg, topf]);

  // 커뮤니티(원본 renderSns — 🔥 하한 · 전송분 24h 잔류(스냅샷) · 🔥 내림차순 · 나이 = 스냅샷 + 파일 경과)
  const soc = useMemo(() => {
    if (!sq.data) return null;
    const lean = { ...(sq.data.lean || SOC_LEAN0) }, SOCIAL = sq.data.rows, lm = sq.data.lm, sent = socSent();
    const pinned = (k: string) => { const v = sent.get(k); return !!(v && v.at && Date.now() - v.at <= SOC_PIN_MS); };
    const live = new Set(SOCIAL.map(socKey)), ghosts: J[] = [];
    for (const [k, v] of sent) if (v.snap && !live.has(k) && pinned(k)) ghosts.push({ ...v.snap, _pinAge: (+v.snap.age0 || 0) + (Date.now() - (v.at || 0)) / HR });
    const rows = SOCIAL.filter((r) => socPass(r) || pinned(socKey(r))).concat(ghosts).sort((a, b) => (+b.burst || 0) - (+a.burst || 0));
    return { rows, lean, el: lm ? Math.max(0, (Date.now() - lm) / HR) : 0, sent };
  }, [sq.data, sentV]);

  const finRows = useRef<HTMLDivElement>(null);
  const finSt = useRot(V?.finS.length || 0, finRows);

  // 왼쪽 책갈피 점등 = 지금 보이는 대분류(원본 IO · rootMargin 그대로)
  useEffect(() => {
    const sc = root.current?.closest(".nm-scroll") as HTMLElement | null;
    if (!sc || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { const v = es.filter((x) => x.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (v) { const g = (v.target.id || "").replace("nmtg-", ""); setRail(g === "brief" ? "top" : g); } }, { root: sc, rootMargin: "-12% 0px -58% 0px" });
    body.current?.querySelectorAll(".tg").forEach((g) => io.observe(g));
    return () => io.disconnect();
  }, [V, soc]);

  const pickReg = (r: "kr" | "gl") => { if (r === reg) return; try { localStorage.setItem("nm_trend_region", r); } catch { /* 이번만 */ } setReg(r); };
  const jump = (g: string) => {
    const sc = root.current?.closest(".nm-scroll") as HTMLElement | null, smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (g === "top") { sc?.scrollTo({ top: 0, behavior: smooth as ScrollBehavior }); return; }
    const el = document.getElementById("nmtg-" + g) as HTMLDetailsElement | null;
    if (el) { if (!el.open) el.open = true; el.scrollIntoView({ behavior: smooth as ScrollBehavior, block: "start" }); }
  };

  if (q.isPending) return <Pane title="SNS 전체"><div ref={root} /><div className="yeta-set mt-2"><p className="nm-chan-msg nm-trend-msg">트렌드 읽는 중…</p></div></Pane>;
  if (!d || !V) return <Pane title="SNS 전체"><div ref={root} /><div className="yeta-set mt-2"><p className="nm-chan-msg nm-trend-msg" role="alert">SNS 트렌드를 못 읽었어</p><div className="ypc-acts nm-chan-acts nm-trend-acts"><button type="button" className="ypc-go" onClick={() => go(ED_TREND)}>에디터에서 <Svg s={YICO.chev} /></button></div></div></Pane>;

  const { hs } = V;
  /* 구독 칸 사유(원본 subEmptySec · subStaleUnit · subPausedSec — 등록 0 = 비움 · 등록 있음 ∧ 이번 0건 = 까닭 · 꺼짐 = 꺼짐) */
  const cover = (plat: string): J => ((hs.cover || {})[plat]) || {};
  const subEmpty = (key: string, lbl: string, plat: string) => {
    const xa = hs.xauth || "off";
    if (plat === "x" && xa !== "err" && ((cover("x").reg || 0) > 0 || V.subStale.has("x")))
      return <Sec key={key} id={key} lbl={lbl} n={0}><Empty t={xa === "ok" ? "18시간 안에 올라온 글이 없어요" : xa === "fail" ? "X 로그인 쿠키가 거절됐어요" : "18시간 안 새 글을 못 받았어요"} s={xa === "fail" ? "만료·로그아웃 — 가계정 쿠키를 새로 뽑아 저장소 시크릿 X_SUBS_AUTH_TOKEN·X_SUBS_CT0를 갈아 주세요" : undefined} /></Sec>;   // 빈 칸 밑 안내 줄 뺌(형 11-02 08:1x 「옆에 설명글은 빼줘」 · 큰 줄만)
    if (!V.subStale.has(plat)) return <Sec key={key} id={key} lbl={lbl} n={0}><Empty t="구독 비움 상태" /></Sec>;
    const PH = plat === "insta" || plat === "threads", why0 = Object.values(cover(plat).why || {}).map(String).filter((v) => v !== "rotate" && v !== "budget");
    const waiting = !why0.length || why0.filter((v) => v === "cooldown" || v === "gap" || v === "429").length * 2 > why0.length;
    const rs = subRunState(cover(plat)), fk = rs === "fail" ? subFailKo(plat, Object.values(cover(plat).run_fail || {})) : null, ph = V.health.phone;
    const why = PH && ph && ph.ok === false ? "폰 수집기가 멈춰서 못 걷고 있어요" : PH ? (waiting ? "차례를 기다리는 중이에요 — 자동으로 다시 걷혀요" : "지금은 막혀서 못 걷고 있어요") : rs === "quiet" ? "조회는 정상인데 새로 올라온 글이 없어요" : fk ? fk + " — 자동으로 다시 시도해요" : "이번 수집에서 0건이에요 — 자동으로 다시 시도해요";
    return <Sec key={key} id={key} lbl={lbl} n={0}><Empty t={why} /></Sec>;
  };
  const subUnit = (plat: string, arr: J[]): ReactNode => {
    if (!V.subStale.has(plat)) return null;
    const cv = cover(plat), rs = subRunState(cv); if (rs === "quiet") return null;
    const at = arr.map((t) => String(t.first_seen || "")).filter(Boolean).sort().pop() || "", k = at ? fmtK12(at) : "";
    if (rs === "fail") { const fk = subFailKo(plat, Object.values(cv.run_fail || {})); return <Badge t="조회 실패" title={`${fk || "조회 실패"} — 새 글이 없어서가 아니라 이번 수집에서 조회가 실패했다. 지금 보이는 건 ${k ? k + " " : "이전 "}수집분이다`} />; }
    return <Badge t={`${k ? k + " 이후 " : ""}새 글 0건`} title="등록 계정은 있는데 이번 수집에서 새 글이 0건 — 지금 보이는 건 이전 수집분이다" />;
  };
  const paused = (key: string, lbl: string) => <Sec key={key} id={key} lbl={lbl} n={0}><Empty t="꺼짐" s="부계정 보호로 이 구독은 지금 안 받아요" /></Sec>;
  const grid = (arr: J[], nocls: string, title: (t: J) => ReactNode = (t) => t.title || "") => <div className="tr-grid">{arr.map((t, i) => <Card key={(t.id || t.url || "") + i} t={t} i={i} nocls={nocls} title={title(t)} />)}</div>;

  /* ── 대분류 본문 ── */
  // 1 실시간 검색어 = 구글|시그널 · 나무위키|X 급상승 · 블루스카이
  const gtSec = V.gt.length ? <Sec id="gt" lbl="구글 실시간 검색어" n={Math.min(V.gt.length, 10)}>{V.gtR.map((g, i) => <BRow key={i} i={i} url={V.ggUrl(g)} t={g.ko || g.query || ""} right={gTraf(g.traffic)} cls={V.cnCls(g.query)} />)}</Sec> : null;
  const sigSec = V.sig.length ? <Sec id="sig" lbl="시그널 실시간 검색어" n={Math.min(V.sig.length, 10)}>{V.sig.slice(0, 10).map((g, i) => <BRow key={i} i={i} url={V.ggUrl(g)} t={g.ko || g.query || ""} cls={V.cnCls(g.query)} />)}</Sec> : null;
  const nmuSec = V.nmuL.length ? <Sec id="nmu" lbl="나무위키 실시간 검색어" n={V.nmuL.length} unit={!V.nmuStale ? null : V.phAlive ? <Badge t="나무위키 응답 없음" title={"폰 수집기는 정상인데 나무위키 순위가 3시간+ 안 들어왔다(러너 폴백도 실패) — 나무위키 쪽 응답 차단·형식 변경 의심" + V.nmWhy} /> : <Badge t="폰 점검 필요" title={"폰 수집기가 3시간+ 멈춤 — 나무위키 순위가 오래됐다(공급원 = 폰 · 러너 폴백도 실패)" + V.nmWhy} />}>{V.nmuL.map((g, i) => <BRow key={i} i={i} url={"https://namu.wiki/Search?q=" + encodeURIComponent(g.query || "")} t={g.query || ""} cls={V.nmuStale ? undefined : V.cnCls(g.query)} />)}</Sec> : null;
  const xMul = (it: J) => { const s = +it.spike; if (Number.isFinite(s) && s > 0) return (s >= 10 ? String(Math.round(s)) : String(Math.round(s * 10) / 10)) + "배"; const p = +it.posts_1h; return Number.isFinite(p) && p > 0 ? Math.round(p).toLocaleString("ko-KR") + "건" : ""; };
  const xUrl = (it: J) => { const u = String(it.source_url || ""); return /^https:\/\/(x|twitter)\.com\//.test(u) ? u : "https://x.com/search?q=" + encodeURIComponent(String(it.keyword || "").replace(/^#/, "")); };
  const xUnit = V.xState === "stale" ? <Badge t={`${V.xK ? V.xK + " 이후 " : ""}수집 끊김`} title="X 급상승 수집이 60분 넘게 끊겼다 — 지금 보이는 건 마지막 수집분이다(30분마다 자동 갱신)" /> : V.xState === "empty" ? <Badge t="데이터 없음" /> : <>{V.xState === "example" ? "예제" : ""}{V.xK ? <Badge warn={false} t={V.xK + " 수집"} /> : null}</>;
  const xspSec = <Sec id="xsp" lbl="X 급상승" unit={xUnit} n={V.xRows.length}>{V.xRows.length ? V.xRows.map((it, i) => <BRow key={i} i={i} url={xUrl(it)} t={String(it.keyword || "")} right={xMul(it)} />) : <Empty t="아직 들어온 급상승이 없어요" />}</Sec>;
  const btrL: J[] = (d.bsky_trends || []).slice(0, 10);
  const btrSec = btrL.length ? <Sec id="btr" lbl="블루스카이 실시간 트렌드" n={btrL.length}>{btrL.map((g, i) => <Row key={i} i={i} url={"https://bsky.app/search?q=" + encodeURIComponent(g.query || "")} t={g.ko || g.query || ""} right={mag(g.posts)} x={g} />)}</Sec> : null;
  const pair = (a: ReactNode, b: ReactNode, k: string) => (a && b ? <div className="rt2" key={k}>{a}{b}</div> : <>{a}{b}</>);
  const gGG = <>{pair(gtSec, sigSec, "a")}{nmuSec ? <div className="rt2">{nmuSec}{xspSec}</div> : xspSec}{btrSec}</>;

  // 2 국내 커뮤니티(소셜 전무 확정 = 그룹 없음 · 읽는 중 = 그룹은 섬)
  const showKC = !soc || soc.rows.length > 0;
  const gKC = !soc ? <p className="nm-chan-msg">커뮤니티 읽는 중…</p> : (
    <div className="kc">{soc.rows.map((r, i) => {
      const ago = relAge(r._pinAge != null ? +r._pinAge : (+r.age_h || 0) + soc.el), b = +r.burst || 0, bt = b >= SOC_HOT10 ? " hot10" : b >= SOC_HOT30 ? " hot30" : "";
      const plat: Record<string, number> = {};
      (r.sources || []).forEach((s: string) => { const k0 = soc.lean[s], v = k0 ? LEAN_VAL[k0] : NAVER[s] ? LEAN_VAL.mid : null; if (v == null) return; plat[NAVER[s] ? "네이버" : s] = v; });
      const pv = Object.values(plat), mid = pv.length ? pv.reduce((a, c) => a + c, 0) / pv.length : null;
      const zone = mid == null ? "" : mid <= 2 ? "강진보" : mid <= 4 ? "약진보" : mid <= 6 ? "중립" : mid <= 8 ? "약보수" : "강보수";
      const st = soc.sent.get(socKey(r));
      return (
        <a key={socKey(r) + i} className="soc" href={r.url || undefined} target="_blank" rel="noopener">
          <span className="soc-top"><span className={`soc-burst${bt}`}><Svg s={FIRE} /> {b.toFixed(1)}</span><span className="soc-src"><Svg s={LINK} /> {r.source_count || 0}소스</span><span className="soc-posts">{r.posts > r.source_count ? `글 ${r.posts}` : ""}</span><span className="soc-age">{ago}</span>{st ? <span className="soc-pk" title={st.q ? "뉴스 요약 완료" : "뉴스 요약 대기열에 올라감 — 분석 중"}>{st.q ? "Pk-ed" : "Pk-ng"}</span> : (
            <span
              role="button" tabIndex={0} className={`soc-send${sending[socKey(r)] === "send" ? " firing" : sending[socKey(r)] === "err" ? " err" : ""}`} aria-label="뉴스 요약 요청으로 보내기"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); void sendSoc(r); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); void sendSoc(r); } }}
            >{sending[socKey(r)] === "send" ? "보내는 중…" : sending[socKey(r)] === "err" ? "못 보냄 · 다시" : "전송"}</span>
          )}</span>
          <span className="soc-title">{r.title || ""}</span>
          <span className="soc-srcs">{(r.sources || []).map((s: string) => { const k0 = soc.lean[s] || (NAVER[s] ? "mid" : ""), nv = NAVER[s]; return <span key={s} className={`soc-chip${k0 ? " lean-" + k0 : ""}${nv ? " naver" + (nv[0] ? " ico" : "") : ""}`}>{nv ? <>{nv[1] ? <Svg s={nv[1]} /> : null}{nv[2]}</> : outletName(s)}</span>; })}</span>
          {mid != null ? <span className="soc-gauge" role="img" aria-label={`출처성향 ${zone}`} title={`출처성향: ${zone} (커뮤 통념근사)`}><span className="soc-dot" style={{ left: `${(((mid - 1) / 8) * 100).toFixed(1)}%` }} /></span> : null}
        </a>
      );
    })}</div>
  );

  // 3 인기 게시물 = 유튜브(24h · 조회수순)
  const gPOP = V.ytGrid.length ? <Sec id="yt" lbl="유튜브" n={V.ytGrid.length}>{grid(V.ytGrid, "ytfb")}</Sec> : null;

  // 4 큐레이션 게시물 = 유튜브 주제별 → (폴백 뉴스) → 유튜브 구독 → 틱톡 추천 → 틱톡 구독 → 인스타 구독 → X 구독 → 스레드 구독
  const cur: ReactNode[] = [];
  V.ytcL.forEach(([id, nm, arr]) => cur.push(<Sec key={"ytc" + id} id={"ytc-" + id} lbl={"유튜브 - " + nm} n={arr.length}>{grid(arr, "ytfb")}</Sec>));
  if (!V.ytcL.length && V.ytnL.length) cur.push(<Sec key="ytn" id="ytn" lbl="유튜브 - 뉴스" n={V.ytnL.length}>{grid(V.ytnL, "ytfb")}</Sec>);
  if (!V.subOff.has("youtube")) cur.push(V.sytAll.length ? <Sec key="syt" id="syt" lbl="유튜브 - 구독" unit={subUnit("youtube", V.sytAll)} n={V.sytAll.length}>{grid(V.sytAll, "ytfb")}</Sec> : subEmpty("syt", "유튜브 - 구독", "youtube"));
  if (V.tkL.length) cur.push(<Sec key="tk" id="tk" lbl="틱톡 - 추천" n={V.tkL.length}>{grid(V.tkL, "tkfb", (t) => dimTags(t.ko || t.title || "@" + (t.account || "")))}</Sec>);
  else if (V.tkv.length) cur.push(<Sec key="tk" id="tk" lbl="틱톡 - 추천" n={V.tkv.length}>{V.tkv.map((t, i) => <Row key={i} i={i} url={t.url || ""} t={t.ko || t.title || "@" + (t.account || "")} right={t.views ? vfmt(t.views) : ""} x={t} />)}</Sec>);
  else if (V.tk.length) cur.push(<Sec key="tk" id="tk" lbl="틱톡 - 해시태그" unit="· 인기" n={Math.min(V.tk.length, 10)}><div className="tr-tags">{V.tk.slice(0, 10).map((x, i) => <span key={i} className="tr-tag">#{x.tag || ""}</span>)}</div></Sec>);
  if (!V.subOff.has("tiktok")) cur.push(V.stkAll.length ? <Sec key="stk" id="stk" lbl="틱톡 - 구독" unit={subUnit("tiktok", V.stkAll)} n={V.stkAll.length}>{grid(V.stkAll, "tkfb", (t) => t.ko || t.title || "@" + (t.account || ""))}</Sec> : subEmpty("stk", "틱톡 - 구독", "tiktok"));
  if (!V.subOff.has("insta")) cur.push(V.subPaused.has("insta") ? paused("sre", "인스타그램 - 구독") : V.sreAll.length ? <Sec key="sre" id="sre" lbl="인스타그램 - 구독" unit={subUnit("insta", V.sreAll)} n={V.sreAll.length}>{grid(V.sreAll, "igfb", (t) => t.ko || t.title || "@" + (t.account || ""))}</Sec> : subEmpty("sre", "인스타그램 - 구독", "insta"));
  const xtco = (s: string) => s.replace(/\s*https?:\/\/t\.co\/\w+/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (!V.subOff.has("x")) cur.push(V.sxAll.length ? <Sec key="sx" id="sx" lbl="X - 구독" unit={subUnit("x", V.sxAll)} n={V.sxAll.length}><div className="xgrid">{V.sxAll.map((t, i) => <XCard key={(t.url || "") + i} t={t} i={i} nocls="xfb" name={t.name || "@" + (t.account || "")} body={t.text ? xlink(xtco(String(t.text))) : t.sum || ""} />)}</div></Sec> : subEmpty("sx", "X - 구독", "x"));
  if (!V.subOff.has("threads")) cur.push(V.subPaused.has("threads") ? paused("sth", "스레드 - 구독") : V.sthAll.length ? <Sec key="sth" id="sth" lbl="스레드 - 구독" unit={subUnit("threads", V.sthAll)} n={V.sthAll.length}><div className="xgrid">{V.sthAll.map((t, i) => <XCard key={(t.url || "") + i} t={t} i={i} nocls="thfb" name={"@" + (t.account || "")} body={t.text ? xlink(String(t.text)) : t.sum || ""} />)}</div></Sec> : subEmpty("sth", "스레드 - 구독", "threads"));

  // 5 금융 = 증시|암호화폐 · 환율|종목(임계 넘으면 골드 · 종목 5초 회전)
  const finChg = (c: unknown) => (typeof c !== "number" ? null : <span className={`fin-chg${c > 0 ? " up" : c < 0 ? " dn" : ""}`}><Svg className="fin-ar" s={c > 0 ? ARROW.up : c < 0 ? ARROW.dn : ""} /><span className="fin-pct">{c > 0 ? "+" : ""}{c}%</span></span>);
  const hot = (c: unknown, th: number) => (typeof c === "number" && Math.abs(c) >= th ? " fin-hot" : "");
  const fxKrw = (x: J) => (x.code === "JPY" ? x.krw * 100 : x.krw);
  const fxHasChg = V.finR.some((x) => typeof x.chg === "number");
  const finUsd = (V.finR.find((x) => x.code === "USD") || {}).krw || 1490;
  const stkVal = (x: J) => { const v = typeof x.val === "number" ? x.val : 0; return <>{Math.round(x.cur === "USD" ? v * finUsd : v).toLocaleString()}<i>원</i></>; };
  const capKrw = (x: J) => {
    const s = String(x.cap || ""), usd = /USD\s*$/.test(s) || x.cur === "USD";
    const jo = +((s.match(/([\d,.]+)\s*조/) || [])[1] || "0").replace(/,/g, ""), eok = +((s.match(/([\d,.]+)\s*억/) || [])[1] || "0").replace(/,/g, "");
    if (!jo && !eok) return null;
    let e = jo * 10000 + eok; if (usd) e *= finUsd;
    const t = Math.round(e / 1000) / 10, g = Math.floor(t / 10000);
    return g ? g.toLocaleString() + "경 " + (t - g * 10000).toFixed(1).padStart(6, "0") + "조" : t.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "조";
  };
  const stCell = (x: J, st: number) => {
    if (st === 1) { const k = x.cap ? capKrw(x) : null; return k ? <>{k}<i>원</i></> : x.cap ? (x.cur === "USD" ? <>{String(x.cap).replace(/\s*USD$/, "")}<i>$</i></> : <>{x.cap}<i>원</i></>) : stkVal(x); }
    if (st === 2) { const u = x.cur === "USD" ? x.val : (x.val || 0) / finUsd; return <>{(+u || 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<i>$</i></>; }
    return stkVal(x);
  };
  const finRow = (k: string, x: J, nm: string, v: ReactNode, chg: ReactNode, cls: string) => <div key={k} className={`fin-row${cls}`}><span className="fin-ico">{FIN_ICO[x.code] || ""}</span><span className="fin-nm">{nm}</span><span className="fin-v">{v}</span>{chg}</div>;
  const finSecs = [
    V.finI.length ? <Sec key="idx" id="fin-idx" lbl="증시" n={V.finI.length}><div className="fin-rows">{V.finI.map((x, i) => finRow("i" + i, x, x.name || x.code, <>{(typeof x.val === "number" ? x.val : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<i>pt</i></>, finChg(x.chg), hot(x.chg, x.code === "KOSPI" || x.code === "KOSDAQ" ? 5 : 3)))}</div></Sec> : null,
    V.finC.length ? <Sec key="cc" id="fin-cc" lbl="암호화폐" n={V.finC.length}><div className="fin-rows">{V.finC.map((c, i) => finRow("c" + i, c, c.code, <>{Math.round(c.krw).toLocaleString()}<i>원</i></>, finChg(c.chg), hot(c.chg, 5)))}</div></Sec> : null,
    V.finR.length ? <Sec key="fx" id="fin-fx" lbl="환율" n={V.finR.length}><div className="fin-rows">{V.finR.map((x, i) => finRow("r" + i, x, (x.name || x.code) + (x.code === "JPY" ? "(100)" : ""), <>{fxKrw(x) >= 100 ? Math.round(fxKrw(x)).toLocaleString() : fxKrw(x)}<i>원</i></>, fxHasChg ? finChg(x.chg) : null, hot(x.chg, 1)))}</div></Sec> : null,
    V.finS.length ? <Sec key="stk" id="fin-stk" lbl="종목" unit={<span className="fin-rot-st">{["가격 (원)", "시가총액", "가격 ($)"][V.finS.length > 1 ? finSt : 0]}</span>} n={V.finS.length}><div className="fin-rows" ref={finRows}>{V.finS.map((x, i) => finRow("s" + i, x, x.name || x.code, stCell(x, V.finS.length > 1 ? finSt : 0), finChg(x.chg), hot(x.chg, 8)))}</div></Sec> : null,
  ].filter(Boolean);
  const gFI = finSecs.length > 1 ? <div className="fin-split">{finSecs}</div> : finSecs[0] || null;
  const finHotAny = [...V.finI.map((x) => [x.chg, x.code === "KOSPI" || x.code === "KOSDAQ" ? 5 : 3]), ...V.finC.map((x) => [x.chg, 5]), ...V.finR.map((x) => [x.chg, 1]), ...V.finS.map((x) => [x.chg, 8])].some(([c, th]) => typeof c === "number" && Math.abs(c) >= th);
  const finUt = d.updated ? new Date(d.updated).getTime() : 0;

  // 6 기타 = 해커뉴스 | 박스오피스
  const gHN = V.hnL.length ? <Sec id="hn" lbl="해커뉴스" n={V.hnL.length}>{V.hnL.map((p, i) => <BRow key={i} i={i} url={p.url || p.hn || ""} t={p.title || ""} />)}</Sec> : null;
  const gMV = V.kobL.length ? <Sec id="kob" lbl="박스오피스" n={V.kobL.length}>{V.kobL.map((p, i) => <BRow key={i} i={i} url={p.url || ""} t={p.title || ""} right={p.audi ? vfmt(p.audi) + "명" : ""} cls={i < 3 ? "top3" : ""} rcls={i < 3 ? (p.audi >= 1e7 ? "bo-t" : p.audi >= 3e6 ? "bo-y" : "bo-w") : ""} />)}</Sec> : null;
  const gETC = gHN || gMV ? pair(gHN, gMV, "etc") : null;

  // 7 안전 = 재난문자(지진·화재급 골드 · 추적 칩 · 지역) · 고속도로 돌발
  const gSF = V.dsl.length || V.exw.length ? <>
    {V.dsl.length ? <Sec id="dis" lbl="재난문자" unit="· 안전" n={Math.min(V.dsl.length, 10)}>{V.dsl.slice(0, 10).map((p, i) => <Row key={i} i={i} url={p.url || ""} t={p.title || ""} right={<>{fwChip(p, FW)}<span className="dis-area">{p.area || ""}</span></>} x={p} qcls={disCrit(p) ? "dis-crit" : ""} />)}</Sec> : null}
    {V.exw.length ? <Sec id="exw" lbl="고속도로 돌발" unit="· 사고" n={Math.min(V.exw.length, 10)}>{V.exw.slice(0, 10).map((p, i) => <Row key={i} i={i} url={p.url || ""} t={p.title || ""} right={p.route || ""} x={p} />)}</Sec> : null}
  </> : null;

  const GRPS: [string, string, ReactNode][] = ([["gg", "실시간 검색어", gGG], ["kcomm", "국내 커뮤니티", showKC ? gKC : null], ["pop", "인기 게시물", gPOP], ["cur", "큐레이션 게시물", cur.length ? <>{cur}</> : null], ["fin", "금융", gFI], ["etc", "기타", gETC], ["sf", "안전", gSF]] as [string, string, ReactNode][]).filter((g) => g[2]);
  const briefAgeH = BRIEF?.updated ? (Date.now() - Date.parse(BRIEF.updated)) / HR : NaN;
  const briefOn = !!(BRIEF && BRIEF.text && V.top.length && Number.isFinite(briefAgeH) && briefAgeH <= 48);
  const seg = V.tfl.length > 1 ? <span className="tb-seg">{[{ k: "all", lb: "전체", n: -1 }, ...V.tfl].map((z) => <button key={z.k} type="button" className={V.TF === z.k ? "on" : undefined} onClick={() => setTopf(z.k)}>{z.lb}{z.n >= 0 ? ` ${Math.min(z.n, 10)}` : ""}</button>)}</span> : null;

  return (
    <Pane title="SNS 전체">
      <div ref={root} />
      {/* 왼쪽 책갈피(원본 #trendRailWrap) = 지역(국내/월드) + 맨 위 + 대분류 바로가기 — 로고 없는 대분류는 첫 글자(큐레이션·기타·안전 = 「큐 기 안」) */}
      <div className="nm-trend-railbox">
        <div className="nm-trend-rail">
          <nav className="trail" role="group" aria-label="지역 범위">
            <button type="button" className={`trail-i rg${reg === "kr" ? " on" : ""}`} aria-label="국내" title="국내" onClick={() => pickReg("kr")}><Svg s={REG_SVG.kr} /></button>
            <i className="trail-div" aria-hidden />
            <button type="button" className={`trail-i rg${reg === "gl" ? " on" : ""}`} aria-label="월드" title="월드" onClick={() => pickReg("gl")}><Svg s={REG_SVG.gl} /></button>
          </nav>
          {GRPS.length > 1 ? (
            <nav className="trail" aria-label="대분류 바로가기">
              <button type="button" className={`trail-i${rail === "top" ? " on" : ""}`} aria-label="맨 위" onClick={() => jump("top")}><Svg s={UP} /></button>
              {GRPS.map((g) => <button key={g[0]} type="button" className={`trail-i${rail === g[0] ? " on" : ""}`} aria-label={g[1]} onClick={() => jump(g[0])}>{TR_LOGO[g[0]] ? <Svg s={TR_LOGO[g[0]]} /> : g[1][0]}</button>)}
            </nav>
          ) : null}
        </div>
      </div>
      <div ref={body} className="yeta-set mt-2 nm-trend">
        {V.empty ? <p className="nm-chan-msg">지금 데이터가 없어</p> : <>
          {briefOn ? (
            <Group id="brief" ttl="AI 요약" pic={SPARK} hstale={V.stale}>
              <div className="tbrief"><BriefText text={String(BRIEF!.text)} refs={Array.isArray(BRIEF!.refs) ? BRIEF!.refs : []} /><Ledger issues={Array.isArray(BRIEF!.issues) ? BRIEF!.issues : []} /></div>
            </Group>
          ) : null}   {/* 48시간 넘은 요약 = 말 없이 숨김(요약 러너는 형 09-09 꺼 둠 · sns-trends.yml SNS_BRIEF 기본 0 · 「멈춰 있어」 줄은 제목 밑 자리만 먹어서 뺌) */}
          {V.top.length ? (
            <Group id="top" ttl={<>실시간 TOP 10{d.updated ? <Badge warn={V.stale} t={fmtK12(d.updated)} title={V.stale ? "수집이 65분 넘게 밀렸다" : "수집 시각"} /> : null}</>} pic={TRENDUP} hstale={V.stale} extra={seg}>
              <div className="tlist">{V.topShow.map((it, i) => (
                <a key={it.url} className="tlr" href={it.url} target="_blank" rel="noopener"><span className="rk">{i + 1}</span><span className="tlr-t">{dimTags(it.t)}</span><span className="tlr-p" style={{ color: TR_PCOL[it.mono] || "var(--mut)" }}>{it.plat}</span><span className="tlr-v">{it.rv}</span><span className={`tlr-tm${it._fresh ? "" : " old"}`}>{it.ago}</span></a>
              ))}</div>
              <Stack key={V.TF} seq={V.seqX} n10={V.topShow.length} />
            </Group>
          ) : null}
          {GRPS.map(([id, ttl, body], gi) => (
            <Group key={id} id={id} no={gi + 1} ttl={id === "fin" ? <>{ttl}{finHotAny ? <span className="fin-hotdot" title="전일 대비 임계 초과 급변 있음" /> : null}{finUt ? <span className="tdash-time fin-upd">{qAgo(finUt)}{Date.now() - finUt >= 65 * 60000 ? <span className="fin-chk"> (점검 필요)</span> : null}</span> : null}</> : id === "cur" && V.phoneStale ? <>{ttl}<Badge t="폰 점검 필요" title="폰 수집기가 3시간+ 멈춤 — 스레드 최신 글이 지연 중" /></> : ttl}>
              {body}
            </Group>
          ))}
        </>}
        {/* 새로 수집 = 앱 안(/api/snsretry · 러너 워크플로 · 끝 = updated 바뀜 · ./fresh-btn.tsx) · 전엔 「에디터에서」 */}
        <div className="ypc-acts nm-chan-acts nm-trend-acts"><FreshBtn url="/api/snsretry" upd={String(d.updated || "")} refetch={() => { void q.refetch(); }} noun="SNS" /></div>
      </div>
    </Pane>
  );
}
