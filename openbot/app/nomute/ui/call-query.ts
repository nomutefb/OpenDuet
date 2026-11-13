// 「@」 호출 명부 = 입력칸에 친 글자로 좁힘 · 띄어쓰기 · 누름 = 확정(형 11-13 22:13 봄 옮김 「@ 이거로 호출한 다음에 유사한 단어 쓰면. 그거에 맞춰서 호출자가 줄어들어야돼 …
//   내가 그 호출 명부를 클릭하거나 @가나 이런식으로 입력한 후 띄어쓰기를 하는거는 호출을 완료지은것과 같은 의미야 … @모두 하고 두 쓴담에 스페이스 누르면 창이 알아서 닫히고 @모두가 잡혀야 함」) — 순수 판(시험 길)
export type CallAgent = { id: string; name: string; description?: string };
const norm = (s: string) => s.trim().toLowerCase();

/** 커서 앞 글 → 마지막 「@」 뒤 글(없으면 null) */
export function queryAt(before: string): string | null {
  const i = before.lastIndexOf("@");
  return i < 0 ? null : before.slice(i + 1);
}

/** 친 글자로 좁힘 — 앞이 같은 이름 먼저, 그다음 이름 · 자리 안에 든 것 */
export function filterAgents<T extends CallAgent>(agents: readonly T[], q: string): T[] {
  const s = norm(q);
  if (!s) return [...agents];
  const head = agents.filter((a) => norm(a.name).startsWith(s) || norm(a.id).startsWith(s));
  const mid = agents.filter((a) => !head.includes(a) && (norm(a.name).includes(s) || norm(a.id).includes(s)));
  return [...head, ...mid];
}

/** 이름(또는 자리)이 딱 맞는 하나 */
export function exactAgent<T extends CallAgent>(agents: readonly T[], q: string): T | null {
  const s = norm(q);
  return (s && agents.find((a) => norm(a.name) === s || norm(a.id) === s)) || null;
}

/** 입력이 바뀔 때 할 일 — close(「@」 지워짐 · 맞는 이 없이 띄움) · confirm(딱 맞는 이름 + 띄어쓰기 · 지울 글자 수 = 「@」+이름+띄움) · query(좁힘) */
export function onQuery<T extends CallAgent>(agents: readonly T[], before: string): { t: "close" } | { t: "confirm"; agent: T; drop: number } | { t: "query"; q: string } {
  const q = queryAt(before);
  if (q === null) return { t: "close" };
  const m = /^(\S*)(\s)$/.exec(q);
  if (m) { const a = exactAgent(agents, m[1]); return a ? { t: "confirm", agent: a, drop: m[1].length + 2 } : { t: "close" }; }
  if (/\s/.test(q)) return { t: "close" };
  return { t: "query", q };
}
