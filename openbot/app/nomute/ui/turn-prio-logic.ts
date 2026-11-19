// 같은 특기일 때 누구 먼저 — 순수 셈(화면 = ./turn-prio.tsx · 시험 = tests/turn-prio.test.ts)
//   형 11-19 10:06~10:08 dm-bom(봄 옮김): 「같은 특기일때 누구먼저를 설정할수잇게할게. 그러면 간단해질듯」 「상관없음 or 누구먼저. 이거를 러너에서 설정하게끔.」
//     「uxd 구름 > 시아 > 이슬 > 루미」 · 「직무가 들어간 애들끼리는 조정가능하게해주고, 근데 티어를 넘어가서 조정할 수는 없게해주면 될듯. ㅎㅎ 애초에 순서도로 표현되어 있으면 편할거같ㄴ애~」
//   티어 = 손 표 skills 순번(1특기 · 2특기 · 3특기 · 서버 _roles.js) · 차례는 같은 티어 안에서만 바뀜(티어를 넘어 옮기지 않음)
export type PrioMode = "any" | "order";
export type PrioSet = { mode: PrioMode; order: string[] };
export type Tier = { rank: number; who: string[] };
type HandRow = { who: string; skills?: string[] };

/** 그 특기를 가진 손을 티어로(빈 티어 뺌 · 같은 티어 안 = 손 표 줄 차례). */
export function tiersOf(rows: HandRow[], code: string): Tier[] {
  const out: Tier[] = [];
  for (const r of rows) {
    const k = (r.skills || []).indexOf(code);
    if (k < 0) continue;
    (out[k] ||= { rank: k + 1, who: [] }).who.push(r.who);
  }
  return out.filter(Boolean);
}

/** 저장된 차례를 티어마다 입힘 — 차례에 있는 이름 먼저(그 차례대로) · 없는 이름은 뒤에 원래 순서(새로 든 손). */
export function withOrder(tiers: Tier[], order: string[]): Tier[] {
  const at = new Map(order.map((w, i) => [w, i] as const));
  return tiers.map((t) => ({ ...t, who: t.who.map((w, i) => [w, at.get(w) ?? order.length + i] as const).sort((a, b) => a[1] - b[1]).map(([w]) => w) }));
}

/** 같은 티어 안에서만 옮김 — from · to = 그 티어 안 자리(넘치면 끝으로) · 다른 티어는 그대로. */
export function moveIn(tiers: Tier[], rank: number, from: number, to: number): Tier[] {
  return tiers.map((t) => {
    if (t.rank !== rank || from < 0 || from >= t.who.length) return t;
    const who = t.who.filter((_, i) => i !== from);
    who.splice(Math.max(0, Math.min(to, who.length)), 0, t.who[from]);
    return { ...t, who };
  });
}

/** 놓은 자리 → 그 티어 안 자리(줄마다 가운데 선 기준 · 끌던 줄은 뺀 차례). */
export function dropAt(mids: number[], y: number, from: number): number {
  let to = mids.length;
  for (let i = 0; i < mids.length; i++) if (y < mids[i]) { to = i; break; }
  return to > from ? to - 1 : to;
}

/** 서버에 적는 한 줄 차례 = 티어를 이어 붙임. */
export const flatOf = (tiers: Tier[]): string[] => tiers.flatMap((t) => t.who);
/** 바꿀 거리가 있는 특기(어느 티어든 둘 이상). */
export const reorderable = (tiers: Tier[]): boolean => tiers.some((t) => t.who.length > 1);
/** 저장할 게 바뀌었나(상관없음이면 차례는 안 봄). */
export const sameSet = (a: PrioSet, b: PrioSet): boolean => a.mode === b.mode && (a.mode === "any" || a.order.join("|") === b.order.join("|"));
