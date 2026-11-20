// 그 자리 재확인(모달 0) — 단추를 누르면 그 단추가 [아니오(라임)] [예] 알약 둘로 번지며 바뀜
//   형 11-16 03:0x 「모달로 안뜨게하구 그리구 창이 멎게 안하고 바로 부드럽게 닫히고 백단에서 처리하게」
//   (앞 = 영상 「Mark as Done → Done | Undo」 · 02:2x 「재확인 버튼 … 다 통일할게 인엡안에.모두」 · 꼴 = ./go-button.css .nm-yn)
//   예 = onYes 를 바로 부름 — 기다리지 않음. 창 닫기 · 목록에서 먼저 빼기 · 서버 일은 부른 쪽이 뒤에서 하고, 못 했으면 화면 아래 알림 한 줄(./flash)
//   yesGo = 예가 서버 답을 기다려야 쓸 수 있는 일일 때(재발행 · 형 11-20 11:22 「다시 재발행을 누르면 체크라도 떠야할듯애니메이션으로 (로딩이 걸리는거면 사용이 가능할때까지 뉴스 요약때 처럼 발행 과정이 보여야해」)
//     = 예 자리가 게이지 알약(./go-button · 옛 에디터 goFire) → 답 ok 에 ✓ → 원래 단추로 · 도는 동안은 6초 · 바깥 누름 · Esc 로 안 접힘 · 실패 = 빨강 흔들림 뒤 다시 누를 수 있음
//   아니오 · Esc · 딴 데 누름 · 6초 동안 손 없음 = 원래 단추로(잘못 눌러도 안전한 쪽) · 엔터 자리 = 아니오
import { type ReactNode, useEffect, useRef, useState } from "react";
import { sfx } from "./feel";
import { GoButton } from "./go-button";

const HOLD_MS = 6000;

export function MorphAsk({ children, className = "", boxClass = "", yesText = "예", noText = "아니오", note, onYes, yesGo, busy, startAsk, disabled, title, label, role }: {
  children: ReactNode; className?: string; boxClass?: string; yesText?: string; noText?: string; note?: ReactNode; onYes?: () => void;
  yesGo?: () => Promise<unknown>; busy?: string;   // 예 = 게이지(위 yesGo) · busy = 게이지 도는 동안 읽어 주는 말
  startAsk?: boolean;   // 밖에서 바로 묻는 꼴로 열 때(줄을 밀어 휴지통을 누른 때)
  disabled?: boolean; title?: string; label?: string; role?: string;
}) {
  const [ask, setAsk] = useState(!!startAsk), [back, setBack] = useState(false), [going, setGoing] = useState(false);
  const box = useRef<HTMLSpanElement | null>(null);
  useEffect(() => { if (startAsk) setAsk(true); }, [startAsk]);
  useEffect(() => {
    if (!ask || going) return undefined;
    const no = () => { setAsk(false); setBack(true); };
    const t = window.setTimeout(no, HOLD_MS);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); no(); } };
    const out = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) no(); };
    window.addEventListener("keydown", key, true); window.addEventListener("pointerdown", out, true);
    return () => { window.clearTimeout(t); window.removeEventListener("keydown", key, true); window.removeEventListener("pointerdown", out, true); };
  }, [ask, going]);
  if (!ask) return <button type="button" role={role} className={`nm-mask-b ${className}`} data-back={back ? "" : undefined} disabled={disabled} title={title} aria-label={label} onClick={(e) => { e.stopPropagation(); setAsk(true); }}>{children}</button>;
  const go = async () => { setGoing(true); sfx("latch"); try { return await yesGo!(); } catch (e) { setGoing(false); throw e; } };
  return (
    <span ref={box} className={`nm-mask ${boxClass}`} role="group" aria-label={`${label || (typeof children === "string" ? children : "")} 확인`} onClick={(e) => e.stopPropagation()}>
      <span className="nm-yn sm">
        <button type="button" className="no" autoFocus disabled={going} onClick={() => { setAsk(false); setBack(true); }}>{noText}</button>
        {yesGo ? <GoButton className="yes" go={go} busy={busy || `${yesText} 중`} done={() => { setGoing(false); setAsk(false); setBack(true); }}>{yesText}</GoButton>
          : <button type="button" className="yes" onClick={() => { setAsk(false); sfx("latch"); onYes?.(); }}>{yesText}</button>}
      </span>
      {note ? <small className="nm-mask-note">{note}</small> : null}
    </span>
  );
}
