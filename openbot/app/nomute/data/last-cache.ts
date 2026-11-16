// 지난 값 한 장 — 화면을 열자마자 지난번에 받은 답을 먼저 그리고 뒤에서 새로 받음(빈 「읽는 중…」 칸 0)
//   형 11-17 07:0x 구름 맥 창(애들 화면 첫 뜨기 사진 = 맨 위 「읽는 중…」 · 스케줄 배선 「표 읽는 중…」 · 러너만 그려짐) 「첨에 이렇게 뜨는데 이 부분 해결해보자」
//   쓰는 꼴(react-query): queryFn: () => office(…).then((j) => lastPut(k, j)) · ...lastSeed<T>(k) — 지난 값은 「받은 때」와 함께 넣어 두니 묵었으면 열자마자 다시 받음
//   자리 = localStorage `nm-cache:last:<k>`(방 목록 · 사람표 ./room-cache.ts 와 같은 머리) · 이 기기에만 · 일주일 넘은 것은 안 씀 · 못 읽고 못 써도 화면은 그대로(서버 답을 기다림)
const HEAD = "nm-cache:last:", WEEK = 7 * 864e5;
export type Last<T> = { v: T; at: number };

/** 담아 둔 글 → 값(깨졌거나 · 받은 때가 없거나 · 너무 오래됐으면 없음) — 순수(시험 tests/last-cache.test.ts). */
export function lastRead<T>(raw: string | null | undefined, now: number, maxAge = WEEK): Last<T> | undefined {
  if (!raw) return undefined;
  try {
    const j = JSON.parse(raw) as Partial<Last<T>> | null;
    if (!j || typeof j.at !== "number" || !Number.isFinite(j.at) || j.v === undefined || j.v === null) return undefined;
    if (j.at > now + 60_000 || now - j.at > maxAge) return undefined;   // 앞날 시각 · 너무 묵은 것
    return { v: j.v as T, at: j.at };
  } catch { return undefined; }
}
export const lastWrite = <T,>(v: T, now: number): string => JSON.stringify({ v, at: now } satisfies Last<T>);

const mem = new Map<string, Last<unknown> | null>();   // 한 번 읽은 것은 다시 안 풂(큰 답 = 스케줄 표 190KB)
export function lastGet<T>(k: string): Last<T> | undefined {
  if (!mem.has(k)) { let raw: string | null = null; try { raw = localStorage.getItem(HEAD + k); } catch { /* 못 읽음 = 없음 */ } mem.set(k, lastRead<T>(raw, Date.now()) || null); }
  return (mem.get(k) as Last<T> | null) || undefined;
}
/** 새 답을 담아 둠(그리기를 안 막게 한가할 때 씀) → 받은 답 그대로 돌려줌(queryFn 끝에 물림). */
export function lastPut<T>(k: string, v: T): T {
  const at = Date.now(); mem.set(k, { v, at });
  const write = () => { try { localStorage.setItem(HEAD + k, lastWrite(v, at)); } catch { /* 가득 참 · 막힘 = 이번만 */ } };
  const idle = typeof window !== "undefined" ? (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback : undefined;
  if (idle) idle(write, { timeout: 3000 }); else setTimeout(write, 0);
  return v;
}
/** react-query 에 물리는 두 칸 — 지난 값이 있으면 그걸로 먼저 그리고(받은 때를 같이 넘겨 묵었으면 곧바로 다시 받음) · 없으면 빈 칸(평소대로 기다림). */
export const lastSeed = <T,>(k: string): { initialData: () => T | undefined; initialDataUpdatedAt: () => number | undefined } => ({ initialData: () => lastGet<T>(k)?.v, initialDataUpdatedAt: () => lastGet<T>(k)?.at });
