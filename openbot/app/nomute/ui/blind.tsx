// 화면 가림 — 입력이 15분 없으면 화면을 어둡게 덮는다(형 11-06 17:31 임시방 「15분 미입력시 화면 가림 설정 기능과 설정 온오프 및 즉시 기능 블라인드는 한 85퍼」)
//   · 켜고 끄기 = 설정 「화면·입력」 줄(이 기기에만 · 엔터 키 줄과 같은 꼴 ./enter-key.tsx) · 안 고른 기기 = PC 켬 · 폰 끔(폰은 제 잠금이 있음)
//   · 바로 가리기 = 설정 줄 하나(켬·끔과 무관하게 그 자리에서 덮음)
//   · 가림 = 검정 85%(ALPHA) 한 장 · 누르거나 아무 키 = 걷힘(잠금이 아니라 가림막 · 그 첫 누름·첫 키는 밑 화면에 안 닿음)
//   · 「입력」 = 키 · 누름 · 마우스 움직임 · 휠 · 터치 · 탭이 가려져 있던 시간도 입력 없음으로 셈(돌아왔을 때 15분 넘었으면 보이기 전에 덮음)
//   · React 나무 밖에 붙인다(새 판 알약 main.tsx 와 같은 까닭 = 어느 화면·어느 창 위에서도 맨 위)
import "./blind.css";
import { useSyncExternalStore } from "react";
import { YICO } from "./yeta-icons";

import { BLIND_ALPHA, BLIND_IDLE_MS, blindDue } from "./blind-rule";

const KEY = "nm_blind";

const pc = () => { try { return matchMedia("(hover: hover) and (pointer: fine)").matches; } catch { return false; } };
const seen = new Set<() => void>();
const get = () => { const p = pc(); try { const v = localStorage.getItem(KEY); return v === null ? p : v === "1"; } catch { return p; } };
const set = (on: boolean) => { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* 이번만 */ } last = Date.now(); seen.forEach((f) => f()); };
const watch = (f: () => void) => { seen.add(f); return () => { seen.delete(f); }; };

export const useBlindOn = () => useSyncExternalStore(watch, get);

let last = Date.now();   // 마지막 입력 때
let veil: HTMLElement | null = null;

function lift() {
  if (!veil) return;
  veil.remove();
  veil = null;
  last = Date.now();
}

/** 그 자리에서 덮는다(설정 「바로 가리기」) */
export function blindNow() {
  if (veil || typeof document === "undefined") return;
  const v = document.createElement("div");
  v.className = "nm-blind";
  v.style.setProperty("--nm-blind-a", String(BLIND_ALPHA));
  v.setAttribute("role", "button");
  v.setAttribute("tabindex", "0");
  v.setAttribute("aria-label", "화면 가림 · 누르면 열림");
  const t = document.createElement("span");
  t.className = "nm-blind-t";
  t.textContent = "화면 가림 · 누르면 열림";
  v.appendChild(t);
  v.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); lift(); });
  document.body.appendChild(v);
  veil = v;
  (document.activeElement as HTMLElement | null)?.blur?.();   // 글칸 깜빡이·조합 중 글자가 가림 위로 안 비치게
  v.focus({ preventScroll: true });
}

const tick = () => { if (blindDue(get(), !!veil, last, Date.now())) blindNow(); };

/** 한 번만 건다(main.tsx) — 입력 듣기 · 10초마다 셈 · 탭이 다시 보일 때 바로 셈 */
export function startBlind() {
  if (typeof window === "undefined") return;
  const touch = () => { if (!veil) last = Date.now(); };
  for (const ev of ["pointerdown", "pointermove", "wheel", "touchstart"] as const) window.addEventListener(ev, touch, { capture: true, passive: true });
  window.addEventListener("keydown", (e) => {
    if (!veil) { last = Date.now(); return; }
    e.preventDefault();   // 덮인 동안 첫 키 = 걷기만(글칸·단축키에 안 닿음)
    e.stopPropagation();
    lift();
  }, true);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  window.addEventListener("focus", tick);
  setInterval(tick, 10_000);
}

/** 설정 판 두 줄(YETA act 꼴 · 누름 = 바로 바뀜·저장) — 「화면 가림」 켬·끔 · 「바로 가리기」 */
export function BlindRows() {
  const on = useBlindOn();
  return (
    <>
      <button type="button" className="yset-item" onClick={() => set(!on)}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.screen }} />
        <span className="si-lbl"><span className="si-t">화면 가림</span></span>
        <span className="si-v"><span className={`si-vt${on ? " mod" : ""}`}>{on ? `${BLIND_IDLE_MS / 60_000}분 뒤` : "끔"}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
      <button type="button" className="yset-item" onClick={() => blindNow()}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.contrast }} />
        <span className="si-lbl"><span className="si-t">바로 가리기</span></span>
        <span className="si-v"><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
    </>
  );
}
