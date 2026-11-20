// SNS 탭 오른쪽 칸 = 껍데기 앱(맥 · 윈도우)의 진짜 웹뷰를 이 칸 자리에 겹쳐 띄움 — 인스타 · 스레드 · X 는 앱 안 끼움(iframe)을 막음(X-Frame-Options DENY · SAMEORIGIN · 11-20 09:21 실물)
//   (형 11-20 09:20 dm-bom 봄 옮김 「그리고 맨 위 탭에 기본적으로 인스타그램이랑 스레드 떠있어서, 내 인스타그램이랑 스레드 볼 수 있었으면 좋겠음. x 까지. 아니면 어짜피 9대 16비율로 보면 되니까. SNS 탭을 누르면 대화는 유지되고, (좌측에) 우측에 인스타랑 그런거 뜨게해주라」 · 봄 ① = 껍데기 앱 옆 칸 웹뷰)
//   다리(웹 → 껍데기) = { t: "nm-side", on: true, site, url, rect: {x,y,w,h}(이 화면 CSS px · getBoundingClientRect), vw, vh } · 끝 = { t: "nm-side", on: false }
//     맥 앱 = window.webkit.messageHandlers.nmSide.postMessage(o)(처리기가 있으면 = 됨) · 윈도우 앱(WebView2) = window.chrome.webview.postMessage(o)(window.__nmSide 가 있을 때만) · 껍데기 → 웹(있으면) = window 이벤트 「nm-side」 detail { state, site }
//   순수 부분만 여기(시험 tests/sns-side.test.ts) · 화면 = ./sns-side-pane.tsx
export type SnsSite = "instagram" | "threads" | "x";
export const SNS_SITES: readonly { id: SnsSite; name: string; url: string }[] = [
  { id: "instagram", name: "Instagram", url: "https://www.instagram.com/" },
  { id: "threads", name: "Threads", url: "https://www.threads.com/" },
  { id: "x", name: "X", url: "https://x.com/home" },
];
export const SNS_SITE_KEY = "nm-sns-site";   // 마지막에 고른 곳(이 기기)
export const siteOf = (v: unknown): SnsSite => (SNS_SITES.some((s) => s.id === v) ? (v as SnsSite) : "instagram");
export type SideRect = { x: number; y: number; w: number; h: number };
export type SideMsg = { t: "nm-side"; on: true; site: SnsSite; url: string; rect: SideRect; vw: number; vh: number } | { t: "nm-side"; on: false }
  | { t: "nm-side-go"; site: SnsSite; url: string }   // 대화 카드 누름 = 그 곳 웹뷰를 그 글로(형 11-20 10:16 · 미토스 ①)
  | { t: "nm-side-pick"; id: string; js: string };   // 대화로 보내기 = 지금 곳 웹뷰에서 js(= /garden-app/sns-pick.js · 「(function(mode){…})」 꼴)를 mode "pick" 으로 돌리고 rect 만큼 찍어 돌려줌 → 「flash」 로 한 번 더
/** 껍데기 → 웹 = window 이벤트 「nm-side」 detail
 *  { state: "pick", id, ok, site, url, author, text, img: "data:image/jpeg;base64,…" } = 집은 글 · { state: "pick-key" } = 웹뷰 안에서 ⌘⏎ / Ctrl+⏎ 눌림(웹이 집기를 시작) */
export type SidePick = { state: "pick"; id: string; ok: boolean; site?: string; url?: string; author?: string; text?: string; img?: string; why?: string };
export const SIDE_EVENT = "nm-side";
export const SNS_GO_EVENT = "nm-sns-go";   // 대화 카드 → SNS 탭(./tab-bar.tsx) + 그 곳 · 그 글(./sns-side-pane.tsx)
let pendingGo: { site: SnsSite; url: string } | null = null;   // 칸이 아직 없을 때(SNS 탭이 아님) = 칸이 뜨면 가져감
export const snsGo = (site: SnsSite, url: string) => { pendingGo = { site, url }; window.dispatchEvent(new CustomEvent(SNS_GO_EVENT, { detail: { site, url } })); };
export const takeGo = () => { const g = pendingGo; pendingGo = null; return g; };
/** 칸 자리 → 다리 글(정수로 · 화면 밖으로 넘친 쪽은 잘라 냄) */
export function sideMsg(site: SnsSite, r: { left: number; top: number; width: number; height: number }, vw: number, vh: number): SideMsg {
  const x = Math.max(0, Math.round(r.left)), y = Math.max(0, Math.round(r.top));
  const w = Math.max(0, Math.min(Math.round(r.width), vw - x)), h = Math.max(0, Math.min(Math.round(r.height), vh - y));
  return { t: "nm-side", on: true, site, url: SNS_SITES.find((s) => s.id === site)!.url, rect: { x, y, w, h }, vw: Math.round(vw), vh: Math.round(vh) };
}
type W = { webkit?: { messageHandlers?: { nmSide?: { postMessage: (o: unknown) => void } } }; chrome?: { webview?: { postMessage: (o: unknown) => void } }; __nmSide?: unknown };
/** 껍데기 다리(맥 · 윈도우) — 없으면 null(그냥 브라우저 · 폰) */
export function sideBridge(w: unknown = typeof window !== "undefined" ? window : undefined): ((o: SideMsg) => void) | null {
  const x = w as W | undefined;
  const mac = x?.webkit?.messageHandlers?.nmSide;
  if (mac) return (o) => mac.postMessage(o);
  const win = x?.chrome?.webview;
  if (win && x?.__nmSide) return (o) => win.postMessage(o);   // 윈도우 앱 = 옆 칸을 지은 판만(껍데기가 문서 시작에 window.__nmSide = 1 · 옛 판은 chrome.webview 만 있어 신호가 허공으로 감 = 그땐 「앱에서 떠요」 안내)
  return null;
}
