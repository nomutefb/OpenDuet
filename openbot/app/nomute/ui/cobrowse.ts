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
