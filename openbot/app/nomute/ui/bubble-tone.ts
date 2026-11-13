// 말풍선 색 셈(색 고르기 판 · 말풍선 · 답 띠가 같이 씀 · 시험 길 = .ts)
export const fromHex = (t: string) => (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/i.test(t) ? [0, 2, 4].map((i) => parseInt(t.replace("#", "").slice(i, i + 2), 16)) : null);
/** 투명도(0~1) — #RRGGBBAA 의 AA · 없으면 1(형 11-13 22:19 「말풍선 색 정하는거 저기에 투명도도 들어가면 됨」) */
export const alphaOf = (t: string) => (/^#?[0-9a-f]{8}$/i.test(t || "") ? parseInt(t.replace("#", "").slice(6, 8), 16) / 255 : 1);
export const ALPHA_MIN = 0.3;   // 이보다 옅으면 바탕에 묻혀 글이 안 읽힘(아래 막이)
export const withAlpha = (hex6: string, a: number) => (a >= 0.995 ? hex6 : hex6 + Math.round(Math.max(ALPHA_MIN, a) * 255).toString(16).padStart(2, "0").toUpperCase());
/** 말풍선 글자색 = 배경 밝기로 저절로 */
export const inkOn = (hex: string) => { const c = fromHex(hex), a = alphaOf(hex); return c && (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) * a + 22 * (1 - a) > 150 ? "#161716" : "#FFFFFF"; };   // 투명하면 어두운 바탕(#161716 · 밝기 22)과 섞인 밝기로
