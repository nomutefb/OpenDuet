// 오류 받기(번개 11-08 · 형 11-08 01:31 「사무실(봄의 정원) 웹앱 대시보드를 고급화 하여 엔터프라이즈급 앱으로 만든다.(PC용)」)
//   왜: 앱 전체에 예상 못 한 오류를 받는 곳이 0 → 화면이 조용히 멈춰도 아무도 몰랐다(라이브 20498ec 실물 · 01:35).
//   ① window error · unhandledrejection 을 받는다(main.tsx 에서 shim 바로 뒤에 실림 = 앱보다 먼저)
//   ② 같은 오류는 처음 · 10번째 · 100번째만 서버로(n = 그때까지 횟수) · 1분 5건까지 → POST /api/office/clienterr(editor 98b829a · R2 office/clienterr/<날>/)
//   ③ 화면 아래 작은 띠 「문제가 생겼어요」 + [다시 시도](새로고침) · 같은 오류는 이 탭에서 한 번만 · 12초 뒤 저절로 접힘
//   보내는 값 = 오류 글 앞 300자 · 스택 앞 8줄 · 화면 주소(path 만) · 앱 판 — 글 내용 · 이름 · 키는 안 보냄(서버도 한 번 더 거름)
//   소음은 안 받음: ResizeObserver loop · 「Script error.」(다른 출처) · 브라우저 확장 · 사용자가 끊은 요청(AbortError)
import "./err-catch.css";

declare const __NM_SHA__: string;
const VER = (() => { try { return String(__NM_SHA__).slice(0, 12); } catch { return ""; } })();
const URL_ = "/api/office/clienterr";
const NOISE = /ResizeObserver loop|^Script error\.?$|chrome-extension:\/\/|moz-extension:\/\/|AbortError|The user aborted a request/;

const seen = new Map<string, number>();
let minute = 0, inMinute = 0;

function text(err: unknown): { msg: string; stack: string } {
  if (err instanceof Error) return { msg: err.message || err.name, stack: String(err.stack || "") };
  if (err && typeof err === "object") {
    const o = err as { message?: unknown; stack?: unknown; name?: unknown };
    return { msg: String(o.message ?? o.name ?? JSON.stringify(o).slice(0, 200)), stack: String(o.stack || "") };
  }
  return { msg: String(err ?? ""), stack: "" };
}

function send(body: string) {
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(URL_, new Blob([body], { type: "application/json" }))) return;
  } catch { /* 아래 fetch 로 */ }
  fetch(URL_, { method: "POST", body, headers: { "content-type": "application/json" }, credentials: "same-origin", keepalive: true }).catch(() => {});
}

/** 오류 한 건 받기 — 오류 경계(componentDidCatch)에서도 window.__nmReportError(kind, e) 로 부를 수 있음 */
export function reportError(kind: string, err: unknown) {
  try {
    const t = text(err);
    const msg = t.msg.trim().slice(0, 300);
    if (!msg || NOISE.test(msg) || NOISE.test(t.stack)) return;
    const stack = t.stack.split("\n").slice(0, 8).join("\n");
    const key = (msg + "|" + stack.split("\n").slice(0, 2).join("|")).slice(0, 240);
    const n = (seen.get(key) || 0) + 1;
    seen.set(key, n);
    if (n === 1) showBar();
    if (n !== 1 && n !== 10 && n !== 100) return;
    const m = Math.floor(Date.now() / 60000);
    if (m !== minute) { minute = m; inMinute = 0; }
    if (++inMinute > 5) return;
    send(JSON.stringify({ kind, msg, stack, path: location.pathname, ver: VER, n }));
  } catch { /* 오류 받기가 오류를 내지 않게 */ }
}

let bar: HTMLElement | null = null;
let hideT = 0;
function showBar() {
  if (!document.body) return;
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "nm-errbar";
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    const t = document.createElement("span");
    t.textContent = "문제가 생겼어요";
    const again = document.createElement("button");
    again.type = "button"; again.className = "nm-errbar-go"; again.textContent = "다시 시도";
    again.onclick = () => location.reload();
    const x = document.createElement("button");
    x.type = "button"; x.className = "nm-errbar-x"; x.setAttribute("aria-label", "닫기"); x.textContent = "×";
    x.onclick = () => hide();
    bar.append(t, again, x);
    document.body.appendChild(bar);
  }
  bar.hidden = false;
  clearTimeout(hideT);
  hideT = window.setTimeout(hide, 12_000);
}
function hide() { if (bar) bar.hidden = true; }

window.addEventListener("error", (ev) => {
  const e = ev as ErrorEvent;
  if (e.target && e.target !== window) return;   // 그림·스크립트 못 받은 것(자원 오류)은 화면이 따로 다룸
  reportError("error", e.error ?? e.message);
});
window.addEventListener("unhandledrejection", (ev) => reportError("rejection", (ev as PromiseRejectionEvent).reason));
(window as unknown as { __nmReportError?: typeof reportError }).__nmReportError = reportError;
