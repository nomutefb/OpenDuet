// 서랍 「영상 편집」 계산 줄(./vedit.tsx · 시험 = tests/vedit-logic.test.ts) — 원본 viewer/edit.html buildOpts · viewer/upload.js · functions/api/edit.js 와 같은 값(team-4 · 깃 11-10)
//   판 1 = 올리기 · 자막 · 컷 · 화면 · 소리 → 만들기 → 결과 · 완성작 / 판 2(아직) = 자를 곳 먼저 보기(cutscan) · 자막 고쳐 다시 입히기(reburn) · 트래킹 · 베스트컷
export const VID_EXT = /\.(mp4|mov|m4v|webm|mkv|avi)$/i;   // edit.js:253 = 영상 여섯만
export const UP_MAX = 2 * 1024 ** 3, PART = 32 * 1024 ** 2, PARTS_MAX = 64;   // upload.js 서버 14 · 15(2 GiB · 32 MiB 조각 · 64조각)
export const POLL_MS = 5000, BUDGET_S = 2700, PEND = "nm_vedit_jobs", OKEY = "nm_vedit_opts";   // 원본 BUDGET 2700초 · 하드 = 두 배

export type Sel = { k: string; lab: string; vals: [string, string][]; when?: (o: VOpts) => boolean };
export type VOpts = Record<string, string>;
export const SELS: Sel[] = [   // 첫 값 = 원본 화면 기본(edit.html:945 ON · 949-953 P)
  { k: "subs", lab: "자막", vals: [["on", "켬"], ["off", "끔"]] },
  { k: "lang", lab: "자막 말", vals: [["dual", "번역 같이(원어+한국어)"], ["ko", "한국어만"], ["src", "원어만"], ["auto", "자동"]], when: (o) => o.subs === "on" },
  { k: "tone", lab: "말투", vals: [["lit", "문어"], ["plain", "담백"], ["sns", "SNS"], ["mz", "MZ"]], when: (o) => o.subs === "on" },
  { k: "style", lab: "자막 꼴", vals: [["clean", "깔끔"], ["bold", "굵게"], ["box", "상자"]], when: (o) => o.subs === "on" },
  { k: "filler", lab: "군말 빼기(자막)", vals: [["on", "켬"], ["off", "끔"]], when: (o) => o.subs === "on" },
  { k: "cut", lab: "무음 · 군말 자르기", vals: [["off", "끔"], ["soft", "약하게"], ["std", "보통"], ["hard", "세게"]] },
  { k: "take", lab: "테이크 정리", vals: [["off", "끔"], ["on", "켬"]] },
  { k: "bgm", lab: "배경음", vals: [["off", "끔"], ["on", "켬"]] },
  { k: "vid_ar", lab: "비율", vals: [["src", "원본"], ["9:16", "9:16"], ["1:1", "1:1"], ["4:5", "4:5"], ["16:9", "16:9"]] },
  { k: "vid_fit", lab: "맞춤", vals: [["crop", "잘라 채움"], ["pad", "여백"], ["blur", "흐린 배경"]], when: (o) => o.vid_ar !== "src" },
  { k: "vid_res", lab: "해상도", vals: [["src", "원본"], ["720", "720p"], ["1080", "1080p"], ["2k", "2K"], ["4k", "4K"]] },
  { k: "aud_norm", lab: "소리 고르기", vals: [["on", "켬"], ["off", "끔"]] },
];
export function optsPick(o: Record<string, string>): VOpts {
  return Object.fromEntries(SELS.map((s) => [s.k, s.vals.some(([v]) => v === o[s.k]) ? o[s.k] : s.vals[0][0]]));
}
/** 화면 칸 → /api/edit opts(원본 buildOpts 와 같은 이름 · 안 보이는 칸은 안 보냄 · 서버가 한 번 더 거름) */
export function buildOpts(o: VOpts): Record<string, unknown> {
  const v = optsPick(o), out: Record<string, unknown> = {};
  if (v.subs === "on") Object.assign(out, { burn: true, lang: v.lang, tone: v.tone, style: v.style, filler: v.filler === "on", shtype: v.style === "box" ? "box" : "none" });
  if (v.cut !== "off") Object.assign(out, { cut: true, cutlv: v.cut });
  if (v.take === "on") out.take = true;
  if (v.bgm === "on") out.bgm = true;
  if (v.vid_ar !== "src") Object.assign(out, { vid_ar: v.vid_ar, vid_fit: v.vid_fit });
  if (v.vid_res !== "src") out.vid_res = v.vid_res;
  out.aud_norm = v.aud_norm === "on";
  return out;
}
/** 할 일이 하나라도 있나(edit.js:239 = 없으면 400 · 소리 고르기 하나도 할 일로 침 = 서버 69줄과 같음) */
export const hasAction = (opts: Record<string, unknown>) => ["burn", "cut", "take", "bgm", "vid_ar", "vid_res", "aud_norm"].some((k) => opts[k] !== undefined && opts[k] !== false);
export const partsOf = (size: number) => Math.max(1, Math.ceil(size / PART));
export function fileWhy(name: string, size: number): string {   // 빈 글 = 됨
  if (!VID_EXT.test(name)) return "영상 파일만(mp4 · mov · m4v · webm · mkv · avi)";
  if (size > UP_MAX) return "2GB 넘는 파일은 못 올려";
  if (partsOf(size) > PARTS_MAX) return "조각이 64개를 넘어";
  return "";
}
export type VRes = { url?: string; poster?: string; dur?: number; note?: string; error?: string; skip?: string | boolean; xtr_wait?: boolean; ts?: number | string; src?: string };
/** 끝났나(edit.html:2509) = url · error · skip 중 하나 · xtr_wait 아님 · 띄운 때 90초 앞보다 새 판 */
export function landed(d: VRes | null, t0: number): boolean {
  if (!d || !(d.url || d.error || d.skip) || d.xtr_wait) return false;
  const ts = typeof d.ts === "number" ? (d.ts > 1e12 ? d.ts : d.ts * 1000) : Date.parse(String(d.ts || "")) || 0;
  return !ts || ts >= t0 - 90e3;
}
export const absUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : "/" + u.replace(/^\/+/, ""));
export const dlHref = (u: string, name: string) => "/api/dl?u=" + encodeURIComponent(absUrl(u)) + "&n=" + encodeURIComponent(name);

// 베스트컷(판 2 첫 칸 · edit.html:3598-3620 · functions/api/framethumb.js 47-49) = 같은 영상에서 장면 그림 뽑기 · 7초마다 ft_out/<id>/frames.json(최대 65분)
export const FT_POLL_MS = 7000, FT_LIMIT_MS = 65 * 60e3, FT_KEY = "nm_vedit_ft";
export const FT_N = [1, 2, 3], FT_AR = ["4:5", "9:16", "1:1", "16:9", "off"];
export function ftOpts(n: number, ar: string): { n: number; scale: number; ar: string } {   // 원본 화면 기본 = {n:2, scale:2, ar:'4:5'}
  return { n: FT_N.includes(n) ? n : 2, scale: 2, ar: FT_AR.includes(ar) ? ar : "4:5" };
}
export type Frames = { state?: string; error?: string; frames?: { url?: string; t?: number; quote?: string }[] } | null;
export const ftDone = (d: Frames) => !!d && (d.state === "done" || d.state === "failed");

// 자를 곳 먼저 보기(판 2 · edit.html:2331 · 3536-3547 · edit.js:219-227 · 66) = 스캔만 → cuts.json 의 rm 을 보고 고른 뒤 cutref(스캔 id) · cutoff(뺀 칸 번호 CSV)로 만들기
export type Cut = { s: number; e: number; k?: string; t?: string };
export type Cuts = { dur?: number; keep_dur?: number; cutlv?: string; note?: string; rm?: Cut[] } | null;
export const CUT_KIND: Record<string, string> = { sil: "무음", fil: "군말", take: "테이크" };
export function scanOpts(v: VOpts): Record<string, unknown> {   // 서버가 cutscan · cut · cutlv · cutfill · take 만 남김
  const p = optsPick(v);
  return { cutscan: true, cut: true, cutlv: p.cut === "off" ? "std" : p.cut, take: p.take === "on" };
}
/** 만들기 opts 에 스캔 결과를 씀 = 자르기 칸(cut · cutlv · cutfill · take)을 빼고 cutref · cutoff(안 자를 칸 번호) */
export function withCut(opts: Record<string, unknown>, scanId: string, off: number[]): Record<string, unknown> {
  const o: Record<string, unknown> = { ...opts };
  for (const k of ["cut", "cutlv", "cutfill", "take", "cutscan"]) delete o[k];
  o.cutref = scanId;
  const cf = [...new Set(off.filter((i) => Number.isInteger(i) && i >= 0 && i < 10000))].sort((a, b) => a - b).slice(0, 200).join(",");
  if (cf) o.cutoff = cf;
  return o;
}
export const cutsDone = (d: Cuts) => !!d && Array.isArray(d.rm);
export const tc = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") + "." + Math.floor((s % 1) * 10);
