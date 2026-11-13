// 묶음 「공식 자료」 이어 글(러너 → dm-chok · 깃 11-13 12:49 · 형 08:33 · 12:47 봄 옮김 「내가 촉한테 픽을 하면 틈이 찾아서 그 픽 요약에 틈이 자료를 붙이는 거로」)
//   꼴 = 첫 줄 `[자료 <묶음 stem>]` + 주소: / 누가: / 원문: / 한글: / 열어 봄: 됨 | 못 열어 봄 · 원문은 여러 줄 됨(다음 열쇠 줄 앞까지)
//   같은 방에 같은 stem 의 `[묶음 …]` 카드가 있으면 = 카드 안 「공식 자료」 칸(./bundle-card.tsx) · 이어 글 자체는 숨김 · 없으면 그냥 알약(러너 글 그대로)
export type Src = { stem: string; url: string; who: string; orig: string; ko: string; opened: boolean | null; id?: string };
const HEAD = /^\s*\**\s*\[자료\s+([^\]\s]+)\]\s*\**\s*$/;
const KEY = /^(주소|누가|원문|한글|열어 봄):\s?(.*)$/;
export function parseSrc(t0: unknown): Src | null {
  const lines = String(t0 || "").replace(/\r/g, "").split("\n");
  const m = HEAD.exec(lines[0] || "");
  if (!m) return null;
  const s: Src = { stem: m[1], url: "", who: "", orig: "", ko: "", opened: null };
  let at = "";
  const put = (k: string, v: string, more: boolean) => {
    if (k === "주소") { const u = /https?:\/\/\S+/i.exec(v)?.[0] || ""; if (u && !s.url) s.url = u; }
    else if (k === "누가") s.who = more ? `${s.who} ${v}`.trim() : v;
    else if (k === "원문") s.orig = more ? (s.orig ? `${s.orig}\n${v}` : v) : v;
    else if (k === "한글") s.ko = more ? `${s.ko} ${v}`.trim() : v;
    else if (k === "열어 봄") s.opened = /못/.test(v) ? false : /됨|열림|ok/i.test(v) ? true : null;
  };
  for (const ln of lines.slice(1)) {
    const k = KEY.exec(ln.trim());
    if (k) { at = k[1]; put(at, k[2].trim(), false); continue; }
    if (at && ln.trim()) put(at, ln.trim(), true);
  }
  return s.url || s.ko || s.orig ? s : null;
}
/** 러너가 옮긴 자료 글(사람 · 봇 글은 안 셈) */
export const srcOf = (m: { kind?: string; who?: string; text?: string; files?: unknown[]; id?: string }): Src | null => {
  if (m.files?.length || m.kind !== "system" || !/러너/.test(m.who || "")) return null;
  const s = parseSrc(m.text);
  return s ? { ...s, id: m.id } : null;
};
