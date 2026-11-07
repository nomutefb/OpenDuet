// 「저장하시겠습니까?」 — 고친 것이 있는데 창을 닫으려 할 때(바탕 · 닫기 · Esc) — 뜸 11-07
//   형 11-07 10:56(봄 옮김) 「저장 하시겠스빈까? 가 떠야 보통 ux」 · 형 10:59(봄 옮김 11:00) 「응응 저장하시겠습니까? 예 아니오 이렇게 너무 블록 넓지않게, 엔터프라이즈니까」
//   = 작게 한 줄 [아니오] [예] · 예 = 저장하고 닫기 · 아니오 = 닫음(쓰던 글은 이 기기에 남김 · 다시 열면 되살림 · ./draft.ts) · 바깥·Esc = 물음만 닫고 계속 쓰기
import { useCallback, useEffect, useRef, useState } from "react";
import { backdrop } from "./backdrop";
import { modalPush, modalTop, useOpenBack } from "./use-modal";   // 창 쌓임 한 줄(빠르 11-08) = 이 창 위에 뜬 창(색 고르기 등)이 있으면 Esc 는 그 창 몫

/** dirty 면 닫기 대신 물음 · 아니면 바로 닫음 · Esc 도 같은 길 · on = 창이 떠 있을 때만 Esc 를 받음(늘 붙어 있는 창이 다른 창 Esc 를 먹지 않게) */
export function useCloseGuard(dirty: boolean, close: () => void, on = true) {
  const [ask, setAsk] = useState(false);
  const me = useRef<symbol | null>(null);
  const opener = useOpenBack(on);   // 연 자리 = 그리는 때 적음(autoFocus 입력칸보다 먼저 · 모루 #2870)
  useEffect(() => {   // 창 쌓임 한 칸 + 닫히면 연 자리로 포커스 돌려줌(시아 03:43 「프로필 카드를 Esc 로 닫으면 포커스가 얼굴 단추로 안 돌아오고 BODY 로 감」 · 빠르 11-08)
    if (!on) return;
    const back = opener.current;
    const p = modalPush(); me.current = p.me;
    return () => { p.pop(); me.current = null; if (back && back.isConnected) back.focus({ preventScroll: true }); };
  }, [on]);
  const askBack = useRef<HTMLElement | null>(null);
  const request = useCallback(() => {
    if (!dirty) { close(); return; }
    const a = document.activeElement;   // 묻는 순간(확인창 「예」 autoFocus 전)에 적음(모루 #2873 「effect 에서 저장해서 「예」 autoFocus 뒤의 버튼을 잡아」)
    askBack.current = a instanceof HTMLElement && a !== document.body ? a : null;
    setAsk(true);
  }, [dirty, close]);
  useEffect(() => { if (!on) setAsk(false); }, [on]);
  useEffect(() => {   // 「저장하시겠습니까?」만 취소(바깥 · Esc · 계속 쓰기) = 묻기 전 칸으로 포커스(모루 #2870 「확인창만 취소할 때는 cleanup 이 안 돌고」)
    if (ask) return;
    const b = askBack.current; askBack.current = null;
    if (b && b.isConnected && on) b.focus({ preventScroll: true });
  }, [ask, on]);
  useEffect(() => {
    if (!on) return;
    const k = (e: KeyboardEvent) => { if (me.current && !modalTop(me.current)) return; if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (ask) setAsk(false); else request(); } };
    window.addEventListener("keydown", k, true);
    return () => window.removeEventListener("keydown", k, true);
  }, [ask, request, on]);
  return { ask, setAsk, request };
}

export function SaveAsk({ onSave, onDiscard, onKeep, saving }: { onSave: () => void; onDiscard: () => void; onKeep: () => void; saving?: boolean }) {
  return (
    <div role="alertdialog" aria-modal="true" aria-label="저장하시겠습니까?" className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4" {...backdrop(onKeep)}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-popover py-2 pl-4 pr-2 text-sm shadow-lg">
        <span>저장하시겠습니까?</span>
        <button type="button" className="rounded-lg px-3 py-1.5 hover:bg-foreground/5" onClick={onDiscard}>아니오</button>
        <button type="button" autoFocus disabled={saving} className="rounded-lg bg-foreground px-3 py-1.5 font-semibold text-background disabled:opacity-40" onClick={onSave}>{saving ? "저장 중…" : "예"}</button>
      </div>
    </div>
  );
}
