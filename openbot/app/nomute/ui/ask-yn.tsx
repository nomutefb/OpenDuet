// 되묻는 창 하나(하네스) — 「정말 …하시겠습니까?」 [아니오] [예]
//   형 11-12 06:13 「삭제 하시겠습니까? 아니오 예 이렇게만 나오면됨. 아니오에 라임색 이면 됨.」
//   형 11-15 09:00(깃 옮김) 「누르면 정말 내보내시겠습니까? 아니오 예 아니오에 라임, 그리고 오래걸리는거면 예 누르고 백단에서 진행하게해.
//                            내가 창에 오래 머무르게 하지말고, 항상 오래걸리는거는 내가 창에 오래 머무르게 하면안돼.」
//   잣대 = ① 아니오 = 라임 · 엔터 자리(잘못 눌러도 안전한 쪽) · 예 = 보통  ② 예 = 게이지 단추 away — 답이 늦으면 창부터 닫고 뒤에서, 끝나면 알림 한 줄(./go-button.tsx)
//   꼴 = ./go-button.css .nm-yn · 단추만 쓰려면 <YesNo>, 창까지 통째로 쓰려면 <AskYN>
import type { ReactNode } from "react";
import { backdrop } from "./backdrop";
import { GoButton } from "./go-button";

/** [아니오(라임)] [예] 한 줄 — 이미 있는 창 안에 끼움 · close = 예가 늦을 때 먼저 닫을 길(없으면 창을 붙잡음) */
export function YesNo({ onNo, yes, close, done, what, no = "아니오", yesText = "예", busy = "하는 중", disabled }: { onNo: () => void; yes: () => Promise<unknown>; close?: () => void; done?: () => void; what?: string; no?: string; yesText?: string; busy?: string; disabled?: boolean }) {
  return (
    <div className="nm-yn">
      <button type="button" className="no" autoFocus onClick={onNo}>{no}</button>
      <GoButton className="yes" go={yes} done={done} away={close} what={what} busy={busy} disabled={disabled}>{yesText}</GoButton>
    </div>
  );
}

/** 작은 되묻는 창 통째 — q = 물음 한 줄 · note = 덧글(없어도 됨) */
export function AskYN({ q, note, onNo, yes, close, done, what, no, yesText, busy }: { q: ReactNode; note?: ReactNode; onNo: () => void; yes: () => Promise<unknown>; close?: () => void; done?: () => void; what?: string; no?: string; yesText?: string; busy?: string }) {
  return (
    <div role="alertdialog" aria-modal="true" className="nm-yn-veil" {...backdrop(onNo)}>
      <div className="nm-yn-box" onClick={(e) => e.stopPropagation()}>
        <p className="nm-yn-q">{q}</p>
        {note ? <p className="nm-yn-note">{note}</p> : null}
        <YesNo onNo={onNo} yes={yes} close={close} done={done} what={what} no={no} yesText={yesText} busy={busy} />
      </div>
    </div>
  );
}
