// 그 자리 재확인(모달 0) — 단추를 누르면 그 단추가 [아니오(라임)] [예] 알약 둘로 번지며 바뀜
//   형 11-16 03:0x 「모달로 안뜨게하구 그리구 창이 멎게 안하고 바로 부드럽게 닫히고 백단에서 처리하게」
//   (앞 = 영상 「Mark as Done → Done | Undo」 · 02:2x 「재확인 버튼 … 다 통일할게 인엡안에.모두」 · 꼴 = ./go-button.css .nm-yn)
//   예 = onYes 를 바로 부름 — 기다리지 않음. 창 닫기 · 목록에서 먼저 빼기 · 서버 일은 부른 쪽이 뒤에서 하고, 못 했으면 화면 아래 알림 한 줄(./flash)
//   아니오 · Esc · 딴 데 누름 · 6초 동안 손 없음 = 원래 단추로(잘못 눌러도 안전한 쪽) · 엔터 자리 = 아니오
import { type ReactNode, useEffect, useRef, useState } from "react";
import { sfx } from "./feel";

const HOLD_MS = 6000;

export function MorphAsk({ children, className = "", boxClass = "", yesText = "예", noText = "아니오", note, onYes, startAsk, disabled, title, label, role }: {
  children: ReactNode; className?: string; boxClass?: string; yesText?: string; noText?: string; note?: ReactNode; onYes: () => void;
  startAsk?: boolean;   // 밖에서 바로 묻는 꼴로 열 때(줄을 밀어 휴지통을 누른 때)
  disabled?: boolean; title?: string; label?: string; role?: string;
}) {
  const [ask, setAsk] = useState(!!startAsk), [back, setBack] = useState(false);
  const box = useRef<HTMLSpanElement | null>(null);
  useEffect(() => { if (startAsk) setAsk(true); }, [startAsk]);
  useEffect(() => {
    if (!ask) return undefined;
    const no = () => { setAsk(false); setBack(true); };
    const t = window.setTimeout(no, HOLD_MS);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); no(); } };
    const out = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) no(); };
    window.addEventListener("keydown", key, true); window.addEventListener("pointerdown", out, true);
    return () => { window.clearTimeout(t); window.removeEventListener("keydown", key, true); window.removeEventListener("pointerdown", out, true); };
  }, [ask]);
  if (!ask) return <button type="button" role={role} className={`nm-mask-b ${className}`} data-back={back ? "" : undefined} disabled={disabled} title={title} aria-label={label} onClick={(e) => { e.stopPropagation(); setAsk(true); }}>{children}</button>;
  return (
    <span ref={box} className={`nm-mask ${boxClass}`} role="group" aria-label={`${label || (typeof children === "string" ? children : "")} 확인`} onClick={(e) => e.stopPropagation()}>
      <span className="nm-yn sm">
        <button type="button" className="no" autoFocus onClick={() => { setAsk(false); setBack(true); }}>{noText}</button>
        <button type="button" className="yes" onClick={() => { setAsk(false); sfx("latch"); onYes(); }}>{yesText}</button>
      </span>
      {note ? <small className="nm-mask-note">{note}</small> : null}
    </span>
  );
}
