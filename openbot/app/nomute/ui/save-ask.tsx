// 「저장할까?」 — 고친 글이 있는데 창을 닫으려 할 때(바탕 · 닫기 · Esc) · [저장] · [안 하고 닫기] · [계속 쓰기] — 뜸 11-07
//   형 11-07 10:56(봄 옮김) 「저장 하시겠스빈까? 가 떠야 보통 ux」 · 봄 10:57 나눔 ②
import { useCallback, useEffect, useState } from "react";

/** dirty 면 닫기 대신 물음 · 아니면 바로 닫음 · Esc 도 같은 길 */
export function useCloseGuard(dirty: boolean, close: () => void) {
  const [ask, setAsk] = useState(false);
  const request = useCallback(() => { if (dirty) setAsk(true); else close(); }, [dirty, close]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (ask) setAsk(false); else request(); } };
    window.addEventListener("keydown", k, true);
    return () => window.removeEventListener("keydown", k, true);
  }, [ask, request]);
  return { ask, setAsk, request };
}

export function SaveAsk({ onSave, onDiscard, onKeep, saving }: { onSave: () => void; onDiscard: () => void; onKeep: () => void; saving?: boolean }) {
  return (
    <div role="alertdialog" aria-modal="true" aria-label="저장할까?" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}>
      <div className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border bg-popover p-4 text-sm shadow-lg">
        <b className="text-base">저장할까?</b>
        <p className="text-xs text-muted-foreground">고친 글이 아직 저장 안 됐어. 안 해도 쓰던 글은 이 기기에 남아.</p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="rounded-full px-3 py-2 hover:bg-foreground/5" onClick={onKeep}>계속 쓰기</button>
          <button type="button" className="rounded-full px-3 py-2 hover:bg-foreground/5" onClick={onDiscard}>안 하고 닫기</button>
          <button type="button" disabled={saving} className="rounded-full bg-foreground px-4 py-2 font-semibold text-background disabled:opacity-40" onClick={onSave}>{saving ? "저장 중…" : "저장"}</button>
        </div>
      </div>
    </div>
  );
}
