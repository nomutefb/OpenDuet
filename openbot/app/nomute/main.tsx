// 진입점 — 원본 main.tsx 보다 먼저 우리 서버 잇기(shim)를 깐다 · 동기화(pulse) · 홈 화면 앱(PWA) 서비스 워커 · 새 판 = 위에 「새로고침」 단추
import "./shim/install";
import "@/main";
import { startSync } from "./data/sync";
import "./ui/update-bar.css";

startSync();

/* 새 판 = 위에 단추(형 11-02 07:20 「글고 업데이트 강제로 될때내 메시지 하나씩 휘발되서 다시 써야되는 이슈가 있어. 강제로 화면 쌔로고침 하지말고. 내 ㅁㅔ세지는 정확히 가고. (확인) 새로고침은  내가특정 그 새로운 버전이 잇다는 화면에 버튼 누르면 갱신하게」)
   · 옛 판(형 10-28 09:44 「새판 나오면 … 자동으로 강제새로고침」)은 글칸이 비면 저절로 다시 읽었다 — 보내기 누른 직후 글칸이 비는 순간에 걸리면 서버에 닿기 전 글이 같이 날아감 → 뺌
   · 이 판 번호 = 빌드 때 박은 __NM_BUILD__ · 지금 올라간 판 = /office-app/version.json(캐시 0) · 묻는 때 = 1분마다(보일 때) · 앞으로 올 때 · 서비스 워커가 새 판을 알릴 때
   · 다르면 위에 「새 버전이 있어요 · 새로고침」 → 누르면 보내는 중인 글(쓰기 요청)이 다 끝난 뒤 다시 읽음 · 글칸에 글이 있으면 한 번 더 눌러야(쓰던 글은 이 탭에 저장돼 다시 열어도 남음) */
declare const __NM_BUILD__: string;
const BUILD = __NM_BUILD__;

/** 쓰던 글이 있나 = 글칸에 글자가 있음 */
function busyTyping() {
  if ([...document.querySelectorAll<HTMLElement>('[contenteditable="true"]')].some((e) => (e.textContent || "").trim() !== "")) return true;
  const a = document.activeElement;
  return (a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement) && a.value.trim() !== "";
}

/** 보내는 중인 쓰기 요청 수(fetch 의 GET 아닌 것 · XHR 올리기) — 새로고침은 0 이 된 뒤 */
let writes = 0;
const shimFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const m = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (m === "GET" || m === "HEAD") return shimFetch(input, init);
  writes++;
  return shimFetch(input, init).finally(() => { writes--; });
};
const xhrSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
  writes++;
  this.addEventListener("loadend", () => { writes--; }, { once: true });
  return xhrSend.call(this, body);
};

let bar: HTMLElement | null = null;
function showUpdate() {
  if (bar) return;
  bar = document.createElement("div");
  bar.className = "nm-yeta nm-upd";
  bar.setAttribute("role", "status");
  bar.innerHTML = '<span>새 버전이 있어요</span><button type="button">새로고침</button>';
  const btn = bar.querySelector("button") as HTMLButtonElement;
  let armed = 0;
  btn.addEventListener("click", () => {
    if (busyTyping() && Date.now() - armed > 4000) { armed = Date.now(); btn.textContent = "쓰던 글 있음 · 한 번 더"; setTimeout(() => { if (btn.textContent !== "보내는 중…") btn.textContent = "새로고침"; }, 4000); return; }
    btn.disabled = true;
    btn.textContent = "보내는 중…";
    const t0 = Date.now();
    const go = () => { if (writes > 0 && Date.now() - t0 < 60_000) { setTimeout(go, 300); return; } location.reload(); };
    go();
  });
  document.body.appendChild(bar);
}

async function checkBuild() {
  if (document.hidden || bar) return;
  try {
    const r = await fetch(`/office-app/version.json?t=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
    if (!r.ok) return;
    const j = (await r.json()) as { build?: string };
    if (j.build && j.build !== BUILD) showUpdate();
  } catch { /* 끊김 = 다음 차례 */ }
}

(window as unknown as { __nmBuild: string }).__nmBuild = BUILD;   // 지금 이 화면 판(확인용)
setInterval(() => void checkBuild(), 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) void checkBuild(); });
window.addEventListener("focus", () => void checkBuild());

if ("serviceWorker" in navigator) {
  // 새 서비스 워커가 켜지며 「새 판」을 알리면 = 단추만(다시 읽기는 형이 누를 때)
  navigator.serviceWorker.addEventListener("message", (e) => {
    if ((e.data as { type?: string } | null)?.type !== "nm-build") return;
    if ((e.data as { build?: string }).build !== BUILD) showUpdate();
  });
  window.addEventListener("load", async () => {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (had) void checkBuild(); });   // 새 서비스 워커 = 새 판이 올라왔을 수 있음 → 판 번호로 확인
    try {
      const reg = await navigator.serviceWorker.register("/office-app/sw.js", { scope: "/office-app/" });
      document.addEventListener("visibilitychange", () => { if (!document.hidden) void reg.update().catch(() => {}); });
      setInterval(() => void reg.update().catch(() => {}), 5 * 60e3);
    } catch { /* 설치 앱만 빠짐 · 화면은 그대로 */ }
  });
}
