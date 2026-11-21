// 카드 덧줄 = 부제 · 출처 — 굽는 쪽 apps/comp/card_news.py split_extras · render_extras(천둥 editor #4602 · 꼴 정본 shared/content_style.py)와 같은 가름 · 같은 자리
//   형 11-21 R0083(dm-eyes 뜸 · 시아 옮김) · PM 시아 「새 칸 · 새 화면 0」 — 카드 글 그대로에서 가름:
//   부제 = 첫 줄이 「1. 」 「1) 」 「1-2 」 「• 」 꼴일 때만 · 굵게 · 자막 크기 × 0.6 · 자막 첫 줄 바탕선 한 줄(88) 위 · 왼쪽 = 자막 시작 x
//   출처 = 끝 줄이 「자료 · 」 「영상 · 」 「사진 · 」 「출처 · 」 꼴일 때만 · 18px Regular · 오른쪽 36 안 · 바탕선 1320 · 흰 50%
//   어느 꼴도 아니면 손 0 · 줄이 하나뿐이면 안 가름(그 줄이 곧 자막) · 미리보기 둘(썸네일 만들기 카드뉴스 · 카드 편집)이 여기서 읽음
export const HEAD_RE = /^\s*(?:\d{1,2}(?:-\d{1,2})?[.)]|\d{1,2}-\d{1,2}|•)\s+\S/;
export const CREDIT_RE = /^\s*(?:자료|영상|사진|출처)\s*[·:]\s*\S/;

/** *강조* 표 걷기(card_news _strip_emphasis 와 같음) */
export const stripStars = (s: string): string => String(s || "").replace(/\*([^*]+)\*/g, "$1");

export type CardExtras = { head: string | null; body: string[]; credit: string | null };

/** 카드 글 줄들 → 부제 · 자막 줄들 · 출처(굽는 쪽 split_extras 그대로 · 순수) */
export function splitExtras(lines: string[]): CardExtras {
  let body = [...(lines || [])], head: string | null = null, credit: string | null = null;
  if (body.length >= 2 && HEAD_RE.test(stripStars(body[0]))) { head = stripStars(body[0]).trim(); body = body.slice(1); }
  if (body.length >= 2 && CREDIT_RE.test(stripStars(body[body.length - 1]))) { credit = stripStars(body[body.length - 1]).trim(); body = body.slice(0, -1); }
  return { head, body, credit };
}

/** 줄 i 가 덧줄(부제 · 출처)인가 — 폭 · 줄 수 셈에서 뺌(굽는 쪽 card_text_check 와 같음) */
export function extraAt(lines: string[], i: number): boolean {
  const { head, credit } = splitExtras(lines);
  return (!!head && i === 0) || (!!credit && i === lines.length - 1);
}

/** 자막 4줄 + 덧줄 수 = 칩 편집기 줄 한도 */
export const lineCap = (lines: string[], body = 4): number => { const { head, credit } = splitExtras(lines); return body + (head ? 1 : 0) + (credit ? 1 : 0); };

// 자리 · 크기(1080 × 1350 · card_news START_X 87 · START_Y 888 · FONT_SIZE 54 · LINE_HEIGHT 88 · content_style HEAD_SCALE · CREDIT_*)
export const CARD = { SX: 87, SY: 888, FS: 54, LH: 88, W: 1080, H: 1350, HEAD_SCALE: 0.6, CREDIT_FS: 18, CREDIT_RIGHT: 36, CREDIT_BASE: 1320, CREDIT_ALPHA: 0.5 } as const;
/** 프리텐다드(앱 Pretendard Variable = 굽는 쪽 Pretendard-Bold.otf 와 같은 값 · 11-21 하늘 실측 위 0.952 · 아래 0.241) */
export const PRET = { A: 0.952, D: 0.241 } as const;
/** 굽는 쪽 바탕선 = 글 위 끝(START_Y) + PIL 위 높이(getmetrics · 54 → 52 · 32 → 31 · 18 → 18 = 올림) */
export const pilAsc = (fs: number): number => Math.ceil(PRET.A * fs);
export const baseOf = (i: number): number => CARD.SY + pilAsc(CARD.FS) + i * CARD.LH;   // 자막 i 줄 바탕선
export const headBase = (): number => baseOf(0) - CARD.LH;                               // 부제 바탕선 = 자막 첫 줄 한 줄 위
/** HTML 한 줄 상자(글 크기 fs · 줄 높이 lh) 위 끝 → 바탕선 거리(CSS 반 줄 사이 + 위 높이) */
export const cssBaseIn = (fs: number, lh: number): number => (lh - (PRET.A + PRET.D) * fs) / 2 + PRET.A * fs;
