// 엔터 키 = 폰은 줄바꿈이 기본 · 설정에서 보내기로(형 10-31 「지금 엔터가 줄바꿈으로 되어야되는데 이거 그게 기본값이어야해 이걸 보내기로 바꿀지는 설정애서 고를수잇어야함 쉬프트 엔터 개념인데」)
//   둘은 자리만 바뀐다: 기본 = 엔터 줄바꿈 · Shift+Enter 보내기 / 켬 = 엔터 보내기 · Shift+Enter 줄바꿈 · 보내기 단추는 어느 쪽이든 그대로
//   PC 는 기본이 보내기(형 11-01 16:5x 윈터 창 · 윈터가 옮김 「pc에서는 우리사무실 이거 여기서 엔터치면 바로 전송되는걸 기본값으로해줄래? 쉬프트엔터가 줄바꿈.」 · 「모바일은 지금이 좋아.」)
//     = PC(마우스·호버) 값은 따로 칸(yeta_enter_send_pc · 옛 값은 안 씀 = 바뀐 기본이 바로 먹음) · 폰은 옛 칸·옛 기본(줄바꿈) 그대로 · 한글 조합 중 엔터 = 글자 확정만(prompt-area 가 isComposing·229 에서 멈춤)
//   값은 이 기기에만(글꼴 칸과 같음 · ./chat-font.tsx) · 입력칸 연결 = overrides.ts composer 줄 · 엔터 처리는 prompt-area 안(submitOnEnter · onKeyDown 이 먼저 불림)
import { type KeyboardEvent, useSyncExternalStore } from "react";
import { YICO } from "./yeta-icons";

const KEY = "yeta_enter_send", KEY_PC = "yeta_enter_send_pc";
const pc = () => { try { return matchMedia("(hover: hover) and (pointer: fine)").matches; } catch { return false; } };
const seen = new Set<() => void>();
const get = () => { const p = pc(); try { const v = localStorage.getItem(p ? KEY_PC : KEY); return v === null ? p : v === "1"; } catch { return p; } };   // 안 고른 기기 = PC 보내기 · 폰 줄바꿈
const set = (on: boolean) => { try { localStorage.setItem(pc() ? KEY_PC : KEY, on ? "1" : "0"); } catch { /* 이번만 */ } seen.forEach((f) => f()); };
const watch = (f: () => void) => { seen.add(f); return () => { seen.delete(f); }; };

export const useEnterSends = () => useSyncExternalStore(watch, get);

/** 기본 판의 Shift+Enter = 보내기(라이브러리는 줄바꿈으로 치니 먼저 가로챔 · 글자 조합 중엔 안 건드림) */
export function shiftSend(e: KeyboardEvent, enterSends: boolean, send: () => void) {
  if (enterSends || e.key !== "Enter" || !e.shiftKey || e.nativeEvent.isComposing) return;
  e.preventDefault();
  send();
}

/** 설정 판 행 하나(YETA act 꼴 · 누름 = 바로 바뀜·저장) */
export function EnterKeyRow() {
  const on = useEnterSends();
  return (
    <button type="button" className="yset-item" onClick={() => set(!on)}>
      <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.type }} />
      <span className="si-lbl"><span className="si-t">엔터 키</span></span>
      <span className="si-v"><span className={`si-vt${on ? " mod" : ""}`}>{on ? "보내기" : "줄바꿈"}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
    </button>
  );
}
