// 캐시 비우기 셈(설정 「기록·정보 › 캐시 비우기」 · 예타 원본 「캐시 비우기 — 읽음·로컬 캐시 정리」 · 형 11-18) — 화면 없이 시험되게 따로
/** 이 기기의 지난 화면 값(nm-cache:*) + 받아 둔 앱 조각(CacheStorage)을 지우고 새로 받음
 *  안 건드림: 설정 값 · 쓰던 글 · 알림 구독(서비스 워커 등록은 그대로 = 알림이 안 끊김) */
export async function wipeCache(store: Pick<Storage, "length" | "key" | "removeItem">, cacheNames: () => Promise<string[]>, drop: (n: string) => Promise<unknown>): Promise<number> {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) { const k = store.key(i); if (k && k.startsWith("nm-cache:")) keys.push(k); }
  keys.forEach((k) => store.removeItem(k));
  const names = await cacheNames().catch(() => [] as string[]);
  await Promise.all(names.map((n) => drop(n).catch(() => undefined)));
  return keys.length + names.length;
}
