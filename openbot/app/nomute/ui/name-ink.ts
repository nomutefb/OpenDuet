// 글 안 봇 이름 색 = 그 봇 말풍선 시그니처 색(#-044 · 형 11-15 08:48 dm-gik 깃 옮김 「말풍선 시그니처 색으로 나오게해줄래? 이거는 투명도 적용 안하고. 단 다크모드에서는 그 색으로 나오면되고, 화이트모드에서는 보색으로 나와야할거야 아마」)
//   투명도 뺌(#RRGGBBAA → #RRGGBB) · 다크 = 그 색 · 라이트 = 그 색 — 바탕(다크 #161716 · 라이트 흰)에 묻혀 대비 4.5:1 이 안 되는 색만 같은 색상으로 밝기를 옮김(라이트 = 어둡게 · 다크 = 밝게)
type Ink = { dark: string; light: string };

const hsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const rgb = (h: number, s: number, l: number): [number, number, number] => {
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
};
const lum = ([r, g, b]: [number, number, number]) => { const c = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); };
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const css = (h: number, s: number, l: number) => `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
const BG_DARK = lum([22, 23, 22]), BG_LIGHT = 1, NEED = 4.5;   // 다크 판 바탕 #161716 · 라이트 = 흰 · 글자 대비 4.5:1(작은 글자 기준)

/** 같은 색상 · 채도 그대로 밝기만 옮겨 바탕과 대비 NEED 를 넘는 첫 색(이미 넘으면 원래 색). */
const fit = (solid: string, h: number, s: number, l: number, bg: number, up: boolean) => {
  if (ratio(lum(rgb(h, s, l)), bg) >= NEED) return solid;
  for (let v = l; up ? v <= 0.95 : v >= 0.05; v += up ? 0.02 : -0.02) if (ratio(lum(rgb(h, s, v)), bg) >= NEED) return css(h, s, v);
  return css(h, s, up ? 0.95 : 0.05);
};

/** 말풍선 색 → {dark, light} · 못 읽는 꼴 = null(지금 색 그대로). */
export function nameInk(bubble?: string): Ink | null {
  const m = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(String(bubble || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16), solid = `#${m[1].toLowerCase()}`;
  const [h, s, l] = hsl((n >> 16) & 255, (n >> 8) & 255, n & 255);
  return { dark: fit(solid, h, s, l, BG_DARK, true), light: fit(solid, h, s, l, BG_LIGHT, false) };   // 다크 = 그 색(묻히는 색만 밝게) · 라이트 = 그 색(흰 바탕에 묻히면 어둡게)
}
