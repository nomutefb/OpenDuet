// 끊김 띠(번개 11-08 · 형 11-08 01:31 「엔터프라이즈급 앱으로」) — 서버와 연결이 끊긴 동안 화면이 조용히 멈춰 보이지 않게
//   data/sync.ts 가 부름: 동기화(pulse)가 두 번 잇따라 실패(13초쯤) → 「서버와 연결이 끊겼어요 · 다시 잇는 중…」 · 다시 붙으면 「다시 연결됐어요」 2초 뒤 걷음
//   꼴 = 오류 띠(err-catch.css)와 같은 유리 알약 · 글자 = 은은한 노랑(오류 빨강과 구분) · 화면 아래 가운데
import "./err-catch.css";

let bar: HTMLElement | null = null;
let hideT = 0;
let down = false;

function el(): HTMLElement | null {
  if (!document.body) return null;
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "nm-errbar nm-netbar";
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    bar.hidden = true;
    document.body.appendChild(bar);
  }
  return bar;
}

function say(b: HTMLElement, t: string, dots: boolean) {
  b.textContent = t;
  if (!dots) return;
  const d = document.createElement("span"); d.className = "nm-dots"; d.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i++) { const x = document.createElement("i"); x.textContent = "."; d.appendChild(x); }
  b.appendChild(d);
}

/** true = 끊김 띠를 띄움 · false = 끊겼다 다시 붙었으면 「다시 연결됐어요」를 잠깐 보이고 걷음 */
export function setNetDown(isDown: boolean) {
  const b = el();
  if (!b) return;
  clearTimeout(hideT);
  if (isDown) {
    if (down) return;
    down = true;
    b.classList.remove("ok");
    say(b, "서버와 연결이 끊겼어요 · 다시 잇는 중", true);
    b.hidden = false;
    return;
  }
  if (!down) return;
  down = false;
  b.classList.add("ok");
  say(b, "다시 연결됐어요", false);
  b.hidden = false;
  hideT = window.setTimeout(() => { b.hidden = true; }, 2000);
}
