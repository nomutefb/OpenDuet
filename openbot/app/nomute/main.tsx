// 진입점 — 원본 main.tsx 보다 먼저 우리 서버 잇기(shim)를 깐다 · 동기화(pulse) · 홈 화면 앱(PWA) 서비스 워커 · 새 판 저절로 다시 읽기
import "./shim/install";
import "@/main";
import { startSync } from "./data/sync";

startSync();

/* 새 판 저절로 다시 읽기(형 10-28 09:44 「새판 나오면 설치되어있는 웹앱이라도 자동으로 강제새로고침되서 고쳐지게」)
   · 이 판 번호 = 빌드 때 박은 __NM_BUILD__ · 지금 올라간 판 = /office-app/version.json(빌드 때 같이 나옴 · 캐시 0)
   · 묻는 때 = 1분마다(화면이 보일 때) · 다시 앞으로 올 때 · 서비스 워커가 새 판을 받았을 때
   · 다르면 다시 읽기 — 단, 형이 글칸에 쓰는 중(글이 있음)·입력칸에 커서가 있으면 빌 때까지 미룸(쓰던 글 날림 0 · 5초마다 다시 봄) */
declare const __NM_BUILD__: string;
const BUILD = __NM_BUILD__;

/** 쓰던 글이 있나 = 글칸에 글자가 있음(커서만 있고 비었으면 아님 — 대화창 글칸은 열리자마자 커서를 잡아서 「커서 = 쓰는 중」이면 영영 안 읽혔음 · 10-28 11:17 실측) */
function busyTyping() {
  if ([...document.querySelectorAll<HTMLElement>('[contenteditable="true"]')].some((e) => (e.textContent || "").trim() !== "")) return true;
  const a = document.activeElement;
  return (a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement) && a.value.trim() !== "";
}

let pending = false;
function reloadWhenFree() {
  if (pending) return;
  pending = true;
  const go = () => { if (busyTyping()) { setTimeout(go, 5000); return; } location.reload(); };
  go();
}

async function checkBuild() {
  if (document.hidden || pending) return;
  try {
    const r = await fetch(`/office-app/version.json?t=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
    if (!r.ok) return;
    const j = (await r.json()) as { build?: string };
    if (j.build && j.build !== BUILD) reloadWhenFree();
  } catch { /* 끊김 = 다음 차례 */ }
}

(window as unknown as { __nmBuild: string }).__nmBuild = BUILD;   // 지금 이 화면 판(확인용)
setInterval(() => void checkBuild(), 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) void checkBuild(); });
window.addEventListener("focus", () => void checkBuild());

if ("serviceWorker" in navigator) {
  // 새 서비스 워커가 켜지며 「새 판」을 알리면 = 「쓰던 글이 있음/없음」 답 + 글칸이 빌 때 다시 읽기
  //   글 있음 = 서비스 워커가 억지로 다시 열지 않음(쓰던 글 지킴) · 글 없음 = 여기서 바로 다시 읽음(sw.js 머리)
  navigator.serviceWorker.addEventListener("message", (e) => {
    if ((e.data as { type?: string } | null)?.type !== "nm-build") return;
    (e.source as ServiceWorker | null)?.postMessage({ type: "nm-self", build: BUILD, draft: busyTyping() });
    if ((e.data as { build?: string }).build !== BUILD) reloadWhenFree();
  });
  window.addEventListener("load", async () => {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (had) reloadWhenFree(); });   // 새 서비스 워커 = 새 판이 올라옴
    try {
      const reg = await navigator.serviceWorker.register("/office-app/sw.js", { scope: "/office-app/" });
      document.addEventListener("visibilitychange", () => { if (!document.hidden) void reg.update().catch(() => {}); });
      setInterval(() => void reg.update().catch(() => {}), 5 * 60e3);
    } catch { /* 설치 앱만 빠짐 · 화면은 그대로 */ }
  });
}
