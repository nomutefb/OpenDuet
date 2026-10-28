// 방마다 받은 글 = 이 기기 저장(IndexedDB · 형 10-28 15:38 「캐시화 하고 뒤늦게 받아오는거로 동기화를」 · 장부 office-chat-read.md 4번)
//   열면 여기 둔 글을 먼저 그림 → 뒤에서 서버 since=<마지막 글 시각> 으로 새 글만 받아 붙임(카톡 꼴) · 글은 쓴 뒤 안 바뀜(반응·읽음·상태는 따로 받음)
//   방마다 마지막 KEEP 글만 · 못 열면(사생활 창·저장 막힘) = 없는 것으로(서버에서 받음 · 오류 0)
const DB = "nm-office", STORE = "rooms", KEEP = 300;
export type CachedPage<M> = { messages: M[]; more: boolean; at: number };

let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }).catch((e) => { dbp = null; throw e; });
  return dbp;
}

export async function loadRoom<M>(room: string): Promise<CachedPage<M> | null> {
  try {
    const d = await db();
    return await new Promise((res) => {
      const q = d.transaction(STORE, "readonly").objectStore(STORE).get(room);
      q.onsuccess = () => { const v = q.result as CachedPage<M> | undefined; res(v && Array.isArray(v.messages) ? v : null); };
      q.onerror = () => res(null);
    });
  } catch { return null; }
}

export async function saveRoom<M>(room: string, page: { messages: M[]; more: boolean }): Promise<void> {
  try {
    const d = await db(), cut = page.messages.length > KEEP;
    await new Promise<void>((res) => {
      const t = d.transaction(STORE, "readwrite");
      t.objectStore(STORE).put({ messages: page.messages.slice(-KEEP), more: page.more || cut, at: Date.now() } satisfies CachedPage<M>, room);
      t.oncomplete = () => res(); t.onerror = () => res(); t.onabort = () => res();
    });
  } catch { /* 저장 못 함 = 다음에 서버에서 */ }
}

/** 방 목록·사람표 = 이 기기에 한 장씩(localStorage · 열자마자 「누구와의 방」을 알게 = 저장한 글이 먼저 그려질 때 봇 글이 묶음으로 접혀 보이지 않게) · 받으면 바로 바꿔 둠 */
export function listGet<T>(k: "rooms" | "people"): T | undefined {
  try { const s = localStorage.getItem(`nm-cache:${k}`); return s ? (JSON.parse(s) as T) : undefined; } catch { return undefined; }
}
export function listPut<T>(k: "rooms" | "people", v: T): T {
  try { localStorage.setItem(`nm-cache:${k}`, JSON.stringify(v)); } catch { /* 이번만 */ }
  return v;
}
