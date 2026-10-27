// 진입점 — 원본 main.tsx 보다 먼저 우리 서버 잇기(shim)를 깐다 · 동기화(pulse) · 홈 화면 앱(PWA) 서비스 워커 · 새 판 알림
import "./shim/install";
import "@/main";
import { startSync } from "./data/sync";

startSync();

/** 「새 판 나왔어 · 눌러서 새로 고침」(옛 화면 17차와 같은 말) — 새 서비스 워커가 자리를 잡으면 한 번 */
function newVersionPill() {
  if (document.getElementById("nm-ver")) return;
  const b = document.createElement("button");
  b.id = "nm-ver";
  b.type = "button";
  b.textContent = "새 판 나왔어 · 눌러서 새로 고침";
  b.className = "fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg";
  b.addEventListener("click", () => location.reload());
  document.body.append(b);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (had) newVersionPill(); });
    try {
      const reg = await navigator.serviceWorker.register("/office-app/sw.js", { scope: "/office-app/" });
      document.addEventListener("visibilitychange", () => { if (!document.hidden) void reg.update().catch(() => {}); });
      setInterval(() => void reg.update().catch(() => {}), 10 * 60e3);
    } catch { /* 설치 앱만 빠짐 · 화면은 그대로 */ }
  });
}
