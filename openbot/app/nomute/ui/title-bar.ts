// 탭 줄 = 창 맨 위 제목 줄(형 11-16 07:56 dm-bom 「봄의 정원 옆에 탭이 보이네? 이 웹앱 자체가 탭 기능을 하게 설계가 되어버린거 같은데 … 그러면 브라우저는 일단 필요없는거 같은데」
//   · 「탭을 저 위로 붙일수도있는거야? 그러면 지금 아래부분을 메뉴로 설계하려고해.」 · 07:58 「윈도우 화면이 맥에 맞춰지면 되긴하는데」 · 봄 08:03 · 뜸 맥 앱 약속 ①②③④)
//   맥 독 앱(뜸 tools/office-mac/main.swift) = <html class="nm-macapp"> + --nm-mac-left(신호등 자리) · 끌기 = webkit nmWin "drag" · 두 번 = "zoom" · 새 창 링크 = window.__nmOpenTab(url)
//   윈도우 PWA = manifest display_override window-controls-overlay → CSS env(titlebar-area-*) 로 창 단추 자리 비킴 · 끌기 = app-region(./tab-bar.css)
//   먹는 것 = 0(누를 때만 · 늘 도는 것 없음)
type NmWin = { postMessage: (m: string) => void };
const nmWin = (): NmWin | null => {
  try { return ((window as unknown as { webkit?: { messageHandlers?: { nmWin?: NmWin } } }).webkit?.messageHandlers?.nmWin) || null; } catch { return null; }
};
export const isMacApp = (): boolean => typeof document !== "undefined" && document.documentElement.classList.contains("nm-macapp");

/** 제목 줄 빈 자리인가 — 탭 줄 바탕 · 잉크 · 끌기 띠만(탭 · 단추 · 글 = 아님) */
export const isTitleGap = (el: Element | null): boolean => !!el && (el.classList.contains("nm-tabs") || el.classList.contains("nm-tabs-ink") || el.classList.contains("nm-tb-drag"));

/** 맥 앱: 빈 자리 누름 = 창 끌기 · 두 번 = 창 키우기(맥 「zoom」) · 그 밖(브라우저 · 윈도우) = 아무것도 안 함(윈도우는 CSS app-region 이 맡음) */
export function wireTitleBar(): () => void {
  if (!isMacApp()) return () => {};
  document.documentElement.classList.add("nm-macapp-ready");   // 뜸 ④ = 이 판이 신호등 자리를 받음 → 맥 앱이 body 위 28px 안전줄을 걷음
  const down = (e: MouseEvent) => { if (e.button === 0 && e.detail < 2 && isTitleGap(e.target as Element)) nmWin()?.postMessage("drag"); };
  const dbl = (e: MouseEvent) => { if (isTitleGap(e.target as Element)) nmWin()?.postMessage("zoom"); };
  document.addEventListener("mousedown", down, true);
  document.addEventListener("dblclick", dbl, true);
  return () => { document.removeEventListener("mousedown", down, true); document.removeEventListener("dblclick", dbl, true); };
}

/** 맥 앱이 새 창 링크를 넘길 때(뜸 ③) — http(s) 만 · 열면 true · 아니면 false(맥 앱이 기본 브라우저로) */
export const okTabUrl = (u: unknown): u is string => typeof u === "string" && /^https?:\/\//i.test(u) && u.length < 4096;
