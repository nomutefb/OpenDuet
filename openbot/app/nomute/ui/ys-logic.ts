// 서랍 「유튜브」 계산 줄(./ys.tsx · 시험 = tests/ys-logic.test.ts) — 화면 없이 도는 것만 · 원본 viewer/ys.html · functions/api/ys.js 와 같은 값
export const YT_RE = /^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|live\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[?&#][^\s]*)?$/;   // functions/api/ys.js YT_RE 그대로
export type Opt = { k: string; lab: string; vals: [string, string][] };
export const OPTS: Opt[] = [   // 첫 값 = 서버 기본
  { k: "len", lab: "길이", vals: [["60", "60초"], ["45", "45초"], ["90", "90초"]] },
  { k: "ratio", lab: "비율", vals: [["9:16", "세로 9:16"], ["16:9", "가로 16:9"]] },
  { k: "img", lab: "장면 화면", vals: [["codex", "GPT 이미지"], ["motion", "모션 그래픽"], ["depth", "GPT 입체"], ["grok", "그록 영상"]] },
  { k: "stt", lab: "받아쓰기", vals: [["scribe", "정밀(Scribe)"], ["subs", "유튜브 자막 먼저"]] },
  { k: "font", lab: "글꼴", vals: [["pretendard", "프리텐다드"], ["gothic", "노토산스"], ["barun", "나눔바른고딕"]] },
  { k: "subbg", lab: "자막 배경", vals: [["on", "켬"], ["off", "끔"]] },
  { k: "grid", lab: "그림", vals: [["4", "4칸 한 장 늘리기"], ["1", "고화질(한 장씩)"]] },
];
export const STEPS: [string, string][] = [["meta", "영상 정보 확인"], ["stt", "받아쓰기"], ["plan", "인사이트 정리"], ["voice", "목소리 입히기"], ["img", "장면 그림"], ["vid", "장면 영상"], ["mgd", "모션 디자인"], ["render", "영상 만들기"], ["upload", "올리기"]];
export const OKEY = "nm_ys_opts", JKEY = "nm_ys_jobs", POLL_MS = 5000, STALL_MS = 50 * 60e3, LIMIT_MS = 135 * 60e3;   // 기다림 = 원본과 같음(무갱신 50분 · 절대 135분)

export type Step = { k?: string; st?: string; note?: string };
export type Prog = { state?: string; steps?: Step[]; updated?: number; error?: string; title?: string } | null;
export type Res = { title?: string; channel?: string; src_url?: string; dur?: number; video?: string; poster?: string; infographic?: string; report?: string; scenes?: number; ratio?: string; error?: string };
export type Job = { id: string; out: string; url: string; t0: number; st: "run" | "done" | "fail"; msg?: string; res?: Res; ratio?: string };
export type Hist = { id: string; ts: number; title: string; channel: string; poster: string; video: string; report: string; infographic: string; dur: number; ratio: string };

export const https = (u: unknown) => typeof u === "string" && /^https?:\/\//i.test(u);
export const tsMs = (t: unknown) => (typeof t === "number" ? (t > 1e12 ? t : t * 1000) : Date.parse(String(t || "")) || 0);
export const vidOf = (u: string) => (u.match(/(?:v=|youtu\.be\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/) || [])[1] || "";
export const durTxt = (s: number) => (s > 0 ? Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0") : "");
export const agoTxt = (t: number) => { const m = Math.round((Date.now() - t) / 60e3); return m < 1 ? "방금" : m < 60 ? m + "분 전" : m < 1440 ? Math.round(m / 60) + "시간 전" : Math.round(m / 1440) + "일 전"; };
export function optsPick(o: Record<string, string>): Record<string, string> {   // 저장된 값 중 허용 값만 · 나머지 = 서버 기본(첫 값)
  return Object.fromEntries(OPTS.map((x) => [x.k, x.vals.some(([v]) => v === o[x.k]) ? o[x.k] : x.vals[0][0]]));
}
export function optsLoad(): Record<string, string> {
  let o: Record<string, string> = {};
  try { o = JSON.parse(localStorage.getItem(OKEY) || "{}") || {}; } catch { /* 기본 */ }
  return optsPick(o);
}
export function jobsLoad(): Job[] {
  try { const a = JSON.parse(localStorage.getItem(JKEY) || "[]"); return Array.isArray(a) ? a.filter((j) => j && j.id && j.out).slice(0, 30) : []; } catch { return []; }
}
export const jobsSave = (a: Job[]) => { try { localStorage.setItem(JKEY, JSON.stringify(a.slice(0, 30))); } catch { /* 이 판만 */ } };
export async function getJSON<T>(u: string): Promise<T | null> {
  try {
    const r = await fetch(u + (u.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store", credentials: "same-origin" });
    if (!r.ok || (r.headers.get("content-type") || "").includes("text/html")) return null;   // 아직 없음(404 · 앱 껍데기 html)
    return (await r.json()) as T;
  } catch { return null; }
}
