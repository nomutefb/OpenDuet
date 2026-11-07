// 쓰던 글 임시 보관(이 기기 · 창이 닫혀도 남음 · 저장하면 지움) — 뜸 11-07
//   형 11-07 10:56 봄 1:1(봄 옮김) 「응 혹시 닫히더라도, 저장하기 전에 글이 남아있어야돼 휘발안되고, 저장 하시겠스빈까? 가 떠야 보통 ux」
//   형 10:52 「저장안했는데 기록이 날아가서 당황스러운 경우넹」
const K = (k: string) => `nm-draft:${k}`;
export function draftGet<T = unknown>(k: string): T | null {
  try { const v = localStorage.getItem(K(k)); return v == null ? null : (JSON.parse(v) as T); } catch { return null; }
}
export function draftSet(k: string, v: unknown): void { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch { /* 못 적어도 창은 그대로 */ } }
export function draftDrop(k: string): void { try { localStorage.removeItem(K(k)); } catch { /* 그대로 */ } }
