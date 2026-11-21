// 캐시 비우기 셈(설정 「기록·정보 › 캐시 비우기」 · 예타 원본 「캐시 비우기 — 읽음·로컬 캐시 정리」 · 형 11-18) — 화면 없이 시험되게 따로
//   형 11-21 봄 창 「캐시 비우기에 계정 값 관련된 내용은 지워지더라도 이와 별개로 지워지게 해줘 (캐시 지워도 안지워지게)」 「캐시 지우기가 정확히 어디까지 지우는지를 모르겠네」
//   → 지우는 칸을 이름으로 못 박음(아래 WIPES) · 그 밖은 다 그대로 = 새 칸이 생겨도 여기 안 적으면 안 지워짐(계정 값이 딸려 지워질 길 0)
/** 지우는 것 — 다시 받으면 그대로 돌아오는 것만
 *   ① 지난 화면 값 = localStorage `nm-cache:*`(방 목록 · 사람표 · 봇 현황 · 스케줄 마지막 값)
 *   ② 받아 둔 앱 조각 = 앱 뼈대 · 묶음(garden-app-shell · assets) · 얼굴 그림 · 글꼴(garden-app-static) · 알림 그림(office-notif-icons)
 *   ③ 받아 둔 파일(nm-files · 7일 치) + 그 목록 표(nm_files_idx)
 *  안 지우는 것 — 계정 · 로그인(쿠키 · 팀즈 · PIN 잠금 · 보안 서랍) · 설정 값 · 쓰던 글 · 붙이던 파일(garden-app-att) · 받던 공유(garden-app-meta)
 *   · 받은 대화(IndexedDB nm-office) · 알림 구독(서비스 워커 등록) · 웹 탭 · 여기 안 적힌 모든 칸 */
export const WIPES = /^(?:garden-app-shell(?:-|$)|garden-app-assets(?:-|$)|garden-app-static(?:-|$)|office-notif-icons$|nm-files$)/;
export const wipes = (cacheName: string): boolean => WIPES.test(cacheName);
const FILES_IDX = "nm_files_idx";   // data/file-cache.ts 목록 표(파일 칸을 비우면 표도 같이 = 없는 파일을 있다고 안 읽게)

export async function wipeCache(store: Pick<Storage, "length" | "key" | "removeItem">, cacheNames: () => Promise<string[]>, drop: (n: string) => Promise<unknown>): Promise<number> {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) { const k = store.key(i); if (k && k.startsWith("nm-cache:")) keys.push(k); }
  keys.forEach((k) => store.removeItem(k));
  const names = (await cacheNames().catch(() => [] as string[])).filter(wipes);
  await Promise.all(names.map((n) => drop(n).catch(() => undefined)));
  if (names.includes("nm-files")) store.removeItem(FILES_IDX);
  return keys.length + names.length;
}
