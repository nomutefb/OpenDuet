// 쉴 때 화면 가림(형 11-06 17:31 「15분 미입력시 화면 가림 설정 기능과 설정 온오프 및 즉시 기능 블라인드는 한 85퍼」 · 대시보드 고급화 방 UI 첫 판 ⑥)
//   = PC(마우스 · 넓은 화면)에서 10분 동안(11-13 형 「10분」) 손이 안 닿으면 85% 어둡게 덮고 큰 시계 · 아무 키·누름이면 걷힘
//   켜고 끄기 = 설정 「쉴 때 화면 가림」(이 기기 localStorage nm-blind · 처음 = 켬) · 바로 가림 = 설정 「지금 가리기」 · Alt+L
//   가림은 화면만 덮음(대화·동기화는 뒤에서 그대로 돎) · 쓰던 글은 그대로
import { useEffect, useState, useSyncExternalStore } from "react";
import { YICO } from "./yeta-icons";
import { idleLast0 } from "./idle-blind-logic";
import "./idle-blind.css";

const KEY = "nm-blind", IDLE_MS = 10 * 60_000;   // 10분(형 11-13 10:59 봄 옮김 「미 입력 10분이면 웹앱 보호기 있어야되는데 안되더라고」 · 앞 판 = 15분 · 11-06 「15분 미입력시」)
const subs = new Set<() => void>();
const readOn = () => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
const setOn = (on: boolean) => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* 이번만 */ } subs.forEach((f) => f()); };
const useOn = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, readOn, () => true);
export const blindNow = () => window.dispatchEvent(new Event("nm-blind-now"));

const pc = () => !!window.matchMedia?.("(pointer: fine)").matches && window.innerWidth >= 860;   // = PC 반갈 문턱(side.tsx SPLIT 860 · 앞 판 900 = 창 860~899 폭이면 붙어 있어도 안 가렸음)
const hhmm = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

/** 껍데기에 한 번 — 15분 쉼 · 바로 가림 · 걷힘 */
// 다시 읽어도 이어 셈(형 11-13 10:59 「미 입력 10분이면 … 안되더라고」 진짜 까닭 = PC 웹앱은 새 판이 오면 저절로 다시 읽음(main.tsx autoReload · 형 11-06 13:14) ·
//   오늘처럼 판이 10~20분마다 오르면 다시 읽을 때마다 「마지막 손」이 0 으로 돌아가 10분에 못 닿았음 · 라이브 진짜 시간 시험 = 5분쯤 다시 읽힘 → 10.5분 가림 0)
//   = 마지막 손 시각 · 가림 상태를 이 창(sessionStorage)에 두고 다시 읽은 뒤 그대로 이어 받음 · 저절로 다시 읽기는 손이 아님
const LAST = "nm-idle-last", SHUT = "nm-idle-shut";
const ss = { get: (k: string) => { try { return sessionStorage.getItem(k) || ""; } catch { return ""; } }, set: (k: string, v: string) => { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch { /* 이번만 */ } } };

export function IdleBlind() {
  const on = useOn();
  const [shut, setShut] = useState(() => ss.get(SHUT) === "1"), [clock, setClock] = useState(hhmm);
  useEffect(() => { ss.set(SHUT, shut ? "1" : ""); }, [shut]);
  useEffect(() => {
    let last = idleLast0(ss.get(LAST), Date.now()), wrote = 0;
    let px = NaN, py = NaN;
    const poke = (e: Event) => {
      if (e.type === "pointermove") { const m = e as PointerEvent; if (m.screenX === px && m.screenY === py) return; px = m.screenX; py = m.screenY; }   // 자리 그대로인 이동 = 손 아님(밑 화면이 바뀌면 브라우저가 커서 밑에 쏘는 이동 · 짐작 막이)
      if (!e.isTrusted) return;   // 코드가 쏜 키·누름(call-face Escape · swipe-reply pointercancel 등) = 손 아님
      last = Date.now();
      if (last - wrote > 5000) { wrote = last; ss.set(LAST, String(last)); }   // 5초에 한 번만 적음
    };
    if (!ss.get(LAST)) ss.set(LAST, String(last));
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
        <span className="si-v"><span className={`si-vt${on ? " mod" : ""}`}>{on ? "10분" : "끔"}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
      <button type="button" className="yset-item" onClick={() => setTimeout(blindNow, 150)}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.contrast }} />
        <span className="si-lbl"><span className="si-t">지금 가리기</span></span>
        <span className="si-v"><span className="si-vt">Alt+L</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
    </>
  );
}

/** 위 왼쪽 시계(형 11-06 20:05 「좌상단에 시계를 배치하고」 · 20:06 「시계는 12시간 단위로 11-6 화 6:51 PM 이렇게 할게」 · 「6:51 PM 에 라임색. 시간에」) = 날짜·요일은 흐린 흰 · 시각은 라임 · 누르면 바로 가림 */
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const stamp = () => { const d = new Date(), h = d.getHours(); return { day: `${d.getMonth() + 1}-${d.getDate()} ${DOW[d.getDay()]}`, time: `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` }; };
export function TopClock() {
  const [t, setT] = useState(stamp);
  useEffect(() => { const i = setInterval(() => setT(stamp()), 5_000); return () => clearInterval(i); }, []);
  return <button type="button" className="nm-topclock" title="누르면 화면 가림(Alt+L)" onClick={() => setTimeout(blindNow, 150)}><span>{t.day}</span><b>{t.time}</b></button>;
}

/** 위 가운데 = 지금 페이지 이름(형 11-06 20:05 「중상단에 현재 페이지가 나오게 하자 … 현재 대화창이면 대화방 이름이」) */
export function TopTitle({ text }: { text: string }) {
  return text ? <div className="nm-toptitle" aria-live="polite">{text}</div> : null;
}
