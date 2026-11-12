// 같이 보기(형 11-12 13:17 봄 1:1 「글구 맥은 바로 진행하자. 브라우저」 · 봄 13:21 「화상채팅에서 화면공유」 · 13:54 깃 다리 문) — 순수 판(.ts · node 시험 길)
//   서버 POST cobrowse/ticket = 형만 · 맥 72 다리 주소 + 2분 한 번 표 → 오른쪽 칸 iframe · 다리에 못 닿음(테일넷 밖 등) = 지금 웹 칸 꼴로 조용히
export const COBROWSE_EVENT = "nm-cobrowse";
/** 들머리(회의실 단추 · 어디서든) → 탭 줄이 「같이 보기」 탭을 엶 */
export const openCobrowse = (w: Pick<Window, "dispatchEvent"> = window) => { w.dispatchEvent(new Event(COBROWSE_EVENT)); };
/** 서버 답 → 띄울 주소(https · ts.net · 표 붙음)만 · 아니면 "" */
export function cobrowseSrc(d: unknown): string {
  const u = (d as { url?: unknown } | null)?.url;
  if (typeof u !== "string") return "";
  try { const x = new URL(u); return x.protocol === "https:" && /\.ts\.net$/.test(x.hostname) && x.searchParams.get("t") ? x.href : ""; } catch { return ""; }
}
/** 닿나 재기 — 문지기 origin 을 no-cors 로 한 번(표 안 씀 · 403 도 닿은 것) · 그물 끊김 · 시간 넘김 = false */
export async function reachable(url: string, f: typeof fetch = fetch, ms = 4000): Promise<boolean> {
  let origin = ""; try { origin = new URL(url).origin; } catch { return false; }
  const ac = typeof AbortController === "function" ? new AbortController() : null;
  const t = setTimeout(() => ac?.abort(), ms);
  try { await f(origin + "/", { mode: "no-cors", cache: "no-store", ...(ac ? { signal: ac.signal } : {}) }); return true; } catch { return false; } finally { clearTimeout(t); }
}
/** 크롬 「로컬 네트워크 접근」(LNA) 권한 — 공개 사이트 틀이 테일넷(100.x) 문에 닿으려면 형이 한 번 허용해야 함(뜸 11-12 14:2x 실물: 권한 없음 = 틀 깨짐 · 줌 = 맥 72 화면 뜸)
 *  granted · prompt · denied · unknown(못 물음 = 옛 브라우저 · 막지 않음) */
export async function lnaState(nav: { permissions?: { query: (d: { name: string }) => Promise<{ state: string }> } } = globalThis.navigator as never): Promise<string> {
  for (const name of ["local-network-access", "local-network"]) {
    try { const r = await nav?.permissions?.query({ name }); if (r?.state) return r.state; } catch { /* 이 이름 모름 */ }
  }
  return "unknown";
}
/** 틀 allow — 부모가 받은 LNA 권한을 틀에 넘김 */
export const CO_ALLOW = "local-network-access; local-network; loopback-network; clipboard-read; clipboard-write; fullscreen";
/** 닿나 재는 시간 — 권한을 물어야 하면(형이 누를 동안) 길게 */
export const reachWait = (lna: string) => (lna === "granted" || lna === "unknown" ? 5000 : 45000);
