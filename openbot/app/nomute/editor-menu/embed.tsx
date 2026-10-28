// 「에디터」 판 칸 누름 = 앱 안에서 그 에디터 화면(형 10-28 15:32 「모두 누르면 앱 내에서 작동되게 … 가져오는거야 거기있는거를」) — 웹으로 안 나감
//   안 = 에디터 원본 화면 그대로(같은 주소 linkOf = `/?tab=` · `/?tool=` 딥링크 · 새로 짜기 0) · 겉 = YETA 톤(./tone.ts · 15:33 「여기 톤에 녹인다」)
//   자리 = 에디터 판 위 한 겹(판 유지 = 다른 판 갔다 와도 그대로 · 네비는 위) · 「<」 = 닫고 판 칸 목록 그대로
//   제작 도구 칸(＋) = 에디터가 도구 창(#tooldlg)을 열 때까지 기다렸다 보임 · 그 창을 닫으면(에디터 X·뒤로) 이 겹도 닫힘(홈 「뉴스 요약」 단추와 같은 길)
//   중첩 셸 차단(에디터 01 part) = 부모에 #tooldlg 가 있을 때만 걸림 = 이 앱엔 없음 → 안 걸림(에디터 쪽 고칠 것 0)
//   품은 화면 안 링크(새 창·남의 사이트)·window.open = 보조 01 공용 길 hookFrame(ui/inapp.ts · 장부 office-inapp.md 「바뀜」) — 그 파일이 있으면 저절로 걺(없으면 걸 것 0)
import "./embed.css";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DuetIcon } from "@/components/duet/icons";
import { type EdItem, linkOf } from "./read";
import { editorTone } from "./tone";

const BOOT_MS = 20_000, TONE_ID = "nm-office-tone";
const inapp = Object.values(import.meta.glob<{ hookFrame?: (f: HTMLIFrameElement) => void }>("../ui/inapp.ts", { eager: true }))[0];

/** 톤 입히기 — 에디터 겉 문서 + 그 안 같은 출처 도구 문서(도구 창이 나중에 싣는 화면까지 · 남의 출처는 손 안 댐) */
function paint(doc: Document | null | undefined, css: string) {
  if (!doc?.head || doc.location.href === "about:blank") return;
  let st = doc.getElementById(TONE_ID) as HTMLStyleElement | null;
  if (!st) { st = doc.createElement("style"); st.id = TONE_ID; doc.head.appendChild(st); }
  if (st.textContent !== css) st.textContent = css;
  for (const f of doc.querySelectorAll("iframe")) { try { paint(f.contentDocument, css); } catch { /* 남의 출처 */ } }
}

export function EditorEmbed({ item, host, onClose }: { item: EdItem; host: Element | null; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const [ready, setReady] = useState(false), [err, setErr] = useState("");
  useEffect(() => {
    let live = true, shown = false, mo: MutationObserver | null = null, timer = 0;
    const t0 = Date.now();
    const tick = () => {
      if (!live) return;
      const doc = frame.current?.contentDocument;
      paint(doc, editorTone(document.documentElement.classList.contains("dark")));
      const dlg = doc?.getElementById("tooldlg") as HTMLDialogElement | null;
      if (!shown && doc?.body?.classList.contains("booted") && (item.kind === "tab" || dlg?.open)) {
        shown = true; setReady(true);
        if (item.kind === "act" && dlg) { mo = new MutationObserver(() => { if (!dlg.open) close.current(); }); mo.observe(dlg, { attributes: true, attributeFilter: ["open"] }); }
      } else if (!shown && Date.now() - t0 > BOOT_MS) { shown = true; setReady(true); setErr(`${item.label} 화면이 안 열렸어 — 「<」 누르고 다시 눌러 줘`); }
      timer = window.setTimeout(tick, shown ? 1000 : 120);   // 연 뒤 = 1초마다 다시 입힘(도구가 나중에 싣는 문서 · 에디터가 스스로 다시 불러옴)
    };
    tick();
    if (frame.current) inapp?.hookFrame?.(frame.current);
    return () => { live = false; clearTimeout(timer); mo?.disconnect(); };
  }, [item]);
  const node = (
    <div className="nm-ed-over" role="dialog" aria-label={item.label}>
      <div className="nm-modal-h">
        <button type="button" className="nm-modal-back" aria-label="닫기" onClick={() => close.current()}><DuetIcon name="chevronLeft" size={20} /></button>
        <b>{item.label}</b>
      </div>
      <div className="nm-ed-b">
        {!ready || err ? <p className="nm-ed-msg" role={err ? "alert" : undefined}>{err || `${item.label} 여는 중…`}</p> : null}
        <iframe ref={frame} title={item.label} src={linkOf(item)} className={`nm-ed-frame${ready && !err ? "" : " wait"}`} />
      </div>
    </div>
  );
  return host ? createPortal(node, host) : node;
}
