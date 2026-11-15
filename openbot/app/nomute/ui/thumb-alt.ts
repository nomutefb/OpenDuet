// 뉴스 카드 그림 다음 길(R2 넘침 앞단 ① · 봄 11-15 20:27 형 결정 · 설계 = claude-state 공통/문서/2026-11-15/R2-넘침 · 시아)
//   첫 장이 R2 사본(img)인데 지워져 404 면 원본 주소(url)로 한 번 · 그것도 없거나 깨지면 숨김 = 지금 「그림 없음」 빈 칸 꼴
type T = { img?: string; url?: string };
type A = { cards?: { thumb_gen?: T[]; thumb_search?: T[] } };
const abs = (u?: string) => { const s = String(u || "").trim(); return !s ? "" : /^(https?:|data:|blob:|\/)/i.test(s) ? s : "/" + s; };
const has = (t?: T) => !!abs(t?.img || t?.url);

/** 목록 썸네일(thumbOf 와 같은 첫 장)의 다음 길 · 없으면 "" */
export function thumbAltOf(a: A): string {
  const c = a.cards || {}, t = (c.thumb_gen || []).find(has) || (c.thumb_search || []).find(has);
  const alt = t && t.img && t.url ? abs(t.url) : "";
  return alt && alt !== abs(t?.img) ? alt : "";
}
/** <img onError> 한 길 — 다음 길이 있으면 한 번 갈아 끼우고 · 없거나 그것도 깨지면 숨김 */
export const thumbFail = (alt: string) => (e: { currentTarget: HTMLImageElement }) => {
  const el = e.currentTarget;
  if (alt && el.dataset.alt !== "1") { el.dataset.alt = "1"; el.src = alt; } else el.hidden = true;
};
