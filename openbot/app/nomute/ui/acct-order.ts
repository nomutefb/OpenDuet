// 계정 카드 차례(뜸 11-09 · 모루 09:13 d4ea93c 짚음) — 카드 차례(앞에 둘 칸)와 「지금 러너 계정」 표시를 뗌:
//   known = 받은 id 가 계정 표에 있음(조회 중 · 실패 · 빈 값 · 모르는 id = 아님) · 「지금」·선택됨·비활성은 known 일 때만
export function acctOrder(ids: string[], id: string) {
  const at = ids.indexOf(id), known = at >= 0, front = known ? at : 0;
  return { known, front, order: ids.map((_, i) => ids[(front + i) % ids.length]) };
}
