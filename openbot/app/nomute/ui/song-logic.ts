// 서랍 「음원」 계산 줄(./song.tsx · ./song-more.tsx · 시험 = tests/song-logic.test.ts) — 화면 없이 도는 것만 · 원본 viewer/song.html 값 그대로
//   (형 11-10 15:48 「응 에디터에 잇는거 다 정원으로 가져왕」 · team-4 뎅 · 판 2 = 고급 게이지 · 음성 클로닝 · 마스터링)

// ── 고급 게이지(원본 GAUGE · gaugeLive · fire 의 payload.opts) — 중립(50/50/0/60)이면 아예 안 싣는다 = 안 만지면 종전 산출과 같음 ──
export type Gauge = { w: number; s: number; g: number; t: number };   // w 실험성 · s 장르 충실 · g 보컬 성별(-100 남성 ~ 0 중성 ~ 100 여성) · t 목표 길이(초)
export const GAUGE_DEF: Gauge = { w: 50, s: 50, g: 0, t: 60 };
export const LEN = { min: 10, max: 60, step: 5, def: 60 };   // 원본 SONG_LEN_* (기본 60 = 옛 「60초 미만」)
export const vocName = (g: number) => (g < 0 ? "남성" : g > 0 ? "여성" : "중성");
export const vocLabel = (g: number) => (g === 0 ? "중성" : `${vocName(g)} ${Math.abs(g)}%`);
export const vocV = (g: number) => (g < 0 ? "male" : g > 0 ? "female" : "");   // 원본 GAUGE.v = 부호에서 파생(중성 = 지정 없음)
export const vocSnap = (v: number) => Math.max(-100, Math.min(100, Math.round(v / 10) * 10));   // 원본 paintVoc
export const gaugeLive = (G: Gauge) => G.w < 40 || G.w > 60 || G.s < 40 || G.s > 60 || !!vocV(G.g) || G.t !== LEN.def;
export const gaugeOpts = (G: Gauge) => (gaugeLive(G) ? { w: G.w, s: G.s, v: vocV(G.g), vg: Math.abs(G.g), t: G.t } : null);

// ── 기다림 예산(원본 BUDGET · BUDGETS · 「하드 ×2」) — 초 ──
const BUDGET_S: Record<string, number> = { options: 1000, suno: 1000, lyria: 1000, voice: 2600, "voice-train": 5400 };
export const hardMs = (mode: string) => (BUDGET_S[mode] ?? 1000) * 2000;

// ── 음성 클로닝(원본 trainGo · vApply · pollVoice) — 동의 = 본인·권리 보유 음성만(실존 타인 금지 · api·워크플로도 같은 거절) ──
export const VOICE_B64_MAX = 20 * 1024 * 1024, VOICE_FILE_MAX = 2 * 1024 * 1024 * 1024;   // R2 못 쓰면 20MB 까지만 b64 · api/upload 절대 상한 2GB
export function trainPayload(name: string, fname: string, src: { r2key?: string; fileB64?: string }) {
  const n = name.trim().slice(0, 24);
  return { mode: "train", name: n, consent: true, fname, lbl: n || "보이스 학습", ...(src.r2key ? { r2key: src.r2key } : { fileB64: src.fileB64 }) };
}
export const applyPayload = (src: string, vid: string) => ({ mode: "apply", src, vid, lbl: "보이스" });
export function voiceDone(d: { model_url?: string; ts?: string } | null | undefined, minTs: number) {   // 원 발사 뒤 산출만(옛 학습 결과 오인 막기)
  if (!d?.model_url) return false;
  const ts = Date.parse(d.ts || "");
  return !isNaN(ts) && ts >= minTs;
}
export const deadKey = (err: string) => /업로드 키|업로드 파일이 없어|업로드 미설정/.test(err);   // 원본 = 이 문구일 때만 R2 키 버림(429 · 5xx 는 키가 멀쩡)
export const notHtml = (t: string, ct = "") => !!t.trim() && !ct.toLowerCase().includes("text/html") && !/^\s*<!doctype/i.test(t) && !/<html[\s>]/i.test(t.slice(0, 300)) && !/^\s*</.test(t);

// ── 마스터링(원본 MA_EQP · MA_MAC · maTgls · maFmt) — 엔진은 사이트 뿌리 /master.js 그대로(브라우저 로컬 · 돈 0) ──
export const EQ_PRESETS: [string, string, number[]][] = [
  ["flat", "그대로", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  ["vocal", "보컬 부스트", [0, 0, -2, -1, 0, 1.5, 3, 2, 1, 0]],
  ["bass", "베이스 부스트", [5, 3.5, -1, 0, 0, 0, 0, 0, 0, 0]],
  ["bright", "밝게", [0, 0, -1, 0, 0, 0, 0, 2, 3, 4]],
  ["warm", "따뜻하게", [2, 2.5, 1.5, 0, 0, 0, 0, -1.5, -2, -2.5]],
];
export const MACROS: [string, string][] = [["clarity", "선명하게"], ["bass", "저음"], ["space", "공간감"], ["punch", "단단하게"], ["smooth", "부드럽게"]];
export const TOGGLES: [string, string][] = [["normalize", "음량 맞추기"], ["limit", "찢어짐 방지"], ["cleanLowEnd", "저역 정리"], ["centerBass", "베이스 가운데"], ["glue", "묶어주기"], ["cutMud", "탁함 빼기"], ["tameHarsh", "쏘는 소리 줄이기"], ["addAir", "공기감"]];
export const FINE: { k: string; lab: string; min: number; max: number; step: number; fmt: (v: number) => string }[] = [
  { k: "targetLufs", lab: "음량", min: -20, max: -6, step: 0.5, fmt: (v) => v.toFixed(1) },
  { k: "ceilingDb", lab: "피크 천장", min: -3, max: 0, step: 0.1, fmt: (v) => v.toFixed(1) },
  { k: "width", lab: "스테레오", min: 0, max: 200, step: 5, fmt: (v) => v + "%" },
  { k: "gainDb", lab: "입력 게인", min: -12, max: 12, step: 0.5, fmt: (v) => (v > 0 ? "+" : "") + v.toFixed(1) },
];
export const maDb = (v: number) => (isFinite(v) ? v.toFixed(1) : "—");
export const dlSrc = (u: string) => (/^https:\/\//i.test(u) ? `/api/dl?u=${encodeURIComponent(u)}&n=src` : u);   // 교차출처 R2 = 받기와 같은 프록시(same-origin 이라 decodeAudioData 됨)
