// 서랍 「스토리보드」 계산 줄(./sb.tsx · 시험 = tests/sb-logic.test.ts) — 원본 viewer/sb.html 661-765 · viewer/nm-styles.js · functions/api/sb.js 와 같은 값(team-4 · 깃 11-11)
//   판 1 = 이야기 → 글 콘티(board.md) + 콘티 시트 · 레퍼런스 그림 / 판 2(아직) = 2차 촬영(base + shootOnly → video.json) · 참고 사진 · 다른 기기 목록
export const SB_KEY = "nm_sb_jobs", SB_OKEY = "nm_sb_opts", SB_POLL_MS = 5000, SB_BUDGET_S = 1800;   // sb.html 1392 · 하드 = 두 배
export const DIRECTORS: [string, string, string][] = [["fable", "Opus 5.5", "감성 · 서사 마감"], ["gpt", "GPT 6 Astra", "완급 · 액션 — API 종량"]];   // sb.html 663-667 · 표시명 = viewer/nm-models.js · opus 는 지금 fable 과 같은 모델이라 칸을 숨김(sb.html sbDirDup) · 저장값 opus 는 그대로 받음
const DIR_OK = ["fable", "opus", "gpt"];
export const SHOOTS: [string, string, string][] = [   // sb.html 672-680(표기 = 운영자 260813)
  ["grok", "Grok", "구독 자격 직결 · 10초씩 · 720p"],
  ["seedance", "SD 2.5", "30초 한 발 · 720p · 이음매 없음(30초 약 195크레딧)"],
  ["seedance20", "SD 2.0", "15초 두 발 · 화질 선택 가능(30초 약 135크레딧)"],
  ["motion", "모션그래픽", "플랫 모션 · 사내 렌더 → mp4 즉시 · 0원"],
];
export const CAPS: Record<string, { q: string[]; snd: boolean }> = {   // sb.html 697-702 = 촬영 칸마다 되는 화질
  grok: { q: ["720p"], snd: true }, seedance: { q: ["720p"], snd: true }, seedance20: { q: ["720p", "FHD", "4K"], snd: true }, motion: { q: ["720p", "FHD", "2K", "4K"], snd: false },
};
export const Q_RANK = ["720p", "FHD", "2K", "4K"], RATIOS = ["9:16", "16:9", "1:1"], LENS = ["10s", "20s", "30s", "40s", "50s", "60s"];
export const STYLES: [string, string][] = [["webtoon", "극화"], ["watercolor", "수채"], ["photo", "실사"], ["cartoon", "만평"], ["cinematic", "시네마틱"], ["illust", "일러스트"], ["iso3d", "3D"], ["pictogram", "픽토"], ["lego", "레고"]];   // nm-styles.js 21-23
export const SUBS: Record<string, [string, string][]> = {   // nm-styles.js 11-20(「기본」 = 자동 = 안 보냄)
  photo: [["auto", "기본"], ["film", "필름"], ["bw", "흑백"], ["cinedoc", "시네다큐"], ["newsreel", "뉴스릴"]],
  webtoon: [["auto", "기본"], ["gekiga", "게키카"], ["hardboiled", "하드보일드"], ["jidai", "시대극"], ["sunjung", "순정"], ["chibi", "명랑"]],
  cartoon: [["auto", "기본"], ["brush", "붓선"], ["flat", "플랫"], ["woodcut", "판화"]],
  watercolor: [["auto", "기본"], ["bleed", "번짐"], ["fine", "세밀"], ["sumuk", "수묵"], ["gouache", "과슈"], ["oil", "유화"]],
  cinematic: [["auto", "기본"], ["noir", "누아르"], ["neon", "네온"], ["film35", "35mm"], ["expressionism", "표현주의"]],
  illust: [["auto", "기본"], ["riso", "리소"], ["paper", "페이퍼"], ["anime", "애니"], ["retro80", "레트로80"]],
  iso3d: [["auto", "기본"], ["clay", "클레이"], ["lowpoly", "로우폴리"], ["diorama", "디오라마"]],
  pictogram: [["auto", "기본"], ["line", "라인"], ["blueprint", "청사진"]],
};
export type SbOpts = { director: string; shoot: string; ratio: string; q: string; len: string; style: string; sub: string; ad: boolean; snd: boolean };
export const SB_DEF: SbOpts = { director: "fable", shoot: "grok", ratio: "9:16", q: "2K", len: "10s", style: "photo", sub: "auto", ad: false, snd: true };   // sb.html 716 · 730-731
const pick = <T,>(v: T, ok: T[], d: T) => (ok.includes(v) ? v : d);
export function sbPick(o: Partial<SbOpts>): SbOpts {
  const style = pick(String(o.style), STYLES.map((s) => s[0]), SB_DEF.style);
  return {
    director: pick(String(o.director), DIR_OK, SB_DEF.director), shoot: pick(String(o.shoot), SHOOTS.map((s) => s[0]), SB_DEF.shoot),
    ratio: pick(String(o.ratio), RATIOS, SB_DEF.ratio), q: pick(String(o.q), Q_RANK, SB_DEF.q), len: pick(String(o.len), LENS, SB_DEF.len),
    style, sub: pick(String(o.sub), (SUBS[style] || []).map((s) => s[0]), "auto"), ad: o.ad === true, snd: o.snd !== false,
  };
}
/** 촬영 칸이 못 하는 화질 = 넘지 않는 가장 높은 것 · 없으면 가장 낮은 것(sb.html 737-743 sbQFit — 위로 튀면 돈) */
export function qFit(shoot: string, q: string): string {
  const ok = (CAPS[shoot] || CAPS.grok).q;
  if (ok.includes(q)) return q;
  const cur = Q_RANK.indexOf(q), down = ok.filter((v) => Q_RANK.indexOf(v) <= cur);
  return down.length ? down[down.length - 1] : ok[0];
}
export const cutsOf = (len: string) => Math.max(1, Math.round(parseInt(len, 10) / 10));   // 영상 편수 = 길이 ÷ 10(sb.html 718)
/** 보낼 몸통(sb.html 755-765 sbPayload · 서버 sb.js 가 한 번 더 거름) */
export function sbBody(story: string, o0: SbOpts, lbl: string): { body?: Record<string, unknown>; error?: string } {
  const st = story.trim();
  if (!st) return { error: "이야기나 기사를 넣어 줘" };
  const o = sbPick(o0);
  const set: Record<string, string> = { "비율": o.ratio, "화질": qFit(o.shoot, o.q), "프레임": "30fps", "길이": o.len };
  const sty = STYLES.find((s) => s[0] === o.style); if (sty) set["화풍"] = sty[1];
  const sub = (SUBS[o.style] || []).find((s) => s[0] === o.sub); if (sub && o.sub !== "auto") set["세부 화풍"] = sub[1];
  const sd = o.shoot.startsWith("seedance");
  return { body: { story: st.slice(0, 16000), director: o.director, shoot: o.shoot, set, ad: o.ad, sound: o.shoot === "grok" ? o.snd : true, ref: sd || o.shoot === "grok" ? true : o.shoot !== "motion", lbl: lbl.slice(0, 80) } };
}
/** 레퍼런스 그림 = ref.json urls(여럿) · url(하나 · 옛 꼴) */
export const refUrls = (j: unknown): string[] => { const o = (j || {}) as { urls?: unknown; url?: unknown }; return Array.isArray(o.urls) ? o.urls.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)) : typeof o.url === "string" && o.url ? [o.url] : []; };
