// 옛 판 조각을 못 찾는 깨짐에서 스스로 빠져나오기(형 11-14 22:10 「정원안열린다」 · 깃 오더 #-0004 · 뎅)
//   = 형 맥 「봄의 정원」(WKWebView)이 옛 첫 화면을 캐시(서비스 워커 · 웹 캐시)에서 받아, 새 판에서 지워진 조각을 부르다 통째 깨짐 → 다시 읽어도 같은 옛 첫 화면
//   → 서비스 워커 · 캐시 저장소만 비우고(쿠키 · 로그인 · localStorage 손 0 · 첨부 미리보기 캐시는 남김) 새 주소로 한 번 · 2분에 한 번만(되풀이 0)
const CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError/i;

export const isChunkErr = (e: unknown) => CHUNK.test(String((e as { message?: string } | null)?.message ?? e ?? ""));

export async function hardFresh(): Promise<boolean> {
  try {
    const last = +(sessionStorage.getItem("nm-hard-fresh") || 0);
    if (Date.now() - last < 120_000) return false;
    sessionStorage.setItem("nm-hard-fresh", String(Date.now()));
  } catch { /* 저장 못 하면 이번만 */ }
  try { for (const r of (await navigator.serviceWorker?.getRegistrations?.()) || []) await r.unregister(); } catch { /* 없음 */ }
  try { for (const k of await caches.keys()) if (k !== "office-app-att") await caches.delete(k); } catch { /* 없음 */ }
  const u = new URL(location.href);
  u.searchParams.set("fresh", String(Date.now()));
  location.replace(u.toString());
  return true;
}
