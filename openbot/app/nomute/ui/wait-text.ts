// 읽는 중 · 못 읽음 글 한 벌(형 11-15 「하네스 따로 노는 거」 · 「손 안 댄 것도 고쳐줘」)
//   전 = 「받는 중…」「불러오는 중」「표 읽는 중」… 열다섯 가지 · 못 읽으면 서버 글만 덩그러니 뜨는 자리가 있었음
//   꼴 = 「[무엇] 읽는 중…」 / 「[무엇을] 못 읽었어 — 다시 열어 줘 (까닭)」 = 무엇 — 다음 행동 · 까닭은 꼬리
const closed = (w: string) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; };   // 끝 글자 받침
export const reading = (what = "") => `${what ? what + " " : ""}읽는 중…`;
export const whyOf = (e: unknown) => (e instanceof Error ? e.message : String(e ?? "")).trim().slice(0, 80);
export const readFail = (e: unknown, what = "") => {
  const why = whyOf(e);
  return `${what ? what + (closed(what) ? "을" : "를") + " " : ""}못 읽었어 — 다시 열어 줘${why ? ` (${why})` : ""}`;
};
