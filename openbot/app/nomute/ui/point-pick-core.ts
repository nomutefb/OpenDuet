// 가리키기 — 화면 요소 하나를 글 한 덩어리로(셈만 · DOM 0 = 노드 시험) · 화면 쪽 = ./point-pick.ts
//   형 11-12 「내가 지금 창을 띄워놓고 같이 보면서 얘끼하는거랑 내 입장에서는 느낌이 많이 다르다는거지」 · 「내가 마우스로 가리키는 부분도 잇으니까」
//   형 11-21 「바로 개선점을 적용해줄 수 있어?」(참고 = stablyai/orca 「Design Mode」 = 누른 요소의 HTML · 스타일 · 선택자를 봇 대화에)
//   받는 쪽(봇)이 코드에서 찾을 것 = 우리가 지은 클래스 이름(nm-* · ychat-* · yset-* …) → 테일윈드 낱말은 길에서 뺌
//   글 = 코드 칸(```) 한 덩어리 — 클래스 이름 속 「@」·「!」가 서버 부름으로 안 읽히게(공지 「괄호」 줄)

export type Hop = { tag: string; id?: string; cls: string[]; nth?: number; shadow?: boolean };
export type Facts = {
  where: string;                 // 화면 길(location.hash 또는 pathname)
  sha?: string;                  // 앱 판
  view: [number, number];        // 화면 크기
  path: Hop[];                   // 위 → 아래 · 마지막 = 가리킨 요소
  label?: string;                // aria-label · title · 글 머리
  rect: [number, number, number, number];   // x y w h
  style: Record<string, string>; // 계산된 옷(getComputedStyle 에서 고른 칸)
};

// 테일윈드 · 기능 낱말(길에서 뺌) — 「:」「[」「/」 든 것 + 흔한 머리말
const UTIL = /^-?(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|static|contents|w|h|min|max|size|p[xytrblse]?|m[xytrblse]?|gap|space|items|justify|self|content|place|text|font|leading|tracking|bg|border|rounded|shadow|opacity|z|top|left|right|bottom|inset|overflow|truncate|cursor|select|pointer|transition|duration|ease|delay|animate|transform|translate|rotate|scale|origin|shrink|grow|basis|order|col|row|ring|outline|fill|stroke|object|aspect|whitespace|break|line|list|table|sr|group|peer|backdrop|blur|filter|mix|isolate|invisible|visible|float|clear|box|appearance|resize|scroll|snap|touch|will|underline|uppercase|lowercase|capitalize|italic|antialiased|tabular|container|from|via|to|divide|accent|caret|decoration|indent|align|columns|auto|normal|hyphens|brightness|contrast|grayscale|saturate|sepia|drop|inert)(-|$)/;
export const ownClass = (c: string) => !!c && !/[:[\]/.!@#%(),=*+&]/.test(c) && !UTIL.test(c);

/** 한 칸 = 태그#id.클래스(우리 것만 · 셋까지) · 같은 꼴 형제가 있으면 :nth-of-type */
export function hopText(h: Hop): string {
  const cls = h.cls.filter(ownClass).slice(0, 3).map((c) => "." + c).join("");
  return (h.shadow ? "⟨그림자⟩ " : "") + h.tag + (h.id ? "#" + h.id : "") + cls + (h.nth ? `:nth-of-type(${h.nth})` : "");
}
/** 길 = 가리킨 요소에서 위로, 이름 있는 칸(우리 클래스 · id)이 셋 모일 때까지 · 많아야 여섯 칸 */
export function pathText(path: Hop[]): string {
  const out: Hop[] = [];
  let named = 0;
  for (let i = path.length - 1; i >= 0 && out.length < 6; i--) {
    const h = path[i]!;
    out.unshift(h);
    if (h.id || h.cls.some(ownClass)) named++;
    if (named >= 3 && out.length >= 2) break;
  }
  return out.map(hopText).join(" > ");
}

const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
/** rgb(…) · rgba(…) → #rrggbb(반투명 = 뒤에 %) · 투명 = "" · 그 밖 = 그대로 */
export function colorText(v: string): string {
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(String(v || "").trim());
  if (!m) return String(v || "").trim();
  const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  if (a === 0) return "";
  return `#${hex2(+m[1]!)}${hex2(+m[2]!)}${hex2(+m[3]!)}` + (a < 1 ? ` ${Math.round(a * 100)}%` : "");
}
const zero = (v: string) => !v || /^(0(px)?\s*)+$/.test(v.trim()) || v === "none" || v === "normal";

/** 옷 한 줄 — 있는 것만(글자 크기/굵기 · 글자색 · 바탕 · 테 · 모서리 · 안 여백 · 사이) */
export function styleText(s: Record<string, string>): string {
  const out: string[] = [];
  if (s.fontSize) out.push(`${s.fontSize}/${s.fontWeight || "400"}`);
  const c = colorText(s.color || ""); if (c) out.push("글자 " + c);
  const bg = colorText(s.backgroundColor || ""); if (bg) out.push("바탕 " + bg);
  if (!zero(s.borderTopWidth || "")) { const bc = colorText(s.borderTopColor || ""); if (bc) out.push(`테 ${s.borderTopWidth} ${bc}`); }   // 투명 테 = 안 보이는 테 = 안 적음
  if (!zero(s.borderRadius || "")) out.push("모서리 " + s.borderRadius);
  if (!zero(s.padding || "")) out.push("안 여백 " + s.padding);
  if (!zero(s.gap || "")) out.push("사이 " + s.gap);
  return out.join(" · ");
}

const one = (t: string, n: number) => { const s = String(t || "").replace(/\s+/g, " ").replace(/`/g, "'").trim(); return s.length > n ? s.slice(0, n) + "…" : s; };

/** 입력칸에 붙일 글 = 코드 칸 한 덩어리 + 빈 줄(형이 그 아래에 바로 이어 씀) */
export function pickText(f: Facts): string {
  const el = f.path[f.path.length - 1];
  const [x, y, w, h] = f.rect.map((n) => Math.round(n));
  const lines = [
    `가리킴 · ${one(f.where, 80) || "/"}${f.sha ? " · 판 " + f.sha.slice(0, 7) : ""} · 화면 ${Math.round(f.view[0])}×${Math.round(f.view[1])}`,
    `요소 ${el ? hopText({ ...el, nth: undefined }) : "?"}${f.label ? ` 「${one(f.label, 40)}」` : ""}`,
    `길 ${pathText(f.path)}`,
    `자리 ${x},${y} · ${w}×${h}`,
  ];
  const st = styleText(f.style);
  if (st) lines.push("옷 " + st);
  return "```\n" + lines.join("\n") + "\n```\n";
}
