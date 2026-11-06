// 쉴 때 화면 가림(형 11-06 17:31 「15분 미입력시 화면 가림 설정 기능과 설정 온오프 및 즉시 기능 블라인드는 한 85퍼」 · 대시보드 고급화 방 UI 첫 판 ⑥)
//   = PC(마우스 · 넓은 화면)에서 15분 동안 손이 안 닿으면 85% 어둡게 덮고 큰 시계 · 아무 키·누름이면 걷힘
//   켜고 끄기 = 설정 「쉴 때 화면 가림」(이 기기 localStorage nm-blind · 처음 = 켬) · 바로 가림 = 설정 「지금 가리기」 · Alt+L
//   가림은 화면만 덮음(대화·동기화는 뒤에서 그대로 돎) · 쓰던 글은 그대로
import { useEffect, useState, useSyncExternalStore } from "react";
import { YICO } from "./yeta-icons";
import "./idle-blind.css";

const KEY = "nm-blind", IDLE_MS = 15 * 60_000;
const subs = new Set<() => void>();
const readOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
const setOn = (on: boolean) => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* 이번만 */ } subs.forEach((f) => f()); };
const useOn = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, readOn, () => true);
export const blindNow = () => window.dispatchEvent(new Event("nm-blind-now"));

const pc = () => !!window.matchMedia?.("(pointer: fine)").matches && window.innerWidth >= 900;
const hhmm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

/** 껍데기에 한 번 — 15분 쉼 · 바로 가림 · 걷힘 */
export function IdleBlind() {
  const on = useOn();
  const [shut, setShut] = useState(false), [clock, setClock] = useState(hhmm);
  useEffect(() => {
    let last = Date.now();
    const poke = () => { last = Date.now(); };
    const evs = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, poke, { passive: true, capture: true }));
    const now = () => setShut(true);
    const key = (e: KeyboardEvent) => { if (e.altKey && (e.key === "l" || e.key === "L" || e.code === "KeyL")) { e.preventDefault(); setShut(true); } };
    window.addEventListener("nm-blind-now", now);
    window.addEventListener("keydown", key, true);
    const t = setInterval(() => { if (on && pc() && Date.now() - last >= IDLE_MS) setShut(true); }, 15_000);
    return () => { evs.forEach((e) => window.removeEventListener(e, poke, { capture: true })); window.removeEventListener("nm-blind-now", now); window.removeEventListener("keydown", key, true); clearInterval(t); };
  }, [on]);
  useEffect(() => {
    if (!shut) return undefined;
    setClock(hhmm());
    const t = setInterval(() => setClock(hhmm()), 10_000);
    // 걷기 = 키는 어디서나 · 누름은 가림 판 자체의 click 으로만(pointerdown 에서 걷으면 이어 오는 click 이 밑 단추에 닿음 · 뎅 18:4x 짚음)
    const open = (e: KeyboardEvent) => { if (e.altKey && e.code === "KeyL") return; e.preventDefault(); e.stopPropagation(); setShut(false); };
    const arm = setTimeout(() => window.addEventListener("keydown", open, true), 400);   // 가린 그 키로 바로 안 걷히게
    return () => { clearInterval(t); clearTimeout(arm); window.removeEventListener("keydown", open, true); };
  }, [shut]);
  if (!shut) return null;
  return (
    <div className="nm-blind" role="dialog" aria-modal="true" aria-label="화면 가림" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShut(false); }}>
      <div className="nm-blind-c"><big>{clock}</big><span>쉬는 중 · 아무 키나 누르면 열려</span></div>
    </div>
  );
}

/** 설정 줄 둘 — 켜고 끄기 · 지금 가리기 */
export function BlindRows() {
  const on = useOn();
  return (
    <>
      <button type="button" className="yset-item" onClick={() => setOn(!on)}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.screen }} />
        <span className="si-lbl"><span className="si-t">쉴 때 화면 가림</span></span>
        <span className="si-v"><span className={`si-vt${on ? " mod" : ""}`}>{on ? "15분" : "끔"}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
      <button type="button" className="yset-item" onClick={() => setTimeout(blindNow, 150)}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.contrast }} />
        <span className="si-lbl"><span className="si-t">지금 가리기</span></span>
        <span className="si-v"><span className="si-vt">Alt+L</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
    </>
  );
}

/** 위 가운데 시계(형 11-06 18:4x 「항상 중앙 상단부에 시간 나오게해주면되고」) = PC 반갈 윗줄 가운데 · 분 바뀔 때 · 누르면 바로 가림 */
export function TopClock() {
  const [t, setT] = useState(hhmm);
  useEffect(() => { const i = setInterval(() => setT(hhmm()), 5_000); return () => clearInterval(i); }, []);
  return <button type="button" className="nm-topclock" title="누르면 화면 가림(Alt+L)" onClick={() => setTimeout(blindNow, 150)}>{t}</button>;
}
