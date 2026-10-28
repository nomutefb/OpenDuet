// 홈 뉴스 칸 한켠 「뉴스 요약」 단추 → 홈 위 모달(형 10-28 12:23 「홈 화면 한켠에 뉴스 요약 누를 수 있는 거 만들어서 버튼 같은거면 될거같아. 그래서 누르면 모달로 창 뜨면 됨」) —
//   안 = 에디터 「뉴스 요약」(요약 요청) 도구를 에디터가 여는 길 그대로: 에디터 셸(같은 주소 /?ui=classic)을 품고, 에디터 새 판 독(modern-workspace.js)이 하는 대로
//   라디얼 단추 .raditem[data-act="ask"] 를 누름 → 에디터 #tooldlg 가 그 도구를 엶 · 그 창이 닫히면(에디터 X · 뒤로) 모달도 닫힘(홈 그대로).
//   중첩 셸 차단(에디터 01 part) = 부모에 #tooldlg 가 있을 때만 걸림 = 이 앱엔 없음 → 안 걸림 · 품은 에디터는 처음 연 뒤 그대로 둠(다시 열 때 빠름) ·
//   모달 = body 로 띄움(껍데기 판 옮김 움직임 transform 안에 갇히지 않게) · 토큰 범위 .yeta-set 같이.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SRC = "/?ui=classic";
const BOOT_MS = 20_000;

export function SummaryButton() {
  const [open, setOpen] = useState(false), [mounted, setMounted] = useState(false), [ready, setReady] = useState(false), [err, setErr] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!open || !mounted) return;
    let live = true, dlg: HTMLDialogElement | null = null;
    const onClose = () => { if (live) { setOpen(false); setReady(false); } };
    const t0 = Date.now();
    const tick = () => {
      if (!live) return;
      const doc = frame.current?.contentDocument;
      const btn = doc?.querySelector<HTMLElement>('.raditem[data-act="ask"]'), d = doc?.getElementById("tooldlg") as HTMLDialogElement | null;
      if (btn && d && doc?.body.classList.contains("booted")) {
        dlg = d;
        d.addEventListener("close", onClose);
        if (!d.open) btn.click();
        const wait = () => { if (!live) return; if (d.open) setReady(true); else if (Date.now() - t0 < BOOT_MS) setTimeout(wait, 150); else setErr("뉴스 요약 창이 안 열렸어 — 다시 눌러 줘"); };
        wait();
        return;
      }
      if (Date.now() - t0 < BOOT_MS) setTimeout(tick, 200); else setErr("에디터를 못 불러왔어 — 다시 눌러 줘");
    };
    tick();
    return () => { live = false; if (dlg) dlg.removeEventListener("close", onClose); };
  }, [open, mounted]);
  const show = () => { setErr(""); setReady(false); setMounted(true); setOpen(true); };
  const hide = () => { const d = frame.current?.contentDocument?.getElementById("tooldlg") as HTMLDialogElement | null; if (d && d.open) d.close(); setOpen(false); setReady(false); };
  return (
    <>
      <button type="button" onClick={show}
        className="absolute bottom-1 right-2 z-10 rounded-full border border-[var(--glass-line)] bg-[var(--bg)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--fg)] shadow-sm backdrop-blur active:scale-95">
        뉴스 요약
      </button>
      {mounted ? createPortal(
        <div role="dialog" aria-modal="true" aria-label="뉴스 요약" hidden={!open}
          className="yeta-set fixed inset-0 z-[60] grid place-items-center bg-black/50 md:p-6" onClick={(e) => { if (e.target === e.currentTarget) hide(); }}>
          <div className="relative h-svh w-full overflow-hidden bg-[var(--bg)] md:h-[90svh] md:max-w-3xl md:rounded-[22px]">
            {!ready ? <p className="absolute inset-0 grid place-items-center text-[13px] text-[var(--mut)]" role={err ? "alert" : undefined}>{err || "뉴스 요약 여는 중…"}</p> : null}
            <iframe ref={frame} src={SRC} title="뉴스 요약" className={`size-full border-0 ${ready ? "" : "opacity-0"}`} />
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
