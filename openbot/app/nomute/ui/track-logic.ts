// 서랍 「트래킹」 계산 줄(./track.tsx · 시험 = tests/track-logic.test.ts) — 원본 viewer/track.html · functions/api/track.js 와 같은 값(team-4 · 깃 11-10)
//   판 1 = 분석(tracks.json) → 모자이크 · 이름표(핀셋) · 크로마키 → 결과(video.json) / 판 2(아직) = 키잉 · 실루엣(피사체 · 직접 지정)
export const TK_KEY = "nm_track_jobs", TK_POLL_MS = 5000, AN_BUDGET_S = 600, RD_BUDGET_S = 900;   // track.html 321-322 · 하드 = 두 배
export const PALETTE = ["#00EED2", "#e23b2a", "#d8ff3d", "#0FFD02", "#38C6FF", "#FF5EC8", "#FFE13D", "#AC5CFF", "#2CF5A5", "#ff7a6b", "#3a6ddb", "#eef7f0"];   // track.html 318
export const colorOf = (pid: number) => PALETTE[(pid - 1 + PALETTE.length * 8) % PALETTE.length];
export type Mo = { shape: "ellipse" | "rect"; px: number; size: number; feather: number };   // px = pxw = pxh(옛 화면 기본 9 · 둘이 같이 움직임)
export const MO_DFLT: Mo = { shape: "ellipse", px: 9, size: 115, feather: 5 };   // track.html 323(운영자 260711 선택값)
export type Ck = { color: "green" | "blue"; similarity: number; choke: number; feather: number };
export const CK_DFLT: Ck = { color: "green", similarity: 18, choke: 0, feather: 1 };   // track.html 745
export type Mode = "mosaic" | "pinset" | "chroma";
export const MODES: [Mode, string][] = [["mosaic", "모자이크"], ["pinset", "이름표"], ["chroma", "크로마키"]];
export type Person = { pid: number; crop?: string; first?: number; last?: number; cap?: string; body?: unknown[] };
export type Tracks = { people: Person[]; meta?: { made?: string; src?: string; dropped?: number } } | null;
export const tracksDone = (d: unknown): d is { people: Person[] } => !!d && typeof d === "object" && Array.isArray((d as { people?: unknown }).people);
export const tkApi = (id: string, f: string, n?: string) => "/api/track?id=" + encodeURIComponent(id) + "&f=" + f + (n ? "&n=" + encodeURIComponent(n) : "");
/** 얼굴 그림 = 라이브(/api/track f=crop · p1.jpg 꼴만) · 그 밖 = 정적 track_out */
export function cropUrl(id: string, crop: string, ver = ""): string {
  const n = String(crop || "").replace(/^crops\//, "");
  return /^[ps][0-9]{1,3}\.jpg$/.test(n) ? tkApi(id, "crop", n) : "/track_out/" + id + "/" + crop + "?v=" + encodeURIComponent(ver);
}
export const mmss = (s?: number) => { const x = Math.max(0, Math.round(s || 0)); return Math.floor(x / 60) + ":" + String(x % 60).padStart(2, "0"); };

export type Pick = { mode: Mode; sel: number[]; invert: boolean; names: Record<string, string>; scope: Record<string, "body">; mo: Mo; ck: Ck };
export const pickDflt = (): Pick => ({ mode: "mosaic", sel: [], invert: false, names: {}, scope: {}, mo: { ...MO_DFLT }, ck: { ...CK_DFLT } });
/** 렌더 몸통(track.html 818-826 · 서버 track.js 40-160 이 한 번 더 거름) · 못 보내면 error */
export function renderBody(id: string, people: Person[], p: Pick): { body?: { render: Record<string, unknown> }; error?: string } {
  if (!/^[0-9]{12}-[0-9a-f]{6}$/.test(id)) return { error: "잘못된 작업 ID" };
  if (p.mode === "chroma") return { body: { render: { id, mode: "chroma", opts: { color: p.ck.color, similarity: p.ck.similarity / 100, choke: p.ck.choke, feather: p.ck.feather } } } };
  const pids = new Set(people.map((x) => x.pid | 0));
  const names: Record<string, string> = {}, colors: Record<string, string> = {};
  for (const pid of pids) { colors[pid] = colorOf(pid); const nm = String(p.names[pid] || "").trim().slice(0, 24); if (nm) names[pid] = nm; }
  const targets = [...new Set(p.sel.filter((t) => pids.has(t)))].slice(0, 32);
  const scopes: Record<string, "body"> = {};
  for (const [k, v] of Object.entries(p.scope)) if (v === "body" && pids.has(+k)) scopes[k] = "body";
  if (p.mode === "mosaic" && !targets.length && !p.invert) return { error: "가릴 사람을 골라 줘" };
  if (p.mode === "pinset" && !Object.keys(names).length) return { error: "이름을 하나는 넣어 줘" };
  return { body: { render: { id, mode: p.mode, targets, invert: p.invert, names, colors, scopes, opts: { shape: p.mo.shape, pxw: p.mo.px, pxh: p.mo.px, size: p.mo.size / 100, feather: p.mo.feather } } } };
}

export type TRes = { url?: string; preview?: string; mode?: string; ts?: string; error?: string; note?: string };
/** 렌더 끝났나(track.html 864 · 886-890) = 이번에 보낸 뒤 판(ts ≥ 보낸 때 −90초) · 옛 결과 url 아님 · 모드 같음 */
export function rendered(d: TRes | null, minTs: number, prev: string, mode: string): "done" | "error" | "" {
  if (!d) return "";
  const t = Date.parse(String(d.ts || ""));
  if (isNaN(t) || t < minTs) return "";
  if (d.error) return "error";
  const got = d.url || d.preview || "";
  const modeOk = !mode || !d.mode || d.mode === mode;
  return got && got !== prev && modeOk ? "done" : "";
}
/** 재생 = 크로마 · 키잉은 알파 webm(preview) · 받기 = url(MOV 마스터 · track.html 909-913) */
export const alphaOf = (d: TRes) => d.mode === "keying" || d.mode === "chroma";
export const playOf = (d: TRes) => (alphaOf(d) ? d.preview || d.url || "" : d.url || "");
