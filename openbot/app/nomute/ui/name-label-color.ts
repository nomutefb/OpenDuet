// 이름표만 보정한다. 얼굴 테와 말풍선의 시그니처 색은 그대로 둔다.
// WCAG sRGB 상대 휘도: 7:1을 목표로 해 펼친 대화의 부모 opacity .9에서도 4.5:1을 넘긴다.
const WHITE_CONTRAST = 7;
const FALLBACK = "#161716";
const linear = (v: number) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const contrast = (rgb: number[]) => 1.05 / (luminance(rgb) + 0.05);

/** 서버 시그니처(#RGB/#RGBA/#RRGGBB/#RRGGBBAA) → 테마와 무관한 불투명 이름표 바탕.
 * RGB에 같은 비율을 곱해 색상·채도를 유지하고, 충분히 어두운 색은 보존한다.
 * 정수로 내림한 실제 출력색을 재므로 반올림으로 대비 문턱을 밑돌지 않는다.
 */
export function nameLabelColor(signature?: string): string {
  const raw = signature?.trim();
  const hex = raw && /^#[\da-f]{3,4}$/i.test(raw)
    ? "#" + [...raw.slice(1, 4)].map((c) => c + c).join("")
    : raw && /^#[\da-f]{6}([\da-f]{2})?$/i.test(raw) ? raw.slice(0, 7) : undefined;
  if (!hex || !/^#[\da-f]{6}$/i.test(hex)) return FALLBACK;
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  if (contrast(rgb) >= WHITE_CONTRAST) return hex;
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (contrast(rgb.map((v) => Math.floor(v * mid))) >= WHITE_CONTRAST) lo = mid;
    else hi = mid;
  }
  return "#" + rgb.map((v) => Math.floor(v * lo).toString(16).padStart(2, "0")).join("");
}

/** 어두운 라벨도 윤곽이 남도록 바탕 대비 3:1 이상인 같은 색 계열의 밝은 테. */
export function nameLabelBorder(background: string): string {
  const hex = /^#[\da-f]{6}$/i.test(background) ? background : FALLBACK;
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const base = luminance(rgb) + 0.05;
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const line = rgb.map((v) => Math.ceil(v + (255 - v) * mid));
    if ((luminance(line) + 0.05) / base >= 3) hi = mid;
    else lo = mid;
  }
  return "#" + rgb.map((v) => Math.ceil(v + (255 - v) * hi).toString(16).padStart(2, "0")).join("");
}
