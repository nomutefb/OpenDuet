// 「+」 펼침 한 벌 — 폰 뉴스 에디터 오른쪽 아래(./news-editor.tsx) · 홈 PC Digest 오른쪽 아래(../home/news-summary.tsx · 형 11-13 02:24 봄 1:1 「1) 에디터 요약 + 있잖아 모바일에 잇는거. 그거 인앱 메인 digest 우하단에 + 나오게 해줘」 · 「5) 인앱이라고 설명한거 = 웹앱(pc)」)
import "./plus-fan.css";
import { useEffect, useRef, useState } from "react";

/** 오른쪽 아래 「+」 펼침(형 11-11 19:23 봄 1:1 「요약버튼 혹시 그 대화방에 펼침 + 로 해줄 수 있어? 펼쳐서 이미지 에디터랑 뉴스 요약 비디오 에디터 3개 나오면 됨. 그리고 최소화 가능하게」)
 *  = 대화방 목록 「+」(./room-fab.tsx .nm-fab) 결 · 평소 = 작은 「+」 하나(최소화) · 누르면 위로 셋(뉴스 요약 = 요약 요청 · 이미지 에디터 = 카드 제작 /edtool · 비디오 에디터 = 영상 편집 /edvid) · 하나 누르면 그 화면 · 「+」 다시 또는 바깥 = 접힘 */
export function PlusFan({ go }: { go: (to: string) => void }) {
  const [open, setOpen] = useState(false), box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const items: [string, string][] = [["/ask", "뉴스 요약"], ["/edtool", "이미지 에디터"], ["/edvid", "비디오 에디터"]];
  return (
    <div ref={box} className={`nm-ned-plus${open ? " on" : ""}`}>
      {items.map(([to, t], i) => <button key={to} type="button" className={`nm-ned-plus-i up${i + 1}`} tabIndex={open ? 0 : -1} aria-hidden={!open} onClick={() => { setOpen(false); go(to); }}>{t}</button>)}
      <button type="button" className="nm-ned-plus-main" aria-expanded={open} aria-label={open ? "접기" : "펼치기 — 뉴스 요약 · 이미지 에디터 · 비디오 에디터"} onClick={() => setOpen((v) => !v)}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );
}
