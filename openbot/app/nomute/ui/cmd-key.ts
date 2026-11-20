// 명령 팔레트 여는 키(⌘K · Ctrl+K) — 앱이 뜰 때 이 한 줄 듣기만 실림 · 판(./cmd-palette.tsx)은 따로 떨어진 묶음(한가할 때 한 번 미리 받음 · 가만히 둔 화면 = 도는 것 0)
import { isOpenKey } from "./cmd-core";

const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
if (typeof window !== "undefined") {
  // 판 묶음(4KB) = 앱이 다 뜬 뒤 한가할 때 한 번 미리 받아 둠(그리지는 않음) — 처음 ⌘K 에서 받느라 첫 글자를 놓치지 않게
  let mod: { togglePalette: () => void } | null = null;
  const load = () => import("./cmd-palette").then((m) => (mod = m));
  const warm = () => { void load().catch(() => { /* 못 받음 = 누를 때 다시 */ }); };
  const idle = () => { const w = window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }; if (w.requestIdleCallback) w.requestIdleCallback(warm, { timeout: 8000 }); else window.setTimeout(warm, 4000); };   // window 에 붙여 부름(떼어 부르면 Illegal invocation)
  if (document.readyState === "complete") idle(); else window.addEventListener("load", idle, { once: true });
  window.addEventListener("keydown", (e) => {
    if (!isOpenKey(e, mac)) return;
    e.preventDefault(); e.stopPropagation();
    if (mod) mod.togglePalette();   // 받아 둔 뒤 = 이 키 처리 안에서 바로 뜸(다음 글자가 판보다 먼저 오지 않음)
    else void load().then((m) => m.togglePalette()).catch(() => { /* 못 받음 */ });
  }, true);
}
