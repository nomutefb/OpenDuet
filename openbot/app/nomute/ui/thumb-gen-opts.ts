// 기사 한 장 「이미지 생성 창」 옵션 사전 · 보내는 글 꼴(그리기 0 = 시험 가능) — ./thumb-gen.tsx 가 씀
//   원본 = 에디터 viewer-src/22-thumbSec.part GENI_DICT · GENI_MOOD_AX · GENI_COLOR_AX · geniColorPreset · geniCloneAspect · 23-geniInit.part #geniGo opts
//          + viewer/nm-styles.js GENI_SUB · GENI_ALL_STYLES(값 · 라벨 한 글자도 안 고침) · 서버 = functions/api/genimg.js 화이트리스트(같은 집합)
//   형 11-10 14:23 봄 1:1 「응 밖에잇는거 다 옮길거야」 · 봄 23:09 나눔 「뜸 = 이미지 생성 창 · 화풍 수정」

export type Pair = readonly [string, string];

export const STYLES: Pair[] = [["webtoon", "극화"], ["watercolor", "수채"], ["photo", "실사"], ["cartoon", "만평"], ["cinematic", "시네마틱"], ["illust", "일러스트"], ["iso3d", "3D"], ["pictogram", "픽토"], ["lego", "레고"]];
export const SUBS: Record<string, Pair[]> = {
  photo: [["auto", "기본"], ["film", "필름"], ["bw", "흑백"], ["cinedoc", "시네다큐"], ["newsreel", "뉴스릴"]],
  webtoon: [["auto", "기본"], ["gekiga", "게키카"], ["hardboiled", "하드보일드"], ["jidai", "시대극"], ["sunjung", "순정"], ["chibi", "명랑"]],
  cartoon: [["auto", "기본"], ["brush", "붓선"], ["flat", "플랫"], ["woodcut", "판화"]],
  watercolor: [["auto", "기본"], ["bleed", "번짐"], ["fine", "세밀"], ["sumuk", "수묵"], ["gouache", "과슈"], ["oil", "유화"]],
  cinematic: [["auto", "기본"], ["noir", "누아르"], ["neon", "네온"], ["film35", "35mm"], ["expressionism", "표현주의"]],
  illust: [["auto", "기본"], ["riso", "리소"], ["paper", "페이퍼"], ["anime", "애니"], ["retro80", "레트로80"]],
  iso3d: [["auto", "기본"], ["clay", "클레이"], ["lowpoly", "로우폴리"], ["diorama", "디오라마"]],
  pictogram: [["auto", "기본"], ["line", "라인"], ["blueprint", "청사진"]],
};   // 레고 = 세부 화풍 없음(옛 「얘는 세부 화풍없이」 · 서버가 auto 로 내림)
export const subsOf = (style: string): Pair[] => SUBS[style] || [["auto", "기본"]];

export const DICT = {
  engine: [["gemini", "Gemini 3.1 Flash"], ["gpt", "GPT Image 2.0"]] as Pair[],
  size: [["720p", "720p"], ["FHD", "FHD"], ["2K", "2K"], ["4K", "4K"]] as Pair[],
  aspect: [["4:5", "4:5"], ["9:16", "9:16"], ["16:9", "16:9"], ["custom", "직접"]] as Pair[],
  count: [["1", "1개"], ["2", "2개"], ["3", "3개"], ["4", "4개"]] as Pair[],
  place: [["auto", "자동"], ["top23", "썸네일"], ["center", "중앙"], ["full", "전신"]] as Pair[],
  shot: [["auto", "자동"], ["S10", "표정 클로즈"], ["S08", "클로즈업"], ["S06", "상반신"], ["S04", "전신"], ["S03", "와이드"]] as Pair[],
  expr: [["auto", "자동"], ["EM-03", "슬픔"], ["EM-05", "분노"], ["EM-16", "눈물"], ["EM-17", "결연"], ["EM-09", "억눌림"], ["EM-12", "직시"]] as Pair[],
  angle: [["auto", "자동"], ["AG-01", "눈높이"], ["AG-02", "로우 위압"], ["AG-03", "하이 왜소"], ["AG-04", "부감"], ["AG-06", "더치"], ["AG-09", "측면"]] as Pair[],
  point: [["auto", "자동"], ["DF-01", "눈물 클로즈"], ["DF-02", "주먹"], ["DF-04", "서류·물건"], ["DF-05", "대치 투샷"], ["DF-07", "군중 속 1인"]] as Pair[],
  light: [["auto", "자동"], ["LGT05", "촛불"], ["LGT06", "골든아워"], ["LGT08", "흐린 확산"], ["LGT09", "하드 측광"], ["LGT10", "역광 실루엣"], ["LGT12", "형광 임상"]] as Pair[],
  refMode: [["keep", "원본 유지"], ["ref", "참고"], ["clone", "이미지와 동일하게"]] as Pair[],
};
export const CAM_KEYS = [["shot", "거리"], ["expr", "표정"], ["angle", "앵글"], ["point", "포인트"], ["light", "조명"], ["place", "배치"]] as const;
export type CamKey = (typeof CAM_KEYS)[number][0];
export const MOOD_AX = [["ct", "긴장도", "차분", "긴장"], ["sh", "정서", "침통", "희망"], ["ew", "온도", "스산", "온기"], ["rr", "격앙", "냉정", "격앙"]] as const;
export type MoodKey = (typeof MOOD_AX)[number][0];
export const COLOR_AX = [["sat", "채도", "흐리게", "진하게"], ["bri", "명도", "어둡게", "밝게"]] as const;
export type ColorKey = (typeof COLOR_AX)[number][0];

export type Sel = {
  style: string; sub: string; size: string; aspect: string; arW: string; arH: string; count: string;
  mood: "auto" | "axes"; moodAx: Record<MoodKey, number>; kweb: boolean; textOn: boolean;
  engine: "gemini" | "gpt"; engineTouched: boolean; colorAx: Record<ColorKey, number>; colorTouched: boolean;
  refMode: "keep" | "ref" | "clone"; wish: string;
} & Record<CamKey, string>;

/** 기본 = 극화 · 4:5 · FHD · 1개 · 웹툰화 켜짐 · 무드 자동 · Gemini(옛 _geniSel 그대로) */
export const DEFAULT_SEL: Sel = {
  style: "webtoon", sub: "auto", size: "FHD", aspect: "4:5", arW: "1", arH: "1", count: "1",
  mood: "auto", moodAx: { ct: 0, sh: 0, ew: 0, rr: 0 }, kweb: true, textOn: false,
  engine: "gemini", engineTouched: false, colorAx: { sat: 0, bri: 0 }, colorTouched: false,
  place: "auto", shot: "auto", expr: "auto", angle: "auto", point: "auto", light: "auto", refMode: "ref", wish: "",
};

const has = (list: readonly Pair[], v: unknown) => list.some(([k]) => k === v);
const clamp = (v: unknown, lo: number, hi: number) => { const n = parseInt(String(v), 10); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0; };

/** 저장해 둔 옵션(이 기기) → 맞는 값만 살림 · 모르는 값 = 기본(옛 GENI_OPTS2 복원 꼴) */
export function restoreSel(raw: unknown): Sel {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<Sel>;
  const o: Sel = { ...DEFAULT_SEL, moodAx: { ...DEFAULT_SEL.moodAx }, colorAx: { ...DEFAULT_SEL.colorAx } };
  if (has(STYLES, s.style)) o.style = s.style!;
  if (has(subsOf(o.style), s.sub)) o.sub = s.sub!;
  for (const k of ["size", "aspect", "count"] as const) if (has(DICT[k], s[k])) o[k] = s[k]!;
  for (const [k] of CAM_KEYS) if (has(DICT[k], s[k])) o[k] = s[k]!;
  if (/^\d{1,2}$/.test(String(s.arW ?? ""))) o.arW = String(s.arW);
  if (/^\d{1,2}$/.test(String(s.arH ?? ""))) o.arH = String(s.arH);
  if (s.mood === "axes") o.mood = "axes";
  for (const [k] of MOOD_AX) o.moodAx[k] = clamp(s.moodAx?.[k], -2, 2);
  if (typeof s.kweb === "boolean") o.kweb = s.kweb;
  if (typeof s.textOn === "boolean") o.textOn = s.textOn;
  if (s.engine === "gpt") o.engine = "gpt";
  o.engineTouched = !!s.engineTouched;
  for (const [k] of COLOR_AX) o.colorAx[k] = clamp(s.colorAx?.[k], -50, 50);
  o.colorTouched = !!s.colorTouched;
  if (has(DICT.refMode, s.refMode)) o.refMode = s.refMode!;
  return o;   // 주문(wish)은 안 살림 = 기사마다 다른 글
}

/** 화풍 고르기 = 없는 세부는 기본으로 · 레고 = GPT 기본(엔진을 손댄 적 없을 때만 · 옛 geniPickStyle) */
export function pickStyle(s: Sel, style: string): Sel {
  const o = { ...s, style };
  if (!has(subsOf(style), o.sub)) o.sub = "auto";
  if (style === "lego" && !o.engineTouched) o.engine = "gpt";
  return o;
}

/** 직접 비율 = 각 1~99 · 1:4 ~ 4:1(서버 · 러너 같은 약속) · 못 쓰면 null */
export function arVal(w: string, h: string): string | null {
  const a = parseInt(w, 10), b = parseInt(h, 10);
  return a >= 1 && a <= 99 && b >= 1 && b <= 99 && a / b >= 0.25 && a / b <= 4 ? `${a}:${b}` : null;
}
export const aspectOf = (s: Sel) => (s.aspect === "custom" ? arVal(s.arW, s.arH) : s.aspect);

/** 색 보정 기본값 = 엔진 · 모드별 실측 되돌림(옛 geniColorPreset · GPT 복제 = 채도 -20) */
export const colorPreset = (s: Pick<Sel, "engine" | "refMode">, hasRef: boolean): Record<ColorKey, number> =>
  s.engine === "gpt" && hasRef && s.refMode === "clone" ? { sat: -20, bri: 0 } : { sat: 0, bri: 0 };

/** 「이미지와 동일하게」 = 비율을 첨부 원본비로(옛 geniCloneAspect · 분모 ≤99 최근사 → 분자 >99 면 분모 ≤24) */
export function cloneAspect(w: number, h: number): Pick<Sel, "aspect" | "arW" | "arH"> | null {
  if (!w || !h) return null;
  const r = Math.min(4, Math.max(0.25, w / h));
  const best = (maxH: number) => { let w0 = 1, h0 = 1, e0 = Infinity; for (let d = 1; d <= maxH; d++) { const n = Math.max(1, Math.round(r * d)); const e = Math.abs(n / d - r); if (e < e0 - 1e-12) { e0 = e; w0 = n; h0 = d; } } return [w0, h0] as const; };
  let [bw, bh] = best(99); if (bw > 99) [bw, bh] = best(24);
  const p = `${bw}:${bh}`;
  return has(DICT.aspect, p) ? { aspect: p, arW: "", arH: "" } : { aspect: "custom", arW: String(bw), arH: String(bh) };
}

export type Ref = { b64: string; w: number; h: number; url: string };

/** api/genimg 로 보내는 opts(옛 #geniGo 와 같은 꼴 · fmt = jpg 고정) — 비율 못 씀 = null */
export function buildOpts(s: Sel, ref: Ref | null) {
  const aspect = aspectOf(s);
  if (!aspect) return null;
  const anyAx = MOOD_AX.some(([k]) => s.moodAx[k]);
  const opts: Record<string, unknown> = {
    style: s.style, sub: s.sub, aspect, size: s.size, count: parseInt(s.count, 10) || 1, fmt: "jpg",
    mood: s.mood === "axes" && anyAx ? "axes" : "auto", moodAx: { ...s.moodAx },
    kweb: !!s.kweb, textOn: !!s.textOn, engine: s.engine === "gpt" ? "gpt" : "gemini",
    satAdj: s.colorAx.sat | 0, briAdj: s.colorAx.bri | 0,
    place: s.place, shot: s.shot, expr: s.expr, angle: s.angle, point: s.point, light: s.light,
    wish: s.wish.replace(/\s+/g, " ").trim().slice(0, 300),
  };
  if (ref?.b64) { opts.refB64 = ref.b64; opts.refMode = s.refMode; }
  return opts;
}

/** 한 줄 요약(단추 옆 · 옛 선택요약 #geniSum 결) */
export function summary(s: Sel): string {
  const ko = (list: readonly Pair[], v: string) => (list.find(([k]) => k === v) || [, v])[1];
  const st = ko(STYLES, s.style), sub = s.sub !== "auto" ? `·${ko(subsOf(s.style), s.sub)}` : "";
  return [`${st}${sub}`, aspectOf(s) || "비율?", s.size, `${s.count}개`, s.engine === "gpt" ? "GPT" : "Gemini"].join(" · ");
}

/** 화풍 sid → 기본 화풍(photo_r3 → photo · thumb_gen.py _base_sid) */
export const baseSid = (sid: string) => String(sid || "").replace(/_r\d+$/, "");
