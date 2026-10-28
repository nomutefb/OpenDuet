// 앱 밖 주소 받기(공용 길 · 형 10-28 15:32 「모두 누르면 앱 내에서 작동되게해줘. 그니까 가져오는거야 거기있는거를」 · 15:33 「그대로 가져와서 여기 톤에 녹인다고」)
//   누르면 웹으로 나가던 칸 → 앱 안: /office-app/… = 그 판 · 그 밖(에디터 원본 화면·기사·곡) = #/web?u=<주소> 모달(껍데기 ui/shell.tsx WebLayer · 「<」 = 앞 판 그대로)
//   이름·꼴 = claude-state assign/2026-10-28/office-inapp.md 「바뀜」 15:5x(보조 02 대화창 · 03 에디터 판이 받아 씀)
const APP = "/office-app/";

/** 우리 저장소 이슈·반영 요청 = 앱 안 「< 이슈 N」 판(GitHub 은 품기를 막고 저장소가 비공개 → 서버가 대신 읽음 · PM 16:09) */
const ISSUE = /^https?:\/\/github\.com\/nomutefb\/editor\/(?:issues|pull)\/(\d+)\/?(?:[?#].*)?$/i;
/** 품기를 막는 사이트(X-Frame-Options·frame-ancestors 실측 10-28) — 앱 안에 띄우면 빈 막힘 화면뿐이라 원래대로 둠(까닭 = 그 사이트가 막음) */
const NO_FRAME = /(^|\.)(github\.com|naver\.com|instagram\.com|facebook\.com|x\.com|twitter\.com)$/i;
/** 보는 주소는 막아도 퍼가기 주소는 여는 사이트 → 퍼가기 주소로 바꿔 품음(실측 10-28 = 유튜브 /embed · Suno /embed 허용) */
const EMBED: [RegExp, (id: string) => string][] = [
  [/^https?:\/\/(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/)([\w-]{6,})/i, (id) => `https://www.youtube.com/embed/${id}`],
  [/^https?:\/\/youtu\.be\/([\w-]{6,})/i, (id) => `https://www.youtube.com/embed/${id}`],
  [/^https?:\/\/(?:www\.)?suno\.com\/song\/([0-9a-f-]{8,})/i, (id) => `https://suno.com/embed/${id}`],
];

/** 앱 안 판 길 글자(라우터 길 · 링크 href 에 쓸 때는 앞에 「#」) — 앱 안에 못 들이는 주소면 null(원래대로 둠) */
export function inAppHref(raw: string, base: string = location.href): string | null {
  let u: URL;
  try { u = new URL(raw, base); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;   // mailto·tel·blob·data = 원래대로
  if (u.origin === location.origin) {
    if (u.pathname.startsWith(APP)) return u.hash.replace(/^#/, "") || "/";
    return `/web?u=${encodeURIComponent(u.pathname + u.search + u.hash)}`;
  }
  const iss = u.href.match(ISSUE);
  if (iss) return `/issue/${iss[1]}`;
  if (NO_FRAME.test(u.hostname)) return null;
  return `/web?u=${encodeURIComponent(u.href)}`;
}

/** 앱 안으로 엶(해시 길 = 라우터가 받음) — 못 들이면 false(부른 쪽이 원래대로) */
export function openInApp(raw: string, base?: string): boolean {
  const h = inAppHref(raw, base);
  if (h == null) return false;
  location.hash = `#${h}`;
  return true;
}

/** #/web 의 u → iframe 에 넣을 주소(퍼가기 바꿈) · 같은 출처 = 경로 그대로 */
export function frameUrl(u: string): string {
  for (const [re, to] of EMBED) { const m = u.match(re); if (m) return to(m[1]); }
  return u;
}

/** 누른 링크가 앱 밖으로 나가는 꼴이면 앱 안으로(target=_blank·_top · 남의 사이트 · 앱 문서에선 /office-app/ 밖 길) — 다른 손이 이미 막은 클릭·꾹 누름 조합·내려받기는 그대로 */
function onLink(e: MouseEvent, base: string, top: boolean) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.hasAttribute("download") || a.hasAttribute("data-nm-out")) return;
  const t = (a.getAttribute("target") || "").toLowerCase();
  let u: URL;
  try { u = new URL(a.getAttribute("href") || "", base); } catch { return; }
  const leaves = (t !== "" && t !== "_self") || u.origin !== location.origin || (top && !u.pathname.startsWith(APP));
  if (leaves && openInApp(u.href)) e.preventDefault();
}

/** 앱 문서 전체 링크 받기(껍데기가 한 번 부름) — 대화창·할 일·에디터 판 등 파일마다 고칠 것 0 */
export function listenAppLinks(): () => void {
  const on = (e: MouseEvent) => onLink(e, location.href, true);
  document.addEventListener("click", on);   // 거품 단계 = 라우터 Link 가 먼저 막은 클릭은 건너뜀
  return () => document.removeEventListener("click", on);
}

/** 품은 화면(같은 출처 iframe) 안 링크·window.open 을 앱 안으로 — 불러올 때마다 다시 걺 · 남의 사이트 iframe 은 손댈 수 없어 그대로 */
export function hookFrame(el: HTMLIFrameElement | null): () => void {
  if (!el) return () => {};
  const arm = () => {
    let w0: (Window & { __nmOpen0?: Window["open"] }) | null = null, d0: (Document & { __nmInApp?: boolean }) | null = null;
    try { w0 = el.contentWindow; d0 = el.contentDocument; } catch { return; }
    if (!w0 || !d0 || d0.__nmInApp) return;   // 표식 = 문서에(처음 빈 문서 → 같은 출처 화면이면 창은 그대로 쓰이고 문서만 바뀜)
    const w = w0;
    d0.__nmInApp = true;
    d0.addEventListener("click", (e) => onLink(e, w.location.href, false));
    const open0 = (w.__nmOpen0 ||= w.open.bind(w));
    w.open = ((u?: string | URL, t?: string, f?: string) => (u && openInApp(String(u), w.location.href) ? null : open0(u, t, f))) as typeof w.open;
  };
  el.addEventListener("load", arm);
  arm();
  return () => el.removeEventListener("load", arm);
}

/** YETA 톤(ui/yeta-settings.css 값과 같음) — 에디터 원본 화면(modern-tokens.css 의 --modern-* 를 쓰는 화면 = 뉴스 덱·결의 방·토큰·피드백)에 덧씌움 · 화면 바탕 = 비움(앱 바탕이 비침) · --modern-space-bg = YETA 바탕색(토큰 진한 칸 글자처럼 「바탕색 글자」가 안 사라지게) */
export const yetaTone = (dark: boolean) => `:root{color-scheme:${dark ? "dark" : "light"};--modern-space-bg:${dark ? "#161716" : "#ffffff"};--modern-page:transparent;--modern-stage:transparent;
--modern-fg:${dark ? "#FFFFFF" : "#161716"};--modern-ink:${dark ? "#FFFFFF" : "#161716"};--modern-mut:${dark ? "#8B8F8A" : "#6f736e"};--modern-muted:${dark ? "#8B8F8A" : "#6f736e"};
--modern-accent:${dark ? "#CFFF40" : "#4f7a00"};--modern-accent-rgb:${dark ? "207,255,64" : "79,122,0"};--modern-on-accent:${dark ? "#161716" : "#ffffff"};
--modern-line:${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"};--modern-line2:${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"};
--modern-glass-edge:${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"};--modern-glass-highlight:${dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.6)"};
--modern-card:${dark ? "rgba(255,255,255,.005)" : "rgba(0,0,0,.02)"};--modern-glass2:${dark ? "rgba(255,255,255,.005)" : "rgba(0,0,0,.02)"};
--modern-well:${dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"};--modern-control-glass:${dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"};
--modern-modal-head-bg:${dark ? "rgba(22,23,22,.85)" : "rgba(255,255,255,.85)"};--modern-action-symbol:${dark ? "#fff" : "#161716"};
--modern-silk-glass:${dark ? "rgba(255,255,255,.005)" : "rgba(0,0,0,.02)"};--modern-panel-shadow:inset 0 1px 0 ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"},0 24px 60px rgba(0,0,0,${dark ? ".42" : ".08"})}
html,body{background:transparent!important}`;

/** 품은 화면에 톤 입힘(불러올 때마다 · 앱 어둡게·밝게 바뀌면 다시) — extra = 그 화면만의 덧줄 */
export function toneFrame(el: HTMLIFrameElement | null, extra: string | ((dark: boolean) => string) = ""): () => void {
  if (!el) return () => {};
  const paint = () => {
    let doc: Document | null = null;
    try { doc = el.contentDocument; } catch { return; }
    if (!doc || !doc.head) return;
    let s = doc.getElementById("nm-yeta-tone") as HTMLStyleElement | null;
    if (!s && !doc.defaultView?.getComputedStyle(doc.documentElement).getPropertyValue("--modern-fg").trim()) return;   // --modern-* 를 안 쓰는 화면 = 덧씌우면 글이 안 보일 수 있어 그대로
    if (!s) { s = doc.createElement("style"); s.id = "nm-yeta-tone"; doc.head.appendChild(s); }
    const dark = document.documentElement.classList.contains("dark");
    s.textContent = yetaTone(dark) + "\n" + (typeof extra === "function" ? extra(dark) : extra);
  };
  el.addEventListener("load", paint);
  paint();
  const mo = new MutationObserver(paint);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => { el.removeEventListener("load", paint); mo.disconnect(); };
}
